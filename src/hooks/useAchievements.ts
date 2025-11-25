// Achievement Tracking Hook
// November 21, 2025 — Quantum Falcon Cockpit
// Tracks and unlocks achievements, mints NFTs

import { useEffect, useCallback, useRef } from 'react'
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

type AchievementStats = UseAchievementsProps['userStats'] & { isGodMode?: boolean }

const ANNOUNCED_STORAGE_KEY = 'qf-achievement-announcements'
const STAT_KEYS: (keyof AchievementStats)[] = [
  'totalProfit',
  'portfolioValue',
  'weeklyWinRate',
  'totalTrades',
  'dailyStreak',
  'isGodMode'
]

export function useAchievements({ userStats, auth }: UseAchievementsProps) {
  const { publicKey, signTransaction, signAllTransactions } = useWallet()
  const mintedAchievementsRef = useRef<Set<string>>(new Set())
  const announcedAchievementsRef = useRef<Set<string>>(new Set())
  const announcementsHydratedRef = useRef(false)
  const lastStatsRef = useRef<AchievementStats | null>(null)

  const handleMintAchievement = useCallback(async (achievementId: string) => {
    if (!publicKey || !signTransaction || mintedAchievementsRef.current.has(achievementId)) {
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
        mintedAchievementsRef.current.add(achievementId)
      }
    } catch (error) {
      console.error('Failed to mint achievement NFT:', error)
      toast.error('Failed to mint NFT', {
        description: 'Please try again later',
      })
    }
  }, [publicKey, signTransaction, signAllTransactions])

  const hydrateAnnouncements = () => {
    if (announcementsHydratedRef.current) return
    announcementsHydratedRef.current = true
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem(ANNOUNCED_STORAGE_KEY)
      if (stored) {
        const parsed: string[] = JSON.parse(stored)
        announcedAchievementsRef.current = new Set(parsed)
      }
    } catch (error) {
      console.warn('[Achievements] Failed to load announced achievements', error)
    }
  }

  const persistAnnouncements = () => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(
        ANNOUNCED_STORAGE_KEY,
        JSON.stringify(Array.from(announcedAchievementsRef.current))
      )
    } catch (error) {
      console.warn('[Achievements] Failed to persist announcements', error)
    }
  }

  // Check for new achievements
  useEffect(() => {
    hydrateAnnouncements()

    const statsWithGodMode: AchievementStats = {
      ...userStats,
      isGodMode: isGodMode(auth)
    }

    const lastStats = lastStatsRef.current
    const statsChanged = !lastStats
      ? true
      : STAT_KEYS.some(key => lastStats?.[key] !== statsWithGodMode[key])

    if (!statsChanged) {
      return
    }

    lastStatsRef.current = statsWithGodMode

    Object.keys(ACHIEVEMENT_NFTS).forEach((achievementId) => {
      const isUnlocked = checkAchievementUnlock(achievementId, statsWithGodMode)
      const hasAnnounced = announcedAchievementsRef.current.has(achievementId)

      if (isUnlocked && !hasAnnounced) {
        // Track globally so we only announce once ever (even across reloads)
        announcedAchievementsRef.current.add(achievementId)
        persistAnnouncements()
        
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
  }, [userStats, auth, publicKey, handleMintAchievement])

  const allUnlocked = getUnlockedAchievements({
    ...userStats,
    isGodMode: isGodMode(auth),
  })

  return {
    unlockedAchievements: allUnlocked,
    mintedAchievements: Array.from(mintedAchievementsRef.current),
    mintAchievement: handleMintAchievement,
  }
}

