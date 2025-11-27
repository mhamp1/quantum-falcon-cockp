// Today's PnL Widget — Quantum Falcon v2025.1.0
// November 26, 2025 — Launch Day

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendUp, TrendDown, Fire, Trophy, Lightning, Clock } from '@phosphor-icons/react'
import { useKVSafe } from '@/hooks/useKVFallback'
import { soundEffects } from '@/lib/soundEffects'
import confetti from 'canvas-confetti'

interface TodayStats {
  pnl: number
  trades: number
  wins: number
  streak: number
  bestTrade: number
  lastUpdate: number
}

const defaultStats: TodayStats = {
  pnl: 0,
  trades: 0,
  wins: 0,
  streak: 0,
  bestTrade: 0,
  lastUpdate: Date.now()
}

export default function TodaysPnLWidget() {
  const [stats, setStats] = useKVSafe<TodayStats>('todays-pnl-stats', defaultStats)
  const [isAnimating, setIsAnimating] = useState(false)

  // Reset stats at midnight
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date()
      const lastUpdate = new Date(stats.lastUpdate)
      if (now.getDate() !== lastUpdate.getDate()) {
        setStats({ ...defaultStats, lastUpdate: Date.now() })
      }
    }
    checkMidnight()
    const interval = setInterval(checkMidnight, 60000)
    return () => clearInterval(interval)
  }, [stats.lastUpdate, setStats])

  // Celebrate big profits
  useEffect(() => {
    if (stats.pnl >= 1000 && !isAnimating) {
      setIsAnimating(true)
      soundEffects.playBigProfit()
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00d4ff', '#a855f7', '#fbbf24']
      })
      setTimeout(() => setIsAnimating(false), 2000)
    }
  }, [stats.pnl, isAnimating])

  const winRate = useMemo(() => {
    if (stats.trades === 0) return 0
    return Math.round((stats.wins / stats.trades) * 100)
  }, [stats.wins, stats.trades])

  const isProfitable = stats.pnl >= 0
  const isOnFire = stats.streak >= 3

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        cyber-card p-4 relative overflow-hidden
        ${isProfitable ? 'border-primary/50' : 'border-destructive/50'}
        ${isOnFire ? 'ring-2 ring-orange-500/50' : ''}
      `}
    >
      {/* Background glow */}
      <div className={`
        absolute inset-0 opacity-20
        ${isProfitable 
          ? 'bg-gradient-to-br from-primary/30 to-transparent' 
          : 'bg-gradient-to-br from-destructive/30 to-transparent'
        }
      `} />

      {/* Fire effect for streaks */}
      <AnimatePresence>
        {isOnFire && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-2 right-2"
          >
            <Fire size={24} weight="fill" className="text-orange-500 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-muted-foreground" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
              Today's P&L
            </span>
          </div>
          {stats.streak > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-full">
              <Lightning size={12} weight="fill" className="text-orange-400" />
              <span className="text-xs font-bold text-orange-400">{stats.streak} streak</span>
            </div>
          )}
        </div>

        {/* Main PnL Display */}
        <motion.div
          key={stats.pnl}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="flex items-baseline gap-2"
        >
          {isProfitable ? (
            <TrendUp size={28} weight="bold" className="text-primary" />
          ) : (
            <TrendDown size={28} weight="bold" className="text-destructive" />
          )}
          <span className={`
            text-3xl font-black font-mono
            ${isProfitable ? 'text-primary' : 'text-destructive'}
          `}>
            {isProfitable ? '+' : ''}{stats.pnl.toFixed(2)}
          </span>
          <span className="text-muted-foreground text-sm">USD</span>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{stats.trades}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Trades</div>
          </div>
          <div className="text-center">
            <div className={`text-lg font-bold ${winRate >= 50 ? 'text-primary' : 'text-destructive'}`}>
              {winRate}%
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">
              ${stats.bestTrade.toFixed(0)}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Best</div>
          </div>
        </div>

        {/* Milestone indicators */}
        {stats.pnl >= 1000 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 p-2 bg-yellow-500/20 rounded-lg"
          >
            <Trophy size={16} weight="fill" className="text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400 uppercase">$1K+ Day!</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// Helper function to record a trade (call this from trading components)
export function recordTrade(pnl: number): void {
  const key = 'spark_kv_todays-pnl-stats'
  try {
    const stored = localStorage.getItem(key)
    const stats: TodayStats = stored ? JSON.parse(stored) : defaultStats
    
    // Check if new day
    const now = new Date()
    const lastUpdate = new Date(stats.lastUpdate)
    if (now.getDate() !== lastUpdate.getDate()) {
      // Reset for new day
      localStorage.setItem(key, JSON.stringify({
        pnl,
        trades: 1,
        wins: pnl > 0 ? 1 : 0,
        streak: pnl > 0 ? 1 : 0,
        bestTrade: Math.max(0, pnl),
        lastUpdate: Date.now()
      }))
      return
    }
    
    // Update existing stats
    const newStats: TodayStats = {
      pnl: stats.pnl + pnl,
      trades: stats.trades + 1,
      wins: stats.wins + (pnl > 0 ? 1 : 0),
      streak: pnl > 0 ? stats.streak + 1 : 0,
      bestTrade: Math.max(stats.bestTrade, pnl),
      lastUpdate: Date.now()
    }
    
    localStorage.setItem(key, JSON.stringify(newStats))
    
    // Play streak sound if applicable
    if (newStats.streak > 0 && newStats.streak % 3 === 0) {
      soundEffects.playStreak()
    }
  } catch (e) {
    console.warn('Failed to record trade stats:', e)
  }
}

