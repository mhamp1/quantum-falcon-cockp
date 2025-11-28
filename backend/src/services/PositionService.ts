// ═══════════════════════════════════════════════════════════════
// POSITION SERVICE
// Manage positions, stop-loss, take-profit
// November 28, 2025 — Quantum Falcon Backend
// ═══════════════════════════════════════════════════════════════

import { db } from '../db/index.js'
import { TradingService } from './TradingService.js'
import { PriceService } from './PriceService.js'
import { logger } from './Logger.js'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface CreatePositionData {
  token: string
  symbol: string
  amount: number
  entryPrice: number
  stopLossPrice: number
  takeProfitPrice: number
  trailingStopPercent?: number
  strategy: string
}

interface UpdatePositionData {
  stopLossPrice?: number
  takeProfitPrice?: number
  trailingStopPercent?: number | null
}

interface PositionStats {
  openPositions: number
  totalValue: number
  totalUnrealizedPnL: number
  avgEntryPrice: number
  positionsClosed: number
  totalRealizedPnL: number
}

// ═══════════════════════════════════════════════════════════════
// POSITION SERVICE CLASS
// ═══════════════════════════════════════════════════════════════

export class PositionService {
  private tradingService: TradingService

  constructor() {
    this.tradingService = new TradingService()
  }

  /**
   * Get all open positions for a user
   */
  async getOpenPositions(userId: string) {
    const positions = await db.position.findMany({
      where: { userId, status: 'open' },
      orderBy: { openedAt: 'desc' },
    })

    // Enrich with current prices
    const enriched = await Promise.all(
      positions.map(async (pos) => {
        const currentPrice = await PriceService.getPrice(pos.token)
        const unrealizedPnL = currentPrice 
          ? (currentPrice - pos.entryPrice) * pos.amount
          : 0
        const unrealizedPnLPercent = pos.entryPrice > 0
          ? ((currentPrice || pos.entryPrice) - pos.entryPrice) / pos.entryPrice * 100
          : 0

        return {
          ...pos,
          currentPrice,
          unrealizedPnL,
          unrealizedPnLPercent,
        }
      })
    )

    return enriched
  }

  /**
   * Get a specific position
   */
  async getPosition(userId: string, positionId: string) {
    const position = await db.position.findFirst({
      where: { id: positionId, userId },
    })

    if (!position) return null

    const currentPrice = await PriceService.getPrice(position.token)
    
    return {
      ...position,
      currentPrice,
      unrealizedPnL: currentPrice 
        ? (currentPrice - position.entryPrice) * position.amount
        : 0,
    }
  }

  /**
   * Create a new position
   */
  async createPosition(userId: string, data: CreatePositionData) {
    // Check max positions (10 per user)
    const existingCount = await db.position.count({
      where: { userId, status: 'open' },
    })

    if (existingCount >= 10) {
      throw new Error('Maximum positions (10) reached')
    }

    const position = await db.position.create({
      data: {
        userId,
        token: data.token,
        symbol: data.symbol,
        amount: data.amount,
        entryPrice: data.entryPrice,
        stopLossPrice: data.stopLossPrice,
        takeProfitPrice: data.takeProfitPrice,
        trailingStopPercent: data.trailingStopPercent,
        highestPrice: data.entryPrice,
        strategy: data.strategy,
        status: 'open',
        side: 'long',
        openedAt: new Date(),
      },
    })

    logger.info(`[PositionService] Created position ${position.id} for ${userId}`)

    return position
  }

  /**
   * Update a position's stop-loss/take-profit
   */
  async updatePosition(userId: string, positionId: string, data: UpdatePositionData) {
    const position = await db.position.findFirst({
      where: { id: positionId, userId, status: 'open' },
    })

    if (!position) return null

    const updated = await db.position.update({
      where: { id: positionId },
      data: {
        ...(data.stopLossPrice !== undefined && { stopLossPrice: data.stopLossPrice }),
        ...(data.takeProfitPrice !== undefined && { takeProfitPrice: data.takeProfitPrice }),
        ...(data.trailingStopPercent !== undefined && { trailingStopPercent: data.trailingStopPercent }),
        updatedAt: new Date(),
      },
    })

    logger.info(`[PositionService] Updated position ${positionId}`)

    return updated
  }

  /**
   * Close a position
   */
  async closePosition(userId: string, positionId: string, reason: string) {
    const position = await db.position.findFirst({
      where: { id: positionId, userId, status: 'open' },
    })

    if (!position) return null

    // Get current price
    const currentPrice = await PriceService.getPrice(position.token) || position.entryPrice

    // Calculate P&L
    const pnl = (currentPrice - position.entryPrice) * position.amount
    const pnlPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100

    // Execute sell trade (in production)
    // For now, just record the close

    // Update position status
    const closed = await db.position.update({
      where: { id: positionId },
      data: {
        status: 'closed',
        exitPrice: currentPrice,
        exitReason: reason,
        pnl,
        closedAt: new Date(),
      },
    })

    logger.info(`[PositionService] Closed position ${positionId}: ${reason}, PnL: $${pnl.toFixed(2)}`)

    return {
      ...closed,
      pnlPercent,
    }
  }

  /**
   * Remove position from monitoring (without executing trade)
   */
  async removePosition(userId: string, positionId: string) {
    const result = await db.position.deleteMany({
      where: { id: positionId, userId },
    })

    return result.count > 0
  }

  /**
   * Get closed positions history
   */
  async getClosedPositions(userId: string, limit: number = 50, offset: number = 0) {
    return db.position.findMany({
      where: { userId, status: 'closed' },
      orderBy: { closedAt: 'desc' },
      take: limit,
      skip: offset,
    })
  }

  /**
   * Get position statistics
   */
  async getPositionStats(userId: string): Promise<PositionStats> {
    const openPositions = await this.getOpenPositions(userId)
    
    const closedPositions = await db.position.findMany({
      where: { userId, status: 'closed' },
    })

    const totalValue = openPositions.reduce(
      (sum, p) => sum + p.amount * (p.currentPrice || p.entryPrice),
      0
    )

    const totalUnrealizedPnL = openPositions.reduce(
      (sum, p) => sum + (p.unrealizedPnL || 0),
      0
    )

    const avgEntryPrice = openPositions.length > 0
      ? openPositions.reduce((sum, p) => sum + p.entryPrice, 0) / openPositions.length
      : 0

    const totalRealizedPnL = closedPositions.reduce(
      (sum, p) => sum + (p.pnl || 0),
      0
    )

    return {
      openPositions: openPositions.length,
      totalValue,
      totalUnrealizedPnL,
      avgEntryPrice,
      positionsClosed: closedPositions.length,
      totalRealizedPnL,
    }
  }

  /**
   * Check all positions for stop-loss/take-profit triggers
   * Called by PositionMonitorWorker
   */
  async checkAllPositions() {
    // Get all open positions
    const positions = await db.position.findMany({
      where: { status: 'open' },
    })

    // Get unique tokens
    const tokens = [...new Set(positions.map(p => p.token))]
    
    // Fetch current prices
    const prices: Record<string, number> = {}
    for (const token of tokens) {
      prices[token] = await PriceService.getPrice(token) || 0
    }

    // Check each position
    for (const position of positions) {
      const currentPrice = prices[position.token]
      if (!currentPrice) continue

      // Update highest price for trailing stop
      if (currentPrice > position.highestPrice) {
        await db.position.update({
          where: { id: position.id },
          data: { highestPrice: currentPrice },
        })
      }

      // Calculate effective stop loss
      let effectiveStopLoss = position.stopLossPrice
      if (position.trailingStopPercent && position.trailingStopPercent > 0) {
        const trailingStop = position.highestPrice * (1 - position.trailingStopPercent / 100)
        effectiveStopLoss = Math.max(effectiveStopLoss, trailingStop)
      }

      // Check stop loss
      if (currentPrice <= effectiveStopLoss) {
        logger.info(`[PositionService] STOP LOSS triggered: ${position.symbol} @ $${currentPrice}`)
        await this.closePosition(
          position.userId,
          position.id,
          effectiveStopLoss > position.stopLossPrice ? 'trailing_stop' : 'stop_loss'
        )
        continue
      }

      // Check take profit
      if (currentPrice >= position.takeProfitPrice) {
        logger.info(`[PositionService] TAKE PROFIT triggered: ${position.symbol} @ $${currentPrice}`)
        await this.closePosition(position.userId, position.id, 'take_profit')
        continue
      }
    }
  }
}

