# LicenseAuthority Integration Guide

## Overview

This guide explains how the Quantum Falcon Cockpit integrates with the [LicenseAuthority repository](https://github.com/mhamp1/LicenseAuthority) to automatically generate licenses when users request them.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  Quantum Falcon Cockpit (Frontend)              │
│                                                                  │
│  ┌──────────────────┐     ┌─────────────────┐                  │
│  │ SubscriptionTiers│────▶│ Payment Flow    │                  │
│  └──────────────────┘     └────────┬────────┘                  │
│                                     │                            │
│  ┌──────────────────┐              │                            │
│  │  LicenseAuth     │◀─────────────┘                            │
│  │  Component       │                                            │
│  └────────┬─────────┘                                            │
└───────────┼──────────────────────────────────────────────────────┘
            │
            │ HTTP/HTTPS
            ▼
┌─────────────────────────────────────────────────────────────────┐
│              License Generation Server (Backend)                │
│                                                                  │
│  ┌──────────────────┐     ┌─────────────────┐                  │
│  │ Payment Webhooks │────▶│ License Service │                  │
│  └──────────────────┘     └────────┬────────┘                  │
│                                     │                            │
│  ┌──────────────────┐              │                            │
│  │ LicenseAuthority │◀─────────────┘                            │
│  │ (Generator.py)   │                                            │
│  └──────────────────┘                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Integration Points

### 1. Environment Configuration

The integration requires specific environment variables to be set:

```bash
# .env file
VITE_LICENSE_API_ENDPOINT=https://your-license-server.com/api/verify
VITE_LICENSE_GENERATION_ENDPOINT=https://your-license-server.com/api/generate
VITE_LICENSE_AUTHORITY_REPO=https://github.com/mhamp1/LicenseAuthority

# Payment Configuration
VITE_STRIPE_PUBLIC_KEY=pk_live_your_key
VITE_STRIPE_SECRET_KEY=sk_live_your_key
VITE_PADDLE_VENDOR_ID=your_vendor_id

# Feature Flags
VITE_ENABLE_AUTO_LICENSE_GENERATION=true
VITE_ENABLE_PAYMENT_INTEGRATION=true
```

### 2. License Generation Flow

#### Automatic Generation After Payment

1. **User Selects Tier**: User clicks "Get License Key" button on subscription page
2. **Payment Process**: User is redirected to payment provider (Stripe/Paddle)
3. **Payment Complete**: Payment provider sends webhook to backend
4. **License Generation**: Backend calls LicenseAuthority API to generate license
5. **License Delivery**: License is automatically stored and user is notified

#### Manual License Request

1. **User Visits LicenseAuthority Repo**: User goes to https://github.com/mhamp1/LicenseAuthority
2. **Payment/Request**: User follows instructions to request/purchase license
3. **License Received**: User receives license key
4. **License Entry**: User enters license key in Quantum Falcon Cockpit
5. **Verification**: License is verified and features are unlocked

### 3. Time-Based License Renewal

Licenses are automatically checked for expiration:

```typescript
// Check if license needs renewal (7 days before expiration)
const needsRenewal = await checkNeedsRenewal(userId)

if (needsRenewal) {
  // Show renewal prompt
  // Generate new license automatically if subscription is active
}
```

Renewal happens automatically for:
- **Active Subscriptions**: License is auto-renewed when payment processes
- **Within Timeframe**: If user has valid subscription, renewal is automatic
- **Manual Renewal**: Users can manually request renewal through settings

### 4. License Tiers and Duration

| Tier      | Duration | Auto-Renewal | Price    |
|-----------|----------|--------------|----------|
| Free      | 30 days  | No           | $0       |
| Pro       | 30 days  | Yes          | $90/mo   |
| Elite     | 30 days  | Yes          | $145/mo  |
| Lifetime  | Lifetime | No           | $8,000   |

### 5. Payment Integration

#### Stripe Integration

```typescript
// Create checkout session
const session = await paymentProcessor.createStripeCheckout({
  tier: 'pro',
  price: 90,
  userId: user.id,
  userEmail: user.email,
  type: 'subscription'
})

// Handle webhook
webhook.on('checkout.session.completed', async (event) => {
  // Automatically generate license
  const license = await generateLicenseAfterPayment({
    userId: event.metadata.userId,
    tier: event.metadata.tier,
    // ...
  })
})
```

#### Paddle Integration

```typescript
// Create Paddle checkout
const checkout = await paymentProcessor.createPaddleCheckout({
  productId: 'pri_01pro789',
  userId: user.id,
  userEmail: user.email,
  type: 'subscription'
})

// Handle webhook
webhook.on('transaction.completed', async (event) => {
  // Automatically generate license
  const license = await generateLicenseAfterPayment({
    userId: event.custom_data.userId,
    tier: event.custom_data.tier,
    // ...
  })
})
```

## Implementation Files

### Frontend

1. **src/lib/licenseGeneration.ts**
   - Main service for license generation
   - Handles API communication with LicenseAuthority
   - Manages license storage and validation

2. **src/lib/license-auth.ts**
   - License verification service
   - Stores and retrieves licenses
   - Checks expiration and features

3. **src/lib/webhooks/paymentWebhooks.ts**
   - Webhook handlers for payment events
   - Triggers license generation on payment success
   - Handles URL redirect notifications

4. **src/lib/payment/paymentProcessor.ts**
   - Payment processing integration
   - Stripe and Paddle checkout
   - Payment completion handler

5. **src/components/auth/LicenseAuth.tsx**
   - License entry UI component
   - Links to LicenseAuthority repo
   - Verification flow

6. **src/components/settings/SubscriptionTiers.tsx**
   - Subscription plan selection
   - Payment initiation
   - License acquisition flow

### Backend Requirements

To complete the integration, you need a backend server with:

1. **License Generation API Endpoint**
   ```
   POST /api/generate
   
   Request:
   {
     "userId": "user_123",
     "userEmail": "user@example.com",
     "tier": "pro",
     "duration": 30,
     "paymentIntentId": "pi_xxx"
   }
   
   Response:
   {
     "success": true,
     "license": "QF-PRO-xxxxxxxxxxxx",
     "tier": "pro",
     "expiresAt": 1735689600000,
     "userId": "user_123"
   }
   ```

2. **License Verification API Endpoint**
   ```
   POST /api/verify
   
   Request:
   {
     "license": "QF-PRO-xxxxxxxxxxxx",
     "timestamp": 1704067200000,
     "origin": "quantum-falcon-cockpit"
   }
   
   Response:
   {
     "valid": true,
     "tier": "pro",
     "expiresAt": 1735689600000,
     "userId": "user_123",
     "features": [...]
   }
   ```

3. **Payment Webhook Endpoints**
   ```
   POST /webhooks/stripe
   POST /webhooks/paddle
   ```

## LicenseAuthority Repository Integration

Your LicenseAuthority repository should implement:

### 1. License Generator (generator.py)

```python
import hmac
import hashlib
import time
from typing import Dict, Optional

class LicenseGenerator:
    def __init__(self, master_key: str):
        self.master_key = master_key
    
    def generate_license(
        self,
        user_id: str,
        tier: str,
        duration_days: int = 30
    ) -> Dict[str, any]:
        """Generate a new license key"""
        
        # Generate license key
        timestamp = int(time.time())
        data = f"{user_id}:{tier}:{timestamp}"
        signature = hmac.new(
            self.master_key.encode(),
            data.encode(),
            hashlib.sha256
        ).hexdigest()[:12]
        
        license_key = f"QF-{tier.upper()}-{signature}-{timestamp}"
        
        # Calculate expiration
        if duration_days == -1:  # Lifetime
            expires_at = timestamp + (100 * 365 * 24 * 60 * 60)
        else:
            expires_at = timestamp + (duration_days * 24 * 60 * 60)
        
        return {
            "license": license_key,
            "tier": tier,
            "userId": user_id,
            "expiresAt": expires_at * 1000,  # Convert to milliseconds
            "generatedAt": timestamp * 1000
        }
    
    def verify_license(
        self,
        license_key: str
    ) -> Dict[str, any]:
        """Verify a license key"""
        
        try:
            # Parse license key
            parts = license_key.split('-')
            if len(parts) != 4 or parts[0] != 'QF':
                return {"valid": False, "error": "Invalid format"}
            
            tier = parts[1].lower()
            signature = parts[2]
            timestamp = int(parts[3])
            
            # Verify signature (simplified - should check against database)
            # In production, check database for valid licenses
            
            # Check expiration
            current_time = int(time.time())
            if current_time > timestamp + (30 * 24 * 60 * 60):  # Simplified
                return {"valid": False, "error": "License expired"}
            
            return {
                "valid": True,
                "tier": tier,
                "expiresAt": (timestamp + (30 * 24 * 60 * 60)) * 1000,
                "features": self.get_features_for_tier(tier)
            }
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    def get_features_for_tier(self, tier: str) -> list:
        """Get features for a specific tier"""
        features = {
            "free": ["basic_dashboard", "manual_trading"],
            "pro": ["basic_dashboard", "manual_trading", "ai_agents_3", "advanced_analytics"],
            "elite": ["all_features", "unlimited_agents", "premium_support"],
            "lifetime": ["all_features", "lifetime_updates", "vip_support"]
        }
        return features.get(tier, features["free"])
```

### 2. Flask API Server (api.py)

```python
from flask import Flask, request, jsonify
from license_generator import LicenseGenerator
import os

app = Flask(__name__)

# Load master key from environment
MASTER_KEY = os.getenv('MASTER_KEY')
generator = LicenseGenerator(MASTER_KEY)

@app.route('/api/generate', methods=['POST'])
def generate_license():
    """Generate a new license"""
    try:
        data = request.json
        user_id = data.get('userId')
        tier = data.get('tier')
        duration = data.get('duration', 30)
        
        if not user_id or not tier:
            return jsonify({"error": "Missing required fields"}), 400
        
        result = generator.generate_license(user_id, tier, duration)
        
        # Store in database
        # db.store_license(result)
        
        return jsonify({
            "success": True,
            **result
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/verify', methods=['POST'])
def verify_license():
    """Verify a license key"""
    try:
        data = request.json
        license_key = data.get('license')
        
        if not license_key:
            return jsonify({"valid": False, "error": "No license provided"}), 400
        
        result = generator.verify_license(license_key)
        
        if result.get('valid'):
            return jsonify(result)
        else:
            return jsonify(result), 401
    except Exception as e:
        return jsonify({"valid": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
```

## Testing

### 1. Test License Generation

```bash
# Test license generation endpoint
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_123",
    "tier": "pro",
    "duration": 30
  }'
```

### 2. Test License Verification

```bash
# Test verification endpoint
curl -X POST http://localhost:8000/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "license": "QF-PRO-xxxxxxxxxxxx",
    "timestamp": 1704067200000,
    "origin": "quantum-falcon-cockpit"
  }'
```

### 3. Test Payment Flow

1. Start the development server: `npm run dev`
2. Navigate to Settings → Subscription
3. Click "Get License Key" on any paid tier
4. Complete mock payment flow
5. Verify license is generated and stored

## Security Considerations

### 1. Master Key Protection

- **NEVER** commit the master key to the repository
- Store in environment variables only
- Use different keys for development and production
- Rotate keys periodically

### 2. API Security

- Use HTTPS for all API communication
- Implement rate limiting on endpoints
- Validate all input data
- Log all license generation attempts
- Implement webhook signature verification

### 3. License Storage

- Encrypt licenses before storing locally
- Never expose the master key to the client
- Implement server-side verification
- Use secure session management

## Deployment Checklist

- [ ] Set up license generation server
- [ ] Configure environment variables
- [ ] Set up payment provider webhooks
- [ ] Test license generation flow
- [ ] Test payment integration
- [ ] Verify webhook handling
- [ ] Test license renewal flow
- [ ] Set up monitoring and logging
- [ ] Configure SSL certificates
- [ ] Test end-to-end flow

## Support

For issues related to:
- **License Generation**: Check LicenseAuthority repository
- **Payment Processing**: Review payment provider documentation
- **Integration Issues**: Check this guide and implementation files
- **General Support**: Contact mhamp1trading@yahoo.com

## Changelog

- **v1.0** (2024-11-19): Initial integration implementation
  - Added license generation service
  - Integrated payment webhooks
  - Updated subscription components
  - Created comprehensive documentation
