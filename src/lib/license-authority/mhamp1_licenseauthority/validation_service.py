# LICENSE AUTHORITY v2: Now full paywall + onboarding brain — November 19, 2025
# validation_service.py - License validation with JWT responses

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from .master_key_manager import load_master_key
from .models import License, LicenseActivation, AuditLog, LicenseTier, get_tier_features, get_grace_period_tier
from .database import get_db_session
import json
import base64
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
import os


# JWT secret (should be in env for production)
JWT_SECRET = os.getenv("JWT_SECRET", "quantum-falcon-jwt-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24


def decode_license_key(license_key: str) -> Optional[Dict[str, Any]]:
    """Decode and decrypt license key"""
    try:
        master_key = load_master_key()
        
        # Decode base64
        encrypted_data = base64.urlsafe_b64decode(license_key.encode())
        
        # Extract nonce (first 12 bytes) and ciphertext
        nonce = encrypted_data[:12]
        ciphertext = encrypted_data[12:]
        
        # Decrypt using AES-256-GCM
        aesgcm = AESGCM(master_key[:32])
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)
        
        # Parse JSON
        key_data = json.loads(plaintext.decode())
        
        return key_data
    except Exception as e:
        print(f"Error decoding license key: {e}")
        return None


def validate_license(
    license_key: str,
    hardware_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
) -> Dict[str, Any]:
    """
    Validate license and return detailed response with JWT
    
    Returns:
        {
            'valid': bool,
            'tier': str,
            'expires_at': int (timestamp) or None,
            'user_id': str,
            'features': list,
            'is_grace_period': bool,
            'days_until_expiry': int or None,
            'token': str (JWT),
            'error': str (if invalid)
        }
    """
    db = get_db_session()
    
    try:
        # Decode key
        key_data = decode_license_key(license_key)
        if not key_data:
            # Log failed validation
            audit = AuditLog(
                license_key=license_key[:50],  # Truncate for storage
                action="validate",
                success=False,
                ip_address=ip_address,
                user_agent=user_agent,
                hardware_id=hardware_id,
                error_message="Invalid license key format"
            )
            db.add(audit)
            db.commit()
            
            return {
                "valid": False,
                "error": "Invalid license key format",
                "tier": "free",
                "features": []
            }
        
        # Look up license in database
        license_record = db.query(License).filter(
            License.license_key == license_key
        ).first()
        
        if not license_record:
            # License not found in database
            audit = AuditLog(
                license_key=license_key[:50],
                user_id=key_data.get("user_id"),
                action="validate",
                success=False,
                ip_address=ip_address,
                user_agent=user_agent,
                hardware_id=hardware_id,
                error_message="License not found in database"
            )
            db.add(audit)
            db.commit()
            
            return {
                "valid": False,
                "error": "License not found",
                "tier": "free",
                "features": []
            }
        
        # Check if revoked
        if license_record.is_revoked:
            audit = AuditLog(
                license_key=license_key[:50],
                user_id=license_record.user_id,
                action="validate",
                success=False,
                ip_address=ip_address,
                user_agent=user_agent,
                hardware_id=hardware_id,
                error_message=f"License revoked: {license_record.revoked_reason}"
            )
            db.add(audit)
            db.commit()
            
            return {
                "valid": False,
                "error": f"License revoked: {license_record.revoked_reason}",
                "tier": "free",
                "features": []
            }
        
        # LICENSEAUTH UPGRADE: Enhanced hardware binding with device fingerprinting
        if hardware_id and license_record.hardware_id:
            if not license_record.is_floating:
                # Hardware-locked license - strict check first
                if license_record.hardware_id != hardware_id:
                    # Hardware mismatch - check if device binding allows change
                    from .device_fingerprint import can_change_device
                    
                    # Check if can change device (1 per month limit)
                    can_change, change_error = can_change_device(license_record.id)
                    
                    audit = AuditLog(
                        license_key=license_key[:50],
                        user_id=license_record.user_id,
                        action="validate",
                        success=False,
                        ip_address=ip_address,
                        user_agent=user_agent,
                        hardware_id=hardware_id,
                        error_message=f"Hardware mismatch: {change_error if change_error else 'Device does not match'}"
                    )
                    db.add(audit)
                    db.commit()
                    
                    return {
                        "valid": False,
                        "error": f"License is bound to different hardware/device. {change_error if not can_change else 'Use /bind-device API to switch devices.'}",
                        "tier": "free",
                        "features": [],
                        "can_change_device": can_change,
                        "device_change_error": change_error
                    }
        
        # Check expiration and grace period
        now = datetime.utcnow()
        is_expired = False
        is_grace_period = False
        days_until_expiry = None
        effective_tier = license_record.tier
        
        if license_record.expires_at:
            days_until_expiry = (license_record.expires_at - now).days
            
            if now > license_record.expires_at:
                is_expired = True
                grace_period_end = license_record.expires_at + timedelta(days=7)
                
                if now <= grace_period_end:
                    # In grace period - reduced features
                    is_grace_period = True
                    effective_tier = get_grace_period_tier(LicenseTier(license_record.tier)).value
                else:
                    # Grace period expired
                    audit = AuditLog(
                        license_key=license_key[:50],
                        user_id=license_record.user_id,
                        action="validate",
                        success=False,
                        ip_address=ip_address,
                        user_agent=user_agent,
                        hardware_id=hardware_id,
                        error_message="License expired"
                    )
                    db.add(audit)
                    db.commit()
                    
                    return {
                        "valid": False,
                        "error": "License expired",
                        "expired_at": license_record.expires_at.isoformat(),
                        "tier": "free",
                        "features": []
                    }
        
        # Update last validated timestamp
        license_record.last_validated_at = now
        db.commit()
        
        # Get tier features
        tier_features = get_tier_features(LicenseTier(effective_tier))
        
        # Create JWT token
        jwt_payload = {
            "user_id": license_record.user_id,
            "tier": effective_tier,
            "license_key": license_key,
            "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS),
            "iat": datetime.utcnow()
        }
        
        token = jwt.encode(jwt_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
        
        # Log successful validation
        audit = AuditLog(
            license_key=license_key[:50],
            user_id=license_record.user_id,
            action="validate",
            success=True,
            ip_address=ip_address,
            user_agent=user_agent,
            hardware_id=hardware_id,
            result={
                "tier": effective_tier,
                "is_grace_period": is_grace_period
            }
        )
        db.add(audit)
        db.commit()
        
        # LICENSEAUTH UPGRADE: Grace period banner data
        grace_period_banner = None
        if is_grace_period:
            days_in_grace = (now - license_record.expires_at).days if license_record.expires_at else 0
            days_remaining_in_grace = 7 - days_in_grace
            grace_period_banner = {
                "show": True,
                "title": "License Expired — 7 Days Grace Period",
                "message": f"Your license expired {days_in_grace} day(s) ago. You have {days_remaining_in_grace} day(s) remaining in grace period with reduced features.",
                "cta_text": "Renew Now",
                "cta_action": "renew_license",
                "original_tier": license_record.tier,
                "current_tier": effective_tier,
                "days_remaining": days_remaining_in_grace
            }
        
        return {
            "valid": True,
            "tier": effective_tier,
            "expires_at": int(license_record.expires_at.timestamp()) if license_record.expires_at else None,
            "user_id": license_record.user_id,
            "email": license_record.email,
            "features": tier_features.get("features", []),
            "max_agents": tier_features.get("max_agents", 1),
            "max_strategies": tier_features.get("max_strategies", 1),
            "strategies": tier_features.get("strategies", []),
            "is_grace_period": is_grace_period,
            "is_expired": is_expired,
            "days_until_expiry": days_until_expiry,
            "auto_renew": license_record.auto_renew,
            "token": token,
            "validated_at": now.isoformat(),
            "grace_period_banner": grace_period_banner
        }
        
    except Exception as e:
        print(f"Error validating license: {e}")
        
        # Log error
        audit = AuditLog(
            license_key=license_key[:50] if license_key else None,
            action="validate",
            success=False,
            ip_address=ip_address,
            user_agent=user_agent,
            hardware_id=hardware_id,
            error_message=str(e)
        )
        db.add(audit)
        db.commit()
        
        return {
            "valid": False,
            "error": f"Validation error: {str(e)}",
            "tier": "free",
            "features": []
        }
    finally:
        db.close()


def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
