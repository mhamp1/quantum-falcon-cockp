// Trade Execution Effect — ULTIMATE v2025.1.0
// November 26, 2025 — Quantum Falcon Cockpit
// God Mode type, enhanced particle effects, cyberpunk visuals

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightning, ArrowsDownUp, CheckCircle, Coins, Crown, Zap } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface TradeExecutionEffectProps {
  isActive: boolean
  type: 'dca' | 'snipe' | 'convert' | 'godmode'
  amount?: string
  onComplete?: () => void
}

const EFFECTS = {
  dca: {
    icon: ArrowsDownUp,
    color: 'text-cyan-400',
    glow: 'drop-shadow-[0_0_40px_rgba(34,211,238,0.9)]',
    particles: '#22D3EE',
    border: 'border-cyan-400',
    bg: 'bg-cyan-400'
  },
  snipe: {
    icon: Lightning,
    color: 'text-emerald-400',
    glow: 'drop-shadow-[0_0_50px_rgba(52,211,153,1)]',
    particles: '#34D399',
    border: 'border-emerald-400',
    bg: 'bg-emerald-400'
  },
  convert: {
    icon: Coins,
    color: 'text-orange-400',
    glow: 'drop-shadow-[0_0_50px_rgba(251,146,60,1)]',
    particles: '#FB923C',
    border: 'border-orange-400',
    bg: 'bg-orange-400'
  },
  godmode: {
    icon: Crown,
    color: 'text-yellow-400',
    glow: 'drop-shadow-[0_0_60px_rgba(251,191,36,1)]',
    particles: '#FBBF24',
    border: 'border-yellow-400',
    bg: 'bg-yellow-400'
  }
}

export default function TradeExecutionEffect({ 
  isActive, 
  type, 
  amount = '0.0420',
  onComplete 
}: TradeExecutionEffectProps) {
  const effect = EFFECTS[type]
  const Icon = effect.icon
  const isGodMode = type === 'godmode'
  const particleCount = isGodMode ? 16 : 12
  const iconSize = isGodMode ? 100 : 80

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-[99999]"
        >
          {/* Background Pulse */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0, 0.2]
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, ${effect.particles}40 0%, transparent 70%)`
            }}
          />

          {/* Main Icon Container */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: [0, 1.3, 1],
              rotate: [0, 360]
            }}
            transition={{
              duration: 1.5,
              ease: "easeOut"
            }}
            className="relative"
          >
            {/* Outer Ring */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className={cn(
                "absolute inset-0 rounded-full border-4",
                effect.border
              )}
              style={{
                width: iconSize * 1.5,
                height: iconSize * 1.5,
                left: -iconSize * 0.25,
                top: -iconSize * 0.25,
                boxShadow: `0 0 30px ${effect.particles}80`
              }}
            />

            {/* Icon */}
            <Icon
              size={iconSize}
              weight="duotone"
              className={cn(effect.color, effect.glow)}
            />

            {/* God Mode Amount Display */}
            {isGodMode && amount && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
              >
                <span 
                  className="text-3xl font-black text-yellow-400"
                  style={{ 
                    filter: 'drop-shadow(0 0 20px rgba(251, 191, 36, 0.8))',
                    textShadow: '0 0 20px rgba(251, 191, 36, 0.8)'
                  }}
                >
                  +{amount} BTC
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Particle Ring Explosion */}
          {[...Array(particleCount)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{
                x: Math.cos((i * Math.PI * 2) / particleCount) * (isGodMode ? 200 : 150),
                y: Math.sin((i * Math.PI * 2) / particleCount) * (isGodMode ? 200 : 150),
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.03,
                ease: "easeOut"
              }}
              className="absolute"
            >
              <Zap 
                size={isGodMode ? 32 : 24} 
                weight="fill"
                className={cn(effect.color, effect.glow)}
              />
            </motion.div>
          ))}

          {/* Secondary Particle Dots */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`dot-${i}`}
              className={cn("absolute w-3 h-3 rounded-full", effect.bg)}
              initial={{ 
                x: 0, 
                y: 0,
                scale: 0,
                opacity: 0
              }}
              animate={{
                x: Math.cos((i * Math.PI * 2) / 8 + Math.PI / 8) * (isGodMode ? 250 : 180),
                y: Math.sin((i * Math.PI * 2) / 8 + Math.PI / 8) * (isGodMode ? 250 : 180),
                scale: [0, 2, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1.5,
                ease: "easeOut",
                delay: 0.2 + i * 0.04
              }}
              style={{
                boxShadow: `0 0 15px ${effect.particles}`
              }}
            />
          ))}

          {/* Border Flash */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <div 
              className={cn("absolute inset-0 rounded-lg border-4", effect.border)}
              style={{ boxShadow: `inset 0 0 50px ${effect.particles}40` }}
            />
          </motion.div>

          {/* Final Flash (subtle, no white screen) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0] }}
            transition={{ duration: 0.4, delay: 1.2 }}
            className="absolute inset-0"
            style={{ backgroundColor: effect.particles }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
