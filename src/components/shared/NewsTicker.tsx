import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendUp, TrendDown, Lightning, Info, Warning } from '@phosphor-icons/react'

interface NewsItem {
  id: string
  type: 'market' | 'alert' | 'info' | 'warning'
  text: string
  icon: React.ReactNode
}

const newsItems: NewsItem[] = [
  {
    id: '1',
    type: 'market',
    text: 'SOL/USDT +12.4% // Institutional buy detected',
    icon: <TrendUp size={14} weight="fill" />
  },
  {
    id: '2',
    type: 'alert',
    text: 'BTC breaking resistance at $45,000 // Volume surge 340%',
    icon: <Lightning size={14} weight="fill" />
  },
  {
    id: '3',
    type: 'info',
    text: 'Market sentiment: EXTREMELY BULLISH // 87% positive ratio',
    icon: <Info size={14} weight="fill" />
  },
  {
    id: '4',
    type: 'market',
    text: 'ETH whale movements detected // $2.3B volume spike',
    icon: <TrendUp size={14} weight="fill" />
  },
  {
    id: '5',
    type: 'warning',
    text: 'High volatility alert // Bot adjusting position sizes',
    icon: <Warning size={14} weight="fill" />
  },
  {
    id: '6',
    type: 'info',
    text: 'RL Optimizer completed 1,000 training cycles // Accuracy: 94.2%',
    icon: <Info size={14} weight="fill" />
  },
  {
    id: '7',
    type: 'market',
    text: 'DeFi TVL increased 18% this week // New opportunities detected',
    icon: <TrendUp size={14} weight="fill" />
  }
]

export default function NewsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentNews = newsItems[currentIndex]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'market':
        return 'text-secondary'
      case 'alert':
        return 'text-accent'
      case 'warning':
        return 'text-destructive'
      default:
        return 'text-primary'
    }
  }

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'market':
        return 'bg-secondary/20 border-secondary'
      case 'alert':
        return 'bg-accent/20 border-accent'
      case 'warning':
        return 'bg-destructive/20 border-destructive'
      default:
        return 'bg-primary/20 border-primary'
    }
  }

  return (
    <div className="w-full bg-gradient-to-r from-card/95 via-card/90 to-card/95 backdrop-blur-md border-y-2 border-primary/40 relative overflow-hidden group hover:border-primary/60 transition-all">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 opacity-50" />
      <div className="absolute inset-0 technical-grid opacity-5" />
      
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--primary)" strokeWidth="1" strokeDasharray="5,5" className="circuit-line" />
      </svg>

      <div className="container mx-auto px-4 py-3 flex items-center gap-3 relative z-10">
        <div className={`flex items-center gap-2 px-3 py-1.5 jagged-corner-small border-2 ${getTypeBg(currentNews.type)} flex-shrink-0 relative overflow-hidden group/badge`}>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-current/10 to-transparent opacity-0 group-hover/badge:opacity-100 transition-opacity" />
          <div className={`${getTypeColor(currentNews.type)} relative z-10 flex items-center gap-1`}>
            {currentNews.icon}
          </div>
          <span className={`text-xs font-bold uppercase tracking-[0.15em] ${getTypeColor(currentNews.type)} relative z-10`}>
            LIVE
          </span>
        </div>

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentNews.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentNews.type === 'market' ? 'var(--secondary)' : currentNews.type === 'alert' ? 'var(--accent)' : currentNews.type === 'warning' ? 'var(--destructive)' : 'var(--primary)' }} />
              <span className="text-sm font-semibold uppercase tracking-wide text-foreground hud-text whitespace-nowrap">
                {currentNews.text}
              </span>
            </motion.div>
          </AnimatePresence>
          
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-card via-card/80 to-transparent pointer-events-none" />
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {newsItems.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                index === currentIndex ? 'bg-primary w-4' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
    </div>
  )
}
