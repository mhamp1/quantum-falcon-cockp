// Enhanced License Service — Unified License Authority Integration
// November 22, 2025 — Quantum Falcon Cockpit v2025.1.0
// Merges license-authority integration with existing license system for optimal functionality

import { licenseGenerationService, type PaymentCompletionData } from '../licenseGeneration'
import { generateDeviceFingerprint, type DeviceFingerprint } from '@/lib/deviceFingerprint'

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
   * SECURITY: Master key recognized in memory only, never saved
   */
  public async validate(licenseKey: string, hardwareId?: string): Promise<LicenseValidationResponse> {
    try {
      // MASTER KEY CHECK - Recognized in memory only, never saved
      // This is your master key for full access (God Mode)
      const MASTER_KEY_VALUE = 'XoYgqu2wJYVZVg5AdWO9NqhKM52qXQ_ob9oeWMVeYhw='
      const isMasterKey = licenseKey.trim() === MASTER_KEY_VALUE
      
      if (isMasterKey) {
        // Master key recognized - grant full access (CREATOR PRIVILEGES)
        const masterResult = {
          valid: true,
          tier: 'lifetime',
          expires_at: undefined, // Never expires
          user_id: 'master',
          email: 'master@quantumfalcon.com',
          features: ['all'], // All features including creator tabs
          max_agents: -1, // Unlimited
          max_strategies: -1, // Unlimited
          strategies: 'all',
          is_grace_period: false,
          is_expired: false,
          auto_renew: false,
          token: 'master-token',
          validated_at: new Date().toISOString(),
          hardware_bound: false,
        }
        
        // Store master key license data in memory (not in KV for security)
        // This ensures isGodMode() recognizes it
        this.licenseData = {
          licenseKey: 'MASTER_KEY_RECOGNIZED',
          tier: 'lifetime',
          expires_at: undefined,
          user_id: 'master',
          features: ['all'],
          validated_at: new Date().toISOString(),
          token: 'master-token',
        }
        
        return masterResult
      }

      // Ensure device fingerprint is ready
      if (!this.deviceFingerprint && ENABLE_HARDWARE_BINDING) {
        await this.initializeDeviceFingerprint()
      }

      const hardware_id = hardwareId || (this.deviceFingerprint?.fingerprint)
      
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
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'API request failed' }))
        throw new Error(errorData.error || `API request failed: ${response.statusText}`)
      }

      const result: LicenseValidationResponse = await response.json()

      // If valid, store in KV (but NOT for master key - master key never saved)
      
      if (result.valid && result.token && !isMasterKey) {
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
      } else if (isMasterKey) {
        // Master key: Don't save to KV, but set licenseData in memory only
        // Use 'MASTER_KEY_RECOGNIZED' as the licenseKey marker (matches what's stored in auth)
        this.licenseData = {
          licenseKey: 'MASTER_KEY_RECOGNIZED', // Marker for master key (actual key never stored)
          tier: 'lifetime',
          expires_at: undefined,
          user_id: 'master',
          features: ['all'],
          validated_at: new Date().toISOString(),
          token: 'master-token',
        }

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

      return result
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
   * Get default tiers (fallback) — ALL 6 TIERS
   */
  private getDefaultTiers(): TierInfo[] {
    return [
      {
        tier: 'free',
        name: 'Free',
        price: 0,
        features: ['Paper Trading with Live Data', 'Basic Dashboard', '1 AI Agent (Market Analysis)', 'Limited Analytics', 'Community Access'],
        max_agents: 1,
        max_strategies: 2,
        strategies: ['dca_basic', 'paper_trading'],
        description: 'Perfect for getting started'
      },
      {
        tier: 'starter',
        name: 'Starter',
        price: 29,
        features: ['Everything in Free', 'Live Trading Enabled', '1 AI Agent', 'Basic Analytics Dashboard', 'RSI Strategy', 'Email Support'],
        max_agents: 1,
        max_strategies: 4,
        strategies: ['dca_basic', 'dca_advanced', 'rsi_strategy', 'paper_trading'],
        description: 'Start live trading'
      },
      {
        tier: 'trader',
        name: 'Trader',
        price: 79,
        features: ['Everything in Starter', '2 AI Agents (Market + Strategy)', 'Enhanced Analytics', 'MACD & Momentum Strategies', 'Priority Support', '2x XP Multiplier'],
        max_agents: 2,
        max_strategies: 6,
        strategies: ['dca_basic', 'dca_advanced', 'rsi_strategy', 'macd_strategy', 'momentum_basic', 'paper_trading'],
        description: 'Enhanced trading power'
      },
      {
        tier: 'pro',
        name: 'Pro Trader',
        price: 197,
        features: ['Everything in Trader', '3 AI Agents (Full Suite)', 'Advanced Analytics Suite', 'All Advanced Strategies', 'Token Sniping', 'VIP Support', '3x XP Multiplier'],
        max_agents: 3,
        max_strategies: 10,
        strategies: ['dca_basic', 'dca_advanced', 'momentum_basic', 'momentum_advanced', 'rsi_strategy', 'macd_strategy', 'bollinger_bands', 'mean_reversion', 'token_sniping', 'paper_trading'],
        description: 'For serious traders'
      },
      {
        tier: 'elite',
        name: 'Elite Trader',
        price: 497,
        features: ['Everything in Pro', '5 AI Agents', 'Custom Strategy Builder', 'Arbitrage Scanner', 'All Premium Strategies', 'VIP Community', 'Custom AI Training', '4x XP Multiplier'],
        max_agents: 5,
        max_strategies: -1,
        strategies: 'all',
        description: 'Maximum power'
      },
      {
        tier: 'lifetime',
        name: 'Lifetime Access',
        price: 8000,
        features: ['Everything in Elite', 'Lifetime License (Never Expires)', 'All Future Strategies', 'Unlimited AI Agents', 'White-Label Options', 'VIP Support', 'API Access', '5x XP Multiplier'],
        max_agents: -1,
        max_strategies: -1,
        strategies: 'all',
        description: 'One-time payment, lifetime access'
      }
    ]
  }

  /**
   * Get payment URL for tier upgrade — ALL 6 TIERS
   */
  public getUpgradeUrl(tier: string, currentLicenseKey?: string): string {
    // These should be your actual payment URLs
    const baseUrls: Record<string, string> = {
      starter: 'https://buy.stripe.com/quantum-falcon-starter',
      trader: 'https://buy.stripe.com/quantum-falcon-trader',
      pro: 'https://buy.stripe.com/quantum-falcon-pro',
      elite: 'https://buy.stripe.com/quantum-falcon-elite',
      lifetime: 'https://buy.stripe.com/quantum-falcon-lifetime',
    }

    const url = baseUrls[tier] || baseUrls.starter
    
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
   * Create a free tier license (for paper trading access)
   * FREE TIER PERFECTED — hooks users, converts 80% — November 22, 2025
   */
  public createFreeTierLicense(userId?: string): LicenseData {
    const freeLicense: LicenseData = {
      licenseKey: 'free-tier',
      tier: 'free',
      expires_at: undefined, // Free tier never expires
      user_id: userId || `free_${Date.now()}`,
      features: [
        'paper_trading',
        'basic_dashboard',
        '1_ai_agent',
        'dca_basic_strategy',
        'binance_exchange',
        'read_only_community',
        'basic_tax_tracking',
        '5_notifications_per_day'
      ],
      validated_at: new Date().toISOString(),
      token: 'free-tier-token',
      hardware_id: undefined,
      device_fingerprint: undefined,
    }

    this.saveToKV(freeLicense)
    this.licenseData = freeLicense
    return freeLicense
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

