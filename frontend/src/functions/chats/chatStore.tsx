"use client";
import { create } from "zustand";
import { ChatObjType, MessagesCacheType, MessageType, OverviewDataProps,  } from "../types/ChatType";
import { IncomingType } from "../types/ChatType";

interface ChatStore {
    // calls
    incomingCall: IncomingType | null
    setIncomingCall: (val: IncomingType | null | ((prev: IncomingType | null) => IncomingType | null)) => void

    activeCall: boolean
    setActiveCall: (val: boolean)=> void

    // messages 
    messages: MessageType[]
    setMessages: (messages: MessageType[] | ((prev: MessageType[]) => MessageType[])) => void
    messagesCache: MessagesCacheType
    chatsObj: ChatObjType

    // main chat
    chatOpen: boolean

    // ids 
    activePrivateId: number | null;
    activeGroupId: number | null;
    aiChatId: number | null

    privateChats: OverviewDataProps[]
    groupChats: OverviewDataProps[]

    setChatOpen: (val: boolean)=> void
    
    setPrivateChats: (chats: OverviewDataProps[] | ((prev: OverviewDataProps[]) => OverviewDataProps[])) => void
    setGroupChats: (chats: OverviewDataProps[] | ((prev: OverviewDataProps[]) => OverviewDataProps[])) => void
    
    setActivePrivateId: (val: number | null)=> void
    setActiveGroupId: (val: number | null)=> void
    setAiChatId: (chatId: number| null) => void

    incrementUnread: (type: string, chatId: number) => void
    resetUnread: (type: string, chatId: number| null) => void
    updateLastMessage: (type: string, chatId: number, message: string, time: string) => void
}


const getChatKey = (type: string) => (type === 'private' ? 'privateChats' : 'groupChats');


export const useChat = create<ChatStore>()(

    (set, get) => ({
        //default values
        aiChatId: null,
        activePrivateId: null,
        activeGroupId: null,
        chatOpen: false,
        privateChats: [],
        groupChats: [],

        activeCall: false,
        incomingCall: null,
        messages: [],
        messagesCache: {},
        chatsObj: {},

        setMessages: (messagesOrUpdater) =>
            set((state) => ({
                messages:
                typeof messagesOrUpdater === "function"
                    ? (messagesOrUpdater as (prev: MessageType[]) => MessageType[])(state.messages)
                    : messagesOrUpdater,
            })),
    

        setPrivateChats: (chatsOrUpdater) =>
            set((state) => ({
                privateChats:
                typeof chatsOrUpdater === "function"
                    ? (chatsOrUpdater as (prev: OverviewDataProps[]) => OverviewDataProps[])(state.privateChats)
                    : chatsOrUpdater,
            })),


        setGroupChats: (chatsOrUpdater) =>
            set((state) => ({
                groupChats:
                typeof chatsOrUpdater === "function"
                    ? (chatsOrUpdater as (prev: OverviewDataProps[]) => OverviewDataProps[])(state.groupChats)
                    : chatsOrUpdater,
            })),


        updateLastMessage: (type, chatId, message, time) => {
            set((state) => {
                const key = getChatKey(type)
                return {
                        [key]: state[key].map((chat) =>
                            chat.chat_id === chatId
                            ? {
                                ...chat,
                                last_message: message,
                                last_message_time: time,
                                }
                            : chat
                        )
                    }
                }
            )
        },


        incrementUnread: (type, chatId) => {
            set((state) => {
                const key = getChatKey(type)
                return {
                        [key]: state[key].map((chat) =>
                        chat.chat_id === chatId ? { ...chat, unread_count: chat.unread_count + 1 } : chat
                    )
                }
            })
        }, 


        resetUnread: (type, chatId) => {
            if(!chatId) return
            set((state) => {
                const key = getChatKey(type)
                return { 
                    [key]: state[key].map((chat) =>
                        chat.chat_id === chatId ? { ...chat, unread_count: 0 } : chat
                    ),
                }
            })
        },


        setActivePrivateId: (activePrivateId)=> set({ activePrivateId: activePrivateId}),
        setActiveGroupId: (activeGroupId)=> set({ activeGroupId: activeGroupId}),
        setAiChatId: (aiChatId)=> set({ aiChatId: aiChatId}),
        setChatOpen: (chatOpen)=> set({ chatOpen: chatOpen}),   
        
        
        setActiveCall: (activeCall)=> set({ activeCall: activeCall}),      
        setIncomingCall: (val) => set((state) => ({
            incomingCall: typeof val === "function" ? val(state.incomingCall) : val
        })),

    }),

);


