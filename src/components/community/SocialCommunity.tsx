import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  ChatCircle, Heart, Share, Fire, Star, Users, TrendUp, 
  Clock, Code, ChartLine, Lightning, PaperPlaneRight, 
  ThumbsUp, Eye, ArrowUp, BookmarkSimple, Info
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { getRotatingOffers, getTimeUntilNextRotation, type RotatingOffer } from '@/lib/rotatingOffers'
import ProfileUpload from '@/components/shared/ProfileUpload'
import LimitedOffersSection from './LimitedOffersSection'
import Forum from './Forum'
import CheckoutDialog from '@/components/shared/CheckoutDialog'
import { CheckoutItem } from '@/lib/checkout'

interface Strategy {
  id: string
  title: string
  author: string
  authorAvatar: string
  description: string
  winRate: number
  totalTrades: number
  roi: number
  likes: number
  views: number
  comments: number
  tags: string[]
  timestamp: number
  code?: string
}

interface ForumPost {
  id: string
  author: string
  authorAvatar: string
  title: string
  content: string
  likes: number
  comments: number
  views: number
  timestamp: number
  tags: string[]
}

export default function SocialCommunity() {
  const [rotatingOffers, setRotatingOffers] = useState<RotatingOffer[]>([])
  const [timeUntilRotation, setTimeUntilRotation] = useState({ days: 0, hours: 0, minutes: 0 })
  const [purchasedOffers, setPurchasedOffers] = useKV<string[]>('purchased-rotating-offers', [])
  
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CheckoutItem | null>(null)

  useEffect(() => {
    setRotatingOffers(getRotatingOffers(6))
    
    const updateTimer = () => {
      setTimeUntilRotation(getTimeUntilNextRotation())
    }
    
    updateTimer()
    const interval = setInterval(updateTimer, 60000)
    
    return () => clearInterval(interval)
  }, [])

  const strategies: Strategy[] = [
    {
      id: '1',
      title: 'Momentum Scalper Pro',
      author: 'CryptoNinja',
      authorAvatar: '🥷',
      description: 'High-frequency scalping strategy using RSI divergence and volume confirmation for quick profits on volatile tokens',
      winRate: 73.5,
      totalTrades: 247,
      roi: 125.3,
      likes: 342,
      views: 1247,
      comments: 89,
      tags: ['Scalping', 'RSI', 'High-Frequency'],
      timestamp: Date.now() - 3600000 * 5
    },
    {
      id: '2',
      title: 'DCA Accumulation Bot',
      author: 'DiamondHands',
      authorAvatar: '💎',
      description: 'Smart dollar-cost averaging that buys dips based on support levels and Fibonacci retracement zones',
      winRate: 68.2,
      totalTrades: 523,
      roi: 89.7,
      likes: 521,
      views: 2134,
      comments: 156,
      tags: ['DCA', 'Long-term', 'Support Levels'],
      timestamp: Date.now() - 3600000 * 12
    },
    {
      id: '3',
      title: 'Whale Shadow Trading',
      author: 'SolanaWhale',
      authorAvatar: '🐋',
      description: 'Follow smart money by mirroring trades from top 20 whale wallets with configurable delay and position sizing',
      winRate: 81.9,
      totalTrades: 156,
      roi: 203.4,
      likes: 892,
      views: 3421,
      comments: 203,
      tags: ['Whale Tracking', 'Copy Trading', 'Advanced'],
      timestamp: Date.now() - 3600000 * 24
    },
    {
      id: '4',
      title: 'Breakout Hunter',
      author: 'BotMaster3000',
      authorAvatar: '🤖',
      description: 'Automatically detect and trade breakouts from consolidation patterns using ML-powered pattern recognition',
      winRate: 65.7,
      totalTrades: 389,
      roi: 76.2,
      likes: 267,
      views: 987,
      comments: 67,
      tags: ['Breakout', 'ML', 'Pattern Recognition'],
      timestamp: Date.now() - 3600000 * 48
    }
  ]

  const forumPosts: ForumPost[] = [
    {
      id: '1',
      author: 'TradeGuru',
      authorAvatar: '🎯',
      title: 'Best settings for RSI strategy in current market?',
      content: 'Has anyone found optimal RSI thresholds for the current volatile market? I\'m testing 30/70 vs 20/80...',
      likes: 45,
      comments: 23,
      views: 234,
      timestamp: Date.now() - 3600000 * 2,
      tags: ['Question', 'RSI', 'Settings']
    },
    {
      id: '2',
      author: 'CryptoMaven',
      authorAvatar: '🚀',
      title: 'My $10K to $50K journey using Quantum Falcon',
      content: 'After 3 months of consistent trading with the DCA and momentum strategies, here are my results...',
      likes: 178,
      comments: 67,
      views: 892,
      timestamp: Date.now() - 3600000 * 8,
      tags: ['Success Story', 'Tips', 'DCA']
    },
    {
      id: '3',
      author: 'SolanaDev',
      authorAvatar: '⚡',
      title: 'New feature idea: Multi-timeframe analysis',
      content: 'Would love to see analysis across 1m, 5m, 15m, 1h timeframes simultaneously...',
      likes: 92,
      comments: 34,
      views: 456,
      timestamp: Date.now() - 3600000 * 16,
      tags: ['Feature Request', 'Analysis']
    }
  ]

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const purchaseOffer = (offer: RotatingOffer) => {
    if (purchasedOffers?.includes(offer.id)) {
      toast.info('Already Purchased', {
        description: 'You already own this enhancement'
      })
      return
    }

    const checkoutItem: CheckoutItem = {
      id: offer.id,
      name: offer.title,
      description: offer.description,
      price: offer.price,
      type: 'offer',
      duration: offer.duration
    }

    setSelectedItem(checkoutItem)
    setCheckoutOpen(true)
  }

  const handleCheckoutSuccess = () => {
    if (selectedItem) {
      setPurchasedOffers((current) => [...(current || []), selectedItem.id])
      
      toast.success('Purchase Successful!', {
        description: `${selectedItem.name} has been activated${selectedItem.duration ? ` for ${selectedItem.duration} hours` : ''}`,
        icon: '✨'
      })
    }
  }

  const colorByCategory = {
    trading: { bg: 'bg-primary/20', border: 'border-primary', text: 'text-primary', glow: 'shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.3)]' },
    analytics: { bg: 'bg-accent/20', border: 'border-accent', text: 'text-accent', glow: 'shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]' },
    cosmetic: { bg: 'bg-secondary/20', border: 'border-secondary', text: 'text-secondary', glow: 'shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]' },
    community: { bg: 'bg-primary/20', border: 'border-primary', text: 'text-primary', glow: 'shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.3)]' },
    security: { bg: 'bg-destructive/20', border: 'border-destructive', text: 'text-destructive', glow: 'shadow-[0_0_20px_oklch(0.65_0.25_25_/_0.3)]' },
    gamification: { bg: 'bg-accent/20', border: 'border-accent', text: 'text-accent', glow: 'shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]' }
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
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Share, learn, and grow together</p>
                </div>
              </div>
              <Button className="jagged-corner-small border-2 border-primary">
                <PaperPlaneRight size={16} weight="bold" className="mr-2" />
                Share Strategy
              </Button>
            </div>
          </div>
        </div>

        <LimitedOffersSection />

        <div className="relative overflow-hidden bg-gradient-to-br from-background via-card to-background border-3 border-accent/40 p-6 jagged-corner">
          <div className="absolute inset-0 diagonal-stripes opacity-5" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Lightning size={32} weight="fill" className="text-accent neon-glow-accent" />
                  <h3 className="text-3xl font-black uppercase tracking-[0.2em] text-accent">Special Offers</h3>
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-[0.15em]">
                  Premium features rotating every 3 days • Higher-tier enhancements
                </p>
              </div>
              <div className="cyber-card-accent p-3 text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Next Rotation</div>
                <div className="text-lg font-bold text-accent hud-value">
                  {timeUntilRotation.days}d {timeUntilRotation.hours}h {timeUntilRotation.minutes}m
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rotatingOffers.map((offer) => {
                const Icon = offer.icon
                const colors = colorByCategory[offer.category]
                const isPurchased = purchasedOffers?.includes(offer.id)

                return (
                  <Tooltip key={offer.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={`glass-morph-card p-5 space-y-4 relative overflow-hidden group hover:${colors.glow} transition-all duration-300 cursor-help ${
                          isPurchased ? 'ring-2 ring-accent' : ''
                        }`}
                      >
                        {isPurchased && (
                          <div className="absolute top-3 right-3 z-20">
                            <Badge className="bg-accent/20 border border-accent text-accent text-[9px] uppercase tracking-wider animate-pulse">
                              OWNED
                            </Badge>
                          </div>
                        )}

                        <div className="absolute inset-0 grid-background opacity-5" />
                        
                        <div className="relative z-10 pt-2">
                          <div className="flex items-center justify-center mb-4">
                            <div className={`p-4 ${colors.bg} border ${colors.border} jagged-corner-small`}>
                              <Icon size={40} weight="duotone" className={colors.text} />
                            </div>
                          </div>

                          <div className="text-center space-y-2 mb-4">
                            <h4 className={`font-bold uppercase tracking-[0.12em] text-sm ${colors.text}`}>
                              {offer.title}
                            </h4>
                            {offer.subtitle && (
                              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                                {offer.subtitle}
                              </p>
                            )}
                            <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
                              {offer.category}
                            </Badge>
                          </div>

                          <p className="text-xs text-muted-foreground text-center leading-relaxed min-h-[3rem] line-clamp-3">
                            {offer.description}
                          </p>

                          {offer.duration && (
                            <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wide py-2">
                              <Clock size={12} weight="duotone" />
                              <span>ACTIVE_{offer.duration}H</span>
                            </div>
                          )}

                          <div className="pt-4 mt-4 border-t border-border/50 space-y-3">
                            <div className="text-center">
                              <span className="text-2xl font-black text-primary hud-value">
                                ${offer.price === 0 ? 'FREE' : offer.price.toFixed(2)}
                              </span>
                            </div>

                            <Button
                              onClick={() => purchaseOffer(offer)}
                              disabled={isPurchased}
                              className={`w-full jagged-corner-small uppercase tracking-[0.12em] font-bold text-xs ${
                                isPurchased ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              size="sm"
                            >
                              {isPurchased ? 'OWNED' : 'ACTIVATE_NOW'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="cyber-card-accent border-2 border-accent max-w-sm p-4 z-50">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Icon size={24} weight="duotone" className={colors.text} />
                          <div className="font-bold uppercase tracking-wider text-accent">{offer.title}</div>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">{offer.description}</p>
                        {(offer.benefit1 || offer.benefit2 || offer.benefit3) && (
                          <div className="space-y-1 pt-2 border-t border-border/50">
                            <div className="text-[10px] uppercase tracking-wider font-bold text-primary">Key Benefits:</div>
                            {offer.benefit1 && (
                              <div className="text-[10px] text-muted-foreground flex items-start gap-1">
                                <span className="text-accent">•</span>
                                <span>{offer.benefit1}: {offer.benefit2}</span>
                              </div>
                            )}
                            {offer.benefit3 && (
                              <div className="text-[10px] text-muted-foreground flex items-start gap-1">
                                <span className="text-accent">•</span>
                                <span>{offer.benefit3}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="text-[10px] text-muted-foreground italic pt-2 border-t border-border/50">
                          Hover over cards to see details • Offers rotate every 3 days
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </div>
        </div>

        <Tabs defaultValue="strategies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm border-2 border-primary/30 p-1 gap-1">
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
          </TabsList>

          <TabsContent value="strategies" className="space-y-4">
            {strategies.map((strategy) => (
              <div key={strategy.id} className="glass-morph-card p-6 relative overflow-hidden group hover:shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.3)] transition-all">
                <div className="absolute inset-0 technical-grid opacity-5" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="text-4xl">{strategy.authorAvatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold uppercase tracking-wider">{strategy.title}</h3>
                          <Badge className="bg-primary/20 text-primary border border-primary/50">
                            <Fire size={12} weight="fill" className="mr-1" />
                            HOT
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <span className="font-semibold">{strategy.author}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(strategy.timestamp)}</span>
                        </div>
                        <p className="text-sm text-foreground mb-4">{strategy.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {strategy.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div className="text-center p-3 bg-primary/10 border border-primary/30">
                            <div className="text-2xl font-bold text-primary">{strategy.winRate}%</div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Win Rate</div>
                          </div>
                          <div className="text-center p-3 bg-muted/30 border border-muted/50">
                            <div className="text-2xl font-bold">{strategy.totalTrades}</div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Trades</div>
                          </div>
                          <div className="text-center p-3 bg-accent/10 border border-accent/30">
                            <div className="text-2xl font-bold text-accent">+{strategy.roi}%</div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">ROI</div>
                          </div>
                          <div className="text-center p-3 bg-muted/30 border border-muted/50">
                            <div className="text-2xl font-bold">{strategy.views}</div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Views</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                            <ThumbsUp size={14} className="mr-1" />
                            {strategy.likes}
                          </Button>
                          <Button size="sm" variant="outline">
                            <ChatCircle size={14} className="mr-1" />
                            {strategy.comments}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Share size={14} className="mr-1" />
                            Share
                          </Button>
                          <Button size="sm" className="ml-auto jagged-corner-small bg-primary">
                            <BookmarkSimple size={14} weight="fill" className="mr-1" />
                            Use Strategy
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="forum">
            <Forum />
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
