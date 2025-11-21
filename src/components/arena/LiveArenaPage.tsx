// Live Arena Page — Leaderboard and King of the Hill
// November 21, 2025 — Quantum Falcon Cockpit

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Crown, Trophy, Target, Flame, Medal, Zap } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { fetchArenaLeaderboard, createMockLeaderboard } from '@/lib/arena/client'
import type { ArenaLeaderboardResponse, ArenaTimeframe, StrategyPerformance } from '@/lib/arena/types'

export default function LiveArenaPage() {
  const [timeframe, setTimeframe] = useState<ArenaTimeframe>('daily')
  const [leaderboard, setLeaderboard] = useState<ArenaLeaderboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  
  // Fetch leaderboard data
  const loadLeaderboard = async (tf: ArenaTimeframe) => {
    setIsLoading(true)
    try {
      // Try to fetch from backend, fallback to mock data
      let data: ArenaLeaderboardResponse
      try {
        data = await fetchArenaLeaderboard(tf)
      } catch {
        console.warn('Using mock leaderboard data')
        data = createMockLeaderboard(tf)
      }
      
      setLeaderboard(data)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Failed to load leaderboard:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    loadLeaderboard(timeframe)
  }, [timeframe])

  // Auto-refresh every 30 seconds (reduced from 10s to avoid excessive API load)
  useEffect(() => {
    const REFRESH_INTERVAL = 30000 // 30 seconds
    const interval = setInterval(() => {
      loadLeaderboard(timeframe)
    }, REFRESH_INTERVAL)
    
    return () => clearInterval(interval)
  }, [timeframe])

  // Calculate total profit
  const totalProfit = leaderboard?.entries
    .filter(e => e.pnlUsd > 0)
    .reduce((sum, e) => sum + e.pnlUsd, 0) || 0

  // Top 3 for podium
  const top3 = leaderboard?.entries.slice(0, 3) || []
  const remaining = leaderboard?.entries.slice(3) || []

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          <Trophy size={64} weight="duotone" className="text-primary" />
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-primary neon-glow-primary mb-4">
          LIVE ARENA
        </h1>
        <p className="text-lg text-muted-foreground uppercase tracking-wider">
          King of the Hill • Real-Time Rankings
        </p>
      </motion.div>

      {/* Live Profit Ticker */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="cyber-card-accent p-6 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 animate-pulse" />
        <div className="relative z-10">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
            Live Profit Pool
          </p>
          <motion.p
            key={totalProfit}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl md:text-6xl font-black text-accent neon-glow"
          >
            ${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </motion.p>
          <p className="text-[10px] text-muted-foreground mt-2">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      </motion.div>

      {/* Timeframe Tabs */}
      <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as ArenaTimeframe)}>
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value={timeframe} className="mt-8 space-y-8">
          {/* Top 3 Podium */}
          {!isLoading && top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 2nd Place */}
              {top3[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="cyber-card p-6 relative order-2 md:order-1"
                >
                  <PodiumCard entry={top3[1]} rank={2} />
                </motion.div>
              )}

              {/* 1st Place - King of the Hill */}
              {top3[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="cyber-card-accent p-6 relative order-1 md:order-2 md:scale-110 md:z-10"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                    >
                      <Crown size={48} weight="fill" className="text-primary drop-shadow-[0_0_20px_oklch(0.72_0.20_195)]" />
                    </motion.div>
                  </div>
                  <PodiumCard entry={top3[0]} rank={1} isKing />
                </motion.div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="cyber-card p-6 relative order-3"
                >
                  <PodiumCard entry={top3[2]} rank={3} />
                </motion.div>
              )}
            </div>
          )}

          {/* Remaining Leaderboard Table */}
          {!isLoading && remaining.length > 0 && (
            <div className="cyber-card p-6">
              <h3 className="text-xl font-bold uppercase tracking-wide text-primary mb-6 flex items-center gap-2">
                <Flame size={24} weight="duotone" />
                Full Rankings
              </h3>
              
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {remaining.map((entry, i) => (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center gap-4 p-4 bg-background/60 border border-primary/20 rounded-lg hover:border-primary/50 transition-colors"
                    >
                      {/* Rank */}
                      <div className="w-12 h-12 flex items-center justify-center bg-muted/20 rounded-lg font-bold text-lg text-muted-foreground">
                        #{i + 4}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{entry.username}</p>
                        <p className="text-xs text-muted-foreground truncate">{entry.agentName}</p>
                      </div>

                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-4 text-xs">
                        <div className="text-right">
                          <p className="text-accent font-bold">${entry.pnlUsd.toLocaleString()}</p>
                          <p className="text-muted-foreground">{entry.pnlPct.toFixed(1)}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-primary font-bold">{entry.winRatePct.toFixed(1)}%</p>
                          <p className="text-muted-foreground">{entry.trades} trades</p>
                        </div>
                      </div>

                      {/* Badges */}
                      {entry.badges.length > 0 && (
                        <Badge className="bg-primary/10 text-primary border-primary/30 text-[9px]">
                          {entry.badges[0]}
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Zap size={64} weight="duotone" className="text-primary mx-auto mb-4" />
              </motion.div>
              <p className="text-xl text-muted-foreground">
                Loading leaderboard...
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* CTA Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strategy Bounty Board */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="cyber-card p-6"
        >
          <Target size={32} weight="duotone" className="text-accent mb-4" />
          <h3 className="text-xl font-bold uppercase tracking-wide mb-2">
            Strategy Bounty Board
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Submit your winning strategies and earn rewards when others use them.
          </p>
          <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent/10">
            Coming Soon
          </Button>
        </motion.div>

        {/* Claim Throne */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="cyber-card-accent p-6"
        >
          <Crown size={32} weight="duotone" className="text-primary mb-4" />
          <h3 className="text-xl font-bold uppercase tracking-wide mb-2">
            Claim the Throne
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Deploy your best agent and compete for King of the Hill rewards.
          </p>
          <Button className="w-full bg-gradient-to-r from-primary to-accent">
            Enter Arena
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

/**
 * Podium Card Component
 */
interface PodiumCardProps {
  entry: StrategyPerformance
  rank: number
  isKing?: boolean
}

function PodiumCard({ entry, rank, isKing = false }: PodiumCardProps) {
  const rankColors = {
    1: 'text-primary',
    2: 'text-secondary',
    3: 'text-accent',
  }

  const rankIcons = {
    1: <Crown size={24} weight="fill" className="text-primary" />,
    2: <Medal size={24} weight="fill" className="text-secondary" />,
    3: <Medal size={24} weight="fill" className="text-accent" />,
  }

  return (
    <div className="text-center space-y-4">
      {/* Rank Badge */}
      <div className="flex items-center justify-center mb-2">
        {rankIcons[rank as keyof typeof rankIcons]}
      </div>

      {/* Username */}
      <div>
        <h3 className={`text-2xl font-black uppercase ${rankColors[rank as keyof typeof rankColors]} neon-glow`}>
          {entry.username}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{entry.agentName}</p>
      </div>

      {/* Main PnL */}
      <div className="py-4">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
          Profit
        </p>
        <p className={`text-4xl font-black ${rankColors[rank as keyof typeof rankColors]} neon-glow`}>
          ${entry.pnlUsd.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {entry.pnlPct.toFixed(1)}% return
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-background/60 rounded-lg">
          <p className="text-muted-foreground mb-1">Win Rate</p>
          <p className="font-bold">{entry.winRatePct.toFixed(1)}%</p>
        </div>
        <div className="p-3 bg-background/60 rounded-lg">
          <p className="text-muted-foreground mb-1">Trades</p>
          <p className="font-bold">{entry.trades}</p>
        </div>
        <div className="p-3 bg-background/60 rounded-lg">
          <p className="text-muted-foreground mb-1">Sharpe</p>
          <p className="font-bold">{entry.sharpe.toFixed(2)}</p>
        </div>
        <div className="p-3 bg-background/60 rounded-lg">
          <p className="text-muted-foreground mb-1">Streak</p>
          <p className="font-bold">{entry.streakDaysTop10}d</p>
        </div>
      </div>

      {/* Badges */}
      {entry.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {entry.badges.slice(0, 2).map((badge, i) => (
            <Badge
              key={i}
              className="bg-primary/10 text-primary border-primary/30 text-[8px] uppercase"
            >
              {badge}
            </Badge>
          ))}
        </div>
      )}

      {/* King Badge */}
      {isKing && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 text-xs uppercase tracking-wider">
            👑 King of the Hill
          </Badge>
        </motion.div>
      )}
    </div>
  )
}
