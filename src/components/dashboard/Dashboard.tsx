import {
  TrendUp,
  TrendDown,
  Coins,
  Lightning,
  ArrowsClockwise,
  ChartLine,
  Target,
  Terminal,
  Brain,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { useKV } from "@github/spark/hooks";
import Wireframe3D from "@/components/shared/Wireframe3D";

interface PortfolioData {
  solanaBalance: number;
  btcBalance: number;
  totalValue: number;
  change24h: number;
  activeAgents: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  type: "thinking" | "analysis" | "execution" | "success" | "info";
  message: string;
}

const LOG_TEMPLATES = [
  {
    agent: "A1_MARKET",
    type: "thinking",
    message: "Analyzing market conditions for SOL/USD pair...",
  },
  {
    agent: "A1_MARKET",
    type: "analysis",
    message: "Detected 5.2% price volatility in last 15min window",
  },
  {
    agent: "A2_STRATEGY",
    type: "thinking",
    message: "Evaluating DCA entry point for BTC position",
  },
  {
    agent: "A2_STRATEGY",
    type: "execution",
    message: "Executing DCA buy order: 0.00025 BTC @ $42,150",
  },
  {
    agent: "A2_STRATEGY",
    type: "success",
    message: "Trade executed successfully. Slippage: 0.12%",
  },
  {
    agent: "A3_RL_OPT",
    type: "thinking",
    message: "Running reinforcement learning optimization cycle",
  },
  {
    agent: "A3_RL_OPT",
    type: "analysis",
    message: "Model confidence: 87.3% for bullish continuation",
  },
  {
    agent: "A1_MARKET",
    type: "info",
    message: "New token detected: BONK - Initial liquidity: $2.4M",
  },
  {
    agent: "A2_STRATEGY",
    type: "thinking",
    message: "Calculating optimal position sizing for BONK entry",
  },
  {
    agent: "A2_STRATEGY",
    type: "execution",
    message: "Snipe order placed: 1.5 SOL → BONK",
  },
  {
    agent: "A2_STRATEGY",
    type: "success",
    message: "Snipe successful. Entry price: $0.0000142",
  },
  {
    agent: "A3_RL_OPT",
    type: "analysis",
    message: "Portfolio rebalance recommended: +2.3% SOL allocation",
  },
  {
    agent: "A1_MARKET",
    type: "info",
    message: "Market sentiment score: 72/100 (Bullish)",
  },
  {
    agent: "A3_RL_OPT",
    type: "thinking",
    message: "Adjusting risk parameters based on volatility index",
  },
];

export default function Dashboard() {
  const [portfolio, setPortfolio] = useKV<PortfolioData>("portfolio-data", {
    solanaBalance: 125.47,
    btcBalance: 0.00234,
    totalValue: 8943.21,
    change24h: 5.72,
    activeAgents: 3,
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolio((current) => {
        if (!current)
          return {
            solanaBalance: 125.47,
            btcBalance: 0.00234,
            totalValue: 8943.21,
            change24h: 5.72,
            activeAgents: 3,
          };
        return {
          ...current,
          solanaBalance: current.solanaBalance + (Math.random() - 0.5) * 0.1,
          change24h: current.change24h + (Math.random() - 0.5) * 0.5,
          totalValue: current.totalValue + (Math.random() - 0.5) * 10,
        };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [setPortfolio]);

  useEffect(() => {
    const logInterval = setInterval(() => {
      const template =
        LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
      const newLog: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        agent: template.agent,
        type: template.type as LogEntry["type"],
        message: template.message,
      };

      setLogs((currentLogs) => {
        const updated = [...currentLogs, newLog];
        return updated.slice(-50);
      });
    }, 3000);

    return () => clearInterval(logInterval);
  }, []);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  if (!portfolio) return null;

  const isPositive = portfolio.change24h >= 0;

  const getLogIcon = (type: LogEntry["type"]) => {
    switch (type) {
      case "thinking":
        return <Brain size={16} weight="duotone" className="text-primary" />;
      case "analysis":
        return <ChartLine size={16} weight="duotone" className="text-accent" />;
      case "execution":
        return (
          <ArrowRight size={16} weight="bold" className="text-secondary" />
        );
      case "success":
        return (
          <CheckCircle size={16} weight="duotone" className="text-primary" />
        );
      case "info":
        return (
          <Terminal
            size={16}
            weight="duotone"
            className="text-muted-foreground"
          />
        );
    }
  };

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "thinking":
        return "text-primary";
      case "analysis":
        return "text-accent";
      case "execution":
        return "text-secondary";
      case "success":
        return "text-primary";
      case "info":
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="cyber-card relative overflow-hidden">
        <div className="absolute inset-0 diagonal-stripes opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 opacity-10">
          <Wireframe3D
            type="sphere"
            size={320}
            color="secondary"
            animated={true}
          />
        </div>
        <div className="p-8 md:p-10 relative z-10">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="flex-shrink-0">
              <div className="p-8 jagged-corner bg-gradient-to-br from-primary/20 to-accent/20 border-4 border-primary shadow-[0_0_40px_oklch(0.72_0.20_195_/_0.7)]">
                <Brain size={80} weight="duotone" className="text-primary" />
              </div>
            </div>
            <div className="flex-1 space-y-5">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <h2 className="text-4xl md:text-5xl font-bold tracking-[0.25em] uppercase">
                    <span className="text-primary neon-glow-primary">
                      QUANTUM
                    </span>
                    <span className="text-secondary neon-glow-secondary ml-3">
                      FALCON
                    </span>
                  </h2>
                  <div className="px-4 py-2 jagged-corner-small bg-secondary/20 border-2 border-secondary">
                    <span className="text-sm font-bold text-secondary uppercase tracking-[0.2em]">
                      V2.4.1
                    </span>
                  </div>
                </div>
                <p className="text-base uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                  ADVANCED AI-POWERED AUTONOMOUS TRADING SYSTEM
                </p>
              </div>

              <p className="text-lg leading-relaxed text-foreground">
                <span className="text-accent font-bold">Quantum Falcon</span> is
                an advanced AI-powered mobile assistant designed to cater to a
                futuristic, fully integrated user experience. It leverages
                cutting-edge{" "}
                <span className="text-primary font-bold">
                  quantum computing principles
                </span>{" "}
                to enhance real-time decision-making processes, automate user
                tasks, and deliver rich analytics across multiple domains
                including{" "}
                <span className="text-secondary font-bold">finance</span>,{" "}
                <span className="text-secondary font-bold">education</span>, and{" "}
                <span className="text-secondary font-bold">
                  AI-driven experimentation
                </span>
                .
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-muted/30 border-l-3 border-primary hover:border-accent transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightning
                      size={18}
                      weight="fill"
                      className="text-primary"
                    />
                    <p className="text-sm uppercase tracking-wide font-bold text-primary">
                      Autonomous Trading
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Multi-agent AI system for 24/7 market analysis
                  </p>
                </div>
                <div className="p-4 bg-muted/30 border-l-3 border-accent hover:border-secondary transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={18} weight="fill" className="text-accent" />
                    <p className="text-sm uppercase tracking-wide font-bold text-accent">
                      Quantum Analytics
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Real-time insights powered by quantum computing
                  </p>
                </div>
                <div className="p-4 bg-muted/30 border-l-3 border-secondary hover:border-primary transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck
                      size={18}
                      weight="fill"
                      className="text-secondary"
                    />
                    <p className="text-sm uppercase tracking-wide font-bold text-secondary">
                      Secure Vault
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Automated profit conversion and protection
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-[0.3em] uppercase">
            <span className="text-primary neon-glow-primary">
              COMMAND_CENTER
            </span>
          </h2>
          <div className="hidden md:flex items-center gap-2">
            <div className="status-indicator" />
            <span className="hud-readout text-sm">ONLINE</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:block hud-readout text-sm">
            {new Date().toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </div>
          <button className="p-3 bg-card border-2 border-primary/30 hover:bg-primary/10 hover:border-primary transition-all relative group">
            <ArrowsClockwise
              size={20}
              weight="duotone"
              className="text-primary"
            />
            <div className="hud-corner-tl" />
            <div className="hud-corner-br" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="cyber-card group hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
            <Wireframe3D
              type="dome"
              size={160}
              color="primary"
              animated={false}
            />
          </div>
          <div className="p-8 relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-2">
                <div className="hud-readout text-sm">TOTAL_PORTFOLIO</div>
                <div className="h-0.5 w-32 bg-primary/50" />
              </div>
              <div className="p-3 bg-primary/10 border-2 border-primary/30 relative">
                <Coins size={24} weight="duotone" className="text-primary" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="technical-readout text-5xl md:text-6xl">
                ${portfolio.totalValue.toFixed(2)}
              </div>
              <div className="flex items-center gap-3">
                {isPositive ? (
                  <TrendUp size={22} weight="bold" className="text-primary" />
                ) : (
                  <TrendDown
                    size={22}
                    weight="bold"
                    className="text-destructive"
                  />
                )}
                <span
                  className={`text-xl font-bold hud-value ${isPositive ? "text-primary neon-glow-primary" : "text-destructive neon-glow-destructive"}`}
                >
                  {isPositive ? "+" : ""}
                  {portfolio.change24h.toFixed(2)}%
                </span>
                <span className="data-label text-sm">24H_CHG</span>
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-primary/20">
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.abs(portfolio.change24h) * 10}%` }}
            />
          </div>
        </div>

        <div className="cyber-card group hover:scale-[1.02] transition-transform duration-300 relative">
          <div className="absolute -right-4 -top-4 diagonal-stripes w-40 h-40 pointer-events-none opacity-40" />
          <div className="p-8 relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-2">
                <div className="hud-readout text-sm">SOLANA_BAL</div>
                <div className="h-0.5 w-32 bg-primary/50" />
              </div>
              <div className="p-3 bg-primary/10 border-2 border-primary/30 relative">
                <Lightning
                  size={24}
                  weight="duotone"
                  className="text-primary"
                />
                <div className="hud-corner-tl" />
                <div className="hud-corner-br" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="technical-readout text-5xl md:text-6xl">
                {portfolio.solanaBalance.toFixed(2)}
              </div>
              <div className="flex items-center justify-between">
                <span className="data-label text-sm">SOL</span>
                <div
                  className="w-20 h-11 border-2 border-primary/40 relative flex items-center justify-center"
                  style={{
                    clipPath:
                      "polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)",
                  }}
                >
                  <ChartLine size={20} weight="bold" className="text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="cyber-card-accent group hover:scale-[1.02] transition-transform duration-300 relative">
          <div className="absolute bottom-0 left-0 right-0 technical-grid h-28 pointer-events-none opacity-30" />
          <div className="p-8 relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div className="space-y-2">
                <div className="hud-readout text-accent text-sm">BTC_VAULT</div>
                <div className="h-0.5 w-32 bg-accent/50" />
              </div>
              <div className="p-3 bg-accent/10 border-2 border-accent/30 relative">
                <Target size={24} weight="duotone" className="text-accent" />
              </div>
            </div>
            <div className="space-y-4">
              <div
                className="text-5xl md:text-5xl font-bold"
                style={{
                  background:
                    "linear-gradient(180deg, var(--accent) 0%, var(--primary) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 0 10px oklch(0.68 0.18 330 / 0.6))",
                }}
              >
                {portfolio.btcBalance.toFixed(6)}
              </div>
              <div className="data-label text-sm">BTC</div>
            </div>
          </div>
        </div>
      </div>

      <div className="cyber-card scan-line-effect relative">
        <div className="absolute inset-0 technical-grid pointer-events-none opacity-20" />
        <div className="p-8 relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="text-2xl font-bold uppercase tracking-[0.25em] hud-readout text-base">
              AGENT_STATUS
            </h3>
            <div className="px-4 py-2 bg-primary/20 border-2 border-primary/40">
              <span className="text-base font-bold text-primary uppercase tracking-[0.2em]">
                {portfolio.activeAgents}_ONLINE
              </span>
            </div>
            <div className="flex-1" />
            <div className="hidden lg:block">
              <Wireframe3D
                type="sphere"
                size={70}
                color="primary"
                animated={true}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-muted/50 border-l-3 border-primary hover:bg-muted/70 transition-all group/agent relative">
              <div className="hud-corner-tl" />
              <div className="hud-corner-br" />
              <div className="flex items-center justify-between mb-4">
                <span className="hud-readout text-sm">A1_MARKET</span>
                <div className="status-indicator" />
              </div>
              <p className="data-label text-sm">SCANNING_247_TOKENS</p>
              <div className="mt-4 flex gap-1.5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 h-10 bg-primary/20"
                    style={{ height: `${Math.random() * 40}px` }}
                  />
                ))}
              </div>
            </div>
            <div className="p-6 bg-muted/50 border-l-3 border-primary hover:bg-muted/70 transition-all group/agent relative">
              <div className="hud-corner-tl" />
              <div className="hud-corner-br" />
              <div className="flex items-center justify-between mb-4">
                <span className="hud-readout text-sm">A2_STRATEGY</span>
                <div className="status-indicator" />
              </div>
              <p className="data-label text-sm">3_ACTIVE_TRADES</p>
              <div className="mt-4">
                <div className="space-y-2">
                  <div className="h-1.5 bg-primary/20 relative overflow-hidden">
                    <div
                      className="h-full bg-primary animate-pulse"
                      style={{ width: "75%" }}
                    />
                  </div>
                  <div className="h-1.5 bg-primary/20 relative overflow-hidden">
                    <div
                      className="h-full bg-primary animate-pulse"
                      style={{ width: "45%", animationDelay: "0.5s" }}
                    />
                  </div>
                  <div className="h-1.5 bg-primary/20 relative overflow-hidden">
                    <div
                      className="h-full bg-primary animate-pulse"
                      style={{ width: "90%", animationDelay: "1s" }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 bg-muted/50 border-l-3 border-accent hover:bg-muted/70 transition-all group/agent relative">
              <div
                className="hud-corner-tl"
                style={{ borderColor: "var(--accent)" }}
              />
              <div
                className="hud-corner-br"
                style={{ borderColor: "var(--accent)" }}
              />
              <div className="flex items-center justify-between mb-4">
                <span className="hud-readout text-sm text-accent">
                  A3_RL_OPT
                </span>
                <div
                  className="status-indicator"
                  style={{
                    background: "var(--accent)",
                    boxShadow: "0 0 12px var(--accent), 0 0 24px var(--accent)",
                  }}
                />
              </div>
              <p className="data-label text-sm">LEARNING_CYCLE_47</p>
              <div className="mt-4 relative h-10">
                <svg width="100%" height="100%" className="absolute inset-0">
                  <polyline
                    points={Array.from({ length: 20 })
                      .map((_, i) => `${i * 5}%,${50 - Math.sin(i / 2) * 20}`)
                      .join(" ")}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    opacity="0.6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cyber-card relative">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
          <Wireframe3D
            type="grid"
            size={256}
            color="primary"
            animated={false}
          />
        </div>
        <div className="p-8 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold uppercase tracking-[0.25em] hud-readout text-base">
              RECENT_ACTIVITY
            </h3>
            <div className="hidden md:flex gap-2">
              <div className="w-2.5 h-2.5 bg-primary" />
              <div className="w-2.5 h-2.5 bg-primary" />
              <div className="w-2.5 h-2.5 bg-primary/30" />
            </div>
          </div>
          <div className="space-y-4">
            {[
              {
                action: "DCA_BUY",
                token: "SOL",
                amount: "2.5_SOL",
                time: "00:02:00",
                profit: null,
                type: "buy",
              },
              {
                action: "PROFIT_CVT",
                token: "BTC",
                amount: "0.00012_BTC",
                time: "00:15:00",
                profit: "+$8.42",
                type: "profit",
              },
              {
                action: "SNIPE_OK",
                token: "BONK",
                amount: "1M_BONK",
                time: "01:00:00",
                profit: "+12.3%",
                type: "snipe",
              },
            ].map((activity, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-5 bg-muted/30 border-l-3 border-primary hover:bg-muted/50 hover:border-accent transition-all group/activity relative"
              >
                <div className="absolute top-0 left-0 w-10 h-0.5 bg-primary" />
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-primary/10 border-2 border-primary/30 flex items-center justify-center relative">
                    <Lightning
                      size={22}
                      weight="duotone"
                      className="text-primary"
                    />
                  </div>
                  <div>
                    <p className="hud-readout text-sm">{activity.action}</p>
                    <p className="data-label text-sm mt-1">{activity.amount}</p>
                  </div>
                </div>
                <div className="text-right">
                  {activity.profit && (
                    <p className="text-base font-bold text-primary hud-value mb-1">
                      {activity.profit}
                    </p>
                  )}
                  <p className="data-label text-sm">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cyber-card relative overflow-hidden">
        <div className="absolute inset-0 technical-grid pointer-events-none opacity-10" />
        <div className="scan-line-effect absolute inset-0 pointer-events-none" />
        <div className="p-8 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-bold uppercase tracking-[0.25em] hud-readout text-base">
                BOT_LOGS
              </h3>
              <div className="px-4 py-2 bg-primary/20 border-2 border-primary/40 flex items-center gap-2">
                <Terminal size={16} weight="duotone" className="text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-[0.2em]">
                  LIVE
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoScroll(!autoScroll)}
                className={`px-4 py-2 text-sm font-bold uppercase tracking-wider transition-all border-2 ${
                  autoScroll
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "bg-muted/30 border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {autoScroll ? "AUTO" : "MANUAL"}
              </button>
              <button
                onClick={() => setLogs([])}
                className="px-4 py-2 text-sm font-bold uppercase tracking-wider bg-muted/30 border-2 border-muted-foreground/30 text-muted-foreground hover:bg-destructive/20 hover:border-destructive hover:text-destructive transition-all"
              >
                CLEAR
              </button>
            </div>
          </div>

          <div className="bg-background/80 border-2 border-primary/20 h-[450px] overflow-y-auto scrollbar-thin relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="p-5 space-y-2.5 font-mono text-sm">
              {logs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center space-y-3">
                    <Terminal
                      size={40}
                      weight="duotone"
                      className="mx-auto opacity-50"
                    />
                    <p className="data-label text-base">WAITING_FOR_LOGS</p>
                  </div>
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-3 hover:bg-primary/5 transition-colors border-l-2 border-transparent hover:border-primary/30 group"
                  >
                    <span className="text-muted-foreground/60 font-bold shrink-0 w-20 text-xs">
                      {log.timestamp}
                    </span>
                    <span className="px-3 py-1 bg-primary/10 text-primary font-bold shrink-0 text-[11px] tracking-wider">
                      {log.agent}
                    </span>
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className="shrink-0 mt-0.5">
                        {getLogIcon(log.type)}
                      </div>
                      <span className={`${getLogColor(log.type)} break-words text-sm`}>
                        {log.message}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
