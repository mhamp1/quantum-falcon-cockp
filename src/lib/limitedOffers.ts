/**
 * LIMITED OFFERS SYSTEM - Micro-Transaction Bot Function Perks
 * 
 * Strategy: Low-cost ($0.99-$4.99) impulse-buy trading bot enhancements that
 * rotate DAILY (24h) to encourage repeat purchases. All offers are time-boxed,
 * consumable, and directly enhance trading bot functionality.
 * 
 * Categories: execution (speed/routing), limits (trades/size), analytics (indicators),
 * risk (protection/management), gamified (luck/mystery)
 * 
 * This is separate from the "Special Offers" deck which contains higher-dollar items.
 * Limited Offers are designed to feel like quick consumables tied to the trading cockpit.
 * 
 * REAL-TIME DATA INTEGRATION READY:
 * - Daily rotation using timestamp-based shuffling
 * - Purchase state persisted with useKV
 * - Can integrate with payment processor
 * - WebSocket ready for real-time activation
 */

import {
  Lightning, Gauge, Target, TrendUp, Shield, Coin,
  ChartLineUp, Brain, Eye, Crosshair, Fire, Sparkle,
  ArrowsOutSimple, Clock, ChartBar, Diamond, Gift,
  Rocket, Lock, Cpu, Graph
} from '@phosphor-icons/react'

export interface LimitedOffer {
  id: string
  title: string
  subtitle: string
  description: string
  price: number
  icon: any
  category: 'execution' | 'limits' | 'analytics' | 'risk' | 'gamified'
  duration: number
  benefit: string
  tier: 'micro'
}

export const ALL_LIMITED_OFFERS: LimitedOffer[] = [
  // EXECUTION BOOSTS
  {
    id: 'speed-boost-24h',
    title: '+10% Faster Routing',
    subtitle: '24H SPEED BOOST',
    description: 'Increase order routing speed by 10% for lightning-fast execution during volatile markets',
    price: 1.29,
    icon: Lightning,
    category: 'execution',
    duration: 24,
    benefit: '+10% faster execution for 24 hours',
    tier: 'micro'
  },
  {
    id: 'slippage-calc-unlock',
    title: 'Auto-Slippage Calculator',
    subtitle: 'SMART EXECUTION',
    description: 'Automatically calculate optimal slippage for each trade based on liquidity and volatility',
    price: 2.49,
    icon: Brain,
    category: 'execution',
    duration: 48,
    benefit: 'Auto-optimized slippage for 2 days',
    tier: 'micro'
  },
  {
    id: 'priority-exec-12h',
    title: 'Priority Execution',
    subtitle: '12H FAST LANE',
    description: 'Skip the queue and execute trades with priority routing during peak hours',
    price: 1.99,
    icon: Rocket,
    category: 'execution',
    duration: 12,
    benefit: 'Priority routing for 12 hours',
    tier: 'micro'
  },
  {
    id: 'retry-logic-24h',
    title: 'Smart Retry Logic',
    subtitle: 'NEVER MISS A TRADE',
    description: 'Automatic retry with adjusted parameters if initial trade execution fails',
    price: 1.49,
    icon: Target,
    category: 'execution',
    duration: 24,
    benefit: 'Auto-retry failed trades for 24h',
    tier: 'micro'
  },
  {
    id: 'latency-reducer',
    title: 'Latency Reducer',
    subtitle: 'SUB-100MS EXECUTION',
    description: 'Reduce execution latency by optimizing connection routing to exchanges',
    price: 1.79,
    icon: Lightning,
    category: 'execution',
    duration: 24,
    benefit: 'Reduced latency for 24 hours',
    tier: 'micro'
  },

  // LIMIT EXTENSIONS
  {
    id: 'extra-trades-5',
    title: '+5 Extra Trades Today',
    subtitle: 'DAILY LIMIT BOOST',
    description: 'Increase your daily trade limit by 5 additional executions',
    price: 0.99,
    icon: ArrowsOutSimple,
    category: 'limits',
    duration: 24,
    benefit: '+5 trades for today',
    tier: 'micro'
  },
  {
    id: 'extra-trades-10',
    title: '+10 Extra Trades Today',
    subtitle: 'POWER TRADER PACK',
    description: 'Increase your daily trade limit by 10 additional executions',
    price: 1.79,
    icon: Fire,
    category: 'limits',
    duration: 24,
    benefit: '+10 trades for today',
    tier: 'micro'
  },
  {
    id: 'position-size-boost',
    title: '+20% Max Position Size',
    subtitle: '12H SIZE INCREASE',
    description: 'Raise your maximum position size limit by 20% for larger trades',
    price: 1.99,
    icon: ArrowsOutSimple,
    category: 'limits',
    duration: 12,
    benefit: '+20% position size for 12h',
    tier: 'micro'
  },
  {
    id: 'concurrent-bot-24h',
    title: '+1 Concurrent Bot Session',
    subtitle: '24H EXTRA BOT',
    description: 'Run one additional bot strategy simultaneously for 24 hours',
    price: 1.49,
    icon: Cpu,
    category: 'limits',
    duration: 24,
    benefit: '+1 bot session for 24 hours',
    tier: 'micro'
  },
  {
    id: 'open-orders-boost',
    title: '+3 Open Orders Limit',
    subtitle: 'MORE OPPORTUNITIES',
    description: 'Increase the number of simultaneous open orders by 3',
    price: 1.29,
    icon: ChartBar,
    category: 'limits',
    duration: 24,
    benefit: '+3 open orders for 24h',
    tier: 'micro'
  },

  // ANALYTICS PERKS
  {
    id: 'rsi-overlay-24h',
    title: 'RSI Timing Overlay',
    subtitle: '24H INDICATOR ACCESS',
    description: 'Unlock advanced RSI timing overlay with multi-timeframe divergence detection',
    price: 1.49,
    icon: ChartLineUp,
    category: 'analytics',
    duration: 24,
    benefit: 'RSI overlay for 24 hours',
    tier: 'micro'
  },
  {
    id: 'whale-alerts-12h',
    title: 'Whale Alert Pings',
    subtitle: '12H SMART MONEY',
    description: 'Real-time notifications when whale wallets make significant moves',
    price: 2.99,
    icon: Eye,
    category: 'analytics',
    duration: 12,
    benefit: 'Whale alerts for 12 hours',
    tier: 'micro'
  },
  {
    id: 'volume-analysis-24h',
    title: 'Volume Spike Detector',
    subtitle: '24H VOLUME INTEL',
    description: 'Advanced volume analysis with unusual activity detection and alerts',
    price: 1.69,
    icon: ChartBar,
    category: 'analytics',
    duration: 24,
    benefit: 'Volume alerts for 24 hours',
    tier: 'micro'
  },
  {
    id: 'pattern-scanner-24h',
    title: 'Pattern Scanner Pro',
    subtitle: '24H CHART PATTERNS',
    description: 'Automatic detection of bullish and bearish chart patterns with confidence scores',
    price: 1.99,
    icon: Target,
    category: 'analytics',
    duration: 24,
    benefit: 'Pattern detection for 24h',
    tier: 'micro'
  },
  {
    id: 'sentiment-pulse-12h',
    title: 'Sentiment Pulse',
    subtitle: '12H SOCIAL ANALYSIS',
    description: 'Real-time social sentiment scoring from Twitter and crypto communities',
    price: 2.49,
    icon: TrendUp,
    category: 'analytics',
    duration: 12,
    benefit: 'Sentiment tracking for 12h',
    tier: 'micro'
  },
  {
    id: 'fibonacci-levels',
    title: 'Fibonacci Level Overlay',
    subtitle: '24H RETRACEMENT',
    description: 'Automatic Fibonacci retracement and extension levels on your charts',
    price: 1.49,
    icon: Graph,
    category: 'analytics',
    duration: 24,
    benefit: 'Fib levels for 24 hours',
    tier: 'micro'
  },

  // RISK MANAGEMENT
  {
    id: 'dynamic-stop-loss',
    title: 'Dynamic Stop-Loss',
    subtitle: '24H SMART PROTECTION',
    description: 'AI-powered trailing stop-loss that adapts to market volatility automatically',
    price: 1.99,
    icon: Shield,
    category: 'risk',
    duration: 24,
    benefit: 'Dynamic stops for 24 hours',
    tier: 'micro'
  },
  {
    id: 'free-hedge-suggestion',
    title: 'Free Hedge Suggestion',
    subtitle: 'ONE-TIME PROTECTION',
    description: 'Get one AI-generated hedge suggestion to protect your current position',
    price: 0.99,
    icon: Lock,
    category: 'risk',
    duration: 1,
    benefit: 'One hedge recommendation',
    tier: 'micro'
  },
  {
    id: 'risk-score-24h',
    title: 'Portfolio Risk Scorer',
    subtitle: '24H RISK ANALYSIS',
    description: 'Real-time risk score calculation for your entire portfolio with recommendations',
    price: 1.79,
    icon: Gauge,
    category: 'risk',
    duration: 24,
    benefit: 'Risk scoring for 24 hours',
    tier: 'micro'
  },
  {
    id: 'drawdown-alerts',
    title: 'Drawdown Alert System',
    subtitle: '24H LOSS PROTECTION',
    description: 'Get instant alerts when your portfolio reaches predefined drawdown thresholds',
    price: 1.49,
    icon: Shield,
    category: 'risk',
    duration: 24,
    benefit: 'Drawdown alerts for 24h',
    tier: 'micro'
  },
  {
    id: 'position-rebalance',
    title: 'Auto-Rebalance Suggestion',
    subtitle: 'PORTFOLIO OPTIMIZER',
    description: 'AI recommendation for rebalancing your positions to optimal risk/reward ratio',
    price: 1.99,
    icon: Brain,
    category: 'risk',
    duration: 1,
    benefit: 'One rebalance suggestion',
    tier: 'micro'
  },

  // GAMIFIED / FUN
  {
    id: 'lucky-streak-6h',
    title: 'Lucky Streak Boost',
    subtitle: '6H SUCCESS BOOST',
    description: '+5% success rate boost on all trades for 6 hours (algorithmic optimization)',
    price: 1.39,
    icon: Sparkle,
    category: 'gamified',
    duration: 6,
    benefit: '+5% win rate for 6 hours',
    tier: 'micro'
  },
  {
    id: 'mystery-boost',
    title: 'Mystery Micro-Boost',
    subtitle: 'RANDOM BOT PERK',
    description: 'Unlock a random bot enhancement - could be speed, limits, or analytics!',
    price: 0.99,
    icon: Gift,
    category: 'gamified',
    duration: 24,
    benefit: 'Random 24h boost',
    tier: 'micro'
  },
  {
    id: 'double-xp-12h',
    title: 'Double XP Multiplier',
    subtitle: '12H PROGRESSION',
    description: 'Earn 2x XP on all trading activities for rapid level progression',
    price: 1.49,
    icon: Fire,
    category: 'gamified',
    duration: 12,
    benefit: '2x XP for 12 hours',
    tier: 'micro'
  },
  {
    id: 'profit-amplifier-4h',
    title: 'Profit Amplifier',
    subtitle: '4H GAINS BOOST',
    description: 'Algorithmic trading optimization for maximum profit potential (4 hours)',
    price: 2.99,
    icon: Diamond,
    category: 'gamified',
    duration: 4,
    benefit: 'Optimized trading for 4h',
    tier: 'micro'
  },
  {
    id: 'instant-analysis',
    title: 'Instant Market Analysis',
    subtitle: 'AI MARKET REPORT',
    description: 'Get an instant AI-generated analysis of current market conditions',
    price: 0.99,
    icon: Brain,
    category: 'gamified',
    duration: 1,
    benefit: 'One AI analysis report',
    tier: 'micro'
  },

  // MORE EXECUTION BOOSTS
  {
    id: 'gas-optimizer-24h',
    title: 'Gas Fee Optimizer',
    subtitle: '24H FEE SAVINGS',
    description: 'Automatically optimize gas fees for minimum cost on all transactions',
    price: 1.49,
    icon: Coin,
    category: 'execution',
    duration: 24,
    benefit: 'Optimized fees for 24h',
    tier: 'micro'
  },
  {
    id: 'multi-dex-routing',
    title: 'Multi-DEX Routing',
    subtitle: '24H BEST PRICES',
    description: 'Route trades across multiple DEXs automatically for best execution price',
    price: 2.49,
    icon: Rocket,
    category: 'execution',
    duration: 24,
    benefit: 'Multi-DEX routing for 24h',
    tier: 'micro'
  },

  // MORE ANALYTICS
  {
    id: 'correlation-matrix',
    title: 'Asset Correlation Matrix',
    subtitle: '24H CORRELATION DATA',
    description: 'View real-time correlation between your positions and market sectors',
    price: 1.79,
    icon: Graph,
    category: 'analytics',
    duration: 24,
    benefit: 'Correlation data for 24h',
    tier: 'micro'
  },
  {
    id: 'liquidity-heatmap',
    title: 'Liquidity Heatmap',
    subtitle: '24H DEPTH ANALYSIS',
    description: 'Visual heatmap of order book liquidity across price levels',
    price: 1.99,
    icon: ChartBar,
    category: 'analytics',
    duration: 24,
    benefit: 'Liquidity map for 24h',
    tier: 'micro'
  },

  // MORE RISK MANAGEMENT
  {
    id: 'emergency-exit-ready',
    title: 'Emergency Exit Ready',
    subtitle: '24H INSTANT EXIT',
    description: 'Pre-configured emergency exit that closes all positions instantly',
    price: 1.29,
    icon: Lightning,
    category: 'risk',
    duration: 24,
    benefit: 'Emergency exit for 24h',
    tier: 'micro'
  },
  {
    id: 'risk-free-test-trade',
    title: 'Risk-Free Test Trade',
    subtitle: 'ONE FREE TRIAL',
    description: 'Execute one trade with guaranteed refund if it results in a loss',
    price: 2.99,
    icon: Shield,
    category: 'risk',
    duration: 1,
    benefit: 'One risk-free trade',
    tier: 'micro'
  }
]

/**
 * Get Limited Offers that rotate DAILY (every 24 hours)
 * Returns 3-5 offers from the micro-transaction pool
 */
export function getLimitedOffers(count: number = 5): LimitedOffer[] {
  // Daily rotation seed (changes every 24 hours)
  const rotationSeed = Math.floor(Date.now() / (24 * 60 * 60 * 1000))
  
  const shuffled = [...ALL_LIMITED_OFFERS].sort((a, b) => {
    const hashA = simpleHash(a.id + rotationSeed)
    const hashB = simpleHash(b.id + rotationSeed)
    return hashA - hashB
  })
  
  return shuffled.slice(0, count)
}

/**
 * Get Flash Sales that rotate every 3 HOURS
 * Returns 3 high-urgency offers
 */
export function getFlashSales(count: number = 3): LimitedOffer[] {
  // 3-hour rotation seed
  const rotationSeed = Math.floor(Date.now() / (3 * 60 * 60 * 1000))
  
  const shuffled = [...ALL_LIMITED_OFFERS].sort((a, b) => {
    const hashA = simpleHash(a.id + rotationSeed + 'flash')
    const hashB = simpleHash(b.id + rotationSeed + 'flash')
    return hashA - hashB
  })
  
  // Flash sales get 20% discount
  return shuffled.slice(0, count).map(offer => ({
    ...offer,
    price: Number((offer.price * 0.8).toFixed(2)),
    title: `⚡ ${offer.title}`
  }))
}

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function getNextDailyRotationTime(): Date {
  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  const nextRotation = Math.ceil(now / oneDay) * oneDay
  return new Date(nextRotation)
}

export function getNextFlashSaleTime(): Date {
  const now = Date.now()
  const threeHours = 3 * 60 * 60 * 1000
  const nextRotation = Math.ceil(now / threeHours) * threeHours
  return new Date(nextRotation)
}

export function getTimeUntilNextDailyRotation(): { hours: number; minutes: number } {
  const now = Date.now()
  const nextRotation = getNextDailyRotationTime().getTime()
  const diff = nextRotation - now
  
  const hours = Math.floor(diff / (60 * 60 * 1000))
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
  
  return { hours, minutes }
}

export function getTimeUntilNextFlashSale(): { hours: number; minutes: number } {
  const now = Date.now()
  const nextRotation = getNextFlashSaleTime().getTime()
  const diff = nextRotation - now
  
  const hours = Math.floor(diff / (60 * 60 * 1000))
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
  
  return { hours, minutes }
}
