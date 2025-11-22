// FULLY AUTOMATED SEASONAL CYBER FALCON NFT COLLECTION — November 22, 2025
// Quantum Falcon v2025.1.0 — Real Scarcity, No Free Mints

import { createV1 } from '@metaplex-foundation/mpl-core'
import { generateSigner, publicKey } from '@metaplex-foundation/umi'
import { WalletContextState } from '@solana/wallet-adapter-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { generateImageWithAI } from './generateImageWithAI'
import { uploadNFTMetadata } from './arweaveUpload'
import { createMetaplexUmi } from '@/lib/metaplex'

// Season definitions with rarity boosts and special supply limits
export const SEASONS = {
  winter: { 
    name: "Arctic Phantom", 
    colors: "cyan, ice blue, white", 
    elements: "snowflakes, frost circuits, frozen wings", 
    rarityBoost: 1.5,
    maxSupply: null // No limit
  },
  christmas: { 
    name: "Noel Overlord", 
    colors: "red, emerald green, gold", 
    elements: "christmas lights in circuits, santa hat on falcon, golden halo", 
    rarityBoost: 3, 
    maxSupply: 12 // Only 12 ever - ultimate scarcity
  },
  spring: { 
    name: "Neon Blossom", 
    colors: "pink, purple, cyan", 
    elements: "cherry blossoms made of code, glowing petals, spring matrix rain", 
    rarityBoost: 1.2,
    maxSupply: null
  },
  summer: { 
    name: "Solar Flare", 
    colors: "orange, yellow, neon pink", 
    elements: "solar plasma wings, heat distortion, burning circuits", 
    rarityBoost: 1.0,
    maxSupply: null
  },
  autumn: { 
    name: "Crimson Circuit", 
    colors: "blood red, orange, purple", 
    elements: "falling neon leaves, burning with code, halloween pumpkin circuits", 
    rarityBoost: 1.3,
    maxSupply: null
  },
  halloween: { 
    name: "Phantom Reaper", 
    colors: "purple, orange, black", 
    elements: "ghost circuits, pumpkin eyes, reaper scythe made of code", 
    rarityBoost: 2.5, 
    maxSupply: 31 // Only 31 ever - Halloween special
  },
  bull: { 
    name: "Golden Apex", 
    colors: "gold, emerald, cyan", 
    elements: "golden crown, bull horns made of light, money rain background", 
    rarityBoost: 2,
    maxSupply: null
  },
  bear: { 
    name: "Shadow Predator", 
    colors: "deep purple, blood red, black", 
    elements: "blood dripping circuits, cracked mask, bear trap jaws", 
    rarityBoost: 1.8,
    maxSupply: null
  },
} as const

export type SeasonKey = keyof typeof SEASONS

// Market sentiment detection for bull/bear seasons
async function getMarketSentiment(): Promise<number> {
  try {
    // Fetch live market data
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true')
    const data = await response.json()
    
    if (data.bitcoin) {
      const change24h = data.bitcoin.usd_24h_change || 0
      // Normalize to 0-1 scale (positive = bull, negative = bear)
      return Math.max(0, Math.min(1, (change24h + 50) / 100))
    }
  } catch (error) {
    console.warn('[NFT] Market sentiment fetch failed, using neutral:', error)
  }
  
  return 0.5 // Neutral if fetch fails
}

/**
 * Get current season based on date and market conditions
 */
export async function getCurrentSeason(): Promise<SeasonKey> {
  const month = new Date().getMonth() + 1
  const day = new Date().getDate()

  // Special seasonal periods
  if (month === 12 && day >= 15 || month === 1 && day <= 15) {
    return 'christmas'
  }
  
  if (month === 10) {
    return 'halloween'
  }

  // Standard seasons
  if (month === 12 || month <= 2) {
    return 'winter'
  }
  
  if (month >= 3 && month <= 5) {
    return 'spring'
  }
  
  if (month >= 6 && month <= 8) {
    return 'summer'
  }
  
  if (month >= 9 && month <= 11) {
    return 'autumn'
  }

  // Market-based season (fallback)
  const sentiment = await getMarketSentiment()
  return sentiment > 0.7 ? 'bull' : 'bear'
}

export interface SeasonalMintProgress {
  current: number
  total: number
  season: SeasonKey
  rarity: string
  minted: {
    legendary: number
    epic: number
    rare: number
    uncommon: number
    common: number
  }
}

export interface SeasonalCollectionConfig {
  supply?: number
  season?: SeasonKey // Override auto-detection
  onProgress?: (progress: SeasonalMintProgress) => void
  onComplete?: (mintAddresses: string[]) => void
  onError?: (error: Error) => void
}

/**
 * Generate seasonal Quantum Falcon NFT collection
 * REAL SCARCITY: Even master key holders must purchase NFTs
 */
export async function generateSeasonalFalconCollection(
  wallet: WalletContextState,
  config: SeasonalCollectionConfig = {}
): Promise<string[]> {
  const {
    supply = 888,
    season: overrideSeason,
    onProgress,
    onComplete,
    onError
  } = config

  if (!wallet.connected || !wallet.publicKey) {
    const error = new Error('Wallet not connected')
    toast.error('Wallet not connected', {
      description: 'Please connect your Solana wallet to mint NFTs'
    })
    onError?.(error)
    throw error
  }

  // Determine season
  const season: SeasonKey = overrideSeason || await getCurrentSeason()
  const seasonData = SEASONS[season]

  // Enforce max supply if set (e.g., Christmas = 12, Halloween = 31)
  const maxSupply = seasonData.maxSupply
  const finalSupply = maxSupply ? Math.min(supply, maxSupply) : supply

  if (maxSupply && supply > maxSupply) {
    toast.warning(`Supply limited to ${maxSupply} for ${seasonData.name}`, {
      description: `This season has a hard cap of ${maxSupply} NFTs`
    })
  }

  // Initialize UMI
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not properly connected')
  }

  const umi = createMetaplexUmi(
    wallet.publicKey,
    wallet.signTransaction,
    wallet.signAllTransactions
  )

  // Track minting progress
  let minted = 0
  let legendaryMinted = 0
  let epicMinted = 0
  let rareMinted = 0
  let uncommonMinted = 0
  let commonMinted = 0
  const mintAddresses: string[] = []

  const collectionName = `Quantum Falcon ${seasonData.name} Genesis`
  const ROYALTY_BASIS_POINTS = 777 // 7.77% royalty

  const toastId = toast.loading(
    `Minting ${finalSupply} ${seasonData.name} Falcons...`, 
    { duration: Infinity }
  )

  try {
    for (let i = 1; i <= finalSupply; i++) {
      // Determine rarity with season boost
      const rand = Math.random()
      const boostedLegendary = 0.01 * seasonData.rarityBoost
      const boostedEpic = 0.05 * seasonData.rarityBoost
      const boostedRare = 0.20 * seasonData.rarityBoost
      const boostedUncommon = 0.34 * seasonData.rarityBoost

      let rarity: 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common' = 'common'

      if (rand < boostedLegendary && legendaryMinted < Math.floor(finalSupply * 0.01)) {
        rarity = 'legendary'
        legendaryMinted++
      } else if (rand < boostedEpic && epicMinted < Math.floor(finalSupply * 0.05)) {
        rarity = 'epic'
        epicMinted++
      } else if (rand < boostedRare && rareMinted < Math.floor(finalSupply * 0.20)) {
        rarity = 'rare'
        rareMinted++
      } else if (rand < boostedUncommon && uncommonMinted < Math.floor(finalSupply * 0.34)) {
        rarity = 'uncommon'
        uncommonMinted++
      } else {
        rarity = 'common'
        commonMinted++
      }

      // Generate AI image with season-specific prompt
      const basePrompt = `Quantum Falcon ${seasonData.name} edition, ultra cyberpunk neon falcon, holographic plasma wings, ${seasonData.elements}, ${seasonData.colors} color palette, dark background with glowing grid, cinematic lighting, masterpiece, 8k, sharp focus, solana blockchain aesthetic`
      const finalPrompt = `${basePrompt}, ${rarity} rarity, edition #${i}, ${rarity === 'legendary' ? 'diamond eyes, golden aura' : ''}`

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
        description: `Quantum Falcon ${seasonData.name} • ${rarity.toUpperCase()} • Part of the ${new Date().getFullYear()} seasonal collection • Edition ${i} of ${finalSupply}`,
        image: imageUrl,
        attributes: [
          { trait_type: "Season", value: seasonData.name },
          { trait_type: "Rarity", value: rarity.charAt(0).toUpperCase() + rarity.slice(1) },
          { trait_type: "Edition", value: i.toString() },
          { trait_type: "Year", value: new Date().getFullYear().toString() },
          { trait_type: "Collection", value: collectionName },
          { trait_type: "AI Generated", value: "Yes" },
        ],
        properties: {
          files: [{ uri: imageUrl, type: "image/png" }],
          category: "image",
        },
      }

      // Upload metadata
      let metadataUri: string
      try {
        metadataUri = await uploadNFTMetadata(metadata)
      } catch (error) {
        console.error(`[NFT] Failed to upload metadata for #${i}:`, error)
        continue
      }

      // Mint NFT on-chain
      try {
        const asset = generateSigner(umi)
        
        await createV1(umi, {
          asset,
          name: metadata.name,
          uri: metadataUri,
          creators: [{ 
            address: publicKey(wallet.publicKey.toBase58()), 
            share: 100 
          }],
          royalty: ROYALTY_BASIS_POINTS,
        }).sendAndConfirm(umi)

        const mintAddress = asset.publicKey.toString()
        mintAddresses.push(mintAddress)
        minted++

        // Update progress
        onProgress?.({
          current: i,
          total: finalSupply,
          season,
          rarity,
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
          toast.success(`Minted #${i} — ${rarity.toUpperCase()}`, { 
            duration: 2000,
            id: `mint-${i}`
          })
        }

        // Update main toast
        toast.loading(
          `Minting ${minted}/${finalSupply} NFTs... (${rarity.toUpperCase()})`,
          { 
            id: toastId,
            duration: Infinity
          }
        )
      } catch (error) {
        console.error(`[NFT] Failed to mint #${i}:`, error)
        continue
      }

      // Small delay to avoid rate limiting
      if (i % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Success celebration
    toast.dismiss(toastId)
    
    confetti({
      particleCount: 777,
      spread: 120,
      origin: { y: 0.5 },
      colors: ['#00FFFF', '#DC1FFF', '#FF1493', '#FFD700'],
    })

    toast.success(`🎖️ ${collectionName} COMPLETE 🎖️`, {
      description: `${minted} seasonal Quantum Falcons minted • 7.77% royalty active`,
      duration: 10000,
    })

    onComplete?.(mintAddresses)
    return mintAddresses

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

/**
 * Get season info for display
 */
export function getSeasonInfo(season?: SeasonKey) {
  if (!season) {
    return getCurrentSeason().then(s => SEASONS[s])
  }
  return Promise.resolve(SEASONS[season])
}

