# LicenseAuthority Hub - Troubleshooting Guide

**Solutions for common issues and debugging tips**

---

## 🔍 Quick Diagnostics

Run these commands first to diagnose issues:

```bash
# Check package version
npm list @quantumfalcon/license-hub

# Verify .npmrc configuration
cat .npmrc

# Check GitHub token
echo $GITHUB_TOKEN | cut -c1-10

# Test package import
node -e "console.log(require('@quantumfalcon/license-hub'))"

# Check workflow status
gh run list --repo mhamp1/LicenseAuthority --workflow publish-license-hub.yml
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Cannot Install Package

**Error Message:**
```
npm ERR! 404 Not Found - GET https://npm.pkg.github.com/@quantumfalcon/license-hub
npm ERR! 404 '@quantumfalcon/license-hub@latest' is not in this registry.
```

**Possible Causes:**
1. Package not published yet
2. Incorrect .npmrc configuration
3. Invalid or expired GitHub token
4. No access to repository

**Solutions:**

**Solution 1a: Verify Package is Published**
```bash
# Check if package exists
gh api /orgs/quantumfalcon/packages/npm/license-hub

# Or visit
https://github.com/mhamp1/LicenseAuthority/packages
```

**Solution 1b: Fix .npmrc Configuration**
```bash
# Create/update .npmrc in project root
cat > .npmrc << 'EOF'
@quantumfalcon:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
EOF

# Verify token is set
echo $GITHUB_TOKEN
```

**Solution 1c: Generate New GitHub Token**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "NPM Package Access"
4. Select scopes:
   - `read:packages` (minimum)
   - `write:packages` (if publishing)
5. Generate and copy token
6. Add to .env: `GITHUB_TOKEN=ghp_your_token_here`
7. Reload environment: `source .env`

**Solution 1d: Check Repository Access**
```bash
# Verify you have access to the repo
gh repo view mhamp1/LicenseAuthority

# If not, request access from repository owner
```

---

### Issue 2: Build Fails

**Error Message:**
```
npm ERR! code 1
npm ERR! path /path/to/packages/license-hub
npm ERR! command failed
npm ERR! command sh -c tsup src/index.ts --format cjs,esm --dts --clean
```

**Possible Causes:**
1. TypeScript compilation errors
2. Missing dependencies
3. Node version mismatch

**Solutions:**

**Solution 2a: Check TypeScript Errors**
```bash
cd packages/license-hub

# Run TypeScript compiler directly
npx tsc --noEmit

# Check for syntax errors
```

**Solution 2b: Reinstall Dependencies**
```bash
# Clear everything
rm -rf node_modules package-lock.json
rm -rf dist

# Fresh install
npm install

# Try build again
npm run build
```

**Solution 2c: Check Node Version**
```bash
# Check current version
node --version

# Should be 18+ for best compatibility
# If lower, use nvm to upgrade:
nvm install 20
nvm use 20
```

**Solution 2d: Check tsup Configuration**
```bash
# Verify tsup is installed
npm list tsup

# If not found:
npm install --save-dev tsup@latest
```

---

### Issue 3: Import Errors

**Error Message:**
```
Error: Cannot find module '@quantumfalcon/license-hub'
```

**Possible Causes:**
1. Package not installed
2. Module resolution issue
3. Incorrect import path

**Solutions:**

**Solution 3a: Verify Installation**
```bash
# Check if package is in node_modules
ls -la node_modules/@quantumfalcon/

# If not found, install
npm install @quantumfalcon/license-hub
```

**Solution 3b: Check Import Statement**
```typescript
// ✅ Correct
import { validateLicense } from '@quantumfalcon/license-hub'

// ❌ Incorrect
import { validateLicense } from 'license-hub'
import { validateLicense } from '@quantumfalcon/license-hub/dist'
```

**Solution 3c: Clear Module Cache**
```bash
# Clear npm cache
npm cache clean --force

# Clear node_modules
rm -rf node_modules
npm install

# If using TypeScript, clear build cache
rm -rf dist tsconfig.tsbuildinfo
```

**Solution 3d: Check Package.json**
```json
{
  "dependencies": {
    "@quantumfalcon/license-hub": "^2025.1.0"  // Should be present
  }
}
```

---

### Issue 4: TypeScript Type Errors

**Error Message:**
```
error TS2307: Cannot find module '@quantumfalcon/license-hub' or its corresponding type declarations.
```

**Possible Causes:**
1. Missing type declarations
2. TypeScript can't find package types
3. Incorrect TypeScript configuration

**Solutions:**

**Solution 4a: Verify Type Declarations Exist**
```bash
# Check for type files
ls node_modules/@quantumfalcon/license-hub/dist/*.d.ts

# Should see: index.d.ts, index.d.mts
```

**Solution 4b: Update TypeScript Configuration**
```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",  // Important!
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

**Solution 4c: Explicit Type Import**
```typescript
// If auto-import fails, import type explicitly
import type { 
  LicenseTier,
  LicenseVerificationResult 
} from '@quantumfalcon/license-hub'

import { validateLicense } from '@quantumfalcon/license-hub'
```

**Solution 4d: Restart TypeScript Server**
```bash
# VS Code: Cmd+Shift+P -> "TypeScript: Restart TS Server"
# Or close and reopen your editor
```

---

### Issue 5: Workflow Doesn't Trigger

**Error Message:**
```
No workflow runs found
```

**Possible Causes:**
1. Workflow file in wrong location
2. Branch name doesn't match trigger
3. Path filters prevent trigger

**Solutions:**

**Solution 5a: Check Workflow Location**
```bash
# Should be at:
.github/workflows/publish-license-hub.yml

# NOT at:
.github/publish-license-hub.yml  # ❌ Wrong
github/workflows/publish-license-hub.yml  # ❌ Wrong
```

**Solution 5b: Check Branch Name**
```yaml
# In publish-license-hub.yml
on:
  push:
    branches:
      - main  # Make sure you're pushing to 'main'
```

```bash
# Check current branch
git branch --show-current

# If on different branch:
git checkout main
git merge your-feature-branch
git push origin main
```

**Solution 5c: Check Path Filters**
```yaml
# In publish-license-hub.yml
on:
  push:
    paths:
      - 'packages/license-hub/**'  # Only triggers if files here change
```

```bash
# Make sure changes are in the right directory
git status

# Changes should show:
#   packages/license-hub/src/...
```

**Solution 5d: Manually Trigger Workflow**
```bash
# Add workflow_dispatch to workflow
on:
  push:
    branches: [main]
  workflow_dispatch:  # Add this

# Then trigger manually:
gh workflow run publish-license-hub.yml --repo mhamp1/LicenseAuthority
```

---

### Issue 6: Publish Fails - 403 Forbidden

**Error Message:**
```
npm ERR! code E403
npm ERR! 403 Forbidden - PUT https://npm.pkg.github.com/@quantumfalcon/license-hub
```

**Possible Causes:**
1. No write permissions
2. Package name already exists
3. Workflow permissions not set

**Solutions:**

**Solution 6a: Check Workflow Permissions**
1. Go to repository Settings
2. Actions → General
3. Workflow permissions
4. Select "Read and write permissions"
5. Save

**Solution 6b: Verify Package Name**
```json
// packages/license-hub/package.json
{
  "name": "@quantumfalcon/license-hub",  // Must match scope
  "publishConfig": {
    "registry": "https://npm.pkg.github.com",
    "@quantumfalcon:registry": "https://npm.pkg.github.com"
  }
}
```

**Solution 6c: Check if Version Already Published**
```bash
# Check existing versions
npm view @quantumfalcon/license-hub versions

# If version exists, bump it
cd packages/license-hub
npm version patch
git push --follow-tags
```

---

### Issue 7: License Validation Fails

**Error Message:**
```
{ valid: false, error: 'License verification failed' }
```

**Possible Causes:**
1. Invalid license key format
2. Expired license
3. Server unreachable
4. Incorrect API endpoint

**Solutions:**

**Solution 7a: Validate License Key Format**
```typescript
import { validateLicenseKeyFormat } from '@quantumfalcon/license-hub'

const key = 'QF-PRO-abc123def456-1700000000'
console.log(validateLicenseKeyFormat(key))  // Should be true

// Valid format: QF-{TIER}-{SIGNATURE}-{TIMESTAMP}
```

**Solution 7b: Check Expiration**
```typescript
import { isLicenseExpired } from '@quantumfalcon/license-hub'

const expiresAt = 1700000000000  // Your license expiration
console.log(isLicenseExpired(expiresAt))  // true if expired
```

**Solution 7c: Verify API Endpoint**
```typescript
// Check endpoint is reachable
const endpoint = process.env.VITE_LICENSE_API_ENDPOINT

fetch(endpoint)
  .then(r => console.log('Status:', r.status))
  .catch(e => console.error('Cannot reach endpoint:', e))
```

**Solution 7d: Test with Known Good License**
```bash
# Generate test license on server
curl -X POST https://your-server.com/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user",
    "tier": "pro",
    "userEmail": "test@example.com"
  }'

# Use returned license to test validation
```

---

### Issue 8: Webhook Not Processing

**Error Message:**
```
Payment succeeded but no license generated
```

**Possible Causes:**
1. Webhook signature verification failed
2. Webhook endpoint not configured
3. Event type not handled
4. Master key missing

**Solutions:**

**Solution 8a: Check Webhook Configuration**

For Stripe:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Verify endpoint URL: `https://your-server.com/webhooks/stripe`
3. Check events subscribed to:
   - `checkout.session.completed` ✅
   - `payment_intent.succeeded` ✅

For Paddle:
1. Go to Paddle Dashboard → Developer Tools → Webhooks
2. Verify endpoint URL: `https://your-server.com/webhooks/paddle`
3. Check events subscribed to:
   - `transaction.completed` ✅

**Solution 8b: Test Webhook Locally**
```bash
# Use Stripe CLI for local testing
stripe listen --forward-to localhost:3000/webhooks/stripe

# Trigger test event
stripe trigger checkout.session.completed
```

**Solution 8c: Check Server Logs**
```typescript
// Add detailed logging
import { processWebhook } from '@quantumfalcon/license-hub'

app.post('/webhooks/stripe', async (req, res) => {
  console.log('Webhook received:', {
    type: req.body.type,
    id: req.body.id
  })

  try {
    const result = await processWebhook(...)
    console.log('Processing result:', result)
  } catch (error) {
    console.error('Webhook processing error:', error)
  }
})
```

**Solution 8d: Verify Master Key**
```bash
# Check master key is set
echo $MASTER_KEY | wc -c

# Should be 32+ characters
# If not set:
export MASTER_KEY=your_secret_master_key_here_at_least_32_chars
```

---

### Issue 9: Deep Link Not Working

**Error Message:**
```
Deep link doesn't open app
```

**Possible Causes:**
1. URL scheme not registered
2. Invalid deep link format
3. OS-specific configuration missing

**Solutions:**

**Solution 9a: Verify URL Scheme Registration**

For iOS (Info.plist):
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>quantumfalcon</string>
    </array>
  </dict>
</array>
```

For Android (AndroidManifest.xml):
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="quantumfalcon" android:host="license" />
</intent-filter>
```

**Solution 9b: Test Deep Link Format**
```typescript
import { parseDeepLink, validateDeepLink } from '@quantumfalcon/license-hub'

const link = 'quantumfalcon://license/activate?key=QF-PRO-abc123'

console.log('Valid:', validateDeepLink(link))
console.log('Parsed:', parseDeepLink(link))
```

**Solution 9c: Test with Simple URL**
```bash
# iOS Simulator
xcrun simctl openurl booted "quantumfalcon://license/activate?key=test"

# Android
adb shell am start -a android.intent.action.VIEW -d "quantumfalcon://license/activate?key=test"

# Desktop (if protocol registered)
open "quantumfalcon://license/activate?key=test"
```

---

### Issue 10: Features Not Unlocking

**Error Message:**
```
User has valid license but features still locked
```

**Possible Causes:**
1. Feature check logic incorrect
2. License not stored locally
3. Tier comparison wrong
4. UI not updating

**Solutions:**

**Solution 10a: Verify License Storage**
```typescript
// Check what's stored
const stored = localStorage.getItem('qf_license')
console.log('Stored license:', stored ? JSON.parse(atob(stored)) : null)

// Re-validate and store
import { validateLicense } from '@quantumfalcon/license-hub'

const result = await validateLicense(key, endpoint)
if (result.valid) {
  const encrypted = btoa(JSON.stringify({
    key,
    tier: result.tier,
    expiresAt: result.expiresAt,
    features: result.features
  }))
  localStorage.setItem('qf_license', encrypted)
}
```

**Solution 10b: Check Feature Logic**
```typescript
import { getTierFeatures, compareTiers } from '@quantumfalcon/license-hub'

const userTier = 'pro'
const requiredTier = 'elite'

// Check if user has access
const hasAccess = compareTiers(userTier, requiredTier)
console.log('Has access:', hasAccess)  // false - pro < elite

// Check tier features
const features = getTierFeatures(userTier)
console.log('User features:', features)
```

**Solution 10c: Force UI Update**
```typescript
// React - trigger re-render
const [license, setLicense] = useState(null)

useEffect(() => {
  const stored = localStorage.getItem('qf_license')
  if (stored) {
    setLicense(JSON.parse(atob(stored)))
  }
}, [])

// Force refresh
window.location.reload()
```

---

## 🔧 Advanced Debugging

### Enable Debug Logging

```typescript
// Add to your app entry point
if (process.env.NODE_ENV === 'development') {
  // Enable console logging for license operations
  window.LICENSE_DEBUG = true
}

// In license-hub usage:
const result = await validateLicense(key, endpoint)
if (window.LICENSE_DEBUG) {
  console.log('[LICENSE_DEBUG]', {
    valid: result.valid,
    tier: result.tier,
    expires: new Date(result.expiresAt!),
    error: result.error
  })
}
```

### Network Debugging

```bash
# Monitor network requests
# Chrome DevTools: Network tab
# Filter by: license, verify, generate

# Check request details:
# - Status code (should be 200)
# - Response body
# - Request headers
# - Response time
```

### Package Debugging

```bash
# Check package contents
npm pack @quantumfalcon/license-hub
tar -xzf quantumfalcon-license-hub-2025.1.0.tgz
ls package/dist/

# Verify exports
node -e "console.log(Object.keys(require('@quantumfalcon/license-hub')))"
```

---

## 📞 Getting Help

If issues persist after trying these solutions:

1. **Check GitHub Issues**
   - https://github.com/mhamp1/LicenseAuthority/issues
   - Search for similar problems

2. **Create Detailed Issue**
   - Include error messages
   - Share relevant code snippets
   - Describe steps to reproduce
   - Include environment details:
     - Node version: `node --version`
     - Package version: `npm list @quantumfalcon/license-hub`
     - OS: macOS/Windows/Linux

3. **Contact Support**
   - Email: mhamp1trading@yahoo.com
   - Slack: #license-hub channel

4. **Provide Diagnostics**
   ```bash
   # Run diagnostic script
   npm list @quantumfalcon/license-hub
   cat .npmrc
   node --version
   npm --version
   git remote -v
   ```

---

## ✅ Prevention Checklist

Prevent issues before they happen:

- [ ] Use Node.js 18+
- [ ] Keep packages updated: `npm update`
- [ ] Use valid GitHub token with correct scopes
- [ ] Configure .npmrc correctly
- [ ] Set all required environment variables
- [ ] Enable workflow permissions in repo settings
- [ ] Test in development before production
- [ ] Monitor workflow runs regularly
- [ ] Keep documentation up to date
- [ ] Review logs for warnings

---

**Still stuck? We're here to help!**

**SYNC COMPLETE: All repos now pull from LicenseAuthority Hub — never out of sync again — November 20, 2025**
