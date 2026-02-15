import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import AddMember from './AddMember'
import ViewMemebers from './ViewMemebers'
import { IoClose } from "react-icons/io5";
import GroupImage from './GroupImage';


export interface MembersType{
    id: string, 
    email: string
}

function GroupInfo({ activeId, setGroupInfo }: { activeId: number | null, setGroupInfo: Dispatch<SetStateAction<boolean>>}) {

    const [members, setMembers] = useState<MembersType[]>([])
    
    return (
        <div className="fixed inset-0 flex bg-black/50 justify-center items-center z-50">
			<div className={`flex flex-col relative w-[80%] md:w-[60%] xl:w-[40%] 2xl:w-[30%] h-auto m-auto bg-white py-3 md:py-4 lg:py-5 px-5 rounded-md overflow-hidden`}>
                <div className='flex justify-between items-center'>
                    <p className='text-lg font-semibold'>
                        Group Info
                    </p>
                    <IoClose 
                        onClick={()=> setGroupInfo(false)} 
                        className='text-xl cursor-pointer'
                    />
                </div>
                
                <GroupImage activeId={activeId} />
                <AddMember activeId={activeId} setMembers={setMembers} />
                <ViewMemebers activeId={activeId} setMembers={setMembers} members={members} setGroupInfo={setGroupInfo}/>  
            </div>
        </div>
    )
}

export default GroupInfo
