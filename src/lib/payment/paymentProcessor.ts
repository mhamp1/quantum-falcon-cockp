import { handlePaymentSuccess, type PaymentCompletionData } from '@/lib/licenseGeneration'

export interface PaymentProvider {
  name: 'stripe' | 'paddle'
  publicKey: string
  isLive: boolean
}

export interface CheckoutSession {
  sessionId: string
  checkoutUrl: string
  expiresAt: number
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'canceled'
  metadata: {
    userId: string
    tier: string
    type: 'subscription' | 'microtransaction'
  }
}

class PaymentProcessor {
  private stripeKey: string
  private paddleVendorId: string
  private isProd: boolean

  constructor() {
    this.stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_quantum_falcon'
    this.paddleVendorId = import.meta.env.VITE_PADDLE_VENDOR_ID || '12345'
    this.isProd = import.meta.env.VITE_ENV === 'production'
  }

  async createStripeCheckout(params: {
    tier: string
    price: number
    userId: string
    userEmail?: string
    type: 'subscription' | 'one_time'
  }): Promise<CheckoutSession> {
    try {
      const response = await fetch('/api/payment/stripe/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: params.tier,
          price: params.price,
          userId: params.userId,
          userEmail: params.userEmail,
          mode: params.type === 'subscription' ? 'subscription' : 'payment',
          successUrl: `${window.location.origin}/settings?tab=subscription&success=true`,
          cancelUrl: `${window.location.origin}/settings?tab=subscription&canceled=true`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()

      if (typeof window !== 'undefined' && (window as any).Stripe) {
        const stripe = (window as any).Stripe(this.stripeKey)
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      }

      return {
        sessionId: data.sessionId,
        checkoutUrl: data.url,
        expiresAt: Date.now() + 3600000
      }
    } catch (error: any) {
      console.error('[PaymentProcessor] Stripe checkout error:', error)
      throw new Error(error.message || 'Failed to create checkout')
    }
  }

  async createPaddleCheckout(params: {
    productId: string
    price: number
    userId: string
    userEmail?: string
    type: 'subscription' | 'one_time'
  }): Promise<CheckoutSession> {
    try {
      if (typeof window !== 'undefined' && (window as any).Paddle) {
        const Paddle = (window as any).Paddle

        if (!this.isProd) {
          Paddle.Environment.set('sandbox')
        }
        Paddle.Setup({ vendor: parseInt(this.paddleVendorId) })

        return new Promise((resolve, reject) => {
          Paddle.Checkout.open({
            product: params.productId,
            email: params.userEmail,
            passthrough: JSON.stringify({
              userId: params.userId,
              type: params.type
            }),
            successCallback: (data: any) => {
              resolve({
                sessionId: data.checkout.id,
                checkoutUrl: '',
                expiresAt: Date.now() + 3600000
              })
            },
            closeCallback: () => {
              reject(new Error('Checkout closed by user'))
            }
          })
        })
      } else {
        throw new Error('Paddle.js not loaded')
      }
    } catch (error: any) {
      console.error('[PaymentProcessor] Paddle checkout error:', error)
      throw new Error(error.message || 'Failed to create checkout')
    }
  }

  async createMicrotransaction(params: {
    amount: number
    description: string
    userId: string
    itemId: string
    provider?: 'stripe' | 'paddle'
  }): Promise<PaymentIntent> {
    const provider = params.provider || 'stripe'

    try {
      const response = await fetch('/api/payment/microtransaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: params.amount,
          description: params.description,
          userId: params.userId,
          itemId: params.itemId,
          provider
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create payment intent')
      }

      const data = await response.json()

      if (provider === 'stripe' && data.clientSecret) {
        if (typeof window !== 'undefined' && (window as any).Stripe) {
          const stripe = (window as any).Stripe(this.stripeKey)
          const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret)

          if (error) {
            throw new Error(error.message)
          }

          return {
            id: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            metadata: {
              userId: params.userId,
              tier: params.itemId,
              type: 'microtransaction'
            }
          }
        }
      }

      return data
    } catch (error: any) {
      console.error('[PaymentProcessor] Microtransaction error:', error)
      throw new Error(error.message || 'Payment failed')
    }
  }

  async verifyPayment(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const response = await fetch(`/api/payment/verify/${paymentIntentId}`)

      if (!response.ok) {
        throw new Error('Failed to verify payment')
      }

      return await response.json()
    } catch (error: any) {
      console.error('[PaymentProcessor] Verification error:', error)
      throw new Error(error.message || 'Verification failed')
    }
  }

  async getPaymentHistory(userId: string): Promise<PaymentIntent[]> {
    try {
      const response = await fetch(`/api/payment/history/${userId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch payment history')
      }

      return await response.json()
    } catch (error: any) {
      console.error('[PaymentProcessor] History fetch error:', error)
      return []
    }
  }

  loadStripeScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Window not available'))
        return
      }

      if ((window as any).Stripe) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://js.stripe.com/v3/'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Stripe.js'))
      document.head.appendChild(script)
    })
  }

  loadPaddleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Window not available'))
        return
      }

      if ((window as any).Paddle) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.src = 'https://cdn.paddle.com/paddle/paddle.js'
      script.async = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Paddle.js'))
      document.head.appendChild(script)
    })
  }

  /**
   * Handle successful payment and trigger automatic license generation
   */
  async handlePaymentCompletion(params: {
    userId: string
    userEmail: string
    tier: string
    amount: number
    paymentProvider: 'stripe' | 'paddle'
    paymentIntentId: string
  }): Promise<{ success: boolean; license?: string; error?: string }> {
    try {
      console.log('[PaymentProcessor] Payment completed, generating license...')

      // Prepare payment data for license generation
      const paymentData: PaymentCompletionData = {
        userId: params.userId,
        userEmail: params.userEmail,
        tier: params.tier,
        amount: params.amount,
        paymentProvider: params.paymentProvider,
        paymentIntentId: params.paymentIntentId,
        timestamp: Date.now()
      }

      // Trigger license generation
      const result = await handlePaymentSuccess(paymentData)

      if (result.success && result.license) {
        console.log('[PaymentProcessor] License generated successfully')
        return {
          success: true,
          license: result.license
        }
      } else {
        console.error('[PaymentProcessor] License generation failed:', result.error)
        return {
          success: false,
          error: result.error || 'Failed to generate license'
        }
      }
    } catch (error: any) {
      console.error('[PaymentProcessor] Error handling payment completion:', error)
      return {
        success: false,
        error: error.message || 'Payment completion handler failed'
      }
    }
  }
}

export const paymentProcessor = new PaymentProcessor()

export async function initializePaymentProviders() {
  try {
    await Promise.all([
      paymentProcessor.loadStripeScript().catch(err => console.warn('Stripe load failed:', err)),
      paymentProcessor.loadPaddleScript().catch(err => console.warn('Paddle load failed:', err))
    ])
    console.log('[PaymentProcessor] Payment providers initialized')
  } catch (error) {
    console.error('[PaymentProcessor] Failed to initialize payment providers:', error)
  }
}
