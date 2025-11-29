// ═══════════════════════════════════════════════════════════════
// Q-LEARNING AGENT — LEARNS FROM EVERY TRADE — GOD-TIER v2025.1.0
// November 29, 2025 — Quantum Falcon Cockpit
// ═══════════════════════════════════════════════════════════════

interface QTable {
  [state: string]: { BUY: number; SELL: number; HOLD: number }
}

const ACTIONS = ['BUY', 'SELL', 'HOLD'] as const
export type Action = typeof ACTIONS[number]

interface MarketState {
  priceTrend: number  // -1 to 1
  volumeSpike: boolean
  rsi: number         // 0-100
  positionSize?: number
}

interface QLearningStats {
  totalTrades: number
  winRate: number
  totalProfit: number
  qTableSize: number
  learningProgress: number
}

export class QLearningAgent {
  private qTable: QTable = {}
  private learningRate = 0.1
  private discountFactor = 0.95
  private epsilon = 0.1 // exploration rate
  private totalUpdates = 0

  constructor() {
    this.loadQTable()
  }

  /**
   * Get state key from market features
   */
  private getStateKey(state: MarketState): string {
    const trend = state.priceTrend > 0.1 ? 'up' : state.priceTrend < -0.1 ? 'down' : 'flat'
    const volume = state.volumeSpike ? 'high' : 'normal'
    const rsiLevel = state.rsi > 70 ? 'overbought' : state.rsi < 30 ? 'oversold' : 'neutral'
    return `${trend}_${volume}_${rsiLevel}`
  }

  /**
   * Get best action for current state
   */
  getBestAction(state: MarketState): Action {
    const stateKey = this.getStateKey(state)
    
    if (!this.qTable[stateKey]) {
      this.qTable[stateKey] = { BUY: 0, SELL: 0, HOLD: 0 }
    }

    const values = this.qTable[stateKey]
    return ACTIONS.reduce((best, action) => 
      values[action] > values[best] ? action : best
    )
  }

  /**
   * Get action with epsilon-greedy exploration
   */
  getAction(state: MarketState, isGodMode: boolean = false): Action {
    if (isGodMode) {
      // God Mode = always best action
      return this.getBestAction(state)
    }

    // Epsilon-greedy: explore randomly with probability epsilon
    if (Math.random() < this.epsilon) {
      return ACTIONS[Math.floor(Math.random() * ACTIONS.length)]
    }

    return this.getBestAction(state)
  }

  /**
   * Update Q-table after action and reward
   */
  update(
    state: MarketState,
    action: Action,
    reward: number,
    nextState: MarketState
  ): void {
    const stateKey = this.getStateKey(state)
    const nextStateKey = this.getStateKey(nextState)
    
    // Initialize Q-values if needed
    if (!this.qTable[stateKey]) {
      this.qTable[stateKey] = { BUY: 0, SELL: 0, HOLD: 0 }
    }
    if (!this.qTable[nextStateKey]) {
      this.qTable[nextStateKey] = { BUY: 0, SELL: 0, HOLD: 0 }
    }

    // Q-Learning update rule
    const oldValue = this.qTable[stateKey][action]
    const maxNextQ = Math.max(...Object.values(this.qTable[nextStateKey]))
    const newValue = oldValue + this.learningRate * (
      reward + this.discountFactor * maxNextQ - oldValue
    )
    
    this.qTable[stateKey][action] = newValue
    this.totalUpdates++
    
    // Save to localStorage every 10 updates
    if (this.totalUpdates % 10 === 0) {
      this.saveQTable()
    }
  }

  /**
   * Save Q-table to localStorage
   */
  private saveQTable(): void {
    try {
      const data = {
        qTable: this.qTable,
        totalUpdates: this.totalUpdates,
        savedAt: Date.now()
      }
      localStorage.setItem('qf-qtable', JSON.stringify(data))
    } catch (error) {
      console.warn('[QAgent] Failed to save Q-table:', error)
    }
  }

  /**
   * Load Q-table from localStorage
   */
  private loadQTable(): void {
    try {
      const saved = localStorage.getItem('qf-qtable')
      if (saved) {
        const data = JSON.parse(saved)
        this.qTable = data.qTable || {}
        this.totalUpdates = data.totalUpdates || 0
      }
    } catch (error) {
      console.warn('[QAgent] Failed to load Q-table:', error)
      this.qTable = {}
    }
  }

  /**
   * Get Q-Learning statistics
   */
  getStats(tradeHistory: Array<{ pnl: number }> = []): QLearningStats {
    const wins = tradeHistory.filter(t => t.pnl > 0).length
    const totalProfit = tradeHistory.reduce((sum, t) => sum + t.pnl, 0)
    const winRate = tradeHistory.length > 0 ? (wins / tradeHistory.length) * 100 : 0
    
    return {
      totalTrades: tradeHistory.length,
      winRate,
      totalProfit,
      qTableSize: Object.keys(this.qTable).length,
      learningProgress: Math.min(100, (this.totalUpdates / 1000) * 100)
    }
  }

  /**
   * Get Q-values for a state (for debugging/display)
   */
  getQValues(state: MarketState): { BUY: number; SELL: number; HOLD: number } {
    const stateKey = this.getStateKey(state)
    return this.qTable[stateKey] || { BUY: 0, SELL: 0, HOLD: 0 }
  }

  /**
   * Reset Q-table (for testing)
   */
  reset(): void {
    this.qTable = {}
    this.totalUpdates = 0
    localStorage.removeItem('qf-qtable')
  }
}

// Singleton instance
export const qAgent = new QLearningAgent()

