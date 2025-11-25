export type AggressionBlueprintId = 'cautious' | 'moderate' | 'aggressive'

export interface AggressionBlueprint {
  id: AggressionBlueprintId
  title: string
  subtitle: string
  pnlMultiplier: number
  tradeFrequencyMultiplier: number
  targetWinRate: number
  drawdownGuard: number
  projectedDailyPnl: number
  riskBudget: number
  focus: string[]
  alphaQuote: string
  dailyAlpha: number
  confidenceDelta: number
  performanceDelta: number
  positionSizeMultiplier: number
  slippageBps: number
  newsSensitivity: number // 0.5 = slower scans, 1 = default, >1 = hyper-reactive
}

export const AGGRESSION_BLUEPRINTS: AggressionBlueprint[] = [
  {
    id: 'cautious',
    title: 'Capital Preservation',
    subtitle: '2% risk / 12 trades per day',
    pnlMultiplier: 0.94,
    tradeFrequencyMultiplier: 0.75,
    targetWinRate: 0.68,
    drawdownGuard: 0.12,
    projectedDailyPnl: 420,
    riskBudget: 0.35,
    focus: ['Delta-Neutral', 'Volatility Harvesting', 'Hedged DCA'],
    alphaQuote: 'Stay in the game longer than anyone else.',
    dailyAlpha: 35,
    confidenceDelta: 2,
    performanceDelta: 0,
    positionSizeMultiplier: 0.75,
    slippageBps: 50,
    newsSensitivity: 0.75,
  },
  {
    id: 'moderate',
    title: 'Adaptive Growth',
    subtitle: '4% risk / 22 trades per day',
    pnlMultiplier: 1.05,
    tradeFrequencyMultiplier: 1,
    targetWinRate: 0.62,
    drawdownGuard: 0.18,
    projectedDailyPnl: 920,
    riskBudget: 0.55,
    focus: ['Momentum + Mean Reversion', 'Smart Rebalancing', 'Volatility Surfing'],
    alphaQuote: 'Harvest volatility, redeploy winners, cut losers scientifically.',
    dailyAlpha: 120,
    confidenceDelta: 1,
    performanceDelta: 1,
    positionSizeMultiplier: 1,
    slippageBps: 75,
    newsSensitivity: 1,
  },
  {
    id: 'aggressive',
    title: 'Alpha Overdrive',
    subtitle: '7% risk / 34 trades per day',
    pnlMultiplier: 1.18,
    tradeFrequencyMultiplier: 1.35,
    targetWinRate: 0.58,
    drawdownGuard: 0.28,
    projectedDailyPnl: 1850,
    riskBudget: 0.78,
    focus: ['High Beta Rotations', 'Momentum Sniping', 'Short Gamma Plays'],
    alphaQuote: 'Speed, conviction, and asymmetric upside.',
    dailyAlpha: 260,
    confidenceDelta: -1,
    performanceDelta: 2,
    positionSizeMultiplier: 1.4,
    slippageBps: 110,
    newsSensitivity: 1.3,
  },
]

export const DEFAULT_AGGRESSION_BLUEPRINT = AGGRESSION_BLUEPRINTS[1]

