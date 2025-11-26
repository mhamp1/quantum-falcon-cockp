// LEGAL AGREEMENT MODAL — REBUILT FROM SCRATCH
// November 26, 2025 — Quantum Falcon Cockpit v2025.1.0
// ELITE VERSION: Beautiful, functional, mobile-perfect

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Warning, CheckCircle, SignOut, ShieldCheck, Scroll } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

// ============================================================================
// LEGAL CONTENT - COMPLETE RISK DISCLOSURE
// ============================================================================
const RISK_DISCLOSURE = `QUANTUM FALCON – RISK DISCLOSURE STATEMENT
Last Updated: November 22, 2025

⚠️ THIS IS A LEGALLY BINDING ACKNOWLEDGEMENT OF RISK ⚠️

BY USING QUANTUM FALCON, YOU EXPLICITLY ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND ACCEPT ALL RISKS DESCRIBED BELOW.

THIS DOCUMENT CONSTITUTES A LEGALLY BINDING AGREEMENT. BY ACCEPTING, YOU WAIVE CERTAIN LEGAL RIGHTS AND AGREE TO BINDING ARBITRATION.

TRADING CRYPTOCURRENCIES AND USING AUTOMATED TOOLS INVOLVES A HIGH RISK OF FINANCIAL LOSS, INCLUDING THE TOTAL LOSS OF ALL INVESTED CAPITAL. YOU MAY LOSE MORE THAN YOUR INITIAL INVESTMENT IF USING LEVERAGE OR MARGIN.

1. NO INVESTMENT ADVICE & NO GUARANTEES

1.1 Quantum Falcon is NOT a registered investment adviser, broker-dealer, commodity trading advisor, or futures commission merchant under U.S. or international law.

1.2 Nothing on the Platform constitutes financial, investment, legal, tax, or accounting advice.

1.3 All signals, predictions, backtests, paper-trading results, and "Neural Forecast" outputs are hypothetical and for educational purposes only.

1.4 PAST PERFORMANCE, WHETHER REAL OR SIMULATED, IS NOT INDICATIVE OF FUTURE RESULTS. THERE IS NO GUARANTEE OF PROFIT.

2. COMPLETE LOSS OF CAPITAL IS POSSIBLE

2.1 You can lose 100% (or more if using leverage/margin on connected exchanges) of all funds connected via API keys.

2.2 Automated strategies can execute trades rapidly and repeatedly during extreme volatility, flash crashes, or exchange outages, resulting in catastrophic losses in minutes or seconds.

3. SPECIFIC CRYPTOCURRENCY & MARKET RISKS

3.1 Extreme Volatility – Prices can move 20–50%+ in hours.

3.2 Liquidity Risk – Some assets may become impossible to sell at any price.

3.3 Leverage & Liquidation Risk – If you enable leverage on a connected exchange, positions can be forcibly liquidated.

3.4 Counterparty & Exchange Risk – Hacks, bankruptcies (e.g., FTX 2022), or withdrawal freezes can permanently destroy value.

3.5 Regulatory Risk – Governments may ban, restrict, or seize cryptocurrencies without warning.

3.6 Smart Contract & Protocol Risk – Bugs, exploits, or rug-pulls in DeFi protocols can cause instant total loss.

4. AUTOMATION & TECHNICAL RISKS

4.1 Strategy Malfunction – Bugs, latency, or incorrect parameters can cause the bot to buy high, sell low, or loop uncontrollably.

4.2 API & Connectivity Risk – Exchange API changes, rate-limits, or internet outages can prevent stop-loss execution.

4.3 "Fat Finger" Errors – Misconfigured risk settings can execute unintended million-dollar orders.

4.4 Black-Swan Events – The Platform has no control over oracle failures, chain reorgs, or 90% market crashes.

5. NO INSURANCE & NO RECOURSE

5.1 Funds on exchanges are NOT insured by FDIC, SIPC, or any government program.

5.2 Quantum Falcon does NOT custody funds and provides ZERO compensation for any losses, under ANY circumstances.

5.3 SECURITY & PRIVATE KEYS: WE NEVER STORE YOUR PRIVATE KEYS. All transaction signing occurs client-side in your wallet.

5.4 NO REFUNDS: All subscription fees, license fees, and payments are NON-REFUNDABLE.

6. COMPLETE LIABILITY WAIVER

YOU EXPRESSLY WAIVE ALL CLAIMS, DEMANDS, AND CAUSES OF ACTION AGAINST QUANTUM FALCON, ITS CREATORS, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES, SUBSIDIARIES, AND ASSIGNS FOR ANY AND ALL LOSSES, DAMAGES, OR INJURIES ARISING FROM YOUR USE OF THE PLATFORM.

7. ARBITRATION AND CLASS ACTION WAIVER

ANY DISPUTE ARISING FROM OR RELATING TO THIS AGREEMENT SHALL BE RESOLVED EXCLUSIVELY THROUGH BINDING ARBITRATION IN DELAWARE, USA. YOU WAIVE YOUR RIGHT TO A TRIAL BY JURY AND TO PARTICIPATE IN CLASS ACTIONS.`

// ============================================================================
// LEGAL CONTENT - COMPLETE TERMS OF SERVICE
// ============================================================================
const TERMS_OF_SERVICE = `QUANTUM FALCON TERMS OF SERVICE
Last Updated: November 22, 2025

IMPORTANT – READ CAREFULLY: This Terms of Service Agreement ("Agreement") constitutes a legally binding contract between you ("User", "you") and Quantum Falcon Ltd., a Delaware corporation with registered office at 8 The Green, Ste A, Dover, DE 19901, USA ("Quantum Falcon", "we", "us", "our").

BY ACCESSING OR USING THE QUANTUM FALCON WEBSITE, WEB APPLICATION, MOBILE APPLICATION, API, OR ANY ASSOCIATED SERVICES (collectively, the "Platform"), YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THIS AGREEMENT, OUR PRIVACY POLICY, AND RISK DISCLOSURE.

1. ELIGIBILITY

1.1 You must be at least 18 years old and have full legal capacity to enter into this Agreement.

1.2 You represent that you are not located in, or a citizen/resident of, any jurisdiction where use of the Platform would violate applicable law.

2. LICENSE GRANT & RESTRICTIONS

2.1 Quantum Falcon grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Platform solely for your personal use.

2.2 You shall NOT: 
(a) reverse engineer, decompile, or attempt to extract source code
(b) use automated bots, scrapers, or data-mining tools
(c) resell, white-label, or redistribute access
(d) remove or alter any proprietary notices
(e) interfere with Platform security or operation

3. PAPER TRADING & LIVE TRADING

3.1 The default mode is simulated "paper trading" using virtual funds. No real capital is at risk in paper mode.

3.2 Live trading occurs ONLY when you explicitly connect a real cryptocurrency exchange/wallet via API keys.

3.3 QUANTUM FALCON DOES NOT HOLD, CUSTODY, OR CONTROL USER FUNDS AT ANY TIME.

4. NO INVESTMENT ADVICE OR BROKERAGE

4.1 The Platform provides information and automation tools for educational purposes only.

4.2 Nothing on the Platform constitutes financial, investment, legal, or tax advice.

4.3 Quantum Falcon is NOT a registered broker-dealer, investment advisor, or money transmitter.

5. DISCLAIMER OF WARRANTIES

THE PLATFORM IS PROVIDED "AS-IS" AND "AS-AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, OR NON-INFRINGEMENT.

6. LIMITATION OF LIABILITY

IN NO EVENT SHALL QUANTUM FALCON, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.

OUR TOTAL CUMULATIVE LIABILITY SHALL NOT EXCEED THE GREATER OF $100 USD OR THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS.

7. INDEMNIFICATION

You agree to indemnify, defend, and hold harmless Quantum Falcon from and against any and all claims, demands, losses, liabilities, damages, costs, and expenses arising from your use of the Platform.

8. CLASS ACTION WAIVER & ARBITRATION

Any dispute shall be resolved by binding arbitration in Delaware under AAA rules on an individual basis. YOU WAIVE THE RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT.

9. TERMINATION

We may suspend or terminate your access immediately, without notice, for any reason.

10. GOVERNING LAW

This Agreement is governed by the laws of the State of Delaware, USA.

11. CHANGES TO TERMS

We may modify this Agreement at any time. Continued use after changes constitutes acceptance.

12. CONTACT

For questions about these terms, contact: legal@quantumfalcon.ai`

// ============================================================================
// ACCEPTANCE LOG INTERFACE
// ============================================================================
interface LegalAcceptanceLog {
  timestamp: number
  version: string
  userAgent: string
  checks: {
    age: boolean
    risk: boolean
    advice: boolean
    terms: boolean
  }
}

// ============================================================================
// MODAL PROPS
// ============================================================================
interface LegalAgreementModalProps {
  isOpen: boolean
  onAccept: () => void
  onDecline?: () => void
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function LegalAgreementModal({ 
  isOpen, 
  onAccept, 
  onDecline 
}: LegalAgreementModalProps) {
  const [activeTab, setActiveTab] = useState<'risk' | 'terms'>('risk')
  const [checks, setChecks] = useState({
    age: false,
    risk: false,
    advice: false,
    terms: false
  })
  const [acceptanceLog, setAcceptanceLog] = useKV<LegalAcceptanceLog[]>('legal-acceptance-log-v2', [])
  const contentRef = useRef<HTMLDivElement>(null)

  const allChecked = checks.age && checks.risk && checks.advice && checks.terms

  // Reset scroll when tab changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [activeTab])

  // Handle accept
  const handleAccept = () => {
    if (!allChecked) {
      toast.error('Please accept all terms to continue', {
        description: 'You must check all 4 boxes before proceeding',
        duration: 3000,
      })
      return
    }

    // Log acceptance
    const logEntry: LegalAcceptanceLog = {
      timestamp: Date.now(),
      version: '2025-11-26-v2',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      checks: { ...checks }
    }

    setAcceptanceLog(prev => [...(prev || []), logEntry])

    // Store in localStorage for extra persistence
    try {
      localStorage.setItem('legal-accepted-v2', 'true')
      localStorage.setItem('legal-accepted-timestamp', Date.now().toString())
    } catch (e) {
      // Silent fail
    }

    // Show success
    toast.success('🎉 Legal Agreements Accepted!', {
      description: 'Welcome to Quantum Falcon. Let\'s fly!',
      duration: 3000,
    })

    // Call callback
    onAccept()
  }

  // Handle decline
  const handleDecline = () => {
    toast.error('Access Denied', {
      description: 'You must accept the legal agreements to use Quantum Falcon',
      duration: 5000,
    })
    if (onDecline) {
      onDecline()
    } else {
      // Redirect to homepage or close
      window.location.href = 'https://quantumfalcon.ai'
    }
  }

  // Toggle checkbox
  const toggleCheck = (key: keyof typeof checks) => {
    setChecks(prev => {
      const newValue = !prev[key]
      if (newValue) {
        toast.success('✓', { duration: 500 })
      }
      return { ...prev, [key]: newValue }
    })
  }

  if (!isOpen) return null

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="legal-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/98 backdrop-blur-md p-2 sm:p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-4xl my-auto"
          >
            {/* Animated gradient border */}
            <div className="absolute -inset-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 rounded-2xl opacity-75 blur-sm animate-pulse" />
            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 rounded-2xl" 
                 style={{ backgroundSize: '200% 100%', animation: 'shimmer 3s linear infinite' }} />
            
            {/* Main card */}
            <div className="relative bg-black rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-red-900/90 via-black to-red-900/90 p-4 sm:p-6 md:p-8 text-center border-b-2 border-red-500/50">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="inline-block mb-3"
                >
                  <Warning size={48} weight="fill" className="text-yellow-400 animate-pulse mx-auto" />
                </motion.div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 tracking-wider uppercase font-orbitron">
                  Legal Agreements Required
                </h1>
                <p className="text-red-300/80 mt-2 text-sm sm:text-base">
                  You must read and accept both documents to continue
                </p>
              </div>

              {/* Tab buttons */}
              <div className="flex bg-black/90 border-b border-cyan-500/30">
                <button
                  onClick={() => setActiveTab('risk')}
                  className={cn(
                    'flex-1 py-3 sm:py-4 text-sm sm:text-lg font-bold uppercase tracking-wider transition-all relative flex items-center justify-center gap-2',
                    activeTab === 'risk'
                      ? 'bg-gradient-to-b from-cyan-900/50 to-transparent text-cyan-400 border-b-2 border-cyan-400'
                      : 'text-gray-500 hover:text-cyan-300 hover:bg-cyan-900/20'
                  )}
                >
                  <ShieldCheck size={20} weight={activeTab === 'risk' ? 'fill' : 'regular'} />
                  Risk Disclosure
                </button>
                <button
                  onClick={() => setActiveTab('terms')}
                  className={cn(
                    'flex-1 py-3 sm:py-4 text-sm sm:text-lg font-bold uppercase tracking-wider transition-all relative flex items-center justify-center gap-2',
                    activeTab === 'terms'
                      ? 'bg-gradient-to-b from-cyan-900/50 to-transparent text-cyan-400 border-b-2 border-cyan-400'
                      : 'text-gray-500 hover:text-cyan-300 hover:bg-cyan-900/20'
                  )}
                >
                  <Scroll size={20} weight={activeTab === 'terms' ? 'fill' : 'regular'} />
                  Terms of Service
                </button>
              </div>

              {/* Document content */}
              <div
                ref={contentRef}
                className="h-48 sm:h-56 md:h-64 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-gray-900/50 to-black text-cyan-300/90 scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-black/50"
              >
                <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm leading-relaxed">
                  {activeTab === 'risk' ? RISK_DISCLOSURE : TERMS_OF_SERVICE}
                </pre>
              </div>

              {/* Checkboxes */}
              <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 bg-black border-t-2 border-red-500/30">
                {[
                  { key: 'age', text: 'I am 18+ years old and have fully read and understand the Risk Disclosure' },
                  { key: 'risk', text: 'I understand trading can result in 100% loss of capital and accept full responsibility for all trading outcomes' },
                  { key: 'advice', text: 'I am not relying on Quantum Falcon for financial advice and will never hold developers, contributors, or affiliates liable' },
                  { key: 'terms', text: 'I have read and agree to be bound by the Terms of Service and Privacy Policy' }
                ].map(({ key, text }) => {
                  const checkKey = key as keyof typeof checks
                  const isChecked = checks[checkKey]
                  
                  return (
                    <label 
                      key={key} 
                      className="flex items-start gap-3 cursor-pointer select-none group min-h-[44px] touch-manipulation"
                      onClick={() => toggleCheck(checkKey)}
                    >
                      <div className="relative flex-shrink-0 mt-0.5">
                        <div className={cn(
                          'w-6 h-6 sm:w-7 sm:h-7 border-2 rounded-md flex items-center justify-center transition-all duration-200',
                          isChecked
                            ? 'bg-gradient-to-br from-cyan-500 to-purple-600 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                            : 'bg-transparent border-cyan-500/50 group-hover:border-cyan-400 group-hover:shadow-[0_0_5px_rgba(6,182,212,0.3)]'
                        )}>
                          {isChecked && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 500 }}
                            >
                              <CheckCircle size={18} weight="fill" className="text-white" />
                            </motion.div>
                          )}
                        </div>
                      </div>
                      <span className={cn(
                        'text-sm sm:text-base leading-snug transition-colors',
                        isChecked ? 'text-cyan-300' : 'text-gray-400 group-hover:text-gray-200'
                      )}>
                        {text}
                      </span>
                    </label>
                  )
                })}

                {/* Progress indicator */}
                <div className="flex items-center gap-2 pt-2">
                  <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${Object.values(checks).filter(Boolean).length * 25}%` }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {Object.values(checks).filter(Boolean).length}/4
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 sm:p-6 bg-gradient-to-t from-gray-900/50 to-black border-t border-cyan-500/20">
                {/* Main accept button */}
                <Button
                  onClick={handleAccept}
                  disabled={!allChecked}
                  size="lg"
                  className={cn(
                    'w-full min-h-[56px] sm:min-h-[64px] text-base sm:text-xl font-black rounded-xl transition-all uppercase tracking-wider relative overflow-hidden',
                    allChecked
                      ? 'bg-gradient-to-r from-cyan-500 via-purple-600 to-cyan-500 hover:from-cyan-400 hover:via-purple-500 hover:to-cyan-400 text-white shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_50px_rgba(6,182,212,0.7)] hover:scale-[1.02] border-2 border-cyan-400'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed border-2 border-gray-700'
                  )}
                  style={allChecked ? { backgroundSize: '200% 100%', animation: 'shimmer 2s linear infinite' } : {}}
                >
                  {allChecked ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle size={24} weight="fill" />
                      I Accept & Continue
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Warning size={20} weight="fill" />
                      Check all boxes to continue
                    </span>
                  )}
                </Button>

                {/* Decline link */}
                <div className="mt-4 text-center">
                  <button
                    onClick={handleDecline}
                    className="text-red-400/70 hover:text-red-400 text-sm font-medium transition-colors flex items-center justify-center gap-1 mx-auto group"
                  >
                    <SignOut size={16} className="group-hover:translate-x-[-2px] transition-transform" />
                    Decline and Exit
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CSS for shimmer animation */}
          <style>{`
            @keyframes shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

