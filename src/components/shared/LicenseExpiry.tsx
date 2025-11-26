import { useEffect, useState } from 'react'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { UserAuth, getRemainingTime } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Clock, Warning, Crown, ArrowRight } from '@phosphor-icons/react'
import { toast } from 'sonner'

export default function LicenseExpiry() {
  const [auth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })

  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, expired: false })

  useEffect(() => {
    if (!auth?.license?.expiresAt) return

    const updateTimer = () => {
      const remaining = getRemainingTime(auth.license?.expiresAt || null)
      setTimeRemaining(remaining)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000)

    return () => clearInterval(interval)
  }, [auth?.license?.expiresAt])

  if (!auth?.isAuthenticated || !auth?.license?.expiresAt) return null

  const { days, hours, minutes, expired } = timeRemaining
  const isWarning = days <= 7 && !expired
  const isCritical = days <= 2 && !expired

  if (expired) {
    return (
      <div className="cyber-card p-4 border-2 border-destructive bg-destructive/10 relative overflow-hidden">
        <div className="absolute inset-0 diagonal-stripes opacity-10 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/20 border-2 border-destructive jagged-corner-small animate-pulse">
              <Warning size={24} weight="fill" className="text-destructive" />
            </div>
            <div>
              <div className="font-bold uppercase tracking-wider text-destructive text-sm">License Expired</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Renew to restore full access</div>
            </div>
          </div>
          <Button
            onClick={() => {
              toast.info('Renew License', {
                description: 'Visit quantumfalcon.ai to renew your license'
              })
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 border-2 border-destructive 
                     shadow-[0_0_20px_oklch(0.65_0.25_25_/_0.4)] uppercase tracking-wider font-bold text-xs
                     jagged-corner-small whitespace-nowrap"
          >
            Renew Now
            <ArrowRight size={16} className="ml-2" weight="bold" />
          </Button>
        </div>
      </div>
    )
  }

  if (isWarning) {
    return (
      <div className={`cyber-card p-4 border-2 relative overflow-hidden ${
        isCritical 
          ? 'border-destructive bg-destructive/10' 
          : 'border-secondary bg-secondary/10'
      }`}>
        <div className="absolute inset-0 diagonal-stripes opacity-10 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 border-2 jagged-corner-small ${
              isCritical 
                ? 'bg-destructive/20 border-destructive animate-pulse' 
                : 'bg-secondary/20 border-secondary'
            }`}>
              <Clock size={24} weight="fill" className={isCritical ? 'text-destructive' : 'text-secondary'} />
            </div>
            <div>
              <div className={`font-bold uppercase tracking-wider text-sm ${
                isCritical ? 'text-destructive' : 'text-secondary'
              }`}>
                License Expires Soon
              </div>
              <div className="text-xs text-foreground uppercase tracking-wide font-mono">
                {days}D {hours}H {minutes}M Remaining
              </div>
            </div>
          </div>
          <Button
            onClick={() => {
              toast.info('Renew License', {
                description: 'Extend your license before it expires'
              })
            }}
            className={`border-2 uppercase tracking-wider font-bold text-xs jagged-corner-small whitespace-nowrap ${
              isCritical
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 border-destructive shadow-[0_0_20px_oklch(0.65_0.25_25_/_0.4)]'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/90 border-secondary shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.4)]'
            }`}
          >
            Renew Now
            <ArrowRight size={16} className="ml-2" weight="bold" />
          </Button>
        </div>
      </div>
    )
  }

  return null
}
