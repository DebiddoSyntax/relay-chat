import React from 'react'
import Link from "next/link";
import { AiFillApi } from "react-icons/ai";
import { AiFillFunnelPlot } from "react-icons/ai";
import { RiChatSmileAiFill } from "react-icons/ri";
import { MdJoinFull } from "react-icons/md";
import { useAuth } from '@/src/functions/auth/Store';
import { useRouter, usePathname } from 'next/navigation';

const Messages = [
    { 
        'heading': 'Built for Shared Moments', 
        'body': 'Bring everyone into one space and keep the conversation moving. Create groups for friends, teams, or communities and stay in sync in real time',
        'icon':MdJoinFull,
        'color': 'blue-700'
    },

    { 
        'heading': 'Personalized AI.', 
        'body': 'Ask questions, generate content, brainstorm concepts, or get instant support all in RelayChat. It’s like having a smart partner with you.',
        'icon': RiChatSmileAiFill,
        'color': 'green-700'
    },
]



function LeftSection() {
    const router = useRouter()
    const pathname = usePathname()
    const show = useAuth((state)=> state.show)
    const setShow = useAuth((state)=> state.setShow)

    const handleClick = () => {
        router.push(pathname)
        setTimeout(()=> {
            setShow(true)
        }, 2000)
    }

    return (
        <div className={`${show ? 'hidden lg:flex flex-col' : 'flex flex-col'} relative overflow-hidden min-h-screen bg-primary py-10 px-5 md:px-10 2xl:px-16 text-2xl md:text-3xl lg:text-4xl text-white`}>
            
            <div className='flex item-center justify-between'>
                <h3 className="mt-0 font-cherryBombOne font-black">
                    RelayChat
                </h3>
                <button className="lg:hidden text-xs font-semibold px-5 py-3 border-2 border-primary-700 bg-primary-700 rounded-md cursor-pointer" onClick={handleClick}>
                    {pathname === '/' ? 'Login' : 'Sign Up'}
                </button>
            </div>

            {/* <div className='absolute flex w-full'>
                <AiFillApi className='text-[320px]'/>
            </div> */}

            <div className="mt-20 sm:mt-40 lg:mt-40 2xl:mt-52 flex flex-col sm:justify-between flex-1">
                
                <div>
                    <div className='text-4xl md:text-5xl lg:text-4xl 2xl:text-5xl leading-12 md:leading-14 lg:leading-12 xl:leading-14 font-semibold'>Where Conversations Move Faster</div>

                    <p className="mt-8 text-sm md:text-base leading-5 md:leading-8 font-semibold text-neutral-500">
                        Connect with friends, collaborate in groups, and get instant AI support all in one place. Relay Chat brings private messaging, community spaces, and smart assistance together so you never have to switch apps.
                    </p>
                </div>

                <div className='mt-20 sm:mt-0 grid grid-cols-2 gap-8 items-start'>
                    {Messages.map((msg, i)=> {
                        const Icon = msg.icon
                        return (
                            <div key={i} className='flex flex-col gap-3'>
                                <div className={`text-3xl text-${msg.color}`}><Icon /></div>
                                <p className='text-sm md:text-base font-semibold text-primary-300'>{msg.heading}</p>
                                <p className='text-xs md:text-sm leading-5 font-semibold text-neutral-500'>{msg.body}</p>
                            </div>
                        )}
                    )}
                </div>

                {/* <div className="mt-8 flex gap-6 w-full lg:hidden">
                    <button className="py-5 mt-5 text-xs font-semibold w-full border-2 border-primary-700 bg-primary-700 rounded-md cursor-pointer" onClick={()=> handleClick('/')}>
                        Login
                    </button>
                    <button className="hidden py-5 mt-5 text-xs font-semibold border-2 w-full rounded-md cursor-pointer" onClick={()=>  handleClick('/signup')}>
                        Signup
                    </button>
                </div> */}

            </div>
        </div>
    )
}

export default LeftSection
