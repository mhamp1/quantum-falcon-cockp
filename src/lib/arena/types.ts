// Arena Types — Live Leaderboard and Strategy Performance
// November 21, 2025 — Quantum Falcon Cockpit

/**
 * Timeframe for leaderboard rankings
 */
export type ArenaTimeframe = 'daily' | 'weekly' | 'monthly'

/**
 * Strategy performance entry in leaderboard
 */
export interface StrategyPerformance {
  agentName: string
  userId: string
  username: string
  pnlUsd: number
  pnlPct: number
  winRatePct: number
  trades: number
  sharpe: number
  streakDaysTop10: number
  badges: string[]
  timeframe: ArenaTimeframe
}

/**
 * Arena leaderboard response
 */
export interface ArenaLeaderboardResponse {
  timeframe: ArenaTimeframe
  updatedAt: string // ISO 8601
  entries: StrategyPerformance[]
}
