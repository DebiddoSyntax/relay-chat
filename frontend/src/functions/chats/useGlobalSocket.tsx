'use client'
import { useEffect } from 'react'
import { useAuth } from '../auth/Store'
import { useChat } from './chatStore'

export function useGlobalSocket() {
    const token = useAuth((state) => state.accessToken)
    const refreshAccessToken = useAuth((state)=> state.refreshAccessToken)
    
    const updateLastMessage = useChat((state) => state.updateLastMessage)
    const incrementUnread = useChat((state) => state.incrementUnread)
    const activePrivateId = useChat((state)=> state.activePrivateId)
    const activeGroupId = useChat((state)=> state.activeGroupId)
    const setIncomingCall = useChat((state)=> state.setIncomingCall)
    const incomingCall = useChat((state)=> state.incomingCall)
    const setActiveCall = useChat((state)=> state.setActiveCall)

    const socketURL = process.env.NEXT_PUBLIC_BASE_SOCKET_URL
    
    useEffect(() => {
        if (!token) return
        
        const socket = new WebSocket(`${socketURL}/user/`)
        let reconnectTimeout: NodeJS.Timeout
        
        const connect = () =>{

            const handleMessage = async(event: MessageEvent) =>{
                const data = JSON.parse(event.data)
                // console.log('global', data)
                
                if (data.type === 'error') {
                    console.log(`❌ ${data.error}: ${data.message}`);
                    
                    // handle token expiration 
                    if (data.error === 'token_expired') {
                        try{
                            await refreshAccessToken()
                        }catch(err){
                            return;
                        }
                    }
                       
                }

                if (data.type === 'connection' && data.status === 'connected') {
                    // console.log('Global socket connected')
                }

                if (data.type === "new_message") {
                    // handle last message and unread count 
                    updateLastMessage(data.chat_type, data.chat_id, data.content, data.created_at)
                    const activeId = data.chat_type == 'group' ? activeGroupId : activePrivateId
                    if (data.chat_id !== activeId) {
                        incrementUnread(data.chat_type, data.chat_id)
                    }
                }

                if (data.type === "new_call") {
                    // setIncomingCall({chatId: data.chat_id, isCalling: true, callerName: data.sender_name, image_url: data.image_url, isAudio: data.isAudio})
                    if(!incomingCall?.picked){
                        setIncomingCall({chatId: data.chat_id, isCalling: true, callerName: data.sender_name, image_url: data.image_url, isAudio: data.isAudio, picked: true})
                    }else{
                        socket.send(JSON.stringify({
                            "type": "notify",
                            "payload": {
                                "type": "active_call"
                            }
                        }))
                    }
                }

                if (data.type === "stop_call") {
                    setIncomingCall(null)
                }

                if (data.type === "active_call") {
                    // console.log('global d', data)
                    setActiveCall(true)
                }
            }

            // socket.onopen = () => console.log('Global socket open')
            socket.onerror = (err) => console.error('Global socket error', err)

            socket.onmessage = handleMessage

            socket.onclose = () => {
                reconnectTimeout = setTimeout(() => {
                    connect()
                }, 1000)
            }
        }

        connect()

        return () => {
            clearTimeout(reconnectTimeout)
            socket.close()
        }
 
    }, [token, updateLastMessage, incrementUnread, activeGroupId, activePrivateId, setActiveCall, refreshAccessToken])
}