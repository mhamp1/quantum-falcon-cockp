import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface RiskDisclosureModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  version?: string
}

const RISK_DISCLOSURE_CONTENT = `QUANTUM FALCON – RISK DISCLOSURE STATEMENT
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

5.2 Quantum Falcon does NOT custody funds and provides ZERO compensation for any losses, under ANY circumstances, including but not limited to:
   - Software bugs or errors
   - Algorithmic failures
   - Market crashes or volatility
   - Exchange hacks or bankruptcies
   - Regulatory actions
   - Network outages
   - Data inaccuracies
   - Any other cause, whether foreseeable or not

5.3 SECURITY & PRIVATE KEYS: WE NEVER STORE YOUR PRIVATE KEYS. All transaction signing occurs client-side in your wallet. You maintain full custody of your assets at all times. We cannot and will not access your funds. You are solely responsible for securing your private keys and wallet.

5.4 NO REFUNDS: All subscription fees, license fees, and payments are NON-REFUNDABLE, regardless of trading outcomes, platform performance, or any other reason.

6. TAX & LEGAL COMPLIANCE

6.1 You are solely responsible for determining tax implications and reporting all gains/losses in your jurisdiction.

6.2 Use of the Platform may be illegal in certain countries (e.g., restricted jurisdictions).

7. PSYCHOLOGICAL & ADDICTION RISKS

7.1 Automated trading can create false confidence and encourage over-trading or gambling-like behavior.

8. COMPLETE LIABILITY WAIVER

8.1 YOU EXPRESSLY WAIVE ALL CLAIMS, DEMANDS, AND CAUSES OF ACTION AGAINST QUANTUM FALCON, ITS CREATORS, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES, SUBSIDIARIES, AND ASSIGNS (COLLECTIVELY, "RELEASED PARTIES") FOR ANY AND ALL LOSSES, DAMAGES, OR INJURIES ARISING FROM YOUR USE OF THE PLATFORM.

8.2 YOU AGREE THAT THE RELEASED PARTIES SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
   - Loss of profits, revenue, or cryptocurrency
   - Loss of data or information
   - Trading losses of any kind
   - Emotional distress or mental anguish
   - Business interruption
   - Any other damages, regardless of the theory of liability

8.3 THIS WAIVER APPLIES TO ALL CLAIMS, WHETHER BASED ON CONTRACT, TORT, STATUTE, OR ANY OTHER LEGAL THEORY, EVEN IF THE RELEASED PARTIES HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

9. INDEMNIFICATION

9.1 YOU AGREE TO INDEMNIFY, DEFEND, AND HOLD HARMLESS THE RELEASED PARTIES FROM AND AGAINST ANY AND ALL CLAIMS, DEMANDS, LOSSES, LIABILITIES, AND EXPENSES (INCLUDING ATTORNEYS' FEES) ARISING FROM:
   - Your use of the Platform
   - Your violation of these terms
   - Your violation of any law or regulation
   - Your trading activities
   - Any claims made by third parties related to your use of the Platform

10. ARBITRATION AND CLASS ACTION WAIVER

10.1 ANY DISPUTE ARISING FROM OR RELATING TO THIS AGREEMENT OR YOUR USE OF THE PLATFORM SHALL BE RESOLVED EXCLUSIVELY THROUGH BINDING ARBITRATION IN DELAWARE, USA, UNDER THE RULES OF THE AMERICAN ARBITRATION ASSOCIATION.

10.2 YOU WAIVE YOUR RIGHT TO:
   - A trial by jury
   - Participate in a class action lawsuit
   - Participate in class-wide arbitration
   - Bring claims on behalf of others

10.3 YOU AGREE THAT ALL DISPUTES WILL BE RESOLVED ON AN INDIVIDUAL BASIS ONLY.

FINAL ACKNOWLEDGEMENT (REQUIRED)

I understand that cryptocurrency trading and the use of automated tools can result in the rapid and complete loss of all invested capital. I accept full and sole responsibility for all trading outcomes. I will only risk money I can afford to lose entirely.

I have read, understood, and agree to be bound by this Risk Disclosure Statement. I acknowledge that this is a legally binding agreement and that I am waiving certain legal rights by accepting these terms.

I understand that Quantum Falcon, its creators, and all related parties are not liable for any losses, damages, or injuries arising from my use of the Platform, regardless of cause.

I agree to indemnify and hold harmless Quantum Falcon from all claims arising from my use of the Platform.

I agree to resolve all disputes through binding arbitration in Delaware, USA, and waive my right to participate in class actions.`

const TERMS_OF_SERVICE_CONTENT = `QUANTUM FALCON TERMS OF SERVICE
Last Updated: November 22, 2025

IMPORTANT – READ CAREFULLY: This Terms of Service Agreement ("Agreement") constitutes a legally binding contract between you ("User", "you") and Quantum Falcon Ltd., a Delaware corporation with registered office at 8 The Green, Ste A, Dover, DE 19901, USA ("Quantum Falcon", "we", "us", "our").

BY ACCESSING OR USING THE QUANTUM FALCON WEBSITE, WEB APPLICATION, MOBILE APPLICATION, API, OR ANY ASSOCIATED SERVICES (collectively, the "Platform"), YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THIS AGREEMENT, OUR PRIVACY POLICY, AND RISK DISCLOSURE. IF YOU DO NOT AGREE, YOU MUST IMMEDIATELY CEASE ALL USE OF THE PLATFORM.

1. ELIGIBILITY

1.1 You must be at least 18 years old and have full legal capacity to enter into this Agreement.

1.2 You represent that you are not located in, or a citizen/resident of, any jurisdiction where use of the Platform would violate applicable law (including but not limited to OFAC-sanctioned countries, FATF high-risk jurisdictions, or jurisdictions that prohibit cryptocurrency trading tools).

2. LICENSE GRANT & RESTRICTIONS

2.1 Quantum Falcon grants you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Platform solely for your personal, non-commercial use (or commercial use only if you hold a valid paid subscription tier).

2.2 You shall NOT: 
(a) reverse engineer, decompile, or attempt to extract source code
(b) use automated bots, scrapers, or data-mining tools
(c) resell, white-label, or redistribute access
(d) remove or alter any proprietary notices
(e) interfere with Platform security or operation

3. PAPER TRADING & LIVE TRADING

3.1 The default mode is simulated "paper trading" using virtual funds. No real capital is at risk in paper mode.

3.2 Live trading occurs ONLY when you explicitly connect a real cryptocurrency exchange/wallet via API keys or OAuth. You alone control those keys and bear 100% responsibility for any executed trades.

3.3 QUANTUM FALCON DOES NOT HOLD, CUSTODY, OR CONTROL USER FUNDS AT ANY TIME. WE NEVER STORE YOUR PRIVATE KEYS. All transaction signing occurs in your wallet, ensuring you maintain full custody and control of your assets.

4. NO INVESTMENT ADVICE OR BROKERAGE

4.1 The Platform provides information, signals, and automation tools for educational and entertainment purposes only.

4.2 Nothing on the Platform constitutes financial, investment, legal, or tax advice. You are solely responsible for evaluating the merits and risks of any trading decision.

4.3 Quantum Falcon is NOT a registered broker-dealer, investment advisor, or money transmitter under U.S. or international law.

5. DISCLAIMER OF WARRANTIES

THE PLATFORM IS PROVIDED "AS-IS" AND "AS-AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES.

6. LIMITATION OF LIABILITY

TO THE MAXIMUM EXTENT PERMITTED BY LAW:

6.1 IN NO EVENT SHALL QUANTUM FALCON, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR CRYPTOCURRENCY, EVEN IF ADVISED OF THE POSSIBILITY.

6.2 OUR TOTAL CUMULATIVE LIABILITY SHALL NOT EXCEED THE GREATER OF (A) $100 USD OR (B) THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS.

6.3 IN NO EVENT SHALL QUANTUM FALCON BE LIABLE FOR ANY TRADING LOSSES, REGARDLESS OF CAUSE, INCLUDING BUT NOT LIMITED TO:
   - Losses from automated trading bots
   - Losses from strategy execution
   - Losses from market volatility
   - Losses from exchange failures
   - Losses from software bugs or errors
   - Losses from data inaccuracies
   - Any other trading-related losses

6.4 THE LIMITATIONS IN THIS SECTION APPLY TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW AND SHALL SURVIVE TERMINATION OF THIS AGREEMENT.

7. INDEMNIFICATION

7.1 You agree to indemnify, defend, and hold harmless Quantum Falcon, its officers, directors, employees, agents, affiliates, subsidiaries, and assigns (collectively, "Indemnified Parties") from and against any and all claims, demands, losses, liabilities, damages, costs, and expenses (including reasonable attorneys' fees) arising from or relating to:
   - Your use of the Platform
   - Your violation of this Agreement
   - Your violation of any law, regulation, or third-party right
   - Your trading activities and decisions
   - Any claims made by third parties related to your use of the Platform
   - Any losses incurred by you or others as a result of your use of the Platform

7.2 This indemnification obligation shall survive termination of this Agreement and your use of the Platform.

7.3 You agree to cooperate fully with Quantum Falcon in the defense of any claim subject to indemnification under this section.

8. CLASS ACTION WAIVER & ARBITRATION

8.1 Any dispute shall be resolved by binding arbitration in Delaware under AAA rules on an individual basis.

8.2 YOU WAIVE THE RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION.

9. TERMINATION

We may suspend or terminate your access immediately, without notice, for any reason, including suspected violation of this Agreement.

10. GOVERNING LAW

This Agreement is governed by the laws of the State of Delaware, USA, excluding conflict of law principles.

11. CHANGES TO TERMS

We may modify this Agreement at any time. Continued use after changes constitutes acceptance.

12. CONTACT INFORMATION

For questions about these terms, contact: legal@quantumfalcon.ai`

export default function RiskDisclosureModal({ 
  isOpen, 
  onClose, 
  onAccept,
  version = '2025-11-22' 
}: RiskDisclosureModalProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [scrollProgressTos, setScrollProgressTos] = useState(0)
  const [check1, setCheck1] = useState(false)
  const [check2, setCheck2] = useState(false)
  const [check3, setCheck3] = useState(false)
  const [check4, setCheck4] = useState(false)
  const [canAccept, setCanAccept] = useState(false)
  const [canAcceptTos, setCanAcceptTos] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollRefTos = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setScrollProgress(0)
      setScrollProgressTos(0)
      setCheck1(false)
      setCheck2(false)
      setCheck3(false)
      setCanAccept(false)
      setCanAcceptTos(false)
    }
  }, [isOpen])

  const handleScroll = () => {
    if (!scrollRef.current) return
    
    const element = scrollRef.current
    const scrolled = element.scrollTop
    const total = element.scrollHeight - element.clientHeight
    const percent = total > 0 ? (scrolled / total) * 100 : 100
    
    setScrollProgress(Math.min(percent, 100))
    
    if (percent >= 98) {
      setCanAccept(true)
      console.log('[Risk Modal] ✅ User scrolled Risk Disclosure to 98%+ - checkbox now enabled')
    }
  }

  const handleScrollTos = () => {
    if (!scrollRefTos.current) return
    
    const element = scrollRefTos.current
    const scrolled = element.scrollTop
    const total = element.scrollHeight - element.clientHeight
    const percent = total > 0 ? (scrolled / total) * 100 : 100
    
    setScrollProgressTos(Math.min(percent, 100))
    
    if (percent >= 98) {
      setCanAcceptTos(true)
      console.log('[Risk Modal] ✅ User scrolled Terms of Service to 98%+ - checkbox now enabled')
    }
  }

  const isAcceptEnabled = check1 && check2 && check3 && canAccept && canAcceptTos

  const handleAccept = async () => {
    if (isAcceptEnabled) {
      console.log('[Risk Modal] ✅ User clicked "Accept & Continue" - all checkboxes checked')
      console.log('[Risk Modal] 📋 Check 1 (Read risk disclosure):', check1)
      console.log('[Risk Modal] 📋 Check 2 (Accept responsibility):', check2)
      console.log('[Risk Modal] 📋 Check 3 (Accept terms of service):', check3)
      console.log('[Risk Modal] 📊 Risk Disclosure scroll progress:', scrollProgress.toFixed(1) + '%')
      console.log('[Risk Modal] 📊 Terms of Service scroll progress:', scrollProgressTos.toFixed(1) + '%')
      
      try {
        await fetch('/api/legal/accept-risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            version,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            scrollProgressRisk: scrollProgress.toFixed(2),
            scrollProgressTos: scrollProgressTos.toFixed(2),
            acceptedBoth: true
          })
        })
      } catch (err) {
        console.log('[Risk Modal] Backend logging failed (OK - using KV):', err)
      }

      console.log('[Risk Modal] 🎉 Calling onAccept() - banner should now DISAPPEAR IMMEDIATELY')
      
      await onAccept()
      
      toast.success('Legal Agreements Accepted', {
        description: 'Risk Disclosure and Terms of Service accepted. Banner removed permanently.'
      })
      
      console.log('[Risk Modal] ✅ Modal closed - banner should be GONE')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/98 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              // Close on backdrop click
            }
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-4xl my-8 flex flex-col bg-card border-2 border-destructive shadow-[0_0_60px_rgba(255,0,102,0.5)] rounded-lg overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 4rem)' }}
          >
            <div className="p-8 text-center border-b-2 border-destructive/30 bg-destructive/10 flex-shrink-0">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: [0, -10, 10, -10, 0] }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-6xl mb-4"
              >
                ⚠️
              </motion.div>
              <h1 className="text-3xl font-bold uppercase tracking-wider text-destructive neon-glow-destructive mb-2">
                LEGAL AGREEMENTS REQUIRED
              </h1>
              <p className="text-lg text-muted-foreground">
                You must read and accept both documents to continue
              </p>
            </div>

            <Tabs defaultValue="risk" className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-2 mx-8 mt-4">
                <TabsTrigger value="risk" className="uppercase tracking-wide font-semibold">
                  Risk Disclosure
                </TabsTrigger>
                <TabsTrigger value="terms" className="uppercase tracking-wide font-semibold">
                  Terms of Service
                </TabsTrigger>
              </TabsList>

              <TabsContent value="risk" className="flex-1 flex flex-col mt-0">
                <div 
                  className="h-1.5 bg-destructive/30 relative overflow-hidden flex-shrink-0"
                  style={{ width: '100%' }}
                >
                  <motion.div
                    className="h-full bg-destructive shadow-[0_0_20px_rgba(255,0,102,0.8)]"
                    style={{ width: `${scrollProgress}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${scrollProgress}%` }}
                    transition={{ duration: 0.15 }}
                  />
                </div>
                <div 
                  ref={scrollRef}
                  onScroll={handleScroll}
                  className="flex-1 p-8 bg-background/50 overflow-y-auto scrollbar-thin"
                  style={{ maxHeight: 'calc(100vh - 32rem)' }}
                >
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
                    {RISK_DISCLOSURE_CONTENT}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="terms" className="flex-1 flex flex-col mt-0">
                <div 
                  className="h-1.5 bg-primary/30 relative overflow-hidden flex-shrink-0"
                  style={{ width: '100%' }}
                >
                  <motion.div
                    className="h-full bg-primary shadow-[0_0_20px_rgba(20,241,149,0.8)]"
                    style={{ width: `${scrollProgressTos}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${scrollProgressTos}%` }}
                    transition={{ duration: 0.15 }}
                  />
                </div>
                <div 
                  ref={scrollRefTos}
                  onScroll={handleScrollTos}
                  className="flex-1 p-8 bg-background/50 overflow-y-auto scrollbar-thin"
                  style={{ maxHeight: 'calc(100vh - 32rem)' }}
                >
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
                    {TERMS_OF_SERVICE_CONTENT}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>

            <div className="p-6 border-t-2 border-destructive/30 bg-destructive/10 space-y-4 flex-shrink-0">
              <div className={`space-y-3 transition-opacity ${(canAccept && canAcceptTos) ? 'opacity-100' : 'opacity-40'}`}>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <Checkbox
                    id="risk-check-1"
                    checked={check1}
                    onCheckedChange={(checked) => setCheck1(checked === true)}
                    disabled={!canAccept}
                    className="mt-1"
                  />
                  <span className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                    I am 18+ years old and have fully read and understand the Risk Disclosure
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <Checkbox
                    id="risk-check-2"
                    checked={check2}
                    onCheckedChange={(checked) => setCheck2(checked === true)}
                    disabled={!canAccept}
                    className="mt-1"
                  />
                  <span className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                    I understand trading can result in 100% loss of capital and accept full responsibility for all trading outcomes
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <Checkbox
                    id="risk-check-3"
                    checked={check3}
                    onCheckedChange={(checked) => setCheck3(checked === true)}
                    disabled={!canAccept}
                    className="mt-1"
                  />
                  <span className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                    I am not relying on Quantum Falcon for financial advice and will never hold developers, contributors, or affiliates liable
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <Checkbox
                    id="tos-check-4"
                    checked={check4}
                    onCheckedChange={(checked) => setCheck4(checked === true)}
                    disabled={!canAcceptTos}
                    className="mt-1"
                  />
                  <span className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                    I have read and agree to be bound by the Terms of Service and Privacy Policy
                  </span>
                </label>
              </div>

              {(!canAccept || !canAcceptTos) && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-center text-muted-foreground bg-muted/50 p-2 rounded"
                >
                  ⬇️ Scroll both documents to 98% to unlock acceptance
                  <br />
                  Risk: {scrollProgress.toFixed(0)}% | Terms: {scrollProgressTos.toFixed(0)}%
                </motion.p>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleAccept}
                  disabled={!isAcceptEnabled}
                  className={`flex-1 jagged-corner-small uppercase tracking-wider font-bold ${
                    isAcceptEnabled 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_rgba(20,241,149,0.5)] animate-pulse-glow' 
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                  size="lg"
                >
                  Accept Both & Continue
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
