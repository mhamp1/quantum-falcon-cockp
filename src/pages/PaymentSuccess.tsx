// ═══════════════════════════════════════════════════════════════
// PAYMENT SUCCESS PAGE
// Beautiful confirmation with license key display
// November 27, 2025 — Production Ready
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  Copy,
  Confetti,
  Rocket,
  Crown,
  ArrowRight,
  Lightning
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { verifyPaymentSuccess, PaymentResult } from '@/lib/stripe/stripeService'
import { getTierById } from '@/lib/stripe/stripeConfig'
import { usePersistentAuth } from '@/lib/auth/usePersistentAuth'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function PaymentSuccess() {
  const { auth, refreshAuth } = usePersistentAuth()
  const [result, setResult] = useState<PaymentResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Get session ID from URL
  const sessionId = new URLSearchParams(window.location.search).get('session_id')

  // Verify payment on mount
  useEffect(() => {
    async function verify() {
      if (!sessionId) {
        setIsLoading(false)
        return
      }

      try {
        const paymentResult = await verifyPaymentSuccess(sessionId)
        setResult(paymentResult)

        if (paymentResult.success) {
          // Trigger confetti celebration
          launchConfetti()
          
          // Refresh auth to get new tier
          await refreshAuth()
          
          // Play success sound
          try {
            const audio = new Audio('/sounds/success.mp3')
            audio.volume = 0.3
            audio.play().catch(() => {})
          } catch {}
        }
      } catch (error) {
        console.error('[Payment] Verification failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    verify()
  }, [sessionId, refreshAuth])

  // Confetti animation
  const launchConfetti = () => {
    const duration = 3000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#00d4ff', '#9945FF', '#DC1FFF'],
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#00d4ff', '#9945FF', '#DC1FFF'],
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }

  // Copy license key
  const copyLicenseKey = () => {
    if (result?.licenseKey) {
      navigator.clipboard.writeText(result.licenseKey)
      setCopied(true)
      toast.success('License key copied!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Get tier info
  const tier = result?.tier ? getTierById(result.tier) : null

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Verifying payment...</p>
        </div>
      </div>
    )
  }

  // No session ID
  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="cyber-card p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">Invalid Session</h1>
          <p className="text-muted-foreground mb-6">
            No payment session found. Please try again.
          </p>
          <Button onClick={() => window.location.href = '/settings?tab=subscriptions'}>
            Go to Pricing
          </Button>
        </div>
      </div>
    )
  }

  // Payment failed
  if (!result?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="cyber-card p-8 text-center max-w-md border-2 border-destructive"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-destructive/20 flex items-center justify-center mb-4">
            <span className="text-4xl">😢</span>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-destructive">Payment Issue</h1>
          <p className="text-muted-foreground mb-6">
            {result?.error || 'Something went wrong with your payment.'}
          </p>
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.href = '/settings?tab=subscriptions'}
              className="w-full"
            >
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = 'mailto:support@quantumfalcon.io'}
              className="w-full"
            >
              Contact Support
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Success state
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="cyber-card p-8 text-center max-w-lg border-2 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6"
        >
          <CheckCircle size={64} weight="fill" className="text-white" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-black uppercase tracking-wider mb-2"
        >
          <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Payment Successful!
          </span>
        </motion.h1>

        {/* Tier Info */}
        {tier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <p className="text-muted-foreground mb-2">You've unlocked</p>
            <div className={cn(
              'inline-flex items-center gap-2 px-6 py-3 rounded-full',
              `bg-gradient-to-r ${tier.color} text-white font-bold uppercase tracking-wider`
            )}>
              {tier.id === 'lifetime' ? (
                <Crown size={20} weight="fill" />
              ) : (
                <Lightning size={20} weight="fill" />
              )}
              {tier.name} Tier
            </div>
          </motion.div>
        )}

        {/* License Key */}
        {result.licenseKey && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6 p-4 bg-muted/30 border border-muted rounded-lg"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              Your License Key
            </p>
            <div className="flex items-center gap-2 justify-center">
              <code className="font-mono text-sm text-primary bg-primary/10 px-3 py-2 rounded">
                {result.licenseKey}
              </code>
              <button
                onClick={copyLicenseKey}
                className="p-2 hover:bg-primary/10 rounded transition-colors"
              >
                {copied ? (
                  <CheckCircle size={18} className="text-green-400" />
                ) : (
                  <Copy size={18} className="text-muted-foreground" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Save this key! It's also been sent to your email.
            </p>
          </motion.div>
        )}

        {/* What's Next */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-6 text-left"
        >
          <h3 className="font-bold mb-3">What's Next?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              Your account is now upgraded
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              All features unlocked immediately
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              Receipt sent to your email
            </li>
          </ul>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Button
            onClick={() => window.location.href = '/'}
            className={cn(
              'w-full h-14 text-lg font-black uppercase tracking-wider',
              'bg-gradient-to-r from-green-500 to-emerald-500',
              'hover:from-green-400 hover:to-emerald-400'
            )}
          >
            <Rocket size={24} className="mr-2" />
            Start Trading
            <ArrowRight size={20} className="ml-2" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

