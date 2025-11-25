// PRODUCTION-SAFE LOGGER — No console.log in production
// November 22, 2025 — Quantum Falcon Cockpit v2025.1.0

const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development'

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[QF]', ...args)
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn('[QF]', ...args)
    }
  },
  error: (...args: any[]) => {
    // Always log errors, but use error logger in production
    if (isDevelopment) {
      console.error('[QF]', ...args)
    } else {
      // In production, use error logger service
      try {
        import('@/lib/errorLogger').then(({ logError }) => {
          logError(args.join(' '), 'Production Error')
        }).catch(() => {
          // Silent fail if error logger unavailable
        })
      } catch {
        // Silent fail
      }
    }
  },
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug('[QF]', ...args)
    }
  },
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[QF]', ...args)
    }
  }
}

// Export default for convenience
export default logger

