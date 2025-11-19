# License Integration with LicenseAuthority

## Quick Start

This repository is now integrated with the [LicenseAuthority repository](https://github.com/mhamp1/LicenseAuthority) for automatic license generation when users request licenses.

### For Users

1. **Get a License Key**:
   - Visit the [LicenseAuthority repository](https://github.com/mhamp1/LicenseAuthority)
   - Follow the instructions to request or purchase a license
   - Or use the "Get License Key" button in the app

2. **Enter Your License**:
   - Open Quantum Falcon Cockpit
   - Enter your license key in the authentication screen
   - All features will be unlocked automatically based on your tier

3. **Automatic Renewal** (for subscriptions):
   - Pro and Elite subscriptions auto-renew monthly
   - Licenses are regenerated automatically on payment
   - You'll be notified 7 days before expiration

### For Developers

#### Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Configure the required variables:
   ```bash
   # License Authority Integration
   VITE_LICENSE_API_ENDPOINT=https://your-server.com/api/verify
   VITE_LICENSE_GENERATION_ENDPOINT=https://your-server.com/api/generate
   VITE_LICENSE_AUTHORITY_REPO=https://github.com/mhamp1/LicenseAuthority
   
   # Payment Integration
   VITE_STRIPE_PUBLIC_KEY=pk_live_xxx
   VITE_PADDLE_VENDOR_ID=xxx
   
   # Feature Flags
   VITE_ENABLE_AUTO_LICENSE_GENERATION=true
   ```

#### Backend Setup

You need a backend server to handle license generation. See `LICENSE_AUTHORITY_INTEGRATION_GUIDE.md` for complete implementation details.

**Minimum Requirements**:
1. License generation endpoint (`POST /api/generate`)
2. License verification endpoint (`POST /api/verify`)
3. Payment webhook handlers (Stripe/Paddle)

**Quick Backend Setup** (Python/Flask):
```python
# Install dependencies
pip install flask hmac hashlib

# Create api.py (see LICENSE_AUTHORITY_INTEGRATION_GUIDE.md)
# Run server
python api.py
```

## How It Works

### Payment → License Flow

```
User selects tier
      ↓
Payment processed (Stripe/Paddle)
      ↓
Webhook received by backend
      ↓
License generated via LicenseAuthority
      ↓
License stored and user notified
      ↓
Features unlocked automatically
```

### Architecture

```
┌──────────────────────┐
│  Quantum Falcon UI   │
│  (This Repo)         │
└──────────┬───────────┘
           │
           │ HTTP/HTTPS
           ↓
┌──────────────────────┐
│  License Server      │
│  (Your Backend)      │
└──────────┬───────────┘
           │
           │ Uses
           ↓
┌──────────────────────┐
│  LicenseAuthority    │
│  (Generator Repo)    │
└──────────────────────┘
```

## Key Features

✅ **Automatic License Generation**
- Licenses are generated automatically when payment completes
- No manual intervention required

✅ **Time-Based Subscriptions**
- Monthly subscriptions auto-renew
- License regenerated on each renewal
- Expiration reminders 7 days before

✅ **Secure Verification**
- All license verification happens server-side
- Master key never exposed to client
- Encrypted local storage

✅ **Payment Integration**
- Supports Stripe and Paddle
- Webhook-based automation
- Handles subscription lifecycles

✅ **User Experience**
- One-click license acquisition
- Automatic feature unlocking
- Clear renewal notifications

## Subscription Tiers

| Tier     | Duration | Price    | Auto-Renewal |
|----------|----------|----------|--------------|
| Free     | 30 days  | $0       | No           |
| Pro      | 30 days  | $90/mo   | Yes          |
| Elite    | 30 days  | $145/mo  | Yes          |
| Lifetime | Forever  | $8,000   | No           |

## Testing

### Test the Integration

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Test license entry**:
   - Navigate to the license screen
   - Enter a test license key
   - Verify features unlock

3. **Test payment flow** (requires backend):
   - Go to Settings → Subscription
   - Click "Get License Key"
   - Complete test payment
   - Verify license is generated

### Mock Payment Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Security

### Best Practices

✅ **DO**:
- Store master key in environment variables only
- Use HTTPS for all API communication
- Validate webhook signatures
- Implement rate limiting
- Encrypt license data locally

❌ **DON'T**:
- Commit master key to repository
- Expose master key in client code
- Skip server-side verification
- Trust client-side validation alone

## Troubleshooting

### License Not Generating

**Check**:
1. Backend server is running
2. Environment variables are set correctly
3. Webhook endpoints are configured
4. Payment provider webhooks are active

**Debug**:
```bash
# Check backend logs
tail -f api.log

# Test license generation endpoint
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","tier":"pro","duration":30}'
```

### License Not Verifying

**Check**:
1. License format is correct
2. License hasn't expired
3. Verification endpoint is accessible
4. User has network connection

**Debug**:
```javascript
// Check stored license
const license = localStorage.getItem('qf_license')
console.log(JSON.parse(atob(license)))

// Test verification
import { verifyAndStoreLicense } from '@/lib/license-auth'
const result = await verifyAndStoreLicense('QF-PRO-xxx')
console.log(result)
```

## Documentation

- **Complete Integration Guide**: See `LICENSE_AUTHORITY_INTEGRATION_GUIDE.md`
- **Payment API**: See `BACKEND_PAYMENT_API.md`
- **API Integration**: See `API_INTEGRATION.md`
- **LicenseAuthority Repo**: https://github.com/mhamp1/LicenseAuthority

## Support

For help with:
- **License Generation**: Check LicenseAuthority repository
- **Payment Issues**: Review payment provider docs
- **Integration Help**: See `LICENSE_AUTHORITY_INTEGRATION_GUIDE.md`
- **General Support**: Contact mhamp1trading@yahoo.com

## Changelog

### v2025.1.1 (2024-11-19)
- ✅ Added automatic license generation integration
- ✅ Integrated payment webhooks
- ✅ Added environment configuration
- ✅ Updated subscription components
- ✅ Created comprehensive documentation
- ✅ Added payment success redirect handling

### v2025.1.0 (2024-11-18)
- Initial production release

## Contributing

When contributing to the license integration:

1. **Never commit sensitive data** (keys, secrets, etc.)
2. **Test thoroughly** before submitting
3. **Update documentation** if changing behavior
4. **Follow security best practices**

## License

This software requires a valid license key from the LicenseAuthority repository to use paid features.

---

**Ready to get started?** Visit https://github.com/mhamp1/LicenseAuthority to request your license!
