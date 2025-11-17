import { useState, useEffect } from "react";
import {
  TrendUp,
  TrendDown,
  Coins,
  Lightning,
  Robot,
  Target,
  ChartLine,
  Brain,
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
        <div className="cyber-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary/10 border-2 border-primary">
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

        <div className="cyber-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-secondary/10 border-2 border-secondary">
              <Lightning size={24} className="text-secondary neon-glow" />
            </div>
            <div className="text-xs font-bold text-primary">SOL</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Solana Balance</div>
            <div className="text-2xl font-bold neon-glow">{formatCrypto(portfolio?.solanaBalance ?? 0)} SOL</div>
          </div>
        </div>

        <div className="cyber-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-secondary/10 border-2 border-secondary">
              <Coins size={24} className="text-secondary neon-glow" />
            </div>
            <div className="text-xs font-bold text-primary">BTC</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Bitcoin Vault</div>
            <div className="text-2xl font-bold neon-glow">{formatCrypto(portfolio?.btcBalance ?? 0, 6)} BTC</div>
          </div>
        </div>

        <div className="cyber-card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-primary/10 border-2 border-primary">
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
          <div className="cyber-card-accent p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wider neon-glow mb-1">
                  Bot Aggression Level
                </h2>
                <p className="text-xs text-muted-foreground">
                  Control trading intensity and risk tolerance
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold neon-glow">{botAggression ?? 5}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Level</div>
              </div>
            </div>

            <div className="space-y-4">
              <input
                type="range"
                min="1"
                max="10"
                value={botAggression ?? 5}
                onChange={(e) => setBotAggression(Number(e.target.value))}
                className="w-full h-3 bg-muted border-2 border-primary appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-6
                  [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:bg-secondary
                  [&::-webkit-slider-thumb]:border-2
                  [&::-webkit-slider-thumb]:border-secondary
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-[0_0_10px_var(--secondary)]
                  [&::-moz-range-thumb]:w-6
                  [&::-moz-range-thumb]:h-6
                  [&::-moz-range-thumb]:bg-secondary
                  [&::-moz-range-thumb]:border-2
                  [&::-moz-range-thumb]:border-secondary
                  [&::-moz-range-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:shadow-[0_0_10px_var(--secondary)]
                  [&::-moz-range-thumb]:rounded-none"
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))'
                }}
              />

              <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
                <span>Conservative</span>
                <span>Moderate</span>
                <span>Aggressive</span>
              </div>

              <div className="p-4 bg-muted/30 border-2 border-primary/20">
                <div className="text-xs">
                  {(botAggression ?? 5) <= 3 && (
                    <>
                      <span className="font-bold text-primary uppercase">Conservative Mode:</span>
                      <span className="text-muted-foreground ml-2">Low risk, steady gains, minimal exposure</span>
                    </>
                  )}
                  {(botAggression ?? 5) > 3 && (botAggression ?? 5) <= 7 && (
                    <>
                      <span className="font-bold text-secondary uppercase">Moderate Mode:</span>
                      <span className="text-muted-foreground ml-2">Balanced risk/reward, active trading</span>
                    </>
                  )}
                  {(botAggression ?? 5) > 7 && (
                    <>
                      <span className="font-bold text-destructive uppercase">Aggressive Mode:</span>
                      <span className="text-muted-foreground ml-2">High risk, maximum profit potential, rapid execution</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="cyber-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 border-2 border-primary">
                <ChartLine size={24} className="text-primary neon-glow-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold uppercase tracking-wider neon-glow">
                  Performance Overview
                </h2>
                <p className="text-xs text-muted-foreground">24-hour trading metrics</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-muted/20 border-2 border-primary/20">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Total Trades</div>
                <div className="text-2xl font-bold neon-glow">47</div>
              </div>
              <div className="p-4 bg-muted/20 border-2 border-secondary/20">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Win Rate</div>
                <div className="text-2xl font-bold text-secondary neon-glow">68%</div>
              </div>
              <div className="p-4 bg-muted/20 border-2 border-primary/20">
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Profit</div>
                <div className="text-2xl font-bold text-secondary neon-glow">+$127</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="cyber-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-secondary/10 border-2 border-secondary">
                <Brain size={24} className="text-secondary neon-glow" />
              </div>
              <div>
                <h2 className="text-lg font-bold uppercase tracking-wider neon-glow">
                  Agent Status
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border-2 border-primary/30 bg-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Market Analysis</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse neon-glow" />
                    <span className="text-[10px] font-bold text-secondary">ACTIVE</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Scanning market conditions</div>
                <div className="mt-2 h-1 bg-muted relative overflow-hidden">
                  <div className="h-full bg-secondary neon-glow" style={{ width: '87%' }} />
                </div>
              </div>

              <div className="p-4 border-2 border-primary/30 bg-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Strategy Execution</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse neon-glow" />
                    <span className="text-[10px] font-bold text-secondary">ACTIVE</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Executing DCA orders</div>
                <div className="mt-2 h-1 bg-muted relative overflow-hidden">
                  <div className="h-full bg-secondary neon-glow" style={{ width: '72%' }} />
                </div>
              </div>

              <div className="p-4 border-2 border-primary/30 bg-primary/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">RL Optimizer</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse neon-glow" />
                    <span className="text-[10px] font-bold text-secondary">ACTIVE</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">Optimizing parameters</div>
                <div className="mt-2 h-1 bg-muted relative overflow-hidden">
                  <div className="h-full bg-secondary neon-glow" style={{ width: '94%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="cyber-card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 border-2 border-primary">
                <Target size={24} className="text-primary neon-glow-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold uppercase tracking-wider neon-glow">
                  Quick Stats
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Active Positions</span>
                <span className="text-sm font-bold neon-glow">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Pending Orders</span>
                <span className="text-sm font-bold neon-glow">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Best Trade</span>
                <span className="text-sm font-bold text-secondary neon-glow">+$47.23</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Avg. Hold Time</span>
                <span className="text-sm font-bold neon-glow">4.2h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
