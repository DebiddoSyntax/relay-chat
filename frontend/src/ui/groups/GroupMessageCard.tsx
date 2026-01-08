import Image from 'next/image'
import profileImage from '@/src/assets/profile.png'
import { MessageType } from '../chats/ChatBox'
import { useAuth } from '@/src/functions/auth/Store'

interface GroupMessageProps {
    m: MessageType
}


// function GroupMessageCard({ m }: GroupMessageProps) {

//     const user = useAuth((state)=> state.user)
    
//     return (
//         <div className={`flex ${ m.sender_id == user?.id ? "justify-end" : "justify-start" } mt-5`} >
//             <div className='flex gap-3 items-end'>
//                 {!m.id && <Image src={profileImage} width={200} height={200} alt='profileImage' className='w-7 h-7'/> }
//                 <div className={`${ m.sender_id !== user?.id ? "bg-white text-black" : "bg-blue-700 text-white" } px-5 py-4 max-w-[420px] text-xs leading-6 rounded-sm wrap-break-words`} >
//                     {m.content}
//                 </div> 
//             </div>
//         </div>
           
//     )
// }

// export default GroupMessageCard

function GroupMessageCard({ m }: GroupMessageProps) {

    const user = useAuth((state)=> state.user)
    
    return (
        <div className={`flex ${ m.sender_id == user?.id ? "justify-end" : "justify-start" } mt-5 px-5 xl:px-8`} >
            <div className={`${m.sender_id !== user?.id ? "bg-white text-black" : "bg-blue-700 text-white" } px-5 py-4 w-72 md:w-80 xl:max-w-[420px] text-xs leading-6 rounded-sm break-words`} >
                {m.content}
            </div> 
        </div>
           
    )
}

export default GroupMessageCard

