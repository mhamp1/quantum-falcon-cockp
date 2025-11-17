import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChartLine, TrendUp, Coins, ArrowUp, ArrowDown } from '@phosphor-icons/react';
import { useLiveAnalytics } from '@/hooks/useLiveAnalytics';

export default function Analytics() {
  const { totalPnL, totalTrades, winRate, avgTrade, tradeHistory } = useLiveAnalytics();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b-2 border-primary/30">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-wider text-primary">
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
            ◆ Performance Insights
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-card/50 border-2 border-accent/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase text-muted-foreground">Total P&L</p>
            <TrendUp size={24} weight="duotone" className="text-accent/20" />
          </div>
          <p className="text-3xl font-bold text-accent">+${(totalPnL || 0).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {(totalPnL || 0) > 0 ? '+' : ''}{(((totalPnL || 0) / 36000) * 100).toFixed(1)}% this month
          </p>
        </Card>

        <Card className="p-6 bg-card/50 border-2 border-primary/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase text-muted-foreground">Win Rate</p>
            <ChartLine size={24} weight="duotone" className="text-primary/20" />
          </div>
          <p className="text-3xl font-bold text-primary">{(winRate || 0).toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-1">{totalTrades || 0} total trades</p>
        </Card>

        <Card className="p-6 bg-card/50 border-2 border-primary/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase text-muted-foreground">Avg Trade</p>
            <Coins size={24} weight="duotone" className="text-primary/20" />
          </div>
          <p className="text-3xl font-bold text-primary">${(avgTrade || 0).toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-1">Per trade profit</p>
        </Card>
      </div>

      <Card className="p-6 bg-card/50 border-2 border-primary/30 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold uppercase tracking-wider text-primary">
            Performance Chart
          </h2>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-primary text-primary">
              1D
            </Button>
            <Button size="sm" variant="outline" className="border-primary text-primary">
              1W
            </Button>
            <Button size="sm" variant="outline" className="border-primary text-primary">
              1M
            </Button>
            <Button size="sm" variant="outline" className="border-primary text-primary">
              ALL
            </Button>
          </div>
        </div>

        <div className="h-64 flex items-center justify-center border-2 border-primary/20 bg-muted/10">
          <p className="text-muted-foreground">Chart visualization placeholder</p>
        </div>
      </Card>

      <Card className="p-6 bg-card/50 border-2 border-primary/30">
        <h2 className="text-xl font-bold uppercase tracking-wider text-primary mb-4">
          Recent Trades
        </h2>

        <div className="space-y-2">
          {(tradeHistory || []).slice(0, 10).map((trade, idx) => (
            <div
              key={trade.id}
              className="flex items-center justify-between p-4 bg-muted/20 border border-primary/20"
            >
              <div className="flex items-center gap-4">
                <Badge
                  className={`${
                    trade.side === 'buy'
                      ? 'bg-accent/20 text-accent border-accent'
                      : 'bg-destructive/20 text-destructive border-destructive'
                  } border uppercase`}
                >
                  {trade.side}
                </Badge>
                <span className="font-bold">{trade.symbol}/USDC</span>
                <span className="text-muted-foreground">${trade.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`font-bold ${
                    trade.pnl >= 0 ? 'text-accent' : 'text-destructive'
                  }`}
                >
                  {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                </span>
                <Badge className="bg-primary/20 text-primary border-primary border uppercase text-xs">
                  {trade.status}
                </Badge>
              </div>
            </div>
          ))}
          {(!tradeHistory || tradeHistory.length === 0) && (
            <div className="p-8 text-center text-muted-foreground">
              <p>No trades yet. Trade history will appear here.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
