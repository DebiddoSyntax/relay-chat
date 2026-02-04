"use client"
import { useState, useReducer } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"

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

    const [state, dispatch] = useReducer(ToggleReducer, initialState);

    const schema = yup.object({
        password: yup.string().required("Enter your current password").min(6, "Password must be at least 6 characters"),
        newPassword: yup.string().required("Enter your new password").min(6, "Password must be at least 6 characters"),
        confirmNewPassword: yup.string().required("Enter your new password").min(6, "Password must be at least 6 characters"),
    })

    type SecurityType = yup.InferType<typeof schema>;

    const { register, handleSubmit, formState: { errors } } = useForm<SecurityType>({
        resolver: yupResolver(schema),
    });

    const toggle = (field: keyof typeof initialState) => dispatch({ type: "TOGGLE", field });
    
    const onSubmit = (data: SecurityType) => {
        console.log(data)
    }


    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mt-10 w-full px-5 md:px-10 border-t-2 border-gray-100 pt-10">
                <h5 className="text-base md:text-lg xl:text-xl font-bold">Security</h5>

                <div className="mt-5 grid grid-cols-2 gap-6 items-center text-left w-full">

                    <div className="w-full">
                        <label htmlFor="password" className="text-sm font-semibold">Current Password</label>
                        <div className='flex justify-between items-center w-full mt-2 p-3 bg-[#f2f2f2] rounded-md'>
                            <input type={state.passwordToggle ? "text" : "password"}
                                id="password"
                                placeholder='Enter a unique password'
                                className=" w-full focus:outline-0 focus:border-0 focus:placeholder:opacity-0 placeholder:text-sm md:placeholder:text-sm"
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
                                className=" w-full focus:outline-0 focus:border-0 focus:placeholder:opacity-0 placeholder:text-sm md:placeholder:text-sm"
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


                    <div className="w-full">
                        <label htmlFor="confirmNewPassword" className="text-sm font-semibold">Confirm New Password</label>
                        <div className='flex justify-between items-center w-full mt-2 p-3 bg-[#f2f2f2] rounded-md'>
                            <input type={state.confirmNewPasswordToggle ? "text" : "password"}
                                id="confirmNewPassword"
                                placeholder='Enter a unique password'
                                className=" w-full focus:outline-0 focus:border-0 focus:placeholder:opacity-0 placeholder:text-sm md:placeholder:text-sm"
                                {...register('confirmNewPassword')}
                            />

                            <span onClick={()=> toggle("confirmNewPasswordToggle")} className='hover:cursor-pointer'>
                                {state.confirmNewPasswordToggle ? <FaEyeSlash /> : <FaEye/>}
                            </span>
                        </div>
                        <p className="text-red-700 text-sm mt-2">
                            {errors.confirmNewPassword?.message && String(errors.confirmNewPassword.message)}
                        </p>
                    </div>
                
                </div>
            </div>

            <div className="flex justify-end items-center mt-6 px-5 md:px-10">
                <button type="submit" className={`px-5 py-4 bg-blue-700 text-white rounded-md text-sm font-semibold cursor-pointer`}>
                    Save new password
                </button>
            </div>
        </form>
    )
}

export default Security
