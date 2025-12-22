"use client"
import axios from 'axios';
import ChatCard from './ChatCard'
import AddNewChat from './AddNewChat';
import { useEffect, useState } from 'react';
import { OverviewDataProps } from '@/src/functions/types/ChatType';

interface ChatOverviewProps{
    chatOpen: boolean
    setChatOpen: (val:boolean)=> void
}


function ChatOverview({ chatOpen, setChatOpen }: ChatOverviewProps) {
    
    // const handleCall = async () => {
    //     try{
    //         const response = await axios.get('http://localhost:8000/api/chats/')
    //         console.log(response.data)
    //     }catch(err){
    //         console.log(err)
    //     }
    // }


    const OverView = [
        { active: true, lastmessage: 'when are you coming?', sender: 'user', receiver: 'David Michael', timeStamp: '20mins', id: 1 },
        { active: false, lastmessage: 'Send the name', sender: 'user', receiver: 'Femi Kelvin', timeStamp: '17 mins', id: 2 },
        { active: false, lastmessage: 'Watch Silo series man', sender: 'user', receiver: 'Loli Debby', timeStamp: '17 mins', id: 4 },
        { active: false, lastmessage: 'Terminal Genius', sender: 'user', receiver: 'Oluchi Timothy', timeStamp: '3 days', id: 3 },
        { active: false, lastmessage: 'No', sender: 'user', receiver: 'Benjamin Godson', timeStamp: '11/4/25', id: 5 },
    ]
    
    const [overviewData, setOverviewData] = useState<null | OverviewDataProps[]>(null)
    const [activeId, setActiveId] = useState<null | number> (null)


    useEffect(()=> {
        setOverviewData(OverView)
    }, [])
    

    const handleChatOpen = (id: number) =>{
        setActiveId(id)
        setChatOpen(true)
    }

    return (
        <div className={`${chatOpen ? "hidden lg:flex lg:flex-col" : "flex flex-col "} w-full md:w-full lg:w-96 2xl:w-[420px] h-screen z-20 border-b-2 md:border-b-0 border-r-0 md:border-r-2 border-gray-300`}> 
            <div className='px-5 lg:px-6 2xl:px-8 pt-5 pb-5 md:pb-9 border-b-2 border-gray-300'>
                <div className='flex justify-between items-center'>
                    <p className='text-xl font-semibold'>
                        Chats
                    </p>

                    <AddNewChat setOverviewData={setOverviewData} setActiveId={setActiveId} />
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
                    {overviewData?.map((a, i)=> (
                        <div key={i} onClick={()=> handleChatOpen(a.id)}>
                            <ChatCard data={a} activeId={activeId}/>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default ChatOverview
