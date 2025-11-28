// ═══════════════════════════════════════════════════════════════
// PRICE SERVICE
// Real-time price fetching with caching
// November 28, 2025 — Quantum Falcon Backend
// ═══════════════════════════════════════════════════════════════

import { logger } from './Logger.js'

const JUPITER_PRICE_API = 'https://price.jup.ag/v6'
const COINGECKO_API = 'https://api.coingecko.com/api/v3'

// Price cache (5 second TTL)
const priceCache: Map<string, { price: number; timestamp: number }> = new Map()
const CACHE_TTL = 5000 // 5 seconds

// Token address to CoinGecko ID mapping
const TOKEN_IDS: Record<string, string> = {
  'So11111111111111111111111111111111111111112': 'solana',
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'usd-coin',
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'tether',
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'bonk',
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm': 'dogwifcoin',
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 'jupiter-exchange-solana',
}

export class PriceService {
  private static isInitialized = false
  private static updateInterval: NodeJS.Timeout | null = null

  /**
   * Initialize the price service
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) return

    logger.info('[PriceService] Initializing...')

    // Pre-fetch common token prices
    await this.refreshCommonPrices()

    // Start background refresh
    this.updateInterval = setInterval(() => {
      this.refreshCommonPrices().catch(err => 
        logger.error('[PriceService] Background refresh failed:', err)
      )
    }, 30000) // Every 30 seconds

    this.isInitialized = true
    logger.info('[PriceService] Initialized')
  }

  /**
   * Shutdown the service
   */
  static shutdown(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
    priceCache.clear()
    this.isInitialized = false
  }

  /**
   * Get price for a token
   */
  static async getPrice(tokenMint: string): Promise<number | null> {
    // Check cache
    const cached = priceCache.get(tokenMint)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.price
    }

    try {
      // Try Jupiter Price API first
      const jupiterPrice = await this.fetchJupiterPrice(tokenMint)
      if (jupiterPrice !== null) {
        priceCache.set(tokenMint, { price: jupiterPrice, timestamp: Date.now() })
        return jupiterPrice
      }

      // Fallback to CoinGecko if we have a mapping
      const coingeckoId = TOKEN_IDS[tokenMint]
      if (coingeckoId) {
        const cgPrice = await this.fetchCoinGeckoPrice(coingeckoId)
        if (cgPrice !== null) {
          priceCache.set(tokenMint, { price: cgPrice, timestamp: Date.now() })
          return cgPrice
        }
      }

      return null
    } catch (error) {
      logger.error(`[PriceService] Failed to get price for ${tokenMint}:`, error)
      
      // Return stale cache if available
      if (cached) {
        return cached.price
      }
      return null
    }
  }

  /**
   * Get prices for multiple tokens
   */
  static async getPrices(tokenMints: string[]): Promise<Record<string, number>> {
    const prices: Record<string, number> = {}
    
    // Try batch fetch from Jupiter
    try {
      const response = await fetch(`${JUPITER_PRICE_API}/price?ids=${tokenMints.join(',')}`)
      const data = await response.json()
      
      for (const mint of tokenMints) {
        const price = data.data?.[mint]?.price
        if (price) {
          prices[mint] = price
          priceCache.set(mint, { price, timestamp: Date.now() })
        }
      }
    } catch (error) {
      logger.error('[PriceService] Batch fetch failed:', error)
    }

    // Fetch individually for any missing
    for (const mint of tokenMints) {
      if (!prices[mint]) {
        const price = await this.getPrice(mint)
        if (price) prices[mint] = price
      }
    }

    return prices
  }

  /**
   * Fetch price from Jupiter API
   */
  private static async fetchJupiterPrice(tokenMint: string): Promise<number | null> {
    try {
      const response = await fetch(`${JUPITER_PRICE_API}/price?ids=${tokenMint}`)
      const data = await response.json()
      return data.data?.[tokenMint]?.price || null
    } catch (error) {
      return null
    }
  }

  /**
   * Fetch price from CoinGecko API
   */
  private static async fetchCoinGeckoPrice(tokenId: string): Promise<number | null> {
    try {
      const response = await fetch(
        `${COINGECKO_API}/simple/price?ids=${tokenId}&vs_currencies=usd`
      )
      const data = await response.json()
      return data[tokenId]?.usd || null
    } catch (error) {
      return null
    }
  }

  /**
   * Refresh prices for common tokens
   */
  private static async refreshCommonPrices(): Promise<void> {
    const commonTokens = Object.keys(TOKEN_IDS)
    await this.getPrices(commonTokens)
  }

  /**
   * Clear cache for a specific token
   */
  static clearCache(tokenMint?: string): void {
    if (tokenMint) {
      priceCache.delete(tokenMint)
    } else {
      priceCache.clear()
    }
  }

  /**
   * Get cache stats
   */
  static getCacheStats(): { size: number; tokens: string[] } {
    return {
      size: priceCache.size,
      tokens: Array.from(priceCache.keys()),
    }
  }
}

