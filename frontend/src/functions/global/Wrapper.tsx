"use client"
import React from 'react'
import { usePathname } from 'next/navigation'
import Navbar from '../../ui/reusable/Navbar'
import { useGlobalSocket } from '@/src/functions/chats/useGlobalSocket'

function Wrapper({ children }: { children: React.ReactNode }) {
    useGlobalSocket()
    const pathname = usePathname()
    const paths = ['/login', '/signup', '/chats', '/groups', '/sydneyai', '/profile'].some(path => pathname === path || pathname.startsWith(`${path}/`))
    return (
        <>
            {!paths && <Navbar />}
            <main className='h-screen'>{ children }</main>
        </>
    )
}

export default Wrapper
