'use client'
import React, { useRef, useState } from 'react';
import axios from 'axios';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter, useSearchParams } from 'next/navigation';
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const apiURL = process.env.NEXT_PUBLIC_BASE_API_URL

function ResetPasswordPage() {
	const router = useRouter()
	const searchParams = useSearchParams();
	const params = new URLSearchParams(searchParams.toString());
	const id = params.get("id")
	const token = params.get("token")


	const passwordRef = useRef<HTMLInputElement>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState<boolean>(false);

	
	const [visible, setVisible] = useState(false);
	const toggleVisibility = () => setVisible((prev) => !prev);
	

	const handleResetPassword = async () => {
		const newPassword = passwordRef.current?.value.trim();

		if (!newPassword || newPassword.length < 6) {
			setError('Password must be at least 6 characters.');
			return;
		}

		try {
			setLoading(true);
			const response = await axios.post(`${apiURL}/auth/reset/confirm`, {
				newPassword, id, token
			});

			// console.log(response)

			setMessage(response.data.detail);
			setTimeout(() => router.push('/login'), 2000);
		} catch (err: any) {
			setError(err.response?.data?.detail || 'Something went wrong.');
		} finally {
			setLoading(false);
		}
	};



	return (
		<div className="pt-24   bg-dashboard-background h-screen">

			<div className='bg-dashboard-background mt-10 md:mt-16 pb-40 px-5 md:px-10 lg:px-20'>
				
				<div className='px-8 md:px-10 lg:px-16 py-5 md:py-8 lg:py-10 bg-dashboard-foreground w-full md:w-[70%] lg:w-[50%] mx-auto rounded-xl hover:shadow-lg'>
					<div className="mt-7 flex flex-col items-start text-left w-full">
						<div className="w-full flex justify-between items-center text-sm font-medium   mb-4 mr-4">
							<label htmlFor="password">New Password</label>
						</div>
						<div className='flex justify-between items-center w-full p-3 border-2 border-border-lower rounded-md focus-within:outline-2 focus-within:border-0 focus-within:outline-primary placeholder:text-sm md:placeholder:text-sm'>
							<input type={visible ? "text" : "password"}
								id="password"
								ref={passwordRef}
								placeholder='Enter a unique password'
								className=" w-full focus:outline-0 focus:border-0 focus:placeholder:opacity-0 focus:outline-primary placeholder:text-sm md:placeholder:text-sm"
							/>

							<span onClick={toggleVisibility} className='hover:cursor-pointer'>
								{visible ? <FaEyeSlash /> : <FaEye/>}
							</span>
						</div>
					</div>
					
					<button 
						type='submit' 
						className='mt-10 mx-auto bg-blue-700 w-full py-4 rounded-md text-sm md:text-base text-center font-semibold text-white hover:bg-blue-700 cursor-pointer'
						onClick={handleResetPassword} 
						disabled={loading}
					>
						{loading ? <AiOutlineLoading3Quarters className='mx-auto stroke-1 text-base text-center animate-spin'/> : 'Confirm'}
					</button>

					{error && <p className="mt-10 text-red-500 text-sm mb-4 text-center">{error}</p>}
					{message && <p className="text-red-500 text-sm mb-4 text-center">{message}</p>}

				</div>
			</div>
		</div>
	);
}

export default ResetPasswordPage;