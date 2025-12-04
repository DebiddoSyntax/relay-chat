"use client"
import axios from 'axios';
import ChatCard from './ChatCard'
import { PiNotePencilBold } from "react-icons/pi";

interface ChatOverviewProps{
    chatOpen: boolean
    setChatOpen: (val:boolean)=> void
}

function ChatOverview({ chatOpen, setChatOpen }: ChatOverviewProps) {

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


    const handleCall = async () => {
        try{
            const response = await axios.get('http://localhost:8000/api/chats/')
            console.log(response.data)
        }catch(err){
            console.log(err)
        }
    }

    return (
        <div className={`${chatOpen ? "hidden md:flex md:flex-col" : "flex flex-col "} w-full md:w-full lg:w-96 2xl:w-[420px] h-screen z-20 border-b-2 md:border-b-0 border-r-0 md:border-r-2 border-gray-300`}> 
            <div className='px-5 lg:px-6 2xl:px-8 pt-5 pb-5 md:pb-9 border-b-2 border-gray-300'>
                <div className='flex justify-between items-center'>
                    <p className='text-xl font-semibold'>
                        Chats
                    </p>

                    <PiNotePencilBold className='text-2xl cursor-pointer' onClick={handleCall}/>
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
                    {OverView.map((a, i)=> (
                        <div key={i} onClick={()=> setChatOpen(true)}>
                            <ChatCard active={a.active} />
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default ChatOverview
