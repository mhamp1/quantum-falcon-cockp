import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendUp, 
  TrendDown, 
  ChartLine,
  Target,
  Coins,
  Lightning,
  ArrowsClockwise,
  CheckCircle,
  Cube,
  Hexagon,
  Pentagon,
  Polygon
} from '@phosphor-icons/react'

interface AnalyticsData {
  totalPnL: number
  totalPnLPercent: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  avgWinSize: number
  avgLossSize: number
  bestTrade: number
  worstTrade: number
  sharpeRatio: number
}

interface AssetPerformance {
  symbol: string
  trades: number
  pnl: number
  pnlPercent: number
  winRate: number
}

export default function EnhancedAnalytics() {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('7d')
  const [analytics, setAnalytics] = useKV<AnalyticsData>('analytics-data', {
    totalPnL: 1247.85,
    totalPnLPercent: 15.3,
    totalTrades: 127,
    winningTrades: 89,
    losingTrades: 38,
    avgWinSize: 45.2,
    avgLossSize: -23.4,
    bestTrade: 342.5,
    worstTrade: -87.3,
    sharpeRatio: 2.34
  })

  const [assetPerformance] = useKV<AssetPerformance[]>('asset-performance', [
    { symbol: 'SOL', trades: 56, pnl: 687.5, pnlPercent: 18.2, winRate: 73 },
    { symbol: 'BTC', trades: 34, pnl: 423.2, pnlPercent: 12.8, winRate: 68 },
    { symbol: 'BONK', trades: 21, pnl: 234.8, pnlPercent: 24.5, winRate: 62 },
    { symbol: 'RAY', trades: 16, pnl: -97.6, pnlPercent: -8.3, winRate: 44 }
  ])

  if (!analytics || !assetPerformance) return null

  const winRate = (analytics.winningTrades / analytics.totalTrades) * 100

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold uppercase tracking-[0.15em] text-primary hud-text">
            Advanced Analytics
          </h2>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mt-1">
            Performance Metrics & Insights
          </p>
        </div>

        <div className="flex gap-2">
          {(['24h', '7d', '30d', 'all'] as const).map((tf) => (
            <Button
              key={tf}
              size="sm"
              variant={timeframe === tf ? 'default' : 'outline'}
              onClick={() => setTimeframe(tf)}
              className="jagged-corner-small uppercase tracking-wider"
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-morph-card angled-corner-tl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">
                Total P&L
              </span>
              <div className="p-2 border-2 angled-corner-tr bg-primary/5 border-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-primary opacity-5" />
                <Cube size={20} className="text-primary relative z-10" weight="duotone" />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-3xl font-black text-primary technical-readout">
                {analytics.totalPnL >= 0 ? '+' : ''}${analytics.totalPnL.toFixed(2)}
              </div>
              <div className={`text-sm font-bold ${
                analytics.totalPnLPercent >= 0 ? 'text-primary/70' : 'text-destructive/70'
              }`}>
                {analytics.totalPnLPercent >= 0 ? '+' : ''}{analytics.totalPnLPercent.toFixed(2)}%
              </div>
            </div>

            <div className="pt-2 border-t border-primary/20">
              <div className="flex items-center gap-2">
                <div className="status-indicator" style={{ width: '4px', height: '4px' }} />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {timeframe.toUpperCase()} Performance
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-morph-card angled-corner-tr p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-50" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">
                Win Rate
              </span>
              <div className="p-2 border-2 cut-corner-tr bg-accent/5 border-accent relative overflow-hidden">
                <div className="absolute inset-0 bg-accent opacity-5" />
                <Hexagon size={20} className="text-accent relative z-10" weight="duotone" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-black text-accent technical-readout">
                {winRate.toFixed(1)}%
              </div>
              <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-accent to-primary"
                  style={{ width: `${winRate}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-accent/20">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {analytics.winningTrades}W / {analytics.losingTrades}L
              </div>
            </div>
          </div>
        </div>

        <div className="glass-morph-card angled-corner-bl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent opacity-50" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">
                Total Trades
              </span>
              <div className="p-2 border-2 angled-corner-br bg-secondary/5 border-secondary relative overflow-hidden">
                <div className="absolute inset-0 bg-secondary opacity-5" />
                <Pentagon size={20} className="text-secondary relative z-10" weight="duotone" />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-3xl font-black text-foreground technical-readout">
                {analytics.totalTrades}
              </div>
              <div className="text-sm text-muted-foreground">
                Executed this {timeframe}
              </div>
            </div>

            <div className="pt-2 border-t border-secondary/20">
              <div className="flex items-center gap-2">
                <CheckCircle size={12} className="text-secondary" weight="fill" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  All Systems Optimal
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-morph-card angled-corner-br p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">
                Sharpe Ratio
              </span>
              <div className="p-2 border-2 cut-corner-br bg-primary/5 border-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-primary opacity-5" />
                <Polygon size={20} className="text-primary relative z-10" weight="duotone" />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-3xl font-black text-primary technical-readout">
                {analytics.sharpeRatio.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                Risk-adjusted return
              </div>
            </div>

            <div className="pt-2 border-t border-primary/20">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Excellent ({analytics.sharpeRatio > 2 ? 'Above 2.0' : 'Good'})
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="cyber-card angled-corners-dual-tr-bl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold uppercase tracking-wider text-foreground hud-text">
              Trade Distribution
            </h3>
            <Lightning size={20} className="text-primary" weight="duotone" />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground uppercase tracking-wide">Winning Trades</span>
                <span className="font-bold text-primary">{analytics.winningTrades}</span>
              </div>
              <div className="h-3 bg-muted/30 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-primary"
                  style={{ 
                    width: `${(analytics.winningTrades / analytics.totalTrades) * 100}%`,
                    boxShadow: '0 0 10px var(--primary)'
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground uppercase tracking-wide">Losing Trades</span>
                <span className="font-bold text-destructive">{analytics.losingTrades}</span>
              </div>
              <div className="h-3 bg-muted/30 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-destructive"
                  style={{ 
                    width: `${(analytics.losingTrades / analytics.totalTrades) * 100}%`,
                    boxShadow: '0 0 10px var(--destructive)'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/30">
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Avg Win</div>
              <div className="text-lg font-bold text-primary hud-value">
                +${analytics.avgWinSize.toFixed(2)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Avg Loss</div>
              <div className="text-lg font-bold text-destructive hud-value">
                ${analytics.avgLossSize.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="cyber-card angled-corners-dual-tl-br p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold uppercase tracking-wider text-foreground hud-text">
              Asset Performance
            </h3>
            <Coins size={20} className="text-accent" weight="duotone" />
          </div>

          <div className="space-y-3">
            {assetPerformance.map((asset, idx) => (
              <div key={asset.symbol} className={`bg-muted/30 p-4 space-y-2 ${idx % 2 === 0 ? 'angled-corner-tr' : 'angled-corner-br'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold uppercase tracking-wider text-foreground">
                      {asset.symbol}
                    </div>
                    <Badge variant="outline" className="text-xs cut-corner-tr">
                      {asset.trades} trades
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold hud-value ${
                      asset.pnl >= 0 ? 'text-primary' : 'text-destructive'
                    }`}>
                      {asset.pnl >= 0 ? '+' : ''}${asset.pnl.toFixed(2)}
                    </div>
                    <div className={`text-xs ${
                      asset.pnlPercent >= 0 ? 'text-primary/70' : 'text-destructive/70'
                    }`}>
                      {asset.pnlPercent >= 0 ? '+' : ''}{asset.pnlPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground uppercase tracking-wide">Win Rate</span>
                  <span className="font-bold">{asset.winRate}%</span>
                </div>
                <div className="h-1 bg-muted/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent"
                    style={{ width: `${asset.winRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cyber-card angled-corners-dual-tl-br p-6 space-y-4">
        <h3 className="text-lg font-bold uppercase tracking-wider text-foreground hud-text">
          Performance Extremes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-primary/10 border-2 border-primary/30 p-6 angled-corner-tl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <TrendUp size={24} className="text-primary" weight="fill" />
                <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Best Trade</span>
              </div>
              <div className="text-4xl font-black text-primary technical-readout">
                +${analytics.bestTrade.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">
                Your highest single trade profit
              </p>
            </div>
          </div>

          <div className="bg-destructive/10 border-2 border-destructive/30 p-6 angled-corner-br relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-destructive/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <TrendDown size={24} className="text-destructive" weight="fill" />
                <span className="text-xs uppercase tracking-[0.2em] text-destructive font-bold">Worst Trade</span>
              </div>
              <div className="text-4xl font-black text-destructive technical-readout">
                ${analytics.worstTrade.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">
                Your largest single trade loss
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
