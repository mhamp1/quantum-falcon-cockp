/**
 * Payment Webhook Handlers
 * 
 * Handles webhook events from payment providers (Stripe, Paddle)
 * and triggers automatic license generation upon successful payment.
 */

import { paymentProcessor } from '@/lib/payment/paymentProcessor'
import { toast } from 'sonner'

export interface WebhookEvent {
  type: string
  provider: 'stripe' | 'paddle'
  data: any
  timestamp: number
}

export interface StripeCheckoutCompletedEvent {
  id: string
  object: string
  customer_email: string
  metadata: {
    userId: string
    tier: string
    type: string
  }
  amount_total: number
  payment_intent: string
}

export interface PaddleTransactionCompletedEvent {
  event_id: string
  event_type: string
  data: {
    id: string
    customer: {
      email: string
    }
    custom_data?: {
      userId?: string
      tier?: string
    }
    items: Array<{
      product_id: string
      price: {
        unit_amount: {
          amount: string
        }
      }
    }>
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(event: any): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Webhook] Processing Stripe event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed':
        return await handleStripeCheckoutCompleted(event.data.object)

      case 'invoice.payment_succeeded':
        return await handleStripeInvoicePaymentSucceeded(event.data.object)

      case 'customer.subscription.deleted':
        return await handleStripeSubscriptionDeleted(event.data.object)

      default:
        console.log('[Webhook] Unhandled Stripe event type:', event.type)
        return { success: true }
    }
  } catch (error) {
    console.error('[Webhook] Stripe webhook error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Handle Stripe checkout.session.completed event
 */
async function handleStripeCheckoutCompleted(session: StripeCheckoutCompletedEvent): Promise<{ success: boolean; error?: string }> {
  try {
    const { customer_email, metadata, amount_total, payment_intent } = session

    if (!metadata?.userId || !metadata?.tier) {
      console.error('[Webhook] Missing required metadata in checkout session')
      return { success: false, error: 'Missing metadata' }
    }

    console.log('[Webhook] Checkout completed for user:', metadata.userId)

    // Trigger license generation
    const result = await paymentProcessor.handlePaymentCompletion({
      userId: metadata.userId,
      userEmail: customer_email,
      tier: metadata.tier,
      amount: amount_total / 100, // Convert cents to dollars
      paymentProvider: 'stripe',
      paymentIntentId: payment_intent
    })

    if (result.success) {
      console.log('[Webhook] License generated and stored')
      return { success: true }
    } else {
      console.error('[Webhook] License generation failed:', result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('[Webhook] Error handling checkout completion:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Handle Stripe invoice.payment_succeeded event (for subscription renewals)
 */
async function handleStripeInvoicePaymentSucceeded(invoice: any): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Webhook] Invoice payment succeeded:', invoice.id)

    // For subscription renewals, generate a new license
    if (invoice.subscription && invoice.metadata?.userId) {
      const result = await paymentProcessor.handlePaymentCompletion({
        userId: invoice.metadata.userId,
        userEmail: invoice.customer_email,
        tier: invoice.metadata.tier || 'pro',
        amount: invoice.amount_paid / 100,
        paymentProvider: 'stripe',
        paymentIntentId: invoice.payment_intent
      })

      return result.success ? { success: true } : { success: false, error: result.error }
    }

    return { success: true }
  } catch (error) {
    console.error('[Webhook] Error handling invoice payment:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Handle Stripe subscription deleted event
 */
async function handleStripeSubscriptionDeleted(subscription: any): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Webhook] Subscription deleted:', subscription.id)
    
    // Optionally revoke the license or downgrade user
    // This would require additional implementation
    
    return { success: true }
  } catch (error) {
    console.error('[Webhook] Error handling subscription deletion:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Handle Paddle webhook events
 */
export async function handlePaddleWebhook(event: any): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Webhook] Processing Paddle event:', event.event_type)

    switch (event.event_type) {
      case 'transaction.completed':
        return await handlePaddleTransactionCompleted(event)

      case 'subscription.activated':
        return await handlePaddleSubscriptionActivated(event)

      case 'subscription.canceled':
        return await handlePaddleSubscriptionCanceled(event)

      default:
        console.log('[Webhook] Unhandled Paddle event type:', event.event_type)
        return { success: true }
    }
  } catch (error) {
    console.error('[Webhook] Paddle webhook error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Handle Paddle transaction.completed event
 */
async function handlePaddleTransactionCompleted(event: PaddleTransactionCompletedEvent): Promise<{ success: boolean; error?: string }> {
  try {
    const { data } = event

    const customData = data.custom_data ? JSON.parse(JSON.stringify(data.custom_data)) : {}
    const userId = customData.userId
    const tier = customData.tier || 'pro'

    if (!userId) {
      console.error('[Webhook] Missing userId in Paddle transaction')
      return { success: false, error: 'Missing userId' }
    }

    console.log('[Webhook] Paddle transaction completed for user:', userId)

    // Calculate amount
    const amount = data.items.reduce((sum, item) => {
      return sum + parseFloat(item.price.unit_amount.amount)
    }, 0) / 100

    // Trigger license generation
    const result = await paymentProcessor.handlePaymentCompletion({
      userId,
      userEmail: data.customer.email,
      tier,
      amount,
      paymentProvider: 'paddle',
      paymentIntentId: data.id
    })

    if (result.success) {
      console.log('[Webhook] License generated for Paddle transaction')
      return { success: true }
    } else {
      console.error('[Webhook] License generation failed:', result.error)
      return { success: false, error: result.error }
    }
  } catch (error) {
    console.error('[Webhook] Error handling Paddle transaction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Handle Paddle subscription.activated event
 */
async function handlePaddleSubscriptionActivated(event: any): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Webhook] Paddle subscription activated:', event.data.id)
    return { success: true }
  } catch (error) {
    console.error('[Webhook] Error handling Paddle subscription activation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Handle Paddle subscription.canceled event
 */
async function handlePaddleSubscriptionCanceled(event: any): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[Webhook] Paddle subscription canceled:', event.data.id)
    return { success: true }
  } catch (error) {
    console.error('[Webhook] Error handling Paddle subscription cancellation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Listen for payment success from URL parameters (client-side redirect handling)
 */
export function handlePaymentSuccessRedirect(): void {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)
  const success = params.get('success')
  const tier = params.get('tier')

  if (success === 'true' && tier) {
    console.log('[Webhook] Payment success redirect detected')
    
    toast.success('Payment Successful!', {
      description: `Your ${tier.toUpperCase()} subscription is now active. Your license has been generated automatically.`,
      duration: 5000
    })

    // Clean up URL parameters
    const url = new URL(window.location.href)
    url.searchParams.delete('success')
    url.searchParams.delete('tier')
    window.history.replaceState({}, '', url.toString())
  }

  const canceled = params.get('canceled')
  if (canceled === 'true') {
    console.log('[Webhook] Payment canceled by user')
    
    toast.error('Payment Canceled', {
      description: 'Your payment was canceled. No charges were made.',
      duration: 5000
    })

    // Clean up URL parameters
    const url = new URL(window.location.href)
    url.searchParams.delete('canceled')
    window.history.replaceState({}, '', url.toString())
  }
}
