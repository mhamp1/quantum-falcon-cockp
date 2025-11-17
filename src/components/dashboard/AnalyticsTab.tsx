import {
  TrendUp,
  TrendDown,
  CurrencyCircleDollar,
  ChartBar,
  Triangle,
  Lightning,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

type TimeFilter = "24H" | "30D" | "ALL";

interface AssetPerformance {
  symbol: string;
  trades: number;
  pl: number;
  winRate: number;
  fillPercent: number;
}

export default function AnalyticsTab() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("24H");

  const assets: AssetPerformance[] = [
    { symbol: "SOL", trades: 3, pl: 661.5, winRate: 77, fillPercent: 100 },
    { symbol: "BTC", trades: 64, pl: 423.2, winRate: 65, fillPercent: 50 },
    { symbol: "BONK", trades: 21, pl: 234.8, winRate: 52, fillPercent: 30 },
    { symbol: "RAY", trades: 14, pl: -91.6, winRate: 46, fillPercent: 10 },
  ];

  return (
    <div className="relative min-h-full">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(20, 241, 149, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(20, 241, 149, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            filter: "blur(1px)",
          }}
        />
      </div>

      <div className="relative z-10 space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-5xl font-bold uppercase tracking-[0.15em] text-primary neon-glow-primary">
              ADVANCED ANALYTICS
            </h1>
            <div className="w-3/5 h-px bg-primary/50" />
          </div>
          <div className="flex items-center gap-2">
            {(["24H", "30D", "ALL"] as TimeFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded transition-all ${
                  timeFilter === filter
                    ? "bg-primary text-black"
                    : "bg-black/50 border border-primary/30 text-primary hover:border-primary"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="cyber-card p-6 space-y-3"
            style={{
              clipPath:
                "polygon(20px 0, 100% 0, 100% 100%, 0 100%, 0 20px)",
            }}
          >
            <div className="flex items-center gap-3">
              <CurrencyCircleDollar size={24} className="text-primary" />
              <span className="text-sm text-muted-foreground uppercase tracking-wide">
                Total Profit
              </span>
            </div>
            <div className="text-4xl font-bold text-accent">+$184.85</div>
            <div className="flex items-center gap-2 text-xs text-accent">
              <TrendUp size={12} />
              <span>+18.2%</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="cyber-card p-6 space-y-3 border-secondary"
            style={{
              clipPath:
                "polygon(20px 0, 100% 0, 100% 100%, 0 100%, 0 20px)",
            }}
          >
            <div className="flex items-center gap-3">
              <ChartBar size={24} className="text-secondary" />
              <span className="text-sm text-muted-foreground uppercase tracking-wide">
                Win Rate
              </span>
            </div>
            <div className="text-4xl font-bold text-primary">70.1%</div>
            <Progress value={70.1} className="h-1" />
            <div className="text-xs text-muted-foreground">W/L RATIO 2.3</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="cyber-card p-6 space-y-3 border-[#FF00FF]"
            style={{
              clipPath:
                "polygon(20px 0, 100% 0, 100% 100%, 0 100%, 0 20px)",
            }}
          >
            <div className="flex items-center gap-3">
              <Lightning size={24} className="text-[#FF00FF]" />
              <span className="text-sm text-muted-foreground uppercase tracking-wide">
                Total Trades
              </span>
            </div>
            <div className="text-4xl font-bold">121</div>
            <div className="text-xs text-muted-foreground">Executed Trades</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="cyber-card p-6 space-y-3"
            style={{
              clipPath:
                "polygon(20px 0, 100% 0, 100% 100%, 0 100%, 0 20px)",
            }}
          >
            <div className="flex items-center gap-3">
              <Triangle size={24} className="text-primary" />
              <span className="text-sm text-muted-foreground uppercase tracking-wide">
                Sharpe Ratio
              </span>
            </div>
            <div className="text-4xl font-bold text-primary">2.34</div>
            <div className="text-xs text-muted-foreground">
              Risk-Adjusted Return
            </div>
            <div className="text-xs text-primary">Excellent Above 2.0</div>
          </motion.div>
        </div>

        {/* Main Panels Row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Trade Distribution Panel */}
          <div className="cyber-card p-6 space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold uppercase tracking-wide text-primary">
                TRADE DISTRIBUTION
              </h2>
              <ChartBar size={16} className="text-primary" />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary uppercase tracking-wide">
                    Win Trades
                  </span>
                  <span className="font-bold">89</span>
                </div>
                <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: "68%" }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-destructive uppercase tracking-wide">
                    Loss Trades
                  </span>
                  <span className="font-bold">38</span>
                </div>
                <div className="h-3 bg-black/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-destructive"
                    style={{ width: "32%" }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/20">
              <div className="text-center">
                <div className="text-sm text-muted-foreground uppercase mb-2">
                  Avg Win
                </div>
                <div className="text-2xl font-bold text-accent">+$45.20</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground uppercase mb-2">
                  Avg Loss
                </div>
                <div className="text-2xl font-bold text-destructive">
                  -$24.40
                </div>
              </div>
            </div>
          </div>

          {/* Asset Performance Panel */}
          <div className="cyber-card p-6 space-y-6 border-[#FF00FF]">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold uppercase tracking-wide text-[#FF00FF]">
                ASSET PERFORMANCE
              </h2>
              <CurrencyCircleDollar size={16} className="text-secondary" />
            </div>

            <div className="space-y-4">
              {assets.map((asset, idx) => (
                <div
                  key={asset.symbol}
                  className="p-4 bg-black/30 border border-primary/20 rounded space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold">{asset.symbol}</span>
                      <span className="text-xs text-muted-foreground">
                        ({asset.trades} trades)
                      </span>
                    </div>
                    <div
                      className={`text-2xl font-bold ${
                        asset.pl >= 0 ? "text-accent" : "text-destructive"
                      }`}
                    >
                      {asset.pl >= 0 ? "+" : ""}${Math.abs(asset.pl).toFixed(2)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-1 bg-black/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          asset.pl >= 0 ? "bg-primary" : "bg-destructive"
                        }`}
                        style={{ width: `${asset.fillPercent}%` }}
                      />
                    </div>
                    <div className="text-xs text-primary text-right">
                      {asset.winRate}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Extremes Panel */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold uppercase tracking-wide text-primary text-center">
            PERFORMANCE EXTREMES
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="cyber-card p-8 text-center space-y-4 border-accent">
              <TrendUp size={24} className="text-accent mx-auto" />
              <div className="text-sm text-muted-foreground uppercase tracking-wide">
                Best Trade
              </div>
              <div className="text-5xl font-bold text-accent">+$342.50</div>
              <div className="text-xs text-muted-foreground">
                Your highest single trade profit
              </div>
            </div>

            <div className="cyber-card p-8 text-center space-y-4 border-destructive">
              <TrendDown size={24} className="text-destructive mx-auto" />
              <div className="text-sm text-muted-foreground uppercase tracking-wide">
                Worst Trade
              </div>
              <div className="text-5xl font-bold text-destructive">-$81.90</div>
              <div className="text-xs text-muted-foreground">
                Your largest single trade loss
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
