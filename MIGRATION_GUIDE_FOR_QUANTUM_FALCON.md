# Migration Guide: LicenseAuthority Hub Integration

**Complete step-by-step guide for migrating Desktop and Cockpit repos to use @quantumfalcon/license-hub**

## 🎯 Overview

This guide walks you through migrating from local license logic to the centralized @quantumfalcon/license-hub package.

**Benefits:**
- ✅ No more copy-paste between repos
- ✅ No more license logic drift
- ✅ Automatic updates when LicenseAuthority changes
- ✅ Single source of truth for all license operations

---

## 📋 Prerequisites

Before starting:
- [ ] Access to GitHub Packages (@quantumfalcon scope)
- [ ] GitHub Personal Access Token with `read:packages` scope
- [ ] Node.js 18+ installed
- [ ] Backup current license implementation

---

## Step 1: Configure Package Registry

### 1.1 Create `.npmrc` in repo root

```bash
# In Desktop or Cockpit repo root
touch .npmrc
```

### 1.2 Add GitHub Packages configuration

```ini
# .npmrc
@quantumfalcon:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

### 1.3 Set up environment variable

```bash
# Add to .env or .env.local
GITHUB_TOKEN=ghp_your_token_here
```

Or for CI/CD, add as GitHub Actions secret.

---

## Step 2: Install License Hub Package

### 2.1 Install the package

```bash
npm install @quantumfalcon/license-hub@latest
```

### 2.2 Verify installation

```bash
npm list @quantumfalcon/license-hub
# Should show: @quantumfalcon/license-hub@2025.1.0
```

---

## Step 3: Update Import Statements

### 3.1 Find all license-related imports

```bash
# Search for old imports
grep -r "from '@/lib/license-auth'" src/
grep -r "from '@/lib/licenseGeneration'" src/
grep -r "from '@/lib/payment/paymentProcessor'" src/
```

### 3.2 Replace with new imports

**Before:**
```typescript
import { LicenseAuthority, verifyAndStoreLicense } from '@/lib/license-auth'
import { licenseGenerationService } from '@/lib/licenseGeneration'
```

**After:**
```typescript
import {
  validateLicense,
  getTierFeatures,
  isLicenseExpired,
  generateActivationDeepLink
} from '@quantumfalcon/license-hub'
```

---

## Step 4: Update License Validation Logic

### 4.1 Replace LicenseAuthority class usage

**Before:**
```typescript
// src/components/auth/LicenseAuth.tsx
const result = await LicenseAuthority.verifyLicense(licenseKey)
const features = LicenseAuthority.getTierFeatures(tier)
```

**After:**
```typescript
import { validateLicense, getTierFeatures } from '@quantumfalcon/license-hub'

const result = await validateLicense(
  licenseKey,
  import.meta.env.VITE_LICENSE_API_ENDPOINT
)
const features = getTierFeatures(tier)
```

### 4.2 Update license checking

**Before:**
```typescript
const isExpired = await LicenseAuthority.checkExpiration(expiresAt)
const timeLeft = LicenseAuthority.getTimeUntilExpiration(expiresAt)
```

**After:**
```typescript
import { isLicenseExpired, getTimeUntilExpiration } from '@quantumfalcon/license-hub'

const isExpired = isLicenseExpired(expiresAt)
const timeLeft = getTimeUntilExpiration(expiresAt)
```

---

## Step 5: Update Tier Definitions

### 5.1 Replace local tier definitions

**Before:**
```typescript
// src/config/tiers.ts or inline definitions
const tiers = {
  free: { price: 0, features: [...] },
  pro: { price: 90, features: [...] },
  // ...
}
```

**After:**
```typescript
import { TIER_DEFINITIONS, getTierFeatures } from '@quantumfalcon/license-hub'

// Use directly
const proFeatures = getTierFeatures('pro')
const allTiers = TIER_DEFINITIONS
```

### 5.2 Update subscription components

**Before:**
```typescript
// src/components/settings/SubscriptionTiers.tsx
const tiers = [
  { name: 'Pro', price: 90, features: ['Feature 1', 'Feature 2'] },
  // ...
]
```

**After:**
```typescript
import { TIER_DEFINITIONS } from '@quantumfalcon/license-hub'

const tiers = Object.values(TIER_DEFINITIONS).map(tier => ({
  name: tier.displayName,
  price: tier.price,
  features: tier.features,
  limits: tier.limits
}))
```

---

## Step 6: Update Payment Webhook Handlers

### 6.1 Server-side webhook handling

**Before:**
```typescript
// Local webhook processing
app.post('/webhooks/stripe', async (req, res) => {
  const event = req.body
  // Custom parsing and license generation
})
```

**After:**
```typescript
import { processWebhook } from '@quantumfalcon/license-hub'

app.post('/webhooks/stripe', async (req, res) => {
  const signature = req.headers['stripe-signature']
  
  const result = await processWebhook(
    'stripe',
    req.body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
    process.env.MASTER_KEY,
    async (license) => {
      // Store license in database
      await db.licenses.create({
        userId: license.userId,
        key: license.license,
        tier: license.tier,
        expiresAt: license.expiresAt
      })
      
      // Send email notification
      await sendLicenseEmail(license)
    }
  )
  
  res.json({ received: true })
})
```

---

## Step 7: Update Deep Link Handling

### 7.1 Generate activation links

**Before:**
```typescript
// Custom deep link generation
const link = `quantumfalcon://activate?key=${licenseKey}`
```

**After:**
```typescript
import { generateActivationDeepLink } from '@quantumfalcon/license-hub'

const link = generateActivationDeepLink(licenseKey, userId)
// quantumfalcon://license/activate?key=QF-PRO-...&userId=user_123
```

### 7.2 Parse activation links

**Before:**
```typescript
// Custom parsing
const params = new URLSearchParams(url.split('?')[1])
const key = params.get('key')
```

**After:**
```typescript
import { parseDeepLink } from '@quantumfalcon/license-hub'

const params = parseDeepLink(url)
if (params?.action === 'activate') {
  const { licenseKey, userId } = params
  // Handle activation
}
```

---

## Step 8: Remove Old License Files

### 8.1 Identify files to remove

```bash
# These files can now be deleted:
src/lib/license-auth.ts
src/lib/licenseGeneration.ts
# Keep payment processor integration code
```

### 8.2 Keep integration files

Keep these files (they integrate with the hub):
- Payment processor integration
- Webhook endpoint routes
- UI components (update imports only)

### 8.3 Remove files

```bash
# Backup first
cp src/lib/license-auth.ts src/lib/license-auth.ts.backup
cp src/lib/licenseGeneration.ts src/lib/licenseGeneration.ts.backup

# Then remove
git rm src/lib/license-auth.ts
git rm src/lib/licenseGeneration.ts
```

---

## Step 9: Update Environment Variables

### 9.1 Add new environment variables

```bash
# .env
VITE_LICENSE_API_ENDPOINT=https://api.quantumfalcon.com/license/verify
GITHUB_TOKEN=ghp_your_token_here
```

### 9.2 Remove obsolete variables

Remove if no longer needed:
- Local license generation endpoints (if moved to LicenseAuthority)
- Duplicate tier definitions

---

## Step 10: Testing

### 10.1 Test license validation

```typescript
import { validateLicense } from '@quantumfalcon/license-hub'

// Test with valid license
const result = await validateLicense(
  'QF-PRO-abc123def456-1700000000',
  process.env.VITE_LICENSE_API_ENDPOINT
)

console.assert(result.valid === true, 'License should be valid')
console.assert(result.tier === 'pro', 'Tier should be pro')
```

### 10.2 Test feature retrieval

```typescript
import { getTierFeatures, getTierLimits } from '@quantumfalcon/license-hub'

const features = getTierFeatures('elite')
console.assert(features.length > 0, 'Should have features')

const limits = getTierLimits('elite')
console.assert(limits.aiAgents === -1, 'Elite should have unlimited AI agents')
```

### 10.3 Test deep links

```typescript
import { generateActivationDeepLink, parseDeepLink } from '@quantumfalcon/license-hub'

const link = generateActivationDeepLink('QF-PRO-test', 'user_123')
const parsed = parseDeepLink(link)

console.assert(parsed?.action === 'activate', 'Should parse activate action')
console.assert(parsed?.licenseKey === 'QF-PRO-test', 'Should parse license key')
```

### 10.4 Run existing tests

```bash
npm test
```

---

## Step 11: Update Documentation

### 11.1 Update README.md

Add section about license hub:

```markdown
## License System

This project uses [@quantumfalcon/license-hub](https://github.com/mhamp1/LicenseAuthority) for license management.

All license logic is centralized in the LicenseAuthority repo. Updates are automatic via npm.
```

### 11.2 Update API documentation

Update any API docs that reference license endpoints or logic.

---

## Step 12: Deploy and Monitor

### 12.1 Create deployment branch

```bash
git checkout -b feature/migrate-to-license-hub
git add .
git commit -m "Migrate to @quantumfalcon/license-hub centralized package"
git push origin feature/migrate-to-license-hub
```

### 12.2 Create Pull Request

Create PR with checklist:
- [ ] Package installed successfully
- [ ] All imports updated
- [ ] Old files removed
- [ ] Tests passing
- [ ] Manual testing completed
- [ ] Documentation updated

### 12.3 Monitor after deployment

- Watch for license validation errors
- Check webhook processing
- Verify feature checks work correctly
- Monitor performance

---

## 🔄 Keeping Up to Date

### Automatic Updates

When LicenseAuthority updates:

1. **LicenseAuthority repo** pushes to main
2. GitHub Action automatically publishes new version
3. Your repo runs:
   ```bash
   npm install @quantumfalcon/license-hub@latest
   ```
4. All license logic automatically updated! 🎉

### Manual Updates

```bash
# Check for updates
npm outdated @quantumfalcon/license-hub

# Update to latest
npm install @quantumfalcon/license-hub@latest

# Update to specific version
npm install @quantumfalcon/license-hub@2025.1.27
```

---

## ⚠️ Common Issues

### Issue: Cannot install package

**Error:** `404 Not Found - GET https://npm.pkg.github.com/@quantumfalcon/license-hub`

**Solution:**
1. Check `.npmrc` configuration
2. Verify GITHUB_TOKEN has `read:packages` scope
3. Ensure token is not expired

### Issue: Import errors

**Error:** `Module not found: @quantumfalcon/license-hub`

**Solution:**
1. Run `npm install` again
2. Clear node_modules: `rm -rf node_modules && npm install`
3. Check package.json has the dependency listed

### Issue: Type errors

**Error:** `Property 'tier' does not exist on type 'unknown'`

**Solution:**
```typescript
// Add type import
import type { LicenseVerificationResult } from '@quantumfalcon/license-hub'

const result: LicenseVerificationResult = await validateLicense(...)
```

---

## 📞 Support

- **Issues:** https://github.com/mhamp1/LicenseAuthority/issues
- **Slack:** #license-hub channel
- **Email:** mhamp1trading@yahoo.com

---

## ✅ Migration Checklist

Use this checklist to track your progress:

- [ ] Step 1: Configure package registry
- [ ] Step 2: Install license hub package
- [ ] Step 3: Update import statements
- [ ] Step 4: Update license validation logic
- [ ] Step 5: Update tier definitions
- [ ] Step 6: Update payment webhook handlers
- [ ] Step 7: Update deep link handling
- [ ] Step 8: Remove old license files
- [ ] Step 9: Update environment variables
- [ ] Step 10: Testing (all tests pass)
- [ ] Step 11: Update documentation
- [ ] Step 12: Deploy and monitor

---

**🎉 Migration Complete! Your repo now uses the centralized LicenseAuthority Hub.**

**SYNC COMPLETE: All repos pull from LicenseAuthority Hub — never out of sync again — November 20, 2025**
