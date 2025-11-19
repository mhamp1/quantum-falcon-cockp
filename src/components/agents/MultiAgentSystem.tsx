import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKV } from '@github/spark/hooks';
import {
  Robot,
  Brain,
  ChartLine,
  Shield,
  Scales,
  Fire,
  Lightning,
  Target,
  Activity,
  Lock,
  Crown,
  TrendUp,
  Sparkle,
  Eye,
  Crosshair,
  Database,
  Network
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { toast } from 'sonner';

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: any;
  level: number;
  xp: number;
  maxXp: number;
  confidence: number;
  avgConfidence: number;
  actions: number;
  profit: number;
  performance: number;
  status: 'active' | 'paused' | 'locked';
  requiredTier: string;
  specialties: string[];
  metrics: { cpu: number; memory: number; latency: number };
  recentOutcomes: Array<{ date: string; pnl: number; confidence: number }>;
  synergy: Record<string, number>;
}

interface Stats {
  uptime: number;
  trades: number;
  success: number;
  profit: number;
}

const aggressionLevels = [
  {
    level: 'Cautious',
    icon: Shield,
    color: 'text-primary',
    description: 'Conservative risk-taking, low-frequency trades, focus on preservation.',
  },
  {
    level: 'Moderate',
    icon: Scales,
    color: 'text-secondary',
    description: 'Balanced approach, medium risk, steady growth.',
  },
  {
    level: 'Aggressive',
    icon: Fire,
    color: 'text-destructive',
    description: 'High-risk trading, frequent actions, potential for high returns.',
  },
];

const pipelineSteps = [
  { title: 'Market Data Ingestion', desc: 'Real-time data from multiple DEXs and oracles', progress: 95 },
  { title: 'Signal Processing', desc: 'Analyze trends, volatility, and patterns using ML', progress: 88 },
  { title: 'Strategy Selection', desc: 'Choose optimal trading strategy based on conditions', progress: 92 },
  { title: 'Order Execution', desc: 'Execute trades with minimal latency and slippage', progress: 97 },
  { title: 'Performance Tracking', desc: 'Monitor outcomes and feed back into RL model', progress: 91 },
];

export default function MultiAgentSystem() {
  const [auth] = useKV<any>('user-auth', { license: { tier: 'free' } });
  const [activeTab, setActiveTab] = useState('overview');
  const [aggressionValue, setAggressionValue] = useState([1]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  
  const [stats, setStats] = useState<Stats>({
    uptime: 94.1,
    trades: 1247,
    success: 87.3,
    profit: 2835,
  });

  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'market-analyst',
      name: 'Market Analyst',
      description: 'Continuously scans the Solana ecosystem for trading opportunities and market trends',
      icon: ChartLine,
      level: 12,
      xp: 3420,
      maxXp: 5000,
      confidence: 92,
      avgConfidence: 87,
      actions: 241,
      profit: 1234.55,
      performance: 94.2,
      status: 'active',
      requiredTier: 'free',
      specialties: ['Trend Detection', 'Volume Analysis', 'Sentiment Scanning'],
      metrics: { cpu: 45, memory: 32, latency: 12 },
      recentOutcomes: generateMockOutcomes(20, 0.85),
      synergy: { 'strategy-engine': 95, 'rl-optimizer': 88 }
    },
    {
      id: 'strategy-engine',
      name: 'Strategy Engine',
      description: 'Executes DCA schedules and sniping strategies based on market signals',
      icon: Robot,
      level: 15,
      xp: 4120,
      maxXp: 6000,
      confidence: 88,
      avgConfidence: 85,
      actions: 312,
      profit: 2847.32,
      performance: 91.8,
      status: 'active',
      requiredTier: 'pro',
      specialties: ['Strategy Selection', 'Parameter Tuning', 'Risk Management'],
      metrics: { cpu: 52, memory: 41, latency: 18 },
      recentOutcomes: generateMockOutcomes(30, 0.80),
      synergy: { 'market-analyst': 95, 'rl-optimizer': 92 }
    },
    {
      id: 'rl-optimizer',
      name: 'RL Optimizer',
      description: 'Reinforcement learning model that adapts strategies based on outcomes',
      icon: Brain,
      level: 18,
      xp: 7840,
      maxXp: 10000,
      confidence: 95,
      avgConfidence: 91,
      actions: 428,
      profit: 4521.87,
      performance: 96.5,
      status: 'active',
      requiredTier: 'elite',
      specialties: ['Learning Optimization', 'Reward Maximization', 'Adaptive Control'],
      metrics: { cpu: 38, memory: 28, latency: 8 },
      recentOutcomes: generateMockOutcomes(40, 0.90),
      synergy: { 'market-analyst': 88, 'strategy-engine': 92 }
    },
    {
      id: 'sentiment-scanner',
      name: 'Sentiment Scanner',
      description: 'Monitors social media and news for market sentiment signals',
      icon: Eye,
      level: 8,
      xp: 2100,
      maxXp: 4000,
      confidence: 78,
      avgConfidence: 74,
      actions: 156,
      profit: 687.23,
      performance: 82.4,
      status: 'locked',
      requiredTier: 'pro',
      specialties: ['Social Listening', 'News Analysis', 'FOMO Detection'],
      metrics: { cpu: 28, memory: 19, latency: 25 },
      recentOutcomes: generateMockOutcomes(15, 0.75),
      synergy: { 'market-analyst': 85, 'strategy-engine': 78 }
    },
    {
      id: 'whale-tracker',
      name: 'Whale Tracker',
      description: 'Tracks large wallet movements and institutional trading patterns',
      icon: Database,
      level: 10,
      xp: 3200,
      maxXp: 5000,
      confidence: 84,
      avgConfidence: 80,
      actions: 198,
      profit: 1523.44,
      performance: 88.7,
      status: 'locked',
      requiredTier: 'elite',
      specialties: ['On-Chain Analysis', 'Whale Detection', 'Flow Tracking'],
      metrics: { cpu: 61, memory: 48, latency: 15 },
      recentOutcomes: generateMockOutcomes(25, 0.82),
      synergy: { 'market-analyst': 90, 'rl-optimizer': 85 }
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        uptime: Math.min(99.9, prev.uptime + Math.random() * 0.1),
        trades: prev.trades + Math.floor(Math.random() * 3),
        success: Math.max(75, Math.min(95, prev.success + (Math.random() - 0.5) * 2)),
        profit: prev.profit + Math.random() * 50,
      }));

      setAgents(prev => prev.map(a => ({
        ...a,
        confidence: Math.max(70, Math.min(99, a.confidence + (Math.random() - 0.5) * 3)),
        actions: a.status === 'active' ? a.actions + Math.floor(Math.random() * 2) : a.actions,
        metrics: {
          cpu: Math.max(20, Math.min(80, a.metrics.cpu + (Math.random() - 0.5) * 10)),
          memory: Math.max(15, Math.min(70, a.metrics.memory + (Math.random() - 0.5) * 8)),
          latency: Math.max(5, Math.min(50, a.metrics.latency + (Math.random() - 0.5) * 5))
        }
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const toggleAgent = (agentId: string) => {
    setAgents(prev => prev.map(a =>
      a.id === agentId && a.status !== 'locked'
        ? { ...a, status: a.status === 'active' ? 'paused' : 'active' }
        : a
    ));
    const agent = agents.find(a => a.id === agentId);
    if (agent) {
      toast.success(`${agent.name} ${agent.status === 'active' ? 'Paused' : 'Activated'}`);
    }
  };

  const handleAggressionChange = (value: number[]) => {
    setAggressionValue(value);
    const level = value[0] === 0 ? 'Cautious' : value[0] === 1 ? 'Moderate' : 'Aggressive';
    toast.success(`Bot aggression set to ${level}`);
  };

  const userTier = auth?.license?.tier || 'free';
  const tierOrder: Record<string, number> = {
    'free': 0, 'starter': 1, 'trader': 2, 'pro': 3, 'elite': 4, 'lifetime': 5
  };

  const radarData = agents.filter(a => a.status === 'active').map(a => ({
    agent: a.name.split(' ')[0],
    confidence: a.confidence,
    performance: a.performance,
    actions: Math.min(100, (a.actions / 5)),
  }));

  return (
    <div className="min-h-screen bg-background p-6 overflow-auto">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="technical-grid w-full h-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Network size={64} weight="duotone" className="text-primary animate-pulse-glow" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-primary neon-glow-primary mb-4">
            MULTI-AGENT SYSTEM
          </h1>
          <p className="text-lg text-muted-foreground uppercase tracking-wider">
            Live Coordination • Autonomous Intelligence • Real-Time Optimization
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'UPTIME', value: `${stats.uptime.toFixed(1)}%`, color: 'text-primary', icon: Activity },
            { label: 'TRADES', value: stats.trades.toString(), color: 'text-secondary', icon: Lightning },
            { label: 'SUCCESS', value: `${stats.success.toFixed(1)}%`, color: 'text-accent', icon: Target },
            { label: 'PROFIT', value: `+$${Math.floor(stats.profit)}`, color: 'text-primary', icon: TrendUp },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="cyber-card p-6"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <stat.icon size={20} className={stat.color} />
              </div>
              <p className={`text-4xl font-black ${stat.color} neon-glow`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="uppercase tracking-wider">Overview</TabsTrigger>
            <TabsTrigger value="agents" className="uppercase tracking-wider">Agents</TabsTrigger>
            <TabsTrigger value="pipeline" className="uppercase tracking-wider">Pipeline</TabsTrigger>
            <TabsTrigger value="control" className="uppercase tracking-wider">Control</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="cyber-card-accent">
                <CardHeader>
                  <CardTitle className="uppercase text-primary flex items-center gap-2">
                    <Sparkle size={24} />
                    Agent Performance Radar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="var(--primary)" opacity={0.3} />
                      <PolarAngleAxis dataKey="agent" tick={{ fill: 'var(--primary)', fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)' }} />
                      <Radar name="Confidence" dataKey="confidence" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.6} />
                      <Radar name="Performance" dataKey="performance" stroke="var(--secondary)" fill="var(--secondary)" fillOpacity={0.3} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="cyber-card-accent">
                <CardHeader>
                  <CardTitle className="uppercase text-primary flex items-center gap-2">
                    <TrendUp size={24} />
                    Cumulative Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={agents[0].recentOutcomes}>
                      <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} />
                      <YAxis tick={{ fill: 'var(--muted-foreground)' }} />
                      <Tooltip contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }} />
                      <Line type="monotone" dataKey="pnl" stroke="var(--primary)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="uppercase text-primary">System Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {agents.filter(a => a.status === 'active').map(agent => (
                    <div key={agent.id} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <agent.icon size={20} className="text-primary" />
                        <span className="font-bold uppercase text-sm">{agent.name}</span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">CPU</span>
                            <span className="text-primary">{agent.metrics.cpu.toFixed(0)}%</span>
                          </div>
                          <Progress value={agent.metrics.cpu} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Memory</span>
                            <span className="text-secondary">{agent.metrics.memory.toFixed(0)}%</span>
                          </div>
                          <Progress value={agent.metrics.memory} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Latency</span>
                            <span className="text-accent">{agent.metrics.latency.toFixed(0)}ms</span>
                          </div>
                          <Progress value={Math.min(100, agent.metrics.latency * 2)} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {agents.map((agent, i) => {
                const isLocked = tierOrder[agent.requiredTier] > tierOrder[userTier];
                
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className={`cyber-card-accent relative ${agent.status === 'active' ? 'ring-2 ring-primary' : ''}`}>
                      {isLocked && (
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-4 z-20">
                          <Lock size={48} className="text-accent" />
                          <p className="text-accent text-lg font-bold uppercase">
                            Requires {agent.requiredTier} Tier
                          </p>
                          <Button className="bg-gradient-to-r from-accent to-secondary">
                            <Crown size={20} className="mr-2" />
                            UPGRADE
                          </Button>
                        </div>
                      )}
                      
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-2xl uppercase tracking-wide text-primary flex items-center gap-3">
                              <agent.icon size={28} weight="duotone" />
                              {agent.name}
                              {agent.status === 'active' && (
                                <Badge className="bg-primary text-primary-foreground animate-pulse">
                                  ACTIVE
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="mt-2">{agent.description}</CardDescription>
                          </div>
                          {!isLocked && (
                            <Switch
                              checked={agent.status === 'active'}
                              onCheckedChange={() => toggleAgent(agent.id)}
                            />
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs uppercase tracking-wider text-muted-foreground">
                              LEVEL {agent.level}
                            </span>
                            <span className="text-xs font-mono text-primary">
                              {agent.xp}/{agent.maxXp} XP
                            </span>
                          </div>
                          <Progress value={(agent.xp / agent.maxXp) * 100} className="h-3" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-background/50 p-4 rounded-lg text-center border border-border">
                            <Activity size={16} className="text-accent mx-auto mb-1" />
                            <div className="text-xs text-muted-foreground mb-1">CONFIDENCE</div>
                            <div className="text-2xl font-black text-accent">{agent.confidence}%</div>
                          </div>
                          <div className="bg-background/50 p-4 rounded-lg text-center border border-border">
                            <Target size={16} className="text-secondary mx-auto mb-1" />
                            <div className="text-xs text-muted-foreground mb-1">ACTIONS</div>
                            <div className="text-2xl font-black text-secondary">{agent.actions}</div>
                          </div>
                          <div className="bg-background/50 p-4 rounded-lg text-center border border-border">
                            <TrendUp size={16} className="text-primary mx-auto mb-1" />
                            <div className="text-xs text-muted-foreground mb-1">PROFIT</div>
                            <div className="text-2xl font-black text-primary">+${agent.profit.toFixed(0)}</div>
                          </div>
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">SPECIALTIES</div>
                          <div className="flex flex-wrap gap-2">
                            {agent.specialties.map(s => (
                              <Badge key={s} variant="outline" className="text-xs">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setSelectedAgent(agent)}
                          disabled={isLocked}
                        >
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="pipeline" className="space-y-6">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="uppercase text-primary flex items-center gap-2">
                  <Crosshair size={24} />
                  AI Trading Pipeline
                </CardTitle>
                <CardDescription>
                  Real-time processing flow from market data to execution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {pipelineSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="space-y-3"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 border-2 border-primary">
                        <span className="text-primary font-black">{i + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-foreground mb-1">{step.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{step.desc}</p>
                        <div className="flex items-center gap-3">
                          <Progress value={step.progress} className="h-2 flex-1" />
                          <span className="text-sm font-mono text-primary">{step.progress}%</span>
                        </div>
                      </div>
                    </div>
                    {i < pipelineSteps.length - 1 && (
                      <div className="ml-5 h-8 w-0.5 bg-gradient-to-b from-primary to-transparent" />
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="control" className="space-y-6">
            <Card className="cyber-card">
              <CardHeader>
                <CardTitle className="uppercase text-primary">Bot Aggression Control</CardTitle>
                <CardDescription>
                  Adjust risk-taking behavior across all active agents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-6">
                  <Slider
                    value={aggressionValue}
                    onValueChange={handleAggressionChange}
                    max={2}
                    step={1}
                    className="py-4"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {aggressionLevels.map((level, i) => (
                      <motion.div
                        key={i}
                        className={`p-6 rounded-lg border-2 transition-all ${
                          aggressionValue[0] === i
                            ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20'
                            : 'border-border bg-background/50'
                        }`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <level.icon size={32} className={aggressionValue[0] === i ? 'text-primary' : 'text-muted-foreground'} />
                          <h3 className={`font-bold text-xl ${aggressionValue[0] === i ? 'text-primary' : 'text-foreground'}`}>
                            {level.level}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{level.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <h3 className="font-bold text-lg mb-4 uppercase tracking-wide">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="w-full">
                      Pause All Agents
                    </Button>
                    <Button variant="outline" className="w-full">
                      Resume All Agents
                    </Button>
                    <Button variant="outline" className="w-full">
                      Emergency Stop
                    </Button>
                    <Button className="w-full">
                      Optimize Parameters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function generateMockOutcomes(count: number, winRate: number): Array<{ date: string; pnl: number; confidence: number }> {
  const outcomes: Array<{ date: string; pnl: number; confidence: number }> = [];
  let cumulative = 0;
  for (let i = 0; i < count; i++) {
    const isWin = Math.random() < winRate;
    const pnl = isWin ? Math.random() * 100 + 20 : -(Math.random() * 50 + 10);
    cumulative += pnl;
    outcomes.push({
      date: new Date(Date.now() - (count - i) * 3600000 * 6).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pnl: cumulative,
      confidence: Math.floor(Math.random() * 30 + 70)
    });
  }
  return outcomes;
}
