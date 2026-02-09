import Link from 'next/link';
import { FaUsers } from "react-icons/fa";
import { HiUser } from "react-icons/hi2";
import { PiChatTeardropDotsFill } from "react-icons/pi";
import { RiChatSmileAiFill } from "react-icons/ri";
import { IoCheckmarkDoneCircle } from "react-icons/io5";

interface PathPropsType {
    getLinkClass: (path: string, exact?: boolean)=> string, 
    setNav:(val: boolean)=> void
}



function Paths({ getLinkClass, setNav }: PathPropsType) {
    
    return (
        <div className=''>
            {/* chats */}
            <Link href="/chats" onClick={()=> setNav(false)}>
                <div className={`flex items-center gap-1 lg:gap-2 mb-5 cursor-pointer py-4 px-2 xl:px-4 w-full rounded-md mt-5 ${getLinkClass('/chats')}`}>
                    <PiChatTeardropDotsFill className={`text-base xl:text-lg 2xl:text-xl ${getLinkClass('/chats')}`} />
                    <p className="text-sm 2xl:text-base font-bold">Chats</p>
                </div>
            </Link>

            {/* groups */}
            <Link href="/groups" onClick={()=> setNav(false)}>
                <div className={`flex items-center gap-1 lg:gap-2 mb-5 cursor-pointer py-4 px-2 xl:px-4 w-full rounded-md mt-5 ${getLinkClass('/groups')}`}>
                    <FaUsers className={`text-base xl:text-lg 2xl:text-xl ${getLinkClass('/groups')}`} />
                    <p className="text-sm 2xl:text-base font-bold">Groups</p>
                </div>
            </Link>

            {/* aichat */}
            <Link href="/sydneyai" onClick={()=> setNav(false)}>
                <div className={`flex items-center gap-1 lg:gap-2 mb-5 cursor-pointer py-4 px-2 xl:px-4 w-full rounded-md mt-5 ${getLinkClass('/sydneyai')}`}>
                    <RiChatSmileAiFill className={`text-base xl:text-lg 2xl:text-xl ${getLinkClass('/sydneyai')}`} />
                    <div className='flex gap-1 items-center text-sm'>
                        <p className="text-sm 2xl:text-base font-bold">Sydney AI</p>
                        <IoCheckmarkDoneCircle className='text-blue-700' />
                    </div>
                </div>
            </Link>

            {/* Profile */}
            <Link href="/profile" onClick={()=> setNav(false)}>
                <div className={`flex items-center gap-1 lg:gap-2 mb-5 cursor-pointer py-4 px-2 xl:px-4 w-full rounded-md mt-5 ${getLinkClass('/profile')}`}>
                    <HiUser className={`text-base xl:text-lg 2xl:text-xl ${getLinkClass('/profile')}`} />
                    <p className="text-sm 2xl:text-base font-bold">Profile</p>
                </div>
            </Link>
        </div>
)
}

export default Paths
