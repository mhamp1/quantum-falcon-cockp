import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Play, Pause, Lock, TrendUp, TrendDown, Info, Crown, Sparkle, Clock, Gift,
  ChartLine, ChartLineUp, Target, Brain, Lightning, Waves, FishSimple, Crosshair, 
  ArrowsCounterClockwise, Scales, Pulse, Rocket, Shield, Database,
  CalendarPlus, ChartBar, ArrowsDownUp, ArrowsLeftRight, Code
} from '@phosphor-icons/react'
import { canAccessFeature } from '@/lib/auth'
import { toast } from 'sonner'
import StrategyPerformancePreview from '@/components/shared/StrategyPerformancePreview'
import QuickUpgradeModal from '@/components/shared/QuickUpgradeModal'
import { useStrategyRentals, RENTAL_PLANS } from '@/lib/strategyRental'
import { useDailyChallenges } from '@/lib/dailyChallenges'
import { usePersonalizedRecommendations } from '@/lib/personalizedRecommendations'
import RentalModal from '@/components/shared/RentalModal'

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
    icon?: string // Icon name from Phosphor Icons
  }
  userTier: string
  onToggle: (id: string) => void
  onUpgradeClick?: (requiredTier: string) => void
}

export default function TradingStrategyCard({ strategy, userTier, onToggle, onUpgradeClick }: TradingStrategyCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showPerformancePreview, setShowPerformancePreview] = useState(false)
  const [showRentalModal, setShowRentalModal] = useState(false)
  const [isProcessingRental, setIsProcessingRental] = useState(false)
  
  const hasAccess = canAccessFeature(userTier, strategy.requiredTier)
  const { isRented, rentStrategy, getRental } = useStrategyRentals()
  const { getActiveChallenges, claimReward } = useDailyChallenges()
  const { getRecommendations } = usePersonalizedRecommendations()
  
  const isRentedStrategy = isRented(strategy.id)
  const rental = getRental(strategy.id)
  const isLocked = (strategy.status === 'locked' || !hasAccess) && !isRentedStrategy
  
  // Check for personalized recommendation
  const recommendations = getRecommendations([strategy.id])
  const recommendation = recommendations.find(r => r.strategyId === strategy.id)
  
  // Check for challenge unlock
  const challenges = getActiveChallenges()
  const challengeUnlock = challenges.find(c => c.reward.strategyId === strategy.id)

  const handleRentalComplete = (plan: typeof RENTAL_PLANS[0]) => {
    rentStrategy(strategy.id, strategy.name, plan)
  }

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
        data-tour="strategy-card"
        className={`cyber-card angled-corners-dual-tl-br group relative overflow-hidden transition-all duration-300 ${
          isLocked ? 'opacity-60' : 'hover:scale-[1.01]'
        } ${showDetails ? 'ring-2 ring-accent' : ''}`}
        onMouseEnter={() => !isLocked && setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        {isLocked && (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] z-10 flex items-center justify-center cursor-pointer group/locked">
                  <div className="text-center space-y-3 p-6">
                    <div className="inline-flex p-4 bg-muted/30 border-2 border-muted angled-corner-br group-hover/locked:border-accent transition-colors">
                      <Lock size={32} weight="duotone" className="text-muted-foreground group-hover/locked:text-accent transition-colors" />
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
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="cyber-card-accent border-2 border-accent max-w-lg p-0 z-50 angled-corner-tr shadow-2xl shadow-accent/50 overflow-hidden"
                sideOffset={10}
              >
                <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Crown size={24} weight="fill" className="text-accent" />
                      <div className="font-black uppercase tracking-wider text-accent text-lg">{strategy.name}</div>
                    </div>
                    {recommendation && (
                      <Badge className="bg-primary/20 border-primary/50 text-primary">
                        <Sparkle size={12} className="mr-1" />
                        Recommended
                      </Badge>
                    )}
                  </div>
                  
                  {recommendation && (
                    <div className="glass-morph-card p-3 border border-primary/30 mb-3">
                      <div className="text-xs font-bold text-primary mb-1">Why This Strategy:</div>
                      <div className="space-y-1">
                        {recommendation.reasons.slice(0, 2).map((reason, idx) => (
                          <div key={idx} className="text-xs text-foreground flex items-start gap-2">
                            <span className="text-accent font-bold">•</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Match Score: <span className="font-bold text-primary">{recommendation.matchScore}%</span>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-foreground leading-relaxed">{strategy.longDescription}</p>
                  
                  {/* Performance Preview Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowPerformancePreview(!showPerformancePreview)
                    }}
                    className="w-full border-primary/50 text-primary hover:bg-primary/10"
                  >
                    <TrendUp size={14} className="mr-2" />
                    {showPerformancePreview ? 'Hide' : 'Show'} Performance Preview
                  </Button>
                  
                  {showPerformancePreview && (
                    <div className="mt-2">
                      <StrategyPerformancePreview 
                        strategyId={strategy.id}
                        strategyName={strategy.name}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2 pt-3 border-t border-accent/30">
                    <div className="text-xs uppercase tracking-wider font-bold text-primary">What You'll Get:</div>
                    {strategy.benefits.map((benefit, idx) => (
                      <div key={idx} className="text-xs text-foreground flex items-start gap-2">
                        <span className="text-accent font-bold mt-0.5">✓</span>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Challenge Unlock Option */}
                  {challengeUnlock && !challengeUnlock.completed && (
                    <div className="glass-morph-card p-3 border border-yellow-500/30 bg-yellow-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift size={16} weight="fill" className="text-yellow-400" />
                        <div className="text-xs font-bold text-yellow-400">Daily Challenge Available</div>
                      </div>
                      <p className="text-xs text-foreground mb-2">{challengeUnlock.description}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={(challengeUnlock.current / challengeUnlock.target) * 100} className="flex-1 h-2" />
                        <span className="text-xs font-bold text-primary">
                          {challengeUnlock.current}/{challengeUnlock.target}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Rental Option */}
                  <div className="pt-3 border-t border-accent/30 space-y-2">
                    <div className="text-xs uppercase tracking-wider font-bold text-primary mb-2">Unlock Options:</div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowUpgradeModal(true)
                        }}
                        className="bg-accent/20 hover:bg-accent/30 border border-accent text-accent text-xs uppercase tracking-wider font-bold"
                      >
                        <Crown size={12} className="mr-1" weight="fill" />
                        Upgrade
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowRentalModal(true)
                        }}
                        className="border-primary/50 text-primary hover:bg-primary/10 text-xs uppercase tracking-wider font-bold"
                      >
                        <Clock size={12} className="mr-1" />
                        Rent
                      </Button>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-accent/30">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-bold text-accent">Upgrade to {strategy.requiredTier.toUpperCase()}</span> to unlock this strategy and start trading with advanced AI-powered automation.
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <div className="absolute inset-0 diagonal-stripes opacity-5 pointer-events-none" />
        
        <div className="p-5 relative">
          {/* Strategy Icon - Large icon at top of card */}
          <div className="mb-4 flex items-center justify-center">
            <div className="text-[64px] bg-gradient-to-br from-purple-500 to-cyan-500 bg-clip-text text-transparent transition-transform duration-300 group-hover:scale-110" style={{ filter: 'drop-shadow(0 0 20px #9945FF)' }}>
              {(() => {
                const iconMap: Record<string, React.ComponentType<{ size?: number; weight?: string; className?: string }>> = {
                  'ChartLine': ChartLine,
                  'ChartLineUp': ChartLineUp,
                  'Target': Target,
                  'Brain': Brain,
                  'Lightning': Lightning,
                  'Waves': Waves,
                  'FishSimple': FishSimple,
                  'Crosshair': Crosshair,
                  'ArrowsCounterClockwise': ArrowsCounterClockwise,
                  'Scales': Scales,
                  'Pulse': Pulse,
                  'Rocket': Rocket,
                  'Shield': Shield,
                  'Database': Database,
                  'CalendarPlus': CalendarPlus,
                  'ChartBar': ChartBar,
                  'ArrowsDownUp': ArrowsDownUp,
                  'ArrowsLeftRight': ArrowsLeftRight,
                  'Code': Code,
                  'TrendUp': TrendUp
                }
                const IconComponent = strategy.icon && iconMap[strategy.icon] 
                  ? iconMap[strategy.icon] 
                  : (strategy.type.includes('DCA') ? CalendarPlus : 
                     strategy.type.includes('Momentum') || strategy.type.includes('Trend') ? TrendUp :
                    strategy.type.includes('RSI') || strategy.type.includes('Oscillator') ? Pulse :
                     strategy.type.includes('AI') || strategy.type.includes('ML') ? Brain :
                     strategy.type.includes('On-Chain') || strategy.name.includes('Whale') ? FishSimple :
                     strategy.name.includes('Liquidity') || strategy.name.includes('Sweep') ? Waves :
                     strategy.name.includes('Volume') ? ChartBar :
                     strategy.name.includes('MACD') ? ChartLine :
                     strategy.name.includes('Bollinger') ? ArrowsDownUp :
                     strategy.name.includes('Mean') || strategy.name.includes('Reversion') ? ArrowsCounterClockwise :
                     strategy.name.includes('Arbitrage') ? ArrowsLeftRight :
                     strategy.name.includes('Token') || strategy.name.includes('Sniping') ? Crosshair :
                     strategy.name.includes('Custom') || strategy.name.includes('Builder') ? Code :
                     Target)
                return <IconComponent size={64} weight="duotone" />
              })()}
            </div>
          </div>
          
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
      
      {/* Quick Upgrade Modal */}
      <QuickUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        requiredTier={strategy.requiredTier}
        strategyName={strategy.name}
        onUpgradeComplete={() => {
          if (onUpgradeClick) {
            onUpgradeClick(strategy.requiredTier)
          }
        }}
      />
      
      {/* Rental Modal */}
      <RentalModal
        isOpen={showRentalModal}
        onClose={() => setShowRentalModal(false)}
        strategyId={strategy.id}
        strategyName={strategy.name}
        onRentalComplete={handleRentalComplete}
      />
    </TooltipProvider>
  )
}
