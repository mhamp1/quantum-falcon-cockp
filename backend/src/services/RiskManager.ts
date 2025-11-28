// ═══════════════════════════════════════════════════════════════
// RISK MANAGER SERVICE
// Multi-layer risk management for autonomous trading
// November 28, 2025 — Quantum Falcon Backend
// ═══════════════════════════════════════════════════════════════

import { db } from '../db/index.js'
import { logger, logSecurity } from './Logger.js'
import { emergencyOpenAll } from './CircuitBreaker.js'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface RiskLimits {
  maxDailyLossUSD: number
  maxDrawdownPercent: number
  maxPositionSizeUSD: number
  maxPositionsPerUser: number
  maxTradesPerMinute: number
  maxConsecutiveLosses: number
  minTimeBetweenTradesMs: number
}

interface RiskStatus {
  isHealthy: boolean
  alerts: string[]
  currentDailyLoss: number
  currentDrawdown: number
  openPositions: number
  consecutiveLosses: number
  lastTradeAt: number
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT LIMITS
// ═══════════════════════════════════════════════════════════════

const DEFAULT_LIMITS: RiskLimits = {
  maxDailyLossUSD: 500,
  maxDrawdownPercent: 20,
  maxPositionSizeUSD: 1000,
  maxPositionsPerUser: 10,
  maxTradesPerMinute: 10,
  maxConsecutiveLosses: 5,
  minTimeBetweenTradesMs: 5000,
}

// ═══════════════════════════════════════════════════════════════
// RISK MANAGER CLASS
// ═══════════════════════════════════════════════════════════════

export class RiskManager {
  private limits: RiskLimits
  private dailyLossTracker: Map<string, number> = new Map()
  private consecutiveLossTracker: Map<string, number> = new Map()
  private tradeTimestamps: Map<string, number[]> = new Map()
  private drawdownTracker: Map<string, { peak: number; current: number }> = new Map()

  constructor(limits?: Partial<RiskLimits>) {
    this.limits = { ...DEFAULT_LIMITS, ...limits }
    
    // Reset daily loss at midnight
    this.scheduleDailyReset()
  }

  /**
   * Check if a trade can be executed based on risk limits
   */
  async canExecuteTrade(
    userId: string,
    positionSizeUSD: number
  ): Promise<{ allowed: boolean; reason?: string }> {
    const alerts: string[] = []

    // 1. Check daily loss limit
    const dailyLoss = this.dailyLossTracker.get(userId) || 0
    if (dailyLoss >= this.limits.maxDailyLossUSD) {
      return { allowed: false, reason: `Daily loss limit reached ($${dailyLoss.toFixed(2)})` }
    }

    // 2. Check position size
    if (positionSizeUSD > this.limits.maxPositionSizeUSD) {
      return { allowed: false, reason: `Position too large ($${positionSizeUSD.toFixed(2)} > $${this.limits.maxPositionSizeUSD})` }
    }

    // 3. Check max positions
    const openPositions = await db.position.count({
      where: { userId, status: 'open' },
    })
    if (openPositions >= this.limits.maxPositionsPerUser) {
      return { allowed: false, reason: `Maximum positions reached (${openPositions})` }
    }

    // 4. Check trade rate limit
    const timestamps = this.tradeTimestamps.get(userId) || []
    const recentTrades = timestamps.filter(t => Date.now() - t < 60000)
    if (recentTrades.length >= this.limits.maxTradesPerMinute) {
      return { allowed: false, reason: `Trade rate limit exceeded (${recentTrades.length}/min)` }
    }

    // 5. Check time since last trade
    const lastTrade = timestamps[timestamps.length - 1]
    if (lastTrade && Date.now() - lastTrade < this.limits.minTimeBetweenTradesMs) {
      const waitMs = this.limits.minTimeBetweenTradesMs - (Date.now() - lastTrade)
      return { allowed: false, reason: `Cooldown: Wait ${Math.ceil(waitMs / 1000)}s` }
    }

    // 6. Check consecutive losses
    const consecutiveLosses = this.consecutiveLossTracker.get(userId) || 0
    if (consecutiveLosses >= this.limits.maxConsecutiveLosses) {
      return { allowed: false, reason: `Too many consecutive losses (${consecutiveLosses})` }
    }

    // 7. Check drawdown
    const drawdown = this.drawdownTracker.get(userId)
    if (drawdown) {
      const drawdownPercent = ((drawdown.peak - drawdown.current) / drawdown.peak) * 100
      if (drawdownPercent >= this.limits.maxDrawdownPercent) {
        return { allowed: false, reason: `Max drawdown reached (${drawdownPercent.toFixed(1)}%)` }
      }
    }

    return { allowed: true }
  }

  /**
   * Record a trade result
   */
  recordTradeResult(userId: string, pnl: number): void {
    // Update daily loss
    if (pnl < 0) {
      const currentLoss = this.dailyLossTracker.get(userId) || 0
      this.dailyLossTracker.set(userId, currentLoss + Math.abs(pnl))

      // Update consecutive losses
      const consecutiveLosses = this.consecutiveLossTracker.get(userId) || 0
      this.consecutiveLossTracker.set(userId, consecutiveLosses + 1)

      // Check if we need to trigger alerts
      if (consecutiveLosses + 1 >= this.limits.maxConsecutiveLosses) {
        logSecurity('Consecutive loss limit reached', 'high', { userId, losses: consecutiveLosses + 1 })
      }
    } else {
      // Reset consecutive losses on win
      this.consecutiveLossTracker.set(userId, 0)
    }

    // Update trade timestamps
    const timestamps = this.tradeTimestamps.get(userId) || []
    timestamps.push(Date.now())
    // Keep only last hour of timestamps
    this.tradeTimestamps.set(userId, timestamps.filter(t => Date.now() - t < 3600000))

    // Update drawdown tracking
    this.updateDrawdown(userId, pnl)
  }

  /**
   * Update drawdown tracking
   */
  private updateDrawdown(userId: string, pnl: number): void {
    let tracker = this.drawdownTracker.get(userId)
    
    if (!tracker) {
      tracker = { peak: 0, current: 0 }
    }

    tracker.current += pnl
    
    if (tracker.current > tracker.peak) {
      tracker.peak = tracker.current
    }

    this.drawdownTracker.set(userId, tracker)

    // Check if drawdown limit reached
    if (tracker.peak > 0) {
      const drawdownPercent = ((tracker.peak - tracker.current) / tracker.peak) * 100
      
      if (drawdownPercent >= this.limits.maxDrawdownPercent) {
        logSecurity('Max drawdown reached', 'critical', {
          userId,
          drawdownPercent: drawdownPercent.toFixed(1),
          peak: tracker.peak,
          current: tracker.current,
        })
      }
    }
  }

  /**
   * Get risk status for a user
   */
  async getRiskStatus(userId: string): Promise<RiskStatus> {
    const alerts: string[] = []
    
    const dailyLoss = this.dailyLossTracker.get(userId) || 0
    const consecutiveLosses = this.consecutiveLossTracker.get(userId) || 0
    const timestamps = this.tradeTimestamps.get(userId) || []
    const drawdown = this.drawdownTracker.get(userId)
    
    const openPositions = await db.position.count({
      where: { userId, status: 'open' },
    })

    // Generate alerts
    if (dailyLoss > this.limits.maxDailyLossUSD * 0.8) {
      alerts.push(`Approaching daily loss limit (${(dailyLoss / this.limits.maxDailyLossUSD * 100).toFixed(0)}%)`)
    }

    if (consecutiveLosses >= this.limits.maxConsecutiveLosses - 1) {
      alerts.push(`Near consecutive loss limit (${consecutiveLosses})`)
    }

    if (openPositions >= this.limits.maxPositionsPerUser - 1) {
      alerts.push(`Near position limit (${openPositions}/${this.limits.maxPositionsPerUser})`)
    }

    const currentDrawdown = drawdown 
      ? ((drawdown.peak - drawdown.current) / drawdown.peak) * 100 
      : 0

    if (currentDrawdown > this.limits.maxDrawdownPercent * 0.7) {
      alerts.push(`High drawdown (${currentDrawdown.toFixed(1)}%)`)
    }

    return {
      isHealthy: alerts.length === 0,
      alerts,
      currentDailyLoss: dailyLoss,
      currentDrawdown,
      openPositions,
      consecutiveLosses,
      lastTradeAt: timestamps[timestamps.length - 1] || 0,
    }
  }

  /**
   * Emergency stop for a user
   */
  async emergencyStop(userId: string): Promise<void> {
    logger.error(`[RiskManager] EMERGENCY STOP for user ${userId}`)
    
    // Close all positions
    await db.position.updateMany({
      where: { userId, status: 'open' },
      data: { status: 'emergency_stopped' },
    })

    // Pause trading
    await db.user.update({
      where: { id: userId },
      data: {
        tradingPaused: true,
        tradingPausedReason: 'EMERGENCY STOP',
        tradingPausedAt: new Date(),
      },
    })

    logSecurity('Emergency stop triggered', 'critical', { userId })
  }

  /**
   * Global emergency stop
   */
  async globalEmergencyStop(): Promise<void> {
    logger.error('[RiskManager] GLOBAL EMERGENCY STOP')
    
    // Open all circuit breakers
    emergencyOpenAll()

    // Close all positions
    await db.position.updateMany({
      where: { status: 'open' },
      data: { status: 'emergency_stopped' },
    })

    // Pause all users
    await db.user.updateMany({
      data: {
        tradingPaused: true,
        tradingPausedReason: 'GLOBAL EMERGENCY STOP',
        tradingPausedAt: new Date(),
      },
    })

    logSecurity('Global emergency stop triggered', 'critical', {})
  }

  /**
   * Update risk limits
   */
  setLimits(limits: Partial<RiskLimits>): void {
    this.limits = { ...this.limits, ...limits }
    logger.info('[RiskManager] Limits updated:', this.limits)
  }

  /**
   * Get current limits
   */
  getLimits(): RiskLimits {
    return { ...this.limits }
  }

  /**
   * Reset all trackers (for testing)
   */
  resetAll(): void {
    this.dailyLossTracker.clear()
    this.consecutiveLossTracker.clear()
    this.tradeTimestamps.clear()
    this.drawdownTracker.clear()
  }

  /**
   * Schedule daily reset at midnight
   */
  private scheduleDailyReset(): void {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    const msUntilMidnight = midnight.getTime() - now.getTime()

    setTimeout(() => {
      this.dailyLossTracker.clear()
      logger.info('[RiskManager] Daily loss trackers reset')
      
      // Schedule next reset
      this.scheduleDailyReset()
    }, msUntilMidnight)
  }
}

// Singleton instance
export const riskManager = new RiskManager()
export default RiskManager

