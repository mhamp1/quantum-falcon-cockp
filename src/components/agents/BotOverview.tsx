import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Robot, Lightning, TrendUp, Brain } from '@phosphor-icons/react';
import { useLiveAgentData } from '@/hooks/useLiveAgentData';
import { motion } from 'framer-motion';

export default function BotOverview() {
  const agents = useLiveAgentData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b-2 border-primary/30">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-wider text-primary">
            AI Agents
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
            ◆ Autonomous Trading Intelligence
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {(agents || []).map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Card
              className="p-6 bg-card/50 border-2 border-primary/30 relative overflow-hidden holographic-breathe"
              style={{
                boxShadow: '0 0 30px rgba(0,255,255,0.2), 0 0 60px rgba(0,255,255,0.1)'
              }}
            >
              {/* Electric Arc Effect on Hover */}
              <motion.div
                className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    className={`w-3 h-3 rounded-full ${
                      agent.status === 'active'
                        ? 'bg-accent'
                        : 'bg-muted'
                    }`}
                    style={{
                      boxShadow: agent.status === 'active' ? '0 0 10px rgba(255,200,0,0.8), 0 0 20px rgba(255,200,0,0.5)' : 'none'
                    }}
                    animate={agent.status === 'active' ? {
                      scale: [1, 1.3, 1],
                      opacity: [1, 0.7, 1]
                    } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <Robot size={24} weight="duotone" className="text-primary" style={{ filter: 'drop-shadow(0 0 5px rgba(20, 241, 149, 0.5))' }} />
                </div>
                <Switch checked={agent.status === 'active'} />
              </div>

              <motion.h3 
                className="text-xl font-bold uppercase tracking-wider mb-2 neon-glow-primary"
                animate={{
                  textShadow: [
                    '0 0 5px var(--primary)',
                    '0 0 10px var(--primary), 0 0 20px var(--primary)',
                    '0 0 5px var(--primary)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {agent.name}
              </motion.h3>

              <div className="space-y-3 mt-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs uppercase text-muted-foreground">Confidence</span>
                    <motion.span 
                      className="text-sm font-bold text-accent count-up-animation"
                      key={agent.confidence}
                    >
                      {agent.confidence}%
                    </motion.span>
                  </div>
                  <div className="relative">
                    <Progress value={agent.confidence} className="h-2" />
                    <motion.div
                      className="absolute top-0 left-0 h-2 liquid-fill"
                      style={{ width: `${agent.confidence}%` }}
                      animate={{
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Trades</p>
                    <motion.p 
                      className="text-lg font-bold glitch-update"
                      key={agent.trades}
                    >
                      {agent.trades}
                    </motion.p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Profit</p>
                    <motion.p 
                      className="text-lg font-bold text-accent stat-number-godtier"
                      key={agent.profit}
                    >
                      +${agent.profit}
                    </motion.p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-primary/20">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{
                        rotate: [0, 360]
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Lightning size={16} weight="duotone" className="text-accent" style={{ filter: 'drop-shadow(0 0 5px rgba(153, 69, 255, 0.5))' }} />
                    </motion.div>
                    <span className="text-sm font-bold">Level {agent.level}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{agent.xp} XP</span>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button className="w-full mt-4 bg-primary/20 border-2 border-primary text-primary hover:bg-primary/30 holographic-breathe">
                  Configure
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="p-6 bg-card/50 border-2 border-accent/30">
        <div className="flex items-center gap-3 mb-4">
          <Brain size={24} weight="duotone" className="text-accent" />
          <h2 className="text-xl font-bold uppercase tracking-wider text-accent">
            Agent Performance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/20 border border-primary/20">
            <p className="text-xs uppercase text-muted-foreground mb-2">Total Trades</p>
            <p className="text-2xl font-bold text-primary">
              {(agents || []).reduce((sum, a) => sum + a.trades, 0)}
            </p>
          </div>
          <div className="p-4 bg-muted/20 border border-primary/20">
            <p className="text-xs uppercase text-muted-foreground mb-2">Total Profit</p>
            <p className="text-2xl font-bold text-accent">
              +${(agents || []).reduce((sum, a) => sum + a.profit, 0).toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-muted/20 border border-primary/20">
            <p className="text-xs uppercase text-muted-foreground mb-2">Avg Confidence</p>
            <p className="text-2xl font-bold text-primary">
              {Math.round((agents || []).reduce((sum, a) => sum + a.confidence, 0) / (agents?.length || 1))}%
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
