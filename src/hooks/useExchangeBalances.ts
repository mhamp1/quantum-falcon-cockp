// EXCHANGES: Binance + Kraken API integration complete — matches live app — November 19, 2025

import { useState, useEffect } from 'react'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { BinanceService } from '@/lib/exchanges/binance'
import { KrakenService } from '@/lib/exchanges/kraken'

interface APICredentials {
  [key: string]: {
    apiKey: string
    apiSecret: string
    enabled: boolean
  }
}

interface ExchangeBalance {
  exchange: 'binance' | 'kraken'
  asset: string
  balance: string
  usdValue?: number
}

export function useExchangeBalances(autoRefreshInterval = 30000) {
  const [credentials] = useKV<APICredentials>('api-credentials', {})
  const [balances, setBalances] = useState<ExchangeBalance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  const fetchBalances = async () => {
    if (!credentials) return

    setIsLoading(true)

    const newBalances: ExchangeBalance[] = []

    if (credentials.binance?.enabled && credentials.binance.apiKey && credentials.binance.apiSecret) {
      try {
        const decryptedApiKey = BinanceService.decrypt(credentials.binance.apiKey)
        const decryptedSecretKey = BinanceService.decrypt(credentials.binance.apiSecret)

        const result = await BinanceService.getAccountBalances({
          apiKey: decryptedApiKey,
          secretKey: decryptedSecretKey
        })

        if (result.success && result.balances) {
          result.balances.forEach(b => {
            newBalances.push({
              exchange: 'binance',
              asset: b.asset,
              balance: b.total
            })
          })
        }
      } catch (error) {
        // Silent error handling - don't expose API errors
      }
    }

    if (credentials.kraken?.enabled && credentials.kraken.apiKey && credentials.kraken.apiSecret) {
      try {
        const decryptedApiKey = KrakenService.decrypt(credentials.kraken.apiKey)
        const decryptedPrivateKey = KrakenService.decrypt(credentials.kraken.apiSecret)

        const result = await KrakenService.getAccountBalances({
          apiKey: decryptedApiKey,
          privateKey: decryptedPrivateKey
        })

        if (result.success && result.balances) {
          result.balances.forEach(b => {
            newBalances.push({
              exchange: 'kraken',
              asset: b.asset,
              balance: b.balance
            })
          })
        }
      } catch (error) {
        console.error('[useExchangeBalances] Error fetching Kraken balances:', error)
      }
    }

    setBalances(newBalances)
    setLastUpdated(Date.now())
    setIsLoading(false)
  }

  useEffect(() => {
    fetchBalances()

    const interval = setInterval(fetchBalances, autoRefreshInterval)

    return () => clearInterval(interval)
  }, [credentials, autoRefreshInterval])

  return {
    balances,
    isLoading,
    lastUpdated,
    refresh: fetchBalances
  }
}
