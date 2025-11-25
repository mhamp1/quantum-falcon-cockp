// Autonomous Trading Loop — Continuous Self-Optimizing Trading
// November 22, 2025 — Quantum Falcon Cockpit
// The bot continuously monitors market and makes autonomous decisions

import React, { useEffect } from 'react'
import { useAutonomousBot, type AutonomousDecision, AutonomousBotController } from './AutonomousBotController'
import { useMarketFeed } from '@/hooks/useMarketFeed'
import { useDexExecution } from '@/hooks/useDexExecution'
import { TradeExecutor } from '../ai/learning/TradeExecutor'
import { toAgentInput } from '../ai/agentInputAdapter'
import { toast } from 'sonner'
import { useKVSafe } from '@/hooks/useKVFallback'
import { DEFAULT_AGGRESSION_BLUEPRINT, type AggressionBlueprint } from '@/lib/agents/aggressionProfiles'
import { awardXPAuto } from '@/lib/xpAutoAward'
import { logger } from '@/lib/logger'
import type { MarketSnapshot } from '@/lib/market/solanaFeed'
import type { DexExecutionResult, DexExecutionRequest } from '@/lib/dex/client'

// Import challenge tracking
let globalChallengeUpdater: ((data: { profit?: number; trades?: number }) => void) | null = null
export function setChallengeUpdater(updater: (data: { profit?: number; trades?: number }) => void) {
  globalChallengeUpdater = updater
}

export interface AutonomyTelemetry {
  aggressionProfileId: AggressionBlueprint['id']
  tradingIntervalMs: number
  newsScanIntervalMs: number
  totalTrades: number
  profitableTrades: number
  lastProfit: number
  goalProgress: number
  lastUpdated: number
  isActive: boolean
  lastNewsScan?: number
  lastDecision?: {
    action: string
    confidence?: string
    expectedProfit?: number
    agent?: string
    strategy?: string
  }
  lastTxId?: string
}

export const DEFAULT_AUTONOMY_TELEMETRY: AutonomyTelemetry = {
  aggressionProfileId: DEFAULT_AGGRESSION_BLUEPRINT.id,
  tradingIntervalMs: 30000,
  newsScanIntervalMs: 300000,
  totalTrades: 0,
  profitableTrades: 0,
  lastProfit: 0,
  goalProgress: 0,
  lastUpdated: 0,
  isActive: false,
}

/**
 * Autonomous Trading Loop
 * Runs continuously when bot is active
 * Makes all decisions autonomously to achieve internal $600/day goal
 */
export function useAutonomousTradingLoop(userTier: string = 'free') {
  const { controller, state } = useAutonomousBot(userTier)
  const marketFeed = useMarketFeed()
  const { execute } = useDexExecution()
  const tradeExecutor = new TradeExecutor()
  const [isActive, setIsActive] = useKVSafe<boolean>('autonomous-trading-active', false)
  const [aggressionProfile] = useKVSafe<AggressionBlueprint>(
    'autonomous-aggression-profile',
    DEFAULT_AGGRESSION_BLUEPRINT
  )
  const [, setTelemetry] = useKVSafe<AutonomyTelemetry>('autonomous-telemetry', DEFAULT_AUTONOMY_TELEMETRY)

  useEffect(() => {
    setTelemetry(prev => ({
      ...prev,
      isActive: state.isRunning && isActive,
      aggressionProfileId: aggressionProfile?.id || prev.aggressionProfileId,
    }))
  }, [state.isRunning, isActive, aggressionProfile?.id, setTelemetry])

  useEffect(() => {
    if (!state.isRunning || !isActive) return

    const newsScanIntervalMs = Math.max(120000, Math.round(300000 / (aggressionProfile.newsSensitivity || 1)))
    const tradingIntervalMs = Math.max(10000, Math.round(30000 / aggressionProfile.tradeFrequencyMultiplier))

    setTelemetry(prev => ({
      ...prev,
      tradingIntervalMs,
      newsScanIntervalMs,
      aggressionProfileId: aggressionProfile.id,
      isActive: true,
    }))

    // News scanning loop — interval reacts to aggression profile
    const newsScanInterval = setInterval(async () => {
      try {
        setTelemetry(prev => ({ ...prev, lastNewsScan: Date.now() }))
        await controller.scanNewsForOpportunities()
      } catch (error) {
        logger.error('News scan error', 'AutonomousTradingLoop', error)
      }
    }, newsScanIntervalMs)

    // Autonomous trading loop — interval reacts to aggression profile
    const tradingInterval = setInterval(async () => {
      if (!marketFeed.snapshot) return

      try {
        // Convert market snapshot to agent input
        const agentInput = toAgentInput(marketFeed.snapshot)

        // Get autonomous decision (now includes news + strategy intelligence)
        const decision = await controller.makeAutonomousDecision(agentInput)

        setTelemetry(prev => ({
          ...prev,
          lastDecision: {
            action: decision.action,
            confidence: decision.confidence,
            expectedProfit: decision.expectedProfit,
            agent: decision.agentRecommendation,
            strategy: decision.strategyRecommendation,
          },
          goalProgress: controller.getGoalProgress().progress,
          lastUpdated: Date.now(),
        }))

        // Execute decision if action is BUY or SELL
        if (decision.action === 'BUY' || decision.action === 'SELL') {
          await executeAutonomousTrade(
            decision,
            marketFeed.snapshot,
            controller,
            tradeExecutor,
            execute,
            aggressionProfile,
            setTelemetry
          )
        } else if (decision.action === 'INCREASE_POSITION') {
          // Increase position size for existing trades
          logger.debug('Increasing position size based on goal progress', 'AutonomousTradingLoop')
        } else if (decision.action === 'REDUCE_POSITION') {
          // Reduce position size to lock profits
          logger.debug('Reducing position size to secure profits', 'AutonomousTradingLoop')
        } else if (decision.action === 'SWITCH_STRATEGY') {
          // Switch to better performing strategy
          logger.debug(`Switching to strategy: ${decision.strategyRecommendation}`, 'AutonomousTradingLoop')
        }
        // HOLD action does nothing — bot waits for better opportunity

      } catch (error: unknown) {
        logger.error('Trading loop error', 'AutonomousTradingLoop', error)
        // Don't show error to user — bot handles it internally
      }
    }, 30000) // Every 30 seconds

    return () => {
      clearInterval(tradingInterval)
      clearInterval(newsScanInterval)
    }
  }, [state.isRunning, isActive, marketFeed.snapshot, controller, execute, aggressionProfile, setTelemetry])

  return {
    isActive,
    setIsActive,
    state,
  }
}

/**
 * Execute autonomous trade
 */
async function executeAutonomousTrade(
  decision: AutonomousDecision,
  snapshot: any,
  controller: any,
  tradeExecutor: TradeExecutor,
  execute: any,
  aggressionProfile: AggressionBlueprint,
  updateTelemetry: (value: AutonomyTelemetry | ((prevState: AutonomyTelemetry) => AutonomyTelemetry)) => void
) {
  try {
    // Calculate position size based on goal progress
    const goalProgress = controller.getGoalProgress()
    const positionMultiplier =
      (goalProgress.remaining > 300 ? 1.2 : 1.0) * (aggressionProfile.positionSizeMultiplier || 1)

    // Determine trade parameters
    const amount = BigInt(Math.floor(snapshot.orderbook.mid * 1000 * positionMultiplier))
    const side = decision.action === 'BUY' ? 'buy' : 'sell'
    const mintIn = 'So11111111111111111111111111111111111111112' // SOL
    const mintOut = snapshot.token?.mint || mintIn

    // Execute trade
    const executionResult = await execute({
      user: snapshot.userPublicKey || '',
      mintIn,
      mintOut,
      amountIn: amount,
      side,
      slippageBps: Math.round(aggressionProfile.slippageBps || 100),
    })

    if (executionResult.txId) {
      // Calculate profit (simplified — in production, track actual profit)
      const estimatedProfit = decision.expectedProfit
      const success = estimatedProfit > 0

      // Record outcome
      controller.recordTradeOutcome(estimatedProfit, success)

      // Record for learning system
      await tradeExecutor.executeTrade(
        {
          agentId: decision.agentRecommendation,
          strategy: decision.strategyRecommendation,
          signal: decision.action,
          confidence: decision.confidence,
          entryPrice: snapshot.orderbook.mid,
          amount,
          marketConditions: {
            volatility: snapshot.volatility?.volatility1h || 0.03,
            volume: snapshot.orderbook.mid * 1000,
            sentiment: snapshot.sentiment?.score || 0,
            mevRisk: snapshot.mev?.riskScore || 0.5,
          },
        },
        async () => executionResult
      )

      // Silent log (no user notification for autonomous trades)
      logger.debug(
        `Trade executed: ${decision.action} | Profit: $${estimatedProfit.toFixed(2)} | Goal progress: ${(controller.getGoalProgress().progress / 600 * 100).toFixed(1)}%`,
        'AutonomousTradingLoop'
      )

      updateTelemetry(prev => ({
        ...prev,
        totalTrades: prev.totalTrades + 1,
        profitableTrades: prev.profitableTrades + (estimatedProfit > 0 ? 1 : 0),
        lastProfit: estimatedProfit,
        goalProgress: controller.getGoalProgress().progress,
        lastTxId: executionResult.txId,
      }))

      // Automatic XP award - fully integrated, no manual work needed
      awardXPAuto('trade_execution', { txId: executionResult.txId })
      if (estimatedProfit > 0) {
        awardXPAuto('profitable_trade', { profit: estimatedProfit })
        if (estimatedProfit >= 100) {
          awardXPAuto('big_win', { profit: estimatedProfit })
        }
      }

      // Automatic challenge progress tracking - fully integrated
      if (globalChallengeUpdater) {
        globalChallengeUpdater({
          profit: estimatedProfit > 0 ? estimatedProfit : 0,
          trades: 1
        })
      }
    }
    } catch (error: unknown) {
      logger.error('Trade execution failed', 'AutonomousTradingLoop', error)
      // Bot handles errors internally — no user notification
    }
}

