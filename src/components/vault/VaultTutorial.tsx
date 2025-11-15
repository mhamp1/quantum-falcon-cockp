import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ArrowRight, CheckCircle, ShieldCheck, ArrowsClockwise, Vault, Lightning } from '@phosphor-icons/react'

interface VaultTutorialProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const tutorialSteps = [
  {
    title: 'Automated Profit Conversion',
    description: 'When your trading agents execute a profitable Solana trade, the system automatically identifies the profit portion.',
    icon: <Lightning size={48} weight="duotone" className="text-primary" />,
    details: [
      'Trade profit calculated in real-time',
      'Only profits are converted, preserving capital',
      'Configurable profit threshold (default: 5%)'
    ]
  },
  {
    title: 'Secure BTC Conversion',
    description: 'Profits are automatically swapped to Bitcoin using decentralized exchanges with optimal routing.',
    icon: <ArrowsClockwise size={48} weight="duotone" className="text-accent" />,
    details: [
      'Best rate selection across DEXs',
      'Minimal slippage tolerance (0.5%)',
      'MEV protection enabled'
    ]
  },
  {
    title: 'Vault Storage & Security',
    description: 'Converted BTC is stored in your secure vault with military-grade encryption and multi-sig protection.',
    icon: <Vault size={48} weight="duotone" className="text-secondary" />,
    details: [
      'Cold storage integration',
      'Multi-signature wallet support',
      'Insurance coverage available'
    ]
  },
  {
    title: 'Withdrawal & Management',
    description: 'Access your BTC vault anytime. Withdraw to external wallets or reinvest into trading strategies.',
    icon: <ShieldCheck size={48} weight="duotone" className="text-primary" />,
    details: [
      'Instant withdrawal processing',
      'No minimum withdrawal amount',
      'Full transaction history'
    ]
  }
]

export default function VaultTutorial({ open, onOpenChange }: VaultTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onOpenChange(false)
      setCurrentStep(0)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const step = tutorialSteps[currentStep]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="cyber-card border-2 border-primary/50 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold uppercase tracking-wider text-primary hud-text">
            How the BTC Vault Works
          </DialogTitle>
          <DialogDescription className="text-muted-foreground uppercase text-xs tracking-wider">
            Step {currentStep + 1} of {tutorialSteps.length}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="p-6 bg-primary/10 rounded-full border-2 border-primary/30">
              {step.icon}
            </div>

            <div className="space-y-3">
              <h3 className="text-xl font-bold uppercase tracking-wide text-foreground">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                {step.description}
              </p>
            </div>

            <div className="w-full max-w-md space-y-3 pt-4">
              {step.details.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-3 text-left p-3 bg-muted/30 jagged-corner-small">
                  <CheckCircle size={20} weight="fill" className="text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{detail}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-8">
            {tutorialSteps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 transition-all ${
                  idx === currentStep
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t-2 border-primary/30">
          <Button
            onClick={prevStep}
            disabled={currentStep === 0}
            variant="outline"
            className="jagged-corner-small"
          >
            Previous
          </Button>

          <Button
            onClick={nextStep}
            className="jagged-corner-small"
          >
            {currentStep === tutorialSteps.length - 1 ? 'Got It!' : 'Next'}
            <ArrowRight size={18} weight="bold" className="ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
