import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Trophy, 
  Star, 
  Lightning, 
  Coins, 
  Sword,
  ShieldCheck,
  Target,
  Fire,
  TrendUp,
  Crown,
  Rocket,
  Medal
} from '@phosphor-icons/react'
import { toast } from 'sonner'

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

interface Perk {
  id: string
  title: string
  description: string
  details: string
  icon: React.ReactNode
  price: string
  unlocked: boolean
}

export default function Community() {
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

  const [unlockedPerks, setUnlockedPerks] = useKV<string[]>('unlocked-perks', [])

  if (!profile) return null

  const xpProgress = (profile.xp / profile.xpToNextLevel) * 100

  const perks: Perk[] = [
    {
      id: 'speed-boost',
      title: 'Speed Boost',
      description: 'Upgrade your trading speed',
      details: 'Priority execution, Faster signals, Zero-lag interface',
      icon: <Lightning size={48} weight="duotone" />,
      price: '500 XP',
      unlocked: unlockedPerks?.includes('speed-boost') || false
    },
    {
      id: 'premium-signals',
      title: 'Premium Signals',
      description: 'Access exclusive market insights',
      details: 'AI predictions, Whale alerts, Hidden gems',
      icon: <Target size={48} weight="duotone" />,
      price: '750 XP',
      unlocked: unlockedPerks?.includes('premium-signals') || false
    },
    {
      id: 'profit-multiplier',
      title: 'Profit Multiplier',
      description: 'Boost your earning potential',
      details: '2x rewards, Bonus trades, VIP status',
      icon: <Coins size={48} weight="duotone" />,
      price: '1000 XP',
      unlocked: unlockedPerks?.includes('profit-multiplier') || false
    }
  ]

  const unlockPerk = (perk: Perk) => {
    if (perk.unlocked) {
      toast.info('Already unlocked', { description: 'You already have this perk activated' })
      return
    }

    const requiredXP = parseInt(perk.price)
    if (profile.xp < requiredXP) {
      toast.error('Not enough XP', { description: `You need ${requiredXP} XP to unlock this perk` })
      return
    }

    setProfile((current) => {
      if (!current) return {
        username: 'QuantumTrader',
        level: 7,
        xp: 2340,
        xpToNextLevel: 3000,
        badges: ['Early Adopter', 'Profit Maker', 'Bot Master'],
        rank: 47,
        wins: 124,
        streak: 5
      }
      return {
        ...current,
        xp: current.xp - requiredXP
      }
    })

    setUnlockedPerks((current) => [...(current || []), perk.id])
    
    toast.success('Perk Unlocked!', { 
      description: `${perk.title} is now active`,
      icon: '🎉'
    })
  }

  const leaderboard = [
    { rank: 1, user: 'DiamondHands', profit: '+$12,847', wins: 247, level: 15, avatar: '👑' },
    { rank: 2, user: 'SolanaWhale', profit: '+$9,134', wins: 198, level: 13, avatar: '🐋' },
    { rank: 3, user: 'BotMaster3000', profit: '+$7,923', wins: 176, level: 14, avatar: '🤖' },
    { rank: 4, user: 'CryptoNinja', profit: '+$5,421', wins: 164, level: 12, avatar: '🥷' },
    { rank: 5, user: profile.username, profit: '+$3,836', wins: profile.wins, level: profile.level, avatar: '⚡' },
  ]

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-lg cyber-card p-8 md:p-12 min-h-[300px] md:min-h-[400px]">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
        <div className="absolute inset-0 diagonal-stripes opacity-10" />
        
        <div className="absolute top-0 right-0 w-2/3 h-full opacity-20 pointer-events-none overflow-hidden">
          <div className="text-[180px] md:text-[280px] font-black leading-none tracking-tighter text-primary/30 absolute -top-12 -right-12 transform rotate-[-5deg]">
            TRADE
          </div>
        </div>

        <div className="relative z-10">
          <div className="mb-6">
            <Badge className="bg-accent/20 text-accent border-accent/50 text-xs uppercase tracking-wider mb-3 px-3 py-1">
              Community Hub
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-4">
              <span className="text-primary neon-glow-primary block">Just Smart</span>
              <span className="text-accent neon-glow-secondary block mt-1" style={{
                fontSize: '0.85em',
                fontStyle: 'italic',
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 900,
                transform: 'skew(-5deg)',
                display: 'inline-block'
              }}>
                Traders
              </span>
            </h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-background/60 backdrop-blur-sm border border-primary/30 p-4 jagged-corner-small">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={20} className="text-accent" weight="fill" />
                <span className="data-label text-[10px]">Rank</span>
              </div>
              <div className="text-2xl font-black text-primary">#{profile.rank}</div>
            </div>
            <div className="bg-background/60 backdrop-blur-sm border border-primary/30 p-4 jagged-corner-small">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={20} className="text-accent" weight="fill" />
                <span className="data-label text-[10px]">Level</span>
              </div>
              <div className="text-2xl font-black text-primary">{profile.level}</div>
            </div>
            <div className="bg-background/60 backdrop-blur-sm border border-primary/30 p-4 jagged-corner-small">
              <div className="flex items-center gap-2 mb-2">
                <Target size={20} className="text-accent" weight="fill" />
                <span className="data-label text-[10px]">Wins</span>
              </div>
              <div className="text-2xl font-black text-primary">{profile.wins}</div>
            </div>
            <div className="bg-background/60 backdrop-blur-sm border border-primary/30 p-4 jagged-corner-small">
              <div className="flex items-center gap-2 mb-2">
                <Fire size={20} className="text-accent" weight="fill" />
                <span className="data-label text-[10px]">Streak</span>
              </div>
              <div className="text-2xl font-black text-accent neon-glow-secondary">{profile.streak}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-background/40 backdrop-blur-sm rounded-lg border border-border/50 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-2">
              <span className="text-foreground">Special</span>{' '}
              <span className="text-accent neon-glow-secondary">Perks</span>
            </h2>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              Unlock game-changing upgrades with your XP
            </p>
          </div>
          <div className="bg-card/80 border border-primary/30 px-6 py-3 jagged-corner-small">
            <div className="data-label text-[10px] mb-1">Your Balance</div>
            <div className="text-xl md:text-2xl font-black text-primary flex items-center gap-2">
              <Star size={20} weight="fill" className="text-accent" />
              {profile.xp} XP
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {perks.map((perk) => (
            <div 
              key={perk.id}
              className={`relative overflow-hidden transition-all duration-300 ${
                perk.unlocked 
                  ? 'bg-accent/90 border-2 border-accent shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.4)]' 
                  : 'bg-accent hover:bg-accent/95 border-2 border-accent/80 hover:border-accent shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)] hover:shadow-[0_0_35px_oklch(0.68_0.18_330_/_0.5)]'
              }`}
              style={{
                borderRadius: '8px',
                transform: perk.unlocked ? 'scale(0.98)' : 'scale(1)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-background/10 to-transparent" />
              {perk.unlocked && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-background/90 border-2 border-accent rounded-full p-2">
                    <ShieldCheck size={24} weight="fill" className="text-accent" />
                  </div>
                </div>
              )}
              
              <div className="relative p-6 flex flex-col h-full">
                <div className="mb-4">
                  <div className="text-background/90 mb-3">
                    {perk.icon}
                  </div>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-background mb-2">
                    {perk.title}
                  </h3>
                  <p className="text-background/80 font-semibold text-sm mb-3">
                    {perk.description}
                  </p>
                  <div className="space-y-1">
                    {perk.details.split(',').map((detail, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-background/70 font-medium">
                        <div className="w-1 h-1 bg-background/70 rounded-full" />
                        {detail.trim()}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <Button
                    onClick={() => unlockPerk(perk)}
                    disabled={perk.unlocked}
                    className={`w-full font-black uppercase tracking-wide text-sm ${
                      perk.unlocked
                        ? 'bg-background/40 text-background/60 cursor-not-allowed border-2 border-background/20'
                        : 'bg-background hover:bg-background/90 text-accent border-2 border-background shadow-lg'
                    }`}
                  >
                    {perk.unlocked ? 'Activated' : `Unlock ${perk.price}`}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="backdrop-blur-md bg-card/50 border-primary/30 h-full">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Medal size={28} weight="duotone" className="text-accent" />
                <CardTitle className="text-2xl font-black uppercase tracking-tight">Leaderboard</CardTitle>
              </div>
              <CardDescription className="uppercase text-xs tracking-wide">
                Top traders this season
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div 
                    key={entry.rank}
                    className={`relative overflow-hidden transition-all ${
                      entry.user === profile.username
                        ? 'cyber-card-accent p-4'
                        : 'cyber-card p-4 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-3xl font-black w-12 h-12 flex items-center justify-center ${
                        entry.rank === 1 ? 'text-accent neon-glow-secondary' :
                        entry.rank === 2 ? 'text-secondary' :
                        entry.rank === 3 ? 'text-primary' :
                        'text-muted-foreground'
                      }`}>
                        {entry.rank === 1 ? '👑' : `#${entry.rank}`}
                      </div>
                      <div className="text-4xl">{entry.avatar}</div>
                      <div className="flex-1">
                        <div className="font-bold text-sm md:text-base">{entry.user}</div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Trophy size={12} weight="fill" />
                            Lvl {entry.level}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Target size={12} weight="fill" />
                            {entry.wins}W
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-accent font-black text-lg neon-glow-secondary">
                          {entry.profit}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="backdrop-blur-md bg-card/50 border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Rocket size={28} weight="duotone" className="text-primary" />
                <CardTitle className="text-xl font-black uppercase tracking-tight">Your Progress</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="data-label text-xs">Level {profile.level}</span>
                  <span className="text-xs font-bold text-primary">{profile.xp} / {profile.xpToNextLevel} XP</span>
                </div>
                <Progress value={xpProgress} className="h-3 bg-muted/50" />
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="data-label text-xs mb-3">Active Badges</p>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge, i) => (
                    <Badge 
                      key={i} 
                      className="bg-secondary/20 border-secondary/50 text-secondary font-semibold text-xs"
                    >
                      <Star size={12} weight="fill" className="mr-1" />
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-gradient-to-br from-accent/10 to-primary/10 border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <TrendUp size={32} weight="duotone" className="text-accent shrink-0" />
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wide mb-1">Keep Trading!</h3>
                  <p className="text-xs text-muted-foreground">
                    Complete 3 more successful trades to earn <span className="text-accent font-bold">100 XP</span> bonus
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}