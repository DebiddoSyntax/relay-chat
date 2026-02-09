"use client"
import { useAuth } from '@/src/functions/auth/Store'
import { useEffect, useState } from 'react';
import { FaUserCircle } from "react-icons/fa";
import { useForm, Controller } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { FiEdit } from "react-icons/fi";
import Upload from './Upload';
import api from '@/src/functions/auth/AxiosConfig';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
// import { Toaster, toast } from "react-hot-toast";
import ToastMessage from '../reusable/ToastMessage';
import axios from 'axios';



export type ToastType = {
    type: "success" | "failure" | 'none'
    show: boolean
    message: string
} | null


function ProfileDetails() {
    const user = useAuth((state)=> state.user)
    const setUser = useAuth((state)=> state.setUser)

    const [displayImage, setDisplayImage] = useState<string | undefined>('')
    const [editProfile, setEditProfile] = useState(false)
    const [toast, setToast] = useState<ToastType>(null)
    const [loading, setLoading] = useState(false)
    
    
    const schema = yup.object({
        firstname: yup.string().required("Enter your firstname"),
        lastname: yup.string().required("Enter your lastname"),
        email: yup.string().required("Enter your email").email("Please enter a valid email"),
        image_url: yup.string().required("Upload your image"),
    })


    type EditProfileType = yup.InferType<typeof schema>;


    const { register, handleSubmit, control, formState: { errors }, reset } = useForm<EditProfileType>({
        resolver: yupResolver(schema),
        defaultValues: { 
            email: user?.email, 
            firstname: user?.firstname,
            lastname: user?.lastname,
            image_url: user?.image_url
        },
    });




    useEffect(() => {
        if (user) {
            reset({ firstname: user.firstname, lastname: user.lastname, email: user.email, image_url: user?.image_url });
        }
        setDisplayImage(user?.image_url)
    }, [user, reset]);



    const onSubmit = async(data: EditProfileType) =>{
        console.log(data)

        try{
            setLoading(true)
            const res = await api.patch('auth/user/update/', data)
            console.log(res.data)
            setUser(res.data.user)
            setEditProfile(false)
            setToast({type: 'success', show: true, message: 'Profile updated successfully'})
        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error("error", err.response?.data);
                setToast({type: 'failure', show: true, message: err.response?.data?.detail || 'Failed to update profile'})
            } else {
                console.error("unexpected error", err);
                setToast({type: 'failure', show: true, message: 'An unexpected error occurred'})
            }
            
        }finally{
            setLoading(false)
        }
    }



    return (
        <form onSubmit={handleSubmit(onSubmit)} className="">
            {toast?.show && (
                <ToastMessage
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({type: 'none', show: false, message: ''})}
                />
            )}

            <div className="">
                <h5 className="text-base md:text-lg xl:text-xl font-bold px-5 md:px-10">Profile</h5>
            </div>

            <div className='mt-5 flex flex-col sm:flex-row gap-6 justify-between items-start md:items-center px-5 md:px-10 '>
                <div className='flex gap-2 lg:gap-4 items-center'>
                    {displayImage ?
                        <img src={displayImage} alt='user image' className='w-14 md:w-14 xl:w-20 h-14 md:h-14 xl:h-20 rounded-full' />
                    : 
                        <FaUserCircle className='w-14 md:w-14 xl:w-20 h-14 md:h-14 xl:h-20 rounded-full' />
                    }

                    {!editProfile && (
                        <div className='flex flex-col gap-1 lg:gap-2'>
                            <p className='text-base md:text-lg font-semibold'>{user?.firstname  || "Not Available"} {user?.lastname  || "Not Available"}</p>
                            <p className='text-sm'>{user?.email  || "Not Available"}</p>
                        </div>
                    )}
                    
                    {editProfile && (
                        <div className='h-full'>
                            <Controller
                                name="image_url"
                                control={control}
                                render={({ field }) => (
                                    <Upload 
                                        setDisplayImage={setDisplayImage}
                                        userImage={user?.image_url}
                                        onSelect={(selected) => field.onChange(selected)}
                                    />
                                )}
                            />
                            <p className="text-red-700 text-sm mt-2">
                                {errors.image_url?.message && String(errors.image_url.message)}
                            </p>
                        </div>
                    )}
                </div>


                {!editProfile && (
                    <div className='flex gap-2 items-center justify-center text-sm py-2 px-5 border-2 border-gray-200 rounded-4xl w-40 cursor-pointer' onClick={()=> setEditProfile(true)}>
                        <FiEdit />
                        <p>Edit Profile</p>
                    </div>
                )}

                {editProfile && (
                    <div className='flex gap-2 items-center'>
                        <div className='text-sm font-medium py-2 px-5 border-2 border-gray-200 rounded-4xl w-auto cursor-pointer' onClick={()=> setEditProfile(false)}>
                            <p>cancel</p>
                        </div>
                        <button type="submit" disabled={loading} className='text-sm text-white font-medium py-2 px-5 w-40 bg-black border-2 border-gray-200 rounded-4xl cursor-pointer'>
                            {loading ? <AiOutlineLoading3Quarters className='mx-auto stroke-1 text-base text-center animate-spin'/> : 'Save changes'} 
                        </button>
                    </div>
                )}
            </div>

            <div className="">
                <div className="mt-6 grid grid-cols-2 md:grid-cols-2 gap-6 items-start text-left w-full px-5 md:px-10">
                    <div className="mt-0">
                        <label htmlFor='firstname' className="text-sm font-semibold">First Name</label>
                        {!editProfile && (
                            <p className="w-full mt-2 px-3 py-3  bg-[#f2f2f2] rounded-md text-sm md:text-sm font-medium">
                                {user?.firstname  || "Not Available"}
                            </p>
                        )}
                        {editProfile && (
                            <>
                                <input autoComplete="off" type="firstname" id="firstname" placeholder='Enter your firstname'
                                    className="w-full mt-2 px-3 py-3  bg-[#f2f2f2] rounded-md text-sm md:text-sm font-medium focus:outline-none focus:placeholder:opacity-0 placeholder:text-xs"
                                    {...register('firstname')}
                                />
                                <p className="text-red-700 text-sm mt-0">
                                    {errors.firstname?.message && String(errors.firstname.message)}
                                </p>
                            </>
                        )}
                    </div>

                    <div className="mt-0">
                        <label htmlFor='lastname' className="text-sm font-semibold">Last Name</label>
                        {!editProfile && (
                            <p className="w-full mt-2 px-3 py-3  bg-[#f2f2f2] rounded-md text-sm md:text-sm font-medium">
                                {user?.lastname  || "Not Available"}
                            </p>
                        )}
                        {editProfile && (
                            <>
                                <input autoComplete="off" type="lastname" id="lastname" placeholder='Enter your lastname'
                                    className="w-full mt-2 px-3 py-3  bg-[#f2f2f2] rounded-md text-sm md:text-sm font-medium focus:outline-none focus:placeholder:opacity-0 placeholder:text-sm"
                                    {...register('lastname')}
                                />
                                <p className="text-red-700 text-sm mt-0">
                                    {errors.lastname?.message && String(errors.lastname.message)}
                                </p>
                            </>
                        )}
                    </div>

                    <div className="mt-0">
                        <label htmlFor='email' className="text-sm font-semibold">Email</label>
                        {!editProfile && (
                            <p className="w-full mt-2 px-3 py-3  bg-[#f2f2f2] rounded-md text-sm md:text-sm font-medium">
                                {user?.email  || "Not Available"}
                            </p>
                        )}
                        {editProfile && (
                            <>
                                <input autoComplete="off" type="firstname" id="firstname" placeholder='Enter your email'
                                    className="w-full mt-2 px-3 py-3  bg-[#f2f2f2] rounded-md text-sm md:text-sm font-medium focus:outline-none focus:placeholder:opacity-0 placeholder:text-sm"
                                    {...register('email')}
                                />
                                <p className="text-red-700 text-sm mt-0">
                                    {errors.email?.message && String(errors.email.message)}
                                </p>
                            </>
                        )}
                    </div>
                </div>

            </div>


        </form>
    )
}

export default ProfileDetails
