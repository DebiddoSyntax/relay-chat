"use client"
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/src/functions/auth/Store";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha"
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import LeftSection from "./LeftSection";
import api from "@/src/functions/auth/AxiosConfig";
import GoogleAuth from "./GoogleAuth"
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'


// const apiURL = process.env.NEXT_PUBLIC_BASE_API_URL

interface loginType {
    email: string,
    password: string
}

const Loginpage = () => {
    
    const router = useRouter()
    const pathname = usePathname()
    const { executeRecaptcha } = useGoogleReCaptcha()
    
    const setAuth = useAuth((state)=> state.setAuth)
    const show = useAuth((state)=> state.show)

    const schema = yup.object({
        email: yup.string().required("Please enter your email").email("Please enter a valid email"),
        password: yup.string().required("Enter a unique password").min(6, "Password must be at least 6 characters"),
    })


    const { register, handleSubmit, formState: { errors } } = useForm<loginType>({
        resolver: yupResolver(schema),
    });


    const [showV2, setShowV2] = useState(false)
    const [expectedAction, setExpectedAction] = useState("")
    const [captchaToken, setCaptchaToken] = useState<string | null>(null)
    const recaptchaRef = useRef<ReCAPTCHA>(null);


    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [visible, setVisible] = useState(false);
    const toggleVisibility = () => setVisible((prev) => !prev);
    


    const handleLogin = async (data: loginType) => {

        if (!executeRecaptcha) {
            setError("Recaptcha not ready")
            return
        }

        const token = await executeRecaptcha('login_submit')

        if(showV2){
            if(!captchaToken || captchaToken == ''){
                setError("Please verify captcha")
                return
            }
        }

        const payload = {
            captchaToken: showV2 ? captchaToken : token,
            expected_action: !showV2 ? 'login_submit' : null,
            ...data
        }

        try{
            setLoading(true)
            const response = await api.post(`/auth/login/`, payload)
            // console.log("logged in", response.data)
            const authData = response.data
            setAuth(authData.user, authData.accessToken)
            router.push(`/chats`)
        }catch(err){
            if (axios.isAxiosError(err)) {
                recaptchaRef.current?.reset();
                setCaptchaToken("");
                setExpectedAction('')
				console.log("error", err.response?.data);
				setError(err.response?.data.detail || "Something went wrong");
			} else {
				console.error("unexpected error", err);
				setError("An unexpected error occurred");
			}
        }finally{
            setLoading(false)
        }
    }


    return (
        <div className='grid grid-cols-1 lg:grid-cols-2 w-full h-dvh overflow-y-auto md:overflow-hidden bg-gray-bg hide-scrollbar'>
            <LeftSection />

            {/* login card  */}
            <div className={`${!show ? 'hidden lg:flex flex-col' : 'flex flex-col'}w-full flex justify-center items-center h-full`}>
                <div className={`bg-background px-5 py-5 my-auto mx-auto border-border border-0 w-96`}>
                    <h1 className='text-2xl font-semibold text-primary'>Log In</h1>
                    <h3 className='my-3 text-sm font-semibold text-gray-500'>Welcome Back! Enter your details</h3>
                    <form onSubmit={handleSubmit(handleLogin)} className=''>
                        <div className="mb-5 mt-5 items-start text-left w-full text-sm">
                            <label htmlFor="email" className="text-sm font-semibold  ">Email</label>
                            <div className=" w-full p-3 mt-2 bg-gray-bg border-border rounded-md">
                                <input autoComplete="off" type="email" id="email" placeholder='Enter your email'
                                    className="w-full focus:outline-none focus:placeholder:opacity-0 placeholder:text-sm"
                                    {...register('email')}
                                />
                            </div>
                            <p className="text-red-700 text-sm mt-2">
                                {errors.email?.message && String(errors.email.message)}
                            </p>
                        </div>


                        <div className="mb-5 mt-7 flex flex-col items-start w-full">
                            <div className="w-full flex justify-between items-center mb-4">
                                <label htmlFor="password" className="text-sm font-semibold  ">
                                    Password
                                </label>
                                <Link href="/reset" className="text-primary-400 underline transition-colors text-sm">
                                    Forgot password?
                                </Link>
                            </div>
                            
                            <div className='flex justify-between items-center w-full p-3 bg-gray-bg rounded-md text-sm'>
                                <input type={visible ? "text" : "password"}
                                    id="password"
                                    autoComplete="off"
                                    placeholder='Enter a unique password'
                                    className=" w-full focus:outline-0 focus:border-0 focus:placeholder:opacity-0 placeholder:text-sm md:placeholder:text-sm"
                                    {...register('password')}
                                />

                                <span onClick={toggleVisibility} className='hover:cursor-pointer'>
                                    {visible ? <FaEyeSlash /> : <FaEye/>}
                                </span>
                            </div>
                            <p className="text-red-700 text-sm mt-2">
                                {errors.password?.message && String(errors.password.message)}
                            </p>
                        </div>
                        
                        {showV2 &&
                            <ReCAPTCHA
                                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_V2_SITE!}
                                onChange={setCaptchaToken}
                                ref={recaptchaRef}
                            />
                        }
                    
                        <button type='submit' disabled={loading} className=" cursor-pointer py-5 mt-5 md:mt-5 text-sm font-semibold items-center w-full place-items-center bg-primary text-white rounded-md">
                            {loading ? <AiOutlineLoading3Quarters className='mx-auto stroke-1 text-base text-center animate-spin'/> : 'Login'}
                        </button>

                        <p className="text-red-700 text-center text-sm mt-2">
                            {error}
                        </p>
                        
                    
                    </form>
                    <div className="mt-5 w-full flex gap-3 items-center">
                        <div className="w-full border border-border"></div>
                        <p className="text-center text-xs font-semibold">Or</p>
                        <div className="w-full border border-border"></div>
                    </div>

                    <GoogleAuth />
                    <p className='mx-auto text-center text-sm font-semibold mt-7'>Don’t have an account? <Link href='/signup'><span className='text-primary'>Create one</span></Link></p>
                </div>
            </div>
        </div>
    )
}

export default Loginpage;