import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  ShoppingCart, Upload, TrendUp, TrendDown, EyeSlash, Heart, 
  Lightning, Crown, Star, CheckCircle, Lock, Coins, Clock,
  User, Download, ChartLine, Fire, Trophy, Sparkle, CaretUp,
  CaretDown, MagnifyingGlass, FunnelSimple, SortAscending
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { UserAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import CheckoutDialog from '@/components/shared/CheckoutDialog'
import { CheckoutItem } from '@/lib/checkout'
import { CategoryIcon } from '@/components/shared/CategoryIcons'

interface MarketplaceStrategy {
  id: string
  name: string
  description: string
  code: string
  thumbnail?: string
  category: string
  tags: string[]
  tier_required: string
  author_id: string
  author_name: string
  author_tier: string
  created_at: number
  price_cents: number
  purchases: number
  stats: {
    win_rate: number
    total_trades: number
    avg_roi: number
    live_pnl: number
    sharpe_ratio?: number
    max_drawdown?: number
  }
  social: {
    likes: number
    views: number
    downloads: number
    rating: number
    reviews: number
  }
  verified: boolean
  featured: boolean
  trending: boolean
}

interface UserStrategy {
  id: string
  name: string
  description: string
  code: string
  category: string
  tags: string[]
  price_cents: number
  listed: boolean
  created_at: number
}

export default function StrategyMarketplace() {
  const [auth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })

  const [marketplaceStrategies, setMarketplaceStrategies] = useKV<MarketplaceStrategy[]>('marketplace-strategies', [])
  const [myListedStrategies, setMyListedStrategies] = useKV<UserStrategy[]>('my-listed-strategies', [])
  const [purchasedStrategies, setPurchasedStrategies] = useKV<string[]>('purchased-marketplace-strategies', [])
  const [likedStrategies, setLikedStrategies] = useKV<string[]>('liked-marketplace-strategies', [])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState<'popular' | 'new' | 'price-low' | 'price-high' | 'rating'>('popular')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100])
  const [selectedStrategy, setSelectedStrategy] = useState<MarketplaceStrategy | null>(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CheckoutItem | null>(null)
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newStrategy, setNewStrategy] = useState<Partial<UserStrategy>>({
    name: '',
    description: '',
    code: '// Your strategy code here\n',
    category: 'Trend',
    tags: [],
    price_cents: 499,
    listed: true
  })

  const userTier = auth?.license?.tier || 'free'

  useEffect(() => {
    if (!marketplaceStrategies || marketplaceStrategies.length === 0) {
      loadMarketplaceStrategies()
    }
  }, [])

  const loadMarketplaceStrategies = async () => {
    try {
      const { fetchMarketplaceStrategies } = await import('@/lib/api/strategyMarketplaceApi')
      const strategies = await fetchMarketplaceStrategies()
      setMarketplaceStrategies(strategies)
    } catch (error) {
      console.error('[StrategyMarketplace] Failed to load:', error)
      // Keep empty array - no mock data
      setMarketplaceStrategies([])
    }
  }

  // REMOVED: generateSampleMarketplace - All strategies now fetched from real API
  const _generateSampleMarketplace_DEPRECATED = () => {
    const sampleStrategies: MarketplaceStrategy[] = [
      {
        id: 'mp-001',
        name: 'RSI Divergence Pro',
        description: 'Advanced RSI divergence detection with multi-timeframe confirmation. Proven 78% win rate over 500+ trades.',
        code: '// Strategy code...',
        category: 'Mean Reversion',
        tags: ['RSI', 'Divergence', 'Multi-TF'],
        tier_required: 'Trader',
        author_id: 'user-001',
        author_name: 'CryptoMaster',
        author_tier: 'Elite',
        created_at: Date.now() - 86400000 * 30,
        price_cents: 1999,
        purchases: 142,
        stats: {
          win_rate: 78.4,
          total_trades: 523,
          avg_roi: 24.7,
          live_pnl: 18420,
          sharpe_ratio: 2.3,
          max_drawdown: -8.2
        },
        social: {
          likes: 342,
          views: 4521,
          downloads: 142,
          rating: 4.8,
          reviews: 67
        },
        verified: true,
        featured: true,
        trending: true
      },
      {
        id: 'mp-002',
        name: 'Whale Alert Scalper',
        description: 'Real-time on-chain whale tracking with instant execution. Catches pumps before they happen.',
        code: '// Strategy code...',
        category: 'On-Chain',
        tags: ['Whale', 'Scalping', 'On-Chain'],
        tier_required: 'Pro',
        author_id: 'user-002',
        author_name: 'WhaleWatcher',
        author_tier: 'Pro',
        created_at: Date.now() - 86400000 * 7,
        price_cents: 2999,
        purchases: 89,
        stats: {
          win_rate: 72.1,
          total_trades: 1234,
          avg_roi: 18.3,
          live_pnl: 24680,
          sharpe_ratio: 1.9,
          max_drawdown: -12.4
        },
        social: {
          likes: 567,
          views: 7821,
          downloads: 89,
          rating: 4.9,
          reviews: 45
        },
        verified: true,
        featured: true,
        trending: true
      },
      {
        id: 'mp-003',
        name: 'Golden Cross ML',
        description: 'Machine learning enhanced golden cross detection. Filters false signals with 85% accuracy.',
        code: '// Strategy code...',
        category: 'ML',
        tags: ['ML', 'Golden Cross', 'EMA'],
        tier_required: 'Elite',
        author_id: 'user-003',
        author_name: 'MLTrader',
        author_tier: 'Elite',
        created_at: Date.now() - 86400000 * 14,
        price_cents: 4999,
        purchases: 56,
        stats: {
          win_rate: 85.2,
          total_trades: 312,
          avg_roi: 31.8,
          live_pnl: 42150,
          sharpe_ratio: 3.1,
          max_drawdown: -5.7
        },
        social: {
          likes: 421,
          views: 5234,
          downloads: 56,
          rating: 5.0,
          reviews: 34
        },
        verified: true,
        featured: false,
        trending: false
      },
      {
        id: 'mp-004',
        name: 'Bollinger Breakout',
        description: 'Classic Bollinger Band breakout strategy optimized for crypto volatility. Simple and effective.',
        code: '// Strategy code...',
        category: 'Breakout',
        tags: ['Bollinger', 'Breakout', 'Volatility'],
        tier_required: 'Starter',
        author_id: 'user-004',
        author_name: 'TechAnalyst',
        author_tier: 'Trader',
        created_at: Date.now() - 86400000 * 45,
        price_cents: 999,
        purchases: 234,
        stats: {
          win_rate: 68.5,
          total_trades: 678,
          avg_roi: 16.2,
          live_pnl: 12340,
          sharpe_ratio: 1.7,
          max_drawdown: -14.3
        },
        social: {
          likes: 189,
          views: 3421,
          downloads: 234,
          rating: 4.5,
          reviews: 89
        },
        verified: false,
        featured: false,
        trending: false
      },
      {
        id: 'mp-005',
        name: 'Volume Surge Hunter',
        description: 'Detects abnormal volume spikes and rides the momentum. Perfect for altcoin pumps.',
        code: '// Strategy code...',
        category: 'Breakout',
        tags: ['Volume', 'Momentum', 'Altcoins'],
        tier_required: 'Trader',
        author_id: 'user-005',
        author_name: 'VolumeKing',
        author_tier: 'Pro',
        created_at: Date.now() - 86400000 * 21,
        price_cents: 1499,
        purchases: 167,
        stats: {
          win_rate: 74.2,
          total_trades: 456,
          avg_roi: 22.1,
          live_pnl: 19870,
          sharpe_ratio: 2.1,
          max_drawdown: -9.8
        },
        social: {
          likes: 298,
          views: 4982,
          downloads: 167,
          rating: 4.7,
          reviews: 52
        },
        verified: true,
        featured: false,
        trending: true
      }
    ]

    setMarketplaceStrategies(sampleStrategies)
  }

  const filteredStrategies = (marketplaceStrategies || [])
    .filter((strat) => {
      if (searchQuery && !strat.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !strat.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      if (selectedCategory !== 'all' && strat.category !== selectedCategory) {
        return false
      }
      const priceInDollars = strat.price_cents / 100
      if (priceInDollars < priceRange[0] || priceInDollars > priceRange[1]) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return (b.social.views + b.social.likes * 10) - (a.social.views + a.social.likes * 10)
        case 'new':
          return b.created_at - a.created_at
        case 'price-low':
          return a.price_cents - b.price_cents
        case 'price-high':
          return b.price_cents - a.price_cents
        case 'rating':
          return b.social.rating - a.social.rating
        default:
          return 0
      }
    })

  const handlePurchaseStrategy = (strategy: MarketplaceStrategy) => {
    const checkoutItem: CheckoutItem = {
      id: strategy.id,
      name: strategy.name,
      description: strategy.description,
      price: strategy.price_cents / 100,
      type: 'strategy'
    }
    setSelectedItem(checkoutItem)
    setCheckoutOpen(true)
  }

  const handleCheckoutSuccess = () => {
    if (selectedItem) {
      setPurchasedStrategies((current) => [...(current || []), selectedItem.id])
      
      toast.success('Strategy Purchased!', {
        description: `${selectedItem.name} has been added to your collection`,
        icon: '🎉'
      })
      
      setCheckoutOpen(false)
      setSelectedItem(null)
    }
  }

  const handleLikeStrategy = (strategyId: string) => {
    if (likedStrategies?.includes(strategyId)) {
      setLikedStrategies((current) => (current || []).filter(id => id !== strategyId))
      setMarketplaceStrategies((current) => 
        (current || []).map(s => s.id === strategyId ? { ...s, social: { ...s.social, likes: s.social.likes - 1 } } : s)
      )
    } else {
      setLikedStrategies((current) => [...(current || []), strategyId])
      setMarketplaceStrategies((current) => 
        (current || []).map(s => s.id === strategyId ? { ...s, social: { ...s.social, likes: s.social.likes + 1 } } : s)
      )
    }
  }

  const handleCreateStrategy = () => {
    if (!newStrategy.name || !newStrategy.description || !newStrategy.code) {
      toast.error('Please fill all required fields')
      return
    }

    const userStrategy: UserStrategy = {
      id: `user-strat-${Date.now()}`,
      name: newStrategy.name!,
      description: newStrategy.description!,
      code: newStrategy.code!,
      category: newStrategy.category || 'Trend',
      tags: newStrategy.tags || [],
      price_cents: newStrategy.price_cents || 499,
      listed: newStrategy.listed || false,
      created_at: Date.now()
    }

    setMyListedStrategies((current) => [...(current || []), userStrategy])

    if (userStrategy.listed) {
      const marketplaceStrategy: MarketplaceStrategy = {
        ...userStrategy,
        author_id: auth?.userId || 'user-unknown',
        author_name: auth?.username || 'Anonymous',
        author_tier: userTier,
        tier_required: 'Free',
        purchases: 0,
        stats: {
          win_rate: 0,
          total_trades: 0,
          avg_roi: 0,
          live_pnl: 0
        },
        social: {
          likes: 0,
          views: 0,
          downloads: 0,
          rating: 0,
          reviews: 0
        },
        verified: false,
        featured: false,
        trending: false
      }

      setMarketplaceStrategies((current) => [marketplaceStrategy, ...(current || [])])
    }

    toast.success('Strategy Created!', {
      description: userStrategy.listed ? 'Now available in marketplace' : 'Saved to your collection',
      icon: '✨'
    })

    setCreateDialogOpen(false)
    setNewStrategy({
      name: '',
      description: '',
      code: '// Your strategy code here\n',
      category: 'Trend',
      tags: [],
      price_cents: 499,
      listed: true
    })
  }

  const categories = ['all', 'Trend', 'Mean Reversion', 'Breakout', 'On-Chain', 'ML', 'Arbitrage']

  return (
    <div className="space-y-6">
      <div className="cyber-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <ShoppingCart size={32} weight="duotone" className="text-primary neon-glow-primary" />
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-[0.2em] text-primary">Strategy Marketplace</h2>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Buy & Sell Proven Strategies • {filteredStrategies.length} Available
              </p>
            </div>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="neon-button gap-2">
                <Upload size={20} weight="bold" />
                List Strategy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto cyber-card">
              <DialogHeader>
                <DialogTitle className="text-2xl text-primary uppercase tracking-wider">List Your Strategy</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Create and list your trading strategy on the marketplace. All transactions are P2P.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="data-label mb-2 block">Strategy Name</label>
                  <Input
                    placeholder="e.g., Advanced RSI Scalper"
                    value={newStrategy.name}
                    onChange={(e) => setNewStrategy({ ...newStrategy, name: e.target.value })}
                    className="neon-search"
                  />
                </div>
                <div>
                  <label className="data-label mb-2 block">Description</label>
                  <Textarea
                    placeholder="Describe your strategy, performance, and key features..."
                    value={newStrategy.description}
                    onChange={(e) => setNewStrategy({ ...newStrategy, description: e.target.value })}
                    className="neon-search min-h-[100px]"
                  />
                </div>
                <div>
                  <label className="data-label mb-2 block">Strategy Code</label>
                  <Textarea
                    placeholder="// Your strategy implementation..."
                    value={newStrategy.code}
                    onChange={(e) => setNewStrategy({ ...newStrategy, code: e.target.value })}
                    className="neon-search min-h-[200px] font-mono text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="data-label mb-2 block">Category</label>
                    <select
                      value={newStrategy.category}
                      onChange={(e) => setNewStrategy({ ...newStrategy, category: e.target.value })}
                      className="w-full px-4 py-2 bg-card border-2 border-primary/30 rounded text-foreground"
                    >
                      {categories.filter(c => c !== 'all').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="data-label mb-2 block">Price ($)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newStrategy.price_cents ? newStrategy.price_cents / 100 : 4.99}
                      onChange={(e) => setNewStrategy({ ...newStrategy, price_cents: Math.round(parseFloat(e.target.value) * 100) })}
                      className="neon-search"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="list-publicly"
                    checked={newStrategy.listed}
                    onChange={(e) => setNewStrategy({ ...newStrategy, listed: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <label htmlFor="list-publicly" className="text-sm text-foreground">
                    List publicly on marketplace (earn from sales)
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateStrategy} className="neon-button">
                  Create Strategy
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlass size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
              <Input
                placeholder="Search strategies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="neon-search pl-10"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 bg-card border-2 border-primary/30 rounded text-foreground"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-card border-2 border-primary/30 rounded text-foreground"
          >
            <option value="popular">Most Popular</option>
            <option value="new">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        <Tabs defaultValue="marketplace" className="space-y-4">
          <TabsList className="bg-muted/20">
            <TabsTrigger value="marketplace">
              <ShoppingCart size={18} className="mr-2" />
              Marketplace ({filteredStrategies.length})
            </TabsTrigger>
            <TabsTrigger value="my-listings">
              <Upload size={18} className="mr-2" />
              My Listings ({myListedStrategies?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="purchased">
              <Download size={18} className="mr-2" />
              Purchased ({purchasedStrategies?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredStrategies.map((strategy) => (
                  <StrategyMarketplaceCard
                    key={strategy.id}
                    strategy={strategy}
                    isPurchased={purchasedStrategies?.includes(strategy.id) || false}
                    isLiked={likedStrategies?.includes(strategy.id) || false}
                    onPurchase={handlePurchaseStrategy}
                    onLike={handleLikeStrategy}
                    onView={(strat) => setSelectedStrategy(strat)}
                  />
                ))}
              </AnimatePresence>
            </div>
            {filteredStrategies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No strategies found matching your filters</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-listings">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myListedStrategies?.map((strategy) => (
                <Card key={strategy.id} className="cyber-card p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-lg">{strategy.name}</h3>
                      <Badge className={strategy.listed ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted-foreground'}>
                        {strategy.listed ? 'Listed' : 'Private'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{strategy.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-bold">${(strategy.price_cents / 100).toFixed(2)}</span>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
              {(!myListedStrategies || myListedStrategies.length === 0) && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">You haven't listed any strategies yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="purchased">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(marketplaceStrategies || [])
                .filter((s) => purchasedStrategies?.includes(s.id))
                .map((strategy) => (
                  <Card key={strategy.id} className="cyber-card p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-lg">{strategy.name}</h3>
                        <Badge className="bg-primary/20 text-primary">
                          <CheckCircle size={14} className="mr-1" />
                          Owned
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{strategy.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">by {strategy.author_name}</span>
                        <Button size="sm">
                          <Download size={16} className="mr-1" />
                          View Code
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              {(!purchasedStrategies || purchasedStrategies.length === 0) && (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No purchased strategies yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedStrategy && (
        <Dialog open={!!selectedStrategy} onOpenChange={() => setSelectedStrategy(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto cyber-card">
            <DialogHeader>
              <DialogTitle className="text-2xl text-primary uppercase tracking-wider flex items-center gap-3">
                {selectedStrategy.name}
                {selectedStrategy.verified && (
                  <Badge className="bg-primary/20 text-primary">
                    <CheckCircle size={14} className="mr-1" />
                    Verified
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                by {selectedStrategy.author_name} ({selectedStrategy.author_tier} Tier)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-foreground">{selectedStrategy.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="cyber-card p-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Win Rate</div>
                  <div className="text-2xl font-bold text-primary">{selectedStrategy.stats.win_rate}%</div>
                </div>
                <div className="cyber-card p-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Avg ROI</div>
                  <div className="text-2xl font-bold text-accent">+{selectedStrategy.stats.avg_roi}%</div>
                </div>
                <div className="cyber-card p-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Trades</div>
                  <div className="text-2xl font-bold text-secondary">{selectedStrategy.stats.total_trades}</div>
                </div>
                <div className="cyber-card p-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Rating</div>
                  <div className="text-2xl font-bold text-primary flex items-center gap-1">
                    <Star size={20} weight="fill" />
                    {selectedStrategy.social.rating}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div className="text-3xl font-bold text-primary">
                  ${(selectedStrategy.price_cents / 100).toFixed(2)}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleLikeStrategy(selectedStrategy.id)}
                  >
                    <Heart 
                      size={20} 
                      weight={likedStrategies?.includes(selectedStrategy.id) ? 'fill' : 'regular'}
                      className={likedStrategies?.includes(selectedStrategy.id) ? 'text-destructive' : ''}
                    />
                  </Button>
                  {purchasedStrategies?.includes(selectedStrategy.id) ? (
                    <Button className="bg-primary/20 text-primary">
                      <CheckCircle size={20} className="mr-2" />
                      Owned
                    </Button>
                  ) : (
                    <Button onClick={() => handlePurchaseStrategy(selectedStrategy)} className="neon-button">
                      <ShoppingCart size={20} className="mr-2" />
                      Purchase
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        item={selectedItem}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  )
}

interface StrategyMarketplaceCardProps {
  strategy: MarketplaceStrategy
  isPurchased: boolean
  isLiked: boolean
  onPurchase: (strategy: MarketplaceStrategy) => void
  onLike: (strategyId: string) => void
  onView: (strategy: MarketplaceStrategy) => void
}

function StrategyMarketplaceCard({ strategy, isPurchased, isLiked, onPurchase, onLike, onView }: StrategyMarketplaceCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <Card className="cyber-card-accent p-4 h-full flex flex-col relative overflow-hidden">
        {strategy.featured && (
          <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-3 py-1 text-xs font-bold uppercase">
            Featured
          </div>
        )}
        {strategy.trending && (
          <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold uppercase flex items-center gap-1">
            <Fire size={14} weight="fill" />
            Trending
          </div>
        )}
        
        <div className="flex items-start justify-between mb-3 mt-8">
          <div className="flex items-center gap-2">
            <CategoryIcon category={strategy.category} size={32} />
            <div>
              <h3 className="font-bold text-lg line-clamp-1">{strategy.name}</h3>
              <p className="text-xs text-muted-foreground">by {strategy.author_name}</p>
            </div>
          </div>
          {strategy.verified && (
            <Tooltip>
              <TooltipTrigger>
                <CheckCircle size={20} weight="fill" className="text-primary" />
              </TooltipTrigger>
              <TooltipContent>
                Verified Strategy
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow">
          {strategy.description}
        </p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-primary">{strategy.stats.win_rate}%</div>
            <div className="text-[10px] text-muted-foreground uppercase">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-accent">+{strategy.stats.avg_roi}%</div>
            <div className="text-[10px] text-muted-foreground uppercase">ROI</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-secondary">{strategy.stats.total_trades}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Trades</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star size={14} weight="fill" className="text-primary" />
            {strategy.social.rating}
          </div>
          <div className="flex items-center gap-1">
            <EyeSlash size={14} />
            {strategy.social.views}
          </div>
          <div className="flex items-center gap-1">
            <Heart size={14} weight={isLiked ? 'fill' : 'regular'} className={isLiked ? 'text-destructive' : ''} />
            {strategy.social.likes}
          </div>
          <div className="flex items-center gap-1">
            <Download size={14} />
            {strategy.purchases}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="text-2xl font-bold text-primary">
            ${(strategy.price_cents / 100).toFixed(2)}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onLike(strategy.id)}
            >
              <Heart 
                size={16} 
                weight={isLiked ? 'fill' : 'regular'}
                className={isLiked ? 'text-destructive' : ''}
              />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onView(strategy)}
            >
              View
            </Button>
            {isPurchased ? (
              <Button size="sm" className="bg-primary/20 text-primary">
                <CheckCircle size={16} className="mr-1" />
                Owned
              </Button>
            ) : (
              <Button size="sm" onClick={() => onPurchase(strategy)} className="neon-button">
                <ShoppingCart size={16} className="mr-1" />
                Buy
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
