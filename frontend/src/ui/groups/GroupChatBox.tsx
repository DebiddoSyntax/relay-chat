"use client"
import { IoMdMore } from "react-icons/io";
import MessageCard from './GroupMessageCard';
import { IoSend } from "react-icons/io5";
import Image from "next/image";
import groupImage from '@/src/assets/group.png'



function GroupChatBox() {
    const messages = [
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: true
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: true
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: false
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: true
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: false
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: true
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: false
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: true
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: false
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: true
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: false
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: true
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: false
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: true
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: false
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: true
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: false
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: false
        },
    ]

    return (
        <div className='flex flex-col flex-1 w-full h-screen bg-gray-100'>
            <div className='bg-white w-full px-5 lg:px-6 2xl:px-8 py-5 border-b-0 border-gray-300 shadow-sm'>
                <div className='w-full flex justify-between items-center'>
                    <div className='flex gap-3 items-center'>
                        <Image src={groupImage} width={200} height={200} alt='profileImage' className='w-10 h-10 rounded-full'/>
                        <div>
                            <p className='text-lg font-semibold'>
                                Homework 
                            </p>
                            <p className="text-xs text-gray-600">25 members</p>
                        </div>
                    </div>
                    <IoMdMore className='text-2xl cursor-pointer'/>
                </div>
            </div>

            <div className='flex-1 overflow-y-auto px-10 pt-3 pb-20 h-full w-full custom-scrollbar'>
                {messages.map((m, i)=> (
                    <MessageCard key={i} m={m} />
                ))}
            </div>

            <div className="flex gap-6 py-10 px-10 bg-white">
                <input 
                    type="text" 
                    placeholder="enter your message" 
                    name="message" id="message" 
                    className="py-4 px-5 bg-gray-100 w-full rounded-sm focus:placeholder:opacity-0 focus:outline-0" 
                />

                <button className="bg-blue-700 text-white px-5 py-4 cursor-pointer rounded-sm">
                    <IoSend />
                </button>
            </div>
        </div>
    )
}

export default GroupChatBox
