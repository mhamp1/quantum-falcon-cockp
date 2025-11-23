// LICENSE AUTHORITY v2: Now full paywall + onboarding brain — November 19, 2025
// licenseService.ts - Client-side license validation service for Quantum Falcon Cockpit

/**
 * License validation response from the License Authority API
 */
export interface LicenseValidationResponse {
  valid: boolean;
  tier: string;
  expires_at?: number;
  user_id?: string;
  email?: string;
  features: string[];
  max_agents?: number;
  max_strategies?: number;
  strategies?: string[];
  is_grace_period: boolean;
  is_expired: boolean;
  days_until_expiry?: number;
  auto_renew: boolean;
  token?: string;
  error?: string;
  validated_at?: string;
}

/**
 * Tier information from the License Authority API
 */
export interface TierInfo {
  tier: string;
  name: string;
  price: number | string;
  features: string[];
  max_agents: number;
  max_strategies: number;
  strategies: string[] | string;
  description: string;
}

/**
 * License data stored in KV storage
 */
export interface LicenseData {
  licenseKey: string;
  tier: string;
  expires_at?: number;
  user_id: string;
  features: string[];
  validated_at: string;
  token: string;
}

// Configuration
const LICENSE_API_URL = process.env.REACT_APP_LICENSE_API_URL || 'https://license.quantumfalcon.com';
const KV_LICENSE_KEY = 'licenseData';
const KV_SPLASH_KEY = 'hasSeenSplash2025';

/**
 * License Service for Quantum Falcon Cockpit Web App
 */
export class LicenseService {
  private static instance: LicenseService;
  private licenseData: LicenseData | null = null;

  private constructor() {
    this.loadFromKV();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): LicenseService {
    if (!LicenseService.instance) {
      LicenseService.instance = new LicenseService();
    }
    return LicenseService.instance;
  }

  /**
   * Load license data from KV storage
   */
  private loadFromKV(): void {
    try {
      const stored = localStorage.getItem(KV_LICENSE_KEY);
      if (stored) {
        this.licenseData = JSON.parse(stored);
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
      localStorage.setItem(KV_LICENSE_KEY, JSON.stringify(data));
      this.licenseData = data;
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * Clear license data from KV storage
   */
  private clearKV(): void {
    try {
      localStorage.removeItem(KV_LICENSE_KEY);
      this.licenseData = null;
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * Validate a license key with the License Authority API
   */
  public async validate(licenseKey: string, hardwareId?: string): Promise<LicenseValidationResponse> {
    try {
      const response = await fetch(`${LICENSE_API_URL}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          license_key: licenseKey,
          hardware_id: hardwareId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const result: LicenseValidationResponse = await response.json();

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
        };
        this.saveToKV(licenseData);
      } else {
        // Invalid license - clear KV
        this.clearKV();
      }

      return result;
    } catch (error) {
      // Silent error handling - don't expose internal details
      return {
        valid: false,
        tier: 'free',
        features: [],
        is_grace_period: false,
        is_expired: false,
        auto_renew: false,
        error: 'License validation failed',
      };
    }
  }

  /**
   * Get current license data from KV
   */
  public getLicenseData(): LicenseData | null {
    return this.licenseData;
  }

  /**
   * Get current tier
   */
  public getTier(): string {
    return this.licenseData?.tier || 'free';
  }

  /**
   * Check if user has access to a specific feature
   */
  public hasFeature(feature: string): boolean {
    if (!this.licenseData) return false;
    return this.licenseData.features.some(f => 
      f.toLowerCase().includes(feature.toLowerCase())
    );
  }

  /**
   * Check if user has access to a specific strategy
   */
  public hasStrategy(strategy: string): boolean {
    const tier = this.getTier();
    
    // Elite, Lifetime, Enterprise, White Label have access to all strategies
    if (['elite', 'lifetime', 'enterprise', 'white_label'].includes(tier)) {
      return true;
    }

    // Free tier: only DCA Basic
    if (tier === 'free') {
      return strategy === 'dca_basic';
    }

    // Pro tier: specific strategies
    if (tier === 'pro') {
      const proStrategies = ['dca_basic', 'momentum', 'rsi', 'macd', 'bollinger'];
      return proStrategies.includes(strategy);
    }

    return false;
  }

  /**
   * Get max number of agents allowed for current tier
   */
  public getMaxAgents(): number {
    const tier = this.getTier();
    
    switch (tier) {
      case 'free':
        return 1;
      case 'pro':
        return 5;
      case 'elite':
      case 'lifetime':
      case 'enterprise':
      case 'white_label':
        return -1; // Unlimited
      default:
        return 1;
    }
  }

  /**
   * Check if license is expired
   */
  public isExpired(): boolean {
    if (!this.licenseData || !this.licenseData.expires_at) {
      return false; // No expiration or no license
    }
    
    return Date.now() / 1000 > this.licenseData.expires_at;
  }

  /**
   * Get days until expiration
   */
  public getDaysUntilExpiry(): number | null {
    if (!this.licenseData || !this.licenseData.expires_at) {
      return null;
    }
    
    const now = Date.now() / 1000;
    const daysLeft = Math.floor((this.licenseData.expires_at - now) / 86400);
    return daysLeft;
  }

  /**
   * Check if user should see renewal reminder
   */
  public shouldShowRenewalReminder(): boolean {
    const daysLeft = this.getDaysUntilExpiry();
    if (daysLeft === null) return false;
    
    // Show reminder if 7 days or less remaining
    return daysLeft <= 7 && daysLeft > 0;
  }

  /**
   * Mark splash screen as seen (first-time flow)
   */
  public markSplashAsSeen(): void {
    try {
      localStorage.setItem(KV_SPLASH_KEY, 'true');
    } catch (error) {
      // Silent error handling
    }
  }

  /**
   * Check if splash screen has been seen
   */
  public hasSeenSplash(): boolean {
    try {
      return localStorage.getItem(KV_SPLASH_KEY) === 'true';
    } catch (error) {
      // Silent error handling
      return false;
    }
  }

  /**
   * Get all available tiers from API
   */
  public async getTiers(): Promise<TierInfo[]> {
    try {
      const response = await fetch(`${LICENSE_API_URL}/tiers`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tiers: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      // Silent error handling
      return [];
    }
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
    };

    const url = baseUrls[tier] || baseUrls.pro;
    
    // Pre-fill license key if available
    if (currentLicenseKey) {
      return `${url}?prefilled_key=${encodeURIComponent(currentLicenseKey)}`;
    }
    
    return url;
  }

  /**
   * Clear all license data (logout)
   */
  public clearLicense(): void {
    this.clearKV();
  }
}

// Export singleton instance
export const licenseService = LicenseService.getInstance();
