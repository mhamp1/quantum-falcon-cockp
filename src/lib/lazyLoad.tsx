// Robust Lazy Loading with Retry Logic
// November 22, 2025 — Quantum Falcon Cockpit
// Handles dynamic import failures gracefully with retries and fallbacks

import { lazy, ComponentType, Suspense } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface LazyLoadOptions {
  retries?: number
  retryDelay?: number
  fallback?: ComponentType<any>
  errorFallback?: ComponentType<{ error: Error; retry: () => void }>
}

/**
 * Create a robust lazy-loaded component with retry logic
 */
export function createRobustLazy<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): T {
  const { retries = 3, retryDelay = 1000 } = options

  let retryCount = 0
  let lastError: Error | null = null

  const loadWithRetry = async (): Promise<{ default: T }> => {
    try {
      const module = await importFn()
      retryCount = 0
      lastError = null
      return module
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (retryCount < retries) {
        retryCount++
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount))
        return loadWithRetry()
      }
      
      throw lastError
    }
  }

  return lazy(loadWithRetry) as T
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

