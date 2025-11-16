import { useState } from 'react'
import { useKV } from '@/hooks/useKVFallback'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Lightning, 
  TrendUp, 
  TrendDown, 
  Play, 
  Pause, 
  Target,
  ChartLine,
  Gear,
  CheckCircle,
  Warning,
  ArrowsClockwise
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Strategy {
  id: string
  name: string
  type: string
  status: 'active' | 'paused' | 'stopped'
  pnl: number
  pnlPercent: number
  tradesExecuted: number
  winRate: number
  avgTradeSize: number
  lastTrade: number
  risk: 'low' | 'medium' | 'high'
  description: string
}

export default function EnhancedTradingHub() {
  const [strategies, setStrategies] = useKV<Strategy[]>('active-strategies', [
    {
      id: '1',
      name: 'SOL Momentum Scalper',
      type: 'Momentum',
      status: 'active',
      pnl: 342.50,
      pnlPercent: 12.4,
      tradesExecuted: 47,
      winRate: 68,
      avgTradeSize: 25,
      lastTrade: Date.now() - 300000,
      risk: 'medium',
      description: 'Captures short-term momentum swings in SOL/USDC pair using technical indicators'
    },
    {
      id: '2',
      name: 'BTC DCA Strategy',
      type: 'DCA',
      status: 'active',
      pnl: 89.20,
      pnlPercent: 3.2,
      tradesExecuted: 12,
      winRate: 100,
      avgTradeSize: 50,
      lastTrade: Date.now() - 3600000,
      risk: 'low',
      description: 'Dollar cost averaging into BTC every 6 hours regardless of price'
    },
    {
      id: '3',
      name: 'New Token Sniper',
      type: 'Sniping',
      status: 'paused',
      pnl: -45.30,
      pnlPercent: -5.8,
      tradesExecuted: 8,
      winRate: 37.5,
      avgTradeSize: 15,
      lastTrade: Date.now() - 7200000,
      risk: 'high',
      description: 'Automatically detects and buys new token launches on Raydium'
    }
  ])

  const toggleStrategy = (id: string) => {
    setStrategies((current) =>
      current?.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'active' ? 'paused' : 'active' }
          : s
      ) || []
    )

    const strategy = strategies?.find((s) => s.id === id)
    if (strategy) {
      toast.success(
        strategy.status === 'active' ? 'Strategy Paused' : 'Strategy Activated',
        {
          description: `${strategy.name} is now ${strategy.status === 'active' ? 'paused' : 'active'}`
        }
      )
    }
  }

  const formatTimeSince = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  if (!strategies) return null

  const activeStrategies = strategies.filter((s) => s.status === 'active')
  const totalPnL = strategies.reduce((sum, s) => sum + s.pnl, 0)
  const totalTrades = strategies.reduce((sum, s) => sum + s.tradesExecuted, 0)
  const avgWinRate = strategies.reduce((sum, s) => sum + s.winRate, 0) / strategies.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-[0.15em] text-primary hud-text">
            Trading Hub
          </h2>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mt-1">
            Active Strategies & Performance
          </p>
        </div>
        <Button className="jagged-corner-small">
          <Lightning size={18} weight="duotone" className="mr-2" />
          New Strategy
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="cyber-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Total P&L</span>
            {totalPnL >= 0 ? (
              <TrendUp size={16} className="text-primary" weight="duotone" />
            ) : (
              <TrendDown size={16} className="text-destructive" weight="duotone" />
            )}
          </div>
          <div className={`text-2xl font-bold hud-value ${totalPnL >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)} USD
          </div>
        </div>

        <div className="cyber-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Active</span>
            <CheckCircle size={16} className="text-primary" weight="duotone" />
          </div>
          <div className="text-2xl font-bold hud-value text-foreground">
            {activeStrategies.length} / {strategies.length}
          </div>
        </div>

        <div className="cyber-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Total Trades</span>
            <ArrowsClockwise size={16} className="text-accent" weight="duotone" />
          </div>
          <div className="text-2xl font-bold hud-value text-foreground">
            {totalTrades}
          </div>
        </div>

        <div className="cyber-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Avg Win Rate</span>
            <Target size={16} className="text-secondary" weight="duotone" />
          </div>
          <div className="text-2xl font-bold hud-value text-foreground">
            {avgWinRate.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold uppercase tracking-wider text-foreground">
          Your Strategies
        </h3>

        {strategies.map((strategy) => (
          <div key={strategy.id} className="cyber-card p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h4 className="text-lg font-bold uppercase tracking-wider">{strategy.name}</h4>
                  <Badge 
                    variant={strategy.status === 'active' ? 'default' : 'outline'}
                    className="uppercase text-xs"
                  >
                    {strategy.status}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={`uppercase text-xs ${
                      strategy.risk === 'low' ? 'border-primary/50 text-primary' :
                      strategy.risk === 'medium' ? 'border-accent/50 text-accent' :
                      'border-destructive/50 text-destructive'
                    }`}
                  >
                    {strategy.risk} Risk
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground">{strategy.description}</p>

                <div className="flex items-center gap-6 text-xs">
                  <div>
                    <span className="text-muted-foreground uppercase">Type:</span>
                    <span className="ml-2 font-bold">{strategy.type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground uppercase">Last Trade:</span>
                    <span className="ml-2 font-bold">{formatTimeSince(strategy.lastTrade)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="jagged-corner-small"
                >
                  <Gear size={16} weight="duotone" />
                </Button>
                <Switch
                  checked={strategy.status === 'active'}
                  onCheckedChange={() => toggleStrategy(strategy.id)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-primary/30">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">P&L</div>
                <div className={`text-lg font-bold hud-value ${
                  strategy.pnl >= 0 ? 'text-primary' : 'text-destructive'
                }`}>
                  {strategy.pnl >= 0 ? '+' : ''}{strategy.pnl.toFixed(2)} USD
                </div>
                <div className={`text-xs ${
                  strategy.pnlPercent >= 0 ? 'text-primary/70' : 'text-destructive/70'
                }`}>
                  {strategy.pnlPercent >= 0 ? '+' : ''}{strategy.pnlPercent.toFixed(1)}%
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Trades</div>
                <div className="text-lg font-bold hud-value">{strategy.tradesExecuted}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Win Rate</div>
                <div className="text-lg font-bold hud-value">{strategy.winRate}%</div>
                <Progress value={strategy.winRate} className="h-1" />
              </div>

              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Avg Size</div>
                <div className="text-lg font-bold hud-value">${strategy.avgTradeSize}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Status</div>
                <div className="flex items-center gap-2">
                  {strategy.status === 'active' ? (
                    <>
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <span className="text-sm font-bold text-primary uppercase">Running</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-muted rounded-full" />
                      <span className="text-sm font-bold text-muted-foreground uppercase">Paused</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {strategy.status === 'active' && (
              <div className="pt-3 border-t border-primary/30">
                <div className="flex items-center gap-2 text-xs">
                  <div className="status-indicator animate-pulse-glow" style={{ width: '4px', height: '4px' }} />
                  <span className="text-muted-foreground uppercase tracking-wide">
                    Monitoring market conditions • Next evaluation in 2m 34s
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {strategies.length === 0 && (
        <div className="cyber-card p-12 text-center">
          <Lightning size={48} weight="duotone" className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold uppercase tracking-wider text-foreground mb-2">
            No Active Strategies
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first trading strategy to start automated trading
          </p>
          <Button className="jagged-corner-small">
            Create Strategy
          </Button>
        </div>
      )}
    </div>
  )
}
