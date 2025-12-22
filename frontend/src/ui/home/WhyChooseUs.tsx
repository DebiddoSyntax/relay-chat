import React from 'react'
import { RiChatSmileAiLine } from "react-icons/ri";

function WhyChooseUs() {
    return (
        <div className='px-5 md:px-10 xl:px-20 py-40'>
            <h3 className='text-4xl font-bold'>Why choose us?</h3>

            <div className='grid grid-cols-2 gap-12 mt-10'>
                {[1,2,3,4] .map(()=> (
                    <div className='px-5 md:px-8 py-5 md:py-8 bg-[#f2f2f2] rounded-lg'>
                        <div className='p-2 rounded-full bg-orange-700 inline-block'>
                            <RiChatSmileAiLine className='text-2xl text-white' />
                        </div>
                        <h5 className='mt-10 text-xl font-semibold'>
                            Privacy isn't a feature, it's our foundation
                        </h5>
                        <p className='mt-5 text-base font-semibold text-gray-500'>
                            End-to-end concryption by default. Zero access to your messages (not even us). No data selling, no creepy ads, your chats stays yours forever.
                        </p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default WhyChooseUs
