// Learning Metrics Display — Shows Bot's Learning Progress
// November 21, 2025 — Quantum Falcon Cockpit

import { useEffect, useState } from 'react'
import { Brain, TrendingUp, Target, Award, Clock } from '@phosphor-icons/react'
import { getLearningSystem, type LearningMetrics } from '@/lib/ai/learning/AdaptiveLearningSystem'
import { motion } from 'framer-motion'

export default function LearningMetricsDisplay() {
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const learningSystem = getLearningSystem()
    const currentMetrics = learningSystem.getMetrics()
    setMetrics(currentMetrics)

    // Update every 30 seconds
    const interval = setInterval(() => {
      const updated = learningSystem.getMetrics()
      setMetrics(updated)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  if (!metrics || metrics.totalTrades === 0) {
    return (
      <div className="cyber-card p-4 border border-primary/30">
        <div className="flex items-center gap-2">
          <Brain size={20} weight="duotone" className="text-primary animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-wider text-primary">
            Learning System Initializing...
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          The bot will start learning from trades once execution begins.
        </p>
      </div>
    )
  }

  const winRate = metrics.winRate
  const totalProfit = metrics.totalProfit
  const avgProfit = metrics.avgProfitPerTrade

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-4 border border-primary/30"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain size={20} weight="duotone" className="text-primary" />
          <span className="text-sm font-bold uppercase tracking-wider text-primary">
            AI Learning System
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {winRate.toFixed(1)}%
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Win Rate
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent mb-1">
            ${totalProfit.toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Total Profit
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary mb-1">
            {metrics.totalTrades}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            Trades
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3 pt-3 border-t border-primary/20"
        >
          {/* Best Strategy */}
          {metrics.bestStrategy && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award size={14} weight="duotone" className="text-accent" />
                <span className="text-xs text-muted-foreground">Best Strategy</span>
              </div>
              <span className="text-xs font-bold text-accent">{metrics.bestStrategy}</span>
            </div>
          )}

          {/* Best Trading Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={14} weight="duotone" className="text-primary" />
              <span className="text-xs text-muted-foreground">Best Hour</span>
            </div>
            <span className="text-xs font-bold text-primary">
              {metrics.bestTimeOfDay}:00
            </span>
          </div>

          {/* Average Profit */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} weight="duotone" className="text-primary" />
              <span className="text-xs text-muted-foreground">Avg Profit/Trade</span>
            </div>
            <span className={`text-xs font-bold ${avgProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              ${avgProfit.toFixed(2)}
            </span>
          </div>

          {/* Agent Performance */}
          {Object.keys(metrics.agentPerformance).length > 0 && (
            <div className="mt-3 pt-3 border-t border-primary/10">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Top Agents
              </div>
              {Object.entries(metrics.agentPerformance)
                .sort(([, a], [, b]) => b.winRate - a.winRate)
                .slice(0, 3)
                .map(([id, perf]) => (
                  <div key={id} className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{id}</span>
                    <span className="font-bold text-primary">
                      {perf.winRate.toFixed(1)}% ({perf.trades} trades)
                    </span>
                  </div>
                ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Learning Status */}
      <div className="mt-3 pt-3 border-t border-primary/10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">
            Learning from {metrics.totalTrades} trades • Improving daily
          </span>
        </div>
      </div>
    </motion.div>
  )
}

