import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { UserAuth, LICENSE_TIERS } from '@/lib/auth'
import { getFeaturedStrategiesForTier, getStrategyCountByTier } from '@/lib/strategiesData'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CheckCircle, Crown, Star, Lightning, Sparkle, Infinity as InfinityIcon, Info, Lock, Plus } from '@phosphor-icons/react'
import { toast } from 'sonner'
import SubscriptionUpgrade from './SubscriptionUpgrade'
import { motion } from 'framer-motion'

export default function SubscriptionTiersWithStrategies() {
  const [auth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'free' | 'starter' | 'trader' | 'pro' | 'elite' | 'lifetime'>('free')

  const currentTier = auth?.license?.tier || 'free'

  const tierIcons = {
    free: <Star size={32} weight="duotone" className="text-muted-foreground" />,
    starter: <Sparkle size={32} weight="fill" className="text-primary/70" />,
    trader: <Lightning size={32} weight="fill" className="text-primary" />,
    pro: <Crown size={32} weight="fill" className="text-accent" />,
    elite: <Star size={32} weight="fill" className="text-accent" />,
    lifetime: <InfinityIcon size={32} weight="fill" className="text-secondary" />
  }

  const tierColors = {
    free: 'border-muted text-muted-foreground',
    starter: 'border-primary/70 text-primary/70 shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.2)]',
    trader: 'border-primary text-primary shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.3)]',
    pro: 'border-accent text-accent shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.4)]',
    elite: 'border-accent text-accent shadow-[0_0_35px_oklch(0.68_0.18_330_/_0.5)]',
    lifetime: 'border-secondary text-secondary shadow-[0_0_40px_oklch(0.68_0.18_330_/_0.6)]'
  }

  const tierBadges = {
    free: '',
    starter: 'GET STARTED',
    trader: 'POPULAR',
    pro: 'BEST VALUE',
    elite: 'MOST POWERFUL',
    lifetime: 'UNLIMITED'
  }

  const handleUpgrade = (tierId: string, tier: typeof LICENSE_TIERS[keyof typeof LICENSE_TIERS]) => {
    if (currentTier === tierId) {
      toast.info('Already Active', {
        description: 'This is your current subscription tier'
      })
      return
    }

    if (tier.price === 0) {
      return
    }

    setSelectedTier(tierId as any)
    setCheckoutOpen(true)
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6" id="subscription-tiers-section">
        <div className="cyber-card p-6 relative overflow-hidden">
          <div className="absolute inset-0 diagonal-stripes opacity-10 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Crown size={32} weight="fill" className="text-accent" />
              <div>
                <h2 className="text-2xl font-bold tracking-[0.2em] uppercase text-accent neon-glow-accent">
                  Subscription Tiers
                </h2>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Unlock powerful strategies as you upgrade
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(LICENSE_TIERS).map(([tierId, tier]) => {
            const isCurrentTier = currentTier === tierId
            const Icon = tierIcons[tierId as keyof typeof tierIcons]
            const featuredStrategies = getFeaturedStrategiesForTier(tierId, 4)
            const strategyCount = getStrategyCountByTier(tierId)
            const tierHierarchy = ['free', 'starter', 'trader', 'pro', 'elite', 'lifetime']
            const currentTierLevel = tierHierarchy.indexOf(currentTier)
            const cardTierLevel = tierHierarchy.indexOf(tierId)
            const isLocked = cardTierLevel > currentTierLevel

            return (
              <motion.div
                key={tierId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: tierHierarchy.indexOf(tierId) * 0.1 }}
                className={`cyber-card relative overflow-hidden transition-all duration-300 ${
                  isCurrentTier ? 'ring-2 ring-accent scale-[1.02]' : 'hover:scale-[1.01]'
                }`}
              >
                {tierBadges[tierId as keyof typeof tierBadges] && (
                  <div className="absolute top-4 right-4 z-20">
                    <Badge className="bg-accent/20 border border-accent text-accent text-[9px] uppercase tracking-wider px-2 py-1 jagged-corner-small">
                      {tierBadges[tierId as keyof typeof tierBadges]}
                    </Badge>
                  </div>
                )}

                {isCurrentTier && (
                  <div className="absolute top-4 left-4 z-20">
                    <Badge className="bg-primary/20 border border-primary text-primary text-[9px] uppercase tracking-wider px-2 py-1 jagged-corner-small">
                      CURRENT
                    </Badge>
                  </div>
                )}

                <div className="absolute inset-0 diagonal-stripes opacity-5 pointer-events-none" />

                <div className={`p-6 relative border-2 ${tierColors[tierId as keyof typeof tierColors]}`}>
                  {/* Tier Header */}
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="p-4 bg-card/50 border-2 border-current jagged-corner mb-3">
                      {Icon}
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-wider mb-1">{tier.name}</h3>
                    <div className="flex items-baseline gap-1">
                      {tier.price === 0 ? (
                        <span className="text-3xl font-bold">FREE</span>
                      ) : tierId === 'lifetime' ? (
                        <>
                          <span className="text-2xl font-bold">${tier.price.toLocaleString()}</span>
                          <span className="text-xs text-muted-foreground uppercase">once</span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl font-bold">${tier.price}</span>
                          <span className="text-xs text-muted-foreground uppercase">/month</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Strategy Library Preview */}
                  <div className="mb-4 pb-4 border-b border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-accent flex items-center gap-1">
                        <Lightning size={12} weight="fill" />
                        Strategy Library
                      </div>
                      <Badge className="bg-accent/10 text-accent text-[9px] px-1.5 py-0.5">
                        {strategyCount} Total
                      </Badge>
                    </div>

                    {/* Strategy Preview Cards */}
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      {featuredStrategies.slice(0, 4).map((strategy, idx) => (
                        <div
                          key={strategy.id}
                          className={`relative p-2 bg-gradient-to-br from-primary/5 via-background to-accent/5 border border-primary/20 overflow-hidden ${
                            isLocked && idx >= 2 ? 'opacity-40 blur-[2px]' : ''
                          }`}
                        >
                          <div className="absolute inset-0 diagonal-stripes opacity-5" />
                          
                          {/* Lock overlay for locked strategies */}
                          {isLocked && idx >= 2 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px] z-10">
                              <Lock size={16} weight="duotone" className="text-muted-foreground" />
                            </div>
                          )}

                          <div className="relative z-0">
                            {strategy.badge && (
                              <Badge className={`absolute -top-1 -right-1 text-[7px] px-1 py-0 ${
                                strategy.badge === 'NEW' ? 'bg-green-500/20 border-green-500 text-green-500' :
                                strategy.badge === 'POPULAR' ? 'bg-primary/20 border-primary text-primary' :
                                strategy.badge === 'EXCLUSIVE' ? 'bg-accent/20 border-accent text-accent' :
                                strategy.badge === 'ELITE ONLY' ? 'bg-secondary/20 border-secondary text-secondary' :
                                strategy.badge === 'LIFETIME EXCLUSIVE' ? 'bg-gradient-to-r from-accent/20 to-secondary/20 border-accent text-accent' :
                                'bg-primary/20 border-primary text-primary'
                              }`}>
                                {strategy.badge === 'POPULAR' ? '🔥' :
                                 strategy.badge === 'NEW' ? '✨' :
                                 strategy.badge === 'EXCLUSIVE' ? '👑' :
                                 strategy.badge === 'ELITE ONLY' ? '💎' :
                                 strategy.badge === 'LIFETIME EXCLUSIVE' ? '♾️' :
                                 '⚡'}
                              </Badge>
                            )}
                            <div className="text-[9px] font-bold uppercase tracking-wide text-foreground truncate mb-1">
                              {strategy.name}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] text-primary font-bold">{strategy.win_rate}</span>
                              <span className="text-[7px] text-muted-foreground uppercase">{strategy.risk}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Lifetime Tier - Unlimited Custom Strategies Banner */}
                    {tierId === 'lifetime' && (
                      <div className="relative bg-gradient-to-r from-accent/20 via-secondary/20 to-accent/20 border-2 border-accent p-2 overflow-hidden">
                        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-accent/10 to-transparent" />
                        <div className="relative flex items-center justify-between">
                          <div className="text-[9px] font-bold uppercase tracking-wider text-accent">
                            ✨ Unlimited Custom Strategies
                          </div>
                          <Plus size={12} weight="bold" className="text-accent" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Features List (Condensed) */}
                  <div className="space-y-2 mb-4 max-h-32 overflow-y-auto scrollbar-thin">
                    {tier.features.slice(0, 5).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <CheckCircle size={12} weight="fill" className="text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground text-[10px]">{feature}</span>
                      </div>
                    ))}
                    {tier.features.length > 5 && (
                      <div className="text-[9px] text-muted-foreground text-center pt-1">
                        +{tier.features.length - 5} more features
                      </div>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-2 pt-3 border-t border-border/50 mb-4">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Sparkle size={12} className="text-accent" weight="fill" />
                        <span className="font-semibold text-[10px]">XP Multiplier</span>
                      </div>
                      <span className="font-bold text-accent text-[10px]">{tier.xpMultiplier}x</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Lightning size={12} className="text-primary" weight="fill" />
                        <span className="font-semibold text-[10px]">AI Agents</span>
                      </div>
                      <span className="font-bold text-primary text-[10px]">{tier.maxAgents === 999 ? '∞' : tier.maxAgents}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={() => handleUpgrade(tierId, tier)}
                    disabled={isCurrentTier}
                    className={`w-full py-5 uppercase tracking-wider font-bold text-xs jagged-corner transition-all ${
                      isCurrentTier
                        ? 'bg-muted text-muted-foreground cursor-not-allowed'
                        : tierId === 'starter'
                          ? 'bg-primary/15 hover:bg-primary/25 border-2 border-primary/70 text-primary shadow-[0_0_15px_oklch(0.72_0.20_195_/_0.3)] hover:shadow-[0_0_25px_oklch(0.72_0.20_195_/_0.5)]'
                          : tierId === 'trader'
                            ? 'bg-primary/20 hover:bg-primary/30 border-2 border-primary text-primary shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.4)] hover:shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.6)]'
                            : tierId === 'pro'
                              ? 'bg-accent/20 hover:bg-accent/30 border-2 border-accent text-accent shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.4)] hover:shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.6)]'
                              : tierId === 'elite'
                                ? 'bg-accent/20 hover:bg-accent/30 border-2 border-accent text-accent shadow-[0_0_25px_oklch(0.68_0.18_330_/_0.5)] hover:shadow-[0_0_35px_oklch(0.68_0.18_330_/_0.7)]'
                                : tierId === 'lifetime'
                                  ? 'bg-gradient-to-r from-accent/20 via-secondary/20 to-accent/20 hover:from-accent/30 hover:via-secondary/30 hover:to-accent/30 border-2 border-accent text-accent shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.4)] hover:shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.6)]'
                                  : 'bg-muted/20 hover:bg-muted/30 border-2 border-muted text-foreground'
                    }`}
                  >
                    {isCurrentTier ? (
                      'Current Tier'
                    ) : tier.price === 0 ? (
                      'Active'
                    ) : (
                      <>
                        <Crown size={14} className="mr-2" weight="fill" />
                        Upgrade Now
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* XP Perks Section */}
        <div className="cyber-card-accent p-6">
          <div className="flex items-center gap-3 mb-4">
            <Sparkle size={24} weight="fill" className="text-accent" />
            <h3 className="text-lg font-bold uppercase tracking-wider text-accent">XP Perks System</h3>
          </div>
          <p className="text-sm text-foreground mb-4">
            Earn XP through trading, completing challenges, and community engagement. Use XP to unlock temporary access to premium features:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-muted/20 border-l-2 border-primary">
              <div className="flex items-center gap-2 mb-2">
                <Lightning size={16} weight="fill" className="text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Speed Boost</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Priority trade execution for 24 hours</p>
              <div className="text-xs font-bold text-primary">Cost: 500 XP</div>
            </div>
            <div className="p-3 bg-muted/20 border-l-2 border-accent">
              <div className="flex items-center gap-2 mb-2">
                <Star size={16} weight="fill" className="text-accent" />
                <span className="text-xs font-bold uppercase tracking-wider text-accent">Premium Signals</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Access elite market signals for 7 days</p>
              <div className="text-xs font-bold text-accent">Cost: 750 XP</div>
            </div>
            <div className="p-3 bg-muted/20 border-l-2 border-secondary">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={16} weight="fill" className="text-secondary" />
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">Profit Multiplier</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">1.5x profits on winning trades for 3 days</p>
              <div className="text-xs font-bold text-secondary">Cost: 1000 XP</div>
            </div>
          </div>
        </div>
      </div>

      <SubscriptionUpgrade 
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        tier={selectedTier}
      />
    </TooltipProvider>
  )
}
