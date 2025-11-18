import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Download, ArrowLeft } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import { toast } from 'sonner'

const LEGAL_VERSION = '2025-11-18'
const LAST_UPDATED = 'November 18, 2025'

const TERMS_CONTENT = `QUANTUM FALCON TERMS OF SERVICE
Last Updated: ${LAST_UPDATED}

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

3.3 QUANTUM FALCON DOES NOT HOLD, CUSTODY, OR CONTROL USER FUNDS AT ANY TIME.

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

7. INDEMNIFICATION

You agree to indemnify, defend, and hold harmless Quantum Falcon from any claims, losses, or damages arising from your violation of this Agreement, your use of the Platform, or your trading activity.

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

For questions about these terms, contact: legal@quantumfalcon.ai

Version: ${LEGAL_VERSION}`

export default function TermsOfService() {
  const exportToPDF = () => {
    try {
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text('Terms of Service', 20, 20)
      doc.setFontSize(10)
      const lines = doc.splitTextToSize(TERMS_CONTENT, 170)
      doc.text(lines, 20, 30)
      doc.save('Quantum_Falcon_Terms_of_Service.pdf')
      toast.success('PDF exported successfully')
    } catch (error) {
      console.error('PDF export failed:', error)
      toast.error('PDF export failed')
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-card border-2 border-primary/50 overflow-hidden"
        >
          <div className="p-6 border-b-2 border-primary/30 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="jagged-corner-small"
                >
                  <ArrowLeft size={20} />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold uppercase tracking-wide">Terms of Service</h1>
                  <p className="text-sm text-muted-foreground mt-1">Last Updated: {LAST_UPDATED}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                className="jagged-corner-small"
              >
                <Download size={16} className="mr-2" />
                Export PDF
              </Button>
            </div>
          </div>

          <ScrollArea className="h-[calc(100vh-12rem)] p-6">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {TERMS_CONTENT}
            </pre>
          </ScrollArea>
        </motion.div>
      </div>
    </div>
  )
}
