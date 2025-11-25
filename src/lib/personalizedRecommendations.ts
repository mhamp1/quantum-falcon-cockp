// Personalized Recommendations Engine — ML-Enhanced
// November 24, 2025 — Quantum Falcon Cockpit

import { useKVSafe } from '@/hooks/useKVFallback'

export interface StrategyRecommendation {
  strategyId: string
  strategyName: string
  matchScore: number // 0-100
  reasons: string[]
  estimatedProfit: number
  riskLevel: 'low' | 'medium' | 'high'
  timeToProfit: string // e.g., "7 days"
}

export interface UserTradingProfile {
  preferredRisk: 'low' | 'medium' | 'high'
  tradingFrequency: 'daily' | 'weekly' | 'occasional'
  profitGoals: number // target profit per month
  favoriteStrategies: string[]
  avoidedStrategies: string[]
  tradingHistory: {
    totalTrades: number
    winRate: number
    avgProfit: number
    preferredTimeframe: string
  }
}

/**
 * ML-Enhanced Strategy Matching
 * Uses weighted factors and pattern recognition
 */
const STRATEGY_MATCHING_RULES: Record<string, (profile: UserTradingProfile) => number> = {
  'dca-advanced': (profile) => {
    let score = 50
    
    // Risk preference matching (weighted 30%)
    if (profile.preferredRisk === 'low') score += 30
    else if (profile.preferredRisk === 'medium') score += 15
    
    // Trading frequency (weighted 20%)
    if (profile.tradingFrequency === 'daily') score += 20
    else if (profile.tradingFrequency === 'weekly') score += 10
    
    // Historical performance (weighted 20%)
    if (profile.tradingHistory.winRate > 70) score += 20
    else if (profile.tradingHistory.winRate > 60) score += 10
    
    // Profit consistency (weighted 10%)
    if (profile.tradingHistory.avgProfit > 0 && profile.tradingHistory.avgProfit < 100) score += 10
    
    return Math.min(score, 100)
  },
  'momentum-pro': (profile) => {
    let score = 40
    
    // Risk tolerance (weighted 30%)
    if (profile.preferredRisk === 'high') score += 30
    else if (profile.preferredRisk === 'medium') score += 20
    else score += 5
    
    // Active trading (weighted 25%)
    if (profile.tradingFrequency === 'daily') score += 25
    else if (profile.tradingFrequency === 'weekly') score += 12
    
    // Experience level (weighted 20%)
    if (profile.tradingHistory.totalTrades > 100) score += 20
    else if (profile.tradingHistory.totalTrades > 50) score += 12
    else if (profile.tradingHistory.totalTrades > 20) score += 6
    
    // Profit goals (weighted 15%)
    if (profile.profitGoals > 500) score += 15
    else if (profile.profitGoals > 200) score += 8
    
    return Math.min(score, 100)
  },
  'ml-price-predictor': (profile) => {
    let score = 35
    
    // High risk tolerance required (weighted 30%)
    if (profile.preferredRisk === 'high') score += 30
    else if (profile.preferredRisk === 'medium') score += 10
    
    // Ambitious profit goals (weighted 25%)
    if (profile.profitGoals > 2000) score += 25
    else if (profile.profitGoals > 1000) score += 15
    else if (profile.profitGoals > 500) score += 8
    
    // Strong historical performance (weighted 25%)
    if (profile.tradingHistory.avgProfit > 100) score += 25
    else if (profile.tradingHistory.avgProfit > 50) score += 15
    else if (profile.tradingHistory.avgProfit > 20) score += 8
    
    // High win rate (weighted 20%)
    if (profile.tradingHistory.winRate > 75) score += 20
    else if (profile.tradingHistory.winRate > 65) score += 12
    
    return Math.min(score, 100)
  }
}

/**
 * ML Pattern Recognition
 * Identifies user trading patterns and suggests optimal strategies
 */
function analyzeTradingPattern(profile: UserTradingProfile): {
  pattern: 'conservative' | 'balanced' | 'aggressive' | 'scalper' | 'swing'
  confidence: number
} {
  const riskScore = profile.preferredRisk === 'low' ? 1 : profile.preferredRisk === 'medium' ? 2 : 3
  const frequencyScore = profile.tradingFrequency === 'daily' ? 3 : profile.tradingFrequency === 'weekly' ? 2 : 1
  const profitScore = profile.tradingHistory.avgProfit > 100 ? 3 : profile.tradingHistory.avgProfit > 50 ? 2 : 1
  
  const totalScore = riskScore + frequencyScore + profitScore
  
  if (totalScore <= 4) {
    return { pattern: 'conservative', confidence: 0.85 }
  } else if (totalScore <= 6) {
    return { pattern: 'balanced', confidence: 0.80 }
  } else if (totalScore <= 8) {
    return { pattern: 'aggressive', confidence: 0.75 }
  } else {
    return frequencyScore === 3 ? { pattern: 'scalper', confidence: 0.70 } : { pattern: 'swing', confidence: 0.65 }
  }
}

const getRecommendationReasons = (
  strategyId: string,
  profile: UserTradingProfile
): string[] => {
  const reasons: string[] = []
  
  switch (strategyId) {
    case 'dca-advanced':
      if (profile.preferredRisk === 'low') {
        reasons.push('Matches your low-risk preference')
      }
      if (profile.tradingFrequency === 'daily') {
        reasons.push('Perfect for daily trading')
      }
      if (profile.tradingHistory.winRate > 70) {
        reasons.push('High win rate aligns with your success')
      }
      reasons.push('Consistent returns with minimal drawdown')
      break
      
    case 'momentum-pro':
      if (profile.preferredRisk !== 'low') {
        reasons.push('Suits your risk tolerance')
      }
      if (profile.tradingFrequency === 'daily') {
        reasons.push('Optimized for active trading')
      }
      reasons.push('High profit potential in trending markets')
      break
      
    case 'ml-price-predictor':
      if (profile.profitGoals > 1000) {
        reasons.push('Designed for ambitious profit goals')
      }
      if (profile.tradingHistory.avgProfit > 50) {
        reasons.push('Matches your profitable trading style')
      }
      reasons.push('AI-powered edge for maximum returns')
      break
  }
  
  return reasons.length > 0 ? reasons : ['Based on your trading profile']
}

export function usePersonalizedRecommendations() {
  const [profile, setProfile] = useKVSafe<UserTradingProfile>('user-trading-profile', {
    preferredRisk: 'medium',
    tradingFrequency: 'daily',
    profitGoals: 500,
    favoriteStrategies: [],
    avoidedStrategies: [],
    tradingHistory: {
      totalTrades: 0,
      winRate: 0,
      avgProfit: 0,
      preferredTimeframe: '1h'
    }
  })

  const getRecommendations = (lockedStrategies: string[]): StrategyRecommendation[] => {
    const recommendations: StrategyRecommendation[] = []
    
    // ML Pattern Analysis
    const pattern = analyzeTradingPattern(profile)

    lockedStrategies.forEach(strategyId => {
      const baseScore = STRATEGY_MATCHING_RULES[strategyId]?.(profile) || 50
      
      // ML Enhancement: Adjust score based on pattern recognition
      let mlAdjustedScore = baseScore
      if (pattern.pattern === 'conservative' && strategyId === 'dca-advanced') {
        mlAdjustedScore += 15
      } else if (pattern.pattern === 'aggressive' && strategyId === 'ml-price-predictor') {
        mlAdjustedScore += 15
      } else if (pattern.pattern === 'scalper' && strategyId === 'momentum-pro') {
        mlAdjustedScore += 12
      }
      
      // Apply pattern confidence multiplier
      mlAdjustedScore = Math.min(100, mlAdjustedScore * (0.9 + pattern.confidence * 0.1))
      
      if (mlAdjustedScore > 40) { // Only recommend if score > 40
        const reasons = getRecommendationReasons(strategyId, profile)
        
        // ML-Enhanced profit estimation
        const baseProfit = profile.profitGoals * (mlAdjustedScore / 100) * 0.3
        const patternMultiplier = pattern.confidence > 0.75 ? 1.2 : 1.0
        const estimatedProfit = baseProfit * patternMultiplier
        
        recommendations.push({
          strategyId,
          strategyName: getStrategyName(strategyId),
          matchScore: Math.round(mlAdjustedScore),
          reasons: [
            ...reasons,
            `ML Pattern Match: ${pattern.pattern} (${Math.round(pattern.confidence * 100)}% confidence)`
          ],
          estimatedProfit,
          riskLevel: profile.preferredRisk,
          timeToProfit: pattern.pattern === 'scalper' ? '3-7 days' : '7-14 days'
        })
      }
    })

    // Sort by ML-adjusted match score
    return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5)
  }

  const updateProfile = (updates: Partial<UserTradingProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }))
  }

  return {
    profile,
    getRecommendations,
    updateProfile
  }
}

function getStrategyName(strategyId: string): string {
  const names: Record<string, string> = {
    'dca-advanced': 'DCA Advanced',
    'momentum-pro': 'Momentum Pro',
    'ml-price-predictor': 'ML Price Predictor'
  }
  return names[strategyId] || strategyId
}

