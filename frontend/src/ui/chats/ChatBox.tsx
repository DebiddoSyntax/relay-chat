"use client"
import { IoMdMore, IoIosArrowBack } from "react-icons/io";
import MessageCard from './MessageCard';
import { IoSend } from "react-icons/io5";


interface ChatBoxProps{
    chatOpen: boolean
    setChatOpen: (val:boolean)=> void
}

function ChatBox({ chatOpen, setChatOpen }: ChatBoxProps) {
    const messages = [
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: true
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: true
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: false
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: true
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: false
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: true
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: false
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: true
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: false
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: true
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: false
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: true
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: false
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: true
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: false
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: true
        },
        {
            message: 'This is a message This is a message This is a message This is a message This is a message ',
            isUser: false
        },
        {
            message: 'This is the last message This is a message This is a message This is a message This is a message ',
            isUser: false
        },
    ]

    return (
        <div  className={`flex-1 w-full h-screen bg-gray-100`}>
            {chatOpen ? (
                <div className={`${!chatOpen && "hidden lg:flex lg:flex-col"} flex-1 w-full h-screen bg-gray-100`}>
                    <div className='bg-white w-full px-5 lg:px-6 2xl:px-8 py-5 border-b-0 border-gray-300 shadow-sm'>
                        <div className='w-full flex gap-3 items-center'>
                            <IoIosArrowBack className='lg:hidden text-2xl cursor-pointer' onClick={()=> setChatOpen(false)} />

                            <div className='w-full flex justify-between items-center'>
                                <div>
                                    <p className='text-lg font-semibold'>
                                        David Michael
                                    </p>
                                    <p className="text-xs text-green-700">online</p>
                                </div>

                                <IoMdMore className='text-2xl cursor-pointer'/>
                            </div>
                        </div>
                    </div>


                    <div className='relative flex-1 h-screen w-full pb-80 md:pb-64'>
                        <div className='relative flex-1 overflow-y-auto h-full w-full custom-scrollbar pb-5'>
                            {messages.map((m, i)=> (
                                <MessageCard key={i} m={m} />
                            ))}
                        </div>


                        <div className="sticky bottom-0 w-full flex gap-6 py-10 px-5 lg:px-8 bg-white">
                            <textarea
                                autoComplete="off" 
                                id="firstMessage" 
                                placeholder='enter your message'
                                className=" min-h-5 max-h-[120px] flex-1 py-3 px-4 bg-gray-100 rounded-sm focus:placeholder:opacity-0 focus:outline-none placeholder:text-sm placeholder:font-medium"
                                rows={1}
                            /> 
                            
                    
                            <button className="bg-blue-700 text-white px-4 py-3 cursor-pointer rounded-sm">
                                <IoSend />
                            </button>
                        </div>


                    </div>


                </div>
            ) : (
                <div className="w-full h-full flex flex-col justify-center items-center">
                    <p className="text-center text-base font-semibold text-gray-800">Open a Chat</p>
                </div>
            )}
        </div>
    )
}

export default ChatBox
