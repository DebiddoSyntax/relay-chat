"use client"
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import useClicktoClose from '@/src/functions/global/useClicktoClose';
import { IoIosArrowBack } from "react-icons/io";
import { TbLayoutSidebarRightCollapseFilled } from "react-icons/tb";
import { useAuth } from '@/src/functions/auth/Store';
import Paths from './Paths';
import { useChat } from '@/src/functions/chats/chatStore';



function Sidebar() {

	const pathname = usePathname();
	const logout = useAuth((state)=> state.logout)
	const setChatOpen = useChat((state)=> state.setChatOpen)
	const chatOpen = useChat((state)=> state.chatOpen)
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

	const navCloseRef = useClicktoClose(()=> {
		setNav(false)
	})

	const handleLogout = () => {
        logout()
    }

  	return (
    	<div className='pl-0 md:px-0 pt-0 md:pt-0 md:h-screen'>

			{/* Sidebar */}
			<div className={`${chatOpen && 'hidden md:block'} w-full md:w-40 lg:w-48 2xl:w-72 pr-5 lg:pr-6 2xl:pr-10 pt-5 md:pt-5 h-full z-20 border-b-2 md:border-b-0 border-r-0 md:border-r-2 border-gray-300`}> 
				
                <div className={`${chatOpen ? 'hidden md:flex' : 'flex'} gap-1 items-center pl-5 md:pl-0 pb-2 md:pb-5 md:py-0`}>
                    <div className='mt-1 md:hidden text-[28px] stroke-2 hover:text-blue-700 cursor-pointer' onClick={handleNav}>
                        <TbLayoutSidebarRightCollapseFilled />
                    </div>
                    <h3 className='font-cherryBombOne font-black text-3xl md:text-3xl lg:text-3xl'>RelayChat</h3>
                </div>

                {/* Mobile toggle */}
                <div className='flex text-2xl items-center ml-0 mr-0 md:hidden mb-5'>
					<div className={ nav ? `left-0 ease-in-out duration-400 fixed inset-0 flex bg-black/50 justify-center items-center z-50` : `-left-full`}>
						<div className={nav ? 'z-50 fixed left-0 w-[50%] h-full bg-white pl-5 pr-8 py-10 shadow-xl ease-in-out duration-400 md:hidden' : 'fixed -left-full'} ref={navCloseRef}>
							<div className='mt-10 z-50 absolute left-[94%] p-2 rounded-full bg-black cursor-pointer' onClick={handleNav}>
								<IoIosArrowBack className='text-base stroke-2 text-white'/>
							</div>
						
                            <div className='mt-10 md:mt-20'>
                                <Paths getLinkClass={getLinkClass} setNav={setNav}/>
                            </div>

                        </div>
                    </div>
			    </div>

                <div className='hidden md:block h-auto mt-10 md:mt-20'>
                    <Paths getLinkClass={getLinkClass} setNav={setNav}/>
                </div>

			</div>
		</div>
	)
}

export default Sidebar;
