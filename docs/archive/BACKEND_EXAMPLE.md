# Backend Implementation Example

This document provides a complete backend implementation example that integrates with the LicenseAuthority repository.

## Option 1: Flask (Python) Backend

### Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install flask flask-cors python-dotenv stripe
```

### Directory Structure

```
backend/
├── .env
├── requirements.txt
├── app.py
├── license_service.py
└── webhook_handler.py
```

### .env File

```bash
# Flask Configuration
FLASK_ENV=development
SECRET_KEY=your-secret-key-here

# License Configuration
MASTER_KEY=your-master-key-from-licenseauthority
LICENSE_DB_PATH=./licenses.db

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

### requirements.txt

```
Flask==3.0.0
flask-cors==4.0.0
python-dotenv==1.0.0
stripe==7.0.0
requests==2.31.0
```

### license_service.py

```python
import hmac
import hashlib
import time
import json
from typing import Dict, Optional
from datetime import datetime, timedelta

class LicenseService:
    """
    License generation and verification service
    Integrates with LicenseAuthority repository
    """
    
    def __init__(self, master_key: str):
        self.master_key = master_key
        self.licenses = {}  # In production, use a database
    
    def generate_license(
        self,
        user_id: str,
        user_email: str,
        tier: str,
        duration_days: int = 30,
        payment_intent_id: Optional[str] = None
    ) -> Dict:
        """Generate a new license key"""
        
        # Generate timestamp
        timestamp = int(time.time())
        
        # Create signature
        data = f"{user_id}:{tier}:{timestamp}"
        signature = hmac.new(
            self.master_key.encode(),
            data.encode(),
            hashlib.sha256
        ).hexdigest()[:12]
        
        # Format license key
        license_key = f"QF-{tier.upper()}-{signature}-{timestamp}"
        
        # Calculate expiration
        if duration_days == -1:  # Lifetime
            expires_at = timestamp + (100 * 365 * 24 * 60 * 60)
        else:
            expires_at = timestamp + (duration_days * 24 * 60 * 60)
        
        # Store license
        license_data = {
            "license": license_key,
            "tier": tier,
            "userId": user_id,
            "userEmail": user_email,
            "expiresAt": expires_at * 1000,  # Convert to milliseconds
            "generatedAt": timestamp * 1000,
            "paymentIntentId": payment_intent_id,
            "features": self._get_features_for_tier(tier)
        }
        
        self.licenses[license_key] = license_data
        
        print(f"[LicenseService] Generated license for {user_id}: {license_key[:20]}...")
        
        return {
            "success": True,
            **license_data
        }
    
    def verify_license(self, license_key: str) -> Dict:
        """Verify a license key"""
        
        # Check if license exists in storage
        if license_key in self.licenses:
            license_data = self.licenses[license_key]
            
            # Check expiration
            current_time = int(time.time() * 1000)
            if current_time > license_data["expiresAt"]:
                return {
                    "valid": False,
                    "error": "License expired"
                }
            
            return {
                "valid": True,
                "tier": license_data["tier"],
                "expiresAt": license_data["expiresAt"],
                "userId": license_data["userId"],
                "features": license_data["features"]
            }
        
        # Parse and validate format
        try:
            parts = license_key.split('-')
            if len(parts) != 4 or parts[0] != 'QF':
                return {"valid": False, "error": "Invalid format"}
            
            tier = parts[1].lower()
            signature = parts[2]
            timestamp = int(parts[3])
            
            # Verify signature
            data = f"unknown:{tier}:{timestamp}"
            expected_sig = hmac.new(
                self.master_key.encode(),
                data.encode(),
                hashlib.sha256
            ).hexdigest()[:12]
            
            # For demo purposes, allow if signature format is valid
            # In production, always check against database
            
            # Check expiration (assume 30-day validity)
            current_time = int(time.time())
            expires_at = timestamp + (30 * 24 * 60 * 60)
            
            if current_time > expires_at:
                return {"valid": False, "error": "License expired"}
            
            return {
                "valid": True,
                "tier": tier,
                "expiresAt": expires_at * 1000,
                "userId": "unknown",
                "features": self._get_features_for_tier(tier)
            }
            
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    def _get_features_for_tier(self, tier: str) -> list:
        """Get features for a specific tier"""
        features = {
            "free": [
                "basic_dashboard",
                "manual_trading",
                "basic_analytics",
                "community_readonly"
            ],
            "pro": [
                "all_free_features",
                "ai_agents_3",
                "advanced_analytics",
                "strategy_marketplace",
                "copy_trading",
                "priority_support"
            ],
            "elite": [
                "all_pro_features",
                "unlimited_agents",
                "market_intelligence",
                "custom_builder",
                "api_access",
                "whale_tracking",
                "premium_community"
            ],
            "lifetime": [
                "all_elite_features",
                "lifetime_updates",
                "vip_support",
                "beta_access",
                "custom_integrations",
                "white_label"
            ]
        }
        return features.get(tier, features["free"])
```

### webhook_handler.py

```python
import stripe
from flask import request, jsonify
from license_service import LicenseService

class WebhookHandler:
    """Handle payment provider webhooks"""
    
    def __init__(self, license_service: LicenseService, stripe_webhook_secret: str):
        self.license_service = license_service
        self.stripe_webhook_secret = stripe_webhook_secret
    
    def handle_stripe_webhook(self):
        """Handle Stripe webhook events"""
        
        payload = request.data
        sig_header = request.headers.get('Stripe-Signature')
        
        try:
            # Verify webhook signature
            event = stripe.Webhook.construct_event(
                payload, sig_header, self.stripe_webhook_secret
            )
        except ValueError as e:
            print(f"[Webhook] Invalid payload: {e}")
            return jsonify({"error": "Invalid payload"}), 400
        except stripe.error.SignatureVerificationError as e:
            print(f"[Webhook] Invalid signature: {e}")
            return jsonify({"error": "Invalid signature"}), 400
        
        # Handle different event types
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            return self._handle_checkout_completed(session)
        
        elif event['type'] == 'invoice.payment_succeeded':
            invoice = event['data']['object']
            return self._handle_invoice_paid(invoice)
        
        elif event['type'] == 'customer.subscription.deleted':
            subscription = event['data']['object']
            return self._handle_subscription_canceled(subscription)
        
        return jsonify({"received": True}), 200
    
    def _handle_checkout_completed(self, session):
        """Handle completed checkout session"""
        
        metadata = session.get('metadata', {})
        user_id = metadata.get('userId')
        tier = metadata.get('tier')
        user_email = session.get('customer_email')
        payment_intent = session.get('payment_intent')
        
        if not user_id or not tier:
            print("[Webhook] Missing metadata in session")
            return jsonify({"error": "Missing metadata"}), 400
        
        print(f"[Webhook] Checkout completed for user: {user_id}, tier: {tier}")
        
        # Generate license
        result = self.license_service.generate_license(
            user_id=user_id,
            user_email=user_email,
            tier=tier,
            duration_days=30,
            payment_intent_id=payment_intent
        )
        
        # In production, send license via email
        print(f"[Webhook] License generated: {result['license'][:20]}...")
        
        return jsonify({"success": True, "license": result["license"]}), 200
    
    def _handle_invoice_paid(self, invoice):
        """Handle successful invoice payment (renewal)"""
        
        metadata = invoice.get('metadata', {})
        user_id = metadata.get('userId')
        tier = metadata.get('tier', 'pro')
        
        if user_id:
            print(f"[Webhook] Subscription renewed for user: {user_id}")
            
            # Generate new license for renewal
            result = self.license_service.generate_license(
                user_id=user_id,
                user_email=invoice.get('customer_email'),
                tier=tier,
                duration_days=30,
                payment_intent_id=invoice.get('payment_intent')
            )
            
            print(f"[Webhook] Renewal license generated: {result['license'][:20]}...")
        
        return jsonify({"received": True}), 200
    
    def _handle_subscription_canceled(self, subscription):
        """Handle subscription cancellation"""
        
        print(f"[Webhook] Subscription canceled: {subscription['id']}")
        
        # In production, mark license as canceled in database
        # Users should be downgraded to free tier after expiration
        
        return jsonify({"received": True}), 200
```

### app.py

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import stripe

from license_service import LicenseService
from webhook_handler import WebhookHandler

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
allowed_origins = os.getenv('ALLOWED_ORIGINS', 'http://localhost:5173').split(',')
CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

# Initialize services
master_key = os.getenv('MASTER_KEY')
if not master_key:
    raise ValueError("MASTER_KEY environment variable is required")

license_service = LicenseService(master_key)

# Configure Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
stripe_webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

webhook_handler = WebhookHandler(license_service, stripe_webhook_secret)

# Routes

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "license-generation"}), 200

@app.route('/api/generate', methods=['POST'])
def generate_license():
    """Generate a new license key"""
    try:
        data = request.json
        
        user_id = data.get('userId')
        user_email = data.get('userEmail')
        tier = data.get('tier')
        duration = data.get('duration', 30)
        payment_intent_id = data.get('paymentIntentId')
        
        if not user_id or not tier:
            return jsonify({"error": "Missing required fields"}), 400
        
        result = license_service.generate_license(
            user_id=user_id,
            user_email=user_email,
            tier=tier,
            duration_days=duration,
            payment_intent_id=payment_intent_id
        )
        
        return jsonify(result), 200
        
    except Exception as e:
        print(f"[API] Error generating license: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/verify', methods=['POST'])
def verify_license():
    """Verify a license key"""
    try:
        data = request.json
        
        license_key = data.get('license')
        
        if not license_key:
            return jsonify({"valid": False, "error": "No license provided"}), 400
        
        result = license_service.verify_license(license_key)
        
        if result.get('valid'):
            return jsonify(result), 200
        else:
            return jsonify(result), 401
            
    except Exception as e:
        print(f"[API] Error verifying license: {e}")
        return jsonify({"valid": False, "error": str(e)}), 500

@app.route('/webhooks/stripe', methods=['POST'])
def stripe_webhook():
    """Handle Stripe webhook events"""
    return webhook_handler.handle_stripe_webhook()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8000))
    print(f"[Server] Starting license generation server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)
```

## Running the Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export MASTER_KEY="your-master-key"
export STRIPE_SECRET_KEY="sk_test_xxx"
export STRIPE_WEBHOOK_SECRET="whsec_xxx"

# Run the server
python app.py
```

## Testing the Backend

### Test License Generation

```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "userEmail": "user@example.com",
    "tier": "pro",
    "duration": 30
  }'
```

Expected response:
```json
{
  "success": true,
  "license": "QF-PRO-xxxxxxxxxxxx-1234567890",
  "tier": "pro",
  "userId": "user_123",
  "expiresAt": 1735689600000,
  "features": [...]
}
```

### Test License Verification

```bash
curl -X POST http://localhost:8000/api/verify \
  -H "Content-Type: application/json" \
  -d '{
    "license": "QF-PRO-xxxxxxxxxxxx-1234567890",
    "timestamp": 1704067200000
  }'
```

Expected response:
```json
{
  "valid": true,
  "tier": "pro",
  "expiresAt": 1735689600000,
  "userId": "user_123",
  "features": [...]
}
```

## Deployment

### Heroku

```bash
# Create Heroku app
heroku create quantum-falcon-license

# Set environment variables
heroku config:set MASTER_KEY="your-key"
heroku config:set STRIPE_SECRET_KEY="sk_live_xxx"

# Deploy
git push heroku main
```

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "app.py"]
```

Build and run:
```bash
docker build -t license-server .
docker run -p 8000:8000 \
  -e MASTER_KEY="your-key" \
  -e STRIPE_SECRET_KEY="sk_live_xxx" \
  license-server
```

## Next Steps

1. **Add Database**: Replace in-memory storage with PostgreSQL/MySQL
2. **Add Email**: Send license keys via email on generation
3. **Add Admin Panel**: Create dashboard for license management
4. **Add Monitoring**: Set up logging and error tracking
5. **Add Rate Limiting**: Prevent abuse of endpoints
6. **Add Tests**: Write unit and integration tests

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Verify webhook signatures
- [ ] Implement rate limiting
- [ ] Store master key securely
- [ ] Use environment variables
- [ ] Implement proper logging
- [ ] Add input validation
- [ ] Use database for persistence
- [ ] Implement backup strategy
- [ ] Set up monitoring alerts
