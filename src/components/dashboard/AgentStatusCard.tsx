// ENHANCED: Agent Status section — premium data flow visuals, zero overwhelm
import { motion } from 'framer-motion'
import { Robot, CheckCircle, Pulse } from '@phosphor-icons/react'
import { Progress } from '@/components/ui/progress'

interface Agent {
  name: string
  progress: number
  icon: React.ReactNode
}

export function AgentStatusCard() {
  const agents: Agent[] = [
    { name: 'MARKET ANALYSIS', progress: 92, icon: <Pulse size={14} weight="fill" /> },
    { name: 'STRATEGY EXECUTION', progress: 78, icon: <Pulse size={14} weight="fill" /> },
    { name: 'RL OPTIMIZER', progress: 85, icon: <Pulse size={14} weight="fill" /> }
  ]

  return (
    <motion.div 
      className="cyber-card p-6 angled-corner-tl relative overflow-hidden backdrop-blur-xl"
      style={{
        background: 'linear-gradient(to bottom, rgba(var(--card) / 0.95), rgba(var(--card) / 0.8))',
        borderLeft: '4px solid rgba(0, 255, 255, 0.6)',
        border: '1px solid rgba(0, 255, 255, 0.2)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'4\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' /%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px'
        }}
      />

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <Robot size={24} weight="fill" className="text-cyan-400" style={{ filter: 'drop-shadow(0 0 4px rgba(0, 255, 255, 0.4))' }} />
        <h2 className="text-xl font-bold uppercase tracking-wider text-cyan-400" style={{ textShadow: '0 0 6px rgba(0, 255, 255, 0.3)' }}>
          AI Agent Status
        </h2>
      </div>

      <div className="space-y-4 relative z-10">
        {agents.map((agent, idx) => (
          <motion.div 
            key={idx} 
            className="p-3 bg-background/40 border-l-2 border-cyan-400/60 cut-corner-br relative overflow-hidden group hover:bg-background/60 transition-all"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            whileHover={{ x: 2, boxShadow: '0 0 20px rgba(0, 255, 255, 0.15)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400">{agent.icon}</span>
                <span className="text-sm font-bold uppercase tracking-wide text-cyan-400">{agent.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.div 
                  className="w-1.5 h-1.5 rounded-full bg-green-400"
                  animate={{
                    boxShadow: [
                      '0 0 4px rgba(74, 222, 128, 0.6)',
                      '0 0 8px rgba(74, 222, 128, 0.8)',
                      '0 0 4px rgba(74, 222, 128, 0.6)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs text-green-400 font-bold uppercase">ACTIVE</span>
              </div>
            </div>
            
            {/* Clean progress bar with solid fill and subtle glow */}
            <div className="relative">
              <div className="h-2 bg-background/60 rounded-full overflow-hidden border border-cyan-400/20">
                <motion.div
                  className="h-full rounded-full relative"
                  style={{
                    width: `${agent.progress}%`,
                    background: '#00ffff',
                    outline: '1px solid rgba(0, 255, 255, 0.4)'
                  }}
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${agent.progress}%`,
                    filter: [
                      'brightness(100%)',
                      'brightness(110%)',
                      'brightness(100%)'
                    ]
                  }}
                  transition={{ 
                    width: { duration: 0.8, delay: idx * 0.1 },
                    filter: { duration: 4, repeat: Infinity }
                  }}
                />
              </div>
              <span className="absolute -top-5 right-0 text-xs font-mono text-cyan-400 opacity-70">
                {agent.progress}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Subtle data flow line connector (points right toward Recent Activity) */}
      <motion.div
        className="absolute top-1/2 -right-px w-8 h-px"
        style={{
          background: 'linear-gradient(90deg, rgba(0, 255, 255, 0.4), transparent)',
          borderTop: '1px dashed rgba(0, 255, 255, 0.3)'
        }}
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </motion.div>
  )
}
