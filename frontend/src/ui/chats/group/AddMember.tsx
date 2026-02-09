"use client"
import api from '@/src/functions/auth/AxiosConfig';
import axios from 'axios';
import { useState } from 'react'
import LoadingModal from '../../reusable/LoadingModal';
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { IoClose } from "react-icons/io5";
import { useChat } from '@/src/functions/chats/chatStore';

interface AddMemberInputType{
	receiver: string
}


function AddMember({ activeId }: { activeId: number | null}) {

	const [newMember, setNewMember] = useState(false)
	const [updateModal, setUpdateModal] = useState(false)
	const [updatingState, setUpdatingState] = useState<"idle" | "loading" | "success" | "failure">("idle");
	const [errorMessage, setErrorMessage] = useState('')



	const schema = yup.object().shape({
		receiver: yup.string().required("Who do you want to add?").email('Enter a valid email'),
	}) as yup.ObjectSchema<AddMemberInputType>;

	
	const { register, handleSubmit, formState: { errors } } = useForm<AddMemberInputType>({
		resolver: yupResolver(schema)
	});
        
    const handleEditProduct = async(data: AddMemberInputType) => {

		const payload = {
			...data,
			groupId: activeId
		}

        try{
            setUpdateModal(true);
            setUpdatingState('loading')
            const response = await api.put(`/groupchat/add/`, payload);
            console.log('edit', response.data?.detail)
            if(response.status === 200){
                // reset()
                setUpdatingState('success')
            }

        } catch (err) {
			if (axios.isAxiosError(err)) {
				console.error("error", err.response?.data);
				setUpdatingState("failure");
				setErrorMessage(err.response?.data?.detail || "Something went wrong");
			} else {
				console.error("unexpected error", err);
				setUpdatingState("failure");
				setErrorMessage("An unexpected error occurred");
			}
		}
    }

	return (
		<div>

			<p className="px-5 py-3 cursor-pointer hover:bg-blue-700 hover:text-white" onClick={()=> setNewMember(true)}>Add Member</p>


			{newMember && (
				<div className="fixed inset-0 flex bg-black/50 justify-center items-center z-50">
					<div className={`flex flex-col relative w-96 md:w-[640px] h-auto m-auto bg-white py-3 md:py-4 lg:py-5 px-5 rounded-md overflow-hidden`}>
						<div className='flex justify-between items-center'>
							<p className='text-lg font-semibold'>
								{'Add new member'}
							</p>
							<IoClose 
								onClick={()=> setNewMember(false)} 
								className='text-xl cursor-pointer'
							/>
						</div>

						<form onSubmit={handleSubmit(handleEditProduct)} className=''>
							<div className="mb-5 mt-5 items-start text-left w-full">
								<label htmlFor="receiver" className="text-sm font-semibold">
									Email
								</label>
								<input autoComplete="off" type="text" id="receiver" placeholder='Enter the new member email'
									className=" w-full p-3 bg-gray-100 mt-2 border-border-lower rounded-md focus:outline-none focus:placeholder:opacity-0 placeholder:text-sm"
									{...register('receiver')}
								/>
								<p className="text-red-700 text-sm mt-2">
									{errors.receiver?.message && String(errors.receiver.message)}
								</p>
							</div>

							<div className='mt-10 flex justify-end'>
								<LoadingModal 
									modalOpen={updateModal} 
									setModalOpen={setUpdateModal} 
									modalState={updatingState}
									errorMessage={errorMessage}
									FailedMessage={'Failed to add member'}
									LoadingMessage={'Adding member'}
									SuccessMessage={'Member added'}
									ButtonText={'Add Member'}
									ButtonTextColor={'text-white'}
									ButtonColor={'bg-blue-700'}
									ButtonType={'submit'}
								/>
							</div>

						</form>
					</div>
				</div>
			)}
				
		</div>
	)
}

export default AddMember
