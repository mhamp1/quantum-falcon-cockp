import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

interface RiskDisclosureModalProps {
  isOpen: boolean
  onClose: () => void
  onAccept: () => void
  version?: string
}

const RISK_DISCLOSURE_CONTENT = `QUANTUM FALCON – RISK DISCLOSURE STATEMENT
Last Updated: November 18, 2025

⚠️ THIS IS A LEGALLY BINDING ACKNOWLEDGEMENT OF RISK ⚠️
BY USING QUANTUM FALCON, YOU EXPLICITLY ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND ACCEPT ALL RISKS DESCRIBED BELOW.

TRADING CRYPTOCURRENCIES AND USING AUTOMATED TOOLS INVOLVES A HIGH RISK OF FINANCIAL LOSS, INCLUDING THE TOTAL LOSS OF ALL INVESTED CAPITAL.

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

5.2 Quantum Falcon does NOT custody funds and provides zero compensation for any losses, under any circumstances.

5.3 SECURITY & PRIVATE KEYS: WE NEVER STORE YOUR PRIVATE KEYS. All transaction signing occurs client-side in your wallet. You maintain full custody of your assets at all times. We cannot and will not access your funds.

6. TAX & LEGAL COMPLIANCE

6.1 You are solely responsible for determining tax implications and reporting all gains/losses in your jurisdiction.

6.2 Use of the Platform may be illegal in certain countries (e.g., restricted jurisdictions).

7. PSYCHOLOGICAL & ADDICTION RISKS

7.1 Automated trading can create false confidence and encourage over-trading or gambling-like behavior.

FINAL ACKNOWLEDGEMENT (REQUIRED)

I understand that cryptocurrency trading and the use of automated tools can result in the rapid and complete loss of all invested capital. I accept full and sole responsibility for all trading outcomes. I will only risk money I can afford to lose entirely.`

export default function RiskDisclosureModal({ 
  isOpen, 
  onClose, 
  onAccept,
  version = '2025-11-18' 
}: RiskDisclosureModalProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [check1, setCheck1] = useState(false)
  const [check2, setCheck2] = useState(false)
  const [canAccept, setCanAccept] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setScrollProgress(0)
      setCheck1(false)
      setCheck2(false)
      setCanAccept(false)
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
      console.log('[Risk Modal] ✅ User scrolled to 98%+ - checkboxes now enabled')
    }
  }

  const isAcceptEnabled = check1 && check2 && canAccept

  const handleAccept = async () => {
    if (isAcceptEnabled) {
      console.log('[Risk Modal] ✅ User clicked "Accept & Continue" - both checkboxes checked')
      console.log('[Risk Modal] 📋 Check 1 (Read disclosure):', check1)
      console.log('[Risk Modal] 📋 Check 2 (Accept responsibility):', check2)
      console.log('[Risk Modal] 📊 Scroll progress:', scrollProgress.toFixed(1) + '%')
      
      try {
        await fetch('/api/legal/accept-risk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            version,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            scrollProgress: scrollProgress.toFixed(2)
          })
        })
      } catch (err) {
        console.log('[Risk Modal] Backend logging failed (OK - using KV):', err)
      }

      console.log('[Risk Modal] 🎉 Calling onAccept() - banner should now DISAPPEAR IMMEDIATELY')
      
      await onAccept()
      
      toast.success('Risk Disclosure Accepted', {
        description: 'The warning banner has been removed permanently.'
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
                RISK DISCLOSURE STATEMENT
              </h1>
              <p className="text-lg text-muted-foreground">
                You may lose <span className="text-destructive font-bold">100% of your capital</span> – rapidly and completely
              </p>
            </div>

            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 p-8 bg-background/50 overflow-y-auto scrollbar-thin"
              style={{ maxHeight: 'calc(100vh - 28rem)' }}
            >
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
                {RISK_DISCLOSURE_CONTENT}
              </pre>
            </div>

            <div className="p-6 border-t-2 border-destructive/30 bg-destructive/10 space-y-4 flex-shrink-0">
              <div className={`space-y-3 transition-opacity ${canAccept ? 'opacity-100' : 'opacity-40'}`}>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <Checkbox
                    id="risk-check-1"
                    checked={check1}
                    onCheckedChange={(checked) => setCheck1(checked === true)}
                    disabled={!canAccept}
                    className="mt-1"
                  />
                  <span className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                    I have fully read and understand the Risk Disclosure above
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
                    I accept full responsibility for all trading losses and will never hold Quantum Falcon liable
                  </span>
                </label>
              </div>

              {!canAccept && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-center text-muted-foreground bg-muted/50 p-2 rounded"
                >
                  ⬇️ Scroll to at least 98% to unlock acceptance ({scrollProgress.toFixed(0)}% complete)
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
                  Accept & Continue
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
