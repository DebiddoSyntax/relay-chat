'use client'
import { useChat } from "@/src/functions/chats/chatStore"
import Sidebar from "./Sidebar"

function SideBarWrap() {
    const chatOpen = useChat((state)=> state.chatOpen)
    return (
        <div className={`${chatOpen && 'hidden md:block md:pt-0'}`}>
            <Sidebar />
        </div>
    )
}

export default SideBarWrap
