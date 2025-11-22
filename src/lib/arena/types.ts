// Arena Types — Live Leaderboard, Battle Mode, and Strategy Performance
// November 21, 2025 — Quantum Falcon Cockpit

/**
 * Timeframe for leaderboard rankings
 */
export type ArenaTimeframe = 'daily' | 'weekly' | 'monthly'

/**
 * Battle modes
 */
export type BattleMode = 'duel' | 'tournament' | 'challenge' | 'spectator'

/**
 * Battle status
 */
export type BattleStatus = 'waiting' | 'active' | 'completed' | 'cancelled'

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
  avatar?: string
  rank: number
  arenaRating: number
  totalBattles: number
  winStreak: number
}

/**
 * Arena leaderboard response
 */
export interface ArenaLeaderboardResponse {
  timeframe: ArenaTimeframe
  updatedAt: string // ISO 8601
  entries: StrategyPerformance[]
}

/**
 * Live battle participant
 */
export interface BattleParticipant {
  userId: string
  username: string
  agentName: string
  avatar?: string
  currentPnl: number
  tradesExecuted: number
  winRate: number
  status: 'active' | 'eliminated' | 'winner'
  strategy: string // Strategy type/name
}

/**
 * Live battle data
 */
export interface LiveBattle {
  id: string
  mode: BattleMode
  status: BattleStatus
  participants: BattleParticipant[]
  startTime: string
  endTime?: string
  prizePool: number
  spectators: number
  round: number
  totalRounds: number
  marketConditions: {
    volatility: number
    trend: 'bull' | 'bear' | 'sideways'
    volume: number
  }
  winner?: string
  battleLog: BattleEvent[]
}

/**
 * Battle event for live updates
 */
export interface BattleEvent {
  id: string
  timestamp: string
  type: 'trade_executed' | 'profit_update' | 'elimination' | 'victory' | 'spectator_join' | 'commentary'
  participantId?: string
  data: any
  message: string
}

/**
 * Arena event/challenge
 */
export interface ArenaEvent {
  id: string
  title: string
  description: string
  type: 'tournament' | 'challenge' | 'special'
  startTime: string
  endTime: string
  prizePool: number
  maxParticipants: number
  currentParticipants: number
  rules: string[]
  rewards: string[]
  status: 'upcoming' | 'active' | 'completed'
}

/**
 * Spectator data
 */
export interface SpectatorData {
  battleId: string
  viewers: number
  chat: ChatMessage[]
  highlights: BattleEvent[]
}

/**
 * Chat message
 */
export interface ChatMessage {
  id: string
  userId: string
  username: string
  message: string
  timestamp: string
  type: 'chat' | 'taunt' | 'cheer' | 'prediction'
}

/**
 * Arena achievement
 */
export interface ArenaAchievement {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedBy: string[]
  reward?: {
    type: 'badge' | 'title' | 'prize'
    value: string
  }
}

/**
 * Prediction market bet
 */
export interface PredictionBet {
  id: string
  battleId: string
  predictorId: string
  predictedWinner: string
  amount: number
  odds: number
  status: 'active' | 'won' | 'lost'
}
