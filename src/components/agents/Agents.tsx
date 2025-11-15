import { useKV } from '@github/spark/hooks'
import { Switch } from '@/components/ui/switch'
import { Robot, Brain, ChartLine } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Agent {
  id: string
  name: string
  description: string
  enabled: boolean
  status: 'active' | 'idle' | 'error'
  metrics: {
    confidence: number
    actionsToday: number
    profitContribution: number
  }
}

const initialAgents: Agent[] = [
  {
    id: 'market-analyst',
    name: 'Market Analyst',
    description: 'Scans Solana ecosystem for trading opportunities and market trends',
    enabled: true,
    status: 'active',
    metrics: { confidence: 87, actionsToday: 247, profitContribution: 234.56 }
  },
  {
    id: 'strategy-engine',
    name: 'Strategy Engine',
    description: 'Executes DCA schedules and sniping strategies based on market signals',
    enabled: true,
    status: 'active',
    metrics: { confidence: 92, actionsToday: 12, profitContribution: 512.33 }
  },
  {
    id: 'rl-optimizer',
    name: 'RL Optimizer',
    description: 'Reinforcement learning model that adapts strategies based on outcomes',
    enabled: true,
    status: 'active',
    metrics: { confidence: 78, actionsToday: 3, profitContribution: 89.12 }
  }
]

export default function Agents() {
  const [agents, setAgents] = useKV<Agent[]>('trading-agents', initialAgents)

  const toggleAgent = (agentId: string) => {
    setAgents((current) => {
      if (!current) return initialAgents
      return current.map(agent =>
        agent.id === agentId
          ? { ...agent, enabled: !agent.enabled, status: !agent.enabled ? 'active' : 'idle' }
          : agent
      )
    })
    
    const agent = agents?.find(a => a.id === agentId)
    if (agent) {
      toast.success(
        `${agent.name} ${agent.enabled ? 'deactivated' : 'activated'}`,
        { description: agent.enabled ? 'Agent stopped' : 'Agent started successfully' }
      )
    }
  }

  if (!agents) return null

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active': return 'bg-secondary neon-glow-secondary'
      case 'error': return 'bg-destructive neon-glow-destructive'
      default: return 'bg-muted-foreground'
    }
  }

  const getIcon = (agentId: string) => {
    switch (agentId) {
      case 'market-analyst': return ChartLine
      case 'strategy-engine': return Robot
      case 'rl-optimizer': return Brain
      default: return Robot
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-[0.2em] uppercase hud-text">
          <span className="text-primary neon-glow">AI AGENTS</span>
        </h2>
        <p className="text-muted-foreground uppercase tracking-wide text-sm mt-2">
          AUTONOMOUS TRADING INTELLIGENCE WITH MULTI-AGENT COORDINATION
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {agents.map((agent) => {
          const Icon = getIcon(agent.id)
          return (
            <div
              key={agent.id}
              className={`holographic-card transition-all ${
                agent.enabled ? 'scale-100' : 'opacity-50 scale-95'
              }`}
            >
              <div className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 jagged-corner-small border-2 transition-all ${
                      agent.enabled 
                        ? 'bg-secondary/20 border-secondary neon-glow-secondary' 
                        : 'bg-muted/20 border-muted-foreground'
                    }`}>
                      <Icon size={28} weight="duotone" className={agent.enabled ? 'text-secondary' : 'text-muted-foreground'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold uppercase tracking-wide text-foreground">{agent.name}</h3>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)} ${
                            agent.enabled ? 'animate-pulse-glow' : ''
                          }`} />
                          <div className="px-2 py-0.5 jagged-corner-small bg-primary/20 border border-primary">
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">
                              {agent.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground uppercase tracking-wide">{agent.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={agent.enabled}
                    onCheckedChange={() => toggleAgent(agent.id)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 jagged-corner bg-muted/30 border-2 border-primary/50">
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-[0.15em] hud-text">Confidence</p>
                    <p className="text-3xl font-bold text-primary neon-glow hud-value">{agent.metrics.confidence}%</p>
                  </div>
                  <div className="p-4 jagged-corner bg-muted/30 border-2 border-primary/50">
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-[0.15em] hud-text">Actions</p>
                    <p className="text-3xl font-bold text-secondary neon-glow-secondary hud-value">{agent.metrics.actionsToday}</p>
                  </div>
                  <div className="p-4 jagged-corner bg-muted/30 border-2 border-primary/50">
                    <p className="text-xs text-muted-foreground mb-2 uppercase tracking-[0.15em] hud-text">Profit</p>
                    <p className="text-3xl font-bold text-secondary neon-glow-secondary hud-value">+${agent.metrics.profitContribution.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="holographic-card scan-line-effect">
        <div className="p-6 relative z-10">
          <h3 className="text-xl font-bold uppercase tracking-[0.15em] text-primary hud-text mb-2">AGENT PERFORMANCE</h3>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mb-6">COMBINED METRICS FROM ALL ACTIVE AGENTS</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-6 jagged-corner bg-muted/30 border-2 border-primary/50">
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-[0.15em] hud-text">Total Trades Today</p>
              <p className="text-4xl font-bold text-primary neon-glow hud-value">
                {agents.reduce((sum, agent) => sum + agent.metrics.actionsToday, 0)}
              </p>
            </div>
            <div className="text-center p-6 jagged-corner bg-muted/30 border-2 border-secondary/50">
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-[0.15em] hud-text">Combined Profit</p>
              <p className="text-4xl font-bold text-secondary neon-glow-secondary hud-value">
                +${agents.reduce((sum, agent) => sum + agent.metrics.profitContribution, 0).toFixed(2)}
              </p>
            </div>
            <div className="text-center p-6 jagged-corner bg-muted/30 border-2 border-primary/50">
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-[0.15em] hud-text">Avg Confidence</p>
              <p className="text-4xl font-bold text-primary neon-glow hud-value">
                {Math.round(agents.reduce((sum, agent) => sum + agent.metrics.confidence, 0) / agents.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}