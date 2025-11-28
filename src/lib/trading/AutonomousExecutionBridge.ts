// ═══════════════════════════════════════════════════════════════
// AUTONOMOUS EXECUTION BRIDGE
// Bridges wallet connection to autonomous trading systems
// Critical component for enabling real autonomous trades
// November 28, 2025 — Quantum Falcon Cockpit
// ═══════════════════════════════════════════════════════════════

import { Connection, PublicKey, VersionedTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { getTradeEngine, TradeOrder } from './TradeExecutionEngine'
import { TOKENS } from './JupiterSwapEngine'
import { connection } from '@/lib/solana/connection'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface TradeResult {
  success: boolean
  signature?: string
  error?: string
  inputAmount?: number
  outputAmount?: number
  priceImpact?: number
  route?: string
  timestamp: number
}

export interface BridgeState {
  publicKey: string | null
  isLiveMode: boolean
  hasWallet: boolean
  canTrade: boolean
  lastTradeAt: number
  totalAutonomousTrades: number
  totalAutonomousProfit: number
}

export type SignTransactionFn = (transaction: VersionedTransaction) => Promise<VersionedTransaction>

// ═══════════════════════════════════════════════════════════════
// AUTONOMOUS EXECUTION BRIDGE
// Singleton class that manages wallet context for autonomous trading
// ═══════════════════════════════════════════════════════════════

class AutonomousExecutionBridge {
  private static instance: AutonomousExecutionBridge
  
  // Wallet state
  private _publicKey: string | null = null
  private _signTransaction: SignTransactionFn | null = null
  
  // Trading state
  private _isLiveMode: boolean = false
  private _isPaused: boolean = false
  private _pauseReason: string = ''
  
  // Statistics
  private _totalTrades: number = 0
  private _totalProfit: number = 0
  private _lastTradeAt: number = 0
  private _consecutiveFailures: number = 0
  
  // Safety limits
  private _maxConsecutiveFailures: number = 5
  private _tradeCooldownMs: number = 5000
  private _maxDailyLoss: number = 500 // USD
  private _dailyLoss: number = 0
  private _dailyLossResetAt: number = 0

  // Event callbacks for UI updates
  private _onStateChange?: (state: BridgeState) => void
  private _onTradeExecuted?: (result: TradeResult) => void
  private _onError?: (error: string) => void

  private constructor() {
    console.log('[AutonomousExecutionBridge] Initialized')
    this.loadState()
  }

  // ─── SINGLETON GETTER ───
  static getInstance(): AutonomousExecutionBridge {
    if (!AutonomousExecutionBridge.instance) {
      AutonomousExecutionBridge.instance = new AutonomousExecutionBridge()
    }
    return AutonomousExecutionBridge.instance
  }

  // ─── WALLET MANAGEMENT ───

  /**
   * Set wallet for autonomous trading
   * Called by WalletProvider when wallet connects
   */
  setWallet(
    publicKey: string | null,
    signTransaction: SignTransactionFn | null
  ): void {
    const wasConnected = this._publicKey !== null
    
    this._publicKey = publicKey
    this._signTransaction = signTransaction

    // Also update the TradeExecutionEngine
    const engine = getTradeEngine(connection)
    if (publicKey && signTransaction) {
      engine.setWallet(new PublicKey(publicKey), signTransaction)
      console.log('[AutonomousExecutionBridge] Wallet connected:', publicKey.slice(0, 8) + '...')
    } else {
      engine.setWallet(null, null)
      if (wasConnected) {
        console.log('[AutonomousExecutionBridge] Wallet disconnected')
        // Auto-disable live mode when wallet disconnects
        if (this._isLiveMode) {
          this.setLiveMode(false)
          toast.warning('Live Mode Disabled', {
            description: 'Wallet disconnected — switched to Paper Mode',
          })
        }
      }
    }

    this.notifyStateChange()
  }

  /**
   * Get current public key
   */
  getPublicKey(): string | null {
    return this._publicKey
  }

  // ─── LIVE MODE MANAGEMENT ───

  /**
   * Enable/disable live trading mode
   * Called by TradingModeToggle when user confirms go live
   */
  setLiveMode(isLive: boolean): void {
    const wasLive = this._isLiveMode
    this._isLiveMode = isLive
    
    if (isLive && !wasLive) {
      console.log('[AutonomousExecutionBridge] 🔴 LIVE MODE ENABLED')
      this._isPaused = false
      this._pauseReason = ''
      this._consecutiveFailures = 0
    } else if (!isLive && wasLive) {
      console.log('[AutonomousExecutionBridge] 📝 Switched to Paper Mode')
    }

    this.saveState()
    this.notifyStateChange()
  }

  /**
   * Check if live mode is enabled
   */
  isLiveModeEnabled(): boolean {
    return this._isLiveMode
  }

  // ─── TRADING CAPABILITY CHECKS ───

  /**
   * Check if autonomous trading can execute a real trade
   */
  canExecuteLive(): boolean {
    // Basic requirements
    if (!this._isLiveMode) return false
    if (!this._publicKey) return false
    if (!this._signTransaction) return false
    if (this._isPaused) return false

    // Cooldown check
    const timeSinceLastTrade = Date.now() - this._lastTradeAt
    if (timeSinceLastTrade < this._tradeCooldownMs) {
      return false
    }

    // Check consecutive failures
    if (this._consecutiveFailures >= this._maxConsecutiveFailures) {
      return false
    }

    // Reset daily loss at midnight
    this.checkDailyReset()
    
    // Check daily loss limit
    if (this._dailyLoss >= this._maxDailyLoss) {
      return false
    }

    return true
  }

  /**
   * Get detailed reason why trading is blocked
   */
  getTradingBlockReason(): string | null {
    if (!this._isLiveMode) return 'Not in Live Mode'
    if (!this._publicKey) return 'Wallet not connected'
    if (!this._signTransaction) return 'Wallet signing not available'
    if (this._isPaused) return `Paused: ${this._pauseReason}`
    
    const timeSinceLastTrade = Date.now() - this._lastTradeAt
    if (timeSinceLastTrade < this._tradeCooldownMs) {
      const waitSeconds = Math.ceil((this._tradeCooldownMs - timeSinceLastTrade) / 1000)
      return `Cooldown: Wait ${waitSeconds}s`
    }
    
    if (this._consecutiveFailures >= this._maxConsecutiveFailures) {
      return `Too many failures (${this._consecutiveFailures})`
    }
    
    this.checkDailyReset()
    if (this._dailyLoss >= this._maxDailyLoss) {
      return `Daily loss limit reached ($${this._dailyLoss.toFixed(2)})`
    }

    return null
  }

  // ─── TRADE EXECUTION ───

  /**
   * Execute an autonomous trade
   * This is the main entry point for the autonomous trading loop
   */
  async executeAutonomousTrade(
    side: 'buy' | 'sell',
    inputToken: string,
    outputToken: string,
    amount: number,
    options?: {
      slippageBps?: number
      priorityFee?: number
      skipConfirmation?: boolean
    }
  ): Promise<TradeResult> {
    const timestamp = Date.now()

    // Pre-trade validation
    if (!this.canExecuteLive()) {
      const reason = this.getTradingBlockReason()
      return {
        success: false,
        error: reason || 'Cannot execute live trade',
        timestamp,
      }
    }

    console.log(`[AutonomousExecutionBridge] Executing ${side} trade:`, {
      inputToken: inputToken.slice(0, 8) + '...',
      outputToken: outputToken.slice(0, 8) + '...',
      amount,
    })

    try {
      // Get the trade engine
      const engine = getTradeEngine(connection)
      
      // Execute the trade
      const order = await engine.executeTrade(
        side,
        inputToken,
        outputToken,
        amount,
        {
          slippageBps: options?.slippageBps ?? 100,
          priorityFee: options?.priorityFee,
          skipConfirmation: options?.skipConfirmation ?? true,
        }
      )

      // Update statistics based on result
      this._lastTradeAt = Date.now()
      this._totalTrades++

      if (order.status === 'completed') {
        this._consecutiveFailures = 0
        
        const result: TradeResult = {
          success: true,
          signature: order.signature,
          inputAmount: order.inputAmount,
          outputAmount: order.outputAmount,
          priceImpact: order.priceImpact,
          route: order.route,
          timestamp: Date.now(),
        }

        this._onTradeExecuted?.(result)
        this.saveState()
        this.notifyStateChange()

        return result
      } else {
        // Trade failed
        this._consecutiveFailures++
        
        const result: TradeResult = {
          success: false,
          error: order.error || 'Trade failed',
          timestamp: Date.now(),
        }

        // Auto-pause if too many failures
        if (this._consecutiveFailures >= this._maxConsecutiveFailures) {
          this.pause(`${this._consecutiveFailures} consecutive failures`)
        }

        this._onError?.(order.error || 'Trade failed')
        this.saveState()
        this.notifyStateChange()

        return result
      }
    } catch (error: any) {
      console.error('[AutonomousExecutionBridge] Trade error:', error)
      
      this._consecutiveFailures++
      
      const result: TradeResult = {
        success: false,
        error: error.message || 'Unknown error',
        timestamp: Date.now(),
      }

      if (this._consecutiveFailures >= this._maxConsecutiveFailures) {
        this.pause(`${this._consecutiveFailures} consecutive failures`)
      }

      this._onError?.(error.message || 'Trade error')
      this.saveState()
      this.notifyStateChange()

      return result
    }
  }

  /**
   * Quick trade helpers
   */
  async buyWithSOL(
    tokenMint: string,
    solAmount: number,
    slippageBps?: number
  ): Promise<TradeResult> {
    return this.executeAutonomousTrade(
      'buy',
      TOKENS.SOL,
      tokenMint,
      Math.floor(solAmount * LAMPORTS_PER_SOL),
      { slippageBps }
    )
  }

  async sellToSOL(
    tokenMint: string,
    tokenAmount: number,
    slippageBps?: number
  ): Promise<TradeResult> {
    return this.executeAutonomousTrade(
      'sell',
      tokenMint,
      TOKENS.SOL,
      tokenAmount,
      { slippageBps }
    )
  }

  // ─── TRADING CONTROLS ───

  /**
   * Pause autonomous trading
   */
  pause(reason: string = 'Manual pause'): void {
    this._isPaused = true
    this._pauseReason = reason
    console.log('[AutonomousExecutionBridge] PAUSED:', reason)
    
    toast.warning('Autonomous Trading Paused', { description: reason })
    
    this.saveState()
    this.notifyStateChange()
  }

  /**
   * Resume autonomous trading
   */
  resume(): void {
    this._isPaused = false
    this._pauseReason = ''
    this._consecutiveFailures = 0
    
    console.log('[AutonomousExecutionBridge] RESUMED')
    toast.success('Autonomous Trading Resumed')
    
    this.saveState()
    this.notifyStateChange()
  }

  /**
   * Emergency stop - immediately halt all trading
   */
  emergencyStop(): void {
    this._isPaused = true
    this._pauseReason = 'EMERGENCY STOP'
    this._isLiveMode = false
    
    // Also stop the trade engine
    const engine = getTradeEngine(connection)
    engine.emergencyStop()
    
    console.error('[AutonomousExecutionBridge] 🚨 EMERGENCY STOP')
    
    toast.error('🚨 EMERGENCY STOP', {
      description: 'All autonomous trading halted immediately',
      duration: 10000,
    })
    
    this.saveState()
    this.notifyStateChange()
  }

  /**
   * Record profit/loss for daily tracking
   */
  recordPnL(pnlUSD: number): void {
    this.checkDailyReset()
    
    if (pnlUSD < 0) {
      this._dailyLoss += Math.abs(pnlUSD)
    } else {
      this._totalProfit += pnlUSD
    }

    // Auto-pause if daily loss exceeded
    if (this._dailyLoss >= this._maxDailyLoss) {
      this.pause(`Daily loss limit reached ($${this._dailyLoss.toFixed(2)})`)
    }

    this.saveState()
  }

  // ─── SAFETY CONFIGURATION ───

  /**
   * Set trading cooldown period
   */
  setCooldown(milliseconds: number): void {
    this._tradeCooldownMs = Math.max(1000, milliseconds)
  }

  /**
   * Set maximum consecutive failures before auto-pause
   */
  setMaxFailures(count: number): void {
    this._maxConsecutiveFailures = Math.max(1, count)
  }

  /**
   * Set maximum daily loss before auto-pause (USD)
   */
  setMaxDailyLoss(usd: number): void {
    this._maxDailyLoss = Math.max(0, usd)
  }

  // ─── EVENT CALLBACKS ───

  /**
   * Register callback for state changes
   */
  onStateChange(callback: (state: BridgeState) => void): void {
    this._onStateChange = callback
    // Immediately call with current state
    callback(this.getState())
  }

  /**
   * Register callback for trade execution
   */
  onTradeExecuted(callback: (result: TradeResult) => void): void {
    this._onTradeExecuted = callback
  }

  /**
   * Register callback for errors
   */
  onError(callback: (error: string) => void): void {
    this._onError = callback
  }

  // ─── STATE GETTERS ───

  /**
   * Get current bridge state
   */
  getState(): BridgeState {
    return {
      publicKey: this._publicKey,
      isLiveMode: this._isLiveMode,
      hasWallet: !!this._publicKey && !!this._signTransaction,
      canTrade: this.canExecuteLive(),
      lastTradeAt: this._lastTradeAt,
      totalAutonomousTrades: this._totalTrades,
      totalAutonomousProfit: this._totalProfit,
    }
  }

  /**
   * Get pause status
   */
  getPauseStatus(): { paused: boolean; reason: string } {
    return { paused: this._isPaused, reason: this._pauseReason }
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalTrades: number
    totalProfit: number
    consecutiveFailures: number
    dailyLoss: number
    maxDailyLoss: number
  } {
    return {
      totalTrades: this._totalTrades,
      totalProfit: this._totalProfit,
      consecutiveFailures: this._consecutiveFailures,
      dailyLoss: this._dailyLoss,
      maxDailyLoss: this._maxDailyLoss,
    }
  }

  // ─── INTERNAL HELPERS ───

  private checkDailyReset(): void {
    const now = Date.now()
    const midnight = new Date().setHours(0, 0, 0, 0)
    
    if (this._dailyLossResetAt < midnight) {
      this._dailyLoss = 0
      this._dailyLossResetAt = now
    }
  }

  private notifyStateChange(): void {
    this._onStateChange?.(this.getState())
  }

  private saveState(): void {
    try {
      const state = {
        isLiveMode: this._isLiveMode,
        isPaused: this._isPaused,
        pauseReason: this._pauseReason,
        totalTrades: this._totalTrades,
        totalProfit: this._totalProfit,
        lastTradeAt: this._lastTradeAt,
        consecutiveFailures: this._consecutiveFailures,
        dailyLoss: this._dailyLoss,
        dailyLossResetAt: this._dailyLossResetAt,
        maxDailyLoss: this._maxDailyLoss,
        tradeCooldownMs: this._tradeCooldownMs,
        maxConsecutiveFailures: this._maxConsecutiveFailures,
      }
      localStorage.setItem('qf-autonomous-bridge-state', JSON.stringify(state))
    } catch (e) {
      console.warn('[AutonomousExecutionBridge] Failed to save state:', e)
    }
  }

  private loadState(): void {
    try {
      const stored = localStorage.getItem('qf-autonomous-bridge-state')
      if (stored) {
        const state = JSON.parse(stored)
        // Don't restore isLiveMode for safety — user must re-enable manually
        this._isPaused = state.isPaused || false
        this._pauseReason = state.pauseReason || ''
        this._totalTrades = state.totalTrades || 0
        this._totalProfit = state.totalProfit || 0
        this._lastTradeAt = state.lastTradeAt || 0
        this._consecutiveFailures = state.consecutiveFailures || 0
        this._dailyLoss = state.dailyLoss || 0
        this._dailyLossResetAt = state.dailyLossResetAt || 0
        this._maxDailyLoss = state.maxDailyLoss || 500
        this._tradeCooldownMs = state.tradeCooldownMs || 5000
        this._maxConsecutiveFailures = state.maxConsecutiveFailures || 5
      }
    } catch (e) {
      console.warn('[AutonomousExecutionBridge] Failed to load state:', e)
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export const executionBridge = AutonomousExecutionBridge.getInstance()
export default AutonomousExecutionBridge

