'use client'
import { useEffect } from 'react'
import { useAuth } from '../auth/Store'
import { useChat } from './chatStore'

export function useGlobalSocket() {
    const token = useAuth((state) => state.accessToken)
    
    const activeId = useChat((state) => state.activeId)
    const updateLastMessage = useChat((state) => state.updateLastMessage)
    const incrementUnread = useChat((state) => state.incrementUnread)

    useEffect(() => {
        if (!token) return

        const socket = new WebSocket(`ws://localhost:8000/ws/user/?token=${token}`)

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)

            if (data.type === "new_message") {
                updateLastMessage(data.chat_id, data.content, data.created_at)

                if (data.chat_id !== activeId) {
                    incrementUnread(data.chat_id)
                }
            }
        }

        socket.onopen = () => console.log('Global socket connected')
        socket.onclose = () => console.log('Global socket disconnected')
        socket.onerror = (err) => console.error('Global socket error', err)

        return () => socket.close()
    }, [token, activeId, updateLastMessage, incrementUnread])
}
