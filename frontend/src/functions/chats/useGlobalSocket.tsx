'use client'
import { useEffect } from 'react'
import { useAuth } from '../auth/Store'
import { useChat } from './chatStore'

export function useGlobalSocket() {
    const token = useAuth((state) => state.accessToken)
    
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
        
        const socket = new WebSocket(`${socketURL}/user/?token=${token}`)
        let reconnectTimeout: NodeJS.Timeout
        
        const connect = () =>{
            
            const handleMessage = (event: MessageEvent) =>{
                const data = JSON.parse(event.data)
                if (data.type === "new_message") {
                    // console.log('global message d', data)
                    updateLastMessage(data.chat_type, data.chat_id, data.content, data.created_at)
                    const activeId = data.chat_type == 'group' ? activeGroupId : activePrivateId
                    if (data.chat_id !== activeId) {
                        incrementUnread(data.chat_type, data.chat_id)
                    }
                }

                if (data.type === "new_call") {
                    // console.log('global d', data)
                    setIncomingCall({chatId: data.chat_id, isCalling: true, callerName: data.sender_name, image_url: data.image_url, isAudio: data.isAudio})
                    // if(!incomingCall?.isCalling){
                    //     setIncomingCall({chatId: data.chat_id, isCalling: true, callerName: data.sender_name, image_url: data.image_url})
                    //     setActiveCall(true)
                    // }else{
                    //     socket.send(JSON.stringify({
                    //         "type": "notify",
                    //         "payload": {
                    //             "type": "active_call"
                    //         }
                    //     }))
                    // }
                }

                if (data.type === "stop_call") {
                    setIncomingCall(null)
                }

                if (data.type === "active_call") {
                    // console.log('global d', data)
                    setActiveCall(true)
                }
            }

            socket.onopen = () => console.log('Global socket connected')
            // socket.onerror = (err) => console.error('Global socket error', err)

            socket.onmessage = handleMessage

            socket.onclose = () => {
                reconnectTimeout = setTimeout(() => {
                    // console.log('Attempting to reconnect...')
                    connect()
                }, 10000)
            }
        }

        connect()

        return () => {
            clearTimeout(reconnectTimeout)
            socket.close()
        }
 
    }, [token, updateLastMessage, incrementUnread, activeGroupId, activePrivateId, setActiveCall, ])
}