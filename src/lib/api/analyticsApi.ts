// Analytics API — Real-time Trading Analytics Data
// November 22, 2025 — Quantum Falcon Cockpit
// ALL DATA MUST BE LIVE — NO MOCK DATA

import { logger } from '../logger'

export interface TradeRecord {
  id: number
  asset: string
  pnl: number
  win: boolean
  timestamp: number
  equity: number
}

const API_ENDPOINT = import.meta.env.VITE_TRADING_API_ENDPOINT || '/api'

/**
 * Fetch real trade history from backend
 * Returns empty array if no account or no trades yet
 */
export async function fetchTradeHistory(
  filter: '24h' | '7d' | '30d' | 'all' = 'all'
): Promise<TradeRecord[]> {
  try {
    const response = await fetch(`${API_ENDPOINT}/trades/history?filter=${filter}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        // No trades yet - return empty
        return []
      }
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()
    return data.trades || []
  } catch (error) {
    logger.warn('[Analytics] Failed to fetch trade history:', error)
    // Return empty array - no mock data
    return []
  }
}

