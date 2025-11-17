import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Robot, Lightning, TrendUp, Brain } from '@phosphor-icons/react';
import { useLiveAgentData } from '@/hooks/useLiveAgentData';

export default function BotOverview() {
  const agents = useLiveAgentData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b-2 border-primary/30">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-wider text-primary">
            AI Agents
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
            ◆ Autonomous Trading Intelligence
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {(agents || []).map((agent) => (
          <Card
            key={agent.id}
            className="p-6 bg-card/50 border-2 border-primary/30 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 animate-pulse ${
                    agent.status === 'active'
                      ? 'bg-accent shadow-[0_0_10px_rgba(255,200,0,0.8)]'
                      : 'bg-muted'
                  }`}
                />
                <Robot size={24} weight="duotone" className="text-primary" />
              </div>
              <Switch checked={agent.status === 'active'} />
            </div>

            <h3 className="text-xl font-bold uppercase tracking-wider mb-2">
              {agent.name}
            </h3>

            <div className="space-y-3 mt-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase text-muted-foreground">Confidence</span>
                  <span className="text-sm font-bold text-accent">{agent.confidence}%</span>
                </div>
                <Progress value={agent.confidence} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Trades</p>
                  <p className="text-lg font-bold">{agent.trades}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Profit</p>
                  <p className="text-lg font-bold text-accent">+${agent.profit}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-primary/20">
                <div className="flex items-center gap-2">
                  <Lightning size={16} weight="duotone" className="text-accent" />
                  <span className="text-sm font-bold">Level {agent.level}</span>
                </div>
                <span className="text-xs text-muted-foreground">{agent.xp} XP</span>
              </div>
            </div>

            <Button className="w-full mt-4 bg-primary/20 border-2 border-primary text-primary hover:bg-primary/30">
              Configure
            </Button>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-card/50 border-2 border-accent/30">
        <div className="flex items-center gap-3 mb-4">
          <Brain size={24} weight="duotone" className="text-accent" />
          <h2 className="text-xl font-bold uppercase tracking-wider text-accent">
            Agent Performance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/20 border border-primary/20">
            <p className="text-xs uppercase text-muted-foreground mb-2">Total Trades</p>
            <p className="text-2xl font-bold text-primary">
              {(agents || []).reduce((sum, a) => sum + a.trades, 0)}
            </p>
          </div>
          <div className="p-4 bg-muted/20 border border-primary/20">
            <p className="text-xs uppercase text-muted-foreground mb-2">Total Profit</p>
            <p className="text-2xl font-bold text-accent">
              +${(agents || []).reduce((sum, a) => sum + a.profit, 0).toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-muted/20 border border-primary/20">
            <p className="text-xs uppercase text-muted-foreground mb-2">Avg Confidence</p>
            <p className="text-2xl font-bold text-primary">
              {Math.round((agents || []).reduce((sum, a) => sum + a.confidence, 0) / (agents?.length || 1))}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
