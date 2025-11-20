# @quantumfalcon/license-hub

**Centralized License Authority for Quantum Falcon Ecosystem**

Single source of truth for license validation, tier definitions, payment webhooks, and activation deep links.

## 🎯 Purpose

This package eliminates license logic drift across Desktop and Cockpit repos by centralizing:
- ✅ License validation logic
- ✅ Tier definitions (free/pro/elite/lifetime)
- ✅ Payment webhook handlers (Stripe & Paddle)
- ✅ License key format & encryption
- ✅ Deep link activation schema

## 📦 Installation

```bash
npm install @quantumfalcon/license-hub
```

For private GitHub Packages, add to `.npmrc`:
```
@quantumfalcon:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

## 🚀 Quick Start

### Client-Side Usage (Desktop/Cockpit)

```typescript
import { LicenseHub, getTierFeatures, TIER_DEFINITIONS } from '@quantumfalcon/license-hub'

// Initialize
const licenseHub = new LicenseHub('https://api.quantumfalcon.com/license')

// Validate license
const result = await licenseHub.validateLicense(userLicenseKey)
if (result.valid) {
  console.log('License valid!', result.tier)
}

// Get tier features
const features = getTierFeatures('pro')
console.log(features) // ['All Free Features', 'AI Trading Agents (3)', ...]

// Check limits
const limits = getTierLimits('elite')
console.log(limits.aiAgents) // -1 (unlimited)

// Generate activation link
const deepLink = licenseHub.generateActivationDeepLink(licenseKey, userId)
```

### Server-Side Usage (LicenseAuthority)

```typescript
import {
  generateLicense,
  handlePaymentWebhook,
  processWebhook
} from '@quantumfalcon/license-hub'

// Generate license
const result = generateLicense({
  userId: 'user_123',
  userEmail: 'user@example.com',
  tier: 'pro',
  timestamp: Date.now()
}, MASTER_KEY)

console.log(result.license) // QF-PRO-xxxxxxxxxxxx-1234567890

// Handle Stripe webhook
app.post('/webhooks/stripe', async (req, res) => {
  const signature = req.headers['stripe-signature']
  const result = await processWebhook(
    'stripe',
    req.body,
    signature,
    STRIPE_WEBHOOK_SECRET,
    MASTER_KEY
  )
  
  if (result?.success) {
    // License generated automatically!
    console.log('License:', result.license)
    // Store in database, send email, etc.
  }
  
  res.json({ received: true })
})
```

## 📚 API Reference

### Core Functions

#### `validateLicense(key, endpoint, fingerprint?)`
Validate a license key against the server API.

```typescript
const result = await validateLicense(
  'QF-PRO-abc123def456-1700000000',
  'https://api.quantumfalcon.com/license/verify'
)
// { valid: true, tier: 'pro', expiresAt: 1735689600000, ... }
```

#### `getTierFeatures(tier)`
Get feature list for a tier (SINGLE SOURCE OF TRUTH).

```typescript
const features = getTierFeatures('elite')
// ['All Pro Features', 'AI Trading Agents (Unlimited)', ...]
```

#### `generateLicense(request, masterKey)` (Server-side)
Generate a new license key.

```typescript
const result = generateLicense({
  userId: 'user_123',
  userEmail: 'user@example.com',
  tier: 'pro',
  duration: 30,
  timestamp: Date.now()
}, process.env.MASTER_KEY)
```

#### `handlePaymentWebhook(event, masterKey, callback?)`
Process payment event and auto-generate license.

```typescript
const result = await handlePaymentWebhook(webhookEvent, MASTER_KEY, async (license) => {
  // Store license in database
  await db.licenses.create(license)
  // Send email
  await sendEmail(license.userId, license.license)
})
```

### Tier Definitions

```typescript
import { TIER_DEFINITIONS } from '@quantumfalcon/license-hub'

console.log(TIER_DEFINITIONS.pro)
// {
//   tier: 'pro',
//   displayName: 'Pro',
//   price: 90,
//   duration: 30,
//   features: [...],
//   limits: { aiAgents: 3, strategies: 10, ... }
// }
```

### Deep Links

```typescript
import {
  generateActivationDeepLink,
  generateRenewalDeepLink,
  parseDeepLink
} from '@quantumfalcon/license-hub'

// Generate activation link
const link = generateActivationDeepLink('QF-PRO-...', 'user_123')
// quantumfalcon://license/activate?key=QF-PRO-...&userId=user_123

// Parse deep link
const params = parseDeepLink(link)
// { action: 'activate', licenseKey: 'QF-PRO-...', userId: 'user_123' }
```

## 🔄 Automated Sync

When you update the LicenseAuthority repo:

1. Push to `main` branch
2. GitHub Action automatically:
   - Builds package
   - Publishes to GitHub Packages
   - Tags release (e.g., `v2025.1.27`)
3. Desktop/Cockpit repos:
   - Run `npm install` to get latest version
   - All license logic automatically updated!

## 🎨 Tier Configuration

All tier definitions are in one place:

```typescript
{
  free: { price: 0, duration: 30, features: [...], limits: {...} },
  pro: { price: 90, duration: 30, features: [...], limits: {...} },
  elite: { price: 145, duration: 30, features: [...], limits: {...} },
  lifetime: { price: 8000, duration: -1, features: [...], limits: {...} }
}
```

**Change once, update everywhere!**

## 🔐 Security

- License keys use HMAC-SHA256 signatures
- Master key never exposed to client
- Server-side validation required for production
- Webhook signature verification included

## 📖 Migration Guide

### For Desktop/Cockpit Repos

1. Install package:
```bash
npm install @quantumfalcon/license-hub
```

2. Replace local license imports:
```typescript
// Before
import { validateLicense } from '@/lib/license-auth'

// After
import { validateLicense } from '@quantumfalcon/license-hub'
```

3. Update tier features:
```typescript
// Before
const features = ['Feature 1', 'Feature 2']

// After
import { getTierFeatures } from '@quantumfalcon/license-hub'
const features = getTierFeatures('pro')
```

4. Remove old files:
- Delete `src/lib/license-auth.ts`
- Delete `src/lib/licenseGeneration.ts`
- Keep only integration code

## 🧪 Testing

```bash
npm test
```

## 📝 Changelog

### v2025.1.0 (November 20, 2025)
- Initial release
- Complete license validation system
- Tier definitions for all 4 tiers
- Stripe & Paddle webhook handlers
- Deep link activation schema
- Automatic license generation

## 📄 License

PROPRIETARY - Quantum Falcon Team

---

**SYNC COMPLETE: All repos now pull from LicenseAuthority Hub — never out of sync again — November 20, 2025**
