import {
  Lightning,
  CubeTransparent,
  ChartBar,
  CurrencyCircleDollar,
  Percent,
  Lock,
  ArrowUp,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

type SubTab = "ALL" | "DCA" | "MOMENTUM" | "ADVANCED" | "SPECIAL";

interface Strategy {
  id: string;
  name: string;
  description: string;
  profit: number;
  roi: number;
  trades: number;
  winRate: number;
  tier: string;
  category: string;
}

const strategies: Strategy[] = [
  {
    id: "dca-basic",
    name: "DCA BASIC",
    description: "Dollar-Cost Averaging into SOL positions.",
    profit: -89.3,
    roi: -2.3,
    trades: 12,
    winRate: 100,
    tier: "Regular Tier",
    category: "DCA",
  },
  {
    id: "momentum-basic",
    name: "MOMENTUM BASIC",
    description: "Trend-following strategy on SOL/USDT.",
    profit: 123.45,
    roi: 3.4,
    trades: 15,
    winRate: 80,
    tier: "Pro Tier",
    category: "MOMENTUM",
  },
  {
    id: "momentum-advanced",
    name: "MOMENTUM ADVANCED",
    description: "Advanced momentum with multi-timeframe analysis.",
    profit: 234.56,
    roi: 5.6,
    trades: 20,
    winRate: 85,
    tier: "Elite Tier",
    category: "MOMENTUM",
  },
  {
    id: "dca-advanced",
    name: "DCA ADVANCED",
    description: "Enhanced DCA with volatility adjustments.",
    profit: 345.67,
    roi: 7.8,
    trades: 25,
    winRate: 90,
    tier: "Elite Tier",
    category: "DCA",
  },
  {
    id: "rl-adaptive",
    name: "RL ADAPTIVE",
    description: "Reinforcement learning adaptive strategy.",
    profit: 456.78,
    roi: 9.0,
    trades: 30,
    winRate: 95,
    tier: "Elite Tier",
    category: "ADVANCED",
  },
  {
    id: "mean-reversion",
    name: "MEAN REVERSION",
    description: "Reversion to mean on overbought/oversold conditions.",
    profit: -56.78,
    roi: -1.2,
    trades: 10,
    winRate: 70,
    tier: "Regular Tier",
    category: "ADVANCED",
  },
  {
    id: "arbitrage",
    name: "ARBITRAGE",
    description: "Cross-exchange arbitrage opportunities.",
    profit: 78.9,
    roi: 2.1,
    trades: 8,
    winRate: 100,
    tier: "Elite Tier",
    category: "SPECIAL",
  },
];

export default function TradingTab() {
  const [activeTab, setActiveTab] = useState<SubTab>("ALL");

  const filteredStrategies =
    activeTab === "ALL"
      ? strategies
      : strategies.filter((s) => s.category === activeTab);

  const activeStrategies = 2;
  const totalTrades = strategies.reduce((sum, s) => sum + s.trades, 0);
  const netProfit = strategies.reduce((sum, s) => sum + s.profit, 0);
  const avgWinRate =
    strategies.reduce((sum, s) => sum + s.winRate, 0) / strategies.length;

  const handleUpgrade = (strategyName: string) => {
    toast.success(`Upgrade ${strategyName}`, {
      description: "Premium tier upgrade initiated",
    });
  };

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
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Lightning size={24} weight="fill" className="text-[#FFFF00]" />
            <h1 className="text-5xl font-bold uppercase tracking-[0.15em] text-[#FF00FF]" style={{
              textShadow: "0 0 10px #FF00FF, 0 0 20px #FF00FF"
            }}>
              TRADING HUB
            </h1>
          </div>
          <p className="text-xs text-white uppercase tracking-wide max-w-4xl leading-relaxed">
            The Trading Hub facilitates transactions between strategies,
            providing real-time market conditions, sending market signals,
            automating market analysis, and executing RSI strategies.
          </p>
          <div className="w-full h-px bg-primary/50" style={{
            boxShadow: "0 2px 8px #14F195"
          }} />
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="cyber-card p-6 space-y-3 text-center"
            style={{
              clipPath: "polygon(20px 0, 100% 0, 100% 100%, 0 100%, 0 20px)",
            }}
          >
            <CubeTransparent size={24} className="text-primary mx-auto" />
            <div className="text-sm text-muted-foreground uppercase tracking-wide">
              Active Strategies
            </div>
            <div className="text-4xl font-bold">{activeStrategies}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="cyber-card p-6 space-y-3 text-center border-secondary"
            style={{
              clipPath: "polygon(20px 0, 100% 0, 100% 100%, 0 100%, 0 20px)",
            }}
          >
            <ChartBar size={24} className="text-secondary mx-auto" />
            <div className="text-sm text-muted-foreground uppercase tracking-wide">
              Total Trades
            </div>
            <div className="text-4xl font-bold">{totalTrades}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="cyber-card p-6 space-y-3 text-center border-accent"
            style={{
              clipPath: "polygon(20px 0, 100% 0, 100% 100%, 0 100%, 0 20px)",
            }}
          >
            <CurrencyCircleDollar size={24} className="text-accent mx-auto" />
            <div className="text-sm text-muted-foreground uppercase tracking-wide">
              Net Profit
            </div>
            <div className="text-4xl font-bold text-accent">
              {netProfit >= 0 ? "+" : ""}${netProfit.toFixed(2)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="cyber-card p-6 space-y-3 text-center border-[#FF00FF]"
            style={{
              clipPath: "polygon(20px 0, 100% 0, 100% 100%, 0 100%, 0 20px)",
            }}
          >
            <Percent size={24} className="text-[#FF00FF] mx-auto" />
            <div className="text-sm text-muted-foreground uppercase tracking-wide">
              Avg Win Rate
            </div>
            <div className="text-4xl font-bold text-[#FF00FF]">
              {avgWinRate.toFixed(1)}%
            </div>
          </motion.div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-3 p-3 bg-[#1A1A1A] border-y border-primary/30">
          {(["ALL", "DCA", "MOMENTUM", "ADVANCED", "SPECIAL"] as SubTab[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 text-sm font-bold uppercase tracking-wider rounded transition-all ${
                  activeTab === tab
                    ? "bg-primary text-black shadow-[0_2px_0_#14F195]"
                    : "bg-transparent border border-primary/30 text-primary hover:border-primary"
                }`}
              >
                {tab === "ALL" ? "ALL STRATEGIES" : tab}
              </button>
            )
          )}
        </div>

        {/* Strategies Table */}
        <div className="space-y-1">
          {filteredStrategies.map((strategy, idx) => (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 bg-[#1A1A1A] border-b border-gray-800 hover:bg-[#202020] transition-colors"
            >
              <div className="grid grid-cols-[40%_15%_15%_10%_10%_10%] gap-4 items-center">
                {/* Name & Description */}
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wide text-primary mb-1">
                    {strategy.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {strategy.description}
                  </p>
                </div>

                {/* Profit */}
                <div className="text-center">
                  <div
                    className={`text-xl font-bold ${
                      strategy.profit >= 0 ? "text-accent" : "text-destructive"
                    }`}
                  >
                    {strategy.profit >= 0 ? "+" : ""}$
                    {Math.abs(strategy.profit).toFixed(2)}
                  </div>
                </div>

                {/* ROI */}
                <div className="text-center">
                  <div
                    className={`text-xl font-bold ${
                      strategy.roi >= 0 ? "text-accent" : "text-destructive"
                    }`}
                  >
                    {strategy.roi >= 0 ? "+" : ""}
                    {strategy.roi.toFixed(1)}%
                  </div>
                </div>

                {/* Trades */}
                <div className="text-center">
                  <div className="text-xl font-bold">{strategy.trades}</div>
                </div>

                {/* Win Rate */}
                <div className="text-center">
                  <div className="text-xl font-bold text-accent">
                    {strategy.winRate}%
                  </div>
                </div>

                {/* Tier & Upgrade */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-1 bg-secondary/20 border border-secondary rounded text-xs">
                    <Lock size={12} className="text-primary" />
                    <span className="text-white font-semibold">
                      {strategy.tier}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleUpgrade(strategy.name)}
                    className="bg-secondary hover:bg-secondary/80 text-white text-xs px-3 py-1 h-6"
                  >
                    <ArrowUp size={12} className="mr-1" />
                    Upgrade
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty space for scroll indication */}
        <div className="h-32" />
      </div>
    </div>
  );
}
