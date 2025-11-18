import { TrendUp, ArrowsClockwise, Lightning, Robot, Link, Brain, User } from '@phosphor-icons/react'
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
        <Lightning {...iconProps} />
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
    'Custom': {
      bg: 'bg-muted/20',
      border: 'border-muted',
      text: 'text-muted-foreground',
      glow: 'shadow-[0_0_20px_oklch(0.50_0.10_195_/_0.2)]'
    }
  }

  return colors[category] || colors['Custom']
}
