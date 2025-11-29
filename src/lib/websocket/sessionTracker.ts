import { io, Socket } from 'socket.io-client'

export interface SessionUpdate {
  sessionId: string
  lastActive: number
  ip: string
  location: string
  deviceType: string
  deviceName: string
  browser: string
  os: string
  isCurrent: boolean
}

export interface SessionEvent {
  type: 'session_update' | 'session_created' | 'session_revoked' | 'session_expired' | 'connection'
  data: SessionUpdate | SessionUpdate[] | { connected: boolean; type?: string }
}

class SessionTracker {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 2000
  private listeners: Map<string, Set<(event: SessionEvent) => void>> = new Map()
  private isConnected = false
  private userId: string | null = null

  constructor() {
    if (typeof window === 'undefined') return
    this.initializeSocket()
  }

  private initializeSocket() {
    // In production, only connect if WS URL is configured
    const wsUrl = import.meta.env.VITE_WS_URL || (import.meta.env.PROD ? '' : 'ws://localhost:3001')
    if (!wsUrl) return // Skip WebSocket in production without config
    
    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      autoConnect: false
    })

    this.socket.on('connect', () => {
      this.isConnected = true
      this.reconnectAttempts = 0
      console.log('[SessionTracker] Connected to WebSocket')
      
      if (this.userId) {
        this.socket?.emit('join_session_room', { userId: this.userId })
      }

      this.emit('session_update', { type: 'connection', connected: true })
    })

    this.socket.on('disconnect', () => {
      this.isConnected = false
      console.log('[SessionTracker] Disconnected from WebSocket')
      this.emit('session_update', { type: 'connection', connected: false })
    })

    this.socket.on('connect_error', (error) => {
      console.error('[SessionTracker] Connection error:', error)
      this.reconnectAttempts++
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[SessionTracker] Max reconnection attempts reached')
      }
    })

    this.socket.on('session_update', (data: SessionUpdate | SessionUpdate[]) => {
      this.emit('session_update', {
        type: 'session_update',
        data
      })
    })

    this.socket.on('session_created', (data: SessionUpdate) => {
      this.emit('session_created', {
        type: 'session_created',
        data
      })
    })

    this.socket.on('session_revoked', (data: { sessionId: string }) => {
      this.emit('session_revoked', {
        type: 'session_revoked',
        data: data as any
      })
    })

    this.socket.on('session_expired', (data: { sessionId: string }) => {
      this.emit('session_expired', {
        type: 'session_expired',
        data: data as any
      })
    })
  }

  connect(userId: string) {
    if (!this.socket) {
      this.initializeSocket()
    }
    
    this.userId = userId
    
    if (!this.isConnected && this.socket) {
      this.socket.connect()
    } else if (this.socket && this.isConnected) {
      this.socket.emit('join_session_room', { userId })
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
    }
    this.userId = null
    this.isConnected = false
  }

  updateActivity() {
    if (this.socket && this.isConnected && this.userId) {
      this.socket.emit('update_activity', {
        userId: this.userId,
        timestamp: Date.now()
      })
    }
  }

  revokeSession(sessionId: string) {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Not connected to WebSocket'))
        return
      }

      this.socket.emit('revoke_session', { sessionId }, (response: any) => {
        if (response.success) {
          resolve(response)
        } else {
          reject(new Error(response.error || 'Failed to revoke session'))
        }
      })
    })
  }

  revokeAllSessions() {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Not connected to WebSocket'))
        return
      }

      this.socket.emit('revoke_all_sessions', { userId: this.userId }, (response: any) => {
        if (response.success) {
          resolve(response)
        } else {
          reject(new Error(response.error || 'Failed to revoke sessions'))
        }
      })
    })
  }

  on(event: string, callback: (data: SessionEvent) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)

    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  getConnectionStatus(): { connected: boolean; attempts: number } {
    return {
      connected: this.isConnected,
      attempts: this.reconnectAttempts
    }
  }
}

export const sessionTracker = new SessionTracker()

if (typeof window !== 'undefined') {
  let activityTimer: any = null

  const trackActivity = () => {
    sessionTracker.updateActivity()
  }

  const resetActivityTimer = () => {
    if (activityTimer) clearTimeout(activityTimer)
    activityTimer = setTimeout(trackActivity, 5000)
  }

  const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']
  events.forEach(event => {
    window.addEventListener(event, resetActivityTimer, { passive: true })
  })

  setInterval(trackActivity, 30000)
}
