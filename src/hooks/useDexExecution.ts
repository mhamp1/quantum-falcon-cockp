// DEX Execution Hook — Manage Swap State and Execution
// November 21, 2025 — Quantum Falcon Cockpit

import { useState, useCallback } from 'react'
import {
  executeSwapViaRouter,
  type DexExecutionRequest,
  type DexExecutionResult,
} from '@/lib/dex/client'

export type ExecutionStatus = 'idle' | 'preparing' | 'submitting' | 'confirmed' | 'error'

interface UseDexExecutionReturn {
  status: ExecutionStatus
  lastResult: DexExecutionResult | null
  error: string | null
  execute: (request: DexExecutionRequest) => Promise<void>
  reset: () => void
}

/**
 * Hook for managing DEX execution state
 */
export function useDexExecution(): UseDexExecutionReturn {
  const [status, setStatus] = useState<ExecutionStatus>('idle')
  const [lastResult, setLastResult] = useState<DexExecutionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (request: DexExecutionRequest) => {
    try {
      setStatus('preparing')
      setError(null)

      // Validate request
      if (!request.user || request.user.length === 0) {
        throw new Error('User wallet address is required')
      }

      if (!request.mintIn || !request.mintOut) {
        throw new Error('Token mints are required')
      }

      if (request.amountIn <= 0n) {
        throw new Error('Amount must be greater than 0')
      }

      console.info('🔄 DEX Execution: Preparing swap', {
        user: request.user,
        mintIn: request.mintIn.slice(0, 8) + '...',
        mintOut: request.mintOut.slice(0, 8) + '...',
        amountIn: request.amountIn.toString(),
        side: request.side,
      })

      setStatus('submitting')

      // Execute swap via backend
      const result = await executeSwapViaRouter(request)

      setStatus('confirmed')
      setLastResult(result)

      console.info('✅ DEX Execution: Swap confirmed', {
        txId: result.txId,
        route: result.route,
        effectivePrice: result.effectivePrice,
        slippageBps: result.slippageBps,
      })
    } catch (err: any) {
      console.error('❌ DEX Execution: Failed', err)
      setStatus('error')
      setError(err.message || 'Execution failed')
      setLastResult(null)
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setLastResult(null)
    setError(null)
  }, [])

  return {
    status,
    lastResult,
    error,
    execute,
    reset,
  }
}
