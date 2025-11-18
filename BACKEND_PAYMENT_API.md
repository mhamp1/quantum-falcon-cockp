# Backend Payment & WebSocket API Implementation Guide

This document provides the backend implementation requirements for the real-time WebSocket session tracking and payment processing features.

## Table of Contents

1. [WebSocket Session Tracking](#websocket-session-tracking)
2. [Payment Processing (Stripe)](#payment-processing-stripe)
3. [Payment Processing (Paddle)](#payment-processing-paddle)
4. [Environment Variables](#environment-variables)
5. [Database Schema](#database-schema)

---

## WebSocket Session Tracking

### Requirements

- Real-time session updates every 5-30 seconds
- Track user activity (last active timestamp)
- Notify on new session creation
- Handle session revocation
- Support multiple concurrent sessions per user

### Implementation (Node.js + Socket.IO)

```javascript
// server.js
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})

// In-memory store (replace with Redis in production)
const activeSessions = new Map()

io.on('connection', (socket) => {
  console.log(`[WebSocket] Client connected: ${socket.id}`)

  // Join user-specific room
  socket.on('join_session_room', ({ userId }) => {
    socket.join(`user:${userId}`)
    socket.userId = userId

    // Create or update session
    const sessionData = {
      sessionId: socket.id,
      userId,
      deviceType: detectDeviceType(socket.handshake.headers['user-agent']),
      deviceName: parseDeviceName(socket.handshake.headers['user-agent']),
      browser: parseBrowser(socket.handshake.headers['user-agent']),
      os: parseOS(socket.handshake.headers['user-agent']),
      ip: socket.handshake.address || 'Unknown',
      location: 'Unknown', // Integrate with ip-api.com or similar
      lastActive: Date.now(),
      isCurrent: true
    }

    activeSessions.set(socket.id, sessionData)

    // Broadcast new session to user's other devices
    socket.to(`user:${userId}`).emit('session_created', sessionData)

    // Send all sessions to connecting client
    const userSessions = getUserSessions(userId)
    socket.emit('session_update', userSessions)
  })

  // Update activity timestamp
  socket.on('update_activity', ({ userId, timestamp }) => {
    const session = activeSessions.get(socket.id)
    if (session) {
      session.lastActive = timestamp
      activeSessions.set(socket.id, session)

      // Broadcast update to all user's devices
      io.to(`user:${userId}`).emit('session_update', {
        sessionId: socket.id,
        lastActive: timestamp
      })
    }
  })

  // Revoke specific session
  socket.on('revoke_session', ({ sessionId }, callback) => {
    const session = activeSessions.get(sessionId)
    
    if (!session) {
      return callback({ success: false, error: 'Session not found' })
    }

    // Remove session
    activeSessions.delete(sessionId)

    // Force disconnect the session
    const socketToRevoke = io.sockets.sockets.get(sessionId)
    if (socketToRevoke) {
      socketToRevoke.disconnect(true)
    }

    // Notify all user's devices
    io.to(`user:${session.userId}`).emit('session_revoked', { sessionId })

    callback({ success: true })
  })

  // Revoke all other sessions
  socket.on('revoke_all_sessions', ({ userId }, callback) => {
    let revokedCount = 0

    for (const [sessionId, session] of activeSessions.entries()) {
      if (session.userId === userId && sessionId !== socket.id) {
        activeSessions.delete(sessionId)
        
        const socketToRevoke = io.sockets.sockets.get(sessionId)
        if (socketToRevoke) {
          socketToRevoke.disconnect(true)
        }

        io.to(`user:${userId}`).emit('session_revoked', { sessionId })
        revokedCount++
      }
    }

    callback({ success: true, revokedCount })
  })

  socket.on('disconnect', () => {
    const session = activeSessions.get(socket.id)
    if (session) {
      activeSessions.delete(socket.id)
      io.to(`user:${session.userId}`).emit('session_revoked', { sessionId: socket.id })
    }
    console.log(`[WebSocket] Client disconnected: ${socket.id}`)
  })
})

// Periodic cleanup of stale sessions (inactive > 7 days)
setInterval(() => {
  const now = Date.now()
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

  for (const [sessionId, session] of activeSessions.entries()) {
    if (now - session.lastActive > SEVEN_DAYS) {
      activeSessions.delete(sessionId)
      io.to(`user:${session.userId}`).emit('session_expired', { sessionId })
    }
  }
}, 60000) // Check every minute

function getUserSessions(userId) {
  return Array.from(activeSessions.values()).filter(s => s.userId === userId)
}

function detectDeviceType(userAgent) {
  if (/mobile/i.test(userAgent)) return 'mobile'
  if (/tablet|ipad/i.test(userAgent)) return 'tablet'
  if (/mac|windows|linux/i.test(userAgent)) return 'desktop'
  return 'desktop'
}

function parseBrowser(userAgent) {
  if (/chrome/i.test(userAgent)) return 'Chrome'
  if (/firefox/i.test(userAgent)) return 'Firefox'
  if (/safari/i.test(userAgent)) return 'Safari'
  if (/edge/i.test(userAgent)) return 'Edge'
  return 'Unknown'
}

function parseOS(userAgent) {
  if (/windows/i.test(userAgent)) return 'Windows'
  if (/mac/i.test(userAgent)) return 'MacOS'
  if (/linux/i.test(userAgent)) return 'Linux'
  if (/android/i.test(userAgent)) return 'Android'
  if (/ios|iphone|ipad/i.test(userAgent)) return 'iOS'
  return 'Unknown'
}

function parseDeviceName(userAgent) {
  const browser = parseBrowser(userAgent)
  const os = parseOS(userAgent)
  return `${browser} on ${os}`
}

server.listen(3001, () => {
  console.log('[WebSocket] Server running on port 3001')
})
```

---

## Payment Processing (Stripe)

### Installation

```bash
npm install stripe
```

### Implementation

```javascript
// routes/payment.js
const express = require('express')
const router = express.Router()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// Pricing configuration (cents)
const PRICING = {
  starter: 1900, // $19.00
  trader: 4900,  // $49.00
  pro: 9700,     // $97.00
  elite: 19700,  // $197.00
  lifetime: 800000 // $8000.00
}

// Create Stripe checkout session
router.post('/stripe/create-checkout', async (req, res) => {
  try {
    const { tier, price, userId, userEmail, mode, successUrl, cancelUrl } = req.body

    if (!tier || !userId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const priceInCents = PRICING[tier]

    if (!priceInCents) {
      return res.status(400).json({ error: 'Invalid tier' })
    }

    const sessionConfig = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Quantum Falcon ${tier.toUpperCase()} Tier`,
              description: `Access to ${tier.toUpperCase()} tier features`,
              images: ['https://quantumfalcon.ai/logo.png']
            },
            unit_amount: priceInCents,
            ...(mode === 'subscription' && {
              recurring: {
                interval: 'month',
                interval_count: 1
              }
            })
          },
          quantity: 1
        }
      ],
      mode: mode === 'subscription' ? 'subscription' : 'payment',
      success_url: successUrl + `&tier=${tier}`,
      cancel_url: cancelUrl,
      client_reference_id: userId,
      customer_email: userEmail,
      metadata: {
        userId,
        tier,
        type: mode
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    res.json({
      sessionId: session.id,
      url: session.url
    })
  } catch (error) {
    console.error('[Stripe] Checkout error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Webhook handler for Stripe events
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    console.error('[Stripe] Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object
      await handleSuccessfulPayment(session)
      break

    case 'invoice.payment_succeeded':
      const invoice = event.data.object
      await handleSubscriptionRenewal(invoice)
      break

    case 'customer.subscription.deleted':
      const subscription = event.data.object
      await handleSubscriptionCanceled(subscription)
      break

    default:
      console.log(`[Stripe] Unhandled event type: ${event.type}`)
  }

  res.json({ received: true })
})

async function handleSuccessfulPayment(session) {
  const { userId, tier } = session.metadata

  // Update user's subscription in database
  // Example: await db.users.update({ id: userId }, { tier, subscriptionActive: true, subscriptionStart: Date.now() })

  console.log(`[Payment] User ${userId} upgraded to ${tier}`)
}

async function handleSubscriptionRenewal(invoice) {
  // Extend subscription period
  console.log(`[Payment] Subscription renewed for ${invoice.customer}`)
}

async function handleSubscriptionCanceled(subscription) {
  // Downgrade user to free tier
  console.log(`[Payment] Subscription canceled for ${subscription.customer}`)
}

// Create microtransaction payment intent
router.post('/microtransaction', async (req, res) => {
  try {
    const { amount, description, userId, itemId } = req.body

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      description,
      metadata: {
        userId,
        itemId,
        type: 'microtransaction'
      }
    })

    res.json({
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    })
  } catch (error) {
    console.error('[Stripe] Microtransaction error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Verify payment status
router.get('/verify/:paymentIntentId', async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(req.params.paymentIntentId)

    res.json({
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      metadata: paymentIntent.metadata
    })
  } catch (error) {
    console.error('[Stripe] Verification error:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
```

---

## Payment Processing (Paddle)

### Installation

```bash
npm install @paddle/paddle-node-sdk
```

### Implementation

```javascript
// routes/paddle.js
const express = require('express')
const router = express.Router()
const { Paddle } = require('@paddle/paddle-node-sdk')

const paddle = new Paddle(process.env.PADDLE_API_KEY)

// Product IDs (configure in Paddle dashboard)
const PADDLE_PRODUCTS = {
  starter: 'pri_01starter123',
  trader: 'pri_01trader456',
  pro: 'pri_01pro789',
  elite: 'pri_01elite012',
  lifetime: 'pri_01lifetime345'
}

// Webhook handler
router.post('/paddle/webhook', express.json(), async (req, res) => {
  try {
    const event = req.body

    switch (event.event_type) {
      case 'transaction.completed':
        await handlePaddlePayment(event.data)
        break

      case 'subscription.activated':
        await handlePaddleSubscription(event.data)
        break

      case 'subscription.canceled':
        await handlePaddleCancellation(event.data)
        break

      default:
        console.log(`[Paddle] Unhandled event: ${event.event_type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('[Paddle] Webhook error:', error)
    res.status(500).json({ error: error.message })
  }
})

async function handlePaddlePayment(data) {
  const userId = JSON.parse(data.custom_data || '{}').userId
  const tier = data.items[0].product_id

  console.log(`[Paddle] Payment completed for user ${userId}, tier: ${tier}`)
  // Update database
}

async function handlePaddleSubscription(data) {
  console.log(`[Paddle] Subscription activated:`, data.id)
}

async function handlePaddleCancellation(data) {
  console.log(`[Paddle] Subscription canceled:`, data.id)
}

module.exports = router
```

---

## Environment Variables

Create a `.env` file:

```env
# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Paddle
PADDLE_VENDOR_ID=12345
PADDLE_API_KEY=...
PADDLE_PUBLIC_KEY=...

# WebSocket
WS_PORT=3001

# App
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## Database Schema

### Sessions Table

```sql
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  device_type VARCHAR(50),
  device_name VARCHAR(255),
  browser VARCHAR(100),
  os VARCHAR(100),
  ip VARCHAR(45),
  location VARCHAR(255),
  last_active BIGINT,
  login_time BIGINT,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_last_active (last_active)
);
```

### Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  tier VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  payment_provider VARCHAR(50),
  subscription_id VARCHAR(255),
  price_paid DECIMAL(10, 2),
  started_at BIGINT,
  expires_at BIGINT,
  canceled_at BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_expires_at (expires_at)
);
```

### Payments Table

```sql
CREATE TABLE payments (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  payment_intent_id VARCHAR(255),
  amount DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'usd',
  status VARCHAR(50),
  payment_provider VARCHAR(50),
  item_id VARCHAR(255),
  description TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_payment_intent (payment_intent_id),
  INDEX idx_status (status)
);
```

---

## Testing

### Test Stripe Checkout (Development)

Use Stripe test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

### Test WebSocket Connection

```javascript
// Test client
const socket = io('http://localhost:3001')

socket.on('connect', () => {
  console.log('Connected')
  socket.emit('join_session_room', { userId: 'test-user-123' })
})

socket.on('session_update', (data) => {
  console.log('Session update:', data)
})
```

---

## Production Deployment Checklist

- [ ] Switch Stripe to live keys
- [ ] Configure Stripe webhook endpoints
- [ ] Switch Paddle to production mode
- [ ] Set up Redis for session storage
- [ ] Configure HTTPS/WSS
- [ ] Set up database replication
- [ ] Configure rate limiting
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Test payment flows end-to-end
- [ ] Set up automated backups
- [ ] Configure log aggregation

---

## Support & Resources

- **Stripe Docs**: https://stripe.com/docs
- **Paddle Docs**: https://developer.paddle.com
- **Socket.IO Docs**: https://socket.io/docs/v4
- **Quantum Falcon Support**: support@quantumfalcon.ai
