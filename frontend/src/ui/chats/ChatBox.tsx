"use client"
import { IoMdMore, IoIosArrowBack } from "react-icons/io";
import MessageCard from './MessageCard';
import { IoSend } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/src/functions/auth/Store";
import api from "@/src/functions/auth/AxiosConfig";
import { fetchAllMessages } from "@/src/ui/play/chats/fetchMessage";
import { useChat } from "@/src/functions/chats/chatStore";



export interface MessageType {
    id: number,
    sender_id: string,
    content: string,
    created_at: string,
    is_read: string, 
    chat: string,
    type: string,

}

function ChatBox() {

    const token = useAuth((state)=> state.accessToken)

    const activeId = useChat((state)=> state.activeId)
    const setActiveId = useChat((state)=> state.setActiveId)
    const chatName = useChat((state)=> state.chatName)
    const setChatOpen = useChat((state)=> state.setChatOpen)
    const chatOpen = useChat((state)=> state.chatOpen)
    const setLastMessage = useChat((state)=> state.setLastMessage)
    
    const socketRef = useRef<WebSocket | null>(null);
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [input, setInput] = useState("");
    const [status, setStatus] = useState("connecting");
    const [nextUrl, setNextUrl] = useState<string | null>(null);


    
    const fetchMessages = async() => {
        try{
            const response = await api.get(`/chat/${activeId}/messages/`)
            console.log('fetched mess', response.data)
            setNextUrl(response.data.next)
            setMessages(response.data.results.reverse())
        }catch(error){
            console.log('fetch messages', error)
        }
    }


    // handle scroll to load new messages 
    useEffect(()=> {
        if(!nextUrl){
            return
        }

        const fetchMore = async() => {
            const res = await api.get(`${nextUrl}`)
            console.log('more', res.data)
        }

        fetchMore()
    }, [nextUrl])

    

    
    useEffect(() => {
        if(!chatOpen){
            return
        }

        fetchMessages()
        
        const wsUrl = `ws://localhost:8000/ws/chat/${activeId}/?token=${token}`;
        const socket = new WebSocket(wsUrl);

        socketRef.current = socket;

        socket.onopen = () => {
            console.log("WebSocket connected");
            setStatus("connected");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "connection") {
                console.log("Connected:", data);
            }

            if (data.type === "message") {
                setMessages((prev) => [...prev, data]);

                // Send read receipt
                socket.send(
                    JSON.stringify({
                        type: "read",
                        message_id: data.id,
                    })
                );
            }

            if (data.type === "read") {
                console.log("Message read:", data);
            }

            if (data.type === "error") {
                console.error(data.error);
            }
        };

        socket.onclose = () => {
            console.log("WebSocket closed");
            setStatus("disconnected");
        };

        socket.onerror = (err) => {
            console.error("WebSocket error", err);
        };

        return () => socket.close();
    }, [activeId, token]);
    

    const sendMessage = () => {
        if (!input.trim()) return;

        socketRef.current?.send(
            JSON.stringify({
                type: "message",
                content: input,
                message_type: "text",
            })
        );

        setLastMessage(input)
        setInput("");
    };


    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
            
        }
    };



    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current && chatOpen) {
            containerRef.current.scrollTo({
                top: containerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [messages, chatOpen]);

    const handleBackButton = () => {
        setChatOpen(false);
        setActiveId(null)
    }



    return (
        <div  className={`flex-1 w-full h-screen bg-gray-100`}>
            {chatOpen ? (
                <div className={`${!chatOpen && "hidden lg:flex lg:flex-col justify-between"} flex-1 w-full h-screen bg-gray-100`}>
                    <div className='bg-white w-full px-5 lg:px-6 2xl:px-8 py-5 border-b-0 border-gray-300 shadow-sm'>
                        <div className='w-full flex gap-3 items-center'>
                            <IoIosArrowBack className='lg:hidden text-2xl cursor-pointer' onClick={handleBackButton} />

                            <div className='w-full flex justify-between items-center z-50'>
                                <div>
                                    <p className='text-lg font-semibold' onClick={()=>  console.log('mssgs', messages)}>
                                        {chatName}
                                    </p>

                                    <p className={`text-xs ${status == 'disconnected' && 'text-red-700'} text-green-700`}>{status}</p>
                                </div>

                                <IoMdMore className='text-2xl cursor-pointer'/>
                            </div>
                        </div>
                    </div>


                    <div className='relative flex-1 h-full w-full pb-80 md:pb-[220px]'>
                        <div ref={containerRef} className='relative flex-1 overflow-y-auto h-full w-full custom-scrollbar pb-5'>
                            {messages.map((m, i)=> (
                                <MessageCard key={i} m={m} />
                            ))}
                        </div>


                        <div className="w-full flex gap-6 py-10 px-5 lg:px-8 bg-white">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                autoComplete="off" 
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
                <div className="w-full h-full flex flex-col justify-center items-center">
                    <p className="text-center text-base font-semibold text-gray-800">Open a Chat</p>
                </div>
            )}
        </div>
    )
}

export default ChatBox
