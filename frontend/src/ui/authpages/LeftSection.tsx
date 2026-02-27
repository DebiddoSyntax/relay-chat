import React from 'react'
import Link from "next/link";

function LeftSection({setShow, show}: { setShow: (val: boolean)=> void, show: boolean}) {
    return (
        <div className={`${show ? 'hidden lg:flex flex-col' : 'flex flex-col'} min-h-screen bg-primary py-10 px-5 md:px-10 xl:px-20 text-2xl md:text-3xl lg:text-4xl text-white flex flex-col`}>
            
            <h3 className="mt-5 font-cherryBombOne font-black">
                RelayChat
            </h3>

            <div className="mt-20 flex flex-col justify-between flex-1">
                
                <div>
                    <div>Icon</div>

                    <h5 className="text-xl md:text-3xl font-semibold mt-6">
                        Hey, Hello
                    </h5>

                    <p className="mt-5 text-base font-semibold">
                        Join RelayChat to seamlessly converse with your friends and family
                    </p>
                </div>

                <div className="flex flex-col w-full lg:hidden">
                    <button className="py-5 mt-5 text-sm font-semibold w-full bg-primary-700 rounded-md" onClick={()=> setShow(true)}>
                        Login
                    </button>
                    <button className="py-5 mt-5 text-sm font-semibold w-full rounded-md">
                        <Link href={'/signup'}>Signup</Link>
                    </button>

                </div>

            </div>
        </div>
    )
}

export default LeftSection
