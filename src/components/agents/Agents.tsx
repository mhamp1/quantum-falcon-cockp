import {
  Robot,
  Brain,
  ChartLine,
  Lightning,
  TrendUp,
  Target,
  ShieldCheck,
  ChartBar,
  Crosshair,
  Info,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import imagePlaceholder from "@/assets/images/logo.png";

export default function Agents() {
  const [botAggression, setBotAggression] = useState(68);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="cyber-card p-6 space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 border-2 border-primary rounded flex items-center justify-center bg-primary/10">
            <Robot size={32} weight="duotone" className="text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold uppercase tracking-wider text-primary">
                MULTI-AGENT SYSTEM
              </h1>
              <Badge className="bg-destructive/20 text-destructive border-destructive uppercase text-xs">
                BETA TESTING
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The Quantum Falcon deploys a coordinated multi-agent AI system for
              analyzing market trends, timing executions, and optimizing
              strategies. Each agent operates autonomously while executing
              strategies through a unified operational framework.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-background/80 border border-primary/30 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-primary" />
              <span className="text-xs uppercase text-muted-foreground tracking-wide">
                Online Agents
              </span>
            </div>
            <div className="text-3xl font-bold text-primary">84.1%</div>
          </div>
          <div className="bg-background/80 border border-primary/30 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <ChartBar size={16} className="text-primary" />
              <span className="text-xs uppercase text-muted-foreground tracking-wide">
                Total Trades
              </span>
            </div>
            <div className="text-3xl font-bold">1,841</div>
          </div>
          <div className="bg-background/80 border border-primary/30 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendUp size={16} className="text-primary" />
              <span className="text-xs uppercase text-muted-foreground tracking-wide">
                Success Rate
              </span>
            </div>
            <div className="text-3xl font-bold text-[#FF00FF]">87.3%</div>
          </div>
          <div className="bg-background/80 border border-primary/30 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightning size={16} className="text-accent" />
              <span className="text-xs uppercase text-muted-foreground tracking-wide">
                Total Profit
              </span>
            </div>
            <div className="text-3xl font-bold text-accent">$2935</div>
          </div>
        </div>
      </div>

      <div className="cyber-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 border-2 border-primary rounded flex items-center justify-center bg-primary/10">
            <Crosshair size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wide text-primary">
              BOT AGGRESSION
            </h2>
            <p className="text-xs text-muted-foreground uppercase">
              Moderates Risk Posture
            </p>
          </div>
        </div>

        <div className="bg-background/50 border border-primary/20 rounded p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lightning size={20} className="text-primary" />
              <span className="text-sm font-bold uppercase text-muted-foreground">
                Current Level
              </span>
            </div>
            <div className="text-4xl font-bold text-primary">{botAggression}%</div>
          </div>
          <Slider
            value={[botAggression]}
            onValueChange={(v) => setBotAggression(v[0])}
            min={0}
            max={100}
            step={1}
            className="mb-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>PASSIVE</span>
            <span>MODERATE</span>
            <span>AGGRESSIVE</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-background/50 border-2 border-primary rounded p-4 text-center">
            <div className="w-12 h-12 border-2 border-primary rounded mx-auto mb-3 flex items-center justify-center bg-primary/10">
              <ShieldCheck size={24} className="text-primary" />
            </div>
            <h3 className="text-sm font-bold uppercase text-primary mb-1">
              CAUTIOUS
            </h3>
            <p className="text-xs text-muted-foreground">
              Conservative capital allocation with risk protection
            </p>
          </div>
          <div className="bg-background/50 border border-primary/30 rounded p-4 text-center">
            <div className="w-12 h-12 border-2 border-[#FF00FF] rounded mx-auto mb-3 flex items-center justify-center bg-[#FF00FF]/10">
              <Target size={24} className="text-[#FF00FF]" />
            </div>
            <h3 className="text-sm font-bold uppercase text-[#FF00FF] mb-1">
              MODERATE
            </h3>
            <p className="text-xs text-muted-foreground">
              Balanced risk-return with measured position sizing
            </p>
          </div>
          <div className="bg-background/50 border border-primary/30 rounded p-4 text-center">
            <div className="w-12 h-12 border-2 border-destructive rounded mx-auto mb-3 flex items-center justify-center bg-destructive/10">
              <Lightning size={24} className="text-destructive" />
            </div>
            <h3 className="text-sm font-bold uppercase text-destructive mb-1">
              AGGRESSIVE
            </h3>
            <p className="text-xs text-muted-foreground">
              Higher leverage and risk for elevated returns
            </p>
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/30 rounded p-4 flex items-start gap-3">
          <Info size={20} className="text-primary mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <span className="text-primary font-bold">
              Conservative strategies activated through Q1 and Q2.
            </span>{" "}
            Our bots dynamically adjust trade sizes, frequencies, stop-losses,
            and take-profit targets to align with your specified risk profile.
            Always exercise caution when adjusting.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="cyber-card p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Current Status
            </span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "AGENTS", value: "ONLINE", status: "online" },
              { label: "NETWORK", value: "CONNECTED", status: "connected" },
              { label: "STATUS", value: "OPERATIONAL", status: "operational" },
              { label: "UPTIME", value: "ACTIVE", status: "active" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="mb-2">
                  <div className="w-3 h-3 rounded-full bg-accent mx-auto animate-pulse" />
                </div>
                <div className="text-xs uppercase text-muted-foreground mb-1">
                  {item.label}
                </div>
                <div className="text-sm font-bold uppercase text-foreground">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-4 border-t border-primary/20">
            <button className="text-xs uppercase text-primary hover:text-primary/80 font-bold">
              ⚡ Monitoring
            </button>
            <button className="text-xs uppercase text-primary hover:text-primary/80 font-bold">
              📊 Agent Status
            </button>
            <button className="text-xs uppercase text-primary hover:text-primary/80 font-bold">
              🔄 System Logs
            </button>
          </div>
        </div>

        <div className="cyber-card p-6">
          <div className="w-full h-full flex items-center justify-center border-2 border-primary/30 rounded bg-background/50">
            <div className="text-center">
              <div className="text-6xl mb-2">🤖</div>
              <div className="text-sm uppercase tracking-widest text-primary font-bold">
                CAUTIOUS
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="cyber-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <ChartBar size={20} className="text-primary" />
          <h2 className="text-xl font-bold uppercase tracking-wide">
            SYSTEM ARCHITECTURE
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            {
              id: 1,
              name: "AGENT 1",
              role: "MARKET ANALYST",
              status:
                "Analyzes comprehensive market data for token opportunities",
              bars: [
                { label: "Accuracy", value: 94 },
                { label: "Speed", value: 88 },
                { label: "Uptime", value: 99 },
              ],
            },
            {
              id: 2,
              name: "AGENT 2",
              role: "STRATEGY ENGINE",
              status: "Executes trading strategies with precision timing",
              bars: [
                { label: "Execution", value: 96 },
                { label: "Risk Mgmt", value: 91 },
                { label: "Returns", value: 87 },
              ],
            },
            {
              id: 3,
              name: "AGENT 3",
              role: "RL OPTIMIZER",
              status:
                "Self-optimizing reinforcement learning for strategy refinement",
              bars: [
                { label: "Learning", value: 89 },
                { label: "Adaptation", value: 92 },
                { label: "Performance", value: 85 },
              ],
            },
          ].map((agent) => (
            <div
              key={agent.id}
              className="bg-background/50 border border-primary/30 rounded p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <Robot size={20} className="text-primary" />
                <span className="text-sm font-bold uppercase text-primary">
                  {agent.name}
                </span>
              </div>
              <div className="text-xs font-bold uppercase text-[#FF00FF]">
                {agent.role}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {agent.status}
              </p>
              <div className="space-y-2 pt-2 border-t border-primary/20">
                {agent.bars.map((bar) => (
                  <div key={bar.label} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20">
                      {bar.label}
                    </span>
                    <div className="flex-1 h-2 bg-background/80 rounded overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${bar.value}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-primary w-8 text-right">
                      {bar.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-primary/10 border border-primary/30 rounded p-4">
          <div className="flex items-start gap-3">
            <Info size={20} className="text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold uppercase text-primary mb-2">
                📊 DATA FLOW PIPELINE
              </h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>
                  <span className="text-foreground font-bold">1.</span> Signal
                  Processing: Aggregate feeds from on-chain, wallet, events and
                  socials
                </div>
                <div>
                  <span className="text-foreground font-bold">2.</span> Strategic
                  Selection: AI filters signals against crypto capital goals
                </div>
                <div>
                  <span className="text-foreground font-bold">3.</span> Order
                  Generation: Automated order signals that send to exchange or
                  DEX wallet
                </div>
                <div>
                  <span className="text-foreground font-bold">4.</span>{" "}
                  Post-Position Tracking: Real-time monitoring of outcomes and
                  automatic adjustments
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
