// Challenge Leaderboard API — Real-time Challenge Data
// November 22, 2025 — Quantum Falcon Cockpit
// ALL DATA MUST BE LIVE — NO MOCK DATA

import { logger } from '../logger'

export interface LeaderboardEntry {
  userId: string
  username: string
  avatar: string
  totalCompleted: number
  streak: number
  level: number
  xp: number
  rank: number
  badges: string[]
}

const API_ENDPOINT = import.meta.env.VITE_TRADING_API_ENDPOINT || '/api'

/**
 * Fetch real challenge leaderboard from backend
 * Returns empty array if no data yet
 */
export async function fetchChallengeLeaderboard(
  timeframe: 'daily' | 'weekly' | 'all-time' = 'all-time'
): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch(`${API_ENDPOINT}/challenges/leaderboard?timeframe=${timeframe}`, {
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
    return data.entries || []
  } catch (error) {
    logger.warn('[Challenge] Failed to fetch leaderboard:', error)
    // Return empty array - no mock data
    return []
  }
}

