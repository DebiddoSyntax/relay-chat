"use client"
import ChatCard from './ChatCard'
import AddNewChat from './AddNewChat';
import { useEffect, useState } from 'react';
import { OverviewDataProps } from '@/src/functions/types/ChatType';
import api from '@/src/functions/auth/AxiosConfig';
import { useAuth } from '@/src/functions/auth/Store';
import { useChat } from '@/src/functions/chats/chatStore';
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface ChatOverviewProps{
    isGroup: boolean
    isAI: boolean
}


function ChatOverview({ isGroup, isAI }: ChatOverviewProps) {
    // auth states 
    const authInitialized = useAuth((state)=> state.authInitialized)
    const user = useAuth((state)=> state.user)

    // chat ui handlers 
    const setChatOpen = useChat((state)=> state.setChatOpen)
    const chatOpen = useChat((state)=> state.chatOpen)

    // private chats states 
    const privateChats = useChat((state)=> state.privateChats)
    const setPrivateChats = useChat((state)=> state.setPrivateChats)
    const activePrivateId = useChat((state)=> state.activePrivateId)
    const setActivePrivateId = useChat((state)=> state.setActivePrivateId)

    // group chats states 
    const groupChats = useChat((state)=> state.groupChats)
    const setGroupChats = useChat((state)=> state.setGroupChats)
    const activeGroupId = useChat((state)=> state.activeGroupId)
    const setActiveGroupId = useChat((state)=> state.setActiveGroupId)
    
    // ai chat state
    const aiChatId = useChat((state)=> state.aiChatId)
    const setAiChatId = useChat((state)=> state.setAiChatId)

    // handle current chat states 
    const chats = isGroup ? groupChats : privateChats
    const setChats = isGroup ? setGroupChats : setPrivateChats
    const activeId = isGroup ? activeGroupId : isAI ? aiChatId : activePrivateId
    const setActiveId = isGroup ? setActiveGroupId : isAI ? setAiChatId : setActivePrivateId
    
    // loading state and search string state
    const [loading, setLoading] = useState(true)
    const [searchQuery, setsearchQuery] = useState('')

    // fetch user chats effects 
    useEffect(()=> {
        const FetchConversations = async()=> {
            if(!authInitialized){
                console.log('not init')
                return
            }

            const fetchPath = isGroup ? '/groupchat/all/' : '/chat/all/'
            
            try{
                setLoading(true)
                const response = await api.get(`${fetchPath}`)
                console.log('chat overview', response.data)
                setChats(response.data)
            }catch(error){
                console.log('overview error', error)
            }finally{
                setLoading(false)
            }
        }

        FetchConversations()
    }, [authInitialized])

    
    // function that opens the selected chat 
    const handleChatOpen = (a: OverviewDataProps) => {
        setAiChatId(null)
        setActiveId(a.chat_id)
        setChatOpen(true)
    }


    // sort chats 
    const sortedChats = [...chats].sort(
        (a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
    );

    // get each chat name 
    const getChatName = (chat: OverviewDataProps): string => {
        if (isGroup) return chat?.chat_name || '';
        if (isAI) return 'Sydney AI';
        
        const otherUser = chat?.users?.find((u) => u.id !== user?.id);
        return `${otherUser?.firstname} ${otherUser?.lastname}`.trim() || otherUser?.email || '';
    };


    // Filter chats based on search query
    const filteredChats = sortedChats.filter((chat) => {
        const chatName = getChatName(chat);
        return chatName.toLowerCase().includes(searchQuery.toLowerCase());
    });


    return (
        <div className={`${chatOpen ? "hidden lg:flex lg:flex-col" : "flex flex-col "} w-full md:w-full lg:w-96 2xl:w-[420px] h-dvh overflow-hidden z-10 border-r-0 md:border-r-2 border-gray-300`}> 
            <div className='px-5 lg:px-6 2xl:px-8 pt-5 pb-5 md:pb-9 border-b-2 border-gray-300'>
                <div className='flex justify-between items-center'>
                    <p className='text-xl font-semibold'>
                        {isGroup ? 'Groups' : 'Chats'}
                    </p>

                    {/* start new chat  */}
                    <AddNewChat isGroup={isGroup} setActiveId ={setActiveId} />
                </div>
            </div>

            {/* search chat list  */}
            <div className='px-5 lg:px-6 2xl:px-8 py-8 border-b-2 border-gray-300'>
                <input 
                    type="text" 
                    placeholder='search' 
                    name="search" 
                    value={searchQuery}
                    onChange={(e)=> setsearchQuery(e.target.value)}
                    id="search" 
                    className='p-3 w-full border-2 border-gray-300 rounded-sm focus:placeholder:opacity-0 focus:outline-0'
                />
            </div>

            
            <div className="flex-1 flex flex-col w-full overflow-y-auto pb-20 md:pb-3">
                <div className="px-5 lg:px-6 2xl:px-8 pt-8 flex-1 overflow-y-auto w-full custom-scrollbar">
                    {filteredChats?.map((a, i)=> {
                        const chatName = getChatName(a);
                        const otherUser = a?.users?.find((u) => u.id !== user?.id);
                        const showImage = isGroup ? a.image_url : otherUser?.image_url;

                        return (
                            <div key={i} onClick={()=> handleChatOpen(a)}>
                                <ChatCard data={a} activeId={activeId} isAI={isAI} chatName ={chatName } showImage={showImage}/>
                            </div>
                        )}
                    )}
                    {loading && <AiOutlineLoading3Quarters className='mx-auto stroke-1 text-base text-center animate-spin'/>}
                    {filteredChats.length < 1 && !loading && <div className='text-base  text-center font-semibold'>No chat</div>}
                </div>
                
                
            </div>

        </div>
    )
}

export default ChatOverview
