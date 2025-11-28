// ═══════════════════════════════════════════════════════════════
// POSITION MONITOR WORKER
// 24/7 background worker for stop-loss/take-profit execution
// November 28, 2025 — Quantum Falcon Backend
// ═══════════════════════════════════════════════════════════════

import { parentPort, workerData } from 'worker_threads'
import { PositionService } from '../services/PositionService.js'
import { logger } from '../services/Logger.js'

const CHECK_INTERVAL = 5000 // Check every 5 seconds
let isRunning = true

const positionService = new PositionService()

async function main() {
  logger.info('[PositionMonitorWorker] Starting 24/7 position monitoring...')
  
  while (isRunning) {
    try {
      await positionService.checkAllPositions()
    } catch (error) {
      logger.error('[PositionMonitorWorker] Check failed:', error)
    }
    
    await sleep(CHECK_INTERVAL)
  }
  
  logger.info('[PositionMonitorWorker] Stopped')
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Handle messages from main thread
if (parentPort) {
  parentPort.on('message', (msg) => {
    if (msg === 'stop') {
      isRunning = false
      logger.info('[PositionMonitorWorker] Stop signal received')
    }
  })
}

// Handle shutdown
process.on('SIGTERM', () => {
  isRunning = false
})

process.on('SIGINT', () => {
  isRunning = false
})

// Start the worker
main().catch(err => {
  logger.error('[PositionMonitorWorker] Fatal error:', err)
  process.exit(1)
})

