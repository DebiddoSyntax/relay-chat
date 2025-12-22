import React from 'react'
import Link from 'next/link'

function Navbar() {
    return (
        <div className='flex justify-between items-center py-5 px-5 md:px-10 xl:px-20 bg-[#f2f2f2]'>
             <h3 className='font-cherryBombOne font-black text-2xl md:text-3xl lg:text-4xl'>RelayChat</h3>

            <ul className='py-2 px-3 text-white bg-black rounded-4xl grid grid-cols-3 gap-6 w-96 items-center text-sm font-semibold'>
                <li className='w-full bg-orange-700 cursor-pointer px-5 py-3 rounded-3xl text-center'>Home</li>
                <li className='w-full hover:bg-orange-700 cursor-pointer px-5 py-3 rounded-3xl text-center'>Features</li>
                <li className='w-full hover:bg-orange-700 cursor-pointer px-5 py-3 rounded-3xl text-center'>Contact</li>
            </ul>

            <div className='flex'>
                <button className='mr-6 px-0 text-sm font-semibold cursor-pointer'>
                    <Link href={'/login'}>
                        Login
                    </Link>
                </button>

                <button className='px-5 py-5 w-40 bg-black text-white text-sm font-semibold rounded-4xl cursor-pointer'>
                    <Link href={'/signup'}>
                        Signup
                    </Link>
                </button>
            </div>
        </div>
    )
}

export default Navbar
