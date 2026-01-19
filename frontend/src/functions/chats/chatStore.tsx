"use client";
import { create } from "zustand";
import { OverviewDataProps } from "../types/ChatType";



interface ChatStore {
    activeId: number | null;
    chatName: string | null;
    chatOpen: boolean
    chats: OverviewDataProps[]

    incrementUnread: (chatId: number) => void
    resetUnread: (chatId: number| null) => void
    setChats: (chats: OverviewDataProps[] | ((prev: OverviewDataProps[]) => OverviewDataProps[])) => void

    setActiveId: (val: number | null)=> void
    setChatName: (val: string | null)=> void
    setChatOpen: (val: boolean)=> void

    updateLastMessage: (chatId: number, message: string, time: string) => void
}



export const useChat = create<ChatStore>()(

    (set, get) => ({
        //default values
        activeId: null,
        chatName: null,
        chatOpen: false,
        chats: [],

        setChats: (chatsOrUpdater) =>
            set((state) => ({
                chats:
                typeof chatsOrUpdater === "function"
                    ? (chatsOrUpdater as (prev: OverviewDataProps[]) => OverviewDataProps[])(state.chats)
                    : chatsOrUpdater,
            })),


        updateLastMessage: (chatId, message, time) =>
            set((state) => ({
                    chats: state.chats.map((chat) =>
                        chat.chat_id === chatId
                        ? {
                            ...chat,
                            last_message: message,
                            last_message_time: time,
                            }
                        : chat
                    ),
                })
            ),

        incrementUnread: (chatId) =>
            set((state) => ({
                    chats: state.chats.map((chat) =>
                        chat.chat_id === chatId
                        ? { ...chat, unread_count: chat.unread_count + 1 }
                        : chat
                    ),
                })
            ),


        resetUnread: (chatId) => {
            if(!chatId) return
            set((state) => ({
                    chats: state.chats.map((chat) =>
                        chat.chat_id === chatId
                        ? { ...chat, unread_count: 0 }
                        : chat
                    ),
                })
            )
        },

        setActiveId: (activeId)=> set({ activeId: activeId}),
        setChatName: (chatName)=> set({ chatName: chatName}),  
        setChatOpen: (chatOpen)=> set({ chatOpen: chatOpen}),  
    }),

);


