/**
 * License Generation Service
 * 
 * Integrates with the LicenseAuthority repository to automatically generate
 * licenses when users complete payment or are within their subscription timeframe.
 */

export interface LicenseGenerationRequest {
  userId: string
  userEmail: string
  tier: 'free' | 'pro' | 'elite' | 'lifetime'
  duration?: number // in days, optional for lifetime
  paymentIntentId?: string
  timestamp: number
}

export interface LicenseGenerationResponse {
  success: boolean
  license?: string
  tier: string
  expiresAt: number
  userId: string
  generatedAt: number
  error?: string
}

export interface PaymentCompletionData {
  userId: string
  userEmail: string
  tier: string
  amount: number
  paymentProvider: 'stripe' | 'paddle'
  paymentIntentId: string
  timestamp: number
}

class LicenseGenerationService {
  private readonly LICENSE_API_ENDPOINT: string
  private readonly LICENSE_GENERATION_ENDPOINT: string
  private readonly AUTO_GENERATION_ENABLED: boolean

  constructor() {
    this.LICENSE_API_ENDPOINT = import.meta.env.VITE_LICENSE_API_ENDPOINT || 'https://your-license-server.com/api/verify'
    this.LICENSE_GENERATION_ENDPOINT = import.meta.env.VITE_LICENSE_GENERATION_ENDPOINT || 'https://your-license-server.com/api/generate'
    this.AUTO_GENERATION_ENABLED = import.meta.env.VITE_ENABLE_AUTO_LICENSE_GENERATION === 'true'
  }

  /**
   * Generate a new license after successful payment
   */
  async generateLicenseAfterPayment(
    paymentData: PaymentCompletionData
  ): Promise<LicenseGenerationResponse> {
    if (!this.AUTO_GENERATION_ENABLED) {
      console.warn('[LicenseGeneration] Auto-generation is disabled')
      return {
        success: false,
        error: 'Auto-generation is disabled',
        tier: paymentData.tier,
        expiresAt: 0,
        userId: paymentData.userId,
        generatedAt: Date.now()
      }
    }

    try {
      console.log('[LicenseGeneration] Generating license for payment:', paymentData.paymentIntentId)

      // Determine duration based on tier
      const duration = this.getDurationForTier(paymentData.tier as any)

      const request: LicenseGenerationRequest = {
        userId: paymentData.userId,
        userEmail: paymentData.userEmail,
        tier: paymentData.tier as any,
        duration,
        paymentIntentId: paymentData.paymentIntentId,
        timestamp: paymentData.timestamp
      }

      // Get device fingerprint for hardware binding
      let deviceFingerprint = null
      try {
        const { generateDeviceFingerprint } = await import('@/lib/license-authority/integration/deviceFingerprint')
        deviceFingerprint = await generateDeviceFingerprint()
      } catch (error) {
        // Device fingerprint optional - continue without it
        console.debug('[LicenseGeneration] Device fingerprint unavailable:', error)
      }

      const response = await fetch(this.LICENSE_GENERATION_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Origin': 'quantum-falcon-cockpit',
          'X-Payment-Provider': paymentData.paymentProvider
        },
        body: JSON.stringify({
          ...request,
          device_fingerprint: deviceFingerprint
        })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(error.error || 'License generation failed')
      }

      const result: LicenseGenerationResponse = await response.json()

      console.log('[LicenseGeneration] License generated successfully:', result.license?.substring(0, 20) + '...')

      // Store the generated license locally
      if (result.success && result.license) {
        await this.storeGeneratedLicense(result)
      }

      return result
    } catch (error) {
      console.error('[LicenseGeneration] Failed to generate license:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'License generation failed',
        tier: paymentData.tier,
        expiresAt: 0,
        userId: paymentData.userId,
        generatedAt: Date.now()
      }
    }
  }

  /**
   * Request a new license for time-based subscriptions (renewals)
   */
  async generateLicenseForRenewal(
    userId: string,
    userEmail: string,
    tier: 'free' | 'pro' | 'elite' | 'lifetime'
  ): Promise<LicenseGenerationResponse> {
    if (!this.AUTO_GENERATION_ENABLED) {
      console.warn('[LicenseGeneration] Auto-generation is disabled')
      return {
        success: false,
        error: 'Auto-generation is disabled',
        tier,
        expiresAt: 0,
        userId,
        generatedAt: Date.now()
      }
    }

    try {
      console.log('[LicenseGeneration] Generating renewal license for user:', userId)

      const duration = this.getDurationForTier(tier)

      const request: LicenseGenerationRequest = {
        userId,
        userEmail,
        tier,
        duration,
        timestamp: Date.now()
      }

      const response = await fetch(this.LICENSE_GENERATION_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Origin': 'quantum-falcon-cockpit',
          'X-Request-Type': 'renewal'
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(error.error || 'License generation failed')
      }

      const result: LicenseGenerationResponse = await response.json()

      console.log('[LicenseGeneration] Renewal license generated successfully')

      // Store the generated license locally
      if (result.success && result.license) {
        await this.storeGeneratedLicense(result)
      }

      return result
    } catch (error) {
      console.error('[LicenseGeneration] Failed to generate renewal license:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'License generation failed',
        tier,
        expiresAt: 0,
        userId,
        generatedAt: Date.now()
      }
    }
  }

  /**
   * Check if user needs license renewal
   */
  async checkLicenseRenewalNeeded(userId: string): Promise<boolean> {
    try {
      const stored = localStorage.getItem('qf_license')
      if (!stored) return true

      const license = JSON.parse(atob(stored))
      const now = Date.now()
      const expiresAt = license.expiresAt

      // Check if license expires within 7 days
      const sevenDays = 7 * 24 * 60 * 60 * 1000
      const renewalThreshold = expiresAt - sevenDays

      return now >= renewalThreshold
    } catch (error) {
      console.error('[LicenseGeneration] Error checking renewal status:', error)
      return true
    }
  }

  /**
   * Get license duration in days based on tier
   */
  private getDurationForTier(tier: 'free' | 'pro' | 'elite' | 'lifetime'): number {
    const durations = {
      free: 30,        // 30 days trial
      pro: 30,         // Monthly
      elite: 30,       // Monthly
      lifetime: -1     // Lifetime (no expiration)
    }
    return durations[tier] || 30
  }

  /**
   * Calculate expiration timestamp
   */
  private calculateExpiration(duration: number): number {
    if (duration === -1) {
      // Lifetime: 100 years from now
      return Date.now() + (100 * 365 * 24 * 60 * 60 * 1000)
    }
    // Duration in days to milliseconds
    return Date.now() + (duration * 24 * 60 * 60 * 1000)
  }

  /**
   * Store generated license locally
   */
  private async storeGeneratedLicense(result: LicenseGenerationResponse): Promise<void> {
    if (!result.license) return

    try {
      const licenseData = {
        key: result.license,
        tier: result.tier,
        expiresAt: result.expiresAt,
        userId: result.userId,
        features: this.getFeaturesForTier(result.tier as any),
        generatedAt: result.generatedAt
      }

      const encrypted = btoa(JSON.stringify(licenseData))
      localStorage.setItem('qf_license', encrypted)

      console.log('[LicenseGeneration] License stored locally')
    } catch (error) {
      console.error('[LicenseGeneration] Failed to store license:', error)
    }
  }

  /**
   * Get features for tier
   */
  private getFeaturesForTier(tier: 'free' | 'pro' | 'elite' | 'lifetime'): string[] {
    const features: Record<string, string[]> = {
      free: [
        'Basic Dashboard',
        'Manual Trading',
        'Basic Analytics',
        'Community Access (Read-only)'
      ],
      pro: [
        'All Free Features',
        'AI Trading Agents (3)',
        'Advanced Analytics',
        'Strategy Marketplace',
        'Copy Trading',
        'Priority Support'
      ],
      elite: [
        'All Pro Features',
        'AI Trading Agents (Unlimited)',
        'Advanced Market Intelligence',
        'Custom Strategy Builder',
        'API Access',
        'Whale Tracking',
        'Premium Community Features'
      ],
      lifetime: [
        'All Elite Features',
        'Lifetime Updates',
        'VIP Support',
        'Beta Access',
        'Custom Integrations',
        'White-Label Options'
      ]
    }

    return features[tier] || features.free
  }

  /**
   * Get the LicenseAuthority repository URL
   */
  getLicenseAuthorityRepoUrl(): string {
    return import.meta.env.VITE_LICENSE_AUTHORITY_REPO || 'https://github.com/mhamp1/LicenseAuthority'
  }

  /**
   * Check if auto-generation is enabled
   */
  isAutoGenerationEnabled(): boolean {
    return this.AUTO_GENERATION_ENABLED
  }
}

// Export singleton instance
export const licenseGenerationService = new LicenseGenerationService()

/**
 * Hook to integrate with payment completion webhook
 */
export async function handlePaymentSuccess(paymentData: PaymentCompletionData): Promise<LicenseGenerationResponse> {
  console.log('[LicenseGeneration] Payment success, generating license...')
  return await licenseGenerationService.generateLicenseAfterPayment(paymentData)
}

/**
 * Hook for manual license renewal requests
 */
export async function requestLicenseRenewal(
  userId: string,
  userEmail: string,
  tier: 'free' | 'pro' | 'elite' | 'lifetime'
): Promise<LicenseGenerationResponse> {
  console.log('[LicenseGeneration] Manual renewal requested')
  return await licenseGenerationService.generateLicenseForRenewal(userId, userEmail, tier)
}

/**
 * Check if user's license needs renewal
 */
export async function checkNeedsRenewal(userId: string): Promise<boolean> {
  return await licenseGenerationService.checkLicenseRenewalNeeded(userId)
}
