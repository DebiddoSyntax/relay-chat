"use client"
import { useChat } from '@/src/functions/chats/chatStore'
import ChatBox from './ChatBox'
import { useEffect } from 'react'
import { useAuth } from '@/src/functions/auth/Store'
import api from '@/src/functions/auth/AxiosConfig'

function SydneyAI() {

    const authInitialized = useAuth((state)=> state.authInitialized)
    const setActiveId = useChat((state)=> state.setActiveId)
    const setChatOpen = useChat((state)=> state.setChatOpen)

    useEffect(()=> {
        const FetchConversations = async()=> {
            if(!authInitialized){
                console.log('not init')
                return
            }
            
            try{
                const response = await api.get(`/chat/ai/`)
                console.log('chat overview', response.data)
                setActiveId(response.data.chat_id)
                setChatOpen(true)
            }catch(error){
                console.log('overview error', error)
            }
        }

        FetchConversations()
    }, [authInitialized])
 

    return (
        <div className='flex flex-col lg:flex-row flex-1 h-full w-full'>
            <ChatBox isGroup={false} isAI={true}/>
        </div>
    )
}

export default SydneyAI
