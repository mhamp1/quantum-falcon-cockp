# LICENSEAUTH UPGRADE: Instant activation + hardware binding + grace period — now better than 3Commas/Pionex — November 20, 2025
__version__ = "2.1.0"

# Core functionality
from .license_generator import generate_license, generate_license_key, generate_legacy_license
from .license_validator import LicenseValidator
from .validation_service import validate_license, verify_jwt_token
from .master_key_manager import generate_master_key, load_master_key

# Device fingerprinting (UPGRADE)
from .device_fingerprint import (
    generate_device_fingerprint,
    bind_device_to_license,
    can_change_device,
    get_device_bindings,
    validate_device_binding
)

# Database models
from .models import (
    License,
    LicenseActivation,
    DeviceBinding,
    AuditLog,
    LicenseTier,
    TIER_FEATURES,
    get_tier_features,
    can_access_strategy,
    get_grace_period_tier
)

# Database
from .database import init_db, get_db, get_db_session

# API (optional import)
try:
    from .api import app
except ImportError:
    app = None

__all__ = [
    # Version
    '__version__',
    
    # License generation
    'generate_license',
    'generate_license_key',
    'generate_legacy_license',
    
    # Validation
    'LicenseValidator',
    'validate_license',
    'verify_jwt_token',
    
    # Key management
    'generate_master_key',
    'load_master_key',
    
    # Device fingerprinting (UPGRADE)
    'generate_device_fingerprint',
    'bind_device_to_license',
    'can_change_device',
    'get_device_bindings',
    'validate_device_binding',
    
    # Models
    'License',
    'LicenseActivation',
    'DeviceBinding',
    'AuditLog',
    'LicenseTier',
    'TIER_FEATURES',
    'get_tier_features',
    'can_access_strategy',
    'get_grace_period_tier',
    
    # Database
    'init_db',
    'get_db',
    'get_db_session',
    
    # API
    'app',
]
