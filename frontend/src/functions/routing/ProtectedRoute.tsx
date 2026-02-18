'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingPage from '@/src/ui/reusable/LoadingPage'
import { useAuth } from '../auth/Store'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const user = useAuth((state) => state.user)
    const accessToken = useAuth((state) => state.accessToken)
    const isLoading = useAuth((state) => state.isLoading)
    const authInitialized = useAuth((state) => state.authInitialized)
    const router = useRouter()

    useEffect(() => {
        if (!authInitialized) return
        if (!user || !accessToken) router.replace('/')
    }, [authInitialized, user, router])

    if (!authInitialized || isLoading) return <LoadingPage />
    if (!user) return null

    return <>{children}</>
}

export default ProtectedRoute