import React from 'react'
import { FieldErrors, UseFormRegister } from 'react-hook-form'
import { loginType } from '../authpages/LoginPage'

function InputField({ register, errors, field }: { register: UseFormRegister<loginType>, errors: FieldErrors<loginType>, field: 'email' | 'password' }) {
    return (
        <div className="mb-5 mt-5 items-start text-left w-full">
            <label htmlFor="email" className="text-sm font-semibold  ">Email</label>
            <div className=" w-full p-3 border-0 mt-2 bg-gray-bg border-border rounded-md">
                <input autoComplete="off" type="email" id="email" placeholder='Enter your email'
                    className="w-full focus:outline-none focus:placeholder:opacity-0 placeholder:text-sm"
                    {...register(field)}
                />
            </div>
            <p className="text-red-700 text-sm mt-2">
                {errors.email?.message && String(errors.email.message)}
            </p>
        </div>
    )
}

export default InputField


{/* <InputField register={register} errors={errors} field={'email'} /> */}
