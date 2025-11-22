// Intelligent Trade Executor — Records Outcomes and Optimizes
// November 21, 2025 — Quantum Falcon Cockpit
// Wraps trade execution to record outcomes and enable learning

import { getDecisionEngine } from './IntelligentDecisionEngine'
import { getLearningSystem, type TradeOutcome } from './AdaptiveLearningSystem'
import type { AgentDecision } from '../agents/index'
import type { DexExecutionResult } from '../../dex/client'

export interface TradeExecutionParams {
  agentId: string
  strategy: string
  signal: 'BUY' | 'SELL' | 'HOLD'
  confidence: number
  entryPrice: number
  amount: bigint
  marketConditions: TradeOutcome['marketConditions']
  metadata?: Record<string, unknown>
}

export interface TradeExecutionResult {
  success: boolean
  txId?: string
  exitPrice?: number
  profit?: number
  profitPercent?: number
  executionTimeMs: number
  outcome?: TradeOutcome
}

/**
 * Intelligent Trade Executor
 * Executes trades and records outcomes for learning
 */
export class TradeExecutor {
  private decisionEngine = getDecisionEngine()
  private learningSystem = getLearningSystem()

  /**
   * Execute a trade with outcome tracking
   */
  async executeTrade(
    params: TradeExecutionParams,
    executionFn: () => Promise<DexExecutionResult>
  ): Promise<TradeExecutionResult> {
    const startTime = Date.now()
    const { agentId, strategy, signal, confidence, entryPrice, amount, marketConditions, metadata } = params

    try {
      // Execute the trade
      const result = await executionFn()
      const executionTimeMs = Date.now() - startTime

      // Calculate profit (if exit price available)
      let profit: number | undefined
      let profitPercent: number | undefined
      let exitPrice: number | undefined

      if (result.exitPrice) {
        exitPrice = result.exitPrice
        const priceDiff = signal === 'BUY' 
          ? exitPrice - entryPrice 
          : entryPrice - exitPrice
        profit = priceDiff * Number(amount) / 1e9 // Convert from lamports
        profitPercent = (priceDiff / entryPrice) * 100
      }

      // Create outcome record
      const outcome: TradeOutcome = {
        id: result.txId || `trade-${Date.now()}`,
        timestamp: Date.now(),
        agentId,
        strategy,
        signal,
        confidence,
        entryPrice,
        exitPrice,
        profit,
        profitPercent,
        executionTimeMs,
        marketConditions,
        success: result.success,
      }

      // Record outcome for learning
      this.learningSystem.recordOutcome(outcome)

      return {
        success: result.success,
        txId: result.txId,
        exitPrice,
        profit,
        profitPercent,
        executionTimeMs,
        outcome,
      }
    } catch (error: any) {
      const executionTimeMs = Date.now() - startTime

      // Record failed trade
      const outcome: TradeOutcome = {
        id: `trade-${Date.now()}`,
        timestamp: Date.now(),
        agentId,
        strategy,
        signal,
        confidence,
        entryPrice,
        executionTimeMs,
        marketConditions,
        success: false,
      }

      this.learningSystem.recordOutcome(outcome)

      return {
        success: false,
        executionTimeMs,
        outcome,
      }
    }
  }

  /**
   * Get optimal position size for a trade
   */
  getOptimalPositionSize(baseSize: number, confidence: number): number {
    return this.learningSystem.getOptimalPositionSize(baseSize) * confidence
  }

  /**
   * Get profit target for a trade
   */
  getProfitTarget(): number {
    return this.learningSystem.getProfitTarget()
  }

  /**
   * Get stop loss for a trade
   */
  getStopLoss(): number {
    return this.learningSystem.getStopLoss()
  }
}

// Singleton instance
let executorInstance: TradeExecutor | null = null

export function getTradeExecutor(): TradeExecutor {
  if (!executorInstance) {
    executorInstance = new TradeExecutor()
  }
  return executorInstance
}

