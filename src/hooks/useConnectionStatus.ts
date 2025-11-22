// Connection Status Hook — Real-time Status Aggregation
// November 21, 2025 — Quantum Falcon Cockpit

import { useState, useEffect } from 'react'
import { useMarketFeed } from './useMarketFeed'
import { useWallet } from './useWallet'

export interface ConnectionStatus {
  wallet: {
    connected: boolean
    connecting: boolean
  }
  marketFeed: {
    connected: boolean
    error: string | null
  }
  overall: 'connected' | 'partial' | 'disconnected'
}

/**
 * Aggregates connection status from all services
 */
export function useConnectionStatus(): ConnectionStatus {
  const { connected: walletConnected, connecting: walletConnecting } = useWallet()
  const { isConnected: marketFeedConnected, error: marketFeedError } = useMarketFeed()

  const [status, setStatus] = useState<ConnectionStatus>({
    wallet: {
      connected: walletConnected,
      connecting: walletConnecting,
    },
    marketFeed: {
      connected: marketFeedConnected,
      error: marketFeedError,
    },
    overall: 'disconnected',
  })

  useEffect(() => {
    const walletOk = walletConnected
    const marketOk = marketFeedConnected

    let overall: 'connected' | 'partial' | 'disconnected'
    if (walletOk && marketOk) {
      overall = 'connected'
    } else if (walletOk || marketOk) {
      overall = 'partial'
    } else {
      overall = 'disconnected'
    }

    setStatus({
      wallet: {
        connected: walletConnected,
        connecting: walletConnecting,
      },
      marketFeed: {
        connected: marketFeedConnected,
        error: marketFeedError,
      },
      overall,
    })
  }, [walletConnected, walletConnecting, marketFeedConnected, marketFeedError])

  return status
}

