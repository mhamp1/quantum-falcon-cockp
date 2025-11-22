// Agent Wrapper — Integrates Learning System into All Agents
// November 21, 2025 — Quantum Falcon Cockpit
// Makes all agents learn and optimize decisions

import type { EliteAgentInstance, AgentDecision, AgentAnalysisInput } from './index'
import { getDecisionEngine } from '../learning/IntelligentDecisionEngine'

/**
 * Wraps an agent to integrate learning system
 */
export function wrapAgentWithLearning(agent: EliteAgentInstance): EliteAgentInstance {
  return {
    ...agent,
    analyze: async (data: AgentAnalysisInput): Promise<AgentDecision> => {
      // Get raw decision from agent
      const rawDecision = await agent.analyze(data)
      
      // Optimize using intelligent decision engine
      const decisionEngine = getDecisionEngine()
      
      const confidenceValue = rawDecision.confidence === 'very-high' ? 0.9 :
                             rawDecision.confidence === 'high' ? 0.75 :
                             rawDecision.confidence === 'medium' ? 0.6 : 0.4
      
      const optimizedDecision = decisionEngine.optimizeDecision(rawDecision, {
        agentId: agent.name.toLowerCase().replace(/\s+/g, '-'),
        strategy: agent.personality,
        marketConditions: {
          volatility: data.volatility?.volatility1h || 0.03,
          volume: data.price.mid * 1000, // Approximate
          sentiment: data.sentiment.score,
          mevRisk: data.mev.riskScore,
        },
        confidence: confidenceValue,
        signal: rawDecision.signal,
        expectedProfit: rawDecision.metadata?.expectedProfitBps as number | undefined,
        riskLevel: rawDecision.metadata?.riskLevel as 'low' | 'medium' | 'high' | undefined,
      })
      
      // Return optimized decision
      return {
        ...optimizedDecision,
        metadata: {
          ...rawDecision.metadata,
          ...optimizedDecision.metadata,
          learningOptimized: true,
        },
      }
    },
  }
}

/**
 * Wrap all agents with learning system
 */
export function wrapAllAgentsWithLearning(agents: EliteAgentInstance[]): EliteAgentInstance[] {
  return agents.map(agent => wrapAgentWithLearning(agent))
}

