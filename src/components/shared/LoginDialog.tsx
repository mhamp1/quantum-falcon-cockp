import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserAuth, UserLicense } from '@/lib/auth'
import { User, Key, Lock, ArrowRight, Crown } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const [auth, setAuth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })
  
  const [email, setEmail] = useState('')
  const [licenseKey, setLicenseKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const mockLicense: UserLicense = {
      userId: 'user_' + Date.now(),
      tier: licenseKey.startsWith('ELITE') ? 'elite' : 
            licenseKey.startsWith('PRO') ? 'pro' :
            licenseKey.startsWith('LIFE') ? 'lifetime' : 'free',
      expiresAt: licenseKey.startsWith('LIFE') ? null : Date.now() + (30 * 24 * 60 * 60 * 1000),
      purchasedAt: Date.now(),
      isActive: true,
      transactionId: 'tx_' + Math.random().toString(36).substr(2, 9)
    }
    
    setAuth({
      isAuthenticated: true,
      userId: mockLicense.userId,
      username: email.split('@')[0],
      email: email,
      avatar: null,
      license: mockLicense
    })
    
    setIsLoading(false)
    onOpenChange(false)
    
    toast.success('Login Successful', {
      description: `Welcome back! ${mockLicense.tier.toUpperCase()} tier activated.`
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cyber-card border-2 border-primary max-w-md">
        <div className="absolute inset-0 diagonal-stripes opacity-5 pointer-events-none" />
        
        <DialogHeader className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/20 border-2 border-primary jagged-corner-small">
              <Lock size={32} weight="duotone" className="text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold uppercase tracking-[0.15em] text-primary hud-text">
              System Access
            </DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground uppercase text-xs tracking-wider">
            Authenticate with your license key to access quantum falcon systems
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4 relative z-10">
          <div className="space-y-2">
            <Label htmlFor="email" className="data-label text-primary">Email Address</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" size={18} />
              <Input
                id="email"
                type="email"
                placeholder="trader@quantumfalcon.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-background/50 border-primary/50 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="license-key" className="data-label text-primary">License Key</Label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
              <Input
                id="license-key"
                type="text"
                placeholder="XXXX-XXXX-XXXX-XXXX"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                className="pl-10 font-mono bg-background/50 border-secondary/50 focus:border-secondary"
              />
            </div>
          </div>

          <div className="cyber-card-accent p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Crown size={16} className="text-accent" weight="fill" />
              <span className="text-xs font-bold uppercase tracking-wider text-accent">Demo Keys</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 font-mono">
              <div>PRO-DEMO-2024 (Pro Tier)</div>
              <div>ELITE-DEMO-2024 (Elite Tier)</div>
              <div>LIFE-DEMO-2024 (Lifetime)</div>
            </div>
          </div>

          <Button
            onClick={handleLogin}
            disabled={!email || !licenseKey || isLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary 
                     shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.4)] hover:shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.6)]
                     transition-all jagged-corner-small uppercase tracking-wider font-bold"
          >
            {isLoading ? (
              <>Processing...</>
            ) : (
              <>
                Authenticate
                <ArrowRight size={18} className="ml-2" weight="bold" />
              </>
            )}
          </Button>

          <div className="text-center">
            <button
              onClick={() => {
                toast.info('Purchase License', {
                  description: 'Visit quantumfalcon.ai to purchase a license'
                })
              }}
              className="text-xs text-primary hover:text-secondary transition-colors uppercase tracking-wider font-semibold"
            >
              Need a License? Purchase Here
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
