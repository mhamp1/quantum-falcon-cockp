import { useKV } from '@github/spark/hooks'
import { TrendUp, TrendDown, Coins, Lightning, ArrowsClockwise } from '@phosphor-icons/react'
import { useEffect } from 'react'

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
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-[0.2em] uppercase hud-text">
          <span className="text-primary neon-glow">MISSION CONTROL</span>
        </h2>
        <button className="p-2 jagged-corner-small border-2 border-primary bg-primary/10 hover:bg-primary/30 hover:neon-glow transition-all">
          <ArrowsClockwise size={20} weight="duotone" className="text-primary" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="holographic-card group hover:scale-[1.02] transition-transform duration-300">
          <div className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="text-xs font-bold text-primary uppercase tracking-[0.15em] hud-text">
                TOTAL PORTFOLIO
              </div>
              <div className="p-2 jagged-corner-small bg-primary/30 border border-primary">
                <Coins size={20} weight="duotone" className="text-primary" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-primary neon-glow hud-value">
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
                <span className="text-xs text-muted-foreground uppercase tracking-wide">24H</span>
              </div>
            </div>
          </div>
        </div>

        <div className="holographic-card group hover:scale-[1.02] transition-transform duration-300">
          <div className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="text-xs font-bold text-primary uppercase tracking-[0.15em] hud-text">
                SOLANA BALANCE
              </div>
              <div className="p-2 jagged-corner-small bg-secondary/30 border border-secondary">
                <Lightning size={20} weight="duotone" className="text-secondary" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-secondary neon-glow-secondary hud-value">
                {portfolio.solanaBalance.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide">SOL</div>
            </div>
          </div>
        </div>

        <div className="holographic-card group hover:scale-[1.02] transition-transform duration-300">
          <div className="p-6 relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="text-xs font-bold text-primary uppercase tracking-[0.15em] hud-text">
                BTC VAULT
              </div>
              <div className="p-2 jagged-corner-small bg-secondary/30 border border-secondary">
                <Coins size={20} weight="duotone" className="text-secondary" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="text-4xl font-bold text-secondary neon-glow-secondary hud-value">
                {portfolio.btcBalance.toFixed(6)}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide">BTC</div>
            </div>
          </div>
        </div>
      </div>

      <div className="holographic-card scan-line-effect">
        <div className="p-6 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-bold uppercase tracking-[0.15em] text-primary hud-text">ACTIVE AGENTS</h3>
            <div className="px-3 py-1 jagged-corner-small bg-secondary/30 border border-secondary">
              <span className="text-sm font-bold text-secondary uppercase tracking-wide">{portfolio.activeAgents} ONLINE</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 jagged-corner bg-muted/50 border-2 border-primary/50 hover:border-primary transition-all group/agent">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold uppercase tracking-wide text-foreground">MARKET ANALYST</span>
                <div className="w-3 h-3 rounded-full bg-secondary neon-glow-secondary animate-pulse-glow" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">SCANNING 247 TOKENS</p>
            </div>
            <div className="p-4 jagged-corner bg-muted/50 border-2 border-primary/50 hover:border-primary transition-all group/agent">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold uppercase tracking-wide text-foreground">STRATEGY ENGINE</span>
                <div className="w-3 h-3 rounded-full bg-secondary neon-glow-secondary animate-pulse-glow" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">3 ACTIVE TRADES</p>
            </div>
            <div className="p-4 jagged-corner bg-muted/50 border-2 border-primary/50 hover:border-primary transition-all group/agent">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold uppercase tracking-wide text-foreground">RL OPTIMIZER</span>
                <div className="w-3 h-3 rounded-full bg-secondary neon-glow-secondary animate-pulse-glow" />
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">LEARNING CYCLE 47</p>
            </div>
          </div>
        </div>
      </div>

      <div className="holographic-card">
        <div className="p-6 relative z-10">
          <h3 className="text-xl font-bold uppercase tracking-[0.15em] text-primary hud-text mb-6">RECENT ACTIVITY</h3>
          <div className="space-y-3">
            {[
              { action: 'DCA BUY', token: 'SOL', amount: '2.5 SOL', time: '2M AGO', profit: null },
              { action: 'PROFIT CONVERSION', token: 'BTC', amount: '0.00012 BTC', time: '15M AGO', profit: '+$8.42' },
              { action: 'SNIPE SUCCESS', token: 'BONK', amount: '1M BONK', time: '1H AGO', profit: '+12.3%' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-4 jagged-corner bg-muted/30 border border-primary/30 hover:border-primary/60 transition-all group/activity">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 jagged-corner-small bg-primary/20 border border-primary flex items-center justify-center">
                    <Lightning size={18} weight="duotone" className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{activity.amount}</p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.profit && (
                    <p className="text-sm font-bold text-secondary neon-glow-secondary hud-value">{activity.profit}</p>
                  )}
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}