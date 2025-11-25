import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendUp, TrendDown, ArrowsClockwise, BellRinging } from '@phosphor-icons/react'

interface PriceDatum {
  id: string
  name: string
  symbol: string
  price: number
  change: number
  color: string
}

interface ChannelAlert {
  id: string
  channelId: string
  label: string
  message: string
  severity: 'info' | 'warning' | 'critical'
}

const ASSETS: Array<Omit<PriceDatum, 'price' | 'change'>> = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', color: 'text-yellow-400' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', color: 'text-purple-400' },
  { id: 'solana', name: 'Solana', symbol: 'SOL', color: 'text-cyan-400' },
  { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', color: 'text-blue-400' },
  { id: 'matic-network', name: 'Polygon', symbol: 'MATIC', color: 'text-pink-400' },
  { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX', color: 'text-red-400' },
]

const CHANNEL_CONFIG = [
  { id: 'surge', label: 'Price Surge', direction: 'up' as const, threshold: 4, severity: 'warning' as const },
  { id: 'plunge', label: 'Price Plunge', direction: 'down' as const, threshold: 4, severity: 'warning' as const },
  { id: 'volatility', label: 'Volatility Shock', direction: 'both' as const, threshold: 8, severity: 'critical' as const },
]

export default function LivePriceTicker() {
  const [prices, setPrices] = useState<PriceDatum[]>([])
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [channelAlerts, setChannelAlerts] = useState<ChannelAlert[]>([])

  useEffect(() => {
    let isMounted = true

    const fetchPrices = async () => {
      try {
        setError(null)
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ASSETS.map(a => a.id).join(',')}&vs_currencies=usd&include_24hr_change=true`
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = await response.json()

        if (!isMounted) return

        const parsed: PriceDatum[] = ASSETS.map(asset => ({
          ...asset,
          price: data?.[asset.id]?.usd ?? 0,
          change: data?.[asset.id]?.usd_24h_change ?? 0,
        }))
        setPrices(parsed)
        setLastUpdated(Date.now())

        const alerts: ChannelAlert[] = parsed.flatMap(asset => generateChannelAlerts(asset))
        setChannelAlerts(alerts)
        hydrateAlertChannels(alerts)
      } catch (err) {
        console.error('[LivePriceTicker] Failed to fetch prices:', err)
        if (isMounted) {
          setError('Live market feed unavailable')
        }
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 30000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  if (!prices.length && !error) return null

  const topMover = prices.reduce<PriceDatum | null>((acc, asset) => {
    if (!acc) return asset
    return Math.abs(asset.change) > Math.abs(acc.change) ? asset : acc
  }, null)

  return (
    <div className="cyber-card relative overflow-hidden">
      <div className="absolute inset-0 diagonal-stripes opacity-5 pointer-events-none" />
      <div className="relative z-10 flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <ArrowsClockwise size={14} className="text-primary" />
            Live Market Pulse
          </div>
          {lastUpdated && (
            <span className="text-[10px] text-muted-foreground">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>

        {channelAlerts.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] bg-red-500/10 border border-red-500/30 px-3 py-2 rounded-lg">
            <BellRinging size={14} className="text-red-400 animate-pulse" />
            {channelAlerts.map(alert => (
              <span
                key={alert.id}
                className={`inline-flex items-center gap-2 px-2 py-1 rounded border ${
                  alert.severity === 'critical'
                    ? 'border-red-500 text-red-300'
                    : 'border-amber-400 text-amber-200'
                }`}
              >
                <span>{alert.label}</span>
                <span className="text-[10px] tracking-[0.25em]">{alert.message}</span>
              </span>
            ))}
          </div>
        )}

        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {prices.map(asset => (
              <motion.div
                key={asset.id}
                className="flex flex-col min-w-[120px]"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <span className={`text-[11px] uppercase tracking-[0.35em] ${asset.color}`}>
                  {asset.symbol}
                </span>
                <span className="text-lg font-bold text-foreground tabular-nums">
                  ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span
                  className={`text-xs font-semibold flex items-center gap-1 ${
                    asset.change >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {asset.change >= 0 ? <TrendUp size={12} weight="bold" /> : <TrendDown size={12} weight="bold" />}
                  {asset.change >= 0 ? '+' : ''}
                  {asset.change.toFixed(2)}%
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function generateChannelAlerts(asset: PriceDatum): ChannelAlert[] {
  return CHANNEL_CONFIG.flatMap(channel => {
    const magnitude = Math.abs(asset.change)
    const isPositive = asset.change >= 0

    const matches =
      channel.direction === 'both'
        ? magnitude >= channel.threshold
        : channel.direction === 'up'
        ? isPositive && magnitude >= channel.threshold
        : !isPositive && magnitude >= channel.threshold

    if (!matches) return []

    const directionLabel = asset.change >= 0 ? '↑' : '↓'
    const message = `${asset.symbol} ${directionLabel} ${asset.change >= 0 ? '+' : ''}${asset.change.toFixed(2)}%`

    return [
      {
        id: `${channel.id}-${asset.id}-${Math.round(asset.change * 10)}`,
        channelId: channel.id,
        label: channel.label,
        message,
        severity: channel.severity,
      },
    ]
  })
}

function hydrateAlertChannels(alerts: ChannelAlert[]) {
  if (typeof window === 'undefined') return

  const seenKeys = (hydrateAlertChannels as any)._keys as Set<string> | undefined
  if (!seenKeys) {
    ;(hydrateAlertChannels as any)._keys = new Set<string>()
  }
  const keySet = (hydrateAlertChannels as any)._keys as Set<string>

  alerts.forEach(alert => {
    if (keySet.has(alert.id)) return
    keySet.add(alert.id)

    window.dispatchEvent(new CustomEvent('ticker-alert', { detail: alert }))
    window.dispatchEvent(new CustomEvent(`ticker-alert:${alert.channelId}`, { detail: alert }))

    if (window.navigator?.vibrate) {
      window.navigator.vibrate(60)
    }

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(alert.label, { body: alert.message, silent: true })
      } catch {
        // ignore notification errors
      }
    }
  })

  // keep last 60 alerts to avoid unbounded memory
  if (keySet.size > 60) {
    const excess = keySet.size - 60
    const iterator = keySet.values()
    for (let i = 0; i < excess; i++) {
      const key = iterator.next().value
      keySet.delete(key)
    }
  }
}

