'use client'
import { useReducer, useRef, useState } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter, useSearchParams } from 'next/navigation';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import api from '@/src/functions/auth/AxiosConfig';
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"

const apiURL = process.env.NEXT_PUBLIC_BASE_API_URL

type ActionType =
  | { type: "TOGGLE"; field: keyof StateDataType }
  | { type: "RESET" };


interface StateDataType {
    passwordToggle: boolean
    confirmPasswordToggle: boolean
};

const initialState: StateDataType = {
    passwordToggle: false,
    confirmPasswordToggle: false,
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

function SetPassword() {
    const router = useRouter()
	const [state, dispatch] = useReducer(ToggleReducer, initialState);
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	
	const toggle = (field: keyof typeof initialState) => dispatch({ type: "TOGGLE", field });
	

	const schema = yup.object({
		password: yup.string().required("Enter your password").min(6, "Password must be at least 6 characters"),
		confirmPassword: yup.string().required("Confirm your new password").min(6, "Password must be at least 6 characters"),
	})

	type SecurityType = yup.InferType<typeof schema>;

	const { register, handleSubmit, formState: { errors }, getValues } = useForm<SecurityType>({
		resolver: yupResolver(schema),
	});

	const onSubmit = async (data: SecurityType) => {
		const password = getValues('password')
		const confirmPassword = getValues('confirmPassword')

		if (password !== confirmPassword) {
			setError('Both passwords must be the same.');
			return;
		}

		try {
			setLoading(true);
			const response = await api.post(`/auth/setpassword/`, data);
			console.log(response)
			setError('')
			setMessage(response.data.detail);
			setTimeout(() => router.push('/chats'), 3000);
		} catch (err: any) {
			setError(err.response?.data?.detail || 'Something went wrong.');
		} finally {
			setLoading(false);
		}
	};



	return (
		<div className="pt-24 bg-[#f2f2f2] h-screen">
			<h3 className='text-base md:text-lg font-semibold text-center mb-5'>Set a Login Password</h3>
			<div className='px-8 md:px-10 lg:px-10 py-8 md:py-8 lg:py-10 bg-white w-[90%] sm:w-[70%] lg:w-[50%] xl:w-[40%] 2xl:w-[30%] mx-auto rounded-md hover:shadow-lg'>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div  className='flex flex-col gap-6'>
						<div className="w-full">
							<label htmlFor="password" className="text-sm font-semibold">Password</label>
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
							<p className="text-red-700 text-xs mt-2">
								{errors.password?.message && String(errors.password.message)}
							</p>
						</div>


						<div className="w-full">
							<label htmlFor="confirmPassword" className="text-sm font-semibold">Confirm Password</label>
							<div className='flex justify-between items-center w-full mt-2 p-3 bg-[#f2f2f2] rounded-md'>
								<input type={state.confirmPasswordToggle ? "text" : "password"}
									id="confirmPassword"
									placeholder='Enter a unique password'
									className=" w-full focus:outline-0 focus:border-0 focus:placeholder:opacity-0 placeholder:text-sm md:placeholder:text-xs"
									{...register('confirmPassword')}
								/>

								<span onClick={()=> toggle("confirmPasswordToggle")} className='hover:cursor-pointer'>
									{state.confirmPasswordToggle ? <FaEyeSlash /> : <FaEye/>}
								</span>
							</div>
							<p className="text-red-700 text-xs mt-2">
								{errors.confirmPassword?.message && String(errors.confirmPassword.message)}
							</p>
						</div>
					</div>
					
					<button 
						type='submit' 
						className='mt-5 mx-auto bg-primary w-full py-4 rounded-md text-sm md:text-base text-center font-semibold text-white cursor-pointer'
						disabled={loading}
					>
						{loading ? <AiOutlineLoading3Quarters className='mx-auto stroke-1 text-base text-center animate-spin'/> : 'Confirm'}
					</button>

					{error && <p className="mt-5 text-red-500 text-sm mb-4 text-center">{error}</p>}
					{message && <p className="text-red-500 text-sm mb-4 text-center">{message}</p>}

				</form>
			</div>
			<div className='w-full flex justify-center items-center'>
				<button 
					type='button' 
					disabled={loading} 
					className='mt-8 text-center text-base font-semibold text-primary cursor-pointer' 
					onClick={()=> router.push('/chats')}
				>
					Skip
				</button>
			</div>
		</div>
	);
}

export default SetPassword;