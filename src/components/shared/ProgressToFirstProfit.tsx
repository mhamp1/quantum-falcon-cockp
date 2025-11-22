// Progress to First Profit — Engagement Hook
// November 21, 2025 — Quantum Falcon Cockpit
// Shows progress toward first profit milestone

import { motion } from 'framer-motion'
import { Target, Sparkle } from '@phosphor-icons/react'
import { Progress } from '@/components/ui/progress'

interface ProgressToFirstProfitProps {
  currentProfit: number
  targetProfit?: number
}

export default function ProgressToFirstProfit({
  currentProfit,
  targetProfit = 10,
}: ProgressToFirstProfitProps) {
  // Only show if profit is below target
  if (currentProfit >= targetProfit) return null

  const progress = Math.min(100, (currentProfit / targetProfit) * 100)
  const remaining = Math.max(0, targetProfit - currentProfit)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-4 border-2 border-primary/40"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Target size={20} weight="fill" className="text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm uppercase text-primary">
            Progress to First $10
          </h4>
          <p className="text-xs text-muted-foreground">
            ${remaining.toFixed(2)} remaining
          </p>
        </div>
        <div className="text-right">
          <div className="text-lg font-black text-primary">
            ${currentProfit.toFixed(2)}
          </div>
          <div className="text-xs text-muted-foreground">
            / ${targetProfit}
          </div>
        </div>
      </div>
      
      <Progress value={progress} className="h-2" />
    </motion.div>
  )
}

