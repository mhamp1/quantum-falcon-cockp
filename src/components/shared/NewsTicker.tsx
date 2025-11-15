import { useEffect, useState } from 'react'
import { Newspaper, TrendUp, Lightning, Info } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface NewsItem {
  id: string
  text: string
  type: 'market' | 'system' | 'alert'
  icon: React.ReactNode
}

export default function NewsTicker() {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const newsItems: NewsItem[] = [
    {
      id: '1',
      text: 'BTC breaks $45,000 resistance - Bulls regaining momentum',
      type: 'market',
      icon: <TrendUp size={14} weight="fill" className="text-primary" />
    },
    {
      id: '2',
      text: 'SOL network congestion resolved - Transaction speeds normalized',
      type: 'system',
      icon: <Info size={14} weight="fill" className="text-accent" />
    },
    {
      id: '3',
      text: 'High volatility detected across major pairs - Bot adjusted risk parameters',
      type: 'alert',
      icon: <Lightning size={14} weight="fill" className="text-secondary" />
    },
    {
      id: '4',
      text: 'ETH gas fees at 6-month low - Optimal time for DeFi interactions',
      type: 'market',
      icon: <TrendUp size={14} weight="fill" className="text-primary" />
    },
    {
      id: '5',
      text: 'New AI model deployed - Strategy optimization improved by 15%',
      type: 'system',
      icon: <Info size={14} weight="fill" className="text-accent" />
    },
    {
      id: '6',
      text: 'Trading volume surges 340% - Major institutional accumulation detected',
      type: 'market',
      icon: <TrendUp size={14} weight="fill" className="text-primary" />
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length)
    }, 8000)

    return () => clearInterval(interval)
  }, [newsItems.length])

  const currentNews = newsItems[currentIndex]

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
            />
          ))}
        </div>
      </div>
    </div>
  )
}
