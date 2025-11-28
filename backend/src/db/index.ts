// ═══════════════════════════════════════════════════════════════
// DATABASE CLIENT
// Prisma client singleton for database operations
// November 28, 2025 — Quantum Falcon Backend
// ═══════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client'
import { logger } from '../services/Logger.js'

// Prevent multiple Prisma instances in development
declare global {
  var prisma: PrismaClient | undefined
}

export const db = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = db
}

// Connection test
export async function testConnection(): Promise<boolean> {
  try {
    await db.$connect()
    logger.info('[Database] Connected successfully')
    return true
  } catch (error) {
    logger.error('[Database] Connection failed:', error)
    return false
  }
}

// Graceful shutdown
export async function disconnect(): Promise<void> {
  await db.$disconnect()
  logger.info('[Database] Disconnected')
}

export default db

