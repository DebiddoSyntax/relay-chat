import React from 'react'
import { LuLoader } from "react-icons/lu";
import { ImCancelCircle } from "react-icons/im";
import { FaRegCheckCircle } from "react-icons/fa"
import { IoClose } from "react-icons/io5";
import { TiWarning } from "react-icons/ti";

interface ModalProps{
    modalState: "idle" | "loading" | "success" | "failure" | "confirm"
    modalOpen: boolean
    setModalOpen: (val: boolean) => void
    handleFetch?: ()=> void
    handleConfirm?: ()=> void
    LoadingMessage: string
    FailedMessage: string
    SuccessMessage: string
    ConfirmHeadingMessage?: string
    ConfirmSubHMessage?: string
    ButtonText: string
    ButtonTextColor: string
    ButtonColor: string
    errorMessage?: string
    ButtonType: "submit" | "reset" | "button" | undefined
}



function LoadingModal({ errorMessage, modalOpen, setModalOpen, modalState, handleConfirm, handleFetch, FailedMessage, LoadingMessage, SuccessMessage, ConfirmHeadingMessage, ConfirmSubHMessage, ButtonText, ButtonTextColor, ButtonColor, ButtonType }: ModalProps) {
    
        const callFunction = () => {
            if(handleFetch){
                handleFetch()
            }
        }

        const ConfirmOrFetch = ()=> {
            if(handleConfirm){
                handleConfirm()
            }else{
                callFunction()
            }
        }


    return (
        <div className='flex flex-col justify-center text-center items-center w-full h-full'>
            <button type={ButtonType} disabled={modalState == 'loading'}  onClick={ConfirmOrFetch} className={`flex gap-2 item-center cursor-pointer w-28 justify-center py-3 px-5 ${ButtonColor} ${ButtonTextColor} text-sm font-semibold rounded-sm`}>
                <p className='text-sm'>{ButtonText}</p>
            </button>

            {modalOpen && (
                <div className="fixed inset-0 flex bg-black/50 justify-center items-center z-50">
                    <div className={`flex flex-col ${modalState == 'success' || modalState == 'failure'  || modalState == 'confirm'  ? 'justify-between' : 'justify-center'} relative ${modalState == 'confirm' && 'w-72 md:w-80 xl:w-96 h-72 md:h-72 xl:h-72'} w-60 md:w-72 xl:w-96 h-40 md:h-52 xl:h-64 m-auto bg-white py-5 px-5 rounded-md overflow-hidden`} 
                        // ref={modalRef}
                    >
                        
                        {modalState == 'success' || modalState == 'failure'  || modalState == 'confirm'  ? (
                            <div className='flex justify-end items-end w-full'>
                                <div className='text-2xl cursor-pointer'  onClick={()=> setModalOpen(false)}>
                                    <IoClose />
                                </div>
                            </div>
                        ) : ''}

                        <div className='flex flex-col justify-center h-full'>
                        
                            {modalState == 'loading' && (
                                <div className="flex flex-col gap-6 justify-center bg-white">
                                    <div className="flex justify-center">
                                        <LuLoader className="animate-spin text-4xl md:text-5xl xl:text-6xl"/>
                                    </div>
                                    <p className="text-sm font-semibold text-center">
                                        {LoadingMessage}
                                    </p>
                                </div>
                            )}

                            {modalState == 'failure' && (
                                <div className="flex flex-col gap-6 justify-center bg-white">
                                    <div className="flex justify-center">
                                        <ImCancelCircle className="text-red-700 text-4xl md:text-5xl xl:text-6xl"/>
                                    </div>
                                    <p className="text-sm font-semibold text-center">
                                        {FailedMessage}
                                    </p>
                                    {errorMessage && (
                                        <p className="text-sm font-semibold text-center">
                                            {errorMessage}
                                        </p>
                                    )}
                                </div>
                            )}

                            {modalState == 'confirm' && (
                                <div className="flex flex-col gap-6 justify-center w-full bg-white">
                                    <div className=''>
                                        <p className='text-sm font-semibold text-center'>{ConfirmHeadingMessage}</p>
                                        <p className='mt-2 text-xs font-medium text-gray-600 text-center'>{ConfirmSubHMessage}</p>
                                    </div>

                                    <div className='text-red-700 bg-red-100 px-3 py-3 rounded-sm'>
                                        <div className='flex gap-2 items-center'>
                                            <TiWarning className='text-sm'/>
                                            <p className="text-sm font-semibold text-center">
                                                Warning
                                            </p>
                                        </div>

                                        <p className="text-xs font-medium text-left">
                                            Please rethink your decision because you will not be able to undo this action
                                        </p>
                                    </div>
                                    <div className='grid grid-cols-2 gap-2 items-center w-full'>
                                        <button type='button' className='px-3 py-3 bg-white border-2 border-border-lower text-xs rounded-sm font-semibold cursor-pointer' onClick={()=> setModalOpen(false)}>Cancel</button>
                                        <button type='button' className='px-3 py-3 bg-red-700 text-xs rounded-sm text-white font-semibold cursor-pointer' onClick={callFunction}>Confirm</button>
                                    </div>
                                </div>
                            )}

                            {modalState == 'success' && (
                                <div className="flex flex-col gap-6 justify-center">
                                    <div className="flex justify-center">
                                        <FaRegCheckCircle className=" text-green-700 text-4xl md:text-5xl xl:text-6xl"/>
                                    </div>
                                    <p className="text-sm font-semibold text-center">
                                        {SuccessMessage}
                                    </p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default LoadingModal