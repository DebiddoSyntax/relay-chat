"use client"
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGlobalSocket } from '@/src/functions/chats/useGlobalSocket'
// import useRingTone from '@/src/ui/chats/call/useRingTone'
import { unlockAudio } from '@/src/ui/chats/call/unlockAudio'
import AuthRoute from '../routing/AuthRoute'
import { useNavigation } from './useNavigation'


function Wrapper({ children }: { children: React.ReactNode }) {
    useGlobalSocket()
    const router = useRouter();


    useEffect(() => {
        useNavigation((path) => router.push(path));
    }, [router]);
    // unlockAudio()
    
    return (
        // <div onClick={unlockAudio}>
        <div>
            <AuthRoute>
                <main className='h-dvh'>{ children }</main>
            </AuthRoute>
        </div>
    )
}

export default Wrapper