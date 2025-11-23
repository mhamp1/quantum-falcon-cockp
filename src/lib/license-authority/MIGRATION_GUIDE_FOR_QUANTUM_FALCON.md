# Migration Guide: License Authority v2.0 Integration
## For Quantum Falcon Cockpit and Quantum Falcon Repositories

**Last Updated:** November 20, 2025  
**License Authority Version:** 2.0.0  
**Target Repositories:**
- https://github.com/mhamp1/quantum-falcon-cockp
- https://github.com/mhamp1/Quantum-Falcon

---

## 🎯 Overview

License Authority has been **completely upgraded** from a basic license generation tool to a **full-featured license management and paywall system**. This guide provides step-by-step instructions for integrating these changes into your Quantum Falcon applications.

---

## 📋 What's New in v2.0

### Major Features Added
1. **Six-Tier Licensing System** (Free, Pro, Elite, Lifetime, Enterprise, White Label)
2. **REST API Service** with FastAPI for license validation
3. **JWT Token Authentication** (24-hour expiration)
4. **Frontend Integration Components** (React/TypeScript)
5. **Automated Renewal Reminders** (7, 3, 1 days before expiry)
6. **Grace Period Support** (7 days after expiry with reduced features)
7. **Paywall Components** for feature gating
8. **First-Time User Flow** with splash screen and onboarding
9. **Comprehensive Audit Logging**
10. **Rate Limiting** (100 requests/minute per IP)

### Security Enhancements
- Upgraded from Fernet to **AES-256-GCM encryption**
- JWT authentication with HMAC signing
- Webhook signature verification
- Hardware fingerprint binding
- IP address tracking

---

## 🔧 Required Updates to Quantum Falcon Repositories

### 1. Update Dependencies in `package.json`

Add the following to your frontend dependencies:

```json
{
  "dependencies": {
    "jwt-decode": "^4.0.0"
  }
}
```

### 2. Add Environment Variables

Update your `.env` or `.env.example` files:

```env
# License Authority API
REACT_APP_LICENSE_API_URL=https://license.quantumfalcon.com
# For local development:
# REACT_APP_LICENSE_API_URL=http://localhost:8000

# Optional: Hardware ID for license binding
REACT_APP_ENABLE_HARDWARE_BINDING=true
```

### 3. Copy Integration Files

Copy these files from `LicenseAuthority/integration/` to your `src/` directory:

```bash
# From LicenseAuthority repository
cp integration/licenseService.ts src/services/
cp integration/LicenseTab.tsx src/components/settings/
cp integration/AppIntegration.tsx src/components/
cp integration/README.md docs/LICENSE_INTEGRATION.md
```

### 4. Update Your Main App Component

**Before (v0.1.x):**
```tsx
// Old simple license check
import { validateLicense } from './oldLicenseUtils';

function App() {
  const [isValid, setIsValid] = useState(false);
  
  useEffect(() => {
    const key = localStorage.getItem('license');
    setIsValid(validateLicense(key));
  }, []);
  
  return isValid ? <MainApp /> : <div>Invalid License</div>;
}
```

**After (v2.0):**
```tsx
// New comprehensive license management
import { AppWithLicenseIntegration } from './components/AppIntegration';
import { LicenseTab } from './components/settings/LicenseTab';

function App() {
  return (
    <AppWithLicenseIntegration>
      <Router>
        <Routes>
          <Route path="/settings/license" element={<LicenseTab />} />
          {/* Your other routes */}
        </Routes>
      </Router>
    </AppWithLicenseIntegration>
  );
}
```

### 5. Implement Feature Gating

**Strategy Access Control:**
```tsx
import { useLicense } from './components/AppIntegration';

function StrategySelector() {
  const { hasStrategy } = useLicense();

  return (
    <div>
      {/* Free tier - always available */}
      {hasStrategy('dca_basic') && <DCABasicStrategy />}
      
      {/* Pro tier and above */}
      {hasStrategy('momentum') && <MomentumStrategy />}
      {hasStrategy('rsi') && <RSIStrategy />}
      {hasStrategy('macd') && <MACDStrategy />}
      {hasStrategy('bollinger') && <BollingerStrategy />}
      
      {/* Elite tier and above */}
      {hasStrategy('ml_prophet') && <MLProphetStrategy />}
      {hasStrategy('sentiment') && <SentimentStrategy />}
      {hasStrategy('arbitrage') && <ArbitrageStrategy />}
    </div>
  );
}
```

**Agent Limits:**
```tsx
import { useLicense } from './components/AppIntegration';

function AgentManager() {
  const { getMaxAgents } = useLicense();
  const maxAgents = getMaxAgents();
  const currentAgents = agents.length;

  const canAddAgent = maxAgents === -1 || currentAgents < maxAgents;

  return (
    <div>
      <p>Active Agents: {currentAgents} / {maxAgents === -1 ? '∞' : maxAgents}</p>
      <button disabled={!canAddAgent} onClick={addAgent}>
        Add Agent
      </button>
      {!canAddAgent && (
        <p className="text-red-500">
          Upgrade to add more agents
        </p>
      )}
    </div>
  );
}
```

**Premium Features with Paywall:**
```tsx
import { Paywall } from './components/AppIntegration';

function AdvancedAnalytics() {
  return (
    <Paywall requiredTier="elite">
      <div>
        <MachineLearningInsights />
        <PortfolioOptimization />
        <BacktestingEngine />
      </div>
    </Paywall>
  );
}
```

### 6. Update Settings Page

Add a new "License" tab to your Settings page:

```tsx
import { LicenseTab } from './components/settings/LicenseTab';

function Settings() {
  return (
    <div className="settings">
      <nav>
        <Link to="/settings/general">General</Link>
        <Link to="/settings/trading">Trading</Link>
        <Link to="/settings/license">License</Link> {/* NEW */}
      </nav>
      
      <Routes>
        <Route path="general" element={<GeneralSettings />} />
        <Route path="trading" element={<TradingSettings />} />
        <Route path="license" element={<LicenseTab />} /> {/* NEW */}
      </Routes>
    </div>
  );
}
```

---

## 📚 Update Documentation Files

### README.md Updates

Add a new section about licensing:

```markdown
## 🔐 License Tiers

Quantum Falcon Cockpit uses a tiered licensing system powered by License Authority v2.0:

| Tier | Price | Strategies | Agents | Features |
|------|-------|------------|--------|----------|
| **Free** | $0 | DCA Basic | 1 | Basic dashboard, community support |
| **Pro** | $99/mo | 5 strategies | 5 | Momentum, RSI, MACD, priority support |
| **Elite** | $299/mo | All 23+ | Unlimited | ML strategies, backtesting, custom builder |
| **Lifetime** | $1,999 once | All | Unlimited | Everything + white-label + source code |
| **Enterprise** | Custom | All | Unlimited | Multi-user, SLA, custom deployment |
| **White Label** | Custom | All | Unlimited | Full rebrand, reseller license |

### License Management

1. Go to Settings → License
2. Enter your license key
3. Click "Activate License"
4. Your tier features will be unlocked immediately

For more information, visit: https://github.com/mhamp1/LicenseAuthority
```

### Update Installation Instructions

Add license-related setup:

```markdown
## 🚀 Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and set REACT_APP_LICENSE_API_URL
   ```
4. Start the development server: `npm start`
5. (Optional) Generate a test license:
   ```bash
   pip install mhamp1-licenseauthority
   python -m mhamp1_licenseauthority.cli generate --user-id test@example.com --tier pro
   ```
```

---

## 🔄 API Integration Changes

### Old Validation (v0.1.x)
```typescript
// Simple local validation
function validateLicense(key: string): boolean {
  try {
    const decoded = decryptKey(key);
    return decoded.expires > Date.now();
  } catch {
    return false;
  }
}
```

### New Validation (v2.0)
```typescript
// API-based validation with full feature set
import { licenseService } from './services/licenseService';

async function validateLicense(key: string, hardwareId?: string) {
  const result = await licenseService.validate(key, hardwareId);
  
  if (result.valid) {
    // Store license data
    localStorage.setItem('licenseData', JSON.stringify(result));
    
    // Access tier information
    console.log('Tier:', result.tier);
    console.log('Features:', result.features);
    console.log('Max Agents:', result.maxAgents);
    console.log('Expires:', new Date(result.expiresAt * 1000));
    
    return true;
  }
  
  return false;
}
```

---

## 🎨 UI/UX Changes

### First-Time User Experience

The new system includes a complete first-time user flow:

1. **Splash Screen** (3 seconds) → Shows app logo and branding
2. **License Validation** → Automatic check on startup
3. **Onboarding Tour** → For users with valid paid licenses
4. **Upgrade Modal** → For users without valid licenses

### License Status Display

Update your UI to show license information:

```tsx
import { useLicense } from './components/AppIntegration';

function Header() {
  const { tier, isValid, daysUntilExpiry } = useLicense();
  
  return (
    <header>
      <div className="license-badge">
        {tier.toUpperCase()} Tier
        {daysUntilExpiry < 7 && (
          <span className="warning">
            Expires in {daysUntilExpiry} days
          </span>
        )}
      </div>
    </header>
  );
}
```

---

## 🧪 Testing Your Integration

### 1. Test License Generation

```bash
# Install License Authority
pip install mhamp1-licenseauthority

# Initialize system
python -m mhamp1_licenseauthority.cli init

# Generate test licenses
python -m mhamp1_licenseauthority.cli generate --user-id free@test.com --tier free
python -m mhamp1_licenseauthority.cli generate --user-id pro@test.com --tier pro --expires-days 30
python -m mhamp1_licenseauthority.cli generate --user-id elite@test.com --tier elite --expires-days 365
```

### 2. Start License API Server

```bash
# Terminal 1: Start License Authority API
python -m mhamp1_licenseauthority.api

# Terminal 2: Start your Quantum Falcon app
npm start
```

### 3. Test Different Tiers

In your app's Settings → License page, activate each test license and verify:
- ✅ Free tier: Only DCA Basic strategy visible, max 1 agent
- ✅ Pro tier: 5 strategies visible, max 5 agents
- ✅ Elite tier: All 23+ strategies visible, unlimited agents

### 4. Test Grace Period

```bash
# Generate an expired license
python -m mhamp1_licenseauthority.cli generate --user-id expired@test.com --tier pro --expires-days -1

# Activate in app - should show grace period message
```

### 5. Test Paywall Components

Navigate to features that require higher tiers and verify the upgrade prompts appear correctly.

---

## 🔐 Security Best Practices

### 1. Environment Variables

**Never commit these to version control:**
```env
REACT_APP_LICENSE_API_URL=https://license.quantumfalcon.com
JWT_SECRET=your-secure-jwt-secret-here
ADMIN_TOKEN=your-admin-token-here
```

### 2. Hardware Binding (Recommended)

Enable hardware binding for production:

```typescript
// In licenseService.ts
const hardwareId = await generateHardwareId();
const result = await licenseService.validate(licenseKey, hardwareId);
```

### 3. Secure Storage

License data is automatically stored in browser localStorage. For additional security:

```typescript
// Encrypt sensitive data before storing
import { encrypt, decrypt } from './crypto';

const encryptedData = encrypt(JSON.stringify(licenseData));
localStorage.setItem('licenseData', encryptedData);
```

---

## 📊 Monitoring and Analytics

### Audit Logs

All license validations are logged. Query them via API:

```bash
curl -X GET http://localhost:8000/audit-logs \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN"
```

### User Metrics

Track license usage:
- Active licenses per tier
- Expiring licenses (renewal opportunities)
- Failed validation attempts
- Feature usage by tier

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Update all environment variables
- [ ] Test license validation with production API
- [ ] Verify all tier features work correctly
- [ ] Test grace period behavior
- [ ] Verify renewal reminders are sent
- [ ] Test upgrade flows from each tier
- [ ] Ensure error handling for API failures
- [ ] Configure CORS for production domain
- [ ] Set up monitoring for license API
- [ ] Document license management for support team

---

## 📞 Support and Resources

- **License Authority Repository:** https://github.com/mhamp1/LicenseAuthority
- **API Documentation:** http://localhost:8000/docs (when running locally)
- **Integration Guide:** See `integration/README.md` in LicenseAuthority repo
- **Contact:** mhamp1trading@yahoo.com

---

## 🔄 Breaking Changes from v0.1.x

### Changed APIs
- `generate_license()` now returns a dict instead of string
- License validation requires API call (was local before)
- Tier names changed (lowercase: 'free', 'pro', 'elite', etc.)

### Removed Features
- Local-only license validation (now API-based)
- Simple Fernet encryption (replaced with AES-256-GCM)

### New Requirements
- Node.js dependency: `jwt-decode`
- Backend API must be running for validation
- Database initialization required

---

## 🎯 Migration Timeline

**Recommended Steps:**

1. **Week 1:** Set up License Authority v2.0 backend
   - Install and configure API server
   - Generate test licenses
   - Test API endpoints

2. **Week 2:** Update frontend codebase
   - Copy integration files
   - Update App.tsx
   - Add Settings → License page

3. **Week 3:** Implement feature gating
   - Add Paywall components
   - Update strategy selector
   - Implement agent limits

4. **Week 4:** Testing and deployment
   - Test all tiers
   - Test grace period
   - Test first-time user flow
   - Deploy to production

---

**The Falcon protects its own. 🦅**
