'use client'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../auth/Store'

const AUTH_PATHS = ['/', '/signup', '/set-password']

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    const user = useAuth((state) => state.user)
    const isLoading = useAuth((state) => state.isLoading)
    const authInitialized = useAuth((state) => state.authInitialized)
    const isFirst = useAuth((state)=> state.isFirst)
    const router = useRouter()
    const pathname = usePathname()

    const isAuthPage = AUTH_PATHS.some(p => pathname === p)

    // Redirect logged-in users away from /login and /signup
    useEffect(() => {
        if (!authInitialized || isLoading) return
        if (user && isAuthPage && !isFirst) router.replace('/chats')
    }, [authInitialized, isLoading, user, isAuthPage, router, isFirst])

    return <>{children}</>
}

export default AuthRoute