import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { UserAuth } from '@/lib/auth'
import { StrategyData } from '@/lib/strategiesData'
import { fetchUserStrategies, filterStrategies, toggleStrategyStatus } from '@/lib/strategiesApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Lock, 
  Crown, 
  MagnifyingGlass, 
  Funnel,
  Lightning,
  Target,
  Brain,
  ChartLine,
  TrendUp,
  Sparkle
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface StrategyCardProps {
  strategy: StrategyData
  onActivate: (id: string) => void
  onUpgrade: () => void
}

function StrategyCard({ strategy, onActivate, onUpgrade }: StrategyCardProps) {
  const [isActive, setIsActive] = useState(strategy.status === 'active')
  const isLocked = !strategy.is_unlocked

  const categoryIcons = {
    'Trend Following': <TrendUp size={16} weight="duotone" />,
    'Mean Reversion': <Target size={16} weight="duotone" />,
    'Oscillator': <ChartLine size={16} weight="duotone" />,
    'Volume': <ChartLine size={16} weight="duotone" />,
    'AI/ML': <Brain size={16} weight="duotone" />,
    'On-Chain': <Lightning size={16} weight="duotone" />,
    'Arbitrage': <Sparkle size={16} weight="duotone" />,
    'DCA': <Target size={16} weight="duotone" />,
    'Advanced': <Crown size={16} weight="duotone" />
  }

  const riskColors = {
    low: 'border-primary text-primary',
    medium: 'border-accent text-accent',
    high: 'border-destructive text-destructive'
  }

  const badgeStyles = {
    'POPULAR': 'bg-primary/20 border-primary text-primary',
    'NEW': 'bg-green-500/20 border-green-500 text-green-500 animate-pulse',
    'EXCLUSIVE': 'bg-accent/20 border-accent text-accent',
    'ELITE ONLY': 'bg-secondary/20 border-secondary text-secondary',
    'LIFETIME EXCLUSIVE': 'bg-gradient-to-r from-accent to-secondary border-accent text-accent',
    'LIVE': 'bg-primary/20 border-primary text-primary animate-pulse'
  }

  const handleToggle = async () => {
    if (isLocked) {
      onUpgrade()
      return
    }

    const newStatus = isActive ? 'paused' : 'active'
    setIsActive(!isActive)
    
    try {
      await toggleStrategyStatus(strategy.id, newStatus)
      toast.success(
        newStatus === 'active' 
          ? `${strategy.name} activated!` 
          : `${strategy.name} paused`
      )
      onActivate(strategy.id)
    } catch (error) {
      setIsActive(isActive) // Revert on error
      toast.error('Failed to update strategy')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`cyber-card relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
        isLocked ? 'opacity-70' : ''
      } ${isActive ? 'border-2 border-primary shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.4)]' : ''}`}
    >
      {/* Badge */}
      {strategy.badge && (
        <div className="absolute top-3 right-3 z-10">
          <Badge className={`${badgeStyles[strategy.badge]} text-[9px] uppercase tracking-wider px-2 py-1 border cut-corner-tr`}>
            {strategy.badge}
          </Badge>
        </div>
      )}

      {/* Lock Overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="text-center space-y-3 p-4">
            <div className="inline-flex p-3 bg-muted/30 border-2 border-muted-foreground/30 angled-corner-br">
              <Lock size={32} weight="duotone" className="text-muted-foreground" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Requires {strategy.tier_required.toUpperCase()} Tier
              </div>
              <Button
                size="sm"
                onClick={onUpgrade}
                className="bg-accent/20 hover:bg-accent/30 border border-accent text-accent text-xs uppercase tracking-wider font-bold cut-corner-tr"
              >
                <Crown size={14} className="mr-1" weight="fill" />
                Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Thumbnail Area with Neon Border */}
      <div className="relative h-32 bg-gradient-to-br from-primary/10 via-background to-accent/10 border-b-2 border-primary/30">
        <div className="absolute inset-0 diagonal-stripes opacity-10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl opacity-20">
            {categoryIcons[strategy.category]}
          </div>
        </div>
        {/* Active Indicator */}
        {isActive && (
          <div className="absolute top-2 left-2 flex items-center gap-2 bg-primary/20 border border-primary px-2 py-1 backdrop-blur-sm">
            <div className="status-indicator" />
            <span className="text-[9px] uppercase tracking-wider text-primary font-bold">ACTIVE</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title & Category */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            {categoryIcons[strategy.category]}
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
              {strategy.name}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {strategy.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-border/50">
          <div className="text-center">
            <div className="data-label text-[9px]">Win Rate</div>
            <div className="text-sm font-bold text-primary">{strategy.win_rate}</div>
          </div>
          <div className="text-center">
            <div className="data-label text-[9px]">Trades</div>
            <div className="text-sm font-bold text-foreground">{strategy.total_trades}</div>
          </div>
          <div className="text-center">
            <div className="data-label text-[9px]">Risk</div>
            <div className={`text-sm font-bold ${riskColors[strategy.risk].split(' ')[1]}`}>
              {strategy.risk.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          <Badge className="bg-muted/30 text-muted-foreground text-[9px] uppercase px-2 py-0.5">
            {strategy.category}
          </Badge>
          <Badge className={`${riskColors[strategy.risk]} bg-transparent text-[9px] uppercase px-2 py-0.5`}>
            {strategy.risk}
          </Badge>
        </div>

        {/* Action Button */}
        <Button
          onClick={handleToggle}
          disabled={isLocked}
          className={`w-full uppercase tracking-wider font-bold text-xs transition-all ${
            isActive
              ? 'bg-primary/20 hover:bg-primary/30 border-2 border-primary text-primary shadow-[0_0_15px_oklch(0.72_0.20_195_/_0.3)]'
              : 'bg-muted/20 hover:bg-muted/30 border border-border text-foreground'
          }`}
        >
          {isLocked ? (
            <>
              <Lock size={14} className="mr-2" weight="duotone" />
              Locked
            </>
          ) : isActive ? (
            <>
              <Lightning size={14} className="mr-2" weight="fill" />
              Active
            </>
          ) : (
            <>
              <Target size={14} className="mr-2" weight="duotone" />
              Activate
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}

export default function StrategyVault() {
  const [auth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })

  const [strategies, setStrategies] = useState<StrategyData[]>([])
  const [filteredStrategies, setFilteredStrategies] = useState<StrategyData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedRisk, setSelectedRisk] = useState<string>('all')
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false)

  const userTier = auth?.license?.tier || 'free'

  // Load strategies
  useEffect(() => {
    const loadStrategies = async () => {
      setLoading(true)
      try {
        const data = await fetchUserStrategies(userTier)
        setStrategies(data)
        setFilteredStrategies(data)
      } catch (error) {
        toast.error('Failed to load strategies')
      } finally {
        setLoading(false)
      }
    }

    loadStrategies()
  }, [userTier])

  // Apply filters
  useEffect(() => {
    let filtered = strategies

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory)
    }

    // Risk filter
    if (selectedRisk !== 'all') {
      filtered = filtered.filter(s => s.risk === selectedRisk)
    }

    // Unlocked only filter
    if (showOnlyUnlocked) {
      filtered = filtered.filter(s => s.is_unlocked)
    }

    setFilteredStrategies(filtered)
  }, [strategies, searchQuery, selectedCategory, selectedRisk, showOnlyUnlocked])

  const handleUpgrade = () => {
    window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'settings' }))
    setTimeout(() => {
      const settingsSection = document.getElementById('subscription-tiers-section')
      settingsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
  }

  const handleActivate = (strategyId: string) => {
    // Update local state
    setStrategies(prev => prev.map(s => 
      s.id === strategyId 
        ? { ...s, status: s.status === 'active' ? 'paused' : 'active' } 
        : s
    ))
  }

  const categories = Array.from(new Set(strategies.map(s => s.category)))
  const unlockedCount = strategies.filter(s => s.is_unlocked).length
  const totalCount = strategies.length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground uppercase tracking-wider text-sm">Loading Strategy Vault...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 diagonal-stripes opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-accent/20 border-2 border-accent angled-corner-br">
              <Crown size={32} weight="fill" className="text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-[0.2em] uppercase text-accent neon-glow-accent">
                Strategy Vault
              </h2>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {unlockedCount} of {totalCount} Strategies Unlocked
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-2 bg-muted/30 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-accent to-secondary"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="cyber-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search strategies..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-muted/30 border border-border text-foreground text-sm uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Risk Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="px-4 py-2 bg-muted/30 border border-border text-foreground text-sm uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <option value="all">All Risk Levels</option>
            <option value="low">Low Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="high">High Risk</option>
          </select>

          {/* Unlocked Only Toggle */}
          <Button
            variant={showOnlyUnlocked ? 'default' : 'outline'}
            onClick={() => setShowOnlyUnlocked(!showOnlyUnlocked)}
            className="uppercase tracking-wider text-xs font-bold"
          >
            <Funnel size={14} className="mr-2" weight="duotone" />
            Unlocked Only
          </Button>
        </div>
      </div>

      {/* Strategy Grid */}
      {filteredStrategies.length === 0 ? (
        <div className="cyber-card p-12 text-center">
          <Target size={64} className="mx-auto mb-4 text-muted-foreground opacity-50" weight="duotone" />
          <p className="text-lg font-bold uppercase tracking-wider text-muted-foreground mb-2">
            No Strategies Found
          </p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or upgrade to unlock more strategies
          </p>
          <Button
            onClick={handleUpgrade}
            className="mt-4 bg-accent/20 hover:bg-accent/30 border border-accent text-accent"
          >
            <Crown size={16} className="mr-2" weight="fill" />
            View Subscription Tiers
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStrategies.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              onActivate={handleActivate}
              onUpgrade={handleUpgrade}
            />
          ))}
        </div>
      )}

      {/* Unlock More CTA */}
      {unlockedCount < totalCount && (
        <div className="cyber-card-accent p-6 text-center">
          <Crown size={32} className="mx-auto mb-3 text-accent" weight="fill" />
          <h3 className="text-lg font-bold uppercase tracking-wider text-accent mb-2">
            Unlock {totalCount - unlockedCount} More Strategies
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Upgrade your subscription to access exclusive AI-powered strategies, on-chain analytics, and custom strategy builder
          </p>
          <Button
            onClick={handleUpgrade}
            className="bg-accent hover:bg-accent/90 text-accent-foreground uppercase tracking-wider font-bold jagged-corner"
            size="lg"
          >
            <Crown size={18} className="mr-2" weight="fill" />
            Upgrade Now
          </Button>
        </div>
      )}
    </div>
  )
}
