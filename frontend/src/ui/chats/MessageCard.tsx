import { MessageType } from './ChatBox'
import { useAuth } from '@/src/functions/auth/Store'

interface MessageProps {
    m: MessageType
}

// single message component 
function MessageCard({ m }: MessageProps) {

    const user = useAuth((state)=> state.user)

    const date = new Date(m.created_at);

    // const formatted = date.toLocaleDateString("en-GB", {
    //     day: "2-digit",
    //     month: "long",
    //     year: "numeric",
    // });

    const time = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
    });

    
    return (
        <div className={`flex ${ m.sender_id == user?.id ? "justify-end" : "justify-start" } mt-5 px-5 xl:px-8`} >
            <div className={`${m.sender_id !== user?.id ? "bg-white text-black" : "bg-blue-700 text-white" } 
                px-3 py-2 w-auto max-w-72 md:max-w-80 xl:max-w-[420px] text-sm leading-6 rounded-sm break-words`}
            >
                {m.content}
                <div className='mt-2 flex justify-end items-end'>
                    <p className='text-[10px]'>{time}</p>
                </div>
            </div> 
        </div>
           
    )
}

export default MessageCard
