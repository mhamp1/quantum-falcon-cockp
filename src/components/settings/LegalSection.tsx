import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Scales, FileText, Shield, WarningCircle, Download, MagnifyingGlass, Database, Trash } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import RiskDisclosureModal from '@/components/legal/RiskDisclosureModal'
import RiskAcknowledgmentLog from './RiskAcknowledgmentLog'

interface LegalSectionProps {
  version?: string
  lastUpdated?: string
  companyName?: string
  companyAddress?: string
  companyEmail?: string
}

const LEGAL_VERSION = '2025-11-18'

export default function LegalSection({
  version = LEGAL_VERSION,
  lastUpdated = 'November 18, 2025',
  companyName = 'Quantum Falcon Ltd.',
  companyAddress = '8 The Green, Ste A, Dover, DE 19901, USA',
  companyEmail = 'legal@quantumfalcon.ai'
}: LegalSectionProps = {}) {
  const [openDialog, setOpenDialog] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [riskAccepted, setRiskAccepted] = useKV<boolean>('risk-disclosure-accepted-' + version, false)
  const [showRiskModal, setShowRiskModal] = useState(false)

  const exportUserData = () => {
    try {
      const userData = {
        profile: localStorage.getItem('user-profile-full'),
        settings: localStorage.getItem('app-settings'),
        auth: '••••••••',
        exportDate: new Date().toISOString(),
        version: version
      }

      const dataStr = JSON.stringify(userData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `quantum-falcon-data-export-${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success('Data exported successfully', {
        description: 'Your data has been downloaded as JSON'
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export data')
    }
  }

  const deleteUserData = () => {
    if (window.confirm('⚠️ WARNING: This will permanently delete ALL your data including profile, settings, and trading history. This action CANNOT be undone. Are you absolutely sure?')) {
      if (window.confirm('Final confirmation: Click OK to proceed with permanent data deletion.')) {
        const keysToDelete = [
          'user-profile-full',
          'app-settings',
          'user-auth'
        ]
        
        keysToDelete.forEach(key => localStorage.removeItem(key))
        
        toast.success('All data deleted', {
          description: 'Your account data has been permanently removed. Refresh the page to start fresh.'
        })
        
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      }
    }
  }

  const filterContent = (content: string) => 
    searchTerm ? content.toLowerCase().includes(searchTerm.toLowerCase()) : true

  const exportToPDF = (title: string, content: string) => {
    try {
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text(title, 20, 20)
      doc.setFontSize(10)
      const lines = doc.splitTextToSize(content, 170)
      doc.text(lines, 20, 30)
      doc.save(`${title.replace(/\s+/g, '_')}.pdf`)
      toast.success('PDF exported successfully')
    } catch (error) {
      console.error('PDF export failed:', error)
      toast.error('PDF export failed. Please try again.')
    }
  }

  const legalDocuments = [
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: FileText,
      color: 'primary',
      content: `QUANTUM FALCON TERMS OF SERVICE
Last Updated: ${lastUpdated}

IMPORTANT – READ CAREFULLY: This Terms of Service Agreement ("Agreement") constitutes a legally binding contract between you ("User", "you") and ${companyName}, a Delaware corporation with registered office at ${companyAddress} ("Quantum Falcon", "we", "us", "our").

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

For questions about these terms, contact: ${companyEmail}

Version: ${version}`
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: Shield,
      color: 'accent',
      content: `QUANTUM FALCON PRIVACY POLICY
Effective: ${lastUpdated}

1. INFORMATION WE COLLECT

We collect:
• Account data (email, username, encrypted API keys if you connect exchanges)
• Usage data (IP, browser, pages viewed, trading preferences)
• Analytics via third-party providers (Google Analytics, Mixpanel, etc.)

2. HOW WE USE YOUR INFORMATION

We use data to:
• Provide and improve the Platform
• Send critical security & performance alerts
• Comply with legal obligations

3. DATA SHARING

We DO NOT sell your personal data.

We may share anonymized data with:
• Service providers (AWS, Cloudflare, Stripe/Paddle)
• Analytics platforms (anonymized)
• Legal authorities when required by law

4. DATA SECURITY

• All data transmitted over HTTPS/TLS encryption
• API keys encrypted with AES-256
• Passwords hashed with bcrypt
• Regular security audits

5. DATA RETENTION

• Account data retained while active + 5 years
• API keys retained encrypted until account deletion
• Usage logs retained for 90 days
• Deleted account data purged after 90 days (subject to legal holds)

6. YOUR RIGHTS (GDPR/CCPA)

You may request:
• Access to your personal data
• Rectification of inaccurate data
• Deletion of your data (right to be forgotten)
• Data portability (export in JSON/CSV format)
• Opt-out of marketing communications

To exercise these rights, email: ${companyEmail}

7. COOKIES AND TRACKING

Essential Cookies: Required for authentication and core functionality
Analytics Cookies: Used to understand usage patterns (opt-out available)
Marketing Cookies: Used for targeted advertising (opt-out available)

8. THIRD-PARTY SERVICES

Third-party processors:
• AWS (USA) - hosting and infrastructure
• Cloudflare - CDN and security
• Stripe/Paddle - payment processing (we do not store credit card numbers)
• Google Analytics - usage analytics (anonymized)

9. INTERNATIONAL DATA TRANSFERS

Your data may be transferred to and processed in countries outside your residence, including the United States. We ensure adequate protections through standard contractual clauses and comply with GDPR where applicable.

10. CHILDREN'S PRIVACY

The Platform is not intended for users under 18. We do not knowingly collect data from minors.

11. CHANGES TO PRIVACY POLICY

We will notify you of significant changes via email or Platform notification at least 30 days before changes take effect.

12. CONTACT US

For privacy questions or data requests, contact: ${companyEmail}

Version: ${version}`
    },
    {
      id: 'risk',
      title: 'Risk Disclosure Statement',
      icon: WarningCircle,
      color: 'destructive',
      content: `RISK DISCLOSURE STATEMENT
Last Updated: ${lastUpdated}

⚠️ CRYPTOCURRENCY TRADING INVOLVES SUBSTANTIAL RISK OF LOSS ⚠️

TRADING CRYPTOCURRENCIES AND USING AUTOMATED TOOLS INVOLVES A HIGH RISK OF FINANCIAL LOSS, INCLUDING THE TOTAL LOSS OF ALL INVESTED CAPITAL.

1. NO INVESTMENT ADVICE & NO GUARANTEES

• Quantum Falcon is NOT a registered investment adviser, broker-dealer, commodity trading advisor, or futures commission merchant.
• Nothing on the Platform constitutes financial, investment, legal, tax, or accounting advice.
• All signals, predictions, backtests, and paper-trading results are hypothetical and for educational purposes only.
• PAST PERFORMANCE IS NOT INDICATIVE OF FUTURE RESULTS. THERE IS NO GUARANTEE OF PROFIT.

2. COMPLETE LOSS OF CAPITAL IS POSSIBLE

• You can lose 100% (or more if using leverage/margin on connected exchanges) of all funds connected via API keys.
• Automated strategies can execute trades rapidly during extreme volatility, flash crashes, or exchange outages, resulting in catastrophic losses in minutes or seconds.

3. SPECIFIC CRYPTOCURRENCY & MARKET RISKS

• Extreme Volatility – Prices can move 20–50%+ in hours
• Liquidity Risk – Some assets may become impossible to sell at any price
• Leverage & Liquidation Risk – Positions can be forcibly liquidated
• Counterparty & Exchange Risk – Hacks, bankruptcies (e.g., FTX 2022), or withdrawal freezes can permanently destroy value
• Regulatory Risk – Governments may ban, restrict, or seize cryptocurrencies without warning
• Smart Contract & Protocol Risk – Bugs, exploits, or rug-pulls can cause instant total loss

4. AUTOMATION & TECHNICAL RISKS

• Strategy Malfunction – Bugs, latency, or incorrect parameters can cause the bot to execute unintended trades
• API & Connectivity Risk – Exchange API changes, rate-limits, or internet outages can prevent stop-loss execution
• "Fat Finger" Errors – Misconfigured risk settings can execute unintended orders
• Black-Swan Events – The Platform has no control over oracle failures, chain reorgs, or market crashes

5. NO INSURANCE & NO RECOURSE

• Funds on exchanges are NOT insured by FDIC, SIPC, or any government program.
• Quantum Falcon does NOT custody funds and provides zero compensation for any losses, under any circumstances.

6. TAX & LEGAL COMPLIANCE

• You are solely responsible for determining tax implications and reporting all gains/losses in your jurisdiction.
• Use of the Platform may be illegal in certain countries.

7. PSYCHOLOGICAL & ADDICTION RISKS

• Automated trading can create false confidence and encourage over-trading or gambling-like behavior.

FINAL ACKNOWLEDGEMENT

BY USING QUANTUM FALCON, YOU ACKNOWLEDGE THAT:
✓ You have read and understood this disclaimer
✓ You accept all risks associated with cryptocurrency trading
✓ You will not hold Quantum Falcon liable for trading losses
✓ You are legally permitted to trade cryptocurrencies in your jurisdiction
✓ You are using the Platform at your own risk
✓ You will only risk money you can afford to lose entirely

═══════════════════════════════════════════════════════════
⚠️ TRADE RESPONSIBLY - NEVER INVEST MORE THAN YOU CAN AFFORD TO LOSE
═══════════════════════════════════════════════════════════

Contact: ${companyEmail}
Version: ${version}`
    }
  ]

  const filteredDocs = legalDocuments.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    filterContent(doc.content)
  )

  const handleRiskAcceptance = () => {
    setRiskAccepted(true)
    setShowRiskModal(false)
    toast.success('Risk Disclosure Accepted', {
      description: 'Thank you for reviewing our risk disclosure'
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 jagged-corner bg-primary/20 border-2 border-primary">
          <Scales size={24} weight="duotone" className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wide">Legal & Compliance</h2>
          <p className="text-sm text-muted-foreground">Review our terms, privacy policy, and risk disclosures</p>
        </div>
      </div>

      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search documents..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          aria-label="Search legal documents"
        />
      </div>

      <div className="grid gap-4">
        {filteredDocs.length === 0 && (
          <div className="cyber-card p-4 text-center text-muted-foreground">
            No documents match your search. Try a different term.
          </div>
        )}
        {filteredDocs.map((doc) => {
          const Icon = doc.icon
          const isRiskDoc = doc.id === 'risk'
          
          return (
            <motion.div 
              key={doc.id}
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(20, 241, 149, 0.5)' }}
              transition={{ duration: 0.2 }}
              className={`cyber-card p-4 text-left hover:bg-primary/10 transition-all group w-full ${
                isRiskDoc ? 'border-l-4 border-l-destructive' : ''
              }`}
            >
              {isRiskDoc ? (
                <button 
                  onClick={() => setShowRiskModal(true)}
                  className="w-full text-left"
                  aria-label={`Open ${doc.title}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 jagged-corner-small bg-destructive/20 border border-destructive/50 group-hover:bg-destructive/30 transition-colors">
                      <Icon size={20} weight="duotone" className="text-destructive" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold uppercase tracking-wide text-destructive">
                        {doc.title} {!riskAccepted && '⚠️'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {riskAccepted ? 'Accepted • Click to review again' : 'REQUIRED READING - Click to accept'}
                      </p>
                    </div>
                    <div className="text-destructive opacity-50 group-hover:opacity-100 transition-opacity">→</div>
                  </div>
                </button>
              ) : (
                <Dialog open={openDialog === doc.id} onOpenChange={(open) => setOpenDialog(open ? doc.id : null)}>
                  <DialogTrigger asChild>
                    <button className="w-full text-left" aria-label={`Open ${doc.title}`}>
                      <div className="flex items-center gap-3">
                        <div className="p-2 jagged-corner-small bg-primary/20 border border-primary/50 group-hover:bg-primary/30 transition-colors">
                          <Icon size={20} weight="duotone" className="text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-bold uppercase tracking-wide">{doc.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Click to read full document</p>
                        </div>
                        <div className="text-primary opacity-50 group-hover:opacity-100 transition-opacity">→</div>
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent 
                    className="max-w-4xl cyber-card border-2 border-primary/50 flex flex-col p-0 overflow-hidden fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]"
                    style={{ maxHeight: '85vh' }}
                    role="dialog"
                    aria-labelledby={`${doc.id}-title`}
                  >
                    <DialogHeader className="flex-shrink-0 p-6 pb-4">
                      <DialogTitle id={`${doc.id}-title`} className="flex items-center gap-3 text-xl uppercase tracking-wide">
                        <Icon size={24} weight="duotone" className="text-primary" />
                        {doc.title}
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="flex-1 px-6 scrollbar-thin" style={{ maxHeight: 'calc(85vh - 12rem)' }}>
                      <div className="space-y-4 pb-4">
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {doc.content}
                        </pre>
                      </div>
                    </ScrollArea>
                    <div className="p-6 pt-4 border-t-2 border-primary/30 flex justify-between items-center flex-shrink-0 gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => exportToPDF(doc.title, doc.content)}
                        aria-label={`Export ${doc.title} as PDF`}
                      >
                        <Download size={16} className="mr-2" />
                        Export PDF
                      </Button>
                      
                      <Button onClick={() => setOpenDialog(null)} className="jagged-corner">
                        Close
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </motion.div>
          )
        })}
      </div>

      <RiskAcknowledgmentLog />

      <div className="cyber-card-accent p-4 mt-6">
        <div className="flex gap-3">
          <WarningCircle size={24} weight="duotone" className="text-accent flex-shrink-0" />
          <div className="space-y-2 text-xs">
            <p className="font-bold uppercase tracking-wide">Important Notice</p>
            <p className="text-muted-foreground leading-relaxed">
              By using Quantum Falcon, you acknowledge that you have read, understood, and agree to these legal terms. 
              Cryptocurrency trading involves substantial risk of loss. Only invest what you can afford to lose. 
              We are not a licensed financial advisor.
            </p>
          </div>
        </div>
      </div>

      <div className="cyber-card p-6 mt-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 jagged-corner bg-primary/20 border-2 border-primary">
            <Database size={24} weight="duotone" className="text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase tracking-wide">Data Management</h3>
            <p className="text-sm text-muted-foreground">Export or delete your personal data (GDPR/CCPA compliance)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-primary/10 border-2 border-primary/30 hover:border-primary transition-all"
          >
            <div className="flex items-start gap-3 mb-3">
              <Download size={24} weight="duotone" className="text-primary" />
              <div>
                <h4 className="font-bold uppercase tracking-wide text-sm mb-1">Export Your Data</h4>
                <p className="text-xs text-muted-foreground">
                  Download all your personal data including profile, settings, and trading history in JSON format
                </p>
              </div>
            </div>
            <Button 
              onClick={exportUserData}
              className="w-full border-primary text-primary hover:bg-primary/10"
              variant="outline"
            >
              <Download size={16} weight="duotone" className="mr-2" />
              Export Data (JSON)
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-destructive/10 border-2 border-destructive/30 hover:border-destructive transition-all"
          >
            <div className="flex items-start gap-3 mb-3">
              <Trash size={24} weight="duotone" className="text-destructive" />
              <div>
                <h4 className="font-bold uppercase tracking-wide text-sm mb-1 text-destructive">Delete All Data</h4>
                <p className="text-xs text-muted-foreground">
                  Permanently delete all your data from our systems. This action cannot be undone.
                </p>
              </div>
            </div>
            <Button 
              onClick={deleteUserData}
              variant="destructive"
              className="w-full"
            >
              <Trash size={16} weight="duotone" className="mr-2" />
              Request Data Deletion
            </Button>
          </motion.div>
        </div>

        <div className="cyber-card-accent p-3 mt-4">
          <div className="flex items-start gap-2">
            <Shield size={16} weight="duotone" className="text-accent flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-bold text-accent">Privacy Rights:</span> Under GDPR and CCPA, you have the right to access, 
              correct, delete, and export your personal data. Data deletion requests are processed within 30 days. Some data may 
              be retained for legal compliance (5 years for financial records per regulatory requirements).
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pt-4 pb-20 text-xs text-muted-foreground space-y-1">
        <p>© {new Date().getFullYear()} {companyName} All Rights Reserved.</p>
        <p>Version {version} • {companyAddress}</p>
        <p className="text-xs opacity-70 pt-2">
          Governed by the laws of Delaware, USA • Arbitration via AAA
        </p>
      </div>

      <RiskDisclosureModal
        isOpen={showRiskModal}
        onClose={() => setShowRiskModal(false)}
        onAccept={handleRiskAcceptance}
        version={version}
      />
    </div>
  )
}
