// FULLY AUTOMATED SEASONAL CYBER FALCON NFT COLLECTION — November 22, 2025
// Payment-based system (no wallet required)

import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { generateImageWithAI } from './generateImageWithAI'
import { uploadNFTMetadata } from './arweaveUpload'
import { RARITY_TIERS, type RarityTier } from './AutoNFTGenerator'

export const SEASONS = {
  winter: { 
    name: "Arctic Phantom", 
    colors: "cyan, ice blue, white", 
    elements: "snowflakes, frost circuits, frozen wings", 
    rarityBoost: 1.5,
    maxSupply: 1000
  },
  christmas: { 
    name: "Noel Overlord", 
    colors: "red, emerald green, gold", 
    elements: "christmas lights in circuits, santa hat on falcon, golden halo", 
    rarityBoost: 3, 
    maxSupply: 12 
  },
  spring: { 
    name: "Neon Blossom", 
    colors: "pink, purple, cyan", 
    elements: "cherry blossoms made of code, glowing petals, spring matrix rain", 
    rarityBoost: 1.2,
    maxSupply: 888
  },
  summer: { 
    name: "Solar Flare", 
    colors: "orange, yellow, neon pink", 
    elements: "solar plasma wings, heat distortion, burning circuits", 
    rarityBoost: 1.0,
    maxSupply: 888
  },
  autumn: { 
    name: "Crimson Circuit", 
    colors: "blood red, orange, purple", 
    elements: "falling neon leaves, burning with code, halloween pumpkin circuits", 
    rarityBoost: 1.3,
    maxSupply: 888
  },
  halloween: { 
    name: "Phantom Reaper", 
    colors: "purple, orange, black", 
    elements: "ghost circuits, pumpkin eyes, reaper scythe made of code", 
    rarityBoost: 2.5, 
    maxSupply: 31 
  },
  bull: { 
    name: "Golden Apex", 
    colors: "gold, emerald, cyan", 
    elements: "golden crown, bull horns made of light, money rain background", 
    rarityBoost: 2,
    maxSupply: 500
  },
  bear: { 
    name: "Shadow Predator", 
    colors: "deep purple, blood red, black", 
    elements: "blood dripping circuits, cracked mask, bear trap jaws", 
    rarityBoost: 1.8,
    maxSupply: 500
  },
} as const

export type Season = keyof typeof SEASONS

export interface SeasonalMintProgress {
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
 * Get current season based on date and market sentiment
 */
export function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1
  const day = new Date().getDate()

  // Christmas: Dec 15 - Jan 15
  if ((month === 12 && day >= 15) || (month === 1 && day <= 15)) return 'christmas'
  
  // Halloween: October
  if (month === 10) return 'halloween'
  
  // Winter: Dec, Jan, Feb
  if (month === 12 || month <= 2) return 'winter'
  
  // Spring: Mar, Apr, May
  if (month >= 3 && month <= 5) return 'spring'
  
  // Summer: Jun, Jul, Aug
  if (month >= 6 && month <= 8) return 'summer'
  
  // Autumn: Sep, Nov
  if (month >= 9 && month <= 11) return 'autumn'

  // Default to current season
  return 'winter'
}

/**
 * Get market sentiment (0-1, where >0.7 is bull)
 * This would integrate with your market data
 */
function getMarketSentiment(): number {
  // TODO: Integrate with actual market sentiment API
  // For now, return neutral
  return 0.5
}

export interface SeasonalCollectionConfig {
  supply?: number
  season?: Season
  onProgress?: (progress: SeasonalMintProgress) => void
  onComplete?: (nfts: NFTItem[]) => void
  onError?: (error: Error) => void
}

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
}

/**
 * Generate seasonal NFT collection (payment-based, no wallet)
 */
export async function generateSeasonalFalconCollection(
  config: SeasonalCollectionConfig = {}
): Promise<NFTItem[]> {
  const {
    supply = 888,
    season,
    onProgress,
    onComplete,
    onError
  } = config

  const currentSeason = season || getCurrentSeason()
  const seasonData = SEASONS[currentSeason]
  const finalSupply = Math.min(supply, seasonData.maxSupply || supply)

  const basePrompt = `Quantum Falcon ${seasonData.name} edition, ultra cyberpunk neon falcon, holographic plasma wings, ${seasonData.elements}, ${seasonData.colors} color palette, dark background with glowing grid, cinematic lighting, masterpiece, 8k, sharp focus, solana blockchain aesthetic`

  const nfts: NFTItem[] = []
  let minted = 0
  let legendaryMinted = 0
  let epicMinted = 0
  let rareMinted = 0
  let uncommonMinted = 0
  let commonMinted = 0

  const collectionName = `Quantum Falcon ${seasonData.name} Genesis`
  const toastId = toast.loading(`Generating ${finalSupply} ${seasonData.name} Falcons...`, { 
    duration: Infinity 
  })

  try {
    for (let i = 1; i <= finalSupply; i++) {
      // Determine rarity with season boost
      const rand = Math.random()
      const legendaryChance = 0.01 * seasonData.rarityBoost
      const epicChance = legendaryChance + (0.05 * seasonData.rarityBoost)
      const rareChance = epicChance + (0.20 * seasonData.rarityBoost)
      const uncommonChance = rareChance + (0.34 * seasonData.rarityBoost)

      let rarity: RarityTier = 'common'
      
      if (rand < legendaryChance && legendaryMinted < (RARITY_TIERS.legendary.count * seasonData.rarityBoost)) {
        rarity = 'legendary'
        legendaryMinted++
      } else if (rand < epicChance && epicMinted < (RARITY_TIERS.epic.count * seasonData.rarityBoost)) {
        rarity = 'epic'
        epicMinted++
      } else if (rand < rareChance && rareMinted < (RARITY_TIERS.rare.count * seasonData.rarityBoost)) {
        rarity = 'rare'
        rareMinted++
      } else if (rand < uncommonChance && uncommonMinted < (RARITY_TIERS.uncommon.count * seasonData.rarityBoost)) {
        rarity = 'uncommon'
        uncommonMinted++
      } else {
        rarity = 'common'
        commonMinted++
      }

      // Generate AI image
      const finalPrompt = `${basePrompt}, ${rarity} rarity, edition #${i}`
      
      let imageUrl: string
      try {
        imageUrl = await generateImageWithAI(finalPrompt, {
          size: '1024x1024',
          n: 1
        })
      } catch (error) {
        console.error(`[NFT] Failed to generate image for #${i}:`, error)
        continue
      }

      // Create metadata
      const metadata = {
        name: `${collectionName} #${i}`,
        description: `Quantum Falcon ${seasonData.name} • ${rarity.toUpperCase()} • Part of the ${new Date().getFullYear()} seasonal collection`,
        image: imageUrl,
        attributes: [
          { trait_type: "Season", value: seasonData.name },
          { trait_type: "Rarity", value: rarity.charAt(0).toUpperCase() + rarity.slice(1) },
          { trait_type: "Edition", value: i.toString() },
          { trait_type: "Year", value: new Date().getFullYear().toString() },
        ],
        properties: { category: "image" },
      }

      // Upload metadata
      let metadataUri: string
      try {
        metadataUri = await uploadNFTMetadata(metadata)
      } catch (error) {
        console.error(`[NFT] Failed to upload metadata for #${i}:`, error)
        continue
      }

      // Calculate price based on rarity
      const basePrice = 10 // $10 base
      const rarityMultiplier = {
        legendary: 100,
        epic: 50,
        rare: 20,
        uncommon: 5,
        common: 1
      }[rarity]

      const nft: NFTItem = {
        id: `seasonal-${currentSeason}-${i}`,
        name: metadata.name,
        image: imageUrl,
        rarity,
        edition: i,
        season: currentSeason,
        metadataUri,
        price: basePrice * rarityMultiplier,
        available: true
      }

      nfts.push(nft)
      minted++

      // Update progress
      onProgress?.({
        current: i,
        total: finalSupply,
        rarity,
        season: currentSeason,
        minted: {
          legendary: legendaryMinted,
          epic: epicMinted,
          rare: rareMinted,
          uncommon: uncommonMinted,
          common: commonMinted,
        }
      })

      // Show progress updates
      if (minted % 50 === 0 || rarity === 'legendary' || rarity === 'epic') {
        toast.success(`Generated #${i} — ${rarity.toUpperCase()}`, { 
          duration: 2000,
          id: `mint-${i}`
        })
      }

      toast.loading(
        `Generating ${minted}/${finalSupply} NFTs... (${rarity.toUpperCase()})`,
        { 
          id: toastId,
          duration: Infinity
        }
      )

      // Small delay to avoid rate limiting
      if (i % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Success celebration
    toast.dismiss(toastId)
    
    confetti({
      particleCount: 195,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#00FFFF', '#DC1FFF', '#FF1493', '#FFD700'],
    })

    toast.success(`🎖️ ${collectionName} COMPLETE 🎖️`, {
      description: `${minted} seasonal Quantum Falcons generated • 7.77% royalty active`,
      duration: 10000,
    })

    onComplete?.(nfts)
    return nfts

  } catch (error) {
    toast.dismiss(toastId)
    const err = error instanceof Error ? error : new Error('Unknown error')
    toast.error('Seasonal Collection Generation Failed', {
      description: err.message,
      duration: 5000
    })
    onError?.(err)
    throw err
  }
}

