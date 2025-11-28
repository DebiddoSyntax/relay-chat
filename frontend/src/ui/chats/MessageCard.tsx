import React from 'react'

interface MessageProps {
    m: {
        message: string, 
        isUser: boolean
    }
}


function MessageCard({ m }: MessageProps) {
    
    return (
        <div className={`flex ${ m.isUser ? "justify-end" : "justify-start" } mt-5`} >
            <div className={`${ !m.isUser ? "bg-white text-black" : "bg-blue-700 text-white" } px-5 py-4 w-[420px] text-xs leading-6 rounded-sm wrap-break-words`} >
                {m.message}
            </div> 
        </div>
           
    )
}

export default MessageCard
