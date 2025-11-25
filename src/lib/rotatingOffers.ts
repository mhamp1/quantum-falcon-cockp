/**
 * ROTATING OFFERS SYSTEM - 50 Unique Cards Rotating Every 3 Days
 * 
 * This system provides a dynamic marketplace of temporary boosts, upgrades, and perks
 * that automatically rotate every 3 days to keep the interface fresh and engaging.
 * 
 * REAL-TIME DATA INTEGRATION READY:
 * - The rotation system uses timestamp-based deterministic shuffling
 * - Can be easily connected to live APIs for pricing, availability, and activation
 * - Purchase state is persisted using useKV for cross-session persistence
 * - Timer updates every minute to show time until next rotation
 * 
 * TO CONNECT LIVE DATA:
 * 1. Replace mock offers array with API fetch in useEffect
 * 2. Update purchaseOffer() to make POST request to backend
 * 3. Add WebSocket for real-time offer updates and notifications
 * 4. Integrate with payment processor for actual transactions
 * 
 * Categories: trading, analytics, cosmetic, community, security, gamification
 * Tiers: boost (quick wins), pro (intermediate), elite (advanced)
 */

import { 
  Lightning, Target, Brain, GitBranch, Rocket, Star, 
  ShieldCheck, ChartLineUp, Sparkle, Crown, Trophy,
  ChartBar, Crosshair, Graph, TrendUp, MagnifyingGlass,
  Gauge, Coin, Wallet, Lock, Users,
  GameController, Gift, Medal, Broadcast, Palette, MusicNotes,
  Camera, CloudArrowDown, Database, Key,
  Planet, Alien, Diamond
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

export interface RotatingOffer {
  id: string
  title: string
  subtitle?: string
  description: string
  price: number
  icon: any
  category: 'trading' | 'analytics' | 'cosmetic' | 'community' | 'security' | 'gamification'
  duration?: number
  benefit1?: string
  benefit2?: string
  benefit3?: string
  tier?: 'boost' | 'pro' | 'elite'
}

export const ALL_ROTATING_OFFERS: RotatingOffer[] = [
  {
    id: 'sniper-mode-pro',
    title: 'SNIPER MODE PRO',
    subtitle: 'PRECISION TOKEN HUNTER',
    description: 'Ultra-fast entry with sub-second timing and automatic slippage guard for new token launches',
    price: 7.99,
    icon: Target,
    category: 'trading',
    duration: 168,
    benefit1: 'Sub-second detection',
    benefit2: 'Auto-slippage calc',
    benefit3: '7-day access',
    tier: 'pro'
  },
  {
    id: 'whale-radar',
    title: 'WHALE RADAR',
    subtitle: 'TOP WALLET TRACKER',
    description: 'Real-time alerts on top 10 whale wallet movements with instant notifications',
    price: 9.99,
    icon: MagnifyingGlass,
    category: 'analytics',
    duration: 168,
    benefit1: 'Top 10 wallets',
    benefit2: 'Instant alerts',
    benefit3: 'Movement history',
    tier: 'elite'
  },
  {
    id: 'dca-optimizer-plus',
    title: 'DCA OPTIMIZER PLUS',
    subtitle: 'INTELLIGENT ACCUMULATION',
    description: 'Auto-buy with advanced RSI and MACD filters for perfect entry timing',
    price: 6.99,
    icon: GitBranch,
    category: 'trading',
    duration: 168,
    benefit1: 'Smart dip buying',
    benefit2: 'RSI+MACD filters',
    benefit3: 'Lower avg entry',
    tier: 'pro'
  },
  {
    id: 'arbitrage-finder',
    title: 'ARBITRAGE FINDER',
    subtitle: 'CROSS-EXCHANGE SPREADS',
    description: 'Real-time cross-exchange spread detection with automatic execution suggestions',
    price: 12.99,
    icon: ChartBar,
    category: 'trading',
    duration: 336,
    benefit1: 'Cross-exchange',
    benefit2: 'Spread alerts',
    benefit3: '14-day access',
    tier: 'elite'
  },
  {
    id: 'flash-hedge',
    title: 'FLASH HEDGE',
    subtitle: 'INSTANT PROTECTION',
    description: 'Automatic protective short positions triggered by volatility spikes',
    price: 8.99,
    icon: ShieldCheck,
    category: 'trading',
    duration: 168,
    benefit1: 'Auto-hedge',
    benefit2: 'Volatility trigger',
    benefit3: 'Risk protection',
    tier: 'pro'
  },
  {
    id: 'priority-routing',
    title: 'PRIORITY ROUTING',
    subtitle: 'SKIP THE QUEUE',
    description: 'Jump to the front of the trade queue during high-traffic periods',
    price: 4.99,
    icon: Rocket,
    category: 'trading',
    duration: 72,
    benefit1: 'No waiting',
    benefit2: 'Peak hours',
    benefit3: '3-day access',
    tier: 'boost'
  },
  {
    id: 'limitless-scalper',
    title: 'LIMITLESS SCALPER',
    subtitle: 'MICRO-TRADE AUTOMATION',
    description: 'Unlock unlimited micro-trade automation for high-frequency strategies',
    price: 15.99,
    icon: Lightning,
    category: 'trading',
    duration: 168,
    benefit1: 'Unlimited trades',
    benefit2: 'High frequency',
    benefit3: 'Auto-execution',
    tier: 'elite'
  },
  {
    id: 'smart-stop-loss',
    title: 'SMART STOP-LOSS',
    subtitle: 'DYNAMIC TRAILING',
    description: 'AI-powered trailing stop-loss that adapts to market conditions',
    price: 5.99,
    icon: Brain,
    category: 'trading',
    duration: 168,
    benefit1: 'Dynamic stops',
    benefit2: 'AI-powered',
    benefit3: 'Risk management',
    tier: 'pro'
  },
  {
    id: 'gas-saver',
    title: 'GAS SAVER',
    subtitle: 'OPTIMIZED FEES',
    description: 'Intelligent transaction fee routing for minimum costs',
    price: 3.99,
    icon: Coin,
    category: 'trading',
    duration: 168,
    benefit1: 'Lower fees',
    benefit2: 'Smart routing',
    benefit3: 'Cost savings',
    tier: 'boost'
  },
  {
    id: 'token-hunter',
    title: 'TOKEN HUNTER',
    subtitle: 'EARLY DETECTION',
    description: 'Get alerts on new token listings seconds after they go live',
    price: 7.99,
    icon: MagnifyingGlass,
    category: 'trading',
    duration: 168,
    benefit1: 'Early alerts',
    benefit2: 'New listings',
    benefit3: 'First mover',
    tier: 'pro'
  },
  {
    id: 'market-intel-pro',
    title: 'MARKET INTEL PRO',
    subtitle: 'WHALE ACCUMULATION',
    description: 'Advanced whale accumulation zone detection with smart money flow analysis',
    price: 9.99,
    icon: Brain,
    category: 'analytics',
    duration: 168,
    benefit1: 'Whale zones',
    benefit2: 'Smart money',
    benefit3: 'Flow analysis',
    tier: 'elite'
  },
  {
    id: 'trend-mapper',
    title: 'TREND MAPPER',
    subtitle: 'AI CHART OVERLAYS',
    description: 'AI-driven trend detection with automatic chart pattern overlay',
    price: 8.99,
    icon: TrendUp,
    category: 'analytics',
    duration: 168,
    benefit1: 'AI patterns',
    benefit2: 'Auto-overlay',
    benefit3: 'Trend detection',
    tier: 'pro'
  },
  {
    id: 'sentiment-scanner',
    title: 'SENTIMENT SCANNER',
    subtitle: 'SOCIAL BUZZ ALERTS',
    description: 'Real-time social media sentiment analysis from Twitter, Reddit, and Discord',
    price: 12.99,
    icon: Broadcast,
    category: 'analytics',
    duration: 336,
    benefit1: 'Social analysis',
    benefit2: 'Multi-platform',
    benefit3: 'Real-time buzz',
    tier: 'elite'
  },
  {
    id: 'heatmap-unlock',
    title: 'HEATMAP UNLOCK',
    subtitle: 'SECTOR PERFORMANCE',
    description: 'Visual sector performance heatmap with real-time data visualization',
    price: 6.99,
    icon: Graph,
    category: 'analytics',
    duration: 168,
    benefit1: 'Visual sectors',
    benefit2: 'Performance map',
    benefit3: 'Real-time data',
    tier: 'pro'
  },
  {
    id: 'rsi-timing',
    title: 'RSI-BASED TIMING',
    subtitle: 'ADVANCED ENTRY SIGNALS',
    description: 'Precision entry and exit signals based on multi-timeframe RSI analysis',
    price: 7.99,
    icon: Crosshair,
    category: 'analytics',
    duration: 168,
    benefit1: 'Multi-timeframe',
    benefit2: 'Entry signals',
    benefit3: 'Exit timing',
    tier: 'pro'
  },
  {
    id: 'volume-surge',
    title: 'VOLUME SURGE DETECTOR',
    subtitle: 'UNUSUAL ACTIVITY',
    description: 'Instant alerts when trading volume spikes beyond normal patterns',
    price: 5.99,
    icon: ChartLineUp,
    category: 'analytics',
    duration: 168,
    benefit1: 'Volume spikes',
    benefit2: 'Instant alerts',
    benefit3: 'Pattern detection',
    tier: 'boost'
  },
  {
    id: 'pattern-recognition',
    title: 'PATTERN RECOGNITION',
    subtitle: 'AUTO-TAGGING',
    description: 'Automatic candlestick pattern detection and tagging on charts',
    price: 8.99,
    icon: ChartBar,
    category: 'analytics',
    duration: 168,
    benefit1: 'Auto-detect',
    benefit2: 'Candlestick tags',
    benefit3: 'Pattern library',
    tier: 'pro'
  },
  {
    id: 'risk-index',
    title: 'RISK INDEX DASHBOARD',
    subtitle: 'PORTFOLIO STRESS TEST',
    description: 'Comprehensive portfolio risk analysis with stress testing scenarios',
    price: 11.99,
    icon: Gauge,
    category: 'analytics',
    duration: 336,
    benefit1: 'Risk analysis',
    benefit2: 'Stress tests',
    benefit3: 'Portfolio health',
    tier: 'elite'
  },
  {
    id: 'onchain-explorer',
    title: 'ON-CHAIN EXPLORER',
    subtitle: 'TOKEN FLOW ANALYSIS',
    description: 'Deep dive into on-chain token flows and wallet interactions',
    price: 13.99,
    icon: Database,
    category: 'analytics',
    duration: 336,
    benefit1: 'Token flows',
    benefit2: 'Wallet tracking',
    benefit3: 'Chain analysis',
    tier: 'elite'
  },
  {
    id: 'insider-pulse',
    title: 'INSIDER PULSE',
    subtitle: 'CURATED ANALYST NOTES',
    description: 'Exclusive market insights from professional crypto analysts',
    price: 19.99,
    icon: MagnifyingGlass,
    category: 'analytics',
    duration: 336,
    benefit1: 'Pro insights',
    benefit2: 'Analyst notes',
    benefit3: 'Market edge',
    tier: 'elite'
  },
  {
    id: 'neon-theme',
    title: 'NEON COCKPIT THEME',
    subtitle: 'ENHANCED VISUALS',
    description: 'Unlock vibrant neon color palette with enhanced glow effects',
    price: 2.99,
    icon: Palette,
    category: 'cosmetic',
    duration: 72,
    benefit1: 'New colors',
    benefit2: 'Glow effects',
    benefit3: '3-day trial',
    tier: 'boost'
  },
  {
    id: 'holo-frames',
    title: 'HOLOGRAPHIC FRAMES',
    subtitle: 'PREMIUM CARD STYLE',
    description: 'Animated holographic card frames with rainbow shimmer effects',
    price: 3.99,
    icon: Sparkle,
    category: 'cosmetic',
    duration: 72,
    benefit1: 'Holo effect',
    benefit2: 'Rainbow shimmer',
    benefit3: 'Premium look',
    tier: 'boost'
  },
  {
    id: 'mascot-overlay',
    title: 'ANIMATED MASCOT',
    subtitle: 'COMPANION CHARACTER',
    description: 'Friendly AI mascot that reacts to your trades and achievements',
    price: 4.99,
    icon: Alien,
    category: 'cosmetic',
    duration: 168,
    benefit1: 'Interactive pet',
    benefit2: 'Trade reactions',
    benefit3: 'Achievement celebrations',
    tier: 'boost'
  },
  {
    id: 'cyber-background',
    title: 'CYBERPUNK BACKGROUND',
    subtitle: 'FUTURISTIC CITYSCAPE',
    description: 'Animated cyberpunk city background with neon lights and rain effects',
    price: 5.99,
    icon: Planet,
    category: 'cosmetic',
    duration: 168,
    benefit1: 'Animated city',
    benefit2: 'Rain effects',
    benefit3: 'Immersive feel',
    tier: 'pro'
  },
  {
    id: 'avatar-badge',
    title: 'CUSTOM AVATAR BADGE',
    subtitle: 'UNIQUE IDENTIFIER',
    description: 'Exclusive animated badge displayed on your profile and in community',
    price: 3.99,
    icon: Medal,
    category: 'cosmetic',
    duration: 168,
    benefit1: 'Animated badge',
    benefit2: 'Profile display',
    benefit3: 'Community flex',
    tier: 'boost'
  },
  {
    id: 'particle-effects',
    title: 'PARTICLE TRAIL EFFECTS',
    subtitle: 'CURSOR MAGIC',
    description: 'Glowing particle trail that follows your cursor movements',
    price: 2.99,
    icon: Sparkle,
    category: 'cosmetic',
    duration: 72,
    benefit1: 'Cursor trail',
    benefit2: 'Particle glow',
    benefit3: 'Visual polish',
    tier: 'boost'
  },
  {
    id: 'sound-pack',
    title: 'ALTERNATE SOUND PACK',
    subtitle: 'PREMIUM AUDIO',
    description: 'Sci-fi inspired sound effects for trades, alerts, and notifications',
    price: 4.99,
    icon: MusicNotes,
    category: 'cosmetic',
    duration: 168,
    benefit1: 'Sci-fi sounds',
    benefit2: 'Trade audio',
    benefit3: 'Immersive',
    tier: 'boost'
  },
  {
    id: 'gradient-theme',
    title: 'DYNAMIC GRADIENTS',
    subtitle: 'ROTATING PALETTE',
    description: 'Automatically rotating gradient color schemes that change every hour',
    price: 5.99,
    icon: Palette,
    category: 'cosmetic',
    duration: 168,
    benefit1: 'Auto-rotation',
    benefit2: 'Fresh look',
    benefit3: 'Hourly change',
    tier: 'pro'
  },
  {
    id: 'cinematic-transitions',
    title: 'CINEMATIC TRANSITIONS',
    subtitle: 'SMOOTH ANIMATIONS',
    description: 'Hollywood-style page transitions with motion blur and fade effects',
    price: 3.99,
    icon: Camera,
    category: 'cosmetic',
    duration: 168,
    benefit1: 'Smooth fades',
    benefit2: 'Motion blur',
    benefit3: 'Premium feel',
    tier: 'boost'
  },
  {
    id: 'portfolio-glow',
    title: 'PORTFOLIO GLOW EFFECT',
    subtitle: 'PROFIT VISUALIZATION',
    description: 'Your portfolio cards glow brighter as profits increase',
    price: 4.99,
    icon: Sparkle,
    category: 'cosmetic',
    duration: 168,
    benefit1: 'Profit glow',
    benefit2: 'Visual feedback',
    benefit3: 'Motivating',
    tier: 'boost'
  },
  {
    id: 'spotlight-card',
    title: 'COMMUNITY SPOTLIGHT',
    subtitle: 'PROFILE BOOST',
    description: 'Feature your profile prominently in the community tab for 3 days',
    price: 9.99,
    icon: Star,
    category: 'community',
    duration: 72,
    benefit1: 'Top placement',
    benefit2: 'Profile views',
    benefit3: 'Recognition',
    tier: 'pro'
  },
  {
    id: 'moderator-badge',
    title: 'TEMPORARY MODERATOR',
    subtitle: 'COMMUNITY POWER',
    description: 'Gain moderator privileges in community chat and forums for 7 days',
    price: 14.99,
    icon: Crown,
    category: 'community',
    duration: 168,
    benefit1: 'Mod powers',
    benefit2: 'Chat control',
    benefit3: 'Special badge',
    tier: 'elite'
  },
  {
    id: 'gift-xp',
    title: 'XP GIFT BUNDLE',
    subtitle: 'SHARE SUCCESS',
    description: 'Gift 500 XP to another user and boost their progression',
    price: 7.99,
    icon: Gift,
    category: 'community',
    benefit1: 'Gift 500 XP',
    benefit2: 'Help others',
    benefit3: 'Good karma',
    tier: 'boost'
  },
  {
    id: 'poll-boost',
    title: 'COMMUNITY POLL BOOST',
    subtitle: 'DOUBLE VOTING POWER',
    description: 'Your votes count 2x in all community polls and decisions for 14 days',
    price: 5.99,
    icon: Trophy,
    category: 'community',
    duration: 336,
    benefit1: '2x vote weight',
    benefit2: 'Influence decisions',
    benefit3: '14-day power',
    tier: 'pro'
  },
  {
    id: 'hidden-forum',
    title: 'HIDDEN FORUM ACCESS',
    subtitle: 'EXCLUSIVE DISCUSSIONS',
    description: 'Access secret forum thread with elite trading strategies and insights',
    price: 12.99,
    icon: Lock,
    category: 'community',
    duration: 336,
    benefit1: 'Secret forum',
    benefit2: 'Elite strategies',
    benefit3: 'Insider info',
    tier: 'elite'
  },
  {
    id: 'collab-multiplier',
    title: 'COLLABORATION MULTIPLIER',
    subtitle: 'TEAM XP BOOST',
    description: 'XP doubled when co-building strategies with other users for 7 days',
    price: 8.99,
    icon: Users,
    category: 'community',
    duration: 168,
    benefit1: '2x team XP',
    benefit2: 'Co-op boost',
    benefit3: 'Build together',
    tier: 'pro'
  },
  {
    id: 'mentor-pairing',
    title: 'MENTOR PAIRING',
    subtitle: 'LEARN FROM PROS',
    description: 'Get randomly paired with a pro trader for 1-on-1 mentorship session',
    price: 24.99,
    icon: Users,
    category: 'community',
    benefit1: '1-on-1 session',
    benefit2: 'Pro mentor',
    benefit3: 'Learn fast',
    tier: 'elite'
  },
  {
    id: 'vault-bonus',
    title: 'VAULT CONTRIBUTION BONUS',
    subtitle: 'EXTRA REWARDS',
    description: '+10% bonus on all BTC vault deposits for 14 days',
    price: 11.99,
    icon: Wallet,
    category: 'community',
    duration: 336,
    benefit1: '+10% deposits',
    benefit2: 'Vault boost',
    benefit3: 'Extra BTC',
    tier: 'pro'
  },
  {
    id: 'pr-recognition',
    title: 'PR RECOGNITION BADGE',
    subtitle: 'DEVELOPER HONOR',
    description: 'Special badge for having code merged into the main repository',
    price: 0,
    icon: Medal,
    category: 'community',
    benefit1: 'Dev badge',
    benefit2: 'Permanent',
    benefit3: 'Code honor',
    tier: 'boost'
  },
  {
    id: 'ceremonial-milestone',
    title: 'CEREMONIAL MILESTONE',
    subtitle: 'ACHIEVEMENT UNLOCKED',
    description: 'Special one-time milestone card celebrating your trading journey',
    price: 4.99,
    icon: Trophy,
    category: 'community',
    benefit1: 'Custom card',
    benefit2: 'Permanent',
    benefit3: 'Celebrate you',
    tier: 'boost'
  },
  {
    id: 'vault-backup',
    title: 'VAULT BACKUP SNAPSHOT',
    subtitle: 'SAFETY FIRST',
    description: 'Free encrypted backup snapshot of your entire vault state',
    price: 0,
    icon: CloudArrowDown,
    category: 'security',
    benefit1: 'Full backup',
    benefit2: 'Encrypted',
    benefit3: 'Peace of mind',
    tier: 'boost'
  },
  {
    id: '2fa-bypass',
    title: 'TEMP 2FA BYPASS',
    subtitle: 'CONVENIENCE MODE',
    description: 'Temporary trusted device 2FA bypass with full audit logging for 24h',
    price: 1.99,
    icon: Key,
    category: 'security',
    duration: 24,
    benefit1: 'Trusted device',
    benefit2: 'Audit logged',
    benefit3: '24h access',
    tier: 'boost'
  },
  {
    id: 'security-audit',
    title: 'SECURITY AUDIT REPORT',
    subtitle: 'ACCOUNT HEALTH CHECK',
    description: 'Comprehensive security audit of your account with recommendations',
    price: 9.99,
    icon: ShieldCheck,
    category: 'security',
    benefit1: 'Full audit',
    benefit2: 'Recommendations',
    benefit3: 'Detailed report',
    tier: 'pro'
  },
  {
    id: 'encrypted-messages',
    title: 'ENCRYPTED MESSAGE SKIN',
    subtitle: 'PRIVATE COMMUNICATIONS',
    description: 'End-to-end encrypted messaging with custom UI skin for privacy',
    price: 6.99,
    icon: Lock,
    category: 'security',
    duration: 168,
    benefit1: 'E2E encrypted',
    benefit2: 'Custom skin',
    benefit3: 'Private chats',
    tier: 'pro'
  },
  {
    id: 'vault-expansion',
    title: 'VAULT EXPANSION SLOT',
    subtitle: 'MORE STORAGE',
    description: 'Temporary extra vault slot for segregating different strategies',
    price: 4.99,
    icon: Database,
    category: 'security',
    duration: 72,
    benefit1: 'Extra slot',
    benefit2: 'Organize funds',
    benefit3: '3-day trial',
    tier: 'boost'
  },
  {
    id: 'mystery-loot',
    title: 'MYSTERY LOOT BOX',
    subtitle: 'RANDOM REWARD',
    description: 'Open for a random reward: XP, cosmetics, or temporary feature access',
    price: 4.99,
    icon: Gift,
    category: 'gamification',
    benefit1: 'Random reward',
    benefit2: 'Surprise!',
    benefit3: 'Always valuable',
    tier: 'boost'
  },
  {
    id: 'daily-challenge',
    title: 'DAILY CHALLENGE UNLOCK',
    subtitle: 'EXTRA MISSIONS',
    description: 'Unlock premium daily challenges with 3x XP rewards for 7 days',
    price: 5.99,
    icon: Target,
    category: 'gamification',
    duration: 168,
    benefit1: 'Premium challenges',
    benefit2: '3x XP rewards',
    benefit3: '7-day access',
    tier: 'pro'
  },
  {
    id: 'puzzle-minigame',
    title: 'PUZZLE MINI-GAME',
    subtitle: 'BRAIN TEASER',
    description: 'Solve trading-themed puzzles to earn bonus XP and unlock rewards',
    price: 2.99,
    icon: GameController,
    category: 'gamification',
    benefit1: 'Fun puzzles',
    benefit2: 'Bonus XP',
    benefit3: 'Unlock rewards',
    tier: 'boost'
  },
  {
    id: 'trivia-card',
    title: 'TRIVIA CHALLENGE',
    subtitle: 'TEST YOUR KNOWLEDGE',
    description: 'Answer crypto trading trivia questions for instant XP rewards',
    price: 1.99,
    icon: Brain,
    category: 'gamification',
    benefit1: 'Quick trivia',
    benefit2: 'Instant XP',
    benefit3: 'Learn & earn',
    tier: 'boost'
  },
  {
    id: 'easter-egg',
    title: 'HIDDEN EASTER EGG',
    subtitle: 'RARE DISCOVERY',
    description: 'Rare card that randomly cycles in with massive XP bonus and special badge',
    price: 0,
    icon: Diamond,
    category: 'gamification',
    benefit1: '1000 XP bonus',
    benefit2: 'Rare badge',
    benefit3: 'Lucky find!',
    tier: 'boost'
  }
]

export function getRotatingOffers(count: number = 5): RotatingOffer[] {
  const rotationSeed = Math.floor(Date.now() / (3 * 24 * 60 * 60 * 1000))
  
  const shuffled = [...ALL_ROTATING_OFFERS].sort((a, b) => {
    const hashA = simpleHash(a.id + rotationSeed)
    const hashB = simpleHash(b.id + rotationSeed)
    return hashA - hashB
  })
  
  return shuffled.slice(0, count)
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

export function getNextRotationTime(): Date {
  const now = Date.now()
  const threeDays = 3 * 24 * 60 * 60 * 1000
  const nextRotation = Math.ceil(now / threeDays) * threeDays
  return new Date(nextRotation)
}

export function getTimeUntilNextRotation(): { days: number; hours: number; minutes: number } {
  const now = Date.now()
  const nextRotation = getNextRotationTime().getTime()
  const diff = nextRotation - now
  
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000))
  
  return { days, hours, minutes }
}
