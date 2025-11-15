import { useKV } from '@github/spark/hooks'

export interface LicenseTier {
  id: string
  name: string
  price: number
  features: string[]
  strategiesUnlocked: string[]
  maxAgents: number
  xpMultiplier: number
  specialPerks: string[]
}

export interface UserLicense {
  userId: string
  tier: 'free' | 'pro' | 'elite' | 'lifetime'
  expiresAt: number | null
  purchasedAt: number
  isActive: boolean
  transactionId?: string
}

export interface UserAuth {
  isAuthenticated: boolean
  userId: string | null
  username: string | null
  email: string | null
  avatar: string | null
  license: UserLicense | null
}

export const LICENSE_TIERS: Record<string, LicenseTier> = {
  free: {
    id: 'free',
    name: 'Free Tier',
    price: 0,
    features: [
      'Basic Dashboard Access',
      '1 AI Agent (Market Analysis)',
      'Limited Analytics',
      'Community Access'
    ],
    strategiesUnlocked: ['DCA Basic'],
    maxAgents: 1,
    xpMultiplier: 1,
    specialPerks: []
  },
  pro: {
    id: 'pro',
    name: 'Pro Trader',
    price: 97,
    features: [
      'Full Dashboard Access',
      '2 AI Agents (Market + Strategy)',
      'Advanced Analytics',
      'All DCA Strategies',
      'Basic Momentum Trading',
      'Priority Support',
      '2x XP Multiplier'
    ],
    strategiesUnlocked: ['DCA Basic', 'DCA Advanced', 'Momentum Basic', 'RSI Strategy'],
    maxAgents: 2,
    xpMultiplier: 2,
    specialPerks: ['Speed Boost Access', 'Priority Trade Execution']
  },
  elite: {
    id: 'elite',
    name: 'Elite Trader',
    price: 497,
    features: [
      'Everything in Pro',
      '3 AI Agents (Full Suite)',
      'Advanced Trading Strategies',
      'Token Sniping',
      'Bollinger Bands Strategy',
      'MACD Strategy',
      'Mean Reversion',
      'VIP Community Access',
      'Custom Strategy Builder',
      '3x XP Multiplier',
      'Exclusive Market Signals'
    ],
    strategiesUnlocked: [
      'DCA Basic', 'DCA Advanced', 'Momentum Basic', 'Momentum Advanced',
      'RSI Strategy', 'MACD Strategy', 'Bollinger Bands', 'Mean Reversion',
      'Token Sniping', 'Arbitrage Scanner'
    ],
    maxAgents: 3,
    xpMultiplier: 3,
    specialPerks: [
      'Speed Boost Access',
      'Premium Signals Access',
      'Profit Multiplier (1.5x)',
      'Priority Sniping',
      'Advanced AI Analysis'
    ]
  },
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime Access',
    price: 8000,
    features: [
      'Everything in Elite',
      'Lifetime License (Never Expires)',
      'All Future Strategies Unlocked',
      'Custom AI Agent Training',
      'White-Glove Support',
      'API Access',
      'Custom Bot Integration',
      '5x XP Multiplier',
      'Founder Badge',
      'Revenue Share Program',
      'Beta Feature Access'
    ],
    strategiesUnlocked: ['ALL'],
    maxAgents: 999,
    xpMultiplier: 5,
    specialPerks: [
      'All Perks Unlocked Forever',
      'Custom Strategy Development',
      'Dedicated Account Manager',
      'Revenue Share (5%)',
      'Lifetime Updates',
      'VIP Discord Channel'
    ]
  }
}

export function getRemainingTime(expiresAt: number | null): { days: number; hours: number; minutes: number; expired: boolean } {
  if (!expiresAt) {
    return { days: 999999, hours: 0, minutes: 0, expired: false }
  }
  
  const now = Date.now()
  const diff = expiresAt - now
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, expired: true }
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  return { days, hours, minutes, expired: false }
}

export function canAccessFeature(userTier: string, requiredTier: string): boolean {
  const tierHierarchy = ['free', 'pro', 'elite', 'lifetime']
  const userLevel = tierHierarchy.indexOf(userTier)
  const requiredLevel = tierHierarchy.indexOf(requiredTier)
  return userLevel >= requiredLevel
}
