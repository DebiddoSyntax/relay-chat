import { MessageType } from './ChatBox'
import { useAuth } from '@/src/functions/auth/Store'
import { FaUserCircle } from "react-icons/fa";

interface MessageProps {
    m: MessageType
    isGroup: boolean
}

// single message component 
function MessageCard({ m, isGroup }: MessageProps) {

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
        <div className={`flex ${ m.sender_id == user?.id ? "justify-end" : "justify-start" } gap-2 items-end ${isGroup ? 'mt-10' : 'mt-5'} px-5 xl:px-8`} >
            {m.sender_id !== user?.id && isGroup &&
                <div className=''>
                    {m.sender_image ?
                        <img src={m.sender_image} alt='user image' className='w-8 h-8 rounded-full' /> 
                        : 
                        <FaUserCircle className='w-7 h-7 rounded-full'/>
                    }
                </div>
            }
            <div className='flex flex-col gap-2 items-start'>
                <div className={`${m.sender_id !== user?.id ? "bg-white text-black" : "bg-primary text-white" } 
                    px-3 py-2 w-auto min-w-32 max-w-72 md:max-w-80 xl:max-w-[420px] text-sm leading-6 rounded-sm wrap-break-word`}
                    >
                   
                    {m.content}
                    <div className='mt-2 flex justify-end items-end'>
                        <p className='text-[10px]'>{time}</p>
                    </div>
                </div> 

                {m.sender_id !== user?.id && isGroup &&
                    <p className='text-xs font-semibold text-gray-600'>{m.sender_firstname} {m.sender_lastname}</p>
                }
                
            </div>
            
            
        </div>
           
    )
}

export default MessageCard
