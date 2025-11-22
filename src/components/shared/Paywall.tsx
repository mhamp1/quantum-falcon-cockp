// Paywall Component — Feature Gating with Cyberpunk Styling
// November 22, 2025 — Quantum Falcon Cockpit v2025.1.0
// Merged from license-authority integration

import React from 'react'
import { useLicense } from '@/hooks/useLicense'
import { enhancedLicenseService } from '@/lib/license/enhancedLicenseService'
import { Button } from '@/components/ui/button'
import { Lock, Crown, Sparkle, ArrowRight } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface PaywallProps {
  requiredTier: 'pro' | 'elite' | 'lifetime'
  children: React.ReactNode
  fallback?: React.ReactNode
  featureName?: string
  description?: string
}

/**
 * Paywall component - wrap any premium feature with this
 * Automatically gates features based on tier requirements
 */
export default function Paywall({ 
  requiredTier, 
  children, 
  fallback,
  featureName,
  description 
}: PaywallProps) {
  const { tier } = useLicense()
  
  const tierHierarchy = ['free', 'starter', 'trader', 'pro', 'elite', 'lifetime', 'enterprise', 'white_label']
  const currentTierIndex = tierHierarchy.indexOf(tier)
  const requiredTierIndex = tierHierarchy.indexOf(requiredTier)
  
  const hasAccess = currentTierIndex >= requiredTierIndex

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  const handleUpgrade = () => {
    const upgradeUrl = enhancedLicenseService.getUpgradeUrl(requiredTier)
    window.open(upgradeUrl, '_blank', 'noopener,noreferrer')
  }

  const getTierColor = () => {
    switch (requiredTier) {
      case 'pro':
        return 'blue'
      case 'elite':
        return 'purple'
      case 'lifetime':
        return 'yellow'
      default:
        return 'primary'
    }
  }

  const color = getTierColor()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`cyber-card p-8 border-2 border-${color}-500/50 relative overflow-hidden text-center`}
    >
      <div className="absolute inset-0 diagonal-stripes opacity-5" />
      <div className="relative z-10">
        <motion.div
          animate={{ 
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
          className="text-6xl mb-4"
        >
          🔒
        </motion.div>
        
        <h3 className="text-2xl font-black uppercase tracking-wider mb-2 text-foreground">
          Premium Feature
        </h3>
        
        {featureName && (
          <p className="text-lg font-bold text-primary mb-2">{featureName}</p>
        )}
        
        <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
          {description || `Upgrade to ${requiredTier.toUpperCase()} or higher to access this feature`}
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          <Crown size={20} weight="fill" className="text-yellow-400" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Current: {tier.toUpperCase()} • Required: {requiredTier.toUpperCase()}
          </span>
        </div>

        <Button
          onClick={handleUpgrade}
          className={`bg-${color}-500/20 hover:bg-${color}-500/30 border-2 border-${color}-500 text-${color}-400
                   shadow-[0_0_20px_rgba(var(--${color}-500-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--${color}-500-rgb),0.5)]
                   transition-all jagged-corner uppercase tracking-wider font-bold`}
          size="lg"
        >
          <Sparkle size={18} weight="fill" className="mr-2" />
          Upgrade to {requiredTier.toUpperCase()}
          <ArrowRight size={18} weight="bold" className="ml-2" />
        </Button>

        <p className="text-xs text-muted-foreground mt-4">
          Unlock all premium features with a {requiredTier.toUpperCase()} license
        </p>
      </div>
    </motion.div>
  )
}

