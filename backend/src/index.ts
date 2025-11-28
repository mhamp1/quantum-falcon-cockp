// ═══════════════════════════════════════════════════════════════
// QUANTUM FALCON BACKEND — Trading Server
// 24/7 Autonomous Trading with Position Monitoring
// November 28, 2025 — Production Ready
// ═══════════════════════════════════════════════════════════════

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { config } from 'dotenv'
import { createClient } from 'redis'
import { Worker } from 'worker_threads'
import path from 'path'

// Load environment variables
config()

// Import routes
import tradingRoutes from './routes/trading.js'
import positionsRoutes from './routes/positions.js'
import analyticsRoutes from './routes/analytics.js'
import webhooksRoutes from './routes/webhooks.js'

// Import services
import { PriceService } from './services/PriceService.js'
import { logger } from './services/Logger.js'

// ═══════════════════════════════════════════════════════════════
// SERVER CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 3001
const NODE_ENV = process.env.NODE_ENV || 'development'
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5000'

// ═══════════════════════════════════════════════════════════════
// EXPRESS APP SETUP
// ═══════════════════════════════════════════════════════════════

const app = express()

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}))

// CORS configuration
app.use(cors({
  origin: CORS_ORIGIN.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true,
}))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
})
app.use('/api/', limiter)

// Trading-specific rate limit (stricter)
const tradingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // 20 trades per minute max
  message: { error: 'Trading rate limit exceeded. Please wait.' },
})
app.use('/api/trading/execute', tradingLimiter)

// ═══════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '2025.1.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  })
})

// API routes
app.use('/api/trading', tradingRoutes)
app.use('/api/positions', positionsRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/webhooks', webhooksRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err)
  res.status(500).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
})

// ═══════════════════════════════════════════════════════════════
// BACKGROUND WORKERS
// ═══════════════════════════════════════════════════════════════

let positionWorker: Worker | null = null

function startWorkers() {
  // Position Monitor Worker (24/7)
  try {
    positionWorker = new Worker(
      path.join(__dirname, 'workers', 'PositionMonitorWorker.js')
    )
    
    positionWorker.on('message', (msg) => {
      logger.info('[PositionWorker] Message:', msg)
    })
    
    positionWorker.on('error', (err) => {
      logger.error('[PositionWorker] Error:', err)
    })
    
    positionWorker.on('exit', (code) => {
      logger.warn(`[PositionWorker] Exited with code ${code}`)
      // Auto-restart after 5 seconds
      setTimeout(startWorkers, 5000)
    })
    
    logger.info('📊 Position Monitor Worker started')
  } catch (error) {
    logger.error('Failed to start Position Monitor Worker:', error)
  }
}

// ═══════════════════════════════════════════════════════════════
// STARTUP
// ═══════════════════════════════════════════════════════════════

async function startServer() {
  try {
    // Initialize price service
    await PriceService.initialize()
    logger.info('💰 Price Service initialized')

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`
════════════════════════════════════════════════════════════════
  🦅 QUANTUM FALCON BACKEND v2025.1.0
  
  Server running on port ${PORT}
  Environment: ${NODE_ENV}
  CORS Origin: ${CORS_ORIGIN}
  
  Endpoints:
    - GET  /health
    - POST /api/trading/execute
    - GET  /api/trading/history
    - GET  /api/positions
    - POST /api/positions/close/:id
    - GET  /api/analytics/stats
    - POST /api/webhooks/stripe
    
════════════════════════════════════════════════════════════════
      `)
    })

    // Start background workers in production
    if (NODE_ENV === 'production') {
      startWorkers()
    }

  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...')
  positionWorker?.terminate()
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down...')
  positionWorker?.terminate()
  process.exit(0)
})

// Start the server
startServer()

export default app

