// ENHANCED: Recent Activity feed — premium visual hierarchy with icons and hover states
import { motion } from 'framer-motion'
import { ChartLine, CheckCircle, Circle, ArrowRight } from '@phosphor-icons/react'

interface Activity {
  type: 'profit' | 'analysis' | 'dca' | 'rebalance'
  message: string
  value?: string
  time: string
}

export function ActivityFeed() {
  const activities: Activity[] = [
    { type: 'profit', message: 'Trade executed:', value: '+$45.20', time: '2m ago' },
    { type: 'analysis', message: 'Market analysis completed', time: '5m ago' },
    { type: 'dca', message: 'DCA order filled successfully', time: '12m ago' },
    { type: 'rebalance', message: 'Portfolio rebalanced', time: '23m ago' }
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'profit':
        return <CheckCircle size={16} weight="fill" className="text-cyan-400 flex-shrink-0" />
      case 'analysis':
        return <Circle size={16} weight="fill" className="text-purple-400 flex-shrink-0" />
      case 'dca':
        return <ArrowRight size={16} weight="bold" className="text-cyan-400 flex-shrink-0" />
      case 'rebalance':
        return <Circle size={16} weight="fill" className="text-purple-400 flex-shrink-0" />
      default:
        return <Circle size={16} weight="fill" className="text-cyan-400 flex-shrink-0" />
    }
  }

  return (
    <motion.div 
      className="cyber-card p-6 angled-corner-tr relative overflow-hidden backdrop-blur-xl"
      style={{
        background: 'linear-gradient(to bottom, rgba(var(--card) / 0.95), rgba(var(--card) / 0.8))',
        borderLeft: '4px solid rgba(0, 255, 255, 0.6)',
        border: '1px solid rgba(0, 255, 255, 0.2)',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
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

      {/* Data flow line connector from left (Agent Status) */}
      <motion.div
        className="absolute top-1/2 -left-px w-8 h-px"
        style={{
          background: 'linear-gradient(270deg, rgba(0, 255, 255, 0.4), transparent)',
          borderTop: '1px dashed rgba(0, 255, 255, 0.3)'
        }}
        initial={{ scaleX: 0, originX: 1 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
      />

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <ChartLine size={24} weight="fill" className="text-purple-400" style={{ filter: 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.4))' }} />
        <h2 className="text-xl font-bold uppercase tracking-wider text-purple-400" style={{ textShadow: '0 0 6px rgba(168, 85, 247, 0.3)' }}>
          Recent Activity
        </h2>
      </div>

      <div className="space-y-2 relative z-10">
        {activities.map((activity, idx) => (
          <motion.div 
            key={idx} 
            className="flex items-start gap-3 text-xs p-3 hover:bg-background/40 transition-all angled-corner-br cursor-pointer group border border-transparent hover:border-cyan-400/20 relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            whileHover={{ 
              x: 2, 
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.1)',
              filter: 'brightness(1.1)'
            }}
          >
            <div className="mt-0.5">
              {getIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-foreground font-medium flex items-center gap-2 flex-wrap">
                <span>{activity.message}</span>
                {activity.value && (
                  <span 
                    className="font-bold" 
                    style={{ 
                      color: activity.value.startsWith('+') ? '#00ffff' : '#ef4444',
                      textShadow: activity.value.startsWith('+') ? '0 0 4px rgba(0, 255, 255, 0.3)' : '0 0 4px rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    {activity.value}
                  </span>
                )}
              </div>
              <div className="text-muted-foreground text-[10px] mt-0.5 opacity-60">{activity.time}</div>
            </div>
            <div className="text-[10px] text-cyan-400/60 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
              {activity.time}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Data flow line connector pointing down to Logic Stream */}
      <motion.div
        className="absolute -bottom-px left-1/2 -translate-x-1/2 w-px h-8"
        style={{
          background: 'linear-gradient(180deg, rgba(0, 255, 255, 0.4), transparent)',
          borderLeft: '1px dashed rgba(0, 255, 255, 0.3)'
        }}
        initial={{ scaleY: 0, originY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      />
    </motion.div>
  )
}
