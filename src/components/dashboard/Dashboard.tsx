import { useState } from "react";
import {
  Coins,
  Lightning,
  Robot,
  Target,
  ChartLine,
  Brain,
  Gauge,
} from "@phosphor-icons/react";
import { useKV } from "@github/spark/hooks";

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

  const [botAggression, setBotAggression] = useKV<number>("bot-aggression", 5);

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

  const getAggressionMode = (level: number) => {
    if (level <= 3) return { label: "CONSERVATIVE", color: "text-primary", desc: "Low risk, steady gains, minimal exposure" };
    if (level <= 7) return { label: "MODERATE", color: "text-accent", desc: "Balanced risk/reward, active trading" };
    return { label: "AGGRESSIVE", color: "text-destructive", desc: "High risk, maximum profit potential, rapid execution" };
  };

  const currentMode = getAggressionMode(botAggression ?? 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold uppercase tracking-[0.15em] neon-glow">
          Mission Control
        </h1>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-secondary rounded-full animate-pulse neon-glow" />
          <span className="text-xs font-bold tracking-wider text-secondary uppercase">
            All Systems Operational
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-morph-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary/10 border-2 border-primary jagged-corner-small">
              <Coins size={24} className="text-primary neon-glow-primary" />
            </div>
            <div className={`text-xs font-bold ${(portfolio?.change24h ?? 0) >= 0 ? 'text-secondary' : 'text-destructive'}`}>
              {(portfolio?.change24h ?? 0) >= 0 ? '+' : ''}{(portfolio?.change24h ?? 0).toFixed(2)}%
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Total Portfolio</div>
            <div className="text-2xl font-bold neon-glow">{formatCurrency(portfolio?.totalValue ?? 0)}</div>
          </div>
        </div>

        <div className="glass-morph-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-secondary/10 border-2 border-secondary jagged-corner-small">
              <Lightning size={24} className="text-secondary neon-glow" />
            </div>
            <div className="text-xs font-bold text-primary">SOL</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Solana Balance</div>
            <div className="text-2xl font-bold neon-glow">{formatCrypto(portfolio?.solanaBalance ?? 0)} SOL</div>
          </div>
        </div>

        <div className="glass-morph-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-accent/10 border-2 border-accent jagged-corner-small">
              <Coins size={24} className="text-accent neon-glow-accent" />
            </div>
            <div className="text-xs font-bold text-primary">BTC</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Bitcoin Vault</div>
            <div className="text-2xl font-bold neon-glow">{formatCrypto(portfolio?.btcBalance ?? 0, 6)} BTC</div>
          </div>
        </div>

        <div className="glass-morph-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary/10 border-2 border-primary jagged-corner-small">
              <Robot size={24} className="text-primary neon-glow-primary" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse neon-glow" />
              <span className="text-[10px] font-bold text-secondary">ACTIVE</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">AI Agents</div>
            <div className="text-2xl font-bold neon-glow">{portfolio?.activeAgents ?? 0}/3 Online</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-morph-card p-6 relative overflow-hidden">
            <div className="absolute inset-0 grid-background opacity-5" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-secondary/20 border-2 border-secondary jagged-corner-small neon-glow-accent">
                    <Gauge size={28} weight="duotone" className="text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold uppercase tracking-wider neon-glow mb-1">
                      Bot Aggression Level
                    </h2>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Control trading intensity and risk tolerance
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold neon-glow technical-readout">{botAggression ?? 5}</div>
                  <div className={`text-xs uppercase tracking-wider font-bold ${currentMode.color}`}>
                    {currentMode.label}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={botAggression ?? 5}
                    onChange={(e) => setBotAggression(Number(e.target.value))}
                    className="w-full h-4 bg-muted border-2 border-primary appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-7
                      [&::-webkit-slider-thumb]:h-7
                      [&::-webkit-slider-thumb]:bg-secondary
                      [&::-webkit-slider-thumb]:border-3
                      [&::-webkit-slider-thumb]:border-secondary
                      [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:shadow-[0_0_15px_var(--secondary),0_0_30px_var(--secondary)]
                      [&::-webkit-slider-thumb]:jagged-corner-small
                      [&::-moz-range-thumb]:w-7
                      [&::-moz-range-thumb]:h-7
                      [&::-moz-range-thumb]:bg-secondary
                      [&::-moz-range-thumb]:border-3
                      [&::-moz-range-thumb]:border-secondary
                      [&::-moz-range-thumb]:cursor-pointer
                      [&::-moz-range-thumb]:shadow-[0_0_15px_var(--secondary),0_0_30px_var(--secondary)]
                      [&::-moz-range-thumb]:rounded-none
                      jagged-corner-small"
                  />
                  <div 
                    className="absolute top-0 left-0 h-4 bg-gradient-to-r from-primary via-accent to-secondary pointer-events-none opacity-80 neon-glow-accent jagged-corner-small"
                    style={{ width: `${((botAggression ?? 5) - 1) / 9 * 100}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                  <span className="text-primary">Conservative</span>
                  <span className="text-accent">Moderate</span>
                  <span className="text-destructive">Aggressive</span>
                </div>

                <div className="p-4 bg-muted/30 border-2 border-primary/30 jagged-corner-small relative overflow-hidden">
                  <div className="absolute inset-0 diagonal-stripes opacity-30" />
                  <div className="relative z-10">
                    <div className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full ${currentMode.color.replace('text-', 'bg-')} animate-pulse neon-glow mt-1`} />
                      <div className="text-sm">
                        <span className={`font-bold uppercase ${currentMode.color}`}>{currentMode.label} Mode:</span>
                        <span className="text-muted-foreground ml-2">{currentMode.desc}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-muted/20 border border-primary/30 angled-corner-tl">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Trade Freq</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" style={{ width: `${((botAggression ?? 5) / 10) * 100}%` }} />
                      </div>
                      <span className="text-sm font-bold text-primary">{botAggression ?? 5}/10</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/20 border border-accent/30 angled-corner-tr">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Position Size</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-accent to-destructive" style={{ width: `${((botAggression ?? 5) / 10) * 100}%` }} />
                      </div>
                      <span className="text-sm font-bold text-accent">{Math.round(((botAggression ?? 5) / 10) * 100)}%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted/20 border border-secondary/30 angled-corner-br">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Risk Level</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-secondary to-destructive" style={{ width: `${((botAggression ?? 5) / 10) * 100}%` }} />
                      </div>
                      <span className={`text-sm font-bold ${currentMode.color}`}>{botAggression ?? 5}/10</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-morph-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 border-2 border-primary jagged-corner-small">
                <ChartLine size={24} className="text-primary neon-glow-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wider neon-glow">
                  Performance Overview
                </h2>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">24-hour trading metrics</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-muted/20 border-2 border-primary/30 angled-corner-tl hover:border-primary/60 transition-all">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Total Trades</div>
                <div className="text-2xl font-bold neon-glow technical-readout">47</div>
              </div>
              <div className="p-4 bg-muted/20 border-2 border-secondary/30 angled-corner-tr hover:border-secondary/60 transition-all">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Win Rate</div>
                <div className="text-2xl font-bold text-secondary neon-glow technical-readout">68%</div>
              </div>
              <div className="p-4 bg-muted/20 border-2 border-accent/30 angled-corner-br hover:border-accent/60 transition-all">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Profit</div>
                <div className="text-2xl font-bold text-accent neon-glow-accent technical-readout">+$127</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-morph-card p-6 scan-line-effect">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-secondary/10 border-2 border-secondary jagged-corner-small">
                <Brain size={24} className="text-secondary neon-glow" />
              </div>
              <div>
                <h2 className="text-lg font-bold uppercase tracking-wider neon-glow">
                  Agent Status
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border-2 border-primary/30 bg-primary/5 angled-corner-tl hover:border-primary/60 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Market Analysis</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse neon-glow" />
                    <span className="text-[10px] font-bold text-secondary">ACTIVE</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Scanning market conditions</div>
                <div className="mt-2 h-1.5 bg-muted relative overflow-hidden">
                  <div className="h-full bg-secondary neon-glow" style={{ width: '87%' }} />
                </div>
              </div>

              <div className="p-4 border-2 border-primary/30 bg-primary/5 angled-corner-tr hover:border-primary/60 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Strategy Execution</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse neon-glow" />
                    <span className="text-[10px] font-bold text-secondary">ACTIVE</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Executing DCA orders</div>
                <div className="mt-2 h-1.5 bg-muted relative overflow-hidden">
                  <div className="h-full bg-secondary neon-glow" style={{ width: '72%' }} />
                </div>
              </div>

              <div className="p-4 border-2 border-primary/30 bg-primary/5 angled-corner-br hover:border-primary/60 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">RL Optimizer</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse neon-glow" />
                    <span className="text-[10px] font-bold text-secondary">ACTIVE</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Optimizing parameters</div>
                <div className="mt-2 h-1.5 bg-muted relative overflow-hidden">
                  <div className="h-full bg-secondary neon-glow" style={{ width: '94%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-morph-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-accent/10 border-2 border-accent jagged-corner-small">
                <Target size={24} className="text-accent neon-glow-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold uppercase tracking-wider neon-glow-accent">
                  Quick Stats
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 hover:bg-muted/20 transition-all">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Active Positions</span>
                <span className="text-sm font-bold neon-glow">12</span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-muted/20 transition-all">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Pending Orders</span>
                <span className="text-sm font-bold neon-glow">5</span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-muted/20 transition-all">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Best Trade</span>
                <span className="text-sm font-bold text-secondary neon-glow">+$47.23</span>
              </div>
              <div className="flex items-center justify-between p-2 hover:bg-muted/20 transition-all">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Avg. Hold Time</span>
                <span className="text-sm font-bold neon-glow">4.2h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
