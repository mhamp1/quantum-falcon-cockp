// Dump Risk Detector — Early Exit Protection
// November 21, 2025 — Quantum Falcon Cockpit
// Detects dump risk for early exit (volume dry-up, RSI divergence, sentiment)
// Based on original Python script's SnipeStrategy._detect_dump_risk()

export interface DumpRiskState {
  prices: number[]
  volumes: number[]
  sentiment?: number
}

export interface DumpRiskResult {
  riskScore: number // 0.0 to 1.0
  factors: {
    volumeDryUp: number
    rsiDivergence: number
    sentiment: number
  }
  shouldExit: boolean
  reasoning: string[]
}

/**
 * Dump Risk Detector
 * Detects dump risk for early exit protection
 */
export class DumpRiskDetector {
  private dumpRiskThreshold = 0.5 // Exit if risk > 0.5
  private sentimentExitThreshold = -0.3 // Exit if sentiment < -0.3

  /**
   * Detect dump risk
   * Returns risk score 0.0-1.0
   */
  detectDumpRisk(state: DumpRiskState): DumpRiskResult {
    const { prices, volumes, sentiment = 0 } = state
    const factors = {
      volumeDryUp: 0,
      rsiDivergence: 0,
      sentiment: 0,
    }
    const reasoning: string[] = []
    let risk = 0.0

    if (prices.length < 10 || volumes.length < 10) {
      return {
        riskScore: 0.0,
        factors,
        shouldExit: false,
        reasoning: ['Insufficient data for dump risk detection'],
      }
    }

    // Factor 1: Volume dry-up (10% drop)
    if (volumes.length >= 5) {
      const recentVol = volumes.slice(-3).reduce((a, b) => a + b, 0) / 3
      const prevVol = volumes.slice(-6, -3).reduce((a, b) => a + b, 0) / 3
      if (prevVol > 0 && recentVol < prevVol * 0.9) {
        risk += 0.5
        factors.volumeDryUp = (1 - recentVol / prevVol) * 100
        reasoning.push(`Volume dry-up: ${factors.volumeDryUp.toFixed(1)}% decrease`)
      }
    }

    // Factor 2: RSI divergence (price up, RSI down)
    if (prices.length >= 14) {
      // Simple RSI calculation
      const gains = prices.slice(-13).map((p, i) => Math.max(0, p - prices[i - 1])).reduce((a, b) => a + b, 0)
      const losses = prices.slice(-13).map((p, i) => Math.max(0, prices[i - 1] - p)).reduce((a, b) => a + b, 0)

      if (losses > 0) {
        const rs = gains / losses
        const rsi = 100 - (100 / (1 + rs))

        // Divergence: price making new highs but RSI not
        const recentHigh = Math.max(...prices.slice(-5))
        const prevHigh = Math.max(...prices.slice(-10, -5))
        if (recentHigh > prevHigh && rsi < 60) {
          risk += 0.3
          factors.rsiDivergence = 60 - rsi
          reasoning.push(`RSI divergence: price up but RSI down (${rsi.toFixed(1)})`)
        }
      }
    }

    // Factor 3: Sentiment check
    if (sentiment < this.sentimentExitThreshold) {
      risk += 0.2
      factors.sentiment = sentiment
      reasoning.push(`Negative sentiment: ${(sentiment * 100).toFixed(1)}%`)
    }

    const riskScore = Math.min(1.0, risk)
    const shouldExit = riskScore > this.dumpRiskThreshold

    return {
      riskScore,
      factors,
      shouldExit,
      reasoning,
    }
  }

  /**
   * Set dump risk threshold
   */
  setThreshold(threshold: number): void {
    this.dumpRiskThreshold = Math.max(0.1, Math.min(1.0, threshold))
  }

  /**
   * Get current threshold
   */
  getThreshold(): number {
    return this.dumpRiskThreshold
  }
}

// Singleton instance
let dumpRiskDetectorInstance: DumpRiskDetector | null = null

export function getDumpRiskDetector(): DumpRiskDetector {
  if (!dumpRiskDetectorInstance) {
    dumpRiskDetectorInstance = new DumpRiskDetector()
  }
  return dumpRiskDetectorInstance
}

