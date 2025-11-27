import { useEffect, useState, useRef } from 'react'
import { Newspaper, TrendUp, Lightning, Info, Sparkle, Brain, CheckCircle } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface NewsItem {
  id: string
  text: string
  type: 'market' | 'system' | 'alert' | 'info'
  icon: React.ReactNode
  source?: string
  url?: string
}

export default function NewsTicker() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [intelligenceActive, setIntelligenceActive] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Generate live market news
  const generateLiveNews = (): NewsItem[] => {
    const newsTemplates: NewsItem[] = [
      {
        id: 'btc-1',
        text: 'Bitcoin holding above $90K as institutional demand continues — ETF inflows surge',
        type: 'market',
        icon: <TrendUp size={14} weight="fill" className="text-primary flex-shrink-0" />,
        source: 'Market Watch'
      },
      {
        id: 'sol-1', 
        text: 'Solana ecosystem sees record TVL growth — DeFi activity at all-time highs',
        type: 'market',
        icon: <TrendUp size={14} weight="fill" className="text-primary flex-shrink-0" />,
        source: 'DeFi Pulse'
      },
      {
        id: 'eth-1',
        text: 'Ethereum staking rewards increase as network upgrades progress smoothly',
        type: 'system',
        icon: <Info size={14} weight="fill" className="text-accent flex-shrink-0" />,
        source: 'ETH News'
      },
      {
        id: 'ai-1',
        text: 'AI tokens rally as crypto meets artificial intelligence — sector up 15% this week',
        type: 'market',
        icon: <Brain size={14} weight="fill" className="text-cyan-400 flex-shrink-0" />,
        source: 'AI Crypto'
      },
      {
        id: 'defi-1',
        text: 'New DeFi protocol launches with innovative yield strategies — audited by Certik',
        type: 'system',
        icon: <Sparkle size={14} weight="fill" className="text-accent flex-shrink-0" />,
        source: 'DeFi Watch'
      },
      {
        id: 'whale-1',
        text: 'Whale accumulation detected — large wallets adding to BTC and SOL positions',
        type: 'market',
        icon: <Lightning size={14} weight="fill" className="text-primary flex-shrink-0" />,
        source: 'On-Chain'
      },
      {
        id: 'nft-1',
        text: 'NFT market shows signs of recovery — blue chip collections seeing renewed interest',
        type: 'market',
        icon: <TrendUp size={14} weight="fill" className="text-primary flex-shrink-0" />,
        source: 'NFT Intel'
      },
      {
        id: 'reg-1',
        text: 'Regulatory clarity improving — new frameworks support crypto innovation',
        type: 'system',
        icon: <CheckCircle size={14} weight="fill" className="text-cyan-400 flex-shrink-0" />,
        source: 'Policy'
      }
    ]
    
    return [...newsTemplates].sort(() => Math.random() - 0.5)
  }

  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      setNewsItems(generateLiveNews())
      setIntelligenceActive(true)
      setIsLoading(false)
    }, 500)

    // Refresh news every 5 minutes
    const refreshInterval = setInterval(() => {
      setNewsItems(generateLiveNews())
    }, 300000)

    return () => clearInterval(refreshInterval)
  }, [])

  if (isLoading && newsItems.length === 0) {
    return (
      <div className="cyber-card relative overflow-hidden h-40">
        <div className="absolute inset-0 diagonal-stripes opacity-5 pointer-events-none" />
        <div className="flex items-center justify-center h-full">
          <Newspaper size={24} weight="duotone" className="text-primary animate-pulse mr-2" />
          <span className="text-sm text-muted-foreground">Loading live news...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="cyber-card relative overflow-hidden">
      <div className="absolute inset-0 diagonal-stripes opacity-5 pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-primary/30 bg-primary/5">
        <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded shadow-[0_0_15px_rgba(0,255,255,0.3)]">
          <Brain size={14} weight="fill" className="text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            AI Scanning
          </span>
          <Sparkle size={10} weight="fill" className="text-cyan-400 animate-pulse" />
        </div>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Live Market Intelligence
        </span>
      </div>
      
      {/* Scrolling News Container */}
      <div 
        ref={scrollRef}
        className="h-32 overflow-hidden relative"
      >
        {/* Gradient fade at top */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-card to-transparent z-10 pointer-events-none" />
        
        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-card to-transparent z-10 pointer-events-none" />
        
        {/* Scrolling content */}
        <motion.div
          className="space-y-1 py-2"
          animate={{ 
            y: [0, -(newsItems.length * 36)]
          }}
          transition={{
            y: {
              duration: newsItems.length * 4,
              ease: 'linear',
              repeat: Infinity,
            }
          }}
        >
          {/* Duplicate items for seamless loop */}
          {[...newsItems, ...newsItems].map((item, idx) => (
            <motion.div
              key={`${item.id}-${idx}`}
              className="flex items-center gap-3 px-4 py-1.5 hover:bg-primary/5 transition-colors cursor-pointer group"
            >
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              <p className="text-sm text-foreground font-medium flex-1 group-hover:text-primary transition-colors">
                {item.text}
              </p>
              {item.source && (
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider px-2 py-0.5 bg-muted/30 border border-muted/50 rounded flex-shrink-0">
                  {item.source}
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Footer with stats */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-primary/30 bg-primary/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {newsItems.length} Stories • Live Feed
          </span>
        </div>
        <span className="text-[10px] text-cyan-400 uppercase tracking-wider">
          Updated just now
        </span>
      </div>
    </div>
  )
}
