import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { TrendUp, TrendDown, Robot, Lightning, Vault as VaultIcon, Activity } from '@phosphor-icons/react';

interface DashboardProps {
  username: string;
}

export default function Dashboard({ username }: DashboardProps) {
  const [portfolioValue] = useKV<number>('portfolio-value', 8949.21);
  const [dailyPnL] = useKV<number>('daily-pnl', 342.50);
  const [winRate] = useKV<number>('win-rate', 68.5);
  const [activeTrades] = useKV<number>('active-trades', 3);
  const [paperMode, setPaperMode] = useKV<boolean>('paper-mode', true);
  
  const [botLogs] = useKV<Array<{id: number; time: string; agent: string; message: string; type: string}>>('bot-logs', [
    { id: 1, time: '14:23:45', agent: 'STRATEGY EXECUTION', message: 'Risk threshold exceeded - reducing exposure', type: 'warning' },
    { id: 2, time: '14:22:18', agent: 'MARKET ANALYSIS', message: 'High volatility detected in ETH market', type: 'info' },
    { id: 3, time: '14:20:52', agent: 'RL OPTIMIZER', message: 'Portfolio rebalanced', type: 'success' },
    { id: 4, time: '14:19:33', agent: 'MARKET ANALYSIS', message: 'Analyzing SOL ecosystem growth (contracts: +21%)', type: 'info' },
  ]);

  const [recentActivity] = useKV<Array<{id: number; message: string; time: string}>>('recent-activity', [
    { id: 1, message: 'Trade executed - USDC→BTC', time: '3m ago' },
    { id: 2, message: 'Market analysis completed', time: '5m ago' },
    { id: 3, message: 'Portfolio rebalanced', time: '8m ago' },
    { id: 4, message: 'Risk level: Standard', time: '12m ago' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b-2 border-primary/30">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-accent animate-pulse shadow-[0_0_10px_rgba(255,200,0,0.8)]" />
            <Badge className="bg-destructive/20 text-destructive border-2 border-destructive uppercase tracking-wider">
              ● LIVE FEED
            </Badge>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-wider">
            WELCOME BACK, <span className="text-accent">{username}</span>
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
            ◆ ALL SYSTEMS OPERATIONAL
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 bg-card/80 border-2 border-accent/50 p-3">
            <span className="text-sm uppercase tracking-wide text-muted-foreground">Paper Mode</span>
            <Switch
              checked={paperMode}
              onCheckedChange={setPaperMode}
              className="data-[state=checked]:bg-accent"
            />
          </div>
          <Button className="bg-primary/20 border-2 border-primary text-primary hover:bg-primary/30 shadow-[0_0_20px_rgba(0,255,255,0.3)]">
            <Lightning weight="duotone" size={20} />
            <span className="uppercase tracking-wide font-bold">Logout</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HudCard
          label="Portfolio"
          value={`$${(portfolioValue || 0).toLocaleString()}`}
          change={dailyPnL}
          changePercent={4.1}
          icon={Activity}
        />
        <HudCard
          label="Daily P&L"
          value={`+$${(dailyPnL || 0).toLocaleString()}`}
          change={dailyPnL}
          changePercent={3.9}
          icon={TrendUp}
          positive
        />
        <HudCard
          label="Win Rate"
          value={`${winRate || 0}%`}
          subtitle="68.5%"
          icon={Lightning}
          glowColor="accent"
        />
        <HudCard
          label="Active Trades"
          value={`${activeTrades || 0}/5`}
          subtitle="+1 today"
          icon={VaultIcon}
        />
      </div>

      <Card className="p-6 bg-card/50 border-2 border-primary/30 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Robot size={24} weight="duotone" className="text-primary" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-primary">
              Trading Mode
            </h2>
          </div>
        </div>
        
        <div className="bg-muted/30 border-2 border-accent/50 p-4">
          <p className="text-accent uppercase tracking-wide text-sm mb-2">
            ● AI Trading Agents: <span className="text-xl font-bold">ACTIVE</span>
          </p>
          <p className="text-muted-foreground text-sm">
            Let AI agents analyze market trends and execute strategic trades based on real-time data
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6 bg-card/50 border-2 border-primary/30">
          <div className="flex items-center gap-3 mb-4">
            <Robot size={24} weight="duotone" className="text-primary" />
            <h3 className="text-lg font-bold uppercase tracking-wider text-primary">
              AI Agent Status
            </h3>
          </div>
          
          <div className="space-y-3">
            {[
              { name: 'Market Analyzer', status: 'Active', confidence: 85 },
              { name: 'Strategy Execution', status: 'Active', confidence: 92 },
              { name: 'RL Optimizer', status: 'Active', confidence: 78 },
            ].map((agent, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/20 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-accent animate-pulse shadow-[0_0_10px_rgba(255,200,0,0.8)]" />
                  <span className="text-sm uppercase tracking-wide">{agent.name}</span>
                </div>
                <Badge className="bg-primary/20 text-primary border border-primary uppercase text-xs">
                  {agent.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-card/50 border-2 border-primary/30">
          <div className="flex items-center gap-3 mb-4">
            <Activity size={24} weight="duotone" className="text-accent" />
            <h3 className="text-lg font-bold uppercase tracking-wider text-accent">
              Recent Activity
            </h3>
          </div>
          
          <div className="space-y-2">
            {(recentActivity || []).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-primary/10">
                <p className="text-sm">{activity.message}</p>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-card/50 border-2 border-accent/30 shadow-[0_0_30px_rgba(255,200,0,0.2)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity size={24} weight="duotone" className="text-accent" />
            <h3 className="text-lg font-bold uppercase tracking-wider text-accent">
              Bot Logic Stream
            </h3>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="border-accent text-accent">
              Pause
            </Button>
            <Button size="sm" variant="outline" className="border-accent text-accent">
              Clear
            </Button>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
          {(botLogs || []).map((log) => (
            <div
              key={log.id}
              className={`flex gap-3 p-2 border-l-2 ${
                log.type === 'warning'
                  ? 'border-destructive bg-destructive/10'
                  : log.type === 'success'
                  ? 'border-accent bg-accent/10'
                  : 'border-primary bg-primary/10'
              }`}
            >
              <span className="text-muted-foreground">[{log.time}]</span>
              <span className="text-primary uppercase">{log.agent}:</span>
              <span className="flex-1">{log.message}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

interface HudCardProps {
  label: string;
  value: string;
  change?: number;
  changePercent?: number;
  subtitle?: string;
  icon: React.ElementType;
  positive?: boolean;
  glowColor?: 'primary' | 'accent';
}

function HudCard({ label, value, change, changePercent, subtitle, icon: Icon, positive, glowColor = 'primary' }: HudCardProps) {
  const glowClass = glowColor === 'accent' 
    ? 'shadow-[0_0_30px_rgba(255,200,0,0.3)]' 
    : 'shadow-[0_0_30px_rgba(0,255,255,0.3)]';
  
  return (
    <Card className={`p-4 bg-card/50 border-2 border-${glowColor}/30 ${glowClass} relative overflow-hidden`}>
      <div className="absolute top-2 right-2">
        <Icon size={32} weight="duotone" className={`text-${glowColor}/20`} />
      </div>
      
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold tabular-nums text-${glowColor}`}>{value}</p>
        
        {change !== undefined && changePercent !== undefined && (
          <div className="flex items-center gap-2">
            {positive ? (
              <TrendUp size={16} className="text-accent" weight="bold" />
            ) : (
              <TrendDown size={16} className="text-destructive" weight="bold" />
            )}
            <span className={`text-xs ${positive ? 'text-accent' : 'text-destructive'}`}>
              +{changePercent}%
            </span>
          </div>
        )}
        
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </Card>
  );
}
