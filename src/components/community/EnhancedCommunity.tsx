import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Lightning,
  Coins,
  Target,
  Fire,
  Trophy,
  Crown,
  Star,
  Clock,
  Sparkle,
  Rocket,
  ShieldCheck,
  Atom,
  Brain,
  ChartLineUp,
  GitBranch
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import ProfileUpload from '@/components/shared/ProfileUpload'

interface UserProfile {
  username: string
  level: number
  xp: number
  xpToNextLevel: number
  badges: string[]
  rank: number
  wins: number
  streak: number
}

interface MicroTransaction {
  id: string
  title: string
  description: string
  subtitle?: string
  price: number
  icon: React.ReactNode
  category: 'boost' | 'upgrade' | 'cosmetic'
  duration?: number
  discount?: number
  expiresIn?: number
  purchased: boolean
  featured?: boolean
  benefit1?: string
  benefit2?: string
  benefit3?: string
}

export default function EnhancedCommunity() {
  const [profile, setProfile] = useKV<UserProfile>('user-profile', {
    username: 'QuantumTrader',
    level: 7,
    xp: 2340,
    xpToNextLevel: 3000,
    badges: ['Early Adopter', 'Profit Maker', 'Bot Master'],
    rank: 47,
    wins: 124,
    streak: 5
  })

  const [purchasedItems, setPurchasedItems] = useKV<string[]>('purchased-microtransactions', [])
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((current) => {
        const updated = { ...current }
        Object.keys(updated).forEach((key) => {
          if (updated[key] > 0) {
            updated[key] -= 1
          }
        })
        return updated
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const initialTime: { [key: string]: number } = {}
    microTransactions.forEach((item) => {
      if (item.expiresIn) {
        initialTime[item.id] = item.expiresIn
      }
    })
    setTimeRemaining(initialTime)
  }, [])

  if (!profile) return null

  const xpProgress = (profile.xp / profile.xpToNextLevel) * 100

  const microTransactions: MicroTransaction[] = [
    {
      id: 'neural-core',
      title: 'NEURAL CORE',
      subtitle: 'UPGRADE YOUR REFLEX LOOP',
      description: 'Boost aim assist, dodge speed, and precision attack control',
      price: 4.99,
      icon: <Brain size={48} weight="duotone" className="text-primary neon-glow-primary" />,
      category: 'upgrade',
      duration: 168,
      featured: true,
      benefit1: 'Precision Speed',
      benefit2: 'Total control',
      benefit3: 'For a price',
      purchased: purchasedItems?.includes('neural-core') || false
    },
    {
      id: 'ex-coin',
      title: 'EX-COIN',
      subtitle: 'EARN BY COMBAT',
      description: 'Bonus in-mission combat, search on replays, earn, and topple sell',
      price: 6.99,
      icon: <Coins size={48} weight="duotone" className="text-accent neon-glow-accent" />,
      category: 'upgrade',
      duration: 168,
      featured: true,
      benefit1: 'Encrypted',
      benefit2: 'Trace-free',
      benefit3: 'Yours forever',
      purchased: purchasedItems?.includes('ex-coin') || false
    },
    {
      id: 'quantum-pistol',
      title: 'ZX-G1 PISTOL',
      subtitle: 'STANDARD-ISSUE SIDEARM',
      description: 'For aggressive running solo operators. Fast, lethal, versatile',
      price: 8.99,
      icon: <Target size={48} weight="duotone" className="text-secondary neon-glow-secondary" />,
      category: 'cosmetic',
      featured: true,
      benefit1: 'Upgradable',
      benefit2: 'Silent',
      benefit3: 'Deadly',
      purchased: purchasedItems?.includes('quantum-pistol') || false
    },
    {
      id: 'xp-boost-small',
      title: 'XP SURGE',
      description: '+50% XP earnings boost. Level up in half the time',
      price: 2.99,
      icon: <Lightning size={40} weight="duotone" className="text-primary" />,
      category: 'boost',
      duration: 24,
      discount: 15,
      expiresIn: 3600,
      purchased: purchasedItems?.includes('xp-boost-small') || false
    },
    {
      id: 'trade-speed',
      title: 'PRIORITY EXEC',
      description: 'Fast-track execution with quantum routing',
      price: 4.99,
      icon: <Rocket size={40} weight="duotone" className="text-accent" />,
      category: 'boost',
      duration: 48,
      discount: 20,
      expiresIn: 7200,
      purchased: purchasedItems?.includes('trade-speed') || false
    },
    {
      id: 'instant-xp',
      title: 'INSTANT 500 XP',
      description: 'Immediate level progression. No grinding',
      price: 1.99,
      icon: <Star size={40} weight="fill" className="text-primary" />,
      category: 'boost',
      discount: 30,
      expiresIn: 5400,
      purchased: false
    },
    {
      id: 'profit-multiplier',
      title: 'PROFIT AMPLIFIER',
      description: '+25% earnings on every trade for 30 days',
      price: 19.99,
      icon: <ChartLineUp size={40} weight="duotone" className="text-accent" />,
      category: 'upgrade',
      duration: 720,
      purchased: purchasedItems?.includes('profit-multiplier') || false
    },
    {
      id: 'tactical-badge',
      title: 'ELITE OPERATOR',
      description: 'Exclusive badge. Stand out from the crowd',
      price: 7.99,
      icon: <ShieldCheck size={40} weight="duotone" className="text-secondary" />,
      category: 'cosmetic',
      purchased: purchasedItems?.includes('tactical-badge') || false
    },
    {
      id: 'algorithm-core',
      title: 'ALGORITHM CORE',
      description: 'Advanced AI prediction system with quantum analysis',
      price: 14.99,
      icon: <Atom size={40} weight="duotone" className="text-primary" />,
      category: 'upgrade',
      duration: 336,
      purchased: purchasedItems?.includes('algorithm-core') || false
    }
  ]

  const purchaseItem = (item: MicroTransaction) => {
    if (item.purchased) {
      toast.info('Already owned', {
        description: 'You already have this enhancement'
      })
      return
    }

    toast.success('Purchase Successful!', {
      description: `${item.title} has been activated`,
      icon: '✨'
    })

    setPurchasedItems((current) => [...(current || []), item.id])

    if (item.id === 'instant-xp') {
      setProfile((current) => {
        if (!current) {
          return {
            username: 'QuantumTrader',
            level: 7,
            xp: 500,
            xpToNextLevel: 3000,
            badges: ['Early Adopter', 'Profit Maker', 'Bot Master'],
            rank: 47,
            wins: 124,
            streak: 5
          }
        }
        const newXP = current.xp + 500
        let newLevel = current.level
        let newXPToNext = current.xpToNextLevel

        if (newXP >= current.xpToNextLevel) {
          newLevel += 1
          newXPToNext = current.xpToNextLevel + 500
          toast.success('Level Up!', {
            description: `You are now level ${newLevel}!`,
            icon: '🎉'
          })
        }

        return {
          ...current,
          xp: newXP >= current.xpToNextLevel ? newXP - current.xpToNextLevel : newXP,
          level: newLevel,
          xpToNextLevel: newXPToNext
        }
      })
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const activeBoosts = microTransactions.filter((item) => item.purchased && item.category === 'boost')

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-br from-card via-background to-card border-3 border-primary/50 jagged-corner">
        <div className="absolute inset-0 technical-grid opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 blur-3xl" />
        
        <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
          <line x1="0" y1="20%" x2="100%" y2="20%" className="circuit-line" />
          <line x1="0" y1="80%" x2="100%" y2="80%" className="circuit-line" />
          <circle cx="10%" cy="20%" r="4" fill="var(--primary)" className="animate-pulse" />
          <circle cx="90%" cy="80%" r="4" fill="var(--accent)" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
        </svg>

        <div className="relative z-10 p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <ProfileUpload size="xl" showUploadButton={true} />
              <div className="absolute -top-2 -right-2 bg-primary border-2 border-background px-3 py-1 jagged-corner-small">
                <span className="text-xs font-black text-primary-foreground uppercase tracking-wider">LVL {profile.level}</span>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl md:text-4xl font-black uppercase tracking-[0.15em] text-primary hud-text">
                    {profile.username}
                  </h2>
                  <div className="status-indicator animate-pulse-glow" />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className="bg-primary/20 text-primary border-2 border-primary/50 uppercase tracking-wider font-bold jagged-corner-small px-3 py-1">
                    <Trophy size={14} weight="fill" className="mr-1" />
                    RANK #{profile.rank}
                  </Badge>
                  <Badge className="bg-accent/20 text-accent border-2 border-accent/50 uppercase tracking-wider font-bold jagged-corner-small px-3 py-1">
                    <Target size={14} weight="fill" className="mr-1" />
                    {profile.wins} VICTORIES
                  </Badge>
                  <Badge className="bg-secondary/20 text-secondary border-2 border-secondary/50 uppercase tracking-wider font-bold jagged-corner-small px-3 py-1">
                    <Fire size={14} weight="fill" className="mr-1" />
                    {profile.streak} DAY STREAK
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-bold">
                    XP_PROGRESSION
                  </span>
                  <span className="text-sm font-black text-primary hud-value">
                    {profile.xp} / {profile.xpToNextLevel}
                  </span>
                </div>
                <div className="relative">
                  <Progress value={xpProgress} className="h-3 border border-primary/30" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-foreground drop-shadow-lg uppercase tracking-wider">
                      {Math.round(xpProgress)}% TO NEXT LEVEL
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-center uppercase tracking-wide">
                  <span className="text-accent font-bold">{profile.xpToNextLevel - profile.xp} XP</span> NEEDED FOR LEVEL {profile.level + 1}
                </div>
              </div>

              {activeBoosts.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-primary/20">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1">
                    <Lightning size={12} weight="fill" className="text-primary" />
                    ACTIVE_BOOSTS:
                  </span>
                  {activeBoosts.map((boost) => (
                    <Badge key={boost.id} className="bg-accent/20 text-accent border border-accent/50 uppercase text-[10px] tracking-wider font-bold jagged-corner-small animate-pulse-glow">
                      {boost.title}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="marketplace" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border-2 border-primary/30 p-1 gap-1">
          <TabsTrigger 
            value="marketplace" 
            className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary jagged-corner-small transition-all"
          >
            <Sparkle size={16} weight="duotone" className="mr-2" />
            OFFERS
          </TabsTrigger>
          <TabsTrigger 
            value="boosts" 
            className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-accent/20 data-[state=active]:text-accent data-[state=active]:border-2 data-[state=active]:border-accent jagged-corner-small transition-all"
          >
            <Lightning size={16} weight="duotone" className="mr-2" />
            BOOSTS
          </TabsTrigger>
          <TabsTrigger 
            value="leaderboard" 
            className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary data-[state=active]:border-2 data-[state=active]:border-secondary jagged-corner-small transition-all"
          >
            <Trophy size={16} weight="duotone" className="mr-2" />
            RANKINGS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-background via-card to-background border-3 border-primary/40 p-8 jagged-corner">
            <div className="absolute inset-0 technical-grid opacity-10" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/20 blur-3xl rounded-full" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-3xl md:text-4xl font-black uppercase tracking-[0.2em] mb-2">
                    <span className="text-primary neon-glow-primary">SPECIAL</span>
                  </h3>
                  <h3 className="text-3xl md:text-4xl font-black uppercase tracking-[0.2em]">
                    <span className="text-foreground">OFFERS</span>
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] mt-4 max-w-md leading-relaxed">
                    A high-speed, neon-drenched shooter where reflexes rule and legends are forged.
                  </p>
                  <Button 
                    variant="link" 
                    className="text-primary uppercase tracking-wider text-xs mt-2 p-0 h-auto underline hover:no-underline"
                  >
                    VIEW MORE →
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {microTransactions.filter(item => item.featured).map((item, index) => {
                  const colors = [
                    { bg: 'bg-gradient-to-br from-primary/30 to-primary/10', border: 'border-primary', glow: 'shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.4)]', text: 'text-primary' },
                    { bg: 'bg-gradient-to-br from-accent/30 to-accent/10', border: 'border-accent', glow: 'shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.4)]', text: 'text-accent' },
                    { bg: 'bg-gradient-to-br from-secondary/30 to-secondary/10', border: 'border-secondary', glow: 'shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.4)]', text: 'text-secondary' }
                  ]
                  const color = colors[index]

                  return (
                    <div
                      key={item.id}
                      className={`${color.bg} ${color.border} border-2 p-6 relative overflow-hidden jagged-corner group hover:${color.glow} transition-all duration-300 cursor-pointer`}
                    >
                      <div className="absolute inset-0 diagonal-stripes opacity-5" />
                      
                      <div className="relative z-10 space-y-4">
                        <div className="flex justify-center mb-4">
                          <div className="relative">
                            {item.icon}
                            <div className={`absolute inset-0 ${color.bg} blur-xl opacity-50 group-hover:opacity-80 transition-opacity`} />
                          </div>
                        </div>

                        <div className="text-center space-y-2">
                          <h4 className={`text-xl font-black uppercase tracking-[0.15em] ${color.text} hud-text`}>
                            {item.title}
                          </h4>
                          {item.subtitle && (
                            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                              {item.subtitle}
                            </p>
                          )}
                        </div>

                        <p className="text-xs text-foreground/80 text-center leading-relaxed min-h-[3rem]">
                          {item.description}
                        </p>

                        {item.benefit1 && (
                          <div className="space-y-1 pt-2 border-t border-current/20">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-muted-foreground uppercase tracking-wider">{item.benefit1}:</span>
                              <span className={`${color.text} font-bold uppercase tracking-wider`}>{item.benefit2}</span>
                            </div>
                            <div className="text-[10px] text-center text-muted-foreground italic">
                              {item.benefit3}
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={() => purchaseItem(item)}
                          disabled={item.purchased}
                          className={`w-full uppercase tracking-[0.15em] font-bold text-xs jagged-corner-small ${color.border} border-2 hover:bg-current/10 transition-all`}
                          variant="outline"
                          size="sm"
                        >
                          {item.purchased ? 'OWNED' : `EARN NOW - $${item.price.toFixed(2)}`}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold uppercase tracking-[0.2em] text-primary hud-text">
                MORE_ENHANCEMENTS
              </h3>
              <Badge className="bg-destructive/20 text-destructive border-destructive/50 uppercase text-xs">
                <Clock size={12} weight="fill" className="mr-1" />
                LIMITED_TIME
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {microTransactions.filter(item => !item.featured).map((item) => {
                const isLimited = item.expiresIn && timeRemaining[item.id]
                const hasDiscount = item.discount && item.discount > 0

                return (
                  <div
                    key={item.id}
                    className={`glass-morph-card p-5 space-y-4 relative overflow-hidden group hover:shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.3)] transition-all duration-300 ${
                      isLimited ? 'border-2 border-accent' : ''
                    }`}
                  >
                    <div className="absolute inset-0 grid-background opacity-5" />
                    
                    {hasDiscount && (
                      <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] jagged-corner-small z-20">
                        -{item.discount}% OFF
                      </div>
                    )}

                    {isLimited && (
                      <div className="absolute top-0 left-0">
                        <div className="relative">
                          <div className="absolute inset-0 bg-accent/20 blur-lg" />
                          <div className="relative bg-accent/90 text-accent-foreground px-3 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">
                            <Lightning size={10} weight="fill" className="inline mr-1" />
                            FLASH_SALE
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="relative z-10 pt-8">
                      <div className="flex items-center justify-center mb-4">
                        <div className="p-4 bg-primary/10 border border-primary/30 jagged-corner-small">
                          {item.icon}
                        </div>
                      </div>

                      <div className="text-center space-y-2 mb-4">
                        <h4 className="font-bold uppercase tracking-[0.12em] text-sm text-primary">
                          {item.title}
                        </h4>
                        <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
                          {item.category}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground text-center leading-relaxed min-h-[2.5rem]">
                        {item.description}
                      </p>

                      {item.duration && (
                        <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wide py-2">
                          <Clock size={12} weight="duotone" />
                          <span>ACTIVE_{item.duration}H</span>
                        </div>
                      )}

                      {isLimited && timeRemaining[item.id] > 0 && (
                        <div className="bg-accent/10 border border-accent/30 p-2 text-center jagged-corner-small animate-pulse-glow">
                          <div className="text-[10px] text-accent uppercase tracking-[0.15em] font-bold">
                            ⚡ {formatTime(timeRemaining[item.id])} REMAINING
                          </div>
                        </div>
                      )}

                      <div className="pt-4 mt-4 border-t border-primary/20 space-y-3">
                        <div className="flex items-center justify-center gap-3">
                          {hasDiscount ? (
                            <>
                              <span className="text-sm font-bold text-muted-foreground line-through">
                                ${item.price.toFixed(2)}
                              </span>
                              <span className="text-2xl font-black text-primary hud-value">
                                ${(item.price * (1 - (item.discount || 0) / 100)).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-black text-primary hud-value">
                              ${item.price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        <Button
                          onClick={() => purchaseItem(item)}
                          disabled={item.purchased}
                          className="w-full jagged-corner-small uppercase tracking-[0.12em] font-bold text-xs group/btn"
                          size="sm"
                        >
                          {item.purchased ? (
                            <>
                              <ShieldCheck size={14} weight="fill" className="mr-1" />
                              OWNED
                            </>
                          ) : (
                            <>
                              <Lightning size={14} weight="fill" className="mr-1 group-hover/btn:animate-pulse" />
                              BUY_NOW
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="boosts" className="space-y-4">
          {activeBoosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBoosts.map((boost) => (
                <div key={boost.id} className="glass-morph-card p-6 space-y-4 border-2 border-accent/50 relative overflow-hidden group">
                  <div className="absolute inset-0 grid-background opacity-5" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-3xl" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-4 bg-accent/20 border-2 border-accent/40 jagged-corner-small">
                        {boost.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold uppercase tracking-[0.12em] text-accent mb-1">{boost.title}</h4>
                        <p className="text-xs text-muted-foreground">{boost.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-accent/10 border border-accent/30 jagged-corner-small">
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                      <span className="text-xs uppercase tracking-[0.15em] text-accent font-black">
                        BOOST_ACTIVE
                      </span>
                      {boost.duration && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">
                            {boost.duration}H REMAINING
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-morph-card p-16 text-center relative overflow-hidden">
              <div className="absolute inset-0 technical-grid opacity-5" />
              <div className="relative z-10">
                <Fire size={64} weight="duotone" className="text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-2xl font-black uppercase tracking-[0.2em] text-foreground mb-2">
                  NO_ACTIVE_BOOSTS
                </h3>
                <p className="text-sm text-muted-foreground mb-6 uppercase tracking-wide">
                  PURCHASE ENHANCEMENTS TO GAIN COMPETITIVE EDGE
                </p>
                <Button 
                  variant="outline" 
                  className="border-2 border-primary text-primary hover:bg-primary/10 uppercase tracking-[0.15em] font-bold jagged-corner-small"
                  onClick={() => document.querySelector<HTMLButtonElement>('[value="marketplace"]')?.click()}
                >
                  <Lightning size={16} weight="fill" className="mr-2" />
                  BROWSE_OFFERS
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <div className="glass-morph-card p-6 mb-4 relative overflow-hidden">
            <div className="absolute inset-0 diagonal-stripes opacity-5" />
            <div className="relative z-10">
              <h3 className="text-xl font-black uppercase tracking-[0.2em] text-primary hud-text mb-2">
                GLOBAL_RANKINGS
              </h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                TOP OPERATORS BY TOTAL PROFIT // LIVE UPDATED
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { rank: 1, user: 'DiamondHands', profit: '+$12,847', wins: 247, level: 15, avatar: '💎' },
              { rank: 2, user: 'SolanaWhale', profit: '+$9,134', wins: 198, level: 13, avatar: '🐋' },
              { rank: 3, user: 'BotMaster3000', profit: '+$7,923', wins: 176, level: 14, avatar: '🤖' },
              { rank: 4, user: 'CryptoNinja', profit: '+$5,421', wins: 164, level: 12, avatar: '🥷' },
              { rank: 5, user: profile.username, profit: '+$3,836', wins: profile.wins, level: profile.level, avatar: '⚡' },
            ].map((entry) => {
              const isCurrentUser = entry.user === profile.username
              const isTopThree = entry.rank <= 3
              const rankColors = [
                'text-accent border-accent/50 bg-accent/10',
                'text-primary border-primary/50 bg-primary/10',
                'text-secondary border-secondary/50 bg-secondary/10'
              ]

              return (
                <div
                  key={entry.rank}
                  className={`glass-morph-card p-5 flex items-center gap-4 relative overflow-hidden group hover:scale-[1.02] transition-all ${
                    isCurrentUser ? 'border-3 border-primary shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.4)]' : ''
                  }`}
                >
                  <div className="absolute inset-0 grid-background opacity-5" />
                  
                  {isCurrentUser && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-[10px] font-black uppercase tracking-wider jagged-corner-small">
                      YOU
                    </div>
                  )}

                  <div className="relative z-10 flex items-center gap-4 flex-1">
                    <div className={`text-3xl font-black hud-value min-w-[4rem] text-center ${
                      isTopThree ? rankColors[entry.rank - 1] : 'text-muted-foreground'
                    } p-3 border-2 ${isTopThree ? rankColors[entry.rank - 1].split(' ')[1] : 'border-muted/30'} jagged-corner-small`}>
                      #{entry.rank}
                    </div>

                    <div className="text-3xl">{entry.avatar}</div>

                    {entry.rank === 1 && <Crown size={32} weight="fill" className="text-accent neon-glow-accent" />}
                    {entry.rank === 2 && <Trophy size={32} weight="fill" className="text-primary neon-glow-primary" />}
                    {entry.rank === 3 && <Star size={32} weight="fill" className="text-secondary neon-glow-secondary" />}

                    <div className="flex-1">
                      <div className="font-black uppercase tracking-[0.15em] text-lg mb-1">{entry.user}</div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                            LVL {entry.level}
                          </Badge>
                        </div>
                        <span>•</span>
                        <span className="uppercase tracking-wider">{entry.wins} VICTORIES</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-primary hud-value">{entry.profit}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">TOTAL_PROFIT</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
