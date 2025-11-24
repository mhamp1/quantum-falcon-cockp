// FINAL STEP 3 FIX — arrow points down, text says "below", works on mobile — November 22, 2025
// FINAL TOUR TEXT — neutral, perfect highlight, mobile-safe — November 22, 2025

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
  actionType: 'click' | 'hover' | 'none';
}

// FINAL TOUR TEXT — neutral, perfect highlight, mobile-safe — November 22, 2025
const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Quantum Falcon',
    description: 'The most powerful AI trading cockpit. Let\'s get you printing money in 60 seconds.',
    instruction: 'Click the highlighted "Start Tour" button',
    actionType: 'none',
  },
  {
    id: 'dashboard-stats',
    title: 'Your Command Center',
    description: 'These 4 stat cards show your portfolio, wins, and P&L in real-time.',
    instruction: 'Click any of the highlighted stat cards',
    targetTab: 'dashboard',
    targetSelector: '[data-tour="stat-card"]',
    actionType: 'click',
  },
  {
    id: 'neural-forecast',
    title: 'AI Forecasts and Confidence',
    description: 'Our AI predicts market movements with up to 92% confidence.',
    instruction: 'Hover over the highlighted confidence bar',
    targetTab: 'dashboard',
    targetSelector: '[data-tour="confidence-bar"]',
    actionType: 'hover',
  },
  {
    id: 'quick-actions',
    title: 'One-Click Bot Control',
    description: 'Instant access to start your bot, check vault, or upgrade.',
    instruction: 'Click the highlighted "Start Bot" button',
    targetTab: 'dashboard',
    targetSelector: '[data-tour="quick-action"]',
    actionType: 'click',
  },
  {
    id: 'strategy',
    title: 'Build God-Tier Strategies',
    description: 'Full Monaco editor with real-time backtesting and sharing.',
    instruction: 'Click any of the highlighted strategy cards',
    targetTab: 'trading',
    targetSelector: '[data-tour="strategy-card"]',
    actionType: 'click',
  },
  {
    id: 'vault',
    title: 'Your Secure Bitcoin Vault',
    description: 'All profits auto-convert to BTC and accumulate here.',
    instruction: 'Click the highlighted "Deposit BTC" button',
    targetTab: 'vault',
    targetSelector: '[data-tour="deposit-btc-button"]',
    actionType: 'click',
  },
  {
    id: 'complete',
    title: '🔥 You\'re Ready. The Falcon Is Hunting. 🔥',
    description: 'Your AI agents are live. Paper Mode is active. Your empire starts now.',
    instruction: 'Click the highlighted "Launch Bot" button',
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
  const [legalCheckboxes, setLegalCheckboxes] = useState({
    riskDisclosure: false,
    ageRequirement: false,
    tradingRisks: false,
    liabilityWaiver: false,
  });
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [shakeCard, setShakeCard] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(true);
  
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);
  const targetElementsRef = useRef<HTMLElement[]>([]);

  const currentStep = TOUR_STEPS[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  const canProceed = isFirstStep || isLastStep || currentStep.actionType === 'none' || actionCompleted;

  const updateTargetRect = useCallback(() => {
    if (!currentStep.targetSelector) {
      setTargetRect(null);
      targetElementsRef.current = [];
      return;
    }

    let elements = Array.from(document.querySelectorAll(currentStep.targetSelector)) as HTMLElement[];
    
    // CRITICAL FIX: For dashboard-stats step, ensure stat cards are visible and findable
    if (currentStep.id === 'dashboard-stats') {
      // Try alternative selectors if main selector fails
      if (elements.length === 0) {
        const altSelectors = ['.stat-card', '[data-tour="stat-card"]', '.stats-grid > *', '[data-tour-card="true"]', '[role="gridcell"]']
        for (const sel of altSelectors) {
          const altElements = document.querySelectorAll(sel)
          if (altElements.length > 0) {
            elements = Array.from(altElements) as HTMLElement[]
            break
          }
        }
      }
      
      // Force visibility of all stat cards
      elements.forEach(el => {
        el.style.opacity = '1'
        el.style.visibility = 'visible'
        el.style.display = 'block'
        el.style.zIndex = '9998'
        el.classList.add('!opacity-100', '!visible', '!block')
        el.setAttribute('data-tour', 'stat-card')
      })
      
      // Also ensure the container is visible
      const container = document.querySelector('.stats-grid, [data-tour="stats-container"]')
      if (container) {
        (container as HTMLElement).style.opacity = '1'
        (container as HTMLElement).style.visibility = 'visible'
        (container as HTMLElement).style.display = 'grid'
      }
    }
    
    if (elements.length > 0) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Only include elements that are actually visible and have dimensions
        if (rect.width > 0 && rect.height > 0) {
          minX = Math.min(minX, rect.left);
          minY = Math.min(minY, rect.top);
          maxX = Math.max(maxX, rect.right);
          maxY = Math.max(maxY, rect.bottom);
        }
      });

      if (minX !== Infinity && minY !== Infinity) {
        const combinedRect = new DOMRect(minX, minY, maxX - minX, maxY - minY);
        setTargetRect(combinedRect);
        targetElementsRef.current = elements;
      } else {
        setTargetRect(null);
        targetElementsRef.current = [];
      }
    } else {
      setTargetRect(null);
      targetElementsRef.current = [];
    }
  }, [currentStep.targetSelector]);

  const scrollTargetIntoView = useCallback(() => {
    if (targetElementsRef.current.length > 0) {
      const firstElement = targetElementsRef.current[0];
      // Extra scroll for neural-forecast to ensure bar is visible
      firstElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: currentStep.id === 'neural-forecast' ? 'center' : 'center',
        inline: 'center'
      });
      // Additional scroll adjustment for neural-forecast
      if (currentStep.id === 'neural-forecast') {
        setTimeout(() => {
          window.scrollBy({ top: 100, behavior: 'smooth' });
        }, 500);
      }
    }
  }, [currentStep.id]);

  const cleanupListeners = useCallback(() => {
    cleanupFunctionsRef.current.forEach(cleanup => cleanup());
    cleanupFunctionsRef.current = [];
  }, []);

  const handleActionComplete = useCallback(() => {
    // Tour action completed (removed console.log for production)
    setActionCompleted(true);

    confetti({
      particleCount: 100,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#00FFFF', '#DC1FFF', '#FF00FF'],
      zIndex: 99999,
    });

    setTimeout(() => {
      if (currentStepIndex < TOUR_STEPS.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
        setActionCompleted(false);
        setTargetRect(null);
      }
    }, 800);
  }, [currentStep.id, currentStepIndex]);

  const attachActionListeners = useCallback(() => {
    cleanupListeners();

    if (!currentStep.targetSelector || currentStep.actionType === 'none') return;

    const targetElements = Array.from(document.querySelectorAll(currentStep.targetSelector)) as HTMLElement[];
    
    // Tour: Attaching action listeners (removed console.log for production)

    targetElements.forEach(element => {
      element.style.position = 'relative';
      element.style.zIndex = '10001';
      element.style.pointerEvents = 'auto';
      element.style.cursor = 'pointer';

      if (currentStep.actionType === 'click') {
        const clickHandler = (e: Event) => {
          // Tour: Click detected (removed console.log for production)
          e.stopPropagation();
          handleActionComplete();
        };
        
        element.addEventListener('click', clickHandler, { capture: true });
        cleanupFunctionsRef.current.push(() => {
          element.removeEventListener('click', clickHandler, { capture: true });
        });
        
        const clickableChildren = element.querySelectorAll('button, a, [role="button"]');
        clickableChildren.forEach(child => {
          const childHandler = (e: Event) => {
            handleActionComplete();
          };
          child.addEventListener('click', childHandler, { capture: true });
          cleanupFunctionsRef.current.push(() => {
            child.removeEventListener('click', childHandler, { capture: true });
          });
        });
      } else if (currentStep.actionType === 'hover') {
        const hoverHandler = () => {
          // Tour: Hover detected (removed console.log for production)
          handleActionComplete();
        };
        element.addEventListener('mouseenter', hoverHandler);
        cleanupFunctionsRef.current.push(() => {
          element.removeEventListener('mouseenter', hoverHandler);
        });
        
        // Mobile: Auto-advance hover steps after 2 seconds
        if (isMobile && currentStep.id === 'neural-forecast') {
          const autoAdvanceTimer = setTimeout(() => {
            // Tour: Auto-advancing hover step on mobile (removed console.log for production)
            handleActionComplete();
          }, 2000);
          cleanupFunctionsRef.current.push(() => {
            clearTimeout(autoAdvanceTimer);
          });
        }
      }
    });
  }, [currentStep, cleanupListeners, handleActionComplete]);

  useEffect(() => {
    if (!isOpen || showLegalScreen) return;

    setActionCompleted(false);

    if (currentStep.targetTab) {
      setActiveTab(currentStep.targetTab);
    }

    // Longer delay for stat cards step to allow lazy-loaded components to render
    const baseDelay = currentStep.id === 'dashboard-stats' ? 1500 : 800;
    const maxRetries = currentStep.id === 'dashboard-stats' ? 10 : 5;
    let retryCount = 0;

    const findAndSetup = () => {
      updateTargetRect();
      
      // Force stat cards to be visible during tour
      if (currentStep.id === 'dashboard-stats') {
        const statCards = document.querySelectorAll('[data-tour="stat-card"]')
        statCards.forEach(card => {
          (card as HTMLElement).style.opacity = '1'
          ;(card as HTMLElement).style.visibility = 'visible'
          card.classList.add('!opacity-100', '!ring-4', '!ring-cyan-400', '!ring-offset-4', '!ring-offset-black', 'animate-pulse')
        })
      }
      
      // If stat cards step and no elements found, retry
      if (currentStep.id === 'dashboard-stats' && targetElementsRef.current.length === 0 && retryCount < maxRetries) {
        retryCount++;
        setTimeout(findAndSetup, 200);
        return;
      }
      
      // Elements found or max retries reached, proceed with setup
      scrollTargetIntoView();
      attachActionListeners();
    };

    const setupTimer = setTimeout(findAndSetup, baseDelay);

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
  }, [currentStep, isOpen, showLegalScreen, setActiveTab, updateTargetRect, scrollTargetIntoView, attachActionListeners, cleanupListeners]);

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setActionCompleted(false);
      setTargetRect(null);
    } else {
      const duration = 3000;
      const end = Date.now() + duration;
      const frame = () => {
        confetti({
          particleCount: 7,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#00FFFF', '#DC1FFF', '#FF00FF'],
          zIndex: 99999,
        });
        confetti({
          particleCount: 7,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#00FFFF', '#DC1FFF', '#FF00FF'],
          zIndex: 99999,
        });
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
      
      setTimeout(() => {
        cleanupListeners();
        onComplete();
      }, 1500);
    }
  };

  const handleSkipTour = () => {
    cleanupListeners();
    onSkip();
  };

  const handleCompleteLegal = () => {
    const allChecked = Object.values(legalCheckboxes).every(checked => checked === true);
    if (allChecked) {
      setHasAcknowledgedLegal(true);
      setShowLegalScreen(false);
    }
  };

  const allLegalCheckboxesChecked = Object.values(legalCheckboxes).every(checked => checked === true);

  const handleAttemptNext = () => {
    if (!canProceed) {
      setShakeCard(true);
      setTimeout(() => setShakeCard(false), 500);
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } else {
      handleNext();
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

              {/* 4 Separate Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <Checkbox
                    id="risk-disclosure"
                    checked={legalCheckboxes.riskDisclosure}
                    onCheckedChange={(checked) => 
                      setLegalCheckboxes(prev => ({ ...prev, riskDisclosure: checked as boolean }))
                    }
                    className="mt-1"
                  />
                  <label
                    htmlFor="risk-disclosure"
                    className="text-sm text-foreground cursor-pointer leading-relaxed flex-1"
                  >
                    I understand that trading cryptocurrency involves substantial risk of loss and Quantum Falcon provides software tools only — not financial advice.
                  </label>
                </div>

                <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <Checkbox
                    id="age-requirement"
                    checked={legalCheckboxes.ageRequirement}
                    onCheckedChange={(checked) => 
                      setLegalCheckboxes(prev => ({ ...prev, ageRequirement: checked as boolean }))
                    }
                    className="mt-1"
                  />
                  <label
                    htmlFor="age-requirement"
                    className="text-sm text-foreground cursor-pointer leading-relaxed flex-1"
                  >
                    I am 18+ years old and legally able to trade cryptocurrency in my jurisdiction.
                  </label>
                </div>

                <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <Checkbox
                    id="trading-risks"
                    checked={legalCheckboxes.tradingRisks}
                    onCheckedChange={(checked) => 
                      setLegalCheckboxes(prev => ({ ...prev, tradingRisks: checked as boolean }))
                    }
                    className="mt-1"
                  />
                  <label
                    htmlFor="trading-risks"
                    className="text-sm text-foreground cursor-pointer leading-relaxed flex-1"
                  >
                    I understand algorithmic trading risks and will test in Paper Mode before risking real capital.
                  </label>
                </div>

                <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <Checkbox
                    id="liability-waiver"
                    checked={legalCheckboxes.liabilityWaiver}
                    onCheckedChange={(checked) => 
                      setLegalCheckboxes(prev => ({ ...prev, liabilityWaiver: checked as boolean }))
                    }
                    className="mt-1"
                  />
                  <label
                    htmlFor="liability-waiver"
                    className="text-sm text-foreground cursor-pointer leading-relaxed flex-1"
                  >
                    I will not hold Quantum Falcon liable for any trading losses and I am responsible for tax reporting.
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
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
                  disabled={!allLegalCheckboxesChecked}
                  size="lg"
                  className={cn(
                    "flex-1 bg-gradient-to-r from-primary to-secondary transition-all font-bold uppercase tracking-wider",
                    allLegalCheckboxesChecked 
                      ? "hover:opacity-90 cursor-pointer animate-pulse" 
                      : "opacity-50 cursor-not-allowed"
                  )}
                  style={{
                    boxShadow: allLegalCheckboxesChecked ? '0 0 30px rgba(0,255,255,0.5)' : '0 0 10px rgba(0,255,255,0.1)',
                  }}
                >
                  Accept & Continue
                  <ArrowRight size={20} weight="bold" className="ml-2" />
                </Button>
              </div>
              {!allLegalCheckboxesChecked && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Please check all 4 boxes above to continue
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99998]" style={{ pointerEvents: 'none' }}>
        {/* Dark overlay with cut-out for target elements - SPOTLIGHT */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-md transition-all duration-300"
          style={{ 
            pointerEvents: 'none',
            clipPath: targetRect 
              ? `polygon(
                  0 0,
                  100% 0,
                  100% 100%,
                  0 100%,
                  0 0,
                  ${Math.max(0, targetRect.left - 20)}px ${Math.max(0, targetRect.top - 20)}px,
                  ${Math.max(0, targetRect.left - 20)}px ${Math.min(window.innerHeight, targetRect.bottom + 20)}px,
                  ${Math.min(window.innerWidth, targetRect.right + 20)}px ${Math.min(window.innerHeight, targetRect.bottom + 20)}px,
                  ${Math.min(window.innerWidth, targetRect.right + 20)}px ${Math.max(0, targetRect.top - 20)}px,
                  ${Math.max(0, targetRect.left - 20)}px ${Math.max(0, targetRect.top - 20)}px
                )`
              : undefined
          }}
        />

            {/* Pulsing cyan border around target elements - EXTRA THICK for neural-forecast */}
        {targetRect && (
          <>
            <motion.div
              key={`spotlight-${currentStepIndex}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute pulsing-highlight"
              style={{
                top: targetRect.top - 20,
                left: targetRect.left - 20,
                width: targetRect.width + 40,
                height: targetRect.height + 40,
                border: currentStep.id === 'neural-forecast' ? '8px solid rgba(0, 255, 255, 0.95)' : '4px solid rgba(0, 255, 255, 0.9)',
                borderRadius: '24px',
                boxShadow: currentStep.id === 'neural-forecast' 
                  ? '0 0 60px rgba(0, 255, 255, 0.9), 0 0 120px rgba(0, 255, 255, 0.5)' 
                  : '0 0 40px rgba(0, 255, 255, 0.7)',
                pointerEvents: 'none',
                zIndex: 9997, // Below mobile nav (z-9999) but above everything else
                transform: 'scale(1.05)',
              }}
            >
              <motion.div
                className="absolute inset-0 rounded-3xl"
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  background: 'radial-gradient(circle at center, rgba(0, 255, 255, 0.4), transparent)',
                }}
              />
            </motion.div>

            {/* ARROWS REMOVED — Using pulsing highlight only for perfect neutral UX — November 22, 2025 */}
          </>
        )}

        {/* TOUR CARD - FIXED AT BOTTOM CENTER */}
        <motion.div
          key={`card-${currentStepIndex}`}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            x: shakeCard ? [-10, 10, -10, 10, 0] : 0,
          }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ 
            type: 'spring', 
            damping: 25, 
            stiffness: 300,
            x: { duration: 0.4 },
          }}
          className={cn(
            'fixed cyber-card backdrop-blur-xl max-w-2xl w-full',
            isMobile
              ? 'bottom-20 inset-x-4'
              : 'bottom-8 left-1/2 -translate-x-1/2 mx-4'
          )}
          style={{
            zIndex: 100000,
            pointerEvents: 'auto',
            boxShadow: '0 0 60px rgba(0, 255, 255, 0.5)',
            border: '2px solid rgba(0, 255, 255, 0.4)',
          }}
        >
          <div className="relative p-6 space-y-5">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-secondary to-accent rounded-t-lg overflow-hidden">
              <motion.div
                className="h-full bg-white/70"
                initial={{ width: '0%' }}
                animate={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
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

            <div className="space-y-4 pt-2">
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
                  className="flex items-start gap-3 p-4 bg-primary/10 border-2 border-primary/40 rounded-xl"
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
                  <span className="text-base text-primary font-bold uppercase">✓ Perfect! Moving on...</span>
                </motion.div>
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
                      style={{ boxShadow: '0 0 24px rgba(0,255,255,0.5)' }}
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
                        'Complete the highlighted action first'
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
                  <>
                    <Button
                      onClick={() => {
                        // Actually start the bot
                        const startBotEvent = new CustomEvent('start-bot-from-tour')
                        window.dispatchEvent(startBotEvent)
                        
                        // Complete tour
                        handleNext()
                      }}
                      size="lg"
                      className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-lg font-black uppercase py-7"
                      style={{ boxShadow: '0 0 40px rgba(0,255,255,0.6)' }}
                    >
                      🚀 Launch Bot & Start Earning 🚀
                      <CheckCircle size={24} weight="fill" className="ml-2" />
                    </Button>
                    
                    <div className="flex items-center gap-2 justify-center">
                      <Checkbox
                        id="dont-show-again"
                        checked={dontShowAgain}
                        onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
                      />
                      <label
                        htmlFor="dont-show-again"
                        className="text-xs text-muted-foreground cursor-pointer"
                      >
                        Don't show this tour again
                      </label>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
