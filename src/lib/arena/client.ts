// Arena Client — Fetch Leaderboard Data
// November 21, 2025 — Quantum Falcon Cockpit

import type { ArenaLeaderboardResponse, ArenaTimeframe, LiveBattle, ArenaEvent } from './types'

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
      rank,
      arenaRating: Math.floor(1200 + Math.random() * 800),
      totalBattles: Math.floor(Math.random() * 50),
      winStreak: Math.floor(Math.random() * 10),
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

/**
 * Create mock battle data for development
 */
export function createMockBattles(): LiveBattle[] {
  const mockParticipants = [
    { userId: 'user_1', username: 'falcon_pilot', agentName: 'Whale Shadow', avatar: '/avatars/falcon.png' },
    { userId: 'user_2', username: 'whale_hunter', agentName: 'Momentum Tsunami', avatar: '/avatars/whale.png' },
    { userId: 'user_3', username: 'degen_king', agentName: 'Flash Crash Hunter', avatar: '/avatars/degen.png' },
    { userId: 'user_4', username: 'sol_sniper', agentName: 'Arbitrage Phantom', avatar: '/avatars/sol.png' },
  ]

  return Array.from({ length: 6 }, (_, i) => {
    const participants = mockParticipants.slice(0, Math.random() > 0.3 ? 2 : 1)
    const isActive = participants.length === 2

    return {
      id: `battle_${i + 1}`,
      mode: Math.random() > 0.5 ? 'duel' : 'tournament' as const,
      status: isActive ? 'active' : 'waiting' as const,
      participants: participants.map(p => ({
        ...p,
        currentPnl: (Math.random() - 0.5) * 2000,
        tradesExecuted: Math.floor(Math.random() * 20),
        winRate: 40 + Math.random() * 40,
        status: 'active' as const,
        strategy: p.agentName,
      })),
      startTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      prizePool: Math.floor(100 + Math.random() * 900),
      spectators: Math.floor(Math.random() * 50),
      round: Math.floor(Math.random() * 5) + 1,
      totalRounds: 5,
      marketConditions: {
        volatility: Math.random(),
        trend: ['bull', 'bear', 'sideways'][Math.floor(Math.random() * 3)] as const,
        volume: Math.random() * 1000000,
      },
      battleLog: [],
    }
  })
}

/**
 * Create mock arena events for development
 */
export function createMockArenaEvents(): ArenaEvent[] {
  return [
    {
      id: 'weekly-championship',
      title: 'Weekly Championship',
      description: 'Battle it out for the weekly crown and $10,000 prize pool!',
      type: 'tournament',
      startTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      endTime: new Date(Date.now() + 86400000 * 7).toISOString(),
      prizePool: 10000,
      maxParticipants: 64,
      currentParticipants: 23,
      rules: ['Elimination bracket', 'Best of 5 rounds', 'Minimum $100 stake'],
      rewards: ['$5000 first place', '$2000 second place', 'Elite badge'],
      status: 'upcoming' as const,
    },
    {
      id: 'flash-duel-tournament',
      title: 'Flash Duel Championship',
      description: 'Ultra-fast 1v1 battles with instant payouts',
      type: 'tournament',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour
      prizePool: 2500,
      maxParticipants: 32,
      currentParticipants: 18,
      rules: ['Single elimination', '3-minute rounds', 'Live spectators'],
      rewards: ['$1000 winner', 'Flash Master badge'],
      status: 'active' as const,
    },
    {
      id: 'ai-showdown',
      title: 'AI Agent Showdown',
      description: 'Watch the most advanced trading AIs compete head-to-head',
      type: 'challenge',
      startTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      endTime: new Date(Date.now() + 3600000 * 2).toISOString(),
      prizePool: 5000,
      maxParticipants: 8,
      currentParticipants: 8,
      rules: ['AI vs AI only', 'No human intervention', 'Algorithm battle'],
      rewards: ['Algorithm Crown', '$2000 development grant'],
      status: 'upcoming' as const,
    },
  ]
}
