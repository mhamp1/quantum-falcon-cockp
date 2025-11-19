import { useState, useEffect } from 'react'
import { Key, ShieldCheck, Warning } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { verifyAndStoreLicense, LicenseAuthority } from '@/lib/license-auth'
import { toast } from 'sonner'

interface LicenseAuthProps {
  onSuccess: (tier: string, expiresAt: number) => void
}

export default function LicenseAuth({ onSuccess }: LicenseAuthProps) {
  const [licenseKey, setLicenseKey] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    const info = `Storage Available: ${typeof localStorage !== 'undefined'}\nSession ID: ${Date.now()}`
    setDebugInfo(info)
  }, [])

  const handleVerify = async () => {
    if (!licenseKey.trim()) {
      toast.error('Please enter a license key')
      return
    }

    setIsVerifying(true)

    try {
      const result = await verifyAndStoreLicense(licenseKey)

      if (result.valid && result.tier && result.expiresAt) {
        toast.success(`License verified! Welcome to ${result.tier.toUpperCase()} tier`)
        await onSuccess(result.tier, result.expiresAt)
      } else {
        toast.error(result.error || 'Invalid license key')
      }
    } catch (error) {
      console.error('[LicenseAuth] Verification error:', error)
      toast.error('Verification failed. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleFreeTier = async () => {
    toast.success('Welcome to Free Tier!')
    await onSuccess('free', Date.now() + 30 * 24 * 60 * 60 * 1000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 technical-grid opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md">
        <div className="cyber-card p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex p-6 jagged-corner bg-primary/20 border-2 border-primary">
              <ShieldCheck size={64} weight="duotone" className="text-primary neon-glow-primary" />
            </div>
            
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-[0.15em] text-primary hud-text mb-2">
                LICENSE VERIFICATION
              </h1>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">
                QUANTUM FALCON COCKPIT
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="data-label block">LICENSE KEY</label>
              <div className="relative">
                <Key 
                  size={20} 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" 
                  weight="duotone"
                />
                <Input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
                  placeholder="Enter your license key"
                  className="pl-10 bg-muted/30 border-primary/30 focus:border-primary text-foreground uppercase tracking-wider"
                  disabled={isVerifying}
                />
              </div>
            </div>

            <Button
              onClick={handleVerify}
              disabled={isVerifying}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider neon-glow-primary"
            >
              {isVerifying ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  VERIFYING...
                </span>
              ) : (
                'VERIFY LICENSE'
              )}
            </Button>

            <div className="pt-4 border-t border-primary/30">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Warning size={16} className="text-accent mt-0.5 flex-shrink-0" weight="duotone" />
                <p className="uppercase tracking-wide leading-relaxed">
                  Your license key is verified against our secure servers. 
                  No sensitive data is stored locally.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-primary/30 space-y-3">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
                Don't have a license?
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full border-primary/30 hover:bg-primary/10 text-foreground uppercase tracking-wide text-xs"
                  onClick={() => window.open(LicenseAuthority.getLicenseRepoUrl(), '_blank')}
                >
                  Get License Key
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground uppercase tracking-wide text-xs"
                  onClick={handleFreeTier}
                >
                  Continue with Free Tier
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-[8px] text-muted-foreground uppercase tracking-wider">
            SECURE LICENSE VERIFICATION SYSTEM v2.0
          </p>
        </div>
      </div>
    </div>
  )
}
