/**
 * Deep Link Activation Schema
 * Handle deep link activations for license activation, renewal, and upgrades
 */

import type { DeepLinkParams, LicenseTier } from './types'
import { DEEP_LINK_SCHEMA } from './constants'

/**
 * Generate activation deep link
 */
export function generateActivationDeepLink(
  licenseKey: string,
  userId?: string
): string {
  const params = new URLSearchParams({
    key: licenseKey
  })

  if (userId) {
    params.append('userId', userId)
  }

  return `${DEEP_LINK_SCHEMA.protocol}://${DEEP_LINK_SCHEMA.host}${DEEP_LINK_SCHEMA.paths.activate}?${params.toString()}`
}

/**
 * Generate renewal deep link
 */
export function generateRenewalDeepLink(
  tier: LicenseTier,
  userId: string
): string {
  const params = new URLSearchParams({
    tier,
    userId
  })

  return `${DEEP_LINK_SCHEMA.protocol}://${DEEP_LINK_SCHEMA.host}${DEEP_LINK_SCHEMA.paths.renew}?${params.toString()}`
}

/**
 * Generate upgrade deep link
 */
export function generateUpgradeDeepLink(
  toTier: LicenseTier,
  userId: string,
  fromTier?: LicenseTier
): string {
  const params = new URLSearchParams({
    tier: toTier,
    userId
  })

  if (fromTier) {
    params.append('fromTier', fromTier)
  }

  return `${DEEP_LINK_SCHEMA.protocol}://${DEEP_LINK_SCHEMA.host}${DEEP_LINK_SCHEMA.paths.upgrade}?${params.toString()}`
}

/**
 * Parse deep link URL
 */
export function parseDeepLink(url: string): DeepLinkParams | null {
  try {
    const urlObj = new URL(url)

    // Validate protocol and host
    if (urlObj.protocol !== `${DEEP_LINK_SCHEMA.protocol}:` ||
        urlObj.hostname !== DEEP_LINK_SCHEMA.host) {
      return null
    }

    const pathname = urlObj.pathname
    const searchParams = urlObj.searchParams

    // Parse activation link
    if (pathname === DEEP_LINK_SCHEMA.paths.activate) {
      const licenseKey = searchParams.get('key')
      const userId = searchParams.get('userId')

      if (!licenseKey) {
        return null
      }

      return {
        action: 'activate',
        licenseKey,
        userId: userId || undefined
      }
    }

    // Parse renewal link
    if (pathname === DEEP_LINK_SCHEMA.paths.renew) {
      const tier = searchParams.get('tier') as LicenseTier
      const userId = searchParams.get('userId')

      if (!tier || !userId) {
        return null
      }

      return {
        action: 'renew',
        tier,
        userId
      }
    }

    // Parse upgrade link
    if (pathname === DEEP_LINK_SCHEMA.paths.upgrade) {
      const tier = searchParams.get('tier') as LicenseTier
      const userId = searchParams.get('userId')

      if (!tier || !userId) {
        return null
      }

      return {
        action: 'upgrade',
        tier,
        userId
      }
    }

    return null
  } catch (error) {
    console.error('[LicenseHub] Deep link parse error:', error)
    return null
  }
}

/**
 * Validate deep link format
 */
export function validateDeepLink(url: string): boolean {
  const parsed = parseDeepLink(url)
  return parsed !== null
}

/**
 * Generate QR code data for deep link (returns base64 data URL)
 */
export function generateDeepLinkQRCode(deepLink: string): string {
  // This is a placeholder - in production, use a QR code library
  // Example: qrcode library
  // const QRCode = require('qrcode')
  // return await QRCode.toDataURL(deepLink)
  
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="white"/>
      <text x="100" y="100" text-anchor="middle" fill="black" font-size="12">
        QR Code Placeholder
      </text>
      <text x="100" y="120" text-anchor="middle" fill="gray" font-size="8">
        ${deepLink.substring(0, 30)}...
      </text>
    </svg>
  `)}`
}

/**
 * Generate email-friendly activation link
 */
export function generateEmailActivationLink(
  licenseKey: string,
  webAppUrl: string,
  userId?: string
): string {
  const params = new URLSearchParams({
    action: 'activate',
    key: licenseKey
  })

  if (userId) {
    params.append('userId', userId)
  }

  return `${webAppUrl}/activate?${params.toString()}`
}

/**
 * Convert deep link to web URL
 */
export function deepLinkToWebUrl(deepLink: string, webAppUrl: string): string | null {
  const params = parseDeepLink(deepLink)
  if (!params) {
    return null
  }

  const urlParams = new URLSearchParams()

  switch (params.action) {
    case 'activate':
      if (params.licenseKey) {
        urlParams.append('key', params.licenseKey)
      }
      if (params.userId) {
        urlParams.append('userId', params.userId)
      }
      return `${webAppUrl}/activate?${urlParams.toString()}`

    case 'renew':
      if (params.tier) {
        urlParams.append('tier', params.tier)
      }
      if (params.userId) {
        urlParams.append('userId', params.userId)
      }
      return `${webAppUrl}/renew?${urlParams.toString()}`

    case 'upgrade':
      if (params.tier) {
        urlParams.append('tier', params.tier)
      }
      if (params.userId) {
        urlParams.append('userId', params.userId)
      }
      return `${webAppUrl}/upgrade?${urlParams.toString()}`

    default:
      return null
  }
}

/**
 * Get deep link action display text
 */
export function getDeepLinkActionText(params: DeepLinkParams): string {
  switch (params.action) {
    case 'activate':
      return 'Activate License'
    case 'renew':
      return `Renew ${params.tier?.toUpperCase()} License`
    case 'upgrade':
      return `Upgrade to ${params.tier?.toUpperCase()}`
    default:
      return 'Unknown Action'
  }
}

/**
 * Check if deep link is expired (for time-sensitive links)
 */
export function isDeepLinkExpired(
  createdAt: number,
  expirationHours: number = 24
): boolean {
  const now = Date.now()
  const expirationTime = createdAt + (expirationHours * 60 * 60 * 1000)
  return now > expirationTime
}

/**
 * Generate shareable activation link with expiration
 */
export function generateShareableActivationLink(
  licenseKey: string,
  userId: string,
  expirationHours: number = 24
): {
  deepLink: string
  webUrl: string
  qrCode: string
  expiresAt: number
} {
  const deepLink = generateActivationDeepLink(licenseKey, userId)
  const expiresAt = Date.now() + (expirationHours * 60 * 60 * 1000)
  
  return {
    deepLink,
    webUrl: generateEmailActivationLink(licenseKey, 'https://app.quantumfalcon.com', userId),
    qrCode: generateDeepLinkQRCode(deepLink),
    expiresAt
  }
}
