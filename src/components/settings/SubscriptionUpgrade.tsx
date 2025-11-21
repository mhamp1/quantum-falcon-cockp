import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, Crown, Lightning, Sparkle, X } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { usePricingConfig } from '@/hooks/usePricingConfig'
import { cn } from '@/lib/utils'

interface SubscriptionUpgradeProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tier: 'free' | 'starter' | 'trader' | 'pro-trader' | 'elite-trader' | 'lifetime'
}

export default function SubscriptionUpgrade({ open, onOpenChange, tier }: SubscriptionUpgradeProps) {
  const { getTierById } = usePricingConfig()
  const tierData = getTierById(tier)

  if (!tierData) {
    return null
  }

  // Color mapping based on tier type
  const getColorForTier = (tierId: string) => {
    if (tierId === 'lifetime') return 'oklch(0.85 0.25 60)'
    if (tierId === 'elite-trader') return 'oklch(0.80 0.20 280)'
    if (tierId === 'pro-trader') return 'oklch(0.65 0.25 25)'
    if (tierId === 'trader') return 'oklch(0.68 0.18 330)'
    if (tierId === 'starter') return 'oklch(0.72 0.20 195)'
    return 'oklch(0.50 0.10 195)'
  }

  const color = getColorForTier(tierData.id)
  const upgradeUrl = tierData.price > 0 ? `https://quantumfalcon.ai/upgrade/${tierData.id}` : undefined

  // Build feature list from config
  const features = [
    tierData.strategyLibrary.label,
    tierData.aiAgents.label,
    `${tierData.multiplier.label} multiplier`,
    ...tierData.keyPerks
  ]

  const handleUpgrade = () => {
    if (upgradeUrl) {
      window.open(upgradeUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const isWhaleTier = tierData.isWhaleTier

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-[600px] max-h-[90vh] border-2 p-0 gap-0 flex flex-col overflow-hidden",
        isWhaleTier ? "bg-gradient-to-br from-violet-900/40 via-purple-900/60 to-pink-900/40" : "cyber-card"
      )} style={{ borderColor: color }}>
        <div className="absolute inset-0 technical-grid opacity-5 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-current/10 to-transparent pointer-events-none" style={{ color }} />
        
        <motion.div
          className="absolute top-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
        />

        <DialogHeader className="p-6 pb-4 border-b relative z-10 flex-shrink-0" style={{ borderColor: `${color}40` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-3 jagged-corner-small border-2 relative overflow-hidden",
                isWhaleTier ? "bg-purple-500/20 border-purple-400/50" : ""
              )} style={{ 
                backgroundColor: isWhaleTier ? undefined : `${color}20`,
                borderColor: isWhaleTier ? undefined : `${color}60`
              }}>
                {tier === 'lifetime' ? (
                  <Sparkle size={24} weight="fill" style={{ color: isWhaleTier ? '#fbbf24' : color }} />
                ) : (tier === 'elite-trader' || isWhaleTier) ? (
                  <Crown size={24} weight="fill" style={{ color: isWhaleTier ? '#c084fc' : color }} />
                ) : (
                  <Lightning size={24} weight="duotone" style={{ color }} />
                )}
              </div>
              <div>
                <DialogTitle className={cn(
                  "text-2xl font-bold uppercase tracking-[0.15em] hud-text flex items-center gap-2",
                  isWhaleTier ? "text-white" : ""
                )} style={{ color: isWhaleTier ? undefined : color }}>
                  {tierData.name} {isWhaleTier && <Crown size={20} weight="fill" className="text-yellow-400" />}
                </DialogTitle>
                <p className={cn(
                  "text-xs uppercase tracking-wider mt-1",
                  isWhaleTier ? "text-purple-200" : "text-muted-foreground"
                )}>
                  Upgrade your trading experience
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 relative z-10 flex-1 overflow-y-auto scrollbar-thin">
          <div className={cn(
            "text-center p-6 jagged-corner relative overflow-hidden",
            isWhaleTier ? "bg-purple-500/20 border-2 border-purple-400/50" : ""
          )} style={{
            backgroundColor: isWhaleTier ? undefined : `${color}10`,
            border: isWhaleTier ? undefined : `2px solid ${color}40`
          }}>
            <div className="absolute inset-0 diagonal-stripes opacity-10" />
            <div className="relative z-10">
              <div className={cn(
                "text-5xl font-black hud-value mb-2",
                isWhaleTier ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-400" : ""
              )} style={isWhaleTier ? undefined : { 
                color,
                textShadow: `0 0 20px ${color}`
              }}>
                {tierData.priceDisplay.split('/')[0]}
              </div>
              <div className={cn(
                "text-sm uppercase tracking-[0.2em] font-bold",
                isWhaleTier ? "text-purple-200" : "text-muted-foreground"
              )}>
                {tierData.billingPeriod === 'month' ? 'per month' : tierData.billingPeriod === 'once' ? 'one-time' : 'forever'}
              </div>
            </div>
          </div>

          {isWhaleTier && (
            <div className="p-4 jagged-corner-small bg-gradient-to-r from-yellow-500/20 to-purple-500/20 border-2 border-yellow-400/30">
              <p className="text-center text-sm font-bold text-yellow-200 uppercase tracking-wider flex items-center justify-center gap-2">
                <Crown size={16} weight="fill" className="text-yellow-400" />
                WHALE TIER — ELITE STATUS
              </p>
            </div>
          )}

          <div className="space-y-3">
            <h4 className={cn(
              "text-sm font-bold uppercase tracking-[0.15em] flex items-center gap-2",
              isWhaleTier ? "text-yellow-300" : "text-primary"
            )}>
              <CheckCircle size={16} weight="fill" className={isWhaleTier ? "text-yellow-400" : "text-primary"} />
              What's Included
            </h4>
            
            <div className="space-y-2">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-start gap-2 p-2 hover:bg-muted/10 transition-colors angled-corner-br",
                    isWhaleTier ? "hover:bg-purple-500/10" : ""
                  )}
                >
                  <CheckCircle 
                    size={14} 
                    weight="fill" 
                    style={{ color: isWhaleTier ? '#fbbf24' : color, minWidth: '14px', marginTop: '2px' }} 
                  />
                  <span className={cn(
                    "text-sm",
                    isWhaleTier ? "text-white" : "text-foreground"
                  )}>{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {upgradeUrl && (
            <div className={cn(
              "p-4 jagged-corner-small border",
              isWhaleTier ? "bg-purple-500/10 border-purple-400/30" : "bg-accent/10 border-accent/30"
            )}>
              <p className={cn(
                "text-xs",
                isWhaleTier ? "text-purple-100" : "text-muted-foreground"
              )}>
                Your subscription will be processed securely. You can cancel anytime from your account settings.
              </p>
            </div>
          )}
        </div>

        <div className="p-6 pt-4 border-t relative z-10 flex-shrink-0" style={{ borderColor: `${color}40` }}>
          {upgradeUrl ? (
            <Button
              onClick={handleUpgrade}
              className={cn(
                "w-full py-6 text-base font-bold uppercase tracking-[0.2em] jagged-corner border-2 transition-all",
                isWhaleTier ? [
                  "bg-gradient-to-r from-yellow-500 via-purple-500 to-pink-500",
                  "hover:from-yellow-400 hover:via-purple-400 hover:to-pink-400",
                  "text-white shadow-lg shadow-purple-500/50",
                  "border-yellow-400/50"
                ] : ""
              )}
              style={isWhaleTier ? undefined : {
                backgroundColor: `${color}20`,
                borderColor: color,
                color: color,
                boxShadow: `0 0 20px ${color}40`
              }}
            >
              {isWhaleTier && <Crown size={20} weight="fill" className="mr-2" />}
              {!isWhaleTier && <Lightning size={20} weight="fill" className="mr-2" />}
              Upgrade to {tierData.name}
            </Button>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                You're currently on the Free tier. Upgrade to unlock live trading and more features!
              </p>
              <Button
                onClick={() => {
                  onOpenChange(false)
                }}
                variant="outline"
                className="border-primary/50 hover:border-primary hover:bg-primary/10 jagged-corner-small"
              >
                View Other Tiers
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
