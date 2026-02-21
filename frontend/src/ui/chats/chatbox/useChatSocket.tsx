import { useAuth } from '@/src/functions/auth/Store'
import { useChat } from '@/src/functions/chats/chatStore'
import React, { useEffect, useRef, useState, Dispatch, SetStateAction } from 'react'
import { MessageType } from './ChatBox'

// ====== handle web socket connections =====


export function useChatSocket(activeId: number | null, setMessages: Dispatch<SetStateAction<MessageType[]>>, shouldScrollRef: React.RefObject<boolean>) {

    const token = useAuth((state)=> state.accessToken)
    const refreshAccessToken = useAuth((state)=> state.refreshAccessToken)

    const chatOpen = useChat((state)=> state.chatOpen)
    const updateLastMessage = useChat((state) => state.updateLastMessage)
    
    const socketRef = useRef<WebSocket | null>(null);
    const [status, setStatus] = useState<string>("connecting");
    const [aiTyping, setAiTyping] = useState<boolean>(false);

    
    useEffect(() => {
         if(!chatOpen || !activeId) return 
         
         const socketURL = process.env.NEXT_PUBLIC_BASE_SOCKET_URL
         const wsUrl = `${socketURL}/chat/${activeId}/`;
         let reconnectTimeout: NodeJS.Timeout
         let isCleanup = false
         
         
         const connect = () => {
             const socket = new WebSocket(wsUrl);
             socketRef.current = socket
 
             const handleMessage = async (event: MessageEvent) => {
                 const data = JSON.parse(event.data);
                 // console.log('message', data)
 
                 if (data.type === 'error') {
                     // console.log(`❌ ${data.error}: ${data.message}`);
                     
                     if (data.error === 'token_expired') {
                         try{
                             await refreshAccessToken()
                         }catch(err){
                             return;
                         }
                     }
                        
                 }
                     
                 if (data.type === 'connection' && data.status === 'connected') {
                     setStatus("connected");
                 }
 
                 if (data.type === "typing" && data.user === "ai") {
                     setAiTyping(data.typing);
                 }
 
                 if (data.type === "message") {
                     setAiTyping(false)
                     shouldScrollRef.current = true;
                     setMessages((prev) => [...prev, data]);
 
                     if (!data.meta?.ephemeral) {
                         socket.send(
                             JSON.stringify({
                                 type: "read",
                                 message_id: data.id,
                             })
                         );
                     }
                 }
             };
 
             socket.onmessage = handleMessage
 
             socket.onclose = () => {
                 setStatus("disconnected");
 
                 if (isCleanup) return
 
                 reconnectTimeout = setTimeout(() => {
                     // console.log('Attempting to reconnect...')
                     connect()
                 }, 5000)
             };
 
 
             socket.onerror = (err) => {
                 console.error("WebSocket error", err);
             };
         }
 
         connect()
         
         return () => {
             isCleanup = true
             clearTimeout(reconnectTimeout)
             socketRef.current?.close()
         }
 
     }, [activeId, token, chatOpen]);

    
    const sendMessage = (content: string, type: string) => {
        if (!socketRef.current || status !== 'connected') return;

        socketRef.current?.send(
            JSON.stringify({
                type: "message",
                content: content,
                message_type: "text",
            })
        );

        updateLastMessage(type, activeId!, content, new Date().toISOString())

        // content = ''
    };

    return { sendMessage, aiTyping, status }
     
}

