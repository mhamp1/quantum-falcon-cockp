// ═══════════════════════════════════════════════════════════════
// Q-LEARNING PANEL — LIVE LEARNING DISPLAY
// November 29, 2025 — Quantum Falcon Cockpit v2025.1.0
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, TrendingUp, Zap, Crown, Pulse, Activity, Gauge } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { qAgent, type QLearningStats } from '@/lib/rl/qLearningAgent'
import { usePersistentAuth } from '@/lib/auth/usePersistentAuth'
import { isGodMode } from '@/lib/godMode'
import { cn } from '@/lib/utils'

export default function QLearningPanel() {
  const { auth } = usePersistentAuth()
  const isGod = isGodMode(auth)
  
  const [stats, setStats] = useState<QLearningStats>({
    totalTrades: 0,
    winRate: 0,
    totalProfit: 0,
    qTableSize: 0,
    learningProgress: 0
  })

  useEffect(() => {
    const updateStats = () => {
      // Get trade history from localStorage
      const tradeHistory = JSON.parse(localStorage.getItem('trade-history') || '[]')
      
      // Calculate stats
      const agentStats = qAgent.getStats(tradeHistory)
      setStats(agentStats)
    }
    
    updateStats()
    const interval = setInterval(updateStats, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "cyber-card p-8 border-4 relative overflow-hidden",
        isGod ? "border-yellow-500/60 bg-gradient-to-br from-yellow-900/20 via-black to-black" : "border-cyan-500/60 bg-gradient-to-br from-black via-purple-900/20 to-black"
      )}
      style={{ boxShadow: isGod ? '0 0 60px rgba(255, 193, 7, 0.3)' : '0 0 60px rgba(0, 255, 255, 0.3)' }}
    >
      {isGod && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-8 -right-8 opacity-40"
        >
          <Crown size={80} weight="fill" className="text-yellow-400" />
        </motion.div>
      )}

      <div className="relative z-10 space-y-6 text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Brain size={64} weight="duotone" className={cn("mx-auto", isGod ? "text-yellow-400" : "text-cyan-400")} />
        </motion.div>
        
        <div>
          <h2 className={cn(
            "text-3xl font-black uppercase mb-2",
            isGod ? "text-yellow-400" : "text-cyan-400"
          )}>
            Q-LEARNING AGENT
          </h2>
          <Badge className={cn(
            "text-lg px-8 py-3",
            isGod 
              ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black" 
              : "bg-gradient-to-r from-cyan-500 to-purple-500"
          )}>
            <Pulse size={20} className="mr-2" weight="duotone" />
            LEARNING LIVE • {stats.qTableSize} STATES
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card className="p-4 border-2 border-green-500/50 bg-green-500/10">
            <p className="text-green-300 text-xs uppercase mb-2">Win Rate</p>
            <p className="text-4xl font-black text-green-400">{stats.winRate.toFixed(1)}%</p>
          </Card>
          
          <Card className="p-4 border-2 border-cyan-500/50 bg-cyan-500/10">
            <p className="text-cyan-300 text-xs uppercase mb-2">Total Profit</p>
            <p className="text-4xl font-black text-cyan-400">${stats.totalProfit.toFixed(0)}</p>
          </Card>
          
          <Card className="p-4 border-2 border-purple-500/50 bg-purple-500/10">
            <p className="text-purple-300 text-xs uppercase mb-2">Q-Table Size</p>
            <p className="text-4xl font-black text-purple-400">{stats.qTableSize}</p>
          </Card>
          
          <Card className="p-4 border-2 border-yellow-500/50 bg-yellow-500/10">
            <p className="text-yellow-300 text-xs uppercase mb-2">Learning</p>
            <p className="text-4xl font-black text-yellow-400">{stats.learningProgress.toFixed(0)}%</p>
          </Card>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground uppercase">Learning Progress</span>
            <span className="text-sm font-bold text-primary">{stats.learningProgress.toFixed(1)}%</span>
          </div>
          <Progress value={stats.learningProgress} className="h-4" />
          <p className="text-xs text-muted-foreground mt-2">
            {stats.totalTrades} trades analyzed • Agent gets smarter with every trade
          </p>
        </div>

        {isGod && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mt-6"
          >
            <Badge className="text-2xl px-12 py-4 bg-gradient-to-r from-yellow-400 to-amber-600 text-black">
              <Crown size={28} className="mr-3" weight="fill" />
              GOD MODE — PERFECT Q-TABLE
            </Badge>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

