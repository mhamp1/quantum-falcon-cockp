# Elite AI Agents Implementation Guide

## Overview

This document describes the implementation of the **15 Elite AI Agents** system with tier-based gating, live market feed integration, DEX execution capabilities, and the Live Arena leaderboard for the Quantum Falcon trading cockpit.

## Architecture

### Core Components

```
src/
├── lib/
│   ├── ai/
│   │   ├── agents/
│   │   │   └── index.ts           # 15 Elite Agents + utility functions
│   │   └── agentInputAdapter.ts   # Market data → Agent input adapter
│   ├── market/
│   │   └── solanaFeed.ts          # Market snapshot types
│   ├── dex/
│   │   └── client.ts              # DEX execution client
│   └── arena/
│       ├── types.ts               # Arena/leaderboard types
│       └── client.ts              # Arena API client
├── hooks/
│   ├── useMarketFeed.ts           # WebSocket market feed hook
│   └── useDexExecution.ts         # DEX execution state hook
└── components/
    ├── ai/
    │   └── AgentCard.tsx          # Agent display card with tier locks
    ├── agents/
    │   └── EliteAgentsPage.tsx    # Main agents dashboard
    ├── arena/
    │   └── LiveArenaPage.tsx      # Live leaderboard with King of the Hill
    └── trade/
        └── AgentSnipePanel.tsx    # AI-powered trading execution panel
```

## The 15 Elite Agents

### Free Tier (1 agent)
1. **DCA Basic** - Dollar cost averaging strategy

### Pro Tier (7 agents)
2. **Whale Shadow** - Mirrors top 100 whale wallets
3. **Liquidity Hunter** - Snipes new pools instantly
4. **MEV Defender** - Anti-sandwich protection
5. **Risk Guardian** - Auto-stop loss on drawdown
6. **Flash Crash Hunter** - Buys the dip on crashes
7. **Momentum Tsunami** - Rides explosive pumps
8. **Mean Reversion Classic** - Buys oversold, sells overbought

### Elite Tier (7 agents)
9. **Sentiment Oracle** - Real-time X + Discord sentiment
10. **On-Chain Prophet** - Helius + Dune deep analytics
11. **Fractal Seer** - Elliott Wave + Fibonacci
12. **Grid Master** - Grid trading in ranges
13. **Arbitrage Phantom** - Cross-DEX arbitrage
14. **Time Warp Trader** - NY open / London close patterns
15. **Quantum Ensemble** - Meta-agent that votes across all others

## Agent Architecture

Each agent implements the `EliteAgentInstance` interface:

```typescript
interface EliteAgentInstance {
  name: string
  icon: Icon
  color: string
  description: string
  personality: 'aggressive' | 'defensive' | 'balanced' | 'opportunistic'
  tier: 'free' | 'pro' | 'elite' | 'lifetime'
  analyze: (data: AgentAnalysisInput) => Promise<AgentDecision>
}
```

### Agent Input Format

All agents receive normalized market data via `AgentAnalysisInput`:

```typescript
{
  price: { current, bestBid, bestAsk, mid, spreadBps },
  whaleActivity: { recentBuys, recentSells, netFlow },
  mempool: { newPools, totalLiquidityUsd, topPoolLiqUsd },
  mev: { riskScore },
  sentiment: { score },
  onchain: { holderGrowth24h, volumeChange1h },
  portfolio: { drawdown },
  volume: { spikeMultiple },
  time: { hour, dayOfWeek },
  dexEdge: { arbEdgeBps, spreadsBps },
  volatility: { volatility1h, change1hPct, drop5mPct }
}
```

### Agent Output Format

Agents return decisions via `AgentDecision`:

```typescript
{
  signal: 'BUY' | 'SELL' | 'HOLD',
  confidence: 'low' | 'medium' | 'high' | 'very-high',
  reason: string,
  metadata?: Record<string, unknown>
}
```

## Backend Integration Points

### 1. DEX Execution API

**Endpoint:** `POST /api/dex/execute`

**Request:**
```json
{
  "user": "string (base58 Solana pubkey)",
  "mintIn": "string (base58 token mint)",
  "mintOut": "string (base58 token mint)",
  "amountIn": "string (integer lamports/units as string)",
  "side": "buy | sell",
  "hints": {
    "usePrivateRpc": true,
    "submitAsJitoBundle": true,
    "priorityFeeMicroLamports": 5000,
    "maxSlippageBps": 100,
    "preferredRoutes": ["jupiter", "raydium", "phoenix"]
  }
}
```

**Response:**
```json
{
  "txId": "string (signature)",
  "route": "string (e.g., 'jupiter -> raydium')",
  "effectivePrice": 0.123456,
  "slippageBps": 42,
  "filledAmountOut": "string (integer units)",
  "timestamp": "2025-11-21T03:47:59.123Z"
}
```

### 2. Market Feed WebSocket

**URL:** Set via `VITE_MARKET_FEED_URL` environment variable

**Message Format:**
```json
{
  "orderbook": {
    "bestBid": 123.45,
    "bestAsk": 123.46,
    "mid": 123.455,
    "spreadBps": 8.2,
    "volatility1h": 5.1,
    "change1hPct": 12.3,
    "drop5mPct": 0.5
  },
  "whales": [
    { "type": "buy", "amount": 15000 }
  ],
  "mempoolPools": [
    { "address": "POOL_PUBKEY", "liqUsd": 80000 }
  ],
  "sentiment": { "score": 0.78 },
  "onchain": {
    "holderGrowth24h": 32.4,
    "volumeChange1h": 65.2
  },
  "mev": { "riskScore": 0.41 },
  "volume": { "spikeMultiple": 3.5 },
  "portfolio": { "drawdown": 4.2 },
  "dexEdge": {
    "arbEdgeBps": 18,
    "spreadsBps": 14
  }
}
```

### 3. Arena Leaderboard API

**Endpoint:** `GET /api/arena/leaderboard?timeframe=daily|weekly|monthly`

**Response:**
```json
{
  "timeframe": "daily",
  "updatedAt": "2025-11-21T03:47:59.123Z",
  "entries": [
    {
      "agentName": "Whale Shadow",
      "userId": "user_123",
      "username": "falcon_pilot",
      "pnlUsd": 5231.55,
      "pnlPct": 74.3,
      "winRatePct": 68.2,
      "trades": 121,
      "sharpe": 2.11,
      "streakDaysTop10": 4,
      "badges": ["Whale Slayer", "100% Win Week"],
      "timeframe": "daily"
    }
  ]
}
```

## Usage Examples

### Using an Agent

```typescript
import { ELITE_AGENTS } from '@/lib/ai/agents'
import { toAgentInput } from '@/lib/ai/agentInputAdapter'

// Get agent
const whaleShadow = ELITE_AGENTS.find(a => a.name === 'Whale Shadow')

// Convert market data to agent input
const agentInput = toAgentInput(marketSnapshot)

// Run analysis
const decision = await whaleShadow.analyze(agentInput)

console.log(decision)
// { signal: 'BUY', confidence: 'very-high', reason: 'Whales accumulating...', metadata: {...} }
```

### Checking Agent Access

```typescript
import { hasAgentAccess } from '@/lib/ai/agents'

const userTier = 'pro'
const agentTier = 'elite'

if (hasAgentAccess(agentTier, userTier)) {
  // User can access this agent
} else {
  // Show upgrade prompt
}
```

### Executing a Trade

```typescript
import { useDexExecution } from '@/hooks/useDexExecution'
import { buildExecutionHints } from '@/lib/dex/client'

const { execute, status, lastResult, error } = useDexExecution()

const hints = buildExecutionHints(
  marketSnapshot.mev.riskScore,
  marketSnapshot.dexEdge.arbEdgeBps
)

await execute({
  user: walletPublicKey,
  mintIn: SOL_MINT,
  mintOut: USDC_MINT,
  amountIn: parseTokenAmount('0.1', 9),
  side: 'buy',
  hints
})
```

## Tier Gating

The system supports 4 tiers:

| Tier     | Access                           |
|----------|----------------------------------|
| Free     | 1 agent (DCA Basic)              |
| Pro      | 8 agents (Free + Pro tier)       |
| Elite    | All 15 agents                    |
| Lifetime | All 15 agents + future updates   |

Tier checking is automatic in UI components. Locked agents show an overlay with an upgrade CTA.

## Development Mode

All components include mock data fallbacks for development:

- **Market Feed:** Generates random market data if WebSocket URL is not configured
- **DEX Execution:** Returns mock transaction results (no actual execution)
- **Arena:** Generates fake leaderboard data

To use real data, provide:
- `VITE_MARKET_FEED_URL` environment variable
- Backend API implementations

## Styling

All components follow the Quantum Falcon "cyber cockpit" aesthetic:

- **Colors:** Primary (cyan), Accent (green), Destructive (red/pink)
- **Typography:** Uppercase tracking, neon glow effects
- **Cards:** Cyber-card with borders and gradients
- **Animations:** Framer Motion for smooth transitions

## Security

- ✅ Zero CodeQL security alerts
- ✅ No sensitive data exposure
- ✅ Proper error handling
- ✅ Type-safe throughout
- ✅ MEV-aware execution hints

## Testing

The implementation includes:

- **Type Safety:** Full TypeScript coverage
- **Linting:** Zero ESLint warnings
- **Code Review:** All feedback addressed
- **Security Scan:** Passed CodeQL analysis

## Next Steps for Integration

1. Wire `EliteAgentsPage` into App.tsx as a new tab
2. Wire `LiveArenaPage` into App.tsx as a new tab
3. Add `AgentSnipePanel` to the trading view
4. Implement backend API endpoints
5. Configure `VITE_MARKET_FEED_URL`
6. Test with real wallet connections

## Support

For questions or issues, refer to:
- This implementation guide
- Inline code documentation
- Type definitions in each file
- Example usage in component files
