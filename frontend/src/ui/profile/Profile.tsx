"use client"
import { useAuth } from '@/src/functions/auth/Store'
import { useEffect, useState } from 'react';
import { FaUserCircle } from "react-icons/fa";
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"
import { FiEdit } from "react-icons/fi";
import Upload from './Upload';
import Security from './Security'
import ProfileDetails from './ProfileDetails';




function Profile() {
    
    

    return (
        <div className=' bg-[#f2f2f2] px-5 md:px-10 pb-5 md:pb-10 pt-10 md:pt-16 h-screen'>
			<div className=" mx-auto bg-white shadow-sm w-full py-10 rounded-md h-auto">
                <ProfileDetails />
                <Security />
            </div>
		</div>
    )
}

export default Profile
