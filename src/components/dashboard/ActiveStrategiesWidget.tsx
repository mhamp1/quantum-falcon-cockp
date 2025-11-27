import { useState, useEffect } from 'react'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { UserAuth } from '@/lib/auth'
import { usePersistentAuth } from '@/lib/auth/usePersistentAuth'
import { fetchUserStrategies, getRecommendedStrategies } from '@/lib/strategiesApi'
import { StrategyData } from '@/lib/strategiesData'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Lightning, TrendUp, TrendDown, Crown, Target, Sparkle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

export function ActiveStrategiesWidget() {
  // Use persistent auth for accurate tier detection - master/lifetime users get full access
  const { auth } = usePersistentAuth()

  const [activeStrategies, setActiveStrategies] = useState<StrategyData[]>([])
  const [loading, setLoading] = useState(true)

  const userTier = auth?.license?.tier || 'free'

  useEffect(() => {
    const loadActiveStrategies = async () => {
      try {
        const strategies = await fetchUserStrategies(userTier)
        const active = strategies.filter(s => s.status === 'active')
        setActiveStrategies(active)
      } catch (error) {
        console.error('Failed to load active strategies:', error)
      } finally {
        setLoading(false)
      }
    }

    loadActiveStrategies()
  }, [userTier])

  const handleNavigateToVault = () => {
    window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'trading' }))
  }

  if (loading) {
    return (
      <div className="cyber-card p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted/30 rounded w-1/2" />
          <div className="h-20 bg-muted/30 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="cyber-card relative overflow-hidden">
      <div className="absolute inset-0 diagonal-stripes opacity-5 pointer-events-none" />
      
      <div className="p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Lightning size={20} weight="fill" className="text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Active Strategies
            </h3>
          </div>
          <Badge className="bg-primary/20 border-primary text-primary text-[9px] px-2 py-1">
            {activeStrategies.length} Running
          </Badge>
        </div>

        {activeStrategies.length === 0 ? (
          <div className="text-center py-8">
            <Target size={48} className="mx-auto mb-3 text-muted-foreground opacity-50" weight="duotone" />
            <p className="text-xs text-muted-foreground mb-3">
              No active strategies running
            </p>
            <Button
              size="sm"
              onClick={handleNavigateToVault}
              className="bg-primary/20 hover:bg-primary/30 border border-primary text-primary text-xs uppercase tracking-wider"
            >
              Browse Strategy Vault
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {activeStrategies.slice(0, 3).map((strategy, idx) => (
              <motion.div
                key={strategy.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-3 bg-muted/20 border-l-2 border-primary hover:bg-muted/30 transition-all cursor-pointer"
                onClick={handleNavigateToVault}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-xs font-bold text-foreground mb-1">
                      {strategy.name}
                    </div>
                    <div className="text-[9px] text-muted-foreground uppercase">
                      {strategy.category}
                    </div>
                  </div>
                  <div className="text-right">
                    {strategy.pnl !== undefined && (
                      <div className={`text-sm font-bold ${strategy.pnl >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        {strategy.pnl >= 0 ? '+' : ''}${strategy.pnl.toFixed(2)}
                      </div>
                    )}
                    {strategy.pnlPercent !== undefined && (
                      <div className="flex items-center justify-end gap-1 text-[10px]">
                        {strategy.pnlPercent >= 0 ? (
                          <TrendUp size={10} weight="bold" className="text-primary" />
                        ) : (
                          <TrendDown size={10} weight="bold" className="text-destructive" />
                        )}
                        <span className={strategy.pnlPercent >= 0 ? 'text-primary' : 'text-destructive'}>
                          {Math.abs(strategy.pnlPercent).toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[9px]">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Win Rate:</span>
                    <span className="text-accent font-bold">{strategy.win_rate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Trades:</span>
                    <span className="text-foreground font-bold">{strategy.total_trades}</span>
                  </div>
                  <div className="status-indicator ml-auto" />
                </div>
              </motion.div>
            ))}

            {activeStrategies.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNavigateToVault}
                className="w-full text-xs uppercase tracking-wider mt-2"
              >
                View All {activeStrategies.length} Strategies →
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function RecommendedStrategiesWidget() {
  const [auth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })

  const [recommendedStrategies, setRecommendedStrategies] = useState<StrategyData[]>([])
  const [loading, setLoading] = useState(true)

  const userTier = auth?.license?.tier || 'free'

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const strategies = await getRecommendedStrategies(userTier, 3)
        setRecommendedStrategies(strategies)
      } catch (error) {
        console.error('Failed to load recommended strategies:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRecommendations()
  }, [userTier])

  const handleNavigateToVault = () => {
    window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'trading' }))
  }

  if (loading) {
    return (
      <div className="cyber-card p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted/30 rounded w-1/2" />
          <div className="h-20 bg-muted/30 rounded" />
        </div>
      </div>
    )
  }

  if (recommendedStrategies.length === 0) {
    return null
  }

  return (
    <div className="cyber-card relative overflow-hidden">
      <div className="absolute inset-0 diagonal-stripes opacity-5 pointer-events-none" />
      
      <div className="p-6 relative">
        <div className="flex items-center gap-2 mb-4">
          <Sparkle size={20} weight="fill" className="text-accent" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Recommended for You
          </h3>
        </div>

        <div className="space-y-2">
          {recommendedStrategies.map((strategy, idx) => (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-3 bg-gradient-to-r from-accent/5 via-background to-accent/5 border border-accent/30 hover:border-accent/60 transition-all cursor-pointer"
              onClick={handleNavigateToVault}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-xs font-bold text-foreground">
                      {strategy.name}
                    </div>
                    {strategy.badge && (
                      <Badge className="bg-accent/20 border-accent text-accent text-[7px] px-1 py-0">
                        {strategy.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground mb-2">
                    {strategy.description}
                  </div>
                  <div className="flex items-center gap-3 text-[9px]">
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Win Rate:</span>
                      <span className="text-accent font-bold">{strategy.win_rate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Risk:</span>
                      <span className={`font-bold ${
                        strategy.risk === 'low' ? 'text-primary' :
                        strategy.risk === 'medium' ? 'text-accent' :
                        'text-destructive'
                      }`}>
                        {strategy.risk.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <Button
          onClick={handleNavigateToVault}
          className="w-full mt-3 bg-accent/20 hover:bg-accent/30 border border-accent text-accent text-xs uppercase tracking-wider"
          size="sm"
        >
          <Crown size={14} className="mr-2" weight="fill" />
          Explore All Strategies
        </Button>
      </div>
    </div>
  )
}
