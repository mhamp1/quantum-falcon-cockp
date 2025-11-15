import { useKV } from '@github/spark/hooks'
import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Shield, Lightning, Target, Atom, Cube } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface AggressionLevel {
  value: number
  label: string
  color: string
  glowColor: string
  description: string
}

const aggressionLevels: AggressionLevel[] = [
  { 
    value: 0, 
    label: 'CAUTIOUS', 
    color: 'oklch(0.72 0.20 195)',
    glowColor: '115, 205, 230',
    description: 'Conservative strategy, minimal risk, focus on preservation' 
  },
  { 
    value: 50, 
    label: 'MODERATE', 
    color: 'oklch(0.68 0.18 330)',
    glowColor: '200, 100, 200', 
    description: 'Balanced approach, moderate risk for steady growth' 
  },
  { 
    value: 100, 
    label: 'AGGRESSIVE', 
    color: 'oklch(0.65 0.25 25)',
    glowColor: '255, 60, 90',
    description: 'High-risk strategy, maximum profit potential' 
  }
]

export default function BotAggressionControl() {
  const [aggression, setAggression] = useKV<number>('bot-aggression', 50)
  const [isAnimating, setIsAnimating] = useState(false)
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number}>>([])

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
    
    const newParticles: Array<{id: number, x: number, y: number}> = []
    const count = Math.floor(value[0] / 5) + 10
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: (Math.random() - 0.5) * 150,
        y: (Math.random() - 0.5) * 150
      })
    }
    setParticles(newParticles)
    
    setTimeout(() => {
      setIsAnimating(false)
      setParticles([])
    }, 1000)
  }

  return (
    <div className="relative overflow-hidden p-8 rounded-lg" style={{
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)',
      border: '2px solid rgba(0, 200, 255, 0.2)',
      boxShadow: `0 0 40px rgba(${currentLevel.glowColor}, 0.3), 0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 80px rgba(${currentLevel.glowColor}, 0.05)`
    }}>
      
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 200, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 200, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            transform: 'perspective(500px) rotateX(60deg)'
          }}
        />
      </div>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, rgba(${currentLevel.glowColor}, 0.15) 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-60" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60" />
      <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-pink-500 to-transparent opacity-40" />
      <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-cyan-500 to-transparent opacity-40" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-10 relative z-10">
        <div className="flex items-center gap-5">
          <motion.div 
            className="relative p-6 rounded-lg overflow-hidden"
            style={{
              background: `linear-gradient(135deg, rgba(${currentLevel.glowColor}, 0.15), rgba(${currentLevel.glowColor}, 0.05))`,
              border: `2px solid rgba(${currentLevel.glowColor}, 0.5)`,
              boxShadow: `0 0 30px rgba(${currentLevel.glowColor}, 0.4), inset 0 0 30px rgba(${currentLevel.glowColor}, 0.1)`
            }}
            animate={{
              boxShadow: isAnimating 
                ? `0 0 50px rgba(${currentLevel.glowColor}, 0.7), inset 0 0 50px rgba(${currentLevel.glowColor}, 0.2)`
                : `0 0 30px rgba(${currentLevel.glowColor}, 0.4), inset 0 0 30px rgba(${currentLevel.glowColor}, 0.1)`
            }}
          >
            <motion.div
              className="absolute inset-0 opacity-20"
              style={{
                background: `conic-gradient(from 0deg, rgba(${currentLevel.glowColor}, 0), rgba(${currentLevel.glowColor}, 0.5), rgba(${currentLevel.glowColor}, 0))`
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
            <Target size={36} weight="duotone" style={{ color: currentLevel.color, filter: `drop-shadow(0 0 10px ${currentLevel.color})`, position: 'relative', zIndex: 10 }} />
            <motion.div 
              className="absolute top-0 right-0 w-3 h-3 rounded-full"
              style={{ backgroundColor: currentLevel.color, boxShadow: `0 0 10px ${currentLevel.color}` }}
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
          <div>
            <motion.h3 
              className="text-3xl md:text-4xl font-black uppercase tracking-[0.25em] mb-2"
              style={{
                color: currentLevel.color,
                textShadow: `0 0 20px ${currentLevel.color}, 0 0 40px ${currentLevel.color}, 0 0 60px ${currentLevel.color}`,
                fontFamily: "'Orbitron', monospace"
              }}
              animate={isAnimating ? { 
                textShadow: [
                  `0 0 20px ${currentLevel.color}, 0 0 40px ${currentLevel.color}`,
                  `0 0 40px ${currentLevel.color}, 0 0 80px ${currentLevel.color}`,
                  `0 0 20px ${currentLevel.color}, 0 0 40px ${currentLevel.color}`
                ]
              } : {}}
            >
              BOT AGGRESSION
            </motion.h3>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-400/70 font-semibold" style={{
              textShadow: '0 0 10px rgba(0, 200, 255, 0.5)'
            }}>
              HOLOGRAPHIC RISK CONTROL
            </p>
          </div>
        </div>
        
        <motion.div
          className="relative p-8 rounded-lg overflow-hidden"
          style={{
            background: `linear-gradient(135deg, rgba(10, 10, 26, 0.9), rgba(26, 26, 46, 0.8))`,
            border: `3px solid rgba(${currentLevel.glowColor}, 0.6)`,
            boxShadow: `0 0 40px rgba(${currentLevel.glowColor}, 0.5), 0 0 80px rgba(${currentLevel.glowColor}, 0.3), inset 0 0 40px rgba(${currentLevel.glowColor}, 0.1)`,
            backdropFilter: 'blur(10px)'
          }}
          animate={{
            borderColor: isAnimating 
              ? `rgba(${currentLevel.glowColor}, 1)`
              : `rgba(${currentLevel.glowColor}, 0.6)`,
            boxShadow: isAnimating 
              ? `0 0 60px rgba(${currentLevel.glowColor}, 0.8), 0 0 120px rgba(${currentLevel.glowColor}, 0.5), inset 0 0 60px rgba(${currentLevel.glowColor}, 0.2)`
              : `0 0 40px rgba(${currentLevel.glowColor}, 0.5), 0 0 80px rgba(${currentLevel.glowColor}, 0.3), inset 0 0 40px rgba(${currentLevel.glowColor}, 0.1)`
          }}
          transition={{ duration: 0.4 }}
        >
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(rgba(0, 200, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 200, 255, 0.3) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
          
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px left-0 right-0"
              style={{ 
                top: `${20 + i * 15}%`,
                background: `linear-gradient(90deg, transparent, rgba(${currentLevel.glowColor}, 0.4), transparent)`
              }}
              animate={{
                opacity: [0.1, 0.5, 0.1],
                scaleX: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2.5,
                delay: i * 0.2,
                repeat: Infinity
              }}
            />
          ))}
          
          <div className="text-center relative z-10">
            <motion.div 
              className="text-8xl font-black relative mb-3"
              style={{ 
                color: currentLevel.color,
                textShadow: `0 0 20px ${currentLevel.color}, 0 0 40px ${currentLevel.color}, 0 0 60px ${currentLevel.color}, 0 0 80px ${currentLevel.color}`,
                fontFamily: "'Orbitron', monospace",
                letterSpacing: '0.05em'
              }}
              animate={isAnimating ? { 
                scale: [1, 1.15, 1], 
                rotate: [0, 3, -3, 0],
                textShadow: [
                  `0 0 20px ${currentLevel.color}, 0 0 40px ${currentLevel.color}`,
                  `0 0 40px ${currentLevel.color}, 0 0 80px ${currentLevel.color}, 0 0 120px ${currentLevel.color}`,
                  `0 0 20px ${currentLevel.color}, 0 0 40px ${currentLevel.color}`
                ]
              } : {}}
              transition={{ duration: 0.6 }}
            >
              {aggression}
              <motion.div 
                className="absolute inset-0 blur-2xl opacity-60"
                style={{ color: currentLevel.color }}
              >
                {aggression}
              </motion.div>
            </motion.div>
            <motion.div 
              className="text-lg font-black uppercase tracking-[0.3em]"
              style={{ 
                color: currentLevel.color,
                textShadow: `0 0 15px ${currentLevel.color}`,
                fontFamily: "'Orbitron', monospace"
              }}
              animate={isAnimating ? { scale: [1, 1.1, 1] } : {}}
            >
              {currentLevel.label}
            </motion.div>
          </div>
          
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-2 h-2 rounded-full"
                style={{ 
                  backgroundColor: currentLevel.color,
                  boxShadow: `0 0 15px ${currentLevel.color}`,
                  left: '50%',
                  top: '50%'
                }}
                initial={{ opacity: 1, scale: 0 }}
                animate={{
                  opacity: 0,
                  scale: [0, 2, 0],
                  x: particle.x,
                  y: particle.y
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="space-y-10 relative z-10">
        <div className="relative p-8 rounded-lg overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(10, 10, 26, 0.6), rgba(26, 26, 46, 0.4))',
          border: '2px solid rgba(0, 200, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)'
        }}>
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(${currentLevel.glowColor}, 0.3), transparent 70%)`
            }}
          />
          
          <div className="relative mb-6">
            <Slider
              value={[aggressionValue]}
              onValueChange={handleAggressionChange}
              max={100}
              step={1}
              className="relative z-10"
            />
            
            <motion.div 
              className="absolute top-1/2 left-0 h-3 pointer-events-none rounded-full"
              style={{
                width: `${aggressionValue}%`,
                background: `linear-gradient(90deg, rgba(115, 205, 230, 0.8), rgba(200, 100, 200, 0.8), rgba(255, 60, 90, 0.8))`,
                boxShadow: `0 0 20px rgba(${currentLevel.glowColor}, 0.8), 0 0 40px rgba(${currentLevel.glowColor}, 0.5)`,
                transform: 'translateY(-50%)',
                filter: 'blur(2px)'
              }}
              animate={isAnimating ? { boxShadow: `0 0 40px rgba(${currentLevel.glowColor}, 1), 0 0 80px rgba(${currentLevel.glowColor}, 0.8)` } : {}}
            />
            
            <motion.div 
              className="absolute top-1/2 h-8 w-2 pointer-events-none rounded-full"
              style={{
                left: `${aggressionValue}%`,
                background: `linear-gradient(180deg, ${currentLevel.color}, rgba(${currentLevel.glowColor}, 0.5))`,
                boxShadow: `0 0 20px ${currentLevel.color}, 0 0 40px ${currentLevel.color}`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={isAnimating ? { 
                scaleY: [1, 1.8, 1],
                boxShadow: [
                  `0 0 20px ${currentLevel.color}`,
                  `0 0 60px ${currentLevel.color}, 0 0 120px ${currentLevel.color}`,
                  `0 0 20px ${currentLevel.color}`
                ]
              } : {}}
            />
          </div>

          {[0, 50, 100].map((mark) => (
            <div
              key={mark}
              className="absolute bottom-2 text-xs font-bold uppercase tracking-wider"
              style={{
                left: `${mark}%`,
                transform: 'translateX(-50%)',
                color: aggressionValue >= mark - 5 && aggressionValue <= mark + 5 ? currentLevel.color : 'rgba(150, 150, 150, 0.5)',
                textShadow: aggressionValue >= mark - 5 && aggressionValue <= mark + 5 ? `0 0 10px ${currentLevel.color}` : 'none'
              }}
            >
              {mark}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {aggressionLevels.map((level) => {
            const isActive = level.label === currentLevel.label
            return (
              <motion.button
                key={level.label}
                onClick={() => setAggression(level.value)}
                className="relative p-6 rounded-lg overflow-hidden transition-all"
                style={{
                  background: isActive 
                    ? `linear-gradient(135deg, rgba(${level.glowColor}, 0.15), rgba(${level.glowColor}, 0.05))`
                    : 'linear-gradient(135deg, rgba(40, 40, 60, 0.3), rgba(30, 30, 50, 0.2))',
                  border: `2px solid ${isActive ? `rgba(${level.glowColor}, 0.7)` : 'rgba(100, 100, 120, 0.3)'}`,
                  boxShadow: isActive 
                    ? `0 0 30px rgba(${level.glowColor}, 0.5), inset 0 0 30px rgba(${level.glowColor}, 0.1)`
                    : '0 4px 16px rgba(0, 0, 0, 0.4)'
                }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(0, 200, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 200, 255, 0.3) 1px, transparent 1px)',
                    backgroundSize: '15px 15px'
                  }}
                />
                
                {isActive && (
                  <>
                    <motion.div 
                      className="absolute inset-0 opacity-30"
                      style={{ 
                        background: `radial-gradient(circle at center, rgba(${level.glowColor}, 0.4), transparent 70%)`
                      }}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2]
                      }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    />
                    
                    {[...Array(4)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute h-px left-0 right-0"
                        style={{ 
                          top: `${25 + i * 20}%`,
                          background: `linear-gradient(90deg, transparent, rgba(${level.glowColor}, 0.5), transparent)`
                        }}
                        animate={{
                          opacity: [0.1, 0.6, 0.1]
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.4,
                          repeat: Infinity
                        }}
                      />
                    ))}
                  </>
                )}
                
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-4">
                    <div 
                      className="p-4 rounded-lg relative overflow-hidden"
                      style={{ 
                        border: `2px solid ${level.color}`, 
                        boxShadow: isActive ? `0 0 20px ${level.color}, inset 0 0 20px rgba(${level.glowColor}, 0.2)` : 'none',
                        background: `rgba(${level.glowColor}, 0.1)`
                      }}
                    >
                      {level.value === 0 && <Shield size={28} weight="duotone" style={{ color: level.color, filter: `drop-shadow(0 0 8px ${level.color})` }} />}
                      {level.value === 50 && <Target size={28} weight="duotone" style={{ color: level.color, filter: `drop-shadow(0 0 8px ${level.color})` }} />}
                      {level.value === 100 && <Lightning size={28} weight="duotone" style={{ color: level.color, filter: `drop-shadow(0 0 8px ${level.color})` }} />}
                      {isActive && (
                        <motion.div 
                          className="absolute top-1 right-1 w-2 h-2 rounded-full"
                          style={{ backgroundColor: level.color, boxShadow: `0 0 8px ${level.color}` }}
                          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                        />
                      )}
                    </div>
                  </div>
                  <div 
                    className="text-base font-black uppercase tracking-[0.2em] text-center mb-3"
                    style={{ 
                      color: isActive ? level.color : 'rgba(180, 180, 200, 0.7)',
                      textShadow: isActive ? `0 0 15px ${level.color}` : 'none'
                    }}
                  >
                    {level.label}
                  </div>
                  <p className="text-xs text-center leading-relaxed" style={{
                    color: isActive ? 'rgba(230, 230, 250, 0.9)' : 'rgba(150, 150, 170, 0.7)'
                  }}>
                    {level.description}
                  </p>
                </div>
                
                {isActive && (
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 h-1 rounded-b-lg"
                    style={{ 
                      background: `linear-gradient(90deg, transparent, ${level.color}, transparent)`
                    }}
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
          className="p-6 rounded-lg relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(40, 40, 60, 0.4), rgba(30, 30, 50, 0.3))',
            border: `2px solid rgba(${currentLevel.glowColor}, 0.4)`,
            boxShadow: `0 4px 24px rgba(0, 0, 0, 0.4)`,
            backdropFilter: 'blur(8px)'
          }}
          animate={isAnimating ? { borderColor: `rgba(${currentLevel.glowColor}, 0.8)` } : {}}
          transition={{ duration: 1 }}
        >
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0, 200, 255, 0.3) 10px, rgba(0, 200, 255, 0.3) 11px)'
            }}
          />
          <div className="flex items-start gap-4 relative z-10">
            <div className="mt-1">
              <motion.div 
                className="w-4 h-4 rounded-full"
                style={{ 
                  backgroundColor: currentLevel.color, 
                  boxShadow: `0 0 15px ${currentLevel.color}`
                }}
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold mb-3" style={{ 
                color: currentLevel.color,
                textShadow: `0 0 10px ${currentLevel.color}`
              }}>
                {currentLevel.description}
              </p>
              <p className="text-sm uppercase tracking-wide leading-relaxed" style={{
                color: 'rgba(180, 180, 200, 0.8)'
              }}>
                Bot will dynamically adapt strategies based on real-time market conditions and selected aggression level. Position sizing, stop-losses, and trade frequency will be automatically adjusted.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute top-4 right-4 w-32 h-32 opacity-10 pointer-events-none">
        <motion.div 
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(0, 200, 255, 0.5) 8px, rgba(0, 200, 255, 0.5) 9px)',
            width: '100%',
            height: '100%'
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  )
}
