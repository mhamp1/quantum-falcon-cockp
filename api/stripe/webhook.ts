// ═══════════════════════════════════════════════════════════════
// STRIPE WEBHOOK HANDLER
// Process payment events and activate licenses
// November 27, 2025 — Production Ready
// ═══════════════════════════════════════════════════════════════

// NOTE: This is a Vercel/Edge function template
// Deploy to /api/stripe/webhook

import type { VercelRequest, VercelResponse } from '@vercel/node'

// Stripe webhook secret from environment
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

// ═══════════════════════════════════════════════════════════════
// LICENSE KEY GENERATION
// ═══════════════════════════════════════════════════════════════

function generateLicenseKey(tier: string): string {
  const prefix = 'QF'
  const tierCode = tier.toUpperCase().slice(0, 3)
  const random = Array.from({ length: 16 }, () => 
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
  ).join('')
  
  return `${prefix}-${tierCode}-${random.slice(0, 4)}-${random.slice(4, 8)}-${random.slice(8, 12)}-${random.slice(12, 16)}`
}

// ═══════════════════════════════════════════════════════════════
// TIER MAPPING
// ═══════════════════════════════════════════════════════════════

const PRICE_TO_TIER: Record<string, string> = {
  [process.env.VITE_STRIPE_STARTER_PRICE_ID || '']: 'starter',
  [process.env.VITE_STRIPE_TRADER_PRICE_ID || '']: 'trader',
  [process.env.VITE_STRIPE_PRO_PRICE_ID || '']: 'pro',
  [process.env.VITE_STRIPE_ELITE_PRICE_ID || '']: 'elite',
  [process.env.VITE_STRIPE_LIFETIME_PRICE_ID || '']: 'lifetime',
}

// ═══════════════════════════════════════════════════════════════
// WEBHOOK HANDLER
// ═══════════════════════════════════════════════════════════════

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Get raw body for signature verification
  const rawBody = await getRawBody(req)
  const signature = req.headers['stripe-signature'] as string

  if (!signature || !STRIPE_WEBHOOK_SECRET) {
    return res.status(400).json({ error: 'Missing signature or webhook secret' })
  }

  // Verify webhook signature
  let event
  try {
    const stripe = require('stripe')(STRIPE_SECRET_KEY)
    event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error('[Webhook] Signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  // Handle event types
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        await handleCheckoutComplete(session)
        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object
        await handleInvoicePaid(invoice)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        await handleSubscriptionCancelled(subscription)
        break
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`)
    }

    return res.status(200).json({ received: true })
  } catch (error: any) {
    console.error('[Webhook] Processing error:', error)
    return res.status(500).json({ error: error.message })
  }
}

// ═══════════════════════════════════════════════════════════════
// EVENT HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleCheckoutComplete(session: any) {
  console.log('[Webhook] Checkout completed:', session.id)

  const customerId = session.customer
  const userId = session.client_reference_id || session.metadata?.userId
  const email = session.customer_email || session.customer_details?.email
  const priceId = session.line_items?.data?.[0]?.price?.id

  // Determine tier from price
  const tier = PRICE_TO_TIER[priceId] || 'starter'

  // Generate license key
  const licenseKey = generateLicenseKey(tier)

  // Store license (implement your database storage here)
  await storeLicense({
    userId,
    email,
    customerId,
    tier,
    licenseKey,
    sessionId: session.id,
    createdAt: new Date().toISOString(),
  })

  // Send welcome email with license key
  await sendWelcomeEmail({
    email,
    tier,
    licenseKey,
  })

  console.log(`[Webhook] License activated: ${tier} for ${email}`)
}

async function handleInvoicePaid(invoice: any) {
  console.log('[Webhook] Invoice paid:', invoice.id)

  const customerId = invoice.customer
  const subscriptionId = invoice.subscription

  // Renew/extend license
  await renewLicense({
    customerId,
    subscriptionId,
    paidAt: new Date().toISOString(),
  })
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log('[Webhook] Subscription updated:', subscription.id)

  const customerId = subscription.customer
  const priceId = subscription.items?.data?.[0]?.price?.id
  const tier = PRICE_TO_TIER[priceId] || 'starter'
  const status = subscription.status

  // Update user tier
  await updateUserTier({
    customerId,
    tier,
    status,
    currentPeriodEnd: subscription.current_period_end,
  })
}

async function handleSubscriptionCancelled(subscription: any) {
  console.log('[Webhook] Subscription cancelled:', subscription.id)

  const customerId = subscription.customer

  // Downgrade to free tier (at end of period)
  await downgradeUser({
    customerId,
    effectiveAt: new Date(subscription.current_period_end * 1000).toISOString(),
  })
}

// ═══════════════════════════════════════════════════════════════
// DATABASE OPERATIONS (Implement with your DB)
// ═══════════════════════════════════════════════════════════════

async function storeLicense(data: {
  userId: string
  email: string
  customerId: string
  tier: string
  licenseKey: string
  sessionId: string
  createdAt: string
}) {
  // TODO: Implement with your database
  // Example: await db.licenses.create(data)
  console.log('[DB] Storing license:', data)
}

async function renewLicense(data: {
  customerId: string
  subscriptionId: string
  paidAt: string
}) {
  // TODO: Implement renewal logic
  console.log('[DB] Renewing license:', data)
}

async function updateUserTier(data: {
  customerId: string
  tier: string
  status: string
  currentPeriodEnd: number
}) {
  // TODO: Implement tier update
  console.log('[DB] Updating tier:', data)
}

async function downgradeUser(data: {
  customerId: string
  effectiveAt: string
}) {
  // TODO: Implement downgrade
  console.log('[DB] Scheduling downgrade:', data)
}

// ═══════════════════════════════════════════════════════════════
// EMAIL (Implement with your email provider)
// ═══════════════════════════════════════════════════════════════

async function sendWelcomeEmail(data: {
  email: string
  tier: string
  licenseKey: string
}) {
  // TODO: Implement with SendGrid, Resend, etc.
  console.log('[Email] Sending welcome email:', data)
  
  // Example email content:
  // Subject: Welcome to Quantum Falcon {Tier}!
  // Body: Your license key: {licenseKey}
}

// ═══════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

