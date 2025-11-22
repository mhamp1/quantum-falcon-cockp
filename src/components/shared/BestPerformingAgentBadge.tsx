// Best Performing Agent Badge — Dashboard Highlight
// November 21, 2025 — Quantum Falcon Cockpit

import { useLiveAgentData } from '@/hooks/useLiveAgentData'
import { Trophy, Sparkle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function BestPerformingAgentBadge() {
  const agents = useLiveAgentData()

  if (!agents || agents.length === 0) return null

  // Find best performing agent by profit
  const bestAgent = agents.reduce((best, agent) => {
    return agent.profit > best.profit ? agent : best
  }, agents[0])

  if (!bestAgent) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2 rounded-lg border',
        'bg-gradient-to-r from-primary/20 to-accent/20',
        'border-primary/50',
        'backdrop-blur-sm'
      )}
    >
      <Trophy size={18} weight="fill" className="text-primary animate-pulse" />
      <div className="flex flex-col">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          Best Performer
        </span>
        <span className="text-sm font-bold text-primary">
          {bestAgent.name}
        </span>
      </div>
      <div className="flex items-center gap-1 ml-2 pl-2 border-l border-primary/30">
        <Sparkle size={14} weight="fill" className="text-accent" />
        <span className="text-sm font-bold text-accent">
          +${bestAgent.profit.toFixed(2)}
        </span>
      </div>
    </motion.div>
  )
}

