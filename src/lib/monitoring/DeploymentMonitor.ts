// Quantum Falcon Deployment Monitor
// Internal monitoring for Vercel deployments with AI-driven insights
// November 26, 2025

export interface DeploymentMetric {
  timestamp: number
  type: 'error' | 'warning' | 'info' | 'performance'
  message: string
  source: string
  metadata?: Record<string, unknown>
}

export interface DeploymentHealth {
  status: 'healthy' | 'degraded' | 'critical' | 'unknown'
  uptime: number // percentage
  errorRate: number // percentage
  avgLoadTime: number // ms
  lastChecked: number
  recentErrors: DeploymentMetric[]
  performanceMetrics: {
    fcp: number // First Contentful Paint
    lcp: number // Largest Contentful Paint
    cls: number // Cumulative Layout Shift
    fid: number // First Input Delay
  }
}

export interface DeploymentInfo {
  id: string
  url: string
  branch: string
  commit: string
  createdAt: number
  status: 'building' | 'ready' | 'error' | 'canceled'
  meta?: {
    buildDuration?: number
    regions?: string[]
  }
}

// In-memory metrics storage (persisted to localStorage for session continuity)
const METRICS_KEY = 'qf-deployment-metrics'
const HEALTH_KEY = 'qf-deployment-health'
const MAX_METRICS = 100

class DeploymentMonitorService {
  private metrics: DeploymentMetric[] = []
  private health: DeploymentHealth = {
    status: 'unknown',
    uptime: 100,
    errorRate: 0,
    avgLoadTime: 0,
    lastChecked: Date.now(),
    recentErrors: [],
    performanceMetrics: {
      fcp: 0,
      lcp: 0,
      cls: 0,
      fid: 0
    }
  }
  private observers: Set<(health: DeploymentHealth) => void> = new Set()

  constructor() {
    this.loadFromStorage()
    this.setupErrorListeners()
    this.setupPerformanceObserver()
    this.startHealthCheck()
  }

  private loadFromStorage(): void {
    try {
      const storedMetrics = localStorage.getItem(METRICS_KEY)
      const storedHealth = localStorage.getItem(HEALTH_KEY)
      
      if (storedMetrics) {
        this.metrics = JSON.parse(storedMetrics)
      }
      if (storedHealth) {
        this.health = JSON.parse(storedHealth)
      }
    } catch (e) {
      console.debug('[DeploymentMonitor] Failed to load from storage:', e)
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(METRICS_KEY, JSON.stringify(this.metrics.slice(-MAX_METRICS)))
      localStorage.setItem(HEALTH_KEY, JSON.stringify(this.health))
    } catch (e) {
      console.debug('[DeploymentMonitor] Failed to save to storage:', e)
    }
  }

  private setupErrorListeners(): void {
    // Capture JavaScript errors
    window.addEventListener('error', (event) => {
      this.recordMetric({
        timestamp: Date.now(),
        type: 'error',
        message: event.message || 'Unknown error',
        source: event.filename || 'unknown',
        metadata: {
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        }
      })
    })

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordMetric({
        timestamp: Date.now(),
        type: 'error',
        message: event.reason?.message || String(event.reason),
        source: 'unhandledrejection',
        metadata: {
          stack: event.reason?.stack
        }
      })
    })

    // Capture console errors
    const originalConsoleError = console.error
    console.error = (...args) => {
      const message = args.map(a => 
        typeof a === 'object' ? JSON.stringify(a) : String(a)
      ).join(' ')
      
      // Don't record suppressed errors
      if (!message.includes('R3F') && !message.includes('ResizeObserver')) {
        this.recordMetric({
          timestamp: Date.now(),
          type: 'error',
          message: message.substring(0, 500),
          source: 'console.error'
        })
      }
      
      originalConsoleError.apply(console, args)
    }
  }

  private setupPerformanceObserver(): void {
    if (typeof PerformanceObserver === 'undefined') return

    try {
      // Observe paint metrics
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.health.performanceMetrics.fcp = entry.startTime
          }
        }
        this.updateHealth()
      })
      paintObserver.observe({ entryTypes: ['paint'] })

      // Observe LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        if (entries.length > 0) {
          this.health.performanceMetrics.lcp = entries[entries.length - 1].startTime
        }
        this.updateHealth()
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // Observe CLS
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        }
        this.health.performanceMetrics.cls = clsValue
        this.updateHealth()
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      // Observe FID
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        if (entries.length > 0) {
          this.health.performanceMetrics.fid = (entries[0] as any).processingStart - entries[0].startTime
        }
        this.updateHealth()
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

    } catch (e) {
      console.debug('[DeploymentMonitor] PerformanceObserver not fully supported:', e)
    }
  }

  private startHealthCheck(): void {
    // Initial health check
    this.performHealthCheck()

    // Periodic health checks every 30 seconds
    setInterval(() => {
      this.performHealthCheck()
    }, 30000)
  }

  private performHealthCheck(): void {
    const now = Date.now()
    const recentWindow = 5 * 60 * 1000 // 5 minutes
    
    // Calculate error rate from recent metrics
    const recentMetrics = this.metrics.filter(m => m.timestamp > now - recentWindow)
    const errorCount = recentMetrics.filter(m => m.type === 'error').length
    const errorRate = recentMetrics.length > 0 ? (errorCount / recentMetrics.length) * 100 : 0

    // Calculate average load time from navigation timing
    let avgLoadTime = 0
    try {
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navTiming) {
        avgLoadTime = navTiming.loadEventEnd - navTiming.fetchStart
      }
    } catch (e) {
      // Fallback to performance.timing (deprecated but widely supported)
      if (performance.timing) {
        avgLoadTime = performance.timing.loadEventEnd - performance.timing.fetchStart
      }
    }

    // Determine status
    let status: DeploymentHealth['status'] = 'healthy'
    if (errorRate > 20 || avgLoadTime > 5000) {
      status = 'critical'
    } else if (errorRate > 5 || avgLoadTime > 3000) {
      status = 'degraded'
    }

    // Update health
    this.health = {
      ...this.health,
      status,
      errorRate: Math.round(errorRate * 100) / 100,
      avgLoadTime: Math.round(avgLoadTime),
      lastChecked: now,
      recentErrors: this.metrics
        .filter(m => m.type === 'error')
        .slice(-10)
    }

    this.saveToStorage()
    this.notifyObservers()
  }

  private updateHealth(): void {
    this.health.lastChecked = Date.now()
    this.saveToStorage()
    this.notifyObservers()
  }

  private notifyObservers(): void {
    this.observers.forEach(callback => {
      try {
        callback(this.health)
      } catch (e) {
        console.error('[DeploymentMonitor] Observer error:', e)
      }
    })
  }

  recordMetric(metric: DeploymentMetric): void {
    this.metrics.push(metric)
    
    // Keep only recent metrics
    if (this.metrics.length > MAX_METRICS) {
      this.metrics = this.metrics.slice(-MAX_METRICS)
    }

    // Update health immediately for errors
    if (metric.type === 'error') {
      this.performHealthCheck()
    }

    this.saveToStorage()
  }

  getHealth(): DeploymentHealth {
    return { ...this.health }
  }

  getMetrics(limit = 50): DeploymentMetric[] {
    return this.metrics.slice(-limit)
  }

  subscribe(callback: (health: DeploymentHealth) => void): () => void {
    this.observers.add(callback)
    // Immediately call with current health
    callback(this.health)
    
    // Return unsubscribe function
    return () => {
      this.observers.delete(callback)
    }
  }

  clearMetrics(): void {
    this.metrics = []
    this.health.recentErrors = []
    this.saveToStorage()
  }

  // Get deployment info from Vercel (if available)
  async getDeploymentInfo(): Promise<DeploymentInfo | null> {
    try {
      // Vercel injects deployment info into the page
      const vercelEnv = (window as any).__VERCEL_ENV__
      const vercelUrl = (window as any).__VERCEL_URL__
      
      if (vercelEnv || vercelUrl) {
        return {
          id: (window as any).__VERCEL_DEPLOYMENT_ID__ || 'unknown',
          url: vercelUrl || window.location.origin,
          branch: (window as any).__VERCEL_GIT_COMMIT_REF__ || 'main',
          commit: (window as any).__VERCEL_GIT_COMMIT_SHA__ || 'unknown',
          createdAt: Date.now(),
          status: 'ready'
        }
      }

      // Fallback for local development
      return {
        id: 'local-dev',
        url: window.location.origin,
        branch: 'local',
        commit: 'development',
        createdAt: Date.now(),
        status: 'ready'
      }
    } catch (e) {
      console.debug('[DeploymentMonitor] Failed to get deployment info:', e)
      return null
    }
  }

  // Generate AI insights based on metrics
  generateInsights(): string[] {
    const insights: string[] = []
    const { status, errorRate, avgLoadTime, performanceMetrics } = this.health

    if (status === 'critical') {
      insights.push('🚨 Critical: System health is degraded. Immediate attention required.')
    }

    if (errorRate > 5) {
      insights.push(`⚠️ Error rate is ${errorRate.toFixed(1)}% - above 5% threshold. Check recent errors.`)
    }

    if (avgLoadTime > 3000) {
      insights.push(`🐢 Slow load time: ${(avgLoadTime / 1000).toFixed(1)}s average. Consider optimizing.`)
    }

    if (performanceMetrics.lcp > 2500) {
      insights.push(`📊 LCP is ${(performanceMetrics.lcp / 1000).toFixed(1)}s - above 2.5s good threshold.`)
    }

    if (performanceMetrics.cls > 0.1) {
      insights.push(`📐 CLS is ${performanceMetrics.cls.toFixed(3)} - above 0.1 good threshold.`)
    }

    if (performanceMetrics.fid > 100) {
      insights.push(`⏱️ FID is ${performanceMetrics.fid.toFixed(0)}ms - above 100ms good threshold.`)
    }

    // Check for common error patterns
    const recentErrors = this.metrics.filter(m => m.type === 'error').slice(-20)
    const errorPatterns = new Map<string, number>()
    
    recentErrors.forEach(e => {
      const pattern = e.message.substring(0, 50)
      errorPatterns.set(pattern, (errorPatterns.get(pattern) || 0) + 1)
    })

    errorPatterns.forEach((count, pattern) => {
      if (count >= 3) {
        insights.push(`🔄 Recurring error (${count}x): "${pattern}..."`)
      }
    })

    if (insights.length === 0) {
      insights.push('✅ All systems nominal. No issues detected.')
    }

    return insights
  }
}

// Singleton instance
let monitorInstance: DeploymentMonitorService | null = null

export function getDeploymentMonitor(): DeploymentMonitorService {
  if (!monitorInstance && typeof window !== 'undefined') {
    monitorInstance = new DeploymentMonitorService()
  }
  return monitorInstance!
}

// React hook for using the monitor
export function useDeploymentHealth() {
  const [health, setHealth] = useState<DeploymentHealth | null>(null)

  useEffect(() => {
    const monitor = getDeploymentMonitor()
    if (!monitor) return

    const unsubscribe = monitor.subscribe(setHealth)
    return unsubscribe
  }, [])

  return health
}

// Need to import useState and useEffect for the hook
import { useState, useEffect } from 'react'

