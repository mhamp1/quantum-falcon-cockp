// Tax Reserve System — IRS-Proof, Automatic, Beautiful
// November 21, 2025 — Quantum Falcon Cockpit

import { useKVSafe } from '@/hooks/useKVFallback'

const SHORT_TERM_RATE = 0.37 // max federal short-term capital gains
const LONG_TERM_RATE = 0.20 // max federal long-term capital gains
const STATE_TAX_RATE = 0.133 // CA max — adjust per user or make configurable
const SAFETY_BUFFER = 1.1 // reserve 10% extra for safety

export interface TaxableTrade {
  profit: number
  holdingDays: number
  timestamp: number
  token?: string
  entryPrice?: number
  exitPrice?: number
}

export interface TaxSummary {
  shortTermProfit: number
  longTermProfit: number
  shortTermTax: number
  longTermTax: number
  stateTax: number
  totalTaxOwed: number
  totalReserved: number
  safeToWithdraw: number
  projectedYearEndTax: number
  tradesCount: number
}

export const useTaxReserve = () => {
  const [taxableTrades, setTaxableTrades] = useKVSafe<TaxableTrade[]>('taxable-trades', [])
  const [reservedAmount, setReservedAmount] = useKVSafe<number>('tax-reserved', 0)

  const addProfitableTrade = (profit: number, holdingDays: number, token?: string, entryPrice?: number, exitPrice?: number) => {
    const newTrade: TaxableTrade = {
      profit,
      holdingDays,
      timestamp: Date.now(),
      token,
      entryPrice,
      exitPrice,
    }

    setTaxableTrades((prev) => [...prev, newTrade])

    const rate = holdingDays >= 365 ? LONG_TERM_RATE : SHORT_TERM_RATE
    const taxOwed = profit * rate * SAFETY_BUFFER
    const stateTax = profit * STATE_TAX_RATE * SAFETY_BUFFER
    const totalReserve = taxOwed + stateTax

    setReservedAmount((prev) => prev + totalReserve)

    return totalReserve
  }

  const getTaxSummary = (): TaxSummary => {
    const shortTermProfit = taxableTrades
      .filter((t) => t.holdingDays < 365)
      .reduce((sum, t) => sum + t.profit, 0)

    const longTermProfit = taxableTrades
      .filter((t) => t.holdingDays >= 365)
      .reduce((sum, t) => sum + t.profit, 0)

    const shortTermTax = shortTermProfit * SHORT_TERM_RATE * SAFETY_BUFFER
    const longTermTax = longTermProfit * LONG_TERM_RATE * SAFETY_BUFFER
    const stateTax = (shortTermProfit + longTermProfit) * STATE_TAX_RATE * SAFETY_BUFFER

    const totalTaxOwed = shortTermTax + longTermTax + stateTax
    const safeToWithdraw = reservedAmount - totalTaxOwed

    return {
      shortTermProfit,
      longTermProfit,
      shortTermTax,
      longTermTax,
      stateTax,
      totalTaxOwed,
      totalReserved: reservedAmount,
      safeToWithdraw: Math.max(0, safeToWithdraw),
      projectedYearEndTax: totalTaxOwed * 1.3, // 30% growth estimate
      tradesCount: taxableTrades.length,
    }
  }

  const clearTaxData = () => {
    setTaxableTrades([])
    setReservedAmount(0)
  }

  return {
    addProfitableTrade,
    getTaxSummary,
    reservedAmount,
    taxableTrades,
    clearTaxData,
  }
}

