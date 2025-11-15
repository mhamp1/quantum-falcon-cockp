import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Shield, Lightning, Target } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface AggressionLevel {
  value: number
  label: string
  color: string
  description: string
}

const aggressionLevels: AggressionLevel[] = [
  { value: 0, label: 'CAUTIOUS', color: 'oklch(0.72 0.20 195)', description: 'Conservative strategy, minimal risk, focus on preservation' },
  { value: 50, label: 'MODERATE', color: 'oklch(0.68 0.18 330)', description: 'Balanced approach, moderate risk for steady growth' },
  { value: 100, label: 'AGGRESSIVE', color: 'oklch(0.65 0.25 25)', description: 'High-risk strategy, maximum profit potential' }
]

export default function BotAggressionControl() {
  const [aggression, setAggression] = useKV<number>('bot-aggression', 50)
  const [isAnimating, setIsAnimating] = useState(false)

  const aggressionValue = aggression ?? 50

  const getCurrentLevel = () => {
    if (aggressionValue < 33) return aggressionLevels[0]
    if (aggressionValue < 67) return aggressionLevels[1]
    return aggressionLevels[2]
  }

  const currentLevel = getCurrentLevel()

  const handleAggressionChange = (value: number[]) => {
    setAggression(value[0])
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 500)
  }

  const getParticleCount = () => Math.floor(aggressionValue / 5) + 8

  return (
    <div className="glass-morph-card p-6 md:p-8 relative overflow-hidden group hover:shadow-[0_0_60px_oklch(0.72_0.20_195_/_0.4)] transition-all duration-500">
      <div className="absolute inset-0 technical-grid opacity-10 pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 pointer-events-none" />
      
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" style={{ zIndex: 1 }}>
        <defs>
          <linearGradient id="holo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="var(--accent)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#holo-gradient)" opacity="0.05" />
        <line x1="0" y1="20%" x2="100%" y2="20%" stroke="var(--primary)" strokeWidth="1" strokeDasharray="10,10" className="circuit-line" />
        <line x1="0" y1="80%" x2="100%" y2="80%" stroke="var(--accent)" strokeWidth="1" strokeDasharray="10,10" className="circuit-line" />
        <circle cx="10%" cy="20%" r="3" fill="var(--primary)" className="animate-pulse" />
        <circle cx="90%" cy="80%" r="3" fill="var(--accent)" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
      </svg>
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-4 jagged-corner-small bg-gradient-to-br from-primary/30 to-accent/30 border-3 border-primary/60 shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.5)] relative overflow-hidden group/icon">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 opacity-0 group-hover/icon:opacity-100 transition-opacity" />
            <Target size={32} weight="duotone" className="text-primary neon-glow-primary relative z-10" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl md:text-2xl font-bold uppercase tracking-[0.2em] hud-text text-primary neon-glow-primary mb-1">
              BOT AGGRESSION LEVEL
            </h3>
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
              HOLOGRAPHIC RISK MANAGEMENT INTERFACE
            </p>
          </div>
        </div>
        
        <div className="relative">
          <motion.div
            className="p-6 jagged-corner bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl border-3 relative overflow-hidden"
            animate={{
              borderColor: currentLevel.color,
              boxShadow: isAnimating 
                ? `0 0 40px ${currentLevel.color}, 0 0 80px ${currentLevel.color}50, inset 0 0 30px ${currentLevel.color}30`
                : `0 0 25px ${currentLevel.color}, 0 0 50px ${currentLevel.color}30, inset 0 0 20px ${currentLevel.color}20`
            }}
            transition={{ duration: 0.4 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-current/10 to-transparent opacity-30" style={{ color: currentLevel.color }} />
            
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-px bg-current opacity-20"
                  style={{ 
                    color: currentLevel.color,
                    top: `${20 + i * 20}%`,
                    left: 0,
                    right: 0
                  }}
                  animate={{
                    opacity: [0.1, 0.3, 0.1],
                    scaleX: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity
                  }}
                />
              ))}
            </div>
            
            <div className="text-center relative z-10">
              <motion.div 
                className="text-6xl font-black hud-value mb-2 relative"
                style={{ 
                  color: currentLevel.color,
                  textShadow: `0 0 15px ${currentLevel.color}, 0 0 30px ${currentLevel.color}, 0 0 45px ${currentLevel.color}`,
                  filter: 'drop-shadow(0 0 10px currentColor)'
                }}
                animate={isAnimating ? { scale: [1, 1.1, 1], rotate: [0, 2, -2, 0] } : {}}
                transition={{ duration: 0.5 }}
              >
                {aggression}
                <div className="absolute inset-0 blur-lg opacity-50" style={{ color: currentLevel.color }}>
                  {aggression}
                </div>
              </motion.div>
              <div 
                className="text-sm font-bold uppercase tracking-[0.25em] hud-readout"
                style={{ 
                  color: currentLevel.color,
                  textShadow: `0 0 10px ${currentLevel.color}`
                }}
              >
                {currentLevel.label}
              </div>
            </div>
          </motion.div>
          
          <AnimatePresence>
            {isAnimating && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(getParticleCount())].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: currentLevel.color,
                      boxShadow: `0 0 10px ${currentLevel.color}`,
                      left: '50%',
                      top: '50%'
                    }}
                    initial={{ opacity: 1, scale: 0 }}
                    animate={{
                      opacity: 0,
                      scale: [0, 1.5, 0],
                      x: Math.cos((i / getParticleCount()) * Math.PI * 2) * (80 + Math.random() * 40),
                      y: Math.sin((i / getParticleCount()) * Math.PI * 2) * (80 + Math.random() * 40)
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-8 relative z-10">
        <div className="relative p-6 bg-gradient-to-r from-background/60 via-background/40 to-background/60 backdrop-blur-sm border border-primary/30 rounded-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-50" />
          
          <div className="relative">
            <Slider
              value={[aggressionValue]}
              onValueChange={handleAggressionChange}
              max={100}
              step={1}
              className="relative z-10"
            />
            
            <motion.div 
              className="absolute top-1/2 left-0 h-2 pointer-events-none transition-all duration-300 rounded-full"
              style={{
                width: `${aggressionValue}%`,
                background: `linear-gradient(90deg, ${aggressionLevels[0].color}, ${aggressionLevels[1].color}, ${aggressionLevels[2].color})`,
                boxShadow: `0 0 20px ${currentLevel.color}, 0 0 40px ${currentLevel.color}50`,
                transform: 'translateY(-50%)',
                filter: 'blur(1px)'
              }}
              animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
            />
            
            <motion.div 
              className="absolute top-1/2 h-6 w-1 pointer-events-none"
              style={{
                left: `${aggressionValue}%`,
                background: currentLevel.color,
                boxShadow: `0 0 15px ${currentLevel.color}, 0 0 30px ${currentLevel.color}`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={isAnimating ? { scaleY: [1, 1.5, 1] } : {}}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aggressionLevels.map((level) => {
            const isActive = level.label === currentLevel.label
            return (
              <motion.button
                key={level.label}
                onClick={() => setAggression(level.value)}
                className={`p-5 jagged-corner border-3 transition-all relative overflow-hidden group/btn ${
                  isActive ? 'bg-gradient-to-br from-card/90 to-card/70' : 'bg-gradient-to-br from-muted/30 to-muted/20 hover:from-muted/40 hover:to-muted/30'
                }`}
                style={{
                  borderColor: isActive ? level.color : 'oklch(0.35 0.12 195 / 0.3)',
                  boxShadow: isActive ? `0 0 30px ${level.color}50, inset 0 0 20px ${level.color}20` : 'none'
                }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="absolute inset-0 technical-grid opacity-10" />
                
                {isActive && (
                  <>
                    <motion.div 
                      className="absolute inset-0 opacity-20"
                      style={{ 
                        background: `radial-gradient(circle at center, ${level.color}, transparent 70%)`
                      }}
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.3, 0.2]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    {[...Array(3)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute h-px bg-current"
                        style={{ 
                          color: level.color,
                          top: `${30 + i * 20}%`,
                          left: 0,
                          right: 0,
                          opacity: 0.3
                        }}
                        animate={{
                          opacity: [0.1, 0.4, 0.1]
                        }}
                        transition={{
                          duration: 1.5,
                          delay: i * 0.3,
                          repeat: Infinity
                        }}
                      />
                    ))}
                  </>
                )}
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 rounded-sm border-2 relative" style={{ borderColor: level.color, boxShadow: isActive ? `0 0 15px ${level.color}` : 'none' }}>
                      {level.value === 0 && <Shield size={24} weight="duotone" style={{ color: level.color }} />}
                      {level.value === 50 && <Target size={24} weight="duotone" style={{ color: level.color }} />}
                      {level.value === 100 && <Lightning size={24} weight="duotone" style={{ color: level.color }} />}
                      {isActive && <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: level.color }} />}
                    </div>
                  </div>
                  <div 
                    className="text-sm font-bold uppercase tracking-[0.15em] text-center mb-2"
                    style={{ 
                      color: isActive ? level.color : 'oklch(0.70 0.10 195)',
                      textShadow: isActive ? `0 0 10px ${level.color}` : 'none'
                    }}
                  >
                    {level.label}
                  </div>
                  <p className="text-xs text-muted-foreground text-center leading-relaxed">
                    {level.description}
                  </p>
                </div>
                
                {isActive && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent"
                    style={{ color: level.color }}
                    animate={{
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        <motion.div 
          className="p-5 jagged-corner-small bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 border-2 border-primary/40 relative overflow-hidden"
          animate={isAnimating ? { borderColor: [currentLevel.color, 'oklch(0.72 0.20 195 / 0.4)', currentLevel.color] } : {}}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 diagonal-stripes opacity-5" />
          <div className="flex items-start gap-3 relative z-10">
            <div className="mt-1">
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: currentLevel.color, boxShadow: `0 0 10px ${currentLevel.color}` }} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground font-semibold mb-2" style={{ color: currentLevel.color }}>
                {currentLevel.description}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wide leading-relaxed">
                Bot will dynamically adapt strategies based on real-time market conditions and selected aggression level. Position sizing, stop-losses, and trade frequency will be automatically adjusted.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
        <motion.div 
          className="diagonal-stripes w-full h-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  )
}
