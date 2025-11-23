// Profit Milestone Celebration — Premium Celebration Animations
// November 21, 2025 — Quantum Falcon Cockpit

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Sparkle, Confetti } from '@phosphor-icons/react'
import { hapticFeedback } from '@/lib/hapticFeedback'
import { soundEffects } from '@/lib/soundEffects'

interface Milestone {
  amount: number
  label: string
  icon: React.ReactNode
}

const MILESTONES: Milestone[] = [
  { amount: 100, label: '$100 Profit!', icon: <Trophy size={32} weight="fill" /> },
  { amount: 500, label: '$500 Profit!', icon: <Sparkle size={32} weight="fill" /> },
  { amount: 1000, label: '$1,000 Profit!', icon: <Confetti size={32} weight="fill" /> },
  { amount: 5000, label: '$5,000 Profit!', icon: <Trophy size={40} weight="fill" /> },
  { amount: 10000, label: '$10,000 Profit!', icon: <Sparkle size={40} weight="fill" /> },
  { amount: 50000, label: '$50,000 Profit!', icon: <Confetti size={48} weight="fill" /> },
  { amount: 100000, label: '$100,000 Profit!', icon: <Trophy size={48} weight="fill" /> },
]

interface ProfitMilestoneCelebrationProps {
  currentProfit: number
  previousProfit?: number
}

export default function ProfitMilestoneCelebration({
  currentProfit,
  previousProfit = 0,
}: ProfitMilestoneCelebrationProps) {
  const [celebratedMilestones, setCelebratedMilestones] = useState<Set<number>>(new Set())
  const [activeCelebration, setActiveCelebration] = useState<Milestone | null>(null)

  useEffect(() => {
    // Check if we crossed any milestone
    const crossedMilestone = MILESTONES.find((milestone) => {
      const wasBelow = previousProfit < milestone.amount
      const isAbove = currentProfit >= milestone.amount
      const notCelebrated = !celebratedMilestones.has(milestone.amount)
      return wasBelow && isAbove && notCelebrated
    })

    if (crossedMilestone) {
      // Mark as celebrated
      setCelebratedMilestones((prev) => new Set([...prev, crossedMilestone.amount]))

      // Trigger celebration
      setActiveCelebration(crossedMilestone)

      // Haptic feedback
      hapticFeedback.celebration()

      // Sound effect (play success sound multiple times for bigger milestones)
      if (crossedMilestone.amount >= 10000) {
        soundEffects.playSuccess()
        setTimeout(() => soundEffects.playSuccess(), 200)
        setTimeout(() => soundEffects.playSuccess(), 400)
      } else if (crossedMilestone.amount >= 1000) {
        soundEffects.playSuccess()
        setTimeout(() => soundEffects.playSuccess(), 200)
      } else {
        soundEffects.playSuccess()
      }

      // Auto-hide after 4 seconds
      setTimeout(() => {
        setActiveCelebration(null)
      }, 4000)
    }
  }, [currentProfit, previousProfit, celebratedMilestones])

  return (
    <AnimatePresence>
      {activeCelebration && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Celebration Card */}
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 0.5 }}
            className="relative z-10 cyber-card p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, oklch(0.12 0.03 280 / 0.98) 0%, oklch(0.10 0.02 280 / 0.98) 100%)',
              border: '2px solid var(--primary)',
              boxShadow: '0 0 40px var(--primary), 0 0 80px var(--primary), inset 0 0 20px var(--primary)',
            }}
          >
            {/* Confetti particles */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: (Math.random() - 0.5) * 200,
                  y: (Math.random() - 0.5) * 200,
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: ['var(--primary)', 'var(--secondary)', 'var(--accent)'][i % 3],
                  }}
                />
              </motion.div>
            ))}

            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="text-primary mb-4 flex justify-center"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(20, 241, 149, 0.5))',
              }}
            >
              {activeCelebration.icon}
            </motion.div>

            {/* Label */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold uppercase tracking-wider text-primary mb-2"
              style={{
                textShadow: '0 0 20px var(--primary), 0 0 40px var(--primary)',
              }}
            >
              {activeCelebration.label}
            </motion.h2>

            {/* Amount */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted-foreground"
            >
              Keep the momentum going! 🚀
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

