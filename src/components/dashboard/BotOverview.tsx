import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Brain, Robot, ChartLine, Lightning, Target, ArrowsClockwise, CheckCircle, Warning, Info, Terminal, Play, Pause, Gear, ShieldWarning, ShieldCheck, Sword, Cube, Hexagon, Pentagon, Polygon } from '@phosphor-icons/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Wireframe3D from '@/components/shared/Wireframe3D'
import BotAggressionControl from './BotAggressionControl'

type AggressionLevel = 'cautious' | 'moderate' | 'aggressive'

interface BotConfig {
  marketAnalyst: {
    enabled: boolean
    scanInterval: number
    minLiquidity: number
    volatilityThreshold: number
    confidenceThreshold: number
  }
  strategyEngine: {
    enabled: boolean
    dcaEnabled: boolean
    dcaAmount: number
    dcaInterval: number
    snipeEnabled: boolean
    snipeAmount: number
    maxSlippage: number
  }
  rlOptimizer: {
    enabled: boolean
    learningRate: number
    explorationRate: number
    trainingCycles: number
    rebalanceThreshold: number
  }
}

interface BotMetrics {
  uptime: number
  totalTrades: number
  successRate: number
  totalProfit: number
  avgConfidence: number
  activeStrategies: number
}

interface SystemStatus {
  network: 'online' | 'offline' | 'degraded'
  api: 'connected' | 'disconnected' | 'error'
  database: 'operational' | 'readonly' | 'error'
  agents: 'active' | 'paused' | 'error'
}

const defaultConfig: BotConfig = {
  marketAnalyst: {
    enabled: true,
    scanInterval: 5,
    minLiquidity: 100000,
    volatilityThreshold: 5.0,
    confidenceThreshold: 75
  },
  strategyEngine: {
    enabled: true,
    dcaEnabled: true,
    dcaAmount: 50,
    dcaInterval: 3600,
    snipeEnabled: true,
    snipeAmount: 100,
    maxSlippage: 2.5
  },
  rlOptimizer: {
    enabled: true,
    learningRate: 0.001,
    explorationRate: 0.15,
    trainingCycles: 1000,
    rebalanceThreshold: 5.0
  }
}

export default function BotOverview() {
  const [config, setConfig] = useKV<BotConfig>('bot-config', defaultConfig)
  const [aggressionLevel, setAggressionLevel] = useKV<AggressionLevel>('bot-aggression', 'moderate')
  const [aggressionValue, setAggressionValue] = useKV<number>('bot-aggression-value', 50)
  const [metrics] = useKV<BotMetrics>('bot-metrics', {
    uptime: 94.7,
    totalTrades: 1247,
    successRate: 87.3,
    totalProfit: 2834.56,
    avgConfidence: 82.4,
    activeStrategies: 7
  })
  
  const [systemStatus] = useState<SystemStatus>({
    network: 'online',
    api: 'connected',
    database: 'operational',
    agents: 'active'
  })

  const [selectedTab, setSelectedTab] = useState('overview')

  const getAggressionLevel = (value: number): AggressionLevel => {
    if (value < 34) return 'cautious'
    if (value < 67) return 'moderate'
    return 'aggressive'
  }

  const getAggressionColor = (level: AggressionLevel) => {
    switch (level) {
      case 'cautious':
        return 'text-secondary'
      case 'moderate':
        return 'text-accent'
      case 'aggressive':
        return 'text-destructive'
    }
  }

  const getAggressionIcon = (level: AggressionLevel) => {
    switch (level) {
      case 'cautious':
        return <ShieldCheck size={24} weight="fill" className="text-secondary" />
      case 'moderate':
        return <ShieldWarning size={24} weight="fill" className="text-accent" />
      case 'aggressive':
        return <Sword size={24} weight="fill" className="text-destructive" />
    }
  }

  const handleAggressionChange = (value: number[]) => {
    const newValue = value[0]
    setAggressionValue(newValue)
    const newLevel = getAggressionLevel(newValue)
    setAggressionLevel(newLevel)
    toast.success(`Aggression set to ${newLevel.toUpperCase()}`, {
      description: `Bot will now trade with ${newLevel} risk parameters`
    })
  }

  const toggleAgent = (agent: keyof BotConfig) => {
    setConfig((current) => {
      if (!current) return defaultConfig
      return {
        ...current,
        [agent]: {
          ...current[agent],
          enabled: !current[agent].enabled
        }
      }
    })
    
    const agentName = agent === 'marketAnalyst' ? 'Market Analyst' : 
                     agent === 'strategyEngine' ? 'Strategy Engine' : 
                     'RL Optimizer'
    
    toast.success(`${agentName} ${config?.[agent].enabled ? 'paused' : 'resumed'}`)
  }

  const getStatusColor = (status: string) => {
    if (status === 'online' || status === 'connected' || status === 'operational' || status === 'active') {
      return 'text-secondary'
    }
    if (status === 'degraded' || status === 'readonly' || status === 'paused') {
      return 'text-accent'
    }
    return 'text-destructive'
  }

  const getStatusIcon = (status: string) => {
    if (status === 'online' || status === 'connected' || status === 'operational' || status === 'active') {
      return <CheckCircle size={16} weight="fill" className="text-secondary" />
    }
    if (status === 'degraded' || status === 'readonly' || status === 'paused') {
      return <Warning size={16} weight="fill" className="text-accent" />
    }
    return <Warning size={16} weight="fill" className="text-destructive" />
  }

  if (!config || !metrics) return null

  return (
    <div className="space-y-6">
      <div className="cyber-card relative overflow-hidden">
        <div className="absolute inset-0 diagonal-stripes opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <Wireframe3D type="sphere" size={256} color="primary" animated={true} />
        </div>
        <div className="p-6 md:p-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <div className="p-6 jagged-corner bg-gradient-to-br from-secondary/20 to-accent/20 border-4 border-secondary shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.6)]">
                <Robot size={64} weight="duotone" className="text-secondary" />
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-[0.2em] uppercase">
                    <span className="text-secondary neon-glow-secondary">MULTI-AGENT</span>
                    <span className="text-primary neon-glow-primary ml-2">SYSTEM</span>
                  </h2>
                  <div className="px-3 py-1 jagged-corner-small bg-secondary/20 border border-secondary">
                    <span className="text-xs font-bold text-secondary uppercase tracking-[0.15em]">BOT OVERVIEW</span>
                  </div>
                </div>
                <p className="text-sm uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                  AUTONOMOUS AI TRADING ARCHITECTURE // REAL-TIME MARKET INTELLIGENCE
                </p>
              </div>
              
              <p className="text-base leading-relaxed text-foreground">
                The <span className="text-secondary font-bold">Quantum Falcon</span> employs a sophisticated multi-agent AI architecture that combines{' '}
                <span className="text-primary font-bold">market analysis</span>,{' '}
                <span className="text-primary font-bold">strategy execution</span>, and{' '}
                <span className="text-accent font-bold">reinforcement learning</span> to deliver autonomous trading intelligence. Each agent operates independently while coordinating through a shared knowledge base for optimal performance.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-muted/30 border-l-2 border-secondary hover:border-accent transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <Lightning size={16} weight="fill" className="text-secondary" />
                    <p className="text-xs uppercase tracking-wide font-bold text-secondary">Real-Time Analysis</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Continuous market scanning & pattern recognition</p>
                </div>
                <div className="p-3 bg-muted/30 border-l-2 border-accent hover:border-secondary transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <Target size={16} weight="fill" className="text-accent" />
                    <p className="text-xs uppercase tracking-wide font-bold text-accent">Adaptive Strategies</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Dynamic position sizing & risk management</p>
                </div>
                <div className="p-3 bg-muted/30 border-l-2 border-primary hover:border-secondary transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain size={16} weight="fill" className="text-primary" />
                    <p className="text-xs uppercase tracking-wide font-bold text-primary">Self-Learning</p>
                  </div>
                  <p className="text-xs text-muted-foreground">RL optimization from historical performance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="cyber-card group hover:scale-105 transition-all">
          <div className="p-4 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-semibold">System Uptime</p>
              <div className="p-2 border-2 angled-corner-tr bg-secondary/5 border-secondary relative overflow-hidden">
                <div className="absolute inset-0 bg-secondary opacity-5" />
                <Cube size={16} weight="duotone" className="text-secondary relative z-10" />
              </div>
            </div>
            <p className="text-4xl font-bold text-secondary neon-glow-secondary hud-value">{metrics.uptime}%</p>
          </div>
        </div>

        <div className="cyber-card group hover:scale-105 transition-all">
          <div className="p-4 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-semibold">Total Trades</p>
              <div className="p-2 border-2 cut-corner-tr bg-primary/5 border-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-primary opacity-5" />
                <Hexagon size={16} weight="duotone" className="text-primary relative z-10" />
              </div>
            </div>
            <p className="text-4xl font-bold text-primary neon-glow-primary hud-value">{metrics.totalTrades.toLocaleString()}</p>
          </div>
        </div>

        <div className="cyber-card group hover:scale-105 transition-all">
          <div className="p-4 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-semibold">Success Rate</p>
              <div className="p-2 border-2 angled-corner-br bg-secondary/5 border-secondary relative overflow-hidden">
                <div className="absolute inset-0 bg-secondary opacity-5" />
                <Pentagon size={16} weight="duotone" className="text-secondary relative z-10" />
              </div>
            </div>
            <p className="text-4xl font-bold text-secondary neon-glow-secondary hud-value">{metrics.successRate}%</p>
          </div>
        </div>

        <div className="cyber-card-accent group hover:scale-105 transition-all">
          <div className="p-4 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] font-semibold">Total Profit</p>
              <div className="p-2 border-2 cut-corner-br bg-accent/10 border-accent relative overflow-hidden">
                <div className="absolute inset-0 bg-accent opacity-5" />
                <Polygon size={16} weight="fill" className="text-accent relative z-10" />
              </div>
            </div>
            <p className="text-4xl font-bold text-accent neon-glow-accent hud-value">${metrics.totalProfit.toFixed(0)}</p>
          </div>
        </div>
      </div>

      <BotAggressionControl />

      <div className="cyber-card scan-line-effect">
        <div className="p-6 relative z-10">
          <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout mb-6">SYSTEM_STATUS</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(systemStatus).map(([key, value]) => (
              <div key={key} className="p-4 bg-muted/30 border-l-2 border-primary hover:bg-muted/50 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-wide font-bold text-muted-foreground">{key.replace(/([A-Z])/g, '_$1').toUpperCase()}</p>
                  {getStatusIcon(value)}
                </div>
                <p className={`text-lg font-bold uppercase tracking-wide ${getStatusColor(value)} hud-value`}>
                  {value.toUpperCase()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-1 border-b-2 border-primary/30">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-b-3 data-[state=active]:border-primary px-6 py-3 text-xs uppercase tracking-[0.1em] font-bold transition-all hover:bg-primary/10 border-b-3 border-transparent"
          >
            <ChartLine size={16} weight="duotone" className="mr-2" />
            Architecture
          </TabsTrigger>
          <TabsTrigger
            value="agents"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-b-3 data-[state=active]:border-primary px-6 py-3 text-xs uppercase tracking-[0.1em] font-bold transition-all hover:bg-primary/10 border-b-3 border-transparent"
          >
            <Robot size={16} weight="duotone" className="mr-2" />
            Agent Details
          </TabsTrigger>
          <TabsTrigger
            value="config"
            className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-b-3 data-[state=active]:border-primary px-6 py-3 text-xs uppercase tracking-[0.1em] font-bold transition-all hover:bg-primary/10 border-b-3 border-transparent"
          >
            <Gear size={16} weight="duotone" className="mr-2" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="cyber-card">
            <div className="p-6 relative z-10">
              <h3 className="text-2xl font-bold uppercase tracking-[0.15em] text-primary hud-text mb-4">SYSTEM ARCHITECTURE</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 jagged-corner bg-primary/10 border-2 border-primary">
                      <div className="flex items-center gap-3 mb-3">
                        <ChartLine size={32} weight="duotone" className="text-primary" />
                        <h4 className="text-lg font-bold uppercase tracking-wide text-primary">AGENT 1</h4>
                      </div>
                      <p className="text-sm font-bold uppercase tracking-wide mb-2">Market Analyst</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                        Continuously scans the Solana ecosystem for trading opportunities. Monitors price movements, liquidity changes, new token launches, and market sentiment.
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Scan Rate</span>
                          <span className="text-primary font-bold">{config.marketAnalyst.scanInterval}s</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Min Liquidity</span>
                          <span className="text-primary font-bold">${(config.marketAnalyst.minLiquidity / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Confidence</span>
                          <span className="text-primary font-bold">{config.marketAnalyst.confidenceThreshold}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 jagged-corner bg-secondary/10 border-2 border-secondary">
                      <div className="flex items-center gap-3 mb-3">
                        <Robot size={32} weight="duotone" className="text-secondary" />
                        <h4 className="text-lg font-bold uppercase tracking-wide text-secondary">AGENT 2</h4>
                      </div>
                      <p className="text-sm font-bold uppercase tracking-wide mb-2">Strategy Engine</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                        Executes trading strategies based on market signals. Manages DCA schedules, snipes new tokens, calculates position sizes, and handles risk management.
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">DCA Amount</span>
                          <span className="text-secondary font-bold">${config.strategyEngine.dcaAmount}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Snipe Amount</span>
                          <span className="text-secondary font-bold">${config.strategyEngine.snipeAmount}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Max Slippage</span>
                          <span className="text-secondary font-bold">{config.strategyEngine.maxSlippage}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 jagged-corner bg-accent/10 border-2 border-accent">
                      <div className="flex items-center gap-3 mb-3">
                        <Brain size={32} weight="duotone" className="text-accent" />
                        <h4 className="text-lg font-bold uppercase tracking-wide text-accent">AGENT 3</h4>
                      </div>
                      <p className="text-sm font-bold uppercase tracking-wide mb-2">RL Optimizer</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                        Reinforcement learning model that continuously improves strategies. Learns from outcomes, adjusts parameters, and optimizes portfolio allocation.
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Learning Rate</span>
                          <span className="text-accent font-bold">{config.rlOptimizer.learningRate}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Exploration</span>
                          <span className="text-accent font-bold">{(config.rlOptimizer.explorationRate * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Training Cycles</span>
                          <span className="text-accent font-bold">{config.rlOptimizer.trainingCycles}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-muted/30 border-l-4 border-primary">
                  <h4 className="text-lg font-bold uppercase tracking-wide text-primary mb-3 flex items-center gap-2">
                    <Info size={20} weight="fill" className="text-primary" />
                    Data Flow Pipeline
                  </h4>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary" />
                      <p><span className="text-primary font-bold">Market Data Ingestion</span> → Real-time price feeds, DEX liquidity pools, token launches</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary" />
                      <p><span className="text-secondary font-bold">Signal Processing</span> → Pattern recognition, volatility analysis, sentiment scoring</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary" />
                      <p><span className="text-accent font-bold">Strategy Selection</span> → DCA timing, snipe triggers, position sizing calculations</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary" />
                      <p><span className="text-secondary font-bold">Order Execution</span> → Transaction building, slippage checks, confirmation monitoring</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary" />
                      <p><span className="text-accent font-bold">Performance Tracking</span> → Profit/loss calculation, model retraining, parameter optimization</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="cyber-card">
              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 jagged-corner-small bg-primary/20 border-2 border-primary">
                      <ChartLine size={32} weight="duotone" className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold uppercase tracking-wide text-primary">Market Analyst Agent</h3>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide">A1_MARKET</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleAgent('marketAnalyst')}
                    variant={config.marketAnalyst.enabled ? "default" : "outline"}
                    className="jagged-corner-small border-2 border-primary"
                  >
                    {config.marketAnalyst.enabled ? (
                      <><Pause size={16} weight="fill" className="mr-2" />Pause</>
                    ) : (
                      <><Play size={16} weight="fill" className="mr-2" />Resume</>
                    )}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-3 jagged-corner bg-muted/30 border border-primary/30">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Status</p>
                    <p className="text-lg font-bold text-secondary neon-glow-secondary hud-value">
                      {config.marketAnalyst.enabled ? 'ACTIVE' : 'PAUSED'}
                    </p>
                  </div>
                  <div className="p-3 jagged-corner bg-muted/30 border border-primary/30">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Tokens Scanned</p>
                    <p className="text-lg font-bold text-primary neon-glow-primary hud-value">247</p>
                  </div>
                  <div className="p-3 jagged-corner bg-muted/30 border border-primary/30">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Signals Generated</p>
                    <p className="text-lg font-bold text-primary neon-glow-primary hud-value">34</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wide mb-2 text-foreground">Capabilities</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} weight="fill" className="text-primary mt-0.5 flex-shrink-0" />
                        <span>Real-time monitoring of {config.marketAnalyst.scanInterval} second intervals across Solana DEXs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} weight="fill" className="text-primary mt-0.5 flex-shrink-0" />
                        <span>Liquidity analysis with ${(config.marketAnalyst.minLiquidity / 1000).toFixed(0)}K minimum threshold</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} weight="fill" className="text-primary mt-0.5 flex-shrink-0" />
                        <span>Volatility detection at {config.marketAnalyst.volatilityThreshold}% threshold for opportunity identification</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} weight="fill" className="text-primary mt-0.5 flex-shrink-0" />
                        <span>Pattern recognition using machine learning for trend prediction</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle size={16} weight="fill" className="text-primary mt-0.5 flex-shrink-0" />
                        <span>New token launch detection with instant liquidity pool analysis</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="cyber-card-accent">
              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 jagged-corner-small bg-secondary/20 border-2 border-secondary">
                      <Robot size={32} weight="duotone" className="text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold uppercase tracking-wide text-secondary">Strategy Engine Agent</h3>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide">A2_STRATEGY</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleAgent('strategyEngine')}
                    variant={config.strategyEngine.enabled ? "default" : "outline"}
                    className="jagged-corner-small border-2 border-secondary bg-secondary hover:bg-secondary/90"
                  >
                    {config.strategyEngine.enabled ? (
                      <><Pause size={16} weight="fill" className="mr-2" />Pause</>
                    ) : (
                      <><Play size={16} weight="fill" className="mr-2" />Resume</>
                    )}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-3 jagged-corner bg-muted/30 border border-accent/30">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Status</p>
                    <p className="text-lg font-bold text-secondary neon-glow-secondary hud-value">
                      {config.strategyEngine.enabled ? 'ACTIVE' : 'PAUSED'}
                    </p>
                  </div>
                  <div className="p-3 jagged-corner bg-muted/30 border border-accent/30">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Active Trades</p>
                    <p className="text-lg font-bold text-accent neon-glow-accent hud-value">12</p>
                  </div>
                  <div className="p-3 jagged-corner bg-muted/30 border border-accent/30">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Win Rate</p>
                    <p className="text-lg font-bold text-accent neon-glow-accent hud-value">89.4%</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wide mb-2 text-foreground">Trading Strategies</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/30 border-l-2 border-secondary">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold uppercase tracking-wide text-secondary">DCA (Dollar Cost Averaging)</span>
                          <span className={`text-xs px-2 py-1 jagged-corner-small border ${config.strategyEngine.dcaEnabled ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-muted border-muted-foreground text-muted-foreground'}`}>
                            {config.strategyEngine.dcaEnabled ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Systematic purchases of ${config.strategyEngine.dcaAmount} every {config.strategyEngine.dcaInterval / 3600} hours to accumulate SOL regardless of price
                        </p>
                      </div>
                      <div className="p-3 bg-muted/30 border-l-2 border-accent">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold uppercase tracking-wide text-accent">TOKEN SNIPING</span>
                          <span className={`text-xs px-2 py-1 jagged-corner-small border ${config.strategyEngine.snipeEnabled ? 'bg-accent/20 border-accent text-accent' : 'bg-muted border-muted-foreground text-muted-foreground'}`}>
                            {config.strategyEngine.snipeEnabled ? 'ENABLED' : 'DISABLED'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Automatic detection and purchase of new token launches with ${config.strategyEngine.snipeAmount} positions at {config.strategyEngine.maxSlippage}% max slippage
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="cyber-card">
              <div className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 jagged-corner-small bg-accent/20 border-2 border-accent">
                      <Brain size={32} weight="duotone" className="text-accent" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold uppercase tracking-wide text-accent">RL Optimizer Agent</h3>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide">A3_RL_OPT</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => toggleAgent('rlOptimizer')}
                    variant={config.rlOptimizer.enabled ? "default" : "outline"}
                    className="jagged-corner-small border-2 border-accent bg-accent hover:bg-accent/90"
                  >
                    {config.rlOptimizer.enabled ? (
                      <><Pause size={16} weight="fill" className="mr-2" />Pause</>
                    ) : (
                      <><Play size={16} weight="fill" className="mr-2" />Resume</>
                    )}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-3 jagged-corner bg-muted/30 border border-primary/30">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Status</p>
                    <p className="text-lg font-bold text-secondary neon-glow-secondary hud-value">
                      {config.rlOptimizer.enabled ? 'LEARNING' : 'PAUSED'}
                    </p>
                  </div>
                  <div className="p-3 jagged-corner bg-muted/30 border border-primary/30">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Model Accuracy</p>
                    <p className="text-lg font-bold text-accent neon-glow-accent hud-value">94.2%</p>
                  </div>
                  <div className="p-3 jagged-corner bg-muted/30 border border-primary/30">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide font-semibold">Optimization Cycles</p>
                    <p className="text-lg font-bold text-accent neon-glow-accent hud-value">1,247</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wide mb-2 text-foreground">Learning Parameters</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1 text-xs">
                          <span className="text-muted-foreground">Learning Rate</span>
                          <span className="text-accent font-bold">{config.rlOptimizer.learningRate}</span>
                        </div>
                        <Progress value={config.rlOptimizer.learningRate * 1000} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-xs">
                          <span className="text-muted-foreground">Exploration Rate</span>
                          <span className="text-accent font-bold">{(config.rlOptimizer.explorationRate * 100).toFixed(0)}%</span>
                        </div>
                        <Progress value={config.rlOptimizer.explorationRate * 100} className="h-2" />
                      </div>
                      <div className="p-3 bg-muted/30 border-l-2 border-accent">
                        <p className="text-xs text-muted-foreground">
                          The RL agent uses {config.rlOptimizer.trainingCycles.toLocaleString()} training cycles per optimization run, continuously adapting to market conditions with a {config.rlOptimizer.rebalanceThreshold}% rebalance threshold.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <div className="cyber-card">
            <div className="p-6 relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold uppercase tracking-[0.15em] text-primary hud-text">SYSTEM CONFIGURATION</h3>
                <Button className="jagged-corner-small border-2 border-primary">
                  <ArrowsClockwise size={16} weight="duotone" className="mr-2" />
                  Reset to Defaults
                </Button>
              </div>
              
              <div className="p-4 bg-destructive/10 border-l-4 border-destructive mb-6">
                <div className="flex items-start gap-3">
                  <Warning size={24} weight="fill" className="text-destructive flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-destructive uppercase tracking-wide mb-1">Configuration Notice</p>
                    <p className="text-xs text-muted-foreground">
                      Modifying these parameters will affect all agent behavior. Changes take effect immediately and may impact active trading strategies. Always test configuration changes in demo mode before enabling live trading.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-4 jagged-corner bg-muted/30 border border-primary/30">
                  <h4 className="text-lg font-bold uppercase tracking-wide text-primary mb-4">Market Analyst Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide font-bold block mb-2">
                        Scan Interval (seconds)
                      </label>
                      <p className="text-sm text-foreground">{config.marketAnalyst.scanInterval}s</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide font-bold block mb-2">
                        Minimum Liquidity ($)
                      </label>
                      <p className="text-sm text-foreground">${config.marketAnalyst.minLiquidity.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide font-bold block mb-2">
                        Volatility Threshold (%)
                      </label>
                      <p className="text-sm text-foreground">{config.marketAnalyst.volatilityThreshold}%</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide font-bold block mb-2">
                        Confidence Threshold (%)
                      </label>
                      <p className="text-sm text-foreground">{config.marketAnalyst.confidenceThreshold}%</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 jagged-corner bg-muted/30 border border-secondary/30">
                  <h4 className="text-lg font-bold uppercase tracking-wide text-secondary mb-4">Strategy Engine Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide font-bold block mb-2">
                        DCA Amount ($)
                      </label>
                      <p className="text-sm text-foreground">${config.strategyEngine.dcaAmount}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide font-bold block mb-2">
                        DCA Interval (hours)
                      </label>
                      <p className="text-sm text-foreground">{config.strategyEngine.dcaInterval / 3600}h</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide font-bold block mb-2">
                        Snipe Amount ($)
                      </label>
                      <p className="text-sm text-foreground">${config.strategyEngine.snipeAmount}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide font-bold block mb-2">
                        Maximum Slippage (%)
                      </label>
                      <p className="text-sm text-foreground">{config.strategyEngine.maxSlippage}%</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 jagged-corner bg-muted/30 border border-accent/30">
                  <h4 className="text-lg font-bold uppercase tracking-wide text-accent mb-4">RL Optimizer Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide font-bold block mb-2">
                        Learning Rate
                      </label>
                      <p className="text-sm text-foreground">{config.rlOptimizer.learningRate}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide font-bold block mb-2">
                        Exploration Rate (%)
                      </label>
                      <p className="text-sm text-foreground">{(config.rlOptimizer.explorationRate * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide font-bold block mb-2">
                        Training Cycles
                      </label>
                      <p className="text-sm text-foreground">{config.rlOptimizer.trainingCycles.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide font-bold block mb-2">
                        Rebalance Threshold (%)
                      </label>
                      <p className="text-sm text-foreground">{config.rlOptimizer.rebalanceThreshold}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
