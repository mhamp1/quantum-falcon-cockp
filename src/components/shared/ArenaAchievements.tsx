// Arena Achievements Component — Show off your battle glory
// November 21, 2025 — Quantum Falcon Cockpit

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Star, Crown, Flame, Target, Zap, Award, Swords, Users } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useKVSafe } from '@/hooks/useKVFallback'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

interface ArenaAchievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'combat' | 'social' | 'strategic' | 'legendary'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  requirement: string
  reward: {
    type: 'badge' | 'title' | 'bonus'
    value: string
  }
  progress: number
  maxProgress: number
  unlocked: boolean
  unlockedAt?: string
}

const ARENA_ACHIEVEMENTS: ArenaAchievement[] = [
  // Combat Achievements
  {
    id: 'first-victory',
    name: 'First Blood',
    description: 'Win your first arena battle',
    icon: '⚔️',
    category: 'combat',
    rarity: 'common',
    requirement: 'Win 1 battle',
    reward: { type: 'badge', value: 'Arena Warrior' },
    progress: 0,
    maxProgress: 1,
    unlocked: false,
  },
  {
    id: 'winning-streak-5',
    name: 'Hot Streak',
    description: 'Win 5 battles in a row',
    icon: '🔥',
    category: 'combat',
    rarity: 'rare',
    requirement: 'Win 5 consecutive battles',
    reward: { type: 'badge', value: 'Streak Master' },
    progress: 0,
    maxProgress: 5,
    unlocked: false,
  },
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Win 100 arena battles',
    icon: '💯',
    category: 'combat',
    rarity: 'epic',
    requirement: 'Win 100 battles',
    reward: { type: 'title', value: 'Battle Legend' },
    progress: 0,
    maxProgress: 100,
    unlocked: false,
  },
  {
    id: 'perfect-week',
    name: 'Perfect Week',
    description: 'Win every battle for 7 days',
    icon: '🌟',
    category: 'combat',
    rarity: 'legendary',
    requirement: '7 consecutive daily wins',
    reward: { type: 'bonus', value: '10% bonus XP for 1 month' },
    progress: 0,
    maxProgress: 7,
    unlocked: false,
  },

  // Social Achievements
  {
    id: 'crowd-pleaser',
    name: 'Crowd Pleaser',
    description: 'Get 100 cheers in a single battle',
    icon: '🎉',
    category: 'social',
    rarity: 'rare',
    requirement: 'Receive 100 cheers',
    reward: { type: 'badge', value: 'Crowd Favorite' },
    progress: 0,
    maxProgress: 100,
    unlocked: false,
  },
  {
    id: 'taunt-master',
    name: 'Taunt Master',
    description: 'Send 50 taunting messages',
    icon: '😈',
    category: 'social',
    rarity: 'common',
    requirement: 'Send 50 taunts',
    reward: { type: 'badge', value: 'Trash Talker' },
    progress: 0,
    maxProgress: 50,
    unlocked: false,
  },

  // Strategic Achievements
  {
    id: 'whale-slayer',
    name: 'Whale Slayer',
    description: 'Beat an opponent with 10x more portfolio',
    icon: '🐋',
    category: 'strategic',
    rarity: 'epic',
    requirement: 'Beat whale-sized opponent',
    reward: { type: 'title', value: 'David vs Goliath' },
    progress: 0,
    maxProgress: 1,
    unlocked: false,
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Execute 10 trades in under 30 seconds',
    icon: '⚡',
    category: 'strategic',
    rarity: 'rare',
    requirement: '10 fast trades',
    reward: { type: 'badge', value: 'Lightning Fast' },
    progress: 0,
    maxProgress: 10,
    unlocked: false,
  },

  // Legendary Achievements
  {
    id: 'arena-champion',
    name: 'Arena Champion',
    description: 'Win the weekly championship tournament',
    icon: '👑',
    category: 'legendary',
    rarity: 'legendary',
    requirement: 'Win weekly tournament',
    reward: { type: 'title', value: 'Arena Champion' },
    progress: 0,
    maxProgress: 1,
    unlocked: false,
  },
  {
    id: 'millionaire-maker',
    name: 'Millionaire Maker',
    description: 'Help another trader reach $1M profit',
    icon: '💰',
    category: 'legendary',
    rarity: 'legendary',
    requirement: 'Mentor success',
    reward: { type: 'bonus', value: 'Exclusive mentorship program' },
    progress: 0,
    maxProgress: 1,
    unlocked: false,
  },
]

const RARITY_COLORS = {
  common: 'border-gray-500 bg-gray-500/10 text-gray-400',
  rare: 'border-blue-500 bg-blue-500/10 text-blue-400',
  epic: 'border-purple-500 bg-purple-500/10 text-purple-400',
  legendary: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
}

const CATEGORY_ICONS = {
  combat: <Swords size={16} />,
  social: <Users size={16} />,
  strategic: <Target size={16} />,
  legendary: <Crown size={16} />,
}

export default function ArenaAchievements() {
  const [userStats] = useKVSafe('arena-user-stats', {
    battlesWon: 0,
    battlesLost: 0,
    currentStreak: 0,
    totalBattles: 0,
    cheersReceived: 0,
    tauntsSent: 0,
    fastestTrades: 0,
    weeklyWins: 0,
  })

  const [unlockedAchievements, setUnlockedAchievements] = useKVSafe<string[]>('arena-unlocked-achievements', [])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Calculate achievement progress based on user stats
  const achievementsWithProgress = ARENA_ACHIEVEMENTS.map(achievement => {
    let progress = 0

    switch (achievement.id) {
      case 'first-victory':
        progress = Math.min(userStats.battlesWon, 1)
        break
      case 'winning-streak-5':
        progress = Math.min(userStats.currentStreak, 5)
        break
      case 'century-club':
        progress = Math.min(userStats.battlesWon, 100)
        break
      case 'crowd-pleaser':
        progress = Math.min(userStats.cheersReceived, 100)
        break
      case 'taunt-master':
        progress = Math.min(userStats.tauntsSent, 50)
        break
      case 'speed-demon':
        progress = Math.min(userStats.fastestTrades, 10)
        break
      // Add more progress calculations as needed
      default:
        progress = achievement.progress
    }

    const isUnlocked = unlockedAchievements.includes(achievement.id) || progress >= achievement.maxProgress

    return {
      ...achievement,
      progress,
      unlocked: isUnlocked,
      unlockedAt: isUnlocked && !achievement.unlockedAt ? new Date().toISOString() : achievement.unlockedAt,
    }
  })

  // Check for newly unlocked achievements
  useEffect(() => {
    const newlyUnlocked = achievementsWithProgress.filter(
      achievement => achievement.unlocked && !unlockedAchievements.includes(achievement.id)
    )

    if (newlyUnlocked.length > 0) {
      const newIds = newlyUnlocked.map(a => a.id)
      setUnlockedAchievements(prev => [...prev, ...newIds])

      // Celebration
      newlyUnlocked.forEach(achievement => {
        toast.success(`🏆 Arena Achievement Unlocked: ${achievement.name}!`, {
          description: achievement.reward.value,
          duration: 5000,
        })

        // Special celebration for legendary achievements
        if (achievement.rarity === 'legendary') {
          confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FF1493', '#00FFFF'],
          })
        }
      })
    }
  }, [achievementsWithProgress, unlockedAchievements, setUnlockedAchievements])

  const filteredAchievements = selectedCategory === 'all'
    ? achievementsWithProgress
    : achievementsWithProgress.filter(a => a.category === selectedCategory)

  const completionRate = Math.round(
    (achievementsWithProgress.filter(a => a.unlocked).length / achievementsWithProgress.length) * 100
  )

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="cyber-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-wider text-primary">
              Arena Achievements
            </h3>
            <p className="text-muted-foreground">Battle glory and legendary status</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-accent">{completionRate}%</p>
            <p className="text-sm text-muted-foreground">Complete</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{userStats.battlesWon}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Victories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-400">{userStats.currentStreak}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Win Streak</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{userStats.cheersReceived}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Cheers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">
              {achievementsWithProgress.filter(a => a.unlocked).length}
            </p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Unlocked</p>
          </div>
        </div>
      </Card>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'All', icon: <Award size={16} /> },
          { id: 'combat', label: 'Combat', icon: CATEGORY_ICONS.combat },
          { id: 'social', label: 'Social', icon: CATEGORY_ICONS.social },
          { id: 'strategic', label: 'Strategic', icon: CATEGORY_ICONS.strategic },
          { id: 'legendary', label: 'Legendary', icon: CATEGORY_ICONS.legendary },
        ].map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center gap-2"
          >
            {category.icon}
            {category.label}
          </Button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`p-4 border-2 transition-all hover:scale-105 ${
              achievement.unlocked
                ? RARITY_COLORS[achievement.rarity]
                : 'border-muted bg-muted/20'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-50'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-bold truncate ${
                      achievement.unlocked ? '' : 'text-muted-foreground'
                    }`}>
                      {achievement.name}
                    </h4>
                    <Badge className={`text-xs ${
                      achievement.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
                      achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
                      achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {achievement.rarity}
                    </Badge>
                  </div>

                  <p className={`text-sm mb-3 ${
                    achievement.unlocked ? 'text-muted-foreground' : 'text-muted-foreground/70'
                  }`}>
                    {achievement.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <Progress
                      value={(achievement.progress / achievement.maxProgress) * 100}
                      className="h-2"
                    />
                  </div>

                  {/* Reward */}
                  <div className="text-xs text-muted-foreground">
                    Reward: {achievement.reward.type} - {achievement.reward.value}
                  </div>

                  {/* Unlocked Badge */}
                  {achievement.unlocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-2"
                    >
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        ✅ Unlocked {achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : ''}
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
