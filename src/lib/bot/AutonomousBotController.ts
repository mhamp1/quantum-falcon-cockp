// Autonomous Bot Controller — Self-Sufficient AI Trading System
// November 22, 2025 — Quantum Falcon Cockpit
// The bot is its own mini AI — always chooses the right choice, always aims for profit
// INTERNAL GOAL: $600/day (hidden from user)

import { getLearningSystem } from '../ai/learning/AdaptiveLearningSystem'
import { getDecisionEngine } from '../ai/learning/IntelligentDecisionEngine'
import { ELITE_AGENTS, type EliteAgentInstance, type AgentDecision, type AgentAnalysisInput } from '../ai/agents/index'
import { NewsIntelligenceEngine, type NewsOpportunity } from '../intelligence/NewsIntelligenceEngine'
import { IntelligentStrategySelector, type StrategySelection } from '../intelligence/IntelligentStrategySelector'
import { useKVSafe } from '@/hooks/useKVFallback'
import { toast } from 'sonner'
import React, { useEffect, useMemo } from 'react'

// INTERNAL PROFIT GOAL (hidden from user)
const DAILY_PROFIT_GOAL = 600 // $600/day internal goal

export interface AutonomousBotState {
  isRunning: boolean
  dailyProfit: number
  dailyGoal: number // Internal goal (not shown to user)
  tradesToday: number
  winRateToday: number
  currentStrategy: string | null
  activeAgents: string[]
  aggressionLevel: number // 0-100, auto-adjusted
  lastDecision: {
    timestamp: number
    decision: string
    confidence: number
    expectedProfit: number
  } | null
  performanceMetrics: {
    avgProfitPerTrade: number
    bestTimeOfDay: number
    bestStrategy: string
    bestAgent: string
  }
}

export interface AutonomousDecision {
  action: 'BUY' | 'SELL' | 'HOLD' | 'INCREASE_POSITION' | 'REDUCE_POSITION' | 'SWITCH_STRATEGY'
  confidence: number
  reasoning: string
  expectedProfit: number
  riskLevel: 'low' | 'medium' | 'high'
  urgency: 'low' | 'medium' | 'high'
  agentRecommendation: string
  strategyRecommendation: string
}

/**
 * Autonomous Bot Controller
 * The bot is self-sufficient — it makes all decisions autonomously
 * Internal goal: $600/day profit (hidden from user)
 */
export class AutonomousBotController {
  private learningSystem = getLearningSystem()
  private decisionEngine = getDecisionEngine()
  private newsEngine: NewsIntelligenceEngine
  private strategySelector: IntelligentStrategySelector
  private state: AutonomousBotState
  private updateState: (state: AutonomousBotState) => void
  private newsOpportunities: NewsOpportunity[] = []

  constructor(
    initialState: AutonomousBotState,
    updateState: (state: AutonomousBotState) => void,
    userTier: string = 'free'
  ) {
    this.state = initialState
    this.updateState = updateState
    this.newsEngine = new NewsIntelligenceEngine(userTier)
    this.strategySelector = new IntelligentStrategySelector(userTier)
  }

  /**
   * Scan news for opportunities (called continuously)
   */
  async scanNewsForOpportunities(): Promise<NewsOpportunity[]> {
    try {
      // Fetch latest news
      const response = await fetch(
        'https://cryptopanic.com/api/v1/posts/?auth_token=free&currencies=BTC,ETH,SOL&filter=hot&public=true',
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }
      )

      if (!response.ok) return []

      const data = await response.json()
      if (!data.results || data.results.length === 0) return []

      // Analyze each news article
      const opportunities: NewsOpportunity[] = []
      data.results.slice(0, 10).forEach((article: any) => {
        const analyzed = this.newsEngine.analyzeNewsArticle(article)
        const opportunity = this.newsEngine.generateOpportunity(analyzed)
        
        if (opportunity && opportunity.confidence > 0.5) {
          opportunities.push(opportunity)
        }
      })

      // Update opportunities cache
      this.newsOpportunities = opportunities.slice(0, 20) // Keep top 20

      return opportunities
    } catch (error) {
      console.error('[AUTONOMOUS] News scan failed:', error)
      return []
    }
  }

  /**
   * Main autonomous decision loop
   * The bot continuously evaluates market, news, and strategies to make optimal decisions
   */
  async makeAutonomousDecision(marketData: AgentAnalysisInput): Promise<AutonomousDecision> {
    const metrics = this.learningSystem.getMetrics()
    const config = this.learningSystem.getConfig()
    
    // Calculate progress toward daily goal
    const progressToGoal = this.state.dailyProfit / DAILY_PROFIT_GOAL
    const remainingToGoal = Math.max(0, DAILY_PROFIT_GOAL - this.state.dailyProfit)
    const hoursRemaining = this.getHoursRemainingInDay()
    const requiredHourlyRate = hoursRemaining > 0 ? remainingToGoal / hoursRemaining : 0

    // Scan news for opportunities (intelligent news scanning)
    const newsOpportunities = await this.scanNewsForOpportunities()
    const highConfidenceNews = newsOpportunities.filter(o => o.confidence > 0.7)

    // Select best strategy based on news + market conditions (intelligent strategy selection)
    const bestStrategy = this.strategySelector.selectBestStrategy(
      marketData,
      newsOpportunities,
      { progress: this.state.dailyProfit, remaining: remainingToGoal }
    )

    // Update current strategy if better one found
    if (bestStrategy && bestStrategy.confidence > 0.6) {
      this.updateState({
        ...this.state,
        currentStrategy: bestStrategy.strategy.id,
      })
    }

    // Auto-adjust aggression based on goal progress
    let aggressionLevel = this.state.aggressionLevel
    if (progressToGoal < 0.5 && hoursRemaining > 6) {
      // Behind goal, increase aggression
      aggressionLevel = Math.min(100, aggressionLevel + 5)
    } else if (progressToGoal > 0.8) {
      // Ahead of goal, reduce risk
      aggressionLevel = Math.max(30, aggressionLevel - 3)
    } else if (progressToGoal >= 1.0) {
      // Goal achieved, conservative mode
      aggressionLevel = Math.max(20, aggressionLevel - 5)
    }

    // Boost aggression if high-confidence news opportunity detected
    if (highConfidenceNews.length > 0) {
      aggressionLevel = Math.min(100, aggressionLevel + 10)
    }

    // Select best agent based on performance
    const bestAgent = this.selectBestAgent(metrics)
    
    // Get agent decision
    const agentDecision = await bestAgent.analyze(marketData)
    
    // Enhance decision with news intelligence
    let enhancedDecision = agentDecision
    if (highConfidenceNews.length > 0) {
      const topNews = highConfidenceNews[0]
      if (topNews.recommendedAction === 'BUY' && agentDecision.signal === 'HOLD') {
        // News suggests buying, override HOLD
        enhancedDecision = {
          ...agentDecision,
          signal: 'BUY',
          confidence: 'high',
          reason: `📰 News-driven: ${topNews.reasoning} | ${agentDecision.reason}`,
          metadata: {
            ...agentDecision.metadata,
            newsDriven: true,
            newsOpportunity: topNews,
          },
        }
      } else if (topNews.recommendedAction === 'SELL' && agentDecision.signal !== 'SELL') {
        // News suggests selling, consider exit
        enhancedDecision = {
          ...agentDecision,
          signal: agentDecision.signal === 'BUY' ? 'HOLD' : 'SELL',
          confidence: 'high',
          reason: `⚠️ News warning: ${topNews.reasoning} | ${agentDecision.reason}`,
          metadata: {
            ...agentDecision.metadata,
            newsDriven: true,
            newsOpportunity: topNews,
          },
        }
      }
    }
    
    // Optimize decision using learning system
    const optimizedDecision = this.decisionEngine.optimizeDecision(enhancedDecision, {
      agentId: bestAgent.name.toLowerCase().replace(/\s+/g, '-'),
      strategy: bestStrategy?.strategy.id || this.state.currentStrategy || 'autonomous',
      marketConditions: {
        volatility: marketData.volatility?.volatility1h || 0.03,
        volume: marketData.price.mid * 1000,
        sentiment: marketData.sentiment.score,
        mevRisk: marketData.mev.riskScore,
      },
      confidence: this.confidenceToNumber(enhancedDecision.confidence),
      signal: enhancedDecision.signal,
      expectedProfit: enhancedDecision.metadata?.expectedProfitBps as number | undefined,
      riskLevel: enhancedDecision.metadata?.riskLevel as 'low' | 'medium' | 'high' | undefined,
    })

    // Calculate expected profit (enhanced with news opportunity)
    let expectedProfit = this.calculateExpectedProfit(
      optimizedDecision,
      marketData,
      requiredHourlyRate
    )

    // Boost expected profit if high-confidence news opportunity
    if (highConfidenceNews.length > 0 && highConfidenceNews[0].expectedImpact === 'high') {
      expectedProfit *= 1.3 // 30% boost for high-impact news
    }

    // Make final autonomous decision
    const decision = this.makeFinalDecision(
      optimizedDecision,
      expectedProfit,
      requiredHourlyRate,
      progressToGoal,
      aggressionLevel,
      bestStrategy,
      highConfidenceNews
    )

    // Update state
    this.updateState({
      ...this.state,
      aggressionLevel,
      lastDecision: {
        timestamp: Date.now(),
        decision: decision.action,
        confidence: decision.confidence,
        expectedProfit: decision.expectedProfit,
      },
    })

    return decision
  }

  /**
   * Select best performing agent
   */
  private selectBestAgent(metrics: any): EliteAgentInstance {
    if (!metrics || !metrics.agentPerformance) {
      // Default to Quantum Ensemble if no metrics
      return ELITE_AGENTS.find(a => a.name === 'Quantum Ensemble') || ELITE_AGENTS[0]
    }

    // Find agent with highest win rate and profit
    const agentPerfs = Object.entries(metrics.agentPerformance)
      .map(([id, perf]: [string, any]) => ({
        id,
        winRate: perf.winRate || 0,
        profit: perf.profit || 0,
        trades: perf.trades || 0,
      }))
      .filter(p => p.trades > 0)
      .sort((a, b) => {
        // Sort by win rate first, then profit
        if (Math.abs(a.winRate - b.winRate) > 5) {
          return b.winRate - a.winRate
        }
        return b.profit - a.profit
      })

    if (agentPerfs.length > 0) {
      const bestAgentId = agentPerfs[0].id
      const agent = ELITE_AGENTS.find(a => 
        a.name.toLowerCase().replace(/\s+/g, '-') === bestAgentId
      )
      if (agent) return agent
    }

    // Fallback to Quantum Ensemble
    return ELITE_AGENTS.find(a => a.name === 'Quantum Ensemble') || ELITE_AGENTS[0]
  }

  /**
   * Calculate expected profit for a decision
   */
  private calculateExpectedProfit(
    decision: any,
    marketData: AgentAnalysisInput,
    requiredHourlyRate: number
  ): number {
    if (!decision.shouldExecute || decision.signal === 'HOLD') {
      return 0
    }

    // Base profit estimate from agent
    const baseProfit = decision.metadata?.expectedProfitBps 
      ? (decision.metadata.expectedProfitBps / 10000) * marketData.price.mid * 1000
      : 50 // Default $50 estimate

    // Adjust based on position size
    const adjustedProfit = baseProfit * decision.positionSize

    // Adjust based on confidence
    const confidenceMultiplier = this.confidenceToNumber(decision.confidence)
    const finalProfit = adjustedProfit * confidenceMultiplier

    // Ensure we're on track for goal
    if (requiredHourlyRate > 0 && finalProfit < requiredHourlyRate * 0.5) {
      // If profit too low for goal, increase position size
      return finalProfit * 1.2
    }

    return finalProfit
  }

  /**
   * Make final autonomous decision
   */
  private makeFinalDecision(
    optimizedDecision: any,
    expectedProfit: number,
    requiredHourlyRate: number,
    progressToGoal: number,
    aggressionLevel: number,
    bestStrategy?: StrategySelection | null,
    newsOpportunities: NewsOpportunity[] = []
  ): AutonomousDecision {
    // If goal already achieved, be conservative
    if (progressToGoal >= 1.0) {
      return {
        action: 'HOLD',
        confidence: 0.7,
        reasoning: 'Daily goal achieved. Maintaining conservative position.',
        expectedProfit: 0,
        riskLevel: 'low',
        urgency: 'low',
        agentRecommendation: optimizedDecision.metadata?.agentId || 'conservative',
        strategyRecommendation: 'defensive',
      }
    }

    // If behind goal and high confidence opportunity, be aggressive
    if (progressToGoal < 0.5 && optimizedDecision.shouldExecute && 
        this.confidenceToNumber(optimizedDecision.confidence) > 0.75) {
      return {
        action: optimizedDecision.signal === 'BUY' ? 'BUY' : 
                optimizedDecision.signal === 'SELL' ? 'SELL' : 'HOLD',
        confidence: this.confidenceToNumber(optimizedDecision.confidence),
        reasoning: `High-confidence opportunity detected. Expected profit: $${expectedProfit.toFixed(2)}. Goal progress: ${(progressToGoal * 100).toFixed(1)}%.`,
        expectedProfit,
        riskLevel: aggressionLevel > 70 ? 'high' : 'medium',
        urgency: requiredHourlyRate > expectedProfit ? 'high' : 'medium',
        agentRecommendation: optimizedDecision.metadata?.agentId || 'best-performer',
        strategyRecommendation: this.state.currentStrategy || 'aggressive',
      }
    }

    // Standard decision (enhanced with strategy and news intelligence)
    if (optimizedDecision.shouldExecute) {
      let reasoning = optimizedDecision.reason
      
      // Add strategy intelligence
      if (bestStrategy) {
        reasoning += ` | 🎯 Strategy: ${bestStrategy.strategy.name} (${(bestStrategy.confidence * 100).toFixed(0)}% match)`
      }

      // Add news intelligence
      if (newsOpportunities.length > 0) {
        const topNews = newsOpportunities[0]
        reasoning += ` | 📰 News: ${topNews.article.title.substring(0, 50)}... (${(topNews.confidence * 100).toFixed(0)}% confidence)`
      }

      reasoning += ` | Expected profit: $${expectedProfit.toFixed(2)}`

      return {
        action: optimizedDecision.signal === 'BUY' ? 'BUY' : 
                optimizedDecision.signal === 'SELL' ? 'SELL' : 'HOLD',
        confidence: this.confidenceToNumber(optimizedDecision.confidence),
        reasoning,
        expectedProfit,
        riskLevel: aggressionLevel > 60 ? 'medium' : 'low',
        urgency: newsOpportunities.length > 0 && newsOpportunities[0].urgency === 'immediate' ? 'high' : 'medium',
        agentRecommendation: optimizedDecision.metadata?.agentId || 'optimal',
        strategyRecommendation: bestStrategy?.strategy.id || this.state.currentStrategy || 'balanced',
      }
    }

    // Hold if not confident
    return {
      action: 'HOLD',
      confidence: 0.5,
      reasoning: 'Waiting for better opportunity. Current conditions not optimal.',
      expectedProfit: 0,
      riskLevel: 'low',
      urgency: 'low',
      agentRecommendation: 'monitoring',
      strategyRecommendation: 'wait',
    }
  }

  /**
   * Record trade outcome and update daily profit
   */
  recordTradeOutcome(profit: number, success: boolean): void {
    const newDailyProfit = this.state.dailyProfit + profit
    const newTradesToday = this.state.tradesToday + 1
    const newWins = success 
      ? (this.state.winRateToday * (newTradesToday - 1) / 100) + 1
      : (this.state.winRateToday * (newTradesToday - 1) / 100)
    const newWinRate = newTradesToday > 0 ? (newWins / newTradesToday) * 100 : 0

    this.updateState({
      ...this.state,
      dailyProfit: newDailyProfit,
      tradesToday: newTradesToday,
      winRateToday: newWinRate,
    })

    // Silent celebration if goal achieved (no user notification)
    if (newDailyProfit >= DAILY_PROFIT_GOAL && this.state.dailyProfit < DAILY_PROFIT_GOAL) {
      console.log(`🎯 [AUTONOMOUS BOT] Daily goal achieved: $${newDailyProfit.toFixed(2)}`)
    }
  }

  /**
   * Reset daily metrics (called at midnight)
   */
  resetDailyMetrics(): void {
    this.updateState({
      ...this.state,
      dailyProfit: 0,
      tradesToday: 0,
      winRateToday: 0,
      lastDecision: null,
    })
  }

  /**
   * Get hours remaining in day
   */
  private getHoursRemainingInDay(): number {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    const msRemaining = midnight.getTime() - now.getTime()
    return msRemaining / (1000 * 60 * 60)
  }

  /**
   * Convert confidence string to number
   */
  private confidenceToNumber(confidence: string): number {
    switch (confidence) {
      case 'very-high': return 0.9
      case 'high': return 0.75
      case 'medium': return 0.6
      case 'low': return 0.4
      default: return 0.5
    }
  }

  /**
   * Get current state (for internal use only)
   */
  getState(): AutonomousBotState {
    return { ...this.state }
  }

  /**
   * Get progress to goal (for internal use only, not shown to user)
   */
  getGoalProgress(): { progress: number; remaining: number; goal: number } {
    return {
      progress: this.state.dailyProfit,
      remaining: Math.max(0, DAILY_PROFIT_GOAL - this.state.dailyProfit),
      goal: DAILY_PROFIT_GOAL,
    }
  }
}

/**
 * Hook for autonomous bot controller
 */
export function useAutonomousBot(userTier: string = 'free') {
  const [botState, setBotState] = useKVSafe<AutonomousBotState>('autonomous-bot-state', {
    isRunning: false,
    dailyProfit: 0,
    dailyGoal: DAILY_PROFIT_GOAL, // Internal goal
    tradesToday: 0,
    winRateToday: 0,
    currentStrategy: null,
    activeAgents: [],
    aggressionLevel: 50,
    lastDecision: null,
    performanceMetrics: {
      avgProfitPerTrade: 0,
      bestTimeOfDay: 0,
      bestStrategy: '',
      bestAgent: '',
    },
  })

  // Reset daily metrics at midnight
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date()
      const lastReset = localStorage.getItem('autonomous-bot-last-reset')
      const lastResetDate = lastReset ? new Date(lastReset) : new Date(0)
      
      if (now.getDate() !== lastResetDate.getDate()) {
        setBotState(prev => ({
          ...prev,
          dailyProfit: 0,
          tradesToday: 0,
          winRateToday: 0,
        }))
        localStorage.setItem('autonomous-bot-last-reset', now.toISOString())
      }
    }

    checkMidnight()
    const interval = setInterval(checkMidnight, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [setBotState])

  const controller = useMemo(() => {
    return new AutonomousBotController(botState, setBotState, userTier)
  }, [botState, setBotState, userTier])

  return {
    controller,
    state: botState,
  }
}

import React from 'react'

