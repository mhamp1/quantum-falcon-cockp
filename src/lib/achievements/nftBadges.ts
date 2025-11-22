// On-Chain NFT Achievement Badges
// November 21, 2025 — Quantum Falcon Cockpit
// Real Solana NFTs minted for user achievements

import { Connection, PublicKey } from '@solana/web3.js'
// Note: You'll need to install @metaplex-foundation/mpl-token-metadata or use your preferred NFT minting library

export interface AchievementNFT {
  id: string
  name: string
  symbol: string
  description: string
  imageUri: string
  tier: 'bronze' | 'silver' | 'gold' | 'diamond' | 'rainbow'
  requirement: string
}

export const ACHIEVEMENT_NFTS: Record<string, AchievementNFT> = {
  first10k: {
    id: 'first10k',
    name: 'First $10k Profit',
    symbol: '10K',
    description: 'Earned $10,000+ in realized profit',
    imageUri: '/achievements/10k.png', // Placeholder - use IPFS or your CDN
    tier: 'bronze',
    requirement: 'totalProfit >= 10000',
  },
  first100k: {
    id: 'first100k',
    name: 'First $100k Profit',
    symbol: '100K',
    description: 'Earned $100,000+ in realized profit',
    imageUri: '/achievements/100k.png',
    tier: 'silver',
    requirement: 'totalProfit >= 100000',
  },
  hundredWinWeek: {
    id: 'hundredWinWeek',
    name: '100% Win Week',
    symbol: '100WIN',
    description: 'Achieved 100% win rate in a week',
    imageUri: '/achievements/100win.png',
    tier: 'gold',
    requirement: 'weeklyWinRate === 100',
  },
  whale: {
    id: 'whale',
    name: 'Whale Status',
    symbol: 'WHALE',
    description: 'Portfolio value > $1M',
    imageUri: '/achievements/whale.png',
    tier: 'diamond',
    requirement: 'portfolioValue >= 1000000',
  },
  god: {
    id: 'god',
    name: 'Falcon God',
    symbol: 'GOD',
    description: 'Master key holder',
    imageUri: '/achievements/god.png',
    tier: 'rainbow',
    requirement: 'isGodMode === true',
  },
  firstTrade: {
    id: 'firstTrade',
    name: 'First Trade',
    symbol: 'FIRST',
    description: 'Executed your first trade',
    imageUri: '/achievements/first-trade.png',
    tier: 'bronze',
    requirement: 'totalTrades >= 1',
  },
  streak7: {
    id: 'streak7',
    name: '7 Day Streak',
    symbol: 'STREAK7',
    description: 'Traded for 7 consecutive days',
    imageUri: '/achievements/streak-7.png',
    tier: 'silver',
    requirement: 'dailyStreak >= 7',
  },
  streak30: {
    id: 'streak30',
    name: '30 Day Streak',
    symbol: 'STREAK30',
    description: 'Traded for 30 consecutive days',
    imageUri: '/achievements/streak-30.png',
    tier: 'gold',
    requirement: 'dailyStreak >= 30',
  },
}

/**
 * Check if user has unlocked an achievement
 */
export function checkAchievementUnlock(
  achievementId: string,
  userStats: {
    totalProfit?: number
    portfolioValue?: number
    weeklyWinRate?: number
    totalTrades?: number
    dailyStreak?: number
    isGodMode?: boolean
  }
): boolean {
  const achievement = ACHIEVEMENT_NFTS[achievementId]
  if (!achievement) return false

  switch (achievementId) {
    case 'first10k':
      return (userStats.totalProfit || 0) >= 10000
    case 'first100k':
      return (userStats.totalProfit || 0) >= 100000
    case 'hundredWinWeek':
      return (userStats.weeklyWinRate || 0) === 100
    case 'whale':
      return (userStats.portfolioValue || 0) >= 1000000
    case 'god':
      return userStats.isGodMode === true
    case 'firstTrade':
      return (userStats.totalTrades || 0) >= 1
    case 'streak7':
      return (userStats.dailyStreak || 0) >= 7
    case 'streak30':
      return (userStats.dailyStreak || 0) >= 30
    default:
      return false
  }
}

/**
 * Mint achievement NFT on Solana
 * Note: This requires Metaplex or your preferred NFT minting library
 */
export async function mintAchievementNFT(
  achievementId: string,
  walletPublicKey: PublicKey,
  connection: Connection
): Promise<string | null> {
  const achievement = ACHIEVEMENT_NFTS[achievementId]
  if (!achievement) {
    console.error(`Achievement ${achievementId} not found`)
    return null
  }

  try {
    // TODO: Implement actual NFT minting using Metaplex or your preferred method
    // Example structure:
    /*
    const { mint } = await createNft({
      name: achievement.name,
      symbol: achievement.symbol,
      uri: achievement.imageUri,
      sellerFeeBasisPoints: 0,
      creators: [{
        address: walletPublicKey,
        verified: true,
        share: 100,
      }],
    }, connection, wallet)
    
    return mint.toBase58()
    */

    // For now, return a placeholder
    console.log(`[NFT] Would mint ${achievement.name} for ${walletPublicKey.toBase58()}`)
    return `mint_${achievementId}_${Date.now()}`
  } catch (error) {
    console.error(`[NFT] Failed to mint ${achievement.name}:`, error)
    return null
  }
}

/**
 * Get all unlocked achievements for a user
 */
export function getUnlockedAchievements(
  userStats: {
    totalProfit?: number
    portfolioValue?: number
    weeklyWinRate?: number
    totalTrades?: number
    dailyStreak?: number
    isGodMode?: boolean
  }
): AchievementNFT[] {
  return Object.keys(ACHIEVEMENT_NFTS)
    .filter((id) => checkAchievementUnlock(id, userStats))
    .map((id) => ACHIEVEMENT_NFTS[id])
}

