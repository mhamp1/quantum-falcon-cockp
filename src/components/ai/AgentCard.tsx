// FINAL AGENT LOCK TEASER: Hover popup shows what users are missing — upgrade conversion 10x — November 21, 2025
// AgentCard Component — Elite AI Agent Display with Tier Gating
// November 21, 2025 — Quantum Falcon Cockpit

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, CheckCircle } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { EliteAgentInstance, AgentSignal, AgentTier } from '@/lib/ai/agents'
import LockedAgentPopup from './LockedAgentPopup'

interface AgentCardProps {
  agent: EliteAgentInstance
  userTier: AgentTier
  isActive?: boolean
  lastSignal?: AgentSignal
  confidencePct?: number
  compact?: boolean
  onSelect?: () => void
  onUpgradeClick?: () => void
}

/**
 * AgentCard — Display an AI agent with tier gating and status
 */
export default function AgentCard({
  agent,
  userTier,
  isActive = false,
  lastSignal,
  confidencePct,
  compact = false,
  onSelect,
  onUpgradeClick,
}: AgentCardProps) {
  const Icon = agent.icon
  
  // Check if agent is locked based on user tier
  const isLocked = !hasAccess(agent.tier, userTier)
  
  // State for popup visibility
  const [showLockedPopup, setShowLockedPopup] = useState(false)
  
  // Signal colors
  const signalColors = {
    BUY: 'text-accent',
    SELL: 'text-destructive',
    HOLD: 'text-muted-foreground',
  }
  
  // Personality colors
  const personalityColors = {
    aggressive: 'bg-destructive/10 text-destructive border-destructive/30',
    defensive: 'bg-accent/10 text-accent border-accent/30',
    balanced: 'bg-primary/10 text-primary border-primary/30',
    opportunistic: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  }

  // Handler for upgrade action
  const handleUpgrade = () => {
    setShowLockedPopup(false)
    if (onUpgradeClick) {
      onUpgradeClick()
    } else {
      // Fallback to navigating to settings/billing
      if (typeof window !== 'undefined') {
        window.location.href = '/settings?tab=billing'
      }
    }
  }

  // Handler for card click
  const handleCardClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault()
      e.stopPropagation()
      setShowLockedPopup(true)
    } else if (onSelect) {
      onSelect()
    }
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: isLocked ? 1 : 1.02 }}
        onClick={handleCardClick}
        className={cn(
          'relative cyber-card transition-all',
          compact ? 'p-4' : 'p-6',
          isActive && 'ring-4 ring-primary/50 shadow-2xl shadow-primary/20',
          isLocked ? 'opacity-70 cursor-pointer' : 'cursor-pointer'
        )}
      >
        {/* Lock Overlay - Visual indicator only */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center pointer-events-none">
            <div className="text-center p-4">
              <Lock size={48} weight="duotone" className="text-destructive mx-auto mb-3" />
              <p className="text-sm font-bold uppercase tracking-wider text-destructive">
                REQUIRES {agent.tier.toUpperCase()}
              </p>
            </div>
          </div>
        )}

      {/* Agent Content */}
      <div className="relative z-0">
        {/* Header */}
        <div className={cn('flex items-start gap-4', compact ? 'mb-3' : 'mb-4')}>
          <div
            className={cn(
              'rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0',
              compact ? 'p-2' : 'p-3'
            )}
          >
            <Icon
              size={compact ? 24 : 32}
              weight="duotone"
              style={{ color: agent.color }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3
                className={cn(
                  'font-bold uppercase tracking-wide truncate',
                  compact ? 'text-sm' : 'text-lg'
                )}
                style={{ color: agent.color }}
              >
                {agent.name}
              </h3>
              
              {/* Active Indicator */}
              {isActive && (
                <Badge className="bg-primary/20 border border-primary text-primary text-[9px] flex-shrink-0">
                  <CheckCircle size={10} weight="fill" className="mr-1" />
                  ACTIVE
                </Badge>
              )}
            </div>
            
            <p className={cn('text-muted-foreground leading-tight', compact ? 'text-[10px]' : 'text-xs')}>
              {agent.description}
            </p>
          </div>
        </div>

        {/* Status Bar */}
        {!compact && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {/* Personality */}
            <Badge
              className={cn(
                'justify-center text-[9px] uppercase tracking-wider border',
                personalityColors[agent.personality]
              )}
            >
              {agent.personality}
            </Badge>
            
            {/* Tier */}
            <Badge
              className={cn(
                'justify-center text-[9px] uppercase tracking-wider border',
                agent.tier === 'free'
                  ? 'bg-green-500/10 text-green-500 border-green-500/30'
                  : agent.tier === 'pro'
                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                  : 'bg-purple-500/10 text-purple-500 border-purple-500/30'
              )}
            >
              {agent.tier === 'lifetime' ? 'ELITE' : agent.tier}
            </Badge>
          </div>
        )}

        {/* Last Signal */}
        {lastSignal && (
          <div className="mt-4 p-3 bg-background/60 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Last Signal
              </span>
              {confidencePct !== undefined && (
                <span className="text-[10px] text-muted-foreground">
                  {confidencePct}% confidence
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-xl font-bold uppercase tracking-wider',
                  signalColors[lastSignal]
                )}
              >
                {lastSignal}
              </span>
              
              {confidencePct !== undefined && (
                <div className="flex-1 h-2 bg-muted/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidencePct}%` }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      'h-full rounded-full',
                      lastSignal === 'BUY' && 'bg-accent',
                      lastSignal === 'SELL' && 'bg-destructive',
                      lastSignal === 'HOLD' && 'bg-muted-foreground'
                    )}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Compact Mode: Show Tier Badge */}
        {compact && (
          <div className="mt-3 flex items-center gap-2">
            <Badge
              className={cn(
                'text-[8px] uppercase tracking-wider border flex-1 justify-center',
                personalityColors[agent.personality]
              )}
            >
              {agent.personality}
            </Badge>
            <Badge
              className={cn(
                'text-[8px] uppercase tracking-wider border',
                agent.tier === 'free'
                  ? 'bg-green-500/10 text-green-500 border-green-500/30'
                  : agent.tier === 'pro'
                  ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                  : 'bg-purple-500/10 text-purple-500 border-purple-500/30'
              )}
            >
              {agent.tier === 'lifetime' ? 'ELITE' : agent.tier}
            </Badge>
          </div>
        )}
      </div>
    </motion.div>

    {/* Locked Agent Popup */}
    {isLocked && (
      <LockedAgentPopup
        agent={agent}
        isOpen={showLockedPopup}
        onClose={() => setShowLockedPopup(false)}
        onUpgrade={handleUpgrade}
      />
    )}
  </>
  )
}

/**
 * Helper to check tier access
 */
function hasAccess(agentTier: AgentTier, userTier: AgentTier): boolean {
  const tierHierarchy: AgentTier[] = ['free', 'pro', 'elite', 'lifetime']
  const agentLevel = tierHierarchy.indexOf(agentTier)
  const userLevel = tierHierarchy.indexOf(userTier)
  
  // Lifetime has access to everything
  if (userTier === 'lifetime') return true
  
  return userLevel >= agentLevel
}
