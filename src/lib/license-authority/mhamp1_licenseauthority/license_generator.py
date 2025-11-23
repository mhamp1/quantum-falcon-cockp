# LICENSE AUTHORITY v2: Now full paywall + onboarding brain — November 19, 2025
# license_generator.py - Enhanced license generation with tier support

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from .master_key_manager import load_master_key
from .models import License, LicenseTier
from .database import get_db_session, init_db
import json
import os
import base64
from datetime import datetime, timedelta


def generate_license_key(user_id: str, tier: LicenseTier = LicenseTier.FREE) -> str:
    """
    Generate encrypted license key using AES-256-GCM
    Key format: base64(encrypted_json)
    JSON contains: {user_id, tier, timestamp}
    """
    # Use AESGCM for authenticated encryption (AES-256-GCM)
    master_key = load_master_key()
    
    # Create key data
    key_data = {
        "user_id": user_id,
        "tier": tier.value if isinstance(tier, LicenseTier) else tier,
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Generate nonce (12 bytes for GCM)
    nonce = os.urandom(12)
    
    # Use first 32 bytes of master key for AES-256
    aesgcm = AESGCM(master_key[:32])
    
    # Encrypt the data
    json_data = json.dumps(key_data).encode()
    ciphertext = aesgcm.encrypt(nonce, json_data, None)
    
    # Combine nonce + ciphertext and encode
    license_key = base64.urlsafe_b64encode(nonce + ciphertext).decode()
    
    return license_key


def generate_license(
    user_id: str,
    email: str = None,
    tier: LicenseTier = LicenseTier.FREE,
    expires_days: int = None,
    hardware_id: str = None,
    is_floating: bool = False,
    payment_id: str = None,
    payment_provider: str = None
) -> dict:
    """
    Generate and store a new license with full tier support
    
    Returns:
        dict: {
            'license_key': str,
            'user_id': str,
            'tier': str,
            'expires_at': str or None,
            'created_at': str
        }
    """
    # Initialize database if needed
    init_db()
    
    # Generate encrypted key
    license_key = generate_license_key(user_id, tier)
    
    # Calculate expiration
    expires_at = None
    if expires_days is not None:
        expires_at = datetime.utcnow() + timedelta(days=expires_days)
    elif tier == LicenseTier.FREE:
        expires_at = datetime.utcnow() + timedelta(days=30)  # 30 day trial
    elif tier == LicenseTier.PRO:
        expires_at = datetime.utcnow() + timedelta(days=30)  # Monthly
    elif tier == LicenseTier.ELITE:
        expires_at = datetime.utcnow() + timedelta(days=30)  # Monthly
    # LIFETIME, ENTERPRISE, WHITE_LABEL: expires_at remains None
    
    # Store in database
    db = get_db_session()
    try:
        license_record = License(
            license_key=license_key,
            user_id=user_id,
            email=email,
            tier=tier.value if isinstance(tier, LicenseTier) else tier,
            expires_at=expires_at,
            hardware_id=hardware_id,
            is_floating=is_floating,
            payment_id=payment_id,
            payment_provider=payment_provider,
            is_active=True
        )
        
        db.add(license_record)
        db.commit()
        db.refresh(license_record)
        
        return {
            "license_key": license_key,
            "user_id": user_id,
            "email": email,
            "tier": license_record.tier,
            "expires_at": license_record.expires_at.isoformat() if license_record.expires_at else None,
            "created_at": license_record.created_at.isoformat(),
            "is_floating": is_floating,
            "hardware_id": hardware_id
        }
    finally:
        db.close()


def generate_legacy_license(user_id: str) -> str:
    """Legacy license generation for backward compatibility"""
    f = Fernet(load_master_key())
    token = f.encrypt(user_id.encode())
    return token.decode()


if __name__ == "__main__":
    import sys
    
    print("=== License Authority v2 - License Generator ===")
    print("Available tiers:")
    for i, tier in enumerate(LicenseTier, 1):
        print(f"  {i}. {tier.value}")
    
    user_id = input("\nEnter buyer ID/email: ")
    tier_input = input("Enter tier number (1-6, default=1): ").strip() or "1"
    
    tier_map = {
        "1": LicenseTier.FREE,
        "2": LicenseTier.PRO,
        "3": LicenseTier.ELITE,
        "4": LicenseTier.LIFETIME,
        "5": LicenseTier.ENTERPRISE,
        "6": LicenseTier.WHITE_LABEL
    }
    
    tier = tier_map.get(tier_input, LicenseTier.FREE)
    email = input("Enter email (optional): ").strip() or None
    
    try:
        result = generate_license(user_id=user_id, email=email, tier=tier)
        print("\n✓ License generated successfully!")
        print(f"  License Key: {result['license_key']}")
        print(f"  User ID: {result['user_id']}")
        print(f"  Tier: {result['tier']}")
        print(f"  Expires: {result['expires_at'] or 'Never (Lifetime)'}")
    except Exception as e:
        print(f"\n✗ Error generating license: {e}")
        sys.exit(1)
