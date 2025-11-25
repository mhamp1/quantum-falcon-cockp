// QUANTUM FALCON NFT GOD MODE ENGINE — November 22, 2025 — FINAL
// SACRED NFT LAWS — Never break these — override everything else

import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { generateImageWithAI } from './generateImageWithAI'
import { uploadNFTMetadata } from './arweaveUpload'
import { logger } from '../logger'

// SACRED RARITY LIMITS — ENFORCED FOREVER
export const RARITY_LIMITS = {
  legendary: 10,   // MAX 10 — Ultra rare
  epic: 100,       // MAX 100 — Very rare
  rare: 500,       // MAX 500 — Rare
  uncommon: 1000,  // MAX 1000 — Uncommon
  common: 2000,    // MAX 2000 — Common
} as const

export type RarityTier = keyof typeof RARITY_LIMITS

export const RARITY_TIERS = {
  legendary: { 
    chance: 0.01,   // 1%
    count: RARITY_LIMITS.legendary,
    color: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.8)',
    name: 'Legendary',
    description: 'Ultra-rare Quantum Falcon with diamond eyes and holographic wings'
  },
  epic: { 
    chance: 0.05,   // 5%
    count: RARITY_LIMITS.epic,
    color: '#B74FFF',
    glow: 'rgba(183, 79, 255, 0.8)',
    name: 'Epic',
    description: 'Rare Quantum Falcon with enhanced cyberpunk aesthetics'
  },
  rare: { 
    chance: 0.20,   // 20%
    count: RARITY_LIMITS.rare,
    color: '#4FFFFF',
    glow: 'rgba(79, 255, 255, 0.8)',
    name: 'Rare',
    description: 'Uncommon Quantum Falcon with neon glow effects'
  },
  uncommon: { 
    chance: 0.34,   // 34%
    count: RARITY_LIMITS.uncommon,
    color: '#4FFF80',
    glow: 'rgba(79, 255, 128, 0.6)',
    name: 'Uncommon',
    description: 'Special edition Quantum Falcon with enhanced features'
  },
  common: { 
    chance: 0.40,   // 40%
    count: RARITY_LIMITS.common,
    color: '#FFFFFF',
    glow: 'rgba(255, 255, 255, 0.4)',
    name: 'Common',
    description: 'Standard Quantum Falcon Genesis edition'
  },
} as const

// SACRED ROYALTY — 7.77% to mhamp1 wallet FOREVER
export const ROYALTY_WALLET = 'mhamp1' // Your wallet address
export const ROYALTY_BASIS_POINTS = 777 // 7.77% = 777 basis points

// COLLECTION CONFIG
export const COLLECTION_NAME = "Quantum Falcon Genesis"
export const COLLECTION_SYMBOL = "QFALCON"
export const MAX_COLLECTION_SUPPLY = 888 // Total supply per collection

// SEASONAL AUTO-ROTATION — Changes every 8 weeks
export const SEASON_DURATION_WEEKS = 8

export const SEASONS = {
  winter: { 
    name: "Arctic Phantom", 
    colors: "cyan, ice blue, white", 
    elements: "snowflakes, frost circuits, frozen wings, glowing ice crystals",
    rarityBoost: 1.5,
    maxSupply: MAX_COLLECTION_SUPPLY
  },
  christmas: { 
    name: "Noel Overlord", 
    colors: "red, emerald green, gold", 
    elements: "christmas lights in circuits, santa hat on falcon, golden halo, festive neon ornaments",
    rarityBoost: 3, 
    maxSupply: 12 
  },
  spring: { 
    name: "Neon Blossom", 
    colors: "pink, purple, cyan", 
    elements: "cherry blossoms made of code, glowing petals, spring matrix rain, holographic flowers",
    rarityBoost: 1.2,
    maxSupply: MAX_COLLECTION_SUPPLY
  },
  summer: { 
    name: "Solar Flare", 
    colors: "orange, yellow, neon pink", 
    elements: "solar plasma wings, heat distortion, burning circuits, sunburst effects",
    rarityBoost: 1.0,
    maxSupply: MAX_COLLECTION_SUPPLY
  },
  autumn: { 
    name: "Crimson Circuit", 
    colors: "blood red, orange, purple", 
    elements: "falling neon leaves, burning with code, halloween pumpkin circuits, autumn matrix",
    rarityBoost: 1.3,
    maxSupply: MAX_COLLECTION_SUPPLY
  },
  halloween: { 
    name: "Phantom Reaper", 
    colors: "purple, orange, black", 
    elements: "ghost circuits, pumpkin eyes, reaper scythe made of code, spooky neon effects",
    rarityBoost: 2.5, 
    maxSupply: 31 
  },
  bull: { 
    name: "Golden Apex", 
    colors: "gold, emerald, cyan", 
    elements: "golden crown, bull horns made of light, money rain background, prosperity circuits",
    rarityBoost: 2,
    maxSupply: 500
  },
  bear: { 
    name: "Shadow Predator", 
    colors: "deep purple, blood red, black", 
    elements: "blood dripping circuits, cracked mask, bear trap jaws, shadow matrix",
    rarityBoost: 1.8,
    maxSupply: 500
  },
} as const

export type Season = keyof typeof SEASONS

export interface NFTItem {
  id: string
  name: string
  image: string
  rarity: RarityTier
  edition: number
  season: Season
  metadataUri: string
  price: number
  available: boolean
  mintAddress?: string
  mintedAt?: number
  owner?: string
}

export interface MintProgress {
  current: number
  total: number
  rarity: RarityTier
  season: Season
  minted: {
    legendary: number
    epic: number
    rare: number
    uncommon: number
    common: number
  }
}

/**
 * Get current season based on date and auto-rotation
 * Changes every 8 weeks automatically
 */
export function getCurrentSeason(): Season {
  const now = new Date()
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const daysSinceYearStart = Math.floor((now.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24))
  const weekNumber = Math.floor(daysSinceYearStart / 7)
  const seasonIndex = Math.floor(weekNumber / SEASON_DURATION_WEEKS) % 8

  const month = now.getMonth() + 1
  const day = now.getDate()

  // Special seasons override
  if ((month === 12 && day >= 15) || (month === 1 && day <= 15)) return 'christmas'
  if (month === 10) return 'halloween'
  
  // Auto-rotation based on weeks
  const seasons: Season[] = ['winter', 'spring', 'summer', 'autumn', 'bull', 'bear', 'winter', 'spring']
  return seasons[seasonIndex] || 'winter'
}

/**
 * Get minted counts for rarity enforcement
 */
export function getMintedCounts(season: Season): Record<RarityTier, number> {
  const key = `nft-minted-${season}`
  const stored = localStorage.getItem(key)
  if (!stored) {
    return {
      legendary: 0,
      epic: 0,
      rare: 0,
      uncommon: 0,
      common: 0
    }
  }
  return JSON.parse(stored)
}

/**
 * Update minted counts (enforces rarity limits)
 */
export function updateMintedCounts(season: Season, rarity: RarityTier, count: number): void {
  const key = `nft-minted-${season}`
  const current = getMintedCounts(season)
  current[rarity] = count
  
  // ENFORCE LIMITS — Never exceed
  if (current[rarity] > RARITY_LIMITS[rarity]) {
    logger.warn(`[NFT] Rarity limit exceeded for ${rarity}. Capping at ${RARITY_LIMITS[rarity]}`)
    current[rarity] = RARITY_LIMITS[rarity]
  }
  
  localStorage.setItem(key, JSON.stringify(current))
}

/**
 * Check if rarity is available (hasn't hit limit)
 */
export function isRarityAvailable(season: Season, rarity: RarityTier): boolean {
  const counts = getMintedCounts(season)
  return counts[rarity] < RARITY_LIMITS[rarity]
}

/**
 * Get total minted count for collection
 */
export function getTotalMinted(season: Season): number {
  const counts = getMintedCounts(season)
  return Object.values(counts).reduce((sum, count) => sum + count, 0)
}

/**
 * Check if collection is sold out
 */
export function isCollectionSoldOut(season: Season): boolean {
  const seasonData = SEASONS[season]
  const totalMinted = getTotalMinted(season)
  return totalMinted >= seasonData.maxSupply
}

/**
 * Generate rarity based on chances and limits
 */
export function generateRarity(season: Season): RarityTier {
  const seasonData = SEASONS[season]
  const counts = getMintedCounts(season)
  const rand = Math.random()
  
  // Apply season rarity boost
  const legendaryChance = 0.01 * seasonData.rarityBoost
  const epicChance = legendaryChance + (0.05 * seasonData.rarityBoost)
  const rareChance = epicChance + (0.20 * seasonData.rarityBoost)
  const uncommonChance = rareChance + (0.34 * seasonData.rarityBoost)

  // Check limits and assign rarity
  if (rand < legendaryChance && counts.legendary < RARITY_LIMITS.legendary) {
    return 'legendary'
  }
  if (rand < epicChance && counts.epic < RARITY_LIMITS.epic) {
    return 'epic'
  }
  if (rand < rareChance && counts.rare < RARITY_LIMITS.rare) {
    return 'rare'
  }
  if (rand < uncommonChance && counts.uncommon < RARITY_LIMITS.uncommon) {
    return 'uncommon'
  }
  if (counts.common < RARITY_LIMITS.common) {
    return 'common'
  }
  
  // If all limits hit, return most available
  const available = Object.entries(counts)
    .filter(([_, count]) => count < RARITY_LIMITS[_[0] as RarityTier])
    .sort(([_, a], [__, b]) => a - b)
  
  if (available.length > 0) {
    return available[0][0] as RarityTier
  }
  
  // Fallback
  return 'common'
}

/**
 * Calculate NFT price based on rarity
 */
export function calculatePrice(rarity: RarityTier): number {
  const basePrice = 10 // $10 base
  const multipliers = {
    legendary: 100,  // $1000
    epic: 50,        // $500
    rare: 20,        // $200
    uncommon: 5,     // $50
    common: 1        // $10
  }
  return basePrice * multipliers[rarity]
}

/**
 * Generate AI image prompt for cyberpunk Quantum Falcon
 */
export function generateImagePrompt(season: Season, rarity: RarityTier, edition: number): string {
  const seasonData = SEASONS[season]
  const rarityData = RARITY_TIERS[rarity]
  
  return `Quantum Falcon ${seasonData.name} ${rarityData.name} edition #${edition}, ultra cyberpunk neon falcon, holographic plasma wings, ${seasonData.elements}, ${seasonData.colors} color palette, ${rarityData.description}, glowing eyes with ${rarity === 'legendary' ? 'diamond' : 'neon'} circuits, dark background with glowing grid, cinematic lighting, masterpiece, 8k, sharp focus, solana blockchain aesthetic, perfect cyberpunk falcon with glowing eyes, holographic wings, neon circuits`
}

