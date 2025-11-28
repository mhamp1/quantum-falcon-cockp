// ═══════════════════════════════════════════════════════════════
// WEBHOOKS API ROUTES
// Stripe payments, Helius transactions
// November 28, 2025 — Quantum Falcon Backend
// ═══════════════════════════════════════════════════════════════

import { Router, Request, Response } from 'express'
import express from 'express'
import Stripe from 'stripe'
import { logger } from '../services/Logger.js'
import { db } from '../db/index.js'

const router = Router()

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

// ═══════════════════════════════════════════════════════════════
// STRIPE WEBHOOK
// ═══════════════════════════════════════════════════════════════

router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string

    let event: Stripe.Event

    try {
      if (!endpointSecret) {
        throw new Error('Stripe webhook secret not configured')
      }
      
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
    } catch (err: any) {
      logger.error('[Webhook] Stripe signature verification failed:', err.message)
      return res.status(400).send(`Webhook Error: ${err.message}`)
    }

    // Handle the event
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session
          await handleCheckoutCompleted(session)
          break
        }

        case 'invoice.paid': {
          const invoice = event.data.object as Stripe.Invoice
          await handleInvoicePaid(invoice)
          break
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice
          await handlePaymentFailed(invoice)
          break
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription
          await handleSubscriptionCanceled(subscription)
          break
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription
          await handleSubscriptionUpdated(subscription)
          break
        }

        default:
          logger.debug(`[Webhook] Unhandled event type: ${event.type}`)
      }

      res.json({ received: true })
    } catch (error: any) {
      logger.error(`[Webhook] Error handling ${event.type}:`, error)
      res.status(500).json({ error: error.message })
    }
  }
)

// ═══════════════════════════════════════════════════════════════
// WEBHOOK HANDLERS
// ═══════════════════════════════════════════════════════════════

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const tier = session.metadata?.tier

  if (!userId || !tier) {
    logger.error('[Webhook] Missing userId or tier in checkout metadata')
    return
  }

  logger.info(`[Webhook] Checkout completed for user ${userId}, tier: ${tier}`)

  // Update user tier in database
  await db.user.update({
    where: { id: userId },
    data: {
      tier,
      stripeCustomerId: session.customer as string,
      subscriptionStatus: 'active',
      updatedAt: new Date(),
    },
  })

  // Generate license key
  const licenseKey = generateLicenseKey(tier)
  
  await db.license.create({
    data: {
      userId,
      key: licenseKey,
      tier,
      status: 'active',
      activatedAt: new Date(),
    },
  })

  // Record payment
  await db.payment.create({
    data: {
      userId,
      stripePaymentId: session.payment_intent as string,
      amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      status: 'completed',
      tier,
      type: session.mode === 'subscription' ? 'subscription' : 'one_time',
    },
  })

  logger.info(`[Webhook] License ${licenseKey} created for user ${userId}`)
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  // Find user by Stripe customer ID
  const user = await db.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    logger.error(`[Webhook] User not found for customer ${customerId}`)
    return
  }

  logger.info(`[Webhook] Invoice paid for user ${user.id}`)

  // Update subscription status
  await db.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'active',
      lastPaymentAt: new Date(),
    },
  })

  // Renew license
  await db.license.updateMany({
    where: { userId: user.id, status: 'active' },
    data: {
      renewedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
    },
  })
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  const user = await db.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    logger.error(`[Webhook] User not found for customer ${customerId}`)
    return
  }

  logger.warn(`[Webhook] Payment failed for user ${user.id}`)

  // Update subscription status
  await db.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'past_due',
    },
  })

  // Suspend license after grace period (immediate for now)
  await db.license.updateMany({
    where: { userId: user.id, status: 'active' },
    data: { status: 'suspended' },
  })
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  const user = await db.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    logger.error(`[Webhook] User not found for customer ${customerId}`)
    return
  }

  logger.info(`[Webhook] Subscription canceled for user ${user.id}`)

  // Downgrade to free tier
  await db.user.update({
    where: { id: user.id },
    data: {
      tier: 'free',
      subscriptionStatus: 'canceled',
    },
  })

  // Revoke license
  await db.license.updateMany({
    where: { userId: user.id, status: 'active' },
    data: { status: 'revoked' },
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const newTier = subscription.metadata?.tier
  
  const user = await db.user.findFirst({
    where: { stripeCustomerId: customerId },
  })

  if (!user) {
    logger.error(`[Webhook] User not found for customer ${customerId}`)
    return
  }

  if (newTier && newTier !== user.tier) {
    logger.info(`[Webhook] Tier changed for user ${user.id}: ${user.tier} -> ${newTier}`)
    
    await db.user.update({
      where: { id: user.id },
      data: { tier: newTier },
    })
  }
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function generateLicenseKey(tier: string): string {
  const prefix = tier.toUpperCase().slice(0, 3)
  const random = Array.from({ length: 4 }, () =>
    Math.random().toString(36).substring(2, 6).toUpperCase()
  ).join('-')
  return `QF-${prefix}-${random}`
}

export default router

