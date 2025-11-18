import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Download, ArrowLeft } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import jsPDF from 'jspdf'
import { toast } from 'sonner'

const LEGAL_VERSION = '2025-11-18'
const LAST_UPDATED = 'November 18, 2025'

const PRIVACY_CONTENT = `QUANTUM FALCON PRIVACY POLICY
Effective: ${LAST_UPDATED}

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

To exercise these rights, email: legal@quantumfalcon.ai

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

For privacy questions or data requests, contact: legal@quantumfalcon.ai

Version: ${LEGAL_VERSION}`

export default function PrivacyPolicy() {
  const exportToPDF = () => {
    try {
      const doc = new jsPDF()
      doc.setFontSize(16)
      doc.text('Privacy Policy', 20, 20)
      doc.setFontSize(10)
      const lines = doc.splitTextToSize(PRIVACY_CONTENT, 170)
      doc.text(lines, 20, 30)
      doc.save('Quantum_Falcon_Privacy_Policy.pdf')
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
          className="cyber-card border-2 border-accent/50 overflow-hidden"
        >
          <div className="p-6 border-b-2 border-accent/30 bg-accent/5">
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
                  <h1 className="text-2xl font-bold uppercase tracking-wide">Privacy Policy</h1>
                  <p className="text-sm text-muted-foreground mt-1">Effective: {LAST_UPDATED}</p>
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
              {PRIVACY_CONTENT}
            </pre>
          </ScrollArea>
        </motion.div>
      </div>
    </div>
  )
}
