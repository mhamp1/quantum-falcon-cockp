// ULTRA-ROBUST LAZY LOADING — Optimized for Production
// November 22, 2025 — Quantum Falcon Cockpit v2025.1.0
// Handles dynamic import failures with aggressive retry, prefetching, and error recovery

import { lazy, ComponentType, LazyExoticComponent, Suspense } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface LazyLoadOptions {
  retries?: number
  retryDelay?: number
  timeout?: number
  prefetch?: boolean
}

// Cache for successfully loaded modules to prevent re-importing
const moduleCache = new Map<string, Promise<any>>()

// Ensure React core is always loaded before any lazily imported component
// This prevents "Component of undefined" errors when dynamic chunks evaluate
let reactReadyPromise: Promise<unknown> | null = null
const ensureReactReady = () => {
  if (!reactReadyPromise) {
    reactReadyPromise = Promise.all([
      import('react'),
      import('react-dom'),
    ]).catch((error) => {
      // Reset so future attempts can retry
      reactReadyPromise = null
      throw error
    })
  }
  return reactReadyPromise
}

/**
 * Create an ultra-robust lazy-loaded component with retry logic
 * Features:
 * - Fast timeout (5s) for quick failure detection
 * - Aggressive retry with exponential backoff
 * - Module caching to prevent duplicate loads
 * - Network error detection and recovery
 */
export function createRobustLazy<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> {
  const { retries = 5, retryDelay = 300, timeout = 5000, prefetch = false } = options
  
  // Create a cache key from the import function
  const cacheKey = importFn.toString()

  const loadWithRetry = async (): Promise<{ default: T }> => {
    // Check cache first
    if (moduleCache.has(cacheKey)) {
      try {
        return await moduleCache.get(cacheKey)!
      } catch (e) {
        // Cache entry failed, remove it and retry
        moduleCache.delete(cacheKey)
      }
    }

    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Guarantee React/ReactDOM are loaded before any lazy component executes
        await ensureReactReady()

        // Create the import promise
        const importPromise = importFn()
        
        // Add timeout - reduced from 15s to 5s for faster failure detection
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error(`Import timeout after ${timeout}ms`)), timeout)
        )
        
        const module = await Promise.race([importPromise, timeoutPromise])
        
        // Verify module has default export
        if (!module || !module.default) {
          throw new Error('Module does not have a default export')
        }
        
        // Cache successful load
        moduleCache.set(cacheKey, Promise.resolve(module))
        
        return module
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        // Check if it's a network error (common in production)
        const isNetworkError = 
          lastError.message.includes('Failed to fetch') ||
          lastError.message.includes('NetworkError') ||
          lastError.message.includes('timeout') ||
          lastError.message.includes('dynamically imported module')
        
        // Don't retry on last attempt
        if (attempt < retries) {
          // Exponential backoff with jitter for network errors
          const baseDelay = isNetworkError ? retryDelay * 2 : retryDelay
          const delay = baseDelay * Math.pow(1.5, attempt) + Math.random() * 200
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
      }
    }
    
    // All retries failed - throw the last error with helpful message
    const errorMsg = lastError?.message || 'Failed to load module'
    throw new Error(`${errorMsg} (attempted ${retries + 1} times)`)
  }

  // Prefetch in background if enabled
  if (prefetch && typeof window !== 'undefined') {
    // Use requestIdleCallback if available, otherwise setTimeout
    const schedulePrefetch = window.requestIdleCallback || ((fn: () => void) => setTimeout(fn, 2000))
    schedulePrefetch(() => {
      loadWithRetry().catch(() => {
        // Silent fail for prefetch
      })
    })
  }

  return lazy(loadWithRetry) as LazyExoticComponent<T>
}

/**
 * Wrapper component that provides error boundary and suspense
 */
export function LazyComponent<T extends ComponentType<any>>({
  component: LazyComponent,
  fallback,
  errorFallback,
}: {
  component: T
  fallback?: React.ReactNode
  errorFallback?: ComponentType<{ error: Error; retry: () => void }>
}) {
  const DefaultFallback = () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground text-sm uppercase tracking-wider">Loading...</p>
      </div>
    </div>
  )

  return (
    <ErrorBoundary
      FallbackComponent={errorFallback || (({ error, resetErrorBoundary }) => (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="cyber-card p-8 max-w-md w-full text-center space-y-6">
            <h3 className="text-xl font-bold text-destructive uppercase tracking-wider mb-2">
              Component Failed to Load
            </h3>
            <p className="text-sm text-muted-foreground">
              {error.message}
            </p>
            <button
              onClick={resetErrorBoundary}
              className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg font-bold uppercase tracking-wider hover:brightness-110 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      ))}
    >
      <Suspense fallback={fallback || <DefaultFallback />}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  )
}

