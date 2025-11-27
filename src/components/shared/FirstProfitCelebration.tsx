// First Profit Celebration — Small Milestone Celebrations
// November 21, 2025 — Quantum Falcon Cockpit
// Celebrates first $1, $5, $10 profits for immediate gratification

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkle, Trophy, Confetti, X } from '@phosphor-icons/react'
import { hapticFeedback } from '@/lib/hapticFeedback'
import confetti from 'canvas-confetti'
import { toast } from 'sonner'

interface FirstProfitCelebrationProps {
  currentProfit: number
  previousProfit?: number
}

const FIRST_MILESTONES = [
  { amount: 1, label: 'First $1!', icon: <Sparkle size={24} weight="fill" />, color: '#00FFFF' },
  { amount: 5, label: 'First $5!', icon: <Trophy size={24} weight="fill" />, color: '#DC1FFF' },
  { amount: 10, label: 'First $10!', icon: <Confetti size={24} weight="fill" />, color: '#FF00FF' },
]

export default function FirstProfitCelebration({
  currentProfit,
  previousProfit = 0,
}: FirstProfitCelebrationProps) {
  const [celebrated, setCelebrated] = useState<Set<number>>(new Set())
  const [activeCelebration, setActiveCelebration] = useState<typeof FIRST_MILESTONES[0] | null>(null)

  useEffect(() => {
    // Check for first-time milestones
    const milestone = FIRST_MILESTONES.find((m) => {
      const wasBelow = previousProfit < m.amount
      const isAbove = currentProfit >= m.amount
      const notCelebrated = !celebrated.has(m.amount)
      return wasBelow && isAbove && notCelebrated
    })

    if (milestone) {
      setCelebrated((prev) => new Set([...prev, milestone.amount]))
      setActiveCelebration(milestone)

      // Celebration effects
      hapticFeedback.celebration()
      confetti({
        particleCount: 13,
        spread: 45,
        origin: { y: 0.7 },
        colors: [milestone.color],
      })

      toast.success(`🎉 ${milestone.label}`, {
        description: 'Your first profit milestone! Keep it going!',
        duration: 4000,
      })

      // Auto-hide after 3 seconds
      const hideTimer = setTimeout(() => {
        setActiveCelebration(null)
      }, 3000)
      
      return () => clearTimeout(hideTimer)
    }
  }, [currentProfit, previousProfit, celebrated])

  return (
    <AnimatePresence>
      {activeCelebration && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[99998]"
        >
          <motion.div
            className="cyber-card p-6 border-2 border-primary/60"
            style={{
              boxShadow: `0 0 40px ${activeCelebration.color}40`,
              borderColor: `${activeCelebration.color}80`,
            }}
            animate={{
              boxShadow: [
                `0 0 40px ${activeCelebration.color}40`,
                `0 0 60px ${activeCelebration.color}60`,
                `0 0 40px ${activeCelebration.color}40`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                style={{ color: activeCelebration.color }}
              >
                {activeCelebration.icon}
              </motion.div>
              <div>
                <h3 className="font-black text-xl uppercase" style={{ color: activeCelebration.color }}>
                  {activeCelebration.label}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your first profit milestone!
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

