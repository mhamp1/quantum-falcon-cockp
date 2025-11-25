// Rental Payment Integration — Stripe/PayPal
// November 24, 2025 — Quantum Falcon Cockpit

import { RENTAL_PLANS, type RentalPlan } from '../strategyRental'
import { toast } from 'sonner'

export interface PaymentResult {
  success: boolean
  transactionId?: string
  error?: string
}

/**
 * Process rental payment via Stripe
 */
export async function processRentalPaymentStripe(
  plan: RentalPlan,
  strategyId: string,
  strategyName: string
): Promise<PaymentResult> {
  try {
    // In production, this would call your Stripe API
    const response = await fetch('/api/payments/stripe/rental', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: plan.id,
        strategyId,
        strategyName,
        amount: plan.price,
        currency: 'USD',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.message || 'Payment failed' }
    }

    const result = await response.json()
    return {
      success: true,
      transactionId: result.paymentIntentId || result.id,
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Payment processing failed' }
  }
}

/**
 * Process rental payment via PayPal
 */
export async function processRentalPaymentPayPal(
  plan: RentalPlan,
  strategyId: string,
  strategyName: string
): Promise<PaymentResult> {
  try {
    const response = await fetch('/api/payments/paypal/rental', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId: plan.id,
        strategyId,
        strategyName,
        amount: plan.price,
        currency: 'USD',
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { success: false, error: error.message || 'Payment failed' }
    }

    const result = await response.json()
    return {
      success: true,
      transactionId: result.orderId || result.id,
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Payment processing failed' }
  }
}

/**
 * Unified payment processor
 */
export async function processRentalPayment(
  plan: RentalPlan,
  strategyId: string,
  strategyName: string,
  method: 'stripe' | 'paypal' = 'stripe'
): Promise<PaymentResult> {
  if (method === 'stripe') {
    return processRentalPaymentStripe(plan, strategyId, strategyName)
  } else {
    return processRentalPaymentPayPal(plan, strategyId, strategyName)
  }
}

