"use client"
import Image from 'next/image';
import profileImage from '@/src/assets/profile.png'


interface ChatCardProps { 
    data : {
        active: boolean
        lastmessage: string, 
        sender: string, 
        receiver: string, 
        timeStamp: string, 
        id: number
    },
    activeId: null | number
}


function ChatCard({ data, activeId } : ChatCardProps ) {
    return (
        <div className={`px-5 py-3 mb-3 ${activeId == data.id ? "bg-black text-white" : "bg-white text-black hover:bg-gray-200"} rounded-sm  w-full cursor-pointer`}>
            <div className='flex gap-3 w-full'>
                <Image src={profileImage} width={200} height={200} alt='profileImage' className='w-12 h-12 rounded-full'/>
                <div className='flex flex-col gap-2 w-full'>
                    <p className='text-base font-semibold'>{data.receiver}</p>
                    <div className='flex justify-between items-center text-xs w-full gap-3'>
                        <p>{data.lastmessage}</p>
                        <p>{data.timeStamp}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatCard
