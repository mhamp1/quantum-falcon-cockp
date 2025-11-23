# Troubleshooting Guide
## License Authority v2.0 Integration Issues

**Last Updated:** November 20, 2025  
**Version:** 2.0.0

---

## 🔍 Common Issues & Solutions

### Issue 1: "Invalid License Key" Error

**Symptoms:**
- User enters license key, but validation fails
- Error message: "Invalid license key"
- License tab shows "Invalid" status

**Possible Causes:**
1. Typo in license key
2. License has been revoked
3. License has expired (> 7 days)
4. Database connection issue
5. Decryption failure

**Solutions:**

```bash
# 1. Verify license in database
python -m mhamp1_licenseauthority.cli list --user-id user@example.com

# 2. Check license status
python -m mhamp1_licenseauthority.cli validate --license-key YOUR_KEY

# 3. Check API logs
tail -f /var/log/license-authority/api.log

# 4. Test with a fresh license
python -m mhamp1_licenseauthority.cli generate \
  --user-id test@example.com \
  --tier pro \
  --expires-days 30
```

**Frontend Debugging:**
```javascript
// In browser console
localStorage.getItem('licenseData')

// Test API directly
fetch('http://localhost:8000/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    license_key: 'YOUR_KEY'
  })
}).then(r => r.json()).then(console.log);
```

---

### Issue 2: API Connection Errors

**Symptoms:**
- "Failed to connect to license server"
- Network errors in browser console
- Timeout errors

**Possible Causes:**
1. API server not running
2. Wrong API URL in environment variables
3. CORS configuration issue
4. Firewall blocking requests
5. SSL certificate issues

**Solutions:**

```bash
# 1. Check if API is running
curl http://localhost:8000/health

# 2. Check API logs
python -m mhamp1_licenseauthority.api
# Look for startup errors

# 3. Verify environment variables
echo $REACT_APP_LICENSE_API_URL

# 4. Test CORS
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS \
  http://localhost:8000/validate
```

**Fix CORS Issues:**
```bash
# Set CORS_ORIGINS environment variable
export CORS_ORIGINS="http://localhost:3000,http://localhost:3001"

# Or in .env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Restart API server
python -m mhamp1_licenseauthority.api
```

**Frontend Fix:**
```javascript
// Check your .env file
REACT_APP_LICENSE_API_URL=http://localhost:8000

// Verify in code
console.log(process.env.REACT_APP_LICENSE_API_URL);
```

---

### Issue 3: Features Not Unlocking After Activation

**Symptoms:**
- License activated successfully
- But premium features still locked
- Paywall still appears
- Tier shows as "free" instead of "pro"

**Possible Causes:**
1. localStorage not updated
2. Component not re-rendering
3. License context not refreshed
4. Tier check logic incorrect

**Solutions:**

```javascript
// 1. Force refresh license data
localStorage.removeItem('licenseData');
// Reload page

// 2. Check stored license data
const data = JSON.parse(localStorage.getItem('licenseData'));
console.log('Tier:', data.tier);
console.log('Valid:', data.valid);
console.log('Features:', data.features);

// 3. Test tier check manually
import { licenseService } from './services/licenseService';
console.log('Current tier:', licenseService.getTier());
console.log('Has momentum?', licenseService.hasStrategy('momentum'));
```

**Fix in AppIntegration.tsx:**
```tsx
// Ensure state updates after validation
const [licenseState, setLicenseState] = useState({});

const handleLicenseActivation = async (key) => {
  const result = await licenseService.validate(key);
  if (result.valid) {
    setLicenseState(result); // Force re-render
    localStorage.setItem('licenseData', JSON.stringify(result));
  }
};
```

---

### Issue 4: "Rate Limit Exceeded" Error

**Symptoms:**
- Error: "Rate limit exceeded"
- 429 Too Many Requests response
- Validation fails after multiple attempts

**Possible Causes:**
1. Too many validation requests from same IP
2. Automated script hitting API
3. Multiple users behind same NAT

**Solutions:**

```bash
# 1. Wait 1 minute and retry
# Rate limit resets every minute

# 2. Check current rate limit status (admin only)
curl -H "X-Admin-Token: YOUR_TOKEN" \
  http://localhost:8000/rate-limit-status

# 3. Increase rate limit (if needed)
# In api.py, modify:
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per minute"]  # Increase from 100
)
```

**Frontend Caching:**
```typescript
// Cache validation results
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function validateWithCache(key: string) {
  const cached = sessionStorage.getItem(`license_${key}`);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return Promise.resolve(data);
    }
  }
  
  return licenseService.validate(key).then(result => {
    sessionStorage.setItem(`license_${key}`, JSON.stringify({
      data: result,
      timestamp: Date.now()
    }));
    return result;
  });
}
```

---

### Issue 5: Grace Period Not Working

**Symptoms:**
- License expired but no grace period
- Immediately restricted to free tier
- Should have 7 days grace period

**Possible Causes:**
1. Grace period disabled in settings
2. License has been expired > 7 days
3. Database issue with expiry dates
4. Tier downgrade logic not implemented

**Solutions:**

```bash
# 1. Check license expiry in database
python -m mhamp1_licenseauthority.cli list --user-id user@example.com
# Look at expires_at field

# 2. Verify grace period logic
python -c "
from datetime import datetime, timedelta
from mhamp1_licenseauthority.validation_service import validate_license

result = validate_license('YOUR_KEY')
print('Is grace period?', result.get('is_grace_period'))
print('Expires at:', result.get('expires_at'))
"

# 3. Test with recently expired license
python -m mhamp1_licenseauthority.cli generate \
  --user-id test@example.com \
  --tier pro \
  --expires-days -2  # Expired 2 days ago
```

**Frontend Check:**
```javascript
const licenseData = JSON.parse(localStorage.getItem('licenseData'));
console.log('Is grace period?', licenseData.is_grace_period);

// Calculate days since expiry
const expiresAt = new Date(licenseData.expires_at * 1000);
const now = new Date();
const daysSinceExpiry = Math.floor((now - expiresAt) / (1000 * 60 * 60 * 24));
console.log('Days since expiry:', daysSinceExpiry);
// Should be <= 7 for grace period
```

---

### Issue 6: Paywall Component Not Showing

**Symptoms:**
- Premium features accessible without proper tier
- No upgrade prompt appears
- Feature gating not working

**Possible Causes:**
1. Paywall component not imported
2. requiredTier prop incorrect
3. License context not available
4. Component wrapped incorrectly

**Solutions:**

```tsx
// 1. Verify Paywall import
import { Paywall } from './components/AppIntegration';

// 2. Check usage
<Paywall requiredTier="pro">  {/* Not "Pro" - must be lowercase */}
  <PremiumFeature />
</Paywall>

// 3. Verify tier hierarchy in useLicense hook
const TIER_HIERARCHY = {
  free: 0,
  pro: 1,
  elite: 2,
  lifetime: 3,
  enterprise: 4,
  white_label: 5
};

// 4. Debug in browser console
import { useLicense } from './components/AppIntegration';
const { tier } = useLicense();
console.log('Current tier:', tier);
console.log('Required tier:', 'pro');
console.log('Can access?', TIER_HIERARCHY[tier] >= TIER_HIERARCHY['pro']);
```

**Common Mistakes:**
```tsx
// ❌ WRONG - tier in uppercase
<Paywall requiredTier="PRO">

// ❌ WRONG - not wrapped in AppWithLicenseIntegration
<App>
  <Paywall> {/* License context not available */}
  
// ✅ CORRECT
<AppWithLicenseIntegration>
  <App>
    <Paywall requiredTier="pro">
```

---

### Issue 7: Renewal Reminders Not Sending

**Symptoms:**
- No email reminders before expiry
- Users complaining about unexpected expiry
- Email service not working

**Possible Causes:**
1. Renewal service not running
2. SMTP credentials incorrect
3. Email addresses missing in database
4. Cron job not configured
5. Email service blocked by firewall

**Solutions:**

```bash
# 1. Test renewal service manually
python -m mhamp1_licenseauthority.renewal_service

# 2. Check SMTP configuration
echo $SMTP_SERVER
echo $SMTP_PORT
echo $SMTP_USER
# Should not be empty

# 3. Test email sending
python -c "
import smtplib
from email.mime.text import MIMEText

msg = MIMEText('Test email')
msg['Subject'] = 'Test'
msg['From'] = 'noreply@quantumfalcon.com'
msg['To'] = 'test@example.com'

with smtplib.SMTP('smtp.gmail.com', 587) as smtp:
    smtp.starttls()
    smtp.login('your-email@gmail.com', 'your-password')
    smtp.send_message(msg)
    print('Email sent successfully!')
"

# 4. Check cron job
crontab -l | grep renewal_service
# Should see: 0 */6 * * * python -m mhamp1_licenseauthority.renewal_service

# 5. Add cron job if missing
(crontab -l 2>/dev/null; echo "0 */6 * * * python -m mhamp1_licenseauthority.renewal_service") | crontab -
```

**Email Service Alternatives:**
```bash
# For Gmail - Use App Password (not regular password)
# 1. Go to https://myaccount.google.com/apppasswords
# 2. Generate app password
# 3. Use in SMTP_PASSWORD

# For SendGrid
export SMTP_SERVER="smtp.sendgrid.net"
export SMTP_PORT="587"
export SMTP_USER="apikey"
export SMTP_PASSWORD="your-sendgrid-api-key"

# For Mailgun
export SMTP_SERVER="smtp.mailgun.org"
export SMTP_PORT="587"
export SMTP_USER="postmaster@your-domain.mailgun.org"
export SMTP_PASSWORD="your-mailgun-password"
```

---

### Issue 8: Hardware Binding Issues

**Symptoms:**
- "License already activated on another device"
- Can't activate on new device
- Hardware ID mismatch

**Possible Causes:**
1. License bound to old device
2. Hardware fingerprint changed
3. Multiple devices not allowed
4. Database not updated

**Solutions:**

```bash
# 1. Check current hardware binding
python -m mhamp1_licenseauthority.cli list --license-key YOUR_KEY
# Look at hardware_id field

# 2. Reset hardware binding (admin only)
python -m mhamp1_licenseauthority.cli reset-hardware \
  --license-key YOUR_KEY

# 3. Generate floating license (not hardware-bound)
python -m mhamp1_licenseauthority.cli generate \
  --user-id user@example.com \
  --tier pro \
  --floating

# 4. Disable hardware binding (if needed)
# In licenseService.ts, comment out hardwareId parameter
const result = await fetch('/validate', {
  body: JSON.stringify({
    license_key: key,
    // hardware_id: hardwareId  // Disabled
  })
});
```

**Get Hardware ID:**
```javascript
// In browser console
import { licenseService } from './services/licenseService';
const hwid = await licenseService.generateHardwareId();
console.log('Hardware ID:', hwid);
```

---

### Issue 9: Database Connection Errors

**Symptoms:**
- "Database connection failed"
- SQLAlchemy errors
- Validation returns 500 errors

**Possible Causes:**
1. PostgreSQL not running
2. DATABASE_URL incorrect
3. Database not initialized
4. Connection pool exhausted

**Solutions:**

```bash
# 1. Check PostgreSQL status
sudo systemctl status postgresql
# or
pg_isready

# 2. Verify DATABASE_URL
echo $DATABASE_URL
# Should be: postgresql://user:pass@host:port/dbname

# 3. Initialize database
python -m mhamp1_licenseauthority.cli init

# 4. Test connection
python -c "
from sqlalchemy import create_engine
import os

engine = create_engine(os.getenv('DATABASE_URL'))
with engine.connect() as conn:
    print('Database connection successful!')
"

# 5. Check database tables
psql $DATABASE_URL -c "\dt"
# Should see: licenses, tiers, audit_logs

# 6. Recreate tables if missing
python -c "
from mhamp1_licenseauthority.database import Base, engine
Base.metadata.create_all(bind=engine)
print('Tables created!')
"
```

**SQLite Alternative (Development Only):**
```bash
# Use SQLite for local testing
export DATABASE_URL="sqlite:///./licenses.db"
python -m mhamp1_licenseauthority.cli init
```

---

### Issue 10: JWT Token Expired

**Symptoms:**
- "Token expired" error
- Need to re-validate frequently
- Features locked after some time

**Possible Causes:**
1. JWT token expired (> 24 hours)
2. Token not refreshed
3. System clock incorrect

**Solutions:**

```bash
# 1. Check JWT expiration
python -c "
import jwt
import os

token = 'YOUR_JWT_TOKEN'
secret = os.getenv('JWT_SECRET', 'dev-secret-key')

try:
    decoded = jwt.decode(token, secret, algorithms=['HS256'])
    print('Token valid!')
    print('Expires at:', decoded['exp'])
except jwt.ExpiredSignatureError:
    print('Token expired!')
except Exception as e:
    print('Error:', e)
"

# 2. Verify system time
date
# Should match actual time

# 3. Increase token expiration (if needed)
# In api.py:
expire = datetime.utcnow() + timedelta(hours=48)  # Increase from 24
```

**Frontend Auto-Refresh:**
```typescript
// Add token refresh logic
useEffect(() => {
  const refreshInterval = setInterval(async () => {
    const licenseData = JSON.parse(localStorage.getItem('licenseData'));
    if (licenseData && licenseData.license_key) {
      // Re-validate to get new token
      await licenseService.validate(licenseData.license_key);
    }
  }, 20 * 60 * 60 * 1000); // Every 20 hours
  
  return () => clearInterval(refreshInterval);
}, []);
```

---

## 🔧 Debugging Tools

### Enable Debug Logging

```bash
# Backend
export LOG_LEVEL=DEBUG
python -m mhamp1_licenseauthority.api

# View logs
tail -f /var/log/license-authority/api.log
```

### Browser DevTools

```javascript
// In browser console

// 1. Check license data
console.log('License:', localStorage.getItem('licenseData'));

// 2. Test API directly
fetch('http://localhost:8000/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ license_key: 'YOUR_KEY' })
}).then(r => r.json()).then(console.log);

// 3. Clear all license data
localStorage.removeItem('licenseData');
sessionStorage.clear();

// 4. Check network requests
// DevTools → Network tab → Filter by "validate"
```

### API Testing

```bash
# Health check
curl http://localhost:8000/health

# Validate license
curl -X POST http://localhost:8000/validate \
  -H "Content-Type: application/json" \
  -d '{"license_key":"YOUR_KEY"}'

# Get tiers
curl http://localhost:8000/tiers

# View audit logs (admin only)
curl -H "X-Admin-Token: YOUR_TOKEN" \
  http://localhost:8000/audit-logs
```

---

## 📞 Getting Help

### Before Contacting Support

1. Check this troubleshooting guide
2. Review API logs
3. Test with a fresh license
4. Clear browser cache and localStorage
5. Try different browser/device

### Support Channels

- **Email:** mhamp1trading@yahoo.com
- **GitHub Issues:** https://github.com/mhamp1/LicenseAuthority/issues
- **Documentation:** https://github.com/mhamp1/LicenseAuthority

### Include in Support Request

```
1. License Authority version: 2.0.0
2. Error message (exact text)
3. Steps to reproduce
4. Browser/OS information
5. API logs (if available)
6. Network tab screenshot
7. Console errors
```

---

## 📋 Quick Diagnostic Checklist

Run through this checklist before debugging:

### Backend
- [ ] API server running (`curl http://localhost:8000/health`)
- [ ] Database connected
- [ ] Environment variables set
- [ ] Master key initialized
- [ ] CORS configured correctly
- [ ] No errors in API logs

### Frontend
- [ ] `jwt-decode` package installed
- [ ] Integration files copied
- [ ] Environment variable set (`REACT_APP_LICENSE_API_URL`)
- [ ] App wrapped with `AppWithLicenseIntegration`
- [ ] No errors in browser console
- [ ] Network requests successful

### License
- [ ] License key valid
- [ ] Not expired (or in grace period)
- [ ] Not revoked
- [ ] Tier correct
- [ ] Hardware binding (if enabled) matches

---

## 🎯 Common Mistakes

### ❌ Don't Do This

```tsx
// Wrong tier name (uppercase)
<Paywall requiredTier="PRO">

// Missing wrapper
<App><Paywall></App>

// Hardcoded API URL
const API_URL = "http://localhost:8000"; // Use env var

// No error handling
await fetch('/validate'); // Can throw

// Storing license key in code
const LICENSE = "ABC-123-XYZ"; // Security risk
```

### ✅ Do This Instead

```tsx
// Correct tier name (lowercase)
<Paywall requiredTier="pro">

// Proper wrapper
<AppWithLicenseIntegration><App></AppWithLicenseIntegration>

// Use environment variable
const API_URL = process.env.REACT_APP_LICENSE_API_URL;

// With error handling
try {
  await fetch('/validate');
} catch (error) {
  console.error('Validation failed:', error);
}

// Store in localStorage only after validation
localStorage.setItem('licenseData', JSON.stringify(data));
```

---

**Still having issues? Contact support: mhamp1trading@yahoo.com**

**The Falcon protects its own. 🦅**
