export interface CheckoutItem {
  id: string
  name: string
  description: string
  price: number
  type: 'subscription' | 'offer' | 'perk' | 'strategy'
  duration?: number
  recurring?: boolean
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'crypto' | 'paypal'
  last4?: string
  brand?: string
  wallet?: string
  email?: string
}

export interface CheckoutSession {
  id: string
  item: CheckoutItem
  subtotal: number
  tax: number
  total: number
  paymentMethod?: PaymentMethod
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: number
  completedAt?: number
}

export async function createCheckoutSession(item: CheckoutItem): Promise<CheckoutSession> {
  const subtotal = item.price
  const tax = subtotal * 0.0875
  const total = subtotal + tax

  const session: CheckoutSession = {
    id: `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    item,
    subtotal,
    tax,
    total,
    status: 'pending',
    createdAt: Date.now()
  }

  return session
}

export async function processPayment(
  session: CheckoutSession,
  paymentMethod: PaymentMethod
): Promise<{ success: boolean; error?: string }> {
  session.status = 'processing'
  session.paymentMethod = paymentMethod

  await new Promise(resolve => setTimeout(resolve, 1500))

  const success = Math.random() > 0.1

  if (success) {
    session.status = 'completed'
    session.completedAt = Date.now()
    return { success: true }
  } else {
    session.status = 'failed'
    return { success: false, error: 'Payment processing failed. Please try again.' }
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price)
}
