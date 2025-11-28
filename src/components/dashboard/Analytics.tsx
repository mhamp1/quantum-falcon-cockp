// Analytics Dashboard — REAL DATA ONLY
// November 28, 2025 — Quantum Falcon Cockpit
// ALL MOCK DATA REMOVED — Uses real trade history

import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { useState, useMemo } from 'react'
import { ChartLine, TrendUp, TrendDown, Target, Lightning, Coins, ArrowsClockwise } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useTaxReserve } from '@/lib/tax/TaxReserveEngine'

interface Trade {
  id: string
  timestamp: number
  symbol: string
  side: 'buy' | 'sell'
  amount: number
  price: number
  pnl?: number
  pnlPercent?: number
  strategy?: string
}

interface PerformanceSummary {
  totalPnL: number
  totalPnLPercent: number
  bestTrade: { amount: number; symbol: string }
  worstTrade: { amount: number; symbol: string }
  avgTrade: number
  sharpeRatio: number
  totalTrades: number
  winRate: number
}

interface AssetWinRate {
  symbol: string
  winRate: number
  trades: number
  avgReturn: number
}

interface StrategyPerformance {
  name: string
  trades: number
  winRate: number
  avgReturn: number
  totalPnL: number
}

export default function Analytics() {
  const [trades] = useKV<Trade[]>('trade-history', [])
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('month')
  const { getTaxSummary } = useTaxReserve()
  const taxSummary = getTaxSummary()

  // Calculate REAL performance from actual trade history
  const performance: PerformanceSummary = useMemo(() => {
    if (!trades || trades.length === 0) {
      return {
        totalPnL: 0,
        totalPnLPercent: 0,
        bestTrade: { amount: 0, symbol: 'N/A' },
        worstTrade: { amount: 0, symbol: 'N/A' },
        avgTrade: 0,
        sharpeRatio: 0,
        totalTrades: 0,
        winRate: 0
      }
    }

    const now = Date.now()
    const timeframeMs = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    }[timeframe]

    const filteredTrades = trades.filter(t => (now - t.timestamp) <= timeframeMs)
    const tradesWithPnL = filteredTrades.filter(t => t.pnl !== undefined)

    const totalPnL = tradesWithPnL.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const wins = tradesWithPnL.filter(t => (t.pnl || 0) > 0)
    const losses = tradesWithPnL.filter(t => (t.pnl || 0) < 0)

    const bestTrade = tradesWithPnL.length > 0
      ? tradesWithPnL.reduce((best, t) => (t.pnl || 0) > (best.pnl || 0) ? t : best, tradesWithPnL[0])
      : { pnl: 0, symbol: 'N/A' }

    const worstTrade = tradesWithPnL.length > 0
      ? tradesWithPnL.reduce((worst, t) => (t.pnl || 0) < (worst.pnl || 0) ? t : worst, tradesWithPnL[0])
      : { pnl: 0, symbol: 'N/A' }

    const avgTrade = tradesWithPnL.length > 0 ? totalPnL / tradesWithPnL.length : 0
    const winRate = tradesWithPnL.length > 0 ? (wins.length / tradesWithPnL.length) * 100 : 0

    // Calculate Sharpe ratio (simplified)
    const returns = tradesWithPnL.map(t => t.pnlPercent || 0)
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0
    const variance = returns.length > 0
      ? returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
      : 0
    const stdDev = Math.sqrt(variance)
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0

    // Calculate total investment for percentage
    const totalInvested = filteredTrades.reduce((sum, t) => sum + (t.amount * t.price), 0)
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

    return {
      totalPnL,
      totalPnLPercent,
      bestTrade: { amount: bestTrade.pnl || 0, symbol: bestTrade.symbol || 'N/A' },
      worstTrade: { amount: worstTrade.pnl || 0, symbol: worstTrade.symbol || 'N/A' },
      avgTrade,
      sharpeRatio,
      totalTrades: filteredTrades.length,
      winRate
    }
  }, [trades, timeframe])

  // Calculate REAL asset win rates
  const assetWinRates: AssetWinRate[] = useMemo(() => {
    if (!trades || trades.length === 0) return []

    const assetMap = new Map<string, { wins: number; losses: number; totalReturn: number }>()

    trades.forEach(trade => {
      if (!trade.symbol || trade.pnl === undefined) return

      const existing = assetMap.get(trade.symbol) || { wins: 0, losses: 0, totalReturn: 0 }
      if (trade.pnl > 0) existing.wins++
      else if (trade.pnl < 0) existing.losses++
      existing.totalReturn += trade.pnlPercent || 0
      assetMap.set(trade.symbol, existing)
    })

    return Array.from(assetMap.entries()).map(([symbol, data]) => {
      const total = data.wins + data.losses
      return {
        symbol,
        winRate: total > 0 ? (data.wins / total) * 100 : 0,
        trades: total,
        avgReturn: total > 0 ? data.totalReturn / total : 0
      }
    }).sort((a, b) => b.trades - a.trades).slice(0, 5)
  }, [trades])

  // Calculate REAL strategy performance
  const strategies: StrategyPerformance[] = useMemo(() => {
    if (!trades || trades.length === 0) return []

    const strategyMap = new Map<string, { trades: number; wins: number; totalReturn: number; totalPnL: number }>()

    trades.forEach(trade => {
      const strategyName = trade.strategy || 'Manual'
      if (trade.pnl === undefined) return

      const existing = strategyMap.get(strategyName) || { trades: 0, wins: 0, totalReturn: 0, totalPnL: 0 }
      existing.trades++
      if (trade.pnl > 0) existing.wins++
      existing.totalReturn += trade.pnlPercent || 0
      existing.totalPnL += trade.pnl
      strategyMap.set(strategyName, existing)
    })

    return Array.from(strategyMap.entries()).map(([name, data]) => ({
      name,
      trades: data.trades,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
      avgReturn: data.trades > 0 ? data.totalReturn / data.trades : 0,
      totalPnL: data.totalPnL
    })).sort((a, b) => b.totalPnL - a.totalPnL)
  }, [trades])

  // Calculate REAL portfolio composition (from current positions)
  const [positions] = useKV<{ asset: string; value: number }[]>('current-positions', [])
  const portfolioComposition = useMemo(() => {
    if (!positions || positions.length === 0) {
      return [{ asset: 'No positions', percent: 100, color: 'var(--muted)' }]
    }

    const totalValue = positions.reduce((sum, p) => sum + p.value, 0)
    const colors = ['var(--primary)', 'var(--accent)', 'var(--secondary)', 'var(--destructive)']

    return positions.map((pos, i) => ({
      asset: pos.asset,
      percent: totalValue > 0 ? (pos.value / totalValue) * 100 : 0,
      color: colors[i % colors.length]
    })).sort((a, b) => b.percent - a.percent).slice(0, 4)
  }, [positions])

  // Use REAL tax data
  const grossPnL = performance.totalPnL
  const taxRate = 0.25
  const taxReserve = taxSummary.totalReserved
  const netPnL = grossPnL - taxReserve

  // Get recent trades (REAL data)
  const recentTrades = useMemo(() => {
    if (!trades || trades.length === 0) return []

    return trades
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5)
      .map(t => ({
        date: new Date(t.timestamp).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }),
        symbol: t.symbol,
        side: t.side,
        amount: t.amount,
        price: t.price,
        pnl: t.pnl || 0,
        pnlPercent: t.pnlPercent || 0
      }))
  }, [trades])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-[0.25em] uppercase">
          <span className="text-primary neon-glow-primary">ANALYTICS</span>
        </h2>
        <button className="p-2 bg-card border border-primary/30 hover:bg-primary/10 hover:border-primary transition-all relative group">
          <ArrowsClockwise size={18} weight="duotone" className="text-primary" />
          <div className="hud-corner-tl" />
          <div className="hud-corner-br" />
        </button>
      </div>

      {/* No data state */}
      {(!trades || trades.length === 0) && (
        <div className="cyber-card p-12 text-center">
          <ChartLine size={48} className="mx-auto mb-4 text-muted-foreground opacity-50" weight="duotone" />
          <h3 className="text-lg font-bold uppercase tracking-wider text-muted-foreground mb-2">
            No Trading Data Yet
          </h3>
          <p className="text-sm text-muted-foreground">
            Execute trades to see your analytics here
          </p>
        </div>
      )}

      {trades && trades.length > 0 && (
        <>
          <div className="cyber-card">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <ChartLine size={24} weight="duotone" className="text-primary" />
                <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout">PERFORMANCE_SUMMARY</h3>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <div className="data-label">TOTAL_PNL</div>
                  <div className={`text-2xl font-bold ${performance.totalPnL >= 0 ? 'text-primary neon-glow-primary' : 'text-destructive'}`}>
                    {performance.totalPnL >= 0 ? '+' : ''}${performance.totalPnL.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {performance.totalPnLPercent >= 0 ? (
                      <TrendUp size={14} weight="bold" className="text-primary" />
                    ) : (
                      <TrendDown size={14} weight="bold" className="text-destructive" />
                    )}
                    <span className={performance.totalPnLPercent >= 0 ? 'text-primary' : 'text-destructive'}>
                      {performance.totalPnLPercent >= 0 ? '+' : ''}{performance.totalPnLPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="data-label">BEST_TRADE</div>
                  <div className="text-2xl font-bold text-primary">
                    ${performance.bestTrade.amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    {performance.bestTrade.symbol}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="data-label">WORST_TRADE</div>
                  <div className="text-2xl font-bold text-destructive">
                    ${performance.worstTrade.amount.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    {performance.worstTrade.symbol}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="data-label">AVG_TRADE</div>
                  <div className={`text-2xl font-bold ${performance.avgTrade >= 0 ? 'text-accent' : 'text-destructive'}`}>
                    ${performance.avgTrade.toFixed(2)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="data-label">WIN_RATE</div>
                  <div className="text-2xl font-bold text-primary">
                    {performance.winRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {performance.totalTrades} trades
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="data-label">SHARPE</div>
                  <div className="text-2xl font-bold text-accent">
                    {performance.sharpeRatio.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cyber-card">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout">PNL_OVER_TIME</h3>
                <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as any)}>
                  <TabsList className="bg-muted/30">
                    <TabsTrigger value="day" className="data-label">DAILY</TabsTrigger>
                    <TabsTrigger value="week" className="data-label">WEEKLY</TabsTrigger>
                    <TabsTrigger value="month" className="data-label">MONTHLY</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="h-64 bg-background/80 border border-primary/20 relative flex items-end justify-around p-4 gap-2">
                {/* Real chart bars based on trade data */}
                {trades.slice(-12).map((trade, i) => {
                  const maxPnL = Math.max(...trades.map(t => Math.abs(t.pnl || 0)), 1)
                  const height = trade.pnl ? (Math.abs(trade.pnl) / maxPnL) * 70 + 10 : 10
                  const isPositive = (trade.pnl || 0) >= 0
                  return (
                    <div key={trade.id || i} className="flex-1 flex flex-col justify-end items-center gap-2">
                      <div 
                        className={`w-full ${isPositive ? 'bg-primary' : 'bg-destructive'} transition-all hover:opacity-80 relative`}
                        style={{ height: `${height}%` }}
                      >
                        <div className={`absolute inset-0 ${isPositive ? 'bg-primary' : 'bg-destructive'} opacity-20`} />
                      </div>
                      <span className="text-[9px] text-muted-foreground font-mono">
                        {new Date(trade.timestamp).getDate()}
                      </span>
                    </div>
                  )
                })}
                {trades.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    No trades yet
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary" />
                    <span className="data-label">PROFIT: ${Math.max(0, grossPnL).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-destructive" />
                    <span className="data-label">TAX: -${taxReserve.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="cyber-card">
              <div className="p-6">
                <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout mb-6">WIN_RATE_BY_ASSET</h3>
                <div className="space-y-4">
                  {assetWinRates.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No asset data yet</p>
                  ) : (
                    assetWinRates.map((asset) => (
                      <div key={asset.symbol} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="hud-readout text-sm">{asset.symbol}</span>
                          <div className="flex items-center gap-4">
                            <span className="data-label">{asset.trades} trades</span>
                            <span className={`text-sm font-bold ${asset.winRate >= 60 ? 'text-primary' : 'text-destructive'}`}>
                              {asset.winRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-muted/30 relative overflow-hidden">
                          <div 
                            className={`h-full ${asset.winRate >= 60 ? 'bg-primary' : 'bg-destructive'} transition-all`}
                            style={{ width: `${asset.winRate}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="cyber-card">
              <div className="p-6">
                <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout mb-6">STRATEGY_PERFORMANCE</h3>
                <div className="space-y-4">
                  {strategies.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No strategy data yet</p>
                  ) : (
                    strategies.map((strategy) => (
                      <div key={strategy.name} className="p-4 bg-muted/30 border-l-2 border-primary hover:bg-muted/50 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="hud-readout text-sm">{strategy.name}</span>
                          <span className={`font-bold ${strategy.totalPnL >= 0 ? 'text-primary' : 'text-destructive'}`}>
                            ${strategy.totalPnL.toFixed(2)}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <div className="data-label">TRADES</div>
                            <div className="text-foreground font-bold">{strategy.trades}</div>
                          </div>
                          <div>
                            <div className="data-label">WIN_RATE</div>
                            <div className="text-primary font-bold">{strategy.winRate.toFixed(1)}%</div>
                          </div>
                          <div>
                            <div className="data-label">AVG_RETURN</div>
                            <div className={`font-bold ${strategy.avgReturn >= 0 ? 'text-accent' : 'text-destructive'}`}>
                              {strategy.avgReturn >= 0 ? '+' : ''}{strategy.avgReturn.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="cyber-card">
              <div className="p-6">
                <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout mb-6">PORTFOLIO_BREAKDOWN</h3>
                <div className="flex items-center justify-center py-8">
                  <div className="relative w-48 h-48">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      {portfolioComposition.reduce((acc, item, i, arr) => {
                        const prevPercent = arr.slice(0, i).reduce((sum, prev) => sum + prev.percent, 0)
                        const strokeDasharray = `${item.percent} ${100 - item.percent}`
                        const strokeDashoffset = -prevPercent
                        
                        return [...acc, (
                          <circle
                            key={item.asset}
                            cx="50"
                            cy="50"
                            r="15.9"
                            fill="none"
                            stroke={item.color}
                            strokeWidth="12"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            opacity="0.8"
                          />
                        )]
                      }, [] as React.ReactElement[])}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">100%</div>
                        <div className="data-label">ALLOCATED</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {portfolioComposition.map((item) => (
                    <div key={item.asset} className="flex items-center gap-2">
                      <div className="w-3 h-3" style={{ backgroundColor: item.color }} />
                      <span className="data-label">{item.asset}: {item.percent.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="cyber-card">
              <div className="p-6">
                <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout mb-6">TAX_OBLIGATIONS</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <div className="data-label">GROSS_PNL</div>
                      <div className={`text-xl font-bold ${grossPnL >= 0 ? 'text-primary' : 'text-destructive'}`}>
                        ${grossPnL.toFixed(2)}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="data-label">TAX_RESERVE</div>
                      <div className="text-xl font-bold text-destructive">-${taxReserve.toFixed(2)}</div>
                    </div>
                    <div className="space-y-2">
                      <div className="data-label">NET_AFTER_TAX</div>
                      <div className={`text-xl font-bold ${netPnL >= 0 ? 'text-accent' : 'text-destructive'}`}>
                        ${netPnL.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="data-label">TAX RATE: 25%</span>
                      <span className="text-primary font-bold">{taxRate * 100}%</span>
                    </div>
                    <div className="h-4 bg-muted/30 relative overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary via-accent to-destructive" style={{ width: '75%' }} />
                      <div className="absolute right-0 top-0 h-full bg-destructive/50 border-l-2 border-destructive" style={{ width: '25%' }} />
                    </div>
                  </div>

                  <div className="p-4 bg-destructive/10 border border-destructive/30">
                    <p className="text-xs text-muted-foreground">
                      Tax reserve is automatically calculated and set aside from profits. Consult a tax professional for accurate obligations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cyber-card">
            <div className="p-6">
              <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout mb-6">RECENT_TRADES</h3>
              <div className="space-y-3">
                {recentTrades.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No trades yet</p>
                ) : (
                  recentTrades.map((trade, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-muted/30 border-l-2 border-primary hover:bg-muted/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="hud-readout text-xs">{trade.date}</div>
                        </div>
                        <div className={`px-3 py-1 ${trade.side === 'buy' ? 'bg-primary/20 border border-primary/40' : 'bg-destructive/20 border border-destructive/40'}`}>
                          <span className={`text-xs font-bold uppercase tracking-wider ${trade.side === 'buy' ? 'text-primary' : 'text-destructive'}`}>
                            {trade.side}
                          </span>
                        </div>
                        <div>
                          <div className="hud-readout text-sm">{trade.symbol}</div>
                          <div className="data-label text-xs">{trade.amount} @ ${trade.price.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${trade.pnl > 0 ? 'text-primary' : 'text-destructive'}`}>
                          {trade.pnl > 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                        </div>
                        <div className={`text-xs ${trade.pnlPercent > 0 ? 'text-primary' : 'text-destructive'}`}>
                          {trade.pnlPercent > 0 ? '+' : ''}{trade.pnlPercent.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
