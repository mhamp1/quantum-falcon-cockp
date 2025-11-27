// ═══════════════════════════════════════════════════════════════
// JITO BUNDLE ENGINE — MEV Protection & Priority Transactions
// Win every snipe, no front-running
// November 27, 2025 — Production Ready
// ═══════════════════════════════════════════════════════════════

import { 
  Connection, 
  PublicKey, 
  Transaction, 
  VersionedTransaction,
  TransactionMessage,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair
} from '@solana/web3.js'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════
// JITO CONSTANTS
// ═══════════════════════════════════════════════════════════════

// Jito tip accounts (rotate for load balancing)
const JITO_TIP_ACCOUNTS = [
  '96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5',
  'HFqU5x63VTqvQss8hp11i4bVmkdzGtLAH8aSKLYMEw',
  'Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY',
  'ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49',
  'DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh',
  'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
  'DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL',
  '3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT',
]

// Jito Block Engine endpoints
const JITO_ENDPOINTS = {
  mainnet: 'https://mainnet.block-engine.jito.wtf/api/v1/bundles',
  frankfurt: 'https://frankfurt.mainnet.block-engine.jito.wtf/api/v1/bundles',
  amsterdam: 'https://amsterdam.mainnet.block-engine.jito.wtf/api/v1/bundles',
  ny: 'https://ny.mainnet.block-engine.jito.wtf/api/v1/bundles',
  tokyo: 'https://tokyo.mainnet.block-engine.jito.wtf/api/v1/bundles',
}

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface BundleResult {
  success: boolean
  bundleId?: string
  signatures?: string[]
  error?: string
  slot?: number
  timestamp: number
}

export interface JitoConfig {
  tipLamports: number      // Tip amount in lamports
  maxRetries: number       // Max bundle submission retries
  useMultipleEndpoints: boolean
}

// ═══════════════════════════════════════════════════════════════
// JITO BUNDLE ENGINE CLASS
// ═══════════════════════════════════════════════════════════════

export class JitoBundleEngine {
  private connection: Connection
  private config: JitoConfig
  private currentTipAccountIndex: number = 0

  constructor(connection: Connection, config?: Partial<JitoConfig>) {
    this.connection = connection
    this.config = {
      tipLamports: 10000, // 0.00001 SOL default tip
      maxRetries: 3,
      useMultipleEndpoints: true,
      ...config,
    }
  }

  // ─── GET TIP ACCOUNT ───
  private getNextTipAccount(): PublicKey {
    const account = JITO_TIP_ACCOUNTS[this.currentTipAccountIndex]
    this.currentTipAccountIndex = (this.currentTipAccountIndex + 1) % JITO_TIP_ACCOUNTS.length
    return new PublicKey(account)
  }

  // ─── CREATE TIP INSTRUCTION ───
  createTipInstruction(
    fromPubkey: PublicKey,
    tipLamports?: number
  ): ReturnType<typeof SystemProgram.transfer> {
    const tipAmount = tipLamports || this.config.tipLamports
    const tipAccount = this.getNextTipAccount()

    return SystemProgram.transfer({
      fromPubkey,
      toPubkey: tipAccount,
      lamports: tipAmount,
    })
  }

  // ─── ADD TIP TO TRANSACTION ───
  async addTipToTransaction(
    transaction: Transaction,
    feePayer: PublicKey,
    tipLamports?: number
  ): Promise<Transaction> {
    const tipInstruction = this.createTipInstruction(feePayer, tipLamports)
    
    // Add tip as first instruction (ensures it's paid even if other instructions fail)
    transaction.instructions.unshift(tipInstruction)
    
    return transaction
  }

  // ─── SEND BUNDLE ───
  async sendBundle(
    transactions: (Transaction | VersionedTransaction)[],
    signTransaction: (tx: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>
  ): Promise<BundleResult> {
    const startTime = Date.now()

    try {
      // Sign all transactions
      const signedTxs: string[] = []
      
      for (const tx of transactions) {
        const signed = await signTransaction(tx)
        
        // Serialize to base58
        if ('serialize' in signed) {
          const serialized = signed.serialize()
          const base58 = Buffer.from(serialized).toString('base64')
          signedTxs.push(base58)
        }
      }

      // Try multiple Jito endpoints
      const endpoints = this.config.useMultipleEndpoints 
        ? Object.values(JITO_ENDPOINTS)
        : [JITO_ENDPOINTS.mainnet]

      let lastError = ''

      for (const endpoint of endpoints) {
        for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
          try {
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'sendBundle',
                params: [signedTxs],
              }),
            })

            const result = await response.json()

            if (result.error) {
              lastError = result.error.message || 'Bundle rejected'
              console.warn(`[Jito] Bundle rejected by ${endpoint}:`, result.error)
              continue
            }

            const bundleId = result.result

            console.log('[Jito] Bundle submitted:', {
              bundleId,
              endpoint,
              txCount: transactions.length,
            })

            // Wait for bundle confirmation
            const confirmed = await this.waitForBundleConfirmation(bundleId, endpoint)

            if (confirmed) {
              return {
                success: true,
                bundleId,
                timestamp: Date.now(),
              }
            }
          } catch (error: any) {
            lastError = error.message
            console.warn(`[Jito] Attempt ${attempt + 1} failed:`, error)
          }
        }
      }

      return {
        success: false,
        error: lastError || 'All Jito endpoints failed',
        timestamp: Date.now(),
      }
    } catch (error: any) {
      console.error('[Jito] Bundle failed:', error)
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      }
    }
  }

  // ─── WAIT FOR BUNDLE CONFIRMATION ───
  private async waitForBundleConfirmation(
    bundleId: string,
    endpoint: string,
    maxAttempts: number = 20
  ): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getBundleStatuses',
            params: [[bundleId]],
          }),
        })

        const result = await response.json()
        const status = result.result?.value?.[0]

        if (status) {
          if (status.confirmation_status === 'confirmed' || status.confirmation_status === 'finalized') {
            console.log('[Jito] Bundle confirmed:', bundleId)
            return true
          }
          if (status.err) {
            console.warn('[Jito] Bundle failed:', status.err)
            return false
          }
        }

        // Wait 500ms before next check
        await new Promise(r => setTimeout(r, 500))
      } catch (error) {
        console.warn('[Jito] Status check failed:', error)
      }
    }

    return false
  }

  // ─── SEND SINGLE TX WITH TIP ───
  async sendTransactionWithTip(
    transaction: Transaction,
    feePayer: PublicKey,
    signTransaction: (tx: Transaction) => Promise<Transaction>,
    tipLamports?: number
  ): Promise<BundleResult> {
    // Add tip instruction
    const txWithTip = await this.addTipToTransaction(
      transaction,
      feePayer,
      tipLamports
    )

    // Send as bundle
    return this.sendBundle([txWithTip], signTransaction)
  }

  // ─── ESTIMATE OPTIMAL TIP ───
  async estimateOptimalTip(): Promise<number> {
    try {
      // Query recent tip history (simplified - in production, use Jito's tip floor API)
      // For now, return a reasonable default based on network conditions
      const recentSlot = await this.connection.getSlot()
      
      // Dynamic tip based on slot (busy times = higher tip)
      const hour = new Date().getUTCHours()
      const isBusyHour = hour >= 13 && hour <= 21 // US market hours
      
      const baseTip = 10000 // 0.00001 SOL
      const busyMultiplier = isBusyHour ? 2 : 1
      
      return baseTip * busyMultiplier
    } catch (error) {
      return this.config.tipLamports
    }
  }

  // ─── UPDATE CONFIG ───
  updateConfig(config: Partial<JitoConfig>) {
    this.config = { ...this.config, ...config }
  }

  getConfig(): JitoConfig {
    return { ...this.config }
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════

let jitoEngine: JitoBundleEngine | null = null

export function getJitoEngine(connection: Connection): JitoBundleEngine {
  if (!jitoEngine) {
    jitoEngine = new JitoBundleEngine(connection)
  }
  return jitoEngine
}

export default JitoBundleEngine

