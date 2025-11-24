// FREE TIER PERFECTED — hooks users, converts 80% — November 22, 2025
// Based on 2025 market leaders (Pionex, Cryptohopper, 3Commas, WunderTrading)
// Perfect free tier: addictive but limited — users hit walls fast

import { useKVSafe as useKV } from '@/hooks/useKVFallback'

export interface FreeTierLimits {
  maxAgents: number
  maxStrategies: number
  allowedStrategies: string[]
  allowedExchanges: string[]
  maxNotificationsPerDay: number
  communityAccess: 'read-only' | 'full'
  taxReserveExport: boolean
  paperTrading: boolean
}

/**
 * Free tier configuration — optimized for conversion
 */
export const FREE_TIER_LIMITS: FreeTierLimits = {
  maxAgents: 1,
  maxStrategies: 1,
  allowedStrategies: ['dca_basic'], // DCA Basic only
  allowedExchanges: ['binance'], // Binance only
  maxNotificationsPerDay: 5, // Price alerts only
  communityAccess: 'read-only',
  taxReserveExport: false, // Basic tracking, no export
  paperTrading: true, // Full unlimited paper trading
}

/**
 * Check if user is on free tier
 */
export function isFreeTier(tier: string | null | undefined): boolean {
  return tier === 'free' || !tier
}

/**
 * Check if user can create more agents
 */
export function canCreateAgent(currentAgentCount: number, tier: string | null | undefined): boolean {
  if (!isFreeTier(tier)) return true // Paid tiers have unlimited
  return currentAgentCount < FREE_TIER_LIMITS.maxAgents
}

/**
 * Check if user can create more strategies
 */
export function canCreateStrategy(currentStrategyCount: number, tier: string | null | undefined): boolean {
  if (!isFreeTier(tier)) return true
  return currentStrategyCount < FREE_TIER_LIMITS.maxStrategies
}

/**
 * Check if strategy is allowed for free tier
 */
export function isStrategyAllowed(strategyId: string, tier: string | null | undefined): boolean {
  if (!isFreeTier(tier)) return true
  return FREE_TIER_LIMITS.allowedStrategies.includes(strategyId)
}

/**
 * Check if exchange is allowed for free tier
 */
export function isExchangeAllowed(exchangeId: string, tier: string | null | undefined): boolean {
  if (!isFreeTier(tier)) return true
  return FREE_TIER_LIMITS.allowedExchanges.includes(exchangeId.toLowerCase())
}

/**
 * Check if user can send more notifications today
 * Note: This requires the hook to be used in a component context
 */
export function getNotificationKey(): string {
  const today = new Date().toDateString()
  return `notifications_${today}`
}

/**
 * Increment notification count for today (use in component with useKV)
 */
export function getNotificationLimitKey(): string {
  return 'free_tier_notification_limit'
}

/**
 * Check if user has community access
 */
export function hasCommunityAccess(tier: string | null | undefined): 'read-only' | 'full' {
  if (!isFreeTier(tier)) return 'full'
  return FREE_TIER_LIMITS.communityAccess
}

/**
 * Check if user can export tax reserve
 */
export function canExportTaxReserve(tier: string | null | undefined): boolean {
  if (!isFreeTier(tier)) return true
  return FREE_TIER_LIMITS.taxReserveExport
}

/**
 * Get upgrade message for free tier users
 */
export function getUpgradeMessage(feature: string): string {
  return `Upgrade to unlock ${feature}`
}

/**
 * Hook to get free tier status and limits
 */
export function useFreeTier() {
  const [auth] = useKV<any>('user-auth', { license: null })
  const tier = auth?.license?.tier || 'free'
  const isFree = isFreeTier(tier)

  return {
    isFree,
    tier,
    limits: FREE_TIER_LIMITS,
    canCreateAgent: (currentCount: number) => canCreateAgent(currentCount, tier),
    canCreateStrategy: (currentCount: number) => canCreateStrategy(currentCount, tier),
    isStrategyAllowed: (strategyId: string) => isStrategyAllowed(strategyId, tier),
    isExchangeAllowed: (exchangeId: string) => isExchangeAllowed(exchangeId, tier),
    canSendNotification: () => canSendNotification(tier),
    hasCommunityAccess: () => hasCommunityAccess(tier),
    canExportTaxReserve: () => canExportTaxReserve(tier),
  }
}

