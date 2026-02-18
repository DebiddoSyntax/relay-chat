'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import LoadingPage from '@/src/ui/reusable/LoadingPage'
import { useAuth } from '../auth/Store'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const user = useAuth((state) => state.user)
    const accessToken = useAuth((state) => state.accessToken)
    const isLoading = useAuth((state) => state.isLoading)
    const authInitialized = useAuth((state) => state.authInitialized)
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (!authInitialized) return
        if (!user || !accessToken) router.replace('/')
    }, [authInitialized, user, router])

    if (!authInitialized || isLoading) return <LoadingPage />
    if (!user) return null

    return <div className={`flex flex-col md:flex-row gap-0 pl-0 md:pl-6 lg:pl-10 w-full h-screen ${pathname == '/profile' ? 'overflow-y-auto' : 'overflow-hidden'}`}>{children}</div>
}

export default ProtectedRoute