export interface OverviewDataProps {
    last_message: string, 
    last_message_time: string, 
    receiver: string,  
    chat_id: number
    chat_name: string
}

export interface NewchatInputType{
    receiver: string,
    firstMessage: string
    groupName?: string
}
