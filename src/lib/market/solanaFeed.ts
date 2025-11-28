// Solana Market Feed Types — WebSocket Data Structures (REAL DATA ONLY)
// November 28, 2025 — Quantum Falcon Cockpit
// ALL MOCK DATA REMOVED — Types only for real WebSocket integration

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
 * Create empty market snapshot for loading states
 * Returns zeroed values instead of random mock data
 */
export function createEmptyMarketSnapshot(): MarketSnapshot {
  return {
    orderbook: {
      bestBid: 0,
      bestAsk: 0,
      mid: 0,
      spreadBps: 0,
      volatility1h: 0,
      change1hPct: 0,
      drop5mPct: 0,
    },
    whales: [],
    mempoolPools: [],
    sentiment: {
      score: 0.5, // Neutral
    },
    onchain: {
      holderGrowth24h: 0,
      volumeChange1h: 0,
    },
    mev: {
      riskScore: 0,
    },
    volume: {
      spikeMultiple: 1,
    },
    portfolio: {
      drawdown: 0,
    },
    dexEdge: {
      arbEdgeBps: 0,
      spreadsBps: 0,
    },
    now: new Date(),
  }
}

/**
 * Parse WebSocket message to MarketSnapshot
 */
export function parseMarketFeedMessage(message: MarketFeedMessage): MarketSnapshot {
  return {
    ...message,
    now: new Date(),
  }
}
