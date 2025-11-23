# Quick Integration Reference
## License Authority v2.0 → Quantum Falcon Integration

> **Copy-Paste Ready Code Snippets for Fast Integration**

---

## 📦 1. Install Dependencies

```bash
npm install jwt-decode
```

---

## 📁 2. Copy Files

```bash
# Run from quantum-falcon-cockp repository root
cp /path/to/LicenseAuthority/integration/licenseService.ts src/services/
cp /path/to/LicenseAuthority/integration/LicenseTab.tsx src/components/settings/
cp /path/to/LicenseAuthority/integration/AppIntegration.tsx src/components/
```

---

## ⚙️ 3. Environment Variables

Add to `.env`:
```env
REACT_APP_LICENSE_API_URL=http://localhost:8000
```

Add to `.env.production`:
```env
REACT_APP_LICENSE_API_URL=https://license.quantumfalcon.com
```

---

## 🔧 4. Update App.tsx

**Replace:**
```tsx
function App() {
  return (
    <Router>
      <Routes>
        {/* your routes */}
      </Routes>
    </Router>
  );
}
```

**With:**
```tsx
import { AppWithLicenseIntegration } from './components/AppIntegration';
import { LicenseTab } from './components/settings/LicenseTab';

function App() {
  return (
    <AppWithLicenseIntegration>
      <Router>
        <Routes>
          <Route path="/settings/license" element={<LicenseTab />} />
          {/* your other routes */}
        </Routes>
      </Router>
    </AppWithLicenseIntegration>
  );
}
```

---

## 🎯 5. Feature Gating Examples

### Wrap Premium Features
```tsx
import { Paywall } from './components/AppIntegration';

function AdvancedFeature() {
  return (
    <Paywall requiredTier="pro">
      <div>Premium content here</div>
    </Paywall>
  );
}
```

### Check Tier Programmatically
```tsx
import { useLicense } from './components/AppIntegration';

function MyComponent() {
  const { tier, hasStrategy, getMaxAgents } = useLicense();
  
  return (
    <div>
      <p>Current Tier: {tier}</p>
      {hasStrategy('momentum') && <MomentumStrategy />}
      <p>Max Agents: {getMaxAgents()}</p>
    </div>
  );
}
```

### Strategy Selector
```tsx
import { useLicense } from './components/AppIntegration';

function StrategySelector() {
  const { hasStrategy } = useLicense();
  
  return (
    <select>
      {hasStrategy('dca_basic') && <option value="dca">DCA Basic</option>}
      {hasStrategy('momentum') && <option value="momentum">Momentum</option>}
      {hasStrategy('rsi') && <option value="rsi">RSI</option>}
      {hasStrategy('macd') && <option value="macd">MACD</option>}
      {hasStrategy('bollinger') && <option value="bollinger">Bollinger</option>}
    </select>
  );
}
```

### Agent Limit Check
```tsx
import { useLicense } from './components/AppIntegration';

function AgentManager() {
  const { getMaxAgents } = useLicense();
  const [agents, setAgents] = useState([]);
  
  const maxAgents = getMaxAgents();
  const canAddAgent = maxAgents === -1 || agents.length < maxAgents;
  
  return (
    <div>
      <p>Agents: {agents.length} / {maxAgents === -1 ? '∞' : maxAgents}</p>
      <button 
        disabled={!canAddAgent}
        onClick={() => setAgents([...agents, newAgent])}
      >
        Add Agent
      </button>
    </div>
  );
}
```

---

## 📄 6. Update README.md

Add this section to your README:

```markdown
## 🔐 License Tiers

This project uses License Authority v2.0 for feature management.

| Tier | Price | Strategies | Agents | 
|------|-------|------------|--------|
| Free | $0 | 1 | 1 |
| Pro | $99/mo | 5 | 5 |
| Elite | $299/mo | 23+ | Unlimited |
| Lifetime | $1,999 | All | Unlimited |

### Getting a License

1. Go to Settings → License in the app
2. Click "Upgrade" to purchase
3. Enter your license key to activate

For more info: https://github.com/mhamp1/LicenseAuthority
```

---

## 🧪 7. Testing

### Generate Test Licenses

```bash
# Install License Authority
pip install mhamp1-licenseauthority

# Initialize
python -m mhamp1_licenseauthority.cli init

# Generate free tier
python -m mhamp1_licenseauthority.cli generate \
  --user-id free@test.com \
  --tier free

# Generate pro tier (30 days)
python -m mhamp1_licenseauthority.cli generate \
  --user-id pro@test.com \
  --tier pro \
  --expires-days 30

# Generate elite tier (365 days)
python -m mhamp1_licenseauthority.cli generate \
  --user-id elite@test.com \
  --tier elite \
  --expires-days 365
```

### Start API Server

```bash
# Terminal 1: License API
python -m mhamp1_licenseauthority.api

# Terminal 2: Your app
npm start
```

### Test Checklist

- [ ] Free tier: Only DCA strategy visible
- [ ] Pro tier: 5 strategies + 5 agents limit
- [ ] Elite tier: All strategies + unlimited agents
- [ ] Paywall blocks restricted features
- [ ] Settings → License page works
- [ ] License activation successful
- [ ] Upgrade prompts appear

---

## 🎨 8. UI Components

### Add License Badge to Header

```tsx
import { useLicense } from './components/AppIntegration';

function Header() {
  const { tier, isValid } = useLicense();
  
  return (
    <header>
      <h1>Quantum Falcon</h1>
      <div className="badge">
        {tier.toUpperCase()} Tier
      </div>
    </header>
  );
}
```

### Show Expiry Warning

```tsx
import { useLicense } from './components/AppIntegration';

function ExpiryWarning() {
  const { daysUntilExpiry, isValid } = useLicense();
  
  if (!isValid || daysUntilExpiry > 7) return null;
  
  return (
    <div className="alert alert-warning">
      ⚠️ Your license expires in {daysUntilExpiry} days.
      <a href="/settings/license">Renew now</a>
    </div>
  );
}
```

---

## 🔒 9. Security Config (Production)

```bash
# .env.production
REACT_APP_LICENSE_API_URL=https://license.quantumfalcon.com
REACT_APP_ENABLE_HARDWARE_BINDING=true

# Backend .env
DATABASE_URL=postgresql://user:pass@host/dbname
JWT_SECRET=your-secure-random-string-here
ADMIN_TOKEN=your-admin-token-here
CORS_ORIGINS=https://app.quantumfalcon.com,https://quantumfalcon.com
```

---

## 📊 10. Tier Feature Mapping

```typescript
// src/config/tiers.ts
export const TIER_FEATURES = {
  free: {
    strategies: ['dca_basic'],
    maxAgents: 1,
    features: ['dashboard']
  },
  pro: {
    strategies: ['dca_basic', 'momentum', 'rsi', 'macd', 'bollinger'],
    maxAgents: 5,
    features: ['dashboard', 'notifications', 'priority_support']
  },
  elite: {
    strategies: ['*'], // All strategies
    maxAgents: -1, // Unlimited
    features: ['*'] // All features
  }
};
```

---

## 🚀 11. Backend Integration (if needed)

```python
# backend/services/license.py
import requests

def validate_license(license_key: str, hardware_id: str = None):
    """Validate license with License Authority API"""
    response = requests.post(
        'https://license.quantumfalcon.com/validate',
        json={
            'license_key': license_key,
            'hardware_id': hardware_id
        },
        timeout=5
    )
    
    if response.status_code == 200:
        return response.json()
    
    return {'valid': False, 'tier': 'free'}

# Usage in your endpoints
@app.get('/api/strategies')
def get_strategies(license_key: str):
    license_data = validate_license(license_key)
    
    if not license_data['valid']:
        return {'strategies': ['dca_basic']}
    
    return {'strategies': license_data['features']}
```

---

## 📞 12. Support Links

Add to your footer/help section:

```tsx
<footer>
  <a href="https://github.com/mhamp1/LicenseAuthority">
    License Documentation
  </a>
  <a href="mailto:mhamp1trading@yahoo.com">
    Support
  </a>
  <a href="/settings/license">
    Manage License
  </a>
</footer>
```

---

## ✅ Integration Checklist

Complete this checklist to ensure proper integration:

### Setup
- [ ] Installed `jwt-decode` package
- [ ] Copied integration files (3 files)
- [ ] Added environment variables
- [ ] Updated `.gitignore` (if needed)

### Code Changes
- [ ] Updated `App.tsx` with wrapper
- [ ] Added License route in Settings
- [ ] Implemented feature gating
- [ ] Added paywall components
- [ ] Updated strategy selector
- [ ] Implemented agent limits

### Documentation
- [ ] Updated README with tier info
- [ ] Added license section to docs
- [ ] Documented environment variables
- [ ] Added support contact info

### Testing
- [ ] Generated test licenses
- [ ] Started API server
- [ ] Tested all tiers
- [ ] Verified paywall blocks
- [ ] Checked Settings page
- [ ] Tested activation flow

### Deployment
- [ ] Configured production API URL
- [ ] Set up SSL certificates
- [ ] Configured CORS
- [ ] Tested in production
- [ ] Monitored for errors

---

## 🔗 Resources

- **Full Migration Guide:** `MIGRATION_GUIDE_FOR_QUANTUM_FALCON.md`
- **Updates Summary:** `UPDATES_SUMMARY.md`
- **Integration README:** `integration/README.md`
- **API Docs:** http://localhost:8000/docs
- **Repository:** https://github.com/mhamp1/LicenseAuthority

---

**Questions? Email:** mhamp1trading@yahoo.com

**The Falcon protects its own. 🦅**
