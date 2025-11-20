/**
 * License Generation Module
 * Server-side license generation logic
 */

import CryptoJS from 'crypto-js'
import type {
  LicenseGenerationRequest,
  LicenseGenerationResult,
  LicenseTier
} from './types'
import {
  LICENSE_KEY_PREFIX,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  EXPIRATION_CONFIG
} from './constants'
import { getTierDuration, getTierFeatures } from './features'

/**
 * Generate license key
 * This should only be called server-side with proper master key
 */
export function generateLicenseKey(
  userId: string,
  tier: LicenseTier,
  masterKey: string,
  timestamp?: number
): string {
  const ts = timestamp || Date.now()
  
  // Create signature data
  const data = `${tier}:${ts}`
  
  // Generate HMAC signature
  const signature = CryptoJS.HmacSHA256(data, masterKey)
    .toString()
    .substring(0, 12)

  // Format: QF-{TIER}-{SIGNATURE}-{TIMESTAMP}
  return `${LICENSE_KEY_PREFIX}-${tier.toUpperCase()}-${signature}-${ts}`
}

/**
 * Calculate expiration timestamp
 */
export function calculateExpiration(
  tier: LicenseTier,
  customDuration?: number
): number {
  const duration = customDuration !== undefined 
    ? customDuration 
    : getTierDuration(tier)

  if (duration === -1) {
    // Lifetime: 100 years from now
    return Date.now() + (EXPIRATION_CONFIG.LIFETIME_DURATION_YEARS * 365 * 24 * 60 * 60 * 1000)
  }

  // Duration in days to milliseconds
  return Date.now() + (duration * 24 * 60 * 60 * 1000)
}

/**
 * Generate license (server-side function)
 */
export function generateLicense(
  request: LicenseGenerationRequest,
  masterKey: string
): LicenseGenerationResult {
  try {
    const {
      userId,
      tier,
      duration,
      timestamp
    } = request

    // Generate license key
    const licenseKey = generateLicenseKey(
      userId,
      tier,
      masterKey,
      timestamp
    )

    // Calculate expiration
    const expiresAt = calculateExpiration(tier, duration)

    return {
      success: true,
      license: licenseKey,
      tier,
      expiresAt,
      userId,
      generatedAt: timestamp || Date.now()
    }
  } catch (error) {
    console.error('[LicenseHub] Generation error:', error)
    return {
      success: false,
      tier: request.tier,
      expiresAt: 0,
      userId: request.userId,
      generatedAt: Date.now(),
      error: error instanceof Error ? error.message : ERROR_MESSAGES.GENERATION_FAILED
    }
  }
}

/**
 * Validate generation request
 */
export function validateGenerationRequest(
  request: LicenseGenerationRequest
): { valid: boolean; error?: string } {
  if (!request.userId || typeof request.userId !== 'string') {
    return { valid: false, error: 'Invalid user ID' }
  }

  if (!request.userEmail || !request.userEmail.includes('@')) {
    return { valid: false, error: 'Invalid email address' }
  }

  const validTiers: LicenseTier[] = ['free', 'pro', 'elite', 'lifetime']
  if (!validTiers.includes(request.tier)) {
    return { valid: false, error: 'Invalid tier' }
  }

  if (request.duration !== undefined) {
    if (typeof request.duration !== 'number' || 
        (request.duration < 1 && request.duration !== -1)) {
      return { valid: false, error: 'Invalid duration' }
    }
  }

  return { valid: true }
}

/**
 * Generate renewal license
 */
export function generateRenewalLicense(
  currentLicenseKey: string,
  masterKey: string,
  customDuration?: number
): LicenseGenerationResult {
  try {
    // Extract info from current license
    const parts = currentLicenseKey.split('-')
    if (parts.length !== 4 || parts[0] !== LICENSE_KEY_PREFIX) {
      return {
        success: false,
        tier: 'free',
        expiresAt: 0,
        userId: '',
        generatedAt: Date.now(),
        error: ERROR_MESSAGES.INVALID_LICENSE
      }
    }

    const tier = parts[1].toLowerCase() as LicenseTier
    const oldTimestamp = parts[3]

    // Generate new license with same tier
    const timestamp = Date.now()
    const newLicenseKey = generateLicenseKey('', tier, masterKey, timestamp)
    const expiresAt = calculateExpiration(tier, customDuration)

    return {
      success: true,
      license: newLicenseKey,
      tier,
      expiresAt,
      userId: '', // Should be filled by caller
      generatedAt: timestamp
    }
  } catch (error) {
    console.error('[LicenseHub] Renewal generation error:', error)
    return {
      success: false,
      tier: 'free',
      expiresAt: 0,
      userId: '',
      generatedAt: Date.now(),
      error: error instanceof Error ? error.message : ERROR_MESSAGES.GENERATION_FAILED
    }
  }
}

/**
 * Generate trial license
 */
export function generateTrialLicense(
  userId: string,
  userEmail: string,
  masterKey: string,
  durationDays: number = 30
): LicenseGenerationResult {
  return generateLicense({
    userId,
    userEmail,
    tier: 'free',
    duration: durationDays,
    timestamp: Date.now()
  }, masterKey)
}

/**
 * Generate upgrade license
 */
export function generateUpgradeLicense(
  userId: string,
  newTier: LicenseTier,
  masterKey: string,
  daysRemaining?: number
): LicenseGenerationResult {
  // If upgrading mid-period, extend by remaining days
  const baseDuration = getTierDuration(newTier)
  const totalDuration = daysRemaining && baseDuration !== -1
    ? baseDuration + daysRemaining
    : baseDuration

  const timestamp = Date.now()
  const licenseKey = generateLicenseKey(userId, newTier, masterKey, timestamp)
  const expiresAt = calculateExpiration(newTier, totalDuration)

  return {
    success: true,
    license: licenseKey,
    tier: newTier,
    expiresAt,
    userId,
    generatedAt: timestamp
  }
}

/**
 * Batch generate licenses (e.g., for promotions)
 */
export function batchGenerateLicenses(
  count: number,
  tier: LicenseTier,
  masterKey: string,
  duration?: number
): LicenseGenerationResult[] {
  const results: LicenseGenerationResult[] = []

  for (let i = 0; i < count; i++) {
    const userId = `batch_${Date.now()}_${i}`
    const result = generateLicense({
      userId,
      userEmail: `${userId}@generated.com`,
      tier,
      duration,
      timestamp: Date.now()
    }, masterKey)
    
    results.push(result)
  }

  return results
}
