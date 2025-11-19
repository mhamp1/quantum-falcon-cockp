import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, TrendUp, TrendDown } from '@phosphor-icons/react'

interface AISentiment {
  sentiment: number
  prediction: string
  confidence: number
  nextHourTrend: 'bullish' | 'bearish' | 'neutral'
}

// Mock AI sentiment fetcher - in production, this would call a real AI service
const fetchAISentiment = async (): Promise<AISentiment> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const sentiment = (Math.random() - 0.5) * 100
  const confidence = 60 + Math.random() * 35
  const nextHourTrend = sentiment > 10 ? 'bullish' : sentiment < -10 ? 'bearish' : 'neutral'
  
  return {
    sentiment,
    prediction: nextHourTrend === 'bullish' ? 'Bullish' : nextHourTrend === 'bearish' ? 'Bearish' : 'Neutral',
    confidence,
    nextHourTrend
  }
}

export function AIAdvisor() {
  const { data, isLoading, error } = useQuery<AISentiment>({
    queryKey: ['ai-sentiment'],
    queryFn: fetchAISentiment,
    refetchInterval: 5000,
    staleTime: 1000
  })

  if (isLoading) {
    return (
      <div className="cyber-card p-6 angled-corner-tl animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-primary/20 rounded" />
          <div className="h-6 w-40 bg-primary/20 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted/20 rounded" />
          <div className="h-4 w-3/4 bg-muted/20 rounded" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="cyber-card p-6 angled-corner-tl border-destructive/50">
        <div className="flex items-center gap-3 text-destructive">
          <Brain size={24} weight="fill" />
          <span className="text-sm font-bold uppercase">AI Neural Link Offline</span>
        </div>
      </div>
    )
  }

  const isBullish = data!.nextHourTrend === 'bullish'
  const isBearish = data!.nextHourTrend === 'bearish'
  const trendColor = isBullish ? 'text-primary' : isBearish ? 'text-destructive' : 'text-accent'
  const bgColor = isBullish ? 'bg-primary/5' : isBearish ? 'bg-destructive/5' : 'bg-accent/5'
  const borderColor = isBullish ? 'border-primary/30' : isBearish ? 'border-destructive/30' : 'border-accent/30'

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`cyber-card p-6 angled-corner-tl relative overflow-hidden neural-forecast-card ${borderColor}`}
    >
      <div className={`absolute inset-0 ${bgColor} opacity-50`} />
      <svg className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
        <circle cx="85%" cy="50%" r="60" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="5,5" className={`${trendColor} circuit-line`} />
      </svg>
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 jagged-corner-small border-2 relative ${borderColor}`}>
              <Brain size={24} weight="duotone" className={trendColor} />
              <div className={`absolute -top-1 -right-1 w-2 h-2 ${bgColor} rounded-full animate-pulse`} />
            </div>
            <div>
              <h3 className={`text-lg font-bold uppercase tracking-wider ${trendColor}`}>
                Neural Forecast
              </h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                AI-Powered Market Analysis
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 ${bgColor} border ${borderColor} cut-corner-br`}>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Sentiment</div>
            <div className="flex items-center gap-2">
              {isBullish ? (
                <TrendUp size={16} weight="bold" className={trendColor} />
              ) : isBearish ? (
                <TrendDown size={16} weight="bold" className={trendColor} />
              ) : (
                <div className="w-4 h-0.5 bg-current" />
              )}
              <span className={`text-lg font-bold ${trendColor}`}>
                {Math.abs(data!.sentiment).toFixed(1)}
              </span>
            </div>
          </div>

          <div className={`p-3 ${bgColor} border ${borderColor} cut-corner-br`}>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Confidence</div>
            <div className={`text-lg font-bold ${trendColor}`}>
              {data!.confidence.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className={`p-3 ${bgColor} border-l-2 ${borderColor}`}>
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Next Hour Prediction</div>
          <div className={`text-base font-bold uppercase tracking-wider ${trendColor}`}>
            {data!.prediction} • {data!.confidence.toFixed(0)}% Confidence
          </div>
        </div>

        <div aria-live="polite" className="sr-only">
          AI forecast updated: {data!.prediction} sentiment with {data!.confidence.toFixed(0)}% confidence
        </div>
      </div>
    </motion.div>
  )
}
