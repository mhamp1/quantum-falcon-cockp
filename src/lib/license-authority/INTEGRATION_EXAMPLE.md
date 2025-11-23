# Integration Example: Quantum Falcon with License Authority v2.1

## Quick Copy-Paste Integration

### 1. Client-Side: Validate License with Device Binding

```typescript
// src/services/licenseService.ts
import { generateDeviceFingerprint } from './deviceFingerprint';

const API_URL = 'https://api.quantumfalcon.com';

export async function validateLicense(licenseKey: string) {
  try {
    // Generate device fingerprint
    const fingerprint = await generateDeviceFingerprint();
    
    // Validate with server
    const response = await fetch(`${API_URL}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key: licenseKey,
        hardware_id: fingerprint.fingerprint,
        device_fingerprint: fingerprint
      })
    });
    
    const result = await response.json();
    
    // Handle grace period
    if (result.is_grace_period) {
      showGracePeriodBanner(result.grace_period_banner);
    }
    
    // Auto-bind device on first validation
    if (result.valid && !result.device_bound) {
      await bindDevice(licenseKey, fingerprint);
    }
    
    return result;
  } catch (error) {
    console.error('License validation error:', error);
    return { valid: false, error: 'Validation failed' };
  }
}

async function bindDevice(licenseKey: string, fingerprint: any) {
  await fetch(`${API_URL}/bind-device`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      license_key: licenseKey,
      device_fingerprint: fingerprint
    })
  });
}

function showGracePeriodBanner(banner: any) {
  // Implement your UI banner
  console.warn('Grace period active:', banner);
}
```

### 2. Server-Side: Webhook Handler

```python
# your_app/webhooks.py
from flask import Flask, request, jsonify
import hmac
import hashlib

app = Flask(__name__)

@app.route('/webhook/stripe', methods=['POST'])
def stripe_webhook():
    # Verify signature
    signature = request.headers.get('Stripe-Signature')
    payload = request.data
    
    # Forward to License Authority
    response = requests.post(
        'https://license-api.quantumfalcon.com/webhook/stripe',
        headers={
            'Content-Type': 'application/json',
            'X-Signature': signature
        },
        data=payload
    )
    
    result = response.json()
    
    if result.get('action') == 'new_license':
        # Send email with deep link
        send_activation_email(
            email=result['user_email'],
            license_key=result['license_key'],
            deep_link=result['deep_link']
        )
    
    return jsonify(result)

def send_activation_email(email: str, license_key: str, deep_link: str):
    # Email template
    html = f"""
    <h1>Your Quantum Falcon License</h1>
    <p>Thank you for your purchase!</p>
    <p><strong>License Key:</strong> {license_key}</p>
    <p><a href="{deep_link}">Click here to activate instantly</a></p>
    <p>Or paste the deep link in your app: <code>{deep_link}</code></p>
    """
    
    # Send email (use your email service)
    # send_email(to=email, subject='Your License', html=html)
```

### 3. Desktop App: Deep Link Handler

```typescript
// Electron main.js
const { app, protocol } = require('electron');

// Register deep link protocol
app.setAsDefaultProtocolClient('quantumfalcon');

// Handle deep link activation
app.on('open-url', async (event, url) => {
  event.preventDefault();
  
  // Parse: quantumfalcon://activate?key=XXXX
  if (url.startsWith('quantumfalcon://activate')) {
    const urlObj = new URL(url);
    const licenseKey = urlObj.searchParams.get('key');
    
    if (licenseKey) {
      // Validate and activate
      const result = await validateLicense(licenseKey);
      
      if (result.valid) {
        // Store license
        await storeLicense(licenseKey);
        
        // Show success
        showNotification('License activated successfully!');
        
        // Open main window
        createWindow();
      } else {
        showError('Invalid license key');
      }
    }
  }
});
```

### 4. React Component: Grace Period Banner

```tsx
// src/components/GracePeriodBanner.tsx
import React from 'react';

interface GracePeriodBannerProps {
  banner: {
    show: boolean;
    title: string;
    message: string;
    cta_text: string;
    days_remaining: number;
    original_tier: string;
    current_tier: string;
  } | null;
}

export function GracePeriodBanner({ banner }: GracePeriodBannerProps) {
  if (!banner?.show) return null;
  
  return (
    <div className="grace-period-banner" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      marginBottom: '20px'
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>{banner.title}</h3>
      <p style={{ margin: '0 0 15px 0' }}>{banner.message}</p>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button
          onClick={() => window.location.href = '/upgrade'}
          style={{
            background: 'white',
            color: '#667eea',
            border: 'none',
            padding: '10px 30px',
            borderRadius: '5px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {banner.cta_text}
        </button>
        
        <div style={{ fontSize: '14px', opacity: 0.9 }}>
          Downgraded from <strong>{banner.original_tier}</strong> to <strong>{banner.current_tier}</strong>
          <br />
          {banner.days_remaining} days remaining
        </div>
      </div>
    </div>
  );
}

// Usage
import { useLicense } from './hooks/useLicense';

function App() {
  const { license } = useLicense();
  
  return (
    <div>
      <GracePeriodBanner banner={license.grace_period_banner} />
      {/* Rest of your app */}
    </div>
  );
}
```

### 5. Settings Page: Device Management

```tsx
// src/pages/Settings/LicenseTab.tsx
import React, { useEffect, useState } from 'react';

export function LicenseTab() {
  const [bindings, setBindings] = useState<any>(null);
  const licenseKey = localStorage.getItem('license_key');
  
  useEffect(() => {
    loadDeviceBindings();
  }, []);
  
  async function loadDeviceBindings() {
    const response = await fetch(
      `${API_URL}/device-bindings/${licenseKey}`
    );
    const data = await response.json();
    setBindings(data);
  }
  
  async function switchDevice() {
    if (!bindings.can_change_device) {
      alert(bindings.change_error);
      return;
    }
    
    const fingerprint = await generateDeviceFingerprint();
    
    const response = await fetch(`${API_URL}/bind-device`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key: licenseKey,
        device_fingerprint: fingerprint
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('Device switched successfully!');
      loadDeviceBindings();
    } else {
      alert(`Error: ${result.error}`);
    }
  }
  
  return (
    <div>
      <h2>Device Bindings</h2>
      
      {bindings?.bindings.map((binding: any) => (
        <div key={binding.id} style={{
          padding: '10px',
          margin: '10px 0',
          border: '1px solid #ddd',
          borderRadius: '5px',
          background: binding.is_active ? '#e8f5e9' : '#f5f5f5'
        }}>
          <div><strong>Device:</strong> {binding.device_fingerprint.substring(0, 16)}...</div>
          <div><strong>Status:</strong> {binding.is_active ? '🟢 Active' : '⚪ Inactive'}</div>
          <div><strong>Bound:</strong> {new Date(binding.bound_at).toLocaleDateString()}</div>
          {binding.unbound_at && (
            <div><strong>Unbound:</strong> {new Date(binding.unbound_at).toLocaleDateString()}</div>
          )}
        </div>
      ))}
      
      <button
        onClick={switchDevice}
        disabled={!bindings?.can_change_device}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          background: bindings?.can_change_device ? '#4CAF50' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: bindings?.can_change_device ? 'pointer' : 'not-allowed'
        }}
      >
        Switch to This Device
      </button>
      
      {!bindings?.can_change_device && (
        <p style={{ color: '#f44336', marginTop: '10px' }}>
          {bindings?.change_error}
        </p>
      )}
    </div>
  );
}
```

### 6. Payment Page Integration

```html
<!-- checkout.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Checkout</title>
  <script src="https://js.stripe.com/v3/"></script>
</head>
<body>
  <h1>Upgrade to Pro</h1>
  
  <button id="checkout-button">Purchase - $99/month</button>
  
  <script>
    const stripe = Stripe('pk_test_...');
    
    document.getElementById('checkout-button').addEventListener('click', async () => {
      // Create checkout session
      const response = await fetch('/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: 'pro',
          price_id: 'price_...'
        })
      });
      
      const session = await response.json();
      
      // Redirect to Stripe checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id
      });
      
      if (result.error) {
        alert(result.error.message);
      }
    });
  </script>
  
  <div class="info">
    <h3>✨ Instant Activation</h3>
    <p>After payment, you'll receive:</p>
    <ul>
      <li>📧 Email with license key</li>
      <li>🔗 Deep link for instant activation</li>
      <li>🔒 Automatic device binding</li>
    </ul>
  </div>
</body>
</html>
```

---

## Testing Locally

### 1. Start API Server
```bash
cd /path/to/LicenseAuthority
python -m mhamp1_licenseauthority.api
# Server runs at http://localhost:8000
```

### 2. Test Webhook (with curl)
```bash
# Simulate Stripe checkout.session.completed
curl -X POST http://localhost:8000/webhook/stripe \
  -H "Content-Type: application/json" \
  -d '{
    "type": "checkout.session.completed",
    "id": "cs_test_123",
    "customer_details": {
      "email": "test@example.com"
    },
    "metadata": {
      "tier": "pro"
    }
  }'
```

### 3. Test Device Binding
```bash
# Generate fingerprint (client-side would do this)
# For testing, use a simple string
curl -X POST http://localhost:8000/bind-device \
  -H "Content-Type: application/json" \
  -d '{
    "license_key": "YOUR_LICENSE_KEY",
    "canvas_hash": "test123",
    "webgl_hash": "test456",
    "fonts_hash": "test789",
    "user_agent": "Test Browser"
  }'
```

### 4. Test Validation with Grace Period
```bash
# Create expired license for testing
python -c "
from mhamp1_licenseauthority import generate_license, LicenseTier
result = generate_license(
    user_id='test@example.com',
    tier=LicenseTier.ELITE,
    expires_days=-3  # Expired 3 days ago
)
print(result['license_key'])
"

# Validate it
curl -X POST http://localhost:8000/validate \
  -H "Content-Type: application/json" \
  -d '{
    "license_key": "YOUR_EXPIRED_LICENSE_KEY"
  }'
```

---

## Production Checklist

- [ ] Configure webhook secrets in environment variables
- [ ] Set up Stripe/Lemon Squeezy webhook endpoints
- [ ] Configure deep link handler in your app
- [ ] Implement grace period banner UI
- [ ] Add device management to settings page
- [ ] Test complete flow: payment → webhook → email → deep link → activation
- [ ] Set up monitoring for webhook failures
- [ ] Configure email service for license delivery
- [ ] Test device binding and change limits
- [ ] Deploy API to production (with DATABASE_URL)

---

**Ready to dominate? 🦅**
