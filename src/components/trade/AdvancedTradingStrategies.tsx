import { useKV } from '@github/spark/hooks'
import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Brain, Lightning, ChartLine, Target, Robot, TrendUp, 
  ArrowsClockwise, Play, Pause, Stop, Lock, Crown, 
  CheckCircle, XCircle, Warning, Info, Gear, CaretRight,
  ChartLineUp, Rocket, Fire, Shield, Sparkle
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { UserAuth, canAccessFeature, LICENSE_TIERS } from '@/lib/auth'
import { cn } from '@/lib/utils'

interface StrategyConfig {
  id: string
  name: string
  description: string
  category: 'momentum' | 'mean-reversion' | 'breakout' | 'arbitrage' | 'custom'
  requiredTier: 'free' | 'starter' | 'trader' | 'pro' | 'elite' | 'lifetime'
  icon: any
  riskLevel: 'low' | 'medium' | 'high' | 'extreme'
  expectedReturn: string
  timeframe: string
  parameters: {
    name: string
    type: 'number' | 'boolean' | 'select'
    default: any
    min?: number
    max?: number
    options?: string[]
    description: string
  }[]
}

interface ActiveStrategy {
  id: string
  strategyId: string
  name: string
  status: 'running' | 'paused' | 'stopped'
  startedAt: number
  parameters: Record<string, any>
  performance: {
    trades: number
    wins: number
    losses: number
    pnl: number
    pnlPercent: number
    sharpeRatio: number
    maxDrawdown: number
  }
}

const STRATEGY_LIBRARY: StrategyConfig[] = [
  {
    id: 'rsi-mean-reversion',
    name: 'RSI Mean Reversion',
    description: 'Buy oversold conditions (RSI < 30), sell overbought (RSI > 70)',
    category: 'mean-reversion',
    requiredTier: 'starter',
    icon: ChartLine,
    riskLevel: 'low',
    expectedReturn: '5-15% monthly',
    timeframe: '4h-1d',
    parameters: [
      { name: 'rsiPeriod', type: 'number', default: 14, min: 7, max: 28, description: 'RSI calculation period' },
      { name: 'oversoldThreshold', type: 'number', default: 30, min: 20, max: 40, description: 'Buy below this RSI' },
      { name: 'overboughtThreshold', type: 'number', default: 70, min: 60, max: 80, description: 'Sell above this RSI' },
      { name: 'positionSize', type: 'number', default: 10, min: 1, max: 100, description: 'Position size %' }
    ]
  },
  {
    id: 'macd-momentum',
    name: 'MACD Momentum',
    description: 'Trend-following strategy using MACD crossovers',
    category: 'momentum',
    requiredTier: 'trader',
    icon: TrendUp,
    riskLevel: 'medium',
    expectedReturn: '10-25% monthly',
    timeframe: '1h-4h',
    parameters: [
      { name: 'fastPeriod', type: 'number', default: 12, min: 8, max: 16, description: 'Fast EMA period' },
      { name: 'slowPeriod', type: 'number', default: 26, min: 20, max: 32, description: 'Slow EMA period' },
      { name: 'signalPeriod', type: 'number', default: 9, min: 7, max: 12, description: 'Signal line period' },
      { name: 'positionSize', type: 'number', default: 15, min: 1, max: 100, description: 'Position size %' }
    ]
  },
  {
    id: 'bollinger-breakout',
    name: 'Bollinger Breakout',
    description: 'Trade breakouts from Bollinger Band squeezes',
    category: 'breakout',
    requiredTier: 'pro',
    icon: Lightning,
    riskLevel: 'high',
    expectedReturn: '15-40% monthly',
    timeframe: '15m-1h',
    parameters: [
      { name: 'period', type: 'number', default: 20, min: 10, max: 30, description: 'Moving average period' },
      { name: 'stdDev', type: 'number', default: 2, min: 1, max: 3, description: 'Standard deviations' },
      { name: 'squeezeThreshold', type: 'number', default: 0.05, min: 0.01, max: 0.1, description: 'Squeeze detection %' },
      { name: 'positionSize', type: 'number', default: 20, min: 1, max: 100, description: 'Position size %' }
    ]
  },
  {
    id: 'arbitrage-scanner',
    name: 'Cross-Exchange Arbitrage',
    description: 'Detect and exploit price differences across exchanges',
    category: 'arbitrage',
    requiredTier: 'elite',
    icon: ArrowsClockwise,
    riskLevel: 'medium',
    expectedReturn: '20-50% monthly',
    timeframe: 'Real-time',
    parameters: [
      { name: 'minSpread', type: 'number', default: 0.5, min: 0.1, max: 2, description: 'Minimum profit spread %' },
      { name: 'maxSlippage', type: 'number', default: 0.3, min: 0.1, max: 1, description: 'Max acceptable slippage %' },
      { name: 'positionSize', type: 'number', default: 25, min: 1, max: 100, description: 'Position size %' },
      { name: 'autoExecute', type: 'boolean', default: true, description: 'Auto-execute opportunities' }
    ]
  },
  {
    id: 'ml-predictor',
    name: 'AI Price Predictor',
    description: 'Machine learning model predicts price movements',
    category: 'custom',
    requiredTier: 'elite',
    icon: Brain,
    riskLevel: 'high',
    expectedReturn: '25-60% monthly',
    timeframe: '5m-1h',
    parameters: [
      { name: 'confidence', type: 'number', default: 75, min: 60, max: 95, description: 'Min prediction confidence %' },
      { name: 'lookback', type: 'number', default: 100, min: 50, max: 200, description: 'Historical bars to analyze' },
      { name: 'positionSize', type: 'number', default: 30, min: 1, max: 100, description: 'Position size %' },
      { name: 'riskReward', type: 'number', default: 2, min: 1, max: 5, description: 'Risk/reward ratio' }
    ]
  },
  {
    id: 'grid-trading',
    name: 'Grid Trading Bot',
    description: 'Place buy/sell orders at regular intervals in a range',
    category: 'mean-reversion',
    requiredTier: 'trader',
    icon: Target,
    riskLevel: 'medium',
    expectedReturn: '8-20% monthly',
    timeframe: 'Range-bound',
    parameters: [
      { name: 'gridLevels', type: 'number', default: 10, min: 5, max: 20, description: 'Number of grid levels' },
      { name: 'rangeTop', type: 'number', default: 50000, min: 1000, max: 100000, description: 'Upper price range' },
      { name: 'rangeBottom', type: 'number', default: 40000, min: 1000, max: 100000, description: 'Lower price range' },
      { name: 'orderSize', type: 'number', default: 5, min: 1, max: 50, description: 'Order size %' }
    ]
  },
  {
    id: 'scalping-bot',
    name: 'High-Frequency Scalper',
    description: 'Rapid-fire trades capturing small price movements',
    category: 'momentum',
    requiredTier: 'pro',
    icon: Rocket,
    riskLevel: 'extreme',
    expectedReturn: '30-70% monthly',
    timeframe: '1m-5m',
    parameters: [
      { name: 'targetProfit', type: 'number', default: 0.5, min: 0.1, max: 2, description: 'Target profit %' },
      { name: 'stopLoss', type: 'number', default: 0.3, min: 0.1, max: 1, description: 'Stop loss %' },
      { name: 'maxTrades', type: 'number', default: 100, min: 10, max: 500, description: 'Max trades per day' },
      { name: 'positionSize', type: 'number', default: 10, min: 1, max: 50, description: 'Position size %' }
    ]
  }
]

export default function AdvancedTradingStrategies() {
  const [auth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })

  const [activeStrategies, setActiveStrategies] = useKV<ActiveStrategy[]>('active-strategies-v2', [])
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyConfig | null>(null)
  const [strategyParams, setStrategyParams] = useState<Record<string, any>>({})
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const userTier = auth?.license?.tier || 'free'

  const filteredStrategies = useMemo(() => {
    return STRATEGY_LIBRARY.filter(strategy => {
      const matchesCategory = filterCategory === 'all' || strategy.category === filterCategory
      const matchesSearch = strategy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           strategy.description.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [filterCategory, searchQuery])

  const handleStrategySelect = (strategy: StrategyConfig) => {
    setSelectedStrategy(strategy)
    const defaultParams: Record<string, any> = {}
    strategy.parameters.forEach(param => {
      defaultParams[param.name] = param.default
    })
    setStrategyParams(defaultParams)
  }

  const handleActivateStrategy = () => {
    if (!selectedStrategy) return

    if (!canAccessFeature(userTier, selectedStrategy.requiredTier)) {
      toast.error('Upgrade Required', {
        description: `This strategy requires ${LICENSE_TIERS[selectedStrategy.requiredTier].name} tier or higher`
      })
      return
    }

    const newStrategy: ActiveStrategy = {
      id: `strategy-${Date.now()}`,
      strategyId: selectedStrategy.id,
      name: selectedStrategy.name,
      status: 'running',
      startedAt: Date.now(),
      parameters: { ...strategyParams },
      performance: {
        trades: 0,
        wins: 0,
        losses: 0,
        pnl: 0,
        pnlPercent: 0,
        sharpeRatio: 0,
        maxDrawdown: 0
      }
    }

    setActiveStrategies(current => [...(current || []), newStrategy])
    toast.success('Strategy Activated', {
      description: `${selectedStrategy.name} is now running`
    })
    setSelectedStrategy(null)
  }

  const handleStrategyAction = (strategyId: string, action: 'pause' | 'resume' | 'stop') => {
    setActiveStrategies(current => {
      const strategies = current || []
      return strategies.map(strategy => {
        if (strategy.id === strategyId) {
          if (action === 'stop') {
            return { ...strategy, status: 'stopped' as const }
          } else if (action === 'pause') {
            return { ...strategy, status: 'paused' as const }
          } else {
            return { ...strategy, status: 'running' as const }
          }
        }
        return strategy
      }).filter(s => s.status !== 'stopped')
    })
    
    toast.success(`Strategy ${action}d`)
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-primary'
      case 'medium': return 'text-secondary'
      case 'high': return 'text-accent'
      case 'extreme': return 'text-destructive'
      default: return 'text-muted-foreground'
    }
  }

  const getRiskBadgeClass = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-primary/20 text-primary border-primary/30'
      case 'medium': return 'bg-secondary/20 text-secondary border-secondary/30'
      case 'high': return 'bg-accent/20 text-accent border-accent/30'
      case 'extreme': return 'bg-destructive/20 text-destructive border-destructive/30'
      default: return ''
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-wider neon-glow">
            Advanced Trading Strategies
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Unlock professional trading algorithms • Current Tier: <span className="text-primary font-bold">{userTier.toUpperCase()}</span>
          </p>
        </div>
        <Badge className="text-xs uppercase tracking-wider">
          {(activeStrategies || []).filter(s => s.status === 'running').length} Active
        </Badge>
      </div>

      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="library" className="uppercase tracking-wider">
            <Sparkle className="mr-2" size={16} weight="duotone" />
            Strategy Library
          </TabsTrigger>
          <TabsTrigger value="active" className="uppercase tracking-wider">
            <Robot className="mr-2" size={16} weight="duotone" />
            Active Strategies ({(activeStrategies || []).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <Input
              placeholder="Search strategies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory('all')}
                className="uppercase tracking-wider"
              >
                All
              </Button>
              <Button
                variant={filterCategory === 'momentum' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory('momentum')}
                className="uppercase tracking-wider"
              >
                Momentum
              </Button>
              <Button
                variant={filterCategory === 'mean-reversion' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory('mean-reversion')}
                className="uppercase tracking-wider"
              >
                Mean Reversion
              </Button>
              <Button
                variant={filterCategory === 'breakout' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory('breakout')}
                className="uppercase tracking-wider"
              >
                Breakout
              </Button>
              <Button
                variant={filterCategory === 'arbitrage' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterCategory('arbitrage')}
                className="uppercase tracking-wider"
              >
                Arbitrage
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredStrategies.map((strategy) => {
              const hasAccess = canAccessFeature(userTier, strategy.requiredTier)
              const Icon = strategy.icon
              
              return (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className={cn(
                    "cyber-card p-5 relative overflow-hidden transition-all hover:scale-[1.02]",
                    !hasAccess && "opacity-60"
                  )}>
                    {!hasAccess && (
                      <div className="absolute top-3 right-3 z-10">
                        <Lock size={20} className="text-destructive" weight="duotone" />
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                            <Icon size={24} className="text-primary" weight="duotone" />
                          </div>
                          <div>
                            <h3 className="font-bold uppercase text-sm tracking-wider">
                              {strategy.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {strategy.timeframe}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {strategy.description}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={cn("text-xs uppercase", getRiskBadgeClass(strategy.riskLevel))}>
                          {strategy.riskLevel} Risk
                        </Badge>
                        <Badge variant="outline" className="text-xs uppercase">
                          {strategy.category}
                        </Badge>
                        {!hasAccess && (
                          <Badge variant="outline" className="text-xs uppercase border-destructive/30 text-destructive">
                            <Crown size={12} className="mr-1" />
                            {LICENSE_TIERS[strategy.requiredTier].name}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2 pt-2 border-t border-primary/20">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground uppercase tracking-wider">Expected Return</span>
                          <span className="text-primary font-bold">{strategy.expectedReturn}</span>
                        </div>
                      </div>

                      <Button
                        onClick={() => handleStrategySelect(strategy)}
                        disabled={!hasAccess}
                        className="w-full uppercase tracking-wider"
                        variant={hasAccess ? "default" : "outline"}
                      >
                        {hasAccess ? (
                          <>
                            <Play size={16} className="mr-2" weight="fill" />
                            Configure & Activate
                          </>
                        ) : (
                          <>
                            <Lock size={16} className="mr-2" />
                            Upgrade to Unlock
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {(activeStrategies || []).length === 0 ? (
            <Card className="cyber-card p-12 text-center">
              <Robot size={64} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
              <h3 className="text-xl font-bold uppercase tracking-wider mb-2">No Active Strategies</h3>
              <p className="text-muted-foreground mb-6">
                Activate strategies from the library to start automated trading
              </p>
              <Button onClick={() => document.querySelector<HTMLElement>('[value="library"]')?.click()}>
                Browse Strategy Library
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {(activeStrategies || []).map((strategy) => (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="cyber-card p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-3 h-3 rounded-full animate-pulse",
                            strategy.status === 'running' ? "bg-primary shadow-[0_0_10px_var(--primary)]" :
                            strategy.status === 'paused' ? "bg-secondary" : "bg-muted"
                          )} />
                          <h3 className="text-lg font-bold uppercase tracking-wider">{strategy.name}</h3>
                          <Badge className="uppercase text-xs">
                            {strategy.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Trades</p>
                            <p className="text-xl font-bold text-primary">{strategy.performance.trades}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Win Rate</p>
                            <p className="text-xl font-bold text-primary">
                              {strategy.performance.trades > 0 
                                ? Math.round((strategy.performance.wins / strategy.performance.trades) * 100) 
                                : 0}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">PnL</p>
                            <p className={cn(
                              "text-xl font-bold",
                              strategy.performance.pnl >= 0 ? "text-primary" : "text-destructive"
                            )}>
                              {strategy.performance.pnl >= 0 ? '+' : ''}{strategy.performance.pnl.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Sharpe</p>
                            <p className="text-xl font-bold text-primary">
                              {strategy.performance.sharpeRatio.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 lg:flex-col">
                        {strategy.status === 'running' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStrategyAction(strategy.id, 'pause')}
                            className="uppercase tracking-wider"
                          >
                            <Pause size={16} className="lg:mb-0 lg:mr-0" weight="fill" />
                            <span className="lg:hidden ml-2">Pause</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStrategyAction(strategy.id, 'resume')}
                            className="uppercase tracking-wider"
                          >
                            <Play size={16} className="lg:mb-0 lg:mr-0" weight="fill" />
                            <span className="lg:hidden ml-2">Resume</span>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleStrategyAction(strategy.id, 'stop')}
                          className="uppercase tracking-wider"
                        >
                          <Stop size={16} className="lg:mb-0 lg:mr-0" weight="fill" />
                          <span className="lg:hidden ml-2">Stop</span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {selectedStrategy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedStrategy(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="cyber-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin"
            >
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold uppercase tracking-wider neon-glow">
                      {selectedStrategy.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedStrategy.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedStrategy(null)}
                  >
                    <XCircle size={20} />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/20 border border-primary/20">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Risk Level</p>
                    <Badge className={cn("mt-1 uppercase", getRiskBadgeClass(selectedStrategy.riskLevel))}>
                      {selectedStrategy.riskLevel}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Expected Return</p>
                    <p className="text-sm font-bold text-primary mt-1">{selectedStrategy.expectedReturn}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
                    <Gear size={20} weight="duotone" />
                    Strategy Parameters
                  </h3>
                  
                  {selectedStrategy.parameters.map((param) => (
                    <div key={param.name} className="space-y-2">
                      <Label htmlFor={param.name} className="text-xs uppercase tracking-wider">
                        {param.name.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <p className="text-xs text-muted-foreground">{param.description}</p>
                      
                      {param.type === 'number' && (
                        <Input
                          id={param.name}
                          type="number"
                          min={param.min}
                          max={param.max}
                          value={strategyParams[param.name] ?? param.default}
                          onChange={(e) => setStrategyParams(prev => ({
                            ...prev,
                            [param.name]: parseFloat(e.target.value)
                          }))}
                        />
                      )}
                      
                      {param.type === 'boolean' && (
                        <div className="flex items-center gap-2">
                          <Switch
                            id={param.name}
                            checked={strategyParams[param.name] ?? param.default}
                            onCheckedChange={(checked) => setStrategyParams(prev => ({
                              ...prev,
                              [param.name]: checked
                            }))}
                          />
                          <Label htmlFor={param.name} className="text-sm">
                            {strategyParams[param.name] ?? param.default ? 'Enabled' : 'Disabled'}
                          </Label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4 border-t border-primary/20">
                  <Button
                    onClick={handleActivateStrategy}
                    className="flex-1 uppercase tracking-wider"
                  >
                    <Play size={16} className="mr-2" weight="fill" />
                    Activate Strategy
                  </Button>
                  <Button
                    onClick={() => setSelectedStrategy(null)}
                    variant="outline"
                    className="uppercase tracking-wider"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
