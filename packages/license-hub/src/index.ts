/**
 * @quantumfalcon/license-hub
 * Centralized License Authority for Quantum Falcon Ecosystem
 * 
 * SINGLE SOURCE OF TRUTH for:
 * - License validation logic
 * - Tier definitions and features
 * - Payment webhook handlers
 * - License key generation and encryption
 * - Deep link activation schema
 * 
 * Version: 2025.1.0
 * Production: November 20, 2025
 */

// Export all types
export type {
  LicenseTier,
  PaymentProvider,
  LicenseData,
  LicenseVerificationResult,
  LicenseGenerationRequest,
  LicenseGenerationResult,
  PaymentWebhookEvent,
  DeepLinkParams,
  TierFeatures,
  LicenseValidationOptions
} from './types'

// Export constants
export {
  LICENSE_KEY_PREFIX,
  LICENSE_KEY_VERSION,
  TIER_DEFINITIONS,
  PAYMENT_PROVIDERS,
  EXPIRATION_CONFIG,
  DEEP_LINK_SCHEMA,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from './constants'

// Export validation functions
export {
  validateLicenseKeyFormat,
  extractTierFromKey,
  isLicenseExpired,
  needsRenewalWarning,
  getTimeUntilExpiration,
  verifyLicenseSignature,
  validateLicenseLocal,
  validateLicense,
  hasFeature,
  compareTiers
} from './validation'

// Export feature functions
export {
  getTierFeatures,
  getTierDefinition,
  getAllTierDefinitions,
  tierHasFeature,
  getTierLimits,
  isUnlimited,
  getTierPrice,
  getTierDuration,
  getTierDisplayName,
  isPaidTier,
  getUpgradePath,
  calculateUpgradeCost,
  compareTiersForDisplay,
  getRecommendedTier,
  formatFeaturesForDisplay,
  getTierBadgeColor
} from './features'

// Export generation functions (server-side only)
export {
  generateLicenseKey,
  calculateExpiration,
  generateLicense,
  validateGenerationRequest,
  generateRenewalLicense,
  generateTrialLicense,
  generateUpgradeLicense,
  batchGenerateLicenses
} from './generation'

// Export webhook handlers
export {
  parseStripeWebhook,
  parsePaddleWebhook,
  verifyStripeWebhookSignature,
  verifyPaddleWebhookSignature,
  handlePaymentWebhook,
  processWebhook,
  getWebhookEndpoints,
  validateWebhookPayload
} from './webhooks'

// Export deep link functions
export {
  generateActivationDeepLink,
  generateRenewalDeepLink,
  generateUpgradeDeepLink,
  parseDeepLink,
  validateDeepLink,
  generateDeepLinkQRCode,
  generateEmailActivationLink,
  deepLinkToWebUrl,
  getDeepLinkActionText,
  isDeepLinkExpired,
  generateShareableActivationLink
} from './deeplinks'

/**
 * Main LicenseHub class for client-side usage
 */
export class LicenseHub {
  private apiEndpoint: string

  constructor(apiEndpoint?: string) {
    this.apiEndpoint = apiEndpoint || 'https://api.quantumfalcon.com/license'
  }

  /**
   * Validate a license key against the server
   */
  async validateLicense(licenseKey: string, fingerprint?: string) {
    const { validateLicense } = await import('./validation')
    return validateLicense(licenseKey, this.apiEndpoint + '/verify', fingerprint)
  }

  /**
   * Get tier features
   */
  getTierFeatures(tier: LicenseTier) {
    const { getTierFeatures } = require('./features')
    return getTierFeatures(tier)
  }

  /**
   * Check if license is expired
   */
  isLicenseExpired(expiresAt: number) {
    const { isLicenseExpired } = require('./validation')
    return isLicenseExpired(expiresAt)
  }

  /**
   * Generate activation deep link
   */
  generateActivationDeepLink(licenseKey: string, userId?: string) {
    const { generateActivationDeepLink } = require('./deeplinks')
    return generateActivationDeepLink(licenseKey, userId)
  }

  /**
   * Parse deep link
   */
  parseDeepLink(url: string) {
    const { parseDeepLink } = require('./deeplinks')
    return parseDeepLink(url)
  }

  /**
   * Get all tier definitions
   */
  getAllTiers() {
    const { getAllTierDefinitions } = require('./features')
    return getAllTierDefinitions()
  }

  /**
   * Set API endpoint
   */
  setApiEndpoint(endpoint: string) {
    this.apiEndpoint = endpoint
  }
}

/**
 * Create a new LicenseHub instance
 */
export function createLicenseHub(apiEndpoint?: string): LicenseHub {
  return new LicenseHub(apiEndpoint)
}

// SYNC COMPLETE: All repos now pull from LicenseAuthority Hub — never out of sync again — November 20, 2025
