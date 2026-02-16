'use client'
import { useEffect, useState } from "react"
import { useAuth } from "../auth/Store"

export const connectSocket = (url: string, mount: boolean) => {
    const refreshAccessToken = useAuth((state) => state.refreshAccessToken)
    const logout = useAuth((state) => state.logout)
    const token = useAuth((state) => state.accessToken)

    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [socketError, setSocketError] = useState(false)
    const [socketErrorMessage, setSocketErrorMessage] = useState('')
    const [socketSuccess, setSocketSuccess] = useState(false)
    const [socketSuccessMessage, setSocketSuccessMessage] = useState('')
    const [socketReady, setSocketReady] = useState(false)

    useEffect(() => {
        if (!token || !mount) return

        let ws: WebSocket
        let reconnectTimeout: NodeJS.Timeout
        let isCleanup = false

        const connect = () => {
            try {
                ws = new WebSocket(url)

                ws.addEventListener("open", () => {
                    console.log('WebSocket opened, waiting for auth_required...')
                    setSocketError(false)
                    setSocketSuccess(false)
                })

                ws.addEventListener("message", async (event) => {
                    try {
                        const data = JSON.parse(event.data)
                        console.log('WebSocket message received:', data.type)

                        // Handle initial auth_required message from server
                        if (data.type === 'auth_required') {
                            console.log('Received auth_required, sending token...')
                            ws.send(JSON.stringify({
                                type: 'auth',
                                token: token,
                            }))
                            return
                        }

                        // Handle auth response
                        if (data.type === 'auth') {
                            if (data.success) {
                                console.log('Authentication successful')
                                setSocketSuccess(true)
                                setSocketSuccessMessage('Authenticated')
                                setSocketError(false)
                                setSocketReady(true)
                            } else {
                                // Handle auth failures
                                const error = data.error
                                console.log("Auth failed, reason:", error)

                                if (error === 'expired') {
                                    console.log('Token expired, attempting refresh...')
                                    try {
                                        const newToken = await refreshAccessToken()
                                        console.log('Token refreshed, resending auth...')
                                        ws.send(JSON.stringify({
                                            type: 'auth',
                                            token: newToken,
                                        }))
                                    } catch (refreshError) {
                                        console.error('Token refresh failed:', refreshError)
                                        setSocketError(true)
                                        setSocketErrorMessage('Failed to refresh token')
                                        setSocketSuccess(false)
                                        ws.close()
                                    }
                                } else if (error === 'invalid') {
                                    console.log('Invalid token, logging out...')
                                    logout()
                                    setSocketError(true)
                                    setSocketErrorMessage('Invalid token')
                                    setSocketSuccess(false)
                                    ws.close()
                                } else {
                                    setSocketError(true)
                                    setSocketErrorMessage(`Authentication failed: ${error}`)
                                    setSocketSuccess(false)
                                    ws.close()
                                }
                            }
                            return
                        }


                        // Handle error messages
                        if (data.type === 'error') {
                            console.error('Server error:', data.error)
                            setSocketError(true)
                            setSocketErrorMessage(data.error)
                            return
                        }

                    } catch (parseError) {
                        console.error('Failed to parse message:', parseError, event.data)
                    }
                })

                ws.addEventListener("error", (event) => {
                    console.error('WebSocket error:', event)
                    setSocketError(true)
                    setSocketErrorMessage('WebSocket connection error')
                    setSocketSuccess(false)
                })

                ws.addEventListener("close", (event) => {
                    console.log('WebSocket closed:', event.code, event.reason)
                    setSocketSuccess(false)
                    setSocketReady(false)

                    // Don't reconnect if this was a cleanup
                    if (isCleanup) return

                    // Reconnect after 5 seconds (reduced from 30s for faster feedback)
                    reconnectTimeout = setTimeout(() => {
                        console.log('Attempting to reconnect...')
                        connect()
                    }, 5000)
                })

                setSocket(ws)
            } catch (error) {
                console.error('Failed to create WebSocket:', error)
                setSocketError(true)
                setSocketErrorMessage('Failed to create WebSocket connection')
            }
        }

        connect()

        return () => {
            isCleanup = true
            clearTimeout(reconnectTimeout)
            ws?.close()
        }

    }, [token, refreshAccessToken, logout, url, mount])

    return { 
        socket, 
        socketError, 
        socketErrorMessage, 
        socketSuccess, 
        socketSuccessMessage,
        socketReady 
    }
}