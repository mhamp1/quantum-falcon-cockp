// ═══════════════════════════════════════════════════════════════
// QUANTUM FALCON — PRICING PAGE
// Beautiful subscription tiers with Stripe checkout
// November 27, 2025 — Production Ready
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lightning,
  Crown,
  Star,
  CheckCircle,
  Rocket,
  ShieldCheck,
  ArrowRight,
  X,
  SpinnerGap
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { PRICING_TIERS, PricingTier, formatTierPrice, getAnnualSavings } from '@/lib/stripe/stripeConfig'
import { redirectToCheckout } from '@/lib/stripe/stripeService'
import { usePersistentAuth } from '@/lib/auth/usePersistentAuth'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

// ═══════════════════════════════════════════════════════════════
// PRICING CARD COMPONENT
// ═══════════════════════════════════════════════════════════════

interface PricingCardProps {
  tier: PricingTier
  isAnnual: boolean
  currentTier: string
  onSelect: (tierId: string) => void
  isLoading: string | null
}

function PricingCard({ tier, isAnnual, currentTier, onSelect, isLoading }: PricingCardProps) {
  const isCurrentPlan = tier.id === currentTier
  const isFree = tier.price === 0
  const annualPrice = isAnnual ? Math.round(tier.price * 12 * 0.83) : tier.price * 12
  const monthlySavings = isAnnual ? getAnnualSavings(tier) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={cn(
        'relative p-6 rounded-xl border-2 transition-all duration-300',
        'bg-card/80 backdrop-blur-sm',
        tier.badge === 'popular' && 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]',
        tier.badge === 'best-value' && 'border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.3)]',
        !tier.badge && 'border-muted hover:border-primary/50',
        isCurrentPlan && 'ring-2 ring-green-500 ring-offset-2 ring-offset-background'
      )}
      style={{
        boxShadow: tier.badge ? undefined : `0 0 20px ${tier.glowColor}`,
      }}
    >
      {/* Badge */}
      {tier.badge && (
        <div className={cn(
          'absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider',
          tier.badge === 'popular' && 'bg-amber-500 text-black',
          tier.badge === 'best-value' && 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
        )}>
          {tier.badge === 'popular' ? '🔥 Most Popular' : '💎 Best Value'}
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-black rounded-full text-xs font-bold">
          Current Plan
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <div className={cn(
          'w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4',
          `bg-gradient-to-br ${tier.color}`
        )}>
          {tier.id === 'lifetime' ? (
            <Crown size={32} weight="fill" className="text-white" />
          ) : tier.id === 'elite' ? (
            <Star size={32} weight="fill" className="text-white" />
          ) : (
            <Lightning size={32} weight="fill" className="text-white" />
          )}
        </div>
        
        <h3 className="text-2xl font-black uppercase tracking-wider mb-1">
          {tier.name}
        </h3>
        <p className="text-sm text-muted-foreground">{tier.description}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        {isFree ? (
          <div className="text-4xl font-black text-primary">Free</div>
        ) : tier.interval === 'lifetime' ? (
          <>
            <div className="text-4xl font-black text-primary">${tier.price}</div>
            <p className="text-sm text-muted-foreground">one-time payment</p>
          </>
        ) : isAnnual ? (
          <>
            <div className="text-4xl font-black text-primary">
              ${Math.round(tier.price * 0.83)}
              <span className="text-lg font-normal text-muted-foreground">/mo</span>
            </div>
            <p className="text-sm text-green-400">
              Save ${monthlySavings}/year • Billed ${annualPrice}/year
            </p>
          </>
        ) : (
          <>
            <div className="text-4xl font-black text-primary">
              ${tier.price}
              <span className="text-lg font-normal text-muted-foreground">/mo</span>
            </div>
            <p className="text-sm text-muted-foreground">billed monthly</p>
          </>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-2 mb-6">
        {tier.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Button
        onClick={() => onSelect(tier.id)}
        disabled={isCurrentPlan || isFree || isLoading === tier.id}
        className={cn(
          'w-full h-12 font-bold uppercase tracking-wider transition-all',
          tier.badge === 'popular' && 'bg-amber-500 hover:bg-amber-400 text-black',
          tier.badge === 'best-value' && 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400',
          !tier.badge && `bg-gradient-to-r ${tier.color} hover:opacity-90`
        )}
      >
        {isLoading === tier.id ? (
          <SpinnerGap size={20} className="animate-spin" />
        ) : isCurrentPlan ? (
          'Current Plan'
        ) : isFree ? (
          'Active'
        ) : (
          <>
            <Rocket size={18} className="mr-2" />
            Upgrade Now
          </>
        )}
      </Button>

      {/* Trust Badge */}
      {tier.id !== 'free' && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck size={14} className="text-green-400" />
          <span>Secure checkout via Stripe</span>
        </div>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN PRICING PAGE
// ═══════════════════════════════════════════════════════════════

interface PricingPageProps {
  onClose?: () => void
  embedded?: boolean
}

export default function PricingPage({ onClose, embedded = false }: PricingPageProps) {
  const { auth } = usePersistentAuth()
  const [isAnnual, setIsAnnual] = useState(true)
  const [loadingTier, setLoadingTier] = useState<string | null>(null)
  const currentTier = auth?.license?.tier || 'free'

  // Handle tier selection
  const handleSelectTier = async (tierId: string) => {
    if (tierId === 'free' || tierId === currentTier) return

    setLoadingTier(tierId)

    try {
      // Get user info
      const userId = auth?.userId || 'anonymous'
      const email = auth?.email

      // Redirect to Stripe Checkout
      await redirectToCheckout(tierId, userId, email)
    } catch (error) {
      console.error('[Pricing] Checkout error:', error)
      setLoadingTier(null)
    }
  }

  // Confetti on mount for embedded pricing
  useEffect(() => {
    if (embedded) {
      confetti({
        particleCount: 5,
        spread: 30,
        origin: { y: 0.3 },
        colors: ['#00d4ff', '#9945FF'],
      })
    }
  }, [embedded])

  return (
    <div className={cn(
      'relative',
      !embedded && 'min-h-screen bg-background p-8'
    )}>
      {/* Close button for modal */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors z-50"
        >
          <X size={24} />
        </button>
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-black uppercase tracking-wider mb-4"
        >
          <span className="text-primary">Choose Your</span>{' '}
          <span className="bg-gradient-to-r from-amber-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Power Level
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground text-lg max-w-2xl mx-auto"
        >
          Start free, upgrade when ready. All plans include our AI-powered trading engine.
        </motion.p>

        {/* Annual Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-4 mt-6"
        >
          <span className={cn('font-medium', !isAnnual && 'text-primary')}>Monthly</span>
          <Switch
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            className="data-[state=checked]:bg-green-500"
          />
          <span className={cn('font-medium', isAnnual && 'text-primary')}>
            Annual
            <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
              Save 17%
            </span>
          </span>
        </motion.div>
      </div>

      {/* Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {PRICING_TIERS.map((tier, index) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <PricingCard
              tier={tier}
              isAnnual={isAnnual}
              currentTier={currentTier}
              onSelect={handleSelectTier}
              isLoading={loadingTier}
            />
          </motion.div>
        ))}
      </div>

      {/* Trust Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 text-center"
      >
        <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-green-400" />
            <span>256-bit SSL Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-400" />
            <span>Cancel Anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Lightning size={20} className="text-primary" />
            <span>Instant Activation</span>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Questions? Contact{' '}
          <a href="mailto:support@quantumfalcon.io" className="text-primary hover:underline">
            support@quantumfalcon.io
          </a>
        </p>
      </motion.div>
    </div>
  )
}

