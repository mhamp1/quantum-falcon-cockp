// CRITICAL FIX: Kraken + Binance API integration added — CEX trading now live — November 20, 2025

import CryptoJS from 'crypto-js'

interface BinanceCredentials {
  apiKey: string
  secretKey: string
}

interface BinanceAccountInfo {
  balances: Array<{
    asset: string
    free: string
    locked: string
  }>
}

export class BinanceService {
  private static readonly BASE_URL = 'https://api.binance.com'
  private static readonly ENCRYPTION_KEY = 'quantum-falcon-2025-secure-key'

  static encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.ENCRYPTION_KEY).toString()
  }

  static decrypt(ciphertext: string): string {
    const bytes = CryptoJS.AES.decrypt(ciphertext, this.ENCRYPTION_KEY)
    return bytes.toString(CryptoJS.enc.Utf8)
  }

  private static generateSignature(queryString: string, secretKey: string): string {
    return CryptoJS.HmacSHA256(queryString, secretKey).toString()
  }

  static async testConnection(credentials: BinanceCredentials): Promise<{
    success: boolean
    error?: string
    latency?: number
    data?: any
  }> {
    const startTime = Date.now()

    try {
      const timestamp = Date.now()
      const queryString = `timestamp=${timestamp}`
      const signature = this.generateSignature(queryString, credentials.secretKey)

      const response = await fetch(
        `${this.BASE_URL}/api/v3/account?${queryString}&signature=${signature}`,
        {
          headers: {
            'X-MBX-APIKEY': credentials.apiKey,
          },
        }
      )

      const latency = Date.now() - startTime

      if (!response.ok) {
        const error = await response.json()
        console.error('[Binance] Connection test failed:', error)
        return {
          success: false,
          error: error.msg || 'Connection failed',
          latency,
        }
      }

      const data = await response.json()
      console.info('[Binance] Connection test successful')

      return {
        success: true,
        latency,
        data: {
          accountType: data.accountType,
          canTrade: data.canTrade,
          canWithdraw: data.canWithdraw,
          canDeposit: data.canDeposit,
        },
      }
    } catch (error: any) {
      console.error('[Binance] Test connection error:', error)
      return {
        success: false,
        error: error.message || 'Network error',
        latency: Date.now() - startTime,
      }
    }
  }

  static async getAccountBalances(credentials: BinanceCredentials): Promise<{
    success: boolean
    error?: string
    balances?: Array<{ asset: string; free: string; locked: string; total: string }>
  }> {
    try {
      const timestamp = Date.now()
      const queryString = `timestamp=${timestamp}`
      const signature = this.generateSignature(queryString, credentials.secretKey)

      const response = await fetch(
        `${this.BASE_URL}/api/v3/account?${queryString}&signature=${signature}`,
        {
          headers: {
            'X-MBX-APIKEY': credentials.apiKey,
          },
        }
      )

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          error: error.msg || 'Failed to fetch balances',
        }
      }

      const data: BinanceAccountInfo = await response.json()

      const balances = data.balances
        .filter((b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
        .map((b) => ({
          asset: b.asset,
          free: b.free,
          locked: b.locked,
          total: (parseFloat(b.free) + parseFloat(b.locked)).toString(),
        }))

      console.info(`[Binance] Fetched ${balances.length} balances`)

      return {
        success: true,
        balances,
      }
    } catch (error: any) {
      console.error('[Binance] Get balances error:', error)
      return {
        success: false,
        error: error.message || 'Network error',
      }
    }
  }

  static async getTicker24h(symbol = 'BTCUSDT'): Promise<{
    success: boolean
    error?: string
    data?: any
  }> {
    try {
      const response = await fetch(`${this.BASE_URL}/api/v3/ticker/24hr?symbol=${symbol}`)

      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to fetch ticker',
        }
      }

      const data = await response.json()

      return {
        success: true,
        data: {
          symbol: data.symbol,
          priceChange: data.priceChange,
          priceChangePercent: data.priceChangePercent,
          lastPrice: data.lastPrice,
          volume: data.volume,
          quoteVolume: data.quoteVolume,
        },
      }
    } catch (error: any) {
      console.error('[Binance] Get ticker error:', error)
      return {
        success: false,
        error: error.message || 'Network error',
      }
    }
  }

  static auditLog(action: string, details: any = {}) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      service: 'Binance',
      action,
      details: {
        ...details,
        apiKey: details.apiKey ? `${details.apiKey.substring(0, 8)}...` : undefined,
      },
    }

    console.info('[Binance Audit]', auditEntry)

    const existingLogs = JSON.parse(localStorage.getItem('binance-audit-log') || '[]')
    existingLogs.push(auditEntry)

    if (existingLogs.length > 1000) {
      existingLogs.shift()
    }

    localStorage.setItem('binance-audit-log', JSON.stringify(existingLogs))
  }
}
