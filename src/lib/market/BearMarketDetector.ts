// Bear Market Detection Engine — Multi-Signal, Impossible to Fake
// November 21, 2025 — Quantum Falcon Cockpit

import { useKVSafe } from '@/hooks/useKVFallback'

export interface BearMarketSignal {
  name: string
  weight: number
  active: boolean
  value: number
  threshold: number
  points: number
}

export interface BearMarketState {
  confidence: number // 0-100
  signals: BearMarketSignal[]
  status: 'bull' | 'neutral' | 'bear' | 'extreme_bear'
  lastUpdated: number
}

const BEAR_THRESHOLD = 70
const EXTREME_BEAR_THRESHOLD = 85

export const useBearMarketDetector = () => {
  const [bearState, setBearState] = useKVSafe<BearMarketState>('bear-market-state', {
    confidence: 0,
    signals: [],
    status: 'neutral',
    lastUpdated: Date.now(),
  })

  const calculateBearConfidence = (marketData: {
    btcDominance?: number
    btcDominanceChange7d?: number
    fearGreedIndex?: number
    btcPrice?: number
    btc200WeekMA?: number
    altcoinSeasonIndex?: number
    volumeChange14d?: number
    avgFundingRate?: number
    sp500Change30d?: number
  }): BearMarketState => {
    // Validate that we have minimum required data
    if (!marketData.btcPrice || !marketData.fearGreedIndex) {
      console.warn('⚠️ Bear Market Detector: Insufficient market data')
      return bearState // Return current state if data incomplete
    }
    const signals: BearMarketSignal[] = []

    // 1. BTC Dominance Rising (20 points)
    if (marketData.btcDominance && marketData.btcDominanceChange7d) {
      const active = marketData.btcDominance > 54 && marketData.btcDominanceChange7d > 2
      signals.push({
        name: 'BTC Dominance Rising',
        weight: 20,
        active,
        value: marketData.btcDominance,
        threshold: 54,
        points: active ? 20 : 0,
      })
    }

    // 2. Fear & Greed Index (15 points)
    if (marketData.fearGreedIndex !== undefined) {
      const active = marketData.fearGreedIndex < 25
      signals.push({
        name: 'Fear & Greed Index',
        weight: 15,
        active,
        value: marketData.fearGreedIndex,
        threshold: 25,
        points: active ? 15 : 0,
      })
    }

    // 3. BTC below 200-week MA (20 points)
    if (marketData.btcPrice && marketData.btc200WeekMA) {
      const active = marketData.btcPrice < marketData.btc200WeekMA
      signals.push({
        name: 'BTC below 200-week MA',
        weight: 20,
        active,
        value: marketData.btcPrice,
        threshold: marketData.btc200WeekMA,
        points: active ? 20 : 0,
      })
    }

    // 4. Altcoin Season Index (15 points)
    if (marketData.altcoinSeasonIndex !== undefined) {
      const active = marketData.altcoinSeasonIndex < 25
      signals.push({
        name: 'Altcoin Season Index',
        weight: 15,
        active,
        value: marketData.altcoinSeasonIndex,
        threshold: 25,
        points: active ? 15 : 0,
      })
    }

    // 5. Volume Decline (10 points)
    if (marketData.volumeChange14d !== undefined) {
      const active = marketData.volumeChange14d < -40
      signals.push({
        name: 'Volume Decline',
        weight: 10,
        active,
        value: marketData.volumeChange14d,
        threshold: -40,
        points: active ? 10 : 0,
      })
    }

    // 6. Funding Rate Negative (10 points)
    if (marketData.avgFundingRate !== undefined) {
      const active = marketData.avgFundingRate < -0.05
      signals.push({
        name: 'Funding Rate Negative',
        weight: 10,
        active,
        value: marketData.avgFundingRate,
        threshold: -0.05,
        points: active ? 10 : 0,
      })
    }

    // 7. Stock Market Correlation (10 points)
    if (marketData.sp500Change30d !== undefined) {
      const active = marketData.sp500Change30d < -10
      signals.push({
        name: 'Stock Market Correlation',
        weight: 10,
        active,
        value: marketData.sp500Change30d,
        threshold: -10,
        points: active ? 10 : 0,
      })
    }

    const totalPoints = signals.reduce((sum, s) => sum + s.points, 0)
    const confidence = Math.min(100, totalPoints)

    let status: 'bull' | 'neutral' | 'bear' | 'extreme_bear' = 'neutral'
    if (confidence >= EXTREME_BEAR_THRESHOLD) {
      status = 'extreme_bear'
    } else if (confidence >= BEAR_THRESHOLD) {
      status = 'bear'
    } else if (confidence < 30) {
      status = 'bull'
    }

    const newState: BearMarketState = {
      confidence,
      signals,
      status,
      lastUpdated: Date.now(),
    }

    setBearState(newState)
    return newState
  }

  return {
    bearState,
    calculateBearConfidence,
  }
}

