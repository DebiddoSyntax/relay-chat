"use client"
import Security from './Security'
import ProfileDetails from './ProfileDetails';




function Profile() {
    
    

    return (
        <div className=' bg-[#f2f2f2] px-5 md:px-10 pb-5 md:pb-10 pt-10 md:pt-28 h-full overflow-y-auto'>
			<div className=" mx-auto bg-white shadow-sm w-full py-5 md:py-10 rounded-md h-full">
                <ProfileDetails />
                <Security />
            </div>
		</div>
    )
}

export default Profile
