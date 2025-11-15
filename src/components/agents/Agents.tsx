import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
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
      case 'active': return 'bg-accent'
      case 'error': return 'bg-destructive'
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
        <h2 className="text-3xl font-bold tracking-wider uppercase mb-2">
          AI Agents
        </h2>
        <p className="text-muted-foreground">
          Autonomous trading intelligence with multi-agent coordination
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {agents.map((agent) => {
          const Icon = getIcon(agent.id)
          return (
            <Card
              key={agent.id}
              className={`backdrop-blur-md bg-card/50 border-primary/30 relative overflow-hidden transition-all ${
                agent.enabled ? 'border-accent/50' : 'opacity-60'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent transition-opacity ${
                agent.enabled ? 'opacity-100' : 'opacity-0'
              }`} />
              
              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full border transition-all ${
                      agent.enabled 
                        ? 'bg-accent/20 border-accent/30' 
                        : 'bg-muted/20 border-muted-foreground/30'
                    }`}>
                      <Icon size={24} weight="duotone" className={agent.enabled ? 'text-accent' : 'text-muted-foreground'} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <CardTitle className="text-xl">{agent.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)} ${
                            agent.enabled ? 'animate-pulse-glow' : ''
                          }`} />
                          <Badge variant="outline" className="text-xs">
                            {agent.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription>{agent.description}</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={agent.enabled}
                    onCheckedChange={() => toggleAgent(agent.id)}
                  />
                </div>
              </CardHeader>

              <CardContent className="relative">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Confidence</p>
                    <p className="text-2xl font-bold text-primary">{agent.metrics.confidence}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Actions</p>
                    <p className="text-2xl font-bold text-secondary">{agent.metrics.actionsToday}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Profit</p>
                    <p className="text-2xl font-bold text-accent">+${agent.metrics.profitContribution.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="backdrop-blur-md bg-card/50 border-primary/30">
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
          <CardDescription>Combined metrics from all active agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-sm text-muted-foreground mb-2">Total Trades Today</p>
              <p className="text-3xl font-bold text-primary">
                {agents.reduce((sum, agent) => sum + agent.metrics.actionsToday, 0)}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-sm text-muted-foreground mb-2">Combined Profit</p>
              <p className="text-3xl font-bold text-accent">
                +${agents.reduce((sum, agent) => sum + agent.metrics.profitContribution, 0).toFixed(2)}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30 border border-border/50">
              <p className="text-sm text-muted-foreground mb-2">Avg Confidence</p>
              <p className="text-3xl font-bold text-secondary">
                {Math.round(agents.reduce((sum, agent) => sum + agent.metrics.confidence, 0) / agents.length)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}