// ═══════════════════════════════════════════════════════════════
// QUANTUM FALCON — STRIPE CONFIGURATION
// Payment processing for all subscription tiers
// November 27, 2025 — Production Ready
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// PRICING TIERS
// ═══════════════════════════════════════════════════════════════

export interface PricingTier {
  id: string
  name: string
  description: string
  price: number
  priceId: string // Stripe Price ID
  interval: 'month' | 'year' | 'lifetime'
  features: string[]
  limits: {
    strategies: number
    agents: number
    backtests: number
    apiCalls: number
  }
  badge?: 'popular' | 'best-value'
  color: string
  glowColor: string
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Paper trading & learning',
    price: 0,
    priceId: '', // No Stripe ID for free tier
    interval: 'month',
    features: [
      'Paper trading mode',
      '1 DCA strategy',
      '1 AI agent',
      '5 backtests/day',
      'Community access',
      'Basic analytics',
    ],
    limits: {
      strategies: 1,
      agents: 1,
      backtests: 5,
      apiCalls: 100,
    },
    color: 'from-gray-600 to-gray-700',
    glowColor: 'rgba(107, 114, 128, 0.5)',
  },
  {
    id: 'starter',
    name: 'Starter',
    description: 'Begin your trading journey',
    price: 29,
    priceId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID || 'price_starter',
    interval: 'month',
    features: [
      'Real trading enabled',
      '3 strategies',
      '3 AI agents',
      '20 backtests/day',
      'Email support',
      'Basic alerts',
      'Tax reports',
    ],
    limits: {
      strategies: 3,
      agents: 3,
      backtests: 20,
      apiCalls: 1000,
    },
    color: 'from-green-600 to-emerald-700',
    glowColor: 'rgba(34, 197, 94, 0.5)',
  },
  {
    id: 'trader',
    name: 'Trader',
    description: 'Serious trading power',
    price: 79,
    priceId: import.meta.env.VITE_STRIPE_TRADER_PRICE_ID || 'price_trader',
    interval: 'month',
    features: [
      'Everything in Starter',
      '7 strategies',
      '7 AI agents',
      '50 backtests/day',
      'Priority support',
      'Advanced analytics',
      'Custom alerts',
      'Strategy sharing',
    ],
    limits: {
      strategies: 7,
      agents: 7,
      backtests: 50,
      apiCalls: 5000,
    },
    color: 'from-blue-600 to-cyan-700',
    glowColor: 'rgba(59, 130, 246, 0.5)',
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Professional-grade tools',
    price: 149,
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || 'price_pro',
    interval: 'month',
    features: [
      'Everything in Trader',
      '11 strategies',
      '11 AI agents',
      'Unlimited backtests',
      '24/7 priority support',
      'Whale tracking',
      'MEV protection',
      'API access',
      'Multi-wallet support',
    ],
    limits: {
      strategies: 11,
      agents: 11,
      backtests: -1,
      apiCalls: 25000,
    },
    color: 'from-purple-600 to-violet-700',
    glowColor: 'rgba(168, 85, 247, 0.5)',
  },
  {
    id: 'elite',
    name: 'Elite',
    description: 'Institutional-grade power',
    price: 299,
    priceId: import.meta.env.VITE_STRIPE_ELITE_PRICE_ID || 'price_elite',
    interval: 'month',
    badge: 'popular',
    features: [
      'Everything in Pro',
      '15 strategies',
      'ALL 15 AI agents',
      'Unlimited everything',
      'Dedicated support',
      'Jito bundles',
      'Flash loans',
      'Custom strategies',
      'Private Discord',
      'Early feature access',
    ],
    limits: {
      strategies: 15,
      agents: 15,
      backtests: -1,
      apiCalls: -1,
    },
    color: 'from-amber-500 to-orange-600',
    glowColor: 'rgba(245, 158, 11, 0.6)',
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    description: 'One payment, forever access',
    price: 2999,
    priceId: import.meta.env.VITE_STRIPE_LIFETIME_PRICE_ID || 'price_lifetime',
    interval: 'lifetime',
    badge: 'best-value',
    features: [
      'Everything in Elite',
      'FOREVER',
      'No recurring payments',
      'Founding member status',
      'Direct line to founders',
      'Custom integrations',
      'White-glove onboarding',
      'Lifetime updates',
      'Priority everything',
      'NFT badge collection',
    ],
    limits: {
      strategies: -1,
      agents: -1,
      backtests: -1,
      apiCalls: -1,
    },
    color: 'from-pink-500 via-purple-500 to-cyan-500',
    glowColor: 'rgba(236, 72, 153, 0.6)',
  },
]

// ═══════════════════════════════════════════════════════════════
// STRIPE HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Get tier by ID
 */
export function getTierById(id: string): PricingTier | undefined {
  return PRICING_TIERS.find(tier => tier.id === id)
}

/**
 * Get tier price display
 */
export function formatTierPrice(tier: PricingTier): string {
  if (tier.price === 0) return 'Free'
  if (tier.interval === 'lifetime') return `$${tier.price}`
  return `$${tier.price}/mo`
}

/**
 * Calculate annual savings
 */
export function getAnnualSavings(tier: PricingTier): number {
  if (tier.interval === 'lifetime' || tier.price === 0) return 0
  return Math.round(tier.price * 12 * 0.17) // 17% annual discount
}

// ═══════════════════════════════════════════════════════════════
// TAX CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export const TAX_CONFIG = {
  enabled: true,
  automatic: true, // Let Stripe handle tax calculation
  collectAddress: true,
  validateAddress: true,
}

