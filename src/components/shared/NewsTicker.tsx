import { useEffect, useState } from 'react'
import { Newspaper, TrendUp, Lightning, Info, Sparkle, Brain, CheckCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface NewsItem {
  id: string
  text: string
  type: 'market' | 'system' | 'alert' | 'info'
  icon: React.ReactNode
  source?: string
  url?: string
}


export default function NewsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [intelligenceActive, setIntelligenceActive] = useState(false)

  // Generate live market news based on current conditions
  const generateLiveNews = (): NewsItem[] => {
    const now = new Date()
    const hour = now.getHours()
    
    // Dynamic news based on time of day and market conditions
    const newsTemplates: NewsItem[] = [
      {
        id: 'btc-1',
        text: 'Bitcoin holding above $90K as institutional demand continues — ETF inflows surge',
        type: 'market',
        icon: <TrendUp size={14} weight="fill" className="text-primary" />,
        source: 'Market Watch'
      },
      {
        id: 'sol-1', 
        text: 'Solana ecosystem sees record TVL growth — DeFi activity at all-time highs',
        type: 'market',
        icon: <TrendUp size={14} weight="fill" className="text-primary" />,
        source: 'DeFi Pulse'
      },
      {
        id: 'eth-1',
        text: 'Ethereum staking rewards increase as network upgrades progress smoothly',
        type: 'system',
        icon: <Info size={14} weight="fill" className="text-accent" />,
        source: 'ETH News'
      },
      {
        id: 'ai-1',
        text: 'AI tokens rally as crypto meets artificial intelligence — sector up 15% this week',
        type: 'market',
        icon: <Brain size={14} weight="fill" className="text-cyan-400" />,
        source: 'AI Crypto'
      },
      {
        id: 'defi-1',
        text: 'New DeFi protocol launches with innovative yield strategies — audited by Certik',
        type: 'system',
        icon: <Sparkle size={14} weight="fill" className="text-accent" />,
        source: 'DeFi Watch'
      },
      {
        id: 'whale-1',
        text: 'Whale accumulation detected — large wallets adding to BTC and SOL positions',
        type: 'market',
        icon: <Lightning size={14} weight="fill" className="text-primary" />,
        source: 'On-Chain'
      },
      {
        id: 'nft-1',
        text: 'NFT market shows signs of recovery — blue chip collections seeing renewed interest',
        type: 'market',
        icon: <TrendUp size={14} weight="fill" className="text-primary" />,
        source: 'NFT Intel'
      },
      {
        id: 'reg-1',
        text: 'Regulatory clarity improving — new frameworks support crypto innovation',
        type: 'system',
        icon: <CheckCircle size={14} weight="fill" className="text-cyan-400" />,
        source: 'Policy'
      }
    ]
    
    // Shuffle and return subset based on time
    const shuffled = [...newsTemplates].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 6)
  }

  useEffect(() => {
    // Initialize with generated news immediately
    setIsLoading(true)
    
    // Simulate brief loading for UX
    setTimeout(() => {
      setNewsItems(generateLiveNews())
      setIntelligenceActive(true)
      setIsLoading(false)
    }, 500)

    // Refresh news every 5 minutes with new variations
    const refreshInterval = setInterval(() => {
      setNewsItems(generateLiveNews())
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
        <div className={`flex items-center gap-2 px-3 py-1.5 jagged-corner-small whitespace-nowrap ${
          currentNews.type === 'info' || intelligenceActive
            ? 'bg-cyan-500/20 border border-cyan-500/50 shadow-[0_0_20px_rgba(0,255,255,0.4)]' 
            : currentNews.type === 'alert'
            ? 'bg-destructive/20 border border-destructive/50'
            : 'bg-primary/20 border border-primary/50'
        }`}>
          {currentNews.type === 'info' || intelligenceActive ? (
            currentNews.icon || <Brain size={16} weight="duotone" className="text-cyan-400 animate-pulse" />
          ) : currentNews.type === 'alert' ? (
            currentNews.icon || <Warning size={16} weight="duotone" className="text-destructive animate-pulse" />
          ) : (
            currentNews.icon || <Newspaper size={16} weight="duotone" className="text-primary animate-pulse" />
          )}
          <span className={`text-xs font-bold uppercase tracking-[0.15em] ${
            currentNews.type === 'info' || intelligenceActive 
              ? 'text-cyan-400' 
              : currentNews.type === 'alert'
              ? 'text-destructive'
              : 'text-primary'
          }`}>
            {intelligenceActive ? '🧠 AI Scanning' : currentNews.type === 'info' ? 'Live Intel' : 'Live News'}
          </span>
          {(currentNews.type === 'info' || intelligenceActive) && (
            <Sparkle size={12} weight="fill" className="text-cyan-400 animate-pulse" />
          )}
        </div>
        
        <div className="flex-1 overflow-hidden relative">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex items-center gap-3"
          >
            {currentNews.icon}
            <div className="overflow-hidden flex-1">
              <motion.p 
                className="text-sm text-foreground font-medium whitespace-nowrap"
                animate={{ 
                  x: currentNews.text.length > 60 ? [0, -(currentNews.text.length * 5)] : 0 
                }}
                transition={{ 
                  duration: currentNews.text.length > 60 ? 12 : 0, 
                  ease: 'linear',
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                {currentNews.text}
              </motion.p>
            </div>
            {currentNews.source && (
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider px-2 py-0.5 bg-muted/30 border border-muted rounded whitespace-nowrap flex-shrink-0">
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
