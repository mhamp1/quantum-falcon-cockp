// Quick Upgrade Modal — Reduces friction for upgrades
// November 24, 2025 — Quantum Falcon Cockpit

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Crown, Lightning, CheckCircle, Sparkle, 
  ArrowRight, Lightning as Zap, Trophy, Shield
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { UserAuth } from '@/lib/auth'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { cn } from '@/lib/utils'

interface QuickUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  requiredTier: string
  strategyName?: string
  onUpgradeComplete?: () => void
}

const TIER_INFO = {
  starter: {
    name: 'Starter',
    price: '$29/month',
    features: [
      '4 additional strategies',
      'Basic analytics',
      'Email support',
      'Paper trading unlimited'
    ],
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/50'
  },
  trader: {
    name: 'Trader',
    price: '$79/month',
    features: [
      '12 additional strategies',
      'Advanced analytics',
      'Priority support',
      'Real trading enabled',
      'Risk management tools'
    ],
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/50'
  },
  'pro-trader': {
    name: 'Pro Trader',
    price: '$199/month',
    features: [
      '20+ elite strategies',
      'AI strategy builder',
      '24/7 priority support',
      'Advanced risk controls',
      'Strategy marketplace access',
      'Royalty earnings'
    ],
    color: 'text-primary',
    bgColor: 'bg-primary/20',
    borderColor: 'border-primary/50'
  },
  'elite-trader': {
    name: 'Elite Trader',
    price: '$499/month',
    features: [
      'All strategies unlocked',
      'Custom strategy development',
      'Dedicated account manager',
      'White-glove support',
      'Exclusive community access',
      'Early feature access'
    ],
    color: 'text-accent',
    bgColor: 'bg-accent/20',
    borderColor: 'border-accent/50'
  },
  lifetime: {
    name: 'Lifetime',
    price: '$7,999 one-time',
    features: [
      'Everything in Elite',
      'Lifetime access',
      'No recurring fees',
      'Future features included',
      'VIP community status',
      'Exclusive NFT rewards'
    ],
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50'
  }
}

export default function QuickUpgradeModal({
  isOpen,
  onClose,
  requiredTier,
  strategyName,
  onUpgradeComplete
}: QuickUpgradeModalProps) {
  const [auth, setAuth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const tierInfo = TIER_INFO[requiredTier as keyof typeof TIER_INFO] || TIER_INFO['pro-trader']

  const handleUpgrade = async () => {
    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Celebrate
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.6 },
      colors: ['#DC1FFF', '#00FFFF', '#FF1493', '#FFD700']
    })

    toast.success('Upgrade Successful!', {
      description: `Welcome to ${tierInfo.name} tier!`,
      duration: 5000
    })

    // Update auth with new tier (in real app, this would come from payment processor)
    setAuth(prev => ({
      ...prev!,
      license: {
        ...prev!.license!,
        tier: requiredTier
      }
    }))

    setIsProcessing(false)
    
    if (onUpgradeComplete) {
      onUpgradeComplete()
    }
    
    onClose()
    
    // Navigate to settings to show new features
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'settings' }))
    }, 500)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="cyber-card border-4 border-primary/50 max-w-2xl p-0 overflow-hidden">
        <div className="relative">
          {/* Background Effects */}
          <div className="absolute inset-0 diagonal-stripes opacity-5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-accent/20 to-transparent blur-3xl" />
          
          <div className="relative z-10 p-8">
            <DialogHeader className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <DialogTitle className="text-3xl font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                  <Crown size={32} weight="fill" className="text-accent" />
                  Quick Upgrade
                </DialogTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X size={20} />
                </Button>
              </div>
              
              {strategyName && (
                <div className="glass-morph-card p-4 border border-primary/30 mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Unlock Strategy:</p>
                  <p className="text-xl font-bold text-primary">{strategyName}</p>
                </div>
              )}
            </DialogHeader>

            {/* Tier Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "glass-morph-card p-6 border-2 mb-6",
                tierInfo.borderColor
              )}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Badge className={cn("mb-2", tierInfo.bgColor, tierInfo.borderColor, tierInfo.color)}>
                    <Crown size={14} className="mr-1" weight="fill" />
                    {tierInfo.name} Tier
                  </Badge>
                  <h3 className={cn("text-2xl font-black uppercase tracking-wider", tierInfo.color)}>
                    {tierInfo.name}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-primary">{tierInfo.price}</div>
                  {requiredTier !== 'lifetime' && (
                    <div className="text-xs text-muted-foreground">per month</div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-bold uppercase tracking-wider text-primary mb-2">
                  What You'll Get:
                </div>
                {tierInfo.features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle size={18} weight="fill" className="text-green-400 shrink-0" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Benefits Highlight */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="glass-morph-card p-4 text-center border border-primary/20">
                <Lightning size={24} weight="duotone" className="text-accent mx-auto mb-2" />
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Instant Access</div>
                <div className="text-sm font-bold text-primary">Unlock Now</div>
              </div>
              <div className="glass-morph-card p-4 text-center border border-primary/20">
                <Shield size={24} weight="duotone" className="text-primary mx-auto mb-2" />
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Risk Free</div>
                <div className="text-sm font-bold text-primary">7-Day Trial</div>
              </div>
              <div className="glass-morph-card p-4 text-center border border-primary/20">
                <Trophy size={24} weight="duotone" className="text-yellow-400 mx-auto mb-2" />
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Cancel Anytime</div>
                <div className="text-sm font-bold text-primary">No Lock-in</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleUpgrade}
                disabled={isProcessing}
                className="flex-1 bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:via-accent/90 hover:to-primary/90 text-black font-black uppercase tracking-wider text-lg py-6 shadow-2xl shadow-primary/50"
                onMouseEnter={() => {
                  if (!isProcessing) {
                    confetti({
                      particleCount: 50,
                      spread: 60,
                      origin: { y: 0.7 }
                    })
                  }
                }}
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap size={24} weight="fill" className="mr-2" />
                    Upgrade to {tierInfo.name}
                    <ArrowRight size={24} className="ml-2" />
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={onClose}
                className="px-8 border-primary/50 text-primary hover:bg-primary/10 uppercase tracking-wider font-bold"
              >
                Maybe Later
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-6 pt-6 border-t border-primary/20 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield size={14} weight="duotone" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkle size={14} weight="duotone" />
                <span>Instant Activation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} weight="duotone" />
                <span>Money-Back Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

