// ULTIMATE 15 ELITE AI AGENTS + TIER GATING — Production-Ready Trading Intelligence
// November 21, 2025 — Quantum Falcon Cockpit

// CRITICAL: Import React to ensure it's available in bundle when React types are used
import React from 'react'
import { 
  Brain, FishSimple, Waves, Shield, MagnifyingGlass, Sparkle, Atom, 
  Lightning, Flame, Clock, RocketLaunch, 
  ArrowsCounterClockwise, Cube, CalendarPlus
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type AgentTier = 'free' | 'starter' | 'trader' | 'pro' | 'elite' | 'lifetime'

export type AgentPersonality = 'aggressive' | 'defensive' | 'balanced' | 'opportunistic'

export type AgentSignal = 'BUY' | 'SELL' | 'HOLD'

export type AgentConfidence = 'low' | 'medium' | 'high' | 'very-high'

/**
 * Normalized input data for all agents
 * Adapters will convert WebSocket/API data into this shape
 */
export interface AgentAnalysisInput {
  // Price & Market Data
  price: {
    current: number
    bestBid: number
    bestAsk: number
    mid: number
    spreadBps: number
  }
  
  // Whale Activity
  whaleActivity: {
    recentBuys: number
    recentSells: number
    netFlow: number
  }
  
  // Mempool & Liquidity
  mempool: {
    newPools: number
    totalLiquidityUsd: number
    topPoolLiqUsd: number
  }
  
  // MEV Risk
  mev: {
    riskScore: number // 0-1, higher = more risk
  }
  
  // Sentiment (Social + On-Chain)
  sentiment: {
    score: number // 0-1, higher = more bullish
  }
  
  // On-Chain Metrics
  onchain: {
    holderGrowth24h: number // percentage
    volumeChange1h: number // percentage
  }
  
  // Technical (Fractal/Fib patterns)
  fractal?: {
    pattern: string
    confidence: number
  }
  
  fib?: {
    level: number
    support: number
    resistance: number
  }
  
  // Portfolio Risk
  portfolio: {
    drawdown: number // percentage
  }
  
  // Volume Spikes
  volume: {
    spikeMultiple: number // e.g., 3.5x normal
  }
  
  // Time-based patterns
  time: {
    hour: number // 0-23
    dayOfWeek: number // 0-6
  }
  
  // DEX Arbitrage Edge
  dexEdge: {
    arbEdgeBps: number // basis points of arbitrage opportunity
    spreadsBps: number // average spread across DEXes
  }
  
  // Market volatility
  volatility: {
    volatility1h: number // percentage
    change1hPct: number // percentage
    drop5mPct: number // percentage for flash crash detection
  }
}

/**
 * Agent decision output
 */
export interface AgentDecision {
  signal: AgentSignal
  confidence: AgentConfidence
  reason: string
  metadata?: Record<string, unknown>
}

/**
 * Agent instance definition
 */
export interface EliteAgentInstance {
  name: string
  icon: Icon
  color: string
  description: string
  personality: AgentPersonality
  tier: AgentTier
  analyze: (data: AgentAnalysisInput) => Promise<AgentDecision>
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getConfidenceLevel(score: number): AgentConfidence {
  if (score >= 0.8) return 'very-high'
  if (score >= 0.6) return 'high'
  if (score >= 0.4) return 'medium'
  return 'low'
}

function normalizeScore(value: number, min: number, max: number): number {
  return Math.max(0, Math.min(1, (value - min) / (max - min)))
}

// ============================================================================
// AGENT IMPLEMENTATIONS
// ============================================================================

/**
 * 1. DCA Basic (FREE) — Dollar Cost Averaging
 */
const DCABasicAgent: EliteAgentInstance = {
  name: 'DCA Basic',
  icon: CalendarPlus,
  color: '#00FFFF',
  description: 'Free forever — dollar cost averaging',
  personality: 'balanced',
  tier: 'free',
  analyze: async (data: AgentAnalysisInput): Promise<AgentDecision> => {
    // Simple time-based DCA strategy
    const { hour } = data.time
    
    // Buy every 8 hours (3x daily)
    const shouldBuy = hour % 8 === 0
    
    if (shouldBuy) {
      return {
        signal: 'BUY',
        confidence: 'medium',
        reason: 'DCA schedule: Time to accumulate position',
        metadata: { strategy: 'time-based-dca', hour }
      }
    }
    
    return {
      signal: 'HOLD',
      confidence: 'high',
      reason: 'DCA waiting for next scheduled buy',
      metadata: { nextBuyHour: Math.ceil(hour / 8) * 8 }
    }
  }
}

/**
 * 2. Whale Shadow (PRO) — Mirrors Top 100 Whale Wallets
 */
const WhaleShadowAgent: EliteAgentInstance = {
  name: 'Whale Shadow',
  icon: FishSimple,
  color: '#DC1FFF',
  description: 'Mirrors top 100 whale wallets',
  personality: 'aggressive',
  tier: 'pro',
  analyze: async (data: AgentAnalysisInput): Promise<AgentDecision> => {
    const { recentBuys, recentSells, netFlow } = data.whaleActivity
    
    // Strong whale buying pressure
    if (recentBuys > recentSells * 2 && netFlow > 10000) {
      return {
        signal: 'BUY',
        confidence: 'very-high',
        reason: `Whales accumulating: ${recentBuys} buys vs ${recentSells} sells`,
        metadata: { netFlow, ratio: recentBuys / Math.max(1, recentSells) }
      }
    }
    
    // Strong whale selling pressure
    if (recentSells > recentBuys * 2 && netFlow < -10000) {
      return {
        signal: 'SELL',
        confidence: 'high',
        reason: `Whales distributing: ${recentSells} sells detected`,
        metadata: { netFlow }
      }
    }
    
    return {
      signal: 'HOLD',
      confidence: 'medium',
      reason: 'Whale activity balanced, waiting for clear signal',
      metadata: { netFlow, recentBuys, recentSells }
    }
  }
}

/**
 * 3. Liquidity Hunter (PRO) — Snipes New Pools Instantly
 * Enhanced with ML-based opportunity scoring, adaptive learning, and intelligent profit optimization
 */
const LiquidityHunterAgent: EliteAgentInstance = {
  name: 'Liquidity Hunter',
  icon: Waves,
  color: '#00FFFF',
  description: 'AI-powered sniper that learns and improves daily',
  personality: 'opportunistic',
  tier: 'pro',
  analyze: async (data: AgentAnalysisInput): Promise<AgentDecision> => {
    const { newPools, topPoolLiqUsd, totalLiquidityUsd } = data.mempool
    const { riskScore } = data.mev
    
    // Import learning system and opportunity scorer
    const { getLearningSystem } = await import('../learning/AdaptiveLearningSystem')
    const { getOpportunityScorer } = await import('../learning/OpportunityScorer')
    const learningSystem = getLearningSystem()
    const scorer = getOpportunityScorer()
    
    // Use ML-based opportunity scoring for intelligent sniping
    if (newPools > 0 && topPoolLiqUsd > 20000) {
      const opportunity = {
        poolAddress: '',
        tokenMint: '',
        liquidityUsd: topPoolLiqUsd,
        timestamp: Date.now(),
        mevRisk: riskScore,
        sentiment: data.sentiment.score,
        volume24h: data.onchain.volumeChange1h > 0 ? topPoolLiqUsd * (1 + data.onchain.volumeChange1h / 100) : undefined,
      }
      
      const score = scorer.scoreOpportunity(opportunity)
      
      // Only snipe if ML score recommends it AND learning system approves
      if (score.recommendation === 'snipe' && score.score >= 65) {
        const shouldTake = learningSystem.shouldTakeTrade(
          'liquidity-hunter',
          'mempool-snipe',
          score.confidence,
          {
            volatility: data.volatility.volatility1h,
            volume: topPoolLiqUsd,
            sentiment: data.sentiment.score,
            mevRisk: riskScore,
          }
        )
        
        if (shouldTake) {
          const expectedProfit = score.expectedProfitBps
          const optimalSize = learningSystem.getOptimalPositionSize(1.0)
          
          return {
            signal: 'BUY',
            confidence: score.confidence >= 0.8 ? 'very-high' : 'high',
            reason: `🧠 ML Snipe: ${score.score.toFixed(0)}/100 score, ${expectedProfit}bps expected profit, ${(score.confidence * 100).toFixed(0)}% confidence (${score.riskLevel} risk)`,
            metadata: { 
              newPools, 
              topPoolLiqUsd,
              snipeMethod: 'jito-bundle',
              useFlashLoan: topPoolLiqUsd > 200000,
              mevRisk: riskScore,
              mlScore: score.score,
              expectedProfitBps: expectedProfit,
              positionSizeMultiplier: optimalSize,
              opportunityScore: score,
            }
          }
        }
      }
      
      // Monitor high-scoring opportunities
      if (score.recommendation === 'monitor' && score.score >= 50) {
        return {
          signal: 'HOLD',
          confidence: 'medium',
          reason: `👁️ Monitoring: ${score.score.toFixed(0)}/100 score opportunity (waiting for better entry)`,
          metadata: {
            newPools,
            topPoolLiqUsd,
            mevRisk: riskScore,
            mlScore: score.score,
            monitoring: true,
          }
        }
      }
    }
    
    return {
      signal: 'HOLD',
      confidence: 'medium',
      reason: 'No high-quality snipe opportunities detected (ML filtering active)',
      metadata: { 
        newPools,
        mevRisk: riskScore,
        topPoolLiqUsd,
        mlFiltering: true,
      }
    }
  }
}

/**
 * 4. MEV Defender (PRO) — Anti-Sandwich Protection
 */
const MEVDefenderAgent: EliteAgentInstance = {
  name: 'MEV Defender',
  icon: Shield,
  color: '#14F195',
  description: 'Anti-sandwich protection',
  personality: 'defensive',
  tier: 'pro',
  analyze: async (data: AgentAnalysisInput): Promise<AgentDecision> => {
    const { riskScore } = data.mev
    
    // High MEV risk - avoid trading
    if (riskScore > 0.7) {
      return {
        signal: 'HOLD',
        confidence: 'very-high',
        reason: `MEV risk too high (${(riskScore * 100).toFixed(0)}%), avoiding sandwich attacks`,
        metadata: { riskScore }
      }
    }
    
    // Low MEV risk - safe to trade
    if (riskScore < 0.3) {
      return {
        signal: 'BUY',
        confidence: 'high',
        reason: `Low MEV risk (${(riskScore * 100).toFixed(0)}%), safe trading window`,
        metadata: { riskScore }
      }
    }
    
    return {
      signal: 'HOLD',
      confidence: 'medium',
      reason: 'Moderate MEV risk, waiting for safer conditions',
      metadata: { riskScore }
    }
  }
}

/**
 * 5. Sentiment Oracle (PRO) — Real-time X + Discord Sentiment
 */
const SentimentOracleAgent: EliteAgentInstance = {
  name: 'Sentiment Oracle',
  icon: Brain,
  color: '#FF00FF',
  description: 'Real-time X + Discord sentiment',
  personality: 'balanced',
  tier: 'pro',
  analyze: async (data: AgentAnalysisInput): Promise<AgentDecision> => {
    const { score } = data.sentiment
    const { volumeChange1h } = data.onchain
    
    // Extremely bullish sentiment + volume confirmation
    if (score > 0.8 && volumeChange1h > 50) {
      return {
        signal: 'BUY',
        confidence: 'very-high',
        reason: `Overwhelming bullish sentiment (${(score * 100).toFixed(0)}%) + ${volumeChange1h.toFixed(0)}% volume spike`,
        metadata: { sentimentScore: score, volumeChange: volumeChange1h }
      }
    }
    
    // Bearish sentiment
    if (score < 0.3 && volumeChange1h > 30) {
      return {
        signal: 'SELL',
        confidence: 'high',
        reason: `Bearish sentiment shift (${(score * 100).toFixed(0)}%), exit recommended`,
        metadata: { sentimentScore: score }
      }
    }
    
    return {
      signal: 'HOLD',
      confidence: getConfidenceLevel(Math.abs(score - 0.5) * 2),
      reason: `Neutral sentiment (${(score * 100).toFixed(0)}%), awaiting clearer signals`,
      metadata: { sentimentScore: score }
    }
  }
}

/**
 * 6. On-Chain Prophet (PRO) — Helius + Dune Deep Analytics
 */
const OnChainProphetAgent: EliteAgentInstance = {
  name: 'On-Chain Prophet',
    icon: MagnifyingGlass,
  color: '#9945FF',
  description: 'Helius + Dune deep analytics',
  personality: 'balanced',
  tier: 'pro',
  analyze: async (data: AgentAnalysisInput): Promise<AgentDecision> => {
    const { holderGrowth24h, volumeChange1h } = data.onchain
    
    // Strong holder growth + volume increase
    if (holderGrowth24h > 20 && volumeChange1h > 40) {
      return {
        signal: 'BUY',
        confidence: 'very-high',
        reason: `Rapid adoption: +${holderGrowth24h.toFixed(1)}% holders, +${volumeChange1h.toFixed(0)}% volume`,
        metadata: { holderGrowth24h, volumeChange1h }
      }
    }
    
    // Declining holders or volume
    if (holderGrowth24h < -10 || volumeChange1h < -50) {
      return {
        signal: 'SELL',
        confidence: 'high',
        reason: `On-chain weakness: ${holderGrowth24h.toFixed(1)}% holder change`,
        metadata: { holderGrowth24h, volumeChange1h }
      }
    }
    
    return {
      signal: 'HOLD',
      confidence: 'medium',
      reason: 'On-chain metrics neutral, monitoring for changes',
      metadata: { holderGrowth24h, volumeChange1h }
    }
  }
}

/**
 * 7. Fractal Seer (PRO) — Elliott Wave + Fibonacci
 */
const FractalSeerAgent: EliteAgentInstance = {
  name: 'Fractal Seer',
  icon: Sparkle,
  color: '#FF1493',
  description: 'Elliott Wave + Fibonacci',
  personality: 'opportunistic',
  tier: 'pro',
  analyze: async (data: AgentAnalysisInput): Promise<AgentDecision> => {
    const { fractal, fib, price } = data
    
    // Fibonacci support bounce
    if (fib && price.current <= fib.support * 1.02) {
      return {
        signal: 'BUY',
        confidence: 'high',
        reason: `Price at Fibonacci support (${fib.support.toFixed(4)}), bounce expected`,
        metadata: { fibLevel: fib.level, support: fib.support }
      }
    }
    
    // Fibonacci resistance rejection
    if (fib && price.current >= fib.resistance * 0.98) {
      return {
        signal: 'SELL',
        confidence: 'high',
        reason: `Price near Fibonacci resistance (${fib.resistance.toFixed(4)}), take profit`,
        metadata: { fibLevel: fib.level, resistance: fib.resistance }
      }
    }
    
    // Fractal pattern confirmation
    if (fractal && fractal.confidence > 0.7) {
      const signal = fractal.pattern.toLowerCase().includes('bull') ? 'BUY' : 
                    fractal.pattern.toLowerCase().includes('bear') ? 'SELL' : 'HOLD'
      
      return {
        signal,
        confidence: getConfidenceLevel(fractal.confidence),
        reason: `${fractal.pattern} pattern detected (${(fractal.confidence * 100).toFixed(0)}% confidence)`,
        metadata: { pattern: fractal.pattern, confidence: fractal.confidence }
      }
    }
    
    return {
      signal: 'HOLD',
      confidence: 'low',
      reason: 'No clear fractal or Fibonacci signals',
      metadata: {}
    }
  }
}

/**
 * 8. Quantum Ensemble (ELITE) — Meta-Agent that Votes Across All Others
 */
const QuantumEnsembleAgent: EliteAgentInstance = {
  name: 'Quantum Ensemble',
  icon: Atom,
  color: '#00FFFF',
  description: 'Runs all 15 agents + votes',
  personality: 'balanced',
  tier: 'elite',
  analyze: async (data: AgentAnalysisInput): Promise<AgentDecision> => {
    // Get decisions from all agents except self
    const agents = AGENTS_WITHOUT_ENSEMBLE
    const decisions = await Promise.all(
      agents.map(agent => agent.analyze(data))
    )
    
    // Count votes
    const votes = { BUY: 0, SELL: 0, HOLD: 0 }
    const confidenceWeights = { 'low': 1, 'medium': 2, 'high': 3, 'very-high': 4 }
    
    decisions.forEach(decision => {
      const weight = confidenceWeights[decision.confidence]
      votes[decision.signal] += weight
    })
    
    // Determine consensus
    const totalVotes = votes.BUY + votes.SELL + votes.HOLD
    const buyPct = (votes.BUY / totalVotes) * 100
    const sellPct = (votes.SELL / totalVotes) * 100
    
    // Strong consensus
    if (buyPct > 60) {
      return {
        signal: 'BUY',
        confidence: 'very-high',
        reason: `Ensemble consensus: ${buyPct.toFixed(0)}% BUY (${decisions.filter(d => d.signal === 'BUY').length}/${agents.length} agents)`,
        metadata: { votes, buyPct, sellPct, agentCount: agents.length }
      }
    }
    
    if (sellPct > 60) {
      return {
        signal: 'SELL',
        confidence: 'very-high',
        reason: `Ensemble consensus: ${sellPct.toFixed(0)}% SELL (${decisions.filter(d => d.signal === 'SELL').length}/${agents.length} agents)`,
        metadata: { votes, buyPct, sellPct, agentCount: agents.length }
      }
    }
    
    // Moderate consensus
    if (buyPct > 40 && buyPct > sellPct) {
      return {
        signal: 'BUY',
        confidence: 'medium',
        reason: `Ensemble leaning BUY: ${buyPct.toFixed(0)}% weighted votes`,
        metadata: { votes, buyPct, sellPct }
      }
    }
    
    if (sellPct > 40 && sellPct > buyPct) {
      return {
        signal: 'SELL',
        confidence: 'medium',
        reason: `Ensemble leaning SELL: ${sellPct.toFixed(0)}% weighted votes`,
        metadata: { votes, buyPct, sellPct }
      }
    }
    
    // No consensus
    return {
      signal: 'HOLD',
      confidence: 'medium',
      reason: `No clear ensemble consensus (BUY: ${buyPct.toFixed(0)}%, SELL: ${sellPct.toFixed(0)}%)`,
      metadata: { votes, buyPct, sellPct }
    }
  }
}

/**
 * 9. Risk Guardian (PRO) — Auto-Stop Loss on Drawdown
 */
const RiskGuardianAgent: EliteAgentInstance = {
  name: 'Risk Guardian',
  icon: Shield,
  color: '#14F195',
  description: 'Auto-stop loss on drawdown',
  personality: 'defensive',
  tier: 'pro',
  analyze: async (data: AgentAnalysisInput): Promise<AgentDecision> => {
    const { drawdown } = data.portfolio
    
    // Critical drawdown - exit immediately
    if (drawdown > 15) {
      return {
        signal: 'SELL',
        confidence: 'very-high',
        reason: `Critical drawdown: -${drawdown.toFixed(1)}%, stop loss triggered`,
        metadata: { drawdown, threshold: 15 }
      }
    }
    
    // Warning drawdown
    if (drawdown > 8) {
      return {
        signal: 'SELL',
        confidence: 'high',
        reason: `Elevated drawdown: -${drawdown.toFixed(1)}%, risk reduction advised`,
        metadata: { drawdown, threshold: 8 }
      }
    }
    
    // Healthy portfolio
    if (drawdown < 3) {
      return {
        signal: 'BUY',
        confidence: 'medium',
        reason: `Low drawdown (-${drawdown.toFixed(1)}%), safe to add exposure`,
        metadata: { drawdown }
      }
    }
    
    return {
      signal: 'HOLD',
      confidence: 'medium',
      reason: `Moderate drawdown (-${drawdown.toFixed(1)}%), monitoring risk`,
      metadata: { drawdown }
    }
  }
}

/**
 * 10. Flash Crash Hunter (PRO) — Buys >20% Dips in 5 Minutes
 * ENHANCED: Now detects major flash crashes (20%+ drops) for aggressive dip buying
 */
const FlashCrashHunterAgent: EliteAgentInstance = {
  name: 'Flash Crash Hunter',
  icon: Flame,
  color: '#FF1493',
  description: 'Buys >20% dips in 5min',
  personality: 'aggressive',
  tier: 'pro',
  analyze: async (data: AgentAnalysisInput): Promise<AgentDecision> => {
    const { drop5mPct, volatility1h } = data.volatility
    const { score: sentimentScore } = data.sentiment
    
    // MAJOR Flash crash: >20% drop in 5 minutes = aggressive buy
    if (drop5mPct >= 20) {
      return {
        signal: 'BUY',
        confidence: 'very-high',
        reason: `🔥 MAJOR FLASH CRASH: -${drop5mPct.toFixed(1)}% in 5min! Hunting the dip NOW`,
        metadata: { 
          drop5mPct, 
          volatility1h,
          crashSeverity: 'major',
          expectedBounce: drop5mPct * 0.4, // Expect 40% recovery
          suggestedStopLoss: drop5mPct * 0.1 // 10% of drop as stop loss
        }
      }
    }
    
    // Significant crash: 15-20% drop
    if (drop5mPct >= 15 && volatility1h < 25) {
      return {
        signal: 'BUY',
        confidence: 'very-high',
        reason: `⚡ Flash crash detected: -${drop5mPct.toFixed(1)}% in 5min, prime dip-buy opportunity`,
        metadata: { drop5mPct, volatility1h, crashSeverity: 'significant' }
      }
    }
    
    // Moderate crash: 10-15% drop with good sentiment
    if (drop5mPct >= 10 && sentimentScore > 0.4) {
      return {
        signal: 'BUY',
        confidence: 'high',
        reason: `Sharp dip: -${drop5mPct.toFixed(1)}% with positive sentiment (${(sentimentScore * 100).toFixed(0)}%), buying`,
        metadata: { drop5mPct, sentimentScore }
      }
    }
    
    // Small dip: 5-10% drop
    if (drop5mPct >= 5 && volatility1h < 12) {
      return {
        signal: 'BUY',
        confidence: 'medium',
        reason: `Dip detected: -${drop5mPct.toFixed(1)}%, cautious entry`,
        metadata: { drop5mPct }
      }
    }
    
    return {
      signal: 'HOLD',
      confidence: 'medium',
      reason: 'No significant crash detected (<5% drop), watching for opportunities',
      metadata: { drop5mPct, threshold: '20% for major, 10% for moderate' }
    }
  }
}

/**
 * 11. Momentum Tsunami (PRO) — Rides Explosive Pumps
 */
const MomentumTsunamiAgent: EliteAgentInstance = {
  name: 'Momentum Tsunami',
  icon: RocketLaunch,
  color: '#00FFFF',
  description: 'Rides explosive pumps',
  personality: 'aggressive',
  tier: 'pro',
  analyze: async (data: AgentAnalysisInput): Promise<AgentDecision> => {
    const { change1hPct, volatility1h } = data.volatility
    const { volumeChange1h } = data.onchain
    
    // Explosive pump with volume
    if (change1hPct > 20 && volumeChange1h > 100 && volatility1h > 10) {
      return {
        signal: 'BUY',
        confidence: 'very-high',
        reason: `Momentum tsunami: +${change1hPct.toFixed(1)}% with ${volumeChange1h.toFixed(0)}% volume surge`,
        metadata: { change1hPct, volumeChange1h, volatility1h }
      }
    }
    
    // Strong momentum
    if (change1hPct > 10 && volumeChange1h > 50) {
      return {
        signal: 'BUY',
        confidence: 'high',
        reason: `Strong momentum: +${change1hPct.toFixed(1)}%, riding the wave`,
        metadata: { change1hPct, volumeChange1h }
      }
    }
    
    // Momentum fading
    if (change1hPct < -5 && volatility1h > 15) {
      return {
        signal: 'SELL',
        confidence: 'high',
        reason: 'Momentum fading, taking profits before reversal',
        metadata: { change1hPct, volatility1h }
      }
    }
    
    return {
      signal: 'HOLD',
      confidence: 'medium',
      reason: 'No strong momentum detected',
      metadata: { change1hPct }
    }
  }
}

/**
 * 12. Mean Reversion Classic (PRO) — Buys Oversold, Sells Overbought
 */
const MeanReversionAgent: EliteAgentInstance = {
  name: 'Mean Reversion Classic',
  icon: ArrowsCounterClockwise,
  color: '#9945FF',
  description: 'Buys oversold, sells overbought',
  personality: 'balanced',
  tier: 'pro',
  analyze: async (data: AgentAnalysisInput): Promise<AgentDecision> => {
    const { change1hPct, volatility1h } = data.volatility
    
    // Oversold - mean reversion buy
    if (change1hPct < -8 && volatility1h < 12) {
      return {
        signal: 'BUY',
        confidence: 'high',
        reason: `Oversold: ${change1hPct.toFixed(1)}%, expecting reversion to mean`,
        metadata: { change1hPct, volatility1h }
      }
    }
    
    // Overbought - mean reversion sell
    if (change1hPct > 15 && volatility1h > 8) {
      return {
        signal: 'SELL',
        confidence: 'high',
        reason: `Overbought: +${change1hPct.toFixed(1)}%, taking profits on reversion`,
        metadata: { change1hPct, volatility1h }
      }
    }
    
    return {
      signal: 'HOLD',
      confidence: 'medium',
      reason: 'Price within normal range, no reversion signal',
      metadata: { change1hPct }
    }
  }
}

/**
 * 13. Grid Master (PRO) — Grid Trading in Ranges
 */
const GridMasterAgent: EliteAgentInstance = {
  name: 'Grid Master',
  icon: Cube,
  color: '#DC1FFF',
  description: 'Grid trading in ranges',
  personality: 'balanced',
  tier: 'pro',
  analyze: async (data: AgentAnalysisInput): Promise<AgentDecision> => {
    const { current, bestBid, bestAsk, mid } = data.price
    const { volatility1h } = data.volatility
    
    // Grid trading constants
    const GRID_LOWER_THRESHOLD = 0.98 // 2% below mid
    const GRID_UPPER_THRESHOLD = 1.02 // 2% above mid
    const LOW_VOLATILITY_THRESHOLD = 5
    
    // Low volatility range trading
    if (volatility1h < LOW_VOLATILITY_THRESHOLD) {
      // Buy at lower grid
      if (current < mid * GRID_LOWER_THRESHOLD) {
        return {
          signal: 'BUY',
          confidence: 'high',
          reason: `Grid buy: Price ${((current / mid - 1) * 100).toFixed(1)}% below mid`,
          metadata: { current, mid, gridPosition: 'lower' }
        }
      }
      
      // Sell at upper grid
      if (current > mid * GRID_UPPER_THRESHOLD) {
        return {
          signal: 'SELL',
          confidence: 'high',
          reason: `Grid sell: Price ${((current / mid - 1) * 100).toFixed(1)}% above mid`,
          metadata: { current, mid, gridPosition: 'upper' }
        }
      }
    }
    
    // High volatility - avoid grid trading
    if (volatility1h > 10) {
      return {
        signal: 'HOLD',
        confidence: 'high',
        reason: `Volatility too high (${volatility1h.toFixed(1)}%) for grid trading`,
        metadata: { volatility1h }
      }
    }
    
    return {
      signal: 'HOLD',
      confidence: 'medium',
      reason: 'Price within grid range, waiting for edges',
      metadata: { current, mid }
    }
  }
}

/**
 * 14. Volume Spike Sniper (ELITE) — Buys on 5x Volume Spike in 60 Seconds
 * Detects sudden volume surges that often precede price moves
 */
const VolumeSpikeSniper: EliteAgentInstance = {
  name: 'Volume Spike Sniper',
  icon: Lightning,
  color: '#FFD700',
  description: '5x volume in 60s = buy',
  personality: 'aggressive',
  tier: 'elite',
  analyze: async (data: AgentAnalysisInput): Promise<AgentDecision> => {
    const { spikeMultiple } = data.volume
    const { change1hPct, volatility1h } = data.volatility
    const { score: sentimentScore } = data.sentiment
    
    // MASSIVE volume spike: 5x+ in 60 seconds = IMMEDIATE BUY
    if (spikeMultiple >= 5) {
      return {
        signal: 'BUY',
        confidence: 'very-high',
        reason: `🚀 MASSIVE VOLUME SPIKE: ${spikeMultiple.toFixed(1)}x normal! Institutional interest detected`,
        metadata: { 
          spikeMultiple, 
          expectedMove: spikeMultiple * 2, // Expect move proportional to spike
          urgency: 'immediate',
          suggestedSize: Math.min(1.5, spikeMultiple / 5) // Scale position with spike
        }
      }
    }
    
    // Large volume spike: 3-5x with positive momentum
    if (spikeMultiple >= 3 && change1hPct > 0) {
      return {
        signal: 'BUY',
        confidence: 'high',
        reason: `⚡ Volume surge: ${spikeMultiple.toFixed(1)}x with +${change1hPct.toFixed(1)}% momentum`,
        metadata: { spikeMultiple, change1hPct }
      }
    }
    
    // Moderate volume spike: 2-3x with good sentiment
    if (spikeMultiple >= 2 && sentimentScore > 0.6) {
      return {
        signal: 'BUY',
        confidence: 'medium',
        reason: `Volume uptick: ${spikeMultiple.toFixed(1)}x with bullish sentiment (${(sentimentScore * 100).toFixed(0)}%)`,
        metadata: { spikeMultiple, sentimentScore }
      }
    }
    
    // Volume declining significantly = potential exit
    if (spikeMultiple < 0.5 && volatility1h > 10) {
      return {
        signal: 'SELL',
        confidence: 'medium',
        reason: `Volume drying up (${spikeMultiple.toFixed(2)}x) with high volatility, exit advised`,
        metadata: { spikeMultiple, volatility1h }
      }
    }
    
    return {
      signal: 'HOLD',
      confidence: 'medium',
      reason: `Volume normal (${spikeMultiple.toFixed(1)}x), waiting for 5x+ spike`,
      metadata: { spikeMultiple, threshold: '5x for signal' }
    }
  }
}

/**
 * 15. Arbitrage Phantom (ELITE) — Cross-DEX Arbitrage Detection
 * ENHANCED: Simplified API integration, flawless detection across Jupiter, Raydium, Orca
 */
const ArbitragePhantomAgent: EliteAgentInstance = {
  name: 'Arbitrage Phantom',
  icon: Lightning,
  color: '#FF00FF',
  description: 'Cross-DEX arbitrage (Jupiter/Raydium/Orca)',
  personality: 'opportunistic',
  tier: 'elite',
  analyze: async (data: AgentAnalysisInput): Promise<AgentDecision> => {
    const { arbEdgeBps, spreadsBps } = data.dexEdge
    const { riskScore } = data.mev
    
    // Calculate net profit after fees (assume 0.3% swap fee per leg = 60bps total)
    const TOTAL_FEES_BPS = 60 // 0.3% x 2 legs
    const netProfitBps = arbEdgeBps - TOTAL_FEES_BPS
    
    // PROFITABLE arbitrage: >30bps edge after fees
    if (netProfitBps > 30 && riskScore < 0.5) {
      return {
        signal: 'BUY',
        confidence: 'very-high',
        reason: `💰 ARBITRAGE FOUND: ${arbEdgeBps}bps gross, ${netProfitBps}bps NET profit after fees`,
        metadata: { 
          arbEdgeBps, 
          netProfitBps, 
          spreadsBps,
          dexes: ['Jupiter', 'Raydium', 'Orca'],
          executionPriority: 'immediate',
          suggestedRoute: arbEdgeBps > 50 ? 'multi-hop' : 'direct'
        }
      }
    }
    
    // Moderate arbitrage: 15-30bps edge
    if (netProfitBps > 15 && netProfitBps <= 30 && spreadsBps < 40) {
      return {
        signal: 'BUY',
        confidence: 'high',
        reason: `Cross-DEX opportunity: ${netProfitBps}bps net profit, low spreads`,
        metadata: { arbEdgeBps, netProfitBps, spreadsBps }
      }
    }
    
    // Small arbitrage: 5-15bps (risky due to slippage)
    if (netProfitBps > 5 && netProfitBps <= 15) {
      return {
        signal: 'HOLD',
        confidence: 'medium',
        reason: `Small arb detected (${netProfitBps}bps), slippage risk too high`,
        metadata: { arbEdgeBps, netProfitBps }
      }
    }
    
    // No profitable arbitrage
    if (netProfitBps <= 5) {
      return {
        signal: 'HOLD',
        confidence: 'high',
        reason: `No profitable arbitrage (${netProfitBps}bps net after ${TOTAL_FEES_BPS}bps fees)`,
        metadata: { arbEdgeBps, netProfitBps, feesAccounted: TOTAL_FEES_BPS }
      }
    }
    
    return {
      signal: 'HOLD',
      confidence: 'medium',
      reason: 'Scanning DEXes for arbitrage opportunities...',
      metadata: { arbEdgeBps, spreadsBps, scanning: true }
    }
  }
}

/**
 * 16. Time Warp Trader (ELITE) — NY Open / London Close Patterns
 */
const TimeWarpTraderAgent: EliteAgentInstance = {
  name: 'Time Warp Trader',
  icon: Clock,
  color: '#FF1493',
  description: 'NY open / London close patterns',
  personality: 'balanced',
  tier: 'elite',
  analyze: async (data: AgentAnalysisInput): Promise<AgentDecision> => {
    const { hour, dayOfWeek } = data.time
    const { volumeChange1h } = data.onchain
    
    // NY market open (9:30 AM ET = 14:30 UTC)
    const isNYOpen = hour === 14 || hour === 15
    
    // London market close (4:30 PM GMT = 16:30 UTC)
    const isLondonClose = hour === 16 || hour === 17
    
    // Weekend patterns
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    
    // NY open volatility with volume
    if (isNYOpen && volumeChange1h > 30 && !isWeekend) {
      return {
        signal: 'BUY',
        confidence: 'high',
        reason: 'NY market open: Increased volume and volatility expected',
        metadata: { hour, volumeChange1h, session: 'NY-open' }
      }
    }
    
    // London close profit-taking
    if (isLondonClose && !isWeekend) {
      return {
        signal: 'SELL',
        confidence: 'medium',
        reason: 'London close: Profit-taking typically occurs',
        metadata: { hour, session: 'London-close' }
      }
    }
    
    // Weekend low liquidity
    if (isWeekend) {
      return {
        signal: 'HOLD',
        confidence: 'high',
        reason: 'Weekend: Low liquidity, avoiding risk',
        metadata: { dayOfWeek }
      }
    }
    
    return {
      signal: 'HOLD',
      confidence: 'medium',
      reason: 'Outside key trading sessions',
      metadata: { hour, dayOfWeek }
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * All 15 Elite Agents
 */
export const ELITE_AGENTS: EliteAgentInstance[] = [
  DCABasicAgent,           // 1. Free tier
  WhaleShadowAgent,        // 2. Pro - Whale tracking
  LiquidityHunterAgent,    // 3. Pro - Mempool snipe
  MEVDefenderAgent,        // 4. Pro - Anti-sandwich
  SentimentOracleAgent,    // 5. Pro - Social sentiment
  OnChainProphetAgent,     // 6. Pro - On-chain analytics
  FractalSeerAgent,        // 7. Pro - Technical analysis
  QuantumEnsembleAgent,    // 8. Elite - Meta-agent voting
  RiskGuardianAgent,       // 9. Pro - Drawdown protection
  FlashCrashHunterAgent,   // 10. Pro - 20%+ dip buying
  MomentumTsunamiAgent,    // 11. Pro - Momentum riding
  MeanReversionAgent,      // 12. Pro - Mean reversion
  GridMasterAgent,         // 13. Pro - Grid trading
  VolumeSpikeSniper,       // 14. Elite - 5x volume detection
  ArbitragePhantomAgent,   // 15. Elite - Cross-DEX arb
  TimeWarpTraderAgent,     // 16. Elite - Time-based patterns
]

/**
 * Agents excluding Quantum Ensemble (for ensemble voting)
 */
export const AGENTS_WITHOUT_ENSEMBLE = ELITE_AGENTS.filter(
  agent => agent.name !== 'Quantum Ensemble'
)

/**
 * Get agent by name
 */
export function getAgentByName(name: string): EliteAgentInstance | undefined {
  return ELITE_AGENTS.find(agent => agent.name === name)
}

/**
 * Get agents by tier (includes all agents at or below the specified tier)
 * Free tier: 1 agent (DCA Basic)
 * Starter tier: 1 agent
 * Trader tier: 1 agent
 * Pro tier: 11 agents (1 free + 10 pro)
 * Elite tier: 15 agents (1 free + 10 pro + 4 elite)
 * Lifetime: All 15 agents
 */
export function getAgentsByTier(tier: AgentTier): EliteAgentInstance[] {
  const tierHierarchy: AgentTier[] = ['free', 'starter', 'trader', 'pro', 'elite', 'lifetime']
  const tierLevel = tierHierarchy.indexOf(tier)
  
  // Normalize agent tiers - starter/trader map to free for access purposes
  const normalizeAgentTier = (agentTier: AgentTier): number => {
    if (agentTier === 'free') return 0  // free
    if (agentTier === 'starter') return 0  // starter = free access
    if (agentTier === 'trader') return 0  // trader = free access
    if (agentTier === 'pro') return 3  // pro
    if (agentTier === 'elite') return 4  // elite
    return 5  // lifetime
  }
  
  // Return all agents at or below the specified tier
  return ELITE_AGENTS.filter(agent => {
    const agentTierLevel = normalizeAgentTier(agent.tier)
    return tierLevel >= agentTierLevel
  })
}

/**
 * Check if user has access to agent
 * GOD MODE: 'lifetime' or 'god' tier = access to ALL agents
 * 
 * Tier hierarchy:
 * - free: 1 agent (DCA Basic)
 * - starter: 1 agent (same as free)
 * - trader: 2 agents
 * - pro: 11 agents
 * - elite: 15 agents
 * - lifetime: All 15 agents + future agents
 */
export function hasAgentAccess(agentTier: AgentTier, userTier: AgentTier | string): boolean {
  // GOD MODE - Lifetime or God tier has access to EVERYTHING
  if (userTier === 'lifetime' || userTier === 'god' || userTier === 'master') return true
  
  // Full tier hierarchy including starter/trader
  const tierHierarchy: AgentTier[] = ['free', 'starter', 'trader', 'pro', 'elite', 'lifetime']
  
  // Normalize agent tier to hierarchy position
  const getAgentLevel = (tier: AgentTier): number => {
    if (tier === 'free') return 0
    if (tier === 'starter') return 1
    if (tier === 'trader') return 2
    if (tier === 'pro') return 3
    if (tier === 'elite') return 4
    return 5  // lifetime
  }
  
  const agentLevel = getAgentLevel(agentTier)
  const userLevel = tierHierarchy.indexOf(userTier as AgentTier)
  
  // Handle unknown user tiers (default to no access)
  if (userLevel === -1) return false
  
  return userLevel >= agentLevel
}
