import {
  Robot,
  Brain,
  ChartLine,
  Lightning,
  Target,
  TrendUp,
  TrendDown,
  ArrowsClockwise,
  CheckCircle,
  Warning,
  Gauge,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

import { Switch } from "@/components/ui/switch";
import { useKV } from "@github/spark/hooks";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface Agent {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  status: "active" | "idle" | "error";
  metrics: {
    confidence: number;
    actionsToday: number;
    profitContribution: number;
  };
  level: number;
  xp: number;
  xpToNext: number;
}

interface ActivityLog {
  id: string;
  agentId: string;
  action: string;
  type: "trade" | "analysis" | "alert" | "optimization";
  result: "success" | "pending" | "warning";
  timestamp: number;
  profit?: number;
}

const initialAgents: Agent[] = [
  {
    id: "market-analyst",
    name: "Market Analyst",
    description:
      "Scans Solana ecosystem for trading opportunities and market trends",
    enabled: true,
    status: "active",
    metrics: { confidence: 87, actionsToday: 247, profitContribution: 234.56 },
    level: 12,
    xp: 3420,
    xpToNext: 5000,
  },
  {
    id: "strategy-engine",
    name: "Strategy Engine",
    description:
      "Executes DCA schedules and sniping strategies based on market signals",
    enabled: true,
    status: "active",
    metrics: { confidence: 92, actionsToday: 12, profitContribution: 512.33 },
    level: 18,
    xp: 7823,
    xpToNext: 10000,
  },
  {
    id: "rl-optimizer",
    name: "RL Optimizer",
    description:
      "Reinforcement learning model that adapts strategies based on outcomes",
    enabled: true,
    status: "active",
    metrics: { confidence: 78, actionsToday: 3, profitContribution: 89.12 },
    level: 8,
    xp: 1245,
    xpToNext: 3000,
  },
];

const activityTypes = [
  {
    action: "Analyzed SOL/USDC pair",
    type: "analysis" as const,
    result: "success" as const,
  },
  {
    action: "Executed DCA buy order",
    type: "trade" as const,
    result: "success" as const,
    profit: 12.45,
  },
  {
    action: "Detected volatility spike",
    type: "alert" as const,
    result: "warning" as const,
  },
  {
    action: "Optimized strategy parameters",
    type: "optimization" as const,
    result: "success" as const,
  },
  {
    action: "Scanned new token launches",
    type: "analysis" as const,
    result: "success" as const,
  },
  {
    action: "Placed limit order",
    type: "trade" as const,
    result: "pending" as const,
  },
  {
    action: "Risk threshold adjusted",
    type: "optimization" as const,
    result: "success" as const,
  },
  {
    action: "Market pattern identified",
    type: "analysis" as const,
    result: "success" as const,
  },
];

export default function Agents() {
  const [agents, setAgents] = useKV<Agent[]>("trading-agents", initialAgents);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentAggression, setAgentAggression] = useKV<number>(
    "agent-aggression",
    50,
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (!agents) return;

      const activeAgents = agents.filter((a) => a.enabled);
      if (activeAgents.length === 0) return;

      const randomAgent =
        activeAgents[Math.floor(Math.random() * activeAgents.length)];
      const randomActivity =
        activityTypes[Math.floor(Math.random() * activityTypes.length)];

      const newActivity: ActivityLog = {
        id: `${Date.now()}-${Math.random()}`,
        agentId: randomAgent.id,
        action: randomActivity.action,
        type: randomActivity.type,
        result: randomActivity.result,
        timestamp: Date.now(),
        profit: randomActivity.profit,
      };

      setActivityLog((prev) => [newActivity, ...prev].slice(0, 20));
    }, 3000);

    return () => clearInterval(interval);
  }, [agents]);

  const toggleAgent = (agentId: string) => {
    setAgents((current) => {
      if (!current) return initialAgents;
      return current.map((agent) =>
        agent.id === agentId
          ? {
              ...agent,
              enabled: !agent.enabled,
              status: !agent.enabled ? "active" : "idle",
            }
          : agent,
      );
    });

    const agent = agents?.find((a) => a.id === agentId);
    if (agent) {
      toast.success(
        `${agent.name} ${agent.enabled ? "deactivated" : "activated"}`,
        {
          description: agent.enabled
            ? "Agent stopped"
            : "Agent started successfully",
        },
      );
    }
  };

  if (!agents) return null;

  const getAggressionLabel = (value: number) => {
    if (value <= 20) return "CONSERVATIVE";
    if (value <= 40) return "CAUTIOUS";
    if (value <= 60) return "BALANCED";
    if (value <= 80) return "AGGRESSIVE";
    return "MAXIMUM";
  };

  const getAggressionColor = (value: number) => {
    if (value <= 40) return "text-primary";
    if (value <= 60) return "text-accent";
    return "text-destructive";
  };

  const getStatusColor = (status: Agent["status"]) => {
    switch (status) {
      case "active":
        return "bg-secondary neon-glow-secondary";
      case "error":
        return "bg-destructive neon-glow-destructive";
      default:
        return "bg-muted-foreground";
    }
  };

  const getIcon = (agentId: string) => {
    switch (agentId) {
      case "market-analyst":
        return ChartLine;
      case "strategy-engine":
        return Robot;
      case "rl-optimizer":
        return Brain;
      default:
        return Robot;
    }
  };

  const getActivityIcon = (type: ActivityLog["type"]) => {
    switch (type) {
      case "trade":
        return Target;
      case "analysis":
        return ChartLine;
      case "alert":
        return Warning;
      case "optimization":
        return ArrowsClockwise;
      default:
        return CheckCircle;
    }
  };

  const getResultIcon = (result: ActivityLog["result"]) => {
    switch (result) {
      case "success":
        return CheckCircle;
      case "warning":
        return Warning;
      case "pending":
        return ArrowsClockwise;
    }
  };

  const getActivityColor = (type: ActivityLog["type"]) => {
    switch (type) {
      case "trade":
        return "text-secondary";
      case "analysis":
        return "text-primary";
      case "alert":
        return "text-destructive";
      case "optimization":
        return "text-accent";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 blur-3xl opacity-30" />
        <div className="relative">
          <h2 className="text-3xl md:text-4xl font-bold tracking-[0.2em] uppercase hud-text">
            <span className="text-primary neon-glow">AI AGENT</span>
            <span className="text-secondary neon-glow-secondary ml-3">
              COMMAND
            </span>
          </h2>
          <p className="text-muted-foreground uppercase tracking-wide text-sm mt-2">
            AUTONOMOUS TRADING INTELLIGENCE // MULTI-AGENT COORDINATION SYSTEM
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="cyber-card angled-corners-dual-tr-bl">
            <div className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 angled-corner-br border-2 bg-secondary/20 border-secondary neon-glow-accent">
                  <Gauge
                    size={32}
                    weight="duotone"
                    className="text-secondary"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold uppercase tracking-[0.15em] text-secondary hud-text">
                    AGENT AGGRESSION
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                    CONTROL TRADING INTENSITY AND RISK TOLERANCE
                  </p>
                </div>
                <div className="px-4 py-2 angled-corner-tr bg-secondary/20 border-2 border-secondary">
                  <span
                    className={`text-2xl font-bold uppercase tracking-wider neon-glow-secondary ${getAggressionColor(agentAggression ?? 50)}`}
                  >
                    {getAggressionLabel(agentAggression ?? 50)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Slider
                    value={[agentAggression ?? 50]}
                    onValueChange={(value) => setAgentAggression(value[0])}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-3 text-xs uppercase tracking-wider font-bold">
                    <span className="text-primary">SAFE</span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-accent">BALANCED</span>
                    <span className="text-muted-foreground">|</span>
                    <span className="text-destructive">RISKY</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="p-3 angled-corner-tl bg-muted/30 border border-primary/30 relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-[0.15em] font-semibold">
                        Trade Frequency
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted relative overflow-hidden">
                          <div
                            className="absolute inset-0 bg-gradient-to-r from-primary to-secondary"
                            style={{
                              width: `${agentAggression ?? 50}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-primary">
                          {Math.round((agentAggression ?? 50) / 10)}/10
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 angled-corner-tr bg-muted/30 border border-primary/30 relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-[0.15em] font-semibold">
                        Position Size
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted relative overflow-hidden">
                          <div
                            className="absolute inset-0 bg-gradient-to-r from-accent to-destructive"
                            style={{
                              width: `${agentAggression ?? 50}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-bold text-accent">
                          {agentAggression ?? 50}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 angled-corner-br bg-muted/30 border border-primary/30 relative overflow-hidden">
                    <div className="relative z-10">
                      <p className="text-xs text-muted-foreground mb-1 uppercase tracking-[0.15em] font-semibold">
                        Risk Level
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted relative overflow-hidden">
                          <div
                            className="absolute inset-0 bg-gradient-to-r from-secondary to-destructive"
                            style={{
                              width: `${agentAggression ?? 50}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-sm font-bold ${getAggressionColor(agentAggression ?? 50)}`}
                        >
                          {Math.round((agentAggression ?? 50) / 2.5)}/40
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-primary/5 border border-primary/30 relative overflow-hidden">
                  <div className="absolute inset-0 grid-background opacity-10" />
                  <div className="relative z-10">
                    <div className="flex items-start gap-3">
                      <Lightning
                        size={20}
                        weight="duotone"
                        className="text-primary flex-shrink-0 mt-0.5"
                      />
                      <div>
                        <h4 className="font-bold uppercase tracking-wide text-sm mb-2 text-primary">
                          AGGRESSION_IMPACT
                        </h4>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                            Higher aggression = More frequent trades
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                            Larger position sizes with higher risk tolerance
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                            Faster reaction to market opportunities
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                            Lower aggression prioritizes capital preservation
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {agents.map((agent) => {
            const Icon = getIcon(agent.id);
            const isSelected = selectedAgent === agent.id;
            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(isSelected ? null : agent.id)}
                className={`cyber-card angled-corners-dual-tr-bl transition-all cursor-pointer ${
                  agent.enabled
                    ? "scale-100 hover:scale-[1.02]"
                    : "opacity-50 scale-95"
                } ${isSelected ? "ring-2 ring-primary shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.4)]" : ""}`}
              >
                <div className="p-6 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`p-3 angled-corner-br border-2 transition-all relative ${
                          agent.enabled
                            ? "bg-secondary/20 border-secondary neon-glow-accent"
                            : "bg-muted/20 border-muted-foreground"
                        }`}
                      >
                        <Icon
                          size={32}
                          weight="duotone"
                          className={
                            agent.enabled
                              ? "text-secondary"
                              : "text-muted-foreground"
                          }
                        />
                        {agent.enabled && (
                          <div className="absolute -top-1 -right-1">
                            <div className="relative">
                              <Lightning
                                size={16}
                                weight="fill"
                                className="text-secondary animate-pulse-glow"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-bold uppercase tracking-wide text-foreground">
                            {agent.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)} ${
                                agent.enabled ? "animate-pulse-glow" : ""
                              }`}
                            />
                            <div className="px-2 py-0.5 cut-corner-tr bg-primary/20 border border-primary">
                              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                                {agent.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground uppercase tracking-wide mb-4">
                          {agent.description}
                        </p>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="px-3 py-1 angled-corner-tr bg-secondary/20 border border-secondary/50">
                              <span className="text-xs font-bold text-secondary uppercase tracking-wider">
                                LVL {agent.level}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                XP
                              </span>
                              <span className="text-xs font-bold text-primary">
                                {agent.xp} / {agent.xpToNext}
                              </span>
                            </div>
                            <Progress
                              value={(agent.xp / agent.xpToNext) * 100}
                              className="h-1.5 bg-muted"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={agent.enabled}
                      onCheckedChange={() => toggleAgent(agent.id)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 angled-corner-tl bg-muted/30 border border-primary/30 relative overflow-hidden group hover:border-primary/50 transition-all">
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-[0.15em] font-semibold">
                          Confidence
                        </p>
                        <p className="text-2xl font-bold text-primary neon-glow hud-value">
                          {agent.metrics.confidence}%
                        </p>
                      </div>
                    </div>
                    <div className="p-3 angled-corner-tr bg-muted/30 border border-primary/30 relative overflow-hidden group hover:border-primary/50 transition-all">
                      <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-[0.15em] font-semibold">
                          Actions
                        </p>
                        <p className="text-2xl font-bold text-secondary neon-glow-secondary hud-value">
                          {agent.metrics.actionsToday}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 angled-corner-br bg-muted/30 border border-primary/30 relative overflow-hidden group hover:border-primary/50 transition-all">
                      <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10">
                        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-[0.15em] font-semibold">
                          Profit
                        </p>
                        <p className="text-2xl font-bold text-secondary neon-glow-secondary hud-value">
                          +${agent.metrics.profitContribution.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-primary/30">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            Neural Network Status
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-muted relative overflow-hidden">
                              <div
                                className="absolute inset-0 bg-gradient-to-r from-primary to-secondary animate-pulse"
                                style={{ width: "87%" }}
                              />
                            </div>
                            <span className="text-xs font-bold text-primary">
                              87%
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            Model Accuracy
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-muted relative overflow-hidden">
                              <div
                                className="absolute inset-0 bg-gradient-to-r from-secondary to-primary animate-pulse"
                                style={{ width: "94%" }}
                              />
                            </div>
                            <span className="text-xs font-bold text-secondary">
                              94%
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            Training Cycles
                          </p>
                          <p className="text-lg font-bold text-primary hud-value">
                            1,247
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            Last Updated
                          </p>
                          <p className="text-lg font-bold text-secondary hud-value">
                            2m ago
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="cyber-card-accent scan-line-effect">
            <div className="p-4 relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Lightning
                  size={20}
                  weight="fill"
                  className="text-accent animate-pulse-glow"
                />
                <h3 className="text-lg font-bold uppercase tracking-[0.15em] text-accent hud-text">
                  LIVE ACTIVITY
                </h3>
              </div>
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                {activityLog.length === 0 ? (
                  <div className="text-center py-8">
                    <ArrowsClockwise
                      size={32}
                      className="text-muted-foreground mx-auto mb-2 animate-spin"
                    />
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Waiting for agent activity...
                    </p>
                  </div>
                ) : (
                  activityLog.map((activity) => {
                    const agent = agents.find((a) => a.id === activity.agentId);
                    const ActivityIcon = getActivityIcon(activity.type);
                    const ResultIcon = getResultIcon(activity.result);

                    return (
                      <div
                        key={activity.id}
                        className="p-3 bg-muted/20 border-l-2 border-primary/50 hover:border-primary hover:bg-muted/30 transition-all group"
                      >
                        <div className="flex items-start gap-2">
                          <ActivityIcon
                            size={16}
                            weight="duotone"
                            className={`${getActivityColor(activity.type)} mt-0.5 flex-shrink-0`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-foreground truncate">
                              {agent?.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                              {activity.action}
                            </p>
                            {activity.profit && (
                              <p className="text-xs font-bold text-secondary mt-1">
                                +${activity.profit.toFixed(2)}
                              </p>
                            )}
                            <p className="text-[10px] text-muted-foreground/70 mt-1 uppercase tracking-wider">
                              {new Date(
                                activity.timestamp,
                              ).toLocaleTimeString()}
                            </p>
                          </div>
                          <ResultIcon
                            size={14}
                            weight="fill"
                            className={`flex-shrink-0 mt-0.5 ${
                              activity.result === "success"
                                ? "text-secondary"
                                : activity.result === "warning"
                                  ? "text-destructive"
                                  : "text-primary animate-spin"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="cyber-card scan-line-effect">
            <div className="p-4 relative z-10">
              <h3 className="text-lg font-bold uppercase tracking-[0.15em] text-primary hud-text mb-4">
                PERFORMANCE
              </h3>

              <div className="space-y-4">
                <div className="p-3 jagged-corner bg-muted/30 border border-primary/30 text-center">
                  <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-[0.15em] font-semibold">
                    Total Trades
                  </p>
                  <p className="text-3xl font-bold text-primary neon-glow hud-value">
                    {agents.reduce(
                      (sum, agent) => sum + agent.metrics.actionsToday,
                      0,
                    )}
                  </p>
                </div>
                <div className="p-3 jagged-corner bg-muted/30 border border-secondary/30 text-center">
                  <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-[0.15em] font-semibold">
                    Combined Profit
                  </p>
                  <p className="text-3xl font-bold text-secondary neon-glow-secondary hud-value">
                    +$
                    {agents
                      .reduce(
                        (sum, agent) => sum + agent.metrics.profitContribution,
                        0,
                      )
                      .toFixed(2)}
                  </p>
                </div>
                <div className="p-3 jagged-corner bg-muted/30 border border-primary/30 text-center">
                  <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-[0.15em] font-semibold">
                    Avg Confidence
                  </p>
                  <p className="text-3xl font-bold text-primary neon-glow hud-value">
                    {Math.round(
                      agents.reduce(
                        (sum, agent) => sum + agent.metrics.confidence,
                        0,
                      ) / agents.length,
                    )}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="cyber-card group hover:scale-105 transition-all cursor-pointer">
          <div className="p-4 relative z-10 text-center">
            <div className="inline-flex p-3 jagged-corner-small bg-primary/20 border border-primary mb-3">
              <TrendUp size={28} weight="duotone" className="text-primary" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] mb-1 font-semibold">
              Success Rate
            </p>
            <p className="text-4xl font-bold text-primary neon-glow hud-value">
              94.2%
            </p>
          </div>
        </div>

        <div className="cyber-card-accent group hover:scale-105 transition-all cursor-pointer">
          <div className="p-4 relative z-10 text-center">
            <div className="inline-flex p-3 jagged-corner-small bg-accent/20 border border-accent mb-3">
              <Target size={28} weight="duotone" className="text-accent" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] mb-1 font-semibold">
              Precision Score
            </p>
            <p className="text-4xl font-bold text-accent neon-glow-accent hud-value">
              8.7/10
            </p>
          </div>
        </div>

        <div className="cyber-card group hover:scale-105 transition-all cursor-pointer">
          <div className="p-4 relative z-10 text-center">
            <div className="inline-flex p-3 jagged-corner-small bg-secondary/20 border border-secondary mb-3">
              <Brain size={28} weight="duotone" className="text-secondary" />
            </div>
            <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] mb-1 font-semibold">
              AI Models
            </p>
            <p className="text-4xl font-bold text-secondary neon-glow-secondary hud-value">
              12
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
