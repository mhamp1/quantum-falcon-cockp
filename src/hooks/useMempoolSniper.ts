// Mempool Sniper Hook — Live Sniping Integration
// November 21, 2025 — Quantum Falcon Cockpit

import { useState, useEffect, useCallback, useRef } from 'react'
import { createMempoolSniper, type MempoolSniper, type MempoolTransaction, type SnipeResult } from '../lib/mempool/sniper'

/**
 * Hook for mempool sniping functionality
 */
export function useMempoolSniper(userPublicKey: string | null) {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [lastSnipe, setLastSnipe] = useState<SnipeResult | null>(null)
  const [pendingSnipes, setPendingSnipes] = useState<Map<string, Promise<SnipeResult>>>(new Map())
  const sniperRef = useRef<MempoolSniper | null>(null)

  // Initialize sniper
  useEffect(() => {
    if (!sniperRef.current) {
      sniperRef.current = createMempoolSniper({
        minLiquidityUsd: 50000,
        maxSlippageBps: 150,
        useJitoBundle: true,
        useFlashLoan: true,
        flashLoanProvider: 'solend',
        priorityFeeMultiplier: 1.5,
      })
    }

    return () => {
      if (sniperRef.current) {
        sniperRef.current.stopMonitoring()
      }
    }
  }, [])

  /**
   * Start monitoring mempool for new pools
   */
  const startMonitoring = useCallback((onNewPool?: (tx: MempoolTransaction) => void) => {
    if (!sniperRef.current || !userPublicKey) {
      console.warn('⚠️ Cannot start monitoring: sniper not initialized or wallet not connected')
      return
    }

    setIsMonitoring(true)
    
    sniperRef.current.startMonitoring((tx) => {
      console.info('🎯 New pool detected:', {
        pool: tx.poolAddress.slice(0, 8) + '...',
        liquidity: `$${(tx.liquidityUsd / 1000).toFixed(1)}K`,
        token: tx.tokenMint.slice(0, 8) + '...',
      })
      
      if (onNewPool) {
        onNewPool(tx)
      }
    }).catch((error) => {
      console.error('❌ Failed to start mempool monitoring:', error)
      setIsMonitoring(false)
    })
  }, [userPublicKey])

  /**
   * Stop monitoring mempool
   */
  const stopMonitoring = useCallback(() => {
    if (sniperRef.current) {
      sniperRef.current.stopMonitoring()
      setIsMonitoring(false)
    }
  }, [])

  /**
   * Execute a snipe on a detected transaction
   */
  const executeSnipe = useCallback(async (
    tx: MempoolTransaction,
    amountIn: bigint,
    mintIn?: string
  ): Promise<SnipeResult> => {
    if (!sniperRef.current || !userPublicKey) {
      throw new Error('Sniper not initialized or wallet not connected')
    }

    const result = await sniperRef.current.executeSnipe(
      tx,
      userPublicKey,
      amountIn,
      mintIn
    )

    setLastSnipe(result)
    return result
  }, [userPublicKey])

  /**
   * Auto-snipe: Automatically snipe new pools that meet criteria
   */
  const enableAutoSnipe = useCallback((
    amountIn: bigint,
    mintIn?: string,
    onSnipeResult?: (result: SnipeResult) => void
  ) => {
    if (!userPublicKey) {
      console.warn('⚠️ Cannot enable auto-snipe: wallet not connected')
      return
    }

    startMonitoring(async (tx) => {
      try {
        console.info('⚡ Auto-sniping pool:', tx.poolAddress.slice(0, 8) + '...')
        const result = await executeSnipe(tx, amountIn, mintIn)
        
        if (onSnipeResult) {
          onSnipeResult(result)
        }

        if (result.success) {
          console.info('✅ Snipe successful:', result.txId)
        } else {
          console.warn('⚠️ Snipe failed:', result.error)
        }
      } catch (error: any) {
        console.error('❌ Auto-snipe error:', error)
      }
    })
  }, [userPublicKey, startMonitoring, executeSnipe])

  return {
    isMonitoring,
    lastSnipe,
    startMonitoring,
    stopMonitoring,
    executeSnipe,
    enableAutoSnipe,
  }
}

