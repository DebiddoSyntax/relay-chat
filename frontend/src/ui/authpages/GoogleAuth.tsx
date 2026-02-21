import api from '@/src/functions/auth/AxiosConfig';
import { useAuth } from '@/src/functions/auth/Store';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function GoogleAuth() {
	const router = useRouter()
	const setAuth = useAuth((state)=> state.setAuth)
	const [error, setError] = useState('')

	const handleLogin = async (googleResponse: any) => {
		const payload = { access_token: googleResponse.credential }
		try {
			const res = await api.post('/auth/login/social/', payload);
			// console.log('Logged in!', res.data);
			const authData = res.data
            setAuth(authData.user, authData.accessToken)
			if(authData.first_login){
            	router.push(`/set-password`)
			}else{
				router.push(`/chats`)
			}
		} catch (err) {
			if (axios.isAxiosError(err)) {
				console.log("error", err.response?.data);
				setError(err.response?.data.detail || "Something went wrong");
			} else {
				console.error("unexpected error", err);
				setError("An unexpected error occurred");
			}
		}
	};

	const handleError = () => {
		console.log('Login Failed')
		setError('Login failed')
	}

	return ( 
		<div className='mt-5'>
			<GoogleLogin onSuccess={handleLogin} onError={handleError} />
			  	<p className="text-red-700 text-center text-sm mt-2">
					{error}
				</p>
		</div>
	)
}

export default GoogleAuth;