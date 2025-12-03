import Image from 'next/image'
import profileImage from '@/src/assets/profile.png'

interface GroupMessageProps {
    m: {
        message: string, 
        isUser: boolean
    }
}


function GroupMessageCard({ m }: GroupMessageProps) {
    
    return (
        <div className={`flex ${ m.isUser ? "justify-end" : "justify-start" } mt-5`} >
            <div className='flex gap-3 items-end'>
                {!m.isUser && <Image src={profileImage} width={200} height={200} alt='profileImage' className='w-7 h-7'/> }
                <div className={`${ !m.isUser ? "bg-white text-black" : "bg-blue-700 text-white" } px-5 py-4 max-w-[420px] text-xs leading-6 rounded-sm wrap-break-words`} >
                    {m.message}
                </div> 
            </div>
        </div>
           
    )
}

export default GroupMessageCard
