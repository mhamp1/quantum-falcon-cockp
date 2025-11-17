import { useKV } from '@/hooks/useKVFallback'
import { useEffect, useState, useMemo, useTransition } from 'react'
import { motion } from 'framer-motion'
import { UserAuth } from '@/lib/auth'
import {
  Lightning, Robot, ChartLine, Brain, CheckCircle, 
  Play, Users, Crown, Cube, Hexagon, Pentagon, Polygon, Stop, Database, Vault,
  TrendUp, TrendDown
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import LoginDialog from '@/components/shared/LoginDialog'
import LicenseExpiry from '@/components/shared/LicenseExpiry'
import NewsTicker from "@/components/shared/NewsTicker"
import BotLogs from "@/components/shared/BotLogs"
import Wireframe3D from "@/components/shared/Wireframe3D"
import { toast } from 'sonner'
import { useQuery } from "@tanstack/react-query"

interface QuickStat {
  id: string;
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
}

interface AISentiment {
  sentiment: number;
  prediction: string;
  confidence: number;
  nextHourTrend: "bullish" | "bearish" | "neutral";
}

const fetchAISentiment = async (): Promise<AISentiment> => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const sentiment = (Math.random() - 0.5) * 100;
  const confidence = 60 + Math.random() * 35;
  const nextHourTrend =
    sentiment > 10 ? "bullish" : sentiment < -10 ? "bearish" : "neutral";
  return {
    sentiment,
    prediction:
      nextHourTrend === "bullish"
        ? "Bullish"
        : nextHourTrend === "bearish"
          ? "Bearish"
          : "Neutral",
    confidence,
    nextHourTrend,
  };
};

function QuickStatsCard({ stat, index }: { stat: QuickStat; index: number }) {
  const isPositive = stat.change >= 0;
  const cornerClasses = [
    "angled-corner-tr",
    "angled-corner-br",
    "cut-corner-tr",
    "angled-corners-dual-tr-bl",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className={`cyber-card group cursor-pointer relative overflow-hidden ${cornerClasses[index % 4]}`}
      role="gridcell"
      aria-label={`${stat.label}: ${stat.value}, ${stat.change >= 0 ? "up" : "down"} ${Math.abs(stat.change).toFixed(2)}%`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="p-4 relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="data-label">{stat.label}</div>
          <div
            className={`p-2.5 border-2 angled-corner-tr relative overflow-hidden ${
              stat.color === "primary"
                ? "bg-primary/5 border-primary"
                : stat.color === "secondary"
                  ? "bg-secondary/5 border-secondary"
                  : "bg-accent/5 border-accent"
            }`}
          >
            <div
              className={`absolute inset-0 ${
                stat.color === "primary"
                  ? "bg-primary"
                  : stat.color === "secondary"
                    ? "bg-secondary"
                    : "bg-accent"
              } opacity-5`}
            />
            <div className="relative z-10">{stat.icon}</div>
          </div>
        </div>
        <div className="technical-readout text-2xl mb-2">{stat.value}</div>
        {stat.change !== 0 && (
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendUp size={14} weight="bold" className="text-primary" />
            ) : (
              <TrendDown size={14} weight="bold" className="text-destructive" />
            )}
            <span
              className={`text-xs font-bold ${isPositive ? "text-primary" : "text-destructive"}`}
            >
              {isPositive ? "+" : ""}
              {stat.change.toFixed(2)}%
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function QuickActionButton({ action, index }: { action: QuickAction; index: number }) {
  const colorClasses = {
    primary:
      "bg-primary/10 hover:bg-primary/20 border-primary/50 hover:border-primary text-primary hover:shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.3)]",
    accent:
      "bg-accent/10 hover:bg-accent/20 border-accent/50 hover:border-accent text-accent hover:shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]",
    secondary:
      "bg-secondary/10 hover:bg-secondary/20 border-secondary/50 hover:border-secondary text-secondary hover:shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]",
    destructive:
      "bg-destructive/10 hover:bg-destructive/20 border-destructive/50 hover:border-destructive text-destructive hover:shadow-[0_0_20px_oklch(0.65_0.25_25_/_0.3)]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={action.action}
        className={`w-full ${colorClasses[action.color as keyof typeof colorClasses]} border-2 transition-all ${index % 2 === 0 ? "angled-corner-tr" : "angled-corner-br"} flex-col h-auto py-4 gap-2 relative overflow-hidden group/btn`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-current/5 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
        <div className="relative z-10">{action.icon}</div>
        <span className="text-xs uppercase tracking-wider font-bold relative z-10">
          {action.label}
        </span>
      </Button>
    </motion.div>
  );
}

function AIAdvisor({ data, isLoading }: { data?: AISentiment; isLoading: boolean }) {
  if (isLoading || !data) {
    return (
      <div className="cyber-card p-6 angled-corner-tl animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-primary/20 rounded" />
          <div className="h-6 w-40 bg-primary/20 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted/20 rounded" />
          <div className="h-4 w-3/4 bg-muted/20 rounded" />
        </div>
      </div>
    );
  }

  const isBullish = data.nextHourTrend === "bullish";
  const isBearish = data.nextHourTrend === "bearish";
  const trendColor = isBullish
    ? "text-primary"
    : isBearish
      ? "text-destructive"
      : "text-accent";
  const bgColor = isBullish
    ? "bg-primary/5"
    : isBearish
      ? "bg-destructive/5"
      : "bg-accent/5";
  const borderColor = isBullish
    ? "border-primary/30"
    : isBearish
      ? "border-destructive/30"
      : "border-accent/30";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`cyber-card p-6 angled-corner-tl relative overflow-hidden ${borderColor}`}
    >
      <div className={`absolute inset-0 ${bgColor} opacity-50`} />
      <svg className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
        <circle
          cx="85%"
          cy="50%"
          r="60"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
          className={`${trendColor} circuit-line`}
        />
      </svg>

      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 jagged-corner-small border-2 relative ${borderColor}`}
            >
              <Brain size={24} weight="duotone" className={trendColor} />
              <div
                className={`absolute -top-1 -right-1 w-2 h-2 ${bgColor} rounded-full animate-pulse`}
              />
            </div>
            <div>
              <h3
                className={`text-lg font-bold uppercase tracking-wider ${trendColor}`}
              >
                Neural Forecast
              </h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                AI-Powered Market Analysis
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 ${bgColor} border ${borderColor} cut-corner-br`}>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Sentiment
            </div>
            <div className="flex items-center gap-2">
              {isBullish ? (
                <TrendUp size={16} weight="bold" className={trendColor} />
              ) : isBearish ? (
                <TrendDown size={16} weight="bold" className={trendColor} />
              ) : (
                <div className="w-4 h-0.5 bg-current" />
              )}
              <span className={`text-lg font-bold ${trendColor}`}>
                {Math.abs(data.sentiment).toFixed(1)}
              </span>
            </div>
          </div>

          <div className={`p-3 ${bgColor} border ${borderColor} cut-corner-br`}>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Confidence
            </div>
            <div className={`text-lg font-bold ${trendColor}`}>
              {data.confidence.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className={`p-3 ${bgColor} border-l-2 ${borderColor}`}>
          <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Next Hour Prediction
          </div>
          <div
            className={`text-base font-bold uppercase tracking-wider ${trendColor}`}
          >
            {data.prediction} • {data.confidence.toFixed(0)}% Confidence
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function EnhancedDashboard() {
  const [auth, setAuth] = useKV<UserAuth>("user-auth", {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null,
  });

  const [showLogin, setShowLogin] = useState(false);
  const [botRunning, setBotRunning] = useKV<boolean>("bot-running", false);
  const [paperTradingMode, setPaperTradingMode] = useKV<boolean>(
    "paper-trading-mode",
    true,
  );
  const [isPending, startTransition] = useTransition();
  
  const { data: aiData, isLoading: aiLoading } = useQuery<AISentiment>({
    queryKey: ["ai-sentiment"],
    queryFn: fetchAISentiment,
    refetchInterval: 5000,
    staleTime: 1000,
  });
  
  const [portfolio] = useKV<{
    solanaBalance: number;
    btcBalance: number;
    totalValue: number;
    change24h: number;
    activeAgents: number;
  }>("portfolio-data", {
    solanaBalance: 125.47,
    btcBalance: 0.00234,
    totalValue: 8943.21,
    change24h: 5.72,
    activeAgents: 3,
  });

  const [quickStats, setQuickStats] = useState<QuickStat[]>([
    {
      id: "total-value",
      label: "Total Portfolio",
      value: "$8,943.21",
      change: 5.72,
      icon: <Cube size={24} weight="duotone" />,
      color: "primary",
    },
    {
      id: "today-profit",
      label: "Today's Profit",
      value: "+$342.50",
      change: 12.4,
      icon: <Hexagon size={24} weight="duotone" />,
      color: "primary",
    },
    {
      id: "active-agents",
      label: "Active Agents",
      value: "3/3",
      change: 0,
      icon: <Pentagon size={24} weight="duotone" />,
      color: "accent",
    },
    {
      id: "win-rate",
      label: "Win Rate",
      value: "68.5%",
      change: 2.3,
      icon: <Polygon size={24} weight="duotone" />,
      color: "secondary",
    },
  ]);

  const statsGrid = useMemo(() => quickStats, [quickStats]);

  const quickActions: QuickAction[] = [
    {
      id: "toggle-bot",
      label: botRunning ? "Stop Bot" : "Start Bot",
      icon: botRunning ? (
        <Stop size={20} weight="fill" />
      ) : (
        <Play size={20} weight="fill" />
      ),
      color: botRunning ? "destructive" : "primary",
      action: () => {
        startTransition(() => {
          setBotRunning(!botRunning);
          toast.success(
            botRunning
              ? "Bot stopped - will persist until manually restarted"
              : "Bot started - will continue running even after sign off",
            {
              description: botRunning
                ? "All trading activities paused"
                : `Running in ${paperTradingMode ? "PAPER" : "LIVE"} mode`,
            },
          );
        });
      },
    },
    {
      id: "view-analytics",
      label: "View Analytics",
      icon: <ChartLine size={20} weight="duotone" />,
      color: "accent",
      action: () => {
        const event = new CustomEvent("navigate-tab", { detail: "analytics" });
        window.dispatchEvent(event);
      },
    },
    {
      id: "check-vault",
      label: "Check Vault",
      icon: <Vault size={20} weight="duotone" />,
      color: "secondary",
      action: () => {
        const event = new CustomEvent("navigate-tab", { detail: "vault" });
        window.dispatchEvent(event);
      },
    },
    {
      id: "community",
      label: "Community",
      icon: <Users size={20} weight="duotone" />,
      color: "primary",
      action: () => {
        const event = new CustomEvent("navigate-tab", { detail: "community" });
        window.dispatchEvent(event);
      },
    },
    {
      id: "upgrade-tier",
      label: "Upgrade Tier",
      icon: <Crown size={20} weight="fill" />,
      color: "accent",
      action: () => {
        const event = new CustomEvent("navigate-tab", { detail: "settings" });
        window.dispatchEvent(event);
        setTimeout(() => {
          const subscriptionSection = document.getElementById(
            "subscription-tiers-section",
          );
          if (subscriptionSection) {
            subscriptionSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 300);
      },
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setQuickStats((prev) =>
        prev.map((stat) => ({
          ...stat,
          change: stat.change + (Math.random() - 0.5) * 0.5,
        })),
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!auth?.isAuthenticated) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="cyber-card relative overflow-hidden">
            <div className="absolute inset-0 diagonal-stripes opacity-20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <Wireframe3D
                type="sphere"
                size={256}
                color="secondary"
                animated={true}
              />
            </div>
            <div className="p-8 relative z-10 text-center space-y-6">
              <div className="inline-flex p-8 jagged-corner bg-gradient-to-br from-primary/20 to-accent/20 border-4 border-primary shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.6)]">
                <Brain size={96} weight="duotone" className="text-primary" />
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-[0.2em] uppercase">
                  <span className="text-primary neon-glow-primary">
                    QUANTUM
                  </span>
                  <span className="text-secondary neon-glow-secondary ml-2">
                    FALCON
                  </span>
                </h1>
                <p className="text-lg uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                  AI-POWERED AUTONOMOUS TRADING COCKPIT
                </p>
                <p className="text-base leading-relaxed text-foreground max-w-2xl mx-auto">
                  Access your{" "}
                  <span className="text-primary font-bold">
                    advanced trading dashboard
                  </span>
                  , manage{" "}
                  <span className="text-accent font-bold">AI agents</span>, and
                  monitor your{" "}
                  <span className="text-secondary font-bold">portfolio</span> in
                  real-time
                </p>
              </div>

              <Button
                onClick={() => setShowLogin(true)}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary 
                         shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.6)] hover:shadow-[0_0_40px_oklch(0.72_0.20_195_/_0.8)]
                         transition-all jagged-corner uppercase tracking-[0.2em] font-bold text-lg px-8 py-6"
              >
                <Lightning size={24} weight="fill" className="mr-2" />
                Authenticate System
              </Button>

              <div className="cyber-card-accent p-6 max-w-xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <Crown size={24} className="text-accent" weight="fill" />
                  <span className="text-sm font-bold uppercase tracking-wider text-accent">
                    System Requirements
                  </span>
                </div>
                <div className="text-left space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      size={14}
                      className="text-primary"
                      weight="fill"
                    />
                    <span>Valid Quantum Falcon license key</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      size={14}
                      className="text-primary"
                      weight="fill"
                    />
                    <span>Email address for authentication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      size={14}
                      className="text-primary"
                      weight="fill"
                    />
                    <span>
                      Access to 6 tier levels (Free, Starter, Trader, Pro, Elite, Lifetime)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
      </>
    );
  }

  return (
    <div
      className="space-y-6"
      role="main"
      aria-label="Quantum Falcon Dashboard"
    >
      <NewsTicker />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="cyber-card relative overflow-hidden"
      >
        <div className="absolute inset-0 diagonal-stripes opacity-10 pointer-events-none" />
        <div className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase">
                <span className="text-primary neon-glow-primary">
                  Welcome Back,
                </span>
                <span className="text-foreground ml-2">{auth.username}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="px-3 py-1 bg-accent/20 border border-accent jagged-corner-small">
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">
                    {auth.license?.tier.toUpperCase()} Tier
                  </span>
                </div>
                <div className="px-3 py-1 bg-primary/20 border border-primary jagged-corner-small">
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Bot: {botRunning ? "RUNNING" : "STOPPED"}
                  </span>
                </div>
                <div
                  className="px-3 py-1 border jagged-corner-small"
                  style={{
                    backgroundColor: paperTradingMode
                      ? "oklch(0.68 0.18 330 / 0.2)"
                      : "oklch(0.65 0.25 25 / 0.2)",
                    borderColor: paperTradingMode
                      ? "var(--accent)"
                      : "var(--destructive)",
                  }}
                >
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{
                      color: paperTradingMode
                        ? "var(--accent)"
                        : "var(--destructive)",
                    }}
                  >
                    {paperTradingMode ? "PAPER MODE" : "LIVE TRADING"}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                startTransition(() => {
                  setBotRunning(false);
                  setAuth({
                    isAuthenticated: false,
                    userId: null,
                    username: null,
                    email: null,
                    avatar: null,
                    license: null,
                  });
                  toast.info("Logged out successfully - Bot stopped");
                });
              }}
              className="border-primary/50 hover:border-primary hover:bg-primary/10 jagged-corner-small"
              disabled={isPending}
            >
              {isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </motion.div>

      <LicenseExpiry />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        whileHover={{ scale: 1.01 }}
        className="glass-morph-card p-6 relative overflow-hidden transition-all"
      >
        <div className="absolute inset-0 grid-background opacity-5" />
        <svg className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
          <circle
            cx="90%"
            cy="20%"
            r="40"
            stroke="var(--accent)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5"
            className="circuit-line"
          />
        </svg>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 jagged-corner-small bg-accent/20 border-2 border-accent/50 relative">
              <Database size={28} weight="duotone" className="text-accent" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase tracking-[0.15em] hud-text text-accent">
                TRADING MODE
              </h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                {paperTradingMode
                  ? "Paper trading simulates all features without real funds"
                  : "Live trading with real funds - USE WITH CAUTION"}
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-3 p-4 bg-background/40 backdrop-blur-sm border-2 jagged-corner"
            style={{
              borderColor: paperTradingMode
                ? "var(--accent)"
                : "var(--destructive)",
            }}
          >
            <Label
              htmlFor="paper-mode"
              className="text-sm font-bold uppercase tracking-wide cursor-pointer"
              style={{
                color: paperTradingMode
                  ? "var(--accent)"
                  : "var(--destructive)",
              }}
            >
              {paperTradingMode ? "PAPER MODE" : "LIVE MODE"}
            </Label>
            <Switch
              id="paper-mode"
              checked={paperTradingMode}
              onCheckedChange={(checked) => {
                startTransition(() => {
                  setPaperTradingMode(checked);
                  toast.success(
                    checked
                      ? "Switched to Paper Trading Mode"
                      : "Switched to Live Trading Mode",
                    {
                      description: checked
                        ? "All trades are simulated - no real funds at risk"
                        : "WARNING: Trading with real funds now!",
                    },
                  );
                });
              }}
              disabled={isPending}
            />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="grid" aria-label="Portfolio Quick Stats">
        {statsGrid.map((stat, idx) => (
          <QuickStatsCard key={stat.id} stat={stat} index={idx} />
        ))}
      </div>

      <div className="cyber-card p-6 angled-corners-dual-tl-br">
        <div className="flex items-center gap-3 mb-4">
          <Lightning size={24} weight="fill" className="text-accent" />
          <h2 className="text-xl font-bold uppercase tracking-wider text-accent">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {quickActions.map((action, idx) => (
            <QuickActionButton key={action.id} action={action} index={idx} />
          ))}
        </div>
      </div>

      <AIAdvisor data={aiData} isLoading={aiLoading} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="cyber-card p-6 angled-corner-tl">
          <div className="flex items-center gap-3 mb-4">
            <Robot size={24} weight="fill" className="text-primary" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-primary">
              AI Agent Status
            </h2>
          </div>
          <div className="space-y-3">
            {["Market Analysis", "Strategy Execution", "RL Optimizer"].map(
              (agent, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-muted/20 border-l-2 border-primary cut-corner-br"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="status-indicator animate-pulse-glow"
                        style={{ width: "6px", height: "6px" }}
                      />
                      <span className="text-sm font-bold uppercase tracking-wide">
                        {agent}
                      </span>
                    </div>
                    <span className="text-xs text-primary font-bold">
                      ACTIVE
                    </span>
                  </div>
                  <Progress value={65 + idx * 10} className="h-1" />
                </div>
              ),
            )}
          </div>
        </div>

        <div className="cyber-card p-6 angled-corner-tr">
          <div className="flex items-center gap-3 mb-4">
            <ChartLine size={24} weight="fill" className="text-accent" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-accent">
              Recent Activity
            </h2>
          </div>
          <div className="space-y-2">
            {[
              {
                type: "success",
                msg: "Trade executed: +$45.20 profit",
                time: "2m ago",
              },
              {
                type: "info",
                msg: "Market analysis completed",
                time: "5m ago",
              },
              {
                type: "success",
                msg: "DCA order filled successfully",
                time: "12m ago",
              },
              { type: "info", msg: "Portfolio rebalanced", time: "23m ago" },
            ].map((activity, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs p-2 hover:bg-muted/10 transition-colors angled-corner-br"
              >
                <CheckCircle
                  size={14}
                  className={
                    activity.type === "success"
                      ? "text-primary"
                      : "text-accent"
                  }
                  weight="fill"
                />
                <div className="flex-1">
                  <div className="text-foreground">{activity.msg}</div>
                  <div className="text-muted-foreground text-[10px]">
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BotLogs />
    </div>
  );
}
