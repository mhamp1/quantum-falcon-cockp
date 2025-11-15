import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Clock, Lightning, Star, Coin } from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  getLimitedOffers,
  getFlashSales,
  getTimeUntilNextDailyRotation,
  getTimeUntilNextFlashSale,
  type LimitedOffer
} from '@/lib/limitedOffers'

export default function LimitedOffersSection() {
  const [limitedOffers, setLimitedOffers] = useState<LimitedOffer[]>([])
  const [flashSales, setFlashSales] = useState<LimitedOffer[]>([])
  const [dailyTimer, setDailyTimer] = useState({ hours: 0, minutes: 0 })
  const [flashTimer, setFlashTimer] = useState({ hours: 0, minutes: 0 })
  const [purchasedOffers, setPurchasedOffers] = useKV<string[]>('purchased-limited-offers', [])

  useEffect(() => {
    setLimitedOffers(getLimitedOffers(5))
    setFlashSales(getFlashSales(3))

    const updateTimers = () => {
      setDailyTimer(getTimeUntilNextDailyRotation())
      setFlashTimer(getTimeUntilNextFlashSale())
    }

    updateTimers()
    const interval = setInterval(updateTimers, 60000)

    return () => clearInterval(interval)
  }, [])

  const purchaseOffer = (offer: LimitedOffer) => {
    if (purchasedOffers?.includes(offer.id)) {
      toast.info('Already Purchased', {
        description: 'You already own this enhancement'
      })
      return
    }

    toast.success('Micro-Transaction Complete!', {
      description: `${offer.title} activated for ${offer.duration}h`,
      icon: '⚡'
    })

    setPurchasedOffers((current) => [...(current || []), offer.id])
  }

  const colorByCategory = {
    execution: { bg: 'bg-primary/20', border: 'border-primary', text: 'text-primary', glow: 'shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.4)]' },
    limits: { bg: 'bg-accent/20', border: 'border-accent', text: 'text-accent', glow: 'shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.4)]' },
    analytics: { bg: 'bg-secondary/20', border: 'border-secondary', text: 'text-secondary', glow: 'shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.4)]' },
    risk: { bg: 'bg-destructive/20', border: 'border-destructive', text: 'text-destructive', glow: 'shadow-[0_0_20px_oklch(0.65_0.25_25_/_0.4)]' },
    gamified: { bg: 'bg-accent/20', border: 'border-accent', text: 'text-accent', glow: 'shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.4)]' }
  }

  const OfferCard = ({ offer, isFlashSale = false }: { offer: LimitedOffer; isFlashSale?: boolean }) => {
    const Icon = offer.icon
    const colors = colorByCategory[offer.category]
    const isPurchased = purchasedOffers?.includes(offer.id)

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`cyber-card p-4 space-y-3 relative overflow-hidden group cursor-help hover:${colors.glow} transition-all duration-300 ${
              isPurchased ? 'ring-2 ring-primary' : ''
            } ${isFlashSale ? 'border-2 border-accent animate-pulse-glow' : ''}`}
          >
            {isPurchased && (
              <div className="absolute top-2 right-2 z-20">
                <Badge className="bg-primary/20 border border-primary text-primary text-[8px] uppercase tracking-wider">
                  ACTIVE
                </Badge>
              </div>
            )}
            {isFlashSale && !isPurchased && (
              <div className="absolute top-2 right-2 z-20">
                <Badge className="bg-accent/20 border border-accent text-accent text-[8px] uppercase tracking-wider animate-pulse">
                  ⚡ FLASH
                </Badge>
              </div>
            )}

            <div className="absolute inset-0 technical-grid opacity-5" />

            <div className="relative z-10">
              <div className="flex items-center justify-center mb-3">
                <div className={`p-3 ${colors.bg} border ${colors.border} jagged-corner-small`}>
                  <Icon size={32} weight="duotone" className={colors.text} />
                </div>
              </div>

              <div className="text-center space-y-1 mb-3">
                <h4 className={`font-bold uppercase tracking-[0.12em] text-xs ${colors.text}`}>
                  {offer.title}
                </h4>
                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
                  {offer.subtitle}
                </p>
                <Badge variant="outline" className="text-[8px] uppercase tracking-wider mt-1">
                  {offer.category}
                </Badge>
              </div>

              <p className="text-[10px] text-muted-foreground text-center leading-relaxed min-h-[2.5rem] line-clamp-2 mb-3">
                {offer.description}
              </p>

              <div className="flex items-center justify-center gap-1 text-[9px] text-muted-foreground uppercase tracking-wide mb-3 py-1 bg-background/50">
                <Clock size={10} weight="duotone" />
                <span>{offer.duration}h Duration</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="flex items-center gap-1">
                  <Coin size={16} weight="duotone" className="text-accent" />
                  <span className="text-lg font-black text-foreground">
                    ${offer.price.toFixed(2)}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => purchaseOffer(offer)}
                  disabled={isPurchased}
                  className={`jagged-corner-small h-7 text-[9px] uppercase tracking-wider font-bold ${
                    isPurchased ? 'opacity-50' : ''
                  }`}
                >
                  {isPurchased ? 'Owned' : 'Buy'}
                </Button>
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="cyber-card p-3 max-w-xs">
          <div className="space-y-2">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">{offer.title}</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {offer.description}
            </p>
            <div className="pt-2 border-t border-border/50">
              <p className="text-[10px] text-accent font-bold uppercase tracking-wide">
                ✓ {offer.benefit}
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-6">
        {/* Flash Sales Section - Rotates every 3 hours */}
        <div className="relative overflow-hidden bg-gradient-to-br from-accent/10 via-card to-background border-3 border-accent/60 p-5 jagged-corner">
          <div className="absolute inset-0 diagonal-stripes opacity-10" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent/20 blur-3xl animate-pulse-glow" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Lightning size={28} weight="fill" className="text-accent neon-glow-accent animate-pulse" />
                  <h3 className="text-2xl font-black uppercase tracking-[0.2em] text-accent">Flash Sales</h3>
                </div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em]">
                  ⚡ 20% OFF • Rotates every 3 hours • Micro-transactions
                </p>
              </div>
              <div className="cyber-card-accent p-2 text-center min-w-[80px]">
                <div className="text-[8px] text-muted-foreground uppercase tracking-wider mb-0.5">Next Sale</div>
                <div className="text-sm font-bold text-accent hud-value">
                  {flashTimer.hours}h {flashTimer.minutes}m
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {flashSales.map((offer) => (
                <OfferCard key={offer.id} offer={offer} isFlashSale={true} />
              ))}
            </div>
          </div>
        </div>

        {/* Limited Offers Section - Rotates daily */}
        <div className="relative overflow-hidden bg-gradient-to-br from-background via-card to-background border-3 border-primary/40 p-5 jagged-corner">
          <div className="absolute inset-0 grid-background opacity-5" />
          <div className="absolute top-0 left-0 w-48 h-48 bg-primary/10 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star size={28} weight="fill" className="text-primary neon-glow-primary" />
                  <h3 className="text-2xl font-black uppercase tracking-[0.2em] text-primary">Limited Offers</h3>
                </div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em]">
                  Bot-function micro-transactions • $0.99–$4.99 • Rotates daily
                </p>
              </div>
              <div className="cyber-card p-2 text-center min-w-[80px]">
                <div className="text-[8px] text-muted-foreground uppercase tracking-wider mb-0.5">Next Rotation</div>
                <div className="text-sm font-bold text-primary hud-value">
                  {dailyTimer.hours}h {dailyTimer.minutes}m
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {limitedOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-border/30">
              <p className="text-[9px] text-center text-muted-foreground uppercase tracking-[0.15em]">
                💡 Tip: These micro-transactions are designed for impulse buys – quick, affordable bot enhancements
              </p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
