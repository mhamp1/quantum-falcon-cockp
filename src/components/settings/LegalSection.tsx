import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Scales, FileText, Shield, WarningCircle } from '@phosphor-icons/react'

export default function LegalSection() {
  const [openDialog, setOpenDialog] = useState<string | null>(null)

  const legalDocuments = [
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: FileText,
      content: `QUANTUM FALCON - TERMS OF SERVICE

Last Updated: ${new Date().toLocaleDateString()}

1. ACCEPTANCE OF TERMS
By accessing and using Quantum Falcon ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement.

2. DESCRIPTION OF SERVICE
Quantum Falcon is an AI-powered cryptocurrency trading assistant and educational platform that provides:
- Automated trading strategies and signals
- Market analysis and insights
- Portfolio tracking and management
- Educational resources and community features

3. PAPER TRADING & SIMULATED ENVIRONMENT
3.1. The Platform operates primarily in paper trading mode, meaning no real funds are at risk unless you explicitly connect real exchange accounts.
3.2. Past performance in simulated environments does not guarantee future results in live trading.
3.3. All trading involves risk, including the potential loss of principal.

4. USER ACCOUNTS AND SECURITY
4.1. You are responsible for maintaining the confidentiality of your account credentials.
4.2. You must provide accurate, current, and complete information during registration.
4.3. You agree to notify us immediately of any unauthorized use of your account.
4.4. We reserve the right to suspend or terminate accounts that violate these terms.

5. SUBSCRIPTION AND FEES
5.1. The Platform offers multiple subscription tiers: Free, Pro, ProPlus, and Lifetime.
5.2. Subscription fees are charged in advance on a recurring basis.
5.3. Refunds may be provided at our discretion and are not guaranteed.
5.4. We reserve the right to modify pricing with 30 days notice.

6. API INTEGRATIONS AND THIRD-PARTY SERVICES
6.1. You may connect third-party exchange accounts via API keys at your own risk.
6.2. We are not responsible for losses resulting from third-party service failures.
6.3. You grant us permission to access connected accounts solely for providing our services.

7. INTELLECTUAL PROPERTY
7.1. All Platform content, features, and functionality are owned by Quantum Falcon and protected by copyright and trademark laws.
7.2. You may not copy, modify, distribute, or reverse engineer any part of the Platform.
7.3. User-generated content (strategies, forum posts) remains your property, but you grant us a license to use it.

8. PROHIBITED ACTIVITIES
You agree NOT to:
- Use the Platform for illegal activities or market manipulation
- Attempt to gain unauthorized access to our systems
- Transmit viruses, malware, or harmful code
- Harass, abuse, or harm other users
- Impersonate others or misrepresent your affiliation
- Scrape or data mine the Platform without permission

9. DISCLAIMERS
9.1. THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.
9.2. WE DO NOT GUARANTEE TRADING PROFITS OR SPECIFIC RESULTS.
9.3. CRYPTOCURRENCY TRADING INVOLVES SUBSTANTIAL RISK OF LOSS.
9.4. WE ARE NOT A LICENSED FINANCIAL ADVISOR OR BROKER-DEALER.

10. LIMITATION OF LIABILITY
TO THE MAXIMUM EXTENT PERMITTED BY LAW, QUANTUM FALCON SHALL NOT BE LIABLE FOR:
- Any indirect, incidental, special, or consequential damages
- Loss of profits, data, or opportunities
- Damages resulting from unauthorized access or system failures
- Losses from trading decisions made using the Platform

11. INDEMNIFICATION
You agree to indemnify and hold harmless Quantum Falcon from any claims, damages, or expenses arising from your use of the Platform or violation of these terms.

12. DISPUTE RESOLUTION
12.1. Any disputes shall be resolved through binding arbitration.
12.2. You waive the right to participate in class-action lawsuits.
12.3. These terms are governed by the laws of [Jurisdiction].

13. MODIFICATIONS TO TERMS
We reserve the right to modify these terms at any time. Continued use of the Platform constitutes acceptance of updated terms.

14. CONTACT INFORMATION
For questions about these terms, contact: legal@quantumfalcon.ai`
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: Shield,
      content: `QUANTUM FALCON - PRIVACY POLICY

Last Updated: ${new Date().toLocaleDateString()}

1. INFORMATION WE COLLECT

1.1. Account Information
- Email address, username, password (encrypted)
- Profile information and preferences
- Subscription and payment details

1.2. Trading Data
- Portfolio holdings and transaction history
- Trading strategies and configurations
- API keys (encrypted) for connected exchanges
- Performance metrics and analytics

1.3. Usage Data
- Pages visited, features used, time spent
- Device information, browser type, IP address
- Cookies and tracking technologies

1.4. Community Content
- Forum posts, comments, and strategy shares
- Likes, follows, and social interactions
- User-generated content and feedback

2. HOW WE USE YOUR INFORMATION

2.1. To Provide Services
- Execute trades and manage portfolios
- Display analytics and performance data
- Send notifications and alerts
- Process payments and subscriptions

2.2. To Improve the Platform
- Analyze usage patterns and optimize features
- Fix bugs and prevent fraud
- Conduct research and development
- Train AI models (with anonymized data)

2.3. To Communicate
- Send service updates and announcements
- Respond to support requests
- Deliver marketing communications (opt-out available)

3. INFORMATION SHARING

3.1. We DO NOT sell your personal information to third parties.

3.2. We MAY share information with:
- Service providers (hosting, analytics, payment processing)
- Legal authorities when required by law
- Business partners with your explicit consent

3.3. Anonymized Data
We may share aggregated, non-identifiable data for research or marketing purposes.

4. DATA SECURITY

4.1. Encryption
- All data transmitted over HTTPS/TLS
- API keys encrypted with AES-256
- Passwords hashed with bcrypt

4.2. Access Controls
- Role-based access to internal systems
- Regular security audits and penetration testing
- Multi-factor authentication for sensitive operations

4.3. Data Retention
- Account data retained while account is active
- Trading history retained for 7 years (regulatory requirement)
- Deleted account data purged after 90 days

5. YOUR RIGHTS

5.1. Access & Correction
You can view and update your account information at any time.

5.2. Data Portability
You can export your trading data in CSV/JSON format.

5.3. Deletion
You can request account deletion, subject to legal retention requirements.

5.4. Opt-Out
You can unsubscribe from marketing emails or disable certain data collection.

6. COOKIES AND TRACKING

6.1. Essential Cookies
Required for authentication, security, and core functionality.

6.2. Analytics Cookies
Used to understand usage patterns and improve the Platform.

6.3. Marketing Cookies
Used for targeted advertising (opt-out available).

7. THIRD-PARTY INTEGRATIONS

7.1. Exchange APIs
When you connect exchange accounts, we access only the permissions you grant.

7.2. Analytics Services
We use Google Analytics, Mixpanel, and similar tools (anonymized data).

7.3. Payment Processors
Payments handled by Stripe/PayPal - we do not store full credit card numbers.

8. INTERNATIONAL DATA TRANSFERS

8.1. Your data may be transferred to and processed in countries outside your residence.
8.2. We ensure adequate protections through standard contractual clauses.

9. CHILDREN'S PRIVACY

The Platform is not intended for users under 18. We do not knowingly collect data from minors.

10. CHANGES TO PRIVACY POLICY

We will notify you of significant changes via email or Platform notification.

11. CONTACT US

For privacy questions or data requests, contact: privacy@quantumfalcon.ai`
    },
    {
      id: 'disclaimer',
      title: 'Risk Disclaimer',
      icon: WarningCircle,
      content: `QUANTUM FALCON - RISK DISCLAIMER

Last Updated: ${new Date().toLocaleDateString()}

⚠️ IMPORTANT: PLEASE READ THIS DISCLAIMER CAREFULLY BEFORE USING THE PLATFORM

1. GENERAL DISCLAIMER

1.1. Quantum Falcon is an educational and analytical tool, NOT a licensed financial advisor, broker-dealer, or investment advisor.

1.2. The information and tools provided on this Platform are for informational and educational purposes only and should not be construed as financial, investment, tax, or legal advice.

1.3. You are solely responsible for your trading decisions and their outcomes.

2. CRYPTOCURRENCY TRADING RISKS

2.1. HIGH VOLATILITY
Cryptocurrency prices can fluctuate dramatically in short periods, resulting in significant gains or losses.

2.2. MARKET RISK
Market conditions can change rapidly and unpredictably, affecting the value of your holdings.

2.3. LIQUIDITY RISK
Some cryptocurrencies may be difficult to buy or sell quickly without impacting the price.

2.4. COUNTERPARTY RISK
Exchanges and service providers may fail, be hacked, or cease operations, resulting in loss of funds.

2.5. REGULATORY RISK
Cryptocurrency regulations vary by jurisdiction and may change, affecting legality and value.

2.6. TECHNOLOGY RISK
Blockchain networks may experience bugs, forks, or security vulnerabilities.

3. AI AND AUTOMATED TRADING RISKS

3.1. NO GUARANTEE OF PROFITS
Past performance does not guarantee future results. AI models can fail or produce unexpected outcomes.

3.2. OVERFITTING
Strategies that performed well historically may fail in live markets due to changing conditions.

3.3. EXECUTION RISK
Automated trades may experience delays, slippage, or failures due to network congestion or exchange issues.

3.4. BLACK SWAN EVENTS
Extreme market events may cause AI models to behave unpredictably or incur large losses.

4. PAPER TRADING LIMITATIONS

4.1. Paper trading does not involve real risk and may not reflect actual market conditions.

4.2. Simulated results may not account for slippage, fees, liquidity constraints, or emotional factors.

4.3. Success in paper trading does not guarantee success in live trading.

5. USER RESPONSIBILITY

5.1. RISK TOLERANCE
Only trade with funds you can afford to lose. Never invest more than you are prepared to lose completely.

5.2. DUE DILIGENCE
Conduct your own research before making trading decisions. Do not rely solely on Platform recommendations.

5.3. SECURITY
Protect your account credentials and API keys. Enable two-factor authentication and use strong passwords.

5.4. TAX OBLIGATIONS
You are responsible for understanding and complying with tax laws in your jurisdiction.

6. NO PROFESSIONAL ADVICE

6.1. The Platform does not provide personalized investment advice tailored to your individual circumstances.

6.2. Consult with a licensed financial advisor before making significant investment decisions.

6.3. We do not recommend specific investments or guarantee returns.

7. LIMITATION OF LIABILITY

7.1. TO THE MAXIMUM EXTENT PERMITTED BY LAW, QUANTUM FALCON IS NOT LIABLE FOR:
- Trading losses, missed opportunities, or foregone profits
- Errors in data, analysis, or AI predictions
- Service interruptions or technical failures
- Unauthorized account access due to user negligence
- Third-party exchange or service provider failures

7.2. YOUR MAXIMUM REMEDY
In no event shall our total liability exceed the amount you paid for Platform subscriptions in the past 12 months.

8. REGULATORY STATUS

8.1. Quantum Falcon is not registered with the SEC, FINRA, CFTC, or similar regulatory bodies.

8.2. The Platform does not custody user funds or operate as an exchange.

8.3. Cryptocurrencies may be unregulated in your jurisdiction.

9. FORWARD-LOOKING STATEMENTS

Any projections, forecasts, or predictions provided by the Platform are speculative and may not materialize.

10. ACKNOWLEDGMENT

BY USING QUANTUM FALCON, YOU ACKNOWLEDGE THAT:
✓ You have read and understood this disclaimer
✓ You accept all risks associated with cryptocurrency trading
✓ You will not hold Quantum Falcon liable for trading losses
✓ You are legally permitted to trade cryptocurrencies in your jurisdiction
✓ You are using the Platform at your own risk

11. CONTACT

For questions about this disclaimer, contact: legal@quantumfalcon.ai

═══════════════════════════════════════════════════════════════
⚠️ TRADE RESPONSIBLY - NEVER INVEST MORE THAN YOU CAN AFFORD TO LOSE
═══════════════════════════════════════════════════════════════`
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 jagged-corner bg-primary/20 border-2 border-primary">
          <Scales size={24} weight="duotone" className="text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wide">Legal & Compliance</h2>
          <p className="text-sm text-muted-foreground">Review our terms, privacy policy, and disclaimers</p>
        </div>
      </div>

      <div className="grid gap-4">
        {legalDocuments.map((doc) => {
          const Icon = doc.icon
          return (
            <Dialog key={doc.id} open={openDialog === doc.id} onOpenChange={(open) => setOpenDialog(open ? doc.id : null)}>
              <DialogTrigger asChild>
                <button className="cyber-card p-4 text-left hover:bg-primary/10 transition-all group w-full">
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
              <DialogContent className="max-w-4xl w-[95vw] h-[85vh] cyber-card border-2 border-primary/50 flex flex-col overflow-hidden">
                <DialogHeader className="flex-shrink-0">
                  <DialogTitle className="flex items-center gap-3 text-xl uppercase tracking-wide">
                    <Icon size={24} weight="duotone" className="text-primary" />
                    {doc.title}
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="flex-1 pr-4 -mx-6 px-6">
                  <div className="space-y-4">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {doc.content}
                    </pre>
                  </div>
                </ScrollArea>
                <div className="pt-4 border-t-2 border-primary/30 flex justify-end flex-shrink-0">
                  <Button onClick={() => setOpenDialog(null)} className="jagged-corner">
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )
        })}
      </div>

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

      <div className="text-center pt-4 text-xs text-muted-foreground space-y-1">
        <p>© {new Date().getFullYear()} Quantum Falcon. All Rights Reserved.</p>
        <p>Version 2.4.1 • Built with 💚 by the Quantum Falcon Team</p>
      </div>
    </div>
  )
}
