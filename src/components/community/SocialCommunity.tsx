// QUANTUM FALCON COMMUNITY TAB — REBUILT FROM SCRATCH
// November 24, 2025 — Complete rebuild to fix import errors
// All functionality preserved, all icons validated

import { useState, useEffect, useMemo } from 'react'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  ChatCircle, Fire, Users, Clock, Code, Lightning, 
  MagnifyingGlass, FunnelSimple, Plus, Lock, ShoppingCart, 
  Crown, Sparkle, CaretLeft, CaretRight, TrendUp, Heart,
  EyeSlash, Play, Pause, Stop, CheckCircle, Trophy, Medal, Star, SquaresFour
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { 
  fetchAllStrategies, 
  fetchFeaturedStrategies,
  claimStrategy,
  type Strategy as ApiStrategy, 
  type StrategyFilters 
} from '@/lib/api/strategies'
import { CategoryIcon, getCategoryColor } from '@/components/shared/CategoryIcons'
import { getRotatingOffers, getTimeUntilNextRotation, type RotatingOffer } from '@/lib/rotatingOffers'
import LimitedOffersSection from './LimitedOffersSection'
import Forum from './Forum'
import StrategyMarketplace from './StrategyMarketplace'
import CreateStrategyTeaser from './CreateStrategyTeaser'
import ShareYourGains from './ShareYourGains'
import RealTimeActivityFeed from './RealTimeActivityFeed'
import NFTGallery from './NFTGallery'
import CopyTrader from './CopyTrader'
import CheckoutDialog from '@/components/shared/CheckoutDialog'
import { CheckoutItem } from '@/lib/checkout'
import { UserAuth } from '@/lib/auth'
import { usePersistentAuth } from '@/lib/auth/usePersistentAuth'
import { cn } from '@/lib/utils'

const COMMUNITY_SIGNALS = [
  { label: 'Live Rooms Online', value: '1287 traders', detail: 'Alpha FM • Flow Ops • Copy Cabal' },
  { label: 'Strategies Shared Today', value: '342 uploads', detail: '51% monetized • 38% free' },
  { label: 'Community P&L (24h)', value: '+$2.4M', detail: 'Verified wallets only' },
]

const COMMUNITY_HUBS = [
  {
    title: 'Alpha Lounge',
    description: 'Long-form breakdowns, chart dissection, macro notes. No spam, only signal.',
    badge: 'Invite-only',
  },
  {
    title: 'Build League',
    description: 'Pair-program Monaco editor, share snippets, get instant code reviews from elite tiers.',
    badge: 'Open 24/7',
  },
  {
    title: 'Signal Firehose',
    description: 'Crowdsourced scalp alerts, whale sweeps, and social blasts curated every 30 seconds.',
    badge: 'Trending',
  },
]

const COMMUNITY_BEACONS = [
  { label: 'Top Builder', value: 'AtlasQuant', stat: '$64k royalties', detail: '12 live bots' },
  { label: 'Fastest Deployment', value: '9m 24s', stat: 'Backtest → Launch', detail: 'Momentum Tsunami' },
  { label: 'Live Call Rooms', value: '38 sessions', stat: 'Alpha FM • Flow Ops', detail: 'Invite-only' },
]

const THREAD_UPDATES = [
  { title: 'Whale Sweep Radar', summary: '5 wallets accumulating SOL perp size +$18M', tag: 'War Room' },
  { title: 'Strategy Bounties', summary: '0% fee weekend for sentiment scouts', tag: 'Bounty' },
  { title: 'Compliance Ping', summary: 'Vault sweeps triggered for 12 creators', tag: 'Ops' },
]

export default function SocialCommunity() {
  // Use persistent auth for accurate tier detection
  const { auth } = usePersistentAuth()

  const [strategies, setStrategies] = useState<ApiStrategy[]>([])
  const [featuredStrategies, setFeaturedStrategies] = useState<ApiStrategy[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSort, setSelectedSort] = useState<'hot' | 'new' | 'roi' | 'winrate'>('hot')
  const [heroIndex, setHeroIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isAutoPaused, setIsAutoPaused] = useState(false)
  const [strategyViews, setStrategyViews] = useKV<Record<string, number>>('strategy-views', {})
  const [autoPlayProgress, setAutoPlayProgress] = useState(0)
  
  const [ownedStrategies, setOwnedStrategies] = useKV<string[]>('owned-strategies', [])
  const [activeStrategies, setActiveStrategies] = useKV<string[]>('active-strategies', [])
  
  const [rotatingOffers, setRotatingOffers] = useState<RotatingOffer[]>([])
  const [timeUntilRotation, setTimeUntilRotation] = useState({ days: 0, hours: 0, minutes: 0 })
  const [purchasedOffers, setPurchasedOffers] = useKV<string[]>('purchased-rotating-offers', [])
  
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CheckoutItem | null>(null)
  
  // State for controlling community tabs (for external navigation)
  const [communityActiveTab, setCommunityActiveTab] = useState('strategies')

  const rawUserTier = auth?.license?.tier || 'free'
  const userTier = rawUserTier.charAt(0).toUpperCase() + rawUserTier.slice(1).toLowerCase()
  
  // Check for full access (lifetime/god/master)
  const hasFullAccess = rawUserTier.toLowerCase() === 'lifetime' || rawUserTier.toLowerCase() === 'god' || rawUserTier.toLowerCase() === 'master'

  const tierHierarchy: Record<string, number> = {
    'Free': 0, 'free': 0,
    'Starter': 1, 'starter': 1,
    'Trader': 2, 'trader': 2,
    'Pro': 3, 'pro': 3,
    'Elite': 4, 'elite': 4,
    'Lifetime': 5, 'lifetime': 5,
    'God': 5, 'god': 5,
    'Master': 5, 'master': 5
  }

  useEffect(() => {
    loadFeaturedStrategies()
    loadStrategies()
  }, [])

  // Event listener for external navigation to NFT tab
  useEffect(() => {
    const handleOpenNFTTab = () => {
      setCommunityActiveTab('nft')
    }
    
    window.addEventListener('open-community-nft-tab', handleOpenNFTTab)
    return () => window.removeEventListener('open-community-nft-tab', handleOpenNFTTab)
  }, [])

  useEffect(() => {
    setRotatingOffers(getRotatingOffers(6))
    
    const updateTimer = () => {
      setTimeUntilRotation(getTimeUntilNextRotation())
    }
    
    updateTimer()
    const interval = setInterval(updateTimer, 60000)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isTransitioning || isAutoPaused || featuredStrategies.length === 0) {
      setAutoPlayProgress(0)
      return
    }

    setAutoPlayProgress(0)
    const progressInterval = setInterval(() => {
      setAutoPlayProgress((prev) => {
        if (prev >= 100) return 0
        return prev + 2
      })
    }, 100)

    const heroTimer = setInterval(() => {
      if (!isTransitioning && !isAutoPaused) {
        setHeroIndex((prev) => (prev + 1) % Math.min(featuredStrategies.length, 6))
      }
    }, 5000)

    return () => {
      clearInterval(heroTimer)
      clearInterval(progressInterval)
    }
  }, [featuredStrategies.length, isTransitioning, isAutoPaused, heroIndex])

  useEffect(() => {
    setPage(1)
    loadStrategies(true)
  }, [searchQuery, selectedCategory, selectedSort])

  async function loadFeaturedStrategies() {
    try {
      const featured = await fetchFeaturedStrategies()
      setFeaturedStrategies(featured.slice(0, 6))
    } catch (error) {
      console.error('Failed to load featured strategies:', error)
      setFeaturedStrategies([])
    }
  }

  async function loadStrategies(reset = false) {
    setLoading(true)
    try {
      const filters: StrategyFilters = {
        page: reset ? 1 : page,
        limit: 12,
        sort: selectedSort
      }

      if (searchQuery) filters.search = searchQuery
      if (selectedCategory !== 'all') filters.category = selectedCategory

      const result = await fetchAllStrategies(filters)
      
      if (reset) {
        setStrategies(result.strategies)
      } else {
        setStrategies((prev) => [...prev, ...result.strategies])
      }
      
      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Failed to load strategies:', error)
      toast.error('Failed to load strategies', {
        description: 'Please try again later'
      })
    } finally {
      setLoading(false)
    }
  }

  function canAccessStrategy(strategy: ApiStrategy): boolean {
    // Lifetime/God/Master = full access to everything
    if (hasFullAccess) return true
    
    if (strategy.is_user_created && strategy.author_id === auth?.userId) return true
    
    const userTierLevel = tierHierarchy[userTier] || 0
    const requiredTierLevel = tierHierarchy[strategy.tier_required] || 0
    
    return userTierLevel >= requiredTierLevel
  }

  function isStrategyOwned(strategyId: string): boolean {
    return ownedStrategies?.includes(strategyId) || false
  }

  function isStrategyActive(strategyId: string): boolean {
    return activeStrategies?.includes(strategyId) || false
  }

  async function handleClaimStrategy(strategy: ApiStrategy) {
    if (strategy.price_cents && strategy.price_cents > 0) {
      const checkoutItem: CheckoutItem = {
        id: strategy.id,
        name: strategy.name,
        description: strategy.description,
        price: strategy.price_cents / 100,
        type: 'strategy',
        duration: strategy.duration_hours || undefined
      }
      setSelectedItem(checkoutItem)
      setCheckoutOpen(true)
      return
    }

    try {
      const result = await claimStrategy(strategy.id)
      
      if (result.success) {
        setOwnedStrategies((current) => [...(current || []), strategy.id])
        toast.success('Strategy Unlocked!', {
          description: `${strategy.name} is now available`,
          icon: '✨'
        })
      } else {
        toast.error('Failed to claim strategy', {
          description: result.message || 'Please try again'
        })
      }
    } catch (error) {
      console.error('Failed to claim strategy:', error)
      toast.error('Failed to claim strategy', {
        description: 'Please try again'
      })
    }
  }

  function handleToggleStrategy(strategyId: string) {
    if (isStrategyActive(strategyId)) {
      setActiveStrategies((current) => (current || []).filter(id => id !== strategyId))
      toast.info('Strategy Paused')
    } else {
      setActiveStrategies((current) => [...(current || []), strategyId])
      toast.success('Strategy Activated!', {
        icon: '🚀'
      })
    }
  }

  const handleCheckoutSuccess = () => {
    if (selectedItem && selectedItem.type === 'strategy') {
      setOwnedStrategies((current) => [...(current || []), selectedItem.id])
      
      toast.success('Purchase Successful!', {
        description: `${selectedItem.name} is now yours!`,
        icon: '🎉'
      })
    } else if (selectedItem && selectedItem.type === 'offer') {
      setPurchasedOffers((current) => [...(current || []), selectedItem.id])
      
      toast.success('Offer Activated!', {
        description: `${selectedItem.name} ${selectedItem.duration ? `for ${selectedItem.duration}h` : ''}`,
        icon: '✨'
      })
    }
  }

  const categories = ['all', 'Trend', 'Mean Reversion', 'Arbitrage', 'Breakout', 'On-Chain', 'ML', 'Custom']

  const currentHeroStrategy = featuredStrategies[heroIndex]

  const handleHeroNavigation = (newIndex: number) => {
    if (isTransitioning) return
    setHeroIndex(newIndex)
    setIsAutoPaused(true)
    setAutoPlayProgress(0)
    setTimeout(() => setIsAutoPaused(false), 10000)
  }

  const trackStrategyView = (strategyId: string) => {
    setStrategyViews((current) => ({
      ...(current || {}),
      [strategyId]: ((current || {})[strategyId] || 0) + 1
    }))
  }

  const getStrategyPerformanceBadge = (winRate: number, roi: number) => {
    if (winRate >= 80 && roi >= 50) {
      return { icon: Trophy, color: 'text-accent', label: 'Elite', bg: 'bg-accent/20', border: 'border-accent' }
    } else if (winRate >= 70 && roi >= 30) {
      return { icon: Medal, color: 'text-primary', label: 'Pro', bg: 'bg-primary/20', border: 'border-primary' }
    } else if (winRate >= 60 && roi >= 15) {
      return { icon: Star, color: 'text-secondary', label: 'Solid', bg: 'bg-secondary/20', border: 'border-secondary' }
    }
    return null
  }

  const getStrategyPopularity = (views: number, likes: number) => {
    const totalEngagement = (views || 0) + (likes || 0) * 10
    if (totalEngagement >= 10000) return { label: 'Viral', color: 'text-destructive', pulse: true }
    if (totalEngagement >= 5000) return { label: 'Trending', color: 'text-accent', pulse: true }
    if (totalEngagement >= 1000) return { label: 'Popular', color: 'text-primary', pulse: false }
    return null
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        <div className="cyber-card p-6 relative overflow-hidden">
          <div className="absolute inset-0 technical-grid opacity-10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users size={32} weight="duotone" className="text-primary neon-glow-primary" />
                <div>
                  <h2 className="text-2xl font-bold uppercase tracking-[0.2em] text-primary">Strategy Marketplace & Flash Sales</h2>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {strategies.length}+ Live Strategies • One-Click Deploy • Earn Royalties
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-accent/20 border-2 border-accent text-accent uppercase tracking-wider">
                  <Crown size={14} weight="fill" className="mr-1" />
                  {userTier} Tier
                </Badge>
                {Object.keys(strategyViews || {}).length > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring" }}
                  >
                    <Badge className="bg-primary/20 border-2 border-primary text-primary uppercase tracking-wider">
                      <EyeSlash size={14} weight="fill" className="mr-1" />
                      {Object.values(strategyViews || {}).reduce((a, b) => a + b, 0)} Views
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COMMUNITY_SIGNALS.map(signal => (
            <div key={signal.label} className="glass-morph-card p-5 border border-white/5">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{signal.label}</p>
              <p className="text-2xl font-black text-primary mt-2">{signal.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{signal.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COMMUNITY_HUBS.map(hub => (
            <div key={hub.title} className="cyber-card p-5 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black uppercase tracking-[0.15em] text-primary">{hub.title}</h3>
                <Badge className="bg-primary/20 border border-primary text-primary">{hub.badge}</Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{hub.description}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COMMUNITY_BEACONS.map((beacon) => (
            <div key={beacon.label} className="glass-morph-card p-5 border border-white/10 space-y-2">
              <p className="text-[11px] uppercase tracking-[0.4em] text-muted-foreground">{beacon.label}</p>
              <p className="text-2xl font-black text-primary">{beacon.value}</p>
              <p className="text-xs text-muted-foreground">{beacon.detail}</p>
              <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.3em]">{beacon.stat}</p>
            </div>
          ))}
        </div>

        <div className="glass-morph-card p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black uppercase tracking-[0.2em] text-primary">Live Thread Updates</h3>
            <Badge className="bg-accent/20 border border-accent text-accent uppercase tracking-wider">Realtime</Badge>
          </div>
          <div className="space-y-4">
            {THREAD_UPDATES.map((thread, index) => (
              <div key={thread.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center text-[11px] font-bold text-primary">{String(index + 1).padStart(2, '0')}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{thread.title}</p>
                    <Badge variant="outline" className="text-[10px]">{thread.tag}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{thread.summary}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {featuredStrategies.length > 0 && (
          <div 
            className="relative overflow-hidden group"
            onMouseEnter={() => setIsAutoPaused(true)}
            onMouseLeave={() => setIsAutoPaused(false)}
          >
            <AnimatePresence mode="wait" initial={false} onExitComplete={() => setIsTransitioning(false)}>
              <motion.div
                key={heroIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                onAnimationStart={() => {
                  setIsTransitioning(true)
                  if (currentHeroStrategy) {
                    trackStrategyView(currentHeroStrategy.id)
                  }
                }}
                className="glass-morph-card p-8 relative overflow-hidden min-h-[400px]"
              >
                {currentHeroStrategy && (
                  <>
                    <div className="absolute inset-0 diagonal-stripes opacity-5" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-accent/20 to-transparent blur-3xl" />
                    
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <CategoryIcon 
                              category={currentHeroStrategy.category} 
                              tier={currentHeroStrategy.tier_required}
                              size={48}
                            />
                            {currentHeroStrategy.is_featured && (
                              <Badge className="bg-accent/20 border border-accent text-accent animate-pulse">
                                <Sparkle size={12} weight="fill" className="mr-1" />
                                FEATURED
                              </Badge>
                            )}
                            {currentHeroStrategy.is_hot && (
                              <Badge className="bg-destructive/20 border border-destructive text-destructive animate-pulse">
                                <Fire size={12} weight="fill" className="mr-1" />
                                HOT
                              </Badge>
                            )}
                          </div>
                          
                          <h3 className="text-4xl font-black uppercase tracking-wide neon-glow-primary">
                            {currentHeroStrategy.name}
                          </h3>
                          
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {currentHeroStrategy.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                          <div className="cyber-card p-3 text-center">
                            <div className="text-2xl font-bold text-primary">{currentHeroStrategy.stats.win_rate}%</div>
                            <div className="text-[9px] text-muted-foreground uppercase">Win Rate</div>
                          </div>
                          <div className="cyber-card p-3 text-center">
                            <div className="text-2xl font-bold">{currentHeroStrategy.stats.total_trades}</div>
                            <div className="text-[9px] text-muted-foreground uppercase">Trades</div>
                          </div>
                          <div className="cyber-card p-3 text-center">
                            <div className="text-2xl font-bold text-accent">+{currentHeroStrategy.stats.avg_roi}%</div>
                            <div className="text-[9px] text-muted-foreground uppercase">ROI</div>
                          </div>
                          <div className="cyber-card p-3 text-center">
                            <div className="text-2xl font-bold text-primary">${(currentHeroStrategy.stats.live_pnl).toFixed(0)}</div>
                            <div className="text-[9px] text-muted-foreground uppercase">Live P&L</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {canAccessStrategy(currentHeroStrategy) ? (
                            <>
                              <Button 
                                size="lg"
                                onClick={() => handleToggleStrategy(currentHeroStrategy.id)}
                                className="flex-1 jagged-corner uppercase tracking-wider font-bold"
                              >
                                {isStrategyActive(currentHeroStrategy.id) ? (
                                  <>
                                    <Pause size={18} weight="fill" className="mr-2" />
                                    Pause Strategy
                                  </>
                                ) : (
                                  <>
                                    <Play size={18} weight="fill" className="mr-2" />
                                    Activate Now
                                  </>
                                )}
                              </Button>
                            </>
                          ) : (
                            <Button 
                              size="lg"
                              onClick={() => handleClaimStrategy(currentHeroStrategy)}
                              className="flex-1 jagged-corner uppercase tracking-wider font-bold bg-accent hover:bg-accent/90"
                            >
                              {currentHeroStrategy.price_cents ? (
                                <>
                                  <ShoppingCart size={18} weight="fill" className="mr-2" />
                                  Buy ${(currentHeroStrategy.price_cents / 100).toFixed(2)}
                                </>
                              ) : (
                                <>
                                  <Lock size={18} weight="fill" className="mr-2" />
                                  Unlock in {currentHeroStrategy.tier_required}
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="relative">
                        <div className="cyber-card p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="uppercase text-xs">
                              {currentHeroStrategy.category}
                            </Badge>
                            <Badge className="bg-primary/20 border border-primary text-primary uppercase text-xs">
                              {currentHeroStrategy.tier_required}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground flex items-center gap-2">
                                <Heart size={14} />
                                Likes
                              </span>
                              <motion.span 
                                className="font-bold"
                                key={currentHeroStrategy.likes}
                                initial={{ scale: 1.2, color: 'oklch(0.72 0.20 195)' }}
                                animate={{ scale: 1, color: 'inherit' }}
                                transition={{ duration: 0.3 }}
                              >
                                {currentHeroStrategy.likes?.toLocaleString()}
                              </motion.span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground flex items-center gap-2">
                                <EyeSlash size={14} />
                                Views
                              </span>
                              <motion.span 
                                className="font-bold"
                                key={currentHeroStrategy.views}
                                initial={{ scale: 1.2, color: 'oklch(0.68 0.18 330)' }}
                                animate={{ scale: 1, color: 'inherit' }}
                                transition={{ duration: 0.3 }}
                              >
                                {currentHeroStrategy.views?.toLocaleString()}
                              </motion.span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground flex items-center gap-2">
                                <ChatCircle size={14} />
                                Comments
                              </span>
                              <span className="font-bold">{currentHeroStrategy.comments}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                            {currentHeroStrategy.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-[10px]">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute bottom-6 right-6 flex items-center gap-2">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleHeroNavigation((heroIndex - 1 + featuredStrategies.length) % featuredStrategies.length)}
                          disabled={isTransitioning}
                          className="w-10 h-10 p-0 transition-all disabled:opacity-50 hover:bg-primary/20 hover:border-primary hover:shadow-[0_0_15px_oklch(0.72_0.20_195_/_0.4)]"
                        >
                          <CaretLeft size={20} weight="bold" />
                        </Button>
                      </motion.div>
                      <div className="flex gap-1">
                        {featuredStrategies.slice(0, 6).map((_, idx) => (
                          <div key={idx} className="relative">
                            <motion.button
                              onClick={() => handleHeroNavigation(idx)}
                              disabled={isTransitioning}
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              className={cn(
                                "w-2 h-2 rounded-full transition-all disabled:opacity-50",
                                idx === heroIndex 
                                  ? "bg-primary w-8 shadow-[0_0_10px_oklch(0.72_0.20_195)]" 
                                  : "bg-muted hover:bg-primary/50"
                              )}
                            />
                            {idx === heroIndex && !isAutoPaused && (
                              <motion.div
                                className="absolute inset-0 bg-primary/30 rounded-full"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: autoPlayProgress / 100 }}
                                transition={{ duration: 0.1, ease: "linear" }}
                                style={{ transformOrigin: "left" }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleHeroNavigation((heroIndex + 1) % featuredStrategies.length)}
                          disabled={isTransitioning}
                          className="w-10 h-10 p-0 transition-all disabled:opacity-50 hover:bg-primary/20 hover:border-primary hover:shadow-[0_0_15px_oklch(0.72_0.20_195_/_0.4)]"
                        >
                          <CaretRight size={20} weight="bold" />
                        </Button>
                      </motion.div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <RealTimeActivityFeed />
          <ShareYourGains 
            profit={auth?.license?.tier === 'Elite' ? 342.56 : 0}
            winRate={68.5}
            strategyName="Liquidity Hunter"
          />
        </div>

        <Tabs value={communityActiveTab} onValueChange={setCommunityActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-card/50 backdrop-blur-sm border-2 border-primary/30 p-1 gap-1">
            <TabsTrigger 
              value="strategies" 
              className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary jagged-corner-small transition-all"
            >
              <Code size={16} weight="duotone" className="mr-2" />
              Strategies
            </TabsTrigger>
            <TabsTrigger 
              value="marketplace" 
              className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-accent/20 data-[state=active]:text-accent data-[state=active]:border-2 data-[state=active]:border-accent jagged-corner-small transition-all"
            >
              <ShoppingCart size={16} weight="duotone" className="mr-2" />
              Marketplace
            </TabsTrigger>
            <TabsTrigger 
              value="forum" 
              className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-accent/20 data-[state=active]:text-accent data-[state=active]:border-2 data-[state=active]:border-accent jagged-corner-small transition-all"
            >
              <ChatCircle size={16} weight="duotone" className="mr-2" />
              Forum
            </TabsTrigger>
            <TabsTrigger 
              value="flash-sales" 
              className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive data-[state=active]:border-2 data-[state=active]:border-destructive jagged-corner-small transition-all"
            >
              <Lightning size={16} weight="fill" className="mr-2" />
              Flash Sales
            </TabsTrigger>
            <TabsTrigger 
              value="create" 
              className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-accent/20 data-[state=active]:text-accent data-[state=active]:border-2 data-[state=active]:border-accent jagged-corner-small transition-all"
            >
              <Plus size={16} weight="bold" className="mr-2" />
              Create
            </TabsTrigger>
            <TabsTrigger 
              value="nft" 
              className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary jagged-corner-small transition-all"
            >
              <SquaresFour size={16} weight="duotone" className="mr-2" />
              NFTs
            </TabsTrigger>
            <TabsTrigger 
              value="copy-trading" 
              className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-2 data-[state=active]:border-green-500 jagged-corner-small transition-all"
            >
              <Users size={16} weight="duotone" className="mr-2" />
              Copy Trading
            </TabsTrigger>
          </TabsList>

          <TabsContent value="strategies" className="space-y-6">
            <div className="cyber-card p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <MagnifyingGlass size={18} weight="bold" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search strategies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background/50"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <FunnelSimple size={18} weight="bold" className="text-muted-foreground" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex-1 h-10 px-3 bg-background/50 border border-input rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <TrendUp size={18} weight="bold" className="text-muted-foreground" />
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value as any)}
                    className="flex-1 h-10 px-3 bg-background/50 border border-input rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="hot">Hottest</option>
                    <option value="new">Newest</option>
                    <option value="roi">Highest ROI</option>
                    <option value="winrate">Best Win Rate</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {strategies.map((strategy) => {
                const canAccess = canAccessStrategy(strategy)
                const isOwned = isStrategyOwned(strategy.id)
                const isActive = isStrategyActive(strategy.id)
                const colors = getCategoryColor(strategy.category)
                const isFlashSale = strategy.is_flash_sale && strategy.flash_end_at && strategy.flash_end_at > Date.now()
                const performanceBadge = getStrategyPerformanceBadge(strategy.stats.win_rate, strategy.stats.avg_roi)
                const popularityBadge = getStrategyPopularity(strategy.views || 0, strategy.likes || 0)

                return (
                  <Tooltip key={strategy.id}>
                    <TooltipTrigger asChild>
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                        className={cn(
                          "glass-morph-card p-5 space-y-4 relative overflow-hidden group hover:shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.3)] transition-all cursor-pointer",
                          isActive && "ring-2 ring-primary animate-pulse-glow",
                          !canAccess && "opacity-70"
                        )}
                      >
                        {isFlashSale && (
                          <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground px-3 py-1 text-[10px] font-black uppercase tracking-wider animate-pulse">
                            <Lightning size={10} weight="fill" className="inline mr-1" />
                            FLASH
                          </div>
                        )}

                        {isActive && (
                          <div className="absolute top-3 left-3 z-20">
                            <Badge className="bg-primary/30 border-2 border-primary text-primary text-[9px] uppercase tracking-wider animate-pulse">
                              <CheckCircle size={10} weight="fill" className="mr-1" />
                              ACTIVE
                            </Badge>
                          </div>
                        )}

                        {performanceBadge && canAccess && (
                          <div className="absolute top-3 left-3 z-20">
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", delay: 0.2 }}
                            >
                              <Badge className={cn(
                                performanceBadge.bg,
                                "border-2",
                                performanceBadge.border,
                                performanceBadge.color,
                                "text-[9px] uppercase tracking-wider font-bold"
                              )}>
                                <performanceBadge.icon size={10} weight="fill" className="mr-1" />
                                {performanceBadge.label}
                              </Badge>
                            </motion.div>
                          </div>
                        )}

                        {popularityBadge && (
                          <div className="absolute top-3 right-3 z-20">
                            <Badge className={cn(
                              "bg-background/80 backdrop-blur-sm border border-border text-[9px] uppercase tracking-wider",
                              popularityBadge.color,
                              popularityBadge.pulse && "animate-pulse"
                            )}>
                              <Fire size={10} weight="fill" className="mr-1" />
                              {popularityBadge.label}
                            </Badge>
                          </div>
                        )}

                        {!canAccess && (
                          <div className="absolute inset-0 backdrop-blur-sm bg-background/30 z-10 flex items-center justify-center">
                            <div className="text-center space-y-2">
                              <Lock size={40} weight="fill" className="mx-auto text-muted-foreground" />
                              <Badge className="bg-accent/20 border border-accent text-accent">
                                {strategy.tier_required} Required
                              </Badge>
                            </div>
                          </div>
                        )}

                        <div className="absolute inset-0 grid-background opacity-5" />
                        
                        <div className="relative z-10 space-y-4">
                          <div className="flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <motion.div 
                              className={cn("p-4", colors.bg, "border-2", colors.border, "jagged-corner-small")}
                              whileHover={{ 
                                scale: 1.1,
                                boxShadow: "0 0 30px oklch(0.72 0.20 195 / 0.5)"
                              }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <CategoryIcon 
                                category={strategy.category} 
                                tier={strategy.tier_required}
                                size={40}
                              />
                            </motion.div>
                          </div>

                          <div className="text-center space-y-2">
                            <h4 className="font-bold uppercase tracking-wider text-sm line-clamp-2">
                              {strategy.name}
                            </h4>
                            <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
                              {strategy.category}
                            </Badge>
                          </div>

                          <p className="text-xs text-muted-foreground text-center leading-relaxed min-h-[3rem] line-clamp-3">
                            {strategy.description}
                          </p>

                          <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/50">
                            <div className="text-center">
                              <div className="text-lg font-bold text-primary">{strategy.stats.win_rate}%</div>
                              <div className="text-[8px] text-muted-foreground uppercase">Win</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold">{strategy.stats.total_trades}</div>
                              <div className="text-[8px] text-muted-foreground uppercase">Trades</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-accent">+{strategy.stats.avg_roi}%</div>
                              <div className="text-[8px] text-muted-foreground uppercase">ROI</div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {canAccess ? (
                              <Button
                                size="sm"
                                onClick={() => handleToggleStrategy(strategy.id)}
                                className="w-full jagged-corner-small uppercase tracking-wider font-bold text-xs"
                                variant={isActive ? "outline" : "default"}
                              >
                                {isActive ? (
                                  <>
                                    <Stop size={14} weight="fill" className="mr-1" />
                                    Stop
                                  </>
                                ) : (
                                  <>
                                    <Play size={14} weight="fill" className="mr-1" />
                                    Activate
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleClaimStrategy(strategy)}
                                className="w-full jagged-corner-small uppercase tracking-wider font-bold text-xs bg-accent hover:bg-accent/90"
                              >
                                {strategy.price_cents ? (
                                  <>
                                    <ShoppingCart size={14} weight="fill" className="mr-1" />
                                    ${(strategy.price_cents / 100).toFixed(2)}
                                  </>
                                ) : (
                                  <>
                                    <Lock size={14} weight="fill" className="mr-1" />
                                    Unlock
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent className="cyber-card-accent border-2 border-accent max-w-sm p-4 z-50">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CategoryIcon 
                            category={strategy.category} 
                            tier={strategy.tier_required}
                            size={24}
                          />
                          <div className="font-bold uppercase tracking-wider text-accent">{strategy.name}</div>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">{strategy.description}</p>
                        <div className="space-y-1 pt-2 border-t border-border/50">
                          <div className="text-[10px] uppercase tracking-wider font-bold text-primary">Performance:</div>
                          <div className="text-[10px] text-muted-foreground">
                            • Win Rate: {strategy.stats.win_rate}%
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            • Average ROI: +{strategy.stats.avg_roi}%
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            • Live P&L: ${strategy.stats.live_pnl.toFixed(2)}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-2 border-t border-border/50">
                          {strategy.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[8px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>

            {hasMore && !loading && (
              <div className="flex justify-center pt-6">
                <Button
                  onClick={() => {
                    setPage((p) => p + 1)
                    loadStrategies()
                  }}
                  variant="outline"
                  className="uppercase tracking-wider"
                >
                  Load More Strategies
                </Button>
              </div>
            )}

            {loading && (
              <div className="flex justify-center py-12">
                <div className="space-y-3 text-center">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Loading Strategies...</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="marketplace">
            <StrategyMarketplace />
          </TabsContent>

          <TabsContent value="forum">
            <Forum />
          </TabsContent>

          <TabsContent value="flash-sales" className="space-y-6">
            <LimitedOffersSection />
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold uppercase tracking-wider text-destructive flex items-center gap-2">
                <Lightning size={24} weight="fill" className="animate-pulse" />
                Flash Sale Strategies
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {strategies
                  .filter(s => s.is_flash_sale && s.flash_end_at && s.flash_end_at > Date.now())
                  .map((strategy) => {
                    const timeLeft = strategy.flash_end_at ? strategy.flash_end_at - Date.now() : 0
                    const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60))
                    const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))

                    return (
                      <div key={strategy.id} className="glass-morph-card p-5 space-y-4 relative overflow-hidden border-2 border-destructive">
                        <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground px-4 py-2 text-xs font-black uppercase tracking-wider">
                          <Clock size={12} weight="fill" className="inline mr-1" />
                          {hoursLeft}h {minutesLeft}m
                        </div>

                        <div className="pt-6 text-center space-y-3">
                          <CategoryIcon 
                            category={strategy.category} 
                            tier={strategy.tier_required}
                            size={48}
                            className="mx-auto"
                          />
                          <h4 className="font-bold uppercase tracking-wider text-sm">
                            {strategy.name}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {strategy.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <div className="text-center">
                            <div className="text-2xl font-black text-primary line-through opacity-50">
                              ${((strategy.price_cents || 0) / 100 * 2).toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground uppercase">Regular</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-black text-destructive">
                              ${((strategy.price_cents || 0) / 100).toFixed(2)}
                            </div>
                            <div className="text-xs text-destructive uppercase font-bold">50% OFF</div>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleClaimStrategy(strategy)}
                          className="w-full jagged-corner uppercase tracking-wider font-bold bg-destructive hover:bg-destructive/90"
                        >
                          <ShoppingCart size={16} weight="fill" className="mr-2" />
                          Claim Flash Deal
                        </Button>
                      </div>
                    )
                  })}
              </div>

              {strategies.filter(s => s.is_flash_sale && s.flash_end_at && s.flash_end_at > Date.now()).length === 0 && (
                <div className="cyber-card p-12 text-center space-y-4">
                  <Lightning size={64} weight="duotone" className="mx-auto text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-bold uppercase tracking-wider text-muted-foreground">
                    No Flash Sales Active
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Check back soon for limited-time deals on premium strategies
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create">
            <CreateStrategyTeaser 
              onUpgrade={() => {
                window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'settings' }))
                window.dispatchEvent(new CustomEvent('open-settings-subscriptions-tab'))
                toast.info('Navigate to Subscriptions', {
                  description: 'Go to Settings > Subscriptions to upgrade your plan'
                })
              }}
              isLocked={hasFullAccess ? false : (tierHierarchy[userTier] || 0) < tierHierarchy['Pro']}
            />
          </TabsContent>

          <TabsContent value="nft">
            <NFTGallery />
          </TabsContent>

          <TabsContent value="copy-trading">
            <CopyTrader />
          </TabsContent>
        </Tabs>
      </div>

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        item={selectedItem}
        onSuccess={handleCheckoutSuccess}
      />
    </TooltipProvider>
  )
}

