// Market Feed WebSocket Hook — Real-time Solana DEX Data
// November 21, 2025 — Quantum Falcon Cockpit
// ALL DATA MUST BE LIVE — NO MOCK DATA IN PRODUCTION

import { useState, useEffect, useRef } from 'react'
import type { MarketSnapshot, MarketFeedMessage } from '@/lib/market/solanaFeed'
import { createMockMarketSnapshot } from '@/lib/market/solanaFeed'
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
    
    // Production: Require WebSocket URL - NO MOCK DATA FALLBACK
    if (!url) {
      const errorMsg = '❌ Market Feed: No WebSocket URL configured. Set VITE_MARKET_FEED_URL environment variable. Live market data is required.'
      console.error(errorMsg)
      setError('Market feed URL not configured - Live data required')
      setIsConnected(false)
      toast?.error('Market Feed Error', {
        description: 'Please configure VITE_MARKET_FEED_URL in your environment variables for live market data.',
      })
      return
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
