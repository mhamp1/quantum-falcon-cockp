// ═══════════════════════════════════════════════════════════════
// BACKEND API CLIENT HOOK
// Connects frontend to Quantum Falcon Backend for live trading
// November 28, 2025 — Quantum Falcon Cockpit
// ═══════════════════════════════════════════════════════════════

import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { usePersistentAuth } from '@/lib/auth/usePersistentAuth'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface Trade {
  id: string
  side: 'buy' | 'sell'
  inputToken: string
  outputToken: string
  inputAmount: number
  outputAmount: number
  status: string
  signature?: string
  pnl?: number
  executedAt: string
}

interface Position {
  id: string
  token: string
  symbol: string
  amount: number
  entryPrice: number
  currentPrice?: number
  stopLossPrice: number
  takeProfitPrice: number
  unrealizedPnL?: number
  status: string
}

interface LiveTradingData {
  portfolioValue: number
  dailyPnL: number
  winRate: number
  activeTrades: number
  totalTrades: number
  weeklyWinRate: number
  dailyStreak: number
  lastUpdated: number
  positions: Position[]
  recentTrades: Trade[]
}

interface TradingStats {
  totalTrades: number
  successfulTrades: number
  failedTrades: number
  totalVolume: number
  totalPnL: number
  winRate: number
  avgPnL: number
}

interface ExecuteTradeParams {
  side: 'buy' | 'sell'
  inputToken: string
  outputToken: string
  amount: number
  slippageBps?: number
}

interface ExecuteTradeResult {
  success: boolean
  signature?: string
  error?: string
  inputAmount?: number
  outputAmount?: number
  priceImpact?: number
  route?: string
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

// In production, only use backend if explicitly configured
// Never fallback to localhost in production
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001')
const BACKEND_AVAILABLE = !!BACKEND_URL

// ═══════════════════════════════════════════════════════════════
// API CLIENT HOOK
// ═══════════════════════════════════════════════════════════════

export function useBackendAPI() {
  const { auth } = usePersistentAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)

  // Get authorization header
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('qf-auth-token')
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    }
  }, [])

  // Generic fetch wrapper
  const apiFetch = useCallback(async <T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> => {
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }, [getAuthHeaders])

  // Check backend connection
  const checkConnection = useCallback(async () => {
    try {
      const health = await apiFetch<{ status: string }>('/health')
      setIsConnected(health.status === 'healthy')
      setLastError(null)
      return true
    } catch (error: any) {
      setIsConnected(false)
      setLastError(error.message)
      return false
    }
  }, [apiFetch])

  // Check connection on mount
  useEffect(() => {
    checkConnection()
    
    // Recheck every 30 seconds
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [checkConnection])

  // ─── TRADING API ───

  /**
   * Get live trading data
   */
  const getLiveTradingData = useCallback(async (): Promise<LiveTradingData | null> => {
    if (!auth?.isAuthenticated) return null

    try {
      setIsLoading(true)
      const data = await apiFetch<LiveTradingData>('/api/trading/live')
      return data
    } catch (error: any) {
      console.error('[BackendAPI] Live data fetch failed:', error)
      setLastError(error.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [apiFetch, auth?.isAuthenticated])

  /**
   * Execute a trade via backend
   */
  const executeTrade = useCallback(async (
    params: ExecuteTradeParams
  ): Promise<ExecuteTradeResult> => {
    if (!auth?.isAuthenticated) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      setIsLoading(true)
      toast.loading('Executing trade...', { id: 'backend-trade' })

      const result = await apiFetch<ExecuteTradeResult>('/api/trading/execute', {
        method: 'POST',
        body: JSON.stringify(params),
      })

      toast.dismiss('backend-trade')

      if (result.success) {
        toast.success('Trade Executed', {
          description: `${params.side.toUpperCase()} completed`,
          action: result.signature ? {
            label: 'View TX',
            onClick: () => window.open(`https://solscan.io/tx/${result.signature}`, '_blank'),
          } : undefined,
        })
      } else {
        toast.error('Trade Failed', { description: result.error })
      }

      return result
    } catch (error: any) {
      toast.dismiss('backend-trade')
      toast.error('Trade Error', { description: error.message })
      return { success: false, error: error.message }
    } finally {
      setIsLoading(false)
    }
  }, [apiFetch, auth?.isAuthenticated])

  /**
   * Get trade history
   */
  const getTradeHistory = useCallback(async (
    limit: number = 100,
    offset: number = 0
  ): Promise<Trade[]> => {
    if (!auth?.isAuthenticated) return []

    try {
      const result = await apiFetch<{ trades: Trade[] }>(
        `/api/trading/history?limit=${limit}&offset=${offset}`
      )
      return result.trades
    } catch (error: any) {
      console.error('[BackendAPI] History fetch failed:', error)
      return []
    }
  }, [apiFetch, auth?.isAuthenticated])

  /**
   * Get trading stats
   */
  const getTradingStats = useCallback(async (
    period: '24h' | '7d' | '30d' | 'all' = '30d'
  ): Promise<TradingStats | null> => {
    if (!auth?.isAuthenticated) return null

    try {
      return await apiFetch<TradingStats>(`/api/trading/stats?period=${period}`)
    } catch (error: any) {
      console.error('[BackendAPI] Stats fetch failed:', error)
      return null
    }
  }, [apiFetch, auth?.isAuthenticated])

  // ─── POSITION API ───

  /**
   * Get open positions
   */
  const getPositions = useCallback(async (): Promise<Position[]> => {
    if (!auth?.isAuthenticated) return []

    try {
      const result = await apiFetch<{ positions: Position[] }>('/api/positions')
      return result.positions
    } catch (error: any) {
      console.error('[BackendAPI] Positions fetch failed:', error)
      return []
    }
  }, [apiFetch, auth?.isAuthenticated])

  /**
   * Close a position
   */
  const closePosition = useCallback(async (positionId: string): Promise<boolean> => {
    if (!auth?.isAuthenticated) return false

    try {
      toast.loading('Closing position...', { id: 'close-position' })
      
      await apiFetch(`/api/positions/${positionId}/close`, { method: 'POST' })
      
      toast.dismiss('close-position')
      toast.success('Position Closed')
      
      return true
    } catch (error: any) {
      toast.dismiss('close-position')
      toast.error('Failed to close position', { description: error.message })
      return false
    }
  }, [apiFetch, auth?.isAuthenticated])

  /**
   * Update position stop-loss/take-profit
   */
  const updatePosition = useCallback(async (
    positionId: string,
    data: { stopLossPrice?: number; takeProfitPrice?: number }
  ): Promise<boolean> => {
    if (!auth?.isAuthenticated) return false

    try {
      await apiFetch(`/api/positions/${positionId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
      
      toast.success('Position Updated')
      return true
    } catch (error: any) {
      toast.error('Update Failed', { description: error.message })
      return false
    }
  }, [apiFetch, auth?.isAuthenticated])

  // ─── TRADING CONTROLS ───

  /**
   * Pause trading
   */
  const pauseTrading = useCallback(async (reason?: string): Promise<boolean> => {
    try {
      await apiFetch('/api/trading/pause', {
        method: 'POST',
        body: JSON.stringify({ reason }),
      })
      toast.warning('Trading Paused', { description: reason })
      return true
    } catch (error: any) {
      toast.error('Failed to pause', { description: error.message })
      return false
    }
  }, [apiFetch])

  /**
   * Resume trading
   */
  const resumeTrading = useCallback(async (): Promise<boolean> => {
    try {
      await apiFetch('/api/trading/resume', { method: 'POST' })
      toast.success('Trading Resumed')
      return true
    } catch (error: any) {
      toast.error('Failed to resume', { description: error.message })
      return false
    }
  }, [apiFetch])

  /**
   * Emergency stop
   */
  const emergencyStop = useCallback(async (): Promise<boolean> => {
    try {
      await apiFetch('/api/trading/emergency-stop', { method: 'POST' })
      toast.error('🚨 EMERGENCY STOP', {
        description: 'All trading halted immediately',
        duration: 10000,
      })
      return true
    } catch (error: any) {
      toast.error('Emergency stop failed!', { description: error.message })
      return false
    }
  }, [apiFetch])

  return {
    // Connection state
    isConnected,
    isLoading,
    lastError,
    checkConnection,
    
    // Trading
    getLiveTradingData,
    executeTrade,
    getTradeHistory,
    getTradingStats,
    
    // Positions
    getPositions,
    closePosition,
    updatePosition,
    
    // Controls
    pauseTrading,
    resumeTrading,
    emergencyStop,
  }
}

export default useBackendAPI

