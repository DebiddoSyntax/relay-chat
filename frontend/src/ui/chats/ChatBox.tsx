"use client"
import { IoMdMore, IoIosArrowBack } from "react-icons/io";
import MessageCard from './MessageCard';
import { IoSend } from "react-icons/io5";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/src/functions/auth/Store";
import api from "@/src/functions/auth/AxiosConfig";
import { fetchAllMessages } from "@/src/ui/play/chats/fetchMessage";


interface ChatBoxProps{
    chatOpen: boolean
    setChatOpen: (val:boolean)=> void
    activeId: number | null
    setActiveId: (val: number)=> void
}

export interface MessageType {
    id: number,
    sender_id: string,
    content: string,
    created_at: string,
    is_read: string, 
    chat: string,
    type: string,

}

function ChatBox({ chatOpen, setChatOpen, activeId, setActiveId }: ChatBoxProps) {

    const token = useAuth((state)=> state.accessToken)
    
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



    return (
        <div  className={`flex flex-col w-full h-screen bg-gray-100`}>
            {chatOpen ? (
                <div className={`${!chatOpen && "hidden lg:flex lg:flex-col"} flex-1 w-full bg-gray-100`}>
                    <div className='bg-white w-full px-5 lg:px-6 2xl:px-8 py-5 border-b-0 border-gray-300 shadow-sm'>
                        <div className='w-full flex gap-3 items-center'>
                            <IoIosArrowBack className='lg:hidden text-2xl cursor-pointer' onClick={()=> setChatOpen(false)} />

                            <div className='w-full flex justify-between items-center z-50'>
                                <div>
                                    <p className='text-lg font-semibold' onClick={()=>  console.log('mssgs', messages)}>
                                        David Michael
                                    </p>

                                    <p className={`text-xs ${status == 'disconnected' && 'text-red-700'} text-green-700`}>{status}</p>
                                </div>

                                <IoMdMore className='text-2xl cursor-pointer'/>
                            </div>
                        </div>
                    </div>


                    <div className='relative flex-1 h-screen w-full pb-80 md:pb-64'>
                        <div ref={containerRef} className='relative flex-1 overflow-y-auto h-full w-full custom-scrollbar pb-5'>
                            {messages.map((m, i)=> (
                                <MessageCard key={i} m={m} />
                            ))}
                        </div>


                        <div className="sticky bottom-0 w-full flex gap-6 py-10 px-5 lg:px-8 bg-white">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                autoComplete="off" 
                                id="firstMessage" 
                                onKeyDown={handleKeyPress}
                                placeholder='enter your message'
                                className=" min-h-5 max-h-[120px] flex-1 py-3 px-4 bg-gray-100 rounded-sm focus:placeholder:opacity-0 focus:outline-none placeholder:text-sm placeholder:font-medium"
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
