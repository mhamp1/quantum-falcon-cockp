import { Component, ReactNode, Suspense } from 'react';
import { motion } from 'framer-motion';
import { ShimmerCard } from '@/components/shared/ShimmerCard';
import { Robot } from '@phosphor-icons/react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

function MultiAgentSystem2DFallback() {
  const agents = [
    { id: '1', name: 'MARKET ANALYST', role: 'Real-time scanning', color: '#00FFFF', confidence: 87, actions: 241 },
    { id: '2', name: 'STRATEGY ENGINE', role: 'Adaptive execution', color: '#DC1FFF', confidence: 92, actions: 12 },
    { id: '3', name: 'RL OPTIMIZER', role: 'Self-learning', color: '#FF00FF', confidence: 78, actions: 3 },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden relative p-6">
      <div className="absolute inset-0 opacity-10">
        <div className="technical-grid w-full h-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Robot size={64} weight="duotone" className="text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-primary neon-glow-primary mb-4">
            MULTI-AGENT SYSTEM
          </h1>
          <p className="text-lg text-muted-foreground uppercase tracking-wider">
            Live Coordination • Real-Time Intelligence
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'UPTIME', value: '94.1%', color: 'text-primary' },
            { label: 'TRADES', value: '1,247', color: 'text-secondary' },
            { label: 'SUCCESS', value: '87.3%', color: 'text-accent' },
            { label: 'PROFIT', value: '+$2,835', color: 'text-primary' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="cyber-card p-6 text-center"
            >
              <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-4xl md:text-5xl font-black ${stat.color} neon-glow`}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.2 }}
              className="cyber-card-accent p-8 relative overflow-hidden group"
            >
              <div
                className="absolute top-0 left-0 w-full h-1"
                style={{
                  background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)`,
                  boxShadow: `0 0 20px ${agent.color}`,
                }}
              />

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

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <div className="text-3xl font-black" style={{ color: agent.color }}>
                    {agent.confidence}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Confidence</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg">
                  <div className="text-3xl font-black" style={{ color: agent.color }}>
                    {agent.actions}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Actions</div>
                </div>
              </div>

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
      </div>
    </div>
  );
}

class MultiAgentSystemErrorBoundary extends Component<Props, State> {
  private retryTimeoutId?: ReturnType<typeof setTimeout>;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('[MultiAgentSystem] Error caught:', error);
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[MultiAgentSystem] Component stack:', errorInfo.componentStack);
    
    if (this.state.retryCount < 2) {
      const retryDelay = 1000;
      console.log(`[MultiAgentSystem] Auto-retry ${this.state.retryCount + 1}/2 in ${retryDelay}ms`);
      
      this.retryTimeoutId = setTimeout(() => {
        this.setState(prev => ({
          hasError: false,
          error: undefined,
          retryCount: prev.retryCount + 1,
        }));
      }, retryDelay);
    } else {
      console.log('[MultiAgentSystem] Falling back to 2D view');
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError && this.state.retryCount >= 2) {
      return <MultiAgentSystem2DFallback />;
    }

    return this.props.children;
  }
}

export default function MultiAgentSystemWrapper() {
  let MultiAgentSystem3D: React.ComponentType | null = null;
  
  try {
    MultiAgentSystem3D = require('./MultiAgentSystem').default;
  } catch (err) {
    console.warn('[MultiAgentSystemWrapper] Failed to load 3D view, using 2D fallback:', err);
    return <MultiAgentSystem2DFallback />;
  }

  return (
    <MultiAgentSystemErrorBoundary>
      <Suspense fallback={<ShimmerCard variant="large" count={3} />}>
        {MultiAgentSystem3D ? <MultiAgentSystem3D /> : <MultiAgentSystem2DFallback />}
      </Suspense>
    </MultiAgentSystemErrorBoundary>
  );
}
