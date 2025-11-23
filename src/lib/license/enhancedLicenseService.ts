// Enhanced License Service — Unified License Authority Integration
// November 22, 2025 — Quantum Falcon Cockpit v2025.1.0
// Merges license-authority integration with existing license system for optimal functionality

import { generateDeviceFingerprint, type DeviceFingerprint } from '../license-authority/integration/deviceFingerprint'
import { licenseGenerationService, type PaymentCompletionData } from '../licenseGeneration'

/**
 * License validation response from the License Authority API
 */
export interface LicenseValidationResponse {
  valid: boolean
  tier: string
  expires_at?: number
  user_id?: string
  email?: string
  features: string[]
  max_agents?: number
  max_strategies?: number
  strategies?: string[]
  is_grace_period: boolean
  is_expired: boolean
  days_until_expiry?: number
  auto_renew: boolean
  token?: string
  error?: string
  validated_at?: string
  hardware_bound?: boolean
  device_count?: number
  max_devices?: number
}

/**
 * Tier information from the License Authority API
 */
export interface TierInfo {
  tier: string
  name: string
  price: number | string
  features: string[]
  max_agents: number
  max_strategies: number
  strategies: string[] | string
  description: string
}

/**
 * License data stored in KV storage
 */
export interface LicenseData {
  licenseKey: string
  tier: string
  expires_at?: number
  user_id: string
  features: string[]
  validated_at: string
  token: string
  hardware_id?: string
  device_fingerprint?: DeviceFingerprint
}

// Configuration
const LICENSE_API_URL = import.meta.env.VITE_LICENSE_API_URL || 
                        import.meta.env.REACT_APP_LICENSE_API_URL || 
                        'https://license.quantumfalcon.com'
const KV_LICENSE_KEY = 'licenseData'
const KV_SPLASH_KEY = 'hasSeenSplash2025'
const ENABLE_HARDWARE_BINDING = import.meta.env.VITE_ENABLE_HARDWARE_BINDING === 'true' || 
                                 import.meta.env.REACT_APP_ENABLE_HARDWARE_BINDING === 'true'

/**
 * Enhanced License Service for Quantum Falcon Cockpit
 * Unified service merging license-authority integration with existing system
 */
export class EnhancedLicenseService {
  private static instance: EnhancedLicenseService
  private licenseData: LicenseData | null = null
  private deviceFingerprint: DeviceFingerprint | null = null

  private constructor() {
    this.loadFromKV()
    this.initializeDeviceFingerprint()
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): EnhancedLicenseService {
    if (!EnhancedLicenseService.instance) {
      EnhancedLicenseService.instance = new EnhancedLicenseService()
    }
    return EnhancedLicenseService.instance
  }

  /**
   * Initialize device fingerprint (async, non-blocking)
   */
  private async initializeDeviceFingerprint(): Promise<void> {
    try {
      this.deviceFingerprint = await generateDeviceFingerprint()
      // Device fingerprint initialized - no logging needed
    } catch (error) {
      // Silent error - device fingerprint optional
    }
  }

  /**
   * Load license data from KV storage
   */
  private loadFromKV(): void {
    try {
      const stored = localStorage.getItem(KV_LICENSE_KEY)
      if (stored) {
        this.licenseData = JSON.parse(stored)
        // Validate expiration on load
        if (this.licenseData?.expires_at && Date.now() / 1000 > this.licenseData.expires_at) {
          this.clearKV()
          this.licenseData = null
        }
      }
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * Save license data to KV storage
   */
  private saveToKV(data: LicenseData): void {
    try {
      localStorage.setItem(KV_LICENSE_KEY, JSON.stringify(data))
      this.licenseData = data
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * Clear license data from KV storage
   */
  private clearKV(): void {
    try {
      localStorage.removeItem(KV_LICENSE_KEY)
      this.licenseData = null
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * Validate a license key with the License Authority API
   * Enhanced with device fingerprinting for hardware binding
   */
  public async validate(licenseKey: string, hardwareId?: string): Promise<LicenseValidationResponse> {
    try {
      // Ensure device fingerprint is ready
      if (!this.deviceFingerprint && ENABLE_HARDWARE_BINDING) {
        await this.initializeDeviceFingerprint()
      }

      const hardware_id = hardwareId || (this.deviceFingerprint?.fingerprint)
      
      // Add timeout to fetch to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await fetch(`${LICENSE_API_URL}/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Origin': 'quantum-falcon-cockpit',
            'X-Version': '2025.1.0'
          },
          body: JSON.stringify({
            license_key: licenseKey,
            hardware_id: hardware_id,
            device_fingerprint: this.deviceFingerprint,
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'API request failed' }))
          throw new Error(errorData.error || `API request failed: ${response.statusText}`)
        }

        const result: LicenseValidationResponse = await response.json()

        // If valid, store in KV
        if (result.valid && result.token) {
          const licenseData: LicenseData = {
            licenseKey,
            tier: result.tier,
            expires_at: result.expires_at,
            user_id: result.user_id || '',
            features: result.features,
            validated_at: result.validated_at || new Date().toISOString(),
            token: result.token,
            hardware_id: hardware_id,
            device_fingerprint: this.deviceFingerprint || undefined,
          }
          this.saveToKV(licenseData)

          // If hardware binding is enabled and not yet bound, bind device
          if (ENABLE_HARDWARE_BINDING && !result.hardware_bound && this.deviceFingerprint) {
            try {
              await this.bindDevice(licenseKey)
              // Device bound successfully - no logging needed
            } catch (bindError) {
              // Device binding failed - non-critical, silent fail
            }
          }
        } else {
          // Invalid license - clear KV
          this.clearKV()
        }

        return result;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      // Silent error handling
      return {
        valid: false,
        tier: 'free',
        features: [],
        is_grace_period: false,
        is_expired: false,
        auto_renew: false,
        error: error instanceof Error ? error.message : 'Validation failed',
      }
    }
  }

  /**
   * Bind device to license
   */
  public async bindDevice(licenseKey: string): Promise<void> {
    if (!this.deviceFingerprint) {
      await this.initializeDeviceFingerprint()
    }

    if (!this.deviceFingerprint) {
      throw new Error('Device fingerprint not available')
    }

    try {
      const response = await fetch(`${LICENSE_API_URL}/bind-device`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Origin': 'quantum-falcon-cockpit',
        },
        body: JSON.stringify({
          license_key: licenseKey,
          device_fingerprint: this.deviceFingerprint,
        }),
      })

      if (!response.ok) {
        throw new Error('Device binding failed')
      }

      // Device bound successfully - no logging needed
    } catch (error) {
      // Silent error handling
      throw error
    }
  }

  /**
   * Get current license data from KV
   */
  public getLicenseData(): LicenseData | null {
    return this.licenseData
  }

  /**
   * Get current tier
   */
  public getTier(): string {
    return this.licenseData?.tier || 'free'
  }

  /**
   * Check if user has access to a specific feature
   */
  public hasFeature(feature: string): boolean {
    if (!this.licenseData) return false
    return this.licenseData.features.some(f => 
      f.toLowerCase().includes(feature.toLowerCase())
    )
  }

  /**
   * Check if user has access to a specific strategy
   */
  public hasStrategy(strategy: string): boolean {
    const tier = this.getTier()
    
    // Elite, Lifetime, Enterprise, White Label have access to all strategies
    if (['elite', 'lifetime', 'enterprise', 'white_label'].includes(tier)) {
      return true
    }

    // Free tier: only DCA Basic
    if (tier === 'free') {
      return strategy === 'dca_basic' || strategy === 'dca-basic'
    }

    // Pro tier: specific strategies
    if (tier === 'pro') {
      const proStrategies = ['dca_basic', 'dca-basic', 'momentum', 'momentum-basic', 'rsi', 'rsi-strategy', 'macd', 'macd-strategy', 'bollinger', 'bollinger-bands']
      return proStrategies.some(s => strategy.toLowerCase().includes(s.toLowerCase()))
    }

    return false
  }

  /**
   * Get max number of agents allowed for current tier
   */
  public getMaxAgents(): number {
    const tier = this.getTier()
    
    switch (tier) {
      case 'free':
        return 1
      case 'starter':
      case 'trader':
        return 2
      case 'pro':
        return 5
      case 'elite':
      case 'lifetime':
      case 'enterprise':
      case 'white_label':
        return -1 // Unlimited
      default:
        return 1
    }
  }

  /**
   * Check if license is expired
   */
  public isExpired(): boolean {
    if (!this.licenseData || !this.licenseData.expires_at) {
      return false // No expiration or no license
    }
    
    return Date.now() / 1000 > this.licenseData.expires_at
  }

  /**
   * Get days until expiration
   */
  public getDaysUntilExpiry(): number | null {
    if (!this.licenseData || !this.licenseData.expires_at) {
      return null
    }
    
    const now = Date.now() / 1000
    const daysLeft = Math.floor((this.licenseData.expires_at - now) / 86400)
    return daysLeft
  }

  /**
   * Check if user should see renewal reminder
   */
  public shouldShowRenewalReminder(): boolean {
    const daysLeft = this.getDaysUntilExpiry()
    if (daysLeft === null) return false
    
    // Show reminder if 7 days or less remaining
    return daysLeft <= 7 && daysLeft > 0
  }

  /**
   * Mark splash screen as seen (first-time flow)
   */
  public markSplashAsSeen(): void {
    try {
      localStorage.setItem(KV_SPLASH_KEY, 'true')
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * Check if splash screen has been seen
   */
  public hasSeenSplash(): boolean {
    try {
      return localStorage.getItem(KV_SPLASH_KEY) === 'true'
    } catch (error) {
      // Silent error handling
      return false
    }
  }

  /**
   * Get all available tiers from API
   */
  public async getTiers(): Promise<TierInfo[]> {
    try {
      const response = await fetch(`${LICENSE_API_URL}/tiers`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tiers: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      // Silent error handling
      // Return default tiers if API fails
      return this.getDefaultTiers()
    }
  }

  /**
   * Get default tiers (fallback)
   */
  private getDefaultTiers(): TierInfo[] {
    return [
      {
        tier: 'free',
        name: 'Free',
        price: 0,
        features: ['Basic Dashboard', '1 AI Agent', 'DCA Basic Strategy'],
        max_agents: 1,
        max_strategies: 1,
        strategies: ['dca_basic'],
        description: 'Perfect for getting started'
      },
      {
        tier: 'pro',
        name: 'Pro',
        price: 197,
        features: ['5 AI Agents', 'Advanced Strategies', 'Priority Support'],
        max_agents: 5,
        max_strategies: 10,
        strategies: ['dca_basic', 'momentum', 'rsi', 'macd', 'bollinger'],
        description: 'For serious traders'
      },
      {
        tier: 'elite',
        name: 'Elite',
        price: 497,
        features: ['Unlimited Agents', 'All Strategies', 'Custom AI Training'],
        max_agents: -1,
        max_strategies: -1,
        strategies: 'all',
        description: 'Maximum power'
      },
      {
        tier: 'lifetime',
        name: 'Lifetime',
        price: 8000,
        features: ['Everything Forever', 'White-Label Options', 'VIP Support'],
        max_agents: -1,
        max_strategies: -1,
        strategies: 'all',
        description: 'One-time payment, lifetime access'
      }
    ]
  }

  /**
   * Get payment URL for tier upgrade
   */
  public getUpgradeUrl(tier: string, currentLicenseKey?: string): string {
    // These should be your actual payment URLs
    const baseUrls: Record<string, string> = {
      pro: 'https://buy.stripe.com/quantum-falcon-pro',
      elite: 'https://buy.stripe.com/quantum-falcon-elite',
      lifetime: 'https://buy.stripe.com/quantum-falcon-lifetime',
    }

    const url = baseUrls[tier] || baseUrls.pro
    
    // Pre-fill license key if available
    if (currentLicenseKey) {
      return `${url}?prefilled_key=${encodeURIComponent(currentLicenseKey)}`
    }
    
    return url
  }

  /**
   * Clear all license data (logout)
   */
  public clearLicense(): void {
    this.clearKV()
  }

  /**
   * Generate license after payment (integrates with licenseGenerationService)
   */
  public async generateLicenseAfterPayment(paymentData: PaymentCompletionData): Promise<any> {
    return await licenseGenerationService.generateLicenseAfterPayment(paymentData)
  }

  /**
   * Get device fingerprint (for display/debugging)
   */
  public getDeviceFingerprint(): DeviceFingerprint | null {
    return this.deviceFingerprint
  }

  /**
   * Check if hardware binding is enabled
   */
  public isHardwareBindingEnabled(): boolean {
    return ENABLE_HARDWARE_BINDING
  }
}

// Export singleton instance
export const enhancedLicenseService = EnhancedLicenseService.getInstance()

// Export for backward compatibility
export const licenseService = enhancedLicenseService

