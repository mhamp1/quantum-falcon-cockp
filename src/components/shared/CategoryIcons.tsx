import { 
  TrendUp, ArrowsClockwise, Lightning, Robot, Link, Brain, User,
  ChartLine, Pulse, Binoculars, Target, ChartLineUp, ChartBar,
  Cpu, CurrencyCircleDollar, Gauge, Graph, TrendDown, ArrowsIn
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface CategoryIconProps {
  category: string
  size?: number
  tier?: string
  className?: string
}

export function CategoryIcon({ category, size = 32, tier = 'Free', className = '' }: CategoryIconProps) {
  const tierColors = {
    Free: 'text-primary',
    Starter: 'text-primary',
    Trader: 'text-accent',
    Pro: 'text-secondary',
    Elite: 'from-secondary via-accent to-primary',
    Lifetime: 'from-accent via-primary to-secondary'
  }

  const color = tierColors[tier as keyof typeof tierColors] || tierColors.Free
  const isGradient = tier === 'Elite' || tier === 'Lifetime'

  const iconProps = {
    size,
    weight: 'duotone' as const,
    className: isGradient 
      ? `${className}`
      : `${color} ${className}`
  }

  const iconComponents: Record<string, React.ReactNode> = {
    'Trend': (
      <motion.div
        animate={{
          y: [0, -4, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <TrendUp {...iconProps} />
      </motion.div>
    ),
    'Trend Following': (
      <motion.div
        animate={{
          y: [0, -4, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <TrendUp {...iconProps} />
      </motion.div>
    ),
    'Mean Reversion': (
      <motion.div
        animate={{
          rotateY: [0, 180, 360]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <ArrowsClockwise {...iconProps} />
      </motion.div>
    ),
    'Arbitrage': (
      <motion.div
        animate={{
          rotate: [0, 10, -10, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <Cpu {...iconProps} />
      </motion.div>
    ),
    'Breakout': (
      <motion.div
        animate={{
          scale: [1, 1.2, 1]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <Lightning {...iconProps} />
      </motion.div>
    ),
    'On-Chain': (
      <motion.div
        animate={{
          x: [0, 4, -4, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <Link {...iconProps} />
      </motion.div>
    ),
    'ML': (
      <motion.div
        animate={{
          opacity: [1, 0.7, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <Brain {...iconProps} />
      </motion.div>
    ),
    'Machine Learning': (
      <motion.div
        animate={{
          opacity: [1, 0.7, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <Robot {...iconProps} />
      </motion.div>
    ),
    'Scalping': (
      <motion.div
        animate={{
          x: [0, 2, -2, 0],
          y: [0, -2, 2, 0]
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <ChartLine {...iconProps} />
      </motion.div>
    ),
    'RSI Divergence': (
      <motion.div
        animate={{
          rotate: [0, 5, -5, 0]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <ArrowsIn {...iconProps} />
      </motion.div>
    ),
    'Momentum': (
      <motion.div
        animate={{
          x: [0, 6, 0]
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <Pulse {...iconProps} />
      </motion.div>
    ),
    'Volume Analysis': (
      <motion.div
        animate={{
          scaleY: [1, 1.1, 0.9, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <ChartBar {...iconProps} />
      </motion.div>
    ),
    'Grid Trading': (
      <motion.div
        animate={{
          opacity: [1, 0.8, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <Graph {...iconProps} />
      </motion.div>
    ),
    'Market Making': (
      <motion.div
        animate={{
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <CurrencyCircleDollar {...iconProps} />
      </motion.div>
    ),
    'High Frequency': (
      <motion.div
        animate={{
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear'
        }}
      >
        <Gauge {...iconProps} />
      </motion.div>
    ),
    'Pattern Recognition': (
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, 0]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <Target {...iconProps} />
      </motion.div>
    ),
    'Analytics': (
      <motion.div
        animate={{
          y: [0, -3, 0]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <ChartLineUp {...iconProps} />
      </motion.div>
    ),
    'Prediction': (
      <motion.div
        animate={{
          opacity: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        <Binoculars {...iconProps} />
      </motion.div>
    ),
    'Custom': (
      <motion.div
        animate={{
          rotate: [0, 360]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear'
        }}
      >
        <User {...iconProps} />
      </motion.div>
    )
  }

  const Icon = iconComponents[category] || iconComponents['Custom']

  if (isGradient) {
    return (
      <div className="relative">
        <div className={`bg-gradient-to-br ${color} bg-clip-text text-transparent`}>
          {Icon}
        </div>
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-30 blur-xl`} />
      </div>
    )
  }

  return Icon
}

export function getCategoryColor(category: string): { bg: string; border: string; text: string; glow: string } {
  const colors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    'Trend': {
      bg: 'bg-primary/20',
      border: 'border-primary',
      text: 'text-primary',
      glow: 'shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.3)]'
    },
    'Trend Following': {
      bg: 'bg-primary/20',
      border: 'border-primary',
      text: 'text-primary',
      glow: 'shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.3)]'
    },
    'Mean Reversion': {
      bg: 'bg-accent/20',
      border: 'border-accent',
      text: 'text-accent',
      glow: 'shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]'
    },
    'Arbitrage': {
      bg: 'bg-secondary/20',
      border: 'border-secondary',
      text: 'text-secondary',
      glow: 'shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]'
    },
    'Breakout': {
      bg: 'bg-primary/20',
      border: 'border-primary',
      text: 'text-primary',
      glow: 'shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.3)]'
    },
    'On-Chain': {
      bg: 'bg-accent/20',
      border: 'border-accent',
      text: 'text-accent',
      glow: 'shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]'
    },
    'ML': {
      bg: 'bg-destructive/20',
      border: 'border-destructive',
      text: 'text-destructive',
      glow: 'shadow-[0_0_20px_oklch(0.65_0.25_25_/_0.3)]'
    },
    'Machine Learning': {
      bg: 'bg-destructive/20',
      border: 'border-destructive',
      text: 'text-destructive',
      glow: 'shadow-[0_0_20px_oklch(0.65_0.25_25_/_0.3)]'
    },
    'Scalping': {
      bg: 'bg-primary/20',
      border: 'border-primary',
      text: 'text-primary',
      glow: 'shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.3)]'
    },
    'RSI Divergence': {
      bg: 'bg-accent/20',
      border: 'border-accent',
      text: 'text-accent',
      glow: 'shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]'
    },
    'Momentum': {
      bg: 'bg-primary/20',
      border: 'border-primary',
      text: 'text-primary',
      glow: 'shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.3)]'
    },
    'Volume Analysis': {
      bg: 'bg-accent/20',
      border: 'border-accent',
      text: 'text-accent',
      glow: 'shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]'
    },
    'Grid Trading': {
      bg: 'bg-secondary/20',
      border: 'border-secondary',
      text: 'text-secondary',
      glow: 'shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]'
    },
    'Market Making': {
      bg: 'bg-primary/20',
      border: 'border-primary',
      text: 'text-primary',
      glow: 'shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.3)]'
    },
    'High Frequency': {
      bg: 'bg-destructive/20',
      border: 'border-destructive',
      text: 'text-destructive',
      glow: 'shadow-[0_0_20px_oklch(0.65_0.25_25_/_0.3)]'
    },
    'Pattern Recognition': {
      bg: 'bg-accent/20',
      border: 'border-accent',
      text: 'text-accent',
      glow: 'shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]'
    },
    'Analytics': {
      bg: 'bg-primary/20',
      border: 'border-primary',
      text: 'text-primary',
      glow: 'shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.3)]'
    },
    'Prediction': {
      bg: 'bg-secondary/20',
      border: 'border-secondary',
      text: 'text-secondary',
      glow: 'shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)]'
    },
    'Custom': {
      bg: 'bg-muted/20',
      border: 'border-muted',
      text: 'text-muted-foreground',
      glow: 'shadow-[0_0_20px_oklch(0.50_0.10_195_/_0.2)]'
    }
  }

  return colors[category] || colors['Custom']
}
