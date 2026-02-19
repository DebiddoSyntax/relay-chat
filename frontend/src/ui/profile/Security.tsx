"use client"
import { useState, useReducer, useEffect } from 'react';
import api from '@/src/functions/auth/AxiosConfig';
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from 'axios';
import { ToastType } from './ProfileDetails';
import ToastMessage from '../reusable/ToastMessage';
import { useAuth } from '@/src/functions/auth/Store';


type ActionType =
  | { type: "TOGGLE"; field: keyof StateDataType }
  | { type: "RESET" };


interface StateDataType {
    passwordToggle: boolean
    newPasswordToggle: boolean
    confirmNewPasswordToggle: boolean
};

const initialState: StateDataType = {
    passwordToggle: false,
    newPasswordToggle: false,
    confirmNewPasswordToggle: false,
};

function ToggleReducer(state: StateDataType, action: ActionType) {
    switch (action.type) {
        case "TOGGLE":
            return { ...state, [action.field]: !state[action.field] };
        case "RESET":
            return {...initialState};
        default:
            return state;
    }
}




function Security() {

    const logout = useAuth((state)=> state.logout)
    const [state, dispatch] = useReducer(ToggleReducer, initialState);
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState<ToastType>(null)
    
    const toggle = (field: keyof typeof initialState) => dispatch({ type: "TOGGLE", field });

    const schema = yup.object({
        password: yup.string().required("Enter your current password").min(6, "Password must be at least 6 characters"),
        newPassword: yup.string().required("Enter your new password").min(6, "Password must be at least 6 characters"),
    })

    type SecurityType = yup.InferType<typeof schema>;

    const { register, handleSubmit, formState: { errors }, getValues } = useForm<SecurityType>({
        resolver: yupResolver(schema),
    });


    const onSubmit = async(data: SecurityType) => {
        
        console.log(data)

        try{
            setLoading(true)
            const res = await api.post('/auth/password/update/', data)
            console.log(res.data)
            setToast({type: 'success', show: true, message: 'Password updated successfully'})
        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error("error", err.response?.data);
                setToast({type: 'failure', show: true, message: err.response?.data?.detail || 'Failed to set new password'})
			} else {
                console.error("unexpected error", err);
                setToast({type: 'failure', show: true, message: 'An unexpected error occurred'})
			}
		}finally{
            setLoading(false)
        }
    }


    const handleLogout = () => {
        logout()
    }


    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            {toast?.show && (
                <ToastMessage
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast({type: 'none', show: false, message: ''})}
                />
            )}

            <div className="mt-5 md:mt-20 w-full px-5 md:px-10 border-t-2 border-gray-100 pt-10">
                <h5 className="text-base md:text-lg xl:text-xl font-bold">Security</h5>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-start text-left w-full">

                    <div className="w-full">
                        <label htmlFor="password" className="text-sm font-semibold">Current Password</label>
                        <div className='flex justify-between items-center w-full mt-2 p-3 bg-[#f2f2f2] rounded-md'>
                            <input type={state.passwordToggle ? "text" : "password"}
                                id="password"
                                placeholder='Enter a unique password'
                                className=" w-full focus:outline-0 focus:border-0 focus:placeholder:opacity-0 placeholder:text-sm md:placeholder:text-xs"
                                {...register('password')}
                            />

                            <span onClick={()=> toggle("passwordToggle")} className='hover:cursor-pointer'>
                                {state.passwordToggle ? <FaEyeSlash /> : <FaEye/>}
                            </span>
                        </div>
                        <p className="text-red-700 text-sm mt-2">
                            {errors.password?.message && String(errors.password.message)}
                        </p>
                    </div>


                    <div className="w-full">
                        <label htmlFor="newPassword" className="text-sm font-semibold">New Password</label>
                        <div className='flex justify-between items-center w-full mt-2 p-3 bg-[#f2f2f2] rounded-md'>
                            <input type={state.newPasswordToggle ? "text" : "password"}
                                id="newPassword"
                                placeholder='Enter a unique password'
                                className=" w-full focus:outline-0 focus:border-0 focus:placeholder:opacity-0 placeholder:text-sm md:placeholder:text-xs"
                                {...register('newPassword')}
                            />

                            <span onClick={()=> toggle("newPasswordToggle")} className='hover:cursor-pointer'>
                                {state.newPasswordToggle ? <FaEyeSlash /> : <FaEye/>}
                            </span>
                        </div>
                        <p className="text-red-700 text-sm mt-2">
                            {errors.newPassword?.message && String(errors.newPassword.message)}
                        </p>
                    </div>
                
                </div>
            </div>

            <div className="flex justify-end gap-3 items-center mt-14 px-5 md:px-10">
                <button type="button" className="px-5 py-4 w-40 bg-red-600 text-white rounded-md text-xs font-semibold cursor-pointer" onClick={handleLogout}>
                    Log Out
                </button> 

                <button type="submit" disabled={loading} className={`px-5 py-4 w-40 bg-primary text-white rounded-md text-xs font-semibold cursor-pointer`}>
                    {loading ? <AiOutlineLoading3Quarters className='mx-auto stroke-1 text-base text-center animate-spin'/> : 'Change password'} 
                </button>
            </div>
        </form>
    )
}

export default Security
