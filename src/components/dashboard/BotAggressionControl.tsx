import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { Shield, Lightning, Target } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

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
    setTimeout(() => setIsAnimating(false), 300)
  }

  const getParticleCount = () => Math.floor(aggressionValue / 10) + 3

  return (
    <div className="cyber-card p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 grid-background pointer-events-none" />
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 jagged-corner-small bg-primary/20 border-2 border-primary/50">
            <Target size={24} weight="duotone" className="text-primary neon-glow-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold uppercase tracking-[0.15em] hud-text text-primary neon-glow-primary">
              Bot Aggression
            </h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Risk Management Protocol
            </p>
          </div>
        </div>
        
        <div className="relative">
          <motion.div
            className="p-4 jagged-corner bg-card border-2 border-primary/50"
            animate={{
              boxShadow: isAnimating 
                ? `0 0 30px ${currentLevel.color}, inset 0 0 20px ${currentLevel.color}20`
                : `0 0 15px ${currentLevel.color}, inset 0 0 10px ${currentLevel.color}20`
            }}
            transition={{ duration: 0.3 }}
            style={{ borderColor: currentLevel.color }}
          >
            <div className="text-center">
              <div 
                className="text-4xl font-bold hud-value mb-1"
                style={{ 
                  color: currentLevel.color,
                  textShadow: `0 0 10px ${currentLevel.color}, 0 0 20px ${currentLevel.color}`
                }}
              >
                {aggression}
              </div>
              <div 
                className="text-xs font-bold uppercase tracking-[0.2em] hud-readout"
                style={{ color: currentLevel.color }}
              >
                {currentLevel.label}
              </div>
            </div>
          </motion.div>
          
          {isAnimating && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(getParticleCount())].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{ 
                    backgroundColor: currentLevel.color,
                    left: '50%',
                    top: '50%'
                  }}
                  initial={{ opacity: 1, scale: 0 }}
                  animate={{
                    opacity: 0,
                    scale: 2,
                    x: Math.cos((i / getParticleCount()) * Math.PI * 2) * 50,
                    y: Math.sin((i / getParticleCount()) * Math.PI * 2) * 50
                  }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="relative">
          <Slider
            value={[aggressionValue]}
            onValueChange={handleAggressionChange}
            max={100}
            step={1}
            className="relative"
          />
          
          <div 
            className="absolute top-1/2 left-0 h-1 pointer-events-none transition-all duration-300"
            style={{
              width: `${aggressionValue}%`,
              background: `linear-gradient(90deg, ${aggressionLevels[0].color}, ${aggressionLevels[1].color}, ${aggressionLevels[2].color})`,
              boxShadow: `0 0 15px ${currentLevel.color}`,
              transform: 'translateY(-50%)'
            }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {aggressionLevels.map((level) => {
            const isActive = level.label === currentLevel.label
            return (
              <motion.button
                key={level.label}
                onClick={() => setAggression(level.value)}
                className={`p-4 jagged-corner-small border-2 transition-all relative overflow-hidden group ${
                  isActive ? 'bg-primary/10' : 'bg-muted/20 hover:bg-muted/30'
                }`}
                style={{
                  borderColor: isActive ? level.color : 'oklch(0.35 0.12 195 / 0.3)',
                  boxShadow: isActive ? `0 0 20px ${level.color}30` : 'none'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isActive && (
                  <div 
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundColor: level.color }}
                  />
                )}
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-2">
                    {level.value === 0 && <Shield size={20} weight="duotone" style={{ color: level.color }} />}
                    {level.value === 50 && <Target size={20} weight="duotone" style={{ color: level.color }} />}
                    {level.value === 100 && <Lightning size={20} weight="duotone" style={{ color: level.color }} />}
                  </div>
                  <div 
                    className="text-xs font-bold uppercase tracking-[0.1em] text-center"
                    style={{ color: isActive ? level.color : 'oklch(0.70 0.10 195)' }}
                  >
                    {level.label}
                  </div>
                  <p className="text-[9px] text-muted-foreground text-center mt-1 uppercase tracking-wide">
                    {level.description}
                  </p>
                </div>
                
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-current to-transparent"
                    style={{ color: level.color }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        <div className="p-4 jagged-corner-small bg-muted/20 border border-primary/30">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            </div>
            <div>
              <p className="text-xs text-foreground font-medium mb-1">
                {currentLevel.description}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Bot will adapt strategies based on market conditions and selected aggression level
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
        <div className="diagonal-stripes w-full h-full" />
      </div>
    </div>
  )
}
