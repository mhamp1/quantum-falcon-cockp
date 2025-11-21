/**
 * QUANTUM FALCON COCKPIT v2025.1.0 - PRICING CONFIG HOOK
 * 
 * Central hook for accessing the canonical pricing configuration.
 * All pricing displays should use this hook instead of hard-coded values.
 */

import { useMemo } from 'react';
import pricingConfigData from '../../config/pricing_config.json';
import type { PricingConfig, PricingTier } from '@/lib/pricingTypes';

// Type assertion to ensure the JSON matches our TypeScript types
const pricingConfig = pricingConfigData as PricingConfig;

export function usePricingConfig() {
  // Sort tiers by sortOrder ascending
  const tiers = useMemo(() => {
    return [...pricingConfig.tiers].sort((a, b) => a.sortOrder - b.sortOrder);
  }, []);

  // Get only visible tiers for the pricing page
  const visibleTiers = useMemo(() => {
    return tiers.filter(tier => tier.isVisibleOnPricingPage);
  }, [tiers]);

  // Find the most popular tier
  const mostPopularTier = useMemo(() => {
    return tiers.find(tier => tier.isMostPopular);
  }, [tiers]);

  // Find whale tier (first by sort order)
  const whaleTier = useMemo(() => {
    return tiers.find(tier => tier.isWhaleTier);
  }, [tiers]);

  // Find lifetime tier
  const lifetimeTier = useMemo(() => {
    return tiers.find(tier => tier.isLifetime);
  }, [tiers]);

  // Helper function to get tier by ID
  const getTierById = useMemo(() => {
    return (id: string): PricingTier | undefined => {
      return tiers.find(tier => tier.id === id);
    };
  }, [tiers]);

  return {
    config: pricingConfig,
    tiers,
    visibleTiers,
    mostPopularTier,
    whaleTier,
    lifetimeTier,
    getTierById,
  };
}
