// Paper Trading Engine — 100% Real-Time Data, Zero Real Money
// November 25, 2025 — Quantum Falcon Cockpit
// Paper mode is IDENTICAL to live mode except no real trades executed

import { useKVSafe } from '@/hooks/useKVFallback'
import { useMarketFeed } from '@/hooks/useMarketFeed'
import { useTaxReserve } from '@/lib/tax/TaxReserveEngine'
import type { MarketSnapshot } from '@/lib/market/solanaFeed'
import type { AgentDecision } from '@/lib/ai/agents'
import { toast } from 'sonner'

// Paper trade record
export interface PaperTrade {
  id: string
  timestamp: number
  symbol: string
  side: 'buy' | 'sell'
  entryPrice: number
  exitPrice?: number
  amount: number
  slippage: number // Simulated slippage in bps
  status: 'open' | 'closed' | 'stopped'
  pnl?: number
  pnlPercent?: number
  stopLoss?: number
  takeProfit?: number
  agent?: string
  strategy?: string
}

// Paper trading session stats
export interface PaperTradingStats {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  totalPnL: number
  maxDrawdown: number
  currentDrawdown: number
  winRate: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  sharpeRatio: number
  totalVolume: number
  bestTrade: number
  worstTrade: number
  streak: number // Current win/loss streak
}

// Slippage simulation based on orderbook depth and size
function simulateSlippage(
  orderbook: MarketSnapshot['orderbook'],
  side: 'buy' | 'sell',
  amount: number
): number {
  // Base slippage from spread
  const baseSlippageBps = orderbook.spreadBps / 2
  
  // Impact slippage based on size (larger trades = more impact)
  const sizeImpactBps = Math.min(50, amount * 0.5) // Max 50bps from size
  
  // Volatility impact (high volatility = more slippage)
  const volatilityImpactBps = Math.min(30, orderbook.volatility1h * 2)
  
  // Random market noise (±5bps)
  const noiseBps = (Math.random() - 0.5) * 10
  
  // Total slippage
  const totalSlippage = baseSlippageBps + sizeImpactBps + volatilityImpactBps + noiseBps
  
  return Math.max(0, totalSlippage) // Never negative
}

// Calculate execution price with slippage
function calculateExecutionPrice(
  orderbook: MarketSnapshot['orderbook'],
  side: 'buy' | 'sell',
  slippageBps: number
): number {
  const basePrice = side === 'buy' ? orderbook.bestAsk : orderbook.bestBid
  const slippageMultiplier = side === 'buy' 
    ? (1 + slippageBps / 10000) 
    : (1 - slippageBps / 10000)
  
  return basePrice * slippageMultiplier
}

// Default empty stats
const DEFAULT_STATS: PaperTradingStats = {
  totalTrades: 0,
  winningTrades: 0,
  losingTrades: 0,
  totalPnL: 0,
  maxDrawdown: 0,
  currentDrawdown: 0,
  winRate: 0,
  avgWin: 0,
  avgLoss: 0,
  profitFactor: 0,
  sharpeRatio: 0,
  totalVolume: 0,
  bestTrade: 0,
  worstTrade: 0,
  streak: 0,
}

/**
 * Paper Trading Engine Hook
 * Uses REAL market data for everything — only difference is no real money moves
 */
export function usePaperTradingEngine() {
  const [isPaperMode] = useKVSafe<boolean>('paper-trading-mode', true)
  const [trades, setTrades] = useKVSafe<PaperTrade[]>('paper-trades', [])
  const [stats, setStats] = useKVSafe<PaperTradingStats>('paper-trading-stats', DEFAULT_STATS)
  const [balance, setBalance] = useKVSafe<number>('paper-balance', 10000) // Start with $10k
  const { addProfitableTrade } = useTaxReserve()
  
  // Get REAL market data
  const { snapshot: marketSnapshot, isConnected } = useMarketFeed({ useMockData: false })
  
  /**
   * Execute a paper trade using REAL prices
   */
  const executePaperTrade = async (
    symbol: string,
    side: 'buy' | 'sell',
    amount: number,
    options?: {
      stopLoss?: number
      takeProfit?: number
      agent?: string
      strategy?: string
    }
  ): Promise<PaperTrade | null> => {
    if (!isPaperMode) {
      console.warn('[PaperTradingEngine] Not in paper mode, skipping')
      return null
    }
    
    if (!marketSnapshot) {
      toast.error('No market data available')
      return null
    }
    
    // Simulate slippage based on REAL orderbook
    const slippage = simulateSlippage(marketSnapshot.orderbook, side, amount)
    
    // Calculate execution price with slippage
    const executionPrice = calculateExecutionPrice(
      marketSnapshot.orderbook,
      side,
      slippage
    )
    
    // Create paper trade
    const trade: PaperTrade = {
      id: `paper-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      symbol,
      side,
      entryPrice: executionPrice,
      amount,
      slippage,
      status: 'open',
      stopLoss: options?.stopLoss,
      takeProfit: options?.takeProfit,
      agent: options?.agent,
      strategy: options?.strategy,
    }
    
    // Update balance
    const tradeValue = amount * executionPrice
    if (side === 'buy') {
      if (tradeValue > balance) {
        toast.error('Insufficient paper balance')
        return null
      }
      setBalance(prev => prev - tradeValue)
    }
    
    // Save trade
    setTrades(prev => [trade, ...prev].slice(0, 500)) // Keep last 500 trades
    
    // Show realistic toast
    toast.success(`📋 Paper ${side.toUpperCase()} Executed`, {
      description: `${amount} ${symbol} @ $${executionPrice.toFixed(4)} (${slippage.toFixed(1)}bps slippage)`,
    })
    
    // Update stats
    updateStats({ ...stats, totalTrades: stats.totalTrades + 1, totalVolume: stats.totalVolume + tradeValue })
    
    return trade
  }
  
  /**
   * Close an open paper trade using REAL current price
   */
  const closePaperTrade = async (
    tradeId: string,
    reason?: 'manual' | 'stop-loss' | 'take-profit' | 'signal'
  ): Promise<PaperTrade | null> => {
    if (!marketSnapshot) {
      toast.error('No market data available')
      return null
    }
    
    const trade = trades.find(t => t.id === tradeId)
    if (!trade || trade.status !== 'open') {
      toast.error('Trade not found or already closed')
      return null
    }
    
    // Get REAL exit price with slippage
    const exitSide = trade.side === 'buy' ? 'sell' : 'buy'
    const exitSlippage = simulateSlippage(marketSnapshot.orderbook, exitSide, trade.amount)
    const exitPrice = calculateExecutionPrice(marketSnapshot.orderbook, exitSide, exitSlippage)
    
    // Calculate P&L
    const priceDiff = trade.side === 'buy' 
      ? exitPrice - trade.entryPrice 
      : trade.entryPrice - exitPrice
    const pnl = priceDiff * trade.amount
    const pnlPercent = (priceDiff / trade.entryPrice) * 100
    
    // Update trade
    const closedTrade: PaperTrade = {
      ...trade,
      exitPrice,
      pnl,
      pnlPercent,
      status: reason === 'stop-loss' ? 'stopped' : 'closed',
    }
    
    // Update trades list
    setTrades(prev => prev.map(t => t.id === tradeId ? closedTrade : t))
    
    // Update balance
    const tradeValue = trade.amount * exitPrice
    if (trade.side === 'buy') {
      setBalance(prev => prev + tradeValue)
    } else {
      setBalance(prev => prev + pnl)
    }
    
    // Record for tax calculation (even in paper mode for realistic tracking)
    if (pnl > 0) {
      addProfitableTrade(pnl, 0, trade.symbol, trade.entryPrice, exitPrice)
    }
    
    // Update stats
    const isWin = pnl > 0
    const newStats = { ...stats }
    if (isWin) {
      newStats.winningTrades++
      newStats.avgWin = ((newStats.avgWin * (newStats.winningTrades - 1)) + pnl) / newStats.winningTrades
      newStats.bestTrade = Math.max(newStats.bestTrade, pnl)
      newStats.streak = newStats.streak >= 0 ? newStats.streak + 1 : 1
    } else {
      newStats.losingTrades++
      newStats.avgLoss = ((newStats.avgLoss * (newStats.losingTrades - 1)) + Math.abs(pnl)) / newStats.losingTrades
      newStats.worstTrade = Math.min(newStats.worstTrade, pnl)
      newStats.streak = newStats.streak <= 0 ? newStats.streak - 1 : -1
    }
    newStats.totalPnL += pnl
    newStats.winRate = (newStats.winningTrades / (newStats.winningTrades + newStats.losingTrades)) * 100
    newStats.profitFactor = newStats.avgLoss > 0 ? (newStats.avgWin * newStats.winningTrades) / (newStats.avgLoss * newStats.losingTrades) : 0
    updateStats(newStats)
    
    // Show realistic toast
    const emoji = pnl > 0 ? '💰' : '📉'
    toast[pnl > 0 ? 'success' : 'info'](`${emoji} Paper Trade Closed`, {
      description: `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnlPercent >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%)`,
    })
    
    return closedTrade
  }
  
  /**
   * Check stop-loss and take-profit for all open trades
   */
  const checkStopsAndTargets = () => {
    if (!marketSnapshot) return
    
    const currentPrice = marketSnapshot.orderbook.mid
    
    trades.filter(t => t.status === 'open').forEach(trade => {
      const isLong = trade.side === 'buy'
      
      // Check stop-loss
      if (trade.stopLoss) {
        const hitStopLoss = isLong 
          ? currentPrice <= trade.stopLoss 
          : currentPrice >= trade.stopLoss
        
        if (hitStopLoss) {
          closePaperTrade(trade.id, 'stop-loss')
        }
      }
      
      // Check take-profit
      if (trade.takeProfit) {
        const hitTakeProfit = isLong 
          ? currentPrice >= trade.takeProfit 
          : currentPrice <= trade.takeProfit
        
        if (hitTakeProfit) {
          closePaperTrade(trade.id, 'take-profit')
        }
      }
    })
  }
  
  // Helper to update stats
  const updateStats = (newStats: PaperTradingStats) => {
    setStats(newStats)
  }
  
  // Reset paper trading
  const resetPaperTrading = () => {
    setTrades([])
    setStats(DEFAULT_STATS)
    setBalance(10000)
    toast.success('Paper trading reset', {
      description: 'Starting fresh with $10,000',
    })
  }
  
  // Get open positions
  const openPositions = trades.filter(t => t.status === 'open')
  
  // Get unrealized P&L
  const getUnrealizedPnL = () => {
    if (!marketSnapshot) return 0
    
    return openPositions.reduce((total, trade) => {
      const currentPrice = marketSnapshot.orderbook.mid
      const priceDiff = trade.side === 'buy' 
        ? currentPrice - trade.entryPrice 
        : trade.entryPrice - currentPrice
      return total + (priceDiff * trade.amount)
    }, 0)
  }
  
  return {
    // State
    isPaperMode,
    isConnected,
    balance,
    trades,
    stats,
    openPositions,
    
    // Real-time data
    marketSnapshot,
    unrealizedPnL: getUnrealizedPnL(),
    
    // Actions
    executePaperTrade,
    closePaperTrade,
    checkStopsAndTargets,
    resetPaperTrading,
  }
}

/**
 * Execute agent decision in paper mode
 * Uses REAL market data, REAL signals, just no real money
 */
export async function executeAgentDecisionPaper(
  decision: AgentDecision,
  marketSnapshot: MarketSnapshot,
  executePaperTrade: ReturnType<typeof usePaperTradingEngine>['executePaperTrade'],
  options?: {
    agent?: string
    strategy?: string
    positionSize?: number
  }
): Promise<PaperTrade | null> {
  if (decision.signal === 'HOLD') return null
  
  const side = decision.signal === 'BUY' ? 'buy' : 'sell'
  const amount = options?.positionSize || 1
  
  // Calculate stop-loss and take-profit based on volatility
  const currentPrice = marketSnapshot.orderbook.mid
  const volatility = marketSnapshot.orderbook.volatility1h || 5
  const stopLossDistance = currentPrice * (volatility * 0.5 / 100) // 0.5x volatility
  const takeProfitDistance = currentPrice * (volatility * 1.5 / 100) // 1.5x volatility
  
  const stopLoss = side === 'buy' 
    ? currentPrice - stopLossDistance 
    : currentPrice + stopLossDistance
  
  const takeProfit = side === 'buy' 
    ? currentPrice + takeProfitDistance 
    : currentPrice - takeProfitDistance
  
  return executePaperTrade(
    'SOL/USDC', // Default symbol
    side,
    amount,
    {
      stopLoss,
      takeProfit,
      agent: options?.agent,
      strategy: options?.strategy,
    }
  )
}

