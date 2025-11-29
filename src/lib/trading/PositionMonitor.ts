// ═══════════════════════════════════════════════════════════════
// POSITION MONITOR — Automatic Stop-Loss & Take-Profit Execution
// Continuously monitors open positions and executes exit logic
// November 28, 2025 — Quantum Falcon Cockpit
// ═══════════════════════════════════════════════════════════════

import { JupiterSwapEngine, TOKENS } from './JupiterSwapEngine'
import { executionBridge, TradeResult } from './AutonomousExecutionBridge'
import { connection } from '@/lib/solana/connection'
import { toast } from 'sonner'
import { logger } from '@/lib/productionLogger'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface MonitoredPosition {
  id: string
  token: string
  symbol: string
  entryPrice: number
  amount: number
  stopLossPrice: number
  takeProfitPrice: number
  trailingStopPercent?: number
  highestPrice: number
  openedAt: number
  strategy: string
  side: 'long' | 'short'
  status: 'open' | 'closing' | 'closed'
}

export interface PositionCloseResult {
  positionId: string
  success: boolean
  exitPrice: number
  exitReason: 'stop_loss' | 'take_profit' | 'trailing_stop' | 'manual'
  pnl: number
  pnlPercent: number
  signature?: string
  error?: string
}

export interface PositionMonitorConfig {
  checkIntervalMs: number
  minPositionValueUSD: number
  defaultStopLossPercent: number
  defaultTakeProfitPercent: number
  defaultTrailingStopPercent: number
  maxPositions: number
}

export interface PositionStats {
  openPositions: number
  totalPositionValue: number
  totalUnrealizedPnL: number
  totalUnrealizedPnLPercent: number
  positionsClosed: number
  totalRealizedPnL: number
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: PositionMonitorConfig = {
  checkIntervalMs: 5000,          // Check every 5 seconds
  minPositionValueUSD: 1,         // Minimum $1 position value
  defaultStopLossPercent: 5,      // 5% stop loss
  defaultTakeProfitPercent: 15,   // 15% take profit
  defaultTrailingStopPercent: 3,  // 3% trailing stop
  maxPositions: 10,               // Maximum 10 open positions
}

// ═══════════════════════════════════════════════════════════════
// POSITION MONITOR CLASS
// ═══════════════════════════════════════════════════════════════

class PositionMonitor {
  private positions: Map<string, MonitoredPosition> = new Map()
  private jupiter: JupiterSwapEngine
  private config: PositionMonitorConfig
  private isRunning: boolean = false
  private intervalId: NodeJS.Timeout | null = null
  private lastCheck: number = 0
  
  // Statistics
  private positionsClosed: number = 0
  private totalRealizedPnL: number = 0
  
  // Callbacks
  private onPositionClosed?: (result: PositionCloseResult) => void
  private onPositionUpdated?: (position: MonitoredPosition) => void
  private onError?: (error: string, positionId: string) => void

  constructor(config?: Partial<PositionMonitorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.jupiter = new JupiterSwapEngine(connection)
    this.loadPositions()
    logger.log('[PositionMonitor] Initialized with config:', this.config)
  }

  // ─── POSITION MANAGEMENT ───

  /**
   * Add a position to monitor
   */
  addPosition(position: Omit<MonitoredPosition, 'id' | 'highestPrice' | 'status'>): string {
    // Check max positions
    if (this.positions.size >= this.config.maxPositions) {
      logger.warn('[PositionMonitor] Max positions reached, cannot add more')
      toast.warning('Maximum Positions Reached', {
        description: `You can only have ${this.config.maxPositions} open positions`,
      })
      return ''
    }

    const id = `pos-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    
    const monitored: MonitoredPosition = {
      ...position,
      id,
      highestPrice: position.entryPrice,
      status: 'open',
    }
    
    this.positions.set(id, monitored)
    this.savePositions()
    
    logger.log(`[PositionMonitor] Position added: ${id}`, {
      token: position.token.slice(0, 8) + '...',
      entry: position.entryPrice,
      stopLoss: position.stopLossPrice,
      takeProfit: position.takeProfitPrice,
    })

    toast.success('Position Monitoring', {
      description: `${position.symbol} added with SL: $${position.stopLossPrice.toFixed(4)} / TP: $${position.takeProfitPrice.toFixed(4)}`,
      duration: 3000,
    })
    
    return id
  }

  /**
   * Remove a position from monitoring
   */
  removePosition(positionId: string): boolean {
    const removed = this.positions.delete(positionId)
    if (removed) {
      this.savePositions()
      logger.log(`[PositionMonitor] Position removed: ${positionId}`)
    }
    return removed
  }

  /**
   * Update stop loss for a position
   */
  updateStopLoss(positionId: string, newStopLoss: number): boolean {
    const position = this.positions.get(positionId)
    if (!position) return false

    position.stopLossPrice = newStopLoss
    this.positions.set(positionId, position)
    this.savePositions()
    this.onPositionUpdated?.(position)
    
    logger.log(`[PositionMonitor] Stop loss updated for ${positionId}: $${newStopLoss}`)
    return true
  }

  /**
   * Update take profit for a position
   */
  updateTakeProfit(positionId: string, newTakeProfit: number): boolean {
    const position = this.positions.get(positionId)
    if (!position) return false

    position.takeProfitPrice = newTakeProfit
    this.positions.set(positionId, position)
    this.savePositions()
    this.onPositionUpdated?.(position)
    
    logger.log(`[PositionMonitor] Take profit updated for ${positionId}: $${newTakeProfit}`)
    return true
  }

  /**
   * Update trailing stop percentage
   */
  updateTrailingStop(positionId: string, trailingPercent: number | undefined): boolean {
    const position = this.positions.get(positionId)
    if (!position) return false

    position.trailingStopPercent = trailingPercent
    this.positions.set(positionId, position)
    this.savePositions()
    this.onPositionUpdated?.(position)
    
    logger.log(`[PositionMonitor] Trailing stop updated for ${positionId}: ${trailingPercent}%`)
    return true
  }

  // ─── MONITORING CONTROLS ───

  /**
   * Start position monitoring loop
   */
  start(): void {
    if (this.isRunning) {
      logger.log('[PositionMonitor] Already running')
      return
    }

    this.isRunning = true
    logger.log('[PositionMonitor] 🟢 Started monitoring...')

    // Initial check
    this.checkAllPositions()

    // Start interval
    this.intervalId = setInterval(async () => {
      await this.checkAllPositions()
    }, this.config.checkIntervalMs)
  }

  /**
   * Stop position monitoring
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    logger.log('[PositionMonitor] 🔴 Stopped')
  }

  /**
   * Check if monitor is running
   */
  isActive(): boolean {
    return this.isRunning
  }

  // ─── CORE MONITORING LOGIC ───

  /**
   * Check all positions for stop-loss/take-profit triggers
   */
  private async checkAllPositions(): Promise<void> {
    const openPositions = Array.from(this.positions.values()).filter(p => p.status === 'open')
    
    if (openPositions.length === 0) {
      return
    }

    // Get unique tokens
    const tokens = [...new Set(openPositions.map(p => p.token))]
    
    try {
      // Fetch current prices for all tokens
      const prices = await this.jupiter.getTokenPrices(tokens)
      this.lastCheck = Date.now()

      // Check each position
      for (const position of openPositions) {
        const currentPrice = prices[position.token]
        
        if (!currentPrice || currentPrice <= 0) {
          logger.warn(`[PositionMonitor] No price for ${position.symbol}`)
          continue
        }

        // Update highest price for trailing stop
        if (currentPrice > position.highestPrice) {
          position.highestPrice = currentPrice
          this.positions.set(position.id, position)
        }

        // Calculate effective stop loss (including trailing)
        let effectiveStopLoss = position.stopLossPrice
        if (position.trailingStopPercent && position.trailingStopPercent > 0) {
          const trailingStop = position.highestPrice * (1 - position.trailingStopPercent / 100)
          effectiveStopLoss = Math.max(effectiveStopLoss, trailingStop)
        }

        // Check stop loss (for long positions, price below stop)
        if (position.side === 'long' && currentPrice <= effectiveStopLoss) {
          logger.log(`[PositionMonitor] 🛑 STOP LOSS triggered for ${position.symbol} @ $${currentPrice.toFixed(4)}`)
          await this.closePosition(
            position,
            currentPrice,
            effectiveStopLoss > position.stopLossPrice ? 'trailing_stop' : 'stop_loss'
          )
          continue
        }

        // Check take profit
        if (position.side === 'long' && currentPrice >= position.takeProfitPrice) {
          logger.log(`[PositionMonitor] 🎯 TAKE PROFIT triggered for ${position.symbol} @ $${currentPrice.toFixed(4)}`)
          await this.closePosition(position, currentPrice, 'take_profit')
          continue
        }

        // For short positions (reverse logic)
        if (position.side === 'short') {
          if (currentPrice >= effectiveStopLoss) {
            await this.closePosition(
              position,
              currentPrice,
              effectiveStopLoss < position.stopLossPrice ? 'trailing_stop' : 'stop_loss'
            )
            continue
          }
          if (currentPrice <= position.takeProfitPrice) {
            await this.closePosition(position, currentPrice, 'take_profit')
            continue
          }
        }
      }

      // Save updated positions (highest prices may have changed)
      this.savePositions()
      
    } catch (error: any) {
      logger.error('[PositionMonitor] Check failed:', error)
      this.onError?.(error.message, 'all')
    }
  }

  /**
   * Close a position
   */
  private async closePosition(
    position: MonitoredPosition,
    exitPrice: number,
    reason: 'stop_loss' | 'take_profit' | 'trailing_stop' | 'manual'
  ): Promise<void> {
    // Mark as closing to prevent double execution
    position.status = 'closing'
    this.positions.set(position.id, position)

    // Calculate P&L
    const pnl = (exitPrice - position.entryPrice) * position.amount
    const pnlPercent = ((exitPrice - position.entryPrice) / position.entryPrice) * 100

    const result: PositionCloseResult = {
      positionId: position.id,
      success: false,
      exitPrice,
      exitReason: reason,
      pnl,
      pnlPercent,
    }

    try {
      // Check if we can execute live
      if (executionBridge.canExecuteLive()) {
        // Execute real sell
        const tradeResult: TradeResult = await executionBridge.executeAutonomousTrade(
          'sell',
          position.token,
          TOKENS.USDC,
          Math.floor(position.amount * 1e9), // Assumes 9 decimals
          { slippageBps: 150 } // Allow slightly higher slippage for exits
        )

        result.success = tradeResult.success
        result.signature = tradeResult.signature

        if (tradeResult.success) {
          // Record P&L on bridge for daily tracking
          executionBridge.recordPnL(pnl)
          
          // Update statistics
          this.positionsClosed++
          this.totalRealizedPnL += pnl

          toast[reason === 'stop_loss' ? 'warning' : 'success'](
            `${this.getExitEmoji(reason)} ${reason.replace('_', ' ').toUpperCase()}`,
            {
              description: `${position.symbol}: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%)`,
              action: tradeResult.signature ? {
                label: 'View TX',
                onClick: () => window.open(`https://solscan.io/tx/${tradeResult.signature}`, '_blank'),
              } : undefined,
              duration: 8000,
            }
          )
        } else {
          toast.error('Position Close Failed', {
            description: tradeResult.error || 'Could not execute exit trade',
          })
        }
      } else {
        // Paper mode - just simulate
        result.success = true
        this.positionsClosed++
        this.totalRealizedPnL += pnl

        toast.info(
          `📝 [PAPER] ${reason.replace('_', ' ').toUpperCase()}`,
          {
            description: `${position.symbol}: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%)`,
            duration: 5000,
          }
        )
      }

    } catch (error: any) {
      logger.error(`[PositionMonitor] Failed to close position ${position.id}:`, error)
      result.error = error.message
      this.onError?.(error.message, position.id)
    }

    // Mark position as closed and remove from monitoring
    if (result.success) {
      position.status = 'closed'
      this.positions.delete(position.id)
    } else {
      // Reset to open if close failed
      position.status = 'open'
      this.positions.set(position.id, position)
    }

    this.savePositions()
    this.onPositionClosed?.(result)
  }

  /**
   * Manually close a position
   */
  async manualClose(positionId: string): Promise<PositionCloseResult | null> {
    const position = this.positions.get(positionId)
    if (!position || position.status !== 'open') {
      return null
    }

    // Get current price
    const prices = await this.jupiter.getTokenPrices([position.token])
    const currentPrice = prices[position.token] || position.entryPrice

    await this.closePosition(position, currentPrice, 'manual')
    
    return {
      positionId,
      success: true,
      exitPrice: currentPrice,
      exitReason: 'manual',
      pnl: (currentPrice - position.entryPrice) * position.amount,
      pnlPercent: ((currentPrice - position.entryPrice) / position.entryPrice) * 100,
    }
  }

  private getExitEmoji(reason: string): string {
    switch (reason) {
      case 'stop_loss': return '🛑'
      case 'take_profit': return '🎯'
      case 'trailing_stop': return '📈'
      case 'manual': return '✋'
      default: return '📊'
    }
  }

  // ─── CALLBACKS ───

  onPositionClosedCallback(callback: (result: PositionCloseResult) => void): void {
    this.onPositionClosed = callback
  }

  onPositionUpdatedCallback(callback: (position: MonitoredPosition) => void): void {
    this.onPositionUpdated = callback
  }

  onErrorCallback(callback: (error: string, positionId: string) => void): void {
    this.onError = callback
  }

  // ─── GETTERS ───

  /**
   * Get all monitored positions
   */
  getPositions(): MonitoredPosition[] {
    return Array.from(this.positions.values())
  }

  /**
   * Get open positions only
   */
  getOpenPositions(): MonitoredPosition[] {
    return Array.from(this.positions.values()).filter(p => p.status === 'open')
  }

  /**
   * Get a specific position
   */
  getPosition(positionId: string): MonitoredPosition | undefined {
    return this.positions.get(positionId)
  }

  /**
   * Get statistics
   */
  getStats(): PositionStats {
    const openPositions = this.getOpenPositions()
    
    let totalValue = 0
    const totalUnrealizedPnL = 0
    
    // Note: Would need current prices for accurate calculation
    openPositions.forEach(p => {
      totalValue += p.amount * p.entryPrice
    })

    return {
      openPositions: openPositions.length,
      totalPositionValue: totalValue,
      totalUnrealizedPnL,
      totalUnrealizedPnLPercent: totalValue > 0 ? (totalUnrealizedPnL / totalValue) * 100 : 0,
      positionsClosed: this.positionsClosed,
      totalRealizedPnL: this.totalRealizedPnL,
    }
  }

  /**
   * Get configuration
   */
  getConfig(): PositionMonitorConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PositionMonitorConfig>): void {
    this.config = { ...this.config, ...newConfig }
    
    // Restart with new interval if running
    if (this.isRunning) {
      this.stop()
      this.start()
    }
    
    this.savePositions()
  }

  // ─── PERSISTENCE ───

  private savePositions(): void {
    try {
      const state = {
        positions: Array.from(this.positions.entries()),
        positionsClosed: this.positionsClosed,
        totalRealizedPnL: this.totalRealizedPnL,
        config: this.config,
      }
      localStorage.setItem('qf-monitored-positions', JSON.stringify(state))
    } catch (e) {
      logger.warn('[PositionMonitor] Failed to save state:', e)
    }
  }

  private loadPositions(): void {
    try {
      const stored = localStorage.getItem('qf-monitored-positions')
      if (stored) {
        const state = JSON.parse(stored)
        this.positions = new Map(state.positions || [])
        this.positionsClosed = state.positionsClosed || 0
        this.totalRealizedPnL = state.totalRealizedPnL || 0
        this.config = { ...DEFAULT_CONFIG, ...state.config }
        
        logger.log(`[PositionMonitor] Loaded ${this.positions.size} positions from storage`)
      }
    } catch (e) {
      logger.warn('[PositionMonitor] Failed to load state:', e)
    }
  }

  /**
   * Clear all positions (emergency)
   */
  clearAllPositions(): void {
    this.positions.clear()
    this.savePositions()
    logger.log('[PositionMonitor] All positions cleared')
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON INSTANCE & EXPORTS
// ═══════════════════════════════════════════════════════════════

export const positionMonitor = new PositionMonitor()

export default PositionMonitor

