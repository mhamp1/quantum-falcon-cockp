// Arena Client — Fetch Leaderboard Data
// November 21, 2025 — Quantum Falcon Cockpit

import type { ArenaLeaderboardResponse, ArenaTimeframe } from './types'

/**
 * Fetch arena leaderboard from backend
 */
export async function fetchArenaLeaderboard(
  timeframe: ArenaTimeframe
): Promise<ArenaLeaderboardResponse> {
  try {
    const response = await fetch(`/api/arena/leaderboard?timeframe=${timeframe}`)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const data: ArenaLeaderboardResponse = await response.json()
    return data
  } catch (error) {
    console.error('❌ Arena: Failed to fetch leaderboard', error)
    throw error
  }
}

/**
 * Create mock leaderboard data for development
 */
export function createMockLeaderboard(timeframe: ArenaTimeframe): ArenaLeaderboardResponse {
  const mockUsernames = [
    'falcon_pilot', 'whale_hunter', 'degen_king', 'sol_sniper',
    'moon_walker', 'diamond_hands', 'ape_alpha', 'flash_trader',
    'grid_master', 'arb_phantom', 'mev_slayer', 'dca_chad'
  ]
  
  const mockAgents = [
    'Whale Shadow', 'Momentum Tsunami', 'Flash Crash Hunter', 'Grid Master',
    'Arbitrage Phantom', 'MEV Defender', 'Liquidity Hunter', 'Risk Guardian',
    'Mean Reversion Classic', 'Time Warp Trader', 'Quantum Ensemble'
  ]
  
  const mockBadges = [
    'Whale Slayer', '100% Win Week', 'Consecutive Winner', 'Risk Manager',
    'Volatility Crusher', 'Profit Machine', 'Diamond Hands', 'Quick Draw',
    'Top 10 Streak', 'Flash Master'
  ]
  
  const entries = Array.from({ length: 20 }, (_, i) => {
    const rank = i + 1
    const basePnl = 10000 / Math.pow(rank, 0.8)
    const pnlUsd = basePnl * (0.8 + Math.random() * 0.4)
    
    return {
      agentName: mockAgents[Math.floor(Math.random() * mockAgents.length)],
      userId: `user_${i + 1}`,
      username: mockUsernames[i % mockUsernames.length],
      pnlUsd: Math.round(pnlUsd * 100) / 100,
      pnlPct: Math.round((20 + Math.random() * 80) * 10) / 10,
      winRatePct: Math.round((50 + Math.random() * 40) * 10) / 10,
      trades: Math.floor(50 + Math.random() * 200),
      sharpe: Math.round((1 + Math.random() * 2) * 100) / 100,
      streakDaysTop10: Math.floor(Math.random() * 10),
      badges: Array.from(
        { length: Math.floor(Math.random() * 3) },
        () => mockBadges[Math.floor(Math.random() * mockBadges.length)]
      ),
      timeframe,
    }
  })
  
  // Sort by PnL
  entries.sort((a, b) => b.pnlUsd - a.pnlUsd)
  
  return {
    timeframe,
    updatedAt: new Date().toISOString(),
    entries,
  }
}
