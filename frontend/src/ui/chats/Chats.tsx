"use client"
import ChatBox from './ChatBox'
import ChatOverview from './ChatOverview'

// main private chats component 
function Chats() {

    return (
        <div className='flex flex-col lg:flex-row flex-1 h-full w-full'>
            <ChatOverview isGroup={false} isAI={false}  />
            <ChatBox isGroup={false} isAI={false}/>
        </div>
    )
}

export default Chats
