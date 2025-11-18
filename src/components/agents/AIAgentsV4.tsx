// components/agents/AIAgentsV4.tsx - Ultimate AI Agents Command Center
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Brain, Zap, TrendingUp, Crown, Award, Target, Activity, Sparkles, Lock, ChartLine } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useKV } from '@github/spark/hooks';
import { UserAuth } from '@/lib/auth';

interface Agent {
  id: string;
  name: string;
  description: string;
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
  recentOutcomes: Array<{ date: string; pnl: number; confidence: number }>;
  specialties: string[];
  synergy: Record<string, number>;
}

const AIAgentsV4: React.FC = () => {
  const [auth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  });

  const [timeFilter, setTimeFilter] = useState('7d');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [totalProfit, setTotalProfit] = useState(0);
  const [totalActions, setTotalActions] = useState(0);
  const [avgConfidence, setAvgConfidence] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const userTier = auth?.license?.tier || 'free';

  useEffect(() => {
    loadAgentData();

    // Simulate real-time updates
    const interval = setInterval(() => {
      loadAgentData();
    }, 10000);

    return () => clearInterval(interval);
  }, [timeFilter]);

  const loadAgentData = () => {
    setIsLoading(true);
    
    // Mock data - Replace with real API
    const mockAgents: Agent[] = [
      {
        id: 'market-analyst',
        name: 'Market Analyst',
        description: 'Analyzes market trends and identifies high-probability trade setups using ML',
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
        recentOutcomes: generateMockOutcomes(20, 0.85),
        specialties: ['Trend Detection', 'Volume Analysis', 'Sentiment Scanning'],
        synergy: { 'strategy-engine': 95, 'rl-optimizer': 88 }
      },
      {
        id: 'strategy-engine',
        name: 'Strategy Engine',
        description: 'Executes and optimizes trading strategies with real-time adaptation',
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
        recentOutcomes: generateMockOutcomes(30, 0.80),
        specialties: ['Strategy Selection', 'Parameter Tuning', 'Risk Management'],
        synergy: { 'market-analyst': 95, 'rl-optimizer': 92 }
      },
      {
        id: 'rl-optimizer',
        name: 'RL Optimizer',
        description: 'Uses reinforcement learning to continuously improve strategy performance',
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
        recentOutcomes: generateMockOutcomes(40, 0.90),
        specialties: ['Learning Optimization', 'Reward Maximization', 'Adaptive Control'],
        synergy: { 'market-analyst': 88, 'strategy-engine': 92 }
      },
      {
        id: 'sentiment-scanner',
        name: 'Sentiment Scanner',
        description: 'Monitors social media and news for market sentiment signals',
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
        recentOutcomes: generateMockOutcomes(15, 0.75),
        specialties: ['Social Listening', 'News Analysis', 'FOMO Detection'],
        synergy: { 'market-analyst': 85, 'strategy-engine': 78 }
      },
      {
        id: 'whale-tracker',
        name: 'Whale Tracker',
        description: 'Tracks large wallet movements and institutional trading patterns',
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
        recentOutcomes: generateMockOutcomes(25, 0.82),
        specialties: ['On-Chain Analysis', 'Whale Detection', 'Flow Tracking'],
        synergy: { 'market-analyst': 90, 'rl-optimizer': 85 }
      }
    ];

    setAgents(mockAgents);
    setTotalProfit(mockAgents.reduce((sum, a) => sum + a.profit, 0));
    setTotalActions(mockAgents.reduce((sum, a) => sum + a.actions, 0));
    setAvgConfidence(mockAgents.reduce((sum, a) => sum + a.confidence, 0) / mockAgents.length);
    setIsLoading(false);
  };

  const generateMockOutcomes = (count: number, winRate: number) => {
    const outcomes = [];
    for (let i = 0; i < count; i++) {
      const isWin = Math.random() < winRate;
      outcomes.push({
        date: new Date(Date.now() - (count - i) * 3600000 * 6).toLocaleDateString(),
        pnl: isWin ? Math.random() * 100 + 20 : -(Math.random() * 50 + 10),
        confidence: Math.floor(Math.random() * 30 + 70)
      });
    }
    return outcomes;
  };

  const toggleAgent = (agentId: string) => {
    setAgents(prev => prev.map(a =>
      a.id === agentId && a.status !== 'locked'
        ? { ...a, status: a.status === 'active' ? 'paused' : 'active' as any }
        : a
    ));
  };

  const AgentCard = ({ agent }: { agent: Agent }) => {
    const [isHovered, setIsHovered] = useState(false);
    const requiredTierOrder: Record<string, number> = {
      'free': 0, 'starter': 1, 'trader': 2, 'pro': 3, 'elite': 4, 'lifetime': 5
    };
    const isLocked = requiredTierOrder[agent.requiredTier] > requiredTierOrder[userTier];

    return (
      <motion.div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: isLocked ? 1.02 : 1.03 }}
      >
        <Card className={`cyber-card transition-all duration-300 ${agent.status === 'active' ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''}`}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl uppercase tracking-wide text-primary flex items-center gap-2">
                  <Brain size={24} />
                  {agent.name}
                  {agent.status === 'active' && (
                    <Badge className="bg-primary text-primary-foreground animate-pulse ml-2">
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
                  className="ml-4"
                />
              )}
            </div>
          </CardHeader>

          <CardContent>
            {isLocked && (
              <div className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-4 z-20">
                <Lock size={48} className="text-accent" />
                <p className="text-accent text-lg font-bold uppercase">
                  Requires {agent.requiredTier} Tier
                </p>
                <Button className="bg-gradient-to-r from-accent to-secondary">
                  <Crown className="mr-2" size={20} />
                  UPGRADE
                </Button>
              </div>
            )}

            <div className="space-y-6">
              {/* XP Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="data-label text-xs">LEVEL {agent.level}</span>
                  <span className="technical-readout text-xs">
                    {agent.xp}/{agent.maxXp} XP
                  </span>
                </div>
                <Progress value={(agent.xp / agent.maxXp) * 100} className="h-3" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="cyber-card-inner p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Activity size={14} className="text-accent" />
                    <span className="data-label text-xs">CONFIDENCE</span>
                  </div>
                  <div className="technical-readout text-xl text-accent">
                    {agent.confidence}%
                  </div>
                </div>

                <div className="cyber-card-inner p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Target size={14} className="text-secondary" />
                    <span className="data-label text-xs">ACTIONS</span>
                  </div>
                  <div className="technical-readout text-xl text-secondary">
                    {agent.actions}
                  </div>
                </div>

                <div className="cyber-card-inner p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp size={14} className="text-primary" />
                    <span className="data-label text-xs">PROFIT</span>
                  </div>
                  <div className="technical-readout text-xl text-primary">
                    +${agent.profit.toFixed(0)}
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <div className="data-label text-xs mb-2">SPECIALTIES</div>
                <div className="flex flex-wrap gap-2">
                  {agent.specialties.map(s => (
                    <Badge key={s} variant="outline" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Mini Performance Chart */}
              <div className="h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={agent.recentOutcomes.slice(-10)}>
                    <Line
                      type="monotone"
                      dataKey="pnl"
                      stroke="#14F195"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setSelectedAgent(agent)}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hover Preview Overlay */}
        <AnimatePresence>
          {isHovered && isLocked && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute -top-4 left-1/2 -translate-x-1/2 z-50 w-[450px] pointer-events-none"
              style={{ maxWidth: 'calc(100vw - 2rem)' }}
            >
              <div className="cyber-card p-6 shadow-2xl shadow-accent/50 border-2 border-accent pointer-events-auto">
                <h4 className="text-2xl font-bold text-primary mb-3 flex items-center gap-3 uppercase">
                  <Sparkles className="text-accent" />
                  Unlock Potential
                </h4>

                <div className="h-32 mb-4 bg-background/50 rounded-lg p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={agent.recentOutcomes}>
                      <Line
                        type="monotone"
                        dataKey="pnl"
                        stroke="#14F195"
                        strokeWidth={3}
                        dot={{ fill: '#14F195', r: 3 }}
                      />
                      <XAxis dataKey="date" stroke="#666" style={{ fontSize: '8px' }} />
                      <YAxis stroke="#666" style={{ fontSize: '8px' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="cyber-card-inner p-4 text-center">
                    <div className="text-primary font-bold text-2xl">
                      +${agent.profit.toFixed(0)}
                    </div>
                    <div className="text-xs text-muted-foreground uppercase">
                      Projected Profit
                    </div>
                  </div>
                  <div className="cyber-card-inner p-4 text-center">
                    <div className="text-accent font-bold text-2xl">
                      {agent.performance.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground uppercase">
                      Win Rate Boost
                    </div>
                  </div>
                </div>

                <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-4">
                  <p className="text-primary text-center font-bold text-sm">
                    🔥 This agent improved Elite traders' performance by +{agent.performance.toFixed(1)}%
                  </p>
                  <p className="text-muted-foreground text-center text-xs mt-2">
                    Projected boost: +${Math.floor(agent.profit * 0.3)} in next 30 days
                  </p>
                </div>

                <Button className="w-full bg-gradient-to-r from-accent to-secondary hover:scale-105 transition-transform py-6">
                  <Crown className="mr-2" size={24} />
                  UPGRADE TO UNLOCK
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Synergy Heatmap Data
  const synergyData = agents.filter(a => a.status === 'active').map(a => ({
    agent: a.name,
    ...Object.fromEntries(
      agents.filter(other => other.status === 'active' && other.id !== a.id)
        .map(other => [other.name, a.synergy[other.id] || 0])
    )
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-accent/20 border-2 border-accent rounded-xl">
              <Brain size={48} className="text-accent" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-wider uppercase">
                <span className="text-accent neon-glow-accent">AI_COMMAND_CENTER</span>
              </h1>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mt-2">
                AUTONOMOUS TRADING INTELLIGENCE • MULTI-AGENT COORDINATION
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {['24h', '7d', '30d', 'All'].map(filter => (
              <Button
                key={filter}
                size="sm"
                variant={timeFilter === filter.toLowerCase() ? 'default' : 'outline'}
                onClick={() => setTimeFilter(filter.toLowerCase())}
                className="uppercase text-xs font-bold"
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cyber-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity size={24} className="text-accent" />
              <span className="data-label">AVG CONFIDENCE</span>
            </div>
            <div className="technical-readout text-4xl text-accent">
              {avgConfidence.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Target size={24} className="text-secondary" />
              <span className="data-label">TOTAL ACTIONS</span>
            </div>
            <div className="technical-readout text-4xl text-secondary">
              {totalActions}
            </div>
          </CardContent>
        </Card>

        <Card className="cyber-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp size={24} className="text-primary" />
              <span className="data-label">TOTAL PROFIT</span>
            </div>
            <div className="technical-readout text-4xl text-primary">
              +${totalProfit.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {/* AI Insights Section */}
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="text-accent uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={24} />
            AI Coordination Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-accent/10 border border-accent/30 rounded-xl">
            <h3 className="text-xl font-bold text-primary mb-3">🧠 Multi-Agent Synergy</h3>
            <p className="text-foreground/90 mb-4">
              Your <span className="text-accent font-bold">Market Analyst</span> is performing at 92% confidence.
              Activating <span className="text-primary font-bold">RL Optimizer</span> (Elite Tier) would create a 
              synergy boost of <span className="text-accent font-bold">+18% performance improvement</span>.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="cyber-card-inner p-4 text-center">
                <div className="text-2xl font-bold text-primary">+$1,247</div>
                <div className="text-xs text-muted-foreground">Projected 30d Gain</div>
              </div>
              <div className="cyber-card-inner p-4 text-center">
                <div className="text-2xl font-bold text-accent">+18%</div>
                <div className="text-xs text-muted-foreground">Performance Boost</div>
              </div>
            </div>
          </div>

          <Button size="lg" className="w-full bg-gradient-to-r from-accent to-secondary hover:scale-105 transition-transform">
            <Crown className="mr-2" />
            UPGRADE TO ELITE - UNLOCK ALL AGENTS
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAgentsV4;
