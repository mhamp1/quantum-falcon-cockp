// Achievement Tracking Hook
// November 21, 2025 — Quantum Falcon Cockpit
// Tracks and unlocks achievements, mints NFTs

import { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { 
  ACHIEVEMENT_NFTS, 
  checkAchievementUnlock, 
  getUnlockedAchievements 
} from '@/lib/achievements/nftBadges'
import { isGodMode } from '@/lib/godMode'
import { UserAuth } from '@/lib/auth'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { hapticFeedback } from '@/lib/hapticFeedback'

interface UseAchievementsProps {
  userStats: {
    totalProfit?: number
    portfolioValue?: number
    weeklyWinRate?: number
    totalTrades?: number
    dailyStreak?: number
  }
  auth: UserAuth | null
}

export function useAchievements({ userStats, auth }: UseAchievementsProps) {
  const { publicKey, signTransaction, signAllTransactions } = useWallet()
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
  const [mintedAchievements, setMintedAchievements] = useState<string[]>([])

  const handleMintAchievement = useCallback(async (achievementId: string) => {
    if (!publicKey || !signTransaction || mintedAchievements.includes(achievementId)) {
      return
    }

    try {
      const { mintAchievementNFT } = await import('@/lib/achievements/mintAchievementNFT')
      
      const mintAddress = await mintAchievementNFT(
        achievementId as any,
        publicKey,
        signTransaction,
        signAllTransactions
      )
      
      if (mintAddress) {
        setMintedAchievements((prev) => [...prev, achievementId])
      }
    } catch (error) {
      console.error('Failed to mint achievement NFT:', error)
      toast.error('Failed to mint NFT', {
        description: 'Please try again later',
      })
    }
  }, [publicKey, signTransaction, signAllTransactions, mintedAchievements])

  // Check for new achievements
  useEffect(() => {
    const statsWithGodMode = {
      ...userStats,
      isGodMode: isGodMode(auth),
    }

    Object.keys(ACHIEVEMENT_NFTS).forEach((achievementId) => {
      const isUnlocked = checkAchievementUnlock(achievementId, statsWithGodMode)
      const wasUnlocked = unlockedAchievements.includes(achievementId)

      if (isUnlocked && !wasUnlocked) {
        // New achievement unlocked!
        setUnlockedAchievements((prev) => [...prev, achievementId])
        
        const achievement = ACHIEVEMENT_NFTS[achievementId]
        
        // Celebration
        hapticFeedback.celebration()
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: achievement.tier === 'rainbow' 
            ? ['#ff00ff', '#00ffff', '#ffff00', '#ff1493', '#00ff00']
            : ['#00FFFF', '#DC1FFF', '#FF00FF'],
        })

        toast.success(`🎖️ Achievement Unlocked: ${achievement.name}!`, {
          description: achievement.description,
          duration: 5000,
        })

        // Auto-mint NFT if wallet connected
        if (publicKey) {
          handleMintAchievement(achievementId)
        }
      }
    })
  }, [userStats, auth, unlockedAchievements, publicKey, handleMintAchievement])

  const allUnlocked = getUnlockedAchievements({
    ...userStats,
    isGodMode: isGodMode(auth),
  })

  return {
    unlockedAchievements: allUnlocked,
    mintedAchievements,
    mintAchievement: handleMintAchievement,
  }
}

