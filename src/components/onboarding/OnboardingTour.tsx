import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, CheckCircle, Warning } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetTab?: string;
  spotlightSelector?: string;
  spotlightOffset?: { top?: number; left?: number; right?: number; bottom?: number };
  position?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Quantum Falcon',
    description: 'The most powerful AI trading cockpit ever built. Let\'s get you printing money in 60 seconds.',
    position: 'center',
  },
  {
    id: 'dashboard',
    title: 'Your Command Center',
    description: 'This is your command center. Watch your portfolio grow in real-time — even in Paper Mode (no real money).',
    targetTab: 'dashboard',
    spotlightSelector: '.stats-grid',
    position: 'bottom',
  },
  {
    id: 'neural-forecast',
    title: 'Neural Forecast Engine',
    description: 'Our AI predicts the next hour with up to 92% confidence. Green = buy signal, Red = caution.',
    targetTab: 'dashboard',
    spotlightSelector: '.neural-forecast-card',
    position: 'bottom',
  },
  {
    id: 'aggression',
    title: 'Bot Aggression Control',
    description: 'Start on Moderate (50). Cautious = capital preservation. Aggressive = max gains (higher risk). You control everything.',
    targetTab: 'multi-agent',
    spotlightSelector: '.aggression-control',
    position: 'top',
  },
  {
    id: 'quick-actions',
    title: 'Quick Actions',
    description: 'One-tap to start bot, check vault, or upgrade. You\'re 3 clicks from live trading.',
    targetTab: 'dashboard',
    spotlightSelector: '.quick-actions',
    position: 'bottom',
  },
  {
    id: 'strategy-builder',
    title: 'Strategy Builder',
    description: 'Create god-tier strategies with full Monaco editor, real-time backtesting, and one-click sharing. Free tier included.',
    targetTab: 'strategy-builder',
    spotlightSelector: '.strategy-hero',
    position: 'bottom',
  },
  {
    id: 'trading-hub',
    title: 'Trading Hub',
    description: 'DCA Basic is free forever. Unlock more with Pro+ →',
    targetTab: 'trading',
    spotlightSelector: '.strategy-cards',
    position: 'bottom',
  },
  {
    id: 'vault',
    title: 'Your Vault',
    description: 'Your profits auto-convert to BTC and are secured here. Zero fees. Instant access.',
    targetTab: 'vault',
    spotlightSelector: '.vault-balance',
    position: 'bottom',
  },
  {
    id: 'final',
    title: 'You\'re Ready. The Bot Is Thinking.',
    description: 'Let it cook. 🔥',
    position: 'center',
  },
];

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  setActiveTab: (tab: string) => void;
}

export default function OnboardingTour({ isOpen, onComplete, onSkip, setActiveTab }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(true);
  const [hasAcknowledgedLegal, setHasAcknowledgedLegal] = useState(false);
  const [showLegalScreen, setShowLegalScreen] = useState(true);

  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  useEffect(() => {
    if (!isOpen) return;

    if (step.targetTab) {
      setActiveTab(step.targetTab);
    }

    const updateSpotlight = () => {
      if (step.spotlightSelector) {
        const element = document.querySelector(step.spotlightSelector);
        if (element) {
          const rect = element.getBoundingClientRect();
          setSpotlightRect(rect);
        } else {
          setSpotlightRect(null);
        }
      } else {
        setSpotlightRect(null);
      }
    };

    const timer = setTimeout(updateSpotlight, 300);
    window.addEventListener('resize', updateSpotlight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSpotlight);
    };
  }, [step, isOpen, setActiveTab]);

  const handleNext = () => {
    if (isLastStep) {
      triggerConfetti();
      setTimeout(() => {
        onComplete();
      }, 1000);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleCompleteLegal = () => {
    if (hasAcknowledgedLegal) {
      setShowLegalScreen(false);
    }
  };

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const getCardPosition = () => {
    if (!spotlightRect) return {};

    const padding = 24;
    const cardWidth = 480;
    const cardHeight = 280;

    switch (step.position) {
      case 'top':
        return {
          top: `${Math.max(padding, spotlightRect.top - cardHeight - padding)}px`,
          left: `${Math.min(window.innerWidth - cardWidth - padding, Math.max(padding, spotlightRect.left + spotlightRect.width / 2 - cardWidth / 2))}px`,
        };
      case 'bottom':
        return {
          top: `${Math.min(window.innerHeight - cardHeight - padding, spotlightRect.bottom + padding)}px`,
          left: `${Math.min(window.innerWidth - cardWidth - padding, Math.max(padding, spotlightRect.left + spotlightRect.width / 2 - cardWidth / 2))}px`,
        };
      case 'left':
        return {
          top: `${Math.min(window.innerHeight - cardHeight - padding, Math.max(padding, spotlightRect.top + spotlightRect.height / 2 - cardHeight / 2))}px`,
          left: `${Math.max(padding, spotlightRect.left - cardWidth - padding)}px`,
        };
      case 'right':
        return {
          top: `${Math.min(window.innerHeight - cardHeight - padding, Math.max(padding, spotlightRect.top + spotlightRect.height / 2 - cardHeight / 2))}px`,
          left: `${Math.min(window.innerWidth - cardWidth - padding, spotlightRect.right + padding)}px`,
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  if (!isOpen) return null;

  if (showLegalScreen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-2xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-w-3xl w-full mx-4 p-8 glass-morph-card"
          >
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-destructive/10 border border-destructive/30">
                  <Warning size={48} weight="fill" className="text-destructive" />
                </div>
              </div>

              <div className="space-y-3">
                <h1 
                  className="text-4xl font-black uppercase tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #00FFFF, #DC1FFF, #FF00FF)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 6px rgba(0, 255, 255, 0.3))',
                  }}
                >
                  Before We Begin
                </h1>
                <p className="text-lg text-muted-foreground uppercase tracking-wide">
                  Important Legal Requirements
                </p>
              </div>

              <div className="space-y-4 text-left max-h-[50vh] overflow-y-auto scrollbar-thin p-6 bg-muted/20 rounded-xl border border-border/50">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-destructive uppercase tracking-wide flex items-center gap-2">
                    <Warning size={16} weight="fill" />
                    Risk Disclosure
                  </h3>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    Trading cryptocurrency and leveraged instruments involves substantial risk of loss and is not suitable for all investors. 
                    Past performance is not indicative of future results. You may lose some or all of your invested capital. 
                    Quantum Falcon is a software tool that provides trading signals and automation — it does NOT guarantee profits.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle size={16} weight="fill" />
                    Terms of Service
                  </h3>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    By using Quantum Falcon, you agree to our Terms of Service. You acknowledge that:
                  </p>
                  <ul className="text-xs text-foreground/80 space-y-1.5 list-disc list-inside pl-4">
                    <li>You are 18+ years old and legally able to trade in your jurisdiction</li>
                    <li>You understand the risks of algorithmic trading and leverage</li>
                    <li>You will not hold Quantum Falcon liable for trading losses</li>
                    <li>You are responsible for your own tax reporting and compliance</li>
                    <li>You will use Paper Mode before risking real capital</li>
                    <li>You accept that past backtests do not guarantee future performance</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-secondary uppercase tracking-wide">
                    Financial Disclaimer
                  </h3>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    Quantum Falcon is not a registered investment advisor, broker-dealer, or financial institution. 
                    We provide software tools only. You are solely responsible for your trading decisions. 
                    Consult a licensed financial advisor before trading with real capital.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <Checkbox
                  id="legal-acknowledgment"
                  checked={hasAcknowledgedLegal}
                  onCheckedChange={(checked) => setHasAcknowledgedLegal(checked as boolean)}
                  className="mt-1"
                />
                <label
                  htmlFor="legal-acknowledgment"
                  className="text-sm text-foreground cursor-pointer leading-relaxed"
                >
                  I have read and agree to the <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-legal-risk-disclosure'))}
                    className="text-primary underline hover:text-primary/80"
                  >
                    Terms of Service
                  </button> and <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-legal-risk-disclosure'))}
                    className="text-primary underline hover:text-primary/80"
                  >
                    Risk Disclosure
                  </button>. I understand that trading involves risk of loss and Quantum Falcon does not guarantee profits.
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  Decline & Exit
                </Button>
                <Button
                  onClick={handleCompleteLegal}
                  disabled={!hasAcknowledgedLegal}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  style={{
                    boxShadow: hasAcknowledgedLegal ? '0 0 20px rgba(0,255,255,0.3)' : 'none',
                  }}
                >
                  Accept & Continue to Tour
                  <ArrowRight size={20} weight="bold" className="ml-2" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                You can review these agreements anytime in Settings → Legal
              </p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998]"
        style={{ pointerEvents: 'none' }}
      >
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />

        {spotlightRect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute"
            style={{
              top: spotlightRect.top - 8,
              left: spotlightRect.left - 8,
              width: spotlightRect.width + 16,
              height: spotlightRect.height + 16,
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 40px 10px rgba(0, 255, 255, 0.3)',
              borderRadius: '12px',
              border: '2px solid rgba(0, 255, 255, 0.4)',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          />
        )}

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            'absolute glass-morph-card p-8 max-w-[90vw] sm:max-w-lg',
            isFirstStep || isLastStep ? 'w-full max-w-2xl' : ''
          )}
          style={{
            ...getCardPosition(),
            pointerEvents: 'auto',
            zIndex: 10000,
          }}
        >
          {!isFirstStep && !isLastStep && (
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X size={20} className="text-muted-foreground hover:text-foreground" />
            </button>
          )}

          <div className="space-y-6">
            <div className="space-y-3">
              {isFirstStep ? (
                <h2
                  className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-center"
                  style={{
                    background: 'linear-gradient(135deg, #00FFFF, #DC1FFF, #FF00FF)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 6px rgba(0, 255, 255, 0.3))',
                  }}
                >
                  {step.title}
                </h2>
              ) : isLastStep ? (
                <h2
                  className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-center"
                  style={{
                    textShadow: '0 0 6px rgba(0,255,255,0.3)',
                    color: '#e0e0ff',
                  }}
                >
                  {step.title}
                </h2>
              ) : (
                <h2
                  className="text-2xl font-bold uppercase tracking-wide"
                  style={{
                    textShadow: '0 0 6px rgba(0,255,255,0.3)',
                    color: '#e0e0ff',
                  }}
                >
                  {step.title}
                </h2>
              )}

              <p
                className={cn(
                  'text-muted-foreground leading-relaxed',
                  isFirstStep || isLastStep ? 'text-center text-lg' : 'text-base'
                )}
              >
                {step.description}
              </p>
            </div>

            {!isFirstStep && !isLastStep && (
              <div className="flex items-center justify-center gap-2">
                {TOUR_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-2 rounded-full transition-all duration-300',
                      index === currentStep
                        ? 'w-8 bg-primary'
                        : index < currentStep
                        ? 'w-2 bg-primary/50'
                        : 'w-2 bg-border'
                    )}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              {!isFirstStep && !isLastStep && (
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  <ArrowLeft size={20} weight="bold" className="mr-2" />
                  Previous
                </Button>
              )}

              {isFirstStep && (
                <>
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    Skip Tour
                  </Button>
                  <Button
                    onClick={handleNext}
                    size="lg"
                    className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                    style={{
                      boxShadow: '0 0 20px rgba(0,255,255,0.3)',
                    }}
                  >
                    Start Tour
                    <ArrowRight size={20} weight="bold" className="ml-2" />
                  </Button>
                </>
              )}

              {!isFirstStep && !isLastStep && (
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  style={{
                    boxShadow: '0 0 20px rgba(0,255,255,0.3)',
                  }}
                >
                  Next
                  <ArrowRight size={20} weight="bold" className="ml-2" />
                </Button>
              )}

              {isLastStep && (
                <div className="w-full space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <Checkbox
                      id="dont-show-again"
                      checked={dontShowAgain}
                      onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
                    />
                    <label
                      htmlFor="dont-show-again"
                      className="text-sm text-foreground cursor-pointer"
                    >
                      Don't show this again
                    </label>
                  </div>

                  <Button
                    onClick={handleNext}
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg font-bold uppercase tracking-wider"
                    style={{
                      boxShadow: '0 0 30px rgba(0,255,255,0.4)',
                    }}
                  >
                    Start Earning
                    <CheckCircle size={24} weight="fill" className="ml-2" />
                  </Button>
                </div>
              )}
            </div>

            {!isFirstStep && !isLastStep && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground uppercase tracking-wider">
                  Step {currentStep + 1} of {TOUR_STEPS.length}
                </span>
                <button
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors"
                >
                  Skip Tour
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
