# 🔧 Backend API Example - License Verification Server

**⚠️ IMPORTANT**: This code should be deployed on a SECURE backend server, NOT in this repository.

This example shows how to create a secure license verification API that integrates with your LicenseAuthority `generator.py`.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Quantum Falcon Cockpit (Frontend)             │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS Request
                         │ POST /api/verify
                         │ { "license": "QF-XXX-..." }
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Flask API Server (Backend)                 │
│                                                          │
│  • Receives license key                                 │
│  • Queries license database                             │
│  • Validates with master key                            │
│  • Returns: tier, expiration, features                  │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              PostgreSQL Database                        │
│                                                          │
│  licenses table:                                        │
│  - license_key (encrypted)                              │
│  - user_id                                              │
│  - tier (free/pro/elite/lifetime)                       │
│  - expires_at (timestamp)                               │
│  - created_at                                           │
│  - active (boolean)                                     │
└─────────────────────────────────────────────────────────┘
```

---

## Python Flask API Server

### File: `license_api.py`

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import hmac
import hashlib
import time
import psycopg2
from datetime import datetime, timedelta
import logging

app = Flask(__name__)
CORS(app, origins=["https://your-quantum-falcon-domain.com"])

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per hour"]
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Master key from environment variable (NEVER hardcode)
MASTER_KEY = os.environ.get('MASTER_KEY')
if not MASTER_KEY:
    raise RuntimeError("MASTER_KEY environment variable not set")

# Database connection
DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL environment variable not set")

def get_db_connection():
    """Create database connection."""
    return psycopg2.connect(DATABASE_URL)

def verify_license_signature(license_key, master_key):
    """
    Verify license key signature using master key.
    
    This should match the signature algorithm used in your generator.py
    """
    try:
        # Parse license key format: QF-TIER-SIGNATURE-TIMESTAMP
        parts = license_key.split('-')
        if len(parts) != 4:
            return False
        
        prefix, tier, signature, timestamp = parts
        
        if prefix != 'QF':
            return False
        
        # Reconstruct data that was signed
        data_to_verify = f"{prefix}-{tier}-{timestamp}"
        
        # Generate expected signature
        expected_signature = hmac.new(
            master_key.encode(),
            data_to_verify.encode(),
            hashlib.sha256
        ).hexdigest()[:16]
        
        return signature == expected_signature
    except Exception as e:
        logger.error(f"Signature verification error: {e}")
        return False

def get_license_from_database(license_key):
    """
    Query database for license information.
    
    Returns license data if found and active, None otherwise.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute("""
            SELECT user_id, tier, expires_at, active, features
            FROM licenses
            WHERE license_key = %s AND active = TRUE
        """, (license_key,))
        
        result = cur.fetchone()
        cur.close()
        conn.close()
        
        if result:
            user_id, tier, expires_at, active, features = result
            return {
                'user_id': user_id,
                'tier': tier,
                'expires_at': int(expires_at.timestamp() * 1000),
                'active': active,
                'features': features or []
            }
        
        return None
    except Exception as e:
        logger.error(f"Database error: {e}")
        return None

def get_tier_features(tier):
    """Return feature list for a given tier."""
    features = {
        'free': [
            'basic_dashboard',
            'manual_trading',
            'basic_analytics',
            'community_read'
        ],
        'pro': [
            'basic_dashboard',
            'manual_trading',
            'basic_analytics',
            'community_read',
            'ai_agents_3',
            'advanced_analytics',
            'strategy_marketplace',
            'copy_trading',
            'priority_support'
        ],
        'elite': [
            'basic_dashboard',
            'manual_trading',
            'basic_analytics',
            'community_read',
            'ai_agents_unlimited',
            'advanced_analytics',
            'strategy_marketplace',
            'copy_trading',
            'priority_support',
            'market_intelligence',
            'custom_strategies',
            'api_access',
            'whale_tracking',
            'premium_community'
        ],
        'lifetime': [
            'basic_dashboard',
            'manual_trading',
            'basic_analytics',
            'community_read',
            'ai_agents_unlimited',
            'advanced_analytics',
            'strategy_marketplace',
            'copy_trading',
            'priority_support',
            'market_intelligence',
            'custom_strategies',
            'api_access',
            'whale_tracking',
            'premium_community',
            'lifetime_updates',
            'vip_support',
            'beta_access',
            'custom_integrations',
            'white_label'
        ]
    }
    return features.get(tier, features['free'])

@app.route('/api/verify', methods=['POST'])
@limiter.limit("10 per minute")
def verify_license():
    """
    Verify a license key.
    
    Request body:
    {
        "license": "QF-PRO-a1b2c3d4e5f6-1234567890",
        "timestamp": 1234567890000,
        "origin": "quantum-falcon-cockpit"
    }
    
    Response (success):
    {
        "valid": true,
        "tier": "pro",
        "expiresAt": 1234567890000,
        "userId": "user_abc123",
        "features": ["ai_agents_3", "advanced_analytics", ...]
    }
    
    Response (failure):
    {
        "valid": false,
        "error": "Invalid license"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'license' not in data:
            return jsonify({
                'valid': False,
                'error': 'Missing license key'
            }), 400
        
        license_key = data['license']
        origin = data.get('origin', 'unknown')
        
        # Log verification attempt
        logger.info(f"License verification attempt from {origin}: {license_key[:10]}...")
        
        # Step 1: Verify signature with master key
        if not verify_license_signature(license_key, MASTER_KEY):
            logger.warning(f"Invalid signature for license: {license_key[:10]}...")
            return jsonify({
                'valid': False,
                'error': 'Invalid license signature'
            }), 401
        
        # Step 2: Query database
        license_data = get_license_from_database(license_key)
        
        if not license_data:
            logger.warning(f"License not found in database: {license_key[:10]}...")
            return jsonify({
                'valid': False,
                'error': 'License not found'
            }), 401
        
        # Step 3: Check expiration
        if license_data['expires_at'] < int(time.time() * 1000):
            logger.warning(f"Expired license: {license_key[:10]}...")
            return jsonify({
                'valid': False,
                'error': 'License expired'
            }), 401
        
        # Success - return license data
        logger.info(f"Valid license verified: {license_key[:10]}... (tier: {license_data['tier']})")
        
        return jsonify({
            'valid': True,
            'tier': license_data['tier'],
            'expiresAt': license_data['expires_at'],
            'userId': license_data['user_id'],
            'features': get_tier_features(license_data['tier'])
        }), 200
        
    except Exception as e:
        logger.error(f"Error verifying license: {e}")
        return jsonify({
            'valid': False,
            'error': 'Internal server error'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'ok', 'timestamp': int(time.time() * 1000)})

if __name__ == '__main__':
    # For development only - use gunicorn in production
    app.run(host='0.0.0.0', port=5000, debug=False)
```

---

## Database Schema

### PostgreSQL Table

```sql
-- Create licenses table
CREATE TABLE licenses (
    id SERIAL PRIMARY KEY,
    license_key VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    tier VARCHAR(20) NOT NULL CHECK (tier IN ('free', 'pro', 'elite', 'lifetime')),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    features TEXT[],
    metadata JSONB
);

-- Create index for fast lookups
CREATE INDEX idx_license_key ON licenses(license_key);
CREATE INDEX idx_user_id ON licenses(user_id);
CREATE INDEX idx_expires_at ON licenses(expires_at);

-- Create audit log table
CREATE TABLE license_verifications (
    id SERIAL PRIMARY KEY,
    license_key VARCHAR(255) NOT NULL,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    origin VARCHAR(255),
    result VARCHAR(20),
    error_message TEXT
);

CREATE INDEX idx_license_verifications_key ON license_verifications(license_key);
CREATE INDEX idx_license_verifications_time ON license_verifications(verified_at);
```

---

## Integration with generator.py

Your existing `generator.py` from LicenseAuthority should:

1. Generate license keys with signature
2. Insert them into the database
3. Use the same master key

### Example: Modified generator.py snippet

```python
import hmac
import hashlib
import time
import psycopg2
from datetime import datetime, timedelta

MASTER_KEY = "XoYgqu2wJYVZVg5AdWO9NqhKM52qXQ_ob9oeWMVeYhw="
DATABASE_URL = "postgresql://..."

def generate_license(user_id, email, tier, duration_days=30):
    """
    Generate a new license key.
    
    Args:
        user_id: Unique user identifier
        email: User email
        tier: 'free', 'pro', 'elite', or 'lifetime'
        duration_days: License duration (999999 for lifetime)
    
    Returns:
        license_key: Generated license key
    """
    timestamp = int(time.time())
    
    # Create data to sign
    data_to_sign = f"QF-{tier.upper()}-{timestamp}"
    
    # Generate signature
    signature = hmac.new(
        MASTER_KEY.encode(),
        data_to_sign.encode(),
        hashlib.sha256
    ).hexdigest()[:16]
    
    # Construct license key
    license_key = f"QF-{tier.upper()}-{signature}-{timestamp}"
    
    # Calculate expiration
    if tier == 'lifetime':
        expires_at = datetime.now() + timedelta(days=999999)
    else:
        expires_at = datetime.now() + timedelta(days=duration_days)
    
    # Insert into database
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    cur.execute("""
        INSERT INTO licenses (license_key, user_id, email, tier, expires_at)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
    """, (license_key, user_id, email, tier, expires_at))
    
    license_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    
    print(f"Generated license: {license_key}")
    print(f"User: {user_id} ({email})")
    print(f"Tier: {tier}")
    print(f"Expires: {expires_at}")
    
    return license_key

# Example usage
if __name__ == "__main__":
    # Generate Pro license
    license = generate_license(
        user_id="user_12345",
        email="user@example.com",
        tier="pro",
        duration_days=30
    )
    
    print(f"\nLicense Key: {license}")
```

---

## Deployment

### Environment Setup

```bash
# Install dependencies
pip install flask flask-cors flask-limiter psycopg2-binary gunicorn

# Set environment variables
export MASTER_KEY="XoYgqu2wJYVZVg5AdWO9NqhKM52qXQ_ob9oeWMVeYhw="
export DATABASE_URL="postgresql://user:pass@localhost/quantum_falcon"
export FLASK_ENV="production"

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 license_api:app
```

### Docker Deployment

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY license_api.py .

ENV MASTER_KEY=""
ENV DATABASE_URL=""
ENV FLASK_ENV="production"

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "license_api:app"]
```

---

## Security Checklist

- [ ] Master key in environment variable (not hardcoded)
- [ ] HTTPS only (SSL certificate installed)
- [ ] CORS configured (only your domain)
- [ ] Rate limiting enabled
- [ ] Database credentials secure
- [ ] Logging enabled (audit trail)
- [ ] Error messages don't leak data
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (parameterized queries)
- [ ] Regular security audits

---

## Testing

```bash
# Test health check
curl https://your-api.com/api/health

# Test license verification
curl -X POST https://your-api.com/api/verify \
  -H "Content-Type: application/json" \
  -d '{"license": "QF-PRO-a1b2c3d4e5f6-1234567890", "origin": "quantum-falcon-cockpit"}'
```

---

## Monitoring

Set up monitoring for:
- API uptime
- Response times
- Failed verification attempts
- Database connection health
- Rate limit hits
- Error rates

---

**Remember**: This API server should be deployed separately from the frontend. Never include the master key in the frontend repository!
