// Enhanced License Tab — Cyberpunk Styled License Management
// November 22, 2025 — Quantum Falcon Cockpit v2025.1.0
// Merged from license-authority integration with Quantum Falcon styling

import React, { useState, useEffect } from 'react'
import { enhancedLicenseService, type LicenseData, type TierInfo } from '@/lib/license/enhancedLicenseService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Key, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Crown, 
  ShieldCheck,
  Warning,
  Sparkle,
  Lock,
  Devices as Device,
  ArrowRight
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Enhanced License Tab Component for Settings
 * 
 * Displays:
 * - Current license status with cyberpunk styling
 * - Tier information
 * - Expiration date
 * - Renewal button
 * - Upgrade options
 * - Device binding status
 */
export default function LicenseTab() {
  const [licenseData, setLicenseData] = useState<LicenseData | null>(null)
  const [tiers, setTiers] = useState<TierInfo[]>([])
  const [newLicenseKey, setNewLicenseKey] = useState('')
  const [validating, setValidating] = useState(false)
  const [validationMessage, setValidationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    // Load current license data
    const currentLicense = enhancedLicenseService.getLicenseData()
    setLicenseData(currentLicense)

    // Load available tiers
    enhancedLicenseService.getTiers().then(setTiers)

    // Check for renewal reminder
    if (enhancedLicenseService.shouldShowRenewalReminder()) {
      const daysLeft = enhancedLicenseService.getDaysUntilExpiry()
      toast.warning('License Expiring Soon', {
        description: `Your license expires in ${daysLeft} days. Renew now to maintain access.`,
        duration: 10000,
      })
    }
  }, [])

  const handleValidateLicense = async () => {
    if (!newLicenseKey.trim()) {
      setValidationMessage({ type: 'error', text: 'Please enter a license key' })
      return
    }

    setValidating(true)
    setValidationMessage(null)

    try {
      const result = await enhancedLicenseService.validate(newLicenseKey.trim())

      if (result.valid) {
        setValidationMessage({ 
          type: 'success', 
          text: `License activated! You now have ${result.tier.toUpperCase()} tier access.` 
        })
        setLicenseData(enhancedLicenseService.getLicenseData())
        setNewLicenseKey('')
        
        toast.success('License Activated', {
          description: `${result.tier.toUpperCase()} tier unlocked`,
          icon: '🔑',
          duration: 5000,
        })
      } else {
        setValidationMessage({ 
          type: 'error', 
          text: result.error || 'Invalid license key' 
        })
        toast.error('License Validation Failed', {
          description: result.error || 'Please check your license key and try again',
        })
      }
    } catch (error) {
      setValidationMessage({ 
        type: 'error', 
        text: 'Failed to validate license. Please try again.' 
      })
      toast.error('Validation Error', {
        description: error instanceof Error ? error.message : 'Network error occurred',
      })
    } finally {
      setValidating(false)
    }
  }

  const handleUpgrade = (tier: string) => {
    const upgradeUrl = enhancedLicenseService.getUpgradeUrl(tier, licenseData?.licenseKey)
    window.open(upgradeUrl, '_blank', 'noopener,noreferrer')
  }

  const formatExpirationDate = (timestamp?: number): string => {
    if (!timestamp) return 'Never (Lifetime)'
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getStatusBadgeColor = (): string => {
    if (!licenseData) return 'bg-muted/30 border-muted text-muted-foreground'
    
    const daysLeft = enhancedLicenseService.getDaysUntilExpiry()
    if (daysLeft === null) return 'bg-green-500/20 border-green-500 text-green-400' // Lifetime
    if (daysLeft <= 0) return 'bg-red-500/20 border-red-500 text-red-400' // Expired
    if (daysLeft <= 7) return 'bg-yellow-500/20 border-yellow-500 text-yellow-400' // Expiring soon
    return 'bg-primary/20 border-primary text-primary' // Active
  }

  const getTierBadgeColor = (tier: string): string => {
    switch (tier.toLowerCase()) {
      case 'free':
        return 'bg-muted/30 border-muted text-muted-foreground'
      case 'starter':
        return 'bg-green-500/20 border-green-500 text-green-400'
      case 'trader':
        return 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
      case 'pro':
        return 'bg-blue-500/20 border-blue-500 text-blue-400'
      case 'elite':
        return 'bg-purple-500/20 border-purple-500 text-purple-400'
      case 'lifetime':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
      case 'enterprise':
        return 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
      case 'white_label':
        return 'bg-pink-500/20 border-pink-500 text-pink-400'
      default:
        return 'bg-muted/30 border-muted text-muted-foreground'
    }
  }

  const deviceFingerprint = enhancedLicenseService.getDeviceFingerprint()
  const isHardwareBindingEnabled = enhancedLicenseService.isHardwareBindingEnabled()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/20 border-2 border-primary rounded-lg">
          <Key size={32} weight="duotone" className="text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-wider text-primary">License Management</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Activate and manage your license</p>
        </div>
      </div>

      {/* Current License Status */}
      <div className="cyber-card p-6 border-2 border-primary/50 relative overflow-hidden">
        <div className="absolute inset-0 diagonal-stripes opacity-5" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold uppercase tracking-wide text-primary">Current License</h3>
            {licenseData && (
              <Badge className={getStatusBadgeColor()}>
                {enhancedLicenseService.isExpired() ? 'Expired' : 'Active'}
              </Badge>
            )}
          </div>
          
          {licenseData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-background/60 border border-primary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Tier</p>
                  <Badge className={getTierBadgeColor(licenseData.tier)}>
                    {licenseData.tier.toUpperCase()}
                  </Badge>
                </div>

                <div className="p-4 bg-background/60 border border-primary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">User ID</p>
                  <p className="text-sm font-mono text-primary truncate">{licenseData.user_id}</p>
                </div>

                <div className="p-4 bg-background/60 border border-primary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Expires</p>
                  <p className="text-sm font-bold text-foreground">{formatExpirationDate(licenseData.expires_at)}</p>
                </div>

                <div className="p-4 bg-background/60 border border-primary/20 rounded-lg">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Agents</p>
                  <p className="text-sm font-bold text-primary">
                    {enhancedLicenseService.getMaxAgents() === -1 ? '∞' : enhancedLicenseService.getMaxAgents()}
                  </p>
                </div>
              </div>

              {/* Device Binding Status */}
              {isHardwareBindingEnabled && deviceFingerprint && (
                <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Device size={18} weight="duotone" className="text-cyan-400" />
                    <span className="text-sm font-bold text-cyan-400 uppercase tracking-wide">Device Bound</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    {deviceFingerprint.fingerprint.substring(0, 16)}...
                  </p>
                </div>
              )}

              {/* Renewal Reminder */}
              {enhancedLicenseService.shouldShowRenewalReminder() && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-yellow-500/10 border-2 border-yellow-500/50 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Warning size={20} weight="duotone" className="text-yellow-400" />
                    <p className="text-sm font-bold text-yellow-400">
                      License expires in {enhancedLicenseService.getDaysUntilExpiry()} days!
                    </p>
                  </div>
                  <Button
                    onClick={() => handleUpgrade(licenseData.tier)}
                    size="sm"
                    className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500 text-yellow-400"
                  >
                    Renew Now
                  </Button>
                </motion.div>
              )}

              {/* Features List */}
              <div className="p-4 bg-background/60 border border-primary/20 rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Features</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {licenseData.features.slice(0, 6).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      <CheckCircle size={14} weight="fill" className="text-green-400 flex-shrink-0" />
                      <span className="text-foreground truncate">{feature}</span>
                    </div>
                  ))}
                  {licenseData.features.length > 6 && (
                    <div className="text-xs text-muted-foreground">
                      + {licenseData.features.length - 6} more...
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Lock size={48} weight="duotone" className="text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">No license activated</p>
              <p className="text-xs text-muted-foreground">Enter a license key below to get started</p>
            </div>
          )}
        </div>
      </div>

      {/* Activate License */}
      <div className="cyber-card p-6 border-2 border-primary/50 relative overflow-hidden">
        <div className="absolute inset-0 diagonal-stripes opacity-5" />
        <div className="relative z-10">
          <h3 className="text-xl font-bold uppercase tracking-wide text-primary mb-6">Activate License</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="license-key" className="text-xs uppercase tracking-wider font-bold mb-2">
                License Key
              </Label>
              <div className="relative">
                <Input
                  id="license-key"
                  type={showKey ? 'text' : 'password'}
                  value={newLicenseKey}
                  onChange={(e) => setNewLicenseKey(e.target.value)}
                  placeholder="Enter your license key (e.g., QF-PRO-xxxxx-xxxxx)"
                  className="pr-10 font-mono text-xs bg-background/60 border-primary/50 focus:border-primary"
                  disabled={validating}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !validating) {
                      handleValidateLicense()
                    }
                  }}
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <Lock size={16} weight="duotone" /> : <Key size={16} weight="duotone" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {validationMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-lg border-2 ${
                    validationMessage.type === 'success' 
                      ? 'bg-green-500/10 border-green-500/50 text-green-400'
                      : 'bg-red-500/10 border-red-500/50 text-red-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {validationMessage.type === 'success' ? (
                      <CheckCircle size={20} weight="fill" />
                    ) : (
                      <XCircle size={20} weight="fill" />
                    )}
                    <p className="text-sm font-medium">{validationMessage.text}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              onClick={handleValidateLicense}
              disabled={validating || !newLicenseKey.trim()}
              className="w-full bg-primary/20 hover:bg-primary/30 border-2 border-primary text-primary
                       shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.3)] hover:shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.5)]
                       transition-all jagged-corner uppercase tracking-wider font-bold"
            >
              {validating ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                  Validating...
                </>
              ) : (
                <>
                  <Key size={18} weight="duotone" className="mr-2" />
                  Activate License
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Available Tiers */}
      {tiers.length > 0 && (
        <div className="cyber-card p-6 border-2 border-primary/50 relative overflow-hidden">
          <div className="absolute inset-0 diagonal-stripes opacity-5" />
          <div className="relative z-10">
            <h3 className="text-xl font-bold uppercase tracking-wide text-primary mb-6">Available Plans</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {tiers.map((tier) => (
                <motion.div
                  key={tier.tier}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className={`cyber-card p-4 border-2 ${
                    tier.tier === 'starter' ? 'border-green-500/50' :
                    tier.tier === 'trader' ? 'border-cyan-500/50' :
                    tier.tier === 'pro' ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]' :
                    tier.tier === 'elite' ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]' :
                    tier.tier === 'lifetime' ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]' :
                    'border-primary/30'
                  } relative overflow-hidden`}
                >
                  <div className="absolute inset-0 diagonal-stripes opacity-5" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-sm uppercase tracking-wide">{tier.name}</h4>
                      {tier.tier === 'starter' && (
                        <Badge className="bg-green-500/20 border-green-500 text-green-400 text-[8px] px-1">
                          NEW
                        </Badge>
                      )}
                      {tier.tier === 'trader' && (
                        <Badge className="bg-cyan-500/20 border-cyan-500 text-cyan-400 text-[8px] px-1">
                          POPULAR
                        </Badge>
                      )}
                      {tier.tier === 'elite' && (
                        <Badge className="bg-purple-500/20 border-purple-500 text-purple-400 text-[8px] px-1">
                          <Sparkle size={8} weight="fill" className="mr-0.5" />
                          POPULAR
                        </Badge>
                      )}
                      {tier.tier === 'lifetime' && (
                        <Badge className="bg-yellow-500/20 border-yellow-500 text-yellow-400 text-[8px] px-1">
                          <Crown size={8} weight="fill" className="mr-0.5" />
                          BEST
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-2xl font-black mb-1">
                      {typeof tier.price === 'number' ? `$${tier.price}` : tier.price}
                      {typeof tier.price === 'number' && tier.tier !== 'lifetime' && tier.price > 0 && (
                        <span className="text-[10px] font-normal text-muted-foreground">/mo</span>
                      )}
                    </p>
                    
                    <p className="text-[10px] text-muted-foreground mb-3 min-h-[28px]">
                      {tier.description}
                    </p>
                    
                    <ul className="space-y-1.5 mb-3 text-[10px] min-h-[80px]">
                      {tier.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-start gap-1.5">
                          <CheckCircle size={12} weight="fill" className="text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-foreground leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {tier.tier !== 'free' && (
                      <Button
                        onClick={() => handleUpgrade(tier.tier)}
                        size="sm"
                        className={`w-full h-8 ${
                          tier.tier === 'starter'
                            ? 'bg-green-500/20 hover:bg-green-500/30 border-green-500 text-green-400'
                            : tier.tier === 'trader'
                            ? 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500 text-cyan-400'
                            : tier.tier === 'pro'
                            ? 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500 text-blue-400'
                            : tier.tier === 'elite' 
                            ? 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500 text-purple-400'
                            : tier.tier === 'lifetime'
                            ? 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500 text-yellow-400'
                            : 'bg-primary/20 hover:bg-primary/30 border-primary text-primary'
                        } border uppercase tracking-wider font-bold text-[10px]`}
                      >
                        {licenseData?.tier === tier.tier ? 'Renew' : 'Upgrade'}
                        <ArrowRight size={12} weight="bold" className="ml-1" />
                      </Button>
                    )}
                    
                    {tier.tier === 'free' && licenseData?.tier === 'free' && (
                      <div className="w-full h-8 flex items-center justify-center text-[10px] text-muted-foreground uppercase tracking-wider">
                        Current Plan
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="cyber-card-accent p-4 border border-primary/30">
        <div className="flex items-start gap-3">
          <ShieldCheck size={20} weight="duotone" className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary mb-1">Security Notice</p>
            <p className="text-xs text-muted-foreground">
              Your license key is encrypted and stored locally. Hardware binding {isHardwareBindingEnabled ? 'is enabled' : 'is optional'} for additional security.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

