import { motion, AnimatePresence } from 'framer-motion'
import { Lightning, ArrowsDownUp, CheckCircle } from '@phosphor-icons/react'

interface TradeExecutionEffectProps {
  isActive: boolean
  type: 'dca' | 'snipe' | 'convert'
  onComplete?: () => void
}

export default function TradeExecutionEffect({ isActive, type, onComplete }: TradeExecutionEffectProps) {
  const icons = {
    dca: ArrowsDownUp,
    snipe: Lightning,
    convert: CheckCircle
  }

  const colors = {
    dca: 'text-primary',
    snipe: 'text-accent',
    convert: 'text-[#F7931A]'
  }

  const glows = {
    dca: 'drop-shadow-[0_0_30px_rgba(20,241,149,0.8)]',
    snipe: 'drop-shadow-[0_0_30px_rgba(0,229,160,0.8)]',
    convert: 'drop-shadow-[0_0_30px_rgba(247,147,26,0.8)]'
  }

  const Icon = icons[type]

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut"
            }}
          >
            <Icon 
              size={80} 
              weight="duotone" 
              className={`${colors[type]} ${glows[type]}`}
            />
          </motion.div>

          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <div className={`absolute inset-0 rounded-lg border-4 ${type === 'dca' ? 'border-primary' : type === 'snipe' ? 'border-accent' : 'border-[#F7931A]'}`} />
          </motion.div>

          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${type === 'dca' ? 'bg-primary' : type === 'snipe' ? 'bg-accent' : 'bg-[#F7931A]'}`}
              initial={{ 
                x: 0, 
                y: 0,
                scale: 0,
                opacity: 0
              }}
              animate={{
                x: Math.cos((i * Math.PI * 2) / 12) * 100,
                y: Math.sin((i * Math.PI * 2) / 12) * 100,
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1.5,
                ease: "easeOut",
                delay: i * 0.05
              }}
              style={{
                boxShadow: `0 0 10px ${type === 'dca' ? '#14F195' : type === 'snipe' ? '#00E5A0' : '#F7931A'}`
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
