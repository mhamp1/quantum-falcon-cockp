// Mempool Sniper — Live Transaction Monitoring & Sniping
// November 21, 2025 — Quantum Falcon Cockpit

import type { MempoolPool } from '../market/solanaFeed'
import { getOpportunityScorer, type SnipeOpportunity } from '../ai/learning/OpportunityScorer'
import { getLearningSystem } from '../ai/learning/AdaptiveLearningSystem'

/**
 * Mempool transaction detected in real-time
 */
export interface MempoolTransaction {
  signature: string
  poolAddress: string
  tokenMint: string
  liquidityUsd: number
  timestamp: number
  priorityFee: number
  isNewPool: boolean
}

/**
 * Snipe configuration
 */
export interface SnipeConfig {
  minLiquidityUsd: number
  maxSlippageBps: number
  useJitoBundle: boolean
  useFlashLoan: boolean
  flashLoanProvider?: 'solend' | 'mango' | 'kamino'
  priorityFeeMultiplier: number
}

/**
 * Snipe result
 */
export interface SnipeResult {
  success: boolean
  txId?: string
  method: 'jito' | 'flash-loan' | 'direct'
  executionTimeMs: number
  error?: string
}

/**
 * Mempool Sniper Service
 * Monitors live mempool transactions and executes snipes with Jito bundles
 */
export class MempoolSniper {
  private config: SnipeConfig
  private activeSnipes: Map<string, Promise<SnipeResult>> = new Map()
  private mempoolWatcher: WebSocket | null = null

  constructor(config: Partial<SnipeConfig> = {}) {
    this.config = {
      minLiquidityUsd: 50000,
      maxSlippageBps: 100,
      useJitoBundle: true,
      useFlashLoan: false,
      priorityFeeMultiplier: 1.5,
      ...config,
    }
  }

  /**
   * Start monitoring mempool for new pool transactions
   */
  async startMonitoring(
    onNewPool: (tx: MempoolTransaction) => void
  ): Promise<void> {
    const wsUrl = import.meta.env.VITE_MEMPOOL_WS_URL || 'wss://api.quantumfalcon.io/mempool'
    
    try {
      this.mempoolWatcher = new WebSocket(wsUrl)
      
      this.mempoolWatcher.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'new_pool' || data.type === 'pool_creation') {
            const tx: MempoolTransaction = {
              signature: data.signature,
              poolAddress: data.poolAddress,
              tokenMint: data.tokenMint,
              liquidityUsd: data.liquidityUsd || 0,
              timestamp: Date.now(),
              priorityFee: data.priorityFee || 0,
              isNewPool: true,
            }
            
            if (tx.liquidityUsd >= this.config.minLiquidityUsd) {
              onNewPool(tx)
            }
          }
        } catch (error) {
          console.error('❌ Mempool watcher parse error:', error)
        }
      }

      this.mempoolWatcher.onerror = (error) => {
        console.error('❌ Mempool watcher error:', error)
      }

      this.mempoolWatcher.onclose = () => {
        console.warn('⚠️ Mempool watcher closed, reconnecting...')
        // Auto-reconnect after 2 seconds
        setTimeout(() => {
          if (this.mempoolWatcher?.readyState === WebSocket.CLOSED) {
            this.startMonitoring(onNewPool)
          }
        }, 2000)
      }
    } catch (error) {
      console.error('❌ Failed to start mempool monitoring:', error)
      throw error
    }
  }

  /**
   * Stop monitoring mempool
   */
  stopMonitoring(): void {
    if (this.mempoolWatcher) {
      this.mempoolWatcher.close()
      this.mempoolWatcher = null
    }
  }

  /**
   * Execute a snipe on a detected pool
   */
  async executeSnipe(
    tx: MempoolTransaction,
    userPublicKey: string,
    amountIn: bigint,
    mintIn: string = 'So11111111111111111111111111111111111111112' // SOL
  ): Promise<SnipeResult> {
    const snipeKey = `${tx.signature}-${userPublicKey}`
    
    // Prevent duplicate snipes
    if (this.activeSnipes.has(snipeKey)) {
      return this.activeSnipes.get(snipeKey)!
    }

    const snipePromise = this._executeSnipeInternal(tx, userPublicKey, amountIn, mintIn)
    this.activeSnipes.set(snipeKey, snipePromise)
    
    // Clean up after completion
    snipePromise.finally(() => {
      setTimeout(() => this.activeSnipes.delete(snipeKey), 60000) // 1 min cleanup
    })

    return snipePromise
  }

  private async _executeSnipeInternal(
    tx: MempoolTransaction,
    userPublicKey: string,
    amountIn: bigint,
    mintIn: string
  ): Promise<SnipeResult> {
    const startTime = Date.now()

    try {
      // Try Jito bundle first (fastest)
      if (this.config.useJitoBundle) {
        try {
          const result = await this._snipeViaJito(tx, userPublicKey, amountIn, mintIn)
          return {
            success: result.success,
            txId: result.txId,
            method: 'jito',
            executionTimeMs: Date.now() - startTime,
            error: result.error,
          }
        } catch (error: any) {
          console.warn('⚠️ Jito bundle failed, trying flash loan fallback:', error.message)
          
          // Fallback to flash loan if enabled
          if (this.config.useFlashLoan) {
            return await this._snipeViaFlashLoan(tx, userPublicKey, amountIn, mintIn, startTime)
          }
          
          // Fallback to direct execution
          return await this._snipeDirect(tx, userPublicKey, amountIn, mintIn, startTime)
        }
      }

      // Try flash loan if Jito is disabled
      if (this.config.useFlashLoan) {
        try {
          return await this._snipeViaFlashLoan(tx, userPublicKey, amountIn, mintIn, startTime)
        } catch (error: any) {
          console.warn('⚠️ Flash loan failed, trying direct execution:', error.message)
          return await this._snipeDirect(tx, userPublicKey, amountIn, mintIn, startTime)
        }
      }

      // Direct execution as last resort
      return await this._snipeDirect(tx, userPublicKey, amountIn, mintIn, startTime)
    } catch (error: any) {
      return {
        success: false,
        method: 'direct',
        executionTimeMs: Date.now() - startTime,
        error: error.message || 'Snipe execution failed',
      }
    }
  }

  /**
   * Snipe via Jito bundle (fastest, most reliable)
   */
  private async _snipeViaJito(
    tx: MempoolTransaction,
    userPublicKey: string,
    amountIn: bigint,
    mintIn: string
  ): Promise<{ success: boolean; txId?: string; error?: string }> {
    const priorityFee = Math.round(
      tx.priorityFee * this.config.priorityFeeMultiplier
    )

    const response = await fetch('/api/mempool/snipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: userPublicKey,
        poolAddress: tx.poolAddress,
        tokenMint: tx.tokenMint,
        mintIn,
        amountIn: amountIn.toString(),
        method: 'jito',
        priorityFeeMicroLamports: priorityFee,
        maxSlippageBps: this.config.maxSlippageBps,
        targetSignature: tx.signature, // Bundle with target transaction
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    const result = await response.json()
    return {
      success: true,
      txId: result.txId,
    }
  }

  /**
   * Snipe via flash loan (fallback when insufficient balance)
   */
  private async _snipeViaFlashLoan(
    tx: MempoolTransaction,
    userPublicKey: string,
    amountIn: bigint,
    mintIn: string,
    startTime: number
  ): Promise<SnipeResult> {
    const provider = this.config.flashLoanProvider || 'solend'
    const priorityFee = Math.round(
      tx.priorityFee * this.config.priorityFeeMultiplier
    )

    const response = await fetch('/api/mempool/snipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: userPublicKey,
        poolAddress: tx.poolAddress,
        tokenMint: tx.tokenMint,
        mintIn,
        amountIn: amountIn.toString(),
        method: 'flash-loan',
        flashLoanProvider: provider,
        priorityFeeMicroLamports: priorityFee,
        maxSlippageBps: this.config.maxSlippageBps,
        useJitoBundle: true, // Still use Jito even with flash loan
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    const result = await response.json()
    return {
      success: true,
      txId: result.txId,
      method: 'flash-loan',
      executionTimeMs: Date.now() - startTime,
    }
  }

  /**
   * Direct snipe execution (last resort)
   */
  private async _snipeDirect(
    tx: MempoolTransaction,
    userPublicKey: string,
    amountIn: bigint,
    mintIn: string,
    startTime: number
  ): Promise<SnipeResult> {
    const priorityFee = Math.round(
      tx.priorityFee * this.config.priorityFeeMultiplier
    )

    const response = await fetch('/api/mempool/snipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: userPublicKey,
        poolAddress: tx.poolAddress,
        tokenMint: tx.tokenMint,
        mintIn,
        amountIn: amountIn.toString(),
        method: 'direct',
        priorityFeeMicroLamports: priorityFee,
        maxSlippageBps: this.config.maxSlippageBps,
      }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    const result = await response.json()
    return {
      success: true,
      txId: result.txId,
      method: 'direct',
      executionTimeMs: Date.now() - startTime,
    }
  }

  /**
   * Check if a pool is snipeable using ML-based opportunity scoring
   */
  isSnipeable(pool: MempoolPool, mevRiskScore: number): boolean {
    const scorer = getOpportunityScorer()
    const learningSystem = getLearningSystem()
    
    // Convert pool to opportunity format
    const opportunity: SnipeOpportunity = {
      poolAddress: pool.address || '',
      tokenMint: pool.tokenMint || '',
      liquidityUsd: pool.liqUsd,
      timestamp: Date.now(),
      mevRisk: mevRiskScore,
      poolAge: pool.age || 0,
    }
    
    // Score the opportunity
    const score = scorer.scoreOpportunity(opportunity)
    
    // Use learning system to check if we should take this trade
    const shouldTake = learningSystem.shouldTakeTrade(
      'liquidity-hunter',
      'mempool-snipe',
      score.confidence,
      {
        volatility: 0.05, // Default, should come from market data
        volume: pool.liqUsd,
        sentiment: 0.5,
        mevRisk: mevRiskScore,
      }
    )
    
    // Must pass both ML scoring and learning system check
    return score.recommendation === 'snipe' && shouldTake && score.score >= 60
  }

  /**
   * Get ML-based opportunity score for a pool
   */
  getOpportunityScore(pool: MempoolPool, mevRiskScore: number) {
    const scorer = getOpportunityScorer()
    
    const opportunity: SnipeOpportunity = {
      poolAddress: pool.address || '',
      tokenMint: pool.tokenMint || '',
      liquidityUsd: pool.liqUsd,
      timestamp: Date.now(),
      mevRisk: mevRiskScore,
      poolAge: pool.age || 0,
    }
    
    return scorer.scoreOpportunity(opportunity)
  }
}

/**
 * Create a default mempool sniper instance
 */
export function createMempoolSniper(config?: Partial<SnipeConfig>): MempoolSniper {
  return new MempoolSniper(config)
}

