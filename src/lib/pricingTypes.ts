/**
 * QUANTUM FALCON COCKPIT v2025.1.0 - PRICING TYPE DEFINITIONS
 * 
 * Canonical TypeScript types for the pricing configuration system.
 * These types align exactly with the structure in config/pricing_config.json
 */

export interface StrategyLibraryInfo {
  count: number | null;
  label: string;
}

export interface AiAgentsInfo {
  count: number | null;
  label: string;
}

export interface MultiplierInfo {
  value: number | null;
  label: string;
}

export interface TotalPowerInfo {
  value: number | null;
  label: string;
}

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  billingPeriod: 'month' | 'once';
  priceDisplay: string;
  strategyLibrary: StrategyLibraryInfo;
  aiAgents: AiAgentsInfo;
  multiplier: MultiplierInfo;
  keyPerks: string[];
  totalPower: TotalPowerInfo;
  isMostPopular: boolean;
  isWhaleTier: boolean;
  isLifetime: boolean;
  isVisibleOnPricingPage: boolean;
  sortOrder: number;
}

export interface PricingNotes {
  freeTierRole: string;
  starterNarrative: string;
  traderNarrative: string;
  proTraderNarrative: string;
  eliteNarrative: string;
  lifetimeNarrative: string;
}

export interface PricingConfig {
  version: string;
  effectiveDate: string;
  currency: string;
  tiers: PricingTier[];
  notes: PricingNotes;
}
