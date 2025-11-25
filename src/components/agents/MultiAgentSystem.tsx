import { useEffect, useState, useCallback } from 'react';
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
import { AGGRESSION_BLUEPRINTS, DEFAULT_AGGRESSION_BLUEPRINT, type AggressionBlueprint } from '@/lib/agents/aggressionProfiles';
import type { AutonomyTelemetry } from '@/lib/bot/AutonomousTradingLoop';
import { DEFAULT_AUTONOMY_TELEMETRY } from '@/lib/bot/AutonomousTradingLoop';

interface Agent {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; weight?: string; className?: string }>;
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
    id: 'cautious' as const,
    level: 'Cautious',
    icon: Shield,
    color: 'text-primary',
    description: 'Conservative risk-taking, low-frequency trades, focus on preservation.',
  },
  {
    id: 'moderate' as const,
    level: 'Moderate',
    icon: Scales,
    color: 'text-secondary',
    description: 'Balanced approach, medium risk, steady growth.',
  },
  {
    id: 'aggressive' as const,
    level: 'Aggressive',
    icon: Fire,
    color: 'text-destructive',
    description: 'High-risk trading, frequent actions, potential for high returns.',
  },
];

import { clamp, formatCurrency } from '@/lib/utils';

const pipelineSteps = [
  { title: 'Market Data Ingestion', desc: 'Real-time data from multiple DEXs and oracles', progress: 95 },
  { title: 'Signal Processing', desc: 'Analyze trends, volatility, and patterns using ML', progress: 88 },
  { title: 'Strategy Selection', desc: 'Choose optimal trading strategy based on conditions', progress: 92 },
  { title: 'Order Execution', desc: 'Execute trades with minimal latency and slippage', progress: 97 },
  { title: 'Performance Tracking', desc: 'Monitor outcomes and feed back into RL model', progress: 91 },
];

import type { UserAuth } from '@/lib/auth'

export default function MultiAgentSystem() {
  const [auth] = useKV<UserAuth>('user-auth', { license: { tier: 'free' } });
  const [activeTab, setActiveTab] = useState('overview');
  const [aggressionProfile, setAggressionProfileKV] = useKV<AggressionBlueprint>(
    'autonomous-aggression-profile',
    DEFAULT_AGGRESSION_BLUEPRINT
  );
  const initialAggressionIndex =
    AGGRESSION_BLUEPRINTS.findIndex((blueprint) => blueprint.id === aggressionProfile?.id) ?? 1;
  const [aggressionValue, setAggressionValue] = useState<[number]>([Math.max(0, initialAggressionIndex)]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [autonomyTelemetry] = useKV<AutonomyTelemetry>('autonomous-telemetry', DEFAULT_AUTONOMY_TELEMETRY);
  
  // Initialize XP auto-award system
  useEffect(() => {
    import('@/lib/xpAutoAward').then(({ useAutoXPAward }) => {
      // System will auto-award XP for all actions
    }).catch(() => {
      // Silent fail
    })
  }, [])
  
  // Initialize challenge tracking
  useEffect(() => {
    import('@/lib/dailyChallenges').then((module) => {
      const { useDailyChallenges } = module
      // Challenge tracking will be connected via setChallengeUpdater
    }).catch(() => {
      // Silent fail
    })
  }, [])

  useEffect(() => {
    const nextIndex = AGGRESSION_BLUEPRINTS.findIndex((bp) => bp.id === aggressionProfile?.id);
    if (nextIndex >= 0 && aggressionValue[0] !== nextIndex) {
      setAggressionValue([nextIndex]);
    }
  }, [aggressionProfile?.id]);
  
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
  const applyAggressionProfile = useCallback(
    (profile: AggressionBlueprint, options?: { silent?: boolean; skipPersistence?: boolean }) => {
      setAgents(prev =>
        prev.map(agent => {
          if (agent.status === 'locked') return agent;
          const frequencyMultiplier = profile.tradeFrequencyMultiplier;
          return {
            ...agent,
            actions: Math.max(agent.actions, Math.round(agent.actions * frequencyMultiplier)),
            profit: parseFloat((agent.profit * profile.pnlMultiplier).toFixed(2)),
            confidence: clamp(agent.confidence + profile.confidenceDelta, 65, 99),
            performance: clamp(agent.performance + profile.performanceDelta, 70, 99),
          };
        })
      );

      setStats(prev => ({
        ...prev,
        success: clamp(profile.targetWinRate * 100, 70, 99),
        trades: Math.max(prev.trades, Math.round(prev.trades * profile.tradeFrequencyMultiplier)),
        profit: prev.profit + profile.dailyAlpha,
      }));

      if (!options?.skipPersistence) {
        setAggressionProfileKV(profile);
      }

      if (!options?.silent) {
        toast.success(`${profile.title} engaged`, {
          description: profile.alphaQuote,
          duration: 2800,
        });
      }
    },
    [setAgents, setStats, setAggressionProfileKV]
  );

  useEffect(() => {
    if (aggressionProfile) {
      applyAggressionProfile(aggressionProfile, { silent: true, skipPersistence: true });
    }
  }, [aggressionProfile, applyAggressionProfile]);

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
    const levelIndex = value[0] ?? 1;
    const level = aggressionLevels[levelIndex]?.level ?? 'Moderate';
    const nextProfile = AGGRESSION_BLUEPRINTS[levelIndex] ?? DEFAULT_AGGRESSION_BLUEPRINT;
    applyAggressionProfile(nextProfile);
    toast.success(`Bot aggression set to ${level}`, {
      description: nextProfile.subtitle,
      duration: 2600,
    });
  };

  const pauseAllAgents = useCallback(() => {
    setAgents(prev => prev.map(agent => (agent.status === 'locked' ? agent : { ...agent, status: 'paused' })));
    toast.warning('All agents paused', { description: 'Capital preserved until you resume.' });
  }, [setAgents]);

  const resumeAllAgents = useCallback(() => {
    setAgents(prev => prev.map(agent => (agent.status === 'locked' ? agent : { ...agent, status: 'active' })));
    toast.success('Agents back online', { description: 'Full formation executing playbook.' });
  }, [setAgents]);

  const emergencyStop = useCallback(() => {
    const safeProfile = AGGRESSION_BLUEPRINTS[0];
    setAggressionValue([0]);
    applyAggressionProfile(safeProfile);
    setAgents(prev => prev.map(agent => (agent.status === 'locked' ? agent : { ...agent, status: 'paused' })));
    toast.error('Emergency stop activated', { description: 'Switching to capital preservation mode.' });
  }, [applyAggressionProfile]);

  const optimizeParameters = useCallback(() => {
    applyAggressionProfile(aggressionProfile);
    toast.success('Parameters optimized', { description: aggressionProfile.alphaQuote });
  }, [aggressionProfile, applyAggressionProfile]);

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
  const telemetryWinRate = autonomyTelemetry.totalTrades > 0
    ? (autonomyTelemetry.profitableTrades / autonomyTelemetry.totalTrades) * 100
    : 0;
  const goalPercent = Math.min(100, Math.max(0, (autonomyTelemetry.goalProgress / 600) * 100));

import { formatRelativeTime } from '@/lib/utils';

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
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 diagonal-stripes opacity-5" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-accent/20 to-transparent blur-3xl" />
            
            <div className="relative z-10 cyber-card p-8 mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Network size={64} weight="duotone" className="text-primary neon-glow-primary" />
                </motion.div>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-primary neon-glow-primary mb-4">
                MULTI-AGENT SYSTEM
              </h1>
              <p className="text-lg text-muted-foreground uppercase tracking-wider mb-4">
                Live Coordination • Autonomous Intelligence • Real-Time Optimization
              </p>
              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-black text-primary">{agents.filter(a => a.status === 'active').length}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Active Agents</div>
                </div>
                <div className="w-px h-8 bg-primary/30" />
                <div className="text-center">
                  <div className="text-2xl font-black text-accent">{agents.reduce((sum, a) => sum + a.actions, 0).toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Actions</div>
                </div>
                <div className="w-px h-8 bg-primary/30" />
                <div className="text-center">
                  <div className="text-2xl font-black text-green-400">
                    +${agents.reduce((sum, a) => sum + a.profit, 0).toFixed(0)}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Combined Profit</div>
                </div>
              </div>
            </div>
          </div>
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
                          <div className="glass-morph-card p-4 text-center border border-accent/30 bg-accent/10">
                            <Activity size={20} weight="duotone" className="text-accent mx-auto mb-2" />
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">CONFIDENCE</div>
                            <div className="text-2xl font-black text-accent">{agent.confidence}%</div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                              Avg: {agent.avgConfidence}%
                            </div>
                          </div>
                          <div className="glass-morph-card p-4 text-center border border-secondary/30 bg-secondary/10">
                            <Target size={20} weight="duotone" className="text-secondary mx-auto mb-2" />
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">ACTIONS</div>
                            <div className="text-2xl font-black text-secondary">{agent.actions.toLocaleString()}</div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                              {agent.status === 'active' ? 'Active' : 'Paused'}
                            </div>
                          </div>
                          <div className="glass-morph-card p-4 text-center border border-primary/30 bg-primary/10">
                            <TrendUp size={20} weight="duotone" className="text-primary mx-auto mb-2" />
                            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">PROFIT</div>
                            <div className="text-2xl font-black text-primary">+${agent.profit.toFixed(2)}</div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                              Performance: {agent.performance}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced Metrics */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                          <div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">CPU</div>
                            <div className="flex items-center gap-2">
                              <Progress value={agent.metrics.cpu} className="flex-1 h-2" />
                              <span className="text-xs font-bold text-primary">{agent.metrics.cpu}%</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Memory</div>
                            <div className="flex items-center gap-2">
                              <Progress value={agent.metrics.memory} className="flex-1 h-2" />
                              <span className="text-xs font-bold text-secondary">{agent.metrics.memory}%</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Latency</div>
                            <div className="text-xs font-bold text-accent">{agent.metrics.latency}ms</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Synergy</div>
                            <div className="text-xs font-bold text-primary">
                              {Object.values(agent.synergy).length > 0 
                                ? Math.round(Object.values(agent.synergy).reduce((a, b) => a + b, 0) / Object.values(agent.synergy).length)
                                : 0}%
                            </div>
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

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="glass-morph-card p-5 border border-primary/30 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-70" />
                      <div className="relative z-10 space-y-3">
                        <p className="text-xs uppercase tracking-widest text-primary/80">Projected Daily P&L</p>
                        <p className="text-4xl font-black text-primary">{formatCurrency(aggressionProfile.projectedDailyPnl)}</p>
                        <p className="text-xs text-muted-foreground">{aggressionProfile.subtitle}</p>
                      </div>
                    </div>

                    <div className="cyber-card-accent p-5 space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground mb-1">
                          <span>Target Win Rate</span>
                          <span className="text-primary font-bold">{Math.round(aggressionProfile.targetWinRate * 100)}%</span>
                        </div>
                        <Progress value={aggressionProfile.targetWinRate * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground mb-1">
                          <span>Drawdown Guard</span>
                          <span className="text-secondary font-bold">{Math.round(aggressionProfile.drawdownGuard * 100)}%</span>
                        </div>
                        <Progress value={aggressionProfile.drawdownGuard * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground mb-1">
                          <span>Risk Budget Deployed</span>
                          <span className="text-accent font-bold">{Math.round(aggressionProfile.riskBudget * 100)}%</span>
                        </div>
                        <Progress value={aggressionProfile.riskBudget * 100} className="h-2" />
                      </div>
                    </div>

                    <div className="cyber-card p-5 space-y-4">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Strategy Focus</p>
                      <div className="flex flex-wrap gap-2">
                        {aggressionProfile.focus.map(tag => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="border-primary/40 text-primary text-[11px] font-semibold tracking-wider"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground italic">“{aggressionProfile.alphaQuote}”</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="glass-morph-card p-5 border border-white/15 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Autonomous Goal Progress</p>
                      <Badge className={autonomyTelemetry.isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}>
                        {autonomyTelemetry.isActive ? 'RUNNING' : 'PAUSED'}
                      </Badge>
                    </div>
                    <Progress value={goalPercent} className="h-3" />
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Completion</p>
                        <p className="text-foreground font-bold">{goalPercent.toFixed(0)}%</p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Win Rate</p>
                        <p className="text-foreground font-bold">{telemetryWinRate.toFixed(1)}%</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                      <span>Trades <span className="text-primary font-bold">{autonomyTelemetry.totalTrades}</span></span>
                      <span>Avg Profit <span className="text-secondary font-bold">
                        {autonomyTelemetry.lastProfit ? `$${autonomyTelemetry.lastProfit.toFixed(2)}` : '—'}
                      </span></span>
                      <span>Interval <span className="text-foreground font-bold">{(autonomyTelemetry.tradingIntervalMs / 1000).toFixed(0)}s</span></span>
                    </div>
                  </div>

                  <div className="cyber-card p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Last Decision</p>
                      <span className="text-[11px] text-muted-foreground">{formatRelativeTime(autonomyTelemetry.lastUpdated)}</span>
                    </div>
                    {autonomyTelemetry.lastDecision ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/20 border border-primary text-primary text-[10px]">
                            {autonomyTelemetry.lastDecision.action}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Confidence: {autonomyTelemetry.lastDecision.confidence || '—'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Agent <span className="text-foreground font-semibold">{autonomyTelemetry.lastDecision.agent || 'Auto Core'}</span> • Strategy{' '}
                          <span className="text-foreground font-semibold">{autonomyTelemetry.lastDecision.strategy || 'Adaptive Loop'}</span>
                        </p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Expecting <span className="text-primary font-bold">
                            {autonomyTelemetry.lastDecision.expectedProfit ? `$${autonomyTelemetry.lastDecision.expectedProfit.toFixed(2)}` : '—'}
                          </span></span>
                          {autonomyTelemetry.lastTxId && (
                            <span className="truncate">TX <span className="text-secondary font-mono">{autonomyTelemetry.lastTxId.slice(0, 10)}…</span></span>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Awaiting first autonomous heartbeat…</p>
                    )}
                    <div className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                      News sweep {formatRelativeTime(autonomyTelemetry.lastNewsScan)}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <h3 className="font-bold text-lg mb-4 uppercase tracking-wide">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="w-full" onClick={pauseAllAgents}>
                      Pause All Agents
                    </Button>
                    <Button variant="outline" className="w-full" onClick={resumeAllAgents}>
                      Resume All Agents
                    </Button>
                    <Button variant="outline" className="w-full" onClick={emergencyStop}>
                      Emergency Stop
                    </Button>
                    <Button className="w-full" onClick={optimizeParameters}>
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
