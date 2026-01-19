export interface OverviewDataProps {
    last_message: string, 
    last_message_time: string, 
    receiver: string,  
    chat_id: number
    chat_name: string
    unread_count: number
    users: {
        firstname: string
        lastname: string
        email: string
        id: string
    }[]
}

export interface NewchatInputType{
    receiver: string,
    firstMessage: string
    groupName?: string
}
