import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  DeviceMobile,
  Desktop,
  Laptop,
  MapPin,
  Trash,
  CheckCircle,
  WarningCircle,
  Globe
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

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
    }
  ])

  const revokeSession = (sessionId: string) => {
    if (sessionId === 'current') {
      toast.error('Cannot revoke current session')
      return
    }

    if (window.confirm('Are you sure you want to revoke this session? The device will be logged out immediately.')) {
      setSessions((current) => {
        if (!current) return []
        return current.filter(s => s.id !== sessionId)
      })
      toast.success('Session revoked successfully', {
        description: 'The device has been logged out'
      })
    }
  }

  const revokeAllOther = () => {
    if (window.confirm('Are you sure you want to revoke all other sessions? All other devices will be logged out immediately.')) {
      setSessions((current) => {
        if (!current) return []
        return current.filter(s => s.isCurrent)
      })
      toast.success('All other sessions revoked', {
        description: 'Only your current device remains logged in'
      })
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

  const formatTimeAgo = (timestamp: number): string => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getActivityStatus = (lastActive: number): 'active' | 'warning' | 'inactive' => {
    const diff = Date.now() - lastActive
    if (diff < 3600000) return 'active'
    if (diff < 86400000) return 'warning'
    return 'inactive'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 jagged-corner bg-primary/20 border-2 border-primary">
            <Desktop size={24} weight="duotone" className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wide">Device Management</h2>
            <p className="text-sm text-muted-foreground">
              Manage active sessions and connected devices
            </p>
          </div>
        </div>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={revokeAllOther}
          disabled={!sessions || sessions.length <= 1}
        >
          <Trash size={16} weight="duotone" className="mr-2" />
          Revoke All Others
        </Button>
      </div>

      <div className="cyber-card p-4 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-primary/30">
          <div className="flex items-center gap-2">
            <span className="data-label text-xs">ACTIVE_SESSIONS</span>
            <span className="px-2 py-1 bg-primary/20 border border-primary/30 text-primary text-xs font-bold">
              {sessions?.length || 0}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span>Live monitoring</span>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="space-y-3 pr-4">
            {!sessions || sessions.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="inline-flex p-4 bg-muted/20 border-2 border-muted/30 jagged-corner">
                  <Desktop size={48} weight="duotone" className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No active sessions</p>
              </div>
            ) : (
              sessions.map((session, index) => {
                const DeviceIcon = getDeviceIcon(session.deviceType)
                const activityStatus = getActivityStatus(session.lastActive)
                
                return (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 border-2 transition-all relative overflow-hidden ${
                      session.isCurrent
                        ? 'bg-primary/10 border-primary hover:border-primary'
                        : 'bg-background/60 border-primary/20 hover:border-primary/40'
                    }`}
                  >
                    {session.isCurrent && (
                      <div className="absolute top-2 right-2">
                        <div className="px-2 py-1 bg-primary/20 border border-primary/40 flex items-center gap-1">
                          <CheckCircle size={12} weight="fill" className="text-primary" />
                          <span className="text-[9px] font-bold text-primary uppercase tracking-wider">
                            Current
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <div className={`p-3 border-2 jagged-corner ${
                        activityStatus === 'active' 
                          ? 'bg-primary/20 border-primary' 
                          : activityStatus === 'warning'
                          ? 'bg-accent/20 border-accent'
                          : 'bg-muted/20 border-muted/30'
                      }`}>
                        <DeviceIcon 
                          size={32} 
                          weight="duotone" 
                          className={
                            activityStatus === 'active' 
                              ? 'text-primary' 
                              : activityStatus === 'warning'
                              ? 'text-accent'
                              : 'text-muted-foreground'
                          }
                        />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div>
                          <h3 className="font-bold uppercase tracking-wide text-sm mb-1">
                            {session.deviceName}
                          </h3>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span>{session.browser}</span>
                            <span>•</span>
                            <span>{session.os}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <Globe size={14} weight="duotone" className="text-primary" />
                            <span className="text-xs text-muted-foreground">
                              IP: <span className="font-mono text-foreground">{session.ip}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={14} weight="duotone" className="text-primary" />
                            <span className="text-xs text-muted-foreground">{session.location}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-primary/20">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                              Last Active:
                            </span>
                            <span className="text-xs font-bold text-primary">
                              {formatTimeAgo(session.lastActive)}
                            </span>
                          </div>
                          <div className="h-3 w-px bg-border" />
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                              Login:
                            </span>
                            <span className="text-xs font-mono text-foreground">
                              {new Date(session.loginTime).toLocaleDateString([], { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {!session.isCurrent && (
                        <div className="flex items-center">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => revokeSession(session.id)}
                            className="h-auto"
                          >
                            <Trash size={16} weight="duotone" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="cyber-card-accent p-4">
        <div className="flex gap-3">
          <WarningCircle size={20} weight="duotone" className="text-accent flex-shrink-0" />
          <div className="space-y-2 text-xs">
            <p className="font-bold uppercase tracking-wide">Security Recommendations</p>
            <ul className="space-y-1 text-muted-foreground leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Review your active sessions regularly and revoke any unrecognized devices
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Enable Two-Factor Authentication for additional protection
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                If you notice suspicious activity, revoke all sessions and change your password immediately
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Use a secure network when accessing sensitive trading information
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
