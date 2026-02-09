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

    useEffect(() => {
        if (!token) return

        const socket = new WebSocket(`ws://192.168.0.129:8000/ws/user/?token=${token}`)

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)

            if (data.type === "new_message") {
                console.log('global message d', data)
                updateLastMessage(data.chat_type, data.chat_id, data.content, data.created_at)
                const activeId = data.chat_type == 'group' ? activeGroupId : activePrivateId
                if (data.chat_id !== activeId) {
                    incrementUnread(data.chat_type, data.chat_id)
                }
            }

            if (data.type === "new_call") {
                console.log('global d', data)
                setIncomingCall({chatId: data.chat_id, isCalling: true, callerName: data.sender_name})
            }
        }

        socket.onopen = () => console.log('Global socket connected')
        // socket.onclose = () => console.log('Global socket disconnected')
        // socket.onerror = (err) => console.error('Global socket error', err)

        return () => socket.close()
    }, [token, updateLastMessage, incrementUnread, activeGroupId, activePrivateId])
}
