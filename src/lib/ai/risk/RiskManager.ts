// Risk Manager — Multi-Layer Risk Protection
// November 21, 2025 — Quantum Falcon Cockpit
// Implements circuit breaker, daily limits, Kelly Criterion, and stop-loss tracking
// Based on original Python script's RiskManager class

import { getLearningSystem } from '../learning/AdaptiveLearningSystem'

export interface RiskState {
  circuitBreakerActive: boolean
  circuitBreakerUntil: number
  consecutiveLosses: number
  dailyLoss: number
  dailyResetTime: number
  positionStops: Record<string, {
    entry: number
    stop: number
    target: number
    action: 'buy' | 'sell'
  }>
  winRateHistory: number[]
  avgWinPct: number
  avgLossPct: number
}

export interface PositionSizeParams {
  totalCapital: number
  confidence: number
  volatility: number
  winRate: number
  avgWin: number
  avgLoss: number
  regime?: 'bear' | 'bull' | 'neutral'
}

/**
 * Risk Manager
 * Multi-layer risk management to prevent losses
 */
export class RiskManager {
  private state: RiskState
  private maxConsecutiveLosses = 3
  private maxDailyLossPct = 0.05 // 5% max daily loss
  private stopLossPct = 0.02 // 2% stop loss
  private takeProfitPct = 0.05 // 5% take profit
  private maxPositionPct = 0.1 // 10% max position size

  constructor() {
    this.state = {
      circuitBreakerActive: false,
      circuitBreakerUntil: 0,
      consecutiveLosses: 0,
      dailyLoss: 0,
      dailyResetTime: Date.now(),
      positionStops: {},
      winRateHistory: [],
      avgWinPct: 0.05, // Default 5% wins
      avgLossPct: 0.02, // Default 2% losses
    }

    // Load saved state
    this.loadState()
  }

  /**
   * Check if circuit breaker is active
   */
  isCircuitBreakerActive(): boolean {
    if (!this.state.circuitBreakerActive) return false

    // Check if circuit breaker should be deactivated
    if (Date.now() >= this.state.circuitBreakerUntil) {
      this.deactivateCircuitBreaker()
      return false
    }

    return true
  }

  /**
   * Activate circuit breaker
   */
  activateCircuitBreaker(durationMs: number = 3600000): void {
    this.state.circuitBreakerActive = true
    this.state.circuitBreakerUntil = Date.now() + durationMs
    this.saveState()
    console.warn(`🛑 Circuit breaker activated for ${durationMs / 1000 / 60} minutes`)
  }

  /**
   * Deactivate circuit breaker
   */
  deactivateCircuitBreaker(): void {
    this.state.circuitBreakerActive = false
    this.state.circuitBreakerUntil = 0
    this.state.consecutiveLosses = 0
    this.saveState()
    // Circuit breaker deactivated
  }

  /**
   * Record a loss and check for circuit breaker
   */
  recordLoss(lossPct: number): void {
    // Reset daily loss if new day
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000
    if (now - this.state.dailyResetTime > oneDay) {
      this.state.dailyLoss = 0
      this.state.dailyResetTime = now
    }

    // Add to daily loss
    this.state.dailyLoss += Math.abs(lossPct)

    // Check daily limit
    if (this.state.dailyLoss >= this.maxDailyLossPct) {
      this.activateCircuitBreaker(3600000) // 1 hour - Daily loss limit reached
      return
    }

    // Track consecutive losses
    this.state.consecutiveLosses++
    this.state.winRateHistory.push(0) // 0 = loss

    // Activate circuit breaker after max consecutive losses
    if (this.state.consecutiveLosses >= this.maxConsecutiveLosses) {
      this.activateCircuitBreaker(7200000) // 2 hours - consecutive losses triggered
    }

    // Keep last 50 trades
    if (this.state.winRateHistory.length > 50) {
      this.state.winRateHistory.shift()
    }

    // Update average loss
    this.state.avgLossPct = this.state.avgLossPct * 0.9 + Math.abs(lossPct) * 0.1

    this.saveState()
  }

  /**
   * Record a win
   */
  recordWin(winPct: number): void {
    this.state.consecutiveLosses = 0 // Reset consecutive losses
    this.state.winRateHistory.push(1) // 1 = win

    // Keep last 50 trades
    if (this.state.winRateHistory.length > 50) {
      this.state.winRateHistory.shift()
    }

    // Update average win
    this.state.avgWinPct = this.state.avgWinPct * 0.9 + winPct * 0.1

    this.saveState()
  }

  /**
   * Check if trade is allowed
   */
  canTrade(estimatedLossPct: number = 0.02): boolean {
    // Check circuit breaker
    if (this.isCircuitBreakerActive()) {
      return false
    }

    // Reset daily loss if new day
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000
    if (now - this.state.dailyResetTime > oneDay) {
      this.state.dailyLoss = 0
      this.state.dailyResetTime = now
    }

    // Check if adding this trade would exceed daily limit
    if (this.state.dailyLoss + estimatedLossPct > this.maxDailyLossPct) {
      return false // Trade would exceed daily loss limit
    }

    return true
  }

  /**
   * Calculate position size using Kelly Criterion
   * Based on original Python script's calculate_kelly_position()
   */
  calculateKellyPosition(params: PositionSizeParams): number {
    const { winRate, avgWin, avgLoss, regime = 'neutral' } = params

    if (winRate <= 0 || winRate >= 1) {
      return 0.05 // Default conservative size
    }

    if (avgLoss <= 0) {
      return 0.05 // Avoid division by zero
    }

    // Calculate Kelly percentage
    // Kelly % = (p * b - q) / b
    // where p = win probability, q = loss probability (1-p), b = win/loss ratio
    const p = winRate
    const q = 1 - p
    const b = avgWin / avgLoss

    const kellyPct = (p * b - q) / b

    // Use half-Kelly for safety
    const halfKelly = kellyPct / 2.0

    // Apply regime scaling (from original script)
    if (regime === 'bull') {
      // 2x allocation in bull markets
      const scaledKelly = halfKelly * 2.0
      // Clamp to bull market bounds (0.5% to 20%)
      return Math.max(0.005, Math.min(0.20, scaledKelly))
    } else {
      // Normal allocation for bear/neutral
      // Clamp to reasonable bounds (0.5% to 15%)
      return Math.max(0.005, Math.min(0.15, halfKelly))
    }
  }

  /**
   * Calculate safe position size based on capital and risk
   */
  calculatePositionSize(
    totalCapital: number,
    confidence: number,
    volatility: number
  ): number {
    // Base size from capital
    const baseSize = totalCapital * this.maxPositionPct

    // Adjust for confidence (0.5 to 1.5x)
    const confidenceMultiplier = 0.5 + confidence

    // Adjust for volatility (reduce size in high volatility)
    const volatilityDivisor = 1.0 + (volatility / 10.0)

    const safeSize = (baseSize * confidenceMultiplier) / volatilityDivisor

    return Math.max(0.001, safeSize) // Minimum position
  }

  /**
   * Set stop loss and take profit for position
   */
  setStopLoss(
    symbol: string,
    entryPrice: number,
    action: 'buy' | 'sell'
  ): void {
    let stopPrice: number
    let targetPrice: number

    if (action === 'buy') {
      stopPrice = entryPrice * (1 - this.stopLossPct)
      targetPrice = entryPrice * (1 + this.takeProfitPct)
    } else {
      stopPrice = entryPrice * (1 + this.stopLossPct)
      targetPrice = entryPrice * (1 - this.takeProfitPct)
    }

    this.state.positionStops[symbol] = {
      entry: entryPrice,
      stop: stopPrice,
      target: targetPrice,
      action,
    }

    this.saveState()
    console.log(`🛡️ Stop set: ${symbol} entry=${entryPrice.toFixed(2)} stop=${stopPrice.toFixed(2)} target=${targetPrice.toFixed(2)}`)
  }

  /**
   * Check if stop loss or take profit hit
   */
  checkStopLoss(symbol: string, currentPrice: number): 'stop_loss' | 'take_profit' | null {
    const stopInfo = this.state.positionStops[symbol]
    if (!stopInfo) return null

    const { stop, target, action } = stopInfo

    if (action === 'buy') {
      if (currentPrice <= stop) {
        delete this.state.positionStops[symbol]
        this.saveState()
        return 'stop_loss'
      } else if (currentPrice >= target) {
        delete this.state.positionStops[symbol]
        this.saveState()
        return 'take_profit'
      }
    } else {
      if (currentPrice >= stop) {
        delete this.state.positionStops[symbol]
        this.saveState()
        return 'stop_loss'
      } else if (currentPrice <= target) {
        delete this.state.positionStops[symbol]
        this.saveState()
        return 'take_profit'
      }
    }

    return null
  }

  /**
   * Get current win rate
   */
  getWinRate(): number {
    if (this.state.winRateHistory.length === 0) return 0.5
    const wins = this.state.winRateHistory.filter(w => w === 1).length
    return wins / this.state.winRateHistory.length
  }

  /**
   * Get risk state
   */
  getState(): RiskState {
    return { ...this.state }
  }

  /**
   * Save state to localStorage
   */
  private saveState(): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('quantum-falcon-risk-state', JSON.stringify(this.state))
    } catch (error) {
      console.warn('Failed to save risk state:', error)
    }
  }

  /**
   * Load state from localStorage
   */
  private loadState(): void {
    if (typeof window === 'undefined') return
    try {
      const saved = localStorage.getItem('quantum-falcon-risk-state')
      if (saved) {
        const parsed = JSON.parse(saved)
        this.state = { ...this.state, ...parsed }
      }
    } catch (error) {
      console.warn('Failed to load risk state:', error)
    }
  }
}

// Singleton instance
let riskManagerInstance: RiskManager | null = null

export function getRiskManager(): RiskManager {
  if (!riskManagerInstance) {
    riskManagerInstance = new RiskManager()
  }
  return riskManagerInstance
}

