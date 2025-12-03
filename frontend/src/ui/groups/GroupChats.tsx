"use client"
import GroupChatBox from './GroupChatBox'
import GroupChatOverview from './GroupChatOverview'


function GroupChats() {
    return (
        <div className='flex flex-col lg:flex-row flex-1 h-screen md:h-screen w-full'>
            <GroupChatOverview />
            <GroupChatBox />
        </div>
    )
}

export default GroupChats
