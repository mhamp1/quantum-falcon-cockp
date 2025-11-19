// INTERACTIVE TOUR: Forces user actions, fixed card, dummy-proof — November 19, 2025

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle, Warning, Play, TrendUp, Lightning, Code, Vault as VaultIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useKVSafe } from '@/hooks/useKVFallback';
import confetti from 'canvas-confetti';
import { useIsMobile } from '@/hooks/use-mobile';

interface InteractiveTourStep {
  id: string;
  title: string;
  instruction: string;
  targetTab?: string;
  targetSelector?: string;
  actionType: 'click' | 'hover' | 'drag' | 'navigate' | 'none';
  actionTarget?: string;
  actionValidation?: (value?: any) => boolean;
  arrowDirection?: 'up' | 'down' | 'left' | 'right';
  hint?: string;
}

const INTERACTIVE_STEPS: InteractiveTourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Quantum Falcon',
    instruction: 'The most powerful AI trading cockpit ever built. Let\'s get you set up in 60 seconds.',
    actionType: 'none',
  },
  {
    id: 'dashboard-stats',
    title: 'Your Command Center',
    instruction: 'Click any stat card to see what we\'re tracking',
    targetTab: 'dashboard',
    targetSelector: '.stats-grid',
    actionType: 'click',
    actionTarget: '.stat-card',
    arrowDirection: 'up',
    hint: 'Click any of the four stat cards above',
  },
  {
    id: 'neural-forecast',
    title: 'Neural Forecast Engine',
    instruction: 'Hover over the confidence bar to see AI predictions',
    targetTab: 'dashboard',
    targetSelector: '.neural-forecast-card',
    actionType: 'hover',
    actionTarget: '.confidence-bar',
    arrowDirection: 'up',
    hint: 'Move your mouse over the green confidence bar',
  },
  {
    id: 'quick-actions',
    title: 'Start Your Bot',
    instruction: 'Click the "Start Bot" button to activate paper trading',
    targetTab: 'dashboard',
    targetSelector: '.quick-actions',
    actionType: 'click',
    actionTarget: '[data-action="start-bot"]',
    arrowDirection: 'up',
    hint: 'Click the Start Bot button above',
  },
  {
    id: 'aggression-control',
    title: 'Risk Management',
    instruction: 'Drag the slider to 50 or higher (Moderate risk)',
    targetTab: 'multi-agent',
    targetSelector: '.aggression-control',
    actionType: 'drag',
    actionTarget: '[role="slider"]',
    actionValidation: (value) => value >= 50,
    arrowDirection: 'up',
    hint: 'Drag the slider to at least 50',
  },
  {
    id: 'strategy-builder',
    title: 'Build Strategies',
    instruction: 'Click the "Full Monaco Editor" card',
    targetTab: 'strategy-builder',
    targetSelector: '.strategy-hero',
    actionType: 'click',
    actionTarget: '[data-card="monaco-editor"]',
    arrowDirection: 'up',
    hint: 'Click the Full Monaco Editor card',
  },
  {
    id: 'trading-hub',
    title: 'Trading Strategies',
    instruction: 'Click the "DCA Basic" strategy card',
    targetTab: 'trading',
    targetSelector: '.strategy-cards',
    actionType: 'click',
    actionTarget: '[data-strategy="dca-basic"]',
    arrowDirection: 'up',
    hint: 'Click the DCA Basic card',
  },
  {
    id: 'vault',
    title: 'Your Vault',
    instruction: 'Click the "Deposit BTC" button',
    targetTab: 'vault',
    targetSelector: '.vault-balance',
    actionType: 'click',
    actionTarget: '[data-action="deposit-btc"]',
    arrowDirection: 'up',
    hint: 'Click the Deposit BTC button',
  },
  {
    id: 'complete',
    title: 'You\'re Ready. The Falcon Is Hunting. 🚀',
    instruction: 'Your AI agents are live. Let it cook.',
    actionType: 'none',
  },
];

interface InteractiveOnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
  setActiveTab: (tab: string) => void;
}

export default function InteractiveOnboardingTour({
  isOpen,
  onComplete,
  onSkip,
  setActiveTab,
}: InteractiveOnboardingTourProps) {
  const isMobile = useIsMobile();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [actionCompleted, setActionCompleted] = useState(false);
  const [showLegalScreen, setShowLegalScreen] = useState(true);
  const [hasAcknowledgedLegal, setHasAcknowledgedLegal] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const [tourProgress, setTourProgress] = useKVSafe<number>('tour-progress', 0);
  const actionTargetRef = useRef<HTMLElement | null>(null);

  const currentStep = INTERACTIVE_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === INTERACTIVE_STEPS.length - 1;

  const updateSpotlight = useCallback(() => {
    if (!currentStep.targetSelector) {
      setSpotlightRect(null);
      return;
    }

    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setSpotlightRect(rect);
    } else {
      setSpotlightRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isOpen || showLegalScreen) return;

    if (currentStep.targetTab) {
      setActiveTab(currentStep.targetTab);
    }

    const timer = setTimeout(() => {
      updateSpotlight();
      
      if (currentStep.actionTarget) {
        const targetElement = document.querySelector(currentStep.actionTarget) as HTMLElement;
        actionTargetRef.current = targetElement;
        
        if (targetElement) {
          attachActionListeners(targetElement);
        }
      }
    }, 500);

    window.addEventListener('resize', updateSpotlight);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateSpotlight);
      if (actionTargetRef.current) {
        detachActionListeners(actionTargetRef.current);
      }
    };
  }, [currentStep, isOpen, showLegalScreen, setActiveTab, updateSpotlight]);

  const attachActionListeners = (element: HTMLElement) => {
    if (currentStep.actionType === 'click') {
      element.addEventListener('click', handleActionClick);
      element.style.cursor = 'pointer';
      element.style.position = 'relative';
      element.style.zIndex = '10001';
    } else if (currentStep.actionType === 'hover') {
      element.addEventListener('mouseenter', handleActionHover);
      element.style.cursor = 'pointer';
      element.style.zIndex = '10001';
    } else if (currentStep.actionType === 'drag') {
      element.addEventListener('input', handleActionDrag);
      element.addEventListener('change', handleActionDrag);
      element.style.zIndex = '10001';
    }
  };

  const detachActionListeners = (element: HTMLElement) => {
    element.removeEventListener('click', handleActionClick);
    element.removeEventListener('mouseenter', handleActionHover);
    element.removeEventListener('input', handleActionDrag);
    element.removeEventListener('change', handleActionDrag);
    element.style.zIndex = '';
  };

  const handleActionClick = () => {
    setActionCompleted(true);
  };

  const handleActionHover = () => {
    setActionCompleted(true);
  };

  const handleActionDrag = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const value = parseFloat(target.value || target.getAttribute('aria-valuenow') || '0');
    
    if (currentStep.actionValidation) {
      if (currentStep.actionValidation(value)) {
        setActionCompleted(true);
      }
    } else {
      setActionCompleted(true);
    }
  };

  const handleNext = () => {
    if (currentStepIndex < INTERACTIVE_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setActionCompleted(false);
      setTourProgress(currentStepIndex + 1);
    } else {
      triggerConfetti();
      setTimeout(() => {
        onComplete();
        setTourProgress(INTERACTIVE_STEPS.length);
      }, 1000);
    }
  };

  const handleSkipTour = () => {
    onSkip();
    setTourProgress(INTERACTIVE_STEPS.length);
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

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
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
                  I have read and agree to the{' '}
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('open-legal-risk-disclosure'))}
                    className="text-primary underline hover:text-primary/80"
                  >
                    Terms of Service
                  </button>
                  {' '}and{' '}
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-legal-risk-disclosure'))}
                    className="text-primary underline hover:text-primary/80"
                  >
                    Risk Disclosure
                  </button>
                  . I understand that trading involves risk of loss and Quantum Falcon does not guarantee profits.
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSkipTour}
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

  const canProceed = isFirstStep || isLastStep || currentStep.actionType === 'none' || actionCompleted;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9998]"
        style={{ pointerEvents: 'none' }}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

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
              border: '2px solid rgba(0, 255, 255, 0.5)',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          />
        )}

        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: isMobile ? -20 : 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: isMobile ? -20 : 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={cn(
            'fixed z-[10000] cyber-card backdrop-blur-xl',
            isMobile
              ? 'top-4 left-4 right-4'
              : 'bottom-8 left-1/2 -translate-x-1/2 max-w-2xl w-full mx-4'
          )}
          style={{
            pointerEvents: 'auto',
            boxShadow: '0 0 40px rgba(0, 255, 255, 0.2), 0 0 80px rgba(153, 69, 255, 0.1)',
          }}
        >
          <div className="relative p-6 space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-t-lg">
              <motion.div
                className="h-full bg-white/30 rounded-t-lg"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStepIndex + 1) / INTERACTIVE_STEPS.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {!isFirstStep && !isLastStep && (
              <button
                onClick={handleSkipTour}
                className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors z-10"
              >
                <X size={20} className="text-muted-foreground hover:text-foreground" />
              </button>
            )}

            <div className="space-y-4 pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {isFirstStep || isLastStep ? (
                    <h2
                      className="text-3xl sm:text-4xl font-black uppercase tracking-tight"
                      style={{
                        background: 'linear-gradient(135deg, #00FFFF, #DC1FFF, #FF00FF)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 0 6px rgba(0, 255, 255, 0.3))',
                      }}
                    >
                      {currentStep.title}
                    </h2>
                  ) : (
                    <h2
                      className="text-2xl font-bold uppercase tracking-wide text-primary"
                      style={{ textShadow: '0 0 6px rgba(0,255,255,0.3)' }}
                    >
                      {currentStep.title}
                    </h2>
                  )}

                  <p className="text-base text-foreground/90 leading-relaxed">
                    {currentStep.instruction}
                  </p>

                  {currentStep.hint && !actionCompleted && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg"
                    >
                      <ArrowRight size={16} className="text-primary animate-pulse" />
                      <span className="text-sm text-primary font-semibold">{currentStep.hint}</span>
                    </motion.div>
                  )}

                  {actionCompleted && !isFirstStep && !isLastStep && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg"
                    >
                      <CheckCircle size={20} weight="fill" className="text-primary" />
                      <span className="text-sm text-primary font-bold uppercase">Action Complete! Click Next →</span>
                    </motion.div>
                  )}
                </div>

                {!isFirstStep && !isLastStep && (
                  <div className="text-sm font-bold text-primary uppercase tracking-wider">
                    {currentStepIndex + 1}/{INTERACTIVE_STEPS.length}
                  </div>
                )}
              </div>

              {!isFirstStep && !isLastStep && (
                <div className="flex items-center gap-2">
                  {INTERACTIVE_STEPS.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        index === currentStepIndex
                          ? 'w-8 bg-primary'
                          : index < currentStepIndex
                          ? 'w-2 bg-primary/50'
                          : 'w-2 bg-border'
                      )}
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {isFirstStep && (
                  <>
                    <Button
                      onClick={handleSkipTour}
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
                      style={{ boxShadow: '0 0 20px rgba(0,255,255,0.3)' }}
                    >
                      Start Interactive Tour
                      <Play size={20} weight="fill" className="ml-2" />
                    </Button>
                  </>
                )}

                {!isFirstStep && !isLastStep && (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed}
                    size="lg"
                    className={cn(
                      'flex-1 transition-all duration-300',
                      canProceed
                        ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90'
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    )}
                    style={{
                      boxShadow: canProceed ? '0 0 20px rgba(0,255,255,0.3)' : 'none',
                    }}
                  >
                    {canProceed ? (
                      <>
                        Next Step
                        <ArrowRight size={20} weight="bold" className="ml-2" />
                      </>
                    ) : (
                      <>
                        Complete Action Above
                        <Lightning size={20} weight="fill" className="ml-2 animate-pulse" />
                      </>
                    )}
                  </Button>
                )}

                {isLastStep && (
                  <Button
                    onClick={handleNext}
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg font-bold uppercase tracking-wider"
                    style={{ boxShadow: '0 0 30px rgba(0,255,255,0.4)' }}
                  >
                    Launch Bot & Start Earning
                    <CheckCircle size={24} weight="fill" className="ml-2" />
                  </Button>
                )}
              </div>

              {!isFirstStep && !isLastStep && (
                <div className="flex items-center justify-between text-xs pt-2 border-t border-border/30">
                  <span className="text-muted-foreground uppercase tracking-wider">
                    Step {currentStepIndex + 1} of {INTERACTIVE_STEPS.length}
                  </span>
                  <button
                    onClick={handleSkipTour}
                    className="text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors"
                  >
                    Skip Tour
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {currentStep.arrowDirection && spotlightRect && (
          <motion.svg
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute z-[9999] pointer-events-none"
            style={{
              left: spotlightRect.left + spotlightRect.width / 2 - 20,
              top: isMobile ? spotlightRect.bottom + 80 : spotlightRect.top - 80,
              width: 40,
              height: 60,
            }}
            viewBox="0 0 40 60"
          >
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <motion.path
              d={isMobile ? 'M20 0 L20 40 L10 30 M20 40 L30 30' : 'M20 60 L20 20 L10 30 M20 20 L30 30'}
              stroke="#00FFFF"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              animate={{
                y: isMobile ? [0, -5, 0] : [0, 5, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.svg>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
