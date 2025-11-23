import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendUp, TrendDown, Brain, Lightning } from '@phosphor-icons/react'

interface TradeActivity {
  id: string
  type: 'buy' | 'sell'
  token: string
  amount: number
  price: number
  timestamp: number
  confidence: number
}

export default function LiveActivityPanel() {
  const [activities, setActivities] = useState<TradeActivity[]>([])
  const [thinking, setThinking] = useState(false)
  const [lastDecision, setLastDecision] = useState({
    action: 'Entered long on BONK',
    confidence: 92,
    timestamp: Date.now()
  })

  useEffect(() => {
    // Simulate live trade feed
    const interval = setInterval(() => {
      const tokens = ['SOL', 'BONK', 'WIF', 'JUP', 'PYTH', 'JTO', 'ORCA']
      const types: ('buy' | 'sell')[] = ['buy', 'sell']
      
      const newActivity: TradeActivity = {
        id: Date.now().toString(),
        type: types[Math.floor(Math.random() * types.length)],
        token: tokens[Math.floor(Math.random() * tokens.length)],
        amount: parseFloat((Math.random() * 50 + 5).toFixed(1)),
        price: parseFloat((Math.random() * 200 + 10).toFixed(2)),
        timestamp: Date.now(),
        confidence: Math.floor(Math.random() * 30 + 70)
      }

      setActivities(prev => [newActivity, ...prev].slice(0, 15))
      
      // Randomly show thinking state
      if (Math.random() > 0.7) {
        setThinking(true)
        setTimeout(() => setThinking(false), 3000)
      }

      // Update last decision occasionally
      if (Math.random() > 0.8) {
        const actions = [
          'Entered long on BONK',
          'Exited SOL position',
          'Rebalancing portfolio',
          'Analyzing JUP pump',
          'DCA into WIF'
        ]
        setLastDecision({
          action: actions[Math.floor(Math.random() * actions.length)],
          confidence: Math.floor(Math.random() * 20 + 80),
          timestamp: Date.now()
        })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
      {/* BEFORE: "BOT IS THINKING..." banner with massive 60px glow causing unreadable text
          AFTER: Thin border + subtle gradient bg, icon with small drop-shadow, text with 6px glow max */}
      <AnimatePresence>
        {thinking && (
          <motion.div
            className="p-6 cyber-card relative overflow-hidden"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            style={{
              background: 'linear-gradient(to right, rgba(0, 255, 255, 0.15), transparent)',
              border: '1px solid rgba(0, 255, 255, 0.4)',
              boxShadow: 'none'
            }}
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                  scale: { duration: 1, repeat: Infinity }
                }}
              >
                <Brain size={32} weight="duotone" className="text-primary" style={{ filter: 'drop-shadow(0 0 6px rgba(20, 241, 149, 0.5))' }} />
              </motion.div>
              <div className="flex-1">
                <motion.h3 
                  className="text-xl font-bold mb-1"
                  style={{
                    color: '#e0e0ff',
                    textShadow: '0 0 6px rgba(0, 255, 255, 0.3)'
                  }}
                  animate={{
                    opacity: [1, 0.8, 1]
                  }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  BOT IS THINKING...
                </motion.h3>
                <p className="text-sm text-muted-foreground">Analyzing market conditions and agent strategies</p>
              </div>
              <motion.div
                className="flex gap-1"
                animate={{
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary"
                    style={{ boxShadow: '0 0 6px var(--primary)' }}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BEFORE: "Analyzing JUP pump" + confidence bar with massive pink/cyan bleed
          AFTER: Sharp text with NO glow, clean progress bar with solid fill + thin border */}
      <motion.div
        className="p-4 cyber-card-accent relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">LAST DECISION</p>
            <p className="text-base font-bold mb-1" style={{ color: '#e0e0ff' }}>{lastDecision.action}</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Confidence:</span>
                <motion.span 
                  className="text-sm font-bold text-secondary"
                  key={lastDecision.confidence}
                  animate={{
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {lastDecision.confidence}%
                </motion.span>
              </div>
              <div className="flex-1">
                {/* Clean progress bar: solid gradient fill with 1px glowing border only */}
                <motion.div 
                  className="h-2 bg-muted/30 rounded-full overflow-hidden border border-secondary/30"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="h-full"
                    style={{
                      width: `${lastDecision.confidence}%`,
                      background: 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
                      boxShadow: 'none'
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                </motion.div>
              </div>
            </div>
          </div>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 360]
            }}
            transition={{
              scale: { duration: 2, repeat: Infinity },
              rotate: { duration: 3, repeat: Infinity, ease: 'linear' }
            }}
          >
            <Lightning size={24} weight="fill" className="text-accent" style={{ filter: 'drop-shadow(0 0 6px rgba(153, 69, 255, 0.5))' }} />
          </motion.div>
        </div>
      </motion.div>

      {/* Live Trade Feed */}
      <div className="cyber-card relative overflow-hidden">
        <div className="p-4 border-b border-primary/30">
          <h3 className="text-lg font-bold uppercase tracking-wide neon-glow-primary">LIVE TRADE FEED</h3>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Real-time execution monitoring</p>
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-muted/20">
          <AnimatePresence initial={false}>
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                className="p-4 border-b border-primary/10 hover:bg-muted/20 transition-colors relative"
                initial={{ opacity: 0, x: -50, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 50, height: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ x: 5 }}
              >
                {/* Glow Effect */}
                <motion.div
                  className="absolute inset-y-0 left-0 w-1"
                  style={{
                    background: activity.type === 'buy' ? 'var(--secondary)' : 'var(--destructive)',
                    boxShadow: `0 0 10px ${activity.type === 'buy' ? 'var(--secondary)' : 'var(--destructive)'}`
                  }}
                  animate={{
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                <div className="flex items-center justify-between gap-4 ml-3">
                  <div className="flex items-center gap-3 flex-1">
                    <motion.div
                      className={`p-2 rounded-lg ${activity.type === 'buy' ? 'bg-secondary/20' : 'bg-destructive/20'}`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      {activity.type === 'buy' ? (
                        <TrendUp size={16} weight="bold" className="text-secondary" style={{ filter: 'drop-shadow(0 0 5px rgba(153, 69, 255, 0.5))' }} />
                      ) : (
                        <TrendDown size={16} weight="bold" className="text-destructive" style={{ filter: 'drop-shadow(0 0 5px rgba(239, 68, 68, 0.5))' }} />
                      )}
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">
                        <span className={activity.type === 'buy' ? 'text-secondary' : 'text-destructive'}>
                          {activity.type === 'buy' ? 'Bought' : 'Sold'}
                        </span>
                        {' '}
                        <span className="text-foreground">{activity.amount} {activity.token}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @ ${activity.price.toFixed(2)} • {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <motion.div 
                    className="text-right"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                    <motion.p 
                      className="text-sm font-bold text-primary neon-glow-primary"
                      animate={{
                        textShadow: [
                          '0 0 5px var(--primary)',
                          '0 0 15px var(--primary)',
                          '0 0 5px var(--primary)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {activity.confidence}%
                    </motion.p>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
