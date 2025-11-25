import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { UserAuth } from '@/lib/auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Lightning, ChartLine, Target, Brain, Sparkle } from '@phosphor-icons/react'
import TradingStrategyCard from './TradingStrategyCard'
import AdvancedTradingStrategies from './AdvancedTradingStrategies'
import Strategies from './Strategies'
import { toast } from 'sonner'

interface Strategy {
  id: string
  name: string
  type: string
  description: string
  longDescription: string
  benefits: string[]
  requiredTier: string
  status: 'active' | 'paused' | 'locked'
  pnl?: number
  pnlPercent?: number
  tradesExecuted?: number
  winRate?: number
  risk: 'low' | 'medium' | 'high'
  icon?: string // Icon name from Phosphor Icons
}

const ALL_STRATEGIES: Strategy[] = [
  {
    id: 'dca-basic',
    name: 'DCA Basic',
    type: 'Dollar Cost Averaging',
    icon: 'CalendarPlus',
    description: 'Systematic buying at regular intervals regardless of price',
    longDescription: 'Dollar Cost Averaging (DCA) helps reduce the impact of volatility by spreading purchases over time. This basic strategy executes buys at fixed intervals.',
    benefits: [
      'Reduces timing risk',
      'Averages out market volatility',
      'Perfect for long-term holders',
      'No emotional decision making'
    ],
    requiredTier: 'free',
    status: 'active',
    pnl: 89.20,
    pnlPercent: 3.2,
    tradesExecuted: 12,
    winRate: 100,
    risk: 'low'
  },
  {
    id: 'dca-advanced',
    name: 'DCA Advanced',
    type: 'Smart DCA',
    icon: 'ChartLineUp',
    description: 'AI-optimized DCA that adjusts purchase amounts based on market conditions',
    longDescription: 'Advanced DCA uses machine learning to optimize purchase timing and amounts. Buys more during dips and less during peaks for improved cost basis.',
    benefits: [
      'AI-optimized entry points',
      'Dynamic position sizing',
      'Better average entry price',
      'Adapts to volatility'
    ],
    requiredTier: 'pro',
    status: 'paused',
    pnl: 156.40,
    pnlPercent: 5.8,
    tradesExecuted: 28,
    winRate: 100,
    risk: 'low'
  },
  {
    id: 'momentum-basic',
    name: 'Momentum Basic',
    type: 'Trend Following',
    icon: 'TrendUp',
    description: 'Identifies and trades with strong price momentum',
    longDescription: 'Momentum trading captures trends by entering positions when price action shows strong directional movement. Uses technical indicators to confirm trend strength.',
    benefits: [
      'Catches strong trends early',
      'Clear entry/exit signals',
      'Works in trending markets',
      'Good risk/reward ratio'
    ],
    requiredTier: 'pro',
    status: 'active',
    pnl: 342.50,
    pnlPercent: 12.4,
    tradesExecuted: 47,
    winRate: 68,
    risk: 'medium'
  },
  {
    id: 'rsi-strategy',
    name: 'RSI Divergence',
    type: 'Oscillator',
    icon: 'Pulse',
    description: 'Trades RSI overbought/oversold conditions and divergences',
    longDescription: 'RSI strategy identifies overbought (>70) and oversold (<30) conditions, entering counter-trend positions. Advanced divergence detection finds high-probability reversals.',
    benefits: [
      'Identifies reversal points',
      'Works in ranging markets',
      'Clear risk parameters',
      'High win rate potential'
    ],
    requiredTier: 'pro',
    status: 'paused',
    pnl: 78.90,
    pnlPercent: 2.9,
    tradesExecuted: 34,
    winRate: 61,
    risk: 'medium'
  },
  {
    id: 'momentum-advanced',
    name: 'Momentum Advanced',
    type: 'Multi-Timeframe',
    icon: 'ChartLine',
    description: 'Advanced momentum detection across multiple timeframes',
    longDescription: 'Multi-timeframe momentum analysis confirms trends across 5m, 15m, 1h, and 4h charts. Only enters when all timeframes align for maximum probability.',
    benefits: [
      'Multi-timeframe confirmation',
      'Higher probability setups',
      'Filters false signals',
      'Better risk management'
    ],
    requiredTier: 'elite',
    status: 'locked',
    risk: 'medium'
  },
  {
    id: 'macd-strategy',
    name: 'MACD Crossover',
    type: 'Trend Indicator',
    icon: 'ChartLine',
    description: 'MACD signal line crossovers for trend entries and exits',
    longDescription: 'MACD strategy uses the Moving Average Convergence Divergence indicator to identify trend changes. Enters on bullish crossovers, exits on bearish crossovers.',
    benefits: [
      'Clear trend identification',
      'Objective entry/exit signals',
      'Works across timeframes',
      'Momentum confirmation'
    ],
    requiredTier: 'elite',
    status: 'locked',
    risk: 'medium'
  },
  {
    id: 'bollinger-bands',
    name: 'Bollinger Bands',
    type: 'Volatility',
    icon: 'ArrowsDownUp',
    description: 'Trades price action relative to volatility bands',
    longDescription: 'Bollinger Bands adapt to market volatility, expanding during volatile periods and contracting during calm periods. Strategy trades bounces and breakouts.',
    benefits: [
      'Adapts to volatility',
      'Identifies breakouts early',
      'Mean reversion plays',
      'Dynamic support/resistance'
    ],
    requiredTier: 'elite',
    status: 'locked',
    risk: 'medium'
  },
  {
    id: 'mean-reversion',
    name: 'Mean Reversion',
    type: 'Statistical',
    icon: 'ArrowsCounterClockwise',
    description: 'Trades price deviations from statistical mean',
    longDescription: 'Mean reversion strategy identifies when prices have deviated significantly from their average, entering positions expecting a return to the mean.',
    benefits: [
      'High win rate strategy',
      'Works in ranging markets',
      'Statistical edge',
      'Defined risk parameters'
    ],
    requiredTier: 'elite',
    status: 'locked',
    risk: 'low'
  },
  {
    id: 'token-sniping',
    name: 'Token Sniping',
    type: 'Launch Detection',
    icon: 'Crosshair',
    description: 'Automatically detects and buys new token launches',
    longDescription: 'Token sniping bot monitors Raydium and other DEXs for new liquidity pools, executing buy orders within seconds of launch for first-mover advantage.',
    benefits: [
      'First-mover advantage',
      'Automated launch detection',
      'Fast execution (<1s)',
      'Configurable safety filters'
    ],
    requiredTier: 'elite',
    status: 'locked',
    pnl: -45.30,
    pnlPercent: -5.8,
    tradesExecuted: 8,
    winRate: 37.5,
    risk: 'high'
  },
  {
    id: 'arbitrage',
    name: 'Arbitrage Scanner',
    type: 'Multi-Exchange',
    icon: 'ArrowsLeftRight',
    description: 'Identifies and executes arbitrage opportunities across exchanges',
    longDescription: 'Arbitrage scanner monitors price discrepancies across multiple exchanges, automatically executing trades to capture risk-free profit from price differences.',
    benefits: [
      'Risk-free profit potential',
      'Market-neutral strategy',
      'Works in all conditions',
      'Fast execution required'
    ],
    requiredTier: 'elite',
    status: 'locked',
    risk: 'low'
  },
  {
    id: 'ai-adaptive',
    name: 'AI Adaptive',
    type: 'Machine Learning',
    icon: 'Brain',
    description: 'AI that selects and switches between strategies based on market regime',
    longDescription: 'Advanced AI analyzes current market conditions (trending, ranging, volatile) and automatically activates the most suitable strategy. Continuously learns from results.',
    benefits: [
      'Adapts to any market',
      'Auto strategy selection',
      'Continuous learning',
      'Maximum flexibility'
    ],
    requiredTier: 'lifetime',
    status: 'locked',
    risk: 'medium'
  },
  {
    id: 'custom-builder',
    name: 'Custom Strategy Builder',
    type: 'Advanced',
    icon: 'Code',
    description: 'Build your own strategies with visual programming interface',
    longDescription: 'Create custom trading strategies using a no-code visual builder. Combine indicators, set conditions, and backtest before deployment.',
    benefits: [
      'Unlimited customization',
      'No coding required',
      'Built-in backtesting',
      'Share with community'
    ],
    requiredTier: 'lifetime',
    status: 'locked',
    risk: 'medium'
  }
]

export default function AdvancedTradingHub() {
  const [auth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })

  const [strategies, setStrategies] = useKV<Strategy[]>('trading-strategies', ALL_STRATEGIES)

  const toggleStrategy = (id: string) => {
    setStrategies((current) => {
      if (!current) return ALL_STRATEGIES
      return current.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'active' ? 'paused' : 'active' }
          : s
      )
    })

    const strategy = strategies?.find((s) => s.id === id)
    if (strategy) {
      toast.success(
        strategy.status === 'active' ? 'Strategy Paused' : 'Strategy Activated',
        {
          description: `${strategy.name} is now ${strategy.status === 'active' ? 'paused' : 'active'}`
        }
      )
    }
  }

  const userTier = auth?.license?.tier || 'free'

  const activeStrategies = strategies?.filter(s => s.status === 'active') || []
  const dca = strategies?.filter(s => s.type.includes('DCA') || s.type.includes('Cost')) || []
  const momentum = strategies?.filter(s => s.type.includes('Momentum') || s.type.includes('Trend')) || []
  const advanced = strategies?.filter(s => 
    s.type.includes('Oscillator') || 
    s.type.includes('Volatility') || 
    s.type.includes('Statistical')
  ) || []
  const special = strategies?.filter(s => 
    s.type.includes('Launch') || 
    s.type.includes('Exchange') || 
    s.type.includes('Machine') || 
    s.type.includes('Advanced')
  ) || []

  return (
    <div className="space-y-6">
      <div className="cyber-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 diagonal-stripes opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-accent/20 border-2 border-accent jagged-corner-small">
              <Lightning size={32} weight="fill" className="text-accent" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase">
                <span className="text-accent neon-glow-accent">TRADING_HUB</span>
              </h1>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                AI-POWERED STRATEGY ORCHESTRATION
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            The bot intelligently <span className="text-primary font-bold">transitions between strategies</span> based on{' '}
            <span className="text-accent font-bold">real-time market conditions</span>. Trending markets activate momentum strategies,
            while ranging markets trigger mean reversion and RSI strategies.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={20} weight="duotone" className="text-primary" />
            <span className="data-label">Active Strategies</span>
          </div>
          <div className="technical-readout text-3xl">{activeStrategies.length}</div>
        </div>
        <div className="cyber-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={20} weight="duotone" className="text-accent" />
            <span className="data-label">Total Trades</span>
          </div>
          <div className="technical-readout text-3xl">
            {strategies?.reduce((acc, s) => acc + (s.tradesExecuted || 0), 0) || 0}
          </div>
        </div>
        <div className="cyber-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <ChartLine size={20} weight="duotone" className="text-secondary" />
            <span className="data-label">Total P&L</span>
          </div>
          <div className="technical-readout text-3xl text-primary">
            +${strategies?.reduce((acc, s) => acc + (s.pnl || 0), 0).toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="cyber-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightning size={20} weight="fill" className="text-accent" />
            <span className="data-label">Avg Win Rate</span>
          </div>
          <div className="technical-readout text-3xl text-accent">
            {strategies && strategies.filter(s => s.winRate).length > 0
              ? (strategies.filter(s => s.winRate).reduce((acc, s) => acc + (s.winRate || 0), 0) / 
                 strategies.filter(s => s.winRate).length).toFixed(1)
              : '0.0'}%
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full justify-start bg-card border-2 border-primary/30 p-1 jagged-corner overflow-x-auto flex-nowrap">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary uppercase tracking-wider text-xs font-bold whitespace-nowrap"
          >
            All Strategies
          </TabsTrigger>
          <TabsTrigger 
            value="dca" 
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary uppercase tracking-wider text-xs font-bold whitespace-nowrap"
          >
            DCA
          </TabsTrigger>
          <TabsTrigger 
            value="momentum" 
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary uppercase tracking-wider text-xs font-bold whitespace-nowrap"
          >
            Momentum
          </TabsTrigger>
          <TabsTrigger 
            value="advanced" 
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary uppercase tracking-wider text-xs font-bold whitespace-nowrap"
          >
            Advanced
          </TabsTrigger>
          <TabsTrigger 
            value="special" 
            className="data-[state=active]:bg-accent/20 data-[state=active]:text-accent uppercase tracking-wider text-xs font-bold whitespace-nowrap flex items-center gap-1"
          >
            <Sparkle size={14} weight="duotone" />
            Special
          </TabsTrigger>
          <TabsTrigger 
            value="enhanced" 
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary uppercase tracking-wider text-xs font-bold whitespace-nowrap flex items-center gap-1"
          >
            <Lightning size={14} weight="duotone" />
            Enhanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6 strategy-cards" data-tour="strategy-cards">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {strategies?.map((strategy) => (
              <TradingStrategyCard
                key={strategy.id}
                strategy={strategy}
                userTier={userTier}
                onToggle={toggleStrategy}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dca" className="space-y-4 mt-6 strategy-cards">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {dca.map((strategy) => (
              <TradingStrategyCard
                key={strategy.id}
                strategy={strategy}
                userTier={userTier}
                onToggle={toggleStrategy}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="momentum" className="space-y-4 mt-6 strategy-cards">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {momentum.map((strategy) => (
              <TradingStrategyCard
                key={strategy.id}
                strategy={strategy}
                userTier={userTier}
                onToggle={toggleStrategy}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {advanced.map((strategy) => (
              <TradingStrategyCard
                key={strategy.id}
                strategy={strategy}
                userTier={userTier}
                onToggle={toggleStrategy}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="special" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {special.map((strategy) => (
              <TradingStrategyCard
                key={strategy.id}
                strategy={strategy}
                userTier={userTier}
                onToggle={toggleStrategy}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="enhanced" className="space-y-4 mt-6">
          <Strategies />
        </TabsContent>
      </Tabs>
    </div>
  )
}

