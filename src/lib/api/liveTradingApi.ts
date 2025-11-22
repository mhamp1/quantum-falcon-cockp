// Live Trading Data API — Real-time Trading Intelligence
// November 21, 2025 — Quantum Falcon Cockpit
// ALL DATA MUST BE LIVE — NO MOCK DATA

export interface LiveTradingData {
  portfolioValue: number
  dailyPnL: number
  winRate: number
  activeTrades: number
  totalTrades: number
  weeklyWinRate: number
  dailyStreak: number
  lastUpdated: number
}

const API_ENDPOINT = import.meta.env.VITE_TRADING_API_ENDPOINT || '/api/trading'
const CACHE_DURATION = 5000 // 5 second cache for trading data

let cachedData: LiveTradingData | null = null
let cacheTimestamp = 0

/**
 * Fetch live trading data from backend API
 * In production, this connects to your trading backend
 */
export async function fetchLiveTradingData(): Promise<LiveTradingData> {
  // Check cache first
  if (cachedData && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedData
  }

  try {
    const response = await fetch(`${API_ENDPOINT}/live`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add authentication if needed
      // credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()

    const liveData: LiveTradingData = {
      portfolioValue: data.portfolioValue || 0,
      dailyPnL: data.dailyPnL || 0,
      winRate: data.winRate || 0,
      activeTrades: data.activeTrades || 0,
      totalTrades: data.totalTrades || 0,
      weeklyWinRate: data.weeklyWinRate || 0,
      dailyStreak: data.dailyStreak || 0,
      lastUpdated: Date.now(),
    }

    // Update cache
    cachedData = liveData
    cacheTimestamp = Date.now()

    return liveData
  } catch (error) {
    // If cache exists, return it even if stale
    if (cachedData) {
      return cachedData
    }

    // Last resort: throw error (no mock data)
    throw new Error('Failed to fetch live trading data. Please ensure your trading backend is running.')
  }
}

/**
 * Fetch live trading data with retry logic
 */
export async function fetchLiveTradingDataWithRetry(
  maxRetries = 3,
  retryDelay = 1000
): Promise<LiveTradingData> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fetchLiveTradingData()
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }
      console.warn(`⚠️ Trading data fetch failed (attempt ${attempt}/${maxRetries}), retrying...`)
      await new Promise((resolve) => setTimeout(resolve, retryDelay))
    }
  }
  throw new Error('Failed to fetch trading data after retries')
}

