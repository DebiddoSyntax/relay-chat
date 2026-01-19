"use client"
import React from 'react'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import { useGlobalSocket } from '@/src/functions/chats/useGlobalSocket'

function Wrapper({ children }: { children: React.ReactNode }) {
    useGlobalSocket()
    const pathname = usePathname()
    const paths = ['/login', '/signup', '/chats', '/groups'].some(path => pathname === path || pathname.startsWith(`${path}/`))
    return (
        <>
            {!paths && <Navbar />}
            <main>{ children }</main>
        </>
    )
}

export default Wrapper
