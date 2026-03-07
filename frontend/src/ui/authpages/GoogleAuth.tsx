import api from '@/src/functions/auth/AxiosConfig';
import { useAuth } from '@/src/functions/auth/Store';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FcGoogle } from "react-icons/fc";

function GoogleAuth() {
	const router = useRouter()
	const setAuth = useAuth((state)=> state.setAuth)
	const setIsFirst = useAuth((state)=> state.setIsFirst)
	const [error, setError] = useState('')

	const handleLogin = async (googleResponse: any) => {
		const payload = { code: googleResponse.code };
		try {
			const res = await api.post('/auth/login/social/', payload);
			// console.log('Logged in!', res.data);
			const authData = res.data
			
			setIsFirst(authData.first_login)
			setAuth(authData.user, authData.accessToken);

			if(authData.first_login){
				router.push(`/set-password`)
			}else{
				router.push(`/chats`)
			}
		} catch (err) {
			if (axios.isAxiosError(err)) {
				// console.log("error", err.response?.data);
				setError(err.response?.data.detail || "Something went wrong");
			} else {
				// console.error("unexpected error");
				setError("An unexpected error occurred");
			}
		}
	};

	const handleError = () => {
		// console.log('Login Failed')
		setError('Login failed')
	}

	const login = useGoogleLogin({
		onSuccess: handleLogin,
		onError: handleError,
		flow: 'auth-code', 
	});

	return (
		<div className="mt-5">
			<button onClick={() => login()} className="w-full flex items-center justify-center gap-3 py-3 rounded-lg border-2 border-border transition cursor-pointer" >
				<FcGoogle className="text-base" />
				<p className='text-sm font-semibold'>Continue with Google</p>
			</button>

			<p className="text-red-700 text-center text-sm mt-2">
				{error}
			</p>
		</div>
		);
}

export default GoogleAuth;