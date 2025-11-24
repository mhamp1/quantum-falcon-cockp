// NUCLEAR LEGAL MODAL REBUILD — Exact replica with perfect aesthetic
// November 22, 2025 — Quantum Falcon Cockpit

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useKVSafe as useKV } from '@/hooks/useKVFallback';

const riskDisclosure = `QUANTUM FALCON – RISK DISCLOSURE STATEMENT

Last Updated: November 22, 2025

⚠️ THIS IS A LEGALLY BINDING ACKNOWLEDGEMENT OF RISK ⚠️

BY USING QUANTUM FALCON, YOU EXPLICITLY ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND ACCEPT ALL RISKS DESCRIBED BELOW.

THIS DOCUMENT CONSTITUTES A LEGALLY BINDING AGREEMENT. BY ACCEPTING, YOU WAIVE CERTAIN LEGAL RIGHTS AND AGREE TO BINDING ARBITRATION.`;

const termsOfService = `QUANTUM FALCON TERMS OF SERVICE

Last Updated: November 22, 2025

IMPORTANT — READ CAREFULLY: This Terms of Service Agreement ("Agreement") constitutes a legally binding contract between you ("User", "you") and Quantum Falcon Ltd., a Delaware corporation with registered office at 8 The Green, Ste A, Dover, DE 19901, USA ("Quantum Falcon", "we", "us", "our").

BY ACCESSING OR USING THE QUANTUM FALCON WEBSITE, WEB APPLICATION, MOBILE APPLICATION, API, OR ANY ASSOCIATED SERVICES ("Services"), YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THIS AGREEMENT.`;

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
  const [acceptanceLog, setAcceptanceLog] = useKV<LegalAcceptanceLog[]>('legal-acceptance-log', []);

  const allChecked = Object.values(checks).every(Boolean);

  // Auto-close and log when all 4 checkboxes are checked
  useEffect(() => {
    if (allChecked) {
      // Log acceptance for tax/legal purposes
      const logEntry: LegalAcceptanceLog = {
        timestamp: Date.now(),
        version: '2025-11-22',
        userAgent: navigator.userAgent,
        checks: { ...checks }
      };

      setAcceptanceLog(prev => [...prev, logEntry]);

      // Auto-close after 500ms to show the button enabled state
      const timer = setTimeout(() => {
        onAccept();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [allChecked, checks, onAccept, setAcceptanceLog]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-black border-4 border-red-600/80 rounded-3xl shadow-2xl shadow-red-600/50"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-900/80 to-black p-8 text-center border-b-4 border-red-600">
          <h1 className="text-6xl font-bold text-red-500 tracking-wider animate-pulse">
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
              'flex-1 py-6 text-2xl font-bold transition-all',
              tab === 'risk'
                ? 'bg-gradient-to-b from-cyan-900/50 to-transparent text-cyan-400'
                : 'text-gray-500 hover:text-white'
            )}
          >
            RISK DISCLOSURE
          </button>
          <button
            onClick={() => setTab('terms')}
            className={cn(
              'flex-1 py-6 text-2xl font-bold transition-all',
              tab === 'terms'
                ? 'bg-gradient-to-b from-cyan-900/50 to-transparent text-cyan-400'
                : 'text-gray-500 hover:text-white'
            )}
          >
            TERMS OF SERVICE
          </button>
        </div>

        {/* Content */}
        <div className="p-10 text-cyan-300 text-lg leading-relaxed max-h-96 overflow-y-auto bg-gradient-to-b from-black/90 to-black scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-black/50">
          <pre className="whitespace-pre-wrap font-mono">{tab === 'risk' ? riskDisclosure : termsOfService}</pre>
        </div>

        {/* Checkboxes */}
        <div className="p-10 space-y-6 bg-black/95 border-t-4 border-red-600">
          {[
            "I am 18+ years old and have fully read and understand the Risk Disclosure",
            "I understand trading can result in 100% loss of capital and accept full responsibility for all trading outcomes",
            "I am not relying on Quantum Falcon for financial advice and will never hold developers, contributors, or affiliates liable",
            "I have read and agree to be bound by the Terms of Service and Privacy Policy"
          ].map((text, i) => {
            const checkKeys = ['age', 'risk', 'advice', 'terms'] as const;
            const checkKey = checkKeys[i];
            
            return (
              <label key={i} className="flex items-center gap-6 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checks[checkKey]}
                  onChange={(e) => setChecks(prev => ({ ...prev, [checkKey]: e.target.checked }))}
                  className="w-8 h-8 accent-cyan-500 cursor-pointer"
                />
                <span className="text-lg text-gray-300">{text}</span>
              </label>
            );
          })}

          <button
            onClick={allChecked ? onAccept : () => {}}
            disabled={!allChecked}
            className={cn(
              'mt-10 w-full py-8 text-3xl font-bold rounded-2xl transition-all',
              allChecked
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-105 shadow-2xl shadow-cyan-500/50 cursor-pointer'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            )}
          >
            {allChecked ? 'I ACCEPT & ENTER COCKPIT →' : 'Complete all checkboxes to continue'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
