import {
  Robot,
  Brain,
  ChartLine,
  Shield,
  Scales,
  Fire,
  ArrowUp,
  Circle,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

interface Agent {
  id: number;
  name: string;
  description: string;
  icon: any;
  metrics: {
    cpu: number;
    memory: number;
    status: number;
  };
}

const agents: Agent[] = [
  {
    id: 1,
    name: "Market Analyst",
    description:
      "Continuously scans the Solana ecosystem for trading opportunities and market trends.",
    icon: ChartLine,
    metrics: { cpu: 45, memory: 32, status: 100 },
  },
  {
    id: 2,
    name: "Strategy Engine",
    description:
      "Executes DCA schedules and sniping strategies based on market signals.",
    icon: Robot,
    metrics: { cpu: 52, memory: 41, status: 100 },
  },
  {
    id: 3,
    name: "RL Optimizer",
    description:
      "Reinforcement learning model that adapts strategies based on outcomes.",
    icon: Brain,
    metrics: { cpu: 38, memory: 28, status: 100 },
  },
];

const aggressionLevels = [
  {
    level: "Cautious",
    icon: Shield,
    color: "border-primary",
    description:
      "Conservative risk-taking, low-frequency trades, focus on preservation.",
  },
  {
    level: "Moderate",
    icon: Scales,
    color: "border-secondary",
    description: "Balanced approach, medium risk, steady growth.",
  },
  {
    level: "Aggressive",
    icon: Fire,
    color: "border-destructive",
    description:
      "High-risk trading, frequent actions, potential for high returns.",
  },
];

const pipelineSteps = [
  "Market Data Ingestion: Real-time data from multiple sources including DEXs and oracles.",
  "Signal Processing: Analyze trends, volatility, and patterns using ML algorithms.",
  "Strategy Selection: Choose optimal trading strategy based on current conditions.",
  "Order Execution: Execute trades with minimal latency and slippage control.",
  "Performance Tracking: Monitor outcomes and feed back into RL model for optimization.",
];

export default function AgentsNew() {
  const [activeSubTab, setActiveSubTab] = useState("overview");
  const [activeArchTab, setActiveArchTab] = useState("architecture");
  const [aggressionValue, setAggressionValue] = useState([1]);

  const handleAggressionChange = (value: number[]) => {
    setAggressionValue(value);
    const level = value[0] === 1 ? "Cautious" : value[0] === 2 ? "Moderate" : "Aggressive";
    toast.success(`Bot aggression set to ${level}`, {
      description: `Level ${value[0]} activated`,
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold uppercase tracking-wider text-secondary neon-glow-secondary">
          MULTI-AGENT SYSTEM
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-5xl">
          The Quantum Falcon multi-agent system utilizes advanced reinforcement
          learning, self-optimizing algorithms, and concurrent trading
          intelligence. Each agent operates independently while coordinating
          through shared knowledge to optimize performance.
        </p>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex gap-2">
        {["overview", "settings", "logs", "analytics"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-6 py-2 text-sm font-semibold uppercase tracking-wider rounded border-2 transition-all ${
              activeSubTab === tab
                ? "bg-primary/10 border-primary text-primary shadow-[0_0_8px_currentColor]"
                : "border-primary/30 text-muted-foreground hover:border-primary/50 hover:text-primary"
            }`}
          >
            {tab === "overview" ? "Bot Overview" : `Bot ${tab}`}
          </button>
        ))}
      </div>

      {/* System Metrics Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "System Uptime", value: "94.7%", color: "text-primary" },
          { label: "Total Trades", value: "1,241", color: "text-foreground" },
          { label: "Success Rate", value: "81.3%", color: "text-accent" },
          { label: "Total Profit", value: "$2,035", color: "text-primary" },
        ].map((metric, i) => (
          <div
            key={i}
            className="cyber-card p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                {metric.label}
              </span>
              {i === 0 && <ArrowUp size={16} className="text-primary" />}
            </div>
            <div className={`text-2xl font-bold ${metric.color}`}>
              {metric.value}
            </div>
          </div>
        ))}
      </div>

      {/* Bot Aggression Section */}
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold uppercase tracking-widest text-primary neon-glow-primary">
            BOT AGGRESSION
          </h2>
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 border-2 border-primary rounded bg-primary/10 text-xl font-bold text-primary">
              {aggressionValue[0]}
            </div>
            <span className="text-xl font-semibold uppercase tracking-wider text-primary">
              {aggressionValue[0] === 1
                ? "CAUTIOUS"
                : aggressionValue[0] === 2
                  ? "MODERATE"
                  : "AGGRESSIVE"}
            </span>
          </div>
          <div className="max-w-2xl mx-auto px-8">
            <Slider
              value={aggressionValue}
              onValueChange={handleAggressionChange}
              min={1}
              max={3}
              step={1}
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* Aggression Level Options */}
        <div className="grid grid-cols-3 gap-6">
          {aggressionLevels.map((level, i) => {
            const Icon = level.icon;
            return (
              <button
                key={i}
                onClick={() => handleAggressionChange([i + 1])}
                className={`cyber-card p-6 space-y-4 text-left transition-all hover:scale-105 ${level.color} ${
                  aggressionValue[0] === i + 1
                    ? "shadow-[0_0_20px_currentColor]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={24} className="text-current" />
                  <h3 className="text-lg font-bold uppercase tracking-wide">
                    {level.level}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {level.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Detailed Description */}
        <p className="text-xs text-primary/80 leading-relaxed max-w-6xl">
          Set aggression level. Higher levels increase trade frequency, risk
          exposure, and potential returns. Cautious mode prioritizes capital
          preservation over growth. Moderate mode balances risk and reward.
          Aggressive mode optimizes for maximum returns but increases
          volatility. Current setting: {aggressionValue[0] === 1 ? "Cautious" : aggressionValue[0] === 2 ? "Moderate" : "Aggressive"} (Level {aggressionValue[0]}). System
          will automatically adjust based on market conditions unless overridden.
        </p>
      </div>

      {/* System Status Indicators */}
      <div className="flex flex-wrap gap-4">
        {[
          "System Status ONLINE",
          "Network CONNECTED",
          "Algorithms OPERATIONAL",
          "Agents ACTIVE",
        ].map((status, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-4 py-2 bg-black/50 border border-primary/30 rounded-full"
          >
            <Circle size={8} weight="fill" className="text-accent" />
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              {status}
            </span>
          </div>
        ))}
      </div>

      {/* Sub-Section Tabs */}
      <div className="flex gap-2">
        {["architecture", "asset", "configuration"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveArchTab(tab)}
            className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider rounded border transition-all ${
              activeArchTab === tab
                ? "bg-primary/10 border-primary text-primary"
                : "border-primary/30 text-muted-foreground hover:border-primary/50"
            }`}
          >
            {tab === "asset" ? "Asset Detail" : tab}
          </button>
        ))}
      </div>

      {/* System Architecture Panel */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold uppercase tracking-wider text-secondary">
          SYSTEM ARCHITECTURE
        </h2>
        <div className="grid grid-cols-3 gap-6">
          {agents.map((agent) => {
            const Icon = agent.icon;
            return (
              <div
                key={agent.id}
                className="cyber-card p-6 space-y-4 border-secondary"
              >
                <div className="flex items-center justify-center w-16 h-16 mx-auto bg-secondary/10 border-2 border-secondary rounded-lg">
                  <Icon size={32} className="text-secondary" />
                </div>
                <h3 className="text-center text-base font-bold uppercase tracking-wide">
                  AGENT {agent.id} {agent.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed text-center">
                  {agent.description}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">CPU</span>
                    <span className="text-primary font-semibold">
                      {agent.metrics.cpu}%
                    </span>
                  </div>
                  <Progress value={agent.metrics.cpu} className="h-1" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Memory</span>
                    <span className="text-primary font-semibold">
                      {agent.metrics.memory}%
                    </span>
                  </div>
                  <Progress value={agent.metrics.memory} className="h-1" />
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Status</span>
                    <span className="text-accent font-semibold">
                      {agent.metrics.status}%
                    </span>
                  </div>
                  <Progress value={agent.metrics.status} className="h-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Flow Pipeline */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold uppercase tracking-wider text-primary">
          DATA FLOW PIPELINE
        </h2>
        <div className="space-y-3">
          {pipelineSteps.map((step, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className="text-primary font-bold">•</span>
              <span className="text-foreground/90 leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
