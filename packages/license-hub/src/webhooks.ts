/**
 * Payment Webhook Handlers
 * Standardized webhook processing for Stripe and Paddle
 */

import type {
  PaymentWebhookEvent,
  LicenseGenerationRequest,
  LicenseGenerationResult,
  PaymentProvider,
  LicenseTier
} from './types'
import { PAYMENT_PROVIDERS, ERROR_MESSAGES } from './constants'
import { generateLicense } from './generation'

/**
 * Parse Stripe webhook event
 */
export function parseStripeWebhook(rawEvent: any): PaymentWebhookEvent | null {
  try {
    const eventType = rawEvent.type

    // Handle checkout.session.completed
    if (eventType === 'checkout.session.completed') {
      const session = rawEvent.data.object
      return {
        provider: 'stripe',
        eventType: 'payment_completed',
        paymentIntentId: session.payment_intent || session.id,
        amount: session.amount_total / 100, // Convert cents to dollars
        currency: session.currency,
        userId: session.metadata?.userId || session.client_reference_id,
        userEmail: session.customer_email,
        tier: (session.metadata?.tier || 'free') as LicenseTier,
        timestamp: rawEvent.created * 1000,
        metadata: session.metadata
      }
    }

    // Handle payment_intent.succeeded
    if (eventType === 'payment_intent.succeeded') {
      const intent = rawEvent.data.object
      return {
        provider: 'stripe',
        eventType: 'payment_completed',
        paymentIntentId: intent.id,
        amount: intent.amount / 100,
        currency: intent.currency,
        userId: intent.metadata?.userId || '',
        userEmail: intent.receipt_email || '',
        tier: (intent.metadata?.tier || 'free') as LicenseTier,
        timestamp: rawEvent.created * 1000,
        metadata: intent.metadata
      }
    }

    // Handle subscription events
    if (eventType === 'customer.subscription.created' || 
        eventType === 'customer.subscription.updated') {
      const subscription = rawEvent.data.object
      return {
        provider: 'stripe',
        eventType: eventType === 'customer.subscription.created' 
          ? 'subscription_created' 
          : 'subscription_updated',
        paymentIntentId: subscription.id,
        amount: subscription.items.data[0]?.price.unit_amount / 100 || 0,
        currency: subscription.currency,
        userId: subscription.metadata?.userId || '',
        userEmail: subscription.metadata?.email || '',
        tier: (subscription.metadata?.tier || 'free') as LicenseTier,
        timestamp: rawEvent.created * 1000,
        metadata: subscription.metadata
      }
    }

    return null
  } catch (error) {
    console.error('[LicenseHub] Stripe webhook parse error:', error)
    return null
  }
}

/**
 * Parse Paddle webhook event
 */
export function parsePaddleWebhook(rawEvent: any): PaymentWebhookEvent | null {
  try {
    const eventType = rawEvent.event_type

    // Handle transaction.completed
    if (eventType === 'transaction.completed') {
      const transaction = rawEvent.data
      const customData = transaction.custom_data 
        ? JSON.parse(transaction.custom_data) 
        : {}

      return {
        provider: 'paddle',
        eventType: 'payment_completed',
        paymentIntentId: transaction.id,
        amount: parseFloat(transaction.details.totals.total),
        currency: transaction.currency_code,
        userId: customData.userId || transaction.customer_id,
        userEmail: transaction.customer.email,
        tier: (customData.tier || 'free') as LicenseTier,
        timestamp: new Date(transaction.created_at).getTime(),
        metadata: customData
      }
    }

    // Handle subscription events
    if (eventType === 'subscription.created' || 
        eventType === 'subscription.updated') {
      const subscription = rawEvent.data
      const customData = subscription.custom_data 
        ? JSON.parse(subscription.custom_data) 
        : {}

      return {
        provider: 'paddle',
        eventType: eventType === 'subscription.created' 
          ? 'subscription_created' 
          : 'subscription_updated',
        paymentIntentId: subscription.id,
        amount: parseFloat(subscription.items[0]?.price?.unit_price?.amount || '0'),
        currency: subscription.currency_code,
        userId: customData.userId || subscription.customer_id,
        userEmail: subscription.customer_email || '',
        tier: (customData.tier || 'free') as LicenseTier,
        timestamp: new Date(subscription.created_at).getTime(),
        metadata: customData
      }
    }

    return null
  } catch (error) {
    console.error('[LicenseHub] Paddle webhook parse error:', error)
    return null
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // This is a simplified version - use Stripe's official library in production
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    // const event = stripe.webhooks.constructEvent(payload, signature, secret)
    
    // For now, just check signature exists
    return Boolean(signature && secret)
  } catch (error) {
    console.error('[LicenseHub] Stripe signature verification error:', error)
    return false
  }
}

/**
 * Verify Paddle webhook signature
 */
export function verifyPaddleWebhookSignature(
  payload: any,
  signature: string,
  publicKey: string
): boolean {
  try {
    // This is a simplified version - use Paddle's official library in production
    // Paddle uses RSA-SHA1 signature verification
    
    // For now, just check signature exists
    return Boolean(signature && publicKey)
  } catch (error) {
    console.error('[LicenseHub] Paddle signature verification error:', error)
    return false
  }
}

/**
 * Handle payment webhook and generate license
 */
export async function handlePaymentWebhook(
  event: PaymentWebhookEvent,
  masterKey: string,
  onLicenseGenerated?: (result: LicenseGenerationResult) => void | Promise<void>
): Promise<LicenseGenerationResult> {
  try {
    // Validate event
    if (!event.userId || !event.userEmail) {
      return {
        success: false,
        tier: event.tier,
        expiresAt: 0,
        userId: event.userId || '',
        generatedAt: Date.now(),
        error: ERROR_MESSAGES.USER_NOT_FOUND
      }
    }

    // Only generate license for payment completed events
    if (event.eventType !== 'payment_completed' && 
        event.eventType !== 'subscription_created') {
      return {
        success: false,
        tier: event.tier,
        expiresAt: 0,
        userId: event.userId,
        generatedAt: Date.now(),
        error: 'Event type does not require license generation'
      }
    }

    // Create generation request
    const request: LicenseGenerationRequest = {
      userId: event.userId,
      userEmail: event.userEmail,
      tier: event.tier,
      paymentIntentId: event.paymentIntentId,
      timestamp: event.timestamp,
      metadata: {
        ...event.metadata,
        paymentProvider: event.provider,
        amount: event.amount,
        currency: event.currency
      }
    }

    // Generate license
    const result = generateLicense(request, masterKey)

    // Call callback if provided
    if (result.success && onLicenseGenerated) {
      await onLicenseGenerated(result)
    }

    return result
  } catch (error) {
    console.error('[LicenseHub] Webhook handler error:', error)
    return {
      success: false,
      tier: event.tier,
      expiresAt: 0,
      userId: event.userId,
      generatedAt: Date.now(),
      error: error instanceof Error ? error.message : ERROR_MESSAGES.PAYMENT_FAILED
    }
  }
}

/**
 * Process webhook from either provider
 */
export async function processWebhook(
  provider: PaymentProvider,
  rawEvent: any,
  signature: string,
  secret: string,
  masterKey: string,
  onLicenseGenerated?: (result: LicenseGenerationResult) => void | Promise<void>
): Promise<LicenseGenerationResult | null> {
  try {
    // Verify signature
    const isValid = provider === 'stripe'
      ? verifyStripeWebhookSignature(JSON.stringify(rawEvent), signature, secret)
      : verifyPaddleWebhookSignature(rawEvent, signature, secret)

    if (!isValid) {
      console.error('[LicenseHub] Invalid webhook signature')
      return null
    }

    // Parse event
    const event = provider === 'stripe'
      ? parseStripeWebhook(rawEvent)
      : parsePaddleWebhook(rawEvent)

    if (!event) {
      console.warn('[LicenseHub] Event not processable or not relevant')
      return null
    }

    // Handle event and generate license
    return await handlePaymentWebhook(event, masterKey, onLicenseGenerated)
  } catch (error) {
    console.error('[LicenseHub] Webhook processing error:', error)
    return null
  }
}

/**
 * Get webhook endpoint URLs
 */
export function getWebhookEndpoints(baseUrl: string) {
  return {
    stripe: `${baseUrl}/webhooks/stripe`,
    paddle: `${baseUrl}/webhooks/paddle`
  }
}

/**
 * Validate webhook payload
 */
export function validateWebhookPayload(payload: any): boolean {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  // Check for required fields based on provider
  if (payload.type) {
    // Stripe format
    return Boolean(payload.type && payload.data && payload.created)
  }

  if (payload.event_type) {
    // Paddle format
    return Boolean(payload.event_type && payload.data)
  }

  return false
}
