// Legal Protection System — Comprehensive Liability Protection
// November 22, 2025 — Quantum Falcon Cockpit
// Ensures all legal wording and warnings are correct and protect the creator

import { useKVSafe } from '@/hooks/useKVFallback'

export interface LegalAcceptance {
  version: string
  timestamp: string
  riskDisclosureAccepted: boolean
  termsOfServiceAccepted: boolean
  autonomousBotAcknowledged: boolean
  ipAddress?: string
  userAgent?: string
  scrollProgressRisk?: number
  scrollProgressTos?: number
}

const CURRENT_LEGAL_VERSION = '2025-11-22'

/**
 * Legal Protection System
 * Tracks all legal acceptances and ensures compliance
 */
export class LegalProtectionSystem {
  private static instance: LegalProtectionSystem | null = null

  static getInstance(): LegalProtectionSystem {
    if (!LegalProtectionSystem.instance) {
      LegalProtectionSystem.instance = new LegalProtectionSystem()
    }
    return LegalProtectionSystem.instance
  }

  /**
   * Record legal acceptance
   */
  recordAcceptance(acceptance: LegalAcceptance): void {
    try {
      const acceptances = this.getAcceptances()
      acceptances.push({
        ...acceptance,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      })
      
      // Keep only last 10 acceptances
      const recent = acceptances.slice(-10)
      localStorage.setItem('legal-acceptances', JSON.stringify(recent))
      
      // Also store current acceptance
      localStorage.setItem('current-legal-acceptance', JSON.stringify(acceptance))
    } catch (error) {
      console.error('[Legal] Failed to record acceptance:', error)
    }
  }

  /**
   * Get all legal acceptances
   */
  getAcceptances(): LegalAcceptance[] {
    try {
      const stored = localStorage.getItem('legal-acceptances')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  /**
   * Get current legal acceptance
   */
  getCurrentAcceptance(): LegalAcceptance | null {
    try {
      const stored = localStorage.getItem('current-legal-acceptance')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  /**
   * Check if user has accepted current version
   */
  hasAcceptedCurrentVersion(): boolean {
    const acceptance = this.getCurrentAcceptance()
    return acceptance?.version === CURRENT_LEGAL_VERSION &&
           acceptance?.riskDisclosureAccepted === true &&
           acceptance?.termsOfServiceAccepted === true
  }

  /**
   * Check if autonomous bot has been acknowledged
   */
  hasAcknowledgedAutonomousBot(): boolean {
    const acceptance = this.getCurrentAcceptance()
    return acceptance?.autonomousBotAcknowledged === true
  }

  /**
   * Generate legal disclaimer text for autonomous bot
   */
  getAutonomousBotDisclaimer(): string {
    return `AUTONOMOUS TRADING BOT DISCLAIMER

⚠️ CRITICAL WARNING — AUTONOMOUS TRADING SYSTEM ⚠️

The Quantum Falcon autonomous trading bot ("Bot") operates independently and makes trading decisions without human intervention. By enabling the Bot, you acknowledge and agree to the following:

1. AUTONOMOUS OPERATION
1.1 The Bot makes all trading decisions autonomously based on its internal algorithms and learning systems.
1.2 You have NO control over individual trades executed by the Bot once activated.
1.3 The Bot may execute trades at any time, including during market volatility, flash crashes, or technical issues.
1.4 The Bot operates 24/7 and may execute trades while you are not monitoring the platform.

2. NO GUARANTEES OR PROMISES
2.1 The Bot does NOT guarantee profits. Past performance, whether real or simulated, does NOT guarantee future results.
2.2 The Bot's internal profit goal ($600/day) is an internal metric only and is NOT a promise, guarantee, or representation of actual results.
2.3 You may lose 100% or more of all funds connected to the Bot.
2.4 The Bot may make decisions that result in significant losses, including total loss of capital.

3. TECHNICAL RISKS
3.1 The Bot may malfunction, bug, or execute unintended trades due to:
   - Software bugs or errors
   - Network connectivity issues
   - Exchange API failures
   - Market data inaccuracies
   - Algorithmic errors
   - Black swan events
3.2 The Bot cannot predict or prevent market crashes, exchange hacks, or regulatory actions.
3.3 The Bot may execute trades during system outages, preventing stop-loss execution.

4. COMPLETE LIABILITY WAIVER
4.1 YOU EXPRESSLY WAIVE ALL CLAIMS AGAINST QUANTUM FALCON, ITS CREATORS, OFFICERS, DIRECTORS, EMPLOYEES, AND AFFILIATES FOR ANY LOSSES ARISING FROM THE BOT'S OPERATION.
4.2 QUANTUM FALCON SHALL NOT BE LIABLE FOR:
   - Any trading losses, regardless of cause
   - Bot malfunctions or errors
   - Incorrect trading decisions
   - Market volatility or crashes
   - Exchange failures or hacks
   - Regulatory actions
   - Any other losses, direct or indirect
4.3 YOUR SOLE REMEDY FOR ANY DISSATISFACTION IS TO DISABLE THE BOT IMMEDIATELY.

5. YOUR RESPONSIBILITIES
5.1 You are solely responsible for:
   - Monitoring the Bot's performance
   - Setting appropriate risk parameters
   - Disabling the Bot if you disagree with its decisions
   - All trading outcomes, profits, and losses
   - Tax obligations on all trades
5.2 You must only risk funds you can afford to lose entirely.
5.3 You must not rely on the Bot as your sole source of income or investment strategy.

6. NO INVESTMENT ADVICE
6.1 The Bot does NOT provide investment advice.
6.2 All trading decisions are made autonomously by the Bot's algorithms.
6.3 You are solely responsible for evaluating the Bot's performance and decisions.

7. TERMINATION
7.1 You may disable the Bot at any time.
7.2 Quantum Falcon may disable or modify the Bot at any time without notice.
7.3 Disabling the Bot does not reverse any trades already executed.

FINAL ACKNOWLEDGMENT

By enabling the autonomous trading bot, you acknowledge that:
- You have read and understood this disclaimer
- You accept all risks associated with autonomous trading
- You waive all claims against Quantum Falcon for any losses
- You are solely responsible for all trading outcomes
- You will only risk funds you can afford to lose entirely

I UNDERSTAND AND ACCEPT ALL RISKS. I WILL NOT HOLD QUANTUM FALCON LIABLE FOR ANY LOSSES.`
  }
}

/**
 * Hook for legal protection
 */
export function useLegalProtection() {
  const [acceptance, setAcceptance] = useKVSafe<LegalAcceptance | null>('legal-acceptance', null)
  const legalSystem = LegalProtectionSystem.getInstance()

  const recordAcceptance = (acceptanceData: Partial<LegalAcceptance>) => {
    const fullAcceptance: LegalAcceptance = {
      version: CURRENT_LEGAL_VERSION,
      timestamp: new Date().toISOString(),
      riskDisclosureAccepted: acceptanceData.riskDisclosureAccepted ?? false,
      termsOfServiceAccepted: acceptanceData.termsOfServiceAccepted ?? false,
      autonomousBotAcknowledged: acceptanceData.autonomousBotAcknowledged ?? false,
      scrollProgressRisk: acceptanceData.scrollProgressRisk,
      scrollProgressTos: acceptanceData.scrollProgressTos,
      userAgent: navigator.userAgent,
    }

    legalSystem.recordAcceptance(fullAcceptance)
    setAcceptance(fullAcceptance)
  }

  const hasAcceptedAll = () => {
    return legalSystem.hasAcceptedCurrentVersion()
  }

  const hasAcknowledgedBot = () => {
    return legalSystem.hasAcknowledgedAutonomousBot()
  }

  const getBotDisclaimer = () => {
    return legalSystem.getAutonomousBotDisclaimer()
  }

  return {
    acceptance,
    recordAcceptance,
    hasAcceptedAll,
    hasAcknowledgedBot,
    getBotDisclaimer,
    currentVersion: CURRENT_LEGAL_VERSION,
  }
}

