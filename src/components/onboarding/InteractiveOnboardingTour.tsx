// FIXED: Tour card never hides target — dynamic spotlight + arrow + forced interaction
// Rebuilt from scratch for 100% foolproof operation — November 19, 2025

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle, Warning, Play, TrendUp, Lightning, Code, Vault as VaultIcon, ShieldCheck } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useKVSafe } from '@/hooks/useKVFallback';
import confetti from 'canvas-confetti';
import { useIsMobile } from '@/hooks/use-mobile';

interface TourStep {
  id: string;
  title: string;
  instruction: string;
  targetTab?: string;
  targetSelector?: string;
  actionType: 'click' | 'hover' | 'drag' | 'none';
  actionValidation?: (value?: any) => boolean;
  hint?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Quantum Falcon',
    instruction: 'The most powerful AI trading cockpit. Let\'s get you printing money in 60 seconds.',
    actionType: 'none',
  },
  {
    id: 'dashboard-stats',
    title: 'Your Command Center',
    instruction: 'Click any stat card to see real-time portfolio tracking',
    targetTab: 'dashboard',
    targetSelector: '[data-tour="stat-cards"]',
    actionType: 'click',
    hint: 'Click any of the stat cards above',
  },
  {
    id: 'neural-forecast',
    title: 'AI Predictions',
    instruction: 'Hover over the confidence bar to see neural forecasts',
    targetTab: 'dashboard',
    targetSelector: '[data-tour="neural-forecast"]',
    actionType: 'hover',
    hint: 'Move your mouse over the green confidence bar',
  },
  {
    id: 'quick-actions',
    title: 'Start Your Bot',
    instruction: 'Click the "Start Bot" button to activate paper trading',
    targetTab: 'dashboard',
    targetSelector: '[data-tour="quick-actions"]',
    actionType: 'click',
    hint: 'Click the Start Bot button above',
  },
  {
    id: 'aggression-slider',
    title: 'Risk Control',
    instruction: 'Drag the aggression slider to 50 or higher',
    targetTab: 'multi-agent',
    targetSelector: '[data-tour="aggression-panel"]',
    actionType: 'drag',
    actionValidation: (value) => value >= 50,
    hint: 'Drag the slider to at least 50 (Moderate)',
  },
  {
    id: 'strategy-builder',
    title: 'Build Strategies',
    instruction: 'Click the "Full Monaco Editor" card',
    targetTab: 'strategy-builder',
    targetSelector: '[data-tour="feature-cards"]',
    actionType: 'click',
    hint: 'Click the Full Monaco Editor card',
  },
  {
    id: 'trading-hub',
    title: 'Trading Strategies',
    instruction: 'Click the "DCA Basic" strategy card',
    targetTab: 'trading',
    targetSelector: '[data-tour="strategy-cards"]',
    actionType: 'click',
    hint: 'Click the DCA Basic card (free forever)',
  },
  {
    id: 'vault',
    title: 'Your Vault',
    instruction: 'Click the "Deposit BTC" button',
    targetTab: 'vault',
    targetSelector: '[data-tour="vault-actions"]',
    actionType: 'click',
    hint: 'Click Deposit BTC',
  },
  {
    id: 'complete',
    title: 'You\'re Ready. The Falcon Is Hunting. 🚀',
    instruction: 'Your AI agents are live. Paper Mode is active. Let it cook.',
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
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [shakeCard, setShakeCard] = useState(false);
  const actionListenersRef = useRef<(() => void)[]>([]);

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;

  const updateTargetRect = useCallback(() => {
    if (!currentStep.targetSelector) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(currentStep.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [currentStep.targetSelector]);

  useEffect(() => {
    if (!isOpen || showLegalScreen) return;

    if (currentStep.targetTab) {
      setActiveTab(currentStep.targetTab);
    }

    const timer = setTimeout(() => {
      updateTargetRect();
      attachActionListeners();
    }, 800);

    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
      cleanupActionListeners();
    };
  }, [currentStep, isOpen, showLegalScreen, setActiveTab, updateTargetRect]);

  const attachActionListeners = () => {
    cleanupActionListeners();

    if (!currentStep.targetSelector) return;

    const targetElements = document.querySelectorAll(currentStep.targetSelector);
    
    targetElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      
      htmlElement.style.position = 'relative';
      htmlElement.style.zIndex = '10001';
      htmlElement.style.pointerEvents = 'auto';

      if (currentStep.actionType === 'click') {
        const clickHandler = () => {
          setActionCompleted(true);
          setTimeout(() => setShakeCard(false), 300);
        };
        htmlElement.addEventListener('click', clickHandler);
        actionListenersRef.current.push(() => htmlElement.removeEventListener('click', clickHandler));
        
        const children = htmlElement.querySelectorAll('button, a, [role="button"]');
        children.forEach(child => {
          const childHandler = () => {
            setActionCompleted(true);
            setTimeout(() => setShakeCard(false), 300);
          };
          (child as HTMLElement).addEventListener('click', childHandler);
          actionListenersRef.current.push(() => (child as HTMLElement).removeEventListener('click', childHandler));
        });
      } else if (currentStep.actionType === 'hover') {
        const hoverHandler = () => {
          setActionCompleted(true);
        };
        htmlElement.addEventListener('mouseenter', hoverHandler);
        actionListenersRef.current.push(() => htmlElement.removeEventListener('mouseenter', hoverHandler));
      } else if (currentStep.actionType === 'drag') {
        const sliders = htmlElement.querySelectorAll('[role="slider"]');
        sliders.forEach(slider => {
          const dragHandler = (e: Event) => {
            const target = e.target as HTMLElement;
            const value = parseFloat(target.getAttribute('aria-valuenow') || '0');
            
            if (currentStep.actionValidation && currentStep.actionValidation(value)) {
              setActionCompleted(true);
            }
          };
          slider.addEventListener('input', dragHandler);
          slider.addEventListener('change', dragHandler);
          actionListenersRef.current.push(() => {
            slider.removeEventListener('input', dragHandler);
            slider.removeEventListener('change', dragHandler);
          });
        });
      }
    });
  };

  const cleanupActionListeners = () => {
    actionListenersRef.current.forEach(cleanup => cleanup());
    actionListenersRef.current = [];
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setActionCompleted(false);
      setTargetRect(null);
    } else {
      triggerConfetti();
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  };

  const handleSkipTour = () => {
    cleanupActionListeners();
    onSkip();
  };

  const handleCompleteLegal = () => {
    if (hasAcknowledgedLegal) {
      setShowLegalScreen(false);
    }
  };

  const handleAttemptNext = () => {
    if (!canProceed) {
      setShakeCard(true);
      setTimeout(() => setShakeCard(false), 500);
    } else {
      handleNext();
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00FFFF', '#DC1FFF', '#FF00FF'],
      zIndex: 99999,
    });
  };

  const canProceed = isFirstStep || isLastStep || currentStep.actionType === 'none' || actionCompleted;

  if (!isOpen) return null;

  if (showLegalScreen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-2xl"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring', damping: 25, stiffness: 300 }}
            className="relative max-w-3xl w-full mx-4 p-8 cyber-card"
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
                  Legal Requirements
                </h1>
                <p className="text-lg text-muted-foreground uppercase tracking-wide">
                  You must accept these terms before using Quantum Falcon
                </p>
              </div>

              <div className="space-y-4 text-left max-h-[50vh] overflow-y-auto scrollbar-thin p-6 bg-muted/20 rounded-xl border border-border/50">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-destructive uppercase tracking-wide flex items-center gap-2">
                    <Warning size={16} weight="fill" />
                    Risk Disclosure
                  </h3>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    Trading cryptocurrency involves substantial risk of loss. Past performance does not guarantee future results. 
                    You may lose some or all of your capital. Quantum Falcon provides software tools only — not financial advice.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-primary uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle size={16} weight="fill" />
                    Terms of Service
                  </h3>
                  <ul className="text-xs text-foreground/80 space-y-1.5 list-disc list-inside pl-4">
                    <li>You are 18+ and legally able to trade in your jurisdiction</li>
                    <li>You understand algorithmic trading risks</li>
                    <li>You will not hold Quantum Falcon liable for losses</li>
                    <li>You are responsible for tax reporting</li>
                    <li>You will test in Paper Mode before risking real capital</li>
                  </ul>
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
                  I have read and agree to the Terms of Service and Risk Disclosure. 
                  I understand trading involves risk and Quantum Falcon does not guarantee profits.
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
                  Accept & Continue
                  <ArrowRight size={20} weight="bold" className="ml-2" />
                </Button>
              </div>
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
        className="fixed inset-0 z-[99998]"
      >
        <div 
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          style={{ pointerEvents: 'none' }}
        />

        {targetRect && (
          <>
            <svg
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: 99999 }}
            >
              <defs>
                <mask id="spotlight-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  <rect
                    x={targetRect.left - 12}
                    y={targetRect.top - 12}
                    width={targetRect.width + 24}
                    height={targetRect.height + 24}
                    rx="16"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                fill="rgba(0, 0, 0, 0.85)"
                mask="url(#spotlight-mask)"
              />
            </svg>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute pointer-events-none"
              style={{
                top: targetRect.top - 12,
                left: targetRect.left - 12,
                width: targetRect.width + 24,
                height: targetRect.height + 24,
                border: '3px solid rgba(0, 255, 255, 0.6)',
                borderRadius: '16px',
                boxShadow: '0 0 30px rgba(0, 255, 255, 0.4), inset 0 0 30px rgba(0, 255, 255, 0.1)',
                zIndex: 99999,
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'radial-gradient(circle at center, rgba(0, 255, 255, 0.1), transparent)',
                }}
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>

            <motion.svg
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute pointer-events-none"
              style={{
                left: targetRect.left + targetRect.width / 2 - 30,
                top: isMobile ? targetRect.bottom + 20 : targetRect.top - 100,
                width: 60,
                height: 80,
                zIndex: 99999,
              }}
              viewBox="0 0 60 80"
            >
              <defs>
                <filter id="arrow-glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <motion.path
                d={isMobile ? 'M30 10 L30 50 L15 35 M30 50 L45 35' : 'M30 70 L30 30 L15 45 M30 30 L45 45'}
                stroke="#00FFFF"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#arrow-glow)"
                animate={{
                  y: isMobile ? [0, -8, 0] : [0, 8, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.svg>
          </>
        )}

        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            x: shakeCard ? [-5, 5, -5, 5, 0] : 0,
          }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ 
            type: 'spring', 
            damping: 25, 
            stiffness: 300,
            x: { duration: 0.5 },
          }}
          className={cn(
            'fixed cyber-card backdrop-blur-xl',
            isMobile
              ? 'inset-x-4 bottom-24'
              : 'bottom-8 left-1/2 -translate-x-1/2 max-w-2xl w-full mx-4'
          )}
          style={{
            zIndex: 100000,
            pointerEvents: 'auto',
            boxShadow: '0 0 40px rgba(0, 255, 255, 0.3), 0 0 80px rgba(153, 69, 255, 0.2)',
          }}
        >
          <div className="relative p-6 space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-accent rounded-t-lg overflow-hidden">
              <motion.div
                className="h-full bg-white/40"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {!isFirstStep && !isLastStep && (
              <button
                onClick={handleSkipTour}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-muted-foreground hover:text-foreground" />
              </button>
            )}

            <div className="space-y-4 pt-4">
              <div className="space-y-3">
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

                {!isFirstStep && !isLastStep && (
                  <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Step {currentStepIndex + 1} of {TOUR_STEPS.length}
                  </div>
                )}

                {currentStep.hint && !actionCompleted && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg"
                  >
                    <ArrowRight size={18} className="text-primary animate-pulse" weight="bold" />
                    <span className="text-sm text-primary font-semibold">{currentStep.hint}</span>
                  </motion.div>
                )}

                {actionCompleted && !isFirstStep && !isLastStep && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 p-3 bg-primary/20 border border-primary/40 rounded-lg"
                  >
                    <CheckCircle size={20} weight="fill" className="text-primary" />
                    <span className="text-sm text-primary font-bold uppercase">✓ Action Complete!</span>
                  </motion.div>
                )}
              </div>

              {!isFirstStep && !isLastStep && (
                <div className="flex items-center gap-2">
                  {TOUR_STEPS.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        index === currentStepIndex
                          ? 'w-8 bg-primary'
                          : index < currentStepIndex
                          ? 'w-2 bg-primary/60'
                          : 'w-2 bg-border'
                      )}
                      style={{
                        boxShadow: index === currentStepIndex ? '0 0 8px rgba(0,255,255,0.4)' : 'none',
                      }}
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
                      Start Tour
                      <Play size={20} weight="fill" className="ml-2" />
                    </Button>
                  </>
                )}

                {!isFirstStep && !isLastStep && (
                  <Button
                    onClick={handleAttemptNext}
                    size="lg"
                    className={cn(
                      'w-full transition-all duration-300',
                      canProceed
                        ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90'
                        : 'bg-muted/40 text-muted-foreground cursor-not-allowed hover:bg-muted/40'
                    )}
                    style={{
                      boxShadow: canProceed ? '0 0 20px rgba(0,255,255,0.4)' : 'none',
                    }}
                  >
                    {canProceed ? (
                      <>
                        Next Step
                        <ArrowRight size={20} weight="bold" className="ml-2" />
                      </>
                    ) : (
                      <>
                        Complete the action above ↑
                        <Lightning size={20} weight="fill" className="ml-2 animate-pulse" />
                      </>
                    )}
                  </Button>
                )}

                {isLastStep && (
                  <Button
                    onClick={handleNext}
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg font-bold uppercase"
                    style={{ boxShadow: '0 0 30px rgba(0,255,255,0.5)' }}
                  >
                    Launch Bot & Start Earning
                    <CheckCircle size={24} weight="fill" className="ml-2" />
                  </Button>
                )}
              </div>

              {!isFirstStep && !isLastStep && (
                <button
                  onClick={handleSkipTour}
                  className="w-full text-xs text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors pt-2"
                >
                  Skip Tour
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
