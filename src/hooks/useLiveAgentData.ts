import { useEffect } from 'react';
import { useKV } from '@/hooks/useKVFallback';

export interface Agent {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'processing';
  confidence: number;
  trades: number;
  profit: number;
  xp: number;
  level: number;
}

const INITIAL_AGENTS: Agent[] = [
  {
    id: 'market-analyzer',
    name: 'Market Analyzer',
    status: 'active',
    confidence: 85,
    trades: 147,
    profit: 1234.56,
    xp: 4500,
    level: 12,
  },
  {
    id: 'strategy-executor',
    name: 'Strategy Execution',
    status: 'active',
    confidence: 92,
    trades: 203,
    profit: 2341.78,
    xp: 6200,
    level: 15,
  },
  {
    id: 'rl-optimizer',
    name: 'RL Optimizer',
    status: 'active',
    confidence: 78,
    trades: 89,
    profit: 987.45,
    xp: 3100,
    level: 9,
  },
];

export function useLiveAgentData() {
  const [agents, setAgents] = useKV<Agent[]>('agents', INITIAL_AGENTS);

  useEffect(() => {
    const updateAgents = () => {
      setAgents((currentAgents) => {
        const updated = (currentAgents || INITIAL_AGENTS).map((agent) => {
          const confidenceChange = Math.floor(Math.random() * 10 - 5);
          const newConfidence = Math.max(60, Math.min(99, agent.confidence + confidenceChange));
          
          const shouldTrade = Math.random() > 0.7;
          const profitChange = shouldTrade ? parseFloat((Math.random() * 50 - 10).toFixed(2)) : 0;
          const newProfit = agent.profit + profitChange;
          const newTrades = shouldTrade ? agent.trades + 1 : agent.trades;
          
          const xpGain = shouldTrade ? Math.floor(Math.random() * 50 + 10) : 0;
          const newXp = agent.xp + xpGain;
          const newLevel = Math.floor(newXp / 500) + 1;

          return {
            ...agent,
            confidence: newConfidence,
            trades: newTrades,
            profit: parseFloat(newProfit.toFixed(2)),
            xp: newXp,
            level: newLevel,
          };
        });
        
        return updated;
      });
    };

    const interval = setInterval(updateAgents, 10000);

    return () => clearInterval(interval);
  }, [setAgents]);

  return agents;
}
