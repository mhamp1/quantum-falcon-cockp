// Performance Monitoring & Optimization
// November 24, 2025 — Quantum Falcon Cockpit
// Production-ready performance tracking and optimization

import { logger } from './logger'

export interface PerformanceMetric {
  name: string
  duration: number
  timestamp: number
  metadata?: Record<string, unknown>
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private maxMetrics = 100
  private marks: Map<string, number> = new Map()

  /**
   * Start performance measurement
   */
  start(name: string): void {
    this.marks.set(name, performance.now())
  }

  /**
   * End performance measurement and record
   */
  end(name: string, metadata?: Record<string, unknown>): number {
    const startTime = this.marks.get(name)
    if (!startTime) {
      logger.warn(`Performance mark "${name}" not found`, 'PerformanceMonitor')
      return 0
    }

    const duration = performance.now() - startTime
    this.record(name, duration, metadata)
    this.marks.delete(name)

    return duration
  }

  /**
   * Record a performance metric
   */
  record(name: string, duration: number, metadata?: Record<string, unknown>): void {
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata
    }

    this.metrics.push(metric)
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift()
    }

    // Warn if operation is slow
    if (duration > 1000) {
      logger.warn(`Slow operation: ${name} took ${duration.toFixed(2)}ms`, 'PerformanceMonitor', metadata)
    }
  }

  /**
   * Measure async operation
   */
  async measure<T>(
    name: string,
    operation: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    this.start(name)
    try {
      const result = await operation()
      this.end(name, { ...metadata, success: true })
      return result
    } catch (error) {
      this.end(name, { ...metadata, success: false, error: String(error) })
      throw error
    }
  }

  /**
   * Get average duration for a metric
   */
  getAverage(name: string): number {
    const relevant = this.metrics.filter(m => m.name === name)
    if (relevant.length === 0) return 0
    return relevant.reduce((sum, m) => sum + m.duration, 0) / relevant.length
  }

  /**
   * Get recent metrics
   */
  getRecent(count: number = 10): PerformanceMetric[] {
    return this.metrics.slice(-count)
  }

  /**
   * Get metrics by name
   */
  getByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(m => m.name === name)
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = []
    this.marks.clear()
  }

  /**
   * Export metrics for analysis
   */
  export(): string {
    return JSON.stringify(this.metrics, null, 2)
  }
}

export const performanceMonitor = new PerformanceMonitor()

/**
 * Decorator for measuring function performance
 */
export function measurePerformance(name: string) {
  return function <T extends (...args: unknown[]) => Promise<unknown>>(
    target: unknown,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const originalMethod = descriptor.value
    if (!originalMethod) return descriptor

    descriptor.value = async function (...args: unknown[]) {
      return performanceMonitor.measure(
        `${target?.constructor?.name || 'Unknown'}.${propertyKey}`,
        () => originalMethod.apply(this, args)
      ) as ReturnType<T>
    }

    return descriptor
  }
}

/**
 * React hook for measuring component render time
 */
export function usePerformanceMeasure(componentName: string) {
  if (typeof window === 'undefined') return

  const startTime = performance.now()

  return () => {
    const duration = performance.now() - startTime
    performanceMonitor.record(`render.${componentName}`, duration)
  }
}

