import api from '@/src/functions/auth/AxiosConfig';
import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MembersType } from './GroupInfo';
import { useChat } from '@/src/functions/chats/chatStore';
import LoadingModal from '../../reusable/LoadingModal';
import axios from 'axios';

interface Props{
    activeId: number | null, 
    setMembers: Dispatch<SetStateAction<MembersType[]>>
    members: MembersType[]
    setGroupInfo: Dispatch<SetStateAction<boolean>>
}

function ViewMemebers({ activeId, setMembers, members, setGroupInfo }: Props) {
    const [loading, setLoading] = useState(false)
    const [delLoading, setDelLoading] = useState(false)
    const [delState, setDelState] = useState<"idle" | "loading" | "success" | "failure" | "confirm">("idle");
    const [errorMessage, setErrorMessage] = useState('')

    const groupChats = useChat((state)=> state.groupChats)
    const setChatOpen = useChat((state)=> state.setChatOpen)
    const setGroupChats = useChat((state)=> state.setGroupChats)
    

    const currentChat = groupChats?.find(
        (c) => c.chat_id == activeId
    )

    useEffect(()=> {
        const fetchMembers = async () => {
            if(!activeId) return
            try{
                setLoading(true)
                const response = await api.get(`/groupchat/${activeId}/members/`)
                // console.log(response.data)
                setMembers(response.data)
            } catch(e){
                console.log(e)
            }finally{
                setLoading(false)
            }
        }

        fetchMembers()
    }, [activeId])


    const sortedMembers = [...members].sort()


    // delete 
    const handleDeleteOrder = async() => {

        if(!activeId){
            setErrorMessage('no chat id')
            return
        } 

        try {
            setDelLoading(true)
            setDelState('loading')
            const response = await api.delete(`/groupchat/delete/${activeId}/`);
            // console.log(response);
            setDelState('success')
            setDelLoading(false);
            setGroupInfo(false)
            setChatOpen(false)
            setGroupChats(prev => {
                if (!prev) return [] 
                return [...prev.filter(chat => chat.chat_id !== response.data.chat_id)]
            })
            
        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error("error", err.response?.data?.message);
                setDelState('failure')
                setErrorMessage(err.response?.data?.message || "Something went wrong");
            } else {
                console.error("unexpected error", err);
                setDelState('failure')
                setErrorMessage("An unexpected error occurred");
            }
        }
    }

 
    
    const handleConfirm = () => {
        setDelState('confirm')
        setDelLoading(true)
    }

    return (
        <div className='mt-5 h-full'>
            <div className='h-96 flex overflow-hidden'>
                {loading ? (
                    <AiOutlineLoading3Quarters className='mx-auto stroke-1 text-xl text-center animate-spin'/>
                ): (
                    <div className='flex flex-col flex-1 overflow-y-auto pr-0 scrollbar-hide custom-scrollbar gap-3'>
                        <div className='grid grid-cols-1 gap-3'>
                            {sortedMembers?.map((m, i)=> (
                                <p key={i} className='text-sm font-semibold'>{m.email}</p>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        
            {currentChat?.my_role === 'admin' && 
                <div className='w-full h-full mt-5'>
                    <p className='text-center text-sm mb-3'>{errorMessage}</p>
                    <LoadingModal 
                        modalOpen={delLoading} 
                        setModalOpen={setDelLoading} 
                        modalState={delState} 
                        handleConfirm={handleConfirm} 
                        handleFetch={handleDeleteOrder}
                        FailedMessage={'Failed to delete group'}
                        LoadingMessage={'Deleting group...'}
                        SuccessMessage={'Group Deleted'}
                        ConfirmHeadingMessage={'Delete Group'}
                        ConfirmSubHMessage={'Are you sure you want to delete this group?'}
                        ButtonText={'Delete'}
                        ButtonTextColor={'text-white'}
                        ButtonColor={'bg-red-700'}
                        ButtonType={'button'}
                    />
                </div>
            }
        </div>
     
    )
}

export default ViewMemebers
