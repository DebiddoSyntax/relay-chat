"use client"
import React, { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Navbar from '../../ui/reusable/Navbar'
import { useGlobalSocket } from '@/src/functions/chats/useGlobalSocket'
// import useRingTone from '@/src/ui/chats/call/useRingTone'
// import { unlockAudio } from '@/src/ui/chats/call/unlockAudio'
import AuthRoute from '../routing/AuthRoute'
import { useNavigation } from './useNavigation'

const paths = ['/login', '/signup', '/chats', '/groups', '/sydneyai', '/profile']

function Wrapper({ children }: { children: React.ReactNode }) {
    useGlobalSocket()
    const pathname = usePathname()
    const router = useRouter();


    useEffect(() => {
        useNavigation((path) => router.push(path));
    }, [router]);
    // useRingTone()
    // unlockAudio()
    const checkPaths = paths.some(path => pathname === path || pathname.startsWith(`${path}/`))
    
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