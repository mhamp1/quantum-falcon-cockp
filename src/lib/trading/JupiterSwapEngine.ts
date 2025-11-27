// ═══════════════════════════════════════════════════════════════
// JUPITER SWAP ENGINE — Real DEX Trading
// Integrates with Jupiter Aggregator for best prices
// November 27, 2025 — Production Ready
// ═══════════════════════════════════════════════════════════════

import { Connection, PublicKey, VersionedTransaction, TransactionMessage, AddressLookupTableAccount } from '@solana/web3.js'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface SwapQuote {
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  otherAmountThreshold: string
  swapMode: 'ExactIn' | 'ExactOut'
  slippageBps: number
  priceImpactPct: number
  routePlan: RoutePlan[]
  contextSlot: number
  timeTaken: number
}

export interface RoutePlan {
  swapInfo: {
    ammKey: string
    label: string
    inputMint: string
    outputMint: string
    inAmount: string
    outAmount: string
    feeAmount: string
    feeMint: string
  }
  percent: number
}

export interface SwapResult {
  success: boolean
  signature?: string
  error?: string
  inputAmount: number
  outputAmount: number
  priceImpact: number
  route: string
  timestamp: number
}

export interface TokenInfo {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI?: string
  tags?: string[]
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const JUPITER_API = 'https://quote-api.jup.ag/v6'
const JUPITER_PRICE_API = 'https://price.jup.ag/v6'

// Common tokens
export const TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  WIF: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  PYTH: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
  JTO: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',
}

// ═══════════════════════════════════════════════════════════════
// JUPITER SWAP ENGINE CLASS
// ═══════════════════════════════════════════════════════════════

export class JupiterSwapEngine {
  private connection: Connection
  private walletPublicKey: PublicKey | null = null

  constructor(connection: Connection) {
    this.connection = connection
  }

  // Set wallet for signing
  setWallet(publicKey: PublicKey | null) {
    this.walletPublicKey = publicKey
  }

  // ─── GET QUOTE ───
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 50, // 0.5% default
    swapMode: 'ExactIn' | 'ExactOut' = 'ExactIn'
  ): Promise<SwapQuote | null> {
    try {
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps: slippageBps.toString(),
        swapMode,
        onlyDirectRoutes: 'false',
        asLegacyTransaction: 'false',
      })

      const response = await fetch(`${JUPITER_API}/quote?${params}`)
      
      if (!response.ok) {
        throw new Error(`Jupiter API error: ${response.status}`)
      }

      const quote = await response.json()
      
      console.log('[Jupiter] Quote received:', {
        in: `${amount} ${inputMint.slice(0, 8)}...`,
        out: `${quote.outAmount} ${outputMint.slice(0, 8)}...`,
        priceImpact: `${quote.priceImpactPct}%`,
        routes: quote.routePlan?.length || 0,
      })

      return quote
    } catch (error) {
      console.error('[Jupiter] Quote failed:', error)
      return null
    }
  }

  // ─── GET SWAP TRANSACTION ───
  async getSwapTransaction(
    quote: SwapQuote,
    userPublicKey: string,
    options?: {
      wrapUnwrapSOL?: boolean
      useSharedAccounts?: boolean
      feeAccount?: string
      computeUnitPriceMicroLamports?: number
      prioritizationFeeLamports?: number
      asLegacyTransaction?: boolean
      destinationTokenAccount?: string
    }
  ): Promise<VersionedTransaction | null> {
    try {
      const response = await fetch(`${JUPITER_API}/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey,
          wrapAndUnwrapSol: options?.wrapUnwrapSOL ?? true,
          useSharedAccounts: options?.useSharedAccounts ?? true,
          feeAccount: options?.feeAccount,
          computeUnitPriceMicroLamports: options?.computeUnitPriceMicroLamports ?? 'auto',
          prioritizationFeeLamports: options?.prioritizationFeeLamports ?? 'auto',
          asLegacyTransaction: options?.asLegacyTransaction ?? false,
          destinationTokenAccount: options?.destinationTokenAccount,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create swap transaction')
      }

      const { swapTransaction } = await response.json()
      
      // Deserialize the transaction
      const transactionBuffer = Buffer.from(swapTransaction, 'base64')
      const transaction = VersionedTransaction.deserialize(transactionBuffer)

      console.log('[Jupiter] Swap transaction created')
      return transaction
    } catch (error) {
      console.error('[Jupiter] Swap transaction failed:', error)
      return null
    }
  }

  // ─── EXECUTE SWAP ───
  async executeSwap(
    inputMint: string,
    outputMint: string,
    amount: number,
    signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>,
    options?: {
      slippageBps?: number
      maxRetries?: number
      priorityFee?: number
    }
  ): Promise<SwapResult> {
    const startTime = Date.now()
    const slippageBps = options?.slippageBps ?? 100 // 1% default for safety
    const maxRetries = options?.maxRetries ?? 3

    if (!this.walletPublicKey) {
      return {
        success: false,
        error: 'Wallet not connected',
        inputAmount: amount,
        outputAmount: 0,
        priceImpact: 0,
        route: '',
        timestamp: Date.now(),
      }
    }

    let lastError = ''

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[Jupiter] Swap attempt ${attempt}/${maxRetries}`)

        // 1. Get quote
        const quote = await this.getQuote(inputMint, outputMint, amount, slippageBps)
        if (!quote) {
          throw new Error('Failed to get quote')
        }

        // Check price impact
        if (quote.priceImpactPct > 5) {
          toast.warning('High Price Impact', {
            description: `This swap has ${quote.priceImpactPct.toFixed(2)}% price impact`,
          })
        }

        // 2. Get swap transaction
        const transaction = await this.getSwapTransaction(
          quote,
          this.walletPublicKey.toBase58(),
          {
            prioritizationFeeLamports: options?.priorityFee,
          }
        )

        if (!transaction) {
          throw new Error('Failed to create transaction')
        }

        // 3. Sign transaction (user signs with their wallet)
        const signedTx = await signTransaction(transaction)

        // 4. Send transaction
        const signature = await this.connection.sendTransaction(signedTx, {
          skipPreflight: false,
          maxRetries: 2,
        })

        console.log('[Jupiter] Transaction sent:', signature)

        // 5. Confirm transaction
        const confirmation = await this.connection.confirmTransaction(
          signature,
          'confirmed'
        )

        if (confirmation.value.err) {
          throw new Error('Transaction failed on-chain')
        }

        console.log('[Jupiter] Swap confirmed:', signature)

        // Build route description
        const routeDesc = quote.routePlan
          ?.map(r => r.swapInfo.label)
          .join(' → ') || 'Direct'

        return {
          success: true,
          signature,
          inputAmount: amount,
          outputAmount: parseInt(quote.outAmount),
          priceImpact: quote.priceImpactPct,
          route: routeDesc,
          timestamp: Date.now(),
        }
      } catch (error: any) {
        lastError = error.message || 'Unknown error'
        console.error(`[Jupiter] Attempt ${attempt} failed:`, error)

        // Wait before retry
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 1000 * attempt))
        }
      }
    }

    return {
      success: false,
      error: lastError,
      inputAmount: amount,
      outputAmount: 0,
      priceImpact: 0,
      route: '',
      timestamp: Date.now(),
    }
  }

  // ─── GET TOKEN PRICE ───
  async getTokenPrice(mint: string): Promise<number | null> {
    try {
      const response = await fetch(`${JUPITER_PRICE_API}/price?ids=${mint}`)
      const data = await response.json()
      return data.data?.[mint]?.price || null
    } catch (error) {
      console.error('[Jupiter] Price fetch failed:', error)
      return null
    }
  }

  // ─── GET MULTIPLE PRICES ───
  async getTokenPrices(mints: string[]): Promise<Record<string, number>> {
    try {
      const response = await fetch(`${JUPITER_PRICE_API}/price?ids=${mints.join(',')}`)
      const data = await response.json()
      
      const prices: Record<string, number> = {}
      for (const mint of mints) {
        prices[mint] = data.data?.[mint]?.price || 0
      }
      return prices
    } catch (error) {
      console.error('[Jupiter] Prices fetch failed:', error)
      return {}
    }
  }

  // ─── GET TOKEN INFO ───
  async getTokenInfo(mint: string): Promise<TokenInfo | null> {
    try {
      const response = await fetch(`https://token.jup.ag/strict`)
      const tokens: TokenInfo[] = await response.json()
      return tokens.find(t => t.address === mint) || null
    } catch (error) {
      console.error('[Jupiter] Token info failed:', error)
      return null
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════

let jupiterEngine: JupiterSwapEngine | null = null

export function getJupiterEngine(connection: Connection): JupiterSwapEngine {
  if (!jupiterEngine) {
    jupiterEngine = new JupiterSwapEngine(connection)
  }
  return jupiterEngine
}

export default JupiterSwapEngine

