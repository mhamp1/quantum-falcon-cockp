// ═══════════════════════════════════════════════════════════════
// RISK MANAGEMENT SYSTEM — Circuit Breakers & Safety Controls
// Protect users from catastrophic losses
// November 27, 2025 — Production Ready
// ═══════════════════════════════════════════════════════════════

import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface RiskConfig {
  // Position Limits
  maxPositionSizeUSD: number       // Max USD per position
  maxTotalExposureUSD: number      // Max total portfolio exposure
  maxPositionPercent: number       // Max % of portfolio per position

  // Loss Limits
  maxDailyLossUSD: number          // Max loss before daily pause
  maxDailyLossPercent: number      // Max % loss before daily pause
  maxDrawdownPercent: number       // Max drawdown before emergency stop
  maxConsecutiveLosses: number     // Max losing trades in a row

  // Trade Limits
  maxTradesPerMinute: number       // Rate limit
  maxTradesPerHour: number         // Hourly limit
  maxTradesPerDay: number          // Daily limit
  minTimeBetweenTrades: number     // Seconds between trades

  // Slippage & Price Impact
  maxSlippageBps: number           // Max allowed slippage
  maxPriceImpactPercent: number    // Max price impact

  // Recovery
  cooldownAfterLoss: number        // Seconds to wait after loss
  reducePositionAfterLoss: boolean // Auto-reduce size after loss
  requireConfirmationAbove: number // Require confirmation above USD
}

export interface RiskState {
  // Daily Stats
  dailyPnL: number
  dailyPnLPercent: number
  dailyTrades: number
  dailyVolume: number
  dailyWins: number
  dailyLosses: number
  consecutiveLosses: number

  // Portfolio State
  totalExposure: number
  largestPosition: number
  currentDrawdown: number
  peakValue: number

  // Time Tracking
  lastTradeTimestamp: number
  tradesThisMinute: number
  tradesThisHour: number
  dayStartTimestamp: number

  // Status
  isPaused: boolean
  pauseReason: string
  isEmergencyStop: boolean
  lastRiskCheck: number
}

export interface RiskCheckResult {
  allowed: boolean
  reason?: string
  warnings: string[]
  adjustedSize?: number
  requiredConfirmation?: boolean
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_RISK_CONFIG: RiskConfig = {
  // Position Limits
  maxPositionSizeUSD: 1000,
  maxTotalExposureUSD: 5000,
  maxPositionPercent: 25,

  // Loss Limits
  maxDailyLossUSD: 500,
  maxDailyLossPercent: 10,
  maxDrawdownPercent: 20,
  maxConsecutiveLosses: 5,

  // Trade Limits
  maxTradesPerMinute: 5,
  maxTradesPerHour: 50,
  maxTradesPerDay: 200,
  minTimeBetweenTrades: 3,

  // Slippage & Price Impact
  maxSlippageBps: 300, // 3%
  maxPriceImpactPercent: 5,

  // Recovery
  cooldownAfterLoss: 10,
  reducePositionAfterLoss: true,
  requireConfirmationAbove: 500,
}

// ═══════════════════════════════════════════════════════════════
// RISK MANAGEMENT SYSTEM CLASS
// ═══════════════════════════════════════════════════════════════

export class RiskManagementSystem {
  private config: RiskConfig
  private state: RiskState
  private callbacks: {
    onPause?: (reason: string) => void
    onEmergencyStop?: (reason: string) => void
    onRiskAlert?: (message: string, severity: 'low' | 'medium' | 'high' | 'critical') => void
    onStateChange?: (state: RiskState) => void
  } = {}

  constructor(config?: Partial<RiskConfig>) {
    this.config = { ...DEFAULT_RISK_CONFIG, ...config }
    this.state = this.getInitialState()
    this.loadState()
  }

  // ─── INITIALIZATION ───

  private getInitialState(): RiskState {
    return {
      dailyPnL: 0,
      dailyPnLPercent: 0,
      dailyTrades: 0,
      dailyVolume: 0,
      dailyWins: 0,
      dailyLosses: 0,
      consecutiveLosses: 0,
      totalExposure: 0,
      largestPosition: 0,
      currentDrawdown: 0,
      peakValue: 0,
      lastTradeTimestamp: 0,
      tradesThisMinute: 0,
      tradesThisHour: 0,
      dayStartTimestamp: new Date().setHours(0, 0, 0, 0),
      isPaused: false,
      pauseReason: '',
      isEmergencyStop: false,
      lastRiskCheck: 0,
    }
  }

  setCallbacks(callbacks: typeof this.callbacks) {
    this.callbacks = callbacks
  }

  updateConfig(config: Partial<RiskConfig>) {
    this.config = { ...this.config, ...config }
    this.saveState()
  }

  // ─── RISK CHECKS ───

  checkTradeAllowed(
    positionSizeUSD: number,
    currentPortfolioValue: number,
    priceImpactPercent?: number
  ): RiskCheckResult {
    const warnings: string[] = []
    
    // Check if paused or emergency stopped
    if (this.state.isEmergencyStop) {
      return { allowed: false, reason: 'EMERGENCY STOP ACTIVE', warnings: [] }
    }

    if (this.state.isPaused) {
      return { allowed: false, reason: this.state.pauseReason, warnings: [] }
    }

    // Reset daily stats if new day
    this.checkDayReset()

    // Check rate limits
    const now = Date.now()
    const secondsSinceLastTrade = (now - this.state.lastTradeTimestamp) / 1000

    if (secondsSinceLastTrade < this.config.minTimeBetweenTrades) {
      return {
        allowed: false,
        reason: `Cooldown: Wait ${Math.ceil(this.config.minTimeBetweenTrades - secondsSinceLastTrade)}s`,
        warnings: [],
      }
    }

    // Check trades per minute
    if (this.state.tradesThisMinute >= this.config.maxTradesPerMinute) {
      return {
        allowed: false,
        reason: `Rate limit: Max ${this.config.maxTradesPerMinute} trades/minute`,
        warnings: [],
      }
    }

    // Check daily trade limit
    if (this.state.dailyTrades >= this.config.maxTradesPerDay) {
      return {
        allowed: false,
        reason: `Daily limit: Max ${this.config.maxTradesPerDay} trades/day reached`,
        warnings: [],
      }
    }

    // Check daily loss limit
    if (this.state.dailyPnL <= -this.config.maxDailyLossUSD) {
      this.triggerPause(`Daily loss limit ($${this.config.maxDailyLossUSD}) reached`)
      return {
        allowed: false,
        reason: `Daily loss limit reached: $${Math.abs(this.state.dailyPnL).toFixed(2)}`,
        warnings: [],
      }
    }

    // Check consecutive losses
    if (this.state.consecutiveLosses >= this.config.maxConsecutiveLosses) {
      this.triggerPause(`${this.config.maxConsecutiveLosses} consecutive losses`)
      return {
        allowed: false,
        reason: `Too many consecutive losses: ${this.state.consecutiveLosses}`,
        warnings: [],
      }
    }

    // Check drawdown
    if (this.state.currentDrawdown >= this.config.maxDrawdownPercent) {
      this.triggerEmergencyStop(`Max drawdown (${this.config.maxDrawdownPercent}%) exceeded`)
      return {
        allowed: false,
        reason: `Max drawdown exceeded: ${this.state.currentDrawdown.toFixed(1)}%`,
        warnings: [],
      }
    }

    // Check position size
    let adjustedSize = positionSizeUSD

    if (positionSizeUSD > this.config.maxPositionSizeUSD) {
      adjustedSize = this.config.maxPositionSizeUSD
      warnings.push(`Position reduced to max $${this.config.maxPositionSizeUSD}`)
    }

    // Check position % of portfolio
    const positionPercent = (positionSizeUSD / currentPortfolioValue) * 100
    if (positionPercent > this.config.maxPositionPercent) {
      adjustedSize = (this.config.maxPositionPercent / 100) * currentPortfolioValue
      warnings.push(`Position reduced to ${this.config.maxPositionPercent}% of portfolio`)
    }

    // Check total exposure
    if (this.state.totalExposure + positionSizeUSD > this.config.maxTotalExposureUSD) {
      const remaining = this.config.maxTotalExposureUSD - this.state.totalExposure
      if (remaining <= 0) {
        return {
          allowed: false,
          reason: `Max exposure ($${this.config.maxTotalExposureUSD}) reached`,
          warnings: [],
        }
      }
      adjustedSize = remaining
      warnings.push(`Position reduced to fit exposure limit`)
    }

    // Check price impact
    if (priceImpactPercent !== undefined && priceImpactPercent > this.config.maxPriceImpactPercent) {
      warnings.push(`High price impact: ${priceImpactPercent.toFixed(2)}%`)
      if (priceImpactPercent > this.config.maxPriceImpactPercent * 2) {
        return {
          allowed: false,
          reason: `Price impact too high: ${priceImpactPercent.toFixed(2)}%`,
          warnings,
        }
      }
    }

    // Check if after loss and should reduce
    if (this.state.consecutiveLosses > 0 && this.config.reducePositionAfterLoss) {
      const reductionFactor = Math.pow(0.75, this.state.consecutiveLosses)
      const reducedSize = adjustedSize * reductionFactor
      if (reducedSize < adjustedSize) {
        adjustedSize = reducedSize
        warnings.push(`Position reduced after ${this.state.consecutiveLosses} losses`)
      }
    }

    // Check if confirmation required
    const requiresConfirmation = adjustedSize > this.config.requireConfirmationAbove

    this.state.lastRiskCheck = now
    this.callbacks.onStateChange?.(this.state)

    return {
      allowed: true,
      warnings,
      adjustedSize: adjustedSize !== positionSizeUSD ? adjustedSize : undefined,
      requiredConfirmation: requiresConfirmation,
    }
  }

  // ─── TRADE RECORDING ───

  recordTrade(result: {
    pnl: number
    volume: number
    isWin: boolean
  }) {
    const now = Date.now()

    // Update daily stats
    this.state.dailyPnL += result.pnl
    this.state.dailyVolume += result.volume
    this.state.dailyTrades++

    if (result.isWin) {
      this.state.dailyWins++
      this.state.consecutiveLosses = 0
    } else {
      this.state.dailyLosses++
      this.state.consecutiveLosses++
    }

    // Update rate limiting
    this.state.lastTradeTimestamp = now
    this.state.tradesThisMinute++
    this.state.tradesThisHour++

    // Reset minute counter after 60s
    setTimeout(() => {
      this.state.tradesThisMinute = Math.max(0, this.state.tradesThisMinute - 1)
    }, 60000)

    // Reset hour counter after 1h
    setTimeout(() => {
      this.state.tradesThisHour = Math.max(0, this.state.tradesThisHour - 1)
    }, 3600000)

    this.saveState()
    this.callbacks.onStateChange?.(this.state)

    // Check for risk alerts
    this.checkPostTradeRisks()
  }

  updatePortfolioValue(currentValue: number) {
    // Update peak value
    if (currentValue > this.state.peakValue) {
      this.state.peakValue = currentValue
    }

    // Calculate drawdown
    if (this.state.peakValue > 0) {
      this.state.currentDrawdown = ((this.state.peakValue - currentValue) / this.state.peakValue) * 100
    }

    this.saveState()
    this.callbacks.onStateChange?.(this.state)
  }

  updateExposure(totalExposure: number, largestPosition: number) {
    this.state.totalExposure = totalExposure
    this.state.largestPosition = largestPosition
    this.saveState()
  }

  // ─── POST-TRADE RISK CHECKS ───

  private checkPostTradeRisks() {
    // Check if approaching limits
    const dailyLossPercent = Math.abs(this.state.dailyPnL) / this.config.maxDailyLossUSD * 100

    if (dailyLossPercent >= 80) {
      this.callbacks.onRiskAlert?.(
        `Approaching daily loss limit: ${dailyLossPercent.toFixed(0)}%`,
        'high'
      )
    } else if (dailyLossPercent >= 50) {
      this.callbacks.onRiskAlert?.(
        `Daily loss at ${dailyLossPercent.toFixed(0)}% of limit`,
        'medium'
      )
    }

    // Check consecutive losses
    if (this.state.consecutiveLosses >= this.config.maxConsecutiveLosses - 1) {
      this.callbacks.onRiskAlert?.(
        `${this.state.consecutiveLosses} consecutive losses - 1 more triggers pause`,
        'high'
      )
    }

    // Check drawdown
    if (this.state.currentDrawdown >= this.config.maxDrawdownPercent * 0.8) {
      this.callbacks.onRiskAlert?.(
        `Drawdown at ${this.state.currentDrawdown.toFixed(1)}% - emergency stop at ${this.config.maxDrawdownPercent}%`,
        'critical'
      )
    }
  }

  // ─── PAUSE/STOP CONTROLS ───

  triggerPause(reason: string) {
    this.state.isPaused = true
    this.state.pauseReason = reason

    console.warn('[RiskSystem] PAUSED:', reason)
    toast.warning('Trading Paused', { description: reason })
    this.callbacks.onPause?.(reason)
    this.saveState()
  }

  triggerEmergencyStop(reason: string) {
    this.state.isEmergencyStop = true
    this.state.isPaused = true
    this.state.pauseReason = `EMERGENCY: ${reason}`

    console.error('[RiskSystem] EMERGENCY STOP:', reason)
    toast.error('🚨 EMERGENCY STOP', { 
      description: reason,
      duration: 30000,
    })
    this.callbacks.onEmergencyStop?.(reason)
    this.saveState()
  }

  resume() {
    if (this.state.isEmergencyStop) {
      console.warn('[RiskSystem] Cannot resume - emergency stop active')
      toast.error('Cannot resume', {
        description: 'Emergency stop requires manual review',
      })
      return false
    }

    this.state.isPaused = false
    this.state.pauseReason = ''
    console.log('[RiskSystem] Trading resumed')
    toast.success('Trading Resumed')
    this.saveState()
    return true
  }

  resetEmergencyStop() {
    // This should only be called after manual review
    this.state.isEmergencyStop = false
    this.state.isPaused = false
    this.state.pauseReason = ''
    this.state.consecutiveLosses = 0
    console.log('[RiskSystem] Emergency stop reset')
    toast.success('Emergency Stop Reset', {
      description: 'Trading can now resume',
    })
    this.saveState()
  }

  // ─── DAY RESET ───

  private checkDayReset() {
    const now = Date.now()
    const todayMidnight = new Date().setHours(0, 0, 0, 0)

    if (this.state.dayStartTimestamp < todayMidnight) {
      // New day - reset daily stats
      this.state.dailyPnL = 0
      this.state.dailyPnLPercent = 0
      this.state.dailyTrades = 0
      this.state.dailyVolume = 0
      this.state.dailyWins = 0
      this.state.dailyLosses = 0
      this.state.dayStartTimestamp = todayMidnight

      // Auto-resume if only daily limit pause (not emergency)
      if (this.state.isPaused && !this.state.isEmergencyStop) {
        this.state.isPaused = false
        this.state.pauseReason = ''
        toast.success('New Trading Day', {
          description: 'Daily limits reset - trading resumed',
        })
      }

      this.saveState()
    }
  }

  // ─── GETTERS ───

  getState(): RiskState {
    return { ...this.state }
  }

  getConfig(): RiskConfig {
    return { ...this.config }
  }

  isPaused(): boolean {
    return this.state.isPaused
  }

  isEmergencyStop(): boolean {
    return this.state.isEmergencyStop
  }

  // ─── PERSISTENCE ───

  private saveState() {
    try {
      localStorage.setItem('qf-risk-state', JSON.stringify(this.state))
      localStorage.setItem('qf-risk-config', JSON.stringify(this.config))
    } catch (e) {
      // Silent fail
    }
  }

  private loadState() {
    try {
      const stateStr = localStorage.getItem('qf-risk-state')
      const configStr = localStorage.getItem('qf-risk-config')

      if (stateStr) {
        this.state = { ...this.getInitialState(), ...JSON.parse(stateStr) }
      }
      if (configStr) {
        this.config = { ...DEFAULT_RISK_CONFIG, ...JSON.parse(configStr) }
      }
    } catch (e) {
      // Silent fail
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════

let riskSystem: RiskManagementSystem | null = null

export function getRiskSystem(): RiskManagementSystem {
  if (!riskSystem) {
    riskSystem = new RiskManagementSystem()
  }
  return riskSystem
}

export default RiskManagementSystem

