// Agent Input Adapter — Transforms WebSocket Market Data to AgentAnalysisInput
// November 21, 2025 — Quantum Falcon Cockpit

import type { AgentAnalysisInput } from './agents'
import type { MarketSnapshot } from '../market/solanaFeed'

/**
 * Converts WebSocket MarketSnapshot to normalized AgentAnalysisInput
 * This adapter ensures all agents receive consistent, typed data
 */
export function toAgentInput(snapshot: MarketSnapshot): AgentAnalysisInput {
  const { orderbook, whales, mempoolPools, sentiment, onchain, mev, volume, portfolio, dexEdge, now } = snapshot
  
  return {
    // Price & Market Data
    price: {
      current: orderbook.mid,
      bestBid: orderbook.bestBid,
      bestAsk: orderbook.bestAsk,
      mid: orderbook.mid,
      spreadBps: orderbook.spreadBps,
    },
    
    // Whale Activity
    whaleActivity: {
      recentBuys: whales.filter(w => w.type === 'buy').length,
      recentSells: whales.filter(w => w.type === 'sell').length,
      netFlow: whales
        .reduce((sum, w) => sum + (w.type === 'buy' ? w.amount : -w.amount), 0),
    },
    
    // Mempool & Liquidity
    mempool: {
      newPools: mempoolPools.length,
      totalLiquidityUsd: mempoolPools.reduce((sum, p) => sum + p.liqUsd, 0),
      topPoolLiqUsd: Math.max(...mempoolPools.map(p => p.liqUsd), 0),
    },
    
    // MEV Risk
    mev: {
      riskScore: mev.riskScore,
    },
    
    // Sentiment (Social + On-Chain)
    sentiment: {
      score: sentiment.score,
    },
    
    // On-Chain Metrics
    onchain: {
      holderGrowth24h: onchain.holderGrowth24h,
      volumeChange1h: onchain.volumeChange1h,
    },
    
    // Technical (Fractal/Fib patterns) - Optional, can be undefined
    fractal: undefined, // TODO: Add fractal pattern detection
    fib: undefined, // TODO: Add Fibonacci level calculation
    
    // Portfolio Risk
    portfolio: {
      drawdown: portfolio.drawdown,
    },
    
    // Volume Spikes
    volume: {
      spikeMultiple: volume.spikeMultiple,
    },
    
    // Time-based patterns
    time: {
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
    },
    
    // DEX Arbitrage Edge
    dexEdge: {
      arbEdgeBps: dexEdge.arbEdgeBps,
      spreadsBps: dexEdge.spreadsBps,
    },
    
    // Market volatility
    volatility: {
      volatility1h: orderbook.volatility1h,
      change1hPct: orderbook.change1hPct,
      drop5mPct: orderbook.drop5mPct || 0,
    },
  }
}

/**
 * Create mock/stub AgentAnalysisInput for testing
 */
export function createMockAgentInput(overrides?: Partial<AgentAnalysisInput>): AgentAnalysisInput {
  const now = new Date()
  
  const defaults: AgentAnalysisInput = {
    price: {
      current: 0.0025,
      bestBid: 0.00249,
      bestAsk: 0.00251,
      mid: 0.0025,
      spreadBps: 80,
    },
    whaleActivity: {
      recentBuys: 3,
      recentSells: 1,
      netFlow: 25000,
    },
    mempool: {
      newPools: 1,
      totalLiquidityUsd: 75000,
      topPoolLiqUsd: 50000,
    },
    mev: {
      riskScore: 0.35,
    },
    sentiment: {
      score: 0.72,
    },
    onchain: {
      holderGrowth24h: 15.3,
      volumeChange1h: 45.2,
    },
    portfolio: {
      drawdown: 3.5,
    },
    volume: {
      spikeMultiple: 2.8,
    },
    time: {
      hour: now.getHours(),
      dayOfWeek: now.getDay(),
    },
    dexEdge: {
      arbEdgeBps: 15,
      spreadsBps: 25,
    },
    volatility: {
      volatility1h: 6.5,
      change1hPct: 8.3,
      drop5mPct: 0.5,
    },
  }
  
  return {
    ...defaults,
    ...overrides,
  }
}
