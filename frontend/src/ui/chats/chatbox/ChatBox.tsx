"use client"
import api from "@/src/functions/auth/AxiosConfig";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/src/functions/auth/Store";
import { useChat } from "@/src/functions/chats/chatStore";
import { handlePrivateChatName } from "@/src/functions/chats/handlePrivateChatName";
import Call from "../call/Call"
import MessageCard from './MessageCard';
import GroupInfo from "../group/GroupInfo";
import Sidebar from "../../reusable/Sidebar";
import { AiFillInfoCircle } from "react-icons/ai";
import { RiChatSmileAiFill } from "react-icons/ri";
import { IoIosArrowBack } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoSend } from "react-icons/io5";
import { FaAnglesDown } from "react-icons/fa6";
import { useChatSocket } from "./useChatSocket";
import { useFetchMessages } from "./fetchMessages";
import { useScroll } from "./useScroll";
import { handleImage } from "./handleImage";




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

interface ChatBoxProps{
    isGroup: boolean
    isAI: boolean
}




function ChatBox({ isGroup, isAI }: ChatBoxProps) {

    // private chat states 
    const activePrivateId = useChat((state)=> state.activePrivateId)
    const setActivePrivateId = useChat((state)=> state.setActivePrivateId)
    const privateChats = useChat((state)=> state.privateChats)
    
    // groupchat states
    const groupChats = useChat((state)=> state.groupChats)
    const activeGroupId = useChat((state)=> state.activeGroupId)
    const setActiveGroupId = useChat((state)=> state.setActiveGroupId)
    
    // ai chat states
    const aiChatId = useChat((state)=> state.aiChatId)
    const setAiChatId = useChat((state)=> state.setAiChatId)

    // set current chats and id states 
    const chats = isGroup ? groupChats : privateChats
    const activeId = isGroup ? activeGroupId : isAI ? aiChatId : activePrivateId

    // other chat ui handlers 
    const setChatOpen = useChat((state)=> state.setChatOpen)
    const chatOpen = useChat((state)=> state.chatOpen)
    
    // socket states 
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [input, setInput] = useState("");

    // scroll refs 
    const containerRef = useRef<HTMLDivElement>(null);
    const shouldScrollRef = useRef(true);
    
    // group info states 
    const [groupInfo, setGroupInfo] = useState(false);

    
    // mobile back button 
    const handleBackButton = () => {
        setChatOpen(false);
        setActiveGroupId(null)
        setActivePrivateId(null)
        setAiChatId(null)
    }


    // get current open chat object
    const chat = [...chats].find(
        (chat) => activeId == chat.chat_id
    )

    // sorted messages 
    const sortedMessages = [...messages].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    
    // set chat name
    const otherUser = handlePrivateChatName(isGroup, chat)
    const chatName = isGroup ? chat?.chat_name : isAI ? 'Sydney AI' : otherUser?.name

    // set current chat type 
    const type = isGroup ? 'group' : 'private'

    // handle chat socket 
    const { sendMessage, aiTyping, status } = useChatSocket(activeId, setMessages, shouldScrollRef)

    // handle messages 
    const { fetchMessages, nextUrl, fetchMoreMessages, loading, loadingMore, error, errorMore} = useFetchMessages(activeId, setMessages, type, containerRef, shouldScrollRef)

    // handle scroll states  
    const { scrollToBottom, showScrollBtn } = useScroll(activeId, messages, containerRef, nextUrl, fetchMoreMessages, loadingMore, aiTyping)

    // immage states 
    const ImageSrc = isGroup ? chat?.image_url : otherUser?.image_url
    const IconDisplay = isAI ? RiChatSmileAiFill : FaUserCircle
    const { canShowImage } = handleImage(ImageSrc)



    // group info 
    const toggleGroupInfo = () => {
        setGroupInfo(!groupInfo)
    }


    const handleMessage = () =>{
        sendMessage(input, type)
        setInput('')
    }
  

    // enter to send message 
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleMessage()
        }
    };


    return (
        <div  className={`flex-1 w-full h-full bg-gray-100 overflow-hidden`}>
            {chatOpen ? (
                <div className={`${!chatOpen && "hidden lg:flex lg:flex-col justify-between"} flex-1 w-full h-dvh bg-gray-100 overflow-hidden`}>
                    {/* top bar */}
                    <div className={`bg-white w-full px-5 lg:px-6 2xl:px-8 ${isAI ? 'py-2 md:py-5' : 'py-5'} border-b-0 border-gray-300 shadow-lg z-10`}>
                        <div className='w-full flex gap-3 items-center'>
                            {!isAI && <IoIosArrowBack className='lg:hidden text-2xl cursor-pointer' onClick={handleBackButton} />}
                            {isAI && <div className="md:hidden flex flex-col justify-center items-center"><Sidebar /></div>}
                            

                            <div className='w-full flex justify-between items-center z-10'>
                                <div className={`${'flex gap-2 items-center'}`}>
                                    {canShowImage ? 
                                        <img src={ImageSrc} alt='user image' className='w-11 h-11 rounded-full' /> 
                                        : 
                                        <IconDisplay className='w-10 h-10 rounded-full'/>
                                    }
                                    <div>
                                        <div className={`${isAI && 'flex gap-1 items-center text-sm'}`}>
                                                <p className='text-lg font-semibold'>
                                                    {chatName}
                                                </p>
                                            {isAI &&  <IoCheckmarkDoneCircle className='text-primary' />}
                                        </div>


                                        <p className={`text-xs ${status == 'disconnected' && 'text-red-700'} text-green-700`}>{status}</p>
                                    </div>
                                </div>
                                
                                <div className="relative inline-block text-left">
                                    <div className="flex items-center gap-3">
                                        {!isGroup && !isAI && 
                                            <>
                                                <Call activeId={activeId} isAudio={false} />
                                                <Call activeId={activeId} isAudio={true} />
                                            </>
                                        }
                                          {isGroup && <AiFillInfoCircle className='text-2xl cursor-pointer' onClick={toggleGroupInfo}/>}
                                    </div>
                                    {isGroup && groupInfo && (
                                        <GroupInfo activeId={activeId} setGroupInfo={setGroupInfo} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>


                    <div className='relative flex-1 h-full w-full pb-[220px] sm:pb-[220px] md:pb-[220px]'>
                        {/* messages  */}
                        <div ref={containerRef} className='relative flex-1 overflow-y-auto h-full w-full custom-scrollbar pt-10 pb-5'>
                            {errorMore && 
                                <div className="text-red-700 text-sm font-semibold text-center">
                                    {errorMore} 
                                    <p className="text-primary text-sm text-center cursor-pointer" onClick={fetchMoreMessages}>retry</p>  
                                </div>
                            }
                            {loadingMore &&<AiOutlineLoading3Quarters className='mx-auto stroke-1 text-xl text-center animate-spin'/>}

                            {sortedMessages.map((m, index) => {
                                const currentDate = new Date(m.created_at);
                                const prevDate = index > 0 ? new Date(sortedMessages[index - 1].created_at) : null;
                                
                                const showTimestamp = index === 0 || currentDate.toDateString() !== prevDate?.toDateString();
                                const today = new Date();
                                const yesterday = new Date();
                                yesterday.setDate(today.getDate() - 1);

                                let displayDate;
                                if (currentDate.toDateString() === today.toDateString()) {
                                    displayDate = "Today";
                                } else if (currentDate.toDateString() === yesterday.toDateString()) {
                                    displayDate = "Yesterday";
                                } else {
                                    displayDate = currentDate.toLocaleDateString(undefined, {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    });
                                }

                                return (
                                    <div key={m.id} className="mt-5">
                                        {showTimestamp && (
                                            <div className="text-center text-xs text-gray-400 mb-2">
                                                {displayDate}
                                            </div>
                                        )}
                                        <MessageCard m={m} isGroup={isGroup}/>
                                        
                                    </div>
                                );
                            })}
                            {aiTyping && (
                                <div className="px-5 lg:px-6 2xl:px-8 mt-5 py-2 w-auto max-w-72 md:max-w-80 xl:max-w-[420px] text-sm leading-6 rounded-sm">
                                    Sydney is thinking<span className="animate-ping">...</span>
                                </div>
                            )}
                            {loading && <AiOutlineLoading3Quarters className='mx-auto stroke-1 text-xl text-center animate-spin'/>}
                            {error && 
                                <div className="text-red-700 text-sm font-semibold text-center">
                                    {error} 
                                    <p className="text-primary text-sm text-center cursor-pointer" onClick={fetchMessages}>retry</p>  
                                </div>
                            }
                        </div>
                        {showScrollBtn && 
                            <div className='relative flex justify-center items-center'>
                                <button
                                    onClick={scrollToBottom}
                                    className="absolute bottom-4 bg-blue-600 text-center text-white px-3 py-3 rounded-full shadow-md cursor-pointer"
                                    >
                                    <FaAnglesDown className="text-sm"/>
                                </button>
                            </div>
                        }

                        
                        {/* message input  */}
                        <div className="w-full flex gap-6 py-10 px-5 lg:px-8 bg-white ">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                id="firstMessage" 
                                onKeyDown={handleKeyPress}
                                placeholder='enter your message'
                                className=" min-h-16 max-h-16 resize-none flex-1 py-3 px-4 bg-gray-100 rounded-sm focus:placeholder:opacity-0 focus:outline-none placeholder:text-sm placeholder:font-medium"
                                rows={1}
                            /> 

                            <button onClick={handleMessage} disabled={status !== 'connected'} className="bg-primary disabled:bg-gray-400 text-white px-4 py-3 cursor-pointer rounded-sm">
                                <IoSend />
                            </button>
                        </div>


                    </div>

                </div>
            ) : (
                <div className="hidden w-full h-dvh lg:flex flex-col justify-center items-center">
                    <p className={` ${isAI && 'hidden'} my-auto h-full text-center text-base font-semibold text-gray-800`}>{chats.length < 1 ? 'Start a chat' : 'Open a Chat'}</p>
                </div>
            )}
        </div>
    )
}

export default ChatBox
