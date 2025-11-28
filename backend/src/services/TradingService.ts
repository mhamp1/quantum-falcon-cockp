// ═══════════════════════════════════════════════════════════════
// TRADING SERVICE
// Core trading logic for executing trades server-side
// November 28, 2025 — Quantum Falcon Backend
// ═══════════════════════════════════════════════════════════════

import { Connection, PublicKey, VersionedTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { db } from '../db/index.js'
import { PriceService } from './PriceService.js'
import { logger } from './Logger.js'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface TradeResult {
  success: boolean
  signature?: string
  error?: string
  inputAmount: number
  outputAmount: number
  priceImpact: number
  route: string
}

interface TradingStats {
  totalTrades: number
  successfulTrades: number
  failedTrades: number
  totalVolume: number
  totalPnL: number
  winRate: number
  avgPnL: number
}

// ═══════════════════════════════════════════════════════════════
// JUPITER API CONSTANTS
// ═══════════════════════════════════════════════════════════════

const JUPITER_API = 'https://quote-api.jup.ag/v6'

const TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
}

// ═══════════════════════════════════════════════════════════════
// TRADING SERVICE CLASS
// ═══════════════════════════════════════════════════════════════

export class TradingService {
  private connection: Connection
  private heliusUrl: string

  constructor() {
    this.heliusUrl = process.env.HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com'
    this.connection = new Connection(this.heliusUrl, {
      commitment: 'confirmed',
    })
  }

  /**
   * Get live trading data for a user
   */
  async getLiveTradingData(userId: string) {
    // Get open positions
    const positions = await db.position.findMany({
      where: { userId, status: 'open' },
    })

    // Get recent trades
    const recentTrades = await db.trade.findMany({
      where: { userId },
      orderBy: { executedAt: 'desc' },
      take: 10,
    })

    // Calculate daily stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todaysTrades = await db.trade.findMany({
      where: {
        userId,
        executedAt: { gte: today },
        status: 'completed',
      },
    })

    const dailyPnL = todaysTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const dailyTrades = todaysTrades.length
    const dailyWins = todaysTrades.filter(t => (t.pnl || 0) > 0).length

    // Get total portfolio value (sum of position values)
    let portfolioValue = 0
    for (const pos of positions) {
      const price = await PriceService.getPrice(pos.token)
      portfolioValue += pos.amount * (price || 0)
    }

    return {
      portfolioValue,
      dailyPnL,
      winRate: dailyTrades > 0 ? (dailyWins / dailyTrades) * 100 : 0,
      activeTrades: positions.length,
      totalTrades: await db.trade.count({ where: { userId } }),
      weeklyWinRate: await this.calculateWeeklyWinRate(userId),
      dailyStreak: await this.calculateDailyStreak(userId),
      lastUpdated: Date.now(),
      positions,
      recentTrades,
    }
  }

  /**
   * Execute a trade
   * Note: In production, this would use the user's delegated wallet
   * For now, it simulates the trade and records it
   */
  async executeTrade(
    userId: string,
    side: 'buy' | 'sell',
    inputToken: string,
    outputToken: string,
    amount: number,
    options?: {
      slippageBps?: number
      priorityFee?: number
    }
  ): Promise<TradeResult> {
    const slippageBps = options?.slippageBps ?? 100

    try {
      // Get quote from Jupiter
      const params = new URLSearchParams({
        inputMint: inputToken,
        outputMint: outputToken,
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
      })

      const quoteRes = await fetch(`${JUPITER_API}/quote?${params}`)
      const quote = await quoteRes.json()

      if (quote.error) {
        throw new Error(quote.error)
      }

      // Get input and output prices for P&L calculation
      const inputPrice = await PriceService.getPrice(inputToken) || 0
      const outputPrice = await PriceService.getPrice(outputToken) || 0

      // In production: Build and sign transaction, then broadcast
      // For now: Simulate success and record the trade

      const outputAmount = parseInt(quote.outAmount)
      const priceImpact = quote.priceImpactPct || 0
      const route = quote.routePlan?.map((r: any) => r.swapInfo.label).join(' → ') || 'Direct'

      // Generate simulated signature for demo
      const signature = `sim-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

      // Calculate P&L (simplified)
      const inputValueUSD = (amount / LAMPORTS_PER_SOL) * inputPrice
      const outputValueUSD = (outputAmount / LAMPORTS_PER_SOL) * outputPrice
      const pnl = side === 'sell' ? outputValueUSD - inputValueUSD : 0

      // Record trade in database
      await db.trade.create({
        data: {
          userId,
          side,
          inputToken,
          outputToken,
          inputAmount: amount,
          outputAmount,
          price: outputPrice,
          priceImpact,
          slippage: slippageBps,
          signature,
          status: 'completed',
          pnl,
          executedAt: new Date(),
        },
      })

      logger.info(`[TradingService] Trade executed: ${signature}`, {
        userId,
        side,
        route,
        pnl,
      })

      return {
        success: true,
        signature,
        inputAmount: amount,
        outputAmount,
        priceImpact,
        route,
      }

    } catch (error: any) {
      logger.error('[TradingService] Trade failed:', error)

      // Record failed trade
      await db.trade.create({
        data: {
          userId,
          side,
          inputToken,
          outputToken,
          inputAmount: amount,
          outputAmount: 0,
          status: 'failed',
          error: error.message,
          executedAt: new Date(),
        },
      })

      return {
        success: false,
        error: error.message,
        inputAmount: amount,
        outputAmount: 0,
        priceImpact: 0,
        route: '',
      }
    }
  }

  /**
   * Get trade history
   */
  async getTradeHistory(userId: string, limit: number = 100, offset: number = 0) {
    return db.trade.findMany({
      where: { userId },
      orderBy: { executedAt: 'desc' },
      take: limit,
      skip: offset,
    })
  }

  /**
   * Get trading statistics
   */
  async getTradingStats(userId: string, period: string = '30d'): Promise<TradingStats> {
    const startDate = this.getStartDate(period)

    const trades = await db.trade.findMany({
      where: {
        userId,
        executedAt: { gte: startDate },
        status: 'completed',
      },
    })

    const totalTrades = trades.length
    const successfulTrades = trades.filter(t => (t.pnl || 0) >= 0).length
    const failedTrades = totalTrades - successfulTrades
    const totalVolume = trades.reduce((sum, t) => sum + (t.inputAmount || 0), 0)
    const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0)

    return {
      totalTrades,
      successfulTrades,
      failedTrades,
      totalVolume,
      totalPnL,
      winRate: totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0,
      avgPnL: totalTrades > 0 ? totalPnL / totalTrades : 0,
    }
  }

  /**
   * Pause trading for a user
   */
  async pauseTrading(userId: string, reason: string) {
    await db.user.update({
      where: { id: userId },
      data: {
        tradingPaused: true,
        tradingPausedReason: reason,
        tradingPausedAt: new Date(),
      },
    })
    logger.info(`[TradingService] Trading paused for ${userId}: ${reason}`)
  }

  /**
   * Resume trading for a user
   */
  async resumeTrading(userId: string) {
    await db.user.update({
      where: { id: userId },
      data: {
        tradingPaused: false,
        tradingPausedReason: null,
        tradingPausedAt: null,
      },
    })
    logger.info(`[TradingService] Trading resumed for ${userId}`)
  }

  /**
   * Emergency stop (admin)
   */
  async emergencyStop(adminUserId: string) {
    // Stop all active positions
    await db.position.updateMany({
      data: { status: 'emergency_stopped' },
    })

    // Pause all users
    await db.user.updateMany({
      data: {
        tradingPaused: true,
        tradingPausedReason: 'EMERGENCY STOP',
        tradingPausedAt: new Date(),
      },
    })

    logger.error(`[TradingService] EMERGENCY STOP triggered by ${adminUserId}`)
  }

  // ─── PRIVATE HELPERS ───

  private getStartDate(period: string): Date {
    const now = new Date()
    switch (period) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000)
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      case 'all':
        return new Date(0)
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
  }

  private async calculateWeeklyWinRate(userId: string): Promise<number> {
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    const trades = await db.trade.findMany({
      where: {
        userId,
        executedAt: { gte: startDate },
        status: 'completed',
      },
    })

    if (trades.length === 0) return 0
    
    const wins = trades.filter(t => (t.pnl || 0) > 0).length
    return (wins / trades.length) * 100
  }

  private async calculateDailyStreak(userId: string): Promise<number> {
    // Get trades grouped by day
    const trades = await db.trade.findMany({
      where: { userId, status: 'completed' },
      orderBy: { executedAt: 'desc' },
    })

    let streak = 0
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    const tradesByDay = new Map<string, number>()
    
    for (const trade of trades) {
      const day = trade.executedAt.toISOString().split('T')[0]
      const pnl = tradesByDay.get(day) || 0
      tradesByDay.set(day, pnl + (trade.pnl || 0))
    }

    // Count consecutive profitable days
    for (let i = 0; i < 365; i++) {
      const day = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]
      
      const pnl = tradesByDay.get(day)
      
      if (pnl === undefined) {
        if (i === 0) continue // Skip today if no trades
        break
      }
      
      if (pnl > 0) {
        streak++
      } else {
        break
      }
    }

    return streak
  }
}

