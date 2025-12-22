"use client"
import React from 'react'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

function Wrapper({ children }: { children: React.ReactNode }) {
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
