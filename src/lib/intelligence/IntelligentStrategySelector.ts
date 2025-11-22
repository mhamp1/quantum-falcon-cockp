// Intelligent Strategy Selector — News + Market Conditions + Performance
// November 22, 2025 — Quantum Falcon Cockpit
// Intelligently selects the best strategy based on multiple factors

import { getStrategiesForTier, type StrategyData } from '../strategiesData'
import { getLearningSystem } from '../ai/learning/AdaptiveLearningSystem'
import type { NewsOpportunity } from './NewsIntelligenceEngine'
import type { AgentAnalysisInput } from '../ai/agents/index'

export interface StrategySelection {
  strategy: StrategyData
  confidence: number
  reasoning: string[]
  expectedProfit: number
  riskLevel: 'low' | 'medium' | 'high'
  matchFactors: {
    newsMatch: number
    marketMatch: number
    performanceMatch: number
    timingMatch: number
  }
}

/**
 * Intelligent Strategy Selector
 * Selects the best strategy based on:
 * 1. News opportunities
 * 2. Market conditions
 * 3. Historical performance
 * 4. Current time/volatility
 */
export class IntelligentStrategySelector {
  private strategies: StrategyData[] = []
  private learningSystem = getLearningSystem()

  constructor(userTier: string = 'free') {
    this.strategies = getStrategiesForTier(userTier).filter(s => s.is_unlocked)
  }

  /**
   * Select best strategy for current conditions
   */
  selectBestStrategy(
    marketData: AgentAnalysisInput,
    newsOpportunities: NewsOpportunity[] = [],
    goalProgress?: { progress: number; remaining: number }
  ): StrategySelection | null {
    if (this.strategies.length === 0) return null

    const metrics = this.learningSystem.getMetrics()
    const config = this.learningSystem.getConfig()

    // Score each strategy
    const scoredStrategies = this.strategies.map(strategy => {
      const scores = {
        newsMatch: this.scoreNewsMatch(strategy, newsOpportunities),
        marketMatch: this.scoreMarketMatch(strategy, marketData),
        performanceMatch: this.scorePerformanceMatch(strategy, metrics),
        timingMatch: this.scoreTimingMatch(strategy, marketData),
      }

      // Weighted total score
      const totalScore = 
        scores.newsMatch * 0.3 +      // 30% weight on news
        scores.marketMatch * 0.3 +    // 30% weight on market conditions
        scores.performanceMatch * 0.25 + // 25% weight on performance
        scores.timingMatch * 0.15      // 15% weight on timing

      // Adjust for goal progress (if behind, prefer higher-risk strategies)
      let adjustedScore = totalScore
      if (goalProgress && goalProgress.remaining > 300) {
        // Behind goal - prefer aggressive strategies
        if (strategy.risk === 'high') adjustedScore *= 1.2
        if (strategy.category === 'Trend Following') adjustedScore *= 1.1
      } else if (goalProgress && goalProgress.progress >= 600) {
        // Goal achieved - prefer conservative strategies
        if (strategy.risk === 'low') adjustedScore *= 1.2
        if (strategy.category === 'Mean Reversion') adjustedScore *= 1.1
      }

      // Calculate confidence
      const confidence = Math.min(1, adjustedScore / 100)

      // Expected profit (based on win rate and historical performance)
      const winRate = parseFloat(strategy.win_rate.replace('%', '')) || 50
      const expectedProfit = this.calculateExpectedProfit(strategy, winRate, marketData)

      // Risk level
      const riskLevel = strategy.risk || 'medium'

      // Generate reasoning
      const reasoning = this.generateReasoning(strategy, scores, newsOpportunities, marketData)

      return {
        strategy,
        confidence,
        reasoning,
        expectedProfit,
        riskLevel,
        matchFactors: scores,
      }
    })

    // Sort by confidence and return best
    scoredStrategies.sort((a, b) => b.confidence - a.confidence)

    // Only return if confidence is high enough
    if (scoredStrategies[0].confidence < 0.5) return null

    return scoredStrategies[0]
  }

  /**
   * Score news match (0-100)
   */
  private scoreNewsMatch(strategy: StrategyData, opportunities: NewsOpportunity[]): number {
    if (opportunities.length === 0) return 50 // Neutral if no news

    let totalScore = 0
    let count = 0

    opportunities.forEach(opp => {
      if (opp.matchedStrategies.some(id => id === strategy.id)) {
        totalScore += opp.confidence * 100
        count++
      }
    })

    if (count === 0) return 30 // Low score if no news matches

    return Math.min(100, totalScore / count)
  }

  /**
   * Score market conditions match (0-100)
   */
  private scoreMarketMatch(strategy: StrategyData, marketData: AgentAnalysisInput): number {
    let score = 50 // Base score

    const volatility = marketData.volatility?.volatility1h || 0.03
    const sentiment = marketData.sentiment.score
    const volumeSpike = marketData.volume.spikeMultiple || 1

    // Match strategy category to market conditions
    if (strategy.category === 'Trend Following') {
      // Trend following works best in trending markets
      if (Math.abs(sentiment) > 0.5) score += 20
      if (volumeSpike > 1.5) score += 15
    }

    if (strategy.category === 'Mean Reversion') {
      // Mean reversion works best in volatile, ranging markets
      if (volatility > 0.05 && Math.abs(sentiment) < 0.3) score += 25
    }

    if (strategy.category === 'Volume') {
      // Volume strategies need volume spikes
      if (volumeSpike > 2) score += 30
    }

    if (strategy.category === 'Sentiment') {
      // Sentiment strategies need strong sentiment
      if (Math.abs(sentiment) > 0.6) score += 30
    }

    if (strategy.category === 'Oscillator') {
      // Oscillators work in ranging markets
      if (volatility > 0.03 && volatility < 0.08) score += 20
    }

    // Risk level match
    if (strategy.risk === 'high' && volatility > 0.08) {
      score += 10 // High risk strategies for high volatility
    } else if (strategy.risk === 'low' && volatility < 0.03) {
      score += 10 // Low risk strategies for low volatility
    }

    return Math.min(100, score)
  }

  /**
   * Score performance match (0-100)
   */
  private scorePerformanceMatch(strategy: StrategyData, metrics: any): number {
    if (!metrics || !metrics.strategyPerformance) return 50

    const perf = metrics.strategyPerformance[strategy.id]
    if (!perf) return 50

    let score = 50

    // Win rate contribution
    if (perf.winRate > 70) score += 30
    else if (perf.winRate > 60) score += 20
    else if (perf.winRate > 50) score += 10

    // Profit contribution
    if (perf.profit > 1000) score += 20
    else if (perf.profit > 500) score += 10

    // Trade count (more trades = more reliable)
    if (perf.trades > 20) score += 10

    return Math.min(100, score)
  }

  /**
   * Score timing match (0-100)
   */
  private scoreTimingMatch(strategy: StrategyData, marketData: AgentAnalysisInput): number {
    const hour = marketData.time.hour
    const dayOfWeek = marketData.time.dayOfWeek

    let score = 50 // Base

    // Some strategies work better at certain times
    // (This can be enhanced with learned patterns)
    if (strategy.category === 'Trend Following') {
      // Trend following often works better during market hours
      if (hour >= 9 && hour <= 17) score += 15
    }

    if (strategy.category === 'Volume') {
      // Volume strategies work during high activity periods
      if (hour >= 8 && hour <= 20) score += 10
    }

    return Math.min(100, score)
  }

  /**
   * Calculate expected profit
   */
  private calculateExpectedProfit(
    strategy: StrategyData,
    winRate: number,
    marketData: AgentAnalysisInput
  ): number {
    // Base profit from strategy PnL
    const baseProfit = strategy.pnl || 0

    // Adjust for win rate
    const winRateMultiplier = winRate / 100

    // Adjust for market conditions
    const sentimentMultiplier = 1 + (marketData.sentiment.score * 0.2)
    const volatilityMultiplier = 1 + ((marketData.volatility?.volatility1h || 0.03) * 2)

    return baseProfit * winRateMultiplier * sentimentMultiplier * volatilityMultiplier
  }

  /**
   * Generate reasoning for strategy selection
   */
  private generateReasoning(
    strategy: StrategyData,
    scores: { newsMatch: number; marketMatch: number; performanceMatch: number; timingMatch: number },
    opportunities: NewsOpportunity[],
    marketData: AgentAnalysisInput
  ): string[] {
    const reasoning: string[] = []

    reasoning.push(`Selected: ${strategy.name}`)

    if (scores.newsMatch > 70) {
      const matchingNews = opportunities.filter(o => 
        o.matchedStrategies.includes(strategy.id)
      )
      if (matchingNews.length > 0) {
        reasoning.push(`📰 Strong news match: ${matchingNews.length} opportunity/opportunities detected`)
      }
    }

    if (scores.marketMatch > 70) {
      reasoning.push(`📊 Excellent market condition match (${scores.marketMatch.toFixed(0)}%)`)
    }

    if (scores.performanceMatch > 70) {
      reasoning.push(`🏆 High historical performance (${scores.performanceMatch.toFixed(0)}%)`)
    }

    if (scores.timingMatch > 60) {
      reasoning.push(`⏰ Good timing match (${scores.timingMatch.toFixed(0)}%)`)
    }

    reasoning.push(`Overall confidence: ${((scores.newsMatch * 0.3 + scores.marketMatch * 0.3 + scores.performanceMatch * 0.25 + scores.timingMatch * 0.15) / 100 * 100).toFixed(0)}%`)

    return reasoning
  }

  /**
   * Get strategies ranked by suitability
   */
  getRankedStrategies(
    marketData: AgentAnalysisInput,
    newsOpportunities: NewsOpportunity[] = []
  ): StrategySelection[] {
    const selections = this.strategies.map(strategy => {
      const scores = {
        newsMatch: this.scoreNewsMatch(strategy, newsOpportunities),
        marketMatch: this.scoreMarketMatch(strategy, marketData),
        performanceMatch: this.scorePerformanceMatch(strategy, this.learningSystem.getMetrics()),
        timingMatch: this.scoreTimingMatch(strategy, marketData),
      }

      const totalScore = 
        scores.newsMatch * 0.3 +
        scores.marketMatch * 0.3 +
        scores.performanceMatch * 0.25 +
        scores.timingMatch * 0.15

      return {
        strategy,
        confidence: Math.min(1, totalScore / 100),
        reasoning: this.generateReasoning(strategy, scores, newsOpportunities, marketData),
        expectedProfit: this.calculateExpectedProfit(
          strategy,
          parseFloat(strategy.win_rate.replace('%', '')) || 50,
          marketData
        ),
        riskLevel: strategy.risk || 'medium',
        matchFactors: scores,
      }
    })

    return selections.sort((a, b) => b.confidence - a.confidence)
  }
}

/**
 * Hook for intelligent strategy selection
 */
export function useIntelligentStrategySelector(userTier: string = 'free') {
  const [selector] = useState(() => new IntelligentStrategySelector(userTier))

  const selectBest = useCallback((
    marketData: AgentAnalysisInput,
    newsOpportunities: NewsOpportunity[] = [],
    goalProgress?: { progress: number; remaining: number }
  ) => {
    return selector.selectBestStrategy(marketData, newsOpportunities, goalProgress)
  }, [selector])

  const getRanked = useCallback((
    marketData: AgentAnalysisInput,
    newsOpportunities: NewsOpportunity[] = []
  ) => {
    return selector.getRankedStrategies(marketData, newsOpportunities)
  }, [selector])

  return {
    selector,
    selectBest,
    getRanked,
  }
}

import { useState, useCallback } from 'react'

