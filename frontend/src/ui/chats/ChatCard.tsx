"use client"
import Image from 'next/image';
import { OverviewDataProps } from '@/src/functions/types/ChatType';
import profileImage from '@/src/assets/profile.png'
import { useChat } from '@/src/functions/chats/chatStore';
import { useEffect } from 'react';
import { useAuth } from '@/src/functions/auth/Store';
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { FaUserCircle } from "react-icons/fa";


interface ChatCardProps { 
    data: OverviewDataProps,
    activeId: null | number
    isGroup: boolean
    isAI: boolean
}


function ChatCard({ data, activeId, isGroup, isAI } : ChatCardProps ) {

    // const lastMessageDateSplit = data.last_message_time?.split("T")[0];

    const user = useAuth((state)=> state.user)

    const otherUser = data?.users?.find(
        (u) => u.id !== user?.id
    )

    const chatName = isGroup ? data?.chat_name : isAI ? 'Sydney AI' : `${otherUser?.firstname} ${otherUser?.lastname}`.trim() || otherUser?.email

    const currentDate = new Date(data.last_message_time);
    
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const time = currentDate.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });


    let displayDate;
    if (currentDate.toDateString() === today.toDateString()) {
        displayDate = time;
    } else if (currentDate.toDateString() === yesterday.toDateString()) {
        displayDate = "Yesterday";
    } else {
        displayDate = data.last_message_time?.split("T")[0];
    }


    return (
        <div className={`px-5 py-3 mb-3 ${activeId == data.chat_id ? "bg-black text-white" : "bg-white text-black hover:bg-gray-200"} rounded-sm  w-full cursor-pointer`}>
            <div className='flex gap-3 w-full'>
                {/* <Image src={profileImage} width={200} height={200} alt='profileImage' className='w-12 h-12 rounded-full'/> */}
                <FaUserCircle className='w-12 h-12 rounded-full'/>
                <div className='flex flex-col gap-2 w-full'>
                    <div className='flex justify-between items-center text-xs w-full gap-3 overflow-hidden'>
                        <div className={`${isAI && 'flex gap-1 items-center text-sm'}`}>
                            <p className='text-base font-semibold'>{chatName}</p>
                            {isAI &&  <IoCheckmarkDoneCircle className='text-blue-700' />}
                        </div>
                        <p className={`${data.unread_count < 1 && 'hidden'} py-1 px-2 rounded-full bg-blue-700 text-xs text-white font-semibold`}>{data.unread_count}</p>
                    </div>
                    <div className='flex justify-between items-center text-xs w-full gap-3 overflow-hidden'>
                        <p className='w-48 lg:w-24 2xl:w-40 overflow-hidden truncate'>{isAI ? 'click to view messages' : data.last_message}</p>
                        <p className="">{displayDate}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatCard
