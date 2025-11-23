// Custom hook for WebSocket connection
import { useEffect, useState } from 'react'

// Type definitions for Socket.IO
type Socket = any

export const useSocket = (url: string) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    let socketInstance: Socket | null = null
    let mounted = true

    const initSocket = async () => {
      try {
        const { io } = await import('socket.io-client')
        
        if (!mounted) return

        const token = localStorage.getItem('jwt') || ''
        
        socketInstance = io(url, {
          auth: { token },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionAttempts: 5
        })

        socketInstance.on('connect', () => {
          console.log('WebSocket connected')
          if (mounted) setIsConnected(true)
        })

        socketInstance.on('disconnect', () => {
          console.log('WebSocket disconnected')
          if (mounted) setIsConnected(false)
        })

        socketInstance.on('connect_error', (error: any) => {
          console.error('WebSocket connection error:', error)
          if (mounted) setIsConnected(false)
        })

        if (mounted) setSocket(socketInstance)
      } catch (error) {
        console.error('Failed to initialize socket.io-client:', error)
        if (mounted) setSocket(null)
      }
    }

    initSocket()

    return () => {
      mounted = false
      if (socketInstance) {
        socketInstance.disconnect()
      }
    }
  }, [url])

  return { socket, isConnected }
}
