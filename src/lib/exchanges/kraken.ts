// EXCHANGES: Binance + Kraken API integration complete — matches live app — November 19, 2025

import CryptoJS from 'crypto-js'

interface KrakenCredentials {
  apiKey: string
  privateKey: string
}

interface KrakenBalance {
  [key: string]: string
}

export class KrakenService {
  private static readonly BASE_URL = 'https://api.kraken.com'
  private static readonly ENCRYPTION_KEY = 'quantum-falcon-2025-secure-key'

  static encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, this.ENCRYPTION_KEY).toString()
  }

  static decrypt(ciphertext: string): string {
    const bytes = CryptoJS.AES.decrypt(ciphertext, this.ENCRYPTION_KEY)
    return bytes.toString(CryptoJS.enc.Utf8)
  }

  private static generateNonce(): number {
    return Date.now() * 1000
  }

  private static generateSignature(
    path: string,
    nonce: number,
    postData: string,
    privateKey: string
  ): string {
    const message = path + CryptoJS.SHA256(nonce + postData).toString()
    const secret = CryptoJS.enc.Base64.parse(privateKey)
    const signature = CryptoJS.HmacSHA512(message, secret)
    return CryptoJS.enc.Base64.stringify(signature)
  }

  static async testConnection(credentials: KrakenCredentials): Promise<{
    success: boolean
    error?: string
    latency?: number
    data?: any
  }> {
    const startTime = Date.now()

    try {
      const nonce = this.generateNonce()
      const path = '/0/private/Balance'
      const postData = `nonce=${nonce}`

      const signature = this.generateSignature(path, nonce, postData, credentials.privateKey)

      const response = await fetch(`${this.BASE_URL}${path}`, {
        method: 'POST',
        headers: {
          'API-Key': credentials.apiKey,
          'API-Sign': signature,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: postData,
      })

      const latency = Date.now() - startTime

      if (!response.ok) {
        console.error('[Kraken] Connection test failed:', response.statusText)
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          latency,
        }
      }

      const data = await response.json()

      if (data.error && data.error.length > 0) {
        console.error('[Kraken] API error:', data.error)
        return {
          success: false,
          error: data.error.join(', '),
          latency,
        }
      }

      console.info('[Kraken] Connection test successful')

      return {
        success: true,
        latency,
        data: {
          balanceCount: Object.keys(data.result || {}).length,
        },
      }
    } catch (error: any) {
      console.error('[Kraken] Test connection error:', error)
      return {
        success: false,
        error: error.message || 'Network error',
        latency: Date.now() - startTime,
      }
    }
  }

  static async getAccountBalances(credentials: KrakenCredentials): Promise<{
    success: boolean
    error?: string
    balances?: Array<{ asset: string; balance: string }>
  }> {
    try {
      const nonce = this.generateNonce()
      const path = '/0/private/Balance'
      const postData = `nonce=${nonce}`

      const signature = this.generateSignature(path, nonce, postData, credentials.privateKey)

      const response = await fetch(`${this.BASE_URL}${path}`, {
        method: 'POST',
        headers: {
          'API-Key': credentials.apiKey,
          'API-Sign': signature,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: postData,
      })

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data = await response.json()

      if (data.error && data.error.length > 0) {
        return {
          success: false,
          error: data.error.join(', '),
        }
      }

      const balances: Array<{ asset: string; balance: string }> = Object.entries(
        data.result as KrakenBalance
      )
        .filter(([_, balance]) => parseFloat(balance) > 0)
        .map(([asset, balance]) => ({
          asset: asset.replace(/^X|^Z/, ''),
          balance,
        }))

      console.info(`[Kraken] Fetched ${balances.length} balances`)

      return {
        success: true,
        balances,
      }
    } catch (error: any) {
      console.error('[Kraken] Get balances error:', error)
      return {
        success: false,
        error: error.message || 'Network error',
      }
    }
  }

  static async getTicker(pair = 'XXBTZUSD'): Promise<{
    success: boolean
    error?: string
    data?: any
  }> {
    try {
      const response = await fetch(`${this.BASE_URL}/0/public/Ticker?pair=${pair}`)

      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to fetch ticker',
        }
      }

      const data = await response.json()

      if (data.error && data.error.length > 0) {
        return {
          success: false,
          error: data.error.join(', '),
        }
      }

      const result = data.result[Object.keys(data.result)[0]]

      return {
        success: true,
        data: {
          pair,
          last: result.c[0],
          volume: result.v[1],
          high: result.h[1],
          low: result.l[1],
        },
      }
    } catch (error: any) {
      console.error('[Kraken] Get ticker error:', error)
      return {
        success: false,
        error: error.message || 'Network error',
      }
    }
  }

  static auditLog(action: string, details: any = {}) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      service: 'Kraken',
      action,
      details: {
        ...details,
        apiKey: details.apiKey ? `${details.apiKey.substring(0, 8)}...` : undefined,
      },
    }

    console.info('[Kraken Audit]', auditEntry)

    const existingLogs = JSON.parse(localStorage.getItem('kraken-audit-log') || '[]')
    existingLogs.push(auditEntry)

    if (existingLogs.length > 1000) {
      existingLogs.shift()
    }

    localStorage.setItem('kraken-audit-log', JSON.stringify(existingLogs))
  }
}
