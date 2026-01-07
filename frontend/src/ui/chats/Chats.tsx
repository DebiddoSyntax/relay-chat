"use client"
import { useState } from 'react'
import ChatBox from './ChatBox'
import ChatOverview from './ChatOverview'


function Chats() {

    const [chatOpen, setChatOpen] = useState(false);
    const [activeId, setActiveId] = useState<null | number> (null)


    return (
        <div className='flex flex-col lg:flex-row flex-1 h-full w-full'>
            <ChatOverview chatOpen={chatOpen} setChatOpen={setChatOpen} activeId={activeId} setActiveId={setActiveId} />
            <ChatBox chatOpen={chatOpen} setChatOpen={setChatOpen} activeId={activeId} setActiveId={setActiveId} />
        </div>
    )
}

export default Chats
