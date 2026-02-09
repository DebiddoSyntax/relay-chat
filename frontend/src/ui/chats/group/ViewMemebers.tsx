import api from '@/src/functions/auth/AxiosConfig';
import { useEffect, useState } from 'react'
import { IoClose } from "react-icons/io5";

function ViewMemebers({ activeId }: { activeId: number | null}) {
    const [viewMember, setViewMember] = useState(false)
    const [members, setMembers] = useState<{id: string, email: string}[] | null>(null)
  

    useEffect(()=> {
        const fetchMembers = async () => {
            try{
                const response = await api.get(`/groupchat/${activeId}/members/`)
                console.log(response.data)
                setMembers(response.data)
            } catch(e){
                console.log(e)
            }
        }

        fetchMembers()
    }, [activeId])

    return (
        <div>

            <p className="px-5 py-3 border-t-2 border-gray-100 cursor-pointer hover:bg-blue-700 hover:text-white"  onClick={()=> setViewMember(true)}>View Members</p>


			{viewMember && (
				<div className="fixed inset-0 flex bg-black/50 justify-center items-center z-50">
					<div className={`flex flex-col relative w-96 md:w-[640px] h-auto m-auto bg-white py-3 md:py-4 lg:py-5 px-5 rounded-md overflow-hidden`}>
						<div className='flex justify-between items-center'>
                            <div className='flex gap-3 items-center'>
                                <p className='text-lg font-semibold'>
								    Group members
							    </p>
                                <p className='text-sm text-blue-700 font-semibold'>
								    {members?.length}
							    </p>
                            </div>
							
							<IoClose 
								onClick={()=> setViewMember(false)} 
								className='text-xl cursor-pointer'
							/>
						</div>

						<div className='mt-10 h-96 flex overflow-hidden'>
                            <div className='flex flex-col flex-1 overflow-y-auto pr-0 scrollbar-hide gap-3'>
                                {members?.map((m, i)=> <p key={i} className='text-sm font-semibold'>{m.email}</p>)}
                            </div>
                        </div>
					</div>
				</div>
			)}
				
		</div>
    )
}

export default ViewMemebers
