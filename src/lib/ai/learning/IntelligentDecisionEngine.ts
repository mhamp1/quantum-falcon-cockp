// Intelligent Decision Engine — Win-Rate Optimization
// November 21, 2025 — Quantum Falcon Cockpit
// Makes intelligent trading decisions to maximize win rate and profit

import { getLearningSystem, type TradeOutcome } from './AdaptiveLearningSystem'
import type { AgentDecision, AgentSignal, AgentConfidence } from '../agents/index'

export interface DecisionContext {
  agentId: string
  strategy: string
  marketConditions: TradeOutcome['marketConditions']
  confidence: number
  signal: AgentSignal
  expectedProfit?: number
  riskLevel?: 'low' | 'medium' | 'high'
}

export interface OptimizedDecision {
  signal: AgentSignal
  confidence: AgentConfidence
  reason: string
  shouldExecute: boolean
  positionSize: number // Multiplier (0.5x to 2.0x)
  profitTarget: number // Basis points
  stopLoss: number // Basis points
  metadata: Record<string, unknown>
}

/**
 * Intelligent Decision Engine
 * Optimizes all trading decisions to maximize win rate and profit
 */
export class IntelligentDecisionEngine {
  private learningSystem = getLearningSystem()

  /**
   * Optimize an agent decision using learned patterns
   */
  optimizeDecision(
    agentDecision: AgentDecision,
    context: DecisionContext
  ): OptimizedDecision {
    const config = this.learningSystem.getConfig()
    const metrics = this.learningSystem.getMetrics()

    // Check if we should take this trade
    const shouldExecute = this.learningSystem.shouldTakeTrade(
      context.agentId,
      context.strategy,
      context.confidence,
      context.marketConditions
    )

    // If learning system says no, override to HOLD
    if (!shouldExecute && agentDecision.signal !== 'HOLD') {
      return {
        signal: 'HOLD',
        confidence: 'medium',
        reason: `Learning system override: ${agentDecision.reason} (confidence ${(context.confidence * 100).toFixed(0)}% below learned threshold)`,
        shouldExecute: false,
        positionSize: 0,
        profitTarget: 0,
        stopLoss: 0,
        metadata: {
          ...agentDecision.metadata,
          overridden: true,
          originalSignal: agentDecision.signal,
        },
      }
    }

    // Calculate optimal position size based on learning
    const basePositionSize = 1.0
    let positionSize = this.learningSystem.getOptimalPositionSize(basePositionSize)

    // Adjust position size based on confidence
    if (context.confidence >= 0.8) {
      positionSize *= 1.2 // Increase size for high confidence
    } else if (context.confidence < 0.6) {
      positionSize *= 0.8 // Decrease size for lower confidence
    }

    // Adjust position size based on risk level
    if (context.riskLevel === 'low') {
      positionSize *= 1.15
    } else if (context.riskLevel === 'high') {
      positionSize *= 0.7
    }

    // Clamp position size
    positionSize = Math.max(0.5, Math.min(2.0, positionSize))

    // Get profit target and stop loss from learning system
    let profitTarget = this.learningSystem.getProfitTarget()
    let stopLoss = this.learningSystem.getStopLoss()

    // Adjust targets based on market volatility
    if (context.marketConditions.volatility > 0.05) {
      // Wider targets in volatile markets
      profitTarget = Math.min(500, profitTarget * 1.2)
      stopLoss = Math.min(300, stopLoss * 1.15)
    } else {
      // Tighter targets in stable markets
      profitTarget = Math.max(100, profitTarget * 0.9)
      stopLoss = Math.max(100, stopLoss * 0.9)
    }

    // Adjust targets based on expected profit
    if (context.expectedProfit) {
      if (context.expectedProfit > 300) {
        // High profit potential - increase target
        profitTarget = Math.min(600, profitTarget * 1.1)
      } else if (context.expectedProfit < 150) {
        // Lower profit potential - tighter target
        profitTarget = Math.max(100, profitTarget * 0.95)
      }
    }

    // Enhance reason with learning insights
    let enhancedReason = agentDecision.reason
    if (metrics) {
      const agentPerf = metrics.agentPerformance[context.agentId]
      if (agentPerf && agentPerf.winRate > 70) {
        enhancedReason += ` | 🏆 Agent win rate: ${agentPerf.winRate.toFixed(1)}%`
      }
      
      const strategyPerf = metrics.strategyPerformance[context.strategy]
      if (strategyPerf && strategyPerf.winRate > 65) {
        enhancedReason += ` | 📈 Strategy win rate: ${strategyPerf.winRate.toFixed(1)}%`
      }
    }

    // Add position sizing info
    if (positionSize !== 1.0) {
      enhancedReason += ` | 💰 Position: ${(positionSize * 100).toFixed(0)}%`
    }

    return {
      signal: agentDecision.signal,
      confidence: agentDecision.confidence,
      reason: enhancedReason,
      shouldExecute,
      positionSize,
      profitTarget,
      stopLoss,
      metadata: {
        ...agentDecision.metadata,
        optimized: true,
        positionSizeMultiplier: positionSize,
        profitTargetBps: profitTarget,
        stopLossBps: stopLoss,
        learningMetrics: metrics ? {
          winRate: metrics.winRate,
          avgProfit: metrics.avgProfitPerTrade,
        } : undefined,
      },
    }
  }

  /**
   * Record trade outcome for learning
   */
  recordOutcome(outcome: TradeOutcome): void {
    this.learningSystem.recordOutcome(outcome)
  }

  /**
   * Get current learning metrics
   */
  getMetrics() {
    return this.learningSystem.getMetrics()
  }

  /**
   * Get adaptive configuration
   */
  getConfig() {
    return this.learningSystem.getConfig()
  }
}

// Singleton instance
let decisionEngineInstance: IntelligentDecisionEngine | null = null

export function getDecisionEngine(): IntelligentDecisionEngine {
  if (!decisionEngineInstance) {
    decisionEngineInstance = new IntelligentDecisionEngine()
  }
  return decisionEngineInstance
}

