/**
 * Onboarding Flow Manager - Orchestrates the 5-step onboarding sequence
 * 
 * REQUIRED FLOW ORDER (100% this sequence, no exceptions):
 * 1. Full-screen MP4 intro video (autoplay, unmuted, auto-proceed)
 * 2. Static splash/landing page with falcon design
 * 3. Guided tour (7-step tour with dashboard cards)
 * 4. Legal agreements modal (4 checkboxes, accept button)
 * 5. Authentication/License modal (Solana colors, free tier option)
 * 
 * November 23, 2025 — Quantum Falcon Cockpit v2025.1.0
 */

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';

// Lazy load step components for better performance
const IntroVideoStep = lazy(() => import('./steps/IntroVideoStep').then(m => ({ default: m.default })));
const SplashLandingStep = lazy(() => import('./steps/SplashLandingStep').then(m => ({ default: m.default })));
const GuidedTourStep = lazy(() => import('./steps/GuidedTourStep').then(m => ({ default: m.default })));
const LegalAgreementsStep = lazy(() => import('./steps/LegalAgreementsStep').then(m => ({ default: m.default })));
const AuthenticationStep = lazy(() => import('./steps/AuthenticationStep').then(m => ({ default: m.default })));

type FlowStep = 'intro-video' | 'splash-landing' | 'guided-tour' | 'legal-agreements' | 'authentication' | 'complete';

interface OnboardingFlowManagerProps {
  onComplete: () => void;
}

const STORAGE_KEY_INTRO_VIDEO = 'qf:onboarding:intro-video-complete';
const STORAGE_KEY_SPLASH = 'qf:onboarding:splash-complete';
const STORAGE_KEY_TOUR = 'qf:onboarding:tour-complete';
const STORAGE_KEY_LEGAL = 'qf:onboarding:legal-accepted';
const STORAGE_KEY_AUTH = 'qf:onboarding:auth-complete';

export default function OnboardingFlowManager({ onComplete }: OnboardingFlowManagerProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('intro-video');
  const [isFirstTime, setIsFirstTime] = useState(true);

  // Check localStorage on mount to determine starting step
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const introComplete = localStorage.getItem(STORAGE_KEY_INTRO_VIDEO) === 'true';
    const splashComplete = localStorage.getItem(STORAGE_KEY_SPLASH) === 'true';
    const tourComplete = localStorage.getItem(STORAGE_KEY_TOUR) === 'true';
    const legalAccepted = localStorage.getItem(STORAGE_KEY_LEGAL) === 'true';
    const authComplete = localStorage.getItem(STORAGE_KEY_AUTH) === 'true';

    // If all steps complete, skip onboarding
    if (introComplete && splashComplete && tourComplete && legalAccepted && authComplete) {
      setIsFirstTime(false);
      onComplete();
      return;
    }

    // Determine starting step based on what's been completed
    if (!introComplete) {
      setCurrentStep('intro-video');
    } else if (!splashComplete) {
      setCurrentStep('splash-landing');
    } else if (!legalAccepted) {
      setCurrentStep('legal-agreements');
    } else if (!tourComplete) {
      setCurrentStep('guided-tour');
    } else if (!authComplete) {
      setCurrentStep('authentication');
    } else {
      setIsFirstTime(false);
      onComplete();
    }
  }, [onComplete]);

  // Step completion handlers
  const handleIntroVideoComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY_INTRO_VIDEO, 'true');
    setCurrentStep('splash-landing');
  }, []);

  const handleSplashComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY_SPLASH, 'true');
    setCurrentStep('legal-agreements'); // Legal comes before tour
  }, []);

  const handleLegalComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY_LEGAL, 'true');
    setCurrentStep('guided-tour');
  }, []);

  const handleTourComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY_TOUR, 'true');
    setCurrentStep('authentication');
  }, []);

  const handleTourSkip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY_TOUR, 'true');
    setCurrentStep('authentication');
  }, []);

  const handleAuthComplete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY_AUTH, 'true');
    setCurrentStep('complete');
    setIsFirstTime(false);
    onComplete();
  }, [onComplete]);

  // Don't render if not first time
  if (!isFirstTime) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={
        <div className="fixed inset-0 z-[99999] bg-black flex items-center justify-center" style={{ backgroundColor: 'oklch(0.08 0.02 280)' }}>
          <div className="text-primary" style={{ color: '#14F195' }}>Loading...</div>
        </div>
      }>
        {/* Step 1: Full-screen MP4 intro video */}
        {currentStep === 'intro-video' && (
          <IntroVideoStep
            key="intro-video"
            onComplete={handleIntroVideoComplete}
          />
        )}

        {/* Step 2: Static splash/landing page */}
        {currentStep === 'splash-landing' && (
          <SplashLandingStep
            key="splash-landing"
            onComplete={handleSplashComplete}
          />
        )}

        {/* Step 3: Legal agreements (before tour) */}
        {currentStep === 'legal-agreements' && (
          <LegalAgreementsStep
            key="legal-agreements"
            onComplete={handleLegalComplete}
          />
        )}

        {/* Step 4: Guided tour */}
        {currentStep === 'guided-tour' && (
          <GuidedTourStep
            key="guided-tour"
            onComplete={handleTourComplete}
            onSkip={handleTourSkip}
          />
        )}

        {/* Step 5: Authentication/License */}
        {currentStep === 'authentication' && (
          <AuthenticationStep
            key="authentication"
            onComplete={handleAuthComplete}
          />
        )}
      </Suspense>
    </AnimatePresence>
  );
}

