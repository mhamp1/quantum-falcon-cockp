// ═══════════════════════════════════════════════════════════════
// LOGGER SERVICE
// Structured logging with Winston
// November 28, 2025 — Quantum Falcon Backend
// ═══════════════════════════════════════════════════════════════

import winston from 'winston'

const { combine, timestamp, printf, colorize, errors } = winston.format

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `${timestamp} [${level.toUpperCase()}] ${message}`
  
  if (Object.keys(meta).length > 0) {
    log += ` ${JSON.stringify(meta)}`
  }
  
  if (stack) {
    log += `\n${stack}`
  }
  
  return log
})

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    // Console transport (with colors in development)
    new winston.transports.Console({
      format: combine(
        colorize({ all: process.env.NODE_ENV !== 'production' }),
        logFormat
      ),
    }),
  ],
})

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
  }))
  
  logger.add(new winston.transports.File({
    filename: 'logs/combined.log',
    maxsize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
  }))
}

// Helper functions
export const logTrade = (
  action: string,
  userId: string,
  details: Record<string, any>
) => {
  logger.info(`[TRADE] ${action}`, { userId, ...details })
}

export const logPosition = (
  action: string,
  positionId: string,
  details: Record<string, any>
) => {
  logger.info(`[POSITION] ${action}`, { positionId, ...details })
}

export const logPayment = (
  action: string,
  userId: string,
  amount: number,
  details: Record<string, any>
) => {
  logger.info(`[PAYMENT] ${action}`, { userId, amount, ...details })
}

export const logSecurity = (
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  details: Record<string, any>
) => {
  const logLevel = severity === 'critical' ? 'error' : 
                   severity === 'high' ? 'warn' : 'info'
  logger[logLevel](`[SECURITY] ${event}`, { severity, ...details })
}

export default logger

