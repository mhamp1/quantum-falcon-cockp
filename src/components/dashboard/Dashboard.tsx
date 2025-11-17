import { useState } from "react";
import {
  Play,
  ChartLine,
  Users,
  Crosshair,
  Robot,
  Lightning,
  TrendUp,
  CircleWavyWarning,
} from "@phosphor-icons/react";
import { useKV } from "@github/spark/hooks";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface PortfolioData {
  totalValue: number;
  todayGain: number;
  activeAgents: string;
  winRate: number;
}

interface Agent {
  id: string;
  name: string;
  status: "ACTIVE" | "IDLE" | "ERROR";
}

interface ActivityItem {
  id: string;
  text: string;
  timestamp: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export default function Dashboard() {
  const [username] = useKV<string>("username", "MHAMPTITRADING");
  const [portfolio] = useKV<PortfolioData>("portfolio-metrics", {
    totalValue: 8943.21,
    todayGain: 342.5,
    activeAgents: "3/3",
    winRate: 68.5,
  });

  const [paperMode, setPaperMode] = useKV<boolean>("paper-mode", true);
  
  const [agents] = useKV<Agent[]>("ai-agents", [
    { id: "1", name: "MARKET ANALYZER", status: "ACTIVE" },
    { id: "2", name: "STRATEGY EXECUTION", status: "ACTIVE" },
    { id: "3", name: "RL OPTIMIZER", status: "ACTIVE" },
  ]);

  const [recentActivity] = useKV<ActivityItem[]>("recent-activity", [
    { id: "1", text: "Trade executed - $4,520 profit", timestamp: Date.now() - 120000 },
    { id: "2", text: "Market analysis completed", timestamp: Date.now() - 240000 },
    { id: "3", text: "DCA order filled successfully", timestamp: Date.now() - 360000 },
    { id: "4", text: "Portfolio rebalanced", timestamp: Date.now() - 480000 },
  ]);

  const [logs] = useKV<LogEntry[]>("bot-logs", [
    { 
      id: "1", 
      timestamp: "01:49:54", 
      agent: "RL OPTIMIZER",
      message: "Risk threshold exceeded - reducing exposure", 
      type: "warning" 
    },
    { 
      id: "2", 
      timestamp: "01:52:13", 
      agent: "MARKET ANALYZER",
      message: "High volatility detected in ETH market", 
      type: "info" 
    },
    { 
      id: "3", 
      timestamp: "01:55:28", 
      agent: "MARKET ANALYZER",
      message: "High volatility detected in BTC market\nAnalyzing potential entry points. Current indicators suggest waiting for consolidation above $42,850", 
      type: "info" 
    },
    { 
      id: "4", 
      timestamp: "01:58:39", 
      agent: "MARKET ANALYZER",
      message: "Analyzing SOL/USDT market conditions", 
      type: "info" 
    },
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="cyber-card p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-[0.15em] mb-2">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                WELCOME BACK,
              </span>{" "}
              <span className="text-foreground">{username}</span>
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                className="border border-primary/50 bg-primary/10 text-primary hover:bg-primary/20 rounded-sm px-4 py-1 text-xs font-bold uppercase tracking-wider"
              >
                Free Tier
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border border-accent/50 bg-accent/10 text-accent hover:bg-accent/20 rounded-sm px-4 py-1 text-xs font-bold uppercase tracking-wider"
              >
                Bot Insights
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="border border-secondary/50 bg-secondary/10 text-secondary hover:bg-secondary/20 rounded-sm px-4 py-1 text-xs font-bold uppercase tracking-wider"
              >
                Paper Mode
              </Button>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="border border-primary/50 bg-transparent text-primary hover:bg-primary/10 rounded-sm px-6 py-2 text-xs font-bold uppercase tracking-wider"
          >
            Logout
          </Button>
        </div>
      </div>

      <div className="cyber-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Lightning size={20} className="text-destructive" weight="fill" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              TRADING MODE
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              PAPER MODE
            </span>
            <Switch 
              checked={paperMode} 
              onCheckedChange={(checked) => setPaperMode(checked)}
              className="data-[state=checked]:bg-secondary"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Use paper trading to test strategies without risking real funds
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cyber-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Total Portfolio
            </div>
            <Crosshair size={18} className="text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary mb-1">
            {formatCurrency(portfolio?.totalValue ?? 0)}
          </div>
          <div className="text-xs text-accent flex items-center gap-1">
            <TrendUp size={12} weight="bold" />
            <span>+4.1%</span>
          </div>
        </div>

        <div className="cyber-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Today's Gain
            </div>
            <Crosshair size={18} className="text-accent" />
          </div>
          <div className="text-2xl font-bold text-accent mb-1">
            +{formatCurrency(portfolio?.todayGain ?? 0)}
          </div>
          <div className="text-xs text-accent flex items-center gap-1">
            <TrendUp size={12} weight="bold" />
            <span>+12.5%</span>
          </div>
        </div>

        <div className="cyber-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Active Agents
            </div>
            <Crosshair size={18} className="text-secondary" />
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">
            {portfolio?.activeAgents ?? "0/0"}
          </div>
          <div className="text-xs text-muted-foreground">
            <span>All systems operational</span>
          </div>
        </div>

        <div className="cyber-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Win Rate
            </div>
            <Crosshair size={18} className="text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary mb-1">
            {portfolio?.winRate?.toFixed(1) ?? "0.0"}%
          </div>
          <div className="text-xs text-accent flex items-center gap-1">
            <TrendUp size={12} weight="bold" />
            <span>+1.1%</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Lightning size={16} className="text-secondary" weight="fill" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-secondary">
            QUICK ACTIONS
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <Button className="h-12 border border-primary bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <Play size={16} weight="fill" className="mr-2" />
            Start Bot
          </Button>
          <Button className="h-12 border border-secondary/30 bg-transparent hover:bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider">
            <ChartLine size={16} className="mr-2" />
            View Analytics
          </Button>
          <Button className="h-12 border border-secondary/30 bg-transparent hover:bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider">
            <Crosshair size={16} className="mr-2" />
            Check Vault
          </Button>
          <Button className="h-12 border border-secondary/30 bg-transparent hover:bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wider">
            <Users size={16} className="mr-2" />
            Community
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="cyber-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Robot size={18} className="text-primary" weight="fill" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary">
              AI AGENT STATUS
            </h2>
          </div>
          
          <div className="space-y-3">
            {(agents ?? []).map((agent) => (
              <div 
                key={agent.id} 
                className="flex items-center justify-between p-4 bg-background/50 border border-primary/20 hover:border-primary/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Robot size={16} className="text-secondary" />
                  <span className="text-xs font-bold uppercase tracking-wide text-foreground">
                    {agent.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-secondary px-3 py-1 bg-secondary/10 border border-secondary/30">
                  {agent.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="cyber-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <CircleWavyWarning size={18} className="text-primary" weight="fill" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary">
              RECENT ACTIVITY
            </h2>
          </div>
          
          <div className="space-y-2 max-h-[240px] overflow-y-auto scrollbar-thin">
            {(recentActivity ?? []).map((item) => (
              <div 
                key={item.id} 
                className="flex items-start gap-2 p-3 bg-background/30 border-l-2 border-secondary hover:bg-background/50 transition-all"
              >
                <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-1.5 flex-shrink-0" />
                <span className="text-xs text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cyber-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Robot size={18} className="text-secondary" weight="fill" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-secondary">
              BOT LOGIC STREAM
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground border border-border"
            >
              Clear
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground border border-border"
            >
              Export
            </Button>
          </div>
        </div>

        <div className="bg-background/50 border border-primary/30 p-4 max-h-[300px] overflow-y-auto scrollbar-thin font-mono text-xs space-y-3">
          {(logs ?? []).map((log) => (
            <div key={log.id} className="space-y-1">
              <div className="flex items-center gap-3">
                <CircleWavyWarning 
                  size={14} 
                  className={`flex-shrink-0 ${
                    log.type === 'warning' ? 'text-destructive' : 'text-primary'
                  }`}
                  weight="fill"
                />
                <span className="text-[10px] text-muted-foreground flex-shrink-0">
                  Δ {log.timestamp}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary px-2 py-0.5 bg-secondary/10 border border-secondary/30">
                  {log.agent}
                </span>
              </div>
              <p className={`text-xs ml-8 ${
                log.type === 'success' ? 'text-accent' :
                log.type === 'warning' ? 'text-destructive' :
                log.type === 'error' ? 'text-destructive' :
                'text-foreground/70'
              }`}>
                {log.message}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
