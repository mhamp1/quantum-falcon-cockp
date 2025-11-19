/**
 * Mock API Service for Strategies
 * Simulates /api/user/strategies endpoint with caching optimization
 */

import { StrategyData, getStrategiesForTier, ALL_STRATEGIES } from './strategiesData'

const strategyCache = new Map<string, { data: StrategyData[], timestamp: number }>()
const CACHE_TTL = 30000 // 30 seconds

/**
 * Simulates API call to get user's strategies with intelligent caching
 * In production, this would be a real API endpoint
 */
export async function fetchUserStrategies(userTier: string = 'free'): Promise<StrategyData[]> {
  // Check cache first
  const cached = strategyCache.get(userTier)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const strategies = getStrategiesForTier(userTier)
  
  // Update cache
  strategyCache.set(userTier, { data: strategies, timestamp: Date.now() })
  
  return strategies
}

/**
 * Get all available strategies (admin view)
 */
export async function fetchAllStrategies(): Promise<StrategyData[]> {
  await new Promise(resolve => setTimeout(resolve, 200))
  return ALL_STRATEGIES
}

/**
 * Get strategy by ID
 */
export async function fetchStrategyById(id: string, userTier: string = 'free'): Promise<StrategyData | null> {
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const strategies = getStrategiesForTier(userTier)
  return strategies.find(s => s.id === id) || null
}

/**
 * Toggle strategy active/paused status
 */
export async function toggleStrategyStatus(
  strategyId: string, 
  newStatus: 'active' | 'paused'
): Promise<{ success: boolean; message: string }> {
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // In production, this would update the backend
  return {
    success: true,
    message: `Strategy ${newStatus === 'active' ? 'activated' : 'paused'} successfully`
  }
}

/**
 * Filter strategies
 */
export async function filterStrategies(
  userTier: string,
  filters: {
    category?: string
    riskLevel?: string
    minWinRate?: number
    onlyUnlocked?: boolean
  }
): Promise<StrategyData[]> {
  await new Promise(resolve => setTimeout(resolve, 150))
  
  let strategies = getStrategiesForTier(userTier)
  
  if (filters.category) {
    strategies = strategies.filter(s => s.category === filters.category)
  }
  
  if (filters.riskLevel) {
    strategies = strategies.filter(s => s.risk === filters.riskLevel)
  }
  
  if (filters.minWinRate !== undefined) {
    strategies = strategies.filter(s => parseFloat(s.win_rate) >= (filters.minWinRate || 0))
  }
  
  if (filters.onlyUnlocked) {
    strategies = strategies.filter(s => s.is_unlocked)
  }
  
  return strategies
}

/**
 * Get recommended strategies for user based on tier and performance
 */
export async function getRecommendedStrategies(
  userTier: string,
  limit: number = 3
): Promise<StrategyData[]> {
  await new Promise(resolve => setTimeout(resolve, 200))
  
  const strategies = getStrategiesForTier(userTier)
  
  // Recommend unlocked strategies with high win rates that aren't active
  const recommended = strategies
    .filter(s => s.is_unlocked && s.status !== 'active')
    .sort((a, b) => parseFloat(b.win_rate) - parseFloat(a.win_rate))
    .slice(0, limit)
  
  return recommended
}
