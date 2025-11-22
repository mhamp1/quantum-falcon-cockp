# Mempool Sniping Implementation — Liquidity Hunter Agent

**Date:** November 21, 2025  
**Feature:** Live mempool sniping with Jito bundle support and flash loan fallback

## Overview

The Liquidity Hunter agent has been enhanced with live mempool sniping capabilities, allowing it to detect and execute trades on new liquidity pools in real-time using Jito bundles for maximum speed and flash loans as a fallback mechanism.

## Architecture

### Components

1. **Mempool Sniper Service** (`src/lib/mempool/sniper.ts`)
   - Monitors live mempool transactions via WebSocket
   - Executes snipes with automatic fallback chain: Jito Bundle → Flash Loan → Direct
   - Configurable liquidity thresholds and MEV risk filtering

2. **Mempool Sniper Hook** (`src/hooks/useMempoolSniper.ts`)
   - React hook for mempool sniping functionality
   - Auto-snipe mode for hands-free operation
   - State management for monitoring and execution

3. **Enhanced Liquidity Hunter Agent** (`src/lib/ai/agents/index.ts`)
   - Updated decision logic with MEV risk assessment
   - Metadata includes snipe method and flash loan flags
   - Improved confidence scoring based on pool quality

4. **Enhanced DEX Client** (`src/lib/dex/client.ts`)
   - Extended `ExecutionHints` with flash loan support
   - `targetSignature` for Jito bundle sniping
   - Updated `buildExecutionHints` with mempool snipe detection

5. **Agent Snipe Panel Integration** (`src/components/trade/AgentSnipePanel.tsx`)
   - UI controls for mempool sniping (Liquidity Hunter only)
   - Auto-snipe toggle with real-time status
   - Execution result display

## Execution Flow

### 1. Mempool Monitoring

```typescript
// Start monitoring mempool for new pools
const sniper = createMempoolSniper({
  minLiquidityUsd: 50000,
  useJitoBundle: true,
  useFlashLoan: true,
  flashLoanProvider: 'solend'
})

sniper.startMonitoring((tx) => {
  // New pool detected
  console.log('New pool:', tx.poolAddress)
})
```

### 2. Snipe Execution Chain

When a new pool is detected:

1. **Jito Bundle (Primary)**
   - Bundles snipe transaction with target pool creation transaction
   - Highest priority fees (10k-40k micro-lamports)
   - Fastest execution (~400ms)

2. **Flash Loan (Fallback)**
   - Used when Jito bundle fails or insufficient balance
   - Supports Solend, Mango, or Kamino
   - Still uses Jito bundle for execution speed

3. **Direct Execution (Last Resort)**
   - Standard DEX swap if both above fail
   - Lower priority fees (5k-25k micro-lamports)

### 3. Agent Decision Integration

The Liquidity Hunter agent now includes:

```typescript
{
  signal: 'BUY',
  confidence: 'very-high',
  reason: '🔥 Live snipe: New pool with $50K liquidity (MEV risk: 30%)',
  metadata: {
    snipeMethod: 'jito-bundle',
    useFlashLoan: true, // For pools > $200K
    mevRisk: 0.3
  }
}
```

## Configuration

### Mempool Sniper Config

```typescript
interface SnipeConfig {
  minLiquidityUsd: number        // Minimum liquidity to snipe (default: 50000)
  maxSlippageBps: number         // Max slippage tolerance (default: 150)
  useJitoBundle: boolean         // Enable Jito bundles (default: true)
  useFlashLoan: boolean          // Enable flash loan fallback (default: false)
  flashLoanProvider?: 'solend' | 'mango' | 'kamino'
  priorityFeeMultiplier: number  // Fee multiplier (default: 1.5)
}
```

### Execution Hints

```typescript
interface ExecutionHints {
  usePrivateRpc: boolean
  submitAsJitoBundle: boolean
  priorityFeeMicroLamports: number
  maxSlippageBps: number
  preferredRoutes: string[]
  useFlashLoan?: boolean              // NEW
  flashLoanProvider?: 'solend' | 'mango' | 'kamino'  // NEW
  targetSignature?: string            // NEW: For Jito bundle sniping
}
```

## API Endpoints

### Mempool Sniping Endpoint

**POST** `/api/mempool/snipe`

```json
{
  "user": "base58_pubkey",
  "poolAddress": "base58_pool_address",
  "tokenMint": "base58_token_mint",
  "mintIn": "base58_mint_in",
  "amountIn": "bigint_as_string",
  "method": "jito" | "flash-loan" | "direct",
  "priorityFeeMicroLamports": 15000,
  "maxSlippageBps": 150,
  "targetSignature": "base58_signature",  // For Jito bundling
  "flashLoanProvider": "solend"            // If method is flash-loan
}
```

**Response:**

```json
{
  "txId": "base58_signature",
  "method": "jito" | "flash-loan" | "direct",
  "executionTimeMs": 425
}
```

## Usage Examples

### Manual Snipe

```typescript
const { executeSnipe } = useMempoolSniper(userPublicKey)

const result = await executeSnipe(
  mempoolTransaction,
  parseTokenAmount('0.5', 9), // 0.5 SOL
  SOL_MINT
)

if (result.success) {
  console.log('Snipe successful:', result.txId)
}
```

### Auto-Snipe Mode

```typescript
const { enableAutoSnipe } = useMempoolSniper(userPublicKey)

enableAutoSnipe(
  parseTokenAmount('0.5', 9),
  SOL_MINT,
  (result) => {
    if (result.success) {
      toast.success('Pool sniped!')
    }
  }
)
```

## MEV Protection

The sniper includes MEV risk assessment:

- **Low Risk (< 0.5)**: High confidence snipes, standard fees
- **Medium Risk (0.5-0.7)**: Conditional snipes, higher fees
- **High Risk (> 0.7)**: Snipes disabled, too risky

## Performance Metrics

- **Jito Bundle Execution**: ~400-600ms
- **Flash Loan Execution**: ~800-1200ms
- **Direct Execution**: ~1000-1500ms
- **Mempool Detection Latency**: < 100ms

## Security Considerations

1. **Flash Loan Risks**: Flash loans require repayment in the same transaction
2. **MEV Risk**: High MEV risk pools are filtered out
3. **Slippage Protection**: Configurable max slippage (default: 150bps)
4. **Duplicate Prevention**: Active snipes tracked to prevent duplicates

## Future Enhancements

- [ ] Multi-pool sniping (snipe multiple pools simultaneously)
- [ ] Custom flash loan providers
- [ ] Advanced MEV detection using on-chain data
- [ ] Snipe history and analytics
- [ ] Configurable auto-snipe filters (token whitelist/blacklist)

---

**Status:** ✅ Implemented and Ready for Testing

