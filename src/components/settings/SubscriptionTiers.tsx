import { useKV } from '@/hooks/useKVFallback'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Crown, Lightning, Rocket, Star } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface SubscriptionTier {
  id: string
  name: string
  price: number
  billingPeriod: 'month' | 'lifetime'
  features: string[]
  popular?: boolean
  icon: React.ReactNode
}

export default function SubscriptionTiers() {
  const [currentTier, setCurrentTier] = useKV<string>('subscription-tier', 'free')

  const tiers: SubscriptionTier[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      billingPeriod: 'month',
      icon: <Star size={32} weight="duotone" className="text-muted-foreground" />,
      features: [
        'Basic trading bot access',
        '1 AI agent active',
        'Limited market signals',
        'Community access',
        'Basic analytics',
        'Standard execution speed'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 90,
      billingPeriod: 'month',
      icon: <Lightning size={32} weight="duotone" className="text-primary" />,
      features: [
        'Full trading bot suite',
        'All 3 AI agents active',
        'Premium market signals',
        'Priority execution',
        'Advanced analytics dashboard',
        'DCA & sniping strategies',
        'Custom strategy builder',
        'API integrations',
        'Email & SMS alerts',
        '24/7 priority support'
      ]
    },
    {
      id: 'elite',
      name: 'Elite',
      price: 145,
      billingPeriod: 'month',
      popular: true,
      icon: <Crown size={32} weight="fill" className="text-accent" />,
      features: [
        'Everything in Pro, plus:',
        'Ultra-fast execution priority',
        'Dedicated RL optimization',
        'Portfolio insurance (up to $10k)',
        'Exclusive trading strategies',
        'Whale movement alerts',
        'Custom bot parameters',
        'Private Discord channel',
        'Personalized trading coach',
        'Tax reporting automation',
        'Multi-wallet management',
        'White-glove support'
      ]
    },
    {
      id: 'lifetime',
      name: 'Lifetime Access',
      price: 8000,
      billingPeriod: 'lifetime',
      icon: <Rocket size={32} weight="duotone" className="text-secondary" />,
      features: [
        'All Elite features forever',
        'One-time payment, no renewals',
        'Lifetime updates included',
        'Grandfathered into all new features',
        'Unlimited AI agent customization',
        'Direct developer access',
        'Beta features early access',
        'Custom feature requests',
        'Revenue sharing program',
        'Exclusive lifetime member perks',
        'Transfer to 1 family member',
        'Your name in Hall of Fame'
      ]
    }
  ]

  const subscribeTo = (tierId: string) => {
    const tier = tiers.find((t) => t.id === tierId)
    if (!tier) return

    setCurrentTier(tierId)

    toast.success('Subscription Updated!', {
      description: `You are now on the ${tier.name} plan`,
      icon: '🎉'
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold uppercase tracking-wider text-primary hud-text">
          Subscription Plans
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose the plan that fits your trading needs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tiers.map((tier) => {
          const isActive = currentTier === tier.id

          return (
            <div
              key={tier.id}
              className={`cyber-card p-6 space-y-6 relative overflow-hidden ${
                tier.popular ? 'border-2 border-accent' : ''
              } ${isActive ? 'border-2 border-primary' : ''}`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0 bg-accent text-accent-foreground px-4 py-1 text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              {isActive && (
                <div className="absolute top-0 left-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-bold uppercase tracking-wider">
                  Current Plan
                </div>
              )}

              <div className="flex items-center gap-4 mt-6">
                <div className="p-3 bg-muted/30 rounded-lg">
                  {tier.icon}
                </div>
                <div>
                  <h4 className="text-2xl font-bold uppercase tracking-wider text-foreground">
                    {tier.name}
                  </h4>
                  <Badge variant="outline" className="mt-1 uppercase text-xs">
                    {tier.billingPeriod === 'month' ? 'Monthly' : 'One-Time'}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t border-primary/30">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-primary hud-value">
                    ${tier.price.toLocaleString()}
                  </span>
                  {tier.billingPeriod === 'month' && (
                    <span className="text-muted-foreground uppercase text-sm">/month</span>
                  )}
                </div>
                {tier.billingPeriod === 'lifetime' && (
                  <p className="text-sm text-muted-foreground mt-1 uppercase tracking-wide">
                    One-time payment • Forever access
                  </p>
                )}
              </div>

              <div className="space-y-3 pt-4">
                {tier.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle
                      size={18}
                      weight="fill"
                      className={`flex-shrink-0 mt-0.5 ${
                        tier.id === 'elite' || tier.id === 'lifetime'
                          ? 'text-accent'
                          : tier.id === 'pro'
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}
                    />
                    <span className={`text-sm ${
                      feature.includes('Everything in') || feature.includes('plus:')
                        ? 'font-bold text-accent'
                        : 'text-foreground'
                    }`}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => subscribeTo(tier.id)}
                disabled={isActive}
                className={`w-full jagged-corner-small ${
                  tier.popular ? 'bg-accent hover:bg-accent/90' : ''
                }`}
                size="lg"
              >
                {isActive ? 'Current Plan' : tier.id === 'free' ? 'Downgrade' : 'Upgrade Now'}
              </Button>

              {tier.id === 'lifetime' && (
                <div className="bg-secondary/10 border border-secondary/30 p-4 jagged-corner-small">
                  <p className="text-xs text-center text-muted-foreground uppercase tracking-wide">
                    <strong className="text-secondary">Limited Offer:</strong> Save $4,540 vs 5 years of Elite
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
            <h4 className="text-lg font-bold uppercase tracking-wider">Worth Every Penny</h4>
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
