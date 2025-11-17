import {
  Robot,
  Brain,
  ChartLine,
  Lightning,
  TrendUp,
  Target,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { 
  HolographicCard, 
  HolographicCardHeader, 
  HolographicCardTitle, 
  HolographicCardContent 
} from "@/components/ui/holographic-card";
import { NeonBadge } from "@/components/ui/neon-badge";
import { NeonProgress } from "@/components/ui/neon-progress";

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: any;
  iconColor: string;
  enabled: boolean;
  level: number;
  xp: number;
  xpToNext: number;
  metrics: {
    confidence: number;
    actions: number;
    profit: number;
  };
}

interface ActivityLog {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  timestamp: string;
}

const initialAgents: Agent[] = [
  {
    id: "market-analyst",
    name: "MARKET ANALYST",
    description: "SCANS SOLANA ECOSYSTEM FOR TRADING OPPORTUNITIES AND MARKET TRENDS",
    icon: ChartLine,
    iconColor: "text-secondary",
    enabled: true,
    level: 12,
    xp: 3420,
    xpToNext: 5000,
    metrics: { confidence: 87, actions: 247, profit: 234.56 },
  },
  {
    id: "strategy-engine",
    name: "STRATEGY ENGINE",
    description: "EXECUTES DCA SCHEDULES AND SNIPING STRATEGIES BASED ON MARKET SIGNALS",
    icon: Robot,
    iconColor: "text-primary",
    enabled: true,
    level: 18,
    xp: 7823,
    xpToNext: 10000,
    metrics: { confidence: 92, actions: 12, profit: 512.33 },
  },
  {
    id: "rl-optimizer",
    name: "RL OPTIMIZER",
    description: "REINFORCEMENT LEARNING MODEL THAT ADAPTS STRATEGIES BASED ON OUTCOMES",
    icon: Brain,
    iconColor: "text-[#FF00FF]",
    enabled: true,
    level: 8,
    xp: 1245,
    xpToNext: 3000,
    metrics: { confidence: 78, actions: 3, profit: 89.12 },
  },
];

export default function AgentsExact() {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([
    {
      id: "1",
      agentId: "market-analyst",
      agentName: "MARKET ANALYST",
      action: "Analyzed SOL/USDC pair",
      timestamp: "10:00:10 PM",
    },
  ]);

  const toggleAgent = (agentId: string) => {
    setAgents((prev) =>
      prev.map((agent) =>
        agent.id === agentId ? { ...agent, enabled: !agent.enabled } : agent
      )
    );
    const agent = agents.find((a) => a.id === agentId);
    if (agent) {
      toast.success(`${agent.name} ${agent.enabled ? "DEACTIVATED" : "ACTIVATED"}`);
    }
  };

  const totalTrades = useMemo(
    () => agents.reduce((sum, a) => sum + a.metrics.actions, 0),
    [agents]
  );

  const combinedProfit = useMemo(
    () => agents.reduce((sum, a) => sum + a.metrics.profit, 0),
    [agents]
  );

  const avgConfidence = useMemo(
    () =>
      agents.reduce((sum, a) => sum + a.metrics.confidence, 0) / agents.length,
    [agents]
  );

  return (
    <div className="relative min-h-full">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none technical-grid opacity-10" />

      <div className="relative z-10 space-y-6 pb-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold uppercase tracking-[0.15em] text-primary neon-glow-primary hud-text">
            AI AGENT COMMAND
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] data-label">
            AUTONOMOUS TRADING INTELLIGENCE // MULTI-AGENT COORDINATION SYSTEM
          </p>
          <div className="mx-auto w-4/5 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-[1fr_35%] gap-6">
          {/* Left Column - Agent Cards */}
          <div className="space-y-6">
            {agents.map((agent, idx) => {
              const Icon = agent.icon;
              const xpPercent = (agent.xp / agent.xpToNext) * 100;
              
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <HolographicCard variant="primary" glow className="p-6 space-y-4 angled-corners-dual-tl-br">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 bg-background/50 border-2 border-current jagged-corner-small ${agent.iconColor}`}>
                          <Icon size={32} weight="duotone" className="animate-pulse-slow" />
                        </div>
                        <h3 className="text-xl font-bold uppercase tracking-wide hud-text">
                          {agent.name}
                        </h3>
                        <NeonBadge variant="accent" glow pulse>
                          <div className="w-2 h-2 bg-accent rounded-full animate-pulse mr-1" />
                          ACTIVE
                        </NeonBadge>
                      </div>
                      <Switch
                        checked={agent.enabled}
                        onCheckedChange={() => toggleAgent(agent.id)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>

                    {/* Description */}
                    <p className="text-sm text-primary uppercase tracking-wide data-label">
                      {agent.description}
                    </p>

                    {/* Level & XP */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <NeonBadge variant="secondary" glow className="text-xs">
                          LVL {agent.level}
                        </NeonBadge>
                        <span className="text-xs text-muted-foreground font-mono">
                          {agent.xp} / {agent.xpToNext}
                        </span>
                      </div>
                      <NeonProgress value={xpPercent} max={100} variant="accent" animate showLabel={false} />
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-background/50 border-2 border-primary/40 angled-corner-tr">
                        <div className="data-label mb-2">
                          Confidence
                        </div>
                        <div className="hud-readout text-4xl">
                          {agent.metrics.confidence}%
                        </div>
                      </div>
                      <div className="text-center p-4 bg-background/50 border-2 border-primary/40 jagged-corner-small">
                        <div className="data-label mb-2">
                          Actions
                        </div>
                        <div className="text-4xl font-bold text-foreground">
                          {agent.metrics.actions}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-background/50 border-2 border-accent/40 angled-corner-bl">
                        <div className="data-label mb-2">
                          Profit
                        </div>
                        <div className="text-4xl font-bold text-accent neon-glow-accent">
                          +${agent.metrics.profit.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </HolographicCard>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Live Activity Panel */}
            <HolographicCard variant="secondary" glow className="p-6 space-y-4 h-[400px] flex flex-col">
              <div className="flex items-center gap-2">
                <Lightning size={20} weight="fill" className="text-accent animate-pulse" />
                <h2 className="text-lg font-bold uppercase tracking-wide text-secondary neon-glow hud-text">
                  LIVE ACTIVITY
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin space-y-3">
                {activityLog.map((log) => {
                  const agent = agents.find((a) => a.id === log.agentId);
                  const Icon = agent?.icon || ChartLine;
                  return (
                    <div
                      key={log.id}
                      className="p-3 bg-background/30 border-l-2 border-secondary angled-corner-br data-stream space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={16} className="text-secondary" weight="fill" />
                        <span className="text-xs font-bold uppercase data-label">
                          {log.agentName}
                        </span>
                      </div>
                      <div className="text-sm text-foreground font-medium">
                        {log.action}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono text-right">
                        {log.timestamp}
                      </div>
                    </div>
                  );
                })}
              </div>
            </HolographicCard>

            {/* Performance Panel */}
            <HolographicCard variant="accent" glow className="p-6 space-y-4">
              <HolographicCardTitle className="text-lg">
                PERFORMANCE
              </HolographicCardTitle>
              <div className="space-y-4">
                <div className="text-center p-4 bg-background/50 border-2 border-secondary/40 jagged-corner-small">
                  <div className="data-label mb-2">
                    Total Trades
                  </div>
                  <div className="hud-readout text-5xl">{totalTrades}</div>
                </div>
                <div className="text-center p-4 bg-background/50 border-2 border-accent/40 angled-corner-tr">
                  <div className="data-label mb-2">
                    Combined Profit
                  </div>
                  <div className="text-5xl font-bold text-accent neon-glow-accent">
                    +${combinedProfit.toFixed(2)}
                  </div>
                </div>
                <div className="text-center p-4 bg-background/50 border-2 border-primary/40 angled-corner-bl">
                  <div className="data-label mb-2">
                    Avg Confidence
                  </div>
                  <div className="hud-readout text-5xl">
                    {avgConfidence.toFixed(0)}%
                  </div>
                </div>
              </div>
            </HolographicCard>
          </div>
        </div>

        {/* Bottom Summary Row */}
        <div className="grid grid-cols-3 gap-6">
          <HolographicCard variant="primary" glow className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <TrendUp size={24} className="text-primary animate-pulse-slow" weight="fill" />
            </div>
            <div className="data-label">
              Success Rate
            </div>
            <div className="hud-readout text-5xl">94.2%</div>
          </HolographicCard>
          <HolographicCard variant="secondary" glow className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <Target size={24} className="text-secondary animate-pulse-slow" weight="fill" />
            </div>
            <div className="data-label">
              Precision Score
            </div>
            <div className="text-5xl font-bold text-secondary neon-glow">8.7/10</div>
            <NeonProgress value={87} max={100} variant="secondary" animate showLabel={false} />
          </HolographicCard>
          <HolographicCard variant="accent" glow className="p-6 text-center space-y-4">
            <div className="flex justify-center">
              <Brain size={24} className="text-accent animate-pulse" weight="fill" />
            </div>
            <div className="data-label">
              AI Models
            </div>
            <div className="text-5xl font-bold text-accent neon-glow-accent">12</div>
          </HolographicCard>
        </div>
      </div>
    </div>
  );
}
