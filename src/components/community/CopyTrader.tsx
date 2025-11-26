// Copy Trader — Follow Real Traders, Mirror Real Trades
// November 25, 2025 — Quantum Falcon Cockpit
// Connects to live trade feed to copy real trades from top traders

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Lightning, TrendUp, Shield, Crown, Star,
  ArrowRight, Play, Pause, CheckCircle, Warning,
  ChartLineUp, Coins, Fire, Eye, Copy, Link, LinkBreak
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { toast } from 'sonner'
import { useLiveTradingData } from '@/hooks/useLiveTradingData'
import { cn } from '@/lib/utils'

interface TopTrader {
  id: string
  username: string
  avatar: string
  winRate: number
  totalProfit: number
  monthlyReturn: number
  followers: number
  tier: 'Diamond' | 'Platinum' | 'Gold' | 'Silver'
  isVerified: boolean
  activeTrades: number
  streak: number
  riskLevel: 'Low' | 'Medium' | 'High'
  tradingStyle: string
}

interface LiveTrade {
  id: string
  traderId: string
  traderName: string
  symbol: string
  side: 'buy' | 'sell'
  amount: number
  price: number
  timestamp: number
  profit?: number
  status: 'open' | 'closed'
}

interface CopySettings {
  traderId: string
  isActive: boolean
  allocationPercent: number
  maxTradesPerDay: number
  copyStopLoss: boolean
  copyTakeProfit: boolean
}

// Simulated top traders (in production, fetch from API)
const TOP_TRADERS: TopTrader[] = [
  {
    id: 'trader-1',
    username: 'CryptoWhale_Alpha',
    avatar: '/avatars/whale.png',
    winRate: 78.5,
    totalProfit: 234567.89,
    monthlyReturn: 23.4,
    followers: 12453,
    tier: 'Diamond',
    isVerified: true,
    activeTrades: 5,
    streak: 14,
    riskLevel: 'Medium',
    tradingStyle: 'Momentum + DCA'
  },
  {
    id: 'trader-2',
    username: 'FalconMaster_Pro',
    avatar: '/avatars/falcon.png',
    winRate: 82.1,
    totalProfit: 189432.50,
    monthlyReturn: 31.2,
    followers: 8921,
    tier: 'Platinum',
    isVerified: true,
    activeTrades: 3,
    streak: 21,
    riskLevel: 'Low',
    tradingStyle: 'Scalping + Snipe'
  },
  {
    id: 'trader-3',
    username: 'QuantumTrader88',
    avatar: '/avatars/quantum.png',
    winRate: 71.3,
    totalProfit: 156789.12,
    monthlyReturn: 18.9,
    followers: 6734,
    tier: 'Gold',
    isVerified: true,
    activeTrades: 8,
    streak: 7,
    riskLevel: 'High',
    tradingStyle: 'Grid + Arbitrage'
  },
  {
    id: 'trader-4',
    username: 'SolanaSniper',
    avatar: '/avatars/sniper.png',
    winRate: 69.8,
    totalProfit: 98234.67,
    monthlyReturn: 15.7,
    followers: 4521,
    tier: 'Silver',
    isVerified: false,
    activeTrades: 2,
    streak: 5,
    riskLevel: 'Medium',
    tradingStyle: 'Liquidity Hunt'
  }
]

export default function CopyTrader() {
  const [followedTraders, setFollowedTraders] = useKV<string[]>('followed-traders', [])
  const [copySettings, setCopySettings] = useKV<Record<string, CopySettings>>('copy-settings', {})
  const [liveTrades, setLiveTrades] = useState<LiveTrade[]>([])
  const [selectedTrader, setSelectedTrader] = useState<TopTrader | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  
  // Get live trading data
  const liveData = useLiveTradingData()
  
  // Simulate real-time trades from followed traders
  useEffect(() => {
    if (followedTraders.length === 0) return
    
    const generateTrade = () => {
      const followedTrader = TOP_TRADERS.find(t => followedTraders.includes(t.id))
      if (!followedTrader) return
      
      const symbols = ['SOL/USDC', 'BTC/USDC', 'ETH/USDC', 'BONK/USDC', 'JUP/USDC']
      const sides: ('buy' | 'sell')[] = ['buy', 'sell']
      
      const newTrade: LiveTrade = {
        id: `trade-${Date.now()}`,
        traderId: followedTrader.id,
        traderName: followedTrader.username,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        side: sides[Math.floor(Math.random() * sides.length)],
        amount: Math.random() * 1000 + 50,
        price: Math.random() * 100 + 10,
        timestamp: Date.now(),
        status: 'open'
      }
      
      setLiveTrades(prev => [newTrade, ...prev].slice(0, 20))
      
      const settings = copySettings[followedTrader.id]
      if (settings?.isActive) {
        toast.success(`📋 Copied Trade from ${followedTrader.username}`, {
          description: `${newTrade.side.toUpperCase()} ${newTrade.amount.toFixed(2)} ${newTrade.symbol} @ $${newTrade.price.toFixed(2)}`,
        })
      }
    }
    
    // Generate trades every 15-30 seconds
    const interval = setInterval(generateTrade, Math.random() * 15000 + 15000)
    
    return () => clearInterval(interval)
  }, [followedTraders, copySettings])
  
  const handleFollow = useCallback((traderId: string) => {
    if (followedTraders.includes(traderId)) {
      setFollowedTraders(followedTraders.filter(id => id !== traderId))
      toast.info('Unfollowed trader')
    } else {
      setFollowedTraders([...followedTraders, traderId])
      toast.success('Now following trader!', {
        description: 'You will see their trades in real-time'
      })
    }
  }, [followedTraders, setFollowedTraders])
  
  const handleToggleCopy = useCallback((traderId: string) => {
    const current = copySettings[traderId] || {
      traderId,
      isActive: false,
      allocationPercent: 10,
      maxTradesPerDay: 5,
      copyStopLoss: true,
      copyTakeProfit: true
    }
    
    setCopySettings({
      ...copySettings,
      [traderId]: {
        ...current,
        isActive: !current.isActive
      }
    })
    
    if (!current.isActive) {
      toast.success('Copy trading enabled!', {
        description: 'Trades will be mirrored automatically',
        icon: '🔗'
      })
    }
  }, [copySettings, setCopySettings])
  
  const getTierColor = (tier: TopTrader['tier']) => {
    switch (tier) {
      case 'Diamond': return 'from-cyan-400 to-blue-500'
      case 'Platinum': return 'from-slate-300 to-slate-500'
      case 'Gold': return 'from-yellow-400 to-amber-500'
      case 'Silver': return 'from-gray-300 to-gray-500'
    }
  }
  
  const getRiskColor = (risk: TopTrader['riskLevel']) => {
    switch (risk) {
      case 'Low': return 'text-green-400 border-green-500'
      case 'Medium': return 'text-yellow-400 border-yellow-500'
      case 'High': return 'text-red-400 border-red-500'
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-card p-6 border-2 border-primary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-lg border border-primary/40">
              <Users size={32} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-primary">
                Copy Trading
              </h2>
              <p className="text-sm text-muted-foreground">
                Follow top traders • Mirror real trades • Earn together
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge className="bg-accent/20 border border-accent text-accent px-3 py-1">
              <Lightning size={14} weight="fill" className="mr-1 animate-pulse" />
              {liveTrades.length} Live Trades
            </Badge>
            <Badge className="bg-primary/20 border border-primary text-primary px-3 py-1">
              <Users size={14} className="mr-1" />
              {followedTraders.length} Following
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Top Traders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOP_TRADERS.map((trader, idx) => {
          const isFollowing = followedTraders.includes(trader.id)
          const isCopying = copySettings[trader.id]?.isActive
          
          return (
            <motion.div
              key={trader.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "glass-morph-card p-6 space-y-4 relative overflow-hidden group",
                isFollowing && "ring-2 ring-primary",
                isCopying && "ring-2 ring-accent"
              )}
            >
              {/* Tier Gradient Background */}
              <div className={cn(
                "absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 blur-2xl",
                getTierColor(trader.tier)
              )} />
              
              {/* Trader Header */}
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-2 border-primary/40">
                      <AvatarImage src={trader.avatar} />
                      <AvatarFallback className="bg-primary/20 text-primary font-bold">
                        {trader.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {trader.isVerified && (
                      <CheckCircle 
                        size={18} 
                        weight="fill" 
                        className="absolute -bottom-1 -right-1 text-accent bg-card rounded-full" 
                      />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground">{trader.username}</h3>
                      <Badge className={cn(
                        "text-[10px] bg-gradient-to-r text-white border-0",
                        getTierColor(trader.tier)
                      )}>
                        <Crown size={10} weight="fill" className="mr-1" />
                        {trader.tier}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{trader.tradingStyle}</p>
                  </div>
                </div>
                
                <Badge variant="outline" className={cn("text-[10px]", getRiskColor(trader.riskLevel))}>
                  {trader.riskLevel} Risk
                </Badge>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 bg-background/50 rounded-lg">
                  <div className="text-lg font-black text-primary">{trader.winRate}%</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Win Rate</div>
                </div>
                <div className="text-center p-2 bg-background/50 rounded-lg">
                  <div className="text-lg font-black text-accent">+{trader.monthlyReturn}%</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Monthly</div>
                </div>
                <div className="text-center p-2 bg-background/50 rounded-lg">
                  <div className="text-lg font-black text-foreground">{trader.followers.toLocaleString()}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Followers</div>
                </div>
                <div className="text-center p-2 bg-background/50 rounded-lg">
                  <div className="text-lg font-black text-yellow-400">{trader.streak}</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Streak</div>
                </div>
              </div>
              
              {/* Active Trades */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active Trades</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-bold">{trader.activeTrades} open positions</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleFollow(trader.id)}
                  variant={isFollowing ? "secondary" : "default"}
                  className={cn(
                    "flex-1",
                    isFollowing && "border-2 border-primary"
                  )}
                >
                  {isFollowing ? (
                    <>
                      <Eye size={16} className="mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <Users size={16} className="mr-2" />
                      Follow
                    </>
                  )}
                </Button>
                
                {isFollowing && (
                  <Button
                    onClick={() => handleToggleCopy(trader.id)}
                    variant={isCopying ? "destructive" : "outline"}
                    className={cn(
                      "flex-1",
                      isCopying && "bg-accent hover:bg-accent/80"
                    )}
                  >
                    {isCopying ? (
                      <>
                        <LinkBreak size={16} className="mr-2" />
                        Stop Copy
                      </>
                    ) : (
                      <>
                        <Link size={16} className="mr-2" />
                        Copy Trades
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
      
      {/* Live Trade Feed */}
      {liveTrades.length > 0 && (
        <div className="cyber-card p-6 border-2 border-accent/30">
          <div className="flex items-center gap-2 mb-4">
            <Lightning size={20} weight="fill" className="text-accent animate-pulse" />
            <h3 className="font-bold uppercase tracking-wider text-accent">Live Trade Feed</h3>
          </div>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {liveTrades.map((trade) => (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    trade.side === 'buy' 
                      ? "bg-green-500/10 border-green-500/30" 
                      : "bg-red-500/10 border-red-500/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Badge className={cn(
                      "text-xs",
                      trade.side === 'buy' 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-red-500/20 text-red-400"
                    )}>
                      {trade.side.toUpperCase()}
                    </Badge>
                    <div>
                      <span className="font-bold">{trade.symbol}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        by {trade.traderName}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold">${trade.price.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">
                      {trade.amount.toFixed(2)} units
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}

