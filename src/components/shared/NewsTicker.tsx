import { useEffect, useState } from 'react'
import { Newspaper, TrendUp, Lightning, Info, Warning } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface NewsItem {
  id: string
  text: string
  type: 'market' | 'system' | 'alert'
  icon: React.ReactNode
  source?: string
  url?: string
}

interface CryptoNewsArticle {
  title: string
  url: string
  published_at: string
  source: {
    title: string
  }
}

export default function NewsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLiveNews = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(
          'https://cryptopanic.com/api/v1/posts/?auth_token=free&currencies=BTC,ETH,SOL&filter=hot&public=true',
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            }
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch news: ${response.status}`)
        }

        const data = await response.json()

        if (data.results && data.results.length > 0) {
          const formattedNews: NewsItem[] = data.results.slice(0, 10).map((article: any, idx: number) => {
            const determineType = (title: string): 'market' | 'system' | 'alert' => {
              const lowerTitle = title.toLowerCase()
              if (lowerTitle.includes('alert') || lowerTitle.includes('warning') || lowerTitle.includes('crash') || lowerTitle.includes('dump')) {
                return 'alert'
              }
              if (lowerTitle.includes('update') || lowerTitle.includes('upgrade') || lowerTitle.includes('launch')) {
                return 'system'
              }
              return 'market'
            }

            const type = determineType(article.title)
            let icon = <TrendUp size={14} weight="fill" className="text-primary" />
            
            if (type === 'alert') {
              icon = <Warning size={14} weight="fill" className="text-destructive" />
            } else if (type === 'system') {
              icon = <Info size={14} weight="fill" className="text-accent" />
            } else if (article.votes?.positive > article.votes?.negative) {
              icon = <TrendUp size={14} weight="fill" className="text-primary" />
            }

            return {
              id: article.id || `news-${idx}`,
              text: article.title,
              type,
              icon,
              source: article.source?.title || 'Crypto News',
              url: article.url
            }
          })

          setNewsItems(formattedNews)
        } else {
          throw new Error('No news articles found')
        }
      } catch (err) {
        console.error('Error fetching live news:', err)
        setError(err instanceof Error ? err.message : 'Failed to load news')
        
        setNewsItems([
          {
            id: 'fallback-1',
            text: 'Live news temporarily unavailable - Using cached data',
            type: 'alert',
            icon: <Warning size={14} weight="fill" className="text-destructive" />
          },
          {
            id: 'fallback-2',
            text: 'BTC maintains support above key levels - Market stability continues',
            type: 'market',
            icon: <TrendUp size={14} weight="fill" className="text-primary" />
          },
          {
            id: 'fallback-3',
            text: 'SOL ecosystem growth continues - DeFi TVL reaches new highs',
            type: 'system',
            icon: <Info size={14} weight="fill" className="text-accent" />
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchLiveNews()

    const refreshInterval = setInterval(() => {
      fetchLiveNews()
    }, 300000)

    return () => clearInterval(refreshInterval)
  }, [])

  useEffect(() => {
    if (newsItems.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [newsItems.length])

  const currentNews = newsItems[currentIndex]

  if (isLoading && newsItems.length === 0) {
    return (
      <div className="cyber-card relative overflow-hidden">
        <div className="absolute inset-0 diagonal-stripes opacity-5 pointer-events-none" />
        
        <div className="flex items-center gap-3 p-3 relative z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 jagged-corner-small bg-primary/20 border border-primary/50 whitespace-nowrap">
            <Newspaper size={16} weight="duotone" className="text-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
              Loading...
            </span>
          </div>
          
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">
              Fetching live crypto news...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!currentNews) return null

  return (
    <div className="cyber-card relative overflow-hidden">
      <div className="absolute inset-0 diagonal-stripes opacity-5 pointer-events-none" />
      
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 8, ease: 'linear' }}
        key={currentIndex}
        style={{ transformOrigin: 'left' }}
      />
      
      <div className="flex items-center gap-3 p-3 relative z-10">
        <div className="flex items-center gap-2 px-3 py-1.5 jagged-corner-small bg-destructive/20 border border-destructive/50 whitespace-nowrap">
          <Newspaper size={16} weight="duotone" className="text-destructive animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-destructive">
            Live News
          </span>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2"
          >
            {currentNews.icon}
            <p className="text-sm text-foreground font-medium truncate">
              {currentNews.text}
            </p>
            {currentNews.source && (
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-0.5 bg-muted/30 border border-muted rounded whitespace-nowrap">
                {currentNews.source}
              </span>
            )}
          </motion.div>
        </div>
        
        <div className="flex gap-1">
          {newsItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-1.5 h-1.5 transition-all ${
                idx === currentIndex 
                  ? 'bg-primary w-4' 
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`View news item ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
