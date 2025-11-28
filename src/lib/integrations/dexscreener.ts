// ═══════════════════════════════════════════════════════════════
// DEXSCREENER API INTEGRATION
// Trending tokens, volume alerts, and price data
// November 27, 2025 — Production Ready
// ═══════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface DexScreenerToken {
  chainId: string
  dexId: string
  url: string
  pairAddress: string
  baseToken: {
    address: string
    name: string
    symbol: string
  }
  quoteToken: {
    address: string
    name: string
    symbol: string
  }
  priceNative: string
  priceUsd: string
  txns: {
    m5: { buys: number; sells: number }
    h1: { buys: number; sells: number }
    h6: { buys: number; sells: number }
    h24: { buys: number; sells: number }
  }
  volume: {
    h24: number
    h6: number
    h1: number
    m5: number
  }
  priceChange: {
    m5: number
    h1: number
    h6: number
    h24: number
  }
  liquidity?: {
    usd: number
    base: number
    quote: number
  }
  fdv?: number
  marketCap?: number
}

export interface TrendingToken {
  symbol: string
  name: string
  address: string
  price: number
  priceChange24h: number
  volume24h: number
  liquidity: number
  txns24h: number
  url: string
}

export interface VolumeAlert {
  token: string
  symbol: string
  volumeIncrease: number
  currentVolume: number
  previousVolume: number
  timestamp: number
}

// ═══════════════════════════════════════════════════════════════
// API CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex'

// ═══════════════════════════════════════════════════════════════
// DEXSCREENER SERVICE
// ═══════════════════════════════════════════════════════════════

export class DexScreenerService {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map()
  private cacheTTL = 30000 // 30 seconds

  // ─── GET TOKEN INFO ───
  async getTokenInfo(tokenAddress: string): Promise<DexScreenerToken | null> {
    const cacheKey = `token-${tokenAddress}`
    const cached = this.getFromCache<DexScreenerToken>(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(`${DEXSCREENER_API}/tokens/${tokenAddress}`)
      if (!response.ok) throw new Error('Failed to fetch token')

      const data = await response.json()
      const pair = data.pairs?.[0]
      
      if (pair) {
        this.setCache(cacheKey, pair)
        return pair
      }
      return null
    } catch (error) {
      console.error('[DexScreener] Token fetch failed:', error)
      return null
    }
  }

  // ─── GET SOLANA TRENDING ───
  async getSolanaTrending(): Promise<TrendingToken[]> {
    const cacheKey = 'solana-trending'
    const cached = this.getFromCache<TrendingToken[]>(cacheKey)
    if (cached) return cached

    try {
      // Get top Solana pairs by volume
      const response = await fetch(`${DEXSCREENER_API}/search?q=solana`)
      if (!response.ok) throw new Error('Failed to fetch trending')

      const data = await response.json()
      const pairs = data.pairs?.filter((p: DexScreenerToken) => p.chainId === 'solana') || []
      
      // Sort by 24h volume
      const sorted = pairs
        .sort((a: DexScreenerToken, b: DexScreenerToken) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
        .slice(0, 20)

      const trending: TrendingToken[] = sorted.map((pair: DexScreenerToken) => ({
        symbol: pair.baseToken.symbol,
        name: pair.baseToken.name,
        address: pair.baseToken.address,
        price: parseFloat(pair.priceUsd || '0'),
        priceChange24h: pair.priceChange?.h24 || 0,
        volume24h: pair.volume?.h24 || 0,
        liquidity: pair.liquidity?.usd || 0,
        txns24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
        url: pair.url,
      }))

      this.setCache(cacheKey, trending)
      return trending
    } catch (error) {
      console.error('[DexScreener] Trending fetch failed:', error)
      return []
    }
  }

  // ─── GET NEW PAIRS ───
  async getNewPairs(minLiquidity: number = 10000): Promise<TrendingToken[]> {
    const cacheKey = `new-pairs-${minLiquidity}`
    const cached = this.getFromCache<TrendingToken[]>(cacheKey)
    if (cached) return cached

    try {
      const response = await fetch(`${DEXSCREENER_API}/pairs/solana`)
      if (!response.ok) throw new Error('Failed to fetch new pairs')

      const data = await response.json()
      
      // Filter by minimum liquidity
      const filtered = (data.pairs || [])
        .filter((p: DexScreenerToken) => (p.liquidity?.usd || 0) >= minLiquidity)
        .slice(0, 50)

      const pairs: TrendingToken[] = filtered.map((pair: DexScreenerToken) => ({
        symbol: pair.baseToken.symbol,
        name: pair.baseToken.name,
        address: pair.baseToken.address,
        price: parseFloat(pair.priceUsd || '0'),
        priceChange24h: pair.priceChange?.h24 || 0,
        volume24h: pair.volume?.h24 || 0,
        liquidity: pair.liquidity?.usd || 0,
        txns24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
        url: pair.url,
      }))

      this.setCache(cacheKey, pairs)
      return pairs
    } catch (error) {
      console.error('[DexScreener] New pairs fetch failed:', error)
      return []
    }
  }

  // ─── SEARCH TOKENS ───
  async searchTokens(query: string): Promise<TrendingToken[]> {
    try {
      const response = await fetch(`${DEXSCREENER_API}/search?q=${encodeURIComponent(query)}`)
      if (!response.ok) throw new Error('Search failed')

      const data = await response.json()
      const solanaPairs = (data.pairs || []).filter((p: DexScreenerToken) => p.chainId === 'solana')

      return solanaPairs.slice(0, 20).map((pair: DexScreenerToken) => ({
        symbol: pair.baseToken.symbol,
        name: pair.baseToken.name,
        address: pair.baseToken.address,
        price: parseFloat(pair.priceUsd || '0'),
        priceChange24h: pair.priceChange?.h24 || 0,
        volume24h: pair.volume?.h24 || 0,
        liquidity: pair.liquidity?.usd || 0,
        txns24h: (pair.txns?.h24?.buys || 0) + (pair.txns?.h24?.sells || 0),
        url: pair.url,
      }))
    } catch (error) {
      console.error('[DexScreener] Search failed:', error)
      return []
    }
  }

  // ─── GET PRICE ───
  async getPrice(tokenAddress: string): Promise<number | null> {
    const token = await this.getTokenInfo(tokenAddress)
    return token ? parseFloat(token.priceUsd) : null
  }

  // ─── MONITOR VOLUME SPIKES ───
  async checkVolumeSpike(
    tokenAddress: string, 
    thresholdPercent: number = 100
  ): Promise<VolumeAlert | null> {
    const token = await this.getTokenInfo(tokenAddress)
    if (!token) return null

    const h1Volume = token.volume?.h1 || 0
    const h6Volume = token.volume?.h6 || 0
    const avgHourlyVolume = h6Volume / 6

    if (avgHourlyVolume > 0) {
      const volumeIncrease = ((h1Volume - avgHourlyVolume) / avgHourlyVolume) * 100
      
      if (volumeIncrease >= thresholdPercent) {
        return {
          token: tokenAddress,
          symbol: token.baseToken.symbol,
          volumeIncrease,
          currentVolume: h1Volume,
          previousVolume: avgHourlyVolume,
          timestamp: Date.now(),
        }
      }
    }

    return null
  }

  // ─── CACHE HELPERS ───
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as T
    }
    return null
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  clearCache(): void {
    this.cache.clear()
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════

let dexScreenerService: DexScreenerService | null = null

export function getDexScreener(): DexScreenerService {
  if (!dexScreenerService) {
    dexScreenerService = new DexScreenerService()
  }
  return dexScreenerService
}

export default DexScreenerService

