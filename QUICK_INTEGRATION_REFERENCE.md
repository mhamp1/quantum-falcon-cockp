# Quick Integration Reference

**Copy-paste ready code snippets for integrating @quantumfalcon/license-hub**

## 🚀 Installation

```bash
npm install @quantumfalcon/license-hub
```

## 📦 Essential Imports

```typescript
import {
  // Types
  type LicenseTier,
  type LicenseVerificationResult,
  type LicenseData,
  
  // Validation
  validateLicense,
  isLicenseExpired,
  getTimeUntilExpiration,
  
  // Features
  getTierFeatures,
  getTierDefinition,
  TIER_DEFINITIONS,
  getTierLimits,
  
  // Deep Links
  generateActivationDeepLink,
  parseDeepLink,
  
  // Constants
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from '@quantumfalcon/license-hub'
```

---

## 🔐 Client-Side: License Validation

### Basic Validation

```typescript
import { validateLicense } from '@quantumfalcon/license-hub'

async function checkLicense(licenseKey: string) {
  const result = await validateLicense(
    licenseKey,
    'https://api.quantumfalcon.com/license/verify'
  )
  
  if (result.valid) {
    console.log('✅ License valid!')
    console.log('Tier:', result.tier)
    console.log('Expires:', new Date(result.expiresAt))
  } else {
    console.error('❌ Invalid:', result.error)
  }
  
  return result
}
```

### App Launch License Check

```typescript
import { validateLicense, isLicenseExpired } from '@quantumfalcon/license-hub'

async function initializeApp() {
  // Load stored license
  const storedLicense = localStorage.getItem('qf_license')
  
  if (!storedLicense) {
    return showLicensePrompt()
  }
  
  const license = JSON.parse(atob(storedLicense))
  
  // Check expiration first (offline)
  if (isLicenseExpired(license.expiresAt)) {
    return showRenewalPrompt()
  }
  
  // Validate online
  const result = await validateLicense(
    license.key,
    process.env.VITE_LICENSE_API_ENDPOINT
  )
  
  if (!result.valid) {
    return showLicensePrompt()
  }
  
  // License valid - start app
  startApp(result.tier, result.features)
}
```

### React Hook for License Status

```typescript
import { useState, useEffect } from 'react'
import { validateLicense, getTimeUntilExpiration, type LicenseVerificationResult } from '@quantumfalcon/license-hub'

export function useLicense() {
  const [license, setLicense] = useState<LicenseVerificationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState('')
  
  useEffect(() => {
    async function checkLicense() {
      const stored = localStorage.getItem('qf_license')
      if (!stored) {
        setLoading(false)
        return
      }
      
      const licenseData = JSON.parse(atob(stored))
      const result = await validateLicense(
        licenseData.key,
        import.meta.env.VITE_LICENSE_API_ENDPOINT
      )
      
      setLicense(result)
      setLoading(false)
      
      if (result.valid && result.expiresAt) {
        setTimeRemaining(getTimeUntilExpiration(result.expiresAt))
      }
    }
    
    checkLicense()
    
    // Update time remaining every minute
    const interval = setInterval(() => {
      if (license?.expiresAt) {
        setTimeRemaining(getTimeUntilExpiration(license.expiresAt))
      }
    }, 60000)
    
    return () => clearInterval(interval)
  }, [])
  
  return { license, loading, timeRemaining }
}

// Usage in component:
function LicenseStatus() {
  const { license, loading, timeRemaining } = useLicense()
  
  if (loading) return <div>Loading...</div>
  
  if (!license?.valid) {
    return <div>No valid license</div>
  }
  
  return (
    <div>
      <span>Tier: {license.tier}</span>
      <span>Expires in: {timeRemaining}</span>
    </div>
  )
}
```

---

## 🎨 Feature Display

### Get All Tier Features

```typescript
import { TIER_DEFINITIONS } from '@quantumfalcon/license-hub'

function SubscriptionPlans() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Object.values(TIER_DEFINITIONS).map(tier => (
        <div key={tier.tier} className="card">
          <h3>{tier.displayName}</h3>
          <p className="price">${tier.price}/mo</p>
          <ul>
            {tier.features.map(feature => (
              <li key={feature}>✓ {feature}</li>
            ))}
          </ul>
          <button>Get {tier.displayName}</button>
        </div>
      ))}
    </div>
  )
}
```

### Feature Gate Component

```typescript
import { getTierFeatures, type LicenseTier } from '@quantumfalcon/license-hub'

interface FeatureGateProps {
  requiredTier: LicenseTier
  currentTier: LicenseTier
  feature: string
  children: React.ReactNode
}

function FeatureGate({ requiredTier, currentTier, feature, children }: FeatureGateProps) {
  const tierHierarchy = ['free', 'pro', 'elite', 'lifetime']
  const hasAccess = tierHierarchy.indexOf(currentTier) >= tierHierarchy.indexOf(requiredTier)
  
  if (!hasAccess) {
    return (
      <div className="feature-locked">
        <p>🔒 {feature} requires {requiredTier.toUpperCase()} tier</p>
        <button>Upgrade Now</button>
      </div>
    )
  }
  
  return <>{children}</>
}

// Usage:
<FeatureGate requiredTier="pro" currentTier={userTier} feature="AI Trading Agents">
  <AIAgentsPanel />
</FeatureGate>
```

### Settings Page - License Tab

```typescript
import { getTierDefinition, getTimeUntilExpiration } from '@quantumfalcon/license-hub'

function LicenseSettingsTab({ license }) {
  const tierDef = getTierDefinition(license.tier)
  const timeLeft = getTimeUntilExpiration(license.expiresAt)
  
  return (
    <div className="license-settings">
      <div className="current-plan">
        <h3>Current Plan: {tierDef.displayName}</h3>
        <p>Expires in: {timeLeft}</p>
        <p>License: {license.key.substring(0, 20)}...</p>
      </div>
      
      <div className="features">
        <h4>Your Features:</h4>
        <ul>
          {tierDef.features.map(f => (
            <li key={f}>✓ {f}</li>
          ))}
        </ul>
      </div>
      
      <div className="limits">
        <h4>Usage Limits:</h4>
        <ul>
          <li>AI Agents: {tierDef.limits.aiAgents === -1 ? 'Unlimited' : tierDef.limits.aiAgents}</li>
          <li>Strategies: {tierDef.limits.strategies === -1 ? 'Unlimited' : tierDef.limits.strategies}</li>
          <li>Exchanges: {tierDef.limits.exchanges === -1 ? 'Unlimited' : tierDef.limits.exchanges}</li>
        </ul>
      </div>
      
      <button onClick={() => window.location.href = '/upgrade'}>
        Upgrade Plan
      </button>
    </div>
  )
}
```

---

## 🔗 Deep Link Integration

### Generate Activation Links

```typescript
import { generateActivationDeepLink, generateEmailActivationLink } from '@quantumfalcon/license-hub'

function generateUserActivationLinks(licenseKey: string, userId: string) {
  // For mobile apps
  const deepLink = generateActivationDeepLink(licenseKey, userId)
  // quantumfalcon://license/activate?key=QF-PRO-...&userId=user_123
  
  // For email/web
  const webLink = generateEmailActivationLink(
    licenseKey,
    'https://app.quantumfalcon.com',
    userId
  )
  // https://app.quantumfalcon.com/activate?action=activate&key=QF-PRO-...
  
  return { deepLink, webLink }
}

// Send in welcome email
async function sendWelcomeEmail(user, license) {
  const { webLink, deepLink } = generateUserActivationLinks(license.key, user.id)
  
  await sendEmail({
    to: user.email,
    subject: 'Welcome to Quantum Falcon!',
    html: `
      <h1>Your License is Ready!</h1>
      <p>License Key: ${license.key}</p>
      <a href="${webLink}">Activate Now</a>
      <p>Or use this deep link in the mobile app: ${deepLink}</p>
    `
  })
}
```

### Parse Deep Links on App Launch

```typescript
import { parseDeepLink } from '@quantumfalcon/license-hub'

// Handle deep link when app launches
function handleAppLaunch(url: string) {
  const params = parseDeepLink(url)
  
  if (!params) {
    console.log('Not a valid license deep link')
    return
  }
  
  switch (params.action) {
    case 'activate':
      if (params.licenseKey) {
        activateLicense(params.licenseKey, params.userId)
      }
      break
      
    case 'renew':
      if (params.tier && params.userId) {
        showRenewalFlow(params.tier, params.userId)
      }
      break
      
    case 'upgrade':
      if (params.tier && params.userId) {
        showUpgradeFlow(params.tier, params.userId)
      }
      break
  }
}

// iOS/Android - register URL scheme handler
// quantumfalcon://license/activate?key=...
```

---

## 💳 Server-Side: Payment Webhooks

### Stripe Webhook Handler

```typescript
import { processWebhook } from '@quantumfalcon/license-hub'
import express from 'express'

const app = express()

app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'] as string
  
  try {
    const result = await processWebhook(
      'stripe',
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
      process.env.MASTER_KEY!,
      async (license) => {
        console.log('✅ License generated:', license.license)
        
        // Store in database
        await db.licenses.create({
          userId: license.userId,
          key: license.license,
          tier: license.tier,
          expiresAt: license.expiresAt,
          generatedAt: license.generatedAt
        })
        
        // Send email with activation link
        await sendLicenseEmail(license)
        
        // Update user record
        await db.users.update(license.userId, {
          tier: license.tier,
          licenseKey: license.license
        })
      }
    )
    
    if (result?.success) {
      console.log('Payment processed and license generated')
    }
    
    res.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err)
    res.status(400).send('Webhook error')
  }
})
```

### Paddle Webhook Handler

```typescript
import { processWebhook } from '@quantumfalcon/license-hub'

app.post('/webhooks/paddle', express.json(), async (req, res) => {
  const signature = req.headers['paddle-signature'] as string
  
  const result = await processWebhook(
    'paddle',
    req.body,
    signature,
    process.env.PADDLE_PUBLIC_KEY!,
    process.env.MASTER_KEY!,
    async (license) => {
      // Same callback as Stripe
      await storeLicenseAndNotify(license)
    }
  )
  
  res.json({ success: true })
})
```

### Manual License Generation

```typescript
import { generateLicense } from '@quantumfalcon/license-hub'

async function generateLicenseForUser(userId: string, email: string, tier: LicenseTier) {
  const result = generateLicense(
    {
      userId,
      userEmail: email,
      tier,
      timestamp: Date.now()
    },
    process.env.MASTER_KEY!
  )
  
  if (result.success) {
    console.log('Generated:', result.license)
    return result
  } else {
    throw new Error(result.error)
  }
}

// Usage:
const license = await generateLicenseForUser('user_123', 'user@example.com', 'pro')
```

---

## 🧪 Testing Examples

### Unit Test - License Validation

```typescript
import { validateLicenseKeyFormat, extractTierFromKey } from '@quantumfalcon/license-hub'

describe('License Validation', () => {
  it('should validate correct license format', () => {
    const key = 'QF-PRO-abc123def456-1700000000'
    expect(validateLicenseKeyFormat(key)).toBe(true)
  })
  
  it('should extract tier from license key', () => {
    const key = 'QF-ELITE-xyz789-1700000000'
    expect(extractTierFromKey(key)).toBe('elite')
  })
  
  it('should reject invalid format', () => {
    const key = 'INVALID-KEY'
    expect(validateLicenseKeyFormat(key)).toBe(false)
  })
})
```

### Integration Test - Full Flow

```typescript
import { generateLicense, validateLicense } from '@quantumfalcon/license-hub'

describe('License Flow', () => {
  it('should generate and validate license', async () => {
    // Generate
    const result = generateLicense({
      userId: 'test_user',
      userEmail: 'test@example.com',
      tier: 'pro',
      timestamp: Date.now()
    }, 'test_master_key')
    
    expect(result.success).toBe(true)
    expect(result.license).toContain('QF-PRO-')
    
    // Validate
    const validation = await validateLicense(
      result.license!,
      'http://localhost:8000/api/verify'
    )
    
    expect(validation.valid).toBe(true)
    expect(validation.tier).toBe('pro')
  })
})
```

---

## 🔧 Environment Setup

### .env Configuration

```bash
# License Hub Configuration
VITE_LICENSE_API_ENDPOINT=https://api.quantumfalcon.com/license/verify
GITHUB_TOKEN=ghp_your_github_token

# Server-side only
MASTER_KEY=your_secret_master_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_secret
PADDLE_PUBLIC_KEY=your_paddle_public_key
```

### .npmrc Configuration

```ini
@quantumfalcon:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

---

## 📱 Mobile App Integration

### React Native

```typescript
import { Linking } from 'react-native'
import { parseDeepLink, validateLicense } from '@quantumfalcon/license-hub'

// Register deep link listener
useEffect(() => {
  const handleDeepLink = async ({ url }: { url: string }) => {
    const params = parseDeepLink(url)
    
    if (params?.action === 'activate' && params.licenseKey) {
      const result = await validateLicense(
        params.licenseKey,
        Config.LICENSE_API_ENDPOINT
      )
      
      if (result.valid) {
        // Store and activate
        await AsyncStorage.setItem('license', JSON.stringify(result))
        navigation.navigate('Dashboard')
      }
    }
  }
  
  Linking.addEventListener('url', handleDeepLink)
  
  return () => Linking.removeAllListeners('url')
}, [])
```

---

**🎉 You're all set! The LicenseAuthority Hub handles the rest.**

**SYNC COMPLETE: All repos pull from LicenseAuthority Hub — never out of sync again — November 20, 2025**
