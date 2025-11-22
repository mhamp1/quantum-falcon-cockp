// Achievement NFT Minting with Metaplex Core
// FINAL VERSION WITH ROYALTIES + SUPPLY LIMITS — November 21, 2025

import { createV1, percentAmount } from '@metaplex-foundation/mpl-core'
import { generateSigner } from '@metaplex-foundation/umi'
import { createMetaplexUmi } from '@/lib/metaplex'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

const ACHIEVEMENT_METADATA: Record<string, {
  name: string
  symbol: string
  uri: string
  maxSupply: number
}> = {
  first10k: {
    name: "First $10k Profit",
    symbol: "10K",
    uri: "https://arweave.net/your-10k-metadata-hash", // TODO: Upload to Arweave
    maxSupply: 100,
  },
  first100k: {
    name: "First $100k Profit",
    symbol: "100K",
    uri: "https://arweave.net/your-100k-metadata-hash",
    maxSupply: 50,
  },
  hundredWinWeek: {
    name: "100% Win Week",
    symbol: "100WIN",
    uri: "https://arweave.net/your-100win-metadata-hash",
    maxSupply: 200,
  },
  whale: {
    name: "Whale Status",
    symbol: "WHALE",
    uri: "https://arweave.net/your-whale-metadata-hash",
    maxSupply: 50,
  },
  god: {
    name: "Falcon God",
    symbol: "GOD",
    uri: "https://arweave.net/your-god-metadata-hash",
    maxSupply: 1, // Only master key holder
  },
  firstTrade: {
    name: "First Trade",
    symbol: "FIRST",
    uri: "https://arweave.net/your-first-trade-metadata-hash",
    maxSupply: 10000,
  },
  streak7: {
    name: "7 Day Streak",
    symbol: "STREAK7",
    uri: "https://arweave.net/your-streak7-metadata-hash",
    maxSupply: 5000,
  },
  streak30: {
    name: "30 Day Streak",
    symbol: "STREAK30",
    uri: "https://arweave.net/your-streak30-metadata-hash",
    maxSupply: 1000,
  },
}

type AchievementKey = keyof typeof ACHIEVEMENT_METADATA

// Get minted count from localStorage (non-React function)
const getMintedCount = (key: AchievementKey): number => {
  try {
    const stored = localStorage.getItem(`achievement:${key}:minted`)
    return stored ? parseInt(stored, 10) : 0
  } catch {
    return 0
  }
}

// Increment minted count (non-React function)
const incrementMintedCount = (key: AchievementKey) => {
  try {
    const current = getMintedCount(key)
    localStorage.setItem(`achievement:${key}:minted`, String(current + 1))
  } catch {
    // Ignore errors
  }
}

export const mintAchievementNFT = async (
  achievementKey: AchievementKey,
  publicKey: any,
  signTransaction: any,
  signAllTransactions?: any,
  creatorWallet?: string
): Promise<string | null> => {

  if (!publicKey || !signTransaction) {
    toast.error('Wallet not connected', {
      description: 'Please connect your wallet to mint achievement NFTs',
    })
    return null
  }

  const achievement = ACHIEVEMENT_METADATA[achievementKey]
  if (!achievement) {
    toast.error('Invalid achievement')
    return null
  }

  const currentMinted = getMintedCount(achievementKey)

  if (currentMinted >= achievement.maxSupply) {
    toast.error('Achievement Sold Out', {
      description: `Only ${achievement.maxSupply} ${achievement.name} badges will ever exist. You're too late.`,
    })
    return null
  }

  try {
    const umi = createMetaplexUmi(publicKey, signTransaction, signAllTransactions)
    const asset = generateSigner(umi)

    // Create NFT with 5% royalty
    await createV1(umi, {
      asset,
      name: achievement.name,
      uri: achievement.uri,
      creators: [
        {
          address: creatorWallet ? (umi.identity.publicKey as any) : (umi.identity.publicKey as any),
          percentage: 100,
          share: 100,
        },
      ],
      royalty: percentAmount(5), // 5% royalty on secondary sales
    }).sendAndConfirm(umi)

    incrementMintedCount(achievementKey)

    toast.success('🎖️ Achievement NFT Minted!', {
      description: `${achievement.name} #${currentMinted + 1}/${achievement.maxSupply}`,
      duration: 5000,
    })

    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#00FFFF', '#DC1FFF', '#FF1493'],
    })

    return asset.publicKey.toString()
  } catch (error: any) {
    console.error('NFT minting failed:', error)
    toast.error('Mint failed', {
      description: error.message || 'Please try again later',
    })
    return null
  }
}

