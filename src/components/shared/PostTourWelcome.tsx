// Post-Tour Welcome Screen — First-Time User Engagement
// November 21, 2025 — Quantum Falcon Cockpit
// Appears after onboarding tour to guide first actions

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightning, Play, Robot, ChartLine, Vault, Users, X, Trophy } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { toast } from 'sonner'

interface PostTourWelcomeProps {
  isOpen: boolean
  onClose: () => void
  onStartBot: () => void
  onNavigate: (tab: string) => void
}

export default function PostTourWelcome({
  isOpen,
  onClose,
  onStartBot,
  onNavigate,
}: PostTourWelcomeProps) {
  const [hasSeenWelcome, setHasSeenWelcome] = useKV<boolean>('post-tour-welcome-seen', false)

  const handleClose = () => {
    setHasSeenWelcome(true)
    onClose()
  }

  const handleStartBot = () => {
    onStartBot()
    handleClose()
    toast.success('🚀 Bot Started!', {
      description: 'Your AI agents are now hunting for opportunities',
      duration: 3000,
    })
  }

  const quickStartActions = [
    {
      id: 'start-bot',
      label: 'Start Bot',
      description: 'Activate your AI trading agents',
      icon: <Play size={24} weight="fill" />,
      action: handleStartBot,
      primary: true,
    },
    {
      id: 'view-agents',
      label: 'View Agents',
      description: 'See your 15 elite AI agents',
      icon: <Robot size={24} weight="duotone" />,
      action: () => {
        onNavigate('multi-agent')
        handleClose()
      },
    },
    {
      id: 'check-vault',
      label: 'Check Vault',
      description: 'View your Bitcoin vault',
      icon: <Vault size={24} weight="duotone" />,
      action: () => {
        onNavigate('vault')
        handleClose()
      },
    },
    {
      id: 'join-community',
      label: 'Join Community',
      description: 'Share wins and strategies',
      icon: <Users size={24} weight="duotone" />,
      action: () => {
        onNavigate('community')
        handleClose()
      },
    },
  ]

  if (!isOpen || hasSeenWelcome) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-xl"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose()
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-w-3xl w-full mx-4 cyber-card p-8"
            style={{
              boxShadow: '0 0 60px rgba(0, 255, 255, 0.5)',
              border: '2px solid rgba(0, 255, 255, 0.4)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
            >
              <X size={20} className="text-muted-foreground hover:text-foreground" />
            </button>

            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="inline-flex p-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full border-2 border-primary/40"
                >
                  <Trophy size={48} weight="fill" className="text-primary" />
                </motion.div>
                
                <h2
                  className="text-3xl font-black uppercase tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #00FFFF, #DC1FFF, #FF00FF)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.4))',
                  }}
                >
                  You're Ready to Hunt
                </h2>
                <p className="text-base text-foreground/90 leading-relaxed max-w-xl mx-auto">
                  Your AI trading cockpit is live. Start your bot and watch it find opportunities in real-time.
                </p>
              </div>

              {/* Quick Start Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickStartActions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={action.action}
                    className={`
                      relative p-6 cyber-card text-left group
                      ${action.primary ? 'border-2 border-primary/60' : 'border border-primary/20'}
                      hover:border-primary/80 transition-all
                    `}
                    style={{
                      boxShadow: action.primary
                        ? '0 0 30px rgba(0, 255, 255, 0.3)'
                        : '0 0 15px rgba(0, 255, 255, 0.1)',
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`
                        p-3 rounded-lg
                        ${action.primary ? 'bg-primary/20' : 'bg-muted/20'}
                      `}>
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                          {action.label}
                          {action.primary && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded uppercase">
                              Recommended
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Progress Indicator */}
              <div className="p-4 bg-muted/20 border border-primary/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold uppercase text-primary">
                    Your Journey
                  </span>
                  <span className="text-xs text-muted-foreground">
                    0% Complete
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '5%' }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Next: Start your bot to begin earning
                </p>
              </div>

              {/* Tips */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Lightning size={20} weight="fill" className="text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-primary mb-1">Pro Tip</p>
                    <p className="text-foreground/80">
                      Your bot runs in <strong>Paper Mode</strong> by default. No real money at risk. 
                      Start trading and watch your profits grow!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

