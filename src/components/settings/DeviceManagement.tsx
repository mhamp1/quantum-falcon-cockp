import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { 
  DeviceMobile,
  Desktop,
  Laptop,
  MapPin,
  Trash,
  CheckCircle,
  WarningCircle,
  Globe,
  Shield,
  Clock,
  WifiHigh,
  WifiSlash
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { settingsAPI } from '@/lib/api/settings-api'
import { sessionTracker, SessionEvent } from '@/lib/websocket/sessionTracker'

interface DeviceSession {
  id: string
  deviceType: 'mobile' | 'desktop' | 'laptop' | 'tablet'
  deviceName: string
  browser: string
  os: string
  ip: string
  location: string
  lastActive: number
  loginTime: number
  isCurrent: boolean
}

export default function DeviceManagement() {
  const [auth] = useKV<any>('user-auth', null)
  const [sessions, setSessions] = useKV<DeviceSession[]>('user-sessions', [
    {
      id: 'current',
      deviceType: 'desktop',
      deviceName: 'Chrome on Windows',
      browser: 'Chrome 120',
      os: 'Windows 11',
      ip: '192.168.•.•',
      location: 'San Francisco, CA, USA',
      lastActive: Date.now(),
      loginTime: Date.now() - 3600000,
      isCurrent: true
    },
    {
      id: 'session-2',
      deviceType: 'mobile',
      deviceName: 'Safari on iPhone',
      browser: 'Safari 17',
      os: 'iOS 17.2',
      ip: '10.0.•.•',
      location: 'New York, NY, USA',
      lastActive: Date.now() - 7200000,
      loginTime: Date.now() - 86400000,
      isCurrent: false
    },
    {
      id: 'session-3',
      deviceType: 'laptop',
      deviceName: 'Firefox on MacOS',
      browser: 'Firefox 121',
      os: 'MacOS 14',
      ip: '172.16.•.•',
      location: 'London, UK',
      lastActive: Date.now() - 43200000,
      loginTime: Date.now() - 172800000,
      isCurrent: false
    }
  ])

  const [isRevoking, setIsRevoking] = useState<{ [key: string]: boolean }>({})
  const [isRevokingAll, setIsRevokingAll] = useState(false)
  const [revokeCountdown, setRevokeCountdown] = useState(0)
  const [wsConnected, setWsConnected] = useState(false)

  useEffect(() => {
    if (auth?.userId) {
      sessionTracker.connect(auth.userId)

      const unsubscribeUpdate = sessionTracker.on('session_update', (event: SessionEvent) => {
        if (event.type === 'connection') {
          setWsConnected((event.data as any).connected)
        } else if (event.type === 'session_update' && event.data) {
          const updates = Array.isArray(event.data) ? event.data : [event.data]
          setSessions((current) => {
            if (!current) return []
            return current.map(session => {
              const update = updates.find(u => 'sessionId' in u && u.sessionId === session.id)
              return update && 'lastActive' in update ? { ...session, lastActive: update.lastActive } : session
            })
          })
        }
      })

      const unsubscribeCreated = sessionTracker.on('session_created', (event: SessionEvent) => {
        if (!Array.isArray(event.data)) {
          const newSession = event.data as any
          setSessions((current) => {
            if (!current) return [newSession]
            if (current.some(s => s.id === newSession.sessionId)) return current
            return [...current, {
              id: newSession.sessionId,
              deviceType: newSession.deviceType,
              deviceName: newSession.deviceName,
              browser: newSession.browser,
              os: newSession.os,
              ip: newSession.ip,
              location: newSession.location,
              lastActive: newSession.lastActive,
              loginTime: newSession.lastActive,
              isCurrent: false
            }]
          })
          
          toast.info('New Session Detected', {
            description: `${newSession.deviceName} from ${newSession.location}`,
            className: 'border-primary/50 bg-background/95'
          })
        }
      })

      const unsubscribeRevoked = sessionTracker.on('session_revoked', (event: SessionEvent) => {
        const data = event.data as any
        setSessions((current) => {
          if (!current) return []
          return current.filter(s => s.id !== data.sessionId)
        })
      })

      return () => {
        unsubscribeUpdate()
        unsubscribeCreated()
        unsubscribeRevoked()
      }
    }
  }, [auth?.userId, setSessions])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!wsConnected) {
        setSessions((current) => {
          if (!current) return []
          return current.map(session => ({
            ...session,
            lastActive: session.isCurrent ? Date.now() : session.lastActive
          }))
        })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [setSessions, wsConnected])

  useEffect(() => {
    if (revokeCountdown > 0) {
      const timer = setTimeout(() => {
        setRevokeCountdown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [revokeCountdown])

  const revokeSession = async (sessionId: string) => {
    if (sessionId === 'current') {
      toast.error('✗ Cannot revoke current session', {
        description: 'You cannot log out from this device using this action',
        className: 'border-destructive/50 bg-background/95'
      })
      return
    }

    const session = sessions?.find(s => s.id === sessionId)
    
    if (window.confirm(`Revoke session from "${session?.deviceName}"? The device will be logged out immediately.`)) {
      setIsRevoking(prev => ({ ...prev, [sessionId]: true }))
      
      toast.loading('Revoking session...', { 
        id: `revoke-${sessionId}`,
        className: 'border-primary/50 bg-background/95'
      })

      try {
        await settingsAPI.revokeSession(sessionId)
        
        setSessions((current) => {
          if (!current) return []
          return current.filter(s => s.id !== sessionId)
        })
        
        toast.dismiss(`revoke-${sessionId}`)
        toast.success('✓ Session revoked', {
          description: `${session?.deviceName} has been logged out`,
          className: 'border-primary/50 bg-background/95',
          duration: 4000
        })
      } catch (error) {
        toast.dismiss(`revoke-${sessionId}`)
        toast.error('✗ Failed to revoke session')
      } finally {
        setIsRevoking(prev => ({ ...prev, [sessionId]: false }))
      }
    }
  }

  const revokeAllOther = async () => {
    const otherSessions = sessions?.filter(s => !s.isCurrent) || []
    
    if (otherSessions.length === 0) {
      toast.info('No other sessions', {
        description: 'There are no other active sessions to revoke',
        className: 'border-primary/50 bg-background/95'
      })
      return
    }

    if (window.confirm(`Revoke all ${otherSessions.length} other session(s)? All other devices will be logged out immediately.`)) {
      setIsRevokingAll(true)
      setRevokeCountdown(5)
      
      toast.loading('Revoking all sessions...', {
        id: 'revoke-all',
        className: 'border-primary/50 bg-background/95'
      })

      try {
        await settingsAPI.revokeAllSessions()
        
        setSessions((current) => {
          if (!current) return []
          return current.filter(s => s.isCurrent)
        })
        
        toast.dismiss('revoke-all')
        toast.success('✓ All sessions revoked', {
          description: 'Only your current device remains logged in',
          className: 'border-primary/50 bg-background/95',
          duration: 5000
        })
      } catch (error) {
        toast.dismiss('revoke-all')
        toast.error('✗ Failed to revoke sessions')
      } finally {
        setIsRevokingAll(false)
        setRevokeCountdown(0)
      }
    }
  }

  const getDeviceIcon = (type: DeviceSession['deviceType']) => {
    switch (type) {
      case 'mobile':
      case 'tablet':
        return DeviceMobile
      case 'laptop':
        return Laptop
      case 'desktop':
      default:
        return Desktop
    }
  }

  const getTimeSince = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  const otherSessionsCount = sessions?.filter(s => !s.isCurrent).length || 0

  return (
    <div className="space-y-6">
      <div className="cyber-card p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Shield size={32} weight="duotone" className="text-primary" />
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-wide text-primary">Device Management</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                Manage your active sessions • {sessions?.length || 0} device{(sessions?.length || 0) !== 1 ? 's' : ''}
                {wsConnected ? (
                  <span className="flex items-center gap-1 text-primary">
                    <WifiHigh size={12} weight="fill" />
                    Live
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <WifiSlash size={12} />
                    Polling
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {otherSessionsCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={revokeAllOther}
              disabled={isRevokingAll || revokeCountdown > 0}
              className="jagged-corner-small"
            >
              <Trash size={16} weight="duotone" className="mr-2" />
              {isRevokingAll ? `Revoking... (${revokeCountdown}s)` : `Revoke All Others (${otherSessionsCount})`}
            </Button>
          )}
        </div>

        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {sessions && sessions.length > 0 ? (
              sessions.map((session, index) => {
                const DeviceIcon = getDeviceIcon(session.deviceType)
                const isLoading = isRevoking[session.id]

                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className={`cyber-card p-5 relative overflow-hidden transition-all hover:shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.2)] ${
                      session.isCurrent ? 'border-primary/50 bg-primary/5' : 'border-muted/30'
                    }`}
                  >
                    {session.isCurrent && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary/20 border border-primary text-primary text-[9px] uppercase tracking-wider px-2 py-1 jagged-corner-small">
                          <CheckCircle size={10} weight="fill" className="mr-1" />
                          CURRENT
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div className={`p-3 border-2 ${session.isCurrent ? 'border-primary bg-primary/10' : 'border-muted/30 bg-muted/10'}`}>
                        <DeviceIcon size={28} weight="duotone" className={session.isCurrent ? 'text-primary' : 'text-muted-foreground'} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="font-bold uppercase tracking-wide text-sm mb-1">{session.deviceName}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Globe size={12} weight="duotone" />
                                {session.browser}
                              </span>
                              <span>•</span>
                              <span>{session.os}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                          <div className="p-3 bg-background/60 border border-primary/10">
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin size={14} weight="duotone" className="text-primary" />
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Location</span>
                            </div>
                            <p className="text-xs font-mono">{session.location}</p>
                          </div>

                          <div className="p-3 bg-background/60 border border-primary/10">
                            <div className="flex items-center gap-2 mb-1">
                              <Shield size={14} weight="duotone" className="text-primary" />
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">IP Address</span>
                            </div>
                            <p className="text-xs font-mono">{session.ip}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Clock size={12} weight="duotone" />
                              Last active: <span className="font-bold text-primary">{getTimeSince(session.lastActive)}</span>
                            </span>
                            <span>•</span>
                            <span>
                              Logged in: <span className="font-bold">{getTimeSince(session.loginTime)}</span>
                            </span>
                          </div>
                        </div>

                        {!session.isCurrent && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => revokeSession(session.id)}
                            disabled={isLoading}
                            className="w-full md:w-auto jagged-corner-small"
                          >
                            <Trash size={14} weight="duotone" className="mr-2" />
                            {isLoading ? 'Revoking...' : 'Revoke Session'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div className="text-center py-12 space-y-3">
                <div className="inline-flex p-4 bg-muted/20 border-2 border-muted/30 jagged-corner">
                  <Shield size={48} weight="duotone" className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No active sessions</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="cyber-card-accent p-4">
        <div className="flex gap-3">
          <Shield size={20} weight="duotone" className="text-accent flex-shrink-0" />
          <div className="space-y-2 text-xs">
            <p className="font-bold uppercase tracking-wide">Security Recommendations</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-accent rounded-full" />
                Review your active sessions regularly for unauthorized access
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-accent rounded-full" />
                Revoke sessions from unknown devices immediately
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-accent rounded-full" />
                Use unique passwords and enable Two-Factor Authentication
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-accent rounded-full" />
                Session data updates in real-time every 5 seconds
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
