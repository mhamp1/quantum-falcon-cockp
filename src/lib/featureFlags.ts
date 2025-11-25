// Feature Flags System — Gradual Rollouts & A/B Testing
// November 24, 2025 — Quantum Falcon Cockpit
// Production-ready feature flag management

import { useKVSafe } from '@/hooks/useKVFallback'
import { logger } from './logger'

/**
 * Feature Flags Configuration
 * Toggle features on/off without code deployment
 */
export interface FeatureFlag {
  id: string
  name: string
  description: string
  enabled: boolean
  rolloutPercentage?: number // 0-100, for gradual rollouts
  enabledForTiers?: string[] // Specific tiers only
  enabledForUsers?: string[] // Specific user IDs
  metadata?: Record<string, unknown>
}

/**
 * Default Feature Flags
 */
export const DEFAULT_FEATURE_FLAGS: Record<string, FeatureFlag> = {
  NEW_DASHBOARD: {
    id: 'NEW_DASHBOARD',
    name: 'New Dashboard Design',
    description: 'Enhanced dashboard with better analytics',
    enabled: false,
    rolloutPercentage: 0
  },
  BETA_STRATEGIES: {
    id: 'BETA_STRATEGIES',
    name: 'Beta Trading Strategies',
    description: 'Access to experimental trading strategies',
    enabled: true,
    enabledForTiers: ['pro', 'elite', 'lifetime']
  },
  EXPERIMENTAL_AI: {
    id: 'EXPERIMENTAL_AI',
    name: 'Experimental AI Features',
    description: 'Early access to new AI capabilities',
    enabled: false,
    enabledForTiers: ['elite', 'lifetime']
  },
  RENTAL_SYSTEM: {
    id: 'RENTAL_SYSTEM',
    name: 'Strategy Rental System',
    description: 'Rent strategies for limited time',
    enabled: true
  },
  DAILY_CHALLENGES: {
    id: 'DAILY_CHALLENGES',
    name: 'Daily Challenges',
    description: 'Daily trading challenges with rewards',
    enabled: true
  },
  ML_RECOMMENDATIONS: {
    id: 'ML_RECOMMENDATIONS',
    name: 'ML-Powered Recommendations',
    description: 'Machine learning strategy recommendations',
    enabled: true
  }
}

/**
 * Feature Flags Manager
 */
class FeatureFlagsManager {
  private flags: Record<string, FeatureFlag> = { ...DEFAULT_FEATURE_FLAGS }

  /**
   * Check if a feature is enabled
   */
  isEnabled(
    flagId: string,
    userId?: string,
    userTier?: string
  ): boolean {
    const flag = this.flags[flagId]
    if (!flag) {
      logger.warn(`Feature flag "${flagId}" not found`, 'FeatureFlags')
      return false
    }

    if (!flag.enabled) {
      return false
    }

    // Check tier restrictions
    if (flag.enabledForTiers && userTier) {
      if (!flag.enabledForTiers.includes(userTier.toLowerCase())) {
        return false
      }
    }

    // Check user-specific enablement
    if (flag.enabledForUsers && userId) {
      if (flag.enabledForUsers.includes(userId)) {
        return true
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined) {
      if (userId) {
        // Deterministic rollout based on user ID
        const hash = this.hashUserId(userId)
        const userPercentage = (hash % 100)
        return userPercentage < flag.rolloutPercentage
      }
      return false
    }

    return true
  }

  /**
   * Get feature flag
   */
  getFlag(flagId: string): FeatureFlag | undefined {
    return this.flags[flagId]
  }

  /**
   * Update feature flag
   */
  updateFlag(flagId: string, updates: Partial<FeatureFlag>): void {
    if (!this.flags[flagId]) {
      logger.warn(`Cannot update non-existent flag "${flagId}"`, 'FeatureFlags')
      return
    }

    this.flags[flagId] = {
      ...this.flags[flagId],
      ...updates
    }

    logger.info(`Feature flag "${flagId}" updated`, 'FeatureFlags', updates)
  }

  /**
   * Get all flags
   */
  getAllFlags(): Record<string, FeatureFlag> {
    return { ...this.flags }
  }

  /**
   * Hash user ID for deterministic rollout
   */
  private hashUserId(userId: string): number {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}

export const featureFlagsManager = new FeatureFlagsManager()

/**
 * React hook for feature flags
 */
export function useFeatureFlag(flagId: string, userId?: string, userTier?: string): boolean {
  const [flags] = useKVSafe<Record<string, FeatureFlag>>('feature-flags', DEFAULT_FEATURE_FLAGS)
  
  // Update manager with latest flags
  Object.keys(flags).forEach(key => {
    featureFlagsManager.updateFlag(key, flags[key])
  })

  return featureFlagsManager.isEnabled(flagId, userId, userTier)
}

/**
 * Check feature flag (non-hook version)
 */
export function isFeatureEnabled(flagId: string, userId?: string, userTier?: string): boolean {
  return featureFlagsManager.isEnabled(flagId, userId, userTier)
}

