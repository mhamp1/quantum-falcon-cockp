// Rental Modal — Strategy Rental with Payment
// November 24, 2025 — Quantum Falcon Cockpit

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  X, Clock, CreditCard, CheckCircle, Sparkle,
  ArrowRight, Lightning as Zap, Shield, Crown
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RENTAL_PLANS, type RentalPlan } from '@/lib/strategyRental'
import { processRentalPayment } from '@/lib/payment/rentalPayment'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { cn } from '@/lib/utils'

interface RentalModalProps {
  isOpen: boolean
  onClose: () => void
  strategyId: string
  strategyName: string
  onRentalComplete: (plan: RentalPlan) => void
}

export default function RentalModal({
  isOpen,
  onClose,
  strategyId,
  strategyName,
  onRentalComplete
}: RentalModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<RentalPlan | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe')

  const handleRent = async (plan: RentalPlan) => {
    setIsProcessing(true)
    setSelectedPlan(plan)
    
    try {
      const result = await processRentalPayment(plan, strategyId, strategyName, paymentMethod)
      
      if (result.success) {
        confetti({
          particleCount: 38,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#DC1FFF', '#00FFFF', '#FF1493']
        })
        
        toast.success('Strategy Rented!', {
          description: `${strategyName} is now available for ${plan.duration} days`,
          duration: 5000
        })
        
        onRentalComplete(plan)
        onClose()
      } else {
        toast.error('Payment Failed', {
          description: result.error || 'Please try again'
        })
      }
    } catch (error: any) {
      toast.error('Rental Failed', {
        description: error.message || 'Please try again'
      })
    } finally {
      setIsProcessing(false)
      setSelectedPlan(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="cyber-card border-4 border-primary/50 max-w-2xl p-0 overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 diagonal-stripes opacity-5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-accent/20 to-transparent blur-3xl" />
          
          <div className="relative z-10 p-8">
            <DialogHeader className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <DialogTitle className="text-3xl font-black uppercase tracking-[0.2em] text-primary flex items-center gap-3">
                  <Clock size={32} weight="fill" className="text-accent" />
                  Rent Strategy
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
              
              <div className="glass-morph-card p-4 border border-primary/30 mb-4">
                <p className="text-sm text-muted-foreground mb-1">Strategy:</p>
                <p className="text-xl font-bold text-primary">{strategyName}</p>
              </div>
            </DialogHeader>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <div className="text-sm font-bold uppercase tracking-wider text-primary mb-3">
                Payment Method
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('stripe')}
                  className={cn(
                    "h-auto py-4",
                    paymentMethod === 'stripe' && "bg-primary/20 border-primary/50 text-primary"
                  )}
                >
                  <CreditCard size={20} className="mr-2" />
                  Stripe
                </Button>
                <Button
                  variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('paypal')}
                  className={cn(
                    "h-auto py-4",
                    paymentMethod === 'paypal' && "bg-blue-500/20 border-blue-500/50 text-blue-400"
                  )}
                >
                  <CreditCard size={20} className="mr-2" />
                  PayPal
                </Button>
              </div>
            </div>

            {/* Rental Plans */}
            <div className="space-y-4 mb-6">
              {RENTAL_PLANS.map((plan, idx) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={cn(
                    "glass-morph-card p-6 border-2 cursor-pointer transition-all",
                    selectedPlan?.id === plan.id 
                      ? "border-primary/50 bg-primary/10" 
                      : "border-primary/30 hover:border-primary/50",
                    plan.popular && "ring-2 ring-accent/50"
                  )}
                  onClick={() => !isProcessing && setSelectedPlan(plan)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-black uppercase tracking-wider text-primary">
                          {plan.name}
                        </h4>
                        {plan.popular && (
                          <Badge className="bg-accent/20 border-accent/50 text-accent">
                            <Sparkle size={12} className="mr-1" />
                            Popular
                          </Badge>
                        )}
                        {plan.discount && (
                          <Badge className="bg-green-500/20 border-green-500/50 text-green-400">
                            {plan.discount}% OFF
                          </Badge>
                        )}
                      </div>
                      <div className="text-3xl font-black text-primary mb-1">
                        ${plan.price.toFixed(2)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {plan.duration} days of full access
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-accent">
                        {plan.duration}d
                      </div>
                      <div className="text-xs text-muted-foreground">Access</div>
                    </div>
                  </div>
                  
                  {selectedPlan?.id === plan.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-4 border-t border-primary/30"
                    >
                      <Button
                        onClick={() => handleRent(plan)}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:via-accent/90 hover:to-primary/90 text-black font-black uppercase tracking-wider"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard size={20} className="mr-2" />
                            Rent Now - ${plan.price.toFixed(2)}
                            <ArrowRight size={20} className="ml-2" />
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="pt-6 border-t border-primary/20 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield size={14} weight="duotone" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkle size={14} weight="duotone" />
                <span>Instant Access</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} weight="duotone" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

