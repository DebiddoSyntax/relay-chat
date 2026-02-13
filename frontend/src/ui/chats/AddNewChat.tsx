"use client"
import axios from 'axios'
import { useState } from 'react'
import { PiNotePencilBold } from "react-icons/pi";
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { IoClose } from "react-icons/io5";
import { NewchatInputType } from '@/src/functions/types/ChatType';
import api from '@/src/functions/auth/AxiosConfig';
import { useChat } from '@/src/functions/chats/chatStore';
import { AiOutlineLoading3Quarters } from "react-icons/ai";



interface AddNewChatProps { 
    isGroup: boolean
    setActiveId: (val: number | null) => void
}


function AddNewChat({ isGroup, setActiveId }: AddNewChatProps ) {

    const setChatOpen = useChat((state)=> state.setChatOpen)
    const setPrivateChats = useChat((state)=> state.setPrivateChats)
    const setGroupChats = useChat((state)=> state.setGroupChats)
    const setChats = isGroup ? setGroupChats : setPrivateChats

    const [newChat, setNewChat] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')


    const schema = yup.object().shape({
        groupName: isGroup 
            ? yup.string().required("Enter a group name")
            : yup.string().notRequired().nullable(),
        receiver: yup.string().required("Who do you want to text?").email('Enter a valid email'),
        firstMessage: yup.string().required("Enter your message"),
    }) as yup.ObjectSchema<NewchatInputType>;

    
    const { register, handleSubmit, formState: { errors }, reset } = useForm<NewchatInputType>({
        resolver: yupResolver(schema)
    });


    const handleNewChat = async (data: NewchatInputType) => {
        
        try{
            setLoading(true)
            const fetchPath = isGroup ? '/groupchat/start/' : '/chat/start/'

            const response = await api.post(`${fetchPath}`, data)
            console.log('start chat', response.data)
            const newdata = response.data

            setChats(prev => {
                if (!prev) return [newdata] 

                const exists = prev.find(chat => chat.chat_id == newdata.chat_id)

                if (exists) {
                    return [newdata, ...prev.filter(chat => chat.chat_id !== newdata.chat_id)]
                }

                return [newdata, ...prev]
            })

            
            setActiveId(newdata.chat_id)
            reset()
            setChatOpen(true)
            setNewChat(false)
        } catch (err) {
			if (axios.isAxiosError(err)) {
				console.error("error", err.response?.data);
				setErrorMessage(err.response?.data?.detail || "Something went wrong");
			} else {
				console.error("unexpected error", err);
				setErrorMessage("An unexpected error occurred");

			}
		}finally{
            setLoading(false)
        }

    }



    // handle new chat toggle 
    const handleNewChatToggle = () => {
        setNewChat(true)
    }


    const closeModal = () => {
        setNewChat(false)
        reset()
        setErrorMessage("");
    }


    return (
        <div>
            
            <PiNotePencilBold className='text-2xl cursor-pointer' onClick={handleNewChatToggle} />

            {newChat && (
                <div className="fixed inset-0 flex bg-black/50 justify-center items-center z-50">
                    <div className={`flex flex-col relative w-96 md:w-[640px] h-auto m-auto bg-white py-3 md:py-4 lg:py-5 px-5 rounded-md overflow-hidden`}>
                        <div className='flex justify-between items-center'>
                            <p className={`text-lg font-semibold`}>
                                {isGroup ? 'Create new group' : 'Add new chat'}
                            </p>
                            <IoClose 
                                onClick={closeModal} 
                                className='text-xl cursor-pointer'
                            />
                        </div>

                  
                            <form onSubmit={handleSubmit(handleNewChat)} className=''>

                                {isGroup && (
                                    <div className="mb-5 mt-5 items-start text-left w-full">
                                        <label htmlFor="groupName" className="text-sm font-semibold">
                                            Group Name
                                        </label>
                                        <input autoComplete="off" type="text" id="groupName" placeholder='Enter a group name'
                                            className=" w-full p-3 bg-gray-100 mt-2 border-border-lower rounded-md focus:outline-none focus:placeholder:opacity-0 placeholder:text-sm"
                                            {...register('groupName')}
                                        />
                                        <p className="text-red-700 text-sm mt-2">
                                            {errors.groupName?.message && String(errors.groupName.message)}
                                        </p>
                                    </div>
                                )}


                                <div className="mb-5 mt-5 items-start text-left w-full">
                                    <label htmlFor="email" className="text-sm font-semibold">
                                        Email
                                    </label>
                                    <input autoComplete="off" type="text" id="email" placeholder='Enter an email'
                                        className=" w-full p-3 bg-gray-100 mt-2 border-border-lower rounded-md focus:outline-none focus:placeholder:opacity-0 placeholder:text-sm"
                                        {...register('receiver')}
                                    />
                                    <p className="text-red-700 text-sm mt-2">
                                        {errors.receiver?.message && String(errors.receiver.message)}
                                    </p>
                                </div>
                                

                                <div className="mb-5 mt-5 items-start text-left w-full">
                                    <label htmlFor="firstMessage" className="text-sm font-semibold">
                                        Message
                                    </label>
                                    
                                    <textarea
                                        autoComplete="off" 
                                        id="firstMessage" 
                                        placeholder='Enter your message'
                                        className=" min-h-16 max-h-16 resize-none w-full p-3 bg-gray-100 mt-2 rounded-md focus:outline-none focus:placeholder:opacity-0 placeholder:text-sm"
                                        rows={1}
                                        {...register('firstMessage')}
                                    /> 

                                    <p className="text-red-700 text-sm mt-2">
                                        {errors.firstMessage?.message && String(errors.firstMessage.message)}
                                    </p>
                                </div>

                                <p className="text-red-700 text-sm mt-2">
                                    {errorMessage}
                                </p>

                                <div className='mt-5 flex justify-end'>
                                    <button type="submit" className='bg-blue-700 py-3 px-5 w-40 text-white text-sm font-semibold rounded-md cursor-pointer'>
                                        {loading ? <AiOutlineLoading3Quarters className='mx-auto stroke-1 text-base text-center animate-spin'/> : 'Start'}
                                    </button>
                                </div>
                            </form>
                        
                    </div>
                </div>
            )}
        </div>
    )
}

export default AddNewChat
