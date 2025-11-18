import { useState, useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
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
  Eye, Play, Pause, Stop, CheckCircle
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
import CheckoutDialog from '@/components/shared/CheckoutDialog'
import { CheckoutItem } from '@/lib/checkout'
import { UserAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

export default function SocialCommunity() {
  const [auth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })

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
  
  const [ownedStrategies, setOwnedStrategies] = useKV<string[]>('owned-strategies', [])
  const [activeStrategies, setActiveStrategies] = useKV<string[]>('active-strategies', [])
  
  const [rotatingOffers, setRotatingOffers] = useState<RotatingOffer[]>([])
  const [timeUntilRotation, setTimeUntilRotation] = useState({ days: 0, hours: 0, minutes: 0 })
  const [purchasedOffers, setPurchasedOffers] = useKV<string[]>('purchased-rotating-offers', [])
  
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CheckoutItem | null>(null)

  const userTier = auth?.license?.tier || 'Free'

  const tierHierarchy: Record<string, number> = {
    'Free': 0,
    'Starter': 1,
    'Trader': 2,
    'Pro': 3,
    'Elite': 4,
    'Lifetime': 5
  }

  useEffect(() => {
    loadFeaturedStrategies()
    loadStrategies()
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
    if (isTransitioning || featuredStrategies.length === 0) return

    const heroTimer = setInterval(() => {
      if (!isTransitioning) {
        setHeroIndex((prev) => (prev + 1) % Math.min(featuredStrategies.length, 6))
      }
    }, 6000)

    return () => clearInterval(heroTimer)
  }, [featuredStrategies.length, isTransitioning])

  useEffect(() => {
    setPage(1)
    loadStrategies(true)
  }, [searchQuery, selectedCategory, selectedSort])

  async function loadFeaturedStrategies() {
    const featured = await fetchFeaturedStrategies()
    setFeaturedStrategies(featured.slice(0, 6))
  }

  async function loadStrategies(reset = false) {
    setLoading(true)
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
    setLoading(false)
  }

  function canAccessStrategy(strategy: ApiStrategy): boolean {
    if (strategy.is_user_created && strategy.author_id === auth?.userId) return true
    
    const userTierLevel = tierHierarchy[userTier]
    const requiredTierLevel = tierHierarchy[strategy.tier_required]
    
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
                  <h2 className="text-2xl font-bold uppercase tracking-[0.2em] text-primary">Community Hub</h2>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {strategies.length}+ Strategies • Growing Daily • 100% Dynamic
                  </p>
                </div>
              </div>
              <Badge className="bg-accent/20 border-2 border-accent text-accent uppercase tracking-wider">
                <Crown size={14} weight="fill" className="mr-1" />
                {userTier} Tier
              </Badge>
            </div>
          </div>
        </div>

        {featuredStrategies.length > 0 && (
          <div className="relative overflow-hidden group">
            <AnimatePresence mode="wait" initial={false} onExitComplete={() => setIsTransitioning(false)}>
              <motion.div
                key={heroIndex}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                onAnimationStart={() => setIsTransitioning(true)}
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
                              <span className="font-bold">{currentHeroStrategy.likes?.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground flex items-center gap-2">
                                <Eye size={14} />
                                Views
                              </span>
                              <span className="font-bold">{currentHeroStrategy.views?.toLocaleString()}</span>
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleHeroNavigation((heroIndex - 1 + featuredStrategies.length) % featuredStrategies.length)}
                        disabled={isTransitioning}
                        className="w-10 h-10 p-0 transition-all disabled:opacity-50"
                      >
                        <CaretLeft size={20} weight="bold" />
                      </Button>
                      <div className="flex gap-1">
                        {featuredStrategies.slice(0, 6).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleHeroNavigation(idx)}
                            disabled={isTransitioning}
                            className={cn(
                              "w-2 h-2 rounded-full transition-all disabled:opacity-50",
                              idx === heroIndex ? "bg-primary w-8" : "bg-muted hover:bg-primary/50"
                            )}
                          />
                        ))}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleHeroNavigation((heroIndex + 1) % featuredStrategies.length)}
                        disabled={isTransitioning}
                        className="w-10 h-10 p-0 transition-all disabled:opacity-50"
                      >
                        <CaretRight size={20} weight="bold" />
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <Tabs defaultValue="strategies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card/50 backdrop-blur-sm border-2 border-primary/30 p-1 gap-1">
            <TabsTrigger 
              value="strategies" 
              className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary jagged-corner-small transition-all"
            >
              <Code size={16} weight="duotone" className="mr-2" />
              Strategies
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

                return (
                  <Tooltip key={strategy.id}>
                    <TooltipTrigger asChild>
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
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
                          <div className="flex items-center justify-center">
                            <div className={cn("p-4", colors.bg, "border-2", colors.border, "jagged-corner-small")}>
                              <CategoryIcon 
                                category={strategy.category} 
                                tier={strategy.tier_required}
                                size={40}
                              />
                            </div>
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
            <div className="cyber-card p-12 text-center space-y-6">
              <div className="flex items-center justify-center">
                <div className="p-6 bg-accent/20 border-2 border-accent rounded-full">
                  <Plus size={64} weight="bold" className="text-accent" />
                </div>
              </div>
              
              <div className="space-y-3 max-w-2xl mx-auto">
                <h3 className="text-3xl font-black uppercase tracking-wider text-accent">
                  Create Your Own Strategy
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Build and share custom trading strategies with the community. Available for Pro tier and above.
                </p>
              </div>

              {tierHierarchy[userTier] >= tierHierarchy['Pro'] ? (
                <Button size="lg" className="jagged-corner uppercase tracking-wider font-bold">
                  <Plus size={20} weight="bold" className="mr-2" />
                  Start Building
                </Button>
              ) : (
                <div className="space-y-4">
                  <Badge className="bg-accent/20 border-2 border-accent text-accent text-sm px-4 py-2">
                    <Lock size={16} weight="fill" className="mr-2" />
                    Pro Tier Required
                  </Badge>
                  <Button size="lg" className="jagged-corner uppercase tracking-wider font-bold bg-accent hover:bg-accent/90">
                    <Crown size={20} weight="fill" className="mr-2" />
                    Upgrade to Pro
                  </Button>
                </div>
              )}
            </div>
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
