// FINAL FIX: Tour now shows targets, forces real clicks, never hides elements — dummy-proof forever
// Complete rebuild from ground up — November 19, 2025
// Spotlight actually works, card ALWAYS fixed at bottom, forced interaction detection

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, CheckCircle, Warning, Play, Lightning } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import confetti from 'canvas-confetti';
import { useIsMobile } from '@/hooks/use-mobile';

interface TourStep {
  id: string;
  title: string;
  description: string;
  instruction: string;
  targetTab?: string;
  targetSelector?: string;
  actionType: 'click' | 'hover' | 'drag' | 'none';
  actionValidation?: (value?: any) => boolean;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Quantum Falcon 🚀',
    description: 'The most powerful AI trading cockpit. Let\'s get you printing money in 60 seconds.',
    instruction: 'Click "Start Tour" to begin',
    actionType: 'none',
  },
  {
    id: 'dashboard-stats',
    title: 'Your Command Center',
    description: 'These 4 cards show your money growing in real-time. Click any one to continue →',
    instruction: 'Click any stat card above',
    targetTab: 'dashboard',
    targetSelector: '[data-tour="stat-cards"]',
    actionType: 'click',
  },
  {
    id: 'neural-forecast',
    title: 'AI Neural Predictions',
    description: 'Our AI predicts the next hour with up to 92% confidence. Hover to explore.',
    instruction: 'Hover over the green confidence bar',
    targetTab: 'dashboard',
    targetSelector: '[data-tour="neural-forecast"]',
    actionType: 'hover',
  },
  {
    id: 'quick-actions',
    title: 'One-Click Actions',
    description: 'Start your bot, check vault, or upgrade — you\'re 3 clicks from live trading.',
    instruction: 'Click the "Start Bot" button',
    targetTab: 'dashboard',
    targetSelector: '[data-tour="quick-actions"]',
    actionType: 'click',
  },
  {
    id: 'aggression-control',
    title: 'Bot Aggression Control',
    description: 'Start on Moderate (50). Cautious = safety. Aggressive = max gains. You control everything.',
    instruction: 'Drag the slider to 50 or higher',
    targetTab: 'multi-agent',
    targetSelector: '[data-tour="aggression-panel"]',
    actionType: 'drag',
    actionValidation: (value) => value >= 50,
  },
  {
    id: 'strategy-builder',
    title: 'Build God-Tier Strategies',
    description: 'Full Monaco editor, real-time backtesting, one-click sharing. Free tier included.',
    instruction: 'Click any feature card',
    targetTab: 'strategy-builder',
    targetSelector: '[data-tour="feature-cards"]',
    actionType: 'click',
  },
  {
    id: 'trading-hub',
    title: 'Pre-Built Strategies',
    description: 'DCA Basic is free forever. Unlock whale tracking, liquidity sweeps, and more with Pro+.',
    instruction: 'Click the "DCA Basic" strategy card',
    targetTab: 'trading',
    targetSelector: '[data-tour="strategy-cards"]',
    actionType: 'click',
  },
  {
    id: 'vault',
    title: 'Your Secure Vault',
    description: 'Profits auto-convert to BTC and are secured here. Zero fees. Instant access.',
    instruction: 'Click the "Deposit BTC" button',
    targetTab: 'vault',
    targetSelector: '[data-tour="vault-actions"]',
    actionType: 'click',
  },
  {
    id: 'complete',
    title: 'You\'re Ready. The Falcon Is Hunting. 🔥',
    description: 'Your AI agents are live. Paper Mode is active. Let it cook.',
    instruction: 'Click "Launch Bot" to finish',
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
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const canProceed = isFirstStep || isLastStep || currentStep.actionType === 'none' || actionCompleted;

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

  const cleanupListeners = useCallback(() => {
    cleanupFunctionsRef.current.forEach(cleanup => cleanup());
    cleanupFunctionsRef.current = [];
  }, []);

  const attachActionListeners = useCallback(() => {
    cleanupListeners();

    if (!currentStep.targetSelector || currentStep.actionType === 'none') return;

    const targetElements = document.querySelectorAll(currentStep.targetSelector);
    
    targetElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      
      htmlElement.style.position = 'relative';
      htmlElement.style.zIndex = '10001';
      htmlElement.style.pointerEvents = 'auto';

      if (currentStep.actionType === 'click') {
        const clickHandler = (e: Event) => {
          console.log('Tour: Click detected on target');
          setActionCompleted(true);
          setTimeout(() => {
            handleNext();
          }, 800);
        };
        
        htmlElement.addEventListener('click', clickHandler, true);
        cleanupFunctionsRef.current.push(() => htmlElement.removeEventListener('click', clickHandler, true));
        
        const clickableChildren = htmlElement.querySelectorAll('button, a, [role="button"], [data-tour-clickable]');
        clickableChildren.forEach(child => {
          const childElement = child as HTMLElement;
          const childHandler = (e: Event) => {
            console.log('Tour: Click detected on child element');
            setActionCompleted(true);
            setTimeout(() => {
              handleNext();
            }, 800);
          };
          childElement.addEventListener('click', childHandler, true);
          cleanupFunctionsRef.current.push(() => childElement.removeEventListener('click', childHandler, true));
        });
      } else if (currentStep.actionType === 'hover') {
        const hoverHandler = () => {
          console.log('Tour: Hover detected');
          setActionCompleted(true);
          setTimeout(() => {
            handleNext();
          }, 1000);
        };
        htmlElement.addEventListener('mouseenter', hoverHandler);
        cleanupFunctionsRef.current.push(() => htmlElement.removeEventListener('mouseenter', hoverHandler));
      } else if (currentStep.actionType === 'drag') {
        const sliders = htmlElement.querySelectorAll('[role="slider"]');
        sliders.forEach(slider => {
          const dragHandler = (e: Event) => {
            const target = e.target as HTMLElement;
            const value = parseFloat(target.getAttribute('aria-valuenow') || '0');
            
            if (currentStep.actionValidation && currentStep.actionValidation(value)) {
              console.log('Tour: Slider validation passed with value:', value);
              setActionCompleted(true);
            }
          };
          slider.addEventListener('input', dragHandler);
          slider.addEventListener('change', dragHandler);
          cleanupFunctionsRef.current.push(() => {
            slider.removeEventListener('input', dragHandler);
            slider.removeEventListener('change', dragHandler);
          });
        });
      }
    });
  }, [currentStep, cleanupListeners]);

  useEffect(() => {
    if (!isOpen || showLegalScreen) return;

    if (currentStep.targetTab) {
      setActiveTab(currentStep.targetTab);
    }

    const setupTimer = setTimeout(() => {
      updateTargetRect();
      attachActionListeners();
    }, 800);

    const updateInterval = setInterval(updateTargetRect, 100);

    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);

    return () => {
      clearTimeout(setupTimer);
      clearInterval(updateInterval);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
      cleanupListeners();
    };
  }, [currentStep, isOpen, showLegalScreen, setActiveTab, updateTargetRect, attachActionListeners, cleanupListeners]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setActionCompleted(false);
      setTargetRect(null);
    } else {
      triggerConfetti();
      setTimeout(() => {
        cleanupListeners();
        onComplete();
      }, 1000);
    }
  };

  const handleSkipTour = () => {
    cleanupListeners();
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

  if (!isOpen) return null;

  if (showLegalScreen) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-2xl"
          style={{ pointerEvents: 'auto' }}
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
      <div className="fixed inset-0 z-[99998]" style={{ pointerEvents: 'none' }}>
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          style={{ 
            pointerEvents: 'none',
            clipPath: targetRect 
              ? `polygon(
                  0 0,
                  100% 0,
                  100% 100%,
                  0 100%,
                  0 0,
                  ${targetRect.left - 16}px ${targetRect.top - 16}px,
                  ${targetRect.left - 16}px ${targetRect.bottom + 16}px,
                  ${targetRect.right + 16}px ${targetRect.bottom + 16}px,
                  ${targetRect.right + 16}px ${targetRect.top - 16}px,
                  ${targetRect.left - 16}px ${targetRect.top - 16}px
                )`
              : undefined
          }}
        />

        {targetRect && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute"
              style={{
                top: targetRect.top - 16,
                left: targetRect.left - 16,
                width: targetRect.width + 32,
                height: targetRect.height + 32,
                border: '4px solid rgba(0, 255, 255, 0.8)',
                borderRadius: '24px',
                boxShadow: '0 0 40px rgba(0, 255, 255, 0.6), inset 0 0 40px rgba(0, 255, 255, 0.2)',
                pointerEvents: 'none',
                zIndex: 10000,
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-3xl"
                animate={{
                  scale: [1, 1.02, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  background: 'radial-gradient(circle at center, rgba(0, 255, 255, 0.2), transparent)',
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: isMobile ? 10 : -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute flex flex-col items-center gap-2"
              style={{
                left: targetRect.left + targetRect.width / 2,
                top: isMobile ? targetRect.bottom + 40 : targetRect.top - 120,
                transform: 'translateX(-50%)',
                pointerEvents: 'none',
                zIndex: 10000,
              }}
            >
              <motion.div
                animate={{
                  y: isMobile ? [-4, 4, -4] : [4, -4, 4],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="text-6xl"
                style={{
                  filter: 'drop-shadow(0 0 12px rgba(0, 255, 255, 0.8))',
                }}
              >
                {isMobile ? '↓' : '↑'}
              </motion.div>
              <div 
                className="text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-full whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(153, 69, 255, 0.2))',
                  border: '2px solid rgba(0, 255, 255, 0.6)',
                  color: '#00FFFF',
                  textShadow: '0 0 8px rgba(0, 255, 255, 0.8)',
                  boxShadow: '0 0 20px rgba(0, 255, 255, 0.4)',
                }}
              >
                Look here {isMobile ? '↓' : '↑'}
              </div>
            </motion.div>
          </>
        )}

        <motion.div
          key={currentStepIndex}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            x: shakeCard ? [-8, 8, -8, 8, 0] : 0,
          }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ 
            type: 'spring', 
            damping: 25, 
            stiffness: 300,
            x: { duration: 0.4 },
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
            boxShadow: '0 0 60px rgba(0, 255, 255, 0.4), 0 0 100px rgba(153, 69, 255, 0.3)',
            border: '2px solid rgba(0, 255, 255, 0.3)',
          }}
        >
          <div className="relative p-6 space-y-6">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-secondary to-accent rounded-t-lg overflow-hidden">
              <motion.div
                className="h-full bg-white/60"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {!isFirstStep && !isLastStep && (
              <button
                onClick={handleSkipTour}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
              >
                <X size={20} className="text-muted-foreground hover:text-foreground" />
              </button>
            )}

            <div className="space-y-5 pt-4">
              <div className="space-y-3">
                <h2
                  className={cn(
                    "font-black uppercase tracking-tight",
                    isFirstStep || isLastStep ? "text-3xl sm:text-4xl" : "text-2xl"
                  )}
                  style={{
                    background: 'linear-gradient(135deg, #00FFFF, #DC1FFF, #FF00FF)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.4))',
                  }}
                >
                  {currentStep.title}
                </h2>

                <p className="text-base text-foreground/90 leading-relaxed">
                  {currentStep.description}
                </p>

                {!isFirstStep && !isLastStep && (
                  <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Step {currentStepIndex + 1} of {TOUR_STEPS.length}
                  </div>
                )}
              </div>

              {!actionCompleted && currentStep.instruction && !isFirstStep && !isLastStep && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-primary/10 border-2 border-primary/40 rounded-xl"
                >
                  <Lightning size={24} className="text-primary flex-shrink-0 animate-pulse" weight="fill" />
                  <span className="text-base text-primary font-bold">{currentStep.instruction}</span>
                </motion.div>
              )}

              {actionCompleted && !isFirstStep && !isLastStep && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 bg-primary/20 border-2 border-primary/60 rounded-xl"
                >
                  <CheckCircle size={24} weight="fill" className="text-primary flex-shrink-0" />
                  <span className="text-base text-primary font-bold uppercase">✓ Great! Moving on...</span>
                </motion.div>
              )}

              {!isFirstStep && !isLastStep && (
                <div className="flex items-center gap-2">
                  {TOUR_STEPS.slice(1, -1).map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        'h-2.5 rounded-full transition-all duration-300',
                        index + 1 === currentStepIndex
                          ? 'w-10 bg-primary'
                          : index + 1 < currentStepIndex
                          ? 'w-2.5 bg-primary/70'
                          : 'w-2.5 bg-border'
                      )}
                      style={{
                        boxShadow: index + 1 === currentStepIndex ? '0 0 12px rgba(0,255,255,0.6)' : 'none',
                      }}
                    />
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                {isFirstStep && (
                  <div className="flex flex-col sm:flex-row gap-3">
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
                      className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-base font-bold"
                      style={{ boxShadow: '0 0 24px rgba(0,255,255,0.4)' }}
                    >
                      Start Tour
                      <Play size={20} weight="fill" className="ml-2" />
                    </Button>
                  </div>
                )}

                {!isFirstStep && !isLastStep && (
                  <>
                    <Button
                      onClick={handleAttemptNext}
                      size="lg"
                      disabled={!canProceed}
                      className={cn(
                        'w-full transition-all duration-300 text-base font-bold',
                        canProceed
                          ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90'
                          : 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-60'
                      )}
                      style={{
                        boxShadow: canProceed ? '0 0 24px rgba(0,255,255,0.5)' : 'none',
                      }}
                    >
                      {canProceed ? (
                        <>
                          Next Step
                          <ArrowRight size={20} weight="bold" className="ml-2" />
                        </>
                      ) : (
                        <>
                          Click a card above first ↑
                        </>
                      )}
                    </Button>
                    <button
                      onClick={handleSkipTour}
                      className="text-xs text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors"
                    >
                      Skip Tour
                    </button>
                  </>
                )}

                {isLastStep && (
                  <Button
                    onClick={handleNext}
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg font-black uppercase py-6"
                    style={{ boxShadow: '0 0 40px rgba(0,255,255,0.6)' }}
                  >
                    Launch Bot & Start Earning
                    <CheckCircle size={24} weight="fill" className="ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
