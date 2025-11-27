// Sentry Error Monitoring (Optional)
// November 26, 2025 — Quantum Falcon Cockpit
// Only initializes if @sentry/react is installed and DSN is provided

let sentryInitialized = false
let sentryAvailable = false

// Check if Sentry is available (lazy check)
async function checkSentryAvailable(): Promise<boolean> {
  if (sentryAvailable) return true
  
  try {
    // Use eval to prevent Vite from resolving at build time
    const sentryPath = '@sentry/react'
    // @ts-expect-error - Dynamic import that may not exist
    await new Function('return import(arguments[0])')(sentryPath)
    sentryAvailable = true
    return true
  } catch {
    return false
  }
}

/**
 * Initialize Sentry error monitoring
 * Only initializes if DSN is provided and package is installed
 */
export async function initSentry() {
  if (sentryInitialized || typeof window === 'undefined') return
  
  const dsn = import.meta.env.VITE_SENTRY_DSN
  
  if (!dsn) {
    console.debug('[Sentry] DSN not provided, skipping initialization')
    return
  }

  const isAvailable = await checkSentryAvailable()
  if (!isAvailable) {
    console.debug('[Sentry] Package not installed, skipping')
    return
  }

  try {
    // Dynamic import - only loads if Sentry is installed
    // @ts-expect-error - Dynamic import that may not exist
    const Sentry = await new Function('return import(arguments[0])')('@sentry/react')
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE || 'development',
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      beforeSend(event, hint) {
        // Filter out non-critical errors
        if (event.exception) {
          const error = hint.originalException
          if (error instanceof Error) {
            // Suppress known non-critical errors
            const message = error.message.toLowerCase()
            if (
              message.includes('resizeobserver') ||
              message.includes('non-passive event listener') ||
              message.includes('webgl') ||
              message.includes('r3f')
            ) {
              return null
            }
          }
        }
        return event
      },
    })
    
    sentryInitialized = true
    console.info('[Sentry] Error monitoring initialized')
  } catch (err) {
    console.warn('[Sentry] Sentry not available:', err)
  }
}

/**
 * Log error to Sentry
 */
export async function logError(error: Error, context?: Record<string, any>) {
  if (!sentryInitialized) {
    console.error('[Error]', error, context)
    return
  }

  const isAvailable = await checkSentryAvailable()
  if (!isAvailable) {
    console.error('[Error]', error, context)
    return
  }

  try {
    // @ts-expect-error - Dynamic import that may not exist
    const Sentry = await new Function('return import(arguments[0])')('@sentry/react')
    Sentry.captureException(error, {
      contexts: {
        custom: context || {},
      },
    })
  } catch {
    // Silent fail if Sentry not available
    console.error('[Error]', error, context)
  }
}

/**
 * Set user context for Sentry
 */
export async function setSentryUser(user: { id: string; email?: string; username?: string }) {
  if (!sentryInitialized) return

  const isAvailable = await checkSentryAvailable()
  if (!isAvailable) return

  try {
    // @ts-expect-error - Dynamic import that may not exist
    const Sentry = await new Function('return import(arguments[0])')('@sentry/react')
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    })
  } catch {
    // Silent fail if Sentry not available
  }
}

