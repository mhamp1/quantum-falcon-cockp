# LICENSE AUTHORITY v2: Integration Guide
## Quantum Falcon Cockpit v2025.1.0 — November 19, 2025

This directory contains the **complete integration files** for connecting your Quantum Falcon Cockpit web application with the License Authority backend.

---

## 📁 Files Overview

### **licenseService.ts**
TypeScript service for client-side license management.

**Key Features:**
- Validates licenses with the License Authority API
- Stores license data in browser localStorage (KV)
- Provides tier checking and feature gating
- Handles first-time splash screen logic
- JWT token management

**Usage:**
```typescript
import { licenseService } from './licenseService';

// Validate license
const result = await licenseService.validate(licenseKey, hardwareId);

// Check tier
const tier = licenseService.getTier(); // 'free', 'pro', 'elite', etc.

// Check feature access
if (licenseService.hasStrategy('momentum')) {
  // Allow access to momentum strategy
}

// Check agent limits
const maxAgents = licenseService.getMaxAgents(); // 1, 5, or -1 (unlimited)
```

---

### **LicenseTab.tsx**
React component for Settings → License management page.

**Features:**
- Display current license status
- Activate new license keys
- Show tier information and features
- Renewal reminders
- Upgrade buttons to payment links

**Integration:**
```tsx
import { LicenseTab } from './integration/LicenseTab';

// In your Settings component:
<Route path="/settings/license" component={LicenseTab} />
```

---

### **AppIntegration.tsx**
Complete first-time user flow and app initialization.

**Components:**
1. **AppWithLicenseIntegration** - Wrapper for your main App component
2. **useLicense** - React hook for accessing license state
3. **Paywall** - Component for gating premium features

**Integration in App.tsx:**
```tsx
import { AppWithLicenseIntegration, Paywall, useLicense } from './integration/AppIntegration';

function App() {
  return (
    <AppWithLicenseIntegration>
      <YourExistingApp />
    </AppWithLicenseIntegration>
  );
}

// Use Paywall component to gate features:
<Paywall requiredTier="pro">
  <AdvancedStrategy />
</Paywall>

// Use hook in components:
const { tier, hasStrategy, getMaxAgents } = useLicense();
```

---

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
npm install
# or
yarn install
```

### 2. Configure Environment Variables
Create a `.env` file in your web app root:

```env
REACT_APP_LICENSE_API_URL=https://license.quantumfalcon.com
# For local development:
# REACT_APP_LICENSE_API_URL=http://localhost:8000
```

### 3. Copy Integration Files
```bash
cp integration/* src/
```

### 4. Update Your App.tsx
```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppWithLicenseIntegration } from './AppIntegration';
import { LicenseTab } from './LicenseTab';

function App() {
  return (
    <AppWithLicenseIntegration>
      <Router>
        <Routes>
          {/* Your existing routes */}
          <Route path="/settings/license" element={<LicenseTab />} />
        </Routes>
      </Router>
    </AppWithLicenseIntegration>
  );
}

export default App;
```

---

## 🔐 License Validation Flow

### First-Time User Flow
1. User opens app → **Splash screen** displays (3 seconds)
2. Splash closes → KV flag `hasSeenSplash2025` set to `true`
3. If valid license exists → **Onboarding tour** starts automatically
4. If no/invalid license → **Upgrade modal** displays with tier options

### Returning User Flow
1. User opens app → Check KV for `licenseData`
2. If exists → Validate with API in background
3. If expired/invalid → Show **Upgrade modal**
4. If valid → Continue to app with tier features unlocked

### License Validation
```
Client → POST /validate
       → { license_key, hardware_id }

Server → Checks database
       → Verifies expiration
       → Checks hardware binding
       → Returns JWT token + tier info

Client → Stores in KV 'licenseData'
       → All components read from KV
```

---

## 🎯 Feature Gating Examples

### Strategy Access
```tsx
import { useLicense } from './AppIntegration';

function StrategySelector() {
  const { hasStrategy } = useLicense();

  return (
    <div>
      {hasStrategy('dca_basic') && <DCABasicStrategy />}
      {hasStrategy('momentum') && <MomentumStrategy />}
      {hasStrategy('rsi') && <RSIStrategy />}
    </div>
  );
}
```

### Agent Limits
```tsx
import { useLicense } from './AppIntegration';

function AgentManager() {
  const { getMaxAgents } = useLicense();
  const maxAgents = getMaxAgents();
  const currentAgents = agents.length;

  const canAddAgent = maxAgents === -1 || currentAgents < maxAgents;

  return (
    <div>
      <p>Agents: {currentAgents} / {maxAgents === -1 ? '∞' : maxAgents}</p>
      <button disabled={!canAddAgent}>Add Agent</button>
    </div>
  );
}
```

### Premium Features
```tsx
import { Paywall } from './AppIntegration';

function AdvancedAnalytics() {
  return (
    <Paywall requiredTier="elite">
      <div>
        {/* Elite-only analytics */}
        <MachineLearningInsights />
        <PortfolioOptimization />
      </div>
    </Paywall>
  );
}
```

---

## 🔄 Tier Hierarchy

```
FREE → PRO → ELITE → LIFETIME → ENTERPRISE → WHITE_LABEL
```

- **FREE**: DCA Basic, 1 agent
- **PRO**: 5 strategies, 5 agents, $99/mo
- **ELITE**: All 23+ strategies, unlimited agents, $299/mo
- **LIFETIME**: Everything + white-label + source code, $1,999 once
- **ENTERPRISE**: Custom multi-user setup
- **WHITE_LABEL**: Full rebrand rights

---

## 📊 Grace Period

After license expiry, users get **7 days grace period** with reduced features:
- **Pro expired** → Downgrade to Free tier features
- **Elite expired** → Downgrade to Pro tier features
- After 7 days → Complete access revoked (Free tier only)

---

## 🔔 Renewal Reminders

Automatic reminders sent at:
- **7 days** before expiry
- **3 days** before expiry
- **1 day** before expiry

In-app notification shown when `licenseService.shouldShowRenewalReminder()` returns `true`.

---

## 🛠️ Backend API Endpoints

Base URL: `https://license.quantumfalcon.com`

### POST /validate
Validate a license key.
```json
{
  "license_key": "string",
  "hardware_id": "string (optional)"
}
```

### GET /tiers
Get all available tiers and pricing.

### POST /webhook/{provider}
Webhook for Stripe/LemonSqueezy payment processing.

### GET /health
Health check endpoint.

---

## 🔒 Security Notes

- All license keys encrypted with **AES-256-GCM**
- JWT tokens expire after **24 hours**
- Rate limiting: **100 requests/minute** per IP
- All validation attempts logged in audit table
- Hardware binding optional but recommended

---

## 🧪 Testing

### Test License Validation
```typescript
import { licenseService } from './licenseService';

// Generate test license via CLI first
const result = await licenseService.validate('YOUR_TEST_KEY');
console.log('Valid:', result.valid);
console.log('Tier:', result.tier);
console.log('Features:', result.features);
```

### Test Paywall
```tsx
// Change tier in localStorage to test different tiers
localStorage.setItem('licenseData', JSON.stringify({
  tier: 'elite',
  // ... other fields
}));
```

---

## 📞 Support

Questions? Contact: **mhamp1trading@yahoo.com**

---

**The Falcon protects its own. 🦅**
