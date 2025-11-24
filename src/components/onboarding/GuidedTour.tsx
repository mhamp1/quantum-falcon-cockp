// NUCLEAR TOUR REBUILD — Perfect flow, perfect aesthetic, zero errors
// November 22, 2025 — Quantum Falcon Cockpit

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface TourStep {
  title: string;
  content: string;
  target: string | null;
  highlight?: boolean;
}

const steps: TourStep[] = [
  {
    title: 'WELCOME TO QUANTUM FALCON',
    content: 'The most advanced AI-powered trading cockpit on Solana.',
    target: null
  },
  {
    title: 'YOUR COMMAND CENTER',
    content: 'These 4 holographic stat cards show your portfolio, win rate, P&L, and active agents in real-time.',
    target: '[data-tour="stat-cards"]',
    highlight: true
  },
  {
    title: 'AI AGENTS',
    content: 'Deploy autonomous trading agents that run 24/7 across multiple strategies.',
    target: 'a[href*="/ai-agents"], [data-tour="ai-agents"]'
  },
  {
    title: 'STRATEGY BUILDER',
    content: 'Build, backtest, and deploy complex multi-leg strategies with zero code.',
    target: 'a[href*="/strategy-builder"], [data-tour="strategy-builder"]'
  },
  {
    title: 'LIVE ANALYTICS',
    content: 'Real-time charts, heatmaps, and performance tracking across all your positions.',
    target: 'a[href*="/analytics"], [data-tour="analytics"]'
  },
  {
    title: 'QUESTS & REWARDS',
    content: 'Complete trading quests to earn XP and mint exclusive Falcon NFTs.',
    target: 'a[href*="/quests"], [data-tour="quests"]'
  },
  {
    title: 'VAULT SECURITY',
    content: 'Your assets are protected with multi-layer encryption and emergency withdrawal.',
    target: 'a[href*="/vault"], [data-tour="vault"]'
  }
];

interface GuidedTourProps {
  onComplete: () => void;
  isOpen?: boolean;
}

export default function GuidedTour({ onComplete, isOpen = true }: GuidedTourProps) {
  const [step, setStep] = useState(0);
  const [highlightEl, setHighlightEl] = useState<HTMLElement | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (step === 0 || !steps[step].target) {
      setHighlightEl(null);
      setRect(null);
      return;
    }

    // Try multiple selectors
    const selectors = steps[step].target.split(',').map(s => s.trim());
    let el: HTMLElement | null = null;

    for (const selector of selectors) {
      el = document.querySelector(selector) as HTMLElement;
      if (el) break;
      
      // Also try data-tour attributes
      if (!el) {
        const dataTourSelector = selector.replace(/\[data-tour="([^"]+)"\]/, '[data-tour="$1"]');
        el = document.querySelector(dataTourSelector) as HTMLElement;
        if (el) break;
      }
    }

    if (el) {
      setHighlightEl(el);
      const boundingRect = el.getBoundingClientRect();
      setRect(boundingRect);
      
      // Smooth scroll into view
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setHighlightEl(null);
      setRect(null);
    }
  }, [step, isOpen]);

  const next = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      onComplete();
    }
  };

  const skip = () => {
    onComplete();
  };

  if (!isOpen || step >= steps.length) return null;

  const currentStep = steps[step];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] pointer-events-auto"
      >
        {/* Dark overlay with spotlight effect */}
        <div className="fixed inset-0 bg-black/90" />

        {/* Highlight box with pulsing cyan glow */}
        {highlightEl && currentStep.highlight && rect && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed pointer-events-none z-[10001]"
            style={{
              top: rect.top - 20,
              left: rect.left - 20,
              width: rect.width + 40,
              height: rect.height + 40,
              border: '8px solid #14F195',
              borderRadius: '24px',
              boxShadow: `
                0 0 0 9999px rgba(0, 0, 0, 0.9),
                0 0 100px 20px rgba(20, 241, 149, 0.8),
                0 0 200px 40px rgba(20, 241, 149, 0.4),
                inset 0 0 40px rgba(20, 241, 149, 0.2)
              `,
            }}
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 100px 20px rgba(20, 241, 149, 0.8)',
                  '0 0 150px 30px rgba(20, 241, 149, 1)',
                  '0 0 100px 20px rgba(20, 241, 149, 0.8)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute inset-0 rounded-3xl"
            />
          </motion.div>
        )}

        {/* Tour card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10002] 
                     w-full max-w-2xl bg-gradient-to-br from-black/95 via-gray-900/95 to-black/95 
                     backdrop-blur-2xl border-2 border-cyan-500/50 
                     rounded-3xl shadow-2xl shadow-cyan-500/50 p-10
                     relative overflow-hidden"
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-cyan-500/5 opacity-50" />
          <div className="absolute inset-0 diagonal-stripes opacity-5" />

          {/* Close button */}
          <button
            onClick={skip}
            className="absolute top-6 right-6 text-cyan-400 hover:text-white transition-colors z-10
                       p-2 rounded-lg hover:bg-cyan-500/10"
            aria-label="Skip tour"
          >
            <X size={32} weight="bold" />
          </button>

          {/* Content */}
          <div className="relative z-10">
            <motion.h2
              key={step}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black uppercase tracking-wider mb-6
                         bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 
                         bg-clip-text text-transparent
                         animate-gradient"
              style={{
                backgroundSize: '200% 200%',
              }}
            >
              {currentStep.title}
            </motion.h2>

            <motion.p
              key={`content-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-300 mb-10 leading-relaxed"
            >
              {currentStep.content}
            </motion.p>

            {/* Progress dots */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex gap-2">
                {steps.map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: i === step ? 1.2 : 1 }}
                    className={cn(
                      'w-3 h-3 rounded-full transition-all',
                      i === step
                        ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50'
                        : 'bg-gray-600'
                    )}
                  />
                ))}
              </div>

              {/* Step counter */}
              <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">
                {step + 1} / {steps.length}
              </span>
            </div>

            {/* Action button */}
            <button
              onClick={next}
              className={cn(
                'w-full py-5 px-10 rounded-2xl text-2xl font-black uppercase tracking-wider',
                'bg-gradient-to-r from-cyan-500 via-purple-600 to-cyan-500',
                'hover:scale-105 active:scale-95 transition-all duration-300',
                'shadow-lg shadow-cyan-500/50',
                'flex items-center justify-center gap-4',
                'animate-gradient'
              )}
              style={{
                backgroundSize: '200% 200%',
              }}
            >
              {step === steps.length - 1 ? 'LAUNCH COCKPIT' : 'NEXT'}
              <ArrowRight size={32} weight="bold" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

