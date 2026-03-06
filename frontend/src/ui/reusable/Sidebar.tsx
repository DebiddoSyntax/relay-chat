"use client"
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useChat } from '@/src/functions/chats/chatStore';
import { useDarkMode } from '@/src/functions/global/DarkModeContext';
import useClicktoClose from '@/src/functions/global/useClicktoClose';
import Paths from './Paths';
import Theme from './ThemeButton'
import { IoIosArrowBack } from "react-icons/io";
import { TbLayoutSidebarRightCollapseFilled } from "react-icons/tb";




function Sidebar() {

	const pathname = usePathname();
	const chatOpen = useChat((state)=> state.chatOpen)
	
	const { isDarkMode } = useDarkMode()
	
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
				: isDarkMode ? 'hover:text-foreground hover:bg-gray-hover/10 text-gray-500' : 'hover:text-foreground hover:bg-gray-hover/50 text-gray-500';
		} else {
			return normalizedPathname?.startsWith(normalizedPath) 
				? 'bg-gray-300 text-black font-semibold' 
				: isDarkMode ? 'hover:text-foreground hover:bg-gray-hover/10 text-gray-500' : 'hover:text-foreground hover:bg-gray-hover/50 text-gray-500';
		}
	};

	const navCloseRef = useClicktoClose(()=> {
		setNav(false)
	})


  	return (
    	<div className='pl-0 md:px-0 pt-0 md:pt-0 md:h-screen z-50'>

			{/* Sidebar */}
			<div className={`w-full md:w-40 lg:w-48 2xl:w-72 ${chatOpen ? 'pr-0 md:pr-5 lg:pr-6 2xl:pr-10 pt-5 md:pt-5 border-border border-b-0 md:border-b-0 border-r-0 md:border-r-2' : 'pr-5 lg:pr-6 2xl:pr-10 pt-5 md:pt-5 border-b-2 md:border-b-0 border-r-0 md:border-r-2'} h-full z-20  border-border`}> 
				<div className='flex flex-col justify-between h-full'>
					<div className='h-full'>
						<div className={`flex gap-1 items-center ${chatOpen ? 'pl-0 md:pl-0 pb-0 md:pb-0 md:py-0' : 'pl-5 md:pl-0 pb-2 md:pb-5 md:py-'}`}>
							<div className='mt-1 md:hidden text-[28px] stroke-2 hover:text-primary cursor-pointer' onClick={handleNav}>
								<TbLayoutSidebarRightCollapseFilled />
							</div>
							<h3 className={`${chatOpen && 'hidden md:block'} font-cherryBombOne font-black text-3xl md:text-3xl lg:text-3xl`}>RelayChat</h3>
						</div>

						{/* Mobile toggle */}
						<div className='flex text-2xl items-center ml-0 mr-0 md:hidden mb-5'>
							<div className={ nav ? `left-0 ease-in-out duration-400 fixed inset-0 flex ${isDarkMode ? 'bg-foreground/20' : 'bg-foreground/50'} justify-center items-center z-50` : `-left-full`}>
								<div className={nav ? 'z-50 fixed left-0 w-[50%] h-full bg-background pl-5 pr-8 py-10 shadow-xl ease-in-out duration-400 md:hidden' : 'fixed -left-full'} ref={navCloseRef}>
									<div className='flex flex-col justify-between h-full'>
										<div className='h-full'>
											<div className='mt-10 z-50 absolute left-[94%] p-2 rounded-full bg-foreground cursor-pointer' onClick={handleNav}>
												<IoIosArrowBack className='text-base stroke-2 text-background'/>
											</div>
										
											<div className='mt-20 md:mt-20'>
												<Paths getLinkClass={getLinkClass} setNav={setNav}/>
											</div>
										</div>

										<div>
											<Theme />
										</div>
									</div>

								</div>
							</div>
						</div>

						<div className='hidden md:block h-auto mt-10 md:mt-20'>
							<Paths getLinkClass={getLinkClass} setNav={setNav}/>
						</div>
					</div>

					<div className='hidden md:block mb-16'>
						<Theme />
					</div>
                </div>

			</div>
		</div>
	)
}

export default Sidebar;
