"use client"
import Security from './Security'
import ProfileDetails from './ProfileDetails';




function Profile() {
    
    

    return (
        <div className=' bg-gray-bg px-5 md:px-10 pb-40 md:pb-10 pt-12 md:pt-20 h-dvh flex flex-col overflow-y-auto hide-scrollbar'>
			<div className=" mx-auto bg-background shadow-sm w-full py-5 md:py-8 rounded-md h-auto">
                <ProfileDetails />
                <Security />
            </div>
		</div>
    )
}

export default Profile
