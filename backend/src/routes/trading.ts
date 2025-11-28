// ═══════════════════════════════════════════════════════════════
// TRADING API ROUTES
// Execute trades, get history, manage trading state
// November 28, 2025 — Quantum Falcon Backend
// ═══════════════════════════════════════════════════════════════

import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { TradingService } from '../services/TradingService.js'
import { authMiddleware } from '../middleware/auth.js'
import { logger } from '../services/Logger.js'

const router = Router()
const tradingService = new TradingService()

// ═══════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════

const ExecuteTradeSchema = z.object({
  side: z.enum(['buy', 'sell']),
  inputToken: z.string().min(32).max(44),
  outputToken: z.string().min(32).max(44),
  amount: z.number().positive(),
  slippageBps: z.number().min(10).max(1000).optional().default(100),
  priorityFee: z.number().min(0).max(1000000).optional(),
})

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/trading/live
 * Get live trading data for the authenticated user
 */
router.get('/live', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const data = await tradingService.getLiveTradingData(userId)
    
    res.json(data)
  } catch (error: any) {
    logger.error('[Trading] Live data fetch failed:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/trading/execute
 * Execute a trade on behalf of the user
 */
router.post('/execute', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    
    // Validate request body
    const validation = ExecuteTradeSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request',
        details: validation.error.errors,
      })
    }

    const { side, inputToken, outputToken, amount, slippageBps, priorityFee } = validation.data

    logger.info(`[Trading] Execute request from ${userId}:`, {
      side,
      inputToken: inputToken.slice(0, 8) + '...',
      outputToken: outputToken.slice(0, 8) + '...',
      amount,
    })

    // Execute the trade
    const result = await tradingService.executeTrade(
      userId,
      side,
      inputToken,
      outputToken,
      amount,
      { slippageBps, priorityFee }
    )

    if (result.success) {
      res.json({
        success: true,
        signature: result.signature,
        inputAmount: result.inputAmount,
        outputAmount: result.outputAmount,
        priceImpact: result.priceImpact,
        route: result.route,
      })
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
      })
    }
  } catch (error: any) {
    logger.error('[Trading] Execute failed:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/trading/history
 * Get trade history for the authenticated user
 */
router.get('/history', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500)
    const offset = parseInt(req.query.offset as string) || 0

    const trades = await tradingService.getTradeHistory(userId, limit, offset)
    
    res.json({
      trades,
      pagination: {
        limit,
        offset,
        hasMore: trades.length === limit,
      },
    })
  } catch (error: any) {
    logger.error('[Trading] History fetch failed:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/trading/stats
 * Get trading statistics for the authenticated user
 */
router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const period = (req.query.period as string) || '24h' // '24h', '7d', '30d', 'all'

    const stats = await tradingService.getTradingStats(userId, period)
    
    res.json(stats)
  } catch (error: any) {
    logger.error('[Trading] Stats fetch failed:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/trading/pause
 * Pause autonomous trading
 */
router.post('/pause', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { reason } = req.body

    await tradingService.pauseTrading(userId, reason || 'User requested pause')
    
    res.json({ success: true, message: 'Trading paused' })
  } catch (error: any) {
    logger.error('[Trading] Pause failed:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/trading/resume
 * Resume autonomous trading
 */
router.post('/resume', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    await tradingService.resumeTrading(userId)
    
    res.json({ success: true, message: 'Trading resumed' })
  } catch (error: any) {
    logger.error('[Trading] Resume failed:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/trading/emergency-stop
 * Emergency stop all trading (admin only)
 */
router.post('/emergency-stop', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const user = (req as any).user

    // Only allow admin/master users
    if (user.tier !== 'lifetime' && user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' })
    }

    await tradingService.emergencyStop(userId)
    
    logger.warn(`[Trading] EMERGENCY STOP triggered by ${userId}`)
    
    res.json({ success: true, message: 'Emergency stop activated' })
  } catch (error: any) {
    logger.error('[Trading] Emergency stop failed:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router

