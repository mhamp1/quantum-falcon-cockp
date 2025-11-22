// Signal Confirmation — Multi-Signal Ensemble Agreement
// November 21, 2025 — Quantum Falcon Cockpit
// Requires multiple independent signals to align before executing trades
// Based on original Python script's SignalConfirmation class

export interface MarketState {
  opportunityScore?: number
  volumes?: number[]
  prices?: number[]
  volatility?: number
  trend?: 'bullish' | 'bearish' | 'neutral'
  momentum?: number
  regime?: 'bear' | 'bull' | 'neutral'
  sentiment?: number
}

export interface ConfirmationResult {
  confirmed: boolean
  count: number
  totalWeight: number
  minConfirmations: number
  signals: string[]
  reasoning: string[]
}

/**
 * Signal Confirmation
 * Multi-signal confirmation system requiring ensemble agreement
 */
export class SignalConfirmation {
  private minConfirmations = 3
  private confirmationWeights = {
    technical: 1.0,
    volume: 1.0,
    momentum: 1.0,
    volatility: 0.5,
    trend: 1.0,
    sentiment: 0.8,
  }

  /**
   * Evaluate all signals and return confirmation score
   */
  evaluate(marketState: MarketState): ConfirmationResult {
    const signals: string[] = []
    const reasoning: string[] = []
    let totalWeight = 0.0

    // Technical signal: opportunity score
    const opportunity = marketState.opportunityScore || 0
    if (opportunity > 0.5) {
      signals.push('technical')
      totalWeight += this.confirmationWeights.technical
      reasoning.push(`Technical opportunity: ${opportunity.toFixed(2)}`)
    }

    // Volume signal
    const volumes = marketState.volumes || []
    if (volumes.length >= 5) {
      const recentVol = volumes[volumes.length - 1]
      const avgVol = volumes.slice(-5).reduce((a, b) => a + b, 0) / 5
      if (recentVol > avgVol * 1.5) {
        signals.push('volume')
        totalWeight += this.confirmationWeights.volume
        reasoning.push(`Volume surge: ${((recentVol / avgVol - 1) * 100).toFixed(1)}% above average`)
      }
    }

    // Momentum signal
    const momentum = marketState.momentum || 0
    if (Math.abs(momentum) > 0.01) {
      signals.push('momentum')
      totalWeight += this.confirmationWeights.momentum
      reasoning.push(`Strong momentum: ${(momentum * 100).toFixed(2)}%`)
    }

    // Volatility signal
    const volatility = marketState.volatility || 0
    if (volatility > 0.03 && volatility < 0.08) {
      // Good volatility range (not too low, not too high)
      signals.push('volatility')
      totalWeight += this.confirmationWeights.volatility
      reasoning.push(`Optimal volatility: ${(volatility * 100).toFixed(2)}%`)
    }

    // Trend signal
    const trend = marketState.trend
    if (trend === 'bullish' || trend === 'bearish') {
      signals.push('trend')
      totalWeight += this.confirmationWeights.trend
      reasoning.push(`Clear trend: ${trend}`)
    }

    // Sentiment signal
    const sentiment = marketState.sentiment || 0
    if (Math.abs(sentiment) > 0.3) {
      signals.push('sentiment')
      totalWeight += this.confirmationWeights.sentiment
      reasoning.push(`Strong sentiment: ${(sentiment * 100).toFixed(1)}%`)
    }

    // Check if we have enough confirmations
    const confirmed = signals.length >= this.minConfirmations && totalWeight >= 2.5

    return {
      confirmed,
      count: signals.length,
      totalWeight,
      minConfirmations: this.minConfirmations,
      signals,
      reasoning,
    }
  }

  /**
   * Set minimum confirmations required
   */
  setMinConfirmations(count: number): void {
    this.minConfirmations = Math.max(1, Math.min(5, count))
  }

  /**
   * Get current minimum confirmations
   */
  getMinConfirmations(): number {
    return this.minConfirmations
  }
}

// Singleton instance
let signalConfirmationInstance: SignalConfirmation | null = null

export function getSignalConfirmation(): SignalConfirmation {
  if (!signalConfirmationInstance) {
    signalConfirmationInstance = new SignalConfirmation()
  }
  return signalConfirmationInstance
}

