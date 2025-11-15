import { useKV } from '@github/spark/hooks'
import { TrendUp, TrendDown, Coins, Lightning, ArrowsClockwise, ChartLine, Target } from '@phosphor-icons/react'
import { useEffect } from 'react'
import Wireframe3D from '@/components/shared/Wireframe3D'

interface PortfolioData {
  solanaBalance: number
  btcBalance: number
  totalValue: number
  change24h: number
  activeAgents: number
}

export default function Dashboard() {
  const [portfolio, setPortfolio] = useKV<PortfolioData>('portfolio-data', {
    solanaBalance: 125.47,
    btcBalance: 0.00234,
    totalValue: 8943.21,
    change24h: 5.72,
    activeAgents: 3
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolio((current) => {
        if (!current) return {
          solanaBalance: 125.47,
          btcBalance: 0.00234,
          totalValue: 8943.21,
          change24h: 5.72,
          activeAgents: 3
        }
        return {
          ...current,
          solanaBalance: current.solanaBalance + (Math.random() - 0.5) * 0.1,
          change24h: current.change24h + (Math.random() - 0.5) * 0.5,
          totalValue: current.totalValue + (Math.random() - 0.5) * 10
        }
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [setPortfolio])

  if (!portfolio) return null

  const isPositive = portfolio.change24h >= 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-[0.25em] uppercase hud-text">
            <span className="text-secondary neon-glow-secondary">06_1.DREAM2K.4</span>
          </h2>
          <div className="hidden md:flex items-center gap-2">
            <div className="status-indicator" />
            <span className="hud-readout">ONLINE</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block hud-readout">
            {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <button className="p-2 jagged-corner-small border-2 border-secondary bg-secondary/10 hover:bg-secondary/30 hover:neon-glow-accent transition-all relative group">
            <ArrowsClockwise size={18} weight="duotone" className="text-secondary" />
            <div className="hud-corner-tl" />
            <div className="hud-corner-br" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="holographic-card group hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-20">
            <Wireframe3D type="dome" size={128} color="secondary" animated={false} />
          </div>
          <div className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <div className="hud-readout">TOTAL_PORTFOLIO</div>
                <div className="metric-bar w-24" />
              </div>
              <div className="p-2 jagged-corner-small bg-secondary/30 border-2 border-secondary relative">
                <Coins size={20} weight="duotone" className="text-secondary" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="technical-readout text-4xl md:text-5xl">
                ${portfolio.totalValue.toFixed(2)}
              </div>
              <div className="flex items-center gap-2">
                {isPositive ? (
                  <TrendUp size={18} weight="bold" className="text-secondary" />
                ) : (
                  <TrendDown size={18} weight="bold" className="text-destructive" />
                )}
                <span className={`text-lg font-bold hud-value ${isPositive ? 'text-secondary neon-glow-secondary' : 'text-destructive neon-glow-destructive'}`}>
                  {isPositive ? '+' : ''}{portfolio.change24h.toFixed(2)}%
                </span>
                <span className="data-label">24H_CHG</span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary/30">
            <div className="h-full bg-secondary" style={{ width: `${Math.abs(portfolio.change24h) * 10}%` }} />
          </div>
        </div>

        <div className="holographic-card group hover:scale-[1.02] transition-transform duration-300 relative">
          <div className="absolute -right-4 -top-4 diagonal-stripes w-32 h-32 pointer-events-none" />
          <div className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <div className="hud-readout">SOLANA_BAL</div>
                <div className="metric-bar w-24" />
              </div>
              <div className="p-2 jagged-corner-small bg-primary/30 border-2 border-primary relative">
                <Lightning size={20} weight="duotone" className="text-primary" />
                <div className="hud-corner-tl" />
                <div className="hud-corner-br" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="technical-readout text-4xl md:text-5xl">
                {portfolio.solanaBalance.toFixed(2)}
              </div>
              <div className="flex items-center justify-between">
                <span className="data-label">SOL</span>
                <div className="hexagon flex items-center justify-center">
                  <ChartLine size={16} weight="bold" className="text-secondary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="holographic-card group hover:scale-[1.02] transition-transform duration-300 relative">
          <div className="absolute bottom-0 left-0 right-0 technical-grid h-24 pointer-events-none" />
          <div className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <div className="hud-readout">BTC_VAULT</div>
                <div className="metric-bar w-24" />
              </div>
              <div className="p-2 jagged-corner-small bg-secondary/30 border-2 border-secondary relative">
                <Target size={20} weight="duotone" className="text-secondary" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="technical-readout text-3xl md:text-4xl">
                {portfolio.btcBalance.toFixed(6)}
              </div>
              <div className="data-label">BTC</div>
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <div className="crosshair opacity-20" style={{ width: '40px', height: '40px' }} />
          </div>
        </div>
      </div>

      <div className="holographic-card scan-line-effect relative">
        <div className="absolute inset-0 technical-grid pointer-events-none" />
        <div className="p-6 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout">AGENT_STATUS</h3>
            <div className="px-3 py-1 jagged-corner-small bg-secondary/30 border-2 border-secondary wireframe-border">
              <span className="text-sm font-bold text-secondary uppercase tracking-[0.15em]">{portfolio.activeAgents}_ONLINE</span>
            </div>
            <div className="flex-1" />
            <div className="hidden lg:block">
              <Wireframe3D type="sphere" size={60} color="secondary" animated={true} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 jagged-corner bg-muted/50 border-2 border-secondary/50 hover:border-secondary transition-all group/agent relative">
              <div className="hud-corner-tl" />
              <div className="hud-corner-br" />
              <div className="flex items-center justify-between mb-3">
                <span className="hud-readout text-xs">A1_MARKET</span>
                <div className="status-indicator bg-secondary" />
              </div>
              <p className="data-label">SCANNING_247_TOKENS</p>
              <div className="mt-3 flex gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="flex-1 h-8 bg-secondary/20" style={{ height: `${Math.random() * 32}px` }} />
                ))}
              </div>
            </div>
            <div className="p-4 jagged-corner bg-muted/50 border-2 border-secondary/50 hover:border-secondary transition-all group/agent relative">
              <div className="hud-corner-tl" />
              <div className="hud-corner-br" />
              <div className="flex items-center justify-between mb-3">
                <span className="hud-readout text-xs">A2_STRATEGY</span>
                <div className="status-indicator bg-secondary" />
              </div>
              <p className="data-label">3_ACTIVE_TRADES</p>
              <div className="mt-3">
                <div className="space-y-1">
                  <div className="h-1 bg-secondary/30 relative overflow-hidden">
                    <div className="h-full bg-secondary animate-pulse" style={{ width: '75%' }} />
                  </div>
                  <div className="h-1 bg-secondary/30 relative overflow-hidden">
                    <div className="h-full bg-secondary animate-pulse" style={{ width: '45%', animationDelay: '0.5s' }} />
                  </div>
                  <div className="h-1 bg-secondary/30 relative overflow-hidden">
                    <div className="h-full bg-secondary animate-pulse" style={{ width: '90%', animationDelay: '1s' }} />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 jagged-corner bg-muted/50 border-2 border-secondary/50 hover:border-secondary transition-all group/agent relative">
              <div className="hud-corner-tl" />
              <div className="hud-corner-br" />
              <div className="flex items-center justify-between mb-3">
                <span className="hud-readout text-xs">A3_RL_OPT</span>
                <div className="status-indicator bg-secondary" />
              </div>
              <p className="data-label">LEARNING_CYCLE_47</p>
              <div className="mt-3 relative h-8">
                <svg width="100%" height="100%" className="absolute inset-0">
                  <polyline
                    points={Array.from({ length: 20 }).map((_, i) => `${i * 5}%,${50 - Math.sin(i / 2) * 20}`).join(' ')}
                    fill="none"
                    stroke="var(--secondary)"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="holographic-card relative">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <Wireframe3D type="grid" size={256} color="primary" animated={false} />
        </div>
        <div className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout">RECENT_ACTIVITY</h3>
            <div className="hidden md:flex gap-2">
              <div className="w-2 h-2 bg-secondary" />
              <div className="w-2 h-2 bg-secondary" />
              <div className="w-2 h-2 bg-secondary/30" />
            </div>
          </div>
          <div className="space-y-3">
            {[
              { action: 'DCA_BUY', token: 'SOL', amount: '2.5_SOL', time: '00:02:00', profit: null, type: 'buy' },
              { action: 'PROFIT_CVT', token: 'BTC', amount: '0.00012_BTC', time: '00:15:00', profit: '+$8.42', type: 'profit' },
              { action: 'SNIPE_OK', token: 'BONK', amount: '1M_BONK', time: '01:00:00', profit: '+12.3%', type: 'snipe' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-4 jagged-corner bg-muted/30 border-2 border-primary/30 hover:border-secondary/60 transition-all group/activity relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 jagged-corner-small bg-secondary/20 border-2 border-secondary flex items-center justify-center relative">
                    <Lightning size={18} weight="duotone" className="text-secondary" />
                  </div>
                  <div>
                    <p className="hud-readout text-xs">{activity.action}</p>
                    <p className="data-label text-xs mt-1">{activity.amount}</p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.profit && (
                    <p className="text-sm font-bold text-secondary hud-value mb-1">{activity.profit}</p>
                  )}
                  <p className="data-label text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-4 right-4 opacity-30">
          <div className="crosshair" style={{ width: '60px', height: '60px' }} />
        </div>
      </div>
    </div>
  )
}