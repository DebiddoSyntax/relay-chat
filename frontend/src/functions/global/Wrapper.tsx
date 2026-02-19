"use client"
import React from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '../../ui/reusable/Navbar'
import { useGlobalSocket } from '@/src/functions/chats/useGlobalSocket'
// import useRingTone from '@/src/ui/chats/call/useRingTone'
// import { unlockAudio } from '@/src/ui/chats/call/unlockAudio'
import AuthRoute from '../routing/AuthRoute'

function Wrapper({ children }: { children: React.ReactNode }) {
    useGlobalSocket()
    // useRingTone()
    // unlockAudio()

    const pathname = usePathname()
    const paths = ['/login', '/signup', '/chats', '/groups', '/sydneyai', '/profile'].some(path => pathname === path || pathname.startsWith(`${path}/`))
    
    return (
        // <div onClick={unlockAudio}>
        <div>
            <AuthRoute>
                {/* {!paths && <Navbar />} */}
                <main className='h-dvh'>{ children }</main>
                {/* <main className='h-dvh overflow-y-auto'>{ children }</main> */}
            </AuthRoute>
        </div>
    )
}

export default Wrapper