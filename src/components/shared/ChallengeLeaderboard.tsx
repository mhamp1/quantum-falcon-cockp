// Challenge Leaderboard — Top Challenge Completers
// November 24, 2025 — Quantum Falcon Cockpit

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, Medal, Crown, Star, Fire, 
  TrendingUp, Users, Award, Sparkle
} from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKVSafe } from '@/hooks/useKVFallback'
import { cn } from '@/lib/utils'

interface LeaderboardEntry {
  userId: string
  username: string
  avatar?: string
  totalCompleted: number
  streak: number
  level: number
  xp: number
  rank: number
  badges: string[]
}

export default function ChallengeLeaderboard() {
  const [leaderboard, setLeaderboard] = useKVSafe<LeaderboardEntry[]>('challenge-leaderboard', [])
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'all-time'>('all-time')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Simulate leaderboard data (in production, fetch from API)
  useEffect(() => {
    const mockLeaderboard: LeaderboardEntry[] = [
      {
        userId: 'user1',
        username: 'QuantumWhale',
        avatar: '🐋',
        totalCompleted: 247,
        streak: 45,
        level: 28,
        xp: 125000,
        rank: 1,
        badges: ['🔥', '👑', '⚡']
      },
      {
        userId: 'user2',
        username: 'FalconSniper',
        avatar: '🎯',
        totalCompleted: 198,
        streak: 32,
        level: 25,
        xp: 98000,
        rank: 2,
        badges: ['🔥', '⚡']
      },
      {
        userId: 'user3',
        username: 'AlphaTrader',
        avatar: '🚀',
        totalCompleted: 176,
        streak: 28,
        level: 22,
        xp: 87000,
        rank: 3,
        badges: ['🔥']
      },
      {
        userId: 'user4',
        username: 'CryptoMaster',
        avatar: '💎',
        totalCompleted: 154,
        streak: 21,
        level: 20,
        xp: 75000,
        rank: 4,
        badges: []
      },
      {
        userId: 'user5',
        username: 'TradingElite',
        avatar: '⭐',
        totalCompleted: 142,
        streak: 18,
        level: 18,
        xp: 68000,
        rank: 5,
        badges: []
      }
    ]

    setLeaderboard(mockLeaderboard)
  }, [setLeaderboard])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown size={24} weight="fill" className="text-yellow-400" />
      case 2: return <Medal size={24} weight="fill" className="text-gray-300" />
      case 3: return <Medal size={24} weight="fill" className="text-orange-400" />
      default: return <span className="text-lg font-black text-primary">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'border-yellow-500/50 bg-yellow-500/10'
      case 2: return 'border-gray-400/50 bg-gray-400/10'
      case 3: return 'border-orange-500/50 bg-orange-500/10'
      default: return 'border-primary/30 bg-primary/5'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-wider text-primary flex items-center gap-3">
            <Trophy size={28} weight="fill" className="text-yellow-400" />
            Challenge Leaderboard
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Top challenge completers and streak champions
          </p>
        </div>
        <Badge className="bg-accent/20 border-accent/50 text-accent">
          <Users size={14} className="mr-1" />
          {leaderboard.length} Players
        </Badge>
      </div>

      {/* Timeframe Filter */}
      <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md bg-card/50 backdrop-blur-sm border-2 border-primary/30 p-1 gap-1">
          <TabsTrigger value="daily" className="uppercase tracking-[0.12em] font-bold text-xs">
            Daily
          </TabsTrigger>
          <TabsTrigger value="weekly" className="uppercase tracking-[0.12em] font-bold text-xs">
            Weekly
          </TabsTrigger>
          <TabsTrigger value="all-time" className="uppercase tracking-[0.12em] font-bold text-xs">
            All-Time
          </TabsTrigger>
        </TabsList>

        <TabsContent value={timeframe} className="space-y-4">
          {/* Top 3 Podium */}
          {leaderboard.slice(0, 3).length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[1, 0, 2].map((idx) => {
                const entry = leaderboard[idx]
                if (!entry) return null
                return (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={cn(
                      "cyber-card p-6 text-center border-2",
                      getRankColor(entry.rank),
                      idx === 0 && "order-2 scale-110 z-10"
                    )}
                  >
                    <div className="mb-3">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="text-4xl mb-2">{entry.avatar}</div>
                    <h4 className="font-black uppercase tracking-wider text-primary mb-1">
                      {entry.username}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="text-primary font-bold">
                        {entry.totalCompleted} Completed
                      </div>
                      <div className="flex items-center justify-center gap-1 text-accent">
                        <Fire size={14} weight="fill" />
                        <span className="font-bold">{entry.streak} day streak</span>
                      </div>
                      <div className="text-muted-foreground">
                        Level {entry.level}
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-3">
                      {entry.badges.map((badge, i) => (
                        <span key={i} className="text-xl">{badge}</span>
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Rest of Leaderboard */}
          <div className="space-y-3">
            {leaderboard.slice(3).map((entry, idx) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (idx + 3) * 0.05 }}
              >
                <Card className="cyber-card p-4 border border-primary/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/50">
                      <span className="text-2xl">{entry.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg font-black text-primary">#{entry.rank}</span>
                        <h5 className="font-black uppercase tracking-wider text-primary">
                          {entry.username}
                        </h5>
                        <Badge className="bg-accent/20 border-accent/50 text-accent text-xs">
                          Level {entry.level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Trophy size={14} className="text-primary" />
                          <span className="text-foreground font-bold">{entry.totalCompleted}</span>
                          <span className="text-muted-foreground">completed</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Fire size={14} weight="fill" className="text-orange-400" />
                          <span className="text-foreground font-bold">{entry.streak}</span>
                          <span className="text-muted-foreground">day streak</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={14} weight="fill" className="text-yellow-400" />
                          <span className="text-foreground font-bold">{entry.xp.toLocaleString()}</span>
                          <span className="text-muted-foreground">XP</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.badges.map((badge, i) => (
                        <span key={i} className="text-2xl">{badge}</span>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

