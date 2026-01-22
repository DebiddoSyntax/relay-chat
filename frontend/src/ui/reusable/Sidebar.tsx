"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MdShop } from "react-icons/md";
import { useState } from 'react';
import { BsFillInboxesFill } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
// import useClicktoClose from '@/functions/hooks/useClicktoClose';
import { IoIosArrowBack } from "react-icons/io";
import { TbLayoutSidebarRightCollapseFilled } from "react-icons/tb";
import { HiUser } from "react-icons/hi2";
import { PiChatTeardropDotsFill } from "react-icons/pi";
import { useAuth } from '@/src/functions/auth/Store';
import { RiChatSmileAiFill } from "react-icons/ri";




function Sidebar() {

	const pathname = usePathname();
	const logout = useAuth((state)=> state.logout)
	const [nav, setNav] = useState<boolean>(false);
	
	const handleNav = () => setNav(!nav);

	const getLinkClass = (path: string, exact: boolean = false) => {
		const normalizedPathname = pathname?.endsWith('/') && pathname !== '/' 
			? pathname?.slice(0, -1) 
			: pathname;
		const normalizedPath = path.endsWith('/') && path !== '/' 
			? path.slice(0, -1) 
			: path;
		
		if (exact) {
			return normalizedPathname === normalizedPath 
				? 'bg-gray-300 text-black font-semibold' 
				: 'hover:bg-gray-100 text-gray-500';
		} else {
			return normalizedPathname?.startsWith(normalizedPath) 
				? 'bg-gray-300 text-black font-semibold' 
				: 'hover:bg-gray-100 text-gray-500';
		}
	};

	// const navCloseRef = useClicktoClose(()=> {
	// 	setNav(false)
	// })

	 const handleLogout = () => {
        logout()
    }

  	return (
    	<div className='pl-0 md:px-0 pt-0 md:pt-0 md:h-screen'>

			{/* Sidebar */}
			<div className="w-full md:w-40 lg:w-48 2xl:w-72 pr-5 lg:pr-6 2xl:pr-10 pt-5 md:pt-5 h-full z-20 bg-dashboard-sidebar border-b-2 md:border-b-0 border-r-0 md:border-r-2 border-gray-300"> 
				
                <h3 className='font-cherryBombOne font-black text-2xl md:text-3xl lg:text-4xl pl-5 md:pl-0 pb-5 md:py-0'>RelayChat</h3>
				
                {/* <div className='mt-20 hidden md:block'> */}
                <div className='hidden md:block mt-10 md:mt-20'>
                    {/* chats */}
                    <Link href="/chats">
                        <div className={`flex items-center gap-1 lg:gap-2 mb-5 cursor-pointer py-4 px-2 xl:px-4 w-full rounded-md mt-5 ${getLinkClass('/chats')}`}>
                            <PiChatTeardropDotsFill className={`text-base xl:text-lg 2xl:text-xl ${getLinkClass('/chats')}`} />
                            <p className="text-sm 2xl:text-base font-bold">Chats</p>
                        </div>
                    </Link>

                    {/* groups */}
                    <Link href="/groups">
                        <div className={`flex items-center gap-1 lg:gap-2 mb-5 cursor-pointer py-4 px-2 xl:px-4 w-full rounded-md mt-5 ${getLinkClass('/groups')}`}>
                            <FaUsers className={`text-base xl:text-lg 2xl:text-xl ${getLinkClass('/groups')}`} />
                            <p className="text-sm 2xl:text-base font-bold">Groups</p>
                        </div>
                    </Link>

                    {/* aichat */}
                    <Link href="/sydneyai">
                        <div className={`flex items-center gap-1 lg:gap-2 mb-5 cursor-pointer py-4 px-2 xl:px-4 w-full rounded-md mt-5 ${getLinkClass('/sydneyai')}`}>
                            <RiChatSmileAiFill className={`text-base xl:text-lg 2xl:text-xl ${getLinkClass('/sydneyai')}`} />
                            <p className="text-sm 2xl:text-base font-bold">Sydney AI</p>
                        </div>
                    </Link>

                    {/* Profile */}
                    <Link href="/profile">
                        <div className={`flex items-center gap-1 lg:gap-2 mb-5 cursor-pointer py-4 px-2 xl:px-4 w-full rounded-md mt-5 ${getLinkClass('/profile')}`}>
                            <HiUser className={`text-base xl:text-lg 2xl:text-xl ${getLinkClass('/profile')}`} />
                            <p className="text-sm 2xl:text-base font-bold">Profile</p>
                        </div>
                    </Link>
                </div>

				<div className=''>
                    <p onClick={handleLogout}>logout</p>
                    {/* <p onClick={handleRefresh}>refresh Token</p> */}
                </div>

			</div>
		</div>
	)
}

export default Sidebar;
