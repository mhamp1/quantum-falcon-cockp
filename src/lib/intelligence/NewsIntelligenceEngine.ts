// News Intelligence Engine — Continuous News Scanning for Trading Opportunities
// November 22, 2025 — Quantum Falcon Cockpit
// The bot intelligently scans news and matches opportunities to strategies

import { getStrategiesForTier, type StrategyData } from '../strategiesData'
import { useKVSafe } from '@/hooks/useKVFallback'

export interface NewsArticle {
  id: string
  title: string
  url: string
  published_at: string
  source: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  sentimentScore: number // -1 to 1
  keywords: string[]
  impact: 'high' | 'medium' | 'low'
  opportunityType?: 'breakout' | 'reversal' | 'momentum' | 'defensive' | 'arbitrage'
  matchedStrategies: string[] // Strategy IDs that match this news
}

export interface NewsOpportunity {
  article: NewsArticle
  confidence: number // 0-1
  expectedImpact: 'high' | 'medium' | 'low'
  recommendedAction: 'BUY' | 'SELL' | 'HOLD' | 'MONITOR'
  matchedStrategies: StrategyData[]
  urgency: 'immediate' | 'short-term' | 'medium-term'
  reasoning: string
}

/**
 * News Intelligence Engine
 * Continuously scans news and identifies trading opportunities
 */
export class NewsIntelligenceEngine {
  private strategies: StrategyData[] = []
  private newsCache: Map<string, NewsArticle> = new Map()
  private opportunityHistory: NewsOpportunity[] = []

  constructor(userTier: string = 'free') {
    this.strategies = getStrategiesForTier(userTier)
  }

  /**
   * Analyze news article for trading opportunities
   */
  analyzeNewsArticle(article: any): NewsArticle {
    const title = article.title || ''
    const lowerTitle = title.toLowerCase()

    // Sentiment analysis
    const sentimentScore = this.analyzeSentiment(title)
    const sentiment: 'bullish' | 'bearish' | 'neutral' = 
      sentimentScore > 0.3 ? 'bullish' :
      sentimentScore < -0.3 ? 'bearish' : 'neutral'

    // Extract keywords
    const keywords = this.extractKeywords(title)

    // Determine impact level
    const impact = this.assessImpact(title, sentimentScore)

    // Determine opportunity type
    const opportunityType = this.determineOpportunityType(title, sentimentScore)

    // Match strategies to this news
    const matchedStrategies = this.matchStrategiesToNews(title, sentiment, opportunityType)

    const newsArticle: NewsArticle = {
      id: article.id || `news-${Date.now()}`,
      title,
      url: article.url || '',
      published_at: article.published_at || new Date().toISOString(),
      source: article.source?.title || 'Crypto News',
      sentiment,
      sentimentScore,
      keywords,
      impact,
      opportunityType,
      matchedStrategies,
    }

    // Cache article
    this.newsCache.set(newsArticle.id, newsArticle)

    return newsArticle
  }

  /**
   * Analyze sentiment from news title
   */
  private analyzeSentiment(title: string): number {
    const lower = title.toLowerCase()
    let score = 0

    // Bullish indicators
    const bullishWords = [
      'pump', 'surge', 'rally', 'breakout', 'bullish', 'moon', 'rocket', 'soar',
      'gain', 'profit', 'win', 'success', 'adoption', 'partnership', 'launch',
      'upgrade', 'breakthrough', 'record', 'high', 'peak', 'boom', 'explosive',
      'massive', 'huge', 'major', 'significant', 'approval', 'greenlight'
    ]

    // Bearish indicators
    const bearishWords = [
      'crash', 'dump', 'plunge', 'drop', 'fall', 'bearish', 'decline', 'loss',
      'fail', 'hack', 'exploit', 'rug', 'scam', 'warning', 'ban', 'regulation',
      'lawsuit', 'bankruptcy', 'freeze', 'halt', 'suspension', 'delist', 'reject'
    ]

    bullishWords.forEach(word => {
      if (lower.includes(word)) score += 0.1
    })

    bearishWords.forEach(word => {
      if (lower.includes(word)) score -= 0.1
    })

    // Intensity multipliers
    if (lower.includes('massive') || lower.includes('huge') || lower.includes('major')) {
      score *= 1.5
    }

    // Clamp to -1 to 1
    return Math.max(-1, Math.min(1, score))
  }

  /**
   * Extract keywords from title
   */
  private extractKeywords(title: string): string[] {
    const lower = title.toLowerCase()
    const keywords: string[] = []

    // Token mentions
    const tokens = ['btc', 'bitcoin', 'eth', 'ethereum', 'sol', 'solana', 'usdt', 'usdc']
    tokens.forEach(token => {
      if (lower.includes(token)) keywords.push(token.toUpperCase())
    })

    // Event types
    if (lower.includes('listing') || lower.includes('launch')) keywords.push('LISTING')
    if (lower.includes('partnership') || lower.includes('collaboration')) keywords.push('PARTNERSHIP')
    if (lower.includes('upgrade') || lower.includes('update')) keywords.push('UPGRADE')
    if (lower.includes('regulation') || lower.includes('regulatory')) keywords.push('REGULATION')
    if (lower.includes('hack') || lower.includes('exploit')) keywords.push('SECURITY')

    return keywords
  }

  /**
   * Assess impact level
   */
  private assessImpact(title: string, sentimentScore: number): 'high' | 'medium' | 'low' {
    const lower = title.toLowerCase()
    let impactScore = Math.abs(sentimentScore)

    // High impact indicators
    if (lower.includes('major') || lower.includes('massive') || lower.includes('huge')) {
      impactScore += 0.3
    }
    if (lower.includes('breakthrough') || lower.includes('record') || lower.includes('first')) {
      impactScore += 0.2
    }
    if (lower.includes('crash') || lower.includes('exploit') || lower.includes('hack')) {
      impactScore += 0.4
    }

    if (impactScore >= 0.6) return 'high'
    if (impactScore >= 0.3) return 'medium'
    return 'low'
  }

  /**
   * Determine opportunity type
   */
  private determineOpportunityType(
    title: string,
    sentimentScore: number
  ): 'breakout' | 'reversal' | 'momentum' | 'defensive' | 'arbitrage' | undefined {
    const lower = title.toLowerCase()

    if (lower.includes('breakout') || lower.includes('surge') || lower.includes('rally')) {
      return 'breakout'
    }
    if (lower.includes('reversal') || lower.includes('bounce') || lower.includes('recover')) {
      return 'reversal'
    }
    if (lower.includes('momentum') || lower.includes('trend') || lower.includes('continuation')) {
      return 'momentum'
    }
    if (lower.includes('crash') || lower.includes('dump') || lower.includes('panic')) {
      return 'defensive'
    }
    if (lower.includes('arbitrage') || lower.includes('spread') || lower.includes('price difference')) {
      return 'arbitrage'
    }

    // Default based on sentiment
    if (sentimentScore > 0.5) return 'momentum'
    if (sentimentScore < -0.5) return 'defensive'

    return undefined
  }

  /**
   * Match strategies to news article
   */
  private matchStrategiesToNews(
    title: string,
    sentiment: 'bullish' | 'bearish' | 'neutral',
    opportunityType?: 'breakout' | 'reversal' | 'momentum' | 'defensive' | 'arbitrage'
  ): string[] {
    const matched: string[] = []
    const lower = title.toLowerCase()

    // Strategy matching logic
    this.strategies.forEach(strategy => {
      let matchScore = 0

      // Match by category
      if (opportunityType === 'breakout' && strategy.category === 'Trend Following') {
        matchScore += 2
      }
      if (opportunityType === 'reversal' && strategy.category === 'Mean Reversion') {
        matchScore += 2
      }
      if (opportunityType === 'momentum' && strategy.category === 'Trend Following') {
        matchScore += 2
      }
      if (opportunityType === 'defensive' && strategy.category === 'Mean Reversion') {
        matchScore += 2
      }
      if (opportunityType === 'arbitrage' && strategy.category === 'Arbitrage') {
        matchScore += 3
      }

      // Match by sentiment
      if (sentiment === 'bullish' && strategy.name.toLowerCase().includes('momentum')) {
        matchScore += 1
      }
      if (sentiment === 'bearish' && strategy.name.toLowerCase().includes('defensive')) {
        matchScore += 1
      }

      // Match by keywords in strategy name
      if (lower.includes('volume') && strategy.name.toLowerCase().includes('volume')) {
        matchScore += 1
      }
      if (lower.includes('sentiment') && strategy.name.toLowerCase().includes('sentiment')) {
        matchScore += 2
      }
      if (lower.includes('news') && strategy.name.toLowerCase().includes('news')) {
        matchScore += 2
      }

      // High match score = strategy matches
      if (matchScore >= 2) {
        matched.push(strategy.id)
      }
    })

    return matched
  }

  /**
   * Generate trading opportunity from news
   */
  generateOpportunity(article: NewsArticle): NewsOpportunity | null {
    // Only generate opportunities for high/medium impact news
    if (article.impact === 'low') return null

    // Calculate confidence
    let confidence = Math.abs(article.sentimentScore)
    if (article.impact === 'high') confidence += 0.2
    if (article.matchedStrategies.length > 0) confidence += 0.1
    confidence = Math.min(1, confidence)

    // Determine recommended action
    let recommendedAction: 'BUY' | 'SELL' | 'HOLD' | 'MONITOR' = 'MONITOR'
    if (article.sentiment === 'bullish' && confidence > 0.6) {
      recommendedAction = 'BUY'
    } else if (article.sentiment === 'bearish' && confidence > 0.6) {
      recommendedAction = 'SELL'
    } else if (confidence > 0.4) {
      recommendedAction = 'HOLD'
    }

    // Determine urgency
    let urgency: 'immediate' | 'short-term' | 'medium-term' = 'medium-term'
    if (article.impact === 'high' && article.sentimentScore > 0.5) {
      urgency = 'immediate'
    } else if (article.impact === 'high' || article.sentimentScore > 0.3) {
      urgency = 'short-term'
    }

    // Get matched strategies
    const matchedStrategies = this.strategies.filter(s => 
      article.matchedStrategies.includes(s.id)
    )

    // Generate reasoning
    const reasoning = this.generateReasoning(article, confidence, matchedStrategies)

    const opportunity: NewsOpportunity = {
      article,
      confidence,
      expectedImpact: article.impact,
      recommendedAction,
      matchedStrategies,
      urgency,
      reasoning,
    }

    // Store in history
    this.opportunityHistory.push(opportunity)
    if (this.opportunityHistory.length > 100) {
      this.opportunityHistory.shift()
    }

    return opportunity
  }

  /**
   * Generate reasoning for opportunity
   */
  private generateReasoning(
    article: NewsArticle,
    confidence: number,
    strategies: StrategyData[]
  ): string {
    const parts: string[] = []

    parts.push(`${article.sentiment.toUpperCase()} sentiment detected (${(article.sentimentScore * 100).toFixed(0)}%)`)
    parts.push(`${article.impact.toUpperCase()} impact news`)
    
    if (article.opportunityType) {
      parts.push(`Opportunity type: ${article.opportunityType}`)
    }

    if (strategies.length > 0) {
      parts.push(`Matched ${strategies.length} strategy/strategies: ${strategies.map(s => s.name).join(', ')}`)
    }

    parts.push(`Confidence: ${(confidence * 100).toFixed(0)}%`)

    return parts.join(' | ')
  }

  /**
   * Get recent opportunities
   */
  getRecentOpportunities(limit: number = 10): NewsOpportunity[] {
    return this.opportunityHistory
      .slice(-limit)
      .sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Get opportunities by urgency
   */
  getOpportunitiesByUrgency(urgency: 'immediate' | 'short-term' | 'medium-term'): NewsOpportunity[] {
    return this.opportunityHistory.filter(o => o.urgency === urgency)
  }

  /**
   * Get best strategy for current news
   */
  getBestStrategyForNews(article: NewsArticle): StrategyData | null {
    if (article.matchedStrategies.length === 0) return null

    // Get matched strategies
    const matched = this.strategies.filter(s => 
      article.matchedStrategies.includes(s.id)
    )

    if (matched.length === 0) return null

    // Return highest win rate strategy
    return matched.sort((a, b) => {
      const aWinRate = parseFloat(a.win_rate.replace('%', '')) || 0
      const bWinRate = parseFloat(b.win_rate.replace('%', '')) || 0
      return bWinRate - aWinRate
    })[0]
  }
}

/**
 * Hook for news intelligence
 */
export function useNewsIntelligence(userTier: string = 'free') {
  const [engine] = useState(() => new NewsIntelligenceEngine(userTier))
  const [opportunities, setOpportunities] = useState<NewsOpportunity[]>([])

  const analyzeNews = useCallback((articles: any[]) => {
    const newOpportunities: NewsOpportunity[] = []

    articles.forEach(article => {
      const analyzed = engine.analyzeNewsArticle(article)
      const opportunity = engine.generateOpportunity(analyzed)
      
      if (opportunity && opportunity.confidence > 0.5) {
        newOpportunities.push(opportunity)
      }
    })

    setOpportunities(prev => [...newOpportunities, ...prev].slice(0, 50))
    return newOpportunities
  }, [engine])

  const getBestStrategy = useCallback((article: NewsArticle) => {
    return engine.getBestStrategyForNews(article)
  }, [engine])

  return {
    engine,
    opportunities,
    analyzeNews,
    getBestStrategy,
    getRecentOpportunities: () => engine.getRecentOpportunities(10),
  }
}

import { useState, useCallback } from 'react'

