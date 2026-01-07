"use client"
import ChatCard from './ChatCard'
import AddNewChat from './AddNewChat';
import { useEffect, useState } from 'react';
import { OverviewDataProps } from '@/src/functions/types/ChatType';
import api from '@/src/functions/auth/AxiosConfig';
import { useAuth } from '@/src/functions/auth/Store';

interface ChatOverviewProps{
    chatOpen: boolean
    setChatOpen: (val:boolean)=> void
    activeId: number | null, 
    setActiveId: (val: number)=> void
}


function ChatOverview({ chatOpen, setChatOpen, activeId, setActiveId }: ChatOverviewProps) {

    const [overviewData, setOverviewData] = useState<null | OverviewDataProps[]>(null)
    const logout = useAuth((state)=> state.logout)
    const authInitialized = useAuth((state)=> state.authInitialized)
    // const refreshToken = useAuth((state)=> state.refreshAccessToken)

    useEffect(()=> {
        const FetchConversations = async()=> {
            if(!authInitialized){
                console.log('not init')
                return
            }
            
            console.log('init')
            try{
                const response = await api.get('/chat/all/')
                console.log(response.data)
                setOverviewData(response.data)
            }catch(error){
                console.log('overview error', error)
            }
        }

        FetchConversations()
    }, [authInitialized])

    

    const handleChatOpen = (id: number) =>{
        setActiveId(id)
        setChatOpen(true)
    }

    const handleLogout = () => {
        logout()
    }

    // const handleRefresh = () => {
    //     refreshToken()
    // }

    return (
        <div className={`${chatOpen ? "hidden lg:flex lg:flex-col" : "flex flex-col "} w-full md:w-full lg:w-96 2xl:w-[420px] h-screen z-20 border-b-2 md:border-b-0 border-r-0 md:border-r-2 border-gray-300`}> 
            <div className='px-5 lg:px-6 2xl:px-8 pt-5 pb-5 md:pb-9 border-b-2 border-gray-300'>
                <div className='flex justify-between items-center'>
                    <p className='text-xl font-semibold'>
                        Chats
                    </p>

                    <AddNewChat setOverviewData={setOverviewData} setActiveId={setActiveId} />
                </div>
            </div>

            <div className='px-5 lg:px-6 2xl:px-8 py-8 border-b-2 border-gray-300'>
                <input 
                    type="text" 
                    placeholder='search' 
                    name="search" 
                    id="search" 
                    className='p-3 w-full border-2 border-gray-300 rounded-sm focus:placeholder:opacity-0 focus:outline-0'
                />
            </div>

            <div className="flex-1 flex flex-col w-full overflow-y-auto pb-20 md:pb-3">
                <div className="px-5 lg:px-6 2xl:px-8 pt-8 flex-1 overflow-y-auto w-full custom-scrollbar">
                    {overviewData?.map((a, i)=> (
                        <div key={i} onClick={()=> handleChatOpen(a.chat_id)}>
                            <ChatCard data={a} activeId={activeId}/>
                        </div>
                    ))}
                </div>
                
                <div className=''>
                    <p onClick={handleLogout}>logout</p>
                    {/* <p onClick={handleRefresh}>refresh Token</p> */}
                </div>
            </div>

        </div>
    )
}

export default ChatOverview
