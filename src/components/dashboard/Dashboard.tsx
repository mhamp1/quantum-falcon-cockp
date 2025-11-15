import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendUp, TrendDown, Coins, Lightning, ArrowsClockwise } from '@phosphor-icons/react'
import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'

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
        <h2 className="text-3xl font-bold tracking-wider uppercase">
          Mission Control
        </h2>
        <button className="p-2 rounded-lg hover:bg-primary/20 transition-colors">
          <ArrowsClockwise size={20} weight="duotone" className="text-primary" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="backdrop-blur-md bg-card/50 border-primary/30 relative overflow-hidden group hover:border-primary/50 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Total Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-primary">
                  ${portfolio.totalValue.toFixed(2)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {isPositive ? (
                    <TrendUp size={16} weight="bold" className="text-accent" />
                  ) : (
                    <TrendDown size={16} weight="bold" className="text-destructive" />
                  )}
                  <span className={`text-sm font-semibold ${isPositive ? 'text-accent' : 'text-destructive'}`}>
                    {isPositive ? '+' : ''}{portfolio.change24h.toFixed(2)}%
                  </span>
                  <span className="text-xs text-muted-foreground">24h</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-primary/20 border border-primary/30">
                <Coins size={24} weight="duotone" className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-card/50 border-accent/30 relative overflow-hidden group hover:border-accent/50 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Solana Balance
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-accent">
                  {portfolio.solanaBalance.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">SOL</p>
              </div>
              <div className="p-3 rounded-full bg-accent/20 border border-accent/30">
                <Lightning size={24} weight="duotone" className="text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-card/50 border-secondary/30 relative overflow-hidden group hover:border-secondary/50 transition-all">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="relative">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              BTC Vault
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-secondary">
                  {portfolio.btcBalance.toFixed(6)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">BTC</p>
              </div>
              <div className="p-3 rounded-full bg-secondary/20 border border-secondary/30">
                <Coins size={24} weight="duotone" className="text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="backdrop-blur-md bg-card/50 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Active Agents
            <Badge variant="outline" className="bg-accent/20 border-accent/30 text-accent">
              {portfolio.activeAgents} Online
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Market Analyst</span>
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
              </div>
              <p className="text-xs text-muted-foreground">Scanning 247 tokens</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Strategy Engine</span>
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
              </div>
              <p className="text-xs text-muted-foreground">3 active trades</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">RL Optimizer</span>
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
              </div>
              <p className="text-xs text-muted-foreground">Learning cycle 47</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-md bg-card/50 border-primary/30">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: 'DCA Buy', token: 'SOL', amount: '2.5 SOL', time: '2m ago', profit: null },
              { action: 'Profit Conversion', token: 'BTC', amount: '0.00012 BTC', time: '15m ago', profit: '+$8.42' },
              { action: 'Snipe Success', token: 'BONK', amount: '1M BONK', time: '1h ago', profit: '+12.3%' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <Lightning size={16} weight="duotone" className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.amount}</p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.profit && (
                    <p className="text-sm font-semibold text-accent">{activity.profit}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}