/**
 * INTELLIGENT OFFERS SYSTEM - Personalized, Tier-Based Micro-Transactions
 * 
 * This system generates hyper-personalized offers based on:
 * - User's current tier (upgrades to next tier features)
 * - Analytics data (most-used strategies, trading patterns)
 * - Market conditions (volatility-based offers)
 * - Random variety (keeps it fresh, rotates every 3 hours)
 * 
 * Pricing: $1.99-$9.99 for temporary access (1-7 days)
 * Focus: Strategies and AI agents from higher tiers
 */

import { ALL_STRATEGIES, type StrategyData } from './strategiesData'
import { LICENSE_TIERS, type UserAuth } from './auth'
import {
  Robot, Lightning, TrendUp, ChartLine, Brain, Target, 
  Fire, Rocket, Sparkle, Diamond
} from '@phosphor-icons/react'

export interface IntelligentOffer {
  id: string
  title: string
  subtitle: string
  description: string
  originalPrice: number
  finalPrice: number
  discount: number
  duration: number
  durationUnit: 'hours' | 'days'
  icon: any
  category: 'strategy' | 'agent' | 'boost' | 'analytics'
  tier: string
  unlocks: string[]
  color: 'primary' | 'accent' | 'destructive'
  urgency: 'high' | 'medium' | 'low'
  benefit: string
  requiredTier: string
  rotationSeed: number
}

export interface OfferContext {
  userTier: string
  userLevel?: number
  recentStrategies?: string[]
  totalTrades?: number
  marketVolatility?: 'high' | 'medium' | 'low'
}

/**
 * Get tier hierarchy level
 */
function getTierLevel(tier: string): number {
  const hierarchy = ['free', 'starter', 'trader', 'pro', 'elite', 'lifetime']
  return hierarchy.indexOf(tier)
}

/**
 * Get next tier in hierarchy
 */
function getNextTier(currentTier: string): string | null {
  const hierarchy = ['free', 'starter', 'trader', 'pro', 'elite']
  const currentIndex = hierarchy.indexOf(currentTier)
  if (currentIndex === -1 || currentIndex >= hierarchy.length - 1) return null
  return hierarchy[currentIndex + 1]
}

/**
 * Generate strategy unlock offers - 60% of offers
 * These give temporary access to strategies from higher tiers
 */
function generateStrategyOffers(context: OfferContext, rotationSeed: number): IntelligentOffer[] {
  const offers: IntelligentOffer[] = []
  const userLevel = getTierLevel(context.userTier)
  const nextTier = getNextTier(context.userTier)
  
  if (!nextTier) return offers
  
  // Get locked strategies from next tier and above
  const lockedStrategies = ALL_STRATEGIES.filter(strategy => {
    const strategyLevel = getTierLevel(strategy.tier_required)
    return strategyLevel > userLevel && strategyLevel <= userLevel + 2
  })
  
  // Shuffle based on rotation seed
  const shuffled = [...lockedStrategies].sort((a, b) => {
    const hashA = simpleHash(a.id + rotationSeed)
    const hashB = simpleHash(b.id + rotationSeed)
    return hashA - hashB
  })
  
  // Take top 5-8 strategies
  const selected = shuffled.slice(0, 6)
  
  selected.forEach((strategy, index) => {
    const duration = index % 3 === 0 ? 7 : index % 3 === 1 ? 3 : 1
    const basePrice = duration === 7 ? 9.99 : duration === 3 ? 4.99 : 1.99
    const discount = 15 + (rotationSeed % 30)
    const finalPrice = Number((basePrice * (1 - discount / 100)).toFixed(2))
    
    offers.push({
      id: `strategy-${strategy.id}-${duration}d`,
      title: `${strategy.name}`,
      subtitle: `${duration}-DAY ${strategy.tier_required.toUpperCase()} ACCESS`,
      description: `Try this ${strategy.tier_required} tier strategy for ${duration} day${duration > 1 ? 's' : ''}! ${strategy.description}`,
      originalPrice: basePrice,
      finalPrice: finalPrice,
      discount: discount,
      duration: duration,
      durationUnit: 'days',
      icon: getStrategyIcon(strategy.category),
      category: 'strategy',
      tier: strategy.tier_required,
      unlocks: [strategy.name],
      color: getColorForTier(strategy.tier_required),
      urgency: duration === 1 ? 'high' : duration === 3 ? 'medium' : 'low',
      benefit: `${strategy.win_rate} win rate • ${strategy.total_trades} trades`,
      requiredTier: strategy.tier_required,
      rotationSeed
    })
  })
  
  return offers
}

/**
 * Generate AI agent slot offers - 20% of offers
 * These give temporary additional AI agent slots
 */
function generateAgentOffers(context: OfferContext, rotationSeed: number): IntelligentOffer[] {
  const offers: IntelligentOffer[] = []
  const currentTier = LICENSE_TIERS[context.userTier]
  const nextTierName = getNextTier(context.userTier)
  
  if (!nextTierName || !currentTier) return offers
  
  const nextTier = LICENSE_TIERS[nextTierName]
  const additionalAgents = nextTier.maxAgents - currentTier.maxAgents
  
  if (additionalAgents <= 0) return offers
  
  // 24h, 3-day, 7-day agent access
  const durations = [1, 3, 7]
  
  durations.forEach(duration => {
    const basePrice = duration === 7 ? 9.99 : duration === 3 ? 4.99 : 1.99
    const discount = 20 + (rotationSeed % 25)
    const finalPrice = Number((basePrice * (1 - discount / 100)).toFixed(2))
    
    offers.push({
      id: `agent-slot-${duration}d`,
      title: `+1 AI Agent Slot`,
      subtitle: `${duration}-DAY ${nextTierName.toUpperCase()} FEATURE`,
      description: `Unlock an additional AI agent slot for ${duration} day${duration > 1 ? 's' : ''}! Run more strategies simultaneously.`,
      originalPrice: basePrice,
      finalPrice: finalPrice,
      discount: discount,
      duration: duration,
      durationUnit: 'days',
      icon: Robot,
      category: 'agent',
      tier: nextTierName,
      unlocks: [`+${additionalAgents} AI Agent${additionalAgents > 1 ? 's' : ''}`],
      color: 'accent',
      urgency: duration === 1 ? 'high' : 'medium',
      benefit: `Access ${nextTierName} tier agent capacity`,
      requiredTier: nextTierName,
      rotationSeed
    })
  })
  
  return offers.slice(0, 2)
}

/**
 * Generate gamification boosts - 20% of offers
 * XP boosts, win rate optimizations, etc.
 */
function generateBoostOffers(context: OfferContext, rotationSeed: number): IntelligentOffer[] {
  const offers: IntelligentOffer[] = []
  
  const boostTemplates = [
    {
      id: 'xp-surge-24h',
      title: '+50% XP Boost',
      subtitle: '24H XP MULTIPLIER',
      description: 'Earn 50% more XP from all trading activities for 24 hours. Perfect for leveling up quickly!',
      price: 2.99,
      duration: 24,
      unit: 'hours' as const,
      icon: Fire,
      benefit: 'Fast-track your progression',
      condition: (ctx: OfferContext) => (ctx.userLevel || 0) < 20
    },
    {
      id: 'win-optimizer-12h',
      title: 'Win Rate Optimizer',
      subtitle: '12H ALGO OPTIMIZATION',
      description: 'AI-powered trading optimization for higher success rate. Algorithmic edge for 12 hours.',
      price: 3.99,
      duration: 12,
      unit: 'hours' as const,
      icon: Target,
      benefit: 'Optimized trade execution',
      condition: (ctx: OfferContext) => (ctx.totalTrades || 0) > 10
    },
    {
      id: 'double-xp-6h',
      title: '2x XP Multiplier',
      subtitle: '6H POWER BOOST',
      description: 'Double XP earnings for 6 hours of intense trading. Stack with your tier multiplier!',
      price: 1.99,
      duration: 6,
      unit: 'hours' as const,
      icon: Sparkle,
      benefit: 'Maximum XP gains',
      condition: () => true
    },
    {
      id: 'profit-amplifier-4h',
      title: 'Profit Amplifier',
      subtitle: '4H GAINS BOOST',
      description: 'Algorithmic optimization focused on maximizing profit potential for 4 hours.',
      price: 4.99,
      duration: 4,
      unit: 'hours' as const,
      icon: Diamond,
      benefit: 'Profit-optimized trading',
      condition: (ctx: OfferContext) => (ctx.totalTrades || 0) > 50
    }
  ]
  
  // Filter based on conditions and shuffle
  const eligible = boostTemplates.filter(t => t.condition(context))
  const shuffled = [...eligible].sort((a, b) => {
    const hashA = simpleHash(a.id + rotationSeed)
    const hashB = simpleHash(b.id + rotationSeed)
    return hashA - hashB
  })
  
  shuffled.slice(0, 2).forEach(template => {
    const discount = 10 + (rotationSeed % 20)
    const finalPrice = Number((template.price * (1 - discount / 100)).toFixed(2))
    
    offers.push({
      id: template.id,
      title: template.title,
      subtitle: template.subtitle,
      description: template.description,
      originalPrice: template.price,
      finalPrice: finalPrice,
      discount: discount,
      duration: template.duration,
      durationUnit: template.unit,
      icon: template.icon,
      category: 'boost',
      tier: context.userTier,
      unlocks: [template.title],
      color: 'destructive',
      urgency: 'high',
      benefit: template.benefit,
      requiredTier: context.userTier,
      rotationSeed
    })
  })
  
  return offers
}

/**
 * Generate market-tied offers based on volatility
 * Flash opportunities when market is moving
 */
function generateMarketOffers(context: OfferContext, rotationSeed: number): IntelligentOffer[] {
  const offers: IntelligentOffer[] = []
  
  // Only generate if high volatility
  if (context.marketVolatility !== 'high') return offers
  
  const volatilityOffers = [
    {
      id: 'scalping-flash-24h',
      title: 'Scalping Strategy Flash',
      subtitle: '24H HIGH-FREQUENCY',
      description: 'Perfect for volatile markets! Scalping strategy for quick profits on price swings.',
      price: 3.99,
      strategyId: 'strategy-unlock-scalping-24h',
      icon: Lightning
    },
    {
      id: 'volatility-arb-12h',
      title: 'Volatility Arbitrage',
      subtitle: '12H MARKET EDGE',
      description: 'Exploit volatility mispricings during high-movement periods. Elite-tier strategy.',
      price: 4.99,
      strategyId: 'volatility-arbitrage',
      icon: Rocket
    }
  ]
  
  const selected = volatilityOffers[rotationSeed % volatilityOffers.length]
  const discount = 25 + (rotationSeed % 15)
  const finalPrice = Number((selected.price * (1 - discount / 100)).toFixed(2))
  
  offers.push({
    id: selected.id,
    title: selected.title,
    subtitle: selected.subtitle,
    description: selected.description,
    originalPrice: selected.price,
    finalPrice: finalPrice,
    discount: discount,
    duration: 24,
    durationUnit: 'hours',
    icon: selected.icon,
    category: 'strategy',
    tier: 'pro',
    unlocks: [selected.title],
    color: 'destructive',
    urgency: 'high',
    benefit: 'Perfect for current volatility',
    requiredTier: 'pro',
    rotationSeed
  })
  
  return offers
}

/**
 * Main function: Generate intelligent offers for a user
 * Returns 3-5 personalized offers that rotate every 3 hours
 */
export function generateIntelligentOffers(context: OfferContext): IntelligentOffer[] {
  // 3-hour rotation seed
  const rotationSeed = Math.floor(Date.now() / (3 * 60 * 60 * 1000))
  
  const allOffers: IntelligentOffer[] = []
  
  // 60% strategy offers
  allOffers.push(...generateStrategyOffers(context, rotationSeed))
  
  // 20% agent offers
  allOffers.push(...generateAgentOffers(context, rotationSeed))
  
  // 20% boost offers
  allOffers.push(...generateBoostOffers(context, rotationSeed))
  
  // Market-tied offers (if applicable)
  allOffers.push(...generateMarketOffers(context, rotationSeed))
  
  // Shuffle all offers with rotation seed
  const shuffled = [...allOffers].sort((a, b) => {
    const hashA = simpleHash(a.id + rotationSeed + 'final')
    const hashB = simpleHash(b.id + rotationSeed + 'final')
    return hashA - hashB
  })
  
  // Return 4-5 offers
  return shuffled.slice(0, 5)
}

/**
 * Get time until next 3-hour rotation
 */
export function getTimeUntilNextRotation(): { hours: number; minutes: number; seconds: number } {
  const now = Date.now()
  const threeHours = 3 * 60 * 60 * 1000
  const nextRotation = Math.ceil(now / threeHours) * threeHours
  const diff = nextRotation - now
  
  const hours = Math.floor(diff / (60 * 60 * 1000))
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
  const seconds = Math.floor((diff % (60 * 1000)) / 1000)
  
  return { hours, minutes, seconds }
}

/**
 * Helper: Simple hash function for deterministic shuffling
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

/**
 * Helper: Get icon for strategy category
 */
function getStrategyIcon(category: string): any {
  switch (category) {
    case 'Trend Following':
      return TrendUp
    case 'Mean Reversion':
      return Target
    case 'Oscillator':
      return ChartLine
    case 'AI/ML':
      return Brain
    case 'Arbitrage':
      return Lightning
    default:
      return Rocket
  }
}

/**
 * Helper: Get color theme for tier
 */
function getColorForTier(tier: string): 'primary' | 'accent' | 'destructive' {
  const level = getTierLevel(tier)
  if (level >= 4) return 'destructive' // Elite+
  if (level >= 2) return 'accent'      // Trader+
  return 'primary'                      // Starter/Free
}
