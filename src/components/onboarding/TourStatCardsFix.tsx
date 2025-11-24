// Tour Stat Cards Fix — Makes stat cards visible, highlighted, and clickable during tour
// November 22, 2025 — Quantum Falcon Cockpit

import React, { useEffect } from 'react';

const TourStatCardsFix = () => {
  useEffect(() => {
    // Check if tour is active by looking for tour card or step 2 indicator
    const tourCard = document.querySelector('[data-tour-card]');
    const tourStep2 = document.querySelector('[data-tour-step="2"]');
    const isTourActive = tourCard || tourStep2 || document.querySelector('.tour-active');
    
    if (!isTourActive) return;
    
    // Check if we're on step 2 (dashboard-stats step)
    const currentStepElement = document.querySelector('[data-tour-step]');
    const stepNumber = currentStepElement?.getAttribute('data-tour-step');
    if (stepNumber !== '2' && !document.querySelector('[data-tour="dashboard-stats"]')) return;

    // Find all 4 stat cards (multiple selectors for compatibility)
    const cards = document.querySelectorAll(
      '[data-tour-card], [data-stat-card], .quick-stats-card, [class*="QuickStats"], .stat-card, [data-tour="stat-card"]'
    );

    if (cards.length === 0) {
      // Retry after a short delay if cards aren't loaded yet
      const retryTimeout = setTimeout(() => {
        const retryCards = document.querySelectorAll(
          '[data-tour-card], [data-stat-card], .quick-stats-card, [class*="QuickStats"], .stat-card, [data-tour="stat-card"]'
        );
        if (retryCards.length > 0) {
          applyHighlighting(retryCards);
        }
      }, 500);
      return () => clearTimeout(retryTimeout);
    }

    applyHighlighting(cards);

    // Cleanup function
    return () => {
      cards.forEach((card) => {
        card.classList.remove(
          '!opacity-100',
          '!visible',
          'ring-8',
          'ring-cyan-400',
          'ring-offset-8',
          'ring-offset-black',
          'animate-pulse',
          'shadow-2xl',
          'shadow-cyan-500/80',
          'scale-110',
          'z-50',
          'cursor-pointer'
        );
        // Remove all click handlers
        const newCard = card.cloneNode(true);
        card.parentNode?.replaceChild(newCard, card);
      });
    };
  }, []); // No dependencies - runs on mount and cleanup on unmount

  const applyHighlighting = (cards: NodeListOf<Element>) => {
    cards.forEach((card, index) => {
      // Make visible + glowing
      card.classList.add('!opacity-100', '!visible');
      card.classList.add('ring-8', 'ring-cyan-400', 'ring-offset-8', 'ring-offset-black', 'animate-pulse');
      card.classList.add('shadow-2xl', 'shadow-cyan-500/80');
      card.classList.add('scale-110', 'z-50');
      card.classList.add('cursor-pointer');

      // Click to advance tour - trigger next step via tour component
      const clickHandler = () => {
        // Find and click the "Next" button in the tour
        const nextButton = document.querySelector('[data-tour-next], .tour-next-button, button:has-text("Next")');
        if (nextButton) {
          (nextButton as HTMLElement).click();
        } else {
          // Fallback: dispatch custom event
          window.dispatchEvent(new CustomEvent('tour-next-step'));
        }
        
        cards.forEach((c) => {
          c.classList.remove(
            'ring-8',
            'ring-cyan-400',
            'animate-pulse',
            'scale-110',
            'cursor-pointer'
          );
        });
      };

      card.addEventListener('click', clickHandler);
    });
  };

  return null;
};

export default TourStatCardsFix;

