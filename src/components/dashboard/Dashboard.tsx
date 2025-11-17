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
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold uppercase tracking-[0.2em] neon-glow mb-3">
            Mission Control
          </h1>
          <p className="text-base text-muted-foreground uppercase tracking-wide">
            Real-time trading intelligence dashboard
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 bg-secondary rounded-full animate-pulse neon-glow" />
          <span className="text-base font-bold tracking-wider text-secondary uppercase">
            All Systems Operational
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="glass-morph-card p-10 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-start justify-between mb-8">
            <div className="p-5 bg-primary/10 border-2 border-primary rounded-lg">
              <Coins size={40} className="text-primary neon-glow-primary" />
            </div>
            <div className={`text-base font-bold px-4 py-2 border-2 rounded-lg ${(portfolio?.change24h ?? 0) >= 0 ? 'text-secondary border-secondary' : 'text-destructive border-destructive'}`}>
              {(portfolio?.change24h ?? 0) >= 0 ? '+' : ''}{(portfolio?.change24h ?? 0).toFixed(2)}%
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-sm uppercase tracking-wider text-muted-foreground font-bold">Total Portfolio</div>
            <div className="text-4xl font-bold neon-glow">{formatCurrency(portfolio?.totalValue ?? 0)}</div>
          </div>
        </div>

        <div className="glass-morph-card p-10 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-start justify-between mb-8">
            <div className="p-5 bg-secondary/10 border-2 border-secondary rounded-lg">
              <Lightning size={40} className="text-secondary neon-glow" />
            </div>
            <div className="text-base font-bold text-primary px-4 py-2 border-2 border-primary rounded-lg">SOL</div>
          </div>
          <div className="space-y-3">
            <div className="text-sm uppercase tracking-wider text-muted-foreground font-bold">Solana Balance</div>
            <div className="text-4xl font-bold neon-glow">{formatCrypto(portfolio?.solanaBalance ?? 0)} SOL</div>
          </div>
        </div>

        <div className="glass-morph-card p-10 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-start justify-between mb-8">
            <div className="p-5 bg-accent/10 border-2 border-accent rounded-lg">
              <Coins size={40} className="text-accent neon-glow-accent" />
            </div>
            <div className="text-base font-bold text-primary px-4 py-2 border-2 border-primary rounded-lg">BTC</div>
          </div>
          <div className="space-y-3">
            <div className="text-sm uppercase tracking-wider text-muted-foreground font-bold">Bitcoin Vault</div>
            <div className="text-4xl font-bold neon-glow">{formatCrypto(portfolio?.btcBalance ?? 0, 6)} BTC</div>
          </div>
        </div>

        <div className="glass-morph-card p-10 hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-start justify-between mb-8">
            <div className="p-5 bg-primary/10 border-2 border-primary rounded-lg">
              <Robot size={40} className="text-primary neon-glow-primary" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-secondary rounded-full animate-pulse neon-glow" />
              <span className="text-xs font-bold text-secondary uppercase tracking-wider">ACTIVE</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-sm uppercase tracking-wider text-muted-foreground font-bold">AI Agents</div>
            <div className="text-4xl font-bold neon-glow">{portfolio?.activeAgents ?? 0}/3 Online</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="glass-morph-card p-10">
            <div className="flex items-center gap-5 mb-10">
              <div className="p-5 bg-primary/10 border-2 border-primary rounded-lg">
                <ChartLine size={40} className="text-primary neon-glow-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold uppercase tracking-wider neon-glow">
                  Performance Overview
                </h2>
                <p className="text-sm text-muted-foreground uppercase tracking-wide mt-2">24-hour trading metrics</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
              <div className="p-8 bg-muted/20 border-2 border-primary/30 rounded-lg hover:border-primary/60 transition-all">
                <div className="text-sm uppercase tracking-wider text-muted-foreground mb-4 font-semibold">Total Trades</div>
                <div className="text-5xl font-bold neon-glow technical-readout">47</div>
              </div>
              <div className="p-8 bg-muted/20 border-2 border-secondary/30 rounded-lg hover:border-secondary/60 transition-all">
                <div className="text-sm uppercase tracking-wider text-muted-foreground mb-4 font-semibold">Win Rate</div>
                <div className="text-5xl font-bold text-secondary neon-glow technical-readout">68%</div>
              </div>
              <div className="p-8 bg-muted/20 border-2 border-accent/30 rounded-lg hover:border-accent/60 transition-all">
                <div className="text-sm uppercase tracking-wider text-muted-foreground mb-4 font-semibold">Profit</div>
                <div className="text-5xl font-bold text-accent neon-glow-accent technical-readout">+$127</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="glass-morph-card p-10 scan-line-effect">
            <div className="flex items-center gap-5 mb-10">
              <div className="p-5 bg-secondary/10 border-2 border-secondary rounded-lg">
                <Brain size={40} className="text-secondary neon-glow" />
              </div>
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-wider neon-glow">
                  Agent Status
                </h2>
              </div>
            </div>

            <div className="space-y-5">
              <div className="p-6 border-2 border-primary/30 bg-primary/5 rounded-lg hover:border-primary/60 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base font-bold uppercase tracking-wider">Market Analysis</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-secondary rounded-full animate-pulse neon-glow" />
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">ACTIVE</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-3">Scanning market conditions</div>
                <div className="h-3 bg-muted relative overflow-hidden rounded-full">
                  <div className="h-full bg-secondary neon-glow rounded-full" style={{ width: '87%' }} />
                </div>
              </div>

              <div className="p-6 border-2 border-primary/30 bg-primary/5 rounded-lg hover:border-primary/60 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base font-bold uppercase tracking-wider">Strategy Execution</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-secondary rounded-full animate-pulse neon-glow" />
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">ACTIVE</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-3">Executing DCA orders</div>
                <div className="h-3 bg-muted relative overflow-hidden rounded-full">
                  <div className="h-full bg-secondary neon-glow rounded-full" style={{ width: '72%' }} />
                </div>
              </div>

              <div className="p-6 border-2 border-primary/30 bg-primary/5 rounded-lg hover:border-primary/60 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base font-bold uppercase tracking-wider">RL Optimizer</span>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-secondary rounded-full animate-pulse neon-glow" />
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">ACTIVE</span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mb-3">Optimizing parameters</div>
                <div className="h-3 bg-muted relative overflow-hidden rounded-full">
                  <div className="h-full bg-secondary neon-glow rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-morph-card p-10">
            <div className="flex items-center gap-5 mb-10">
              <div className="p-5 bg-accent/10 border-2 border-accent rounded-lg">
                <Target size={40} className="text-accent neon-glow-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold uppercase tracking-wider neon-glow-accent">
                  Quick Stats
                </h2>
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 hover:bg-muted/20 transition-all border-l-2 border-primary/30 rounded">
                <span className="text-base uppercase tracking-wider text-muted-foreground font-semibold">Active Positions</span>
                <span className="text-2xl font-bold neon-glow">12</span>
              </div>
              <div className="flex items-center justify-between p-4 hover:bg-muted/20 transition-all border-l-2 border-primary/30 rounded">
                <span className="text-base uppercase tracking-wider text-muted-foreground font-semibold">Pending Orders</span>
                <span className="text-2xl font-bold neon-glow">5</span>
              </div>
              <div className="flex items-center justify-between p-4 hover:bg-muted/20 transition-all border-l-2 border-primary/30 rounded">
                <span className="text-base uppercase tracking-wider text-muted-foreground font-semibold">Best Trade</span>
                <span className="text-2xl font-bold text-secondary neon-glow">+$47.23</span>
              </div>
              <div className="flex items-center justify-between p-4 hover:bg-muted/20 transition-all border-l-2 border-primary/30 rounded">
                <span className="text-base uppercase tracking-wider text-muted-foreground font-semibold">Avg. Hold Time</span>
                <span className="text-2xl font-bold neon-glow">4.2h</span>
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
            className="fixed bottom-32 right-10 w-[480px] glass-morph-card p-8 z-50 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-primary/10 border-2 border-primary rounded-lg">
                  <Robot size={32} className="text-primary neon-glow-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-wider neon-glow">AI Assistant</h3>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Ask me anything</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAssistant(false)}
                className="border-2 border-primary hover:bg-primary/10 rounded-lg"
              >
                <span className="text-primary text-2xl">×</span>
              </Button>
            </div>
            <div className="space-y-5">
              <div className="p-5 bg-muted/20 border-l-4 border-primary rounded-lg">
                <p className="text-base text-foreground mb-4">
                  👋 Hello! I'm your AI trading assistant. I can help you with:
                </p>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    Market analysis and insights
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    Trading strategy suggestions
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    Agent configuration tips
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    Performance optimization
                  </li>
                </ul>
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type your question..."
                  className="flex-1 px-5 py-4 bg-muted border-2 border-primary/30 focus:border-primary text-base uppercase tracking-wide outline-none transition-all rounded-lg"
                />
                <Button className="px-8 py-4 border-2 border-primary bg-primary/10 hover:bg-primary/20 text-primary neon-glow-primary uppercase tracking-wider font-bold rounded-lg">
                  Send
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setShowAssistant(!showAssistant)}
        className="fixed bottom-10 right-10 p-6 bg-primary border-3 border-primary rounded-xl neon-glow-primary shadow-2xl z-40 hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChatCircleDots size={40} weight="fill" className="text-background" />
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-secondary rounded-full animate-pulse neon-glow" />
      </motion.button>
    </div>
  );
}
