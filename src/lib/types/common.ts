// Common Type Definitions — Production-Ready
// November 24, 2025 — Quantum Falcon Cockpit
// Centralized type definitions to replace 'any' types

/**
 * Generic API Response
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Paginated Response
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * Trading Types
 */
export interface Trade {
  id: string
  timestamp: number
  symbol: string
  side: 'buy' | 'sell'
  amount: number
  price: number
  fee: number
  profit?: number
  status: 'pending' | 'completed' | 'failed'
  txId?: string
}

export interface MarketSnapshot {
  symbol: string
  price: number
  volume24h: number
  change24h: number
  high24h: number
  low24h: number
  timestamp: number
}

/**
 * Agent Types
 */
export interface Agent {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ size?: number; weight?: string }>
  level: number
  xp: number
  maxXp: number
  confidence: number
  avgConfidence: number
  actions: number
  profit: number
  performance: number
  status: 'active' | 'paused' | 'locked'
  requiredTier: string
  specialties: string[]
  metrics: {
    cpu: number
    memory: number
    latency: number
  }
  synergy: Record<string, number>
  recentOutcomes: Array<{
    timestamp: number
    outcome: 'win' | 'loss' | 'neutral'
    profit?: number
  }>
}

/**
 * Strategy Types
 */
export interface Strategy {
  id: string
  name: string
  type: string
  description: string
  longDescription: string
  benefits: string[]
  requiredTier: string
  status: 'active' | 'paused' | 'locked'
  pnl?: number
  pnlPercent?: number
  tradesExecuted?: number
  winRate?: number
  risk: 'low' | 'medium' | 'high'
}

/**
 * User Types
 */
export interface UserProfile {
  id: string
  username: string
  email: string
  avatar?: string
  tier: string
  level: number
  xp: number
  totalTrades: number
  winRate: number
  totalProfit: number
  memberSince: number
}

/**
 * License Types
 */
export interface LicenseData {
  key: string
  tier: string
  expiresAt?: number
  features: string[]
  strategies: string[]
  maxAgents: number
  isExpired: boolean
}

/**
 * Component Props Types
 */
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

/**
 * Hook Return Types
 */
export interface UseStateReturn<T> {
  value: T
  setValue: (value: T | ((prev: T) => T)) => void
  reset: () => void
}

/**
 * API Error Types
 */
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: number
}

/**
 * Event Types
 */
export interface AppEvent {
  type: string
  payload: Record<string, unknown>
  timestamp: number
  userId?: string
}

/**
 * Utility Types
 */
export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined

/**
 * Function Types
 */
export type AsyncFunction<T = void> = () => Promise<T>
export type Callback<T = void> = () => T
export type EventHandler<T = unknown> = (event: T) => void

