"use client"
import GroupChatCard from './GroupChatCard'
import { PiNotePencilBold } from "react-icons/pi";

function ChatOverview() {

    const OverView = [
        { active: true },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
        { active: false },
    ]

    return (
        <div className="w-full md:w-full lg:w-96 2xl:w-[420px] flex flex-col h-full z-20 border-b-2 md:border-b-0 border-r-0 md:border-r-2 border-gray-300"> 
            <div className='px-5 lg:px-6 2xl:px-8 pt-5 pb-9 border-b-2 border-gray-300'>
                <div className='flex justify-between items-center'>
                    <p className='text-xl font-semibold'>
                        Groups
                    </p>

                    <PiNotePencilBold className='text-2xl cursor-pointer'/>
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

            <div className="flex-1 flex flex-col overflow-hidden w-full">
                <div className="flex-1 px-5 lg:px-6 2xl:px-8 py-8 overflow-y-auto w-full custom-scrollbar">
                    {OverView.map((a, i)=> (
                        <GroupChatCard active={a.active} key={i} />
                    ))}
                </div>
            </div>

        </div>
    )
}

export default ChatOverview
