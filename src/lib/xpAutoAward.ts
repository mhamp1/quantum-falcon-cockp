// Automatic XP Award System — Fully Integrated
// November 24, 2025 — Quantum Falcon Cockpit
// Awards XP automatically for all user actions - no manual work needed

import { useKVSafe } from '@/hooks/useKVFallback'
import { XP_ACTIONS, XP_LEVEL_REWARDS, getBenefitsForLevel, getNextLevelReward } from './xpBenefits'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

interface UserXPProfile {
  level: number
  xp: number
  totalXp: number
  xpToNextLevel: number
  unlockedBenefits: string[]
  lastAwarded: number
}

const DEFAULT_PROFILE: UserXPProfile = {
  level: 1,
  xp: 0,
  totalXp: 0,
  xpToNextLevel: 1000,
  unlockedBenefits: [],
  lastAwarded: Date.now()
}

/**
 * Calculate XP required for a level (exponential growth)
 */
function calculateXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// Global XP award function (can be called from anywhere)
let globalAwardXP: ((action: keyof typeof XP_ACTIONS, metadata?: Record<string, any>) => void) | null = null

/**
 * Automatic XP Award System
 * Call this function whenever a user action occurs
 * Benefits are automatically unlocked when level thresholds are reached
 */
export function useAutoXPAward() {
  const [profile, setProfile] = useKVSafe<UserXPProfile>('user-xp-profile', DEFAULT_PROFILE)

  const awardXP = (action: keyof typeof XP_ACTIONS, metadata?: Record<string, any>) => {
    const xpAmount = XP_ACTIONS[action]?.xp || 0
    if (xpAmount === 0) return

    setProfile((current) => {
      const newTotalXP = current.totalXp + xpAmount
      let newLevel = current.level
      let newXP = current.xp + xpAmount
      let newXPToNext = current.xpToNextLevel
      const newlyUnlocked: string[] = []

      // Check for level ups
      while (newXP >= newXPToNext) {
        newLevel += 1
        newXP = newXP - newXPToNext
        newXPToNext = calculateXPForLevel(newLevel)

        // Check for newly unlocked benefits
        const levelReward = XP_LEVEL_REWARDS.find(r => r.level === newLevel)
        if (levelReward) {
          levelReward.benefits.forEach(benefit => {
            if (!current.unlockedBenefits.includes(benefit.id)) {
              newlyUnlocked.push(benefit.id)
            }
          })

          // Show celebration
          toast.success(levelReward.celebration.title, {
            description: levelReward.celebration.message,
            duration: 5000
          })

          if (levelReward.celebration.confetti) {
            confetti({
              particleCount: 200,
              spread: 120,
              origin: { y: 0.6 }
            })
          }
        }
      }

      // Apply benefits automatically
      if (newlyUnlocked.length > 0) {
        applyBenefits(newlyUnlocked, newLevel)
      }

      // Show XP toast
      toast.success(`+${xpAmount} XP`, {
        description: XP_ACTIONS[action]?.description || action,
        duration: 2000
      })

      return {
        ...current,
        level: newLevel,
        xp: newXP,
        totalXp: newTotalXP,
        xpToNextLevel: newXPToNext,
        unlockedBenefits: [...current.unlockedBenefits, ...newlyUnlocked],
        lastAwarded: Date.now()
      }
    })
  }

  // Set global function for use outside hooks
  globalAwardXP = awardXP

  return { profile, awardXP }
}

/**
 * Award XP from anywhere (non-hook version)
 * Automatically integrates with trade execution, challenges, etc.
 */
export function awardXPAuto(action: keyof typeof XP_ACTIONS, metadata?: Record<string, any>) {
  if (globalAwardXP) {
    globalAwardXP(action, metadata)
    return
  }

  // Fallback: Direct KV update if hook not initialized
  try {
    const stored = localStorage.getItem('user-xp-profile')
    const current: UserXPProfile = stored ? JSON.parse(stored) : DEFAULT_PROFILE
    const xpAmount = XP_ACTIONS[action]?.xp || 0
    if (xpAmount === 0) return

    const newTotalXP = current.totalXp + xpAmount
    let newLevel = current.level
    let newXP = current.xp + xpAmount
    let newXPToNext = current.xpToNextLevel
    const newlyUnlocked: string[] = []

    while (newXP >= newXPToNext) {
      newLevel += 1
      newXP = newXP - newXPToNext
      newXPToNext = calculateXPForLevel(newLevel)

      const levelReward = XP_LEVEL_REWARDS.find(r => r.level === newLevel)
      if (levelReward) {
        levelReward.benefits.forEach(benefit => {
          if (!current.unlockedBenefits.includes(benefit.id)) {
            newlyUnlocked.push(benefit.id)
          }
        })
      }
    }

    if (newlyUnlocked.length > 0) {
      applyBenefits(newlyUnlocked, newLevel)
    }

    const updated: UserXPProfile = {
      ...current,
      level: newLevel,
      xp: newXP,
      totalXp: newTotalXP,
      xpToNextLevel: newXPToNext,
      unlockedBenefits: [...current.unlockedBenefits, ...newlyUnlocked],
      lastAwarded: Date.now()
    }

    localStorage.setItem('user-xp-profile', JSON.stringify(updated))
  } catch (e) {
    // Silent fail
  }
}

/**
 * Automatically apply benefits when unlocked
 * This runs internally - no manual work needed
 */
function applyBenefits(benefitIds: string[], level: number) {
  benefitIds.forEach(benefitId => {
    // Store unlocked benefit in KV for feature gating
    const benefits = getBenefitsForLevel(level)
    const benefit = benefits.find(b => b.id === benefitId)
    
    if (benefit) {
      // Store in KV for automatic feature unlocking
      try {
        const unlocked = JSON.parse(localStorage.getItem('qf-unlocked-benefits') || '[]')
        if (!unlocked.includes(benefitId)) {
          unlocked.push(benefitId)
          localStorage.setItem('qf-unlocked-benefits', JSON.stringify(unlocked))
        }
      } catch (e) {
        // Silent fail
      }

      // Apply specific benefits automatically
      switch (benefitId) {
        case 'flash-execution':
          // Enable priority routing
          localStorage.setItem('qf-flash-execution', 'true')
          break
        case 'sniper-mode':
          // Enable token launch detection
          localStorage.setItem('qf-sniper-mode', 'true')
          break
        case 'whale-tracker':
          // Enable whale tracking
          localStorage.setItem('qf-whale-tracker', 'true')
          break
        case 'profit-amplifier':
          // Enable profit bonus
          localStorage.setItem('qf-profit-amplifier', 'true')
          break
        case 'sentiment-scanner':
          // Enable sentiment analysis
          localStorage.setItem('qf-sentiment-scanner', 'true')
          break
        case 'zero-fees':
          // Enable fee waiver
          localStorage.setItem('qf-zero-fees', 'true')
          break
        case 'custom-strategies':
          // Enable strategy builder
          localStorage.setItem('qf-custom-strategies', 'true')
          break
      }
    }
  })
}

/**
 * Check if a benefit is unlocked
 */
export function isBenefitUnlocked(benefitId: string): boolean {
  try {
    const unlocked = JSON.parse(localStorage.getItem('qf-unlocked-benefits') || '[]')
    return unlocked.includes(benefitId)
  } catch {
    return false
  }
}

/**
 * Get discount percentage based on level
 */
export function getLevelDiscount(level: number): number {
  if (level >= 30) return 30
  if (level >= 20) return 20
  if (level >= 10) return 10
  return 0
}

