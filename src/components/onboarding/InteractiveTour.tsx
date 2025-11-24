// COMPREHENSIVE INTERACTIVE TOUR — Built from scratch
// November 22, 2025 — Quantum Falcon Cockpit v2025.1.0
// Modern, helpful, comprehensive onboarding experience

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  House, 
  Robot, 
  ChartLine, 
  Lightning,
  Code,
  Vault,
  Users,
  Gear,
  Trophy,
  Sparkle,
  CheckCircle
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { soundEffects } from '@/lib/soundEffects'

export interface TourStep {
  id: string
  title: string
  description: string
  targetSelector?: string
  targetTab?: string
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: 'click' | 'hover' | 'navigate' | 'info'
  icon?: React.ComponentType<{ size?: number; className?: string }>
  highlight?: boolean
}

interface InteractiveTourProps {
  isOpen: boolean
  onComplete: () => void
  onSkip: () => void
  setActiveTab: (tab: string) => void
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Quantum Falcon',
    description: 'Your AI-powered trading cockpit. This tour will show you everything you need to master the platform in just a few minutes.',
    position: 'center',
    action: 'info',
    icon: Sparkle,
    highlight: true
  },
  {
    id: 'dashboard',
    title: 'Dashboard — Command Center',
    description: 'Your mission control. Monitor portfolio performance, bot status, and real-time trading activity. Quick stats show your P&L, win rate, and active positions at a glance.',
    targetSelector: '[data-tour="dashboard"]',
    targetTab: 'dashboard',
    position: 'bottom',
    action: 'info',
    icon: House
  },
  {
    id: 'bot-overview',
    title: 'Bot Overview — System Status',
    description: 'Monitor your AI trading agents in real-time. See system architecture, agent health, and control bot operations. This is where you start and stop your trading automation.',
    targetTab: 'bot-overview',
    position: 'right',
    action: 'navigate',
    icon: Robot
  },
  {
    id: 'ai-agents',
    title: 'AI Agents — Trading Intelligence',
    description: '15 elite AI agents at your command. Each specializes in different strategies—from DCA to momentum trading. Free tier gets 1 agent; upgrade to unlock all 15.',
    targetTab: 'multi-agent',
    position: 'right',
    action: 'navigate',
    icon: Robot
  },
  {
    id: 'analytics',
    title: 'Analytics — Performance Insights',
    description: 'Deep dive into your trading performance. Charts, metrics, and insights help you understand what\'s working and optimize your strategies.',
    targetTab: 'analytics',
    position: 'right',
    action: 'navigate',
    icon: ChartLine
  },
  {
    id: 'trading',
    title: 'Trading Hub — Execute Trades',
    description: 'Advanced trading interface for manual execution. Place orders, monitor positions, and manage your active trades. Perfect for when you want direct control.',
    targetTab: 'trading',
    position: 'right',
    action: 'navigate',
    icon: Lightning
  },
  {
    id: 'strategy-builder',
    title: 'Strategy Builder — Create Custom Strategies',
    description: 'Build your own trading strategies with our visual builder. Test with backtesting, optimize parameters, and deploy with one click. Free tier: DCA Basic only.',
    targetTab: 'strategy-builder',
    position: 'right',
    action: 'navigate',
    icon: Code
  },
  {
    id: 'vault',
    title: 'Vault — Secure Profit Storage',
    description: 'Automatically convert profits to BTC and store securely. Track your accumulated wealth with beautiful 3D visualizations. Your profits are safe here.',
    targetTab: 'vault',
    position: 'right',
    action: 'navigate',
    icon: Vault
  },
  {
    id: 'community',
    title: 'Community — Connect & Learn',
    description: 'Join traders, share strategies, compete on leaderboards, and earn XP. Free tier: read-only access. Upgrade to participate and unlock Elite Lounge.',
    targetTab: 'community',
    position: 'right',
    action: 'navigate',
    icon: Users
  },
  {
    id: 'settings',
    title: 'Settings — Customize Everything',
    description: 'Configure API keys, trading parameters, notifications, security, and more. This is your control panel for personalizing Quantum Falcon to your needs.',
    targetTab: 'settings',
    position: 'right',
    action: 'navigate',
    icon: Gear
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'You now know everything you need to start trading. Remember: Free tier includes paper trading (unlimited), 1 AI agent, and DCA Basic strategy. Upgrade to unlock the full power!',
    position: 'center',
    action: 'info',
    icon: CheckCircle,
    highlight: true
  }
]

export default function InteractiveTour({ 
  isOpen, 
  onComplete, 
  onSkip,
  setActiveTab 
}: InteractiveTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const currentStep = TOUR_STEPS[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1
  const progress = ((currentStepIndex + 1) / TOUR_STEPS.length) * 100

  // Update target position when step changes
  useEffect(() => {
    if (!isOpen || !currentStep) return

    const updateTarget = () => {
      if (currentStep.targetSelector) {
        const element = document.querySelector(currentStep.targetSelector)
        if (element) {
          const rect = element.getBoundingClientRect()
          setTargetRect(rect)
          return
        }
      }
      
      // If no specific target, use center
      if (currentStep.position === 'center') {
        setTargetRect(null)
        return
      }

      // Try to find element by tab
      if (currentStep.targetTab) {
        const tabButton = document.querySelector(`[data-tab="${currentStep.targetTab}"]`)
        if (tabButton) {
          const rect = tabButton.getBoundingClientRect()
          setTargetRect(rect)
          return
        }
      }

      setTargetRect(null)
    }

    // Initial update
    updateTarget()

    // Update on scroll/resize
    const handleUpdate = () => {
      if (!isNavigating) updateTarget()
    }

    window.addEventListener('scroll', handleUpdate, true)
    window.addEventListener('resize', handleUpdate)

    // Retry finding target with delay for lazy-loaded content
    const retryTimer = setTimeout(updateTarget, 500)

    return () => {
      window.removeEventListener('scroll', handleUpdate, true)
      window.removeEventListener('resize', handleUpdate)
      clearTimeout(retryTimer)
    }
  }, [currentStepIndex, isOpen, currentStep, isNavigating])

  // Navigate to target tab when step requires it
  useEffect(() => {
    if (!isOpen || !currentStep?.targetTab || isNavigating) return

    if (currentStep.targetTab && currentStep.action === 'navigate') {
      setIsNavigating(true)
      setActiveTab(currentStep.targetTab)
      
      // Wait for tab to load
      setTimeout(() => {
        setIsNavigating(false)
      }, 800)
    }
  }, [currentStepIndex, isOpen, currentStep, setActiveTab, isNavigating])

  const handleNext = useCallback(() => {
    soundEffects.playClick()
    
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStepIndex(prev => prev + 1)
    }
  }, [isLastStep, onComplete])

  const handlePrevious = useCallback(() => {
    soundEffects.playClick()
    setCurrentStepIndex(prev => Math.max(0, prev - 1))
  }, [])

  const handleSkip = useCallback(() => {
    soundEffects.playClick()
    onSkip()
  }, [onSkip])

  if (!isOpen) return null

  const getCardPosition = () => {
    if (currentStep.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }

    if (!targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }

    const spacing = 20
    const cardWidth = 400
    const cardHeight = 200

    switch (currentStep.position) {
      case 'top':
        return {
          top: `${targetRect.top - cardHeight - spacing}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%)',
        }
      case 'bottom':
        return {
          top: `${targetRect.bottom + spacing}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%)',
        }
      case 'left':
        return {
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.left - cardWidth - spacing}px`,
          transform: 'translateY(-50%)',
        }
      case 'right':
        // For step 10 (settings), position higher to ensure next button is visible
        const isStep10 = currentStepIndex === 9 // Settings is step 10 (0-indexed = 9)
        const verticalOffset = isStep10 ? -150 : 0 // Raise step 10 by 150px to ensure button is accessible
        const calculatedTop = targetRect.top + targetRect.height / 2 + verticalOffset
        // Ensure card doesn't go above viewport
        const safeTop = Math.max(20, calculatedTop)
        return {
          top: `${safeTop}px`,
          left: `${targetRect.right + spacing}px`,
          transform: 'translateY(-50%)',
          maxHeight: 'calc(100vh - 40px)', // Ensure card fits in viewport
        }
      default:
        return {
          top: `${targetRect.bottom + spacing}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%)',
        }
    }
  }

  const getSpotlightPosition = () => {
    if (!targetRect || currentStep.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        width: '100vw',
        height: '100vh',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
      }
    }

    const padding = 10
    return {
      top: `${targetRect.top - padding}px`,
      left: `${targetRect.left - padding}px`,
      width: `${targetRect.width + padding * 2}px`,
      height: `${targetRect.height + padding * 2}px`,
      borderRadius: '8px',
    }
  }

  const IconComponent = currentStep.icon || Sparkle

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {/* Dark overlay with spotlight */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80"
            style={{
              clipPath: targetRect && currentStep.position !== 'center'
                ? `polygon(
                    0% 0%, 
                    0% 100%, 
                    ${targetRect.left - 10}px 100%, 
                    ${targetRect.left - 10}px ${targetRect.top - 10}px, 
                    ${targetRect.right + 10}px ${targetRect.top - 10}px, 
                    ${targetRect.right + 10}px ${targetRect.bottom + 10}px, 
                    ${targetRect.left - 10}px ${targetRect.bottom + 10}px, 
                    ${targetRect.left - 10}px 100%, 
                    100% 100%, 
                    100% 0%
                  )`
                : 'none'
            }}
          />

          {/* Spotlight glow */}
          {targetRect && currentStep.position !== 'center' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute pointer-events-none"
              style={{
                ...getSpotlightPosition(),
                boxShadow: '0 0 0 9999px rgba(0, 212, 255, 0.1), 0 0 40px rgba(0, 212, 255, 0.3)',
                border: '2px solid rgba(0, 212, 255, 0.5)',
              }}
            />
          )}

          {/* Tour Card */}
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute pointer-events-auto"
            style={{
              ...getCardPosition(),
              maxHeight: 'calc(100vh - 40px)',
              overflowY: 'auto',
            }}
          >
            <div className={cn(
              "relative w-[400px] max-w-[90vw] bg-gradient-to-br from-background via-background to-primary/10",
              "border-2 border-primary/50 rounded-2xl shadow-2xl",
              "backdrop-blur-xl p-6 space-y-4",
              currentStep.highlight && "ring-4 ring-primary/30"
            )}>
              {/* Progress bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-primary/20 rounded-t-2xl overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-primary to-accent"
                />
              </div>

              {/* Header */}
              <div className="flex items-start gap-4 pt-2">
                <div className={cn(
                  "p-3 rounded-xl bg-primary/20 border border-primary/30",
                  "flex-shrink-0"
                )}>
                  <IconComponent size={24} className="text-primary" weight="duotone" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-foreground mb-1 uppercase tracking-tight">
                    {currentStep.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {currentStep.description}
                  </p>
                </div>
                <button
                  onClick={handleSkip}
                  className="flex-shrink-0 p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                  aria-label="Skip tour"
                >
                  <X size={20} className="text-muted-foreground" />
                </button>
              </div>

              {/* Step indicator */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Step {currentStepIndex + 1} of {TOUR_STEPS.length}
                </span>
                <span>
                  {Math.round(progress)}% Complete
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-primary/20">
                <button
                  onClick={handlePrevious}
                  disabled={isFirstStep}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all",
                    "flex items-center gap-2",
                    isFirstStep
                      ? "opacity-50 cursor-not-allowed text-muted-foreground"
                      : "text-foreground hover:bg-primary/10 hover:border-primary/50 border border-transparent"
                  )}
                >
                  <ArrowLeft size={16} />
                  Previous
                </button>

                <button
                  onClick={handleNext}
                  className={cn(
                    "px-6 py-2 rounded-lg font-bold uppercase tracking-wider transition-all",
                    "flex items-center gap-2",
                    "bg-gradient-to-r from-primary to-accent text-primary-foreground",
                    "hover:from-primary/90 hover:to-accent/90",
                    "shadow-lg shadow-primary/20 hover:shadow-primary/30",
                    "border border-primary/30"
                  )}
                >
                  {isLastStep ? 'Complete Tour' : 'Next'}
                  {!isLastStep && <ArrowRight size={16} />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

