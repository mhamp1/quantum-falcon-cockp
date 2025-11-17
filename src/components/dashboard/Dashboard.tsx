import { useState } from "react";
import {
  Coins,
  Lightning,
  Robot,
  Target,
  ChartLine,
  Brain,
  ChatCircleDots,
} from "@phosphor-icons/react";
import { useKV } from "@github/spark/hooks";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface PortfolioData {
  solanaBalance: number;
  btcBalance: number;
  totalValue: number;
  change24h: number;
  activeAgents: number;
}

export default function Dashboard() {
  const [portfolio, setPortfolio] = useKV<PortfolioData>("portfolio", {
    solanaBalance: 42.5,
    btcBalance: 0.0125,
    totalValue: 3245.67,
    change24h: 5.23,
    activeAgents: 3,
  });

  const [showAssistant, setShowAssistant] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatCrypto = (value: number, decimals: number = 4) => {
    return value.toFixed(decimals);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-[0.15em] neon-glow mb-2">
            Mission Control
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">
            Real-time trading intelligence dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-secondary rounded-full animate-pulse neon-glow" />
          <span className="text-sm font-bold tracking-wider text-secondary uppercase">
            All Systems Operational
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-morph-card p-8 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 bg-primary/10 border-2 border-primary jagged-corner-small">
              <Coins size={32} className="text-primary neon-glow-primary" />
            </div>
            <div className={`text-sm font-bold px-3 py-1 border-2 ${(portfolio?.change24h ?? 0) >= 0 ? 'text-secondary border-secondary' : 'text-destructive border-destructive'}`}>
              {(portfolio?.change24h ?? 0) >= 0 ? '+' : ''}{(portfolio?.change24h ?? 0).toFixed(2)}%
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Total Portfolio</div>
            <div className="text-3xl font-bold neon-glow">{formatCurrency(portfolio?.totalValue ?? 0)}</div>
          </div>
        </div>

        <div className="glass-morph-card p-8 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 bg-secondary/10 border-2 border-secondary jagged-corner-small">
              <Lightning size={32} className="text-secondary neon-glow" />
            </div>
            <div className="text-sm font-bold text-primary px-3 py-1 border-2 border-primary">SOL</div>
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Solana Balance</div>
            <div className="text-3xl font-bold neon-glow">{formatCrypto(portfolio?.solanaBalance ?? 0)} SOL</div>
          </div>
        </div>

        <div className="glass-morph-card p-8 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 bg-accent/10 border-2 border-accent jagged-corner-small">
              <Coins size={32} className="text-accent neon-glow-accent" />
            </div>
            <div className="text-sm font-bold text-primary px-3 py-1 border-2 border-primary">BTC</div>
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Bitcoin Vault</div>
            <div className="text-3xl font-bold neon-glow">{formatCrypto(portfolio?.btcBalance ?? 0, 6)} BTC</div>
          </div>
        </div>

        <div className="glass-morph-card p-8 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 bg-primary/10 border-2 border-primary jagged-corner-small">
              <Robot size={32} className="text-primary neon-glow-primary" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse neon-glow" />
              <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">ACTIVE</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold">AI Agents</div>
            <div className="text-3xl font-bold neon-glow">{portfolio?.activeAgents ?? 0}/3 Online</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-morph-card p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-primary/10 border-2 border-primary jagged-corner-small">
                <ChartLine size={32} className="text-primary neon-glow-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-wider neon-glow">
                  Performance Overview
                </h2>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">24-hour trading metrics</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="p-6 bg-muted/20 border-2 border-primary/30 angled-corner-tl hover:border-primary/60 transition-all">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">Total Trades</div>
                <div className="text-4xl font-bold neon-glow technical-readout">47</div>
              </div>
              <div className="p-6 bg-muted/20 border-2 border-secondary/30 angled-corner-tr hover:border-secondary/60 transition-all">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">Win Rate</div>
                <div className="text-4xl font-bold text-secondary neon-glow technical-readout">68%</div>
              </div>
              <div className="p-6 bg-muted/20 border-2 border-accent/30 angled-corner-br hover:border-accent/60 transition-all">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3 font-semibold">Profit</div>
                <div className="text-4xl font-bold text-accent neon-glow-accent technical-readout">+$127</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-morph-card p-8 scan-line-effect">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-secondary/10 border-2 border-secondary jagged-corner-small">
                <Brain size={32} className="text-secondary neon-glow" />
              </div>
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wider neon-glow">
                  Agent Status
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-5 border-2 border-primary/30 bg-primary/5 angled-corner-tl hover:border-primary/60 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold uppercase tracking-wider">Market Analysis</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse neon-glow" />
                    <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">ACTIVE</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-2">Scanning market conditions</div>
                <div className="h-2 bg-muted relative overflow-hidden">
                  <div className="h-full bg-secondary neon-glow" style={{ width: '87%' }} />
                </div>
              </div>

              <div className="p-5 border-2 border-primary/30 bg-primary/5 angled-corner-tr hover:border-primary/60 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold uppercase tracking-wider">Strategy Execution</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse neon-glow" />
                    <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">ACTIVE</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-2">Executing DCA orders</div>
                <div className="h-2 bg-muted relative overflow-hidden">
                  <div className="h-full bg-secondary neon-glow" style={{ width: '72%' }} />
                </div>
              </div>

              <div className="p-5 border-2 border-primary/30 bg-primary/5 angled-corner-br hover:border-primary/60 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold uppercase tracking-wider">RL Optimizer</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse neon-glow" />
                    <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">ACTIVE</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-2">Optimizing parameters</div>
                <div className="h-2 bg-muted relative overflow-hidden">
                  <div className="h-full bg-secondary neon-glow" style={{ width: '94%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-morph-card p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-accent/10 border-2 border-accent jagged-corner-small">
                <Target size={32} className="text-accent neon-glow-accent" />
              </div>
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wider neon-glow-accent">
                  Quick Stats
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 hover:bg-muted/20 transition-all border-l-2 border-primary/30">
                <span className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Active Positions</span>
                <span className="text-lg font-bold neon-glow">12</span>
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-muted/20 transition-all border-l-2 border-primary/30">
                <span className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Pending Orders</span>
                <span className="text-lg font-bold neon-glow">5</span>
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-muted/20 transition-all border-l-2 border-primary/30">
                <span className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Best Trade</span>
                <span className="text-lg font-bold text-secondary neon-glow">+$47.23</span>
              </div>
              <div className="flex items-center justify-between p-3 hover:bg-muted/20 transition-all border-l-2 border-primary/30">
                <span className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Avg. Hold Time</span>
                <span className="text-lg font-bold neon-glow">4.2h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAssistant && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-8 w-96 glass-morph-card p-6 z-50 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 border-2 border-primary jagged-corner-small">
                  <Robot size={24} className="text-primary neon-glow-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold uppercase tracking-wider neon-glow">AI Assistant</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Ask me anything</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAssistant(false)}
                className="border-2 border-primary hover:bg-primary/10"
              >
                <span className="text-primary">×</span>
              </Button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-muted/20 border-l-2 border-primary">
                <p className="text-sm text-foreground">
                  👋 Hello! I'm your AI trading assistant. I can help you with:
                </p>
                <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    Market analysis and insights
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    Trading strategy suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    Agent configuration tips
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    Performance optimization
                  </li>
                </ul>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your question..."
                  className="flex-1 px-4 py-3 bg-muted border-2 border-primary/30 focus:border-primary text-sm uppercase tracking-wide outline-none transition-all"
                />
                <Button className="px-6 border-2 border-primary bg-primary/10 hover:bg-primary/20 text-primary neon-glow-primary uppercase tracking-wider font-bold">
                  Send
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setShowAssistant(!showAssistant)}
        className="fixed bottom-8 right-8 p-5 bg-primary border-3 border-primary jagged-corner-small neon-glow-primary shadow-2xl z-40 hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChatCircleDots size={32} weight="fill" className="text-background" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full animate-pulse neon-glow" />
      </motion.button>
    </div>
  );
}
