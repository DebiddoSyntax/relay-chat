"use client"
import ChatBox from '../chatbox/ChatBox'
import ChatOverview from '../overview/ChatOverview'

// main group component 
function GroupChats() {

    return (
        <div className='flex flex-col lg:flex-row flex-1 h-full w-full'>
            <ChatOverview isGroup={true} isAI={false} />
            <ChatBox isGroup={true} isAI={false}/>
        </div>
    )
}

export default GroupChats