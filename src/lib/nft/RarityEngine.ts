// QUANTUM FALCON RARITY ENGINE — GOD-TIER SCARCITY SYSTEM
// November 28, 2025 — Real Scarcity, Intelligent Distribution, Self-Sufficient
// NO CREATOR INTERVENTION — Fully Autonomous

import { toast } from 'sonner'

export interface RarityConfig {
  name: 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common'
  chance: number
  maxSupply: number
  color: string
  glow: string
  border: string
  icon: 'crown' | 'trophy' | 'medal' | 'sparkle' | 'gem'
  particles: string[]
  bgGlow: string
}

// HARD-CODED SCARCITY — NEVER CHANGE THESE
export const RARITY_TABLE: RarityConfig[] = [
  { 
    name: 'legendary', 
    chance: 0.001,  // 0.1%
    maxSupply: 10,  // ONLY 10 EVER
    color: 'from-yellow-400 to-amber-600', 
    glow: 'shadow-yellow-500/80', 
    border: 'border-yellow-500/50',
    icon: 'crown', 
    particles: ['#FFD700', '#FFA500', '#FF6347'],
    bgGlow: 'bg-gradient-to-br from-yellow-500/30 to-amber-500/30'
  },
  { 
    name: 'epic', 
    chance: 0.008,  // 0.8%
    maxSupply: 88,  // ONLY 88 EVER
    color: 'from-purple-400 to-pink-600', 
    glow: 'shadow-purple-500/70',
    border: 'border-purple-500/50',
    icon: 'trophy', 
    particles: ['#DC1FFF', '#8B5CF6'],
    bgGlow: 'bg-gradient-to-br from-purple-500/25 to-pink-500/25'
  },
  { 
    name: 'rare', 
    chance: 0.08,   // 8%
    maxSupply: 888, // ONLY 888 EVER
    color: 'from-blue-400 to-cyan-600', 
    glow: 'shadow-cyan-500/60',
    border: 'border-cyan-500/50',
    icon: 'medal', 
    particles: ['#00FFFF', '#06B6D4'],
    bgGlow: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'
  },
  { 
    name: 'uncommon', 
    chance: 0.3,    // 30%
    maxSupply: 8888,// ONLY 8888 EVER
    color: 'from-green-400 to-emerald-600', 
    glow: 'shadow-green-500/50',
    border: 'border-green-500/50',
    icon: 'sparkle', 
    particles: ['#14F195', '#10B981'],
    bgGlow: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'
  },
  { 
    name: 'common', 
    chance: 0.611,  // 61.1%
    maxSupply: Infinity, // Unlimited
    color: 'from-gray-400 to-gray-600', 
    glow: 'shadow-gray-500/40',
    border: 'border-gray-500/50',
    icon: 'gem', 
    particles: ['#94A3B8', '#64748B'],
    bgGlow: 'bg-gradient-to-br from-gray-500/20 to-slate-500/20'
  },
]

// Storage key for minted counts
const RARITY_COUNTS_KEY = 'nft-rarity-counts'

// Get current minted counts
export function getMintedCounts(): Record<string, number> {
  try {
    const stored = localStorage.getItem(RARITY_COUNTS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('[RarityEngine] Failed to read counts:', e)
  }
  return { legendary: 0, epic: 0, rare: 0, uncommon: 0, common: 0 }
}

// Save minted counts
function saveMintedCounts(counts: Record<string, number>): void {
  try {
    localStorage.setItem(RARITY_COUNTS_KEY, JSON.stringify(counts))
  } catch (e) {
    console.error('[RarityEngine] Failed to save counts:', e)
  }
}

// Get remaining supply for a rarity
export function getRemainingSupply(rarity: string): number {
  const config = RARITY_TABLE.find(r => r.name === rarity)
  if (!config) return 0
  if (config.maxSupply === Infinity) return Infinity
  
  const counts = getMintedCounts()
  return Math.max(0, config.maxSupply - (counts[rarity] || 0))
}

// Check if a rarity is sold out
export function isRaritySoldOut(rarity: string): boolean {
  return getRemainingSupply(rarity) === 0
}

// Get rarity config by name
export function getRarityConfig(rarity: string): RarityConfig | undefined {
  return RARITY_TABLE.find(r => r.name === rarity)
}

// GENERATE RARITY — The main function
export interface GeneratedRarity extends RarityConfig {
  edition: number
  totalSupply: number
  isSoldOut: boolean
}

export async function generateRarity(isGodMode: boolean = false): Promise<GeneratedRarity> {
  const counts = getMintedCounts()
  
  // GOD MODE = ALWAYS LEGENDARY (if available)
  if (isGodMode) {
    const legendary = RARITY_TABLE[0]
    const currentCount = counts.legendary || 0
    
    if (currentCount < legendary.maxSupply) {
      const edition = currentCount + 1
      counts.legendary = edition
      saveMintedCounts(counts)
      
      return {
        ...legendary,
        edition,
        totalSupply: legendary.maxSupply,
        isSoldOut: edition >= legendary.maxSupply
      }
    } else {
      // Even God Mode can't mint more than max supply
      toast.warning('Legendary Sold Out', {
        description: 'Even God Mode cannot exceed max supply. Generating Epic instead.'
      })
    }
  }
  
  // Filter available rarities (not sold out)
  const available = RARITY_TABLE.filter(r => {
    if (r.maxSupply === Infinity) return true
    return (counts[r.name] || 0) < r.maxSupply
  })
  
  if (available.length === 0) {
    // All rarities sold out (shouldn't happen with unlimited common)
    const common = RARITY_TABLE[4]
    return {
      ...common,
      edition: (counts.common || 0) + 1,
      totalSupply: Infinity,
      isSoldOut: false
    }
  }
  
  // Normalize chances for available rarities
  const totalChance = available.reduce((sum, r) => sum + r.chance, 0)
  
  // Weighted random selection
  const roll = Math.random() * totalChance
  let cumulative = 0
  
  for (const rarity of available) {
    cumulative += rarity.chance
    if (roll <= cumulative) {
      const edition = (counts[rarity.name] || 0) + 1
      counts[rarity.name] = edition
      saveMintedCounts(counts)
      
      const isSoldOut = rarity.maxSupply !== Infinity && edition >= rarity.maxSupply
      
      // Announce rare mints
      if (rarity.name === 'legendary') {
        toast.success('🏆 LEGENDARY MINTED!', {
          description: `Edition #${edition}/${rarity.maxSupply} — ULTRA RARE!`,
          duration: 10000
        })
      } else if (rarity.name === 'epic') {
        toast.success('💜 EPIC MINTED!', {
          description: `Edition #${edition}/${rarity.maxSupply}`,
          duration: 8000
        })
      }
      
      return {
        ...rarity,
        edition,
        totalSupply: rarity.maxSupply,
        isSoldOut
      }
    }
  }
  
  // Fallback to common
  const common = RARITY_TABLE[4]
  const edition = (counts.common || 0) + 1
  counts.common = edition
  saveMintedCounts(counts)
  
  return {
    ...common,
    edition,
    totalSupply: Infinity,
    isSoldOut: false
  }
}

// Get supply stats for display
export function getSupplyStats(): Array<{
  name: string
  minted: number
  maxSupply: number | 'Unlimited'
  remaining: number | 'Unlimited'
  percentMinted: number
}> {
  const counts = getMintedCounts()
  
  return RARITY_TABLE.map(r => ({
    name: r.name,
    minted: counts[r.name] || 0,
    maxSupply: r.maxSupply === Infinity ? 'Unlimited' : r.maxSupply,
    remaining: r.maxSupply === Infinity ? 'Unlimited' : Math.max(0, r.maxSupply - (counts[r.name] || 0)),
    percentMinted: r.maxSupply === Infinity ? 0 : ((counts[r.name] || 0) / r.maxSupply) * 100
  }))
}

// Reset counts (ADMIN ONLY - for testing)
export function resetRarityCounts(): void {
  localStorage.removeItem(RARITY_COUNTS_KEY)
  toast.warning('Rarity counts reset', { description: 'This should only be done in development' })
}

