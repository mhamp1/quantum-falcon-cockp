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

    // Last resort: return safe defaults instead of throwing (prevents black screen)
    // This allows the app to render even when backend is unavailable
    console.warn('⚠️ Trading API unavailable, using default values. Backend may not be running.')
    return {
      portfolioValue: 0,
      dailyPnL: 0,
      winRate: 0,
      activeTrades: 0,
      totalTrades: 0,
      weeklyWinRate: 0,
      dailyStreak: 0,
      lastUpdated: Date.now(),
    }
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
        // On final retry failure, return safe defaults instead of throwing
        console.warn('⚠️ Trading data fetch failed after all retries, using defaults')
        return {
          portfolioValue: 0,
          dailyPnL: 0,
          winRate: 0,
          activeTrades: 0,
          totalTrades: 0,
          weeklyWinRate: 0,
          dailyStreak: 0,
          lastUpdated: Date.now(),
        }
      }
      console.warn(`⚠️ Trading data fetch failed (attempt ${attempt}/${maxRetries}), retrying...`)
      await new Promise((resolve) => setTimeout(resolve, retryDelay))
    }
  }
  // This should never be reached, but provide fallback just in case
  return {
    portfolioValue: 0,
    dailyPnL: 0,
    winRate: 0,
    activeTrades: 0,
    totalTrades: 0,
    weeklyWinRate: 0,
    dailyStreak: 0,
    lastUpdated: Date.now(),
  }
}

