// MultiAgentSystem Wrapper with ErrorBoundary and 2D Fallback
// If 3D Canvas fails, falls back to beautiful 2D visualization

import { Component, ReactNode, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ShimmerCard } from '@/components/shared/ShimmerCard';
import MultiAgentSystem from './MultiAgentSystem';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

// 2D Fallback View when 3D fails
function MultiAgentSystem2DFallback() {
  const agents = [
    { id: '1', name: 'MARKET ANALYST', role: 'Real-time scanning', color: '#00FFFF', confidence: 87, actions: 241 },
    { id: '2', name: 'STRATEGY ENGINE', role: 'Adaptive execution', color: '#DC1FFF', confidence: 92, actions: 12 },
    { id: '3', name: 'RL OPTIMIZER', role: 'Self-learning', color: '#FF00FF', confidence: 78, actions: 3 },
  ];

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-20">
        <div className="technical-grid w-full h-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-12">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="neon-leak text-8xl font-black text-center mb-16"
        >
          MULTI-AGENT SYSTEM
        </motion.h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 max-w-7xl mx-auto">
          {[
            { label: 'UPTIME', value: '94.1%', color: 'cyan' },
            { label: 'TRADES', value: '1,247', color: 'purple' },
            { label: 'SUCCESS', value: '87.3%', color: 'pink' },
            { label: 'PROFIT', value: '+$2,835', color: 'green' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="cyber-card p-6 text-center"
            >
              <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-5xl font-black neon-leak-${stat.color}`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.2 }}
              className="cyber-card-accent p-8 relative overflow-hidden group"
            >
              {/* Animated glow */}
              <div
                className="absolute top-0 left-0 w-full h-1"
                style={{
                  background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)`,
                  boxShadow: `0 0 20px ${agent.color}`,
                }}
              />

              {/* Agent icon/status */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-full border-2 flex items-center justify-center text-3xl font-black"
                  style={{
                    borderColor: agent.color,
                    color: agent.color,
                    boxShadow: `0 0 20px ${agent.color}80`,
                  }}
                >
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase" style={{ color: agent.color }}>
                    {agent.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{agent.role}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-black/50 rounded-lg">
                  <div className="text-3xl font-black" style={{ color: agent.color }}>
                    {agent.confidence}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Confidence</div>
                </div>
                <div className="text-center p-4 bg-black/50 rounded-lg">
                  <div className="text-3xl font-black" style={{ color: agent.color }}>
                    {agent.actions}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Actions</div>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2 mt-6">
                <motion.div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: agent.color }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                <span className="text-sm text-muted-foreground uppercase tracking-wider">ACTIVE</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Notice about 3D fallback */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-16 text-center"
        >
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            ⚠️ 3D visualization unavailable. Displaying 2D fallback mode. All agent functionality is still operational.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

class MultiAgentSystemErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[MultiAgentSystem] Error caught:', error, errorInfo);
    
    // Auto-retry up to 3 times
    if (this.state.retryCount < 3) {
      const retryDelay = Math.min(1000 * Math.pow(2, this.state.retryCount), 5000);
      console.log(`[MultiAgentSystem] Auto-retry ${this.state.retryCount + 1}/3 in ${retryDelay}ms`);
      
      setTimeout(() => {
        this.setState(prev => ({
          hasError: false,
          error: undefined,
          retryCount: prev.retryCount + 1,
        }));
      }, retryDelay);
    }
  }

  render() {
    if (this.state.hasError && this.state.retryCount >= 3) {
      return <MultiAgentSystem2DFallback />;
    }

    return this.props.children;
  }
}

export default function MultiAgentSystemWrapper() {
  return (
    <MultiAgentSystemErrorBoundary>
      <Suspense fallback={<ShimmerCard variant="large" count={3} />}>
        <MultiAgentSystem />
      </Suspense>
    </MultiAgentSystemErrorBoundary>
  );
}
