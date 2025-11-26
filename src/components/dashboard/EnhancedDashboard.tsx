import { Suspense, useEffect, useMemo, useState, useTransition, useCallback, useRef, type ComponentProps } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Lightning,
  Robot,
  ChartLine,
  Brain,
  Play,
  Stop,
  Crown,
  Users,
  Vault,
  Database,
  TrendUp as TrendingUp,
  WarningCircle as AlertCircle,
  ShieldCheck,
  WaveSine,
  Sparkle
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useKVSafe } from '@/hooks/useKVFallback'
import { usePersistentAuth } from '@/lib/auth/usePersistentAuth'
import { UserAuth } from '@/lib/auth'
import { useLiveTradingData, type SessionEvent } from '@/hooks/useLiveTradingData'
import { useBearMarketDetector } from '@/lib/market/BearMarketDetector'
import { useAutonomousTradingLoop } from '@/lib/bot/AutonomousTradingLoop'
import { useLegalProtection } from '@/lib/legal/LegalProtection'
import { useTaxReserve } from '@/lib/tax/TaxReserveEngine'
import { useProfitOptimizer } from '@/lib/profit/ProfitOptimizer'
import { useAchievements } from '@/hooks/useAchievements'
import ProfitMilestoneCelebration from '@/components/shared/ProfitMilestoneCelebration'
import FirstProfitCelebration from '@/components/shared/FirstProfitCelebration'
import ProgressToFirstProfit from '@/components/shared/ProgressToFirstProfit'
import LicenseExpiry from '@/components/shared/LicenseExpiry'
import BestPerformingAgentBadge from '@/components/shared/BestPerformingAgentBadge'
import NewsOpportunitiesDisplay from '@/components/intelligence/NewsOpportunitiesDisplay'
import TaxDashboardCard from '@/components/dashboard/TaxDashboardCard'
import AutonomousBotDisclaimer from '@/components/legal/AutonomousBotDisclaimer'
import { AgentStatusCard } from './AgentStatusCard'
import { ActivityFeed } from './ActivityFeed'
import { LogicStream } from './LogicStream'
import LearningMetricsDisplay from '@/components/shared/LearningMetricsDisplay'
import NewsTicker from '@/components/shared/NewsTicker'
import LivePriceTicker from '@/components/shared/LivePriceTicker'
import { QuickStatsCard } from './QuickStatsCard'
import { QuickActionButton } from './QuickActionButton'
import { AIAdvisor } from './AIAdvisor'
import { ErrorBoundary } from '@/components/ErrorBoundary'

type InsightMetric = {
  label: string
  value: string
  caption: string
}

const initialAuthState: UserAuth = {
  isAuthenticated: false,
  userId: null,
  username: null,
  email: null,
  avatar: null,
  license: null
}

const defaultPortfolio = {
  solanaBalance: 125.47,
  btcBalance: 0.00234,
  totalValue: 8943.21,
  change24h: 5.72,
  activeAgents: 3
}

const RISK_PRESETS = [
  { id: 'risk-off', label: 'Risk-Off', aggression: 20, capital: 25 },
  { id: 'neutral', label: 'Neutral', aggression: 50, capital: 50 },
  { id: 'risk-on', label: 'Risk-On', aggression: 80, capital: 85 }
] as const

type RiskPreset = typeof RISK_PRESETS[number]
type RiskPresetId = RiskPreset['id']

const StatSkeleton = () => (
  <div className="min-h-[180px] rounded-xl border border-dashed border-primary/30 bg-muted/10 animate-pulse" />
)

export default function EnhancedDashboard() {
  const { logout } = usePersistentAuth()
  const [auth] = useKVSafe<UserAuth>('user-auth', initialAuthState)
  const [botRunning, setBotRunning] = useKVSafe<boolean>('bot-running', false)
  const [paperTradingMode, setPaperTradingMode] = useKVSafe<boolean>('paper-trading-mode', true)
  const [portfolio] = useKVSafe('portfolio-data', defaultPortfolio)
  const [botAggressionValue, setBotAggressionValue] = useKVSafe<number>('bot-aggression', 50)
  const [capitalAllocation, setCapitalAllocation] = useKVSafe<number>('bot-capital-allocation', 50)
  const [isPending, startTransition] = useTransition()
  const [showBotDisclaimer, setShowBotDisclaimer] = useState(false)
  const previousProfitRef = useRef(0)
  const derivePreset = (value: number): RiskPresetId => {
    if (value < 33) return 'risk-off'
    if (value < 67) return 'neutral'
    return 'risk-on'
  }
  const [riskPreset, setRiskPreset] = useState<RiskPresetId>(derivePreset(botAggressionValue))

  // Memoize currentProfit to prevent infinite loops
  const currentProfit = useMemo(() => portfolio.totalValue - 5000, [portfolio.totalValue])
  const previousProfit = previousProfitRef.current
  
  // Update previous profit ref without causing re-renders
  useEffect(() => {
    previousProfitRef.current = currentProfit
  }, [currentProfit])

  useEffect(() => {
    setRiskPreset(derivePreset(botAggressionValue))
  }, [botAggressionValue])

  const liveTrading = useLiveTradingData()
  const safeLive = useMemo(
    () => {
      // Defensive: Ensure all values are numbers
      const weeklyWinRate = typeof liveTrading?.weeklyWinRate === 'number' ? liveTrading.weeklyWinRate : 0
      const totalTrades = typeof liveTrading?.totalTrades === 'number' ? liveTrading.totalTrades : 0
      const dailyStreak = typeof liveTrading?.dailyStreak === 'number' ? liveTrading.dailyStreak : 0
      
      return {
        weeklyWinRate: Number.isFinite(weeklyWinRate) ? weeklyWinRate : 0,
        totalTrades: Number.isFinite(totalTrades) ? totalTrades : 0,
        dailyStreak: Number.isFinite(dailyStreak) ? dailyStreak : 0
      }
    },
    [liveTrading?.weeklyWinRate, liveTrading?.totalTrades, liveTrading?.dailyStreak]
  )

  const achievementsStats = useMemo(
    () => ({
      totalProfit: currentProfit,
      portfolioValue: portfolio.totalValue,
      weeklyWinRate: safeLive.weeklyWinRate,
      totalTrades: safeLive.totalTrades,
      dailyStreak: safeLive.dailyStreak
    }),
    [currentProfit, portfolio.totalValue, safeLive]
  )
  useAchievements({ userStats: achievementsStats, auth })

  const { getTaxSummary } = useTaxReserve()
  const optimizer = useProfitOptimizer()
  const optimizerStats = optimizer.getStats(portfolio.totalValue)

  const { bearState, calculateBearConfidence } = useBearMarketDetector()
  useEffect(() => {
    let mounted = true
    const refresh = async () => {
      try {
        const { fetchLiveMarketData } = await import('@/lib/market/liveMarketData')
        const data = await fetchLiveMarketData()
        if (!mounted) return
        calculateBearConfidence({
          btcDominance: data.btcDominance,
          btcDominanceChange7d: data.btcDominanceChange7d,
          fearGreedIndex: data.fearGreedIndex,
          btcPrice: data.btcPrice,
          btc200WeekMA: data.btc200WeekMA,
          altcoinSeasonIndex: data.altcoinSeasonIndex,
          volumeChange14d: data.volumeChange14d,
          avgFundingRate: data.avgFundingRate,
          sp500Change30d: data.sp500Change30d
        })
      } catch (error) {
        // Silent fail - market detector fallback
      }
    }
    const timer = setTimeout(refresh, 400)
    const interval = setInterval(refresh, 60_000)
    return () => {
      mounted = false
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [calculateBearConfidence])

  const userTier = auth?.license?.tier || 'free'
  const autonomousBot = useAutonomousTradingLoop(userTier)
  const { hasAcknowledgedBot } = useLegalProtection()

  const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

  const quickStats = useMemo(
    () => {
      // Defensive: Ensure all values are valid
      const portfolioValue = typeof portfolio?.totalValue === 'number' ? portfolio.totalValue : 0
      const portfolioChange = typeof portfolio?.change24h === 'number' ? portfolio.change24h : 0
      const activeAgents = typeof portfolio?.activeAgents === 'number' ? portfolio.activeAgents : 0
      const profit = typeof currentProfit === 'number' ? currentProfit : 0
      const winRate = typeof safeLive?.weeklyWinRate === 'number' ? safeLive.weeklyWinRate : 0
      const streak = typeof safeLive?.dailyStreak === 'number' ? safeLive.dailyStreak : 0
      
      return [
        {
          id: 'portfolio',
          label: 'Total Portfolio',
          value: currency.format(portfolioValue),
          change: Number.isFinite(portfolioChange) ? portfolioChange : 0,
          icon: <Vault size={22} weight="duotone" />,
          color: 'primary'
        },
        {
          id: 'profit',
          label: 'Today\'s Profit',
          value: `${profit >= 0 ? '+' : '-'}${currency.format(Math.abs(profit))}`,
          change: Number.isFinite(winRate) ? winRate : 0,
          icon: <TrendingUp size={22} weight="bold" />,
          color: 'accent'
        },
        {
          id: 'agents',
          label: 'Active Agents',
          value: `${activeAgents}/3`,
          change: 0,
          icon: <Robot size={22} weight="duotone" />,
          color: 'secondary'
        },
        {
          id: 'winrate',
          label: 'Win Rate',
          value: `${Number.isFinite(winRate) ? winRate.toFixed(1) : '0.0'}%`,
          change: Number.isFinite(streak) ? streak : 0,
          icon: <Brain size={22} weight="duotone" />,
          color: 'success'
        }
      ]
    },
    [portfolio, currentProfit, safeLive, currency]
  )

  const missionMetrics: InsightMetric[] = [
    {
      label: 'Auto-compounded',
      value: currency.format(optimizerStats.compoundedProfits),
      caption: 'Since activation'
    },
    {
      label: 'Tax reserved YTD',
      value: currency.format(optimizerStats.taxReservedYTD),
      caption: 'Protected capital'
    },
    {
      label: 'Avg position size',
      value: `${optimizerStats.avgPositionSize.toFixed(1)}%`,
      caption: 'Dynamic Kelly sizing'
    }
  ]

  const handleToggleBot = useCallback(() => {
    if (!botRunning && !hasAcknowledgedBot()) {
      setShowBotDisclaimer(true)
      return
    }

    startTransition(() => {
      const nextRunning = !botRunning
      setBotRunning(nextRunning)
      if (autonomousBot) {
        autonomousBot.setIsActive(nextRunning)
      }
      toast.success(nextRunning ? '🤖 Bot online' : 'Bot paused', {
        description: nextRunning
          ? 'Autonomous trading engine is executing the playbook.'
          : 'All orders cancelled, you are in manual control.'
      })
    })
  }, [botRunning, hasAcknowledgedBot, autonomousBot, setBotRunning])

  const navigate = useCallback((tab: string) =>
    window.dispatchEvent(new CustomEvent('navigate-tab', { detail: tab })), [])

  const handlePresetApply = useCallback((preset: RiskPreset) => {
    setRiskPreset(preset.id)
    setBotAggressionValue(preset.aggression)
    setCapitalAllocation(preset.capital)
    toast.success(`${preset.label} macro engaged`, {
      description: `Aggression ${preset.aggression}% • Capital ${preset.capital}%`
    })
  }, [setRiskPreset, setBotAggressionValue, setCapitalAllocation])

  const quickActions = [
    {
      id: 'toggle',
      label: botRunning ? 'Pause Bot' : 'Resume Bot',
      icon: botRunning ? <Stop size={20} weight="fill" /> : <Play size={20} weight="fill" />,
      color: botRunning ? 'destructive' : 'primary',
      action: handleToggleBot
    },
    {
      id: 'analytics',
      label: 'Open Analytics',
      icon: <ChartLine size={20} weight="duotone" />,
      color: 'accent',
      action: () => navigate('analytics')
    },
    {
      id: 'vault',
      label: 'Secure Vault',
      icon: <Vault size={20} weight="duotone" />,
      color: 'secondary',
      action: () => navigate('vault')
    },
    {
      id: 'agents',
      label: 'AI Agents',
      icon: <Robot size={20} weight="duotone" />,
      color: 'primary',
      action: () => navigate('multi-agent')
    },
    {
      id: 'upgrade',
      label: 'Upgrade Tier',
      icon: <Crown size={20} weight="fill" />,
      color: 'accent',
      action: () => navigate('settings')
    }
  ]

  if (!auth?.isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-14 h-14 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm uppercase tracking-[0.35em] text-primary">Syncing cockpit state…</p>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="space-y-8" role="main" aria-label="Quantum Falcon Command Center">
        <CommandHeader
          auth={auth}
          botRunning={botRunning}
          paperTradingMode={paperTradingMode}
          liveTrading={liveTrading}
          onLogout={() => {
            setBotRunning(false)
            logout()
          }}
        />

        <HeroStrap liveTrading={liveTrading} />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickStats && Array.isArray(quickStats) && quickStats.length > 0 ? (
            quickStats.map((stat, index) => {
              // Defensive check - ensure stat is valid
              if (!stat || !stat.id) {
                console.warn('[EnhancedDashboard] Invalid stat at index:', index, stat)
                return null
              }
              return (
                <ErrorBoundary
                  key={stat.id}
                  FallbackComponent={({ error, resetErrorBoundary }) => (
                    <div className="cyber-card p-4 border-destructive/50">
                      <p className="text-xs text-destructive">Stat card error</p>
                      <button
                        onClick={resetErrorBoundary}
                        className="mt-2 px-3 py-1 text-xs bg-primary/20 hover:bg-primary/30 rounded"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                >
                  <QuickStatsCard stat={stat} index={index} />
                </ErrorBoundary>
              )
            })
          ) : (
            <div className="col-span-full cyber-card p-6 text-center">
              <p className="text-sm text-muted-foreground">Loading stats...</p>
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <MissionReadinessPanel
            missionMetrics={missionMetrics}
            optimizerStats={optimizerStats}
            getTaxSummary={getTaxSummary}
          />
          <BotControlPanel
            paperTradingMode={paperTradingMode}
            setPaperTradingMode={(value) =>
              startTransition(() => {
                setPaperTradingMode(value)
                toast.success(value ? 'Paper mode enabled' : 'Live mode armed')
              })
            }
            isPending={isPending}
            quickActions={quickActions}
            riskPreset={riskPreset}
            onSelectPreset={handlePresetApply}
            capitalAllocation={capitalAllocation}
            botAggression={botAggressionValue}
          />
        </div>

        <ProfitMilestoneCelebration currentProfit={currentProfit} previousProfit={previousProfit} />
        <div className="grid gap-4 md:grid-cols-2">
          <Suspense fallback={<StatSkeleton />}>
            <FirstProfitCelebration currentProfit={currentProfit} previousProfit={previousProfit} />
          </Suspense>
          <Suspense fallback={<StatSkeleton />}>
            <ProgressToFirstProfit currentProfit={currentProfit} targetProfit={10} />
          </Suspense>
        </div>

        <div className="grid gap-4 xl:grid-cols-[3fr_2fr]">
          <NewsOpportunitiesDisplay userTier={userTier} />
          <BearMarketPanel bearState={bearState} />
        </div>

        <TaxDashboardCard />

        <SectionCard title="AI Advisor" icon={<Brain size={20} weight="duotone" />}>
          <Suspense fallback={<StatSkeleton />}>
            <ErrorBoundary
              FallbackComponent={({ error, resetErrorBoundary }) => (
                <div className="cyber-card p-6 angled-corner-tl border-destructive/50">
                  <div className="flex items-center gap-3 text-destructive mb-2">
                    <Brain size={24} weight="fill" />
                    <span className="text-sm font-bold uppercase">Neural Forecast Offline</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    The AI advisor encountered an error. Click retry to reconnect.
                  </p>
                  <button
                    onClick={resetErrorBoundary}
                    className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/50 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Retry Neural Link
                  </button>
                </div>
              )}
            >
              <AIAdvisor />
            </ErrorBoundary>
          </Suspense>
        </SectionCard>

        <motion.div
          className="grid gap-4 lg:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <AgentStatusCard />
          <ActivityFeed />
        </motion.div>

        <Suspense fallback={<StatSkeleton />}>
          <LearningMetricsDisplay />
        </Suspense>

        <Suspense fallback={<StatSkeleton />}>
          <LogicStream />
        </Suspense>

        <SessionJournal events={liveTrading.sessionJournal} />

        <LicenseExpiry />
      </div>

      <AutonomousBotDisclaimer
        isOpen={showBotDisclaimer}
        onClose={() => setShowBotDisclaimer(false)}
        onAccept={() => {
          setShowBotDisclaimer(false)
          handleToggleBot()
        }}
      />
    </ErrorBoundary>
  )
}

/* Helper components ------------------------------------------------------ */

const SectionCard = ({
  title,
  icon,
  children,
  actions
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  actions?: React.ReactNode
}) => (
  <div className="cyber-card p-6 space-y-4">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="text-lg font-bold tracking-[0.2em] uppercase">{title}</h3>
      </div>
      {actions}
    </div>
    {children}
  </div>
)

const CommandHeader = ({
  auth,
  botRunning,
  paperTradingMode,
  liveTrading,
  onLogout
}: {
  auth: UserAuth
  botRunning: boolean
  paperTradingMode: boolean
  liveTrading: ReturnType<typeof useLiveTradingData>
  onLogout: () => void
}) => (
  <div className="cyber-card relative overflow-hidden p-6">
    <div className="absolute inset-0 diagonal-stripes opacity-10 pointer-events-none" />
    <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.6em] text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Command Center
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <h1 className="text-3xl font-black tracking-[0.2em] uppercase">
            Welcome back, <span className="text-primary">{auth.username}</span>
          </h1>
          <BestPerformingAgentBadge />
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <HeroBadge
            label={`${auth.license?.tier?.toUpperCase() || 'FREE'} TIER`}
            icon={<Crown size={14} weight="fill" />}
          />
          <HeroBadge
            label={botRunning ? 'BOT ONLINE' : 'BOT STANDBY'}
            icon={<Lightning size={14} weight="bold" />}
            variant={botRunning ? 'success' : 'neutral'}
          />
          <HeroBadge
            label={paperTradingMode ? 'SIMULATION' : 'LIVE CAPITAL'}
            icon={<ShieldCheck size={14} weight="bold" />}
            variant={paperTradingMode ? 'accent' : 'alert'}
          />
        </div>
      </div>
      <div className="flex flex-col gap-3 items-end">
        <LivePnLSparkline liveTrading={liveTrading} />
        <Button onClick={onLogout} variant="outline" className="border-primary/50 hover:bg-primary/10">
          Log out
        </Button>
      </div>
    </div>
  </div>
)

const HeroBadge = ({
  label,
  icon,
  variant = 'primary'
}: {
  label: string
  icon: React.ReactNode
  variant?: 'primary' | 'success' | 'accent' | 'alert' | 'neutral'
}) => {
  const tones: Record<typeof variant, string> = {
    primary: 'border-primary/50 text-primary',
    success: 'border-green-400/50 text-green-300',
    accent: 'border-accent/50 text-accent',
    alert: 'border-red-400/60 text-red-300',
    neutral: 'border-muted/60 text-muted-foreground'
  }
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-bold uppercase tracking-wider jagged-corner-small bg-background/60 border ${tones[variant]}`}
    >
      {icon}
      {label}
    </span>
  )
}

const HeroStrap = ({
  liveTrading
}: {
  liveTrading: ReturnType<typeof useLiveTradingData>
}) => (
  <div className="grid gap-3 md:grid-cols-3">
    <Suspense fallback={<StatSkeleton />}>
      <NewsTicker />
    </Suspense>
    <Suspense fallback={<StatSkeleton />}>
      <LivePriceTicker />
    </Suspense>
    <div className="cyber-card flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Realized PnL</p>
          <p className="text-2xl font-black text-primary">
            {liveTrading.dailyPnL >= 0 ? '+' : '-'}
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
              Math.abs(liveTrading.dailyPnL)
            )}
          </p>
        </div>
        <p className="text-xs text-muted-foreground text-right">
          {liveTrading.isLoading ? 'Updating…' : 'Live momentum'}
        </p>
      </div>
      <Sparkline values={liveTrading.pnLHistory || []} />
    </div>
  </div>
)

const MissionReadinessPanel = ({
  missionMetrics,
  optimizerStats,
  getTaxSummary
}: {
  missionMetrics: InsightMetric[]
  optimizerStats: ReturnType<typeof useProfitOptimizer>['getStats']
  getTaxSummary: ReturnType<typeof useTaxReserve>['getTaxSummary']
}) => {
  const taxSummary = getTaxSummary()

  return (
    <SectionCard title="Mission Readiness" icon={<TrendingUp size={20} weight="bold" />}>
      <div className="grid gap-4 md:grid-cols-3">
        {missionMetrics.map((metric) => (
          <div key={metric.label} className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{metric.label}</p>
            <p className="text-2xl font-black mt-2">{metric.value}</p>
            <p className="text-xs text-muted-foreground">{metric.caption}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
          <p className="text-xs uppercase tracking-[0.35em] text-accent flex items-center gap-2">
            <WaveSine size={14} weight="bold" />
            Bot Rhythm
          </p>
          <p className="text-4xl font-black mt-3">
            {optimizerStats.status === 'active' ? 'Stable +2.1%' : 'Paused'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Rolling 7-day PnL delta</p>
        </div>
        <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30">
          <p className="text-xs uppercase tracking-[0.35em] text-secondary flex items-center gap-2">
            <Sparkle size={14} weight="fill" />
            Compliance
          </p>
          <p className="text-4xl font-black mt-3">{taxSummary?.coverage || '99%'}</p>
          <p className="text-xs text-muted-foreground mt-1">Tax coverage | auto archived</p>
        </div>
      </div>
    </SectionCard>
  )
}

const BotControlPanel = ({
  paperTradingMode,
  setPaperTradingMode,
  isPending,
  quickActions,
  riskPreset,
  onSelectPreset,
  capitalAllocation,
  botAggression
}: {
  paperTradingMode: boolean
  setPaperTradingMode: (value: boolean) => void
  isPending: boolean
  quickActions: Array<ComponentProps<typeof QuickActionButton>['action']>
  riskPreset: RiskPresetId
  onSelectPreset: (preset: RiskPreset) => void
  capitalAllocation: number
  botAggression: number
}) => (
  <SectionCard title="Controls" icon={<Lightning size={20} weight="bold" />}>
    <div className="flex items-center justify-between gap-3 bg-background/60 border border-primary/20 rounded-xl p-4">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Trading Mode</p>
        <p className="text-lg font-bold">{paperTradingMode ? 'Paper Simulation' : 'Live Capital'}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Aggression {botAggression}% • Capital {capitalAllocation}% deployed
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="mode-toggle" className="text-xs uppercase tracking-[0.35em]">
          {paperTradingMode ? 'Paper' : 'Live'}
        </Label>
        <Switch
          id="mode-toggle"
          checked={paperTradingMode}
          disabled={isPending}
          onCheckedChange={setPaperTradingMode}
        />
      </div>
    </div>
    <RiskPresetButtons activePreset={riskPreset} onSelect={onSelectPreset} />
    <div className="grid grid-cols-2 gap-3 mt-4 lg:grid-cols-3">
      {quickActions.map((action, index) => (
        <QuickActionButton key={action.id} action={action} index={index} />
      ))}
    </div>
  </SectionCard>
)

const BearMarketPanel = ({
  bearState
}: {
  bearState: ReturnType<typeof useBearMarketDetector>['bearState']
}) => {
  if (!bearState || bearState.confidence <= 0) {
    return (
      <SectionCard title="Market Watch" icon={<AlertCircle size={18} weight="bold" />}>
        <p className="text-sm text-muted-foreground">All clear. No critical signals detected.</p>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="Market Watch"
      icon={<AlertCircle size={18} weight="bold" />}
      actions={<span className="text-xs font-black tracking-[0.3em] text-red-400">{bearState.confidence}% RISK</span>}
    >
      <p className="text-lg font-bold">
        {bearState.status === 'extreme_bear'
          ? 'Extreme bear pressure'
          : bearState.status === 'bear'
            ? 'Bear mode active'
            : 'Monitoring turbulence'}
      </p>
      <div className="space-y-2 mt-3">
        {bearState.signals
          .filter((signal) => signal.active)
          .map((signal, idx) => (
            <div
              key={`${signal.name}-${idx}`}
              className="flex items-center justify-between rounded-lg border border-red-400/30 bg-red-400/5 px-3 py-2 text-sm"
            >
              <span>{signal.name}</span>
              <span className="font-bold text-red-300">+{signal.points} pts</span>
            </div>
          ))}
      </div>
    </SectionCard>
  )
}

const SessionJournal = ({ events }: { events: SessionEvent[] }) => {
  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric' }),
    []
  )

  return (
    <SectionCard title="Session Journal" icon={<Robot size={18} weight="duotone" />}>
      {events.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Bot is running quietly. No notable events logged in the last hour.
        </p>
      ) : (
        <ol className="space-y-3">
          {events.map((event) => (
            <li key={event.id} className="flex items-start gap-3">
              <span className="text-xs text-muted-foreground w-16">
                {timeFormatter.format(event.timestamp)}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{event.label}</p>
                <p className="text-xs text-muted-foreground">{event.detail}</p>
              </div>
              <span
                className={`text-xs font-bold ${
                  event.impact >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {event.impact >= 0 ? '+' : ''}
                {event.impact.toFixed(0)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </SectionCard>
  )
}

const LivePnLSparkline = ({ liveTrading }: { liveTrading: ReturnType<typeof useLiveTradingData> }) => {
  const values = liveTrading.pnLHistory || []
  if (!values.length) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="w-2 h-2 rounded-full bg-muted animate-pulse" />
        Gathering PnL telemetry…
      </div>
    )
  }

  const normalized = values.slice(-20)
  const max = Math.max(...normalized, 1)
  const min = Math.min(...normalized, -1)
  const range = max - min || 1

  const points = normalized
    .map((value, index) => {
      const x = (index / (normalized.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    })
    .join(' ')

  const trendUp = normalized[normalized.length - 1] >= normalized[0]

  return (
    <div className="px-3 py-2 bg-background/80 border border-primary/20 rounded-lg w-[240px]">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">
        <span>PnL Telemetry</span>
        <span className={trendUp ? 'text-green-400' : 'text-red-400'}>
          {trendUp ? '↑ growing' : '↓ cooling'}
        </span>
      </div>
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-12">
        <polyline
          fill="none"
          stroke={trendUp ? 'url(#pnl-gradient-up)' : 'url(#pnl-gradient-down)'}
          strokeWidth="2"
          points={points}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="pnl-gradient-up" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14F195" />
            <stop offset="100%" stopColor="#00D4FF" />
          </linearGradient>
          <linearGradient id="pnl-gradient-down" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F87171" />
            <stop offset="100%" stopColor="#FDBA74" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

const Sparkline = ({ values }: { values: number[] }) => {
  if (!values.length) {
    return <div className="h-16 rounded bg-muted/30 animate-pulse" />
  }
  const normalized = values.slice(-20)
  const max = Math.max(...normalized, 1)
  const min = Math.min(...normalized, -1)
  const range = max - min || 1
  const points = normalized
    .map((value, index) => {
      const x = (index / (normalized.length - 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-16">
      <polyline
        fill="none"
        stroke="url(#sparkline-gradient)"
        strokeWidth="2"
        points={points}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#14F195" />
          <stop offset="100%" stopColor="#00D4FF" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const RiskPresetButtons = ({
  activePreset,
  onSelect
}: {
  activePreset: RiskPresetId
  onSelect: (preset: RiskPreset) => void
}) => (
  <div className="flex flex-wrap gap-2">
    {RISK_PRESETS.map((preset) => (
      <Button
        key={preset.id}
        variant={preset.id === activePreset ? 'default' : 'outline'}
        size="sm"
        className="text-xs tracking-[0.2em]"
        onClick={() => onSelect(preset)}
      >
        {preset.label}
      </Button>
    ))}
  </div>
)

