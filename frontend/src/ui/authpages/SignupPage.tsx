"use client"
import Link from "next/link";
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
// import ReCAPTCHA from "react-google-recaptcha"
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useAuth } from "@/src/functions/auth/Store";
import LeftSection from "./LeftSection";
import api from "@/src/functions/auth/AxiosConfig";



// const apiURL = process.env.NEXT_PUBLIC_BASE_API_URL


export interface signupType {
    firstname: string,
    lastname: string,
    email: string,
    password: string
}

const SignupPage = () => {

    const router = useRouter();
    const setAuth = useAuth((state)=> state.setAuth)

    const schema = yup.object({
        firstname: yup.string().required("Enter your first name"),
        lastname: yup.string().required("Enter your last name"),
        email: yup.string().required("Please enter your email").email("Please enter a valid email"),
        password: yup.string().required("Enter a unique password").min(6, "Password must be at least 6 characters"),
    })


    const { register, handleSubmit, formState: { errors } } = useForm<signupType>({
        resolver: yupResolver(schema),
    });

    const [captchaToken, setCaptchaToken] = useState<string | null>(null)
    // const recaptchaRef = useRef<ReCAPTCHA>(null);

    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [visible, setVisible] = useState(false);
    const toggleVisibility = () => setVisible((prev) => !prev);

    
    
    
    const handleSignUp = async (data: signupType) => {

        // if(!captchaToken || captchaToken == ''){
        //     setError("Please verify captcha")
        //     return
        // }

        const payload = {
            // captchaToken,
            ...data
        }

        try{
            setLoading(true)
            const response = await api.post(`/auth/signup/`, payload)
            console.log("signed Up", response.data)
            const authData = response.data
            setAuth(authData.user, authData.accessToken, authData.refreshToken)
            router.push('/chats')
        }catch(err){
            if (axios.isAxiosError(err)) {
                // recaptchaRef.current?.reset();
                setCaptchaToken("");
				console.log("error", err.response?.data);
				setError(err.response?.data.email || "Something went wrong");
			} else {
				console.error("unexpected error", err);
				setError("An unexpected error occurred");
			}
        }finally{
            setLoading(false)
        }
    }



  return (
    <div className='grid grid-cols-1 md:grid-cols-2 w-full h-screen py-0 bg-dashboard-background'>
        <LeftSection />

        <div className='bg-dashboard-foreground w-full h-full px-5 py-5 md:px-8 md:py-8'>
            <div className='w-full md:w-[400px] mx-auto mt-20'>
                <h1 className='text-2xl font-semibold text-primary'>Create an account</h1>
                <h3 className='my-3 text-sm font-semibold text-gray-500'>Start chatting with your friends now</h3>
                <form onSubmit={handleSubmit(handleSignUp)} className=''>
                    <div>
                        <div className="mb-5 mt-5 items-start text-left w-full">
                            <label htmlFor="firstname" className="text-sm font-semibold  ">First Name</label>
                            <input autoComplete="off" type="firstname" id="firstname" placeholder='Enter your first name'
                                    className=" w-full p-3 border mt-2 border-border-lower rounded-md focus:outline-none focus:placeholder:opacity-0 placeholder:text-sm"
                                    {...register('firstname')}
                            />
                            <p className="text-red-700 text-sm mt-2">
                                {errors.firstname?.message && String(errors.firstname.message)}
                            </p>
                        </div>
                        <div className="mb-5 mt-5 items-start text-left w-full">
                            <label htmlFor="lastname" className="text-sm font-semibold">Last Name</label>
                            <input autoComplete="off" type="lastname" id="lastname" placeholder='Enter your last name'
                                className=" w-full p-3 border mt-2 border-border-lower rounded-md focus:outline-none focus:placeholder:opacity-0 placeholder:text-sm"
                                {...register('lastname')}
                            />
                            <p className="text-red-700 text-sm mt-2">
                                {errors.lastname?.message && String(errors.lastname.message)}
                            </p>
                        </div>
                    </div>

                    <div className="mb-5 mt-5 items-start text-left w-full">
                        <label htmlFor="username" className="text-sm font-semibold  ">Email</label>
                        <input autoComplete="off" type="email" id="email" placeholder='Enter your email'
                            className=" w-full p-3 border mt-2 border-border-lower rounded-md focus:outline-none focus:placeholder:opacity-0 placeholder:text-sm"
                            {...register('email')}
                        />
                        <p className="text-red-700 text-sm mt-2">
                            {errors.email?.message && String(errors.email.message)}
                        </p>
                    </div>

                    <div className="mb-5 mt-7 items-start text-left w-full">
                        <label htmlFor="password" className="text-sm font-semibold ">Password</label>
                        <div className='flex justify-between items-center w-full mt-2 p-3 border border-border-lower rounded-md'>
                            <input type={visible ? "text" : "password"}
                                id="password"
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
                    
                    {/* <ReCAPTCHA
                        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                        onChange={setCaptchaToken}
                        ref={recaptchaRef}
                    /> */}
                    
                    <button type='submit' disabled={loading} className=" cursor-pointer py-5 mt-5 md:mt-5 text-sm font-semibold items-center h-full w-full place-items-center bg-primary text-white hover:bg-blue-800 rounded-md">
                        {loading ? <AiOutlineLoading3Quarters className='mx-auto stroke-1 text-base text-center animate-spin'/> : 'Create'}
                    </button>

                    <p className="text-red-700 text-center text-sm mt-2">
                        {error}
                    </p>
                
                </form>
                <p className='mx-auto text-center text-sm font-semibold mt-7'>Already have an account? <Link href='/login'><span className='text-primary'>Login</span></Link></p>
            </div>
        </div>
    </div>
  )
}

export default SignupPage;