import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Crown, Lightning, Rocket, Star, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useState } from 'react'
import { LicenseAuthority } from '@/lib/license-auth'
import { usePricingConfig } from '@/hooks/usePricingConfig'
import { cn } from '@/lib/utils'

export default function SubscriptionTiers() {
  const [currentTier, setCurrentTier] = useKV<string>('subscription-tier', 'free')
  const [isProcessing, setIsProcessing] = useState(false)
  const { visibleTiers } = usePricingConfig()

  // Icon mapping for tiers
  const getTierIcon = (tierId: string) => {
    switch (tierId) {
      case 'free':
        return <Star size={32} weight="duotone" className="text-muted-foreground" />
      case 'starter':
        return <Lightning size={32} weight="duotone" className="text-primary" />
      case 'trader':
        return <Lightning size={32} weight="fill" className="text-primary" />
      case 'pro-trader':
        return <Rocket size={32} weight="duotone" className="text-primary" />
      case 'elite-trader':
        return <Crown size={32} weight="fill" className="text-purple-400" />
      case 'lifetime':
        return <Sparkle size={32} weight="fill" className="text-yellow-400" />
      default:
        return <Star size={32} weight="duotone" className="text-muted-foreground" />
    }
  }

  const subscribeTo = async (tierId: string) => {
    const tier = visibleTiers.find((t) => t.id === tierId)
    if (!tier) return

    // Handle free tier
    if (tierId === 'free') {
      setCurrentTier(tierId)
      toast.success('Subscription Updated!', {
        description: `You are now on the ${tier.name} plan`,
        icon: '🎉'
      })
      return
    }

    // For paid tiers, redirect to payment or show license purchase info
    if (tier.price > 0) {
      setIsProcessing(true)

      try {
        // Get user info from storage
        await LicenseAuthority.getStoredLicense()

        // Show toast with info about license generation
        toast.info('Redirecting to Payment', {
          description: 'After payment, your license will be generated automatically.',
          duration: 5000
        })

        // In a real implementation, this would create a payment session
        // For now, direct users to the LicenseAuthority repo
        window.open(LicenseAuthority.getLicenseRepoUrl(), '_blank')

        // Show additional instructions
        setTimeout(() => {
          toast.info('Get Your License', {
            description: 'Once you complete payment, you will receive a license key that unlocks all features automatically.',
            duration: 10000
          })
        }, 1000)

      } catch (error) {
        console.error('[SubscriptionTiers] Error initiating subscription:', error)
        toast.error('Failed to initiate subscription', {
          description: 'Please try again or contact support.'
        })
      } finally {
        setIsProcessing(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold uppercase tracking-wider text-primary hud-text">
          Subscription Plans
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose the plan that fits your trading needs — All prices from Quantum Falcon v2025.1.0
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {visibleTiers.map((tier) => {
          const isActive = currentTier === tier.id
          const isWhaleTier = tier.isWhaleTier
          const isLifetime = tier.isLifetime

          return (
            <div
              key={tier.id}
              className={cn(
                "p-6 space-y-6 relative overflow-hidden transition-all duration-300",
                isWhaleTier ? [
                  // Whale tier styling (Elite + Lifetime)
                  "border-4 rounded-lg",
                  "bg-gradient-to-br from-violet-900/40 via-purple-900/60 to-pink-900/40",
                  "border-violet-500/50",
                  "shadow-2xl shadow-purple-500/50",
                  "ring-4 ring-purple-500/30",
                  "before:absolute before:inset-0 before:bg-gradient-to-t before:from-purple-900/80 before:via-transparent before:to-transparent before:pointer-events-none",
                  "hover:shadow-purple-500/70 hover:ring-purple-400/60 hover:scale-[1.02]"
                ] : [
                  // Standard tier styling
                  "cyber-card",
                  tier.isMostPopular ? 'border-2 border-accent ring-2 ring-accent/30' : '',
                  isActive ? 'border-2 border-primary' : ''
                ]
              )}
            >
              {/* Whale Tier Badge */}
              {isWhaleTier && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 via-yellow-400 to-amber-500 text-black px-4 py-1 text-xs font-black uppercase tracking-wider flex items-center gap-1 z-10">
                  <Crown size={12} weight="fill" />
                  WHALE TIER
                </div>
              )}

              {/* Most Popular Badge */}
              {tier.isMostPopular && !isWhaleTier && (
                <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-4 py-1 text-xs font-bold uppercase tracking-wider z-10">
                  MOST POPULAR
                </div>
              )}

              {/* Lifetime Badge */}
              {isLifetime && (
                <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-3 py-1 text-[10px] font-black uppercase tracking-wider z-10">
                  ONE-TIME · NEVER EXPIRES
                </div>
              )}

              {/* Current Plan Badge */}
              {isActive && !isWhaleTier && (
                <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold uppercase tracking-wider z-10">
                  Current Plan
                </div>
              )}

              <div className={cn("flex items-center gap-4", isLifetime ? "mt-8" : "mt-6")}>
                <div className={cn(
                  "p-3 rounded-lg",
                  isWhaleTier ? "bg-purple-500/20 border-2 border-purple-400/50" : "bg-muted/30"
                )}>
                  {getTierIcon(tier.id)}
                </div>
                <div>
                  <h4 className={cn(
                    "text-2xl font-bold uppercase tracking-wider flex items-center gap-2",
                    isWhaleTier ? "text-white" : "text-foreground"
                  )}>
                    {tier.name}
                    {isWhaleTier && <Crown size={24} weight="fill" className="text-yellow-400" />}
                  </h4>
                  <Badge variant="outline" className={cn(
                    "mt-1 uppercase text-xs",
                    isWhaleTier ? "border-purple-400/50 text-purple-200" : ""
                  )}>
                    {tier.billingPeriod === 'month' ? 'Monthly' : 'One-Time'}
                  </Badge>
                </div>
              </div>

              <div className={cn(
                "pt-4 border-t",
                isWhaleTier ? "border-purple-400/30" : "border-primary/30"
              )}>
                <div className="flex items-baseline gap-2">
                  <span className={cn(
                    "text-5xl font-black hud-value",
                    isWhaleTier ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-400" : "text-primary"
                  )}>
                    {tier.priceDisplay.split('/')[0]}
                  </span>
                  {tier.billingPeriod === 'month' && (
                    <span className={cn(
                      "uppercase text-sm",
                      isWhaleTier ? "text-purple-200" : "text-muted-foreground"
                    )}>/month</span>
                  )}
                </div>
                {tier.billingPeriod === 'once' && (
                  <p className={cn(
                    "text-sm mt-1 uppercase tracking-wide font-semibold",
                    isWhaleTier ? "text-yellow-300" : "text-muted-foreground"
                  )}>
                    One-time payment • Forever access
                  </p>
                )}
              </div>

              {/* Strategy & Agent Info */}
              <div className="space-y-2 pt-2">
                <div className={cn(
                  "text-sm font-bold",
                  isWhaleTier ? "text-purple-200" : "text-foreground"
                )}>
                  📚 {tier.strategyLibrary.label}
                </div>
                <div className={cn(
                  "text-sm font-bold",
                  isWhaleTier ? "text-purple-200" : "text-foreground"
                )}>
                  🤖 {tier.aiAgents.label}
                </div>
                <div className={cn(
                  "text-sm font-bold",
                  isWhaleTier ? "text-purple-200" : "text-foreground"
                )}>
                  ⚡ {tier.multiplier.label} multiplier
                </div>
              </div>

              {/* Key Perks */}
              <div className="space-y-3 pt-4">
                {tier.keyPerks.map((perk, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle
                      size={18}
                      weight="fill"
                      className={cn(
                        "flex-shrink-0 mt-0.5",
                        isWhaleTier ? "text-yellow-400" : "text-primary"
                      )}
                    />
                    <span className={cn(
                      "text-sm",
                      isWhaleTier ? "text-white font-medium" : "text-foreground"
                    )}>
                      {perk}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total Power Display */}
              <div className={cn(
                "p-3 rounded-lg text-center",
                isWhaleTier ? "bg-purple-500/20 border border-purple-400/30" : "bg-muted/20 border border-primary/20"
              )}>
                <div className={cn(
                  "text-xs uppercase tracking-wider mb-1",
                  isWhaleTier ? "text-purple-200" : "text-muted-foreground"
                )}>
                  Total Power
                </div>
                <div className={cn(
                  "text-2xl font-black",
                  isWhaleTier ? "text-yellow-400" : "text-primary"
                )}>
                  {tier.totalPower.label}
                </div>
              </div>

              <Button
                onClick={() => subscribeTo(tier.id)}
                disabled={isActive || isProcessing}
                className={cn(
                  "w-full jagged-corner-small font-bold",
                  isWhaleTier ? [
                    "bg-gradient-to-r from-yellow-500 via-purple-500 to-pink-500",
                    "hover:from-yellow-400 hover:via-purple-400 hover:to-pink-400",
                    "text-white shadow-lg shadow-purple-500/50",
                    "border-2 border-yellow-400/50"
                  ] : tier.isMostPopular ? [
                    "bg-accent hover:bg-accent/90"
                  ] : ""
                )}
                size="lg"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : isActive ? (
                  'Current Plan'
                ) : tier.id === 'free' ? (
                  'Current Plan'
                ) : (
                  <>
                    {isWhaleTier && <Crown size={16} weight="fill" />}
                    Get {tier.name}
                  </>
                )}
              </Button>

              {tier.id === 'lifetime' && (
                <div className="bg-gradient-to-r from-yellow-500/10 to-purple-500/10 border border-yellow-400/30 p-4 jagged-corner-small">
                  <p className="text-xs text-center text-yellow-200 uppercase tracking-wide font-bold">
                    <strong className="text-yellow-400">Limited Offer:</strong> Save over $20,000 vs lifetime Elite
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="cyber-card-accent p-6 space-y-3">
        <div className="flex items-start gap-3">
          <Crown size={24} className="text-accent flex-shrink-0" weight="fill" />
          <div className="space-y-2">
            <h4 className="text-lg font-bold uppercase tracking-wider">Quantum Falcon Cockpit v2025.1.0</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our AI-powered trading system has generated over <strong className="text-accent">$2.4M in profits</strong> for 
              our Pro and Elite members in the last quarter alone. The average Pro member sees their subscription cost returned 
              within the first 2-3 weeks of trading. Elite members average <strong className="text-accent">320% ROI</strong> annually.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-3">
              <div className="text-center">
                <div className="text-2xl font-black text-primary hud-value">98.7%</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-accent hud-value">2,847</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-secondary hud-value">$2.4M+</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Profits</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
