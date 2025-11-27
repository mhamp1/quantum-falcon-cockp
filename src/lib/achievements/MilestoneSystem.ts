// Milestone System — Perfect, One-Time-Only Achievements
// November 26, 2025 — Quantum Falcon Cockpit v2025.1.0
// Milestones show ONCE, auto-dismiss after 10s, never stick, never repeat

import { useKVSafe } from '@/hooks/useKVFallback'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { hapticFeedback } from '@/lib/hapticFeedback'
import { soundEffects } from '@/lib/soundEffects'
import { isGodMode } from '@/lib/godMode'
import type { UserAuth } from '@/lib/auth'

export interface Milestone {
  id: string
  threshold: number
  label: string
  description: string
  hasConfetti: boolean
  hasSound: boolean
}

export const PROFIT_MILESTONES: Milestone[] = [
  {
    id: 'first-dollar',
    threshold: 1,
    label: 'FIRST $1 EARNED!',
    description: 'Your first profit milestone! Keep it going!',
    hasConfetti: true,
    hasSound: true,
  },
  {
    id: 'hundred-club',
    threshold: 100,
    label: 'HUNDRED DOLLAR CLUB!',
    description: 'You\'ve earned $100 in profit!',
    hasConfetti: true,
    hasSound: true,
  },
  {
    id: 'thousandaire',
    threshold: 1000,
    label: 'THOUSANDAIRE ACHIEVED!',
    description: '$1,000 in profit — You\'re a trading legend!',
    hasConfetti: true,
    hasSound: true,
  },
]

export interface TradeMilestone {
  id: string
  threshold: number
  label: string
  description: string
  hasConfetti: boolean
  hasSound: boolean
}

export const TRADE_MILESTONES: TradeMilestone[] = [
  {
    id: 'first-win',
    threshold: 1,
    label: 'FIRST WIN!',
    description: 'Your first winning trade!',
    hasConfetti: true,
    hasSound: true,
  },
  {
    id: 'ten-wins',
    threshold: 10,
    label: '10 WINS!',
    description: 'Double digits! Keep the streak going!',
    hasConfetti: false,
    hasSound: true,
  },
  {
    id: 'hundred-wins',
    threshold: 100,
    label: '100 WINS!',
    description: 'Century of wins! Elite trader status!',
    hasConfetti: true,
    hasSound: true,
  },
]

interface AchievementRecord {
  earnedAt: number
  displayed: boolean
}

interface AchievementStore {
  profit: Record<string, AchievementRecord>
  trades: Record<string, AchievementRecord>
}

const DEFAULT_STORE: AchievementStore = {
  profit: {},
  trades: {},
}

/**
 * Hook to manage milestone achievements
 * Persists to KV storage so achievements never repeat
 */
export function useMilestoneSystem() {
  const [achievements, setAchievements] = useKVSafe<AchievementStore>('achievements', DEFAULT_STORE)

  const hasEarned = (category: 'profit' | 'trades', milestoneId: string): boolean => {
    return achievements[category]?.[milestoneId]?.earnedAt > 0 || false
  }

  const markEarned = (category: 'profit' | 'trades', milestoneId: string) => {
    setAchievements((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [milestoneId]: {
          earnedAt: Date.now(),
          displayed: true,
        },
      },
    }))
  }

  return {
    achievements,
    hasEarned,
    markEarned,
    setAchievements,
  }
}

/**
 * Check and trigger profit milestones
 * Only fires ONCE per milestone, auto-dismisses after 10s
 */
export function checkProfitMilestones(
  currentProfit: number,
  previousProfit: number,
  achievements: AchievementStore | null,
  auth: UserAuth | null,
  onEarned?: (milestone: Milestone) => void
): void {
  // Skip for master key users (Creator never sees milestones)
  if (isGodMode(auth)) {
    return
  }

  // Use default store if achievements not provided
  const achievementStore = achievements || DEFAULT_STORE

  // Find milestones that were just crossed
  const crossedMilestones = PROFIT_MILESTONES.filter((milestone) => {
    const wasBelow = previousProfit < milestone.threshold
    const isAbove = currentProfit >= milestone.threshold
    const notEarned = !achievementStore.profit?.[milestone.id]?.earnedAt

    return wasBelow && isAbove && notEarned
  })

  if (crossedMilestones.length === 0) {
    return
  }

  // Process each crossed milestone
  crossedMilestones.forEach((milestone) => {
    // Mark as earned IMMEDIATELY (before showing toast)
    // This prevents duplicate triggers
    const newAchievements: AchievementStore = {
      ...achievementStore,
      profit: {
        ...achievementStore.profit,
        [milestone.id]: {
          earnedAt: Date.now(),
          displayed: true,
        },
      },
    }

    // Save to KV storage immediately
    try {
      const stored = localStorage.getItem('qf_achievements')
      const current = stored ? JSON.parse(stored) : DEFAULT_STORE
      localStorage.setItem(
        'qf_achievements',
        JSON.stringify({
          ...current,
          profit: {
            ...current.profit,
            [milestone.id]: {
              earnedAt: Date.now(),
              displayed: true,
            },
          },
        })
      )
    } catch (e) {
      // Silent fail
    }

    // Trigger effects
    if (milestone.hasConfetti) {
      // Reduced confetti - only 25% of original (3 particles instead of 13)
      confetti({
        particleCount: 3,
        spread: 30,
        origin: { y: 0.7 },
        colors: ['#00FFFF', '#DC1FFF', '#FF00FF'],
      })
    }

    if (milestone.hasSound) {
      soundEffects.playSuccess()
    }

    hapticFeedback.success()

    // Show toast with 10s auto-dismiss (NEVER sticks)
    const toastId = toast.success(milestone.label, {
      description: milestone.description,
      duration: 10000, // Auto-dismiss after 10 seconds
      id: `milestone-${milestone.id}`, // Unique ID prevents duplicates
      action: {
        label: 'Dismiss',
        onClick: () => toast.dismiss(toastId),
      },
    })

    // Callback for UI updates
    if (onEarned) {
      onEarned(milestone)
    }
  })
}

/**
 * Check and trigger trade milestones
 */
export function checkTradeMilestones(
  currentWins: number,
  previousWins: number,
  achievements: AchievementStore,
  auth: UserAuth | null,
  onEarned?: (milestone: TradeMilestone) => void
): void {
  // Skip for master key users
  if (isGodMode(auth)) {
    return
  }

  const crossedMilestones = TRADE_MILESTONES.filter((milestone) => {
    const wasBelow = previousWins < milestone.threshold
    const isAbove = currentWins >= milestone.threshold
    const notEarned = !achievements.trades?.[milestone.id]?.earnedAt

    return wasBelow && isAbove && notEarned
  })

  if (crossedMilestones.length === 0) {
    return
  }

  crossedMilestones.forEach((milestone) => {
    // Mark as earned IMMEDIATELY
    try {
      const stored = localStorage.getItem('qf_achievements')
      const current = stored ? JSON.parse(stored) : DEFAULT_STORE
      localStorage.setItem(
        'qf_achievements',
        JSON.stringify({
          ...current,
          trades: {
            ...current.trades,
            [milestone.id]: {
              earnedAt: Date.now(),
              displayed: true,
            },
          },
        })
      )
    } catch (e) {
      // Silent fail
    }

    if (milestone.hasConfetti) {
      confetti({
        particleCount: 3, // Reduced confetti
        spread: 30,
        origin: { y: 0.7 },
      })
    }

    if (milestone.hasSound) {
      soundEffects.playSuccess()
    }

    hapticFeedback.success()

    // Auto-dismiss after 10s
    const toastId = toast.success(milestone.label, {
      description: milestone.description,
      duration: 10000,
      id: `milestone-${milestone.id}`,
      action: {
        label: 'Dismiss',
        onClick: () => toast.dismiss(toastId),
      },
    })

    if (onEarned) {
      onEarned(milestone)
    }
  })
}

/**
 * Reset achievements (for testing only)
 */
export function resetAchievements(): void {
  try {
    localStorage.removeItem('qf_achievements')
    localStorage.removeItem('achievements')
  } catch (e) {
    // Silent fail
  }
}

