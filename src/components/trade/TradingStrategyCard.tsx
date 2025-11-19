import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Play, Pause, Lock, TrendUp, TrendDown, Info, Crown } from '@phosphor-icons/react'
import { canAccessFeature } from '@/lib/auth'
import { toast } from 'sonner'

interface TradingStrategyCardProps {
  strategy: {
    id: string
    name: string
    type: string
    description: string
    longDescription: string
    benefits: string[]
    requiredTier: string
    status: 'active' | 'paused' | 'locked'
    pnl?: number
    pnlPercent?: number
    tradesExecuted?: number
    winRate?: number
    risk: 'low' | 'medium' | 'high'
  }
  userTier: string
  onToggle: (id: string) => void
  onUpgradeClick?: (requiredTier: string) => void
}

export default function TradingStrategyCard({ strategy, userTier, onToggle, onUpgradeClick }: TradingStrategyCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const hasAccess = canAccessFeature(userTier, strategy.requiredTier)
  const isLocked = strategy.status === 'locked' || !hasAccess

  const riskColors = {
    low: 'text-primary border-primary',
    medium: 'text-secondary border-secondary',
    high: 'text-destructive border-destructive'
  }

  const tierColors = {
    free: 'text-muted-foreground border-muted',
    pro: 'text-primary border-primary',
    elite: 'text-accent border-accent',
    lifetime: 'text-secondary border-secondary'
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div
        data-strategy={strategy.id}
        className={`cyber-card angled-corners-dual-tl-br group relative overflow-hidden transition-all duration-300 ${
          isLocked ? 'opacity-60' : 'hover:scale-[1.01]'
        } ${showDetails ? 'ring-2 ring-accent' : ''}`}
        onMouseEnter={() => !isLocked && setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        {isLocked && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="text-center space-y-3 p-6">
              <div className="inline-flex p-4 bg-muted/30 border-2 border-muted angled-corner-br">
                <Lock size={32} weight="duotone" className="text-muted-foreground" />
              </div>
              <div>
                <div className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Requires {strategy.requiredTier.toUpperCase()} Tier
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    if (onUpgradeClick) {
                      onUpgradeClick(strategy.requiredTier)
                    } else {
                      window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'settings' }))
                      setTimeout(() => {
                        const settingsSection = document.getElementById('subscription-tiers-section')
                        settingsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }, 300)
                    }
                  }}
                  className="bg-accent/20 hover:bg-accent/30 border border-accent text-accent text-xs uppercase tracking-wider font-bold angled-corner-tr"
                >
                  <Crown size={14} className="mr-1" weight="fill" />
                  Upgrade
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="absolute inset-0 diagonal-stripes opacity-5 pointer-events-none" />
        
        <div className="p-5 relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h3 className="text-lg font-bold uppercase tracking-wider text-foreground cursor-help flex items-center gap-2">
                      {strategy.name}
                      <Info size={14} className="text-primary" weight="duotone" />
                    </h3>
                  </TooltipTrigger>
                  <TooltipContent className="cyber-card-accent border-2 border-accent max-w-sm p-4 z-50 angled-corner-tr">
                    <div className="space-y-2">
                      <div className="font-bold uppercase tracking-wider text-accent text-sm">{strategy.name}</div>
                      <p className="text-xs text-foreground leading-relaxed">{strategy.longDescription}</p>
                      <div className="space-y-1 pt-2">
                        <div className="text-[10px] uppercase tracking-wider font-bold text-primary">Key Benefits:</div>
                        {strategy.benefits.map((benefit, idx) => (
                          <div key={idx} className="text-[10px] text-muted-foreground flex items-start gap-1">
                            <span className="text-primary">•</span>
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${riskColors[strategy.risk]} bg-transparent text-[9px] uppercase tracking-wider px-2 py-0.5 cut-corner-tr`}>
                  {strategy.risk} Risk
                </Badge>
                <Badge className={`${tierColors[strategy.requiredTier as keyof typeof tierColors]} bg-transparent text-[9px] uppercase tracking-wider px-2 py-0.5 cut-corner-tr`}>
                  {strategy.requiredTier}
                </Badge>
                <Badge className="bg-muted/30 text-muted-foreground text-[9px] uppercase tracking-wider px-2 py-0.5 cut-corner-tr">
                  {strategy.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{strategy.description}</p>
            </div>
            
            {!isLocked && (
              <div className="flex items-center gap-2 ml-3">
                <Switch
                  checked={strategy.status === 'active'}
                  onCheckedChange={() => onToggle(strategy.id)}
                  className="data-[state=checked]:bg-primary"
                />
                {strategy.status === 'active' ? (
                  <Play size={16} weight="fill" className="text-primary" />
                ) : (
                  <Pause size={16} weight="duotone" className="text-muted-foreground" />
                )}
              </div>
            )}
          </div>

          {!isLocked && strategy.pnl !== undefined && (
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-border/50">
              <div>
                <div className="data-label text-[9px]">P&L</div>
                <div className={`text-sm font-bold ${strategy.pnl! >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {strategy.pnl! >= 0 ? '+' : ''}${Math.abs(strategy.pnl!).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="data-label text-[9px]">Change</div>
                <div className="flex items-center gap-1">
                  {strategy.pnlPercent! >= 0 ? (
                    <TrendUp size={12} weight="bold" className="text-primary" />
                  ) : (
                    <TrendDown size={12} weight="bold" className="text-destructive" />
                  )}
                  <span className={`text-sm font-bold ${strategy.pnlPercent! >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {Math.abs(strategy.pnlPercent!).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div>
                <div className="data-label text-[9px]">Trades</div>
                <div className="text-sm font-bold text-foreground">{strategy.tradesExecuted || 0}</div>
              </div>
              <div>
                <div className="data-label text-[9px]">Win Rate</div>
                <div className="text-sm font-bold text-accent">{strategy.winRate || 0}%</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
