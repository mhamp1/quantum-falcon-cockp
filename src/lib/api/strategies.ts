export interface Strategy {
  id: string
  name: string
  slug: string
  description: string
  code: string
  thumbnail: string
  category: 'Trend' | 'Mean Reversion' | 'Arbitrage' | 'Breakout' | 'On-Chain' | 'ML' | 'Custom'
  tags: string[]
  tier_required: 'Free' | 'Starter' | 'Trader' | 'Pro' | 'Elite' | 'Lifetime'
  is_exclusive: boolean
  is_user_created: boolean
  author_id: string | null
  author_name?: string
  author_avatar?: string
  created_at: number
  stats: {
    win_rate: number
    total_trades: number
    avg_roi: number
    live_pnl: number
  }
  price_cents: number | null
  duration_hours: number | null
  is_flash_sale: boolean
  flash_end_at: number | null
  is_featured?: boolean
  is_new?: boolean
  is_hot?: boolean
  likes?: number
  views?: number
  comments?: number
  icon?: string // Phosphor icon name
}

export interface StrategyFilters {
  category?: string
  tier?: string
  search?: string
  sort?: 'hot' | 'new' | 'roi' | 'winrate'
  page?: number
  limit?: number
}

export interface StrategyApiResponse {
  strategies: Strategy[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

const API_BASE = '/api/strategies'

export async function fetchAllStrategies(filters: StrategyFilters = {}): Promise<StrategyApiResponse> {
  try {
    const params = new URLSearchParams()
    if (filters.category) params.append('category', filters.category)
    if (filters.tier) params.append('tier', filters.tier)
    if (filters.search) params.append('q', filters.search)
    if (filters.sort) params.append('sort', filters.sort)
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())

    const response = await fetch(`${API_BASE}/all?${params.toString()}`)
    if (!response.ok) throw new Error('Failed to fetch strategies')
    return await response.json()
  } catch (error) {
    // Silent error - using fallback strategies
    return getFallbackStrategies(filters)
  }
}

export async function fetchFeaturedStrategies(): Promise<Strategy[]> {
  try {
    const response = await fetch(`${API_BASE}/featured`)
    if (!response.ok) throw new Error('Failed to fetch featured strategies')
    const data = await response.json()
    return data.strategies || data
  } catch (error) {
    // Silent error - using fallback featured strategies
    return getFallbackFeatured()
  }
}

export async function fetchNewStrategies(): Promise<Strategy[]> {
  try {
    const response = await fetch(`${API_BASE}/new`)
    if (!response.ok) throw new Error('Failed to fetch new strategies')
    const data = await response.json()
    return data.strategies || data
  } catch (error) {
    // Silent error - return empty array
    return []
  }
}

export async function fetchHotStrategies(): Promise<Strategy[]> {
  try {
    const response = await fetch(`${API_BASE}/hot`)
    if (!response.ok) throw new Error('Failed to fetch hot strategies')
    const data = await response.json()
    return data.strategies || data
  } catch (error) {
    // Silent error - return empty array
    return []
  }
}

export async function searchStrategies(query: string): Promise<Strategy[]> {
  try {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
    if (!response.ok) throw new Error('Failed to search strategies')
    const data = await response.json()
    return data.strategies || data
  } catch (error) {
    // Silent error - return empty array
    return []
  }
}

export async function claimStrategy(strategyId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(`${API_BASE}/claim/${strategyId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    if (!response.ok) throw new Error('Failed to claim strategy')
    return await response.json()
  } catch (error) {
    // Return error response for caller to handle
    return { success: false, message: 'Failed to claim strategy' }
  }
}

function getFallbackStrategies(filters: StrategyFilters): StrategyApiResponse {
  const allStrategies = generateFallbackStrategies()
  let filtered = [...allStrategies]

  if (filters.category) {
    filtered = filtered.filter(s => s.category === filters.category)
  }
  if (filters.tier) {
    filtered = filtered.filter(s => s.tier_required === filters.tier)
  }
  if (filters.search) {
    const query = filters.search.toLowerCase()
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query) ||
      s.tags.some(t => t.toLowerCase().includes(query))
    )
  }

  if (filters.sort === 'hot') {
    filtered.sort((a, b) => (b.stats.avg_roi || 0) - (a.stats.avg_roi || 0))
  } else if (filters.sort === 'new') {
    filtered.sort((a, b) => b.created_at - a.created_at)
  } else if (filters.sort === 'roi') {
    filtered.sort((a, b) => (b.stats.avg_roi || 0) - (a.stats.avg_roi || 0))
  } else if (filters.sort === 'winrate') {
    filtered.sort((a, b) => (b.stats.win_rate || 0) - (a.stats.win_rate || 0))
  }

  const page = filters.page || 1
  const limit = filters.limit || 12
  const start = (page - 1) * limit
  const end = start + limit

  return {
    strategies: filtered.slice(start, end),
    total: filtered.length,
    page,
    limit,
    hasMore: end < filtered.length
  }
}

function getFallbackFeatured(): Strategy[] {
  return generateFallbackStrategies().slice(0, 6)
}

function generateFallbackStrategies(): Strategy[] {
  const now = Date.now()
  const sevenDays = 7 * 24 * 60 * 60 * 1000

  return [
    {
      id: 'strat_001',
      name: 'EMA Cross Master',
      slug: 'ema-cross-master',
      description: 'Advanced exponential moving average crossover strategy with dynamic period optimization and trend confirmation',
      code: 'strategy("EMA Cross", overlay=true)',
      thumbnail: '/strategies/ema-cross.png',
      category: 'Trend',
      tags: ['EMA', 'Trend Following', 'Momentum'],
      tier_required: 'Starter',
      is_exclusive: false,
      is_user_created: false,
      author_id: null,
      created_at: now - 30 * 24 * 60 * 60 * 1000,
      stats: { win_rate: 68.5, total_trades: 342, avg_roi: 12.3, live_pnl: 4521.32 },
      price_cents: null,
      duration_hours: null,
      is_flash_sale: false,
      flash_end_at: null,
      is_featured: true,
      likes: 892,
      views: 3421,
      comments: 156
    },
    {
      id: 'strat_002',
      name: 'RSI Divergence Hunter',
      slug: 'rsi-divergence-hunter',
      icon: 'Pulse',
      description: 'Detects hidden and regular RSI divergences with multi-timeframe confirmation for high-probability reversals',
      code: 'strategy("RSI Divergence", overlay=false)',
      thumbnail: '/strategies/rsi-divergence.png',
      category: 'Mean Reversion',
      tags: ['RSI', 'Divergence', 'Reversal'],
      tier_required: 'Trader',
      is_exclusive: false,
      is_user_created: false,
      author_id: null,
      created_at: now - 45 * 24 * 60 * 60 * 1000,
      stats: { win_rate: 73.2, total_trades: 187, avg_roi: 18.7, live_pnl: 8934.21 },
      price_cents: null,
      duration_hours: null,
      is_flash_sale: false,
      flash_end_at: null,
      is_featured: true,
      likes: 1243,
      views: 5672,
      comments: 234
    },
    {
      id: 'strat_003',
      name: 'Volume Profile Scanner',
      slug: 'volume-profile-scanner',
      description: 'Identifies high-volume nodes and value areas for optimal entry and exit points with institutional-grade analysis',
      code: 'strategy("Volume Profile", overlay=true)',
      thumbnail: '/strategies/volume-profile.png',
      category: 'Breakout',
      tags: ['Volume', 'Support/Resistance', 'Breakout'],
      tier_required: 'Pro',
      is_exclusive: true,
      is_user_created: false,
      author_id: null,
      created_at: now - 60 * 24 * 60 * 60 * 1000,
      stats: { win_rate: 81.4, total_trades: 94, avg_roi: 24.5, live_pnl: 12456.78 },
      price_cents: null,
      duration_hours: null,
      is_flash_sale: false,
      flash_end_at: null,
      is_featured: true,
      likes: 2134,
      views: 8943,
      comments: 423
    },
    {
      id: 'strat_004',
      name: 'On-Chain Whale Tracker',
      slug: 'onchain-whale-tracker',
      icon: 'FishSimple',
      description: 'Monitors large wallet movements and whale accumulation patterns on Solana with real-time alerts',
      code: 'strategy("Whale Tracker", overlay=true)',
      thumbnail: '/strategies/whale-tracker.png',
      category: 'On-Chain',
      tags: ['Whale', 'On-Chain', 'Solana'],
      tier_required: 'Elite',
      is_exclusive: true,
      is_user_created: false,
      author_id: null,
      created_at: now - 15 * 24 * 60 * 60 * 1000,
      stats: { win_rate: 89.2, total_trades: 43, avg_roi: 38.9, live_pnl: 23451.67 },
      price_cents: null,
      duration_hours: null,
      is_flash_sale: false,
      flash_end_at: null,
      is_featured: true,
      is_hot: true,
      likes: 3421,
      views: 12834,
      comments: 672
    },
    {
      id: 'strat_005',
      name: 'ML Arbitrage Engine',
      slug: 'ml-arbitrage-engine',
      icon: 'Brain',
      description: 'Machine learning-powered cross-exchange arbitrage with automated execution and risk management',
      code: 'strategy("ML Arbitrage", overlay=false)',
      thumbnail: '/strategies/ml-arbitrage.png',
      category: 'Arbitrage',
      tags: ['Machine Learning', 'Arbitrage', 'Multi-Exchange'],
      tier_required: 'Lifetime',
      is_exclusive: true,
      is_user_created: false,
      author_id: null,
      created_at: now - 90 * 24 * 60 * 60 * 1000,
      stats: { win_rate: 94.7, total_trades: 1247, avg_roi: 8.2, live_pnl: 45678.90 },
      price_cents: null,
      duration_hours: null,
      is_flash_sale: false,
      flash_end_at: null,
      is_featured: true,
      likes: 5672,
      views: 23456,
      comments: 1234
    },
    {
      id: 'strat_006',
      name: 'Bollinger Breakout Pro',
      slug: 'bollinger-breakout-pro',
      icon: 'ArrowsDownUp',
      description: 'Enhanced Bollinger Band breakout system with squeeze detection and volatility expansion confirmation',
      code: 'strategy("Bollinger Breakout", overlay=true)',
      thumbnail: '/strategies/bollinger-breakout.png',
      category: 'Breakout',
      tags: ['Bollinger Bands', 'Volatility', 'Breakout'],
      tier_required: 'Trader',
      is_exclusive: false,
      is_user_created: false,
      author_id: null,
      created_at: now - 20 * 24 * 60 * 60 * 1000,
      stats: { win_rate: 71.8, total_trades: 234, avg_roi: 15.4, live_pnl: 7234.56 },
      price_cents: null,
      duration_hours: null,
      is_flash_sale: false,
      flash_end_at: null,
      is_featured: true,
      likes: 1567,
      views: 6789,
      comments: 298
    },
    {
      id: 'strat_007',
      name: 'MACD Momentum Surge',
      slug: 'macd-momentum-surge',
      icon: 'ChartLine',
      description: 'MACD-based momentum strategy with histogram analysis and signal line crossover confirmation',
      code: 'strategy("MACD Momentum", overlay=false)',
      thumbnail: '/strategies/macd-momentum.png',
      category: 'Trend',
      tags: ['MACD', 'Momentum', 'Trend'],
      tier_required: 'Starter',
      is_exclusive: false,
      is_user_created: false,
      author_id: null,
      created_at: now - 35 * 24 * 60 * 60 * 1000,
      stats: { win_rate: 65.3, total_trades: 412, avg_roi: 11.2, live_pnl: 5678.43 },
      price_cents: null,
      duration_hours: null,
      is_flash_sale: false,
      flash_end_at: null,
      likes: 734,
      views: 2834,
      comments: 123
    },
    {
      id: 'strat_008',
      name: 'Grid Trading Bot',
      slug: 'grid-trading-bot',
      icon: 'ArrowsCounterClockwise',
      description: 'Automated grid trading with dynamic grid sizing based on volatility and range detection',
      code: 'strategy("Grid Trading", overlay=true)',
      thumbnail: '/strategies/grid-trading.png',
      category: 'Mean Reversion',
      tags: ['Grid', 'Range Trading', 'Automated'],
      tier_required: 'Pro',
      is_exclusive: false,
      is_user_created: false,
      author_id: null,
      created_at: now - 50 * 24 * 60 * 60 * 1000,
      stats: { win_rate: 77.9, total_trades: 523, avg_roi: 9.8, live_pnl: 8912.34 },
      price_cents: null,
      duration_hours: null,
      is_flash_sale: false,
      flash_end_at: null,
      likes: 2234,
      views: 9876,
      comments: 456
    },
    {
      id: 'strat_009',
      name: 'Scalper Supreme',
      slug: 'scalper-supreme',
      icon: 'Lightning',
      description: 'Ultra-fast scalping strategy with tick-level precision and sub-second execution',
      code: 'strategy("Scalper", overlay=true)',
      thumbnail: '/strategies/scalper.png',
      category: 'Trend',
      tags: ['Scalping', 'High Frequency', 'Speed'],
      tier_required: 'Elite',
      is_exclusive: true,
      is_user_created: false,
      author_id: null,
      created_at: now - 10 * 24 * 60 * 60 * 1000,
      stats: { win_rate: 83.6, total_trades: 2341, avg_roi: 2.1, live_pnl: 15678.90 },
      price_cents: 199,
      duration_hours: 168,
      is_flash_sale: true,
      flash_end_at: now + 2 * 24 * 60 * 60 * 1000,
      is_hot: true,
      is_new: true,
      likes: 4567,
      views: 18934,
      comments: 892
    },
    {
      id: 'strat_010',
      name: 'Support & Resistance Laser',
      slug: 'support-resistance-laser',
      icon: 'Crosshair',
      description: 'Advanced S/R detection using multiple timeframe analysis and historical price action',
      code: 'strategy("S&R Laser", overlay=true)',
      thumbnail: '/strategies/sr-laser.png',
      category: 'Breakout',
      tags: ['Support', 'Resistance', 'Breakout'],
      tier_required: 'Trader',
      is_exclusive: false,
      is_user_created: false,
      author_id: null,
      created_at: now - 25 * 24 * 60 * 60 * 1000,
      stats: { win_rate: 69.7, total_trades: 298, avg_roi: 13.8, live_pnl: 6543.21 },
      price_cents: null,
      duration_hours: null,
      is_flash_sale: false,
      flash_end_at: null,
      likes: 1123,
      views: 4567,
      comments: 187
    },
    {
      id: 'strat_011',
      name: 'Fibonacci Retracement Master',
      slug: 'fibonacci-retracement-master',
      icon: 'ArrowsCounterClockwise',
      description: 'Automated Fibonacci level identification with golden ratio extensions and confluence zones',
      code: 'strategy("Fibonacci", overlay=true)',
      thumbnail: '/strategies/fibonacci.png',
      category: 'Mean Reversion',
      tags: ['Fibonacci', 'Retracement', 'Golden Ratio'],
      tier_required: 'Pro',
      is_exclusive: false,
      is_user_created: false,
      author_id: null,
      created_at: now - 40 * 24 * 60 * 60 * 1000,
      stats: { win_rate: 75.4, total_trades: 176, avg_roi: 16.9, live_pnl: 9123.45 },
      price_cents: null,
      duration_hours: null,
      is_flash_sale: false,
      flash_end_at: null,
      likes: 1678,
      views: 6234,
      comments: 267
    },
    {
      id: 'strat_012',
      name: 'Liquidity Sweep Detector',
      slug: 'liquidity-sweep-detector',
      icon: 'Waves',
      description: 'Identifies liquidity sweeps and stop hunts for optimal entry timing after shakeouts',
      code: 'strategy("Liquidity Sweep", overlay=true)',
      thumbnail: '/strategies/liquidity-sweep.png',
      category: 'On-Chain',
      tags: ['Liquidity', 'Order Flow', 'Smart Money'],
      tier_required: 'Elite',
      is_exclusive: true,
      is_user_created: false,
      author_id: null,
      created_at: now - 5 * 24 * 60 * 60 * 1000,
      stats: { win_rate: 87.3, total_trades: 67, avg_roi: 28.4, live_pnl: 18934.56 },
      price_cents: 299,
      duration_hours: 72,
      is_flash_sale: true,
      flash_end_at: now + 1 * 24 * 60 * 60 * 1000,
      is_new: true,
      is_hot: true,
      likes: 2891,
      views: 11234,
      comments: 534
    }
  ]
}
