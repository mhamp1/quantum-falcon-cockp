// Market Feed WebSocket Hook — Real-time Solana DEX Data
// November 21, 2025 — Quantum Falcon Cockpit
// ALL DATA MUST BE LIVE — NO MOCK DATA IN PRODUCTION
// Fallback to REST API polling if WebSocket URL not configured

import { useState, useEffect, useRef } from 'react'
import type { MarketSnapshot, MarketFeedMessage } from '@/lib/market/solanaFeed'
import { createMockMarketSnapshot } from '@/lib/market/solanaFeed'
import { fetchLiveMarketData } from '@/lib/market/liveMarketData'
import { toast } from 'sonner'

interface UseMarketFeedOptions {
  url?: string
  useMockData?: boolean
  mockUpdateInterval?: number
}

/**
 * Hook for subscribing to live market feed via WebSocket
 * Falls back to mock data in development
 */
export function useMarketFeed(options: UseMarketFeedOptions = {}) {
  const {
    url = import.meta.env.VITE_MARKET_FEED_URL || '',
    // Production: NEVER use mock data unless explicitly requested in development
    useMockData = options.useMockData ?? false,
    mockUpdateInterval = 5000,
  } = options

  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    // Production: Only use mock data if explicitly enabled
    if (useMockData) {
      console.warn('⚠️ Market Feed: Using mock data (production should use live WebSocket)')
      setIsConnected(false) // Mark as not connected when using mock data
      
      // Initial mock data
      setSnapshot(createMockMarketSnapshot())
      
      // Update mock data periodically with random variations
      const interval = setInterval(() => {
        const mock = createMockMarketSnapshot()
        
        // Add some random variation
        mock.orderbook.mid *= 0.98 + Math.random() * 0.04
        mock.orderbook.change1hPct = -10 + Math.random() * 30
        mock.sentiment.score = 0.3 + Math.random() * 0.6
        mock.onchain.volumeChange1h = -20 + Math.random() * 100
        
        setSnapshot(mock)
      }, mockUpdateInterval)
      
      return () => clearInterval(interval)
    }
    
    // Fallback to REST API polling if WebSocket URL not configured
    if (!url) {
      console.info('📊 Market Feed: WebSocket URL not configured, using REST API polling fallback')
      setIsConnected(false) // Not connected via WebSocket, but using REST API
      setError(null) // No error - we have a fallback
      
      // Poll REST API for live market data
      const pollMarketData = async () => {
        try {
          const liveData = await fetchLiveMarketData()
          
          // Convert LiveMarketData to MarketSnapshot format (matching solanaFeed.ts structure)
          const midPrice = liveData.btcPrice
          const spreadBps = 10 // 0.1% spread approximation
          const bestBid = midPrice * (1 - spreadBps / 10000)
          const bestAsk = midPrice * (1 + spreadBps / 10000)
          const change1hPct = ((liveData.btcPrice - liveData.btc200WeekMA) / liveData.btc200WeekMA) * 100
          
          const snapshot: MarketSnapshot = {
            orderbook: {
              bestBid,
              bestAsk,
              mid: midPrice,
              spreadBps,
              volatility1h: Math.abs(change1hPct),
              change1hPct,
              drop5mPct: change1hPct < 0 ? Math.abs(change1hPct) * 0.1 : 0,
            },
            whales: [], // Empty - would need whale tracking API
            mempoolPools: [], // Empty - would need mempool API
            sentiment: {
              score: liveData.fearGreedIndex / 100, // Convert 0-100 to 0-1
            },
            onchain: {
              holderGrowth24h: liveData.altcoinSeasonIndex / 10, // Approximation
              volumeChange1h: liveData.volumeChange14d,
            },
            mev: {
              riskScore: Math.max(0, Math.min(1, (liveData.avgFundingRate + 0.5) / 1)), // Normalize to 0-1
            },
            volume: {
              spikeMultiple: Math.max(1, liveData.volumeChange14d / 50), // Approximation
            },
            portfolio: {
              drawdown: Math.max(0, -change1hPct / 10), // Approximation
            },
            dexEdge: {
              arbEdgeBps: spreadBps / 2, // Half the spread as arb edge
              spreadsBps: spreadBps,
            },
            now: new Date(),
          }
          
          setSnapshot(snapshot)
          setError(null) // Clear any previous errors
        } catch (err) {
          console.error('❌ Market Feed: Failed to fetch live market data', err)
          setError('Failed to fetch market data')
        }
      }
      
      // Initial fetch
      pollMarketData()
      
      // Poll every 10 seconds (REST API fallback)
      const pollInterval = setInterval(pollMarketData, 10000)
      
      return () => clearInterval(pollInterval)
    }

    // Real WebSocket connection
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5
    const reconnectDelay = 3000

    function connect() {
      try {
        console.info(`📊 Market Feed: Connecting to ${url}`)
        const ws = new WebSocket(url)
        wsRef.current = ws

        ws.onopen = () => {
          console.info('✅ Market Feed: Connected')
          setIsConnected(true)
          setError(null)
          reconnectAttempts = 0
        }

        ws.onmessage = (event) => {
          try {
            const message: MarketFeedMessage = JSON.parse(event.data)
            
            // Inject current timestamp
            const snapshotWithTime: MarketSnapshot = {
              ...message,
              now: new Date(),
            }
            
            setSnapshot(snapshotWithTime)
          } catch (err) {
            console.error('❌ Market Feed: Failed to parse message', err)
            setError('Failed to parse market data')
          }
        }

        ws.onerror = (event) => {
          console.error('❌ Market Feed: WebSocket error', event)
          setError('WebSocket connection error')
        }

        ws.onclose = (event) => {
          console.warn('📊 Market Feed: Disconnected', event.code, event.reason)
          setIsConnected(false)
          wsRef.current = null

          // Attempt reconnection
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++
            console.info(`🔄 Market Feed: Reconnecting in ${reconnectDelay / 1000}s (attempt ${reconnectAttempts}/${maxReconnectAttempts})`)
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connect()
            }, reconnectDelay)
          } else {
            setError(`Failed to connect after ${maxReconnectAttempts} attempts`)
            console.error('❌ Market Feed: Max reconnection attempts reached')
          }
        }
      } catch (err) {
        console.error('❌ Market Feed: Failed to create WebSocket', err)
        setError('Failed to create WebSocket connection')
      }
    }

    connect()

    // Cleanup
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [url, useMockData, mockUpdateInterval])

  return {
    snapshot,
    isConnected,
    error,
  }
}
