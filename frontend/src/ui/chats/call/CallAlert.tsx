"use client"
import React from 'react'
import Call from './Call'
import { useChat } from '@/src/functions/chats/chatStore'

function CallAlert() {
    const incomingCall = useChat((state)=> state.incomingCall)
    return (
        <div>
            {incomingCall && <Call isAudio={incomingCall?.isAudio} />}
        </div>
    )
}

export default CallAlert
