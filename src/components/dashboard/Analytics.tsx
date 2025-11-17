import { useState, useEffect } from "react";
import {
  ChartLine,
  TrendUp,
  TrendDown,
  Target,
  Lightning,
  Coins,
  ArrowsClockwise,
} from "@phosphor-icons/react";

import { useKV } from "@/hooks/useKVFallback";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Trade {
  id: string;
  timestamp: number;
  symbol: string;
  side: "buy" | "sell";
  amount: number;
  price: number;
  pnl?: number;
  pnlPercent?: number;
  strategy?: string;
}

interface PerformanceSummary {
  totalPnL: number;
  totalPnLPercent: number;
  bestTrade: { amount: number; symbol: string };
  worstTrade: { amount: number; symbol: string };
  avgTrade: number;
  sharpeRatio: number;
  totalTrades: number;
  winRate: number;
}

interface AssetWinRate {
  symbol: string;
  winRate: number;
  trades: number;
  avgReturn: number;
}

interface StrategyPerformance {
  name: string;
  trades: number;
  winRate: number;
  avgReturn: number;
  totalPnL: number;
}

export default function Analytics() {
  const [trades] = useKV<Trade[]>("trade-history", []);
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("month");

  const performance: PerformanceSummary = {
    totalPnL: 2450.32,
    totalPnLPercent: 24.5,
    bestTrade: { amount: 420.5, symbol: "BTC" },
    worstTrade: { amount: -85.2, symbol: "ETH" },
    avgTrade: 12.5,
    sharpeRatio: 1.85,
    totalTrades: 234,
    winRate: 68.5,
  };

  const assetWinRates: AssetWinRate[] = [
    { symbol: "BTC", winRate: 72, trades: 85, avgReturn: 2.3 },
    { symbol: "ETH", winRate: 65, trades: 67, avgReturn: 1.8 },
    { symbol: "SOL", winRate: 85, trades: 45, avgReturn: 4.2 },
    { symbol: "DOGE", winRate: 45, trades: 37, avgReturn: -0.5 },
  ];

  const strategies: StrategyPerformance[] = [
    {
      name: "Momentum",
      trades: 45,
      winRate: 68,
      avgReturn: 2.3,
      totalPnL: 850.4,
    },
    {
      name: "Mean Reversion",
      trades: 32,
      winRate: 71,
      avgReturn: 1.8,
      totalPnL: 620.3,
    },
    { name: "DCA", trades: 120, winRate: 65, avgReturn: 0.9, totalPnL: 980.5 },
  ];

  const portfolioComposition = [
    { asset: "BTC", percent: 45, color: "var(--primary)" },
    { asset: "ETH", percent: 30, color: "var(--accent)" },
    { asset: "SOL", percent: 15, color: "var(--secondary)" },
    { asset: "Cash", percent: 10, color: "var(--muted)" },
  ];

  const grossPnL = 2450.32;
  const taxRate = 0.25;
  const taxReserve = grossPnL * taxRate;
  const netPnL = grossPnL - taxReserve;

  const recentTrades = [
    {
      date: "11/15",
      symbol: "BTC",
      side: "buy" as const,
      amount: 0.01,
      price: 42000,
      pnl: 124,
      pnlPercent: 2.95,
    },
    {
      date: "11/15",
      symbol: "ETH",
      side: "sell" as const,
      amount: 0.5,
      price: 2200,
      pnl: -42,
      pnlPercent: -1.9,
    },
    {
      date: "11/14",
      symbol: "SOL",
      side: "buy" as const,
      amount: 10,
      price: 48.5,
      pnl: 85,
      pnlPercent: 17.5,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-[0.25em] uppercase">
          <span className="text-primary neon-glow-primary">ANALYTICS</span>
        </h2>
        <button className="p-2 bg-card border border-primary/30 hover:bg-primary/10 hover:border-primary transition-all relative group">
          <ArrowsClockwise
            size={18}
            weight="duotone"
            className="text-primary"
          />
          <div className="hud-corner-tl" />
          <div className="hud-corner-br" />
        </button>
      </div>

      <div className="cyber-card">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <ChartLine size={24} weight="duotone" className="text-primary" />
            <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout">
              PERFORMANCE_SUMMARY
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <div className="data-label">TOTAL_PNL</div>
              <div className="text-2xl font-bold text-primary neon-glow-primary">
                ${performance.totalPnL.toFixed(2)}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendUp size={14} weight="bold" className="text-primary" />
                <span className="text-primary">
                  +{performance.totalPnLPercent}%
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
              <div className="text-2xl font-bold text-accent">
                ${performance.avgTrade.toFixed(2)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="data-label">WIN_RATE</div>
              <div className="text-2xl font-bold text-primary">
                {performance.winRate}%
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
            <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout">
              PNL_OVER_TIME
            </h3>
            <Tabs
              value={timeframe}
              onValueChange={(v) => setTimeframe(v as any)}
            >
              <TabsList className="bg-muted/30">
                <TabsTrigger value="day" className="data-label">
                  DAILY
                </TabsTrigger>
                <TabsTrigger value="week" className="data-label">
                  WEEKLY
                </TabsTrigger>
                <TabsTrigger value="month" className="data-label">
                  MONTHLY
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="h-64 bg-background/80 border border-primary/20 relative flex items-end justify-around p-4 gap-2">
            {Array.from({ length: 12 }).map((_, i) => {
              const height = 30 + Math.random() * 70;
              const isPositive = Math.random() > 0.3;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col justify-end items-center gap-2"
                >
                  <div
                    className={`w-full ${isPositive ? "bg-primary" : "bg-destructive"} transition-all hover:opacity-80 relative`}
                    style={{ height: `${height}%` }}
                  >
                    <div
                      className={`absolute inset-0 ${isPositive ? "bg-primary" : "bg-destructive"} opacity-20`}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground font-mono">
                    {i + 1}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary" />
                <span className="data-label">
                  BEFORE_TAX: ${grossPnL.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-destructive" />
                <span className="data-label">
                  TAX: -${taxReserve.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="cyber-card">
          <div className="p-6">
            <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout mb-6">
              WIN_RATE_BY_ASSET
            </h3>
            <div className="space-y-4">
              {assetWinRates.map((asset) => (
                <div key={asset.symbol} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="hud-readout text-sm">{asset.symbol}</span>
                    <div className="flex items-center gap-4">
                      <span className="data-label">{asset.trades} trades</span>
                      <span
                        className={`text-sm font-bold ${asset.winRate >= 60 ? "text-primary" : "text-destructive"}`}
                      >
                        {asset.winRate}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted/30 relative overflow-hidden">
                    <div
                      className={`h-full ${asset.winRate >= 60 ? "bg-primary" : "bg-destructive"} transition-all`}
                      style={{ width: `${asset.winRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="cyber-card">
          <div className="p-6">
            <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout mb-6">
              STRATEGY_PERFORMANCE
            </h3>
            <div className="space-y-4">
              {strategies.map((strategy) => (
                <div
                  key={strategy.name}
                  className="p-4 bg-muted/30 border-l-2 border-primary hover:bg-muted/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="hud-readout text-sm">{strategy.name}</span>
                    <span className="text-primary font-bold">
                      ${strategy.totalPnL.toFixed(2)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="data-label">TRADES</div>
                      <div className="text-foreground font-bold">
                        {strategy.trades}
                      </div>
                    </div>
                    <div>
                      <div className="data-label">WIN_RATE</div>
                      <div className="text-primary font-bold">
                        {strategy.winRate}%
                      </div>
                    </div>
                    <div>
                      <div className="data-label">AVG_RETURN</div>
                      <div className="text-accent font-bold">
                        +{strategy.avgReturn}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="cyber-card">
          <div className="p-6">
            <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout mb-6">
              PORTFOLIO_BREAKDOWN
            </h3>
            <div className="flex items-center justify-center py-8">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {portfolioComposition.reduce((acc, item, i, arr) => {
                    const prevPercent = arr
                      .slice(0, i)
                      .reduce((sum, prev) => sum + prev.percent, 0);
                    const strokeDasharray = `${item.percent} ${100 - item.percent}`;
                    const strokeDashoffset = -prevPercent;

                    return [
                      ...acc,
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
                      />,
                    ];
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
                  <div
                    className="w-3 h-3"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="data-label">
                    {item.asset}: {item.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="cyber-card">
          <div className="p-6">
            <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout mb-6">
              TAX_OBLIGATIONS
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="data-label">GROSS_PNL</div>
                  <div className="text-xl font-bold text-primary">
                    ${grossPnL.toFixed(2)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="data-label">TAX_RESERVE</div>
                  <div className="text-xl font-bold text-destructive">
                    -${taxReserve.toFixed(2)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="data-label">NET_AFTER_TAX</div>
                  <div className="text-xl font-bold text-accent">
                    ${netPnL.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="data-label">TAX RATE: 25%</span>
                  <span className="text-primary font-bold">
                    {taxRate * 100}%
                  </span>
                </div>
                <div className="h-4 bg-muted/30 relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary via-accent to-destructive"
                    style={{ width: "75%" }}
                  />
                  <div
                    className="absolute right-0 top-0 h-full bg-destructive/50 border-l-2 border-destructive"
                    style={{ width: "25%" }}
                  />
                </div>
              </div>

              <div className="p-4 bg-destructive/10 border border-destructive/30">
                <p className="text-xs text-muted-foreground">
                  Tax reserve is automatically calculated and set aside from
                  profits. Consult a tax professional for accurate obligations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cyber-card">
        <div className="p-6">
          <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout mb-6">
            RECENT_TRADES
          </h3>
          <div className="space-y-3">
            {recentTrades.map((trade, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-muted/30 border-l-2 border-primary hover:bg-muted/50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="hud-readout text-xs">{trade.date}</div>
                  </div>
                  <div
                    className={`px-3 py-1 ${trade.side === "buy" ? "bg-primary/20 border border-primary/40" : "bg-destructive/20 border border-destructive/40"}`}
                  >
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${trade.side === "buy" ? "text-primary" : "text-destructive"}`}
                    >
                      {trade.side}
                    </span>
                  </div>
                  <div>
                    <div className="hud-readout text-sm">{trade.symbol}</div>
                    <div className="data-label text-xs">
                      {trade.amount} @ ${trade.price.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-lg font-bold ${trade.pnl && trade.pnl > 0 ? "text-primary" : "text-destructive"}`}
                  >
                    {trade.pnl && trade.pnl > 0 ? "+" : ""}$
                    {trade.pnl?.toFixed(2)}
                  </div>
                  <div
                    className={`text-xs ${trade.pnlPercent && trade.pnlPercent > 0 ? "text-primary" : "text-destructive"}`}
                  >
                    {trade.pnlPercent && trade.pnlPercent > 0 ? "+" : ""}
                    {trade.pnlPercent}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
