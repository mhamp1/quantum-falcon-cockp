import { useState, useEffect } from "react";
import {
  Play,
  ChartLine,
  EnvelopeSimple,
  Users,
  TrendUp,
  TrendDown,
  Lightning,
  Crosshair,
  CircleNotch,
} from "@phosphor-icons/react";
import { useKV } from "@github/spark/hooks";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";

interface PortfolioData {
  totalValue: number;
  todayPnL: number;
  activeAgents: number;
  winRate: number;
}

interface Trade {
  id: string;
  timestamp: number;
  pnl: number;
  symbol: string;
}

export default function Dashboard() {
  const [username] = useKV<string>("username", "OPERATOR");
  const [portfolio, setPortfolio] = useKV<PortfolioData>("portfolio-metrics", {
    totalValue: 12847.32,
    todayPnL: 342.58,
    activeAgents: 3,
    winRate: 68.4,
  });

  const [recentTrades, setRecentTrades] = useKV<Trade[]>("recent-trades", [
    { id: "1", timestamp: Date.now() - 300000, pnl: 342.58, symbol: "SOL/USDT" },
    { id: "2", timestamp: Date.now() - 600000, pnl: -100.00, symbol: "BTC/USDT" },
    { id: "3", timestamp: Date.now() - 900000, pnl: 50.00, symbol: "ETH/USDT" },
    { id: "4", timestamp: Date.now() - 1200000, pnl: 10.00, symbol: "SOL/USDT" },
  ]);

  const [tradingMode, setTradingMode] = useKV<"PAPER" | "LIVE">("trading-mode", "PAPER");
  const [strategyCode, setStrategyCode] = useKV<string>("strategy-logic", 
    `// Trading Strategy Logic\nif (RSI < 30 && MA_50 > MA_200) {\n  buySignal();\n} else if (RSI > 70) {\n  sellSignal();\n}`
  );

  const [agentProgress] = useState({
    marketAnalysis: 100,
    positionEval: 100,
    strategyOpt: 100,
    riskMgmt: 100,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolio((prev) => {
        if (!prev) {
          return {
            totalValue: 12847.32,
            todayPnL: 342.58,
            activeAgents: 3,
            winRate: 68.4,
          };
        }
        return {
          ...prev,
          totalValue: prev.totalValue + (Math.random() - 0.5) * 10,
          todayPnL: prev.todayPnL + (Math.random() - 0.5) * 2,
        };
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [setPortfolio]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatTime = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="space-y-6">
      <div className="glass-morph-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 opacity-50" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-[0.15em] neon-glow mb-2">
              WELCOME BACK, {username}
            </h1>
            <div className="flex items-center gap-4 mt-3">
              <div className="px-4 py-2 border-2 border-primary bg-primary/10 jagged-corner-small">
                <span className="text-sm font-bold uppercase tracking-wider text-primary">
                  {tradingMode} MODE
                </span>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Paper mode simulates a live environment with no risk.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="border-2 border-destructive text-destructive hover:bg-destructive/10 jagged-corner-small uppercase tracking-wider font-bold"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-morph-card p-6 relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-transparent animate-shimmer" />
          <div className="relative z-10">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3">
              Total Portfolio
            </div>
            <div className="text-4xl font-bold neon-glow technical-readout mb-2">
              {formatCurrency(portfolio?.totalValue ?? 0)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <TrendUp size={16} className="text-secondary" />
              <span className="text-sm font-bold text-secondary">+2.74%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-morph-card p-6 relative overflow-hidden group cursor-pointer"
        >
          <div className={`absolute inset-0 ${(portfolio?.todayPnL ?? 0) >= 0 ? 'bg-secondary/5' : 'bg-destructive/5'} opacity-0 group-hover:opacity-100 transition-opacity`} />
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${(portfolio?.todayPnL ?? 0) >= 0 ? 'from-secondary' : 'from-destructive'} via-accent to-transparent animate-shimmer`} />
          <div className="relative z-10">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3">
              Today's P&L
            </div>
            <div className={`text-4xl font-bold technical-readout mb-2 ${(portfolio?.todayPnL ?? 0) >= 0 ? 'text-secondary neon-glow' : 'text-destructive neon-glow-destructive'}`}>
              {(portfolio?.todayPnL ?? 0) >= 0 ? '+' : ''}{formatCurrency(portfolio?.todayPnL ?? 0)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              {(portfolio?.todayPnL ?? 0) >= 0 ? (
                <TrendUp size={16} className="text-secondary" />
              ) : (
                <TrendDown size={16} className="text-destructive" />
              )}
              <span className={`text-sm font-bold ${(portfolio?.todayPnL ?? 0) >= 0 ? 'text-secondary' : 'text-destructive'}`}>
                {(portfolio?.todayPnL ?? 0) >= 0 ? '+' : ''}{(((portfolio?.todayPnL ?? 0) / (portfolio?.totalValue ?? 1)) * 100).toFixed(2)}%
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-morph-card p-6 relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-primary to-transparent animate-shimmer" />
          <div className="relative z-10">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3">
              Active Agents
            </div>
            <div className="text-4xl font-bold neon-glow technical-readout mb-2">
              {portfolio?.activeAgents ?? 0}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse neon-glow" />
              <span className="text-sm font-bold text-secondary uppercase tracking-wider">ONLINE</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-morph-card p-6 relative overflow-hidden group cursor-pointer"
        >
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-transparent animate-shimmer" />
          <div className="relative z-10">
            <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-3">
              Win Rate
            </div>
            <div className="text-4xl font-bold text-secondary neon-glow technical-readout mb-2">
              {portfolio?.winRate?.toFixed(1) ?? '0.0'}%
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Crosshair size={16} className="text-primary" />
              <span className="text-sm font-bold text-primary">47 TRADES</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <Button className="w-full h-24 border-2 border-primary bg-primary/10 hover:bg-primary/20 text-primary jagged-corner-small neon-glow-primary group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <div className="flex items-center gap-3 relative z-10">
            <Play size={24} weight="fill" />
            <span className="text-lg font-bold uppercase tracking-wider">START BOT</span>
          </div>
        </Button>

        <Button className="w-full h-24 border-2 border-secondary bg-secondary/10 hover:bg-secondary/20 text-secondary jagged-corner-small neon-glow group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <div className="flex items-center gap-3 relative z-10">
            <ChartLine size={24} weight="fill" />
            <span className="text-lg font-bold uppercase tracking-wider">VIEW ANALYTICS</span>
          </div>
        </Button>

        <Button className="w-full h-24 border-2 border-accent bg-accent/10 hover:bg-accent/20 text-accent jagged-corner-small neon-glow-accent group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <div className="flex items-center gap-3 relative z-10">
            <EnvelopeSimple size={24} weight="fill" />
            <span className="text-lg font-bold uppercase tracking-wider">CHECK EMAIL</span>
          </div>
        </Button>

        <Button className="w-full h-24 border-2 border-primary bg-primary/10 hover:bg-primary/20 text-primary jagged-corner-small neon-glow-primary group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <div className="flex items-center gap-3 relative z-10">
            <Users size={24} weight="fill" />
            <span className="text-lg font-bold uppercase tracking-wider">COMMUNITY</span>
          </div>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-morph-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-secondary/10 border-2 border-secondary jagged-corner-small">
              <Lightning size={24} className="text-secondary neon-glow" />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider neon-glow">AI Agent Status</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Real-time processing</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: "Market Analysis", progress: agentProgress.marketAnalysis },
              { label: "Position Evaluation", progress: agentProgress.positionEval },
              { label: "Strategy Optimization", progress: agentProgress.strategyOpt },
              { label: "Risk Management", progress: agentProgress.riskMgmt },
            ].map((agent, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    {agent.label}
                  </span>
                  <span className="text-sm font-bold text-secondary">{agent.progress}%</span>
                </div>
                <div className="h-3 bg-muted relative overflow-hidden rounded-full border border-primary/30">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${agent.progress}%` }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="h-full bg-gradient-to-r from-primary via-secondary to-accent neon-glow rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/30 to-transparent animate-shimmer" />
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-morph-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-accent/10 border-2 border-accent jagged-corner-small">
              <CircleNotch size={24} className="text-accent neon-glow-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold uppercase tracking-wider neon-glow-accent">Recent Activity</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Live trade feed</p>
            </div>
          </div>

          <div className="space-y-3 max-h-[240px] overflow-y-auto scrollbar-thin">
            {(recentTrades ?? []).map((trade) => (
              <motion.div
                key={trade.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 border-l-4 ${trade.pnl >= 0 ? 'border-secondary bg-secondary/5' : 'border-destructive bg-destructive/5'} jagged-corner-small hover:bg-muted/10 transition-all cursor-pointer`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold uppercase tracking-wider">
                      Position closed: {trade.symbol}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{formatTime(trade.timestamp)}</div>
                  </div>
                  <div className={`text-lg font-bold ${trade.pnl >= 0 ? 'text-secondary neon-glow' : 'text-destructive neon-glow-destructive'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-morph-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 border-2 border-primary jagged-corner-small">
            <ChartLine size={24} className="text-primary neon-glow-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider neon-glow-primary">SET LOGIC STRATEGY</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Configure trading rules</p>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 technical-grid opacity-20 pointer-events-none" />
          <Textarea
            value={strategyCode}
            onChange={(e) => setStrategyCode(e.target.value)}
            className="min-h-[150px] font-mono text-sm bg-muted/20 border-2 border-primary/30 focus:border-primary text-secondary jagged-corner-small resize-none"
            placeholder="Enter your trading strategy logic..."
          />
        </div>

        <div className="flex justify-end mt-4">
          <Button className="border-2 border-primary bg-primary/10 hover:bg-primary/20 text-primary jagged-corner-small neon-glow-primary uppercase tracking-wider font-bold px-8">
            SAVE STRATEGY
          </Button>
        </div>
      </div>
    </div>
  );
}
