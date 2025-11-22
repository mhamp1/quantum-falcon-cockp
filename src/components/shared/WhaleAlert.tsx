// Whale Alert System — Real-time Top 100 Wallet Tracking
// November 21, 2025 — Quantum Falcon Cockpit

import { useEffect } from 'react'
import { toast } from 'sonner'
import { FishSimple, TrendingUp, TrendingDown } from '@phosphor-icons/react'

interface WhaleTransaction {
  wallet: string
  type: 'buy' | 'sell'
  amount: number
  token: string
  timestamp: number
}

export function useWhaleAlerts() {
  useEffect(() => {
    // Connect to whale tracking WebSocket
    const wsUrl = import.meta.env.VITE_WHALE_TRACKING_WS_URL || 'wss://api.quantumfalcon.io/whales'
    
    let ws: WebSocket | null = null
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5

    function connect() {
      try {
        ws = new WebSocket(wsUrl)

        ws.onopen = () => {
          console.info('🐋 Whale tracking connected')
          reconnectAttempts = 0
        }

        ws.onmessage = (event) => {
          try {
            const data: WhaleTransaction = JSON.parse(event.data)
            handleWhaleAlert(data)
          } catch (error) {
            console.error('Failed to parse whale alert:', error)
          }
        }

        ws.onerror = (error) => {
          console.error('Whale tracking error:', error)
        }

        ws.onclose = () => {
          console.warn('Whale tracking disconnected')
          ws = null

          // Auto-reconnect
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++
            setTimeout(() => connect(), 3000 * reconnectAttempts)
          }
        }
      } catch (error) {
        console.error('Failed to connect whale tracking:', error)
      }
    }

    function handleWhaleAlert(tx: WhaleTransaction) {
      const amountFormatted = tx.amount >= 1000 
        ? `$${(tx.amount / 1000).toFixed(1)}k` 
        : `$${tx.amount.toFixed(0)}`

      const isBuy = tx.type === 'buy'
      const shortWallet = `${tx.wallet.slice(0, 4)}...${tx.wallet.slice(-4)}`

      toast.success(
        <div className="flex items-center gap-3">
          <FishSimple size={24} weight="duotone" className="text-primary" />
          <div>
            <div className="font-bold text-sm">
              🐋 Whale Alert
            </div>
            <div className="text-xs text-muted-foreground">
              {isBuy ? 'Bought' : 'Sold'} {amountFormatted} {tx.token}
            </div>
            <div className="text-xs text-muted-foreground font-mono">
              {shortWallet} • Tracking...
            </div>
          </div>
          {isBuy ? (
            <TrendingUp size={20} className="text-green-400" />
          ) : (
            <TrendingDown size={20} className="text-red-400" />
          )}
        </div>,
        {
          duration: 8000,
          className: 'border-primary/50 bg-background/95',
          action: {
            label: 'View',
            onClick: () => {
              // Navigate to whale tracking page
              window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'analytics' }))
            },
          },
        }
      )
    }

    // Start connection
    connect()

    return () => {
      if (ws) {
        ws.close()
      }
    }
  }, [])
}

// Component to initialize whale alerts
export default function WhaleAlert() {
  useWhaleAlerts()
  return null
}

