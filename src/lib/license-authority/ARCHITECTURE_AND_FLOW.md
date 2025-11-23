# License Authority v2.0 - Architecture & Integration Flow
## Visual Guide for Quantum Falcon Integration

**Last Updated:** November 20, 2025  
**Version:** 2.0.0

---

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     QUANTUM FALCON ECOSYSTEM                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│  Quantum Falcon Web  │         │   Quantum Falcon     │
│    (React/TS App)    │◄───────►│      Backend         │
│  quantum-falcon-cockp│         │   Quantum-Falcon     │
└──────────┬───────────┘         └──────────┬───────────┘
           │                                 │
           │ License Validation              │ License Validation
           │ (REST API)                      │ (REST API)
           │                                 │
           ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              LICENSE AUTHORITY v2.0 API SERVER                   │
│                 https://license.quantumfalcon.com                │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   FastAPI    │  │  Validation  │  │    Audit     │         │
│  │   Routes     │─►│   Service    │─►│   Logging    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                 │                    │                │
│         ▼                 ▼                    ▼                │
│  ┌──────────────────────────────────────────────────┐          │
│  │           PostgreSQL Database                     │          │
│  │  - Licenses Table                                 │          │
│  │  - Tiers Table                                    │          │
│  │  - Audit Logs Table                              │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
           │
           │ Payment Webhooks
           ▼
┌─────────────────────────────────────────────────────────────────┐
│              PAYMENT PROVIDERS                                   │
│    ┌──────────────┐              ┌──────────────┐              │
│    │    Stripe    │              │ LemonSqueezy │              │
│    └──────────────┘              └──────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 License Validation Flow

### Complete Validation Sequence

```
User Opens App
     │
     ├─► First Time? ─────► Show Splash Screen (3s)
     │                              │
     │                              ▼
     │                      Set hasSeenSplash2025 = true
     │
     ├─► Check localStorage['licenseData']
     │
     ├─► License Exists? ──No──► Show as Free Tier
     │         │                       │
     │        Yes                      ▼
     │         │              Show Upgrade Modal
     │         ▼
     │   Validate with API
     │         │
     │         ├─► POST /validate
     │         │   { license_key, hardware_id }
     │         │
     │         ▼
     │   ┌──────────────────────────┐
     │   │  License Authority API   │
     │   │                          │
     │   │  1. Decrypt license key  │
     │   │  2. Check database       │
     │   │  3. Verify expiration    │
     │   │  4. Check hardware bind  │
     │   │  5. Update last_validated│
     │   │  6. Log audit entry      │
     │   │  7. Generate JWT token   │
     │   └──────────────────────────┘
     │         │
     │         ▼
     │   Response: {
     │     valid: true/false,
     │     tier: 'free|pro|elite|...',
     │     expires_at: timestamp,
     │     features: [...],
     │     max_agents: number,
     │     is_grace_period: boolean,
     │     token: 'JWT_TOKEN'
     │   }
     │         │
     │         ├─► Valid & Paid? ──Yes──► Show Onboarding Tour
     │         │                               │
     │         │                               ▼
     │         │                      Unlock Tier Features
     │         │
     │         ├─► Invalid? ──► Show Upgrade Modal
     │         │
     │         ├─► Expired (< 7 days)? ──► Grace Period Mode
     │         │                                  │
     │         │                                  ▼
     │         │                      Downgrade to Previous Tier
     │         │                      Show Renewal Reminder
     │         │
     │         └─► Expired (> 7 days)? ──► Restrict to Free Tier
     │
     └─► Store in localStorage['licenseData']
```

---

## 🎯 Feature Gating Flow

### Strategy Access Control

```
User Selects Strategy
     │
     ▼
┌─────────────────────────────────┐
│  Check License Tier             │
│  useLicense().hasStrategy(name) │
└─────────────────────────────────┘
     │
     ├─► Strategy: 'dca_basic'
     │   ├─► All Tiers ──► ✅ ALLOW
     │
     ├─► Strategy: 'momentum|rsi|macd|bollinger|ema_cross'
     │   ├─► Pro+ ──► ✅ ALLOW
     │   └─► Free ──► ❌ SHOW PAYWALL
     │
     └─► Strategy: 'ml_*|sentiment|arbitrage|custom|...'
         ├─► Elite+ ──► ✅ ALLOW
         └─► Free/Pro ──► ❌ SHOW PAYWALL

┌─────────────────────────────────┐
│  PAYWALL COMPONENT              │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 🔒 Upgrade to Access      │ │
│  │                           │ │
│  │ This feature requires:    │ │
│  │ PRO tier ($99/mo)         │ │
│  │                           │ │
│  │ [Upgrade Now]  [Learn More]│ │
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

### Agent Limit Enforcement

```
User Clicks "Add Agent"
     │
     ▼
┌─────────────────────────────────┐
│  Check License Tier             │
│  useLicense().getMaxAgents()    │
└─────────────────────────────────┘
     │
     ├─► Free Tier ──► maxAgents = 1
     │   ├─► currentAgents < 1? ──Yes──► ✅ ALLOW
     │   └─► currentAgents >= 1? ──No──► ❌ SHOW UPGRADE PROMPT
     │
     ├─► Pro Tier ──► maxAgents = 5
     │   ├─► currentAgents < 5? ──Yes──► ✅ ALLOW
     │   └─► currentAgents >= 5? ──No──► ❌ SHOW UPGRADE PROMPT
     │
     └─► Elite+/Lifetime/Enterprise/White Label
         └─► maxAgents = -1 (unlimited) ──► ✅ ALWAYS ALLOW
```

---

## 📱 First-Time User Flow

### Complete Onboarding Sequence

```
App Launch (First Time)
     │
     ▼
┌──────────────────────────────────────┐
│  SPLASH SCREEN (3 seconds)           │
│                                      │
│     🦅 QUANTUM FALCON COCKPIT       │
│                                      │
│  "The Future of Automated Trading"   │
└──────────────────────────────────────┘
     │
     ▼
Set localStorage: hasSeenSplash2025 = true
     │
     ▼
Check localStorage: licenseData
     │
     ├──► No License Found
     │    │
     │    ▼
     │   ┌──────────────────────────────────────┐
     │   │  WELCOME MODAL                       │
     │   │                                      │
     │   │  Welcome to Quantum Falcon!          │
     │   │                                      │
     │   │  You're starting with FREE tier      │
     │   │  • DCA Basic strategy                │
     │   │  • 1 active agent                    │
     │   │                                      │
     │   │  [Start Free] [See Premium Features] │
     │   └──────────────────────────────────────┘
     │         │
     │         ▼
     │    Show Dashboard (Free Tier)
     │
     └──► License Found
          │
          ▼
     Validate with API
          │
          ├─► Valid Free Tier ──► Show Dashboard
          │
          └─► Valid Paid Tier (Pro/Elite/...)
              │
              ▼
         ┌──────────────────────────────────────┐
         │  ONBOARDING TOUR                     │
         │                                      │
         │  Step 1/5: Welcome!                  │
         │  Let's get you started with          │
         │  your Pro features...                │
         │                                      │
         │  [Next] [Skip Tour]                  │
         └──────────────────────────────────────┘
              │
              ▼
         Complete Tour → Show Dashboard
```

---

## 💳 Payment & Activation Flow

### Purchase to Activation

```
User Clicks "Upgrade" Button
     │
     ▼
┌──────────────────────────────────────┐
│  TIER SELECTION MODAL                │
│                                      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │FREE││PRO ││ELITE││LIFE│           │
│  │$0  ││$99 ││$299 ││$1999│          │
│  └────┘ └────┘ └────┘ └────┘       │
└──────────────────────────────────────┘
     │
     ▼
User Selects Tier (e.g., Pro)
     │
     ▼
Redirect to Payment Provider
     │
     ├─► Stripe Checkout
     │   or
     └─► LemonSqueezy Checkout
         │
         ▼
    User Completes Payment
         │
         ▼
┌──────────────────────────────────────┐
│  PAYMENT PROVIDER                    │
│                                      │
│  1. Process payment                  │
│  2. Send webhook to License API      │
│     POST /webhook/stripe             │
│     { event: 'payment.succeeded',    │
│       user_email: '...',             │
│       tier: 'pro',                   │
│       ... }                          │
└──────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  LICENSE AUTHORITY API               │
│                                      │
│  1. Verify webhook signature         │
│  2. Generate license key             │
│  3. Store in database                │
│  4. Send email to user               │
│     with license key                 │
└──────────────────────────────────────┘
         │
         ▼
User Receives Email
     │
     "Your Quantum Falcon Pro License"
     Key: XXXX-XXXX-XXXX-XXXX
     │
     ▼
User Opens App → Settings → License
     │
     ▼
Enter License Key + Click "Activate"
     │
     ▼
POST /validate { license_key: '...' }
     │
     ▼
Store in localStorage['licenseData']
     │
     ▼
✅ PRO FEATURES UNLOCKED!
```

---

## 🔔 Renewal Reminder Flow

### Automated Email Reminders

```
Cron Job Runs Every 6 Hours
     │
     ▼
┌──────────────────────────────────────┐
│  RENEWAL SERVICE                     │
│  python -m mhamp1_licenseauthority.  │
│         renewal_service              │
└──────────────────────────────────────┘
     │
     ▼
Query Database for Licenses
     │
     ├─► expires_at - now() = 7 days? ──► Send "7 Days" Email
     │
     ├─► expires_at - now() = 3 days? ──► Send "3 Days" Email
     │
     └─► expires_at - now() = 1 day?  ──► Send "1 Day" Email

Email Template:
┌──────────────────────────────────────┐
│  Subject: Your Quantum Falcon        │
│           License Expires Soon       │
│                                      │
│  Hi John,                            │
│                                      │
│  Your Pro tier license expires in    │
│  7 days on Nov 27, 2025.            │
│                                      │
│  Renew now to avoid interruption:    │
│  [Renew License]                     │
│                                      │
│  Questions? Reply to this email.     │
└──────────────────────────────────────┘

In-App Reminder:
┌──────────────────────────────────────┐
│  ⚠️ License Expiring Soon            │
│                                      │
│  Your license expires in 7 days.     │
│  Renew now to keep your features.    │
│                                      │
│  [Renew Now] [Remind Me Later]       │
└──────────────────────────────────────┘
```

---

## 🔐 Security Flow

### Encryption & Authentication

```
License Generation
     │
     ▼
┌──────────────────────────────────────┐
│  1. Generate Unique ID               │
│  2. Create JSON payload:             │
│     {                                │
│       user_id: "...",                │
│       tier: "pro",                   │
│       expires_at: timestamp,         │
│       features: [...],               │
│       max_agents: 5                  │
│     }                                │
│  3. Encrypt with AES-256-GCM         │
│  4. Base64 encode                    │
│  5. Store in database                │
└──────────────────────────────────────┘
     │
     ▼
License Key: "AES256GCM_base64_encrypted_payload"

License Validation
     │
     ▼
┌──────────────────────────────────────┐
│  1. Base64 decode                    │
│  2. Decrypt with AES-256-GCM         │
│  3. Verify signature                 │
│  4. Parse JSON payload               │
│  5. Check expiration                 │
│  6. Verify hardware ID (if enabled)  │
│  7. Generate JWT token               │
│     - Algorithm: HS256               │
│     - Expires: 24 hours              │
│     - Claims: {user_id, tier, ...}   │
│  8. Return response                  │
└──────────────────────────────────────┘
     │
     ▼
JWT Token: "eyJhbGciOiJIUzI1NiIs..."

API Request with JWT
     │
     ▼
┌──────────────────────────────────────┐
│  1. Extract JWT from Authorization   │
│     header                           │
│  2. Verify signature                 │
│  3. Check expiration                 │
│  4. Validate claims                  │
│  5. Allow/Deny request               │
└──────────────────────────────────────┘
```

---

## 📊 Data Flow

### License Data Lifecycle

```
1. GENERATION
   ┌────────────────┐
   │ Generate       │
   │ License Key    │
   └────────────────┘
          │
          ▼
   ┌────────────────┐
   │ Store in DB    │
   │ licenses table │
   └────────────────┘
          │
          ▼
   ┌────────────────┐
   │ Email to User  │
   └────────────────┘

2. ACTIVATION
   ┌────────────────┐
   │ User Enters    │
   │ License Key    │
   └────────────────┘
          │
          ▼
   ┌────────────────┐
   │ POST /validate │
   └────────────────┘
          │
          ▼
   ┌────────────────┐
   │ Check DB       │
   │ Verify Expiry  │
   └────────────────┘
          │
          ▼
   ┌────────────────┐
   │ Return JWT +   │
   │ License Data   │
   └────────────────┘
          │
          ▼
   ┌────────────────┐
   │ Store in       │
   │ localStorage   │
   └────────────────┘

3. USAGE
   ┌────────────────┐
   │ Read from      │
   │ localStorage   │
   └────────────────┘
          │
          ▼
   ┌────────────────┐
   │ Check Tier     │
   │ Check Features │
   └────────────────┘
          │
          ▼
   ┌────────────────┐
   │ Allow/Deny     │
   │ Feature Access │
   └────────────────┘

4. RENEWAL
   ┌────────────────┐
   │ Check Expiry   │
   │ Send Reminders │
   └────────────────┘
          │
          ▼
   ┌────────────────┐
   │ User Renews    │
   │ (New Payment)  │
   └────────────────┘
          │
          ▼
   ┌────────────────┐
   │ Update DB      │
   │ expires_at     │
   └────────────────┘
          │
          ▼
   ┌────────────────┐
   │ Send Confirm   │
   │ Email          │
   └────────────────┘
```

---

## 🧩 Component Integration

### React Component Hierarchy

```
<App>
  │
  ├─► <AppWithLicenseIntegration>
  │    │
  │    ├─► [Splash Screen Logic]
  │    ├─► [License Validation on Mount]
  │    ├─► [Onboarding Tour Trigger]
  │    ├─► [Upgrade Modal Management]
  │    │
  │    └─► <Router>
  │         │
  │         ├─► <Header>
  │         │    └─► License Tier Badge
  │         │
  │         ├─► <Routes>
  │         │    │
  │         │    ├─► <Dashboard>
  │         │    │    ├─► <StrategySelector>
  │         │    │    │    └─► hasStrategy() checks
  │         │    │    │
  │         │    │    └─► <AgentManager>
  │         │    │         └─► getMaxAgents() check
  │         │    │
  │         │    ├─► <AdvancedFeature>
  │         │    │    └─► <Paywall requiredTier="elite">
  │         │    │         └─► Premium Content
  │         │    │
  │         │    └─► <Settings>
  │         │         └─► <LicenseTab>
  │         │              ├─► License Status Display
  │         │              ├─► Activate License Form
  │         │              ├─► Tier Information
  │         │              └─► Upgrade Buttons
  │         │
  │         └─► <Footer>
  │              └─► License Links
  │
  └─► [License Context Provider]
       └─► useLicense() hook available to all children
```

---

## 🔄 State Management

### License State Flow

```
localStorage['licenseData']
     │
     ├─► tier: 'free' | 'pro' | 'elite' | ...
     ├─► valid: boolean
     ├─► expires_at: timestamp
     ├─► features: string[]
     ├─► max_agents: number
     ├─► is_grace_period: boolean
     └─► token: string (JWT)

     ↓ Read by

useLicense() Hook
     │
     ├─► getTier() → string
     ├─► isValid() → boolean
     ├─► hasStrategy(name) → boolean
     ├─► getMaxAgents() → number
     ├─► daysUntilExpiry() → number
     └─► shouldShowRenewalReminder() → boolean

     ↓ Used by

Components
     │
     ├─► <Paywall> → Checks tier hierarchy
     ├─► <StrategySelector> → Filters by hasStrategy()
     ├─► <AgentManager> → Enforces getMaxAgents()
     └─► <LicenseTab> → Displays all license info
```

---

## 📈 Monitoring & Logging

### Audit Trail

```
Every License Validation
     │
     ▼
┌──────────────────────────────────────┐
│  audit_logs table                    │
│                                      │
│  INSERT INTO audit_logs:             │
│  {                                   │
│    license_key: "...",               │
│    user_id: "...",                   │
│    action: "VALIDATE",               │
│    success: true/false,              │
│    ip_address: "1.2.3.4",            │
│    hardware_id: "...",               │
│    error_message: null,              │
│    timestamp: NOW()                  │
│  }                                   │
└──────────────────────────────────────┘
     │
     ▼
Available via API: GET /audit-logs
     │
     ▼
┌──────────────────────────────────────┐
│  Analytics Dashboard (Future)        │
│                                      │
│  • Total validations                 │
│  • Success rate                      │
│  • Failed attempts by user           │
│  • Geographic distribution           │
│  • Popular tiers                     │
└──────────────────────────────────────┘
```

---

## 🔗 Integration Points

### Where Quantum Falcon Repos Connect

```
quantum-falcon-cockp (Frontend)
     │
     ├─► src/components/AppIntegration.tsx
     │   └─► Calls: POST /validate
     │
     ├─► src/components/settings/LicenseTab.tsx
     │   ├─► Calls: POST /validate
     │   └─► Calls: GET /tiers
     │
     └─► src/services/licenseService.ts
         └─► All API communication

Quantum-Falcon (Backend)
     │
     ├─► Optional: Validate licenses server-side
     │   └─► Calls: POST /validate
     │
     └─► Optional: Generate licenses for admins
         └─► Calls: POST /generate

License Authority (API Server)
     │
     ├─► Endpoints:
     │   ├─► POST /validate
     │   ├─► POST /generate
     │   ├─► GET /tiers
     │   ├─► POST /webhook/{provider}
     │   ├─► POST /verify-token
     │   ├─► GET /audit-logs
     │   └─► GET /health
     │
     └─► Database:
         ├─► licenses
         ├─► tiers
         └─► audit_logs
```

---

## 📞 Support & Resources

For more details, see:
- **Migration Guide:** `MIGRATION_GUIDE_FOR_QUANTUM_FALCON.md`
- **Quick Reference:** `QUICK_INTEGRATION_REFERENCE.md`
- **API Docs:** http://localhost:8000/docs
- **Repository:** https://github.com/mhamp1/LicenseAuthority

**The Falcon protects its own. 🦅**
