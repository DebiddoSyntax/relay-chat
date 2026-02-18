"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function NotFound() {

	return (

		<div className="flex flex-col justify-center items-center pt-12 md:pt-20 pb-20   text-center mx-20">
			<img
				src="/NotFoundSVG.svg"
				alt="Not found"
				className="w-[400px] h-[400px] object-contain"
			/>

			<p className="text-xl lg:text-2xl mt-5 font-semibold">Page Not found</p>
			<p className="text-sm mt-5 text-gray-500">The page you requested for cannot be found, kindly navigate back to the Login Page</p>
			<Link href="/">
				<button type='button' className='relative z-30 mx-auto bg-blue-700 px-8 py-4 rounded-md text-sm text-center font-semibold text-white hover:bg-primary cursor-pointer mt-5'>
				Login Page
				</button>
			</Link>
		</div>
	)
}

export default NotFound