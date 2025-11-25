// TIER-EXCLUSIVE NFT SYSTEM — Only attainable when you reach that tier
// November 22, 2025 — Quantum Falcon Cockpit

import { RARITY_TIERS, type RarityTier } from './QuantumFalconNFTEngine'
import { generateImagePrompt } from './QuantumFalconNFTEngine'

export type UserTier = 'free' | 'starter' | 'trader' | 'pro' | 'elite' | 'lifetime'

export interface TierExclusiveNFT {
  id: string
  name: string
  tier: UserTier
  rarity: RarityTier
  description: string
  imagePrompt: string
  price: number
  maxSupply: number
  unlockedAt: number // Timestamp when user reached this tier
}

// TIER-EXCLUSIVE NFT DEFINITIONS
export const TIER_EXCLUSIVE_NFTS: Record<UserTier, TierExclusiveNFT> = {
  free: {
    id: 'tier-free-genesis',
    name: 'Free Tier Genesis Falcon',
    tier: 'free',
    rarity: 'common',
    description: 'Your first Quantum Falcon NFT — Welcome to the ecosystem!',
    imagePrompt: 'Quantum Falcon Free Tier Genesis, cyberpunk neon falcon, basic holographic wings, cyan and purple color palette, glowing eyes, dark background with grid, entry-level falcon aesthetic, 8k, sharp focus',
    price: 0, // Free for free tier users
    maxSupply: 10000,
    unlockedAt: 0
  },
  starter: {
    id: 'tier-starter-ascendant',
    name: 'Starter Tier Ascendant',
    tier: 'starter',
    rarity: 'uncommon',
    description: 'Ascended from free tier — Your journey begins!',
    imagePrompt: 'Quantum Falcon Starter Tier Ascendant, cyberpunk neon falcon, enhanced holographic wings with blue circuits, blue and cyan color palette, brighter glowing eyes, upgraded falcon aesthetic, 8k, sharp focus',
    price: 25,
    maxSupply: 5000,
    unlockedAt: 0
  },
  trader: {
    id: 'tier-trader-vanguard',
    name: 'Trader Tier Vanguard',
    tier: 'trader',
    rarity: 'rare',
    description: 'Vanguard of the trading elite — You\'ve proven your worth!',
    imagePrompt: 'Quantum Falcon Trader Tier Vanguard, cyberpunk neon falcon, advanced holographic wings with green energy circuits, green and cyan color palette, powerful glowing eyes, elite falcon aesthetic, 8k, sharp focus',
    price: 100,
    maxSupply: 2000,
    unlockedAt: 0
  },
  pro: {
    id: 'tier-pro-master',
    name: 'Pro Tier Master Falcon',
    tier: 'pro',
    rarity: 'epic',
    description: 'Master of the Quantum realm — Professional status achieved!',
    imagePrompt: 'Quantum Falcon Pro Tier Master, cyberpunk neon falcon, master-level holographic wings with purple energy circuits and plasma effects, purple and gold color palette, diamond-like glowing eyes, master falcon aesthetic, 8k, sharp focus, cinematic lighting',
    price: 500,
    maxSupply: 500,
    unlockedAt: 0
  },
  elite: {
    id: 'tier-elite-legend',
    name: 'Elite Tier Legend',
    tier: 'elite',
    rarity: 'epic',
    description: 'Legend among legends — Elite status unlocked!',
    imagePrompt: 'Quantum Falcon Elite Tier Legend, cyberpunk neon falcon, legendary holographic wings with gold and purple energy circuits, plasma trails, gold and purple color palette, legendary diamond eyes with aura, elite legend falcon aesthetic, 8k, sharp focus, cinematic masterpiece',
    price: 1000,
    maxSupply: 200,
    unlockedAt: 0
  },
  lifetime: {
    id: 'tier-lifetime-god',
    name: 'Lifetime Tier God Falcon',
    tier: 'lifetime',
    rarity: 'legendary',
    description: 'The ultimate Quantum Falcon — God tier achieved!',
    imagePrompt: 'Quantum Falcon Lifetime Tier God Falcon, cyberpunk neon falcon, god-tier holographic wings with platinum and solana cyan energy circuits, divine plasma effects, platinum and solana cyan color palette, god-tier diamond eyes with divine aura and crown, ultimate god falcon aesthetic, 8k, sharp focus, cinematic masterpiece, divine lighting',
    price: 5000,
    maxSupply: 10, // Only 10 God Falcons will ever exist
    unlockedAt: 0
  }
}

/**
 * Get tier-exclusive NFT for user's current tier
 */
export function getTierExclusiveNFT(userTier: UserTier): TierExclusiveNFT {
  return TIER_EXCLUSIVE_NFTS[userTier]
}

/**
 * Check if user can mint tier-exclusive NFT
 */
export function canMintTierNFT(userTier: UserTier, ownedNFTs: string[]): boolean {
  const tierNFT = TIER_EXCLUSIVE_NFTS[userTier]
  if (!tierNFT) return false

  // Check if already owned
  if (ownedNFTs.includes(tierNFT.id)) return false

  // Check supply
  const key = `tier-nft-minted-${tierNFT.id}`
  const minted = parseInt(localStorage.getItem(key) || '0', 10)
  return minted < tierNFT.maxSupply
}

/**
 * Get minted count for tier NFT
 */
export function getTierNFTMintedCount(nftId: string): number {
  const key = `tier-nft-minted-${nftId}`
  return parseInt(localStorage.getItem(key) || '0', 10)
}

/**
 * Update minted count for tier NFT
 */
export function incrementTierNFTMinted(nftId: string): void {
  const key = `tier-nft-minted-${nftId}`
  const current = getTierNFTMintedCount(nftId)
  localStorage.setItem(key, String(current + 1))
}

/**
 * Generate image prompt for tier NFT
 */
export function generateTierImagePrompt(nft: TierExclusiveNFT, edition: number): string {
  return `${nft.imagePrompt}, edition #${edition}, ${nft.rarity} rarity, perfect cyberpunk falcon with glowing eyes, holographic wings, neon circuits`
}

