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

    useEffect(() => {
        if (!token) return

        const socket = new WebSocket(`ws://localhost:8000/ws/user/?token=${token}`)

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)

            if (data.type === "new_message") {
                console.log('global d', data)
                updateLastMessage(data.chat_type, data.chat_id, data.content, data.created_at)
                const activeId = data.chat_type == 'group' ? activeGroupId : activePrivateId
                if (data.chat_id !== activeId) {
                    incrementUnread(data.chat_type, data.chat_id)
                }
            }
        }

        // socket.onopen = () => console.log('Global socket connected')
        // socket.onclose = () => console.log('Global socket disconnected')
        // socket.onerror = (err) => console.error('Global socket error', err)

        return () => socket.close()
    }, [token, updateLastMessage, incrementUnread, activeGroupId, activePrivateId])
}
