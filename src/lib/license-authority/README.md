# LICENSE AUTHORITY v2.1 🦅
## Complete Paywall + Onboarding Brain for Quantum Falcon Cockpit v2025.1.0
**November 20, 2025 — Production Ready + UPGRADED**

> **🚀 NEW IN v2.1:** Instant activation + Hardware binding + Grace period — **Now better than 3Commas/Pionex**
> 
> See [UPGRADE_FEATURES.md](UPGRADE_FEATURES.md) for complete upgrade documentation.

A **complete license management system** with:
- ✅ **License Generation** with 6 tiers (Free, Pro, Elite, Lifetime, Enterprise, White Label)
- ✅ **License Validation Service** (REST API with JWT)
- ✅ **Paywall & Tier Gating Logic**
- ✅ **First-Time Flow Integration**
- ✅ **Renewal/Upgrade Handling**
- ✅ **Security** (AES-256-GCM encryption, audit logs, rate limiting)
- ✅ **Web App Integration** (TypeScript + React components)
- 🆕 **Instant Activation** (Deep links on payment: `quantumfalcon://activate?key=XXX`)
- 🆕 **Hardware Binding** (Device fingerprinting, 1 change/month limit)
- 🆕 **7-Day Grace Period** (Soft lock with reduced features, "Renew Now" banner)

This system is the **single source of truth** for who gets what features in Quantum Falcon Cockpit.

---

## 🚀 Quick Start

### Installation

```bash
pip install -e .
```

### 1. Generate Master Key (First Time Only)

```bash
python -m mhamp1_licenseauthority.master_key_manager
```

This creates an encrypted master key at `~/.mhamp1_licenseauthority/master.key`

### 2. Generate a License

```bash
python -m mhamp1_licenseauthority.license_generator
```

Interactive prompts will guide you through:
- User ID/Email
- Tier selection (Free, Pro, Elite, Lifetime, Enterprise, White Label)
- Optional email

### 3. Start the API Server

```bash
python -m mhamp1_licenseauthority.api
```

Server starts at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

---

## 📦 Architecture

### Backend (Python)
```
mhamp1_licenseauthority/
├── models.py              # Database schema (License, Tier, AuditLog)
├── database.py            # SQLAlchemy connection management
├── license_generator.py   # Generate encrypted license keys
├── validation_service.py  # Validate licenses + JWT responses
├── api.py                 # FastAPI REST API
├── renewal_service.py     # Automated renewal reminders
└── master_key_manager.py  # Encryption key management
```

### Frontend Integration (TypeScript/React)
```
integration/
├── licenseService.ts      # Client-side license validation
├── LicenseTab.tsx         # Settings → License page
├── AppIntegration.tsx     # First-time flow + Paywall component
└── README.md              # Integration guide
```

---

## 🎯 License Tiers

| Tier | Price | Strategies | Agents | Features |
|------|-------|------------|--------|----------|
| **Free** | $0 | DCA Basic | 1 | Basic dashboard, community support |
| **Pro** | $99/mo | 5 strategies | 5 | Momentum, RSI, MACD, priority support |
| **Elite** | $299/mo | All 23+ | Unlimited | ML strategies, backtesting, custom builder |
| **Lifetime** | $1,999 once | All | Unlimited | Everything + white-label + source code |
| **Enterprise** | Custom | All | Unlimited | Multi-user, SLA, custom deployment |
| **White Label** | Custom | All | Unlimited | Full rebrand, reseller license |

---

## 🔐 API Endpoints

### POST /validate
Validate a license key (rate-limited: 100/min)

```bash
curl -X POST http://localhost:8000/validate \
  -H "Content-Type: application/json" \
  -d '{
    "license_key": "YOUR_LICENSE_KEY",
    "hardware_id": "optional-hardware-id"
  }'
```

Response:
```json
{
  "valid": true,
  "tier": "pro",
  "expires_at": 1767225600,
  "user_id": "user@example.com",
  "features": ["Momentum strategy", "RSI strategy", ...],
  "max_agents": 5,
  "is_grace_period": false,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### POST /generate
Generate new license (admin only)

```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN" \
  -d '{
    "user_id": "user@example.com",
    "email": "user@example.com",
    "tier": "pro",
    "expires_days": 30
  }'
```

### GET /tiers
Get all available tiers and pricing

```bash
curl http://localhost:8000/tiers
```

### POST /webhook/{provider}
Webhook for Stripe/LemonSqueezy payments

```bash
curl -X POST http://localhost:8000/webhook/stripe \
  -H "Content-Type: application/json" \
  -H "X-Signature: WEBHOOK_SIGNATURE" \
  -d '{ "event": "payment.succeeded", ... }'
```

### GET /health
Health check

```bash
curl http://localhost:8000/health
```

---

## 🌐 Web App Integration

### 1. Install TypeScript Dependencies

```bash
npm install jwt-decode
```

### 2. Copy Integration Files

```bash
cp integration/* your-app/src/
```

### 3. Update App.tsx

```tsx
import { AppWithLicenseIntegration } from './AppIntegration';
import { LicenseTab } from './LicenseTab';

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

### 4. Gate Features with Paywall

```tsx
import { Paywall, useLicense } from './AppIntegration';

function AdvancedFeature() {
  return (
    <Paywall requiredTier="pro">
      <div>Premium content here</div>
    </Paywall>
  );
}

function StrategySelector() {
  const { hasStrategy } = useLicense();
  
  return (
    <div>
      {hasStrategy('momentum') && <MomentumStrategy />}
    </div>
  );
}
```

See `integration/README.md` for complete integration guide.

---

## 🔄 First-Time User Flow

1. **Splash Screen** (3 seconds) → Set KV `hasSeenSplash2025 = true`
2. **License Validation** → Call `/validate` endpoint
3. **Valid License** → Show **Onboarding Tour** → Set user tier in app state
4. **Invalid/Expired** → Show **Upgrade Modal** with tier pricing
5. **Grace Period** (7 days) → Reduced features, show renewal reminder

---

## 🔔 Renewal Reminders

Automated email reminders sent at:
- 7 days before expiry
- 3 days before expiry
- 1 day before expiry

### Setup Email Configuration

```bash
export SMTP_SERVER="smtp.gmail.com"
export SMTP_PORT="587"
export SMTP_USER="your-email@gmail.com"
export SMTP_PASSWORD="your-app-password"
export FROM_EMAIL="noreply@quantumfalcon.com"
```

### Run Reminder Service (Cron Job)

```bash
# Add to crontab (runs every 6 hours)
0 */6 * * * python -m mhamp1_licenseauthority.renewal_service
```

---

## 🔒 Security Features

- **AES-256-GCM Encryption** for all license keys
- **JWT Token Authentication** (24-hour expiration)
- **Rate Limiting** (100 requests/minute per IP)
- **Audit Logging** (every validation attempt logged)
- **Hardware Binding** (optional but recommended)
- **Webhook Signature Verification**
- **Database Encryption at Rest**

### Environment Variables (Production)

```bash
# Database
export DATABASE_URL="postgresql://user:pass@host/dbname"

# Security
export JWT_SECRET="your-secure-jwt-secret"
export ADMIN_TOKEN="your-admin-token"

# Webhooks
export STRIPE_WEBHOOK_SECRET="whsec_..."
export LEMONSQUEEZY_WEBHOOK_SECRET="..."

# CORS
export CORS_ORIGINS="https://app.quantumfalcon.com,https://quantumfalcon.com"

# Email
export SMTP_SERVER="smtp.gmail.com"
export SMTP_USER="..."
export SMTP_PASSWORD="..."
```

---

## 📊 Database Schema

### Licenses Table
```sql
CREATE TABLE licenses (
    id INTEGER PRIMARY KEY,
    license_key VARCHAR(500) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    tier VARCHAR(50) NOT NULL,
    created_at TIMESTAMP,
    expires_at TIMESTAMP,
    last_validated_at TIMESTAMP,
    hardware_id VARCHAR(255),
    is_floating BOOLEAN,
    is_active BOOLEAN,
    is_revoked BOOLEAN,
    payment_id VARCHAR(255),
    payment_provider VARCHAR(50),
    auto_renew BOOLEAN
);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY,
    license_key VARCHAR(500),
    user_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    success BOOLEAN NOT NULL,
    ip_address VARCHAR(50),
    hardware_id VARCHAR(255),
    error_message TEXT,
    timestamp TIMESTAMP
);
```

---

## 🧪 Testing

### Test License Generation
```python
from mhamp1_licenseauthority import generate_license, LicenseTier

license = generate_license(
    user_id="test@example.com",
    email="test@example.com",
    tier=LicenseTier.PRO,
    expires_days=30
)

print(f"License Key: {license['license_key']}")
print(f"Tier: {license['tier']}")
print(f"Expires: {license['expires_at']}")
```

### Test Validation
```python
from mhamp1_licenseauthority import validate_license

result = validate_license(
    license_key="YOUR_LICENSE_KEY",
    hardware_id="test-hardware-id"
)

print(f"Valid: {result['valid']}")
print(f"Tier: {result['tier']}")
print(f"Features: {result['features']}")
```

### Run Tests
```bash
pytest tests/
```

---

## 📈 Deployment

### Using Docker

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY . /app

RUN pip install -e .

# Generate master key on first run
RUN python -m mhamp1_licenseauthority.master_key_manager

EXPOSE 8000

CMD ["python", "-m", "mhamp1_licenseauthority.api"]
```

```bash
docker build -t license-authority:v2 .
docker run -p 8000:8000 -e DATABASE_URL="..." license-authority:v2
```

### Using Systemd

```ini
[Unit]
Description=License Authority v2 API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/license-authority
Environment="DATABASE_URL=postgresql://..."
Environment="JWT_SECRET=..."
ExecStart=/usr/bin/python3 -m mhamp1_licenseauthority.api
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## 📚 Documentation

### For Quantum Falcon Integration

Comprehensive documentation for integrating License Authority v2.0 into Quantum Falcon repositories:

- **[DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md)** - Start here! Complete guide to all documentation
- **[UPDATES_SUMMARY.md](UPDATES_SUMMARY.md)** - Quick reference of what changed (5 min read)
- **[MIGRATION_GUIDE_FOR_QUANTUM_FALCON.md](MIGRATION_GUIDE_FOR_QUANTUM_FALCON.md)** - Complete step-by-step migration guide
- **[QUICK_INTEGRATION_REFERENCE.md](QUICK_INTEGRATION_REFERENCE.md)** - Copy-paste ready code snippets
- **[README_FOR_QUANTUM_FALCON_REPOS.md](README_FOR_QUANTUM_FALCON_REPOS.md)** - User-facing documentation
- **[ARCHITECTURE_AND_FLOW.md](ARCHITECTURE_AND_FLOW.md)** - Visual architecture and flow diagrams
- **[TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md)** - Common issues and solutions

### Quick Links

- **Integration Files:** [integration/](integration/) directory
- **API Documentation:** http://localhost:8000/docs (when running)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)

---

## 📞 Support

**Author:** Matt  
**Email:** mhamp1trading@yahoo.com  
**Version:** 2.0.0  
**Release Date:** November 19, 2025

**Target Repositories:**
- https://github.com/mhamp1/quantum-falcon-cockp
- https://github.com/mhamp1/Quantum-Falcon

---

## 📝 License

This project is proprietary software for Quantum Falcon trading systems.

---

**The Falcon protects its own. 🦅**
