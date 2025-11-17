import { useState, useEffect } from "react";
import {
  Play,
  ChartLine,
  Users,
  SpeakerHigh,
  SpeakerX,
  Robot,
  CheckCircle,
} from "@phosphor-icons/react";
import { useKV } from "@github/spark/hooks";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
      <div className="flex flex-col items-center text-center space-y-4">
        <h1 className="text-4xl font-bold uppercase tracking-[0.2em] text-foreground">
          Welcome Back, {username}
        </h1>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            className="border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-2 font-bold uppercase tracking-wider"
          >
            Free Tier
          </Button>
          <Button 
            variant="ghost" 
            className="text-secondary font-bold uppercase tracking-wider hover:bg-transparent"
          >
            Paper Mode
          </Button>
        </div>

        <Badge className="bg-destructive/20 text-destructive border-2 border-destructive rounded-full px-6 py-2 text-sm font-bold uppercase tracking-wider">
          Trading Mode: {tradingMode} MODE
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="cyber-card p-6 relative overflow-hidden group cursor-pointer"
        >
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">
            Total Portfolio
          </div>
          <div className="text-3xl font-bold text-secondary neon-glow mb-1">
            {formatCurrency(portfolio?.totalValue ?? 0)}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="cyber-card p-6 relative overflow-hidden group cursor-pointer"
        >
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">
            24h Gain
          </div>
          <div className="text-3xl font-bold text-secondary neon-glow mb-1">
            +{formatCurrency(portfolio?.todayGain ?? 0)}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="cyber-card p-6 relative overflow-hidden group cursor-pointer"
        >
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">
            Agents Active
          </div>
          <div className="text-3xl font-bold text-foreground mb-1">
            {portfolio?.activeAgents ?? "0/0"}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="cyber-card p-6 relative overflow-hidden group cursor-pointer"
        >
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">
            Confidence
          </div>
          <div className="text-3xl font-bold text-primary neon-glow-primary mb-1">
            {portfolio?.confidence?.toFixed(1) ?? "0.0"}%
          </div>
        </motion.div>
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-bold uppercase tracking-[0.15em] text-secondary neon-glow">
          + Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button className="h-16 border-2 border-secondary bg-secondary/10 hover:bg-secondary/20 text-secondary jagged-corner-small text-base font-bold uppercase tracking-wider">
            Start Bot
          </Button>
          <Button className="h-16 border-2 border-secondary bg-transparent hover:bg-secondary/10 text-secondary jagged-corner-small text-base font-bold uppercase tracking-wider">
            View Stats
          </Button>
          <Button className="h-16 border-2 border-secondary bg-transparent hover:bg-secondary/10 text-secondary jagged-corner-small text-base font-bold uppercase tracking-wider">
            Check Chart
          </Button>
          <Button className="h-16 border-2 border-secondary bg-transparent hover:bg-secondary/10 text-secondary jagged-corner-small text-base font-bold uppercase tracking-wider">
            Community
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="cyber-card p-6">
          <h2 className="text-lg font-bold uppercase tracking-wider text-primary neon-glow-primary mb-6">
            AI Agent Status
          </h2>
          
          <div className="space-y-4">
            {(agents ?? []).map((agent) => (
              <div key={agent.id} className="flex items-center justify-between p-3 bg-muted/10 border border-primary/20 jagged-corner-small">
                <div className="flex items-center gap-3">
                  <Robot size={20} className="text-secondary" />
                  <span className="text-base font-semibold text-foreground">{agent.name}</span>
                </div>
                <Badge 
                  className={`${
                    agent.status === 'Active' 
                      ? 'bg-secondary/20 text-secondary border-secondary' 
                      : 'bg-muted text-muted-foreground border-muted-foreground'
                  } border rounded-full px-3 py-1 text-xs font-bold uppercase`}
                >
                  {agent.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="cyber-card p-6">
          <h2 className="text-lg font-bold uppercase tracking-wider text-primary neon-glow-primary mb-6">
            Recent Activity
          </h2>
          
          <div className="space-y-3 max-h-[240px] overflow-y-auto scrollbar-thin">
            {(recentActivity ?? []).map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-muted/10 border-l-2 border-secondary hover:bg-muted/20 transition-all">
                <CheckCircle size={16} className="text-secondary mt-1 flex-shrink-0" />
                <span className="text-sm text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cyber-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold uppercase tracking-wider text-secondary neon-glow">
            Bot Log Stream
          </h2>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMuted(!muted)}
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
            >
              {muted ? <SpeakerX size={20} /> : <SpeakerHigh size={20} />}
            </Button>
          </div>
        </div>

        <div className="bg-background/50 border border-primary/30 p-4 rounded-md max-h-[200px] overflow-y-auto scrollbar-thin font-mono text-xs space-y-2">
          {(logs ?? []).map((log) => (
            <div key={log.id} className="flex items-start gap-3">
              <span className="text-muted-foreground flex-shrink-0">Δ {log.timestamp}</span>
              <span className={`${
                log.type === 'success' ? 'text-secondary' :
                log.type === 'warning' ? 'text-destructive' :
                log.type === 'error' ? 'text-destructive' :
                'text-secondary'
              }`}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
