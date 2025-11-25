// Quest-Based NFT Reward System — Tier-Gated, XP-Integrated
// November 22, 2025 — Quantum Falcon Cockpit
// SEC-Proof: Digital Collectibles Only, No Investment Promise

import { toast } from 'sonner'
import { logger } from '../logger'
// Lazy load Metaplex to avoid Buffer import issues at module level
// import { generateSigner, publicKey } from '@metaplex-foundation/umi'
// import { createV1 } from '@metaplex-foundation/mpl-core'
// import { createMetaplexUmi } from '@/lib/metaplex'
import { generateImageWithAI } from './generateImageWithAI'
import { uploadNFTMetadata } from './arweaveUpload'
import { RARITY_TIERS, type RarityTier } from './AutoNFTGenerator'

// SEC-PROOF DISCLAIMER — Must be displayed before any NFT mint
export const NFT_LEGAL_DISCLAIMER = `
QUANTUM FALCON NFTs ARE DIGITAL COLLECTIBLES ONLY

These NFTs are non-fungible digital art and collectibles created for entertainment and artistic purposes.

They are NOT investment products, securities, or financial instruments.

There is NO promise of profit, utility, revenue share, staking rewards, governance rights, or future value appreciation.

Royalties are a voluntary creator fee only and do not represent profit sharing.

The value of these NFTs is subjective and may go to zero.

You are buying digital art — nothing more.

By minting or purchasing a Quantum Falcon NFT, you explicitly acknowledge:

• You are not investing
• You expect no financial return
• You accept 100% of the risk
• You will not hold the creator, team liable for any loss in value

Past performance of previous collections is not indicative of future results.

Quantum Falcon NFTs have no intrinsic value beyond what someone is willing to pay for the art.
`

export interface QuestNFT {
  id: string
  questId: string
  name: string
  description: string
  rarity: RarityTier
  tierRequired: 'Free' | 'Starter' | 'Trader' | 'Pro' | 'Elite' | 'Lifetime'
  imagePrompt: string
  attributes: Array<{ trait_type: string; value: string }>
  maxSupply?: number // Optional: limit total mints
  currentSupply: number
  xpReward: number
  collection: string
}

export interface Quest {
  id: string
  name: string
  description: string
  category: 'trading' | 'achievement' | 'social' | 'learning' | 'milestone'
  xpReward: number
  nftReward?: QuestNFT
  requirements: {
    type: 'trade_count' | 'profit_amount' | 'win_rate' | 'streak_days' | 'level_reach' | 'custom'
    value: number
    description: string
  }
  tierRequired?: 'Free' | 'Starter' | 'Trader' | 'Pro' | 'Elite' | 'Lifetime'
  repeatable: boolean
  cooldownHours?: number // For repeatable quests
}

// Predefined Quest NFTs with tier gating
export const QUEST_NFTS: Record<string, QuestNFT> = {
  // Free Tier Quests
  'first-trade': {
    id: 'first-trade-nft',
    questId: 'first-trade',
    name: 'First Trade Badge',
    description: 'Digital collectible awarded for completing your first trade',
    rarity: 'common',
    tierRequired: 'Free',
    imagePrompt: 'Quantum Falcon first trade badge, cyberpunk neon design, achievement medal style, cyan and purple colors, digital art collectible',
    attributes: [
      { trait_type: 'Quest', value: 'First Trade' },
      { trait_type: 'Rarity', value: 'Common' },
      { trait_type: 'Purpose', value: 'Digital Art Collectible' },
      { trait_type: 'Tier', value: 'Free' }
    ],
    currentSupply: 0,
    xpReward: 50,
    collection: 'Quest Rewards'
  },
  'first-profit': {
    id: 'first-profit-nft',
    questId: 'first-profit',
    name: 'First Profit Badge',
    description: 'Digital collectible awarded for your first profitable trade',
    rarity: 'uncommon',
    tierRequired: 'Free',
    imagePrompt: 'Quantum Falcon first profit badge, golden glow, success symbol, cyberpunk aesthetic, digital art collectible',
    attributes: [
      { trait_type: 'Quest', value: 'First Profit' },
      { trait_type: 'Rarity', value: 'Uncommon' },
      { trait_type: 'Purpose', value: 'Digital Art Collectible' },
      { trait_type: 'Tier', value: 'Free' }
    ],
    currentSupply: 0,
    xpReward: 100,
    collection: 'Quest Rewards'
  },

  // Starter Tier Quests
  '10-trades': {
    id: '10-trades-nft',
    questId: '10-trades',
    name: '10 Trades Master',
    description: 'Digital collectible for completing 10 trades',
    rarity: 'uncommon',
    tierRequired: 'Starter',
    imagePrompt: 'Quantum Falcon 10 trades master badge, silver design, milestone achievement, cyberpunk neon, digital art collectible',
    attributes: [
      { trait_type: 'Quest', value: '10 Trades' },
      { trait_type: 'Rarity', value: 'Uncommon' },
      { trait_type: 'Purpose', value: 'Digital Art Collectible' },
      { trait_type: 'Tier', value: 'Starter' }
    ],
    currentSupply: 0,
    xpReward: 200,
    collection: 'Quest Rewards'
  },

  // Trader Tier Quests
  '100-trades': {
    id: '100-trades-nft',
    questId: '100-trades',
    name: 'Century Trader',
    description: 'Digital collectible for completing 100 trades',
    rarity: 'rare',
    tierRequired: 'Trader',
    imagePrompt: 'Quantum Falcon century trader badge, bronze and gold design, elite achievement, cyberpunk aesthetic, digital art collectible',
    attributes: [
      { trait_type: 'Quest', value: '100 Trades' },
      { trait_type: 'Rarity', value: 'Rare' },
      { trait_type: 'Purpose', value: 'Digital Art Collectible' },
      { trait_type: 'Tier', value: 'Trader' }
    ],
    currentSupply: 0,
    xpReward: 500,
    collection: 'Quest Rewards'
  },
  '1000-profit': {
    id: '1000-profit-nft',
    questId: '1000-profit',
    name: '$1K Profit Badge',
    description: 'Digital collectible for reaching $1,000 total profit',
    rarity: 'rare',
    tierRequired: 'Trader',
    imagePrompt: 'Quantum Falcon $1K profit badge, golden design, wealth symbol, cyberpunk neon, digital art collectible',
    attributes: [
      { trait_type: 'Quest', value: '$1K Profit' },
      { trait_type: 'Rarity', value: 'Rare' },
      { trait_type: 'Purpose', value: 'Digital Art Collectible' },
      { trait_type: 'Tier', value: 'Trader' }
    ],
    currentSupply: 0,
    xpReward: 750,
    collection: 'Quest Rewards'
  },

  // Pro Tier Quests
  '10k-profit': {
    id: '10k-profit-nft',
    questId: '10k-profit',
    name: '$10K Profit Master',
    description: 'Digital collectible for reaching $10,000 total profit',
    rarity: 'epic',
    tierRequired: 'Pro',
    imagePrompt: 'Quantum Falcon $10K profit master badge, platinum and gold design, elite achievement, cyberpunk aesthetic, digital art collectible',
    attributes: [
      { trait_type: 'Quest', value: '$10K Profit' },
      { trait_type: 'Rarity', value: 'Epic' },
      { trait_type: 'Purpose', value: 'Digital Art Collectible' },
      { trait_type: 'Tier', value: 'Pro' }
    ],
    currentSupply: 0,
    xpReward: 1500,
    collection: 'Quest Rewards'
  },
  '7-day-streak': {
    id: '7-day-streak-nft',
    questId: '7-day-streak',
    name: '7 Day Streak Badge',
    description: 'Digital collectible for maintaining a 7-day trading streak',
    rarity: 'epic',
    tierRequired: 'Pro',
    imagePrompt: 'Quantum Falcon 7 day streak badge, fire and energy design, consistency symbol, cyberpunk neon, digital art collectible',
    attributes: [
      { trait_type: 'Quest', value: '7 Day Streak' },
      { trait_type: 'Rarity', value: 'Epic' },
      { trait_type: 'Purpose', value: 'Digital Art Collectible' },
      { trait_type: 'Tier', value: 'Pro' }
    ],
    currentSupply: 0,
    xpReward: 1000,
    collection: 'Quest Rewards'
  },

  // Elite Tier Quests
  '100k-profit': {
    id: '100k-profit-nft',
    questId: '100k-profit',
    name: '$100K Profit Legend',
    description: 'Digital collectible for reaching $100,000 total profit',
    rarity: 'legendary',
    tierRequired: 'Elite',
    imagePrompt: 'Quantum Falcon $100K profit legend badge, diamond and gold design, ultimate achievement, cyberpunk aesthetic, digital art collectible',
    attributes: [
      { trait_type: 'Quest', value: '$100K Profit' },
      { trait_type: 'Rarity', value: 'Legendary' },
      { trait_type: 'Purpose', value: 'Digital Art Collectible' },
      { trait_type: 'Tier', value: 'Elite' }
    ],
    currentSupply: 0,
    xpReward: 5000,
    collection: 'Quest Rewards'
  },
  '30-day-streak': {
    id: '30-day-streak-nft',
    questId: '30-day-streak',
    name: '30 Day Streak Master',
    description: 'Digital collectible for maintaining a 30-day trading streak',
    rarity: 'legendary',
    tierRequired: 'Elite',
    imagePrompt: 'Quantum Falcon 30 day streak master badge, legendary design, ultimate consistency, cyberpunk neon, digital art collectible',
    attributes: [
      { trait_type: 'Quest', value: '30 Day Streak' },
      { trait_type: 'Rarity', value: 'Legendary' },
      { trait_type: 'Purpose', value: 'Digital Art Collectible' },
      { trait_type: 'Tier', value: 'Elite' }
    ],
    currentSupply: 0,
    xpReward: 3000,
    collection: 'Quest Rewards'
  },
  'level-50': {
    id: 'level-50-nft',
    questId: 'level-50',
    name: 'Level 50 Champion',
    description: 'Digital collectible for reaching level 50',
    rarity: 'legendary',
    tierRequired: 'Elite',
    imagePrompt: 'Quantum Falcon level 50 champion badge, ultimate achievement design, cyberpunk aesthetic, digital art collectible',
    attributes: [
      { trait_type: 'Quest', value: 'Level 50' },
      { trait_type: 'Rarity', value: 'Legendary' },
      { trait_type: 'Purpose', value: 'Digital Art Collectible' },
      { trait_type: 'Tier', value: 'Elite' }
    ],
    currentSupply: 0,
    xpReward: 4000,
    collection: 'Quest Rewards'
  },

  // Lifetime/God Mode Exclusive
  'god-mode': {
    id: 'god-mode-nft',
    questId: 'god-mode',
    name: 'Falcon God Badge',
    description: 'Exclusive digital collectible for master key holders',
    rarity: 'legendary',
    tierRequired: 'Lifetime',
    imagePrompt: 'Quantum Falcon god badge, ultimate design, crown and divine elements, cyberpunk aesthetic, digital art collectible',
    attributes: [
      { trait_type: 'Quest', value: 'God Mode' },
      { trait_type: 'Rarity', value: 'Legendary' },
      { trait_type: 'Purpose', value: 'Digital Art Collectible' },
      { trait_type: 'Tier', value: 'Lifetime' }
    ],
    maxSupply: 1, // Only 1 ever
    currentSupply: 0,
    xpReward: 10000,
    collection: 'Quest Rewards'
  }
}

// Predefined Quests
export const QUESTS: Quest[] = [
  {
    id: 'first-trade',
    name: 'First Trade',
    description: 'Complete your first trade',
    category: 'trading',
    xpReward: 50,
    nftReward: QUEST_NFTS['first-trade'],
    requirements: {
      type: 'trade_count',
      value: 1,
      description: 'Execute 1 trade'
    },
    tierRequired: 'Free',
    repeatable: false
  },
  {
    id: 'first-profit',
    name: 'First Profit',
    description: 'Make your first profitable trade',
    category: 'achievement',
    xpReward: 100,
    nftReward: QUEST_NFTS['first-profit'],
    requirements: {
      type: 'profit_amount',
      value: 0.01, // $0.01 minimum
      description: 'Make at least $0.01 profit'
    },
    tierRequired: 'Free',
    repeatable: false
  },
  {
    id: '10-trades',
    name: '10 Trades Master',
    description: 'Complete 10 trades',
    category: 'trading',
    xpReward: 200,
    nftReward: QUEST_NFTS['10-trades'],
    requirements: {
      type: 'trade_count',
      value: 10,
      description: 'Execute 10 trades'
    },
    tierRequired: 'Starter',
    repeatable: false
  },
  {
    id: '100-trades',
    name: 'Century Trader',
    description: 'Complete 100 trades',
    category: 'trading',
    xpReward: 500,
    nftReward: QUEST_NFTS['100-trades'],
    requirements: {
      type: 'trade_count',
      value: 100,
      description: 'Execute 100 trades'
    },
    tierRequired: 'Trader',
    repeatable: false
  },
  {
    id: '1000-profit',
    name: '$1K Profit',
    description: 'Reach $1,000 total profit',
    category: 'milestone',
    xpReward: 750,
    nftReward: QUEST_NFTS['1000-profit'],
    requirements: {
      type: 'profit_amount',
      value: 1000,
      description: 'Accumulate $1,000 in total profit'
    },
    tierRequired: 'Trader',
    repeatable: false
  },
  {
    id: '10k-profit',
    name: '$10K Profit Master',
    description: 'Reach $10,000 total profit',
    category: 'milestone',
    xpReward: 1500,
    nftReward: QUEST_NFTS['10k-profit'],
    requirements: {
      type: 'profit_amount',
      value: 10000,
      description: 'Accumulate $10,000 in total profit'
    },
    tierRequired: 'Pro',
    repeatable: false
  },
  {
    id: '7-day-streak',
    name: '7 Day Streak',
    description: 'Maintain a 7-day trading streak',
    category: 'achievement',
    xpReward: 1000,
    nftReward: QUEST_NFTS['7-day-streak'],
    requirements: {
      type: 'streak_days',
      value: 7,
      description: 'Trade for 7 consecutive days'
    },
    tierRequired: 'Pro',
    repeatable: true,
    cooldownHours: 168 // 7 days
  },
  {
    id: '100k-profit',
    name: '$100K Profit Legend',
    description: 'Reach $100,000 total profit',
    category: 'milestone',
    xpReward: 5000,
    nftReward: QUEST_NFTS['100k-profit'],
    requirements: {
      type: 'profit_amount',
      value: 100000,
      description: 'Accumulate $100,000 in total profit'
    },
    tierRequired: 'Elite',
    repeatable: false
  },
  {
    id: '30-day-streak',
    name: '30 Day Streak Master',
    description: 'Maintain a 30-day trading streak',
    category: 'achievement',
    xpReward: 3000,
    nftReward: QUEST_NFTS['30-day-streak'],
    requirements: {
      type: 'streak_days',
      value: 30,
      description: 'Trade for 30 consecutive days'
    },
    tierRequired: 'Elite',
    repeatable: true,
    cooldownHours: 720 // 30 days
  },
  {
    id: 'level-50',
    name: 'Level 50 Champion',
    description: 'Reach level 50',
    category: 'milestone',
    xpReward: 4000,
    nftReward: QUEST_NFTS['level-50'],
    requirements: {
      type: 'level_reach',
      value: 50,
      description: 'Reach level 50'
    },
    tierRequired: 'Elite',
    repeatable: false
  }
]

/**
 * Check if user can access NFT based on tier
 */
export function canAccessNFT(nft: QuestNFT, userTier: string): boolean {
  const tierHierarchy: Record<string, number> = {
    'Free': 0,
    'Starter': 1,
    'Trader': 2,
    'Pro': 3,
    'Elite': 4,
    'Lifetime': 5
  }

  const userTierLevel = tierHierarchy[userTier] || 0
  const requiredTierLevel = tierHierarchy[nft.tierRequired] || 0

  return userTierLevel >= requiredTierLevel
}

/**
 * Mint quest reward NFT
 * SEC-PROOF: Includes all legal disclaimers
 */
export async function mintQuestNFT(
  wallet: any,
  questNFT: QuestNFT,
  userTier: string
): Promise<string | null> {
  // Tier check
  if (!canAccessNFT(questNFT, userTier)) {
    toast.error('Tier Requirement Not Met', {
      description: `This NFT requires ${questNFT.tierRequired} tier or higher`
    })
    return null
  }

  // Supply check
  if (questNFT.maxSupply && questNFT.currentSupply >= questNFT.maxSupply) {
    toast.error('Supply Limit Reached', {
      description: 'This NFT has reached its maximum supply'
    })
    return null
  }

  if (!wallet?.connected || !wallet?.publicKey) {
    toast.error('Wallet not connected', {
      description: 'Please connect your Solana wallet to mint the NFT'
    })
    return null
  }

  try {
    // Dynamic import to avoid Buffer issues at module load time
    const { generateSigner, publicKey } = await import('@metaplex-foundation/umi')
    const { createV1 } = await import('@metaplex-foundation/mpl-core')
    const { createMetaplexUmi } = await import('@/lib/metaplex')

    // Generate AI image
    const imageUrl = await generateImageWithAI(questNFT.imagePrompt, {
      size: '1024x1024',
      n: 1
    })

    // Create metadata with SEC-proof language
    const metadata = {
      name: questNFT.name,
      description: `${questNFT.description}. This is a digital art collectible only. No utility is promised. No financial return is guaranteed. This is art only.`,
      image: imageUrl,
      attributes: [
        ...questNFT.attributes,
        { trait_type: 'Disclaimer', value: 'Digital Art Collectible Only - Not an Investment' }
      ],
      properties: {
        category: 'image',
        files: [{ uri: imageUrl, type: 'image/png' }],
        creators: [{ address: wallet.publicKey.toBase58(), share: 100 }]
      },
      external_url: 'https://quantumfalcon.app',
      seller_fee_basis_points: 777 // 7.77% creator royalty (not revenue share)
    }

    // Upload metadata
    const metadataUri = await uploadNFTMetadata(metadata)

    // Initialize UMI
    const umi = createMetaplexUmi(
      wallet.publicKey,
      wallet.signTransaction,
      wallet.signAllTransactions
    )

    // Mint NFT
    const asset = generateSigner(umi)
    await createV1(umi, {
      asset,
      name: metadata.name,
      uri: metadataUri,
      creators: [{ 
        address: publicKey(wallet.publicKey.toBase58()), 
        share: 100 
      }],
      royalty: 777, // 7.77% royalty
    }).sendAndConfirm(umi)

    const mintAddress = asset.publicKey.toString()

    // Update supply tracking (localStorage)
    const supplyKey = `nft-supply-${questNFT.id}`
    const currentSupply = parseInt(localStorage.getItem(supplyKey) || '0', 10)
    localStorage.setItem(supplyKey, String(currentSupply + 1))

    toast.success('Quest NFT Minted!', {
      description: `${questNFT.name} has been minted to your wallet`,
      duration: 5000
    })

    return mintAddress

  } catch (error) {
    logger.error('Minting failed', 'QuestNFTSystem', error)
    toast.error('NFT Minting Failed', {
      description: error instanceof Error ? error.message : 'Unknown error'
    })
    return null
  }
}

/**
 * Check quest completion status
 */
export function checkQuestCompletion(
  quest: Quest,
  userStats: {
    totalTrades?: number
    totalProfit?: number
    winRate?: number
    streakDays?: number
    level?: number
  }
): boolean {
  const { requirements, repeatable } = quest

  switch (requirements.type) {
    case 'trade_count':
      return (userStats.totalTrades || 0) >= requirements.value
    case 'profit_amount':
      return (userStats.totalProfit || 0) >= requirements.value
    case 'win_rate':
      return (userStats.winRate || 0) >= requirements.value
    case 'streak_days':
      return (userStats.streakDays || 0) >= requirements.value
    case 'level_reach':
      return (userStats.level || 0) >= requirements.value
    default:
      return false
  }
}

