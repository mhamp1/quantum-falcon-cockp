// ═══════════════════════════════════════════════════════════════
// POSITIONS API ROUTES
// Manage open positions, stop-loss, take-profit
// November 28, 2025 — Quantum Falcon Backend
// ═══════════════════════════════════════════════════════════════

import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { PositionService } from '../services/PositionService.js'
import { authMiddleware } from '../middleware/auth.js'
import { logger } from '../services/Logger.js'

const router = Router()
const positionService = new PositionService()

// ═══════════════════════════════════════════════════════════════
// VALIDATION SCHEMAS
// ═══════════════════════════════════════════════════════════════

const CreatePositionSchema = z.object({
  token: z.string().min(32).max(44),
  symbol: z.string().min(1).max(20),
  amount: z.number().positive(),
  entryPrice: z.number().positive(),
  stopLossPercent: z.number().min(1).max(50).optional().default(5),
  takeProfitPercent: z.number().min(1).max(500).optional().default(15),
  trailingStopPercent: z.number().min(0.5).max(20).optional(),
  strategy: z.string().optional().default('manual'),
})

const UpdatePositionSchema = z.object({
  stopLossPrice: z.number().positive().optional(),
  takeProfitPrice: z.number().positive().optional(),
  trailingStopPercent: z.number().min(0.5).max(20).optional().nullable(),
})

// ═══════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/positions
 * Get all open positions for the authenticated user
 */
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const positions = await positionService.getOpenPositions(userId)
    
    res.json({
      positions,
      count: positions.length,
    })
  } catch (error: any) {
    logger.error('[Positions] Fetch failed:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/positions/:id
 * Get a specific position
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const positionId = req.params.id

    const position = await positionService.getPosition(userId, positionId)
    
    if (!position) {
      return res.status(404).json({ error: 'Position not found' })
    }

    res.json(position)
  } catch (error: any) {
    logger.error('[Positions] Fetch by ID failed:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/positions
 * Create a new monitored position
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    
    const validation = CreatePositionSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request',
        details: validation.error.errors,
      })
    }

    const data = validation.data
    
    // Calculate stop loss and take profit prices
    const stopLossPrice = data.entryPrice * (1 - data.stopLossPercent / 100)
    const takeProfitPrice = data.entryPrice * (1 + data.takeProfitPercent / 100)

    const position = await positionService.createPosition(userId, {
      token: data.token,
      symbol: data.symbol,
      amount: data.amount,
      entryPrice: data.entryPrice,
      stopLossPrice,
      takeProfitPrice,
      trailingStopPercent: data.trailingStopPercent,
      strategy: data.strategy,
    })

    logger.info(`[Positions] Created position ${position.id} for user ${userId}`)

    res.status(201).json(position)
  } catch (error: any) {
    logger.error('[Positions] Create failed:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * PATCH /api/positions/:id
 * Update stop-loss/take-profit for a position
 */
router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const positionId = req.params.id

    const validation = UpdatePositionSchema.safeParse(req.body)
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid request',
        details: validation.error.errors,
      })
    }

    const position = await positionService.updatePosition(
      userId,
      positionId,
      validation.data
    )

    if (!position) {
      return res.status(404).json({ error: 'Position not found' })
    }

    logger.info(`[Positions] Updated position ${positionId} for user ${userId}`)

    res.json(position)
  } catch (error: any) {
    logger.error('[Positions] Update failed:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/positions/:id/close
 * Manually close a position
 */
router.post('/:id/close', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const positionId = req.params.id

    const result = await positionService.closePosition(userId, positionId, 'manual')

    if (!result) {
      return res.status(404).json({ error: 'Position not found' })
    }

    logger.info(`[Positions] Closed position ${positionId} for user ${userId}`)

    res.json(result)
  } catch (error: any) {
    logger.error('[Positions] Close failed:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * DELETE /api/positions/:id
 * Remove position from monitoring (without closing trade)
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const positionId = req.params.id

    const removed = await positionService.removePosition(userId, positionId)

    if (!removed) {
      return res.status(404).json({ error: 'Position not found' })
    }

    res.json({ success: true, message: 'Position removed from monitoring' })
  } catch (error: any) {
    logger.error('[Positions] Delete failed:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/positions/history
 * Get closed positions history
 */
router.get('/history', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200)
    const offset = parseInt(req.query.offset as string) || 0

    const positions = await positionService.getClosedPositions(userId, limit, offset)

    res.json({
      positions,
      pagination: {
        limit,
        offset,
        hasMore: positions.length === limit,
      },
    })
  } catch (error: any) {
    logger.error('[Positions] History fetch failed:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/positions/stats
 * Get position statistics
 */
router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const stats = await positionService.getPositionStats(userId)

    res.json(stats)
  } catch (error: any) {
    logger.error('[Positions] Stats fetch failed:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router

