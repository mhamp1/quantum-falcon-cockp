// Empty State — New User Guidance
// November 21, 2025 — Quantum Falcon Cockpit
// Shows helpful empty states for first-time users

import { motion } from 'framer-motion'
import { Lightning, Robot, ChartLine, Vault, Users, ArrowRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  type: 'no-trades' | 'no-strategies' | 'no-agents' | 'no-community'
  onAction?: () => void
  actionLabel?: string
}

const EMPTY_STATES = {
  'no-trades': {
    icon: <ChartLine size={48} weight="duotone" />,
    title: 'No Trades Yet',
    description: 'Start your bot to begin making trades automatically',
    actionLabel: 'Start Bot',
    color: 'primary',
  },
  'no-strategies': {
    icon: <Lightning size={48} weight="duotone" />,
    title: 'No Strategies Active',
    description: 'Create or activate a strategy to start trading',
    actionLabel: 'Create Strategy',
    color: 'accent',
  },
  'no-agents': {
    icon: <Robot size={48} weight="duotone" />,
    title: 'No Agents Active',
    description: 'Activate an AI agent to start analyzing markets',
    actionLabel: 'View Agents',
    color: 'primary',
  },
  'no-community': {
    icon: <Users size={48} weight="duotone" />,
    title: 'Join the Community',
    description: 'Share your wins and learn from other traders',
    actionLabel: 'Join Community',
    color: 'secondary',
  },
}

export default function EmptyState({ type, onAction }: EmptyStateProps) {
  const state = EMPTY_STATES[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-12 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="inline-flex p-6 bg-muted/20 rounded-full mb-6"
        style={{ color: `var(--${state.color})` }}
      >
        {state.icon}
      </motion.div>
      
      <h3 
        className="text-2xl font-black uppercase tracking-tight mb-3"
        style={{ 
          color: state.color === 'primary' ? 'var(--primary)' : 
                 state.color === 'accent' ? 'var(--accent)' : 
                 state.color === 'secondary' ? 'var(--secondary)' : 'var(--foreground)'
        }}
      >
        {state.title}
      </h3>
      
      <p className="text-base text-muted-foreground mb-6 max-w-md mx-auto">
        {state.description}
      </p>
      
      {onAction && (
        <Button
          onClick={onAction}
          size="lg"
          className={
            state.color === 'primary' ? 'bg-primary hover:opacity-90' :
            state.color === 'accent' ? 'bg-accent hover:opacity-90' :
            state.color === 'secondary' ? 'bg-secondary hover:opacity-90' :
            'bg-primary hover:opacity-90'
          }
        >
          {state.actionLabel}
          <ArrowRight size={20} weight="bold" className="ml-2" />
        </Button>
      )}
    </motion.div>
  )
}

