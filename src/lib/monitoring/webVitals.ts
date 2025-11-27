/**
 * Web Vitals Monitoring
 * Tracks Core Web Vitals for performance monitoring
 */

interface WebVitalsMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
}

// Thresholds based on Google's Core Web Vitals
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },     // Largest Contentful Paint
  FID: { good: 100, poor: 300 },        // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 },      // First Contentful Paint
  TTFB: { good: 800, poor: 1800 },      // Time to First Byte
  INP: { good: 200, poor: 500 },        // Interaction to Next Paint
}

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Store metrics for reporting
const collectedMetrics: WebVitalsMetric[] = []

function reportMetric(metric: WebVitalsMetric) {
  collectedMetrics.push(metric)
  
  // Log in development
  if (import.meta.env.DEV) {
    const color = metric.rating === 'good' ? '🟢' : metric.rating === 'needs-improvement' ? '🟡' : '🔴'
    console.log(`${color} [Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`)
  }
  
  // Send to analytics in production
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    // Send to Sentry
    try {
      import('./sentry').then(({ addBreadcrumb }) => {
        addBreadcrumb({
          category: 'web-vitals',
          message: `${metric.name}: ${metric.value}`,
          level: metric.rating === 'poor' ? 'warning' : 'info',
          data: {
            value: metric.value,
            rating: metric.rating,
            delta: metric.delta,
          },
        })
      }).catch(() => {})
    } catch (_e) { /* Sentry not available */ }
    
    // Send to Google Analytics if available
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      })
    }
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export async function initWebVitals() {
  if (typeof window === 'undefined') return
  
  try {
    // Dynamically import web-vitals to keep bundle small
    const { onLCP, onFID, onCLS, onFCP, onTTFB, onINP } = await import('web-vitals')
    
    const handleMetric = (name: string) => (metric: any) => {
      reportMetric({
        name,
        value: metric.value,
        rating: getRating(name, metric.value),
        delta: metric.delta,
        id: metric.id,
      })
    }
    
    onLCP(handleMetric('LCP'))
    onFID(handleMetric('FID'))
    onCLS(handleMetric('CLS'))
    onFCP(handleMetric('FCP'))
    onTTFB(handleMetric('TTFB'))
    onINP(handleMetric('INP'))
    
    console.log('📊 [Web Vitals] Monitoring initialized')
  } catch (error) {
    console.warn('⚠️ [Web Vitals] Failed to initialize:', error)
  }
}

/**
 * Get collected metrics
 */
export function getWebVitalsMetrics(): WebVitalsMetric[] {
  return [...collectedMetrics]
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(): {
  score: number
  metrics: Record<string, { value: number; rating: string }>
} {
  const latestMetrics: Record<string, WebVitalsMetric> = {}
  
  // Get latest value for each metric
  collectedMetrics.forEach(metric => {
    latestMetrics[metric.name] = metric
  })
  
  // Calculate score (0-100)
  const scores: number[] = []
  Object.values(latestMetrics).forEach(metric => {
    if (metric.rating === 'good') scores.push(100)
    else if (metric.rating === 'needs-improvement') scores.push(50)
    else scores.push(0)
  })
  
  const avgScore = scores.length > 0 
    ? scores.reduce((a, b) => a + b, 0) / scores.length 
    : 100
  
  return {
    score: Math.round(avgScore),
    metrics: Object.fromEntries(
      Object.entries(latestMetrics).map(([name, metric]) => [
        name,
        { value: metric.value, rating: metric.rating }
      ])
    )
  }
}

/**
 * Log performance report
 */
export function logPerformanceReport() {
  const summary = getPerformanceSummary()
  
  console.group('📊 Performance Report')
  console.log(`Overall Score: ${summary.score}/100`)
  console.table(summary.metrics)
  console.groupEnd()
}

