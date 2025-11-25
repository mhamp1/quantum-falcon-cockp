// Agent Data API — Real-time Agent Performance Data
// November 22, 2025 — Quantum Falcon Cockpit
// ALL DATA MUST BE LIVE — NO MOCK DATA

import { logger } from '../logger'

export interface AgentOutcome {
  date: string
  pnl: number
  confidence: number
}

export interface AgentPerformanceData {
  agentId: string
  outcomes: AgentOutcome[]
  totalTrades: number
  winRate: number
  totalPnL: number
}

const API_ENDPOINT = import.meta.env.VITE_TRADING_API_ENDPOINT || '/api'

/**
 * Fetch real agent performance outcomes from backend
 * Returns empty array if no account or no data yet
 */
export async function fetchAgentOutcomes(
  agentId: string,
  count: number = 20
): Promise<AgentOutcome[]> {
  try {
    const response = await fetch(`${API_ENDPOINT}/agents/${agentId}/outcomes?count=${count}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        // No data yet - return empty (user hasn't traded yet)
        return []
      }
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()
    return data.outcomes || []
  } catch (error) {
    logger.warn(`[AgentData] Failed to fetch outcomes for ${agentId}:`, error)
    // Return empty array - no mock data
    return []
  }
}

/**
 * Fetch all agent performance data
 */
export async function fetchAllAgentPerformance(): Promise<AgentPerformanceData[]> {
  try {
    const response = await fetch(`${API_ENDPOINT}/agents/performance`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return []
      }
      throw new Error(`API returned ${response.status}`)
    }

    const data = await response.json()
    return data.agents || []
  } catch (error) {
    logger.warn('[AgentData] Failed to fetch agent performance:', error)
    return []
  }
}

