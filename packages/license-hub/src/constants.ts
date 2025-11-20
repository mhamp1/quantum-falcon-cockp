/**
 * License Hub Constants
 * Single source of truth for tier definitions and feature configurations
 */

import type { TierFeatures, LicenseTier } from './types'

export const LICENSE_KEY_PREFIX = 'QF'
export const LICENSE_KEY_VERSION = 'v1'

/**
 * Tier Definitions - SINGLE SOURCE OF TRUTH
 * Any changes here automatically propagate to all consuming repos
 */
export const TIER_DEFINITIONS: Record<LicenseTier, TierFeatures> = {
  free: {
    tier: 'free',
    displayName: 'Free Trial',
    price: 0,
    duration: 30,
    features: [
      'Basic Dashboard',
      'Manual Trading',
      'Basic Analytics',
      'Community Access (Read-only)',
      'Single Exchange Connection'
    ],
    limits: {
      aiAgents: 0,
      strategies: 3,
      exchanges: 1,
      apiCallsPerDay: 100
    }
  },
  pro: {
    tier: 'pro',
    displayName: 'Pro',
    price: 90,
    duration: 30,
    features: [
      'All Free Features',
      'AI Trading Agents (3)',
      'Advanced Analytics',
      'Strategy Marketplace',
      'Copy Trading',
      'Multi-Exchange Support (3)',
      'Priority Support',
      'Advanced Charting',
      'Risk Management Tools'
    ],
    limits: {
      aiAgents: 3,
      strategies: 10,
      exchanges: 3,
      apiCallsPerDay: 1000
    }
  },
  elite: {
    tier: 'elite',
    displayName: 'Elite',
    price: 145,
    duration: 30,
    features: [
      'All Pro Features',
      'AI Trading Agents (Unlimited)',
      'Advanced Market Intelligence',
      'Custom Strategy Builder',
      'API Access',
      'Whale Tracking',
      'Premium Community Features',
      'Unlimited Exchanges',
      'Advanced Backtesting',
      'Custom Indicators',
      'Portfolio Analytics'
    ],
    limits: {
      aiAgents: -1, // unlimited
      strategies: -1,
      exchanges: -1,
      apiCallsPerDay: 10000
    }
  },
  lifetime: {
    tier: 'lifetime',
    displayName: 'Lifetime',
    price: 8000,
    duration: -1, // lifetime
    features: [
      'All Elite Features',
      'Lifetime Updates',
      'VIP Support',
      'Beta Access',
      'Custom Integrations',
      'White-Label Options',
      'Direct Developer Access',
      'Custom Feature Requests',
      'Priority Bug Fixes'
    ],
    limits: {
      aiAgents: -1,
      strategies: -1,
      exchanges: -1,
      apiCallsPerDay: -1 // unlimited
    }
  }
}

/**
 * Payment Provider Configuration
 */
export const PAYMENT_PROVIDERS = {
  stripe: {
    name: 'Stripe',
    webhookEvents: [
      'checkout.session.completed',
      'payment_intent.succeeded',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted'
    ]
  },
  paddle: {
    name: 'Paddle',
    webhookEvents: [
      'transaction.completed',
      'transaction.updated',
      'subscription.created',
      'subscription.updated',
      'subscription.canceled'
    ]
  }
} as const

/**
 * License Expiration Settings
 */
export const EXPIRATION_CONFIG = {
  WARNING_DAYS: 7, // Show renewal warning when X days remaining
  GRACE_PERIOD_DAYS: 3, // Grace period after expiration
  AUTO_RENEWAL_ENABLED: true,
  LIFETIME_DURATION_YEARS: 100 // Treat as 100 years
}

/**
 * Deep Link Configuration
 */
export const DEEP_LINK_SCHEMA = {
  protocol: 'quantumfalcon',
  host: 'license',
  paths: {
    activate: '/activate',
    renew: '/renew',
    upgrade: '/upgrade'
  }
}

/**
 * API Endpoints (relative paths)
 */
export const API_ENDPOINTS = {
  VERIFY: '/api/verify',
  GENERATE: '/api/generate',
  RENEW: '/api/renew',
  REVOKE: '/api/revoke',
  WEBHOOKS: {
    STRIPE: '/webhooks/stripe',
    PADDLE: '/webhooks/paddle'
  }
}

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  INVALID_LICENSE: 'Invalid license key format',
  EXPIRED_LICENSE: 'License has expired',
  REVOKED_LICENSE: 'License has been revoked',
  INVALID_SIGNATURE: 'License signature verification failed',
  TIER_NOT_FOUND: 'License tier not found',
  NETWORK_ERROR: 'Network error during verification',
  GENERATION_FAILED: 'Failed to generate license',
  WEBHOOK_INVALID: 'Invalid webhook signature',
  USER_NOT_FOUND: 'User not found',
  PAYMENT_FAILED: 'Payment processing failed'
}

/**
 * Success Messages
 */
export const SUCCESS_MESSAGES = {
  LICENSE_VALID: 'License verified successfully',
  LICENSE_GENERATED: 'License generated successfully',
  LICENSE_RENEWED: 'License renewed successfully',
  PAYMENT_PROCESSED: 'Payment processed successfully',
  WEBHOOK_PROCESSED: 'Webhook processed successfully'
}
