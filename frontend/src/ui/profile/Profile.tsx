"use client"
import Security from './Security'
import ProfileDetails from './ProfileDetails';




function Profile() {
    
    

    return (
        <div className=' bg-[#f2f2f2] px-5 md:px-10 pb-40 md:pb-10 pt-12 md:pt-20 h-dvh flex flex-col overflow-y-auto custom-scrollbar'>
			<div className=" mx-auto bg-white shadow-sm w-full py-5 md:py-8 rounded-md h-auto">
                <ProfileDetails />
                <Security />
            </div>
		</div>
    )
}

export default Profile
