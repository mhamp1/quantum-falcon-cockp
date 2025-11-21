// Elite AI Agents Page — 15 Elite Agents with Tier Gating
// November 21, 2025 — Quantum Falcon Cockpit

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useKV } from '@github/spark/hooks'
import { Robot, Play, Info, Crown } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import AgentCard from '@/components/ai/AgentCard'
import { ELITE_AGENTS, type AgentTier, type AgentDecision } from '@/lib/ai/agents'
import { useMarketFeed } from '@/hooks/useMarketFeed'
import { toAgentInput } from '@/lib/ai/agentInputAdapter'

interface UserAuth {
  isAuthenticated: boolean
  userId: string | null
  license?: {
    userId: string
    tier: string
  }
}

export default function EliteAgentsPage() {
  const [auth] = useKV<UserAuth>('user-auth', { 
    isAuthenticated: false, 
    userId: null,
    license: { userId: '', tier: 'free' }
  })
  
  const userTier = (auth?.license?.tier || 'free') as AgentTier
  
  const [activeAgentName, setActiveAgentName] = useState<string | null>(null)
  const [agentDecisions, setAgentDecisions] = useState<Record<string, AgentDecision>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [tierFilter, setTierFilter] = useState<'all' | AgentTier>('all')
  
  // Get live market feed (will use mock data in development)
  const { snapshot, isConnected } = useMarketFeed()

  // Filter agents by tier
  const filteredAgents = tierFilter === 'all' 
    ? ELITE_AGENTS 
    : ELITE_AGENTS.filter(agent => agent.tier === tierFilter)

  // Run analysis for selected agent
  const runAgentAnalysis = async (agentName: string) => {
    if (!snapshot) {
      toast.error('No market data available', {
        description: 'Waiting for market feed connection...',
      })
      return
    }

    const agent = ELITE_AGENTS.find(a => a.name === agentName)
    if (!agent) return

    setIsAnalyzing(true)
    
    try {
      // Convert market snapshot to agent input
      const agentInput = toAgentInput(snapshot)
      
      // Run agent analysis
      const decision = await agent.analyze(agentInput)
      
      // Store decision
      setAgentDecisions(prev => ({
        ...prev,
        [agentName]: decision,
      }))
      
      // Show toast with decision
      const signalColors = {
        BUY: '✅',
        SELL: '❌',
        HOLD: '⏸️',
      }
      
      toast.success(`${signalColors[decision.signal]} ${agentName}: ${decision.signal}`, {
        description: decision.reason,
        duration: 5000,
      })
    } catch (error: any) {
      console.error('Agent analysis failed:', error)
      toast.error('Analysis failed', {
        description: error.message || 'Could not complete agent analysis',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Auto-analyze when agent is selected
  useEffect(() => {
    if (activeAgentName && snapshot) {
      runAgentAnalysis(activeAgentName)
    }
  }, [activeAgentName])

  // Stats
  const totalAgents = ELITE_AGENTS.length
  const accessibleAgents = ELITE_AGENTS.filter(agent => {
    const tierHierarchy: AgentTier[] = ['free', 'pro', 'elite', 'lifetime']
    const agentLevel = tierHierarchy.indexOf(agent.tier)
    const userLevel = tierHierarchy.indexOf(userTier)
    return userTier === 'lifetime' || userLevel >= agentLevel
  }).length
  
  const activeAgents = Object.keys(agentDecisions).length
  const buySignals = Object.values(agentDecisions).filter(d => d.signal === 'BUY').length

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          <Robot size={64} weight="duotone" className="text-primary" />
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-primary neon-glow-primary mb-4">
          ELITE AI AGENTS
        </h1>
        <p className="text-lg text-muted-foreground uppercase tracking-wider mb-2">
          15 Specialized Trading Intelligence Systems
        </p>
        
        {/* Connection Status */}
        <div className="flex items-center justify-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-accent' : 'bg-muted-foreground'} animate-pulse`} />
          <span className="text-muted-foreground">
            {isConnected ? 'Live Market Feed Connected' : 'Using Mock Data'}
          </span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Agents', value: totalAgents, color: 'text-primary' },
          { label: 'Accessible', value: `${accessibleAgents}/${totalAgents}`, color: 'text-accent' },
          { label: 'Active Now', value: activeAgents, color: 'text-secondary' },
          { label: 'Buy Signals', value: buySignals, color: 'text-accent' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="cyber-card p-6 text-center"
          >
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">
              {stat.label}
            </p>
            <p className={`text-3xl md:text-4xl font-black ${stat.color} neon-glow`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Tier Info Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="cyber-card-accent p-6"
      >
        <div className="flex items-start gap-4">
          <Info size={32} weight="duotone" className="text-accent flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-bold uppercase tracking-wide text-accent mb-2">
              Your Tier: {userTier.toUpperCase()}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              You have access to <span className="text-accent font-bold">{accessibleAgents}</span> out of <span className="text-primary font-bold">{totalAgents}</span> elite agents.
              {userTier !== 'elite' && userTier !== 'lifetime' && (
                <span className="ml-1">Upgrade to unlock more powerful trading intelligence.</span>
              )}
            </p>
            {userTier !== 'elite' && userTier !== 'lifetime' && (
              <Button
                size="sm"
                className="bg-gradient-to-r from-primary to-accent"
                onClick={() => window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'settings' }))}
              >
                <Crown size={16} className="mr-2" />
                Upgrade to Elite
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tier Filter Tabs */}
      <Tabs value={tierFilter} onValueChange={(v) => setTierFilter(v as typeof tierFilter)}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="free">Free</TabsTrigger>
          <TabsTrigger value="pro">Pro</TabsTrigger>
          <TabsTrigger value="elite">Elite</TabsTrigger>
          <TabsTrigger value="lifetime">Lifetime</TabsTrigger>
        </TabsList>

        <TabsContent value={tierFilter} className="mt-8">
          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent, i) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <AgentCard
                  agent={agent}
                  userTier={userTier}
                  isActive={activeAgentName === agent.name}
                  lastSignal={agentDecisions[agent.name]?.signal}
                  confidencePct={
                    agentDecisions[agent.name]
                      ? getConfidencePct(agentDecisions[agent.name].confidence)
                      : undefined
                  }
                  onSelect={() => setActiveAgentName(agent.name)}
                />
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredAgents.length === 0 && (
            <div className="text-center py-16">
              <Robot size={64} weight="duotone" className="text-muted-foreground mx-auto mb-4" />
              <p className="text-xl text-muted-foreground">
                No agents in this tier
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      {activeAgentName && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Button
            size="lg"
            onClick={() => activeAgentName && runAgentAnalysis(activeAgentName)}
            disabled={isAnalyzing}
            className="bg-gradient-to-r from-primary to-accent shadow-2xl hover:scale-105 transition-transform"
          >
            <Play size={20} weight="fill" className="mr-2" />
            {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
          </Button>
        </motion.div>
      )}
    </div>
  )
}

/**
 * Convert confidence level to percentage
 */
function getConfidencePct(confidence: string): number {
  const map: Record<string, number> = {
    'low': 25,
    'medium': 50,
    'high': 75,
    'very-high': 95,
  }
  return map[confidence] || 50
}
