"use client"
import axios from 'axios'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { PiNotePencilBold } from "react-icons/pi";
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { IoClose } from "react-icons/io5";
import { NewchatInputType, OverviewDataProps } from '@/src/functions/types/ChatType';



interface AddNewChatProps { 
    setOverviewData: Dispatch<SetStateAction<OverviewDataProps[] | null>>
    setActiveId: (val: number)=> void
}


function AddNewChat({ setOverviewData, setActiveId }: AddNewChatProps ) {


    const [newChat, setNewChat] = useState(false)

    const schema = yup.object({
        email: yup.string().required("Who do you want to text?").email('Enter a valid email'),
        firstMessage: yup.string().required("Enter your message"),
    })

    const { register, handleSubmit, formState: { errors } } = useForm<NewchatInputType>({
        resolver: yupResolver(schema),
    });

    const handleCall = async (data: NewchatInputType) => {
        console.log(data)
        const newdata = { active: true, lastmessage: data.firstMessage, sender: 'user', receiver: 'David Michael', timeStamp: '20mins', id: 100 }
        
        setOverviewData((prev) => {
            return prev ? [newdata, ...prev] : prev
        })

        setNewChat(false)

        setActiveId(newdata.id)

    }


    return (
        <div>
            
            <PiNotePencilBold className='text-2xl cursor-pointer' onClick={()=> setNewChat(true)}/>

            {newChat && (
                <div className="fixed inset-0 flex bg-black/50 justify-center items-center z-50">
                    <div className={`flex flex-col relative w-96 md:w-[640px] h-auto m-auto bg-white py-3 md:py-4 lg:py-5 px-5 rounded-md overflow-hidden`}>
                        <div className='flex justify-between items-center'>
                            <p className='text-lg font-semibold'>
                                Add new chat
                            </p>
                            <IoClose 
                                onClick={()=> setNewChat(false)} 
                                className='text-xl cursor-pointer'
                            />
                        </div>

                        <form onSubmit={handleSubmit(handleCall)} className=''>
                            <div className="mb-5 mt-5 items-start text-left w-full">
                                <label htmlFor="email" className="text-sm font-semibold">
                                    Email
                                </label>
                                <input autoComplete="off" type="text" id="email" placeholder='Enter an email'
                                    className=" w-full p-3 bg-gray-100 mt-2 border-border-lower rounded-md focus:outline-none focus:placeholder:opacity-0 placeholder:text-sm"
                                    {...register('email')}
                                />
                                <p className="text-red-700 text-sm mt-2">
                                    {errors.email?.message && String(errors.email.message)}
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
                                    className=" min-h-5 max-h-[120px] w-full p-3 bg-gray-100 mt-2 rounded-md focus:outline-none focus:placeholder:opacity-0 placeholder:text-sm"
                                    rows={1}
                                    {...register('firstMessage')}
                                /> 
                                <p className="text-red-700 text-sm mt-2">
                                    {errors.firstMessage?.message && String(errors.firstMessage.message)}
                                </p>
                            </div>

                            <div className='mt-5 flex justify-end'>
                                <button type="submit" className='bg-blue-700 py-3 px-5 w-40 text-white text-sm font-semibold rounded-md cursor-pointer'>
                                    Start
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
