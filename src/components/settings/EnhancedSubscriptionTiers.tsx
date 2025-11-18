import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { UserAuth, LICENSE_TIERS } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { CheckCircle, Crown, Star, Lightning, Sparkle, Infinity as InfinityIcon, Info } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { paymentProcessor, initializePaymentProviders } from '@/lib/payment/paymentProcessor'
import SubscriptionUpgrade from './SubscriptionUpgrade'

export default function EnhancedSubscriptionTiers() {
  const [auth, setAuth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })

  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState<'free' | 'starter' | 'trader' | 'pro' | 'elite' | 'lifetime'>('free')
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [paymentProvider, setPaymentProvider] = useState<'stripe' | 'paddle'>('stripe')

  useEffect(() => {
    initializePaymentProviders()

    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      const tier = params.get('tier')
      toast.success('Payment Successful!', {
        description: `Your ${tier?.toUpperCase()} subscription is now active`,
        className: 'border-primary/50 bg-background/95',
        duration: 7000
      })
      
      window.history.replaceState({}, '', window.location.pathname)
    }
    
    if (params.get('canceled') === 'true') {
      toast.info('Checkout Canceled', {
        description: 'Your payment was canceled. No charges were made.',
        className: 'border-muted/50 bg-background/95'
      })
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

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

  const handleUpgrade = async (tierId: string, tier: typeof LICENSE_TIERS[keyof typeof LICENSE_TIERS]) => {
    if (currentTier === tierId) {
      toast.info('Already Active', {
        description: 'This is your current subscription tier',
        className: 'border-accent/50 bg-background/95'
      })
      return
    }

    if (tier.price === 0) {
      return
    }

    setIsCheckingOut(true)
    setSelectedTier(tierId as any)

    toast.loading('Initiating secure checkout...', {
      id: 'checkout-init',
      className: 'border-primary/50 bg-background/95'
    })

    try {
      const session = await paymentProcessor.createStripeCheckout({
        tier: tierId,
        price: tier.price,
        userId: auth?.userId || 'guest',
        userEmail: auth?.email || undefined,
        type: tierId === 'lifetime' ? 'one_time' : 'subscription'
      })

      toast.dismiss('checkout-init')
      toast.success('Redirecting to checkout...', {
        description: 'You will be redirected to our secure payment page',
        className: 'border-primary/50 bg-background/95',
        duration: 3000
      })
    } catch (error: any) {
      toast.dismiss('checkout-init')
      toast.error('Checkout Failed', {
        description: error.message || 'Please try again or contact support',
        className: 'border-destructive/50 bg-background/95'
      })
    } finally {
      setIsCheckingOut(false)
    }
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
                  Choose the perfect tier for your trading journey
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(LICENSE_TIERS).map(([tierId, tier]) => {
            const isCurrentTier = currentTier === tierId
            const Icon = tierIcons[tierId as keyof typeof tierIcons]

            return (
              <div
                key={tierId}
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
                          <span className="text-2xl font-bold">${tier.price}</span>
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

                  <div className="space-y-2 mb-4 max-h-48 overflow-y-auto scrollbar-thin">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs">
                        <CheckCircle size={14} weight="fill" className="text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-3 border-t border-border/50">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between text-xs p-2 bg-muted/20 hover:bg-muted/30 transition-colors cursor-help">
                          <div className="flex items-center gap-2">
                            <Sparkle size={14} className="text-accent" weight="fill" />
                            <span className="font-semibold">XP Multiplier</span>
                          </div>
                          <span className="font-bold text-accent">{tier.xpMultiplier}x</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="cyber-card-accent border-2 border-accent max-w-xs p-3">
                        <div className="text-xs space-y-1">
                          <div className="font-bold uppercase tracking-wider text-accent">XP Multiplier Explained</div>
                          <p className="text-foreground">
                            Earn {tier.xpMultiplier}x more XP from all activities. Level up faster to unlock exclusive perks and temporary access to higher-tier features!
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between text-xs p-2 bg-muted/20 hover:bg-muted/30 transition-colors cursor-help">
                          <div className="flex items-center gap-2">
                            <Lightning size={14} className="text-primary" weight="fill" />
                            <span className="font-semibold">AI Agents</span>
                          </div>
                          <span className="font-bold text-primary">{tier.maxAgents === 999 ? '∞' : tier.maxAgents}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="cyber-card-accent border-2 border-accent max-w-xs p-3">
                        <div className="text-xs space-y-1">
                          <div className="font-bold uppercase tracking-wider text-accent">AI Agents</div>
                          <p className="text-foreground">
                            Access up to {tier.maxAgents === 999 ? 'unlimited' : tier.maxAgents} AI trading agents running simultaneously for maximum market coverage.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between text-xs p-2 bg-muted/20 hover:bg-muted/30 transition-colors cursor-help">
                          <div className="flex items-center gap-2">
                            <Info size={14} className="text-secondary" weight="fill" />
                            <span className="font-semibold">Strategies</span>
                          </div>
                          <span className="font-bold text-secondary">
                            {tier.strategiesUnlocked[0] === 'ALL' ? '∞' : tier.strategiesUnlocked.length}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="cyber-card-accent border-2 border-accent max-w-xs p-3">
                        <div className="text-xs space-y-2">
                          <div className="font-bold uppercase tracking-wider text-accent">Unlocked Strategies</div>
                          {tier.strategiesUnlocked[0] === 'ALL' ? (
                            <p className="text-foreground">Access to all current and future trading strategies!</p>
                          ) : (
                            <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
                              {tier.strategiesUnlocked.map((strategy, idx) => (
                                <div key={idx} className="flex items-center gap-1 text-foreground">
                                  <span className="text-primary">•</span>
                                  <span>{strategy}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {tier.specialPerks.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="text-[10px] uppercase tracking-wider font-bold text-accent mb-2 flex items-center gap-1">
                        <Star size={12} weight="fill" />
                        Special Perks
                      </div>
                      <div className="space-y-1 max-h-24 overflow-y-auto scrollbar-thin">
                        {tier.specialPerks.map((perk, idx) => (
                          <div key={idx} className="text-[10px] text-muted-foreground flex items-start gap-1">
                            <span className="text-accent">•</span>
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => handleUpgrade(tierId, tier)}
                    disabled={isCurrentTier || isCheckingOut}
                    className={`w-full mt-4 py-6 uppercase tracking-wider font-bold text-xs jagged-corner transition-all hover:scale-[1.02] ${
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
                                  ? 'bg-secondary/20 hover:bg-secondary/30 border-2 border-secondary text-secondary shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.4)] hover:shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.6)]'
                                  : 'bg-muted/20 hover:bg-muted/30 border-2 border-muted text-foreground'
                    }`}
                  >
                    {isCheckingOut ? 'Processing...' : isCurrentTier ? 'Current Tier' : tier.price === 0 ? 'Active' : 'Upgrade Now'}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

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
