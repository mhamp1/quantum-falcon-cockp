import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChartLine, TrendUp, Coins } from '@phosphor-icons/react';

export default function Analytics() {
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
          <p className="text-3xl font-bold text-accent">+$4,563.79</p>
          <p className="text-xs text-muted-foreground mt-1">+12.4% this month</p>
        </Card>

        <Card className="p-6 bg-card/50 border-2 border-primary/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase text-muted-foreground">Win Rate</p>
            <ChartLine size={24} weight="duotone" className="text-primary/20" />
          </div>
          <p className="text-3xl font-bold text-primary">68.5%</p>
          <p className="text-xs text-muted-foreground mt-1">439 total trades</p>
        </Card>

        <Card className="p-6 bg-card/50 border-2 border-primary/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase text-muted-foreground">Avg Trade</p>
            <Coins size={24} weight="duotone" className="text-primary/20" />
          </div>
          <p className="text-3xl font-bold text-primary">$10.39</p>
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
          {[
            { pair: 'SOL/USDC', type: 'BUY', price: '$98.45', pnl: '+$24.50', status: 'Completed' },
            { pair: 'BTC/USDC', type: 'SELL', price: '$43,234', pnl: '+$156.78', status: 'Completed' },
            { pair: 'ETH/USDC', type: 'BUY', price: '$2,345', pnl: '-$12.34', status: 'Completed' },
            { pair: 'SOL/USDC', type: 'BUY', price: '$97.89', pnl: '+$45.67', status: 'Completed' },
          ].map((trade, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-muted/20 border border-primary/20"
            >
              <div className="flex items-center gap-4">
                <Badge
                  className={`${
                    trade.type === 'BUY'
                      ? 'bg-accent/20 text-accent border-accent'
                      : 'bg-destructive/20 text-destructive border-destructive'
                  } border uppercase`}
                >
                  {trade.type}
                </Badge>
                <span className="font-bold">{trade.pair}</span>
                <span className="text-muted-foreground">{trade.price}</span>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`font-bold ${
                    trade.pnl.startsWith('+') ? 'text-accent' : 'text-destructive'
                  }`}
                >
                  {trade.pnl}
                </span>
                <Badge className="bg-primary/20 text-primary border-primary border uppercase text-xs">
                  {trade.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
