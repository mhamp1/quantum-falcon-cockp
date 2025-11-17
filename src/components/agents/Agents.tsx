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
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold uppercase tracking-[0.15em] text-primary neon-glow-primary">
            AI AGENT COMMAND
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-[0.2em]">
            AUTONOMOUS TRADING INTELLIGENCE // MULTI-AGENT COORDINATION SYSTEM
          </p>
          <div className="mx-auto w-4/5 h-px bg-primary/50" />
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
                  className="cyber-card p-6 space-y-4"
                  style={{
                    clipPath:
                      "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
                  }}
                >
                  {/* Header Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded ${agent.iconColor}`}>
                        <Icon size={32} weight="duotone" />
                      </div>
                      <h3 className="text-xl font-bold uppercase tracking-wide">
                        {agent.name}
                      </h3>
                      <div className="flex items-center gap-2 px-3 py-1 bg-accent/20 border border-accent rounded-full">
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-accent uppercase">
                          ACTIVE
                        </span>
                      </div>
                    </div>
                    <Switch
                      checked={agent.enabled}
                      onCheckedChange={() => toggleAgent(agent.id)}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    {agent.description}
                  </p>

                  {/* Level & XP */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="px-2 py-1 bg-secondary/20 border border-secondary rounded text-xs font-bold uppercase">
                        LVL {agent.level}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {agent.xp} / {agent.xpToNext}
                      </span>
                    </div>
                    <Progress value={xpPercent} className="h-1" />
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-black/50 border border-primary/30 rounded">
                      <div className="text-xs text-muted-foreground uppercase mb-2">
                        Confidence
                      </div>
                      <div className="text-4xl font-bold text-primary">
                        {agent.metrics.confidence}%
                      </div>
                    </div>
                    <div className="text-center p-4 bg-black/50 border border-primary/30 rounded">
                      <div className="text-xs text-muted-foreground uppercase mb-2">
                        Actions
                      </div>
                      <div className="text-4xl font-bold">
                        {agent.metrics.actions}
                      </div>
                    </div>
                    <div className="text-center p-4 bg-black/50 border border-accent/30 rounded">
                      <div className="text-xs text-muted-foreground uppercase mb-2">
                        Profit
                      </div>
                      <div className="text-4xl font-bold text-accent">
                        +${agent.metrics.profit.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Live Activity Panel */}
            <div className="cyber-card p-6 space-y-4 h-[400px] flex flex-col">
              <div className="flex items-center gap-2">
                <Lightning size={20} weight="fill" className="text-[#FFFF00]" />
                <h2 className="text-lg font-bold uppercase tracking-wide text-[#FF00FF]">
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
                      className="p-3 bg-black/50 border border-primary/20 rounded space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={16} className="text-secondary" />
                        <span className="text-xs font-bold uppercase">
                          {log.agentName}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {log.action}
                      </div>
                      <div className="text-xs text-muted-foreground/60 text-right">
                        {log.timestamp}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Panel */}
            <div className="cyber-card p-6 space-y-4 border-[#FF00FF]">
              <h2 className="text-lg font-bold uppercase tracking-wide text-primary">
                PERFORMANCE
              </h2>
              <div className="space-y-4">
                <div className="text-center p-4 bg-black/50 border border-[#FF00FF]/30 rounded">
                  <div className="text-xs text-muted-foreground uppercase mb-2">
                    Total Trades
                  </div>
                  <div className="text-5xl font-bold">{totalTrades}</div>
                </div>
                <div className="text-center p-4 bg-black/50 border border-accent/30 rounded">
                  <div className="text-xs text-muted-foreground uppercase mb-2">
                    Combined Profit
                  </div>
                  <div className="text-5xl font-bold text-accent">
                    +${combinedProfit.toFixed(2)}
                  </div>
                </div>
                <div className="text-center p-4 bg-black/50 border border-primary/30 rounded">
                  <div className="text-xs text-muted-foreground uppercase mb-2">
                    Avg Confidence
                  </div>
                  <div className="text-5xl font-bold text-primary">
                    {avgConfidence.toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Summary Row */}
        <div className="grid grid-cols-3 gap-6">
          <div className="cyber-card p-6 text-center space-y-4">
            <div className="flex justify-center">
              <TrendUp size={24} className="text-primary" />
            </div>
            <div className="text-xs text-muted-foreground uppercase">
              Success Rate
            </div>
            <div className="text-5xl font-bold text-primary">94.2%</div>
          </div>
          <div className="cyber-card p-6 text-center space-y-4 border-[#FF00FF]">
            <div className="flex justify-center">
              <Target size={24} className="text-[#FF00FF]" />
            </div>
            <div className="text-xs text-muted-foreground uppercase">
              Precision Score
            </div>
            <div className="text-5xl font-bold text-[#FF00FF]">8.7/10</div>
            <Progress value={87} className="h-1" />
          </div>
          <div className="cyber-card p-6 text-center space-y-4 border-secondary">
            <div className="flex justify-center">
              <Brain size={24} className="text-secondary" />
            </div>
            <div className="text-xs text-muted-foreground uppercase">
              AI Models
            </div>
            <div className="text-5xl font-bold text-secondary">12</div>
          </div>
        </div>
      </div>
    </div>
  );
}
