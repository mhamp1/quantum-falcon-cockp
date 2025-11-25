// Centralized Logging System — Production-Ready
// November 24, 2025 — Quantum Falcon Cockpit
// Replaces all console.* statements with structured logging

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: number
  level: LogLevel
  message: string
  context?: string
  data?: any
  stack?: string
}

class Logger {
  private logs: LogEntry[] = []
  private maxLogs = 100
  private isDev = import.meta.env.DEV
  private enabled = true

  private formatMessage(level: LogLevel, message: string, context?: string): string {
    const prefix = context ? `[${context}]` : '[App]'
    return `${prefix} ${message}`
  }

  private addLog(level: LogLevel, message: string, context?: string, data?: any, stack?: string) {
    if (!this.enabled) return

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      context,
      data,
      stack
    }

    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Only output to console in dev mode
    if (this.isDev) {
      const formatted = this.formatMessage(level, message, context)
      switch (level) {
        case 'debug':
          console.debug(formatted, data || '')
          break
        case 'info':
          console.info(formatted, data || '')
          break
        case 'warn':
          console.warn(formatted, data || '')
          break
        case 'error':
          console.error(formatted, data || '', stack || '')
          break
      }
    }
  }

  debug(message: string, context?: string, data?: any) {
    this.addLog('debug', message, context, data)
  }

  info(message: string, context?: string, data?: any) {
    this.addLog('info', message, context, data)
  }

  warn(message: string, context?: string, data?: any) {
    this.addLog('warn', message, context, data)
  }

  error(message: string, context?: string, error?: Error | any, data?: any) {
    const stack = error instanceof Error ? error.stack : undefined
    const errorMessage = error instanceof Error ? error.message : String(error)
    this.addLog('error', `${message}: ${errorMessage}`, context, data, stack)
  }

  getLogs(level?: LogLevel, context?: string): LogEntry[] {
    let filtered = [...this.logs]
    if (level) {
      filtered = filtered.filter(log => log.level === level)
    }
    if (context) {
      filtered = filtered.filter(log => log.context === context)
    }
    return filtered
  }

  getRecentLogs(count: number = 10): LogEntry[] {
    return this.logs.slice(-count)
  }

  clear() {
    this.logs = []
  }

  export(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  enable() {
    this.enabled = true
  }

  disable() {
    this.enabled = false
  }
}

export const logger = new Logger()

// Convenience functions
export const logDebug = (message: string, context?: string, data?: any) => {
  logger.debug(message, context, data)
}

export const logInfo = (message: string, context?: string, data?: any) => {
  logger.info(message, context, data)
}

export const logWarn = (message: string, context?: string, data?: any) => {
  logger.warn(message, context, data)
}

export const logError = (message: string, context?: string, error?: Error | any, data?: any) => {
  logger.error(message, context, error, data)
}

