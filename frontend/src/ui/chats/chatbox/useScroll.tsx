import { useEffect, useRef, useState } from "react";
import { useChat } from "@/src/functions/chats/chatStore";
import { MessageType } from "@/src/functions/types/ChatType";





export function useScroll( 
    activeId: number | null, 
    containerRef: React.RefObject<HTMLDivElement | null>, 
    nextUrl: string | null, 
    fetchMoreMessages: () => void, 
    loading: boolean, 
    aiTyping: boolean,
    sortedMessages: MessageType[]
) {

    const chatOpen = useChat((state) => state.chatOpen);
    // const messages = useChat((state)=> state.messages)
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const previousHeightRef = useRef<number>(0);

    // scroll click 
    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        const container = containerRef.current;
        if (!container) return;

        container.scrollTo({
            top: container.scrollHeight,
            behavior,
        });
    };


    // preserve scroll position to fetch more messages 
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (container.scrollTop === 0 && nextUrl && !loading) {
                previousHeightRef.current = container.scrollHeight;
                fetchMoreMessages();
            }

            const threshold = 120;
            const isNotAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight > threshold;

            setShowScrollBtn(isNotAtBottom);
        };

        container.addEventListener("scroll", handleScroll);

        return () => {
            container.removeEventListener("scroll", handleScroll);
        };
    }, [nextUrl, activeId, loading]);


    
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        if (previousHeightRef.current > 0) {
            const newHeight = container.scrollHeight;
            const heightDifference = newHeight - previousHeightRef.current;

            container.scrollTop = heightDifference;

            previousHeightRef.current = 0;
        }
    }, [sortedMessages]);


    useEffect(() => {
        if (!chatOpen || !activeId) return;
        if (loading) return;
        if (sortedMessages.length === 0) return;

        requestAnimationFrame(() => scrollToBottom("auto"));
    }, [chatOpen, activeId, loading, sortedMessages.length]);


    useEffect(() => {
        const container = containerRef.current;
        if (!container || !chatOpen) return;

        const threshold = 120;

        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;

        if (isAtBottom) scrollToBottom("smooth");
    }, [sortedMessages.length, aiTyping]);

    return { scrollToBottom,  showScrollBtn, };
}