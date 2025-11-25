// News Opportunities Display — Shows Bot's News Intelligence
// November 22, 2025 — Quantum Falcon Cockpit
// Displays news opportunities the bot has detected

import { useEffect, useState } from 'react'
import { Newspaper, TrendUp as TrendingUp, TrendDown as TrendingDown, WarningCircle as AlertCircle, Lightning } from '@phosphor-icons/react'
import { useNewsIntelligence } from '@/lib/intelligence/NewsIntelligenceEngine'
import { motion, AnimatePresence } from 'framer-motion'

interface NewsOpportunitiesDisplayProps {
  userTier?: string
}

export default function NewsOpportunitiesDisplay({ userTier = 'free' }: NewsOpportunitiesDisplayProps) {
  const { opportunities, analyzeNews } = useNewsIntelligence(userTier)
  const [recentNews, setRecentNews] = useState<any[]>([])

  // Fetch and analyze news continuously
  useEffect(() => {
    const fetchAndAnalyze = async () => {
      try {
        const response = await fetch(
          'https://cryptopanic.com/api/v1/posts/?auth_token=free&currencies=BTC,ETH,SOL&filter=hot&public=true',
          {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          }
        )

        if (!response.ok) return

        const data = await response.json()
        if (data.results && data.results.length > 0) {
          setRecentNews(data.results.slice(0, 10))
          // Analyze news for opportunities
          analyzeNews(data.results.slice(0, 10))
        }
      } catch (error) {
        console.error('[News Intelligence] Failed to fetch news:', error)
      }
    }

    // Initial fetch
    fetchAndAnalyze()

    // Update every 5 minutes
    const interval = setInterval(fetchAndAnalyze, 300000)

    return () => clearInterval(interval)
  }, [analyzeNews])

  // Get high-confidence opportunities
  const highConfidenceOpportunities = opportunities
    .filter(o => o.confidence > 0.6)
    .slice(0, 5)

  if (highConfidenceOpportunities.length === 0) {
    return null
  }

  return (
    <div className="cyber-card p-6 border-2 border-cyan-500/50 relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-5" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 blur-3xl rounded-full" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-cyan-500/20 border border-cyan-500/40 rounded-lg">
            <Newspaper size={24} weight="duotone" className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-wider text-cyan-400">
              News Intelligence
            </h3>
            <p className="text-xs text-muted-foreground">
              Bot scanning news for opportunities
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {highConfidenceOpportunities.map((opp, idx) => (
              <motion.div
                key={opp.article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.1 }}
                className="p-3 bg-primary/10 border border-primary/30 rounded-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {opp.recommendedAction === 'BUY' ? (
                        <TrendingUp size={16} className="text-green-400" weight="fill" />
                      ) : opp.recommendedAction === 'SELL' ? (
                        <TrendingDown size={16} className="text-red-400" weight="fill" />
                      ) : (
                        <AlertCircle size={16} className="text-yellow-400" weight="fill" />
                      )}
                      <span className={`text-xs font-bold uppercase ${
                        opp.recommendedAction === 'BUY' ? 'text-green-400' :
                        opp.recommendedAction === 'SELL' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {opp.recommendedAction}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {opp.urgency === 'immediate' ? '⚡ IMMEDIATE' :
                         opp.urgency === 'short-term' ? '⏱️ SHORT-TERM' : '📅 MEDIUM-TERM'}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1 line-clamp-2">
                      {opp.article.title}
                    </p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {opp.reasoning}
                    </p>
                    {opp.matchedStrategies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {opp.matchedStrategies.slice(0, 3).map(strategy => (
                          <span
                            key={strategy.id}
                            className="text-[10px] px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/40 rounded uppercase tracking-wider text-cyan-400"
                          >
                            {strategy.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-cyan-400">
                      {(opp.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Confidence
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-4 pt-4 border-t border-primary/30">
          <p className="text-xs text-center text-muted-foreground">
            🤖 Bot continuously scans news and matches opportunities to strategies
          </p>
        </div>
      </div>
    </div>
  )
}

