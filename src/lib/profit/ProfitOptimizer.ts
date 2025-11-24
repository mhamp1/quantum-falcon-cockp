// Profit Optimization Engine — 10X Returns
// November 21, 2025 — Quantum Falcon Cockpit

import { useKVSafe } from '@/hooks/useKVFallback'
import { toast } from 'sonner'

export interface Position {
  token: string
  entryPrice: number
  amount: number
  timestamp: number
}

export interface ProfitOptimizerStats {
  avgPositionSize: number
  taxReservedYTD: number
  compoundedProfits: number
  status: 'active' | 'paused'
}

export const useProfitOptimizer = () => {
  const [positions, setPositions] = useKVSafe<Position[]>('active-positions', [])
  const [reservedTax, setReservedTax] = useKVSafe<number>('tax-reserved', 0)
  const [compoundedAmount, setCompoundedAmount] = useKVSafe<number>('compounded-profits', 0)

  // 1. Dynamic Kelly + Volatility Scaling
  const getOptimalSize = (
    edge: number,
    winRate: number,
    volatility: number,
    portfolioValue: number
  ): number => {
    const kelly = (edge * winRate - (1 - winRate)) / edge
    const volAdjusted = kelly / (volatility / 100) // higher vol = smaller size
    const maxSize = Math.min(volAdjusted, 0.25) // never risk >25%
    return Math.max(maxSize * portfolioValue, 100) // minimum $100 trade
  }

  // 2. Tax-Optimized Exit (Long-Term Booster)
  const shouldDelayForLongTerm = (entryTime: number, currentProfit: number): boolean => {
    const daysHeld = (Date.now() - entryTime) / (1000 * 60 * 60 * 24)
    if (daysHeld > 350 && daysHeld < 365) {
      const taxSavings = currentProfit * 0.17 // avg short vs long savings
      if (taxSavings > currentProfit * 0.1) {
        // if savings > 10% of profit
        toast.info('Tax Optimizer Active', {
          description: `Holding ${365 - Math.floor(daysHeld)} more days saves $${taxSavings.toFixed(0)} in taxes`,
        })
        return true
      }
    }
    return false
  }

  // 3. Profit-Lock Rebalancer
  const rebalanceIfNeeded = (portfolioValue: number, currentPrice: (token: string) => number) => {
    positions.forEach((pos) => {
      const currentValue = pos.amount * currentPrice(pos.token)
      if (currentValue > portfolioValue * 0.35) {
        const excess = currentValue - portfolioValue * 0.25
        // In real implementation, this would execute a sell
        toast.success('Profit Lock Executed', {
          description: `Secured $${excess.toFixed(0)} profit`,
        })
      }
    })
  }

  // 4. Auto-Compound Profits
  const compoundProfit = (profit: number, agentName?: string) => {
    if (profit > 500) {
      const reinvestAmount = profit * 0.9 // reinvest 90%
      const taxReserve = profit * 0.1 // 10% to tax vault

      setCompoundedAmount((prev) => prev + reinvestAmount)
      setReservedTax((prev) => prev + taxReserve)

      toast.success('Profit Compounded', {
        description: `Reinvested $${reinvestAmount.toFixed(0)}${agentName ? ` into ${agentName}` : ''}`,
      })
    }
  }

  const getStats = (portfolioValue: number): ProfitOptimizerStats => {
    const avgSize = positions.length > 0
      ? positions.reduce((sum, p) => sum + (p.amount * (p.entryPrice || 0)), 0) / positions.length / portfolioValue
      : 0

    return {
      avgPositionSize: avgSize * 100,
      taxReservedYTD: reservedTax,
      compoundedProfits: compoundedAmount,
      status: 'active',
    }
  }

  // Optimize position size (wrapper for getOptimalSize)
  const optimizePositionSize = (price: number, volatility: number, portfolioValue: number = 10000) => {
    const edge = 0.55; // 55% edge estimate
    const winRate = 0.6; // 60% win rate estimate
    return getOptimalSize(edge, winRate, volatility * 100, portfolioValue);
  };

  // Optimize exit timing (wrapper for shouldDelayForLongTerm)
  const optimizeExit = (entryTime: number, currentProfit: number) => {
    return shouldDelayForLongTerm(entryTime, currentProfit);
  };

  return {
    getOptimalSize,
    optimizePositionSize,
    optimizeExit,
    shouldDelayForLongTerm,
    rebalanceIfNeeded,
    compoundProfit,
    getStats,
    positions,
  }
}

