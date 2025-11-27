import React from 'react'
import Image from 'next/image';
import profileImage from '@/src/assets/profile.png'

function ChatCard() {
    return (
        <div className='px-5 py-5 mt-5 bg-black rounded-sm text-white w-full cursor-pointer'>
            <div className='flex gap-3 w-full'>
                <Image src={profileImage} width={200} height={200} alt='profileImage' className='w-12 h-12'/>
                <div className='flex flex-col gap-2'>
                    <p className='text-base font-semibold'>David Michael</p>
                    <div className='flex justify-between items-center text-xs w-full gap-3'>
                        <p>you: when are you coming home?</p>
                        <p>10 mins</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatCard
