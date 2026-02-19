"use client"
import api from '@/src/functions/auth/AxiosConfig';
import axios from 'axios';
import { useState, Dispatch, SetStateAction } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { IoClose } from "react-icons/io5";
import { FiPlus } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MembersType } from './GroupInfo';



interface Props{
	activeId: number | null, 
	setMembers: Dispatch<SetStateAction<MembersType[]>>
}



function AddMember({ activeId, setMembers }: Props) {
	// new member states 
	const [newMember, setNewMember] = useState(false)
	const [loading, setLoading] = useState(false)
	const [errorMessage, setErrorMessage] = useState('')
	const [successMessage, setSuccessMessage] = useState('')

	const schema = yup.object({
		receiver: yup.string().required("Who do you want to add?").email('Enter a valid email'),
	})

	type AddMemberInputType= yup.InferType<typeof schema>;
	
	const { register, handleSubmit, formState: { errors }, reset } = useForm<AddMemberInputType>({
		resolver: yupResolver(schema)
	});
        
	// new member function call 
    const handleAddNewMember = async(data: AddMemberInputType) => {

		if(!activeId) {
			setErrorMessage('No id provided')
			return
		}

		const payload = {...data, groupId: activeId}

        try{
            setLoading(true);
            const response = await api.put(`/groupchat/add/`, payload);
            // console.log('edit', response.data)
            if(response.status === 200){
                reset()
				
				setMembers((prev) => {
					const exists = prev.some(m => m.id === response.data.id);
					if (exists) return prev;
					return [...prev, { id: response.data.id, email: response.data.email }];
				});

                setSuccessMessage('Member added')
            }

        } catch (err) {
			if (axios.isAxiosError(err)) {
				console.error("error", err.response?.data);
				setErrorMessage(err.response?.data?.detail || "Something went wrong");
			} else {
				console.error("unexpected error", err);
				setErrorMessage("An unexpected error occurred");
			}
		}finally{
			setLoading(false);
		}
    }

	return (
		
		<div className='mt-10'>
			{!newMember &&
				<div className='flex gap-2 items-center text-sm cursor-pointer text-primary'>
					<FiPlus className='text-base'/>
					<p className="" onClick={()=> setNewMember(true)}>Add Member</p>
				</div>
			}

			{newMember &&
				<form onSubmit={handleSubmit(handleAddNewMember)} className='w-full'>
					<p className="text-red-700 text-xs text-center mt-0">
						{errors.receiver?.message ? String(errors.receiver.message) : errorMessage ? errorMessage : ''}
					</p>
					<p className="text-green-700 text-xs text-center mt-0">
						{successMessage}
					</p>

					<div className='flex gap-2 items-center text-sm w-full'>
						<div className="mb-5 mt-5 items-start text-left w-full">
							<input autoComplete="off" type="text" id="receiver" placeholder='Enter the new member email'
								className=" w-full p-3 bg-gray-100 mt-0 rounded-sm focus:outline-none focus:placeholder:opacity-0 placeholder:text-xs"
								{...register('receiver')}
							/>
							
						</div>

						<button type='submit' className='py-3 px-8 w-40 text-xs text-center bg-primary text-white rounded-sm cursor-pointer'>
							{loading ? <AiOutlineLoading3Quarters className='mx-auto stroke-1 text-base text-center animate-spin'/> : 'Add'} 
						</button>

						<IoClose 
							onClick={()=> setNewMember(false)} 
							className='text-3xl cursor-pointer'
						/>

					</div>
				</form>
			}
		</div>
	)
}

export default AddMember
