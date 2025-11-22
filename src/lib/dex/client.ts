// DEX Execution Client — Jupiter/Jito/Private RPC Router
// November 21, 2025 — Quantum Falcon Cockpit

/**
 * DEX trade side
 */
export type DexSide = 'buy' | 'sell'

/**
 * Execution hints for routing and MEV protection
 */
export interface ExecutionHints {
  usePrivateRpc: boolean
  submitAsJitoBundle: boolean
  priorityFeeMicroLamports: number
  maxSlippageBps: number
  preferredRoutes: string[] // e.g., ['jupiter', 'raydium', 'phoenix']
  useFlashLoan?: boolean // Enable flash loan fallback
  flashLoanProvider?: 'solend' | 'mango' | 'kamino' // Flash loan provider
  targetSignature?: string // For Jito bundle sniping (bundle with target tx)
}

/**
 * DEX execution request
 * Internal representation with proper types
 */
export interface DexExecutionRequest {
  user: string // base58 Solana pubkey
  mintIn: string // base58 token mint
  mintOut: string // base58 token mint
  amountIn: bigint // integer lamports or token units
  side: DexSide
  hints: ExecutionHints
}

/**
 * DEX execution result from backend
 */
export interface DexExecutionResult {
  txId: string // signature
  route: string // e.g., "jupiter -> raydium -> phoenix"
  effectivePrice: number
  slippageBps: number
  filledAmountOut: string // integer units as string
  timestamp: string // ISO 8601
}

/**
 * API request body (for JSON serialization)
 */
interface DexExecutionAPIRequest {
  user: string
  mintIn: string
  mintOut: string
  amountIn: string // bigint serialized as string
  side: DexSide
  hints: ExecutionHints
}

/**
 * API response body
 */
interface DexExecutionAPIResponse {
  txId: string
  route: string
  effectivePrice: number
  slippageBps: number
  filledAmountOut: string
  timestamp: string
}

/**
 * Execute swap via router backend
 * Sends request to /api/dex/execute endpoint
 */
export async function executeSwapViaRouter(
  req: DexExecutionRequest
): Promise<DexExecutionResult> {
  // Convert request to JSON-serializable format
  const apiRequest: DexExecutionAPIRequest = {
    user: req.user,
    mintIn: req.mintIn,
    mintOut: req.mintOut,
    amountIn: req.amountIn.toString(),
    side: req.side,
    hints: req.hints,
  }

  try {
    const response = await fetch('/api/dex/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiRequest),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`
      )
    }

    const result: DexExecutionAPIResponse = await response.json()

    return {
      txId: result.txId,
      route: result.route,
      effectivePrice: result.effectivePrice,
      slippageBps: result.slippageBps,
      filledAmountOut: result.filledAmountOut,
      timestamp: result.timestamp,
    }
  } catch (error) {
    console.error('❌ DEX Execution Error:', error)
    throw error
  }
}

/**
 * Build execution hints based on market conditions
 */
export function buildExecutionHints(
  mevRiskScore: number,
  arbEdgeBps: number,
  options?: {
    useFlashLoan?: boolean
    flashLoanProvider?: 'solend' | 'mango' | 'kamino'
    targetSignature?: string // For Jito bundle sniping
    isMempoolSnipe?: boolean
  }
): ExecutionHints {
  const isSnipe = options?.isMempoolSnipe || false
  
  return {
    usePrivateRpc: mevRiskScore > 0.5 || isSnipe, // Always use private RPC for snipes
    submitAsJitoBundle: true, // Always use Jito for snipes and high MEV risk
    priorityFeeMicroLamports: Math.round(
      isSnipe 
        ? 10000 + mevRiskScore * 30000 // Higher fees for snipes (10k-40k)
        : 5000 + mevRiskScore * 20000 // 5k-25k based on MEV risk
    ),
    maxSlippageBps: isSnipe 
      ? 150 // Allow higher slippage for snipes (150bps)
      : Math.min(100, Math.max(50, 150 - arbEdgeBps)), // 50-100bps normal
    preferredRoutes: ['jupiter', 'raydium', 'phoenix'],
    useFlashLoan: options?.useFlashLoan || false,
    flashLoanProvider: options?.flashLoanProvider,
    targetSignature: options?.targetSignature, // For bundling with target transaction
  }
}

/**
 * Parse Solana amount (handles SOL and SPL tokens)
 */
export function parseTokenAmount(
  amount: string,
  decimals: number = 9
): bigint {
  const parts = amount.split('.')
  const wholePart = BigInt(parts[0] || '0')
  const fractionalPart = parts[1] || ''
  
  // Pad or trim fractional part to match decimals
  const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals)
  const fractionalBigInt = BigInt(paddedFractional)
  
  return wholePart * BigInt(10 ** decimals) + fractionalBigInt
}

/**
 * Format token amount for display
 */
export function formatTokenAmount(
  amount: bigint,
  decimals: number = 9,
  precision: number = 6
): string {
  const divisor = BigInt(10 ** decimals)
  const wholePart = amount / divisor
  const fractionalPart = amount % divisor
  
  const fractionalStr = fractionalPart
    .toString()
    .padStart(decimals, '0')
    .slice(0, precision)
    .replace(/0+$/, '')
  
  if (fractionalStr === '') {
    return wholePart.toString()
  }
  
  return `${wholePart}.${fractionalStr}`
}
