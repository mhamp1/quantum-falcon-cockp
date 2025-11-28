// Arena Client — Fetch Leaderboard Data (REAL DATA ONLY)
// November 28, 2025 — Quantum Falcon Cockpit
// ALL MOCK DATA REMOVED — Uses real API endpoints

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
    // Return empty leaderboard instead of mock data
    return {
      timeframe,
      updatedAt: new Date().toISOString(),
      entries: [],
    }
  }
}

/**
 * Fetch live battles from backend
 */
export async function fetchLiveBattles(): Promise<LiveBattle[]> {
  try {
    const response = await fetch('/api/arena/battles')
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('❌ Arena: Failed to fetch battles', error)
    return []
  }
}

/**
 * Fetch arena events from backend
 */
export async function fetchArenaEvents(): Promise<ArenaEvent[]> {
  try {
    const response = await fetch('/api/arena/events')
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('❌ Arena: Failed to fetch events', error)
    return []
  }
}

/**
 * Join a battle
 */
export async function joinBattle(battleId: string, agentId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/arena/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ battleId, agentId }),
    })
    
    return response.ok
  } catch (error) {
    console.error('❌ Arena: Failed to join battle', error)
    return false
  }
}

/**
 * Create a new battle challenge
 */
export async function createBattleChallenge(params: {
  mode: 'duel' | 'tournament'
  stake: number
  agentId: string
}): Promise<{ success: boolean; battleId?: string }> {
  try {
    const response = await fetch('/api/arena/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })
    
    if (!response.ok) {
      return { success: false }
    }
    
    const data = await response.json()
    return { success: true, battleId: data.battleId }
  } catch (error) {
    console.error('❌ Arena: Failed to create battle', error)
    return { success: false }
  }
}
