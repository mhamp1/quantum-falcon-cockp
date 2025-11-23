# LICENSEAUTH UPGRADE: Instant activation + hardware binding + grace period — now better than 3Commas/Pionex — November 20, 2025
# device_fingerprint.py - Device fingerprinting for hardware binding

from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta
from .models import DeviceBinding, License
from .database import get_db_session
import hashlib
import json


def generate_device_fingerprint(
    canvas_hash: Optional[str] = None,
    webgl_hash: Optional[str] = None,
    fonts_hash: Optional[str] = None,
    user_agent: Optional[str] = None
) -> str:
    """
    Generate a unique device fingerprint from browser characteristics
    
    Args:
        canvas_hash: Hash of canvas rendering
        webgl_hash: Hash of WebGL rendering
        fonts_hash: Hash of available fonts
        user_agent: Browser user agent string
        
    Returns:
        Unique device fingerprint string
    """
    fingerprint_data = {
        "canvas": canvas_hash or "",
        "webgl": webgl_hash or "",
        "fonts": fonts_hash or "",
        "ua": user_agent or ""
    }
    
    # Combine all hashes into a single fingerprint
    combined = json.dumps(fingerprint_data, sort_keys=True)
    fingerprint = hashlib.sha256(combined.encode()).hexdigest()
    
    return fingerprint


def can_change_device(license_id: int) -> Tuple[bool, Optional[str]]:
    """
    Check if a license can change devices (1 change per month limit)
    
    Args:
        license_id: The license ID
        
    Returns:
        Tuple of (can_change: bool, error_message: Optional[str])
    """
    db = get_db_session()
    try:
        # Get all device bindings for this license
        device_bindings = db.query(DeviceBinding).filter(
            DeviceBinding.license_id == license_id
        ).order_by(DeviceBinding.bound_at.desc()).all()
        
        if not device_bindings:
            # No previous bindings, can bind to any device
            return (True, None)
        
        # Get the most recent device change
        last_change = None
        for binding in device_bindings:
            if binding.unbound_at is not None:
                last_change = binding.unbound_at
                break
        
        # Helper function to check if 30 days passed
        def check_change_limit(last_change_date):
            if last_change_date:
                days_since_change = (datetime.utcnow() - last_change_date).days
                if days_since_change < 30:
                    days_remaining = 30 - days_since_change
                    return (False, f"Device change limit reached. Next change allowed in {days_remaining} days.")
            return (True, None)
        
        # Check if there's an active binding
        active_bindings = [b for b in device_bindings if b.is_active]
        
        if active_bindings and last_change:
            # Has active binding and previous change - check limit
            return check_change_limit(last_change)
        
        # No active binding or no previous change - allow binding
        return (True, None)
        
    finally:
        db.close()


def bind_device_to_license(
    license_id: int,
    device_fingerprint: str,
    canvas_hash: Optional[str] = None,
    webgl_hash: Optional[str] = None,
    fonts_hash: Optional[str] = None,
    user_agent: Optional[str] = None,
    force: bool = False
) -> Dict:
    """
    Bind a device to a license with 1 change per month limit
    
    Args:
        license_id: The license ID
        device_fingerprint: The device fingerprint
        canvas_hash: Canvas hash for fingerprint details
        webgl_hash: WebGL hash for fingerprint details
        fonts_hash: Fonts hash for fingerprint details
        user_agent: User agent string
        force: Force binding even if limit reached (admin only)
        
    Returns:
        Dict with success status and message
    """
    db = get_db_session()
    try:
        # Check if license exists
        license_record = db.query(License).filter(License.id == license_id).first()
        if not license_record:
            return {
                "success": False,
                "error": "License not found"
            }
        
        # Check if device is already bound
        existing_binding = db.query(DeviceBinding).filter(
            DeviceBinding.license_id == license_id,
            DeviceBinding.device_fingerprint == device_fingerprint,
            DeviceBinding.is_active == True
        ).first()
        
        if existing_binding:
            # Already bound to this device
            return {
                "success": True,
                "message": "Device already bound to this license",
                "device_binding_id": existing_binding.id
            }
        
        # Check if can change device
        if not force:
            can_change, error = can_change_device(license_id)
            if not can_change:
                return {
                    "success": False,
                    "error": error
                }
        
        # Unbind previous active devices
        previous_bindings = db.query(DeviceBinding).filter(
            DeviceBinding.license_id == license_id,
            DeviceBinding.is_active == True
        ).all()
        
        previous_device_id = None
        for binding in previous_bindings:
            binding.is_active = False
            binding.unbound_at = datetime.utcnow()
            previous_device_id = binding.id
        
        # Create new device binding
        new_binding = DeviceBinding(
            license_id=license_id,
            device_fingerprint=device_fingerprint,
            canvas_hash=canvas_hash,
            webgl_hash=webgl_hash,
            fonts_hash=fonts_hash,
            user_agent=user_agent,
            is_active=True,
            previous_device_id=previous_device_id,
            change_reason="Device change" if previous_device_id else "Initial binding"
        )
        
        db.add(new_binding)
        db.commit()
        db.refresh(new_binding)
        
        # Update license hardware_id
        license_record.hardware_id = device_fingerprint
        db.commit()
        
        return {
            "success": True,
            "message": "Device successfully bound to license",
            "device_binding_id": new_binding.id,
            "device_fingerprint": device_fingerprint
        }
        
    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "error": f"Error binding device: {str(e)}"
        }
    finally:
        db.close()


def get_device_bindings(license_id: int) -> Dict:
    """
    Get all device bindings for a license
    
    Args:
        license_id: The license ID
        
    Returns:
        Dict with device bindings and metadata
    """
    db = get_db_session()
    try:
        bindings = db.query(DeviceBinding).filter(
            DeviceBinding.license_id == license_id
        ).order_by(DeviceBinding.bound_at.desc()).all()
        
        can_change, error = can_change_device(license_id)
        
        return {
            "success": True,
            "can_change_device": can_change,
            "change_error": error,
            "bindings": [
                {
                    "id": b.id,
                    "device_fingerprint": b.device_fingerprint,
                    "bound_at": b.bound_at.isoformat(),
                    "unbound_at": b.unbound_at.isoformat() if b.unbound_at else None,
                    "is_active": b.is_active,
                    "user_agent": b.user_agent
                }
                for b in bindings
            ]
        }
    finally:
        db.close()


def validate_device_binding(license_id: int, device_fingerprint: str) -> Tuple[bool, Optional[str]]:
    """
    Validate that a device fingerprint matches the license binding
    
    Args:
        license_id: The license ID
        device_fingerprint: The device fingerprint to validate
        
    Returns:
        Tuple of (is_valid: bool, error_message: Optional[str])
    """
    db = get_db_session()
    try:
        # Check for active binding with this fingerprint
        binding = db.query(DeviceBinding).filter(
            DeviceBinding.license_id == license_id,
            DeviceBinding.device_fingerprint == device_fingerprint,
            DeviceBinding.is_active == True
        ).first()
        
        if binding:
            return (True, None)
        
        # Check if license has any active bindings
        active_bindings = db.query(DeviceBinding).filter(
            DeviceBinding.license_id == license_id,
            DeviceBinding.is_active == True
        ).all()
        
        if active_bindings:
            return (False, "License is bound to a different device")
        
        # No active bindings, allow (will create binding on next validation)
        return (True, None)
        
    finally:
        db.close()
