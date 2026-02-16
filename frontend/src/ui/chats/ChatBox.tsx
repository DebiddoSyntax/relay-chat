"use client"
import api from "@/src/functions/auth/AxiosConfig";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/src/functions/auth/Store";
import { useChat } from "@/src/functions/chats/chatStore";
import { handlePrivateChatName } from "@/src/functions/chats/handlePrivateChatName";
import Call from "./call/Call"
import MessageCard from './MessageCard';
import GroupInfo from "./group/GroupInfo";
import { connectSocket } from "@/src/functions/chats/connectSocket";
import { AiFillInfoCircle } from "react-icons/ai";
import { RiChatSmileAiFill } from "react-icons/ri";
import { IoIosArrowBack } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { IoCheckmarkDoneCircle } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoSend } from "react-icons/io5";




export interface MessageType {
    id: number,
    sender_id: string,
    content: string,
    created_at: string,
    is_read: string, 
    chat: string,
    type: string,
}

interface ChatBoxProps{
    isGroup: boolean
    isAI: boolean
}




function ChatBox({ isGroup, isAI }: ChatBoxProps) {
    // token state
    const token = useAuth((state)=> state.accessToken)

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
    const updateLastMessage = useChat((state) => state.updateLastMessage)
    const resetUnread = useChat((state) => state.resetUnread)
    
    // socket states 
    const socketRef = useRef<WebSocket | null>(null);
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [input, setInput] = useState("");
    const [aiTyping, setAiTyping] = useState(false);
    const [status, setStatus] = useState("connecting");
    const [nextUrl, setNextUrl] = useState<string | null>(null);

    // scroll refs 
    const containerRef = useRef<HTMLDivElement>(null);
    const shouldScrollRef = useRef(true);
    
    // fetch messages states 
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [loadingMore, setLoadingMore] = useState(false);
    const [audioSet, setAudioSet] = useState<boolean | null>(null);
    const [errorMore, setErrorMore] = useState("")
    
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
    
    // set chat name
    const otherUser = handlePrivateChatName(isGroup, chat)
    const chatName = isGroup ? chat?.chat_name : isAI ? 'Sydney AI' : otherUser?.name

    // set current chat type 
    const type = isGroup ? 'group' : 'private'


    // fetch chat messages 
    const fetchMessages = async() => {
        try{
            setLoading(true)
            const response = await api.get(`/chat/${activeId}/messages/`)
            // console.log('fetched mess', response.data)
            setNextUrl(response.data.next)
            setMessages(response.data.results)
            resetUnread(type, activeId)
            setError('')
        }catch(err){
            if (axios.isAxiosError(err)) {
                console.error("error", err.response?.data);
                setError('Failed to load messages')
            } else {
                console.error("unexpected error", err);
                setError('An unexpected error occurred')
            }
        }finally{
            setLoading(false)
        }
    }



    // fetch more chat messages
    const fetchMoreMessages = async () => {
        if (!nextUrl || loadingMore) return;

        const container = containerRef.current;
        const previousHeight = container?.scrollHeight || 0;
        
        try{
            setLoadingMore(true);
            const res = await api.get(nextUrl);
            // console.log('fetched more messages', res.data)
            setMessages(prev => [...res.data.results, ...prev,]);
            setNextUrl(res.data.next);
            setErrorMore('')
        }catch(err){
            if (axios.isAxiosError(err)) {
                console.error("error", err.response?.data);
                setErrorMore('Failed to load more messages')
            } else {
                console.error("unexpected error", err);
                setErrorMore('An unexpected error occurred')
            }
        }finally{
            setLoadingMore(false);
            shouldScrollRef.current = false;
        }

        requestAnimationFrame(() => {
            if (container) {
                container.scrollTop = container.scrollHeight - previousHeight;
            }
        });

        setLoadingMore(false);
    };



    useEffect(() => {
        if (containerRef.current && chatOpen && shouldScrollRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages, aiTyping]);


    // handle scroll position 
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !nextUrl) return;

        const handleScroll = () => {
            if (container.scrollTop === 0) {
                fetchMoreMessages();
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [nextUrl, activeId]);



    const socketURL = process.env.NEXT_PUBLIC_BASE_SOCKET_URL

    // ====== handle web socket connections =====
    useEffect(() => {
        if(!chatOpen || !activeId)return 

        fetchMessages()
        
        const wsUrl = `${socketURL}/chat/${activeId}/?token=${token}`;
        const socket = new WebSocket(wsUrl);

        socketRef.current = socket;

        socket.onopen = () => {
            setStatus("connected");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "typing" && data.user === "ai") {
                setAiTyping(data.typing);
            }

            if (data.type === "message") {
                setAiTyping(false)
                shouldScrollRef.current = true;
                setMessages((prev) => [...prev, data]);

                if (!data.meta?.ephemeral) {
                    socket.send(
                        JSON.stringify({
                            type: "read",
                            message_id: data.id,
                        })
                    );
                }
            }
        };

        socket.onclose = () => {
            setStatus("disconnected");
        };

        socket.onerror = (err) => {
            console.error("WebSocket error", err);
        };

        return () => socket.close();
    }, [activeId, token, chatOpen]);
    

    // send message function 
    const sendMessage = () => {
        if (!input.trim()) return;

        socketRef.current?.send(
            JSON.stringify({
                type: "message",
                content: input,
                message_type: "text",
            })
        );

        updateLastMessage(type, activeId!, input, new Date().toISOString())

        setInput("");
    };

    // enter to send message 
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // sorted messages 
    const sortedMessages = [...messages].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    // immage states 
    const ImageSrc = isGroup ? chat?.image_url : otherUser?.image_url
    const IconDisplay = isAI ? RiChatSmileAiFill : FaUserCircle
    const [canShowImage, setCanShowImage] = useState(false);

    // set image 
    useEffect(() => {
        if (!ImageSrc) {
            setCanShowImage(false);
            return;
        }

        const img = new window.Image();
        img.src = ImageSrc;

        img.onload = () => setCanShowImage(true);
        img.onerror = () => setCanShowImage(false);

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [ImageSrc]);


    // group info 
    const toggleGroupInfo = () => {
        setGroupInfo(!groupInfo)
    }


    return (
        <div  className={`flex-1 w-full h-screen bg-gray-100`}>
            {chatOpen ? (
                <div className={`${!chatOpen && "hidden lg:flex lg:flex-col justify-between"} flex-1 w-full h-screen bg-gray-100`}>
                    {/* top bar */}
                    <div className='bg-white w-full px-5 lg:px-6 2xl:px-8 py-5 border-b-0 border-gray-300 shadow-lg z-20'>
                        <div className='w-full flex gap-3 items-center'>
                            {!isAI && <IoIosArrowBack className='lg:hidden text-2xl cursor-pointer' onClick={handleBackButton} />}

                            <div className='w-full flex justify-between items-center z-20'>
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
                                            {isAI &&  <IoCheckmarkDoneCircle className='text-blue-700' />}
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


                    <div className='relative flex-1 h-full w-full pb-[380px] sm:pb-80 md:pb-[220px]'>
                        {/* messages  */}
                        <div ref={containerRef} className='relative flex-1 overflow-y-auto h-full w-full custom-scrollbar pt-10 pb-5'>
                            {errorMore && 
                                <div className="text-red-700 text-sm font-semibold text-center">
                                    {errorMore} 
                                    <p className="text-blue-700 text-sm text-center cursor-pointer" onClick={fetchMoreMessages}>retry</p>  
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
                                        <MessageCard m={m} />
                                        
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
                                    <p className="text-blue-700 text-sm text-center cursor-pointer" onClick={fetchMessages}>retry</p>  
                                </div>
                            }
                        </div>

                        
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

                            <button onClick={sendMessage} className="bg-blue-700 text-white px-4 py-3 cursor-pointer rounded-sm">
                                <IoSend />
                            </button>
                        </div>


                    </div>

                </div>
            ) : (
                <div className="hidden w-full h-full md:flex flex-col justify-center items-center">
                    <p className={` ${isAI && 'hidden'} text-center text-base font-semibold text-gray-800`}>{chats.length < 1 ? 'Start a chat' : 'Open a Chat'}</p>
                </div>
            )}
        </div>
    )
}

export default ChatBox
