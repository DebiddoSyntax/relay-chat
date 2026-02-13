"use client"
import { useAuth } from '@/src/functions/auth/Store'
import { useEffect, useState } from 'react';
import { FaUserCircle } from "react-icons/fa";
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { FiEdit } from "react-icons/fi";
import Upload from '../../profile/Upload';
import { useChat } from '@/src/functions/chats/chatStore';
import { IoMdCheckmark } from "react-icons/io";
import api from '@/src/functions/auth/AxiosConfig';
import axios from 'axios';



function GroupImage({ activeId }: { activeId: number | null}) {

    const [loading, setLoading] = useState(false)
    const groupChats = useChat((state)=> state.groupChats)
    const setGroupChats = useChat((state)=> state. setGroupChats)
    const [displayImage, setDisplayImage] = useState<string | undefined>('')
    const [errorMessage, setErrorMessage] = useState('')
	const [successMessage, setSuccessMessage] = useState('')
	const [check, setCheck] = useState(false)

    

    const currentChat = groupChats?.find(
        (c) => c.chat_id == activeId
    )

    const schema = yup.object({
        image_url: yup.string().required("Upload your image"),
    })


    type EditGroupImageType = yup.InferType<typeof schema>;


    const { register, handleSubmit, control, formState: { errors }, reset } = useForm<EditGroupImageType>({
        resolver: yupResolver(schema),
        defaultValues: { 
            image_url: currentChat?.image_url
        },
    });

    useEffect(() => {
        if (currentChat) {
            reset({ image_url: currentChat?.image_url });
        }
        setDisplayImage(currentChat?.image_url)
    }, [currentChat, reset]);


    const onSubmit = async(data: EditGroupImageType) =>{
        if(!activeId) {
            setErrorMessage('No id provided')
            return
        }

        const payload = {
            ...data,
            chat_id: activeId
        }

        try{
            setLoading(true)
            const res = await api.patch('/groupchat/image/', payload)
            console.log(res.data)
            setCheck(true)
            setGroupChats(prev => {
                const exists = prev.find(chat => chat.chat_id === res.data.chat_id);
                if (exists) {
                    return [{...exists, image_url: res.data.image_url}, ...prev.filter(chat => chat.chat_id !== res.data.chat_id)];
                }
                return prev;
            });

            setSuccessMessage(res.data.detail)
            setErrorMessage('')
        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error("error", err.response?.data);
                setErrorMessage(err.response?.data?.detail || "Something went wrong");
            } else {
                console.error("unexpected error", err);
                setErrorMessage("An unexpected error occurred");
            }
        }finally{
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className={`${errors.image_url?.message || successMessage || errorMessage ? 'items-start' : 'items-center'} mt-5 flex gap-3`}>
                {displayImage ?
                    <img src={displayImage} alt='user image' className='w-14 md:w-14 xl:w-20 h-14 md:h-14 xl:h-20 rounded-full' />
                : 
                    <FaUserCircle className='w-14 md:w-14 xl:w-20 h-14 md:h-14 xl:h-20 rounded-full' />
                }

                <div className=' flex flex-col items-start gap-1'> 
                    <div className='flex items-center gap-3 w-full'> 
                        <div className='h-full'>
                            <Controller
                                name="image_url"
                                control={control}
                                render={({ field }) => (
                                    <Upload 
                                        setDisplayImage={setDisplayImage}
                                        userImage={currentChat?.image_url}
                                        reset={reset}
                                        onSelect={(selected) => field.onChange(selected)}
                                    />
                                )}
                            />
                            <p className="text-red-700 text-sm mt-2">
                                {errors.image_url?.message && String(errors.image_url.message)}
                            </p>
                        </div>
                

                        {displayImage && 
                            <button type='submit'>
                                <IoMdCheckmark  className="text-2xl cursor-pointer mb-2" />
                            </button>
                        }
                    </div>
                    <div>
                        <p className="text-red-700 text-xs text-center mt-0">
                            {errors.image_url?.message ? String(errors.image_url.message) : errorMessage ? errorMessage : ''}
                        </p>
                        <p className="text-green-700 text-xs text-center mt-0">
                            {successMessage}
                        </p>
                    </div>
                </div>
            </div>
            
        </form>
    )
}

export default GroupImage
