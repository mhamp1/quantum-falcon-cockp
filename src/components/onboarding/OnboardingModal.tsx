// 10-SECOND ONBOARDING — First Launch Only
// November 22, 2025 — Quantum Falcon Cockpit v2025.1.0
// Quick, beautiful, zero friction

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  Rocket, 
  ShieldCheck, 
  ChartLine, 
  CheckCircle,
  ArrowRight,
  Sparkle
} from '@phosphor-icons/react'

interface OnboardingModalProps {
  onComplete: () => void
  username?: string
}

const steps = [
  {
    icon: Rocket,
    title: 'Welcome, Commander',
    description: 'You\'re now in the Quantum Falcon Cockpit — the most advanced AI trading platform on Solana.',
    color: 'cyan'
  },
  {
    icon: ShieldCheck,
    title: 'You\'re in Paper Mode',
    description: 'Zero risk. All trades are simulated with live market data. When ready, flip to Live Mode in Settings.',
    color: 'green'
  },
  {
    icon: ChartLine,
    title: 'Start Trading Immediately',
    description: 'Your dashboard is ready. Deploy agents, create strategies, and watch your portfolio grow.',
    color: 'purple'
  }
]

export default function OnboardingModal({ onComplete, username }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  // Auto-advance steps (3 seconds each)
  useEffect(() => {
    if (isExiting) return

    const timer = setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        // Auto-complete on last step
        handleComplete()
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [currentStep, isExiting])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    setIsExiting(true)
    setTimeout(() => {
      onComplete()
    }, 300)
  }

  const handleSkip = () => {
    handleComplete()
  }

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="cyber-card p-8 max-w-lg w-full border-2 border-primary/50 relative overflow-hidden"
          >
            <div className="absolute inset-0 diagonal-stripes opacity-5" />
            <div className="relative z-10">
              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'w-8 bg-primary'
                        : index < currentStep
                        ? 'w-2 bg-primary/50'
                        : 'w-2 bg-muted/30'
                    }`}
                  />
                ))}
              </div>

              {/* Icon */}
              <motion.div
                key={currentStep}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="flex justify-center mb-6"
              >
                <div className={`p-6 rounded-full bg-${currentStepData.color}-500/20 border-2 border-${currentStepData.color}-500/50`}>
                  <Icon 
                    size={48} 
                    weight="duotone" 
                    className={`text-${currentStepData.color}-400`}
                  />
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center mb-8"
              >
                <h2 className="text-3xl font-black uppercase tracking-wider text-primary mb-4">
                  {currentStepData.title}
                  {currentStep === 0 && username && (
                    <span className="block text-xl text-cyan-400 mt-2">{username}</span>
                  )}
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {currentStepData.description}
                </p>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground uppercase tracking-wider text-xs"
                >
                  Skip
                </Button>

                <Button
                  onClick={handleNext}
                  className="flex-1 bg-primary/20 hover:bg-primary/30 border-2 border-primary text-primary
                           uppercase tracking-wider font-bold jagged-corner"
                >
                  {currentStep < steps.length - 1 ? (
                    <>
                      Next
                      <ArrowRight size={16} weight="bold" className="ml-2" />
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} weight="fill" className="mr-2" />
                      Get Started
                    </>
                  )}
                </Button>
              </div>

              {/* Progress Text */}
              <p className="text-center text-xs text-muted-foreground mt-6 uppercase tracking-wider">
                Step {currentStep + 1} of {steps.length} • Auto-advancing in 3 seconds
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

