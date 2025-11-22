// Achievement Badges Display Component
// November 21, 2025 — Quantum Falcon Cockpit
// Shows user's unlocked NFT achievement badges

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Sparkle, Crown, Target } from '@phosphor-icons/react'
import { ACHIEVEMENT_NFTS, AchievementNFT, getUnlockedAchievements } from '@/lib/achievements/nftBadges'
import { isGodMode } from '@/lib/godMode'
import { UserAuth } from '@/lib/auth'

interface AchievementBadgesProps {
  userStats: {
    totalProfit?: number
    portfolioValue?: number
    weeklyWinRate?: number
    totalTrades?: number
    dailyStreak?: number
  }
  auth: UserAuth | null
}

const tierColors = {
  bronze: 'border-amber-600 bg-amber-900/20',
  silver: 'border-gray-400 bg-gray-800/20',
  gold: 'border-yellow-400 bg-yellow-900/20',
  diamond: 'border-cyan-400 bg-cyan-900/20',
  rainbow: 'rainbow-border bg-gradient-to-br from-pink-900/30 via-purple-900/30 to-cyan-900/30',
}

const tierIcons = {
  bronze: <Trophy size={24} weight="fill" className="text-amber-600" />,
  silver: <Trophy size={24} weight="fill" className="text-gray-400" />,
  gold: <Trophy size={24} weight="fill" className="text-yellow-400" />,
  diamond: <Crown size={24} weight="fill" className="text-cyan-400" />,
  rainbow: <Sparkle size={24} weight="fill" className="text-pink-400" />,
}

export default function AchievementBadges({ userStats, auth }: AchievementBadgesProps) {
  const unlockedAchievements = useMemo(() => {
    return getUnlockedAchievements({
      ...userStats,
      isGodMode: isGodMode(auth),
    })
  }, [userStats, auth])

  if (unlockedAchievements.length === 0) {
    return (
      <div className="cyber-card p-8 text-center">
        <Target size={48} weight="duotone" className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-bold uppercase mb-2">No Achievements Yet</h3>
        <p className="text-sm text-muted-foreground">
          Start trading to unlock your first achievement!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {unlockedAchievements.map((achievement, index) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`
            relative p-4 rounded-xl border-2 ${tierColors[achievement.tier]}
            hover:scale-105 transition-transform cursor-pointer group
          `}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              {tierIcons[achievement.tier]}
              {achievement.tier === 'rainbow' && (
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0"
                >
                  <Sparkle size={24} weight="fill" className="text-cyan-400 opacity-50" />
                </motion.div>
              )}
            </div>
            <div className="text-center">
              <h4 className="font-bold text-sm uppercase mb-1">{achievement.name}</h4>
              <p className="text-xs text-muted-foreground">{achievement.description}</p>
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-bold uppercase bg-primary/20 text-primary px-2 py-1 rounded">
                {achievement.symbol}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

