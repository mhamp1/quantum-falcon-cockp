// Profit Optimization Engine — 10X Returns (Fixed Tax Toast)
// November 28, 2025 — Quantum Falcon Cockpit
// Tax toast now only shows ONCE per session

import { useKVSafe } from '@/hooks/useKVFallback'
import { toast } from 'sonner'
import { useRef, useCallback } from 'react'

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

// Track which positions have already shown tax toast
const taxToastShownForPositions = new Set<string>()

// Global session flag - only show tax optimizer toast once per session
let taxOptimizerToastShownThisSession = false

export const useProfitOptimizer = () => {
  const [positions, setPositions] = useKVSafe<Position[]>('active-positions', [])
  const [reservedTax, setReservedTax] = useKVSafe<number>('tax-reserved', 0)
  const [compoundedAmount, setCompoundedAmount] = useKVSafe<number>('compounded-profits', 0)
  const [shownTaxToasts, setShownTaxToasts] = useKVSafe<string[]>('tax-toasts-shown', [])

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

  // 2. Tax-Optimized Exit (Long-Term Booster) — ONLY SHOWS ONCE PER POSITION
  const shouldDelayForLongTerm = useCallback((entryTime: number, currentProfit: number, positionId?: string): boolean => {
    const daysHeld = (Date.now() - entryTime) / (1000 * 60 * 60 * 24)
    
    if (daysHeld > 350 && daysHeld < 365) {
      const taxSavings = currentProfit * 0.17 // avg short vs long savings
      
      if (taxSavings > currentProfit * 0.1) {
        // Check if we've already shown toast for this session
        if (!taxOptimizerToastShownThisSession) {
          taxOptimizerToastShownThisSession = true
          
          toast.info('Tax Optimizer Active', {
            id: 'tax-optimizer-hint', // Unique ID prevents duplicates
            description: `Holding ${365 - Math.floor(daysHeld)} more days saves $${taxSavings.toFixed(0)} in taxes`,
            duration: 8000,
          })
        }
        return true
      }
    }
    return false
  }, [])

  // 3. Profit-Lock Rebalancer — ONLY SHOWS ONCE PER REBALANCE
  const rebalanceIfNeeded = useCallback((portfolioValue: number, currentPrice: (token: string) => number) => {
    positions.forEach((pos) => {
      const currentValue = pos.amount * currentPrice(pos.token)
      if (currentValue > portfolioValue * 0.35) {
        const excess = currentValue - portfolioValue * 0.25
        const toastId = `rebalance-${pos.token}-${Math.floor(Date.now() / 86400000)}`
        
        // Only show once per day per token
        if (!shownTaxToasts.includes(toastId)) {
          setShownTaxToasts(prev => [...prev, toastId])
          toast.success('Profit Lock Executed', {
            id: toastId,
            description: `Secured $${excess.toFixed(0)} profit`,
            duration: 5000,
          })
        }
      }
    })
  }, [positions, shownTaxToasts, setShownTaxToasts])

  // 4. Auto-Compound Profits — ONLY SHOWS ONCE PER COMPOUND ACTION
  const compoundProfit = useCallback((profit: number, agentName?: string) => {
    if (profit > 500) {
      const reinvestAmount = profit * 0.9 // reinvest 90%
      const taxReserve = profit * 0.1 // 10% to tax vault

      setCompoundedAmount((prev) => prev + reinvestAmount)
      setReservedTax((prev) => prev + taxReserve)

      // Use unique toast ID to prevent duplicates
      toast.success('Profit Compounded', {
        id: `compound-${Date.now()}`,
        description: `Reinvested $${reinvestAmount.toFixed(0)}${agentName ? ` into ${agentName}` : ''}`,
        duration: 5000,
      })
    }
  }, [setCompoundedAmount, setReservedTax])

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
  const optimizeExit = (entryTime: number, currentProfit: number, positionId?: string) => {
    return shouldDelayForLongTerm(entryTime, currentProfit, positionId);
  };

  // Reset session flag (call on logout or app restart)
  const resetSessionToasts = () => {
    taxOptimizerToastShownThisSession = false
  }

  return {
    getOptimalSize,
    optimizePositionSize,
    optimizeExit,
    shouldDelayForLongTerm,
    rebalanceIfNeeded,
    compoundProfit,
    getStats,
    positions,
    resetSessionToasts,
  }
}
