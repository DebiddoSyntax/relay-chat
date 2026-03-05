import React, { useEffect, useState } from 'react'
import axios from 'axios';
import api from '@/src/functions/auth/AxiosConfig';
import { useChat } from '@/src/functions/chats/chatStore';
import { MessageType } from '@/src/functions/types/ChatType';



export function useFetchMessages( 
    activeId: number | null,  
    type: string,  
    containerRef: React.RefObject<HTMLDivElement | null>,  
    shouldScrollRef: React.RefObject<boolean>, 
    socketRef: React.RefObject<WebSocket | null>,
    status: string,
    sortedMessages: MessageType[]
) {


    const resetUnread = useChat((state) => state.resetUnread)
    const setMessages = useChat((state)=> state.setMessages)
    // const messages = useChat((state)=> state.messages)
    const messagesCache = useChat((state)=> state.messagesCache)

    // fetch messages states 
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [loadingMore, setLoadingMore] = useState(false);
    const [errorMore, setErrorMore] = useState("")
    const [nextUrl, setNextUrl] = useState<string | null>(null);

    // fetch chat messages 
    const fetchMessages = async() => {

        let firstOpen = false
        if (activeId && messagesCache[activeId] && firstOpen) {
            setMessages(messagesCache[activeId].messages)
            setNextUrl(messagesCache[activeId].nextUrl)
            resetUnread(type, activeId)
            // console.log('from cache', messagesCache[activeId])
            firstOpen = true
            return;
        }

        let fetchTimer: NodeJS.Timeout | null = null;

        try{
            fetchTimer = setTimeout(()=> {
                setLoading(true)
            }, 10000)
            const response = await api.get(`/chat/${activeId}/messages/`)
            // console.log('fetched mess', response.data)
            if (fetchTimer) clearTimeout(fetchTimer);
            resetUnread(type, activeId)
            setNextUrl(response.data.next)
            setMessages(response.data.results)
            setError('')

            if (activeId) {
                messagesCache[activeId] = {
                    messages: response.data.results,
                    nextUrl: response.data.next
                }
                // console.log('first fetch', messagesCache[activeId].nextUrl)
            }
        }catch(err){
            if (axios.isAxiosError(err)) {
                console.error("error", err.response?.data);
                if (fetchTimer) clearTimeout(fetchTimer);
                setError('Failed to load messages')
            } else {
                console.error("unexpected error", err);
                setError('An unexpected error occurred')
            }
        }finally{
            if (fetchTimer) clearTimeout(fetchTimer);
            setLoading(false)
        }
    }

    
    useEffect(()=> {
        if (!activeId)return;
        setMessages([])
        fetchMessages()
    }, [activeId])


    useEffect(() => {
        if (!activeId) return;

        const socket = socketRef.current;

        if (!socket || socket.readyState !== WebSocket.OPEN) return;

        socket.send(
            JSON.stringify({
                type: "read_all",
                activeId: activeId,
            })
        );

    }, [activeId, status, sortedMessages]);
    


    // fetch more chat messages
    const fetchMoreMessages = async () => {
        if (!nextUrl || loadingMore) return;

        const container = containerRef.current;
        const previousHeight = container?.scrollHeight || 0;

        let fetchMoreTimer: NodeJS.Timeout | null = null;
        
        try{
            fetchMoreTimer = setTimeout(()=> {
                setLoadingMore(true);
            }, 10000)
            const res = await api.get(nextUrl);
            if (fetchMoreTimer) clearTimeout(fetchMoreTimer);
            // console.log('fetched more messages', res.data)
            setMessages(prev => {
                const updated = [...res.data.results, ...prev];
                if (activeId) {
                    messagesCache[activeId] = { messages: updated, nextUrl: res.data.next };
                    // console.log('saved to cache', messagesCache[activeId].nextUrl)
                }
                return updated;
            });
            setNextUrl(res.data.next);
            setErrorMore('')
        }catch(err){
            if (axios.isAxiosError(err)) {
                console.error("error", err.response?.data);
                if (fetchMoreTimer) clearTimeout(fetchMoreTimer);
                setErrorMore('Failed to load more messages')
            } else {
                console.error("unexpected error", err);
                setErrorMore('An unexpected error occurred')
            }
        }finally{
            if (fetchMoreTimer) clearTimeout(fetchMoreTimer);
            setLoadingMore(false);
            shouldScrollRef.current = false;
        }

        requestAnimationFrame(() => {
            if (container) {
                container.scrollTop = container.scrollHeight - previousHeight;
            }
        });

        setLoadingMore(false);
    };
  
    return {fetchMessages, nextUrl, fetchMoreMessages, loading, loadingMore, error, errorMore}
}

