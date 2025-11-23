/**
 * Step 3: Guided tour (7-step tour with dashboard cards)
 * 
 * Requirements:
 * - Tour MUST NOT start before steps 1 and 2 are complete
 * - Fix: there are zero stat cards highlighted right now → populate the actual dashboard cards (Portfolio Value, Active Agents, Win Rate, etc.) so they are visible and highlightable
 * - "Skip Tour" button must work and go straight to step 4
 */

import { useState, useEffect } from 'react';
import InteractiveOnboardingTour from '@/components/onboarding/InteractiveOnboardingTour';

interface GuidedTourStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function GuidedTourStep({ onComplete, onSkip }: GuidedTourStepProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Ensure dashboard is loaded before starting tour
  useEffect(() => {
    // Wait for dashboard to render
    const timer = setTimeout(() => {
      // Verify stat cards exist
      const statCards = document.querySelectorAll('[data-tour="stat-card"]');
      if (statCards.length === 0) {
        console.warn('[Tour] Stat cards not found, waiting...');
        // Retry after a short delay
        setTimeout(() => {
          const retryCards = document.querySelectorAll('[data-tour="stat-card"]');
          if (retryCards.length === 0) {
            console.error('[Tour] Stat cards still not found after retry');
          }
        }, 1000);
      } else {
        console.log(`[Tour] Found ${statCards.length} stat cards`);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleComplete = () => {
    setIsOpen(false);
    onComplete();
  };

  const handleSkip = () => {
    setIsOpen(false);
    onSkip();
  };

  return (
    <InteractiveOnboardingTour
      isOpen={isOpen}
      onComplete={handleComplete}
      onSkip={handleSkip}
      setActiveTab={(tab) => {
        // Switch to the required tab for tour steps
        // This will be handled by the parent App component
        const event = new CustomEvent('tour-set-active-tab', { detail: { tab } });
        window.dispatchEvent(event);
      }}
    />
  );
}

