// LEGAL AGREEMENTS MODAL — REBUILT FROM SCRATCH
// November 22, 2025 — Quantum Falcon Cockpit v2025.1.0
// Complete rebuild with working Accept button and enhanced UX

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useKVSafe as useKV } from '@/hooks/useKVFallback';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const riskDisclosure = `QUANTUM FALCON – RISK DISCLOSURE STATEMENT

Last Updated: November 22, 2025

⚠️ THIS IS A LEGALLY BINDING ACKNOWLEDGEMENT OF RISK ⚠️

BY USING QUANTUM FALCON, YOU EXPLICITLY ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND ACCEPT ALL RISKS DESCRIBED BELOW.

THIS DOCUMENT CONSTITUTES A LEGALLY BINDING AGREEMENT. BY ACCEPTING, YOU WAIVE CERTAIN LEGAL RIGHTS AND AGREE TO BINDING ARBITRATION.

1. TRADING RISKS
   - Cryptocurrency trading involves substantial risk of loss
   - You may lose 100% of your capital
   - Past performance does not guarantee future results
   - Market volatility can result in rapid losses

2. AUTOMATED TRADING RISKS
   - AI trading bots can execute trades without human intervention
   - Technical failures may result in unintended trades
   - Network latency can affect trade execution
   - Smart contract bugs may result in fund loss

3. NO GUARANTEES
   - Quantum Falcon does not guarantee profits
   - Trading results are not guaranteed
   - Market conditions can change rapidly
   - You are solely responsible for all trading decisions

4. LIABILITY WAIVER
   - You waive all claims against Quantum Falcon, its developers, and affiliates
   - Quantum Falcon is not liable for trading losses
   - You accept full responsibility for all trading outcomes
   - No financial advice is provided`;

const termsOfService = `QUANTUM FALCON TERMS OF SERVICE

Last Updated: November 22, 2025

IMPORTANT — READ CAREFULLY: This Terms of Service Agreement ("Agreement") constitutes a legally binding contract between you ("User", "you") and Quantum Falcon Ltd., a Delaware corporation with registered office at 8 The Green, Ste A, Dover, DE 19901, USA ("Quantum Falcon", "we", "us", "our").

BY ACCESSING OR USING THE QUANTUM FALCON WEBSITE, WEB APPLICATION, MOBILE APPLICATION, API, OR ANY ASSOCIATED SERVICES ("Services"), YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THIS AGREEMENT.

1. ACCEPTANCE OF TERMS
   By using Quantum Falcon, you agree to be bound by these Terms of Service and all applicable laws and regulations.

2. ELIGIBILITY
   You must be at least 18 years old to use Quantum Falcon. By using the Services, you represent and warrant that you are at least 18 years old.

3. USER ACCOUNTS
   - You are responsible for maintaining the confidentiality of your account
   - You are responsible for all activities under your account
   - You must notify us immediately of any unauthorized use

4. TRADING RESPONSIBILITY
   - You are solely responsible for all trading decisions
   - Quantum Falcon does not provide financial advice
   - You acknowledge that trading involves risk of loss
   - You accept full responsibility for all trading outcomes

5. INTELLECTUAL PROPERTY
   - All content on Quantum Falcon is protected by copyright
   - You may not reproduce or distribute any content without permission
   - Quantum Falcon retains all rights to its proprietary technology

6. PROHIBITED USES
   - You may not use Quantum Falcon for illegal purposes
   - You may not attempt to hack or disrupt the Services
   - You may not reverse engineer the software
   - You may not use automated systems to access the Services

7. DISCLAIMER OF WARRANTIES
   - Quantum Falcon is provided "as is" without warranties
   - We do not guarantee the Services will be uninterrupted or error-free
   - We do not guarantee trading results or profits

8. LIMITATION OF LIABILITY
   - Quantum Falcon is not liable for any trading losses
   - Our liability is limited to the maximum extent permitted by law
   - You waive all claims against Quantum Falcon and its affiliates

9. TERMINATION
   We may suspend or terminate your access immediately, without notice, for any reason, including suspected violation of this Agreement.

10. GOVERNING LAW
    This Agreement is governed by the laws of the State of Delaware, USA, excluding conflict of law principles.

11. CHANGES TO TERMS
    We may modify this Agreement at any time. Continued use after changes constitutes acceptance.

12. CONTACT INFORMATION
    For questions about these terms, contact: legal@quantumfalcon.ai`;

interface LegalAgreementsModalProps {
  onAccept: () => void;
  isOpen?: boolean;
}

interface LegalAcceptanceLog {
  timestamp: number;
  version: string;
  userId?: string;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
  checks: {
    age: boolean;
    risk: boolean;
    advice: boolean;
    terms: boolean;
  };
}

export default function LegalAgreementsModal({ onAccept, isOpen = true }: LegalAgreementsModalProps) {
  const [tab, setTab] = useState<'risk' | 'terms'>('risk');
  const [checks, setChecks] = useState({
    age: false,
    risk: false,
    advice: false,
    terms: false
  });
  const [hasScrolled, setHasScrolled] = useState(false);
  const [acceptanceLog, setAcceptanceLog] = useKV<LegalAcceptanceLog[]>('legal-acceptance-log', []);
  const contentRef = useRef<HTMLDivElement>(null);

  const allChecked = Object.values(checks).every(Boolean);

  // Track scrolling to ensure user has read the content
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const handleScroll = () => {
      const scrolled = content.scrollTop + content.clientHeight >= content.scrollHeight - 50;
      setHasScrolled(scrolled);
    };

    content.addEventListener('scroll', handleScroll);
    return () => content.removeEventListener('scroll', handleScroll);
  }, [tab]);

  // Reset scroll tracking when tab changes
  useEffect(() => {
    setHasScrolled(false);
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [tab]);

  const handleAccept = () => {
    if (!allChecked) {
      toast.error('Please check all boxes to continue', {
        description: 'You must accept all terms to proceed',
      });
      return;
    }

    // Log acceptance for tax/legal purposes
    const logEntry: LegalAcceptanceLog = {
      timestamp: Date.now(),
      version: '2025-11-22',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      checks: { ...checks }
    };

    setAcceptanceLog(prev => [...prev, logEntry]);

    // Show success toast
    toast.success('Legal Agreements Accepted', {
      description: 'You can now access the Quantum Falcon Cockpit',
      duration: 3000,
    });

    // Call onAccept callback
    onAccept();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="legal-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={(e) => {
            // Prevent closing by clicking outside
            if (e.target === e.currentTarget) {
              toast.info('Please accept the legal agreements to continue', {
                description: 'You must read and accept both documents',
              });
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-black border-4 border-red-600/80 rounded-3xl shadow-2xl shadow-red-600/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-900/80 to-black p-8 text-center border-b-4 border-red-600 relative">
              <div className="absolute top-4 right-4">
                <AlertTriangle size={32} weight="fill" className="text-yellow-400 animate-pulse" />
              </div>
              <h1 className="text-6xl font-bold text-red-500 tracking-wider animate-pulse mb-2">
                LEGAL AGREEMENTS REQUIRED
              </h1>
              <p className="text-xl text-red-300 mt-4">
                You must read and accept both documents to continue
              </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-black/90 border-b border-red-600">
              <button
                onClick={() => setTab('risk')}
                className={cn(
                  'flex-1 py-6 text-2xl font-bold transition-all relative',
                  tab === 'risk'
                    ? 'bg-gradient-to-b from-cyan-900/50 to-transparent text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-500 hover:text-white'
                )}
              >
                RISK DISCLOSURE
              </button>
              <button
                onClick={() => setTab('terms')}
                className={cn(
                  'flex-1 py-6 text-2xl font-bold transition-all relative',
                  tab === 'terms'
                    ? 'bg-gradient-to-b from-cyan-900/50 to-transparent text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-500 hover:text-white'
                )}
              >
                TERMS OF SERVICE
              </button>
            </div>

            {/* Content */}
            <div
              ref={contentRef}
              className="p-10 text-cyan-300 text-lg leading-relaxed max-h-96 overflow-y-auto bg-gradient-to-b from-black/90 to-black scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-black/50"
            >
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {tab === 'risk' ? riskDisclosure : termsOfService}
              </pre>
              {!hasScrolled && (
                <div className="mt-4 text-center text-yellow-400 text-sm animate-pulse">
                  ↓ Please scroll to read the full document ↓
                </div>
              )}
            </div>

            {/* Checkboxes */}
            <div className="p-10 space-y-6 bg-black/95 border-t-4 border-red-600">
              {[
                {
                  key: 'age',
                  text: "I am 18+ years old and have fully read and understand the Risk Disclosure"
                },
                {
                  key: 'risk',
                  text: "I understand trading can result in 100% loss of capital and accept full responsibility for all trading outcomes"
                },
                {
                  key: 'advice',
                  text: "I am not relying on Quantum Falcon for financial advice and will never hold developers, contributors, or affiliates liable"
                },
                {
                  key: 'terms',
                  text: "I have read and agree to be bound by the Terms of Service and Privacy Policy"
                }
              ].map(({ key, text }) => {
                const checkKey = key as keyof typeof checks;
                
                return (
                  <label key={key} className="flex items-start gap-6 cursor-pointer select-none group">
                    <div className="relative flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={checks[checkKey]}
                        onChange={(e) => {
                          setChecks(prev => ({ ...prev, [checkKey]: e.target.checked }));
                          if (e.target.checked) {
                            toast.success('Checkbox accepted', { duration: 1000 });
                          }
                        }}
                        className="w-8 h-8 accent-cyan-500 cursor-pointer opacity-0 absolute"
                      />
                      <div className={cn(
                        "w-8 h-8 border-2 rounded flex items-center justify-center transition-all",
                        checks[checkKey]
                          ? "bg-cyan-500 border-cyan-400"
                          : "bg-transparent border-cyan-500/50 group-hover:border-cyan-400"
                      )}>
                        {checks[checkKey] && (
                          <CheckCircle size={24} weight="fill" className="text-white" />
                        )}
                      </div>
                    </div>
                    <span className="text-lg text-gray-300 flex-1 leading-relaxed">{text}</span>
                  </label>
                );
              })}

              {/* ACCEPT BUTTON - ALWAYS VISIBLE */}
              <Button
                onClick={handleAccept}
                disabled={!allChecked}
                size="lg"
                className={cn(
                  'mt-10 w-full py-8 text-3xl font-bold rounded-2xl transition-all uppercase tracking-wider',
                  allChecked
                    ? 'bg-gradient-to-r from-cyan-500 via-purple-600 to-cyan-500 hover:scale-105 shadow-2xl shadow-cyan-500/50 cursor-pointer animate-pulse'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                )}
              >
                {allChecked ? (
                  <>
                    <CheckCircle size={32} weight="fill" className="mr-3" />
                    I ACCEPT & ENTER COCKPIT
                  </>
                ) : (
                  'Complete all checkboxes to continue'
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
