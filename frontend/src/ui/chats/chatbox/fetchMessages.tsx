import React, { useEffect, useRef, useState, Dispatch, SetStateAction } from 'react'
import { MessageType } from './ChatBox'
import axios from 'axios';
import api from '@/src/functions/auth/AxiosConfig';
import { useChat } from '@/src/functions/chats/chatStore';

export function useFetchMessages(activeId: number | null, setMessages: Dispatch<SetStateAction<MessageType[]>>, type: string, containerRef: React.RefObject<HTMLDivElement | null>, shouldScrollRef: React.RefObject<boolean>) {

    const resetUnread = useChat((state) => state.resetUnread)

    // fetch messages states 
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [loadingMore, setLoadingMore] = useState(false);
    const [errorMore, setErrorMore] = useState("")
    const [nextUrl, setNextUrl] = useState<string | null>(null);

    // fetch chat messages 
    const fetchMessages = async() => {
        try{
            setLoading(true)
            const response = await api.get(`/chat/${activeId}/messages/`)
            // console.log('fetched mess', response.data)
            setNextUrl(response.data.next)
            setMessages(response.data.results)
            resetUnread(type, activeId)
            setError('')
        }catch(err){
            if (axios.isAxiosError(err)) {
                console.error("error", err.response?.data);
                setError('Failed to load messages')
            } else {
                console.error("unexpected error", err);
                setError('An unexpected error occurred')
            }
        }finally{
            setLoading(false)
        }
    }

    
    useEffect(()=> {
        if (!activeId)return;
        setMessages([])
        fetchMessages()
    }, [activeId])
    


    // fetch more chat messages
    const fetchMoreMessages = async () => {
        if (!nextUrl || loadingMore) return;

        const container = containerRef.current;
        const previousHeight = container?.scrollHeight || 0;
        
        try{
            setLoadingMore(true);
            const res = await api.get(nextUrl);
            // console.log('fetched more messages', res.data)
            setMessages(prev => [...res.data.results, ...prev,]);
            setNextUrl(res.data.next);
            setErrorMore('')
        }catch(err){
            if (axios.isAxiosError(err)) {
                console.error("error", err.response?.data);
                setErrorMore('Failed to load more messages')
            } else {
                console.error("unexpected error", err);
                setErrorMore('An unexpected error occurred')
            }
        }finally{
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

