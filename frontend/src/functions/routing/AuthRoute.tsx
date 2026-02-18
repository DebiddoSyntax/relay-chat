'use client'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../auth/Store'

const AUTH_PATHS = ['/', '/signup']

const AuthRoute = ({ children }: { children: React.ReactNode }) => {
    const user = useAuth((state) => state.user)
    const isLoading = useAuth((state) => state.isLoading)
    const authInitialized = useAuth((state) => state.authInitialized)
    const router = useRouter()
    const pathname = usePathname()

    const isAuthPage = AUTH_PATHS.some(p => pathname === p)

    // Redirect logged-in users away from /login and /signup
    useEffect(() => {
        if (!authInitialized || isLoading) return
        if (user && isAuthPage) router.replace('/chats')
    }, [authInitialized, isLoading, user, isAuthPage, router])

    return <>{children}</>
}

export default AuthRoute