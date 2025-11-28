"use client"
import ChatBox from './ChatBox'
import ChatOverview from './ChatOverview'


function Chats() {
    return (
        <div className='flex flex-1 h-screen w-full'>
            <ChatOverview />
            <ChatBox />
        </div>
    )
}

export default Chats
