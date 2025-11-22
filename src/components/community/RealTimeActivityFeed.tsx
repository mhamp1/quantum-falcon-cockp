// Real-Time Activity Feed — Social Proof & FOMO
// November 21, 2025 — Quantum Falcon Cockpit
// Makes users want to come back and see what's happening

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lightning, Trophy, TrendingUp, Sparkle, 
  Fire, Rocket, CheckCircle, Clock
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface Activity {
  id: string
  type: 'profit' | 'strategy' | 'achievement' | 'milestone'
  user: string
  action: string
  amount?: number
  timestamp: number
  icon: React.ReactNode
  color: string
}

const generateActivity = (): Activity => {
  const types: Activity['type'][] = ['profit', 'strategy', 'achievement', 'milestone']
  const users = [
    'DiamondHands', 'SolanaWhale', 'BotMaster3000', 'CryptoNinja',
    'QuantumTrader', 'EliteOperator', 'ProfitHunter', 'FalconPilot'
  ]
  const type = types[Math.floor(Math.random() * types.length)]
  
  let activity: Activity
  
  switch (type) {
    case 'profit':
      const profit = Math.floor(Math.random() * 5000) + 100
      activity = {
        id: `activity-${Date.now()}-${Math.random()}`,
        type: 'profit',
        user: users[Math.floor(Math.random() * users.length)],
        action: `just made $${profit.toLocaleString()} profit`,
        amount: profit,
        timestamp: Date.now(),
        icon: <Trophy size={16} weight="fill" />,
        color: 'text-accent'
      }
      break
    case 'strategy':
      const strategies = ['Liquidity Hunter', 'Whale Shadow', 'MEV Defender', 'Flash Crash Hunter']
      activity = {
        id: `activity-${Date.now()}-${Math.random()}`,
        type: 'strategy',
        user: users[Math.floor(Math.random() * users.length)],
        action: `activated ${strategies[Math.floor(Math.random() * strategies.length)]}`,
        timestamp: Date.now(),
        icon: <Rocket size={16} weight="fill" />,
        color: 'text-primary'
      }
      break
    case 'achievement':
      const achievements = ['First Win', 'Profit Master', 'Strategy Creator', 'Elite Trader']
      activity = {
        id: `activity-${Date.now()}-${Math.random()}`,
        type: 'achievement',
        user: users[Math.floor(Math.random() * users.length)],
        action: `unlocked "${achievements[Math.floor(Math.random() * achievements.length)]}"`,
        timestamp: Date.now(),
        icon: <Sparkle size={16} weight="fill" />,
        color: 'text-accent'
      }
      break
    case 'milestone':
      const milestones = ['$10K profit', '100 trades', '50% win rate', 'Top 10 leaderboard']
      activity = {
        id: `activity-${Date.now()}-${Math.random()}`,
        type: 'milestone',
        user: users[Math.floor(Math.random() * users.length)],
        action: `reached ${milestones[Math.floor(Math.random() * milestones.length)]}`,
        timestamp: Date.now(),
        icon: <Fire size={16} weight="fill" />,
        color: 'text-destructive'
      }
      break
  }
  
  return activity
}

export default function RealTimeActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    // Generate initial activities
    const initial = Array.from({ length: 5 }, () => generateActivity())
    setActivities(initial)

    // Add new activity every 3-8 seconds
    const interval = setInterval(() => {
      const newActivity = generateActivity()
      setActivities(prev => [newActivity, ...prev].slice(0, 10))
    }, Math.random() * 5000 + 3000)

    return () => clearInterval(interval)
  }, [])

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  return (
    <div className="cyber-card p-4 space-y-3 relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-5" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Lightning size={20} weight="fill" className="text-primary animate-pulse" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
            Live Activity
          </h3>
          <div className="ml-auto flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">LIVE</span>
          </div>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {activities.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className={cn(
                  "flex items-center gap-3 p-2 rounded border border-primary/10 hover:bg-primary/5 transition-colors",
                  idx === 0 && "bg-primary/10 border-primary/30"
                )}
              >
                <div className={cn("p-1.5 rounded", activity.color, "bg-current/20")}>
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs">
                    <span className="font-bold text-primary">{activity.user}</span>
                    {' '}
                    <span className="text-muted-foreground">{activity.action}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock size={10} />
                    {getTimeAgo(activity.timestamp)}
                  </p>
                </div>
                {activity.amount && (
                  <div className="text-xs font-bold text-accent">
                    +${activity.amount.toLocaleString()}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="pt-3 border-t border-primary/10">
          <p className="text-[10px] text-muted-foreground text-center uppercase tracking-wider">
            Updates every few seconds • Join the action!
          </p>
        </div>
      </div>
    </div>
  )
}

