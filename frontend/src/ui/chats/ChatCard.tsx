"use client"
import Image from 'next/image';
import { OverviewDataProps } from '@/src/functions/types/ChatType';
import profileImage from '@/src/assets/profile.png'
import { useChat } from '@/src/functions/chats/chatStore';
import { useEffect } from 'react';


interface ChatCardProps { 
    data: OverviewDataProps,
    activeId: null | number
}


function ChatCard({ data, activeId } : ChatCardProps ) {
    const setLastMessage = useChat((state)=> state.setLastMessage)
    const lastMessage = useChat((state)=> state.lastMessage)
    const lastMessageDate = data.last_message_time?.split("T")[0];

    useEffect(()=> {
        setLastMessage(data.last_message)
    }, [data])

    return (
        <div className={`px-5 py-3 mb-3 ${activeId == data.chat_id ? "bg-black text-white" : "bg-white text-black hover:bg-gray-200"} rounded-sm  w-full cursor-pointer`}>
            <div className='flex gap-3 w-full'>
                <Image src={profileImage} width={200} height={200} alt='profileImage' className='w-12 h-12 rounded-full'/>
                <div className='flex flex-col gap-2 w-full'>
                    <p className='text-base font-semibold'>{data.chat_name}</p>
                    <div className='flex justify-between items-center text-xs w-full gap-3'>
                        <p className='w-[50%] overflow-hidden truncate'>{lastMessage}</p>
                        <p>{lastMessageDate}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatCard
