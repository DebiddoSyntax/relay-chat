import React, { useEffect, useState } from 'react'
import { MessageType } from './ChatBox';
import { useChat } from '@/src/functions/chats/chatStore';

export function useScroll(activeId: number | null, messages: MessageType[], containerRef: React.RefObject<HTMLDivElement | null>, nextUrl: string | null, fetchMoreMessages: ()=> void, loadingMore: boolean, aiTyping: boolean) {

    const chatOpen = useChat((state)=> state.chatOpen)
    // scroll button state 
    const [showScrollBtn, setShowScrollBtn] = useState(false);

    // scroll button function
    const scrollToBottom = () => {
        const container = containerRef.current;
        if (!container) return;

        container.scrollTo({ top: container.scrollHeight, behavior: "smooth", });
    };


    // handle scroll position effect
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (container.scrollTop === 0 && nextUrl) fetchMoreMessages();

            const threshold = 120;

            const isNotAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight > threshold;

            setShowScrollBtn(isNotAtBottom);
        };

        container.addEventListener("scroll", handleScroll);

        return () => container.removeEventListener("scroll", handleScroll);

    }, [nextUrl, activeId]);


    // handle scroll to bottom on open 
    useEffect(() => {
        if (!chatOpen || !activeId || loadingMore) return;

        const container = containerRef.current;
        if (!container) return;

        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
        });

    }, [chatOpen, activeId]);

    
    // handle message change and aityping scroll effect
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !chatOpen) return;

        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 120;

        if (isAtBottom) scrollToBottom();

    }, [messages, aiTyping]);
    

    return { scrollToBottom, showScrollBtn }
}

