import { useState } from 'react'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Lightning, Star, Crown, Sparkle, Fire, Target, CheckCircle, Lock, Info } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface XPPerk {
  id: string
  name: string
  description: string
  benefits: string[]
  cost: number
  duration: string
  icon: React.ReactNode
  color: string
  type: 'speed' | 'signals' | 'multiplier' | 'strategy' | 'agent'
}

const PERKS: XPPerk[] = [
  {
    id: 'speed-boost',
    name: 'Speed Boost',
    description: 'Priority execution for all trades',
    benefits: [
      'Jump to front of trade queue',
      'Faster signals < 100ms',
      'Zero-lag interface',
      'Priority server access'
    ],
    cost: 500,
    duration: '24 hours',
    icon: <Lightning size={24} weight="fill" />,
    color: 'primary',
    type: 'speed'
  },
  {
    id: 'premium-signals',
    name: 'Premium Signals',
    description: 'Access exclusive market insights',
    benefits: [
      'Elite trader signals',
      'Whale movement alerts',
      'Token launch predictions',
      'Market sentiment analysis'
    ],
    cost: 750,
    duration: '7 days',
    icon: <Star size={24} weight="fill" />,
    color: 'accent',
    type: 'signals'
  },
  {
    id: 'profit-multiplier',
    name: 'Profit Multiplier',
    description: '1.5x profits on winning trades',
    benefits: [
      '50% bonus on all wins',
      'Applies to all strategies',
      'Stackable with tier bonuses',
      'Real-time profit tracking'
    ],
    cost: 1000,
    duration: '3 days',
    icon: <Crown size={24} weight="fill" />,
    color: 'secondary',
    type: 'multiplier'
  },
  {
    id: 'strategy-unlock',
    name: 'Strategy Trial',
    description: 'Try any locked strategy',
    benefits: [
      'Full access to 1 strategy',
      'All features enabled',
      'Performance tracking',
      'Can switch once'
    ],
    cost: 600,
    duration: '5 days',
    icon: <Target size={24} weight="fill" />,
    color: 'primary',
    type: 'strategy'
  },
  {
    id: 'agent-boost',
    name: 'AI Agent Boost',
    description: 'Temporary additional AI agent',
    benefits: [
      '+1 extra AI agent slot',
      'All agent features',
      'Enhanced analysis',
      'Concurrent execution'
    ],
    cost: 800,
    duration: '7 days',
    icon: <Sparkle size={24} weight="fill" />,
    color: 'accent',
    type: 'agent'
  },
  {
    id: 'hot-streak',
    name: 'Hot Streak',
    description: 'Chain bonuses for consecutive wins',
    benefits: [
      '5% bonus per win streak',
      'Max 50% bonus at 10 wins',
      'Streak protection (1 loss)',
      'Win notifications'
    ],
    cost: 1200,
    duration: '14 days',
    icon: <Fire size={24} weight="fill" />,
    color: 'secondary',
    type: 'multiplier'
  }
]

export default function XPPerksShop() {
  const [xp] = useKV<number>('user-xp', 2340)
  const [activatedPerks, setActivatedPerks] = useKV<Array<{ id: string; expiresAt: number }>>('activated-perks', [])

  const activatePerk = (perk: XPPerk) => {
    if ((xp || 0) < perk.cost) {
      toast.error('Insufficient XP', {
        description: `You need ${perk.cost} XP to unlock this perk`
      })
      return
    }

    const expiresAt = Date.now() + (parseDuration(perk.duration))
    
    setActivatedPerks((current) => {
      const updated = [...(current || []), { id: perk.id, expiresAt }]
      return updated
    })

    toast.success('Perk Activated!', {
      description: `${perk.name} is now active for ${perk.duration}`
    })
  }

  const parseDuration = (duration: string): number => {
    const match = duration.match(/(\d+)\s*(hour|day|week)/)
    if (!match) return 0
    
    const value = parseInt(match[1])
    const unit = match[2]
    
    const multipliers: Record<string, number> = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000
    }
    
    return value * (multipliers[unit] || 0)
  }

  const isPerkActive = (perkId: string): boolean => {
    const perk = activatedPerks?.find(p => p.id === perkId)
    return perk ? perk.expiresAt > Date.now() : false
  }

  const colorClasses = {
    primary: 'border-primary text-primary bg-primary/10 hover:bg-primary/20',
    accent: 'border-accent text-accent bg-accent/10 hover:bg-accent/20',
    secondary: 'border-secondary text-secondary bg-secondary/10 hover:bg-secondary/20'
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        <div className="cyber-card p-6 relative overflow-hidden">
          <div className="absolute inset-0 diagonal-stripes opacity-10 pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/20 border-2 border-accent jagged-corner-small animate-pulse-glow">
                <Sparkle size={32} weight="fill" className="text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-[0.2em] uppercase text-accent neon-glow-accent">
                  Special Perks
                </h2>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Unlock game-changing upgrades with your XP
                </p>
              </div>
            </div>
            <div className="cyber-card-accent p-4">
              <div className="flex items-center gap-2 mb-1">
                <Star size={20} weight="fill" className="text-accent" />
                <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Your XP Balance</span>
              </div>
              <div className="technical-readout text-3xl text-accent">{xp || 0} XP</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PERKS.map((perk) => {
            const isActive = isPerkActive(perk.id)
            const canAfford = (xp || 0) >= perk.cost

            return (
              <div
                key={perk.id}
                className={`cyber-card relative overflow-hidden transition-all duration-300 ${
                  isActive ? 'ring-2 ring-accent scale-[1.02]' : 'hover:scale-[1.01]'
                }`}
              >
                {isActive && (
                  <div className="absolute top-3 right-3 z-20">
                    <Badge className="bg-accent/20 border border-accent text-accent text-[9px] uppercase tracking-wider px-2 py-1 jagged-corner-small animate-pulse">
                      ACTIVE
                    </Badge>
                  </div>
                )}

                <div className="absolute inset-0 diagonal-stripes opacity-5 pointer-events-none" />
                
                <div className="p-5 relative">
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`p-3 border-2 jagged-corner ${colorClasses[perk.color as keyof typeof colorClasses]}`}>
                      {perk.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <h3 className="text-lg font-bold uppercase tracking-wider text-foreground cursor-help flex items-center gap-1">
                              {perk.name}
                              <Info size={12} className="text-primary" weight="duotone" />
                            </h3>
                          </TooltipTrigger>
                          <TooltipContent className="cyber-card-accent border-2 border-accent max-w-sm p-4 z-50">
                            <div className="space-y-2">
                              <div className="font-bold uppercase tracking-wider text-accent text-sm">{perk.name}</div>
                              <p className="text-xs text-foreground leading-relaxed">{perk.description}</p>
                              <div className="space-y-1 pt-2">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-primary">Benefits:</div>
                                {perk.benefits.map((benefit, idx) => (
                                  <div key={idx} className="text-[10px] text-muted-foreground flex items-start gap-1">
                                    <span className="text-primary">•</span>
                                    <span>{benefit}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{perk.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-xs p-2 bg-muted/20">
                      <span className="text-muted-foreground uppercase tracking-wide">Duration</span>
                      <span className="font-bold text-foreground">{perk.duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs p-2 bg-muted/20">
                      <span className="text-muted-foreground uppercase tracking-wide">Cost</span>
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-accent" weight="fill" />
                        <span className="font-bold text-accent">{perk.cost} XP</span>
                      </div>
                    </div>
                  </div>

                  {!isActive && (
                    <>
                      {canAfford ? (
                        <Button
                          onClick={() => activatePerk(perk)}
                          className={`w-full border-2 uppercase tracking-wider font-bold text-xs jagged-corner-small
                                   ${colorClasses[perk.color as keyof typeof colorClasses]}`}
                        >
                          <Lightning size={14} weight="fill" className="mr-1" />
                          Unlock Now
                        </Button>
                      ) : (
                        <Button
                          disabled
                          className="w-full bg-muted/20 text-muted-foreground border-2 border-muted/30 uppercase tracking-wider font-bold text-xs jagged-corner-small cursor-not-allowed"
                        >
                          <Lock size={14} className="mr-1" />
                          Need {perk.cost - (xp || 0)} More XP
                        </Button>
                      )}
                    </>
                  )}

                  {isActive && (
                    <div className="flex items-center justify-center gap-2 text-xs text-accent font-bold uppercase tracking-wider py-3">
                      <CheckCircle size={16} weight="fill" />
                      Currently Active
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}
