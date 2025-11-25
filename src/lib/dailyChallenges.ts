// Daily Challenges System — Increases engagement
// November 24, 2025 — Quantum Falcon Cockpit

import { useKVSafe } from '@/hooks/useKVFallback'

export interface Challenge {
  id: string
  title: string
  description: string
  type: 'trade' | 'profit' | 'streak' | 'strategy' | 'social'
  target: number
  current: number
  reward: {
    type: 'strategy_unlock' | 'xp' | 'badge' | 'discount'
    value: string
    strategyId?: string
  }
  expiresAt: number
  completed: boolean
  claimed: boolean
}

export interface DailyChallengeState {
  challenges: Challenge[]
  lastReset: number
  streak: number
  totalCompleted: number
}

const generateDailyChallenges = (): Challenge[] => {
  const now = Date.now()
  const tomorrow = new Date(now)
  tomorrow.setHours(23, 59, 59, 999)
  const expiresAt = tomorrow.getTime()

  return [
    {
      id: 'daily-trade-1',
      title: 'Execute 3 Trades',
      description: 'Complete 3 trades today to unlock a strategy',
      type: 'trade',
      target: 3,
      current: 0,
      reward: {
        type: 'strategy_unlock',
        value: 'Unlock DCA Advanced for 24 hours',
        strategyId: 'dca-advanced'
      },
      expiresAt,
      completed: false,
      claimed: false
    },
    {
      id: 'daily-profit-1',
      title: 'Make $50 Profit',
      description: 'Earn $50 in profit today',
      type: 'profit',
      target: 50,
      current: 0,
      reward: {
        type: 'strategy_unlock',
        value: 'Unlock Momentum Pro for 24 hours',
        strategyId: 'momentum-pro'
      },
      expiresAt,
      completed: false,
      claimed: false
    },
    {
      id: 'daily-streak-1',
      title: 'Maintain 3-Day Streak',
      description: 'Trade for 3 consecutive days',
      type: 'streak',
      target: 3,
      current: 0,
      reward: {
        type: 'strategy_unlock',
        value: 'Unlock ML Price Predictor for 48 hours',
        strategyId: 'ml-price-predictor'
      },
      expiresAt,
      completed: false,
      claimed: false
    },
    {
      id: 'daily-strategy-1',
      title: 'Try 2 Strategies',
      description: 'Activate 2 different strategies',
      type: 'strategy',
      target: 2,
      current: 0,
      reward: {
        type: 'discount',
        value: '20% off next upgrade'
      },
      expiresAt,
      completed: false,
      claimed: false
    }
  ]
}

export function useDailyChallenges() {
  const [state, setState] = useKVSafe<DailyChallengeState>('daily-challenges', {
    challenges: [],
    lastReset: 0,
    streak: 0,
    totalCompleted: 0
  })

  // Reset challenges daily
  const resetIfNeeded = () => {
    const now = Date.now()
    const lastResetDate = new Date(state.lastReset)
    const today = new Date(now)
    
    // Reset if it's a new day
    if (
      lastResetDate.getDate() !== today.getDate() ||
      lastResetDate.getMonth() !== today.getMonth() ||
      lastResetDate.getFullYear() !== today.getFullYear()
    ) {
      const newChallenges = generateDailyChallenges()
      setState({
        challenges: newChallenges,
        lastReset: now,
        streak: state.streak,
        totalCompleted: state.totalCompleted
      })
    }
  }

  const updateChallenge = (challengeId: string, progress: number) => {
    setState(prev => ({
      ...prev,
      challenges: prev.challenges.map(c => {
        if (c.id === challengeId) {
          const updated = { ...c, current: Math.min(progress, c.target) }
          if (updated.current >= c.target && !updated.completed) {
            updated.completed = true
          }
          return updated
        }
        return c
      })
    }))
  }

  // Auto-update challenges from trade data
  const updateFromTrade = (tradeData: { profit?: number; trades?: number }) => {
    setState(prev => ({
      ...prev,
      challenges: prev.challenges.map(c => {
        if (c.completed) return c
        
        let newProgress = c.current
        switch (c.type) {
          case 'trade':
            if (tradeData.trades) {
              newProgress = Math.min(c.current + tradeData.trades, c.target)
            }
            break
          case 'profit':
            if (tradeData.profit) {
              newProgress = Math.min(c.current + tradeData.profit, c.target)
            }
            break
        }
        
        const updated = { ...c, current: newProgress }
        if (updated.current >= c.target && !updated.completed) {
          updated.completed = true
        }
        return updated
      })
    }))
  }

  const claimReward = (challengeId: string) => {
    const challenge = state.challenges.find(c => c.id === challengeId)
    if (!challenge || !challenge.completed || challenge.claimed) return null

    setState(prev => ({
      ...prev,
      challenges: prev.challenges.map(c =>
        c.id === challengeId ? { ...c, claimed: true } : c
      ),
      totalCompleted: prev.totalCompleted + 1
    }))

    return challenge.reward
  }

  const getActiveChallenges = (): Challenge[] => {
    resetIfNeeded()
    return state.challenges.filter(c => !c.completed && !c.claimed)
  }

  const getCompletedChallenges = (): Challenge[] => {
    return state.challenges.filter(c => c.completed && !c.claimed)
  }

  return {
    challenges: state.challenges,
    streak: state.streak,
    totalCompleted: state.totalCompleted,
    updateChallenge,
    updateFromTrade,
    claimReward,
    getActiveChallenges,
    getCompletedChallenges,
    resetIfNeeded
  }
}

