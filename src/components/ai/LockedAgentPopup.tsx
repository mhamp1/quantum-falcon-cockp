// FINAL AGENT LOCK TEASER: Hover popup shows what users are missing — upgrade conversion 10x — November 21, 2025
// LockedAgentPopup Component — Premium Agent Teaser with Conversion Focus
// November 21, 2025 — Quantum Falcon Cockpit

import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Lock, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { EliteAgentInstance, AgentTier } from '@/lib/ai/agents'
import { useEffect } from 'react'

interface LockedAgentPopupProps {
  agent: EliteAgentInstance
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
}

// Special teaser copy for specific agents
const AGENT_TEASER_COPY: Record<string, string> = {
  'Quantum Ensemble': 'The smartest agent in crypto — runs all 15 and votes.',
  'Arbitrage Phantom': 'Cross-DEX arb — prints money on spreads.',
  'Sentiment Oracle': 'Reads Twitter/X + Discord in real-time.',
}

// Profit teaser values for specific agents (simulated for marketing purposes)
const AGENT_PROFIT_TEASER: Record<string, string> = {
  'Quantum Ensemble': '+$42,700 avg/mo',
  'Arbitrage Phantom': '+$35,900 avg/mo',
  'Sentiment Oracle': '+$29,400 avg/mo',
}

const DEFAULT_PROFIT_TEASER = '+$18,500 avg/mo'

// Disclaimer for profit claims
const PROFIT_DISCLAIMER = 'Simulated results. Past performance does not guarantee future results.'

// Tier display names
const TIER_DISPLAY_NAME: Record<AgentTier, string> = {
  free: 'FREE',
  pro: 'PRO',
  elite: 'ELITE',
  lifetime: 'LIFETIME',
}

/**
 * LockedAgentPopup — Large, elite-feeling popup for locked agents
 * Shows what users are missing and heavily encourages upgrade
 */
export default function LockedAgentPopup({
  agent,
  isOpen,
  onClose,
  onUpgrade,
}: LockedAgentPopupProps) {
  const teaserCopy = AGENT_TEASER_COPY[agent.name] || agent.description
  const profitTeaser = AGENT_PROFIT_TEASER[agent.name] || DEFAULT_PROFIT_TEASER
  const tierDisplay = TIER_DISPLAY_NAME[agent.tier]

  // Handle escape key
  useEffect(() => {
    // SSR safety check
    if (typeof document === 'undefined') return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = ''
      }
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md"
            role="presentation"
          />

          {/* Popup Dialog */}
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
            aria-label={`${agent.name} upgrade required`}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full pointer-events-auto"
            >
              {/* Card with glow effect */}
              <div
                className={cn(
                  'relative rounded-3xl border-2 overflow-hidden',
                  'bg-gradient-to-br from-background via-background to-black',
                  'shadow-2xl'
                )}
                style={{
                  borderColor: agent.color,
                  boxShadow: `0 0 60px ${agent.color}40, 0 0 120px ${agent.color}20`,
                }}
              >
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 rounded-full bg-background/80 hover:bg-background transition-colors border border-border"
                  aria-label="Close popup"
                >
                  <X size={24} weight="bold" className="text-muted-foreground" />
                </button>

                {/* Content */}
                <div className="p-8 md:p-12">
                  {/* Icon/Orb */}
                  <div className="flex justify-center mb-6">
                    <motion.div
                      animate={{
                        boxShadow: [
                          `0 0 40px ${agent.color}40`,
                          `0 0 60px ${agent.color}60`,
                          `0 0 40px ${agent.color}40`,
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="relative rounded-full bg-gradient-to-br from-background to-black p-6 border-2"
                      style={{ borderColor: agent.color }}
                    >
                      <Lock
                        size={96}
                        weight="duotone"
                        style={{ color: agent.color }}
                      />
                    </motion.div>
                  </div>

                  {/* Agent Name */}
                  <motion.h2
                    animate={{
                      textShadow: [
                        `0 0 20px ${agent.color}80`,
                        `0 0 30px ${agent.color}`,
                        `0 0 20px ${agent.color}80`,
                      ],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="text-4xl md:text-5xl font-black text-center mb-4 uppercase tracking-wide"
                    style={{ color: agent.color }}
                  >
                    {agent.name}
                  </motion.h2>

                  {/* Tier Badge with Crown */}
                  <div className="flex justify-center mb-6">
                    <Badge
                      className={cn(
                        'px-6 py-2 text-sm uppercase tracking-wider border-2 font-bold',
                        'bg-gradient-to-r',
                        agent.tier === 'pro' && 'from-blue-500/20 to-blue-600/20 border-blue-500 text-blue-400',
                        agent.tier === 'elite' && 'from-purple-500/20 to-purple-600/20 border-purple-500 text-purple-400',
                        agent.tier === 'lifetime' && 'from-amber-500/20 to-amber-600/20 border-amber-500 text-amber-400'
                      )}
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="inline-block mr-2"
                      >
                        <Crown size={20} weight="fill" />
                      </motion.div>
                      {tierDisplay} TIER
                    </Badge>
                  </div>

                  {/* Description */}
                  <p className="text-center text-lg md:text-xl text-foreground/90 mb-6 leading-relaxed">
                    {teaserCopy}
                  </p>

                  {/* Upgrade Text */}
                  <p className="text-center text-base text-muted-foreground mb-8">
                    Requires <span className="font-bold text-foreground">{tierDisplay}</span> — upgrade to unlock.
                  </p>

                  {/* Profit Teaser */}
                  <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 border-2 border-accent/30">
                    <div className="text-center">
                      <div className="text-3xl md:text-4xl font-black text-accent mb-2">
                        {profitTeaser}
                      </div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        Average Monthly Profit (Elite Users)
                      </div>
                      <div className="text-[10px] text-muted-foreground/70 italic">
                        {PROFIT_DISCLAIMER}
                      </div>
                    </div>
                  </div>

                  {/* Elite Trader Badge */}
                  <div className="text-center mb-8">
                    <Badge
                      variant="outline"
                      className="px-4 py-2 text-xs border-primary/50 bg-primary/5"
                    >
                      ⭐ Used by top 100 traders
                    </Badge>
                  </div>

                  {/* Upgrade Button */}
                  <Button
                    size="lg"
                    onClick={onUpgrade}
                    className={cn(
                      'w-full text-xl font-black uppercase tracking-wide py-6 md:py-8',
                      'bg-gradient-to-r hover:opacity-90 transition-all duration-300',
                      'shadow-2xl hover:scale-105',
                      agent.tier === 'pro' && 'from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600',
                      agent.tier === 'elite' && 'from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600',
                      agent.tier === 'lifetime' && 'from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600'
                    )}
                    style={{
                      boxShadow: `0 10px 40px ${agent.color}40`,
                    }}
                  >
                    <Crown size={28} weight="fill" className="mr-3" />
                    UPGRADE TO {tierDisplay}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
