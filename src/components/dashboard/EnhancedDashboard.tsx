// Enhanced Dashboard with React 19 performance optimizations and AI integration
import { useKVSafe } from '@/hooks/useKVFallback'
import { useEffect, useState, useMemo, useTransition, lazy, Suspense, memo } from 'react'
import { UserAuth } from '@/lib/auth'
import {
  Lightning, Robot, ChartLine, Brain, CheckCircle, 
  Play, Users, Crown, Cube, Hexagon, Pentagon, Polygon, Stop, Database, Vault
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import LoginDialog from '@/components/shared/LoginDialog'
import LicenseExpiry from '@/components/shared/LicenseExpiry'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { AgentStatusCard } from './AgentStatusCard'
import { ActivityFeed } from './ActivityFeed'
import { LogicStream } from './LogicStream'
import BestPerformingAgentBadge from '@/components/shared/BestPerformingAgentBadge'
import ProfitMilestoneCelebration from '@/components/shared/ProfitMilestoneCelebration'
import LearningMetricsDisplay from '@/components/shared/LearningMetricsDisplay'
import { useAchievements } from '@/hooks/useAchievements'
import TaxDashboardCard from '@/components/dashboard/TaxDashboardCard'
import { useTaxReserve } from '@/lib/tax/TaxReserveEngine'
import { useProfitOptimizer } from '@/lib/profit/ProfitOptimizer'
import { useBearMarketDetector } from '@/lib/market/BearMarketDetector'
import { useLiveTradingData } from '@/hooks/useLiveTradingData'
import { useAutonomousTradingLoop } from '@/lib/bot/AutonomousTradingLoop'
import { useLegalProtection } from '@/lib/legal/LegalProtection'
import AutonomousBotDisclaimer from '@/components/legal/AutonomousBotDisclaimer'
import NewsOpportunitiesDisplay from '@/components/intelligence/NewsOpportunitiesDisplay'

// Lazy load heavy components for better performance
const NewsTicker = lazy(() => import('@/components/shared/NewsTicker'))
const Wireframe3D = lazy(() => import('@/components/shared/Wireframe3D'))
// QuickStatsCard is NOT lazy-loaded - needed immediately for tour
import { QuickStatsCard } from './QuickStatsCard'
const QuickActionButton = lazy(() => import('./QuickActionButton').then(m => ({ default: m.QuickActionButton })))
const AIAdvisor = lazy(() => import('./AIAdvisor').then(m => ({ default: m.AIAdvisor })))

import { ErrorBoundary } from '@/components/ErrorBoundary'

interface QuickStat {
  id: string
  label: string
  value: string
  change: number
  icon: React.ReactNode
  color: string
}

export default function EnhancedDashboard() {
  const [auth, setAuth] = useKVSafe<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })

  const [showLogin, setShowLogin] = useState(false)
  const [botRunning, setBotRunning] = useKVSafe<boolean>('bot-running', false)
  const [paperTradingMode, setPaperTradingMode] = useKVSafe<boolean>('paper-trading-mode', true)
  const [isPending, startTransition] = useTransition()
  const [portfolio] = useKVSafe<{
    solanaBalance: number
    btcBalance: number
    totalValue: number
    change24h: number
    activeAgents: number
  }>('portfolio-data', {
    solanaBalance: 125.47,
    btcBalance: 0.00234,
    totalValue: 8943.21,
    change24h: 5.72,
    activeAgents: 3
  })

  const [previousProfit, setPreviousProfit] = useState<number>(0)
  
  // Track profit for milestone celebrations
  useEffect(() => {
    const currentProfit = portfolio.totalValue - 5000 // Assuming starting capital
    if (previousProfit !== currentProfit) {
      setPreviousProfit(currentProfit)
    }
  }, [portfolio.totalValue, previousProfit])

  const currentProfit = portfolio.totalValue - 5000 // Assuming starting capital

  // Get live trading data for achievements
  const liveTradingData = useLiveTradingData()

  // Track achievements with LIVE data
  useAchievements({
    userStats: {
      totalProfit: currentProfit,
      portfolioValue: portfolio.totalValue,
      weeklyWinRate: liveTradingData.weeklyWinRate || 0,
      totalTrades: liveTradingData.totalTrades || 0,
      dailyStreak: liveTradingData.dailyStreak || 0,
    },
    auth,
  })

  // Tax Reserve System
  const { getTaxSummary } = useTaxReserve()

  // Profit Optimizer
  const profitOptimizer = useProfitOptimizer()
  const optimizerStats = profitOptimizer.getStats(portfolio.totalValue)

  // Bear Market Detector
  const { bearState, calculateBearConfidence } = useBearMarketDetector()
  
  // Autonomous Bot System — Self-sufficient AI with internal $600/day goal
  const userTier = auth?.license?.tier || 'free'
  const autonomousBot = useAutonomousTradingLoop(userTier)
  const { hasAcknowledgedBot } = useLegalProtection()
  const [showBotDisclaimer, setShowBotDisclaimer] = useState(false)
  
  // Update bear market detection with LIVE market data
  useEffect(() => {
    const updateBearMarketData = async () => {
      try {
        const { fetchLiveMarketData } = await import('@/lib/market/liveMarketData')
        const liveData = await fetchLiveMarketData()
        
        calculateBearConfidence({
          btcDominance: liveData.btcDominance,
          btcDominanceChange7d: liveData.btcDominanceChange7d,
          fearGreedIndex: liveData.fearGreedIndex,
          btcPrice: liveData.btcPrice,
          btc200WeekMA: liveData.btc200WeekMA,
          altcoinSeasonIndex: liveData.altcoinSeasonIndex,
          volumeChange14d: liveData.volumeChange14d,
          avgFundingRate: liveData.avgFundingRate,
          sp500Change30d: liveData.sp500Change30d,
        })
      } catch (error) {
        console.error('❌ Failed to update bear market data:', error)
        // Don't update if fetch fails - keep last known state
      }
    }

    // Initial fetch
    updateBearMarketData()

    // Update every 60 seconds with live data
    const interval = setInterval(updateBearMarketData, 60000)

    return () => clearInterval(interval)
  }, [calculateBearConfidence])

  const [quickStats, setQuickStats] = useState<QuickStat[]>([
    {
      id: 'total-value',
      label: 'Total Portfolio',
      value: '$8,943.21',
      change: 5.72,
      icon: <Cube size={24} weight="duotone" />,
      color: 'primary'
    },
    {
      id: 'today-profit',
      label: "Today's Profit",
      value: '+$342.50',
      change: 12.4,
      icon: <Hexagon size={24} weight="duotone" />,
      color: 'primary'
    },
    {
      id: 'active-agents',
      label: 'Active Agents',
      value: '3/3',
      change: 0,
      icon: <Pentagon size={24} weight="duotone" />,
      color: 'accent'
    },
    {
      id: 'win-rate',
      label: 'Win Rate',
      value: '68.5%',
      change: 2.3,
      icon: <Polygon size={24} weight="duotone" />,
      color: 'secondary'
    }
  ])

  // Memoize stats grid to prevent unnecessary re-renders
  const statsGrid = useMemo(() => quickStats, [quickStats])

  const quickActions = [
    {
      id: 'toggle-bot',
      label: botRunning ? 'Stop Bot' : 'Start Bot',
      icon: botRunning ? <Stop size={20} weight="fill" /> : <Play size={20} weight="fill" />,
      color: botRunning ? 'destructive' : 'primary',
      action: () => {
        if (!botRunning) {
          // Check if user has acknowledged autonomous bot disclaimer
          if (!hasAcknowledgedBot()) {
            setShowBotDisclaimer(true)
            return
          }
        }

        startTransition(() => {
          const newRunningState = !botRunning
          setBotRunning(newRunningState)
          
          // Activate/deactivate autonomous trading
          if (newRunningState) {
            autonomousBot.setIsActive(true)
            toast.success('🤖 Autonomous Bot Activated', {
              description: 'Bot is now self-sufficient and making autonomous trading decisions',
              duration: 3000,
            })
          } else {
            autonomousBot.setIsActive(false)
            toast.success('Bot stopped - will persist until manually restarted', {
              description: 'All trading activities paused'
            })
          }
        })
      }
    },
    {
      id: 'view-analytics',
      label: 'View Analytics',
      icon: <ChartLine size={20} weight="duotone" />,
      color: 'accent',
      action: () => {
        const event = new CustomEvent('navigate-tab', { detail: 'analytics' })
        window.dispatchEvent(event)
      }
    },
    {
      id: 'check-vault',
      label: 'Check Vault',
      icon: <Vault size={20} weight="duotone" />,
      color: 'secondary',
      action: () => {
        const event = new CustomEvent('navigate-tab', { detail: 'vault' })
        window.dispatchEvent(event)
      }
    },
    {
      id: 'community',
      label: 'Community',
      icon: <Users size={20} weight="duotone" />,
      color: 'primary',
      action: () => {
        const event = new CustomEvent('navigate-tab', { detail: 'community' })
        window.dispatchEvent(event)
      }
    },
    {
      id: 'upgrade-tier',
      label: 'Upgrade Tier',
      icon: <Crown size={20} weight="fill" />,
      color: 'accent',
      action: () => {
        const event = new CustomEvent('navigate-tab', { detail: 'settings' })
        window.dispatchEvent(event)
        // Navigate to subscription tab after a short delay
        setTimeout(() => {
          const subscriptionSection = document.getElementById('subscription-tiers-section')
          if (subscriptionSection) {
            subscriptionSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        }, 300)
      }
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setQuickStats(prev =>
        prev.map(stat => ({
          ...stat,
          change: stat.change + (Math.random() - 0.5) * 0.5
        }))
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  if (!auth?.isAuthenticated) {
    return (
      <>
        <div 
          className="space-y-6 animate-in fade-in duration-500"
        >
          <div className="cyber-card relative overflow-hidden">
            <div className="absolute inset-0 diagonal-stripes opacity-20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <Suspense fallback={<div className="w-64 h-64 animate-pulse bg-muted/10" />}>
                <Wireframe3D type="sphere" size={256} color="secondary" animated={true} />
              </Suspense>
            </div>
            <div className="p-8 relative z-10 text-center space-y-6">
              <div className="inline-flex p-8 jagged-corner bg-gradient-to-br from-primary/20 to-accent/20 border-4 border-primary shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.6)]">
                <Brain size={96} weight="duotone" className="text-primary" />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-[0.2em] uppercase mb-2">
                  <span className="text-primary" style={{
                    textShadow: '0 0 10px var(--primary), 0 0 20px var(--primary), 0 0 40px var(--primary), 0 0 80px var(--primary)',
                    WebkitTextStroke: '0.5px currentColor',
                    paintOrder: 'stroke fill'
                  }}>QUANTUM</span>
                  <span className="text-accent ml-2" style={{
                    textShadow: '0 0 10px var(--accent), 0 0 20px var(--accent), 0 0 40px var(--accent), 0 0 80px var(--accent)',
                    WebkitTextStroke: '0.5px currentColor',
                    paintOrder: 'stroke fill'
                  }}>FALCON</span>
                </h1>
                <p className="text-lg uppercase tracking-[0.15em] font-bold" style={{
                  color: 'var(--primary)',
                  textShadow: '0 0 10px var(--primary)',
                  fontFamily: 'monospace',
                  letterSpacing: '0.3em'
                }}>
                  SYSTEM_ONLINE<span className="animate-pulse">_</span>
                </p>
                <p className="text-base leading-relaxed text-foreground max-w-2xl mx-auto mt-4">
                  Access your <span className="text-primary font-bold">advanced trading dashboard</span>, manage{' '}
                  <span className="text-accent font-bold">AI agents</span>, and monitor your{' '}
                  <span className="text-secondary font-bold">portfolio</span> in real-time
                </p>
              </div>

              <Button
                onClick={() => setShowLogin(true)}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary 
                         shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.6)] hover:shadow-[0_0_40px_oklch(0.72_0.20_195_/_0.8)]
                         transition-all jagged-corner uppercase tracking-[0.2em] font-bold text-lg px-8 py-6"
              >
                <Lightning size={24} weight="fill" className="mr-2" />
                Authenticate System
              </Button>

              <div className="cyber-card-accent p-6 max-w-xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <Crown size={24} className="text-accent" weight="fill" />
                  <span className="text-sm font-bold uppercase tracking-wider text-accent">System Requirements</span>
                </div>
                <div className="text-left space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-primary" weight="fill" />
                    <span>Valid Quantum Falcon license key</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-primary" weight="fill" />
                    <span>Email address for authentication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-primary" weight="fill" />
                    <span>Access to 4 tier levels (Free, Pro, Elite, Lifetime)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
      </>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6" role="main" aria-label="Quantum Falcon Dashboard">
        {/* Profit Milestone Celebration */}
        <ProfitMilestoneCelebration
          currentProfit={currentProfit}
          previousProfit={previousProfit}
        />
        
        {/* First Profit Celebration (small milestones) */}
        <Suspense fallback={null}>
          {(() => {
            const FirstProfitCelebration = lazy(() => import('@/components/shared/FirstProfitCelebration'));
            return (
              <FirstProfitCelebration
                currentProfit={currentProfit}
                previousProfit={previousProfit}
              />
            );
          })()}
        </Suspense>
        
        {/* Progress to First Profit Indicator */}
        <Suspense fallback={null}>
          {(() => {
            const ProgressToFirstProfit = lazy(() => import('@/components/shared/ProgressToFirstProfit'));
            return (
              <ProgressToFirstProfit
                currentProfit={currentProfit}
                targetProfit={10}
              />
            );
          })()}
        </Suspense>

        {/* News Ticker - Top of Dashboard */}
        <Suspense fallback={<div className="animate-pulse h-8 bg-muted/20 rounded border border-primary/20" />}>
          <NewsTicker />
        </Suspense>

        {/* STAT CARDS - Portfolio Quick Stats - Prominent position for tour */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stats-grid" 
          role="grid" 
          aria-label="Portfolio Quick Stats" 
          data-tour="stats-container"
          style={{ opacity: 1, visibility: 'visible', display: 'grid' }}
        >
          {statsGrid.map((stat, idx) => (
            <QuickStatsCard key={stat.id} stat={stat} index={idx} />
          ))}
        </div>

        {/* Tax Dashboard Card */}
        <TaxDashboardCard />

        {/* Profit Optimizer Card */}
        <div className="cyber-card p-6 border-2 border-yellow-500/50 relative overflow-hidden">
          <div className="absolute inset-0 grid-background opacity-5" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 blur-3xl rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-yellow-500/20 border border-yellow-500/40 rounded-lg">
                <TrendingUp size={32} weight="duotone" className="text-yellow-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-wider text-yellow-400">
                  Profit Optimization Engine
                </h3>
                <p className="text-sm text-muted-foreground">Auto-compounding • Tax optimization • Kelly sizing</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
                <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Avg Position Size</p>
                <p className="text-3xl font-bold text-cyan-400">{optimizerStats.avgPositionSize.toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
                <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Tax Reserved YTD</p>
                <p className="text-3xl font-bold text-green-400">${optimizerStats.taxReservedYTD.toFixed(0)}</p>
              </div>
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
                <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Compounded</p>
                <p className="text-3xl font-bold text-purple-400">+${optimizerStats.compoundedProfits.toFixed(0)}</p>
              </div>
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-center">
                <p className="text-muted-foreground text-sm uppercase tracking-wider mb-2">Status</p>
                <p className="text-2xl font-black text-yellow-400 uppercase">
                  {optimizerStats.status === 'active' ? 'ACTIVE 🔥' : 'PAUSED'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* News Intelligence Display */}
        <NewsOpportunitiesDisplay userTier={userTier} />

        {/* Bear Market Detection Card */}
        {bearState.confidence > 0 && (
          <div className={`cyber-card p-6 border-2 ${
            bearState.status === 'extreme_bear' ? 'border-red-500/50' :
            bearState.status === 'bear' ? 'border-orange-500/50' :
            'border-yellow-500/50'
          } relative overflow-hidden`}>
            <div className="absolute inset-0 grid-background opacity-5" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AlertCircle 
                    size={32} 
                    weight="duotone" 
                    className={bearState.status === 'extreme_bear' ? 'text-red-400' : 'text-orange-400'} 
                  />
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-wider">
                      Bear Market Detection
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {bearState.status === 'extreme_bear' ? 'EXTREME BEAR MODE' :
                       bearState.status === 'bear' ? 'BEAR MODE ACTIVE' :
                       'Monitoring Market Conditions'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-red-400">{bearState.confidence}%</p>
                  <p className="text-xs text-muted-foreground">Bear Confidence</p>
                </div>
              </div>
              <div className="space-y-2">
                {bearState.signals.filter(s => s.active).map((signal, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                    <span className="text-sm">{signal.name}</span>
                    <span className="text-sm font-bold text-red-400">+{signal.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      
      <div 
        className="cyber-card relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
      >
        <div className="absolute inset-0 diagonal-stripes opacity-10 pointer-events-none" />
        <div className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase mb-2">
                <span className="text-primary" style={{
                  textShadow: '0 0 10px var(--primary), 0 0 20px var(--primary), 0 0 40px var(--primary)',
                  WebkitTextStroke: '0.5px currentColor',
                  paintOrder: 'stroke fill'
                }}>Welcome Back,</span>
                <span className="text-foreground ml-2">{auth.username}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {auth.license?.tier === 'free' ? (
                  <div className="px-4 py-1.5 bg-gradient-to-r from-gray-800/90 to-gray-900/90 border-2 border-cyan-500/50 jagged-corner-small shadow-[0_0_20px_rgba(0,212,255,0.3)]">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                      <span>Free Tier</span>
                      <span className="text-cyan-500">—</span>
                      <span className="text-white">Upgrade for Elite Power</span>
                    </span>
                  </div>
                ) : (
                  <div className="px-3 py-1 bg-accent/20 border border-accent jagged-corner-small">
                    <span className="text-xs font-bold text-accent uppercase tracking-wider">
                      {auth.license?.tier.toUpperCase()} Tier
                    </span>
                  </div>
                )}
                <div className="px-3 py-1 bg-primary/20 border border-primary jagged-corner-small">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Bot: {botRunning ? 'RUNNING' : 'STOPPED'}
                  </span>
                </div>
                <div className="px-3 py-1 border jagged-corner-small" style={{ 
                  backgroundColor: paperTradingMode ? 'oklch(0.68 0.18 330 / 0.2)' : 'oklch(0.65 0.25 25 / 0.2)',
                  borderColor: paperTradingMode ? 'var(--accent)' : 'var(--destructive)'
                }}>
                  <span className="text-xs font-bold uppercase tracking-wider" style={{
                    color: paperTradingMode ? 'var(--accent)' : 'var(--destructive)'
                  }}>
                    {paperTradingMode ? 'PAPER MODE' : 'LIVE TRADING'}
                  </span>
                </div>
                <BestPerformingAgentBadge />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                startTransition(() => {
                  setBotRunning(false)
                  setAuth({
                    isAuthenticated: false,
                    userId: null,
                    username: null,
                    email: null,
                    avatar: null,
                    license: null
                  })
                  toast.info('Logged out successfully - Bot stopped')
                })
              }}
              className="border-primary/50 hover:border-primary hover:bg-primary/10 jagged-corner-small"
              disabled={isPending}
            >
              {isPending ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </div>

      <LicenseExpiry />

      <div 
        className="glass-morph-card p-6 relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 delay-100"
      >
        <div className="absolute inset-0 grid-background opacity-5" />
        <svg className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <circle cx="90%" cy="20%" r="40" stroke="var(--accent)" strokeWidth="2" fill="none" strokeDasharray="5,5" className="circuit-line" />
        </svg>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 jagged-corner-small bg-accent/20 border-2 border-accent/50 relative">
              <Database size={28} weight="duotone" className="text-accent" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase tracking-[0.15em] hud-text text-accent">
                TRADING MODE
              </h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                {paperTradingMode ? 'Paper trading simulates all features without real funds' : 'Live trading with real funds - USE WITH CAUTION'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-background/60 border-2 jagged-corner transition-colors" style={{
            borderColor: paperTradingMode ? 'var(--accent)' : 'var(--destructive)'
          }}>
            <Label htmlFor="paper-mode" className="text-sm font-bold uppercase tracking-wide cursor-pointer transition-colors" style={{
              color: paperTradingMode ? 'var(--accent)' : 'var(--destructive)'
            }}>
              {paperTradingMode ? 'PAPER MODE' : 'LIVE MODE'}
            </Label>
            <Switch
              id="paper-mode"
              checked={paperTradingMode}
              onCheckedChange={(checked) => {
                startTransition(() => {
                  setPaperTradingMode(checked)
                  toast.success(checked ? 'Switched to Paper Trading Mode' : 'Switched to Live Trading Mode', {
                    description: checked 
                      ? 'All trades are simulated - no real funds at risk' 
                      : 'WARNING: Trading with real funds now!'
                  })
                })
              }}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      <div className="cyber-card p-6 angled-corners-dual-tl-br quick-actions" data-tour="quick-actions">
        <div className="flex items-center gap-3 mb-4">
          <Lightning size={24} weight="fill" className="text-accent" />
          <h2 className="text-xl font-bold uppercase tracking-wider text-accent">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action, idx) => {
            const colorClasses = {
              primary: 'bg-primary/10 hover:bg-primary/20 border-primary/50 hover:border-primary text-primary hover:shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.3)]',
              accent: 'bg-accent/10 hover:bg-accent/20 border-accent/50 hover:border-accent text-accent hover:shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]',
              secondary: 'bg-secondary/10 hover:bg-secondary/20 border-secondary/50 hover:border-secondary text-secondary hover:shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]',
              destructive: 'bg-destructive/10 hover:bg-destructive/20 border-destructive/50 hover:border-destructive text-destructive hover:shadow-[0_0_20px_oklch(0.65_0.25_25_/_0.3)]'
            }
            
            return (
              <Button
                key={action.id}
                onClick={action.action}
                data-action={action.id === 'toggle-bot' ? 'start-bot' : undefined}
                data-tour="quick-action"
                className={`w-full ${colorClasses[action.color as keyof typeof colorClasses]} border-2 transition-all ${idx % 2 === 0 ? 'angled-corner-tr' : 'angled-corner-br'} flex-col h-auto py-4 gap-2 relative overflow-hidden group/btn`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-current/5 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  {action.icon}
                </div>
                <span className="text-xs uppercase tracking-wider font-bold relative z-10">{action.label}</span>
              </Button>
            )
          })}
        </div>
      </div>

      <Suspense fallback={<div className="animate-pulse h-48 bg-muted/20 rounded border border-primary/20" />}>
        <AIAdvisor />
      </Suspense>

      {/* ENHANCED: Agent Status section — premium data flow visuals, zero overwhelm */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <AgentStatusCard />
        <ActivityFeed />
      </motion.div>

      {/* Learning Metrics Display */}
      <Suspense fallback={<div className="animate-pulse h-32 bg-muted/20 rounded border border-primary/20" />}>
        <LearningMetricsDisplay />
      </Suspense>

      <Suspense fallback={<div className="animate-pulse h-64 bg-muted/20 rounded border border-accent/20" />}>
        <LogicStream />
      </Suspense>
      </div>

      {/* Autonomous Bot Legal Disclaimer */}
      <AutonomousBotDisclaimer
        isOpen={showBotDisclaimer}
        onClose={() => setShowBotDisclaimer(false)}
        onAccept={() => {
          setShowBotDisclaimer(false)
          // Now allow bot to start
          startTransition(() => {
            setBotRunning(true)
            autonomousBot.setIsActive(true)
            toast.success('🤖 Autonomous Bot Activated', {
              description: 'Bot is now self-sufficient and making autonomous trading decisions',
              duration: 3000,
            })
          })
        }}
      />
    </ErrorBoundary>
  )
}
