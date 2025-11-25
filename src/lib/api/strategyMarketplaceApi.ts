// Strategy Marketplace API — Real-time Strategy Data
// November 22, 2025 — Quantum Falcon Cockpit
// ALL DATA MUST BE LIVE — NO MOCK DATA

import { logger } from '../logger'

export interface MarketplaceStrategy {
  id: string
  name: string
  description: string
  code: string
  category: string
  tags: string[]
  tier_required: string
  author_id: string
  author_name: string
  author_tier: string
  created_at: number
  price_cents: number
  purchases: number
  stats: {
    win_rate: number
    total_trades: number
    avg_roi: number
    live_pnl: number
    sharpe_ratio: number
    max_drawdown: number
  }
  social: {
    likes: number
    views: number
    downloads: number
    rating: number
    reviews: number
  }
  verified: boolean
  featured: boolean
  trending: boolean
}

const API_ENDPOINT = import.meta.env.VITE_TRADING_API_ENDPOINT || '/api'

/**
 * Fetch real marketplace strategies from backend
 * Returns empty array if no data yet
 */
export async function fetchMarketplaceStrategies(): Promise<MarketplaceStrategy[]> {
  try {
    const response = await fetch(`${API_ENDPOINT}/strategies/marketplace`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        // No data yet - return empty
        return []
      }
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()
    return data.strategies || []
  } catch (error) {
    logger.warn('[Marketplace] Failed to fetch strategies:', error)
    // Return empty array - no mock data
    return []
  }
}

