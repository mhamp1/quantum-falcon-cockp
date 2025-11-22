// Adaptive Learning System — Daily Self-Improvement Engine
// November 21, 2025 — Quantum Falcon Cockpit
// The bot learns from every trade and gets smarter every day

import { useKV } from '@github/spark/hooks'

export interface TradeOutcome {
  id: string
  timestamp: number
  agentId: string
  strategy: string
  signal: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  entryPrice: number
  exitPrice?: number
  profit?: number
  profitPercent?: number
  executionTimeMs: number
  marketConditions: {
    volatility: number
    volume: number
    sentiment: number
    mevRisk: number
  }
  success: boolean
}

export interface LearningMetrics {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  totalProfit: number
  avgProfitPerTrade: number
  winRate: number
  avgExecutionTime: number
  bestStrategy: string
  worstStrategy: string
  bestTimeOfDay: number
  bestDayOfWeek: number
  agentPerformance: Record<string, {
    trades: number
    wins: number
    profit: number
    winRate: number
  }>
  strategyPerformance: Record<string, {
    trades: number
    wins: number
    profit: number
    winRate: number
  }>
  marketConditionPerformance: Record<string, {
    trades: number
    wins: number
    profit: number
    winRate: number
  }>
}

export interface AdaptiveConfig {
  minConfidenceThreshold: number
  positionSizeMultiplier: number
  riskMultiplier: number
  preferredStrategies: string[]
  preferredAgents: string[]
  preferredTimeWindows: number[]
  maxSlippageBps: number
  profitTargetBps: number
  stopLossBps: number
}

/**
 * Adaptive Learning System
 * Tracks all trade outcomes and continuously improves decision-making
 */
export class AdaptiveLearningSystem {
  private outcomes: TradeOutcome[] = []
  private metrics: LearningMetrics | null = null
  private config: AdaptiveConfig

  constructor() {
    this.config = {
      minConfidenceThreshold: 0.6,
      positionSizeMultiplier: 1.0,
      riskMultiplier: 1.0,
      preferredStrategies: [],
      preferredAgents: [],
      preferredTimeWindows: [],
      maxSlippageBps: 100,
      profitTargetBps: 200,
      stopLossBps: 150,
    }
  }

  /**
   * Record a trade outcome for learning
   */
  recordOutcome(outcome: TradeOutcome): void {
    this.outcomes.push(outcome)
    
    // Keep only last 1000 trades for performance
    if (this.outcomes.length > 1000) {
      this.outcomes = this.outcomes.slice(-1000)
    }
    
    // Trigger learning update
    this.updateLearningMetrics()
    this.adaptConfiguration()
  }

  /**
   * Update learning metrics from all outcomes
   */
  private updateLearningMetrics(): void {
    if (this.outcomes.length === 0) return

    const successful = this.outcomes.filter(o => o.success)
    const failed = this.outcomes.filter(o => !o.success)
    
    const totalProfit = this.outcomes
      .filter(o => o.profit !== undefined)
      .reduce((sum, o) => sum + (o.profit || 0), 0)
    
    const avgProfit = totalProfit / successful.length || 0
    const winRate = (successful.length / this.outcomes.length) * 100

    // Agent performance
    const agentPerf: Record<string, any> = {}
    this.outcomes.forEach(outcome => {
      if (!agentPerf[outcome.agentId]) {
        agentPerf[outcome.agentId] = { trades: 0, wins: 0, profit: 0 }
      }
      agentPerf[outcome.agentId].trades++
      if (outcome.success) {
        agentPerf[outcome.agentId].wins++
        agentPerf[outcome.agentId].profit += outcome.profit || 0
      }
    })

    // Strategy performance
    const strategyPerf: Record<string, any> = {}
    this.outcomes.forEach(outcome => {
      if (!strategyPerf[outcome.strategy]) {
        strategyPerf[outcome.strategy] = { trades: 0, wins: 0, profit: 0 }
      }
      strategyPerf[outcome.strategy].trades++
      if (outcome.success) {
        strategyPerf[outcome.strategy].wins++
        strategyPerf[outcome.strategy].profit += outcome.profit || 0
      }
    })

    // Find best/worst strategies
    const strategies = Object.entries(strategyPerf)
      .map(([name, data]: [string, any]) => ({
        name,
        winRate: (data.wins / data.trades) * 100,
        profit: data.profit,
      }))
      .sort((a, b) => b.winRate - a.winRate)

    const bestStrategy = strategies[0]?.name || ''
    const worstStrategy = strategies[strategies.length - 1]?.name || ''

    // Time-based performance
    const timePerformance: Record<number, any> = {}
    const dayPerformance: Record<number, any> = {}
    
    this.outcomes.forEach(outcome => {
      const hour = new Date(outcome.timestamp).getHours()
      const day = new Date(outcome.timestamp).getDay()
      
      if (!timePerformance[hour]) {
        timePerformance[hour] = { trades: 0, wins: 0, profit: 0 }
      }
      if (!dayPerformance[day]) {
        dayPerformance[day] = { trades: 0, wins: 0, profit: 0 }
      }
      
      timePerformance[hour].trades++
      dayPerformance[day].trades++
      
      if (outcome.success) {
        timePerformance[hour].wins++
        dayPerformance[day].wins++
        timePerformance[hour].profit += outcome.profit || 0
        dayPerformance[day].profit += outcome.profit || 0
      }
    })

    const bestHour = Object.entries(timePerformance)
      .map(([hour, data]: [string, any]) => ({
        hour: parseInt(hour),
        winRate: (data.wins / data.trades) * 100,
        profit: data.profit,
      }))
      .sort((a, b) => b.winRate - a.winRate)[0]?.hour || 0

    const bestDay = Object.entries(dayPerformance)
      .map(([day, data]: [string, any]) => ({
        day: parseInt(day),
        winRate: (data.wins / data.trades) * 100,
        profit: data.profit,
      }))
      .sort((a, b) => b.winRate - a.winRate)[0]?.day || 0

    const avgExecutionTime = this.outcomes.reduce(
      (sum, o) => sum + o.executionTimeMs,
      0
    ) / this.outcomes.length

    this.metrics = {
      totalTrades: this.outcomes.length,
      winningTrades: successful.length,
      losingTrades: failed.length,
      totalProfit,
      avgProfitPerTrade: avgProfit,
      winRate,
      avgExecutionTime,
      bestStrategy,
      worstStrategy,
      bestTimeOfDay: bestHour,
      bestDayOfWeek: bestDay,
      agentPerformance: Object.fromEntries(
        Object.entries(agentPerf).map(([id, data]: [string, any]) => [
          id,
          {
            trades: data.trades,
            wins: data.wins,
            profit: data.profit,
            winRate: (data.wins / data.trades) * 100,
          },
        ])
      ),
      strategyPerformance: Object.fromEntries(
        Object.entries(strategyPerf).map(([name, data]: [string, any]) => [
          name,
          {
            trades: data.trades,
            wins: data.wins,
            profit: data.profit,
            winRate: (data.wins / data.trades) * 100,
          },
        ])
      ),
      marketConditionPerformance: {},
    }
  }

  /**
   * Adapt configuration based on learned metrics
   */
  private adaptConfiguration(): void {
    if (!this.metrics || this.metrics.totalTrades < 10) return

    // Increase confidence threshold if win rate is low
    if (this.metrics.winRate < 60) {
      this.config.minConfidenceThreshold = Math.min(
        0.85,
        this.config.minConfidenceThreshold + 0.05
      )
    } else if (this.metrics.winRate > 75) {
      // Lower threshold if win rate is high (can take more opportunities)
      this.config.minConfidenceThreshold = Math.max(
        0.5,
        this.config.minConfidenceThreshold - 0.02
      )
    }

    // Adjust position sizing based on performance
    if (this.metrics.avgProfitPerTrade > 0) {
      // Increase position size if profitable
      this.config.positionSizeMultiplier = Math.min(
        2.0,
        this.config.positionSizeMultiplier * 1.05
      )
    } else {
      // Decrease if losing
      this.config.positionSizeMultiplier = Math.max(
        0.5,
        this.config.positionSizeMultiplier * 0.95
      )
    }

    // Prefer best-performing strategies
    const topStrategies = Object.entries(this.metrics.strategyPerformance)
      .sort(([, a], [, b]) => b.winRate - a.winRate)
      .slice(0, 3)
      .map(([name]) => name)
    
    this.config.preferredStrategies = topStrategies

    // Prefer best-performing agents
    const topAgents = Object.entries(this.metrics.agentPerformance)
      .sort(([, a], [, b]) => b.winRate - a.winRate)
      .slice(0, 3)
      .map(([id]) => id)
    
    this.config.preferredAgents = topAgents

    // Optimize profit targets based on success
    if (this.metrics.winRate > 70) {
      // Increase profit target if winning consistently
      this.config.profitTargetBps = Math.min(500, this.config.profitTargetBps * 1.1)
    } else {
      // Lower profit target if struggling
      this.config.profitTargetBps = Math.max(100, this.config.profitTargetBps * 0.95)
    }

    // Adjust stop loss based on volatility
    const recentOutcomes = this.outcomes.slice(-50)
    const avgVolatility = recentOutcomes.reduce(
      (sum, o) => sum + o.marketConditions.volatility,
      0
    ) / recentOutcomes.length

    if (avgVolatility > 0.05) {
      // Wider stop loss in volatile markets
      this.config.stopLossBps = Math.min(300, this.config.stopLossBps * 1.1)
    } else {
      // Tighter stop loss in stable markets
      this.config.stopLossBps = Math.max(100, this.config.stopLossBps * 0.95)
    }
  }

  /**
   * Get current adaptive configuration
   */
  getConfig(): AdaptiveConfig {
    return { ...this.config }
  }

  /**
   * Get learning metrics
   */
  getMetrics(): LearningMetrics | null {
    return this.metrics
  }

  /**
   * Should we take this trade based on learned patterns?
   */
  shouldTakeTrade(
    agentId: string,
    strategy: string,
    confidence: number,
    marketConditions: TradeOutcome['marketConditions']
  ): boolean {
    if (confidence < this.config.minConfidenceThreshold) {
      return false
    }

    // Prefer best-performing agents
    if (this.config.preferredAgents.length > 0) {
      if (!this.config.preferredAgents.includes(agentId)) {
        // Still allow, but require higher confidence
        if (confidence < this.config.minConfidenceThreshold + 0.1) {
          return false
        }
      }
    }

    // Prefer best-performing strategies
    if (this.config.preferredStrategies.length > 0) {
      if (!this.config.preferredStrategies.includes(strategy)) {
        // Still allow, but require higher confidence
        if (confidence < this.config.minConfidenceThreshold + 0.1) {
          return false
        }
      }
    }

    // Check time-based performance
    const currentHour = new Date().getHours()
    const currentDay = new Date().getDay()
    
    if (this.metrics) {
      // Prefer trading during best hours
      if (this.metrics.bestTimeOfDay !== currentHour) {
        // Still allow, but require higher confidence
        if (confidence < this.config.minConfidenceThreshold + 0.05) {
          return false
        }
      }
    }

    return true
  }

  /**
   * Get optimal position size based on learning
   */
  getOptimalPositionSize(baseSize: number): number {
    return baseSize * this.config.positionSizeMultiplier
  }

  /**
   * Get profit target based on learning
   */
  getProfitTarget(): number {
    return this.config.profitTargetBps
  }

  /**
   * Get stop loss based on learning
   */
  getStopLoss(): number {
    return this.config.stopLossBps
  }

  /**
   * Daily learning cycle - runs once per day
   */
  async runDailyLearningCycle(): Promise<void> {
    console.log('🧠 Starting daily learning cycle...')
    
    this.updateLearningMetrics()
    this.adaptConfiguration()
    
    // Save learned patterns
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('quantum-falcon-learning-config', JSON.stringify(this.config))
        localStorage.setItem('quantum-falcon-learning-metrics', JSON.stringify(this.metrics))
      } catch (error) {
        console.warn('Failed to save learning data:', error)
      }
    }
    
    console.log('✅ Daily learning cycle complete')
    console.log('📊 Current win rate:', this.metrics?.winRate.toFixed(1) + '%')
    console.log('🎯 Best strategy:', this.metrics?.bestStrategy)
    console.log('⏰ Best trading hour:', this.metrics?.bestTimeOfDay)
  }

  /**
   * Load saved learning data
   */
  loadSavedData(): void {
    if (typeof window === 'undefined') return
    
    try {
      const savedConfig = localStorage.getItem('quantum-falcon-learning-config')
      const savedMetrics = localStorage.getItem('quantum-falcon-learning-metrics')
      
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) }
      }
      
      if (savedMetrics) {
        this.metrics = JSON.parse(savedMetrics)
      }
    } catch (error) {
      console.warn('Failed to load saved learning data:', error)
    }
  }
}

// Singleton instance
let learningSystemInstance: AdaptiveLearningSystem | null = null

export function getLearningSystem(): AdaptiveLearningSystem {
  if (!learningSystemInstance) {
    learningSystemInstance = new AdaptiveLearningSystem()
    learningSystemInstance.loadSavedData()
    
    // Run daily learning cycle
    const lastRun = localStorage.getItem('quantum-falcon-last-learning-run')
    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000
    
    if (!lastRun || (now - parseInt(lastRun)) > oneDay) {
      learningSystemInstance.runDailyLearningCycle()
      localStorage.setItem('quantum-falcon-last-learning-run', now.toString())
    }
  }
  
  return learningSystemInstance
}

