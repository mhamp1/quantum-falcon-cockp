// FINAL AI NFT COLLECTION ENGINE — Generates images + metadata + mints on-chain with rarity — November 22, 2025
// Quantum Falcon v2025.1.0 — Production Ready

// RARITY TIERS AND TYPES ONLY — Wallet dependencies removed to prevent white screen issues
// November 22, 2025 — Quantum Falcon Cockpit

// Rarity tiers with perfect distribution
export const RARITY_TIERS = {
  legendary: { 
    chance: 0.01,   // 1%
    count: 10, 
    color: '#FFD700',
    name: 'Legendary',
    description: 'Ultra-rare Quantum Falcon with diamond eyes and holographic wings'
  },
  epic: { 
    chance: 0.05,   // 5%
    count: 100, 
    color: '#B74FFF',
    name: 'Epic',
    description: 'Rare Quantum Falcon with enhanced cyberpunk aesthetics'
  },
  rare: { 
    chance: 0.20,   // 20%
    count: 400, 
    color: '#4FFFFF',
    name: 'Rare',
    description: 'Uncommon Quantum Falcon with neon glow effects'
  },
  uncommon: { 
    chance: 0.34,   // 34%
    count: 1000, 
    color: '#4FFF80',
    name: 'Uncommon',
    description: 'Special edition Quantum Falcon with enhanced features'
  },
  common: { 
    chance: 0.40,   // 40%
    count: 2000, 
    color: '#FFFFFF',
    name: 'Common',
    description: 'Standard Quantum Falcon Genesis edition'
  },
} as const

export type RarityTier = keyof typeof RARITY_TIERS

const COLLECTION_NAME = "Quantum Falcon Genesis"
const COLLECTION_SYMBOL = "QFALCON"
const ROYALTY_BASIS_POINTS = 500 // 5% royalty

export interface MintProgress {
  current: number
  total: number
  rarity: RarityTier
  minted: {
    legendary: number
    epic: number
    rare: number
    uncommon: number
    common: number
  }
}

export interface NFTCollectionConfig {
  totalSupply?: number
  onProgress?: (progress: MintProgress) => void
  onComplete?: (mintAddresses: string[]) => void
  onError?: (error: Error) => void
}

/**
 * DEPRECATED: This function is no longer used
 * Use generateSeasonalFalconCollection from SeasonalFalconNFTGenerator instead
 * Wallet dependencies removed to prevent white screen issues
 */
export async function generateAndMintNFTCollection(
  wallet: any,
  config: NFTCollectionConfig = {}
): Promise<string[]> {
  throw new Error('This function is deprecated. Use generateSeasonalFalconCollection from SeasonalFalconNFTGenerator instead.')
}

/**
 * Get rarity distribution summary
 */
export function getRarityDistribution(totalSupply: number) {
  return {
    legendary: Math.floor(totalSupply * RARITY_TIERS.legendary.chance),
    epic: Math.floor(totalSupply * RARITY_TIERS.epic.chance),
    rare: Math.floor(totalSupply * RARITY_TIERS.rare.chance),
    uncommon: Math.floor(totalSupply * RARITY_TIERS.uncommon.chance),
    common: Math.floor(totalSupply * RARITY_TIERS.common.chance),
  }
}

