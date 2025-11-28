// ═══════════════════════════════════════════════════════════════
// QUANTUM FALCON — STRIPE SERVICE
// Checkout, webhooks, and subscription management
// November 27, 2025 — Production Ready
// ═══════════════════════════════════════════════════════════════

import { PRICING_TIERS, PricingTier, TAX_CONFIG } from './stripeConfig'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface CheckoutSession {
  id: string
  url: string
  customerId?: string
  clientReferenceId?: string
}

export interface PaymentResult {
  success: boolean
  sessionId?: string
  licenseKey?: string
  tier?: string
  error?: string
}

export interface SubscriptionStatus {
  active: boolean
  tier: string
  currentPeriodEnd?: number
  cancelAtPeriodEnd?: boolean
  customerId?: string
}

// ═══════════════════════════════════════════════════════════════
// API ENDPOINTS
// ═══════════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || ''

// ═══════════════════════════════════════════════════════════════
// CHECKOUT FUNCTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Create Stripe Checkout session for a tier
 */
export async function createCheckoutSession(
  tierId: string,
  userId: string,
  email?: string,
  annual: boolean = false
): Promise<CheckoutSession | null> {
  const tier = PRICING_TIERS.find(t => t.id === tierId)
  
  if (!tier || tier.price === 0) {
    toast.error('Invalid tier selected')
    return null
  }

  try {
    const response = await fetch(`${API_BASE}/api/stripe/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tierId,
        priceId: tier.priceId,
        userId,
        email,
        annual,
        successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/settings?tab=subscriptions`,
        taxEnabled: TAX_CONFIG.enabled,
        collectAddress: TAX_CONFIG.collectAddress,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create checkout session')
    }

    const session = await response.json()
    return session
  } catch (error: any) {
    console.error('[Stripe] Checkout failed:', error)
    toast.error('Checkout Error', { description: error.message })
    return null
  }
}

/**
 * Redirect to Stripe Checkout
 */
export async function redirectToCheckout(
  tierId: string,
  userId: string,
  email?: string
): Promise<void> {
  toast.loading('Opening checkout...', { id: 'checkout' })

  const session = await createCheckoutSession(tierId, userId, email)
  
  if (session?.url) {
    toast.dismiss('checkout')
    window.location.href = session.url
  } else {
    toast.error('Failed to open checkout', { id: 'checkout' })
  }
}

/**
 * Verify payment success
 */
export async function verifyPaymentSuccess(sessionId: string): Promise<PaymentResult> {
  try {
    const response = await fetch(`${API_BASE}/api/stripe/verify-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId }),
    })

    const result = await response.json()
    return result
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ═══════════════════════════════════════════════════════════════
// SUBSCRIPTION MANAGEMENT
// ═══════════════════════════════════════════════════════════════

/**
 * Get current subscription status
 */
export async function getSubscriptionStatus(userId: string): Promise<SubscriptionStatus | null> {
  try {
    const response = await fetch(`${API_BASE}/api/stripe/subscription-status?userId=${userId}`)
    
    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('[Stripe] Subscription status failed:', error)
    return null
  }
}

/**
 * Open customer portal for managing subscription
 */
export async function openCustomerPortal(userId: string): Promise<void> {
  try {
    toast.loading('Opening billing portal...', { id: 'portal' })
    
    const response = await fetch(`${API_BASE}/api/stripe/customer-portal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        returnUrl: `${window.location.origin}/settings?tab=subscriptions`,
      }),
    })

    const { url } = await response.json()
    
    toast.dismiss('portal')
    window.location.href = url
  } catch (error: any) {
    toast.error('Failed to open portal', { id: 'portal' })
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/stripe/cancel-subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    if (response.ok) {
      toast.success('Subscription cancelled', {
        description: 'You will retain access until the end of your billing period',
      })
      return true
    }

    return false
  } catch (error) {
    toast.error('Failed to cancel subscription')
    return false
  }
}

// ═══════════════════════════════════════════════════════════════
// LICENSE KEY GENERATION (Client-side helper)
// ═══════════════════════════════════════════════════════════════

/**
 * Generate a unique license key format
 */
export function generateLicenseKeyFormat(tier: string): string {
  const prefix = 'QF'
  const tierCode = tier.toUpperCase().slice(0, 3)
  const random = Array.from({ length: 16 }, () => 
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
  ).join('')
  
  // Format: QF-PRO-XXXX-XXXX-XXXX-XXXX
  return `${prefix}-${tierCode}-${random.slice(0, 4)}-${random.slice(4, 8)}-${random.slice(8, 12)}-${random.slice(12, 16)}`
}

// ═══════════════════════════════════════════════════════════════
// STRIPE.JS LOADER
// ═══════════════════════════════════════════════════════════════

let stripePromise: Promise<any> | null = null

export function loadStripe(): Promise<any> {
  if (!stripePromise) {
    stripePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://js.stripe.com/v3/'
      script.async = true
      script.onload = () => {
        const stripe = (window as any).Stripe?.(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
        resolve(stripe)
      }
      script.onerror = reject
      document.body.appendChild(script)
    })
  }
  return stripePromise
}

