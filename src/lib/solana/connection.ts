// ═══════════════════════════════════════════════════════════════
// QUANTUM FALCON — HELIUS RPC CONNECTION
// Premium Solana RPC with MEV protection
// November 27, 2025 — Production Ready
// ═══════════════════════════════════════════════════════════════

import { Connection, PublicKey, LAMPORTS_PER_SOL, ComputeBudgetProgram, TransactionInstruction } from '@solana/web3.js'

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

// Helius RPC URL (Premium - Anti-MEV)
const HELIUS_RPC_URL = import.meta.env.VITE_HELIUS_RPC_URL || 'https://api.mainnet-beta.solana.com'

// Network configuration
const NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'mainnet-beta'

// Commitment levels
const DEFAULT_COMMITMENT = 'confirmed'

// ═══════════════════════════════════════════════════════════════
// CONNECTION INSTANCE
// ═══════════════════════════════════════════════════════════════

export const connection = new Connection(HELIUS_RPC_URL, {
  commitment: DEFAULT_COMMITMENT,
  confirmTransactionInitialTimeout: 60000,
})

// ═══════════════════════════════════════════════════════════════
// HELIUS-SPECIFIC UTILITIES
// ═══════════════════════════════════════════════════════════════

interface PriorityFeeEstimate {
  priorityFeeEstimate: number
  priorityFeeLevels?: {
    min: number
    low: number
    medium: number
    high: number
    veryHigh: number
    unsafeMax: number
  }
}

/**
 * Get dynamic priority fee estimate from Helius
 */
export async function getPriorityFeeEstimate(accountKeys?: string[]): Promise<PriorityFeeEstimate> {
  try {
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'priority-fee',
        method: 'getPriorityFeeEstimate',
        params: [{
          accountKeys: accountKeys || ['11111111111111111111111111111111'], // System program
          options: {
            includeAllPriorityFeeLevels: true,
          },
        }],
      }),
    })

    const data = await response.json()
    return data.result || { priorityFeeEstimate: 1000 }
  } catch (error) {
    console.warn('[Helius] Priority fee estimate failed, using default:', error)
    return { priorityFeeEstimate: 1000 }
  }
}

/**
 * Create compute budget instructions with dynamic priority fee
 */
export async function createPriorityFeeInstructions(
  accountKeys?: string[],
  level: 'low' | 'medium' | 'high' | 'veryHigh' = 'medium'
): Promise<TransactionInstruction[]> {
  const estimate = await getPriorityFeeEstimate(accountKeys)
  
  let microLamports = estimate.priorityFeeEstimate || 1000
  
  // Use specific level if available
  if (estimate.priorityFeeLevels) {
    microLamports = estimate.priorityFeeLevels[level] || microLamports
  }

  return [
    ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports }),
  ]
}

// ═══════════════════════════════════════════════════════════════
// RPC HEALTH & MONITORING
// ═══════════════════════════════════════════════════════════════

export interface RPCHealth {
  healthy: boolean
  latency: number
  slot: number
  blockHeight: number
  tps: number
  error?: string
}

/**
 * Check RPC health and get metrics
 */
export async function checkRPCHealth(): Promise<RPCHealth> {
  const startTime = Date.now()
  
  try {
    // Parallel health checks
    const [slot, blockHeight, perfSamples] = await Promise.all([
      connection.getSlot(),
      connection.getBlockHeight(),
      connection.getRecentPerformanceSamples(1),
    ])

    const latency = Date.now() - startTime
    const tps = perfSamples[0]?.numTransactions / (perfSamples[0]?.samplePeriodSecs || 1) || 0

    return {
      healthy: true,
      latency,
      slot,
      blockHeight,
      tps: Math.round(tps),
    }
  } catch (error: any) {
    return {
      healthy: false,
      latency: Date.now() - startTime,
      slot: 0,
      blockHeight: 0,
      tps: 0,
      error: error.message,
    }
  }
}

/**
 * Test Helius RPC connection
 */
export async function testHeliusConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: '1',
        method: 'getHealth',
      }),
    })

    const data = await response.json()
    
    if (data.result === 'ok') {
      return { success: true, message: 'Helius RPC connected — mainnet live!' }
    }
    
    return { success: false, message: data.error?.message || 'Unknown error' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// ═══════════════════════════════════════════════════════════════
// BALANCE & ACCOUNT UTILITIES
// ═══════════════════════════════════════════════════════════════

/**
 * Get SOL balance for an address
 */
export async function getSOLBalance(address: string): Promise<number> {
  try {
    const pubkey = new PublicKey(address)
    const balance = await connection.getBalance(pubkey)
    return balance / LAMPORTS_PER_SOL
  } catch (error) {
    console.error('[Solana] Balance fetch failed:', error)
    return 0
  }
}

/**
 * Get recent transaction history
 */
export async function getTransactionHistory(
  address: string,
  limit: number = 20
): Promise<Array<{
  signature: string
  slot: number
  blockTime: number | null
  err: any
}>> {
  try {
    const pubkey = new PublicKey(address)
    const signatures = await connection.getConfirmedSignaturesForAddress2(pubkey, { limit })
    
    return signatures.map(sig => ({
      signature: sig.signature,
      slot: sig.slot,
      blockTime: sig.blockTime,
      err: sig.err,
    }))
  } catch (error) {
    console.error('[Solana] Transaction history failed:', error)
    return []
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export default connection
export { HELIUS_RPC_URL, NETWORK, DEFAULT_COMMITMENT }

