/**
 * License Features Module
 * Tier feature definitions and feature checking
 */

import type { LicenseTier, TierFeatures } from './types'
import { TIER_DEFINITIONS } from './constants'

/**
 * Get tier features - SINGLE SOURCE OF TRUTH
 * All repos use this function to get feature lists
 */
export function getTierFeatures(tier: LicenseTier): string[] {
  const tierDef = TIER_DEFINITIONS[tier]
  return tierDef ? tierDef.features : TIER_DEFINITIONS.free.features
}

/**
 * Get complete tier definition
 */
export function getTierDefinition(tier: LicenseTier): TierFeatures {
  return TIER_DEFINITIONS[tier] || TIER_DEFINITIONS.free
}

/**
 * Get all tier definitions
 */
export function getAllTierDefinitions(): Record<LicenseTier, TierFeatures> {
  return TIER_DEFINITIONS
}

/**
 * Check if tier has specific feature
 */
export function tierHasFeature(tier: LicenseTier, feature: string): boolean {
  const features = getTierFeatures(tier)
  return features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
}

/**
 * Get tier limits
 */
export function getTierLimits(tier: LicenseTier) {
  return TIER_DEFINITIONS[tier]?.limits || TIER_DEFINITIONS.free.limits
}

/**
 * Check if limit is unlimited (-1)
 */
export function isUnlimited(limit: number): boolean {
  return limit === -1
}

/**
 * Get tier price
 */
export function getTierPrice(tier: LicenseTier): number {
  return TIER_DEFINITIONS[tier]?.price || 0
}

/**
 * Get tier duration in days
 */
export function getTierDuration(tier: LicenseTier): number {
  return TIER_DEFINITIONS[tier]?.duration || 30
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: LicenseTier): string {
  return TIER_DEFINITIONS[tier]?.displayName || 'Unknown'
}

/**
 * Check if tier is paid
 */
export function isPaidTier(tier: LicenseTier): boolean {
  return tier !== 'free'
}

/**
 * Get upgrade path (next tier)
 */
export function getUpgradePath(currentTier: LicenseTier): LicenseTier | null {
  const upgradePaths: Record<LicenseTier, LicenseTier | null> = {
    free: 'pro',
    pro: 'elite',
    elite: 'lifetime',
    lifetime: null
  }
  return upgradePaths[currentTier]
}

/**
 * Calculate upgrade cost
 */
export function calculateUpgradeCost(
  fromTier: LicenseTier,
  toTier: LicenseTier,
  daysRemaining: number
): number {
  const fromPrice = getTierPrice(fromTier)
  const toPrice = getTierPrice(toTier)
  const fromDuration = getTierDuration(fromTier)

  // Calculate prorated credit
  const credit = (fromPrice / fromDuration) * daysRemaining

  // New price minus credit
  return Math.max(0, toPrice - credit)
}

/**
 * Get tier comparison for display
 */
export function compareTiersForDisplay(
  tier1: LicenseTier,
  tier2: LicenseTier
): {
  higherTier: LicenseTier
  lowerTier: LicenseTier
  additionalFeatures: string[]
  priceDifference: number
} {
  const hierarchy: LicenseTier[] = ['free', 'pro', 'elite', 'lifetime']
  const tier1Index = hierarchy.indexOf(tier1)
  const tier2Index = hierarchy.indexOf(tier2)

  const higherTier = tier1Index > tier2Index ? tier1 : tier2
  const lowerTier = tier1Index > tier2Index ? tier2 : tier1

  const higherFeatures = getTierFeatures(higherTier)
  const lowerFeatures = getTierFeatures(lowerTier)

  // Find additional features
  const additionalFeatures = higherFeatures.filter(
    f => !lowerFeatures.includes(f)
  )

  const priceDifference = getTierPrice(higherTier) - getTierPrice(lowerTier)

  return {
    higherTier,
    lowerTier,
    additionalFeatures,
    priceDifference
  }
}

/**
 * Get recommended tier based on usage
 */
export function getRecommendedTier(usage: {
  aiAgentsNeeded: number
  strategiesNeeded: number
  exchangesNeeded: number
  apiCallsPerDay: number
}): LicenseTier {
  // Check each tier from highest to lowest
  const tiers: LicenseTier[] = ['elite', 'pro', 'free']

  for (const tier of tiers) {
    const limits = getTierLimits(tier)

    const meetsAiAgents = isUnlimited(limits.aiAgents) || 
      usage.aiAgentsNeeded <= limits.aiAgents
    const meetsStrategies = isUnlimited(limits.strategies) || 
      usage.strategiesNeeded <= limits.strategies
    const meetsExchanges = isUnlimited(limits.exchanges) || 
      usage.exchangesNeeded <= limits.exchanges
    const meetsApiCalls = isUnlimited(limits.apiCallsPerDay) || 
      usage.apiCallsPerDay <= limits.apiCallsPerDay

    if (meetsAiAgents && meetsStrategies && meetsExchanges && meetsApiCalls) {
      return tier
    }
  }

  // If free doesn't meet needs, recommend pro
  return 'pro'
}

/**
 * Format tier features for display
 */
export function formatFeaturesForDisplay(tier: LicenseTier): string[] {
  return getTierFeatures(tier).map(feature => {
    // Add checkmark emoji to each feature
    return `✓ ${feature}`
  })
}

/**
 * Get tier badge color
 */
export function getTierBadgeColor(tier: LicenseTier): string {
  const colors: Record<LicenseTier, string> = {
    free: '#6B7280',    // gray
    pro: '#3B82F6',     // blue
    elite: '#8B5CF6',   // purple
    lifetime: '#F59E0B' // amber/gold
  }
  return colors[tier] || colors.free
}
