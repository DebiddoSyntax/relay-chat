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
    const [showScrollBtn, setShowScrollBtn] = useState(false);
    const previousHeightRef = useRef<number>(0);
    const lastMessageIdRef = useRef<number | null>(null);
    const isFetchingMoreRef = useRef(false);

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
                isFetchingMoreRef.current = true;
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
            isFetchingMoreRef.current = false;
        }
    }, [sortedMessages]);


    useEffect(() => {
        if (!chatOpen || !activeId) return;
        if (loading) return;
        if (sortedMessages.length === 0) return;

        const lastMessage = sortedMessages[sortedMessages.length - 1];

        if (!lastMessage) return;

        if (lastMessageIdRef.current !== lastMessage.id) {
            lastMessageIdRef.current = lastMessage.id;
            requestAnimationFrame(() => scrollToBottom("auto"));
        }
    }, [sortedMessages, chatOpen, activeId, loading]);


    useEffect(() => {
        const container = containerRef.current;
        if (!container || !chatOpen) return;
   
        const threshold = 120;

        const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;

        if (isAtBottom) scrollToBottom("smooth");
    }, [sortedMessages.length, aiTyping]);

    return { scrollToBottom,  showScrollBtn, };
}