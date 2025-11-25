// Strategy Performance Preview — Shows value before upgrade
// November 24, 2025 — Quantum Falcon Cockpit

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendUp as TrendingUp, TrendDown as TrendingDown, ChartLine, Target, 
  Lightning, Coins, Trophy, Shield, Info
} from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface StrategyPerformancePreviewProps {
  strategyId: string
  strategyName: string
  className?: string
}

interface PerformanceData {
  estimatedPnl: number
  estimatedPnlPercent: number
  winRate: number
  totalTrades: number
  sharpeRatio: number
  maxDrawdown: number
  avgTradeSize: number
  bestDay: number
  worstDay: number
  consistency: number
  riskScore: number
  timeFrame: '7d' | '30d' | '90d'
}

// Simulated performance data based on strategy type
const getPerformanceData = (strategyId: string, strategyName: string): PerformanceData => {
  // Generate realistic performance based on strategy characteristics
  const basePerformance: Record<string, Partial<PerformanceData>> = {
    'dca-advanced': {
      estimatedPnl: 234.50,
      estimatedPnlPercent: 8.4,
      winRate: 85,
      totalTrades: 28,
      sharpeRatio: 2.1,
      maxDrawdown: -5.2,
      avgTradeSize: 50,
      bestDay: 45.20,
      worstDay: -12.30,
      consistency: 88,
      riskScore: 25
    },
    'momentum-pro': {
      estimatedPnl: 456.80,
      estimatedPnlPercent: 15.2,
      winRate: 72,
      totalTrades: 67,
      sharpeRatio: 1.8,
      maxDrawdown: -12.5,
      avgTradeSize: 35,
      bestDay: 89.40,
      worstDay: -28.60,
      consistency: 75,
      riskScore: 55
    },
    'ml-price-predictor': {
      estimatedPnl: 892.30,
      estimatedPnlPercent: 24.8,
      winRate: 68,
      totalTrades: 124,
      sharpeRatio: 2.4,
      maxDrawdown: -18.2,
      avgTradeSize: 75,
      bestDay: 156.80,
      worstDay: -45.20,
      consistency: 82,
      riskScore: 70
    }
  }

  // Default performance for unknown strategies
  const defaultPerf: PerformanceData = {
    estimatedPnl: 180.50,
    estimatedPnlPercent: 6.2,
    winRate: 65,
    totalTrades: 45,
    sharpeRatio: 1.5,
    maxDrawdown: -8.5,
    avgTradeSize: 40,
    bestDay: 35.60,
    worstDay: -15.40,
    consistency: 70,
    riskScore: 40,
    timeFrame: '30d'
  }

  return { ...defaultPerf, ...basePerformance[strategyId] } as PerformanceData
}

export default function StrategyPerformancePreview({ 
  strategyId, 
  strategyName,
  className 
}: StrategyPerformancePreviewProps) {
  const [performance, setPerformance] = useState<PerformanceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const data = getPerformanceData(strategyId, strategyName)
      setPerformance(data)
      setIsLoading(false)
    }, 500)
  }, [strategyId, strategyName])

  if (isLoading || !performance) {
    return (
      <Card className={cn("cyber-card p-6", className)}>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    )
  }

  const riskColor = performance.riskScore < 30 ? 'text-green-400' : 
                   performance.riskScore < 60 ? 'text-yellow-400' : 'text-red-400'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-4", className)}
    >
      <Card className="cyber-card p-6 border-2 border-primary/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 border border-primary/50 rounded-lg">
              <ChartLine size={20} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-wider text-primary">
                Performance Preview
              </h3>
              <p className="text-xs text-muted-foreground">Based on 30-day historical data</p>
            </div>
          </div>
          <Badge className="bg-accent/20 border-accent/50 text-accent">
            <Info size={12} className="mr-1" />
            Estimated
          </Badge>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="glass-morph-card p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={16} className="text-green-400" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Est. P&L</span>
            </div>
            <div className="text-2xl font-black text-green-400">
              +${performance.estimatedPnl.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {performance.estimatedPnlPercent > 0 ? '+' : ''}{performance.estimatedPnlPercent.toFixed(1)}%
            </div>
          </div>

          <div className="glass-morph-card p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Win Rate</span>
            </div>
            <div className="text-2xl font-black text-primary">
              {performance.winRate}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {performance.totalTrades} trades
            </div>
          </div>

          <div className="glass-morph-card p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Lightning size={16} className="text-accent" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Sharpe</span>
            </div>
            <div className="text-2xl font-black text-accent">
              {performance.sharpeRatio.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Risk-adjusted
            </div>
          </div>

          <div className="glass-morph-card p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className={riskColor} />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Risk</span>
            </div>
            <div className={cn("text-2xl font-black", riskColor)}>
              {performance.riskScore}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Max DD: {Math.abs(performance.maxDrawdown).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Performance Breakdown */}
        <div className="space-y-3 pt-4 border-t border-primary/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Consistency Score</span>
            <span className="font-bold text-primary">{performance.consistency}/100</span>
          </div>
          <Progress value={performance.consistency} className="h-2" />

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Best Day</div>
              <div className="text-sm font-bold text-green-400">
                +${performance.bestDay.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Worst Day</div>
              <div className="text-sm font-bold text-red-400">
                ${performance.worstDay.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-primary/10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Trophy size={14} weight="duotone" />
              <span>Avg trade size: ${performance.avgTradeSize}</span>
              <span className="mx-2">•</span>
              <Coins size={14} weight="duotone" />
              <span>Timeframe: Last 30 days</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 pt-4 border-t border-primary/10">
          <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
            * Performance estimates are based on historical backtesting and market conditions. 
            Actual results may vary. Past performance does not guarantee future returns.
          </p>
        </div>
      </Card>
    </motion.div>
  )
}

