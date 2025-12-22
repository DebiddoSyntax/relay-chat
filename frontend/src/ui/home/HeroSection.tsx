import React from 'react'
import { RiChatSmileAiLine } from "react-icons/ri";

function HeroSection() {
    return (
        <div className='pt-32 flex justify-center h-screen bg-[#f2f2f2]'>
            <div className='flex flex-col text-center gap-6'>
                <div className='flex justify-center gap-3 items-center'>
                    <div className='p-2 rounded-full bg-orange-700 inline-block'>
                        <RiChatSmileAiLine className='text-2xl text-white' />
                    </div>
                    <p className='text-2xl font-semibold text-gray-600'>
                        Easy and reliable
                    </p>
                </div>

                <div className='flex flex-col gap-4'>
                    <h1 className='text-7xl font-semibold'>
                        A chat application built for
                    </h1>
                    <h1 className='text-7xl text-orange-700 font-semibold'>
                        real conversations
                    </h1>
                </div>
                <p>
                    Hettgs
                </p>

                <div className='inline-block'>
                    <button type="button" className='px-5 py-5 w-64 bg-orange-700 text-white text-base font-semibold rounded-4xl cursor-pointer'>
                        Start talking
                    </button>
                </div>
            </div>
        </div>

    )
}

export default HeroSection
