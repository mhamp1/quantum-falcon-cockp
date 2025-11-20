/**
 * License Validation Module
 * Core validation logic for license keys
 */

import CryptoJS from 'crypto-js'
import type {
  LicenseData,
  LicenseVerificationResult,
  LicenseValidationOptions,
  LicenseTier
} from './types'
import {
  LICENSE_KEY_PREFIX,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  EXPIRATION_CONFIG
} from './constants'
import { getTierFeatures } from './features'

/**
 * Validate license key format
 */
export function validateLicenseKeyFormat(licenseKey: string): boolean {
  if (!licenseKey || typeof licenseKey !== 'string') {
    return false
  }

  // Format: QF-{TIER}-{SIGNATURE}-{TIMESTAMP}
  const parts = licenseKey.split('-')
  
  if (parts.length !== 4) {
    return false
  }

  if (parts[0] !== LICENSE_KEY_PREFIX) {
    return false
  }

  const tier = parts[1].toLowerCase()
  if (!['free', 'pro', 'elite', 'lifetime'].includes(tier)) {
    return false
  }

  // Signature should be 12+ characters
  if (parts[2].length < 12) {
    return false
  }

  // Timestamp should be a valid number
  const timestamp = parseInt(parts[3])
  if (isNaN(timestamp)) {
    return false
  }

  return true
}

/**
 * Extract tier from license key
 */
export function extractTierFromKey(licenseKey: string): LicenseTier | null {
  if (!validateLicenseKeyFormat(licenseKey)) {
    return null
  }

  const parts = licenseKey.split('-')
  return parts[1].toLowerCase() as LicenseTier
}

/**
 * Check if license is expired
 */
export function isLicenseExpired(expiresAt: number): boolean {
  const now = Date.now()
  return now > expiresAt
}

/**
 * Check if license needs renewal warning
 */
export function needsRenewalWarning(expiresAt: number): boolean {
  const now = Date.now()
  const warningThreshold = expiresAt - (EXPIRATION_CONFIG.WARNING_DAYS * 24 * 60 * 60 * 1000)
  return now >= warningThreshold && now < expiresAt
}

/**
 * Get time until expiration
 */
export function getTimeUntilExpiration(expiresAt: number): string {
  const now = Date.now()
  const diff = expiresAt - now

  if (diff <= 0) {
    return 'Expired'
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }
  return `${minutes} minute${minutes > 1 ? 's' : ''}`
}

/**
 * Verify license signature (client-side basic verification)
 */
export function verifyLicenseSignature(
  licenseKey: string,
  masterKey?: string
): boolean {
  if (!validateLicenseKeyFormat(licenseKey)) {
    return false
  }

  // If no master key provided, skip signature verification
  // (Server-side should always verify with master key)
  if (!masterKey) {
    return true
  }

  try {
    const parts = licenseKey.split('-')
    const tier = parts[1]
    const signature = parts[2]
    const timestamp = parts[3]

    // Reconstruct the data that was signed
    const data = `${tier}:${timestamp}`
    
    // Generate expected signature
    const expectedSignature = CryptoJS.HmacSHA256(data, masterKey)
      .toString()
      .substring(0, 12)

    return signature === expectedSignature
  } catch (error) {
    console.error('[LicenseHub] Signature verification error:', error)
    return false
  }
}

/**
 * Validate license locally (offline validation)
 */
export function validateLicenseLocal(
  licenseData: LicenseData,
  options: LicenseValidationOptions = {}
): LicenseVerificationResult {
  const {
    checkExpiration = true,
    validateSignature = false,
    allowOffline = true
  } = options

  // Validate format
  if (!validateLicenseKeyFormat(licenseData.key)) {
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_LICENSE
    }
  }

  // Check expiration if required
  if (checkExpiration && isLicenseExpired(licenseData.expiresAt)) {
    // Check grace period
    const gracePeriodEnd = licenseData.expiresAt + 
      (EXPIRATION_CONFIG.GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000)
    
    if (Date.now() > gracePeriodEnd) {
      return {
        valid: false,
        error: ERROR_MESSAGES.EXPIRED_LICENSE,
        tier: licenseData.tier,
        expiresAt: licenseData.expiresAt
      }
    }
  }

  // Verify signature if required
  if (validateSignature) {
    // Note: Client-side signature verification is limited
    // Full verification should be done server-side
    if (!verifyLicenseSignature(licenseData.key)) {
      return {
        valid: false,
        error: ERROR_MESSAGES.INVALID_SIGNATURE
      }
    }
  }

  return {
    valid: true,
    tier: licenseData.tier,
    expiresAt: licenseData.expiresAt,
    features: licenseData.features,
    userId: licenseData.userId,
    metadata: licenseData.metadata
  }
}

/**
 * Validate license against server API
 */
export async function validateLicense(
  licenseKey: string,
  apiEndpoint: string,
  fingerprint?: string
): Promise<LicenseVerificationResult> {
  try {
    // First check format
    if (!validateLicenseKeyFormat(licenseKey)) {
      return {
        valid: false,
        error: ERROR_MESSAGES.INVALID_LICENSE
      }
    }

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        license: licenseKey,
        timestamp: Date.now(),
        fingerprint: fingerprint || null,
        origin: 'license-hub'
      })
    })

    if (!response.ok) {
      if (response.status === 401) {
        return {
          valid: false,
          error: ERROR_MESSAGES.EXPIRED_LICENSE
        }
      }
      return {
        valid: false,
        error: ERROR_MESSAGES.NETWORK_ERROR
      }
    }

    const data = await response.json() as any

    if (!data.valid) {
      return {
        valid: false,
        error: data.error || ERROR_MESSAGES.INVALID_LICENSE
      }
    }

    return {
      valid: true,
      tier: data.tier,
      expiresAt: data.expiresAt,
      features: data.features || getTierFeatures(data.tier),
      userId: data.userId,
      metadata: data.metadata
    }
  } catch (error) {
    console.error('[LicenseHub] Validation error:', error)
    return {
      valid: false,
      error: ERROR_MESSAGES.NETWORK_ERROR
    }
  }
}

/**
 * Check if feature is available for tier
 */
export function hasFeature(tier: LicenseTier, featureName: string): boolean {
  const features = getTierFeatures(tier)
  return features.some(f => 
    f.toLowerCase().includes(featureName.toLowerCase())
  )
}

/**
 * Compare tiers (returns true if tier1 >= tier2)
 */
export function compareTiers(tier1: LicenseTier, tier2: LicenseTier): boolean {
  const hierarchy: LicenseTier[] = ['free', 'pro', 'elite', 'lifetime']
  return hierarchy.indexOf(tier1) >= hierarchy.indexOf(tier2)
}
