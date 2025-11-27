"use client"
import React from 'react'
import ChatBox from './ChatBox'
import { PiNotePencilBold } from "react-icons/pi";
import ChatCard from './ChatCard';

function Chats() {
    return (
        <div className='w-full flex h-screen'>
            <div className="w-full md:w-72 lg:w-80 2xl:w-[420px] flex flex-col h-full z-20 border-r-2 border-gray-300"> 
                <div className='px-5 lg:px-6 2xl:px-8 py-8 border-y-2 border-gray-300'>
                    <div className='flex justify-between items-center'>
                        <p className='text-2xl font-semibold'>
                            Chats
                        </p>
                        <PiNotePencilBold className='text-2xl cursor-pointer'/>
                    </div>
                </div>

                <div className='px-5 lg:px-6 2xl:px-8 py-8 border-b-2 border-gray-300'>
                    <input type="text" placeholder='search' name="search" id="search" className='p-3 w-full border-2 border-gray-300 rounded-sm focus:placeholder:opacity-0 focus:ring-0'/>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden w-full">
                    <div className="flex-1 px-5 lg:px-6 2xl:px-8 py-8 overflow-y-auto w-full">
                        <ChatCard />
                        <ChatCard />
                        <ChatCard />
                        <ChatCard />
                        <ChatCard />
                        <ChatCard />
                        <ChatCard />
                        <ChatCard />
                    </div>
                </div>

            </div>

            <ChatBox />
        </div>
    )
}

export default Chats
