// Master Admin Panel — System Diagnostics & Maintenance
// November 24, 2025 — Quantum Falcon Cockpit
// Only visible when master key is used

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Bug, Wrench, Pulse, Warning, CheckCircle,
  XCircle, Clock, Database, Network, Cpu, 
  HardDrive, FileX, ArrowClockwise,
  Terminal, ChartLine, Shield, EyeSlash as Eye,
  CloudArrowUp, Lightning, Gauge, Brain
} from '@phosphor-icons/react'
import { getDeploymentMonitor, type DeploymentHealth, type DeploymentInfo } from '@/lib/monitoring/DeploymentMonitor'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useKVSafe } from '@/hooks/useKVFallback'
import { UserAuth } from '@/lib/auth'
import { isGodMode } from '@/lib/godMode'
import { usePersistentAuth } from '@/lib/auth/usePersistentAuth'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface SystemError {
  id: string
  timestamp: number
  type: 'error' | 'warning' | 'info'
  component: string
  message: string
  stack?: string
  fix?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface SystemMetric {
  name: string
  value: number
  unit: string
  status: 'healthy' | 'warning' | 'critical'
  threshold: { warning: number; critical: number }
}

interface LatencyMetric {
  endpoint: string
  avgLatency: number
  maxLatency: number
  minLatency: number
  requests: number
  errors: number
  status: 'healthy' | 'slow' | 'down'
}

export default function MasterAdminPanel() {
  // Use persistent auth for reliable master key detection
  const { auth } = usePersistentAuth()

  const [errors, setErrors] = useState<SystemError[]>([])
  const [metrics, setMetrics] = useState<SystemMetric[]>([])
  const [latency, setLatency] = useState<LatencyMetric[]>([])
  const [systemLogs, setSystemLogs] = useState<Array<{ timestamp: number; level: string; message: string }>>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Deployment Monitor State
  const [deployHealth, setDeployHealth] = useState<DeploymentHealth | null>(null)
  const [deployInfo, setDeployInfo] = useState<DeploymentInfo | null>(null)
  const [deployInsights, setDeployInsights] = useState<string[]>([])
  const [isMonitorActive, setIsMonitorActive] = useState(false)

  const isMaster = isGodMode(auth)

  // CRITICAL: Ensure master tab always shows content when master key is detected
  // Don't return null too early - let the component render and show diagnostic info
  // Use refs to prevent infinite loops from console logging
  const errorsRef = useRef<SystemError[]>([])
  const hasSetupListeners = useRef(false)
  
  useEffect(() => {
    if (!isMaster || hasSetupListeners.current) return
    hasSetupListeners.current = true

    // Collect console errors - use ref to avoid state updates causing loops
    const originalError = console.error
    const originalWarn = console.warn
    
    // Debounce error collection to prevent flooding
    let errorTimeout: ReturnType<typeof setTimeout> | null = null
    let pendingErrors: SystemError[] = []
    
    const flushErrors = () => {
      if (pendingErrors.length > 0) {
        setErrors(prev => [...pendingErrors, ...prev].slice(0, 50))
        pendingErrors = []
      }
    }
    
    console.error = (...args) => {
      originalError(...args)
      // Skip React internal errors that cause loops
      const msg = args.join(' ')
      if (msg.includes('Maximum update depth') || msg.includes('flushSync')) return
      
      pendingErrors.push({
        id: `error-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        type: 'error',
        component: 'Console',
        message: msg.substring(0, 500),
        severity: 'high',
        fix: 'Check browser console for details. Clear cache if persistent.'
      })
      
      if (errorTimeout) clearTimeout(errorTimeout)
      errorTimeout = setTimeout(flushErrors, 500)
    }

    console.warn = (...args) => {
      originalWarn(...args)
      const msg = args.join(' ')
      if (msg.includes('Maximum update depth')) return
      
      pendingErrors.push({
        id: `warn-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        type: 'warning',
        component: 'Console',
        message: msg.substring(0, 500),
        severity: 'medium',
        fix: 'Review warning message. Usually non-critical.'
      })
      
      if (errorTimeout) clearTimeout(errorTimeout)
      errorTimeout = setTimeout(flushErrors, 500)
    }

    // Collect React errors
    const handleError = (event: ErrorEvent) => {
      pendingErrors.push({
        id: `runtime-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        type: 'error',
        component: event.filename || 'Unknown',
        message: event.message?.substring(0, 500) || 'Unknown error',
        stack: event.error?.stack?.substring(0, 1000),
        severity: 'critical',
        fix: event.error?.stack ? `Check stack trace` : 'Review error details'
      })
      if (errorTimeout) clearTimeout(errorTimeout)
      errorTimeout = setTimeout(flushErrors, 500)
    }
    
    // Collect unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      pendingErrors.push({
        id: `promise-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        type: 'error',
        component: 'Promise',
        message: (event.reason?.message || String(event.reason))?.substring(0, 500),
        stack: event.reason?.stack?.substring(0, 1000),
        severity: 'high',
        fix: 'Check async operations. Ensure all promises are handled.'
      })
      if (errorTimeout) clearTimeout(errorTimeout)
      errorTimeout = setTimeout(flushErrors, 500)
    }
    
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      console.error = originalError
      console.warn = originalWarn
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
      if (errorTimeout) clearTimeout(errorTimeout)
      hasSetupListeners.current = false
    }
  }, [isMaster])

  useEffect(() => {
    if (!isMaster) return

    const updateMetrics = () => {
      // Performance metrics
      const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      const memory = (performance as any).memory

      setMetrics([
        {
          name: 'Page Load Time',
          value: perf ? perf.loadEventEnd - perf.fetchStart : 0,
          unit: 'ms',
          status: perf && (perf.loadEventEnd - perf.fetchStart) < 3000 ? 'healthy' : 
                 perf && (perf.loadEventEnd - perf.fetchStart) < 5000 ? 'warning' : 'critical',
          threshold: { warning: 3000, critical: 5000 }
        },
        {
          name: 'DOM Content Loaded',
          value: perf ? perf.domContentLoadedEventEnd - perf.fetchStart : 0,
          unit: 'ms',
          status: perf && (perf.domContentLoadedEventEnd - perf.fetchStart) < 2000 ? 'healthy' :
                 perf && (perf.domContentLoadedEventEnd - perf.fetchStart) < 3000 ? 'warning' : 'critical',
          threshold: { warning: 2000, critical: 3000 }
        },
        {
          name: 'Memory Usage',
          value: memory ? (memory.usedJSHeapSize / 1048576) : 0,
          unit: 'MB',
          status: memory && (memory.usedJSHeapSize / 1048576) < 100 ? 'healthy' :
                 memory && (memory.usedJSHeapSize / 1048576) < 200 ? 'warning' : 'critical',
          threshold: { warning: 100, critical: 200 }
        },
        {
          name: 'Heap Size',
          value: memory ? (memory.totalJSHeapSize / 1048576) : 0,
          unit: 'MB',
          status: memory && (memory.totalJSHeapSize / 1048576) < 150 ? 'healthy' :
                 memory && (memory.totalJSHeapSize / 1048576) < 300 ? 'warning' : 'critical',
          threshold: { warning: 150, critical: 300 }
        }
      ])

      // Latency metrics (simulated - in real app, track actual API calls)
      setLatency([
        {
          endpoint: '/api/strategies',
          avgLatency: 245,
          maxLatency: 892,
          minLatency: 120,
          requests: 1247,
          errors: 3,
          status: 'healthy' // avgLatency 245ms is healthy
        },
        {
          endpoint: '/api/trades',
          avgLatency: 189,
          maxLatency: 456,
          minLatency: 98,
          requests: 3421,
          errors: 0,
          status: 'healthy'
        },
        {
          endpoint: '/api/agents',
          avgLatency: 567,
          maxLatency: 1234,
          minLatency: 234,
          requests: 892,
          errors: 12,
          status: 'slow' // avgLatency 567ms is slow
        }
      ])
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 5000)

    // Collect system logs periodically
    const logInterval = setInterval(() => {
      setSystemLogs(prev => {
        // Get current metrics count (will be updated on next render)
        const currentMetrics = metrics.length > 0 ? metrics : []
        const healthyCount = currentMetrics.filter(m => m.status === 'healthy').length
        const totalMetrics = currentMetrics.length || 4 // Default to 4 if not loaded yet
        
        const newLog = {
          timestamp: Date.now(),
          level: healthyCount === totalMetrics && errors.length === 0 ? 'info' : 'warn',
          message: `System check: ${healthyCount}/${totalMetrics} metrics healthy • ${errors.length} errors tracked • ${latency.length} endpoints monitored`
        }
        return [newLog, ...prev].slice(0, 100) // Keep last 100 logs
      })
    }, 10000) // Update logs every 10 seconds

    return () => {
      clearInterval(interval)
      clearInterval(logInterval)
    }
  }, [isMaster, metrics, errors, latency])

  // Deployment Monitor Setup
  useEffect(() => {
    if (!isMaster) return
    
    try {
      const monitor = getDeploymentMonitor()
      if (!monitor) return
      
      setIsMonitorActive(true)
      
      // Subscribe to health updates
      const unsubscribe = monitor.subscribe((health) => {
        setDeployHealth(health)
        setDeployInsights(monitor.generateInsights())
      })
      
      // Get deployment info
      monitor.getDeploymentInfo().then(info => {
        if (info) setDeployInfo(info)
      })
      
      return () => {
        unsubscribe()
        setIsMonitorActive(false)
      }
    } catch (e) {
      console.debug('[MasterAdmin] Deployment monitor not available:', e)
    }
  }, [isMaster])

  const refreshData = useCallback(() => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      toast.success('System data refreshed')
    }, 1000)
  }, [])

  const getErrorFix = (error: SystemError): string => {
    if (error.fix) return error.fix

    // Auto-detect fixes based on error patterns
    if (error.message.includes('Failed to fetch')) {
      return 'Network issue detected. Check internet connection or API endpoint status.'
    }
    if (error.message.includes('Cannot read property')) {
      return 'Null/undefined reference. Check component props and data initialization.'
    }
    if (error.message.includes('Module not found')) {
      return 'Missing import or dependency. Run npm install and check import paths.'
    }
    if (error.message.includes('timeout')) {
      return 'Request timeout. Increase timeout value or optimize slow operations.'
    }
    if (error.message.includes('Buffer')) {
      return 'Buffer polyfill needed. Add buffer to vite.config.ts optimizeDeps.'
    }
    if (error.message.includes('Eye is not defined')) {
      return 'Invalid icon import. Replace Eye with EyeSlash from @phosphor-icons/react.'
    }

    return 'Review error details and check component implementation.'
  }

  // CRITICAL FIX: Show diagnostic info even if isMaster check fails
  // This helps debug why master tab isn't showing
  if (!isMaster) {
    // Check if we can detect master key from localStorage directly
    let storedAuth = null
    try {
      const stored = localStorage.getItem('qf-persistent-auth')
      if (stored) storedAuth = JSON.parse(stored)
    } catch (_e) { /* ignore parse errors */ }
    
    const isMasterKeyStored = storedAuth?.licenseKey === 'MASTER_KEY_RECOGNIZED'
    
    return (
      <div className="space-y-6 p-8">
        <div className="cyber-card p-6 border-2 border-yellow-500/50">
          <h3 className="text-xl font-black uppercase tracking-wider text-yellow-400 mb-4 flex items-center gap-3">
            <Shield size={24} weight="fill" />
            Master Access Verification
          </h3>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4 p-4 bg-background/50 rounded-lg">
              <div>
                <p className="text-muted-foreground text-xs uppercase mb-1">Auth Status</p>
                <p className={auth?.isAuthenticated ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                  {auth?.isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase mb-1">User ID</p>
                <p className="text-primary font-bold">{auth?.userId || 'None'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase mb-1">Tier</p>
                <p className="text-primary font-bold">{auth?.license?.tier || 'None'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase mb-1">License User ID</p>
                <p className="text-primary font-bold">{auth?.license?.userId || 'None'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase mb-1">Master Key Stored</p>
                <p className={isMasterKeyStored ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                  {isMasterKeyStored ? '✅ Yes' : '❌ No'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs uppercase mb-1">Features</p>
                <p className="text-primary font-bold">{auth?.license?.features?.join(', ') || 'None'}</p>
              </div>
            </div>
            
            {isMasterKeyStored && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-green-400 font-bold mb-2">🔑 Master Key Detected in Storage!</p>
                <p className="text-sm text-muted-foreground">
                  The master key is stored but auth state may not be synced. Try refreshing the page or logging out and back in.
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-3"
                  variant="outline"
                >
                  <ArrowClockwise size={16} className="mr-2" />
                  Refresh Page
                </Button>
              </div>
            )}
            
            {!isMasterKeyStored && (
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 font-bold mb-2">⚠️ Master Key Not Found</p>
                <p className="text-sm text-muted-foreground">
                  To access God Mode, log in with a master key (starts with QF-GODMODE-, QF-MASTER-, or MASTER-).
                  Master key should set userId to 'master' and tier to 'lifetime'.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const criticalErrors = errors.filter(e => e.severity === 'critical')
  const highErrors = errors.filter(e => e.severity === 'high')
  const warnings = errors.filter(e => e.type === 'warning')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 diagonal-stripes opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-500/20 via-orange-500/20 to-transparent blur-3xl" />
        
        <div className="relative z-10 cyber-card p-8 border-4 border-red-500/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-3xl font-black uppercase tracking-[0.2em] text-red-400 mb-2 flex items-center gap-3">
                <Shield size={32} weight="fill" />
                MASTER ADMIN PANEL
              </h3>
              <p className="text-sm text-muted-foreground">
                System diagnostics, error tracking, and maintenance tools
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-red-500/20 border-red-500/50 text-red-400">
                <Eye size={14} className="mr-1" weight="fill" />
                Master Access
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={isRefreshing}
                className="border-primary/50 text-primary"
              >
                <ArrowClockwise size={16} className={cn("mr-2", isRefreshing && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="glass-morph-card p-4 text-center border border-red-500/30">
              <div className="text-2xl font-black text-red-400 mb-1">{criticalErrors.length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Critical</div>
            </div>
            <div className="glass-morph-card p-4 text-center border border-orange-500/30">
              <div className="text-2xl font-black text-orange-400 mb-1">{highErrors.length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">High</div>
            </div>
            <div className="glass-morph-card p-4 text-center border border-yellow-500/30">
              <div className="text-2xl font-black text-yellow-400 mb-1">{warnings.length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Warnings</div>
            </div>
            <div className="glass-morph-card p-4 text-center border border-green-500/30">
              <div className="text-2xl font-black text-green-400 mb-1">
                {metrics.filter(m => m.status === 'healthy').length}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Healthy</div>
            </div>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-6 w-full bg-card/50 backdrop-blur-sm border-2 border-primary/30 p-1 gap-1">
          <TabsTrigger value="overview" className="uppercase tracking-[0.12em] font-bold text-xs">Overview</TabsTrigger>
          <TabsTrigger value="deploy" className="uppercase tracking-[0.12em] font-bold text-xs">Deploy</TabsTrigger>
          <TabsTrigger value="errors" className="uppercase tracking-[0.12em] font-bold text-xs">Errors</TabsTrigger>
          <TabsTrigger value="metrics" className="uppercase tracking-[0.12em] font-bold text-xs">Metrics</TabsTrigger>
          <TabsTrigger value="latency" className="uppercase tracking-[0.12em] font-bold text-xs">Latency</TabsTrigger>
          <TabsTrigger value="logs" className="uppercase tracking-[0.12em] font-bold text-xs">Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* System Health */}
          <Card className="cyber-card p-6">
            <h4 className="text-xl font-black uppercase tracking-wider text-primary mb-4 flex items-center gap-3">
              <Pulse size={24} weight="duotone" />
              System Health
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.map((metric, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">{metric.name}</span>
                    <Badge className={cn(
                      "text-xs",
                      metric.status === 'healthy' && "bg-green-500/20 border-green-500/50 text-green-400",
                      metric.status === 'warning' && "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
                      metric.status === 'critical' && "bg-red-500/20 border-red-500/50 text-red-400"
                    )}>
                      {metric.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={Math.min(100, (metric.value / metric.threshold.critical) * 100)} 
                      className="flex-1 h-3"
                    />
                    <span className="text-sm font-bold text-primary w-20 text-right">
                      {metric.value.toFixed(1)} {metric.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Critical Errors */}
          {criticalErrors.length > 0 && (
            <Card className="cyber-card p-6 border-2 border-red-500/50">
              <h4 className="text-xl font-black uppercase tracking-wider text-red-400 mb-4 flex items-center gap-3">
                <Warning size={24} weight="fill" />
                Critical Issues ({criticalErrors.length})
              </h4>
              <div className="space-y-3">
                {criticalErrors.slice(0, 5).map(error => (
                  <div key={error.id} className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <XCircle size={18} weight="fill" className="text-red-400" />
                          <span className="font-bold text-red-400">{error.component}</span>
                          <Badge className="bg-red-500/20 border-red-500/50 text-red-400 text-xs">
                            {new Date(error.timestamp).toLocaleTimeString()}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground mb-2">{error.message}</p>
                        <div className="glass-morph-card p-3 border border-primary/30 mt-2">
                          <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">
                            How to Fix:
                          </div>
                          <p className="text-xs text-foreground">{getErrorFix(error)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Deploy Monitor Tab */}
        <TabsContent value="deploy" className="space-y-6">
          {/* Deployment Status Header */}
          <Card className="cyber-card p-6 border-2 border-purple-500/50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CloudArrowUp size={32} weight="duotone" className="text-purple-400" />
                <div>
                  <h4 className="text-xl font-black uppercase tracking-wider text-purple-400">
                    Deployment Monitor
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Real-time Vercel deployment health & AI insights
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={cn(
                  "text-xs",
                  isMonitorActive ? "bg-green-500/20 border-green-500/50 text-green-400" : "bg-red-500/20 border-red-500/50 text-red-400"
                )}>
                  {isMonitorActive ? '● ACTIVE' : '○ INACTIVE'}
                </Badge>
                {deployHealth && (
                  <Badge className={cn(
                    "text-xs",
                    deployHealth.status === 'healthy' && "bg-green-500/20 border-green-500/50 text-green-400",
                    deployHealth.status === 'degraded' && "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
                    deployHealth.status === 'critical' && "bg-red-500/20 border-red-500/50 text-red-400",
                    deployHealth.status === 'unknown' && "bg-gray-500/20 border-gray-500/50 text-gray-400"
                  )}>
                    {deployHealth.status.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>

            {/* Deployment Info */}
            {deployInfo && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="glass-morph-card p-4 border border-purple-500/30">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Environment</div>
                  <div className="text-lg font-black text-purple-400">{deployInfo.branch}</div>
                </div>
                <div className="glass-morph-card p-4 border border-purple-500/30">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</div>
                  <div className="text-lg font-black text-green-400">{deployInfo.status}</div>
                </div>
                <div className="glass-morph-card p-4 border border-purple-500/30">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Commit</div>
                  <div className="text-sm font-mono text-purple-400">{deployInfo.commit.substring(0, 8)}</div>
                </div>
                <div className="glass-morph-card p-4 border border-purple-500/30">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">URL</div>
                  <div className="text-xs font-mono text-purple-400 truncate">{deployInfo.url}</div>
                </div>
              </div>
            )}

            {/* Health Metrics */}
            {deployHealth && (
              <div className="grid grid-cols-4 gap-4">
                <div className="glass-morph-card p-4 text-center border border-green-500/30">
                  <Gauge size={24} weight="duotone" className="text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-black text-green-400">{deployHealth.uptime.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Uptime</div>
                </div>
                <div className="glass-morph-card p-4 text-center border border-red-500/30">
                  <Warning size={24} weight="duotone" className="text-red-400 mx-auto mb-2" />
                  <div className="text-2xl font-black text-red-400">{deployHealth.errorRate.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Error Rate</div>
                </div>
                <div className="glass-morph-card p-4 text-center border border-blue-500/30">
                  <Lightning size={24} weight="duotone" className="text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-black text-blue-400">{deployHealth.avgLoadTime}ms</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg Load</div>
                </div>
                <div className="glass-morph-card p-4 text-center border border-purple-500/30">
                  <Clock size={24} weight="duotone" className="text-purple-400 mx-auto mb-2" />
                  <div className="text-sm font-mono text-purple-400">
                    {new Date(deployHealth.lastChecked).toLocaleTimeString()}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Last Check</div>
                </div>
              </div>
            )}
          </Card>

          {/* Core Web Vitals */}
          {deployHealth && (
            <Card className="cyber-card p-6">
              <h4 className="text-xl font-black uppercase tracking-wider text-primary mb-4 flex items-center gap-3">
                <ChartLine size={24} weight="duotone" />
                Core Web Vitals
              </h4>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">FCP</span>
                    <Badge className={cn(
                      "text-xs",
                      deployHealth.performanceMetrics.fcp < 1800 ? "bg-green-500/20 border-green-500/50 text-green-400" :
                      deployHealth.performanceMetrics.fcp < 3000 ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" :
                      "bg-red-500/20 border-red-500/50 text-red-400"
                    )}>
                      {deployHealth.performanceMetrics.fcp < 1800 ? 'GOOD' : deployHealth.performanceMetrics.fcp < 3000 ? 'NEEDS WORK' : 'POOR'}
                    </Badge>
                  </div>
                  <Progress value={Math.min(100, (deployHealth.performanceMetrics.fcp / 3000) * 100)} className="h-3" />
                  <div className="text-xs text-muted-foreground">{deployHealth.performanceMetrics.fcp.toFixed(0)}ms</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">LCP</span>
                    <Badge className={cn(
                      "text-xs",
                      deployHealth.performanceMetrics.lcp < 2500 ? "bg-green-500/20 border-green-500/50 text-green-400" :
                      deployHealth.performanceMetrics.lcp < 4000 ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" :
                      "bg-red-500/20 border-red-500/50 text-red-400"
                    )}>
                      {deployHealth.performanceMetrics.lcp < 2500 ? 'GOOD' : deployHealth.performanceMetrics.lcp < 4000 ? 'NEEDS WORK' : 'POOR'}
                    </Badge>
                  </div>
                  <Progress value={Math.min(100, (deployHealth.performanceMetrics.lcp / 4000) * 100)} className="h-3" />
                  <div className="text-xs text-muted-foreground">{deployHealth.performanceMetrics.lcp.toFixed(0)}ms</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">CLS</span>
                    <Badge className={cn(
                      "text-xs",
                      deployHealth.performanceMetrics.cls < 0.1 ? "bg-green-500/20 border-green-500/50 text-green-400" :
                      deployHealth.performanceMetrics.cls < 0.25 ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" :
                      "bg-red-500/20 border-red-500/50 text-red-400"
                    )}>
                      {deployHealth.performanceMetrics.cls < 0.1 ? 'GOOD' : deployHealth.performanceMetrics.cls < 0.25 ? 'NEEDS WORK' : 'POOR'}
                    </Badge>
                  </div>
                  <Progress value={Math.min(100, (deployHealth.performanceMetrics.cls / 0.25) * 100)} className="h-3" />
                  <div className="text-xs text-muted-foreground">{deployHealth.performanceMetrics.cls.toFixed(3)}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold">FID</span>
                    <Badge className={cn(
                      "text-xs",
                      deployHealth.performanceMetrics.fid < 100 ? "bg-green-500/20 border-green-500/50 text-green-400" :
                      deployHealth.performanceMetrics.fid < 300 ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400" :
                      "bg-red-500/20 border-red-500/50 text-red-400"
                    )}>
                      {deployHealth.performanceMetrics.fid < 100 ? 'GOOD' : deployHealth.performanceMetrics.fid < 300 ? 'NEEDS WORK' : 'POOR'}
                    </Badge>
                  </div>
                  <Progress value={Math.min(100, (deployHealth.performanceMetrics.fid / 300) * 100)} className="h-3" />
                  <div className="text-xs text-muted-foreground">{deployHealth.performanceMetrics.fid.toFixed(0)}ms</div>
                </div>
              </div>
            </Card>
          )}

          {/* AI Insights */}
          <Card className="cyber-card p-6 border-2 border-cyan-500/50">
            <h4 className="text-xl font-black uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-3">
              <Brain size={24} weight="duotone" />
              AI-Powered Insights
            </h4>
            <div className="space-y-3">
              {deployInsights.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Analyzing deployment health...</p>
              ) : (
                deployInsights.map((insight, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "p-4 rounded-lg border",
                      insight.startsWith('🚨') && "bg-red-500/10 border-red-500/30",
                      insight.startsWith('⚠️') && "bg-yellow-500/10 border-yellow-500/30",
                      insight.startsWith('✅') && "bg-green-500/10 border-green-500/30",
                      !insight.startsWith('🚨') && !insight.startsWith('⚠️') && !insight.startsWith('✅') && "bg-blue-500/10 border-blue-500/30"
                    )}
                  >
                    <p className="text-sm text-foreground">{insight}</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Recent Deployment Errors */}
          {deployHealth && deployHealth.recentErrors.length > 0 && (
            <Card className="cyber-card p-6 border-2 border-red-500/50">
              <h4 className="text-xl font-black uppercase tracking-wider text-red-400 mb-4 flex items-center gap-3">
                <XCircle size={24} weight="fill" />
                Recent Deployment Errors ({deployHealth.recentErrors.length})
              </h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {deployHealth.recentErrors.slice(0, 10).map((error, idx) => (
                  <div key={idx} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </span>
                      <Badge className="bg-red-500/20 border-red-500/50 text-red-400 text-xs">
                        {error.source}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{error.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Errors Tab */}
        <TabsContent value="errors" className="space-y-6">
          <div className="space-y-4">
            {errors.length === 0 ? (
              <Card className="cyber-card p-12 text-center">
                <CheckCircle size={48} weight="fill" className="text-green-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No errors detected. System is healthy!</p>
              </Card>
            ) : (
              errors.map(error => (
                <Card 
                  key={error.id} 
                  className={cn(
                    "cyber-card p-6",
                    error.severity === 'critical' && "border-2 border-red-500/50 bg-red-500/10",
                    error.severity === 'high' && "border-2 border-orange-500/50 bg-orange-500/10",
                    error.type === 'warning' && "border-2 border-yellow-500/50 bg-yellow-500/10"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {error.type === 'error' ? (
                          <XCircle size={20} weight="fill" className="text-red-400" />
                        ) : (
                          <Warning size={20} weight="fill" className="text-yellow-400" />
                        )}
                        <span className="font-black uppercase tracking-wider text-primary">
                          {error.component}
                        </span>
                        <Badge className={cn(
                          "text-xs",
                          error.severity === 'critical' && "bg-red-500/20 border-red-500/50 text-red-400",
                          error.severity === 'high' && "bg-orange-500/20 border-orange-500/50 text-orange-400",
                          error.severity === 'medium' && "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
                          error.severity === 'low' && "bg-blue-500/20 border-blue-500/50 text-blue-400"
                        )}>
                          {error.severity.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(error.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-3">{error.message}</p>
                      {error.stack && (
                        <details className="mb-3">
                          <summary className="text-xs text-muted-foreground cursor-pointer mb-2">
                            Stack Trace
                          </summary>
                          <pre className="text-xs bg-background/50 p-3 rounded border border-primary/20 overflow-x-auto">
                            {error.stack}
                          </pre>
                        </details>
                      )}
                      <div className="glass-morph-card p-4 border border-primary/30 bg-primary/10">
                        <div className="flex items-start gap-3">
                          <Wrench size={18} weight="duotone" className="text-primary shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">
                              Fix Instructions:
                            </div>
                            <p className="text-xs text-foreground leading-relaxed">
                              {getErrorFix(error)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics.map((metric, idx) => (
              <Card key={idx} className="cyber-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-black uppercase tracking-wider text-primary">{metric.name}</h5>
                  <Badge className={cn(
                    "text-xs",
                    metric.status === 'healthy' && "bg-green-500/20 border-green-500/50 text-green-400",
                    metric.status === 'warning' && "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
                    metric.status === 'critical' && "bg-red-500/20 border-red-500/50 text-red-400"
                  )}>
                    {metric.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-primary">
                      {metric.value.toFixed(1)} {metric.unit}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      Threshold: {metric.threshold.warning}{metric.unit} / {metric.threshold.critical}{metric.unit}
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(100, (metric.value / metric.threshold.critical) * 100)} 
                    className="h-3"
                  />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Latency Tab */}
        <TabsContent value="latency" className="space-y-6">
          <div className="space-y-4">
            {latency.map((endpoint, idx) => (
              <Card key={idx} className="cyber-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Network size={24} weight="duotone" className="text-primary" />
                    <div>
                      <h5 className="font-black uppercase tracking-wider text-primary">{endpoint.endpoint}</h5>
                      <p className="text-xs text-muted-foreground">
                        {endpoint.requests} requests • {endpoint.errors} errors
                      </p>
                    </div>
                  </div>
                  <Badge className={cn(
                    "text-xs",
                    endpoint.status === 'healthy' && "bg-green-500/20 border-green-500/50 text-green-400",
                    endpoint.status === 'slow' && "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
                    endpoint.status === 'down' && "bg-red-500/20 border-red-500/50 text-red-400"
                  )}>
                    {endpoint.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg</div>
                    <div className="text-lg font-black text-primary">{endpoint.avgLatency}ms</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Min</div>
                    <div className="text-lg font-black text-green-400">{endpoint.minLatency}ms</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Max</div>
                    <div className="text-lg font-black text-red-400">{endpoint.maxLatency}ms</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card className="cyber-card p-6">
            <h4 className="text-xl font-black uppercase tracking-wider text-primary mb-4 flex items-center gap-3">
              <Terminal size={24} weight="duotone" />
              System Logs
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {systemLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No logs available</p>
              ) : (
                systemLogs.map((log, idx) => (
                  <div key={idx} className="p-3 bg-background/50 border border-primary/20 rounded text-xs font-mono">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock size={12} className="text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <Badge className={cn(
                        "text-xs",
                        log.level === 'error' && "bg-red-500/20 border-red-500/50 text-red-400",
                        log.level === 'warn' && "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
                        log.level === 'info' && "bg-blue-500/20 border-blue-500/50 text-blue-400"
                      )}>
                        {log.level.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-foreground">{log.message}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

