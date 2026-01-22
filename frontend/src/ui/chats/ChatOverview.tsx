"use client"
import ChatCard from './ChatCard'
import AddNewChat from './AddNewChat';
import { useEffect, useState } from 'react';
import { OverviewDataProps } from '@/src/functions/types/ChatType';
import api from '@/src/functions/auth/AxiosConfig';
import { useAuth } from '@/src/functions/auth/Store';
import { useChat } from '@/src/functions/chats/chatStore';

interface ChatOverviewProps{
    isGroup: boolean
    isAI: boolean
}


function ChatOverview({ isGroup, isAI }: ChatOverviewProps) {
    // chat overview states
    const authInitialized = useAuth((state)=> state.authInitialized)

    const activeId = useChat((state)=> state.activeId)
    const setActiveId = useChat((state)=> state.setActiveId)
    const setChatName = useChat((state)=> state.setChatName)
    const setChatOpen = useChat((state)=> state.setChatOpen)
    const chatOpen = useChat((state)=> state.chatOpen)
    const chats = useChat((state)=> state.chats)
    const setChats = useChat((state)=> state.setChats)
    

    // fetch user chats effects 
    useEffect(()=> {
        const FetchConversations = async()=> {
            if(!authInitialized){
                console.log('not init')
                return
            }

            const fetchPath = isGroup ? '/groupchat/all/' : isAI ? '/chat/ai/' : '/chat/all/'
            
            console.log('init')
            try{
                const response = await api.get(`${fetchPath}`)
                console.log('chat overview', response.data)
                setChats(response.data)
            }catch(error){
                console.log('overview error', error)
            }
        }

        FetchConversations()
    }, [authInitialized])

    
    // open a single chat function 
    const handleChatOpen = (a: OverviewDataProps) =>{
        setActiveId(a.chat_id)
        setChatName(a.chat_name)
        setChatOpen(true)
    }


    const sortedChats = chats.sort(
        (a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
    );

   


    return (
        <div className={`${chatOpen ? "hidden lg:flex lg:flex-col" : "flex flex-col "} w-full md:w-full lg:w-96 2xl:w-[420px] h-screen z-20 border-b-2 md:border-b-0 border-r-0 md:border-r-2 border-gray-300`}> 
            <div className='px-5 lg:px-6 2xl:px-8 pt-5 pb-5 md:pb-9 border-b-2 border-gray-300'>
                <div className='flex justify-between items-center'>
                    <p className='text-xl font-semibold'>
                        {isGroup ? 'Groups' : isAI ? 'Sydney' : 'Chats'}
                    </p>

                    <AddNewChat isGroup={isGroup} isAI={isAI} />
                </div>
            </div>

            <div className='px-5 lg:px-6 2xl:px-8 py-8 border-b-2 border-gray-300'>
                <input 
                    type="text" 
                    placeholder='search' 
                    name="search" 
                    id="search" 
                    className='p-3 w-full border-2 border-gray-300 rounded-sm focus:placeholder:opacity-0 focus:outline-0'
                />
            </div>

            <div className="flex-1 flex flex-col w-full overflow-y-auto pb-20 md:pb-3">
                <div className="px-5 lg:px-6 2xl:px-8 pt-8 flex-1 overflow-y-auto w-full custom-scrollbar">
                    {sortedChats?.map((a, i)=> (
                        <div key={i} onClick={()=> handleChatOpen(a)}>
                            <ChatCard data={a} activeId={activeId} isGroup={isGroup} isAI={isAI} />
                        </div>
                    ))}
                </div>
                
                
            </div>

        </div>
    )
}

export default ChatOverview
