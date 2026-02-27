import { UserType } from "./UserType"
export interface OverviewDataProps {
    last_message: string, 
    last_message_time: string, 
    receiver: string,  
    chat_id: number
    chat_name: string
    unread_count: number
    image_url: string
    users: UserType[]
    my_role: string
}

export interface ChatObjType {
    [chatType: number]: {
        chats: OverviewDataProps[]
    }
}

export interface NewchatInputType{
    receiver: string,
    firstMessage: string
    groupName?: string
}


// message type 
export interface MessageType {
    id: number,
    sender_id: string,
    content: string,
    created_at: string,
    is_read: string, 
    chat: string,
    type: string,
    sender_firstname: string,
    sender_lastname: string,
    sender_image: string,
}

export interface MessagesCacheType {
    [chatId: number]: {
        messages: MessageType[]
        nextUrl: string | null
    }
}

export interface IncomingType{ 
    isCalling: boolean, 
    callerName: string, 
    chatId: number, 
    image_url: string, 
    isAudio: boolean | null, 
    picked: boolean 
}