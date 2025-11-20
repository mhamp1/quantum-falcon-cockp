/**
 * License Hub Types
 * Single source of truth for all license-related types across the Quantum Falcon ecosystem
 */

export type LicenseTier = 'free' | 'pro' | 'elite' | 'lifetime'

export type PaymentProvider = 'stripe' | 'paddle'

export interface LicenseData {
  key: string
  tier: LicenseTier
  expiresAt: number
  userId: string
  features: string[]
  generatedAt: number
  metadata?: Record<string, any>
}

export interface LicenseVerificationResult {
  valid: boolean
  tier?: LicenseTier
  expiresAt?: number
  features?: string[]
  userId?: string
  error?: string
  metadata?: Record<string, any>
}

export interface LicenseGenerationRequest {
  userId: string
  userEmail: string
  tier: LicenseTier
  duration?: number // in days, -1 for lifetime
  paymentIntentId?: string
  timestamp: number
  metadata?: Record<string, any>
}

export interface LicenseGenerationResult {
  success: boolean
  license?: string
  tier: LicenseTier
  expiresAt: number
  userId: string
  generatedAt: number
  error?: string
}

export interface PaymentWebhookEvent {
  provider: PaymentProvider
  eventType: string
  paymentIntentId: string
  amount: number
  currency: string
  userId: string
  userEmail: string
  tier: LicenseTier
  timestamp: number
  metadata?: Record<string, any>
}

export interface DeepLinkParams {
  action: 'activate' | 'renew' | 'upgrade'
  licenseKey?: string
  tier?: LicenseTier
  userId?: string
}

export interface TierFeatures {
  tier: LicenseTier
  displayName: string
  price: number
  duration: number // in days, -1 for lifetime
  features: string[]
  limits: {
    aiAgents: number // -1 for unlimited
    strategies: number
    exchanges: number
    apiCallsPerDay: number
  }
}

export interface LicenseValidationOptions {
  checkExpiration?: boolean
  validateSignature?: boolean
  allowOffline?: boolean
}
