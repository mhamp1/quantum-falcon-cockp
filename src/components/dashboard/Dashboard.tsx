import { useState, useEffect } from "react";
import {
  Play,
  ChartLine,
  Users,
  SpeakerHigh,
  SpeakerX,
  Robot,
  CheckCircle,
  Brain,
} from "@phosphor-icons/react";
import { useKV } from "@github/spark/hooks";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  HolographicCard, 
  HolographicCardHeader, 
  HolographicCardTitle, 
  HolographicCardContent 
} from "@/components/ui/holographic-card";
import { NeonBadge } from "@/components/ui/neon-badge";

interface PortfolioData {
  totalValue: number;
  todayGain: number;
  activeAgents: string;
  confidence: number;
}

interface Agent {
  id: string;
  name: string;
  status: "Active" | "Idle" | "Error";
}

interface ActivityItem {
  id: string;
  text: string;
  timestamp: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export default function Dashboard() {
  const [username] = useKV<string>("username", "MHAMPTITRADING");
  const [portfolio] = useKV<PortfolioData>("portfolio-metrics", {
    totalValue: 9843.21,
    todayGain: 342.56,
    activeAgents: "3/3",
    confidence: 88.6,
  });

  const [tradingMode] = useKV<"PAPER" | "LIVE">("trading-mode", "PAPER");
  const [muted, setMuted] = useKV<boolean>("audio-muted", false);
  
  const [agents] = useKV<Agent[]>("ai-agents", [
    { id: "1", name: "Market Analyst", status: "Active" },
    { id: "2", name: "Strategy Execution", status: "Active" },
    { id: "3", name: "RL Optimizer", status: "Active" },
  ]);

  const [recentActivity] = useKV<ActivityItem[]>("recent-activity", [
    { id: "1", text: "Token eval complete", timestamp: Date.now() - 120000 },
    { id: "2", text: "Market order placed", timestamp: Date.now() - 240000 },
    { id: "3", text: "DCA order activated", timestamp: Date.now() - 360000 },
    { id: "4", text: "Portfolio rebalanced", timestamp: Date.now() - 480000 },
  ]);

  const [logs, setLogs] = useKV<LogEntry[]>("bot-logs", [
    { id: "1", timestamp: "01:37:02", message: "Strategy optimizing position sizes...", type: "info" },
    { id: "2", timestamp: "01:37:15", message: "Risk threshold adjusted to 2.5%", type: "success" },
    { id: "3", timestamp: "01:37:28", message: "Stop loss triggered at $0.28, Loss: $0.50", type: "warning" },
    { id: "4", timestamp: "01:37:41", message: "Analyzing SOL market conditions", type: "info" },
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {/* Hero Section with Bot Description */}
      <HolographicCard variant="accent" glow className="relative overflow-hidden">
        <div className="absolute inset-0 technical-grid opacity-10"></div>
        <div className="absolute inset-0 scan-line-effect"></div>
        <HolographicCardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Brain size={64} weight="fill" className="text-primary neon-glow-primary flex-shrink-0" />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-[0.15em] text-primary neon-glow-primary mb-3">
                QUANTUM FALCON
              </h1>
              <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
                Advanced AI-powered autonomous trading system leveraging quantum computing principles 
                for real-time decision-making and market analysis.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <NeonBadge variant="primary" glow pulse>
                  ⚡ Autonomous
                </NeonBadge>
                <NeonBadge variant="secondary" glow>
                  🎯 Quantum
                </NeonBadge>
                <NeonBadge variant="accent" glow>
                  🛡️ Secure
                </NeonBadge>
              </div>
            </div>
          </div>
        </HolographicCardContent>
      </HolographicCard>

      {/* Welcome and Status Bar */}
      <div className="flex flex-col items-center text-center space-y-4">
        <h1 className="text-3xl font-bold uppercase tracking-[0.2em] text-foreground hud-text">
          Welcome Back, {username}
        </h1>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="border-2 border-primary bg-primary/20 text-primary hover:bg-primary/30 jagged-corner-small px-6 py-2 font-bold uppercase tracking-wider neon-glow-primary"
          >
            Free Tier
          </Button>
          <Button 
            variant="ghost" 
            className="text-secondary font-bold uppercase tracking-wider hover:bg-secondary/10 jagged-corner-small"
          >
            Paper Mode
          </Button>
        </div>

        <NeonBadge variant="warning" glow pulse className="px-6 py-2 text-sm">
          Trading Mode: {tradingMode} MODE
        </NeonBadge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <HolographicCard variant="primary" glow className="p-6 cursor-pointer h-full">
            <div className="data-label mb-2">
              Total Portfolio
            </div>
            <div className="technical-readout mb-2">
              {formatCurrency(portfolio?.totalValue ?? 0)}
            </div>
            <div className="metric-bar"></div>
          </HolographicCard>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <HolographicCard variant="secondary" glow className="p-6 cursor-pointer h-full">
            <div className="data-label mb-2">
              24h Gain
            </div>
            <div className="text-3xl font-bold text-secondary neon-glow mb-2">
              +{formatCurrency(portfolio?.todayGain ?? 0)}
            </div>
            <div className="metric-bar"></div>
          </HolographicCard>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <HolographicCard variant="primary" glow className="p-6 cursor-pointer h-full">
            <div className="data-label mb-2">
              Agents Active
            </div>
            <div className="hud-readout text-4xl mb-2">
              {portfolio?.activeAgents ?? "0/0"}
            </div>
            <div className="metric-bar"></div>
          </HolographicCard>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <HolographicCard variant="accent" glow pulse className="p-6 cursor-pointer h-full">
            <div className="data-label mb-2">
              Confidence
            </div>
            <div className="hud-readout text-4xl mb-2">
              {portfolio?.confidence?.toFixed(1) ?? "0.0"}%
            </div>
            <div className="metric-bar"></div>
          </HolographicCard>
        </motion.div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold uppercase tracking-[0.15em] text-secondary neon-glow hud-text">
          + Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="neon-button h-16 text-base font-bold uppercase tracking-wider">
            Start Bot
          </Button>
          <Button className="h-16 border-2 border-secondary bg-transparent hover:bg-secondary/10 text-secondary jagged-corner-small text-base font-bold uppercase tracking-wider transition-all">
            View Stats
          </Button>
          <Button className="h-16 border-2 border-secondary bg-transparent hover:bg-secondary/10 text-secondary jagged-corner-small text-base font-bold uppercase tracking-wider transition-all">
            Check Chart
          </Button>
          <Button className="h-16 border-2 border-secondary bg-transparent hover:bg-secondary/10 text-secondary jagged-corner-small text-base font-bold uppercase tracking-wider transition-all">
            Community
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HolographicCard variant="primary" glow className="p-6">
          <HolographicCardHeader className="p-0 mb-6">
            <HolographicCardTitle className="text-lg">
              AI Agent Status
            </HolographicCardTitle>
          </HolographicCardHeader>
          
          <div className="space-y-4">
            {(agents ?? []).map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-3 bg-background/30 border-l-2 border-l-secondary angled-corner-tr hover:bg-background/50 transition-all">
                <div className="flex items-center gap-3">
                  <Robot size={20} className="text-secondary animate-pulse-slow" weight="fill" />
                  <span className="text-base font-semibold text-foreground uppercase tracking-wide">{agent.name}</span>
                </div>
                <NeonBadge 
                  variant={agent.status === 'Active' ? 'secondary' : 'warning'}
                  glow
                  pulse={agent.status === 'Active'}
                >
                  {agent.status}
                </NeonBadge>
              </div>
            ))}
          </div>
        </HolographicCard>

        <HolographicCard variant="secondary" glow className="p-6">
          <HolographicCardHeader className="p-0 mb-6">
            <HolographicCardTitle className="text-lg">
              Recent Activity
            </HolographicCardTitle>
          </HolographicCardHeader>
          
          <div className="space-y-3 max-h-[240px] overflow-y-auto scrollbar-thin">
            {(recentActivity ?? []).map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-background/30 border-l-2 border-secondary angled-corner-br hover:bg-background/50 transition-all data-stream">
                <CheckCircle size={16} className="text-secondary mt-1 flex-shrink-0" weight="fill" />
                <span className="text-sm text-foreground font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </HolographicCard>
      </div>

      <HolographicCard variant="accent" glow className="p-6 relative overflow-hidden">
        <div className="absolute inset-0 technical-grid opacity-5"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <HolographicCardTitle className="text-lg">
            Bot Log Stream
          </HolographicCardTitle>
          <div className="flex items-center gap-3">
            <NeonBadge variant="primary" glow pulse className="text-[10px]">
              LIVE
            </NeonBadge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMuted(!muted)}
              className="w-8 h-8 text-muted-foreground hover:text-primary transition-colors"
            >
              {muted ? <SpeakerX size={20} /> : <SpeakerHigh size={20} />}
            </Button>
          </div>
        </div>

        <div className="bg-background/80 border-2 border-primary/40 p-4 angled-corner-tl max-h-[200px] overflow-y-auto scrollbar-thin font-mono text-xs space-y-2 relative scan-line-effect">
          {(logs ?? []).map((log) => (
            <div key={log.id} className="flex items-start gap-3">
              <span className="text-muted-foreground flex-shrink-0 font-bold">Δ {log.timestamp}</span>
              <span className={`${
                log.type === 'success' ? 'text-secondary' :
                log.type === 'warning' ? 'text-destructive' :
                log.type === 'error' ? 'text-destructive' :
                'text-primary'
              }`}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </HolographicCard>
    </div>
  );
}
