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
  ShieldCheck
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
  price: number
  icon: React.ReactNode
  category: 'boost' | 'upgrade' | 'cosmetic'
  duration?: number
  discount?: number
  expiresIn?: number
  purchased: boolean
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
      id: 'xp-boost-small',
      title: 'XP Boost (24h)',
      description: '+50% XP earnings for 24 hours',
      price: 2.99,
      icon: <Lightning size={32} weight="duotone" className="text-primary" />,
      category: 'boost',
      duration: 24,
      purchased: purchasedItems?.includes('xp-boost-small') || false
    },
    {
      id: 'trade-speed',
      title: 'Priority Execution',
      description: 'Fast-track your trades for 48h',
      price: 4.99,
      icon: <Rocket size={32} weight="duotone" className="text-accent" />,
      category: 'boost',
      duration: 48,
      discount: 20,
      expiresIn: 3600,
      purchased: purchasedItems?.includes('trade-speed') || false
    },
    {
      id: 'premium-signals',
      title: 'Premium Signals (7d)',
      description: 'Exclusive AI market insights',
      price: 9.99,
      icon: <Target size={32} weight="duotone" className="text-secondary" />,
      category: 'upgrade',
      duration: 168,
      purchased: purchasedItems?.includes('premium-signals') || false
    },
    {
      id: 'instant-xp',
      title: 'Instant 500 XP',
      description: 'Level up immediately',
      price: 1.99,
      icon: <Star size={32} weight="fill" className="text-primary" />,
      category: 'boost',
      discount: 30,
      expiresIn: 7200,
      purchased: false
    },
    {
      id: 'profit-multiplier',
      title: 'Profit Multiplier (30d)',
      description: '+25% earnings on all trades',
      price: 19.99,
      icon: <Coins size={32} weight="duotone" className="text-accent" />,
      category: 'upgrade',
      duration: 720,
      purchased: purchasedItems?.includes('profit-multiplier') || false
    },
    {
      id: 'custom-badge',
      title: 'Custom Elite Badge',
      description: 'Stand out with exclusive flair',
      price: 7.99,
      icon: <ShieldCheck size={32} weight="duotone" className="text-secondary" />,
      category: 'cosmetic',
      purchased: purchasedItems?.includes('custom-badge') || false
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
      <div className="cyber-card p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <ProfileUpload size="xl" showUploadButton={true} />

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-wider text-primary hud-text">
                {profile.username}
              </h2>
              <div className="flex items-center gap-3 mt-2">
                <Badge className="bg-primary/20 text-primary border-primary/50 uppercase">
                  Level {profile.level}
                </Badge>
                <Badge variant="outline" className="uppercase">
                  Rank #{profile.rank}
                </Badge>
                <Badge variant="outline" className="uppercase">
                  {profile.wins} Wins
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground uppercase tracking-wider">
                  Level Progress
                </span>
                <span className="font-bold">
                  {profile.xp} / {profile.xpToNextLevel} XP
                </span>
              </div>
              <Progress value={xpProgress} className="h-2" />
            </div>

            {activeBoosts.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeBoosts.map((boost) => (
                  <Badge key={boost.id} className="bg-accent/20 text-accent border-accent/50 uppercase text-xs">
                    <Fire size={12} weight="fill" className="mr-1" />
                    {boost.title}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="marketplace" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-card border-2 border-primary/30">
          <TabsTrigger value="marketplace" className="uppercase tracking-wider">
            <Sparkle size={16} weight="duotone" className="mr-2" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="boosts" className="uppercase tracking-wider">
            <Lightning size={16} weight="duotone" className="mr-2" />
            Active Boosts
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="uppercase tracking-wider">
            <Trophy size={16} weight="duotone" className="mr-2" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="marketplace" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold uppercase tracking-wider text-foreground">
                Enhancement Marketplace
              </h3>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
                Limited-time offers & exclusive upgrades
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {microTransactions.map((item) => {
              const isLimited = item.expiresIn && timeRemaining[item.id]
              const hasDiscount = item.discount && item.discount > 0

              return (
                <div
                  key={item.id}
                  className={`cyber-card p-6 space-y-4 relative overflow-hidden ${
                    isLimited ? 'border-2 border-accent' : ''
                  }`}
                >
                  {isLimited && (
                    <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider">
                      <Clock size={12} weight="fill" className="inline mr-1" />
                      Limited
                    </div>
                  )}

                  {hasDiscount && (
                    <div className="absolute top-0 left-0 bg-destructive text-destructive-foreground px-3 py-1 text-xs font-bold uppercase tracking-wider">
                      -{item.discount}%
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-6">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold uppercase tracking-wider text-sm">
                        {item.title}
                      </h4>
                      <Badge variant="outline" className="mt-1 text-xs uppercase">
                        {item.category}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{item.description}</p>

                  {item.duration && (
                    <div className="text-xs text-muted-foreground uppercase tracking-wide">
                      Duration: {item.duration}h
                    </div>
                  )}

                  {isLimited && timeRemaining[item.id] > 0 && (
                    <div className="bg-accent/10 border border-accent/30 p-2 rounded text-center">
                      <div className="text-xs text-accent uppercase tracking-wider font-bold">
                        Expires in {formatTime(timeRemaining[item.id])}
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-primary/30 flex items-center justify-between">
                    <div>
                      {hasDiscount ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-muted-foreground line-through">
                            ${item.price.toFixed(2)}
                          </span>
                          <span className="text-2xl font-bold text-primary hud-value">
                            ${(item.price * (1 - (item.discount || 0) / 100)).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-bold text-primary hud-value">
                          ${item.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => purchaseItem(item)}
                      disabled={item.purchased}
                      className="jagged-corner-small"
                      size="sm"
                    >
                      {item.purchased ? 'Owned' : 'Buy Now'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="boosts" className="space-y-4">
          {activeBoosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBoosts.map((boost) => (
                <div key={boost.id} className="cyber-card p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/20 rounded-lg">
                      {boost.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold uppercase tracking-wider">{boost.title}</h4>
                      <p className="text-sm text-muted-foreground">{boost.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-xs uppercase tracking-wider text-primary font-bold">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="cyber-card p-12 text-center">
              <Fire size={48} weight="duotone" className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-bold uppercase tracking-wider text-foreground mb-2">
                No Active Boosts
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Purchase boosts from the marketplace to enhance your trading
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <div className="space-y-3">
            {[
              { rank: 1, user: 'DiamondHands', profit: '+$12,847', wins: 247, level: 15 },
              { rank: 2, user: 'SolanaWhale', profit: '+$9,134', wins: 198, level: 13 },
              { rank: 3, user: 'BotMaster3000', profit: '+$7,923', wins: 176, level: 14 },
              { rank: 4, user: 'CryptoNinja', profit: '+$5,421', wins: 164, level: 12 },
              { rank: 5, user: profile.username, profit: '+$3,836', wins: profile.wins, level: profile.level },
            ].map((entry) => (
              <div
                key={entry.rank}
                className={`cyber-card p-4 flex items-center gap-4 ${
                  entry.user === profile.username ? 'border-2 border-primary' : ''
                }`}
              >
                <div className={`text-2xl font-bold hud-value min-w-[3rem] text-center ${
                  entry.rank <= 3 ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  #{entry.rank}
                </div>

                {entry.rank === 1 && <Crown size={24} weight="fill" className="text-accent" />}
                {entry.rank === 2 && <Trophy size={24} weight="fill" className="text-primary" />}
                {entry.rank === 3 && <Star size={24} weight="fill" className="text-secondary" />}

                <div className="flex-1">
                  <div className="font-bold uppercase tracking-wider">{entry.user}</div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span>Level {entry.level}</span>
                    <span>•</span>
                    <span>{entry.wins} Wins</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-primary hud-value">{entry.profit}</div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
