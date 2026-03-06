'use client'
import { useRef, useState } from 'react';
import axios from 'axios';
import { IoMdMailUnread } from "react-icons/io";
import ReCAPTCHA from "react-google-recaptcha"
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import api from '@/src/functions/auth/AxiosConfig';


const apiURL = process.env.NEXT_PUBLIC_BASE_API_URL

function RequestReset() {

    const [captchaToken, setCaptchaToken] = useState<string | null>(null)
    const emailRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [emailSent, setEmailSent] = useState(false);
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const handleRequestReset = async () => {
        setError(null);

        const email = emailRef.current?.value.trim();

        if (!email) {
            setError('Email is required.');
            return;
        }

        // if(!captchaToken || captchaToken == ''){
        //     setError("Please verify captcha")
        //     return
        // }

        const payload = { email, captchaToken }

        // console.log(payload)

        try {
            setLoading(true);
            const response = await api.post(`auth/user/password/request/reset/`, payload);
            console.log(response.data)
            setEmailSent(true)

        } catch (err: any) {
            recaptchaRef.current?.reset();
            setCaptchaToken("");
            setError(err.response?.data?.detail || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-40 md:pt-40 lg:pt-52  bg-gray-bg pb-40 px-5 md:px-10 lg:px-20 h-screen">
            {!emailSent ?  (
                        
                <div  className='px-8 md:px-10 lg:px-16 py-10 bg-background w-full md:w-[70%] lg:w-[50%] mx-auto rounded-md hover:shadow-lg'>
                    
                    <div className="mt-0 flex flex-col items-start text-left w-full">
                        <label htmlFor="email" className="text-sm font-medium   mb-4 mr-4">Email</label>
                        <input type="email" 
                            id="email" 
                            ref={emailRef}
                            name="email" 
                            placeholder='Enter your email to reset password' 
                            className=" w-full p-3 bg-gray-bg rounded-md focus:outline-0 focus:placeholder:opacity-0 placeholder:text-sm md:placeholder:text-sm" 
                        />
                    </div>
                    <div className='mt-5'>
                        <ReCAPTCHA
                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                            onChange={setCaptchaToken}
                            ref={recaptchaRef}
                        />
                    </div>
                    
                    <button type='submit' className='mt-5 mx-auto bg-primary w-full py-4 rounded-md text-sm md:text-base text-center font-semibold text-white cursor-pointer'
                        disabled={loading} 
                        onClick={handleRequestReset}>
                        {loading ? <AiOutlineLoading3Quarters className='mx-auto stroke-1 text-base text-center animate-spin'/> : 'Send Reset Link'}
                    </button>

                    {error && <p className="mt-5 text-red-500 text-sm mb-4 text-center">{error}</p>}
    
                </div>
            ) : (
                <div className='pb-10 bg-gray flex items-center justify-center'>
                    <div className="mt-5 mx-auto text-center">
                        <h3 className="text-2xl md:text-2xl lg:text-3xl leading-7.5 md:leading-10 lg:leading-13 font-bold">
                            Check your email
                        </h3>
                        <p className="mt-5 text-base text-gray-600 w-full">
                            We have sent a password reset link to your email.
                        </p>
                        <IoMdMailUnread className='mt-5 text-primary text-4xl md:text-5xl mx-auto'/>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RequestReset;