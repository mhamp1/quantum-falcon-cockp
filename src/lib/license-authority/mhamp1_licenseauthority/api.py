# LICENSE AUTHORITY v2: Now full paywall + onboarding brain — November 19, 2025
# api.py - REST API service for license validation and webhook handling

from fastapi import FastAPI, HTTPException, Depends, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime, timedelta
import hashlib
import hmac
import os

from .validation_service import validate_license, verify_jwt_token
from .license_generator import generate_license
from .models import License, LicenseTier, get_tier_features, AuditLog
from .database import get_db_session, init_db
from sqlalchemy.orm import Session

# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded


# Initialize FastAPI app
app = FastAPI(
    title="Quantum Falcon License Authority v2",
    description="Complete license + paywall + onboarding brain",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Request/Response models
class ValidateLicenseRequest(BaseModel):
    license_key: str
    hardware_id: Optional[str] = None


class ValidateLicenseResponse(BaseModel):
    valid: bool
    tier: str
    expires_at: Optional[int] = None
    user_id: Optional[str] = None
    email: Optional[str] = None
    features: List[str] = []
    max_agents: Optional[int] = None
    max_strategies: Optional[int] = None
    strategies: Optional[List[str]] = []
    is_grace_period: bool = False
    is_expired: bool = False
    days_until_expiry: Optional[int] = None
    auto_renew: bool = False
    token: Optional[str] = None
    error: Optional[str] = None
    validated_at: Optional[str] = None


class GenerateLicenseRequest(BaseModel):
    user_id: str
    email: Optional[EmailStr] = None
    tier: str = "free"
    expires_days: Optional[int] = None
    hardware_id: Optional[str] = None
    is_floating: bool = False
    payment_id: Optional[str] = None
    payment_provider: Optional[str] = None


class GenerateLicenseResponse(BaseModel):
    license_key: str
    user_id: str
    email: Optional[str] = None
    tier: str
    expires_at: Optional[str] = None
    created_at: str
    is_floating: bool
    hardware_id: Optional[str] = None


class WebhookRequest(BaseModel):
    event: str
    payment_id: str
    customer_email: str
    license_key: Optional[str] = None
    tier: Optional[str] = None
    renewal: bool = False


from typing import Union, Any

class TierInfoResponse(BaseModel):
    tier: str
    name: str
    price: Union[int, float, str]
    features: List[str]
    max_agents: int
    max_strategies: int
    strategies: Union[List[str], str]
    description: str


# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    print("✓ License Authority v2 API started")
    print("✓ Database initialized")


# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Quantum Falcon License Authority v2",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }


# License validation endpoint (rate-limited)
@app.post("/validate", response_model=ValidateLicenseResponse)
@limiter.limit("100/minute")
async def validate_license_endpoint(
    request: Request,
    data: ValidateLicenseRequest,
    user_agent: Optional[str] = Header(None)
):
    """
    Validate a license key and return detailed tier information
    
    Rate limited to 100 requests per minute per IP
    Returns signed JWT token for authenticated access
    """
    ip_address = request.client.host if request.client else None
    
    result = validate_license(
        license_key=data.license_key,
        hardware_id=data.hardware_id,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    return ValidateLicenseResponse(**result)


# Generate new license (requires admin token)
@app.post("/generate", response_model=GenerateLicenseResponse)
async def generate_license_endpoint(
    data: GenerateLicenseRequest,
    admin_token: str = Header(None, alias="X-Admin-Token")
):
    """
    Generate a new license key (admin only)
    
    Requires X-Admin-Token header for authentication
    """
    # Verify admin token
    expected_token = os.getenv("ADMIN_TOKEN", "change-this-admin-token")
    if admin_token != expected_token:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    
    try:
        # Validate tier
        try:
            tier = LicenseTier(data.tier)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid tier: {data.tier}")
        
        result = generate_license(
            user_id=data.user_id,
            email=data.email,
            tier=tier,
            expires_days=data.expires_days,
            hardware_id=data.hardware_id,
            is_floating=data.is_floating,
            payment_id=data.payment_id,
            payment_provider=data.payment_provider
        )
        
        return GenerateLicenseResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# LICENSEAUTH UPGRADE: Instant activation + hardware binding + grace period — now better than 3Commas/Pionex — November 20, 2025
# Webhook endpoint for payment providers
@app.post("/webhook/{provider}")
async def webhook_endpoint(
    provider: str,
    request: Request,
    signature: Optional[str] = Header(None, alias="X-Signature")
):
    """
    Webhook endpoint for Stripe/LemonSqueezy payment notifications
    
    UPGRADE: Instant license generation + deep link activation
    
    Handles:
    - checkout.session.completed → generate key + return deep link
    - New purchases → instant license delivery
    - Renewals → extend expiration
    - Cancellations → revoke license
    - Refunds → revoke license
    """
    body = await request.body()
    
    # Verify webhook signature
    webhook_secret = os.getenv(f"{provider.upper()}_WEBHOOK_SECRET")
    if webhook_secret and signature:
        expected_signature = hmac.new(
            webhook_secret.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_signature):
            raise HTTPException(status_code=401, detail="Invalid signature")
    
    # Parse webhook data
    data = await request.json()
    
    db = get_db_session()
    try:
        event_type = data.get("type") or data.get("event")
        
        # STRIPE: checkout.session.completed
        # LEMON SQUEEZY: order_created, subscription_payment_success
        if event_type in ["checkout.session.completed", "payment.succeeded", "order.created", "subscription_payment_success"]:
            # New purchase or renewal
            customer_email = (
                data.get("customer_email") or 
                data.get("customer_details", {}).get("email") or
                data.get("data", {}).get("attributes", {}).get("user_email")
            )
            payment_id = data.get("id") or data.get("data", {}).get("id")
            
            if not customer_email:
                raise HTTPException(status_code=400, detail="Customer email not found in webhook data")
            
            # Determine tier from product/variant
            tier = determine_tier_from_webhook(data)
            
            # Check if license already exists
            license_record = db.query(License).filter(
                License.payment_id == payment_id
            ).first()
            
            if license_record:
                # Renewal - extend expiration
                if license_record.expires_at:
                    license_record.expires_at = license_record.expires_at + timedelta(days=30)
                license_record.renewal_reminder_sent = False
                db.commit()
                
                license_key = license_record.license_key
                deep_link = f"quantumfalcon://activate?key={license_key}"
                
                return {
                    "status": "success",
                    "action": "renewal",
                    "license_key": license_key,
                    "deep_link": deep_link,
                    "expires_at": license_record.expires_at.isoformat() if license_record.expires_at else None
                }
            else:
                # New purchase - generate license INSTANTLY
                result = generate_license(
                    user_id=customer_email,
                    email=customer_email,
                    tier=tier,
                    payment_id=payment_id,
                    payment_provider=provider
                )
                
                license_key = result['license_key']
                
                # Generate deep link for instant activation
                deep_link = f"quantumfalcon://activate?key={license_key}"
                
                print(f"✓ New license generated: {license_key}")
                print(f"✓ Deep link: {deep_link}")
                
                # Return metadata for payment provider (Stripe/Lemon Squeezy will include this in response)
                return {
                    "status": "success",
                    "action": "new_license",
                    "license_key": license_key,
                    "deep_link": deep_link,
                    "user_email": customer_email,
                    "tier": tier.value,
                    "expires_at": result.get('expires_at'),
                    "message": "License generated successfully. Use deep link for instant activation."
                }
        
        elif event_type in ["payment.refunded", "subscription_cancelled", "charge.refunded"]:
            # Revoke license
            payment_id = data.get("id") or data.get("data", {}).get("id")
            
            license_record = db.query(License).filter(
                License.payment_id == payment_id
            ).first()
            
            if license_record:
                license_record.is_revoked = True
                license_record.revoked_at = datetime.utcnow()
                license_record.revoked_reason = "Payment refunded or subscription cancelled"
                db.commit()
                
                return {
                    "status": "success",
                    "action": "revoked",
                    "license_key": license_record.license_key
                }
        
        return {"status": "success", "processed": True, "event_type": event_type}
    
    except Exception as e:
        print(f"Webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


def determine_tier_from_webhook(data: dict) -> LicenseTier:
    """Determine tier from webhook data"""
    # This is a simplified version - customize based on your payment provider
    product_name = (
        data.get("product", {}).get("name", "").lower() or
        data.get("data", {}).get("attributes", {}).get("product_name", "").lower()
    )
    
    if "lifetime" in product_name or "white" in product_name:
        return LicenseTier.LIFETIME
    elif "elite" in product_name or "premium" in product_name:
        return LicenseTier.ELITE
    elif "pro" in product_name:
        return LicenseTier.PRO
    else:
        return LicenseTier.FREE


# Get tier information
@app.get("/tiers", response_model=List[TierInfoResponse])
async def get_tiers():
    """Get information about all available tiers"""
    tiers = []
    for tier in LicenseTier:
        features = get_tier_features(tier)
        tiers.append({
            "tier": tier.value,
            "name": features.get("name"),
            "price": features.get("price"),
            "features": features.get("features"),
            "max_agents": features.get("max_agents"),
            "max_strategies": features.get("max_strategies"),
            "strategies": features.get("strategies"),
            "description": features.get("description")
        })
    
    return tiers


# Get tier information for specific tier
@app.get("/tiers/{tier}", response_model=TierInfoResponse)
async def get_tier_info(tier: str):
    """Get detailed information about a specific tier"""
    try:
        tier_enum = LicenseTier(tier)
        features = get_tier_features(tier_enum)
        
        return {
            "tier": tier,
            "name": features.get("name"),
            "price": features.get("price"),
            "features": features.get("features"),
            "max_agents": features.get("max_agents"),
            "max_strategies": features.get("max_strategies"),
            "strategies": features.get("strategies"),
            "description": features.get("description")
        }
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Tier not found: {tier}")


# Verify JWT token
@app.post("/verify-token")
async def verify_token_endpoint(token: str):
    """Verify a JWT token and return payload"""
    payload = verify_jwt_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return {
        "valid": True,
        "payload": payload
    }


# Get audit logs (admin only)
@app.get("/audit-logs")
async def get_audit_logs(
    limit: int = 100,
    admin_token: str = Header(None, alias="X-Admin-Token")
):
    """Get recent audit logs (admin only)"""
    expected_token = os.getenv("ADMIN_TOKEN", "change-this-admin-token")
    if admin_token != expected_token:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    
    db = get_db_session()
    try:
        logs = db.query(AuditLog).order_by(
            AuditLog.timestamp.desc()
        ).limit(limit).all()
        
        return {
            "logs": [
                {
                    "id": log.id,
                    "license_key": log.license_key,
                    "user_id": log.user_id,
                    "action": log.action,
                    "success": log.success,
                    "ip_address": log.ip_address,
                    "hardware_id": log.hardware_id,
                    "error_message": log.error_message,
                    "timestamp": log.timestamp.isoformat()
                }
                for log in logs
            ]
        }
    finally:
        db.close()


# LICENSEAUTH UPGRADE: Device binding endpoints
class BindDeviceRequest(BaseModel):
    license_key: str
    device_fingerprint: Optional[Dict] = None
    canvas_hash: Optional[str] = None
    webgl_hash: Optional[str] = None
    fonts_hash: Optional[str] = None
    user_agent: Optional[str] = None


@app.post("/bind-device")
async def bind_device_endpoint(
    request: Request,
    data: BindDeviceRequest
):
    """
    Bind a device to a license (1 change per month limit)
    
    UPGRADE: Hardware binding with browser fingerprinting
    """
    from .device_fingerprint import bind_device_to_license, generate_device_fingerprint
    
    # Get license from database
    db = get_db_session()
    try:
        license_record = db.query(License).filter(
            License.license_key == data.license_key
        ).first()
        
        if not license_record:
            raise HTTPException(status_code=404, detail="License not found")
        
        # Extract fingerprint data
        if data.device_fingerprint:
            canvas_hash = data.device_fingerprint.get('canvas_hash')
            webgl_hash = data.device_fingerprint.get('webgl_hash')
            fonts_hash = data.device_fingerprint.get('fonts_hash')
            user_agent = data.device_fingerprint.get('user_agent')
            fingerprint = data.device_fingerprint.get('fingerprint')
        else:
            canvas_hash = data.canvas_hash
            webgl_hash = data.webgl_hash
            fonts_hash = data.fonts_hash
            user_agent = data.user_agent or request.headers.get("user-agent")
            fingerprint = generate_device_fingerprint(
                canvas_hash=canvas_hash,
                webgl_hash=webgl_hash,
                fonts_hash=fonts_hash,
                user_agent=user_agent
            )
        
        # Bind device
        result = bind_device_to_license(
            license_id=license_record.id,
            device_fingerprint=fingerprint,
            canvas_hash=canvas_hash,
            webgl_hash=webgl_hash,
            fonts_hash=fonts_hash,
            user_agent=user_agent
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result.get('error', 'Failed to bind device'))
        
        return result
        
    finally:
        db.close()


@app.get("/device-bindings/{license_key}")
async def get_device_bindings_endpoint(license_key: str):
    """Get all device bindings for a license"""
    from .device_fingerprint import get_device_bindings
    
    db = get_db_session()
    try:
        license_record = db.query(License).filter(
            License.license_key == license_key
        ).first()
        
        if not license_record:
            raise HTTPException(status_code=404, detail="License not found")
        
        result = get_device_bindings(license_record.id)
        return result
        
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print(f"Starting License Authority v2 API on {host}:{port}")
    print("✓ UPGRADE: Instant activation + hardware binding + grace period")
    uvicorn.run(app, host=host, port=port)
