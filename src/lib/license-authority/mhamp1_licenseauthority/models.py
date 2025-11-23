# LICENSE AUTHORITY v2: Now full paywall + onboarding brain — November 19, 2025
# models.py - Database schema for license management

from sqlalchemy import Column, String, Integer, DateTime, Boolean, JSON, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime, timedelta
from enum import Enum

Base = declarative_base()


class LicenseTier(str, Enum):
    """License tiers for Quantum Falcon Cockpit v2025.1.0"""
    FREE = "free"
    PRO = "pro"
    ELITE = "elite"
    LIFETIME = "lifetime"
    ENTERPRISE = "enterprise"
    WHITE_LABEL = "white_label"


class License(Base):
    """License model with full tier and expiration tracking"""
    __tablename__ = "licenses"

    id = Column(Integer, primary_key=True, index=True)
    license_key = Column(String(500), unique=True, index=True, nullable=False)
    user_id = Column(String(255), index=True, nullable=False)
    email = Column(String(255), index=True)
    tier = Column(String(50), nullable=False, default=LicenseTier.FREE)
    
    # Expiration and renewal
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)  # NULL for lifetime licenses
    last_validated_at = Column(DateTime)
    
    # Hardware binding (optional)
    hardware_id = Column(String(255), nullable=True, index=True)
    is_floating = Column(Boolean, default=False)  # True for floating licenses
    max_activations = Column(Integer, default=1)  # For floating licenses
    
    # Status
    is_active = Column(Boolean, default=True)
    is_revoked = Column(Boolean, default=False)
    revoked_at = Column(DateTime, nullable=True)
    revoked_reason = Column(Text, nullable=True)
    
    # Payment tracking
    payment_id = Column(String(255), nullable=True)
    payment_provider = Column(String(50), nullable=True)  # stripe, lemonsqueezy
    
    # Renewal tracking
    auto_renew = Column(Boolean, default=False)
    renewal_reminder_sent = Column(Boolean, default=False)
    
    # Custom data (using license_metadata to avoid conflict with SQLAlchemy's metadata)
    license_metadata = Column(JSON, nullable=True)  # Additional custom data


class LicenseActivation(Base):
    """Track hardware activations for floating licenses"""
    __tablename__ = "license_activations"

    id = Column(Integer, primary_key=True, index=True)
    license_id = Column(Integer, index=True, nullable=False)
    hardware_id = Column(String(255), index=True, nullable=False)
    activated_at = Column(DateTime, default=datetime.utcnow)
    last_seen_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    deactivated_at = Column(DateTime, nullable=True)
    
    # Device info
    device_name = Column(String(255), nullable=True)
    device_info = Column(JSON, nullable=True)


class DeviceBinding(Base):
    """Track device bindings and changes (1 change per month limit)"""
    __tablename__ = "device_bindings"
    
    id = Column(Integer, primary_key=True, index=True)
    license_id = Column(Integer, index=True, nullable=False)
    device_fingerprint = Column(String(255), index=True, nullable=False)
    bound_at = Column(DateTime, default=datetime.utcnow)
    unbound_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Device fingerprint details
    canvas_hash = Column(String(255), nullable=True)
    webgl_hash = Column(String(255), nullable=True)
    fonts_hash = Column(String(255), nullable=True)
    user_agent = Column(Text, nullable=True)
    
    # Change tracking
    change_reason = Column(String(255), nullable=True)
    previous_device_id = Column(Integer, nullable=True)  # Reference to previous DeviceBinding


class AuditLog(Base):
    """Audit log for all license validation attempts"""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    license_key = Column(String(500), index=True)
    user_id = Column(String(255), index=True, nullable=True)
    action = Column(String(100), nullable=False)  # validate, activate, deactivate, revoke
    success = Column(Boolean, nullable=False)
    
    # Request details
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(Text, nullable=True)
    hardware_id = Column(String(255), nullable=True)
    
    # Result
    result = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


# Tier feature definitions
TIER_FEATURES = {
    LicenseTier.FREE: {
        "name": "Free",
        "price": 0,
        "strategies": ["dca_basic"],
        "max_agents": 1,
        "max_strategies": 1,
        "features": [
            "DCA Basic strategy",
            "1 trading agent",
            "Basic dashboard",
            "Community support"
        ],
        "description": "Perfect for getting started with automated trading"
    },
    LicenseTier.PRO: {
        "name": "Pro",
        "price": 99,
        "billing_period": "monthly",
        "strategies": ["dca_basic", "momentum", "rsi", "macd", "bollinger"],
        "max_agents": 5,
        "max_strategies": 5,
        "features": [
            "Momentum strategy",
            "RSI strategy",
            "MACD strategy",
            "Bollinger Bands strategy",
            "Up to 5 trading agents",
            "Advanced analytics",
            "Priority email support",
            "API access"
        ],
        "description": "Advanced trading strategies for serious traders"
    },
    LicenseTier.ELITE: {
        "name": "Elite",
        "price": 299,
        "billing_period": "monthly",
        "strategies": "all",  # All 23+ strategies
        "max_agents": -1,  # Unlimited
        "max_strategies": -1,  # Unlimited
        "features": [
            "All 23+ trading strategies",
            "Unlimited trading agents",
            "Machine learning strategies",
            "Portfolio optimization",
            "Risk management tools",
            "Real-time alerts",
            "Premium support",
            "Custom strategy builder",
            "Backtesting engine"
        ],
        "description": "Complete trading arsenal for professional traders"
    },
    LicenseTier.LIFETIME: {
        "name": "Lifetime",
        "price": 1999,
        "billing_period": "once",
        "strategies": "all",
        "max_agents": -1,
        "max_strategies": -1,
        "features": [
            "Everything in Elite",
            "Lifetime access",
            "White-label option",
            "Source code access",
            "Priority feature requests",
            "Dedicated support",
            "No recurring fees",
            "Future updates included"
        ],
        "description": "One-time investment for lifetime access to everything"
    },
    LicenseTier.ENTERPRISE: {
        "name": "Enterprise",
        "price": "custom",
        "strategies": "all",
        "max_agents": -1,
        "max_strategies": -1,
        "features": [
            "Everything in Lifetime",
            "Multi-user support",
            "Custom deployment",
            "SLA guarantee",
            "Dedicated account manager",
            "Custom integrations",
            "On-premise option"
        ],
        "description": "Tailored solutions for institutional traders"
    },
    LicenseTier.WHITE_LABEL: {
        "name": "White Label",
        "price": "custom",
        "strategies": "all",
        "max_agents": -1,
        "max_strategies": -1,
        "features": [
            "Everything in Enterprise",
            "Full rebrand capability",
            "Source code modification rights",
            "Custom domain",
            "Remove all branding",
            "Reseller license"
        ],
        "description": "Complete customization and rebranding rights"
    }
}


def get_tier_features(tier: LicenseTier) -> dict:
    """Get feature set for a specific tier"""
    return TIER_FEATURES.get(tier, TIER_FEATURES[LicenseTier.FREE])


def can_access_strategy(tier: LicenseTier, strategy: str) -> bool:
    """Check if a tier has access to a specific strategy"""
    tier_data = get_tier_features(tier)
    strategies = tier_data.get("strategies", [])
    
    if strategies == "all":
        return True
    
    return strategy in strategies


def get_grace_period_tier(original_tier: LicenseTier) -> LicenseTier:
    """Get reduced tier during grace period (7 days after expiry)"""
    # During grace period, downgrade to next lower tier
    tier_hierarchy = [
        LicenseTier.FREE,
        LicenseTier.PRO,
        LicenseTier.ELITE,
        LicenseTier.LIFETIME,
        LicenseTier.ENTERPRISE,
        LicenseTier.WHITE_LABEL
    ]
    
    try:
        current_index = tier_hierarchy.index(original_tier)
        if current_index > 0:
            return tier_hierarchy[current_index - 1]
    except ValueError:
        pass
    
    return LicenseTier.FREE
