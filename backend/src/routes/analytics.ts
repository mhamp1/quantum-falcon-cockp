// ═══════════════════════════════════════════════════════════════
// ANALYTICS API ROUTES
// Trading analytics, performance metrics, tax reporting
// November 28, 2025 — Quantum Falcon Backend
// ═══════════════════════════════════════════════════════════════

import { Router, Request, Response } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { logger } from '../services/Logger.js'
import { db } from '../db/index.js'

const router = Router()

/**
 * GET /api/analytics/stats
 * Get comprehensive trading statistics
 */
router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const period = req.query.period as string || '30d'

    // Calculate date range
    const now = new Date()
    let startDate: Date
    switch (period) {
      case '24h':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'all':
        startDate = new Date(0)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    // Get trades from database
    const trades = await db.trade.findMany({
      where: {
        userId,
        executedAt: { gte: startDate },
        status: 'completed',
      },
    })

    // Calculate stats
    const totalTrades = trades.length
    const winningTrades = trades.filter(t => (t.pnl || 0) > 0).length
    const losingTrades = trades.filter(t => (t.pnl || 0) < 0).length
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

    const totalVolume = trades.reduce((sum, t) => sum + (t.inputAmount || 0), 0)
    const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0

    const biggestWin = Math.max(...trades.map(t => t.pnl || 0), 0)
    const biggestLoss = Math.min(...trades.map(t => t.pnl || 0), 0)

    res.json({
      period,
      totalTrades,
      winningTrades,
      losingTrades,
      winRate: winRate.toFixed(2),
      totalVolume,
      totalPnL,
      avgPnL,
      biggestWin,
      biggestLoss,
      profitFactor: Math.abs(biggestWin / (biggestLoss || 1)),
    })
  } catch (error: any) {
    logger.error('[Analytics] Stats fetch failed:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/analytics/daily
 * Get daily P&L breakdown
 */
router.get('/daily', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const days = Math.min(parseInt(req.query.days as string) || 30, 365)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const trades = await db.trade.findMany({
      where: {
        userId,
        executedAt: { gte: startDate },
        status: 'completed',
      },
      orderBy: { executedAt: 'asc' },
    })

    // Group by day
    const dailyPnL: Record<string, { date: string; pnl: number; trades: number }> = {}
    
    for (const trade of trades) {
      const date = trade.executedAt.toISOString().split('T')[0]
      if (!dailyPnL[date]) {
        dailyPnL[date] = { date, pnl: 0, trades: 0 }
      }
      dailyPnL[date].pnl += trade.pnl || 0
      dailyPnL[date].trades += 1
    }

    res.json({
      days,
      data: Object.values(dailyPnL),
    })
  } catch (error: any) {
    logger.error('[Analytics] Daily fetch failed:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/analytics/strategies
 * Get performance by strategy
 */
router.get('/strategies', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const trades = await db.trade.findMany({
      where: {
        userId,
        status: 'completed',
      },
    })

    // Group by strategy
    const byStrategy: Record<string, {
      strategy: string
      trades: number
      wins: number
      pnl: number
    }> = {}

    for (const trade of trades) {
      const strategy = trade.strategy || 'unknown'
      if (!byStrategy[strategy]) {
        byStrategy[strategy] = { strategy, trades: 0, wins: 0, pnl: 0 }
      }
      byStrategy[strategy].trades += 1
      byStrategy[strategy].pnl += trade.pnl || 0
      if ((trade.pnl || 0) > 0) {
        byStrategy[strategy].wins += 1
      }
    }

    // Add win rate
    const strategies = Object.values(byStrategy).map(s => ({
      ...s,
      winRate: s.trades > 0 ? ((s.wins / s.trades) * 100).toFixed(2) : '0.00',
    }))

    res.json({
      strategies: strategies.sort((a, b) => b.pnl - a.pnl),
    })
  } catch (error: any) {
    logger.error('[Analytics] Strategies fetch failed:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * GET /api/analytics/tax-report
 * Generate tax report for trades
 */
router.get('/tax-report', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const year = parseInt(req.query.year as string) || new Date().getFullYear()

    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year + 1, 0, 1)

    const trades = await db.trade.findMany({
      where: {
        userId,
        executedAt: {
          gte: startDate,
          lt: endDate,
        },
        status: 'completed',
      },
      orderBy: { executedAt: 'asc' },
    })

    // Calculate tax-relevant metrics
    const totalGains = trades.reduce((sum, t) => 
      (t.pnl || 0) > 0 ? sum + (t.pnl || 0) : sum, 0
    )
    const totalLosses = trades.reduce((sum, t) => 
      (t.pnl || 0) < 0 ? sum + Math.abs(t.pnl || 0) : sum, 0
    )
    const netPnL = totalGains - totalLosses

    // Short term vs long term (simplified - all short term for crypto day trading)
    const shortTermGains = totalGains
    const shortTermLosses = totalLosses

    res.json({
      year,
      totalTrades: trades.length,
      totalGains,
      totalLosses,
      netPnL,
      shortTermGains,
      shortTermLosses,
      estimatedTax: netPnL > 0 ? netPnL * 0.25 : 0, // Simplified 25% estimate
      trades: trades.map(t => ({
        date: t.executedAt,
        type: t.side,
        inputToken: t.inputToken,
        outputToken: t.outputToken,
        inputAmount: t.inputAmount,
        outputAmount: t.outputAmount,
        pnl: t.pnl,
        signature: t.signature,
      })),
    })
  } catch (error: any) {
    logger.error('[Analytics] Tax report failed:', error)
    res.status(500).json({ error: error.message })
  }
})

export default router

