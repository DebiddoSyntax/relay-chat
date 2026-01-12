"use client";
import { create } from "zustand";



interface ChatStore {
    activeId: number | null;
    chatName: string | null;
    lastMessage: string
    lastMessageDate: string
    chatOpen: boolean

    setActiveId: (val: number | null)=> void
    setChatName: (val: string | null)=> void
    setLastMessage: (val: string)=> void
    setLastMessageDate: (val: string)=> void
    setChatOpen: (val: boolean)=> void
}



export const useChat = create<ChatStore>()(

        (set, get) => ({
            //default values
            activeId: null,
            chatName: null,
            lastMessage: '',
            lastMessageDate: '',
            chatOpen: false,
            setLastMessage: (lastMessage)=> set({ lastMessage: lastMessage}),
            setLastMessageDate: (lastMessageDate)=> set({ lastMessageDate: lastMessageDate}),

            setActiveId: (activeId)=> set({ activeId: activeId}),
            setChatName: (chatName)=> set({ chatName: chatName}),  
            setChatOpen: (chatOpen)=> set({ chatOpen: chatOpen}),  
        }),

);


