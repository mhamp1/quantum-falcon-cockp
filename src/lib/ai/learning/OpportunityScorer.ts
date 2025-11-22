// ML-Based Opportunity Scorer — Intelligent Snipe Selection
// November 21, 2025 — Quantum Falcon Cockpit
// Uses machine learning to score snipe opportunities and maximize win rate

import { getLearningSystem, type TradeOutcome } from './AdaptiveLearningSystem'

export interface SnipeOpportunity {
  poolAddress: string
  tokenMint: string
  liquidityUsd: number
  timestamp: number
  mevRisk: number
  volume24h?: number
  holderCount?: number
  priceChange1h?: number
  sentiment?: number
  poolAge?: number // seconds since creation
}

export interface OpportunityScore {
  score: number // 0-100, higher = better opportunity
  confidence: number // 0-1
  factors: {
    liquidity: number
    mevRisk: number
    timing: number
    historical: number
    market: number
  }
  recommendation: 'snipe' | 'skip' | 'monitor'
  expectedProfitBps: number
  riskLevel: 'low' | 'medium' | 'high'
}

/**
 * ML-Based Opportunity Scorer
 * Analyzes snipe opportunities using learned patterns
 */
export class OpportunityScorer {
  private learningSystem = getLearningSystem()

  /**
   * Score a snipe opportunity using ML-based analysis
   */
  scoreOpportunity(opportunity: SnipeOpportunity): OpportunityScore {
    const metrics = this.learningSystem.getMetrics()
    const config = this.learningSystem.getConfig()

    // Factor 1: Liquidity Score (0-25 points)
    const liquidityScore = this.scoreLiquidity(opportunity.liquidityUsd)

    // Factor 2: MEV Risk Score (0-25 points, inverted - lower risk = higher score)
    const mevRiskScore = this.scoreMEVRisk(opportunity.mevRisk)

    // Factor 3: Timing Score (0-20 points) - based on learned best times
    const timingScore = this.scoreTiming(opportunity.timestamp, metrics)

    // Factor 4: Historical Performance (0-20 points) - based on similar past trades
    const historicalScore = this.scoreHistorical(opportunity, metrics)

    // Factor 5: Market Conditions (0-10 points)
    const marketScore = this.scoreMarketConditions(opportunity)

    const totalScore = liquidityScore + mevRiskScore + timingScore + historicalScore + marketScore
    const confidence = this.calculateConfidence(totalScore, opportunity)

    // Expected profit based on historical data
    const expectedProfitBps = this.estimateProfit(opportunity, metrics)

    // Risk level assessment
    const riskLevel = this.assessRisk(opportunity, expectedProfitBps)

    // Recommendation
    let recommendation: 'snipe' | 'skip' | 'monitor'
    if (totalScore >= 70 && confidence >= 0.75 && riskLevel === 'low') {
      recommendation = 'snipe'
    } else if (totalScore >= 50 && confidence >= 0.6) {
      recommendation = 'monitor'
    } else {
      recommendation = 'skip'
    }

    return {
      score: totalScore,
      confidence,
      factors: {
        liquidity: liquidityScore,
        mevRisk: mevRiskScore,
        timing: timingScore,
        historical: historicalScore,
        market: marketScore,
      },
      recommendation,
      expectedProfitBps,
      riskLevel,
    }
  }

  private scoreLiquidity(liquidityUsd: number): number {
    // Optimal liquidity range: $50K - $500K
    if (liquidityUsd >= 50000 && liquidityUsd <= 500000) {
      return 25
    }
    if (liquidityUsd >= 20000 && liquidityUsd < 50000) {
      return 15
    }
    if (liquidityUsd > 500000 && liquidityUsd <= 2000000) {
      return 20
    }
    if (liquidityUsd < 20000) {
      return 5
    }
    return 10 // Too large, harder to move
  }

  private scoreMEVRisk(mevRisk: number): number {
    // Lower MEV risk = higher score
    if (mevRisk < 0.3) return 25
    if (mevRisk < 0.5) return 20
    if (mevRisk < 0.7) return 10
    return 0 // Too risky
  }

  private scoreTiming(timestamp: number, metrics: any): number {
    if (!metrics) return 10 // Neutral if no data

    const date = new Date(timestamp)
    const hour = date.getHours()
    const day = date.getDay()

    let score = 10 // Base score

    // Bonus for best trading hour
    if (hour === metrics.bestTimeOfDay) {
      score += 5
    } else if (Math.abs(hour - metrics.bestTimeOfDay) <= 2) {
      score += 2
    }

    // Bonus for best trading day
    if (day === metrics.bestDayOfWeek) {
      score += 5
    }

    return Math.min(20, score)
  }

  private scoreHistorical(opportunity: SnipeOpportunity, metrics: any): number {
    if (!metrics || !metrics.strategyPerformance) return 10

    // Check if similar opportunities (liquidity range) have been profitable
    const liquidityRange = this.getLiquidityRange(opportunity.liquidityUsd)
    
    // Use best strategy performance as proxy
    const bestStrategy = metrics.bestStrategy
    if (bestStrategy && metrics.strategyPerformance[bestStrategy]) {
      const perf = metrics.strategyPerformance[bestStrategy]
      if (perf.winRate > 70) {
        return 20
      }
      if (perf.winRate > 60) {
        return 15
      }
      if (perf.winRate > 50) {
        return 10
      }
    }

    return 5 // Low historical performance
  }

  private scoreMarketConditions(opportunity: SnipeOpportunity): number {
    let score = 5 // Base score

    // Positive sentiment bonus
    if (opportunity.sentiment && opportunity.sentiment > 0.6) {
      score += 3
    }

    // Volume spike bonus
    if (opportunity.volume24h && opportunity.volume24h > 1000000) {
      score += 2
    }

    // Price momentum bonus
    if (opportunity.priceChange1h && opportunity.priceChange1h > 5) {
      score += 2
    } else if (opportunity.priceChange1h && opportunity.priceChange1h < -10) {
      score -= 2 // Negative momentum penalty
    }

    return Math.max(0, Math.min(10, score))
  }

  private calculateConfidence(score: number, opportunity: SnipeOpportunity): number {
    let confidence = score / 100 // Base confidence from score

    // Increase confidence with more data points
    if (opportunity.volume24h && opportunity.holderCount) {
      confidence += 0.1
    }

    // Decrease confidence with high MEV risk
    if (opportunity.mevRisk > 0.6) {
      confidence -= 0.2
    }

    // Increase confidence for fresh pools (less competition)
    if (opportunity.poolAge && opportunity.poolAge < 60) {
      confidence += 0.15
    }

    return Math.max(0, Math.min(1, confidence))
  }

  private estimateProfit(opportunity: SnipeOpportunity, metrics: any): number {
    if (!metrics || metrics.avgProfitPerTrade === undefined) {
      // Default estimate based on liquidity
      if (opportunity.liquidityUsd >= 50000 && opportunity.liquidityUsd <= 200000) {
        return 300 // 3% expected profit for optimal range
      }
      return 150 // 1.5% default
    }

    // Use historical average profit as baseline
    const baseProfit = (metrics.avgProfitPerTrade / 100) * 100 // Convert to bps
    let estimated = baseProfit

    // Adjust based on liquidity
    if (opportunity.liquidityUsd >= 50000 && opportunity.liquidityUsd <= 200000) {
      estimated *= 1.2 // 20% bonus for optimal range
    }

    // Adjust based on MEV risk (lower risk = higher profit potential)
    if (opportunity.mevRisk < 0.3) {
      estimated *= 1.15
    } else if (opportunity.mevRisk > 0.6) {
      estimated *= 0.8
    }

    return Math.round(estimated)
  }

  private assessRisk(opportunity: SnipeOpportunity, expectedProfit: number): 'low' | 'medium' | 'high' {
    let riskScore = 0

    // MEV risk
    if (opportunity.mevRisk < 0.3) riskScore += 1
    else if (opportunity.mevRisk < 0.5) riskScore += 2
    else riskScore += 3

    // Liquidity risk
    if (opportunity.liquidityUsd < 20000) riskScore += 2
    else if (opportunity.liquidityUsd >= 50000) riskScore += 0
    else riskScore += 1

    // Profit-to-risk ratio
    if (expectedProfit > 200 && opportunity.mevRisk < 0.4) riskScore -= 1
    if (expectedProfit < 100) riskScore += 1

    if (riskScore <= 1) return 'low'
    if (riskScore <= 3) return 'medium'
    return 'high'
  }

  private getLiquidityRange(liquidityUsd: number): string {
    if (liquidityUsd < 20000) return 'low'
    if (liquidityUsd < 50000) return 'medium'
    if (liquidityUsd < 200000) return 'high'
    if (liquidityUsd < 1000000) return 'very-high'
    return 'extreme'
  }

  /**
   * Batch score multiple opportunities and rank them
   */
  rankOpportunities(opportunities: SnipeOpportunity[]): Array<OpportunityScore & { opportunity: SnipeOpportunity }> {
    const scored = opportunities.map(opp => ({
      ...this.scoreOpportunity(opp),
      opportunity: opp,
    }))

    // Sort by score (highest first)
    return scored.sort((a, b) => b.score - a.score)
  }

  /**
   * Filter opportunities to only high-quality snipes
   */
  filterHighQuality(opportunities: SnipeOpportunity[]): SnipeOpportunity[] {
    const ranked = this.rankOpportunities(opportunities)
    return ranked
      .filter(item => item.recommendation === 'snipe')
      .map(item => item.opportunity)
  }
}

// Singleton instance
let scorerInstance: OpportunityScorer | null = null

export function getOpportunityScorer(): OpportunityScorer {
  if (!scorerInstance) {
    scorerInstance = new OpportunityScorer()
  }
  return scorerInstance
}

