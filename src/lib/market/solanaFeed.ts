// Solana Market Feed Types — WebSocket Data Structures
// November 21, 2025 — Quantum Falcon Cockpit

/**
 * Orderbook snapshot from WebSocket
 */
export interface OrderbookSnapshot {
  bestBid: number
  bestAsk: number
  mid: number
  spreadBps: number
  volatility1h: number
  change1hPct: number
  drop5mPct?: number
}

/**
 * Whale transaction activity
 */
export interface WhaleActivity {
  type: 'buy' | 'sell'
  amount: number
}

/**
 * Mempool pool detection
 */
export interface MempoolPool {
  address: string
  liqUsd: number
}

/**
 * Sentiment score from social/on-chain
 */
export interface SentimentScore {
  score: number // 0-1
}

/**
 * On-chain metrics
 */
export interface OnchainMetrics {
  holderGrowth24h: number // percentage
  volumeChange1h: number // percentage
}

/**
 * MEV risk assessment
 */
export interface MEVRisk {
  riskScore: number // 0-1
}

/**
 * Volume spike detection
 */
export interface VolumeMetrics {
  spikeMultiple: number // e.g., 3.5x normal
}

/**
 * Portfolio drawdown
 */
export interface PortfolioMetrics {
  drawdown: number // percentage
}

/**
 * DEX arbitrage edge
 */
export interface DEXEdgeMetrics {
  arbEdgeBps: number
  spreadsBps: number
}

/**
 * Complete market snapshot from WebSocket feed
 * Conforms to the backend contract defined in requirements
 */
export interface MarketSnapshot {
  orderbook: OrderbookSnapshot
  whales: WhaleActivity[]
  mempoolPools: MempoolPool[]
  sentiment: SentimentScore
  onchain: OnchainMetrics
  mev: MEVRisk
  volume: VolumeMetrics
  portfolio: PortfolioMetrics
  dexEdge: DEXEdgeMetrics
  now: Date // Injected by frontend
}

/**
 * WebSocket message type
 */
export interface MarketFeedMessage {
  orderbook: OrderbookSnapshot
  whales: WhaleActivity[]
  mempoolPools: MempoolPool[]
  sentiment: SentimentScore
  onchain: OnchainMetrics
  mev: MEVRisk
  volume: VolumeMetrics
  portfolio: PortfolioMetrics
  dexEdge: DEXEdgeMetrics
}

/**
 * Create mock market snapshot for testing
 */
export function createMockMarketSnapshot(): MarketSnapshot {
  return {
    orderbook: {
      bestBid: 123.45,
      bestAsk: 123.46,
      mid: 123.455,
      spreadBps: 8.2,
      volatility1h: 5.1,
      change1hPct: 12.3,
      drop5mPct: 0.5,
    },
    whales: [
      { type: 'buy', amount: 15000 },
      { type: 'buy', amount: 12000 },
      { type: 'sell', amount: 8000 },
    ],
    mempoolPools: [
      { address: 'POOL_PUBKEY_1', liqUsd: 80000 },
      { address: 'POOL_PUBKEY_2', liqUsd: 25000 },
    ],
    sentiment: {
      score: 0.78,
    },
    onchain: {
      holderGrowth24h: 32.4,
      volumeChange1h: 65.2,
    },
    mev: {
      riskScore: 0.41,
    },
    volume: {
      spikeMultiple: 3.5,
    },
    portfolio: {
      drawdown: 4.2,
    },
    dexEdge: {
      arbEdgeBps: 18,
      spreadsBps: 14,
    },
    now: new Date(),
  }
}
