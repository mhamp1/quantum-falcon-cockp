# LICENSE AUTHORITY v2: Now full paywall + onboarding brain — November 19, 2025
# test_license_v2.py - Comprehensive tests for License Authority v2

import pytest
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from mhamp1_licenseauthority import (
    generate_license,
    validate_license,
    LicenseTier,
    get_tier_features,
    can_access_strategy,
    get_grace_period_tier,
    init_db
)
from mhamp1_licenseauthority.database import get_db_session
from mhamp1_licenseauthority.models import License
from datetime import datetime, timedelta


@pytest.fixture(scope="module")
def setup_test_db():
    """Initialize test database"""
    # Use in-memory database for tests
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
    init_db()
    yield
    # Cleanup is automatic with in-memory DB


def test_tier_features():
    """Test tier feature definitions"""
    # Test Free tier
    free_features = get_tier_features(LicenseTier.FREE)
    assert free_features['name'] == 'Free'
    assert free_features['price'] == 0
    assert free_features['max_agents'] == 1
    
    # Test Pro tier
    pro_features = get_tier_features(LicenseTier.PRO)
    assert pro_features['name'] == 'Pro'
    assert pro_features['price'] == 99
    assert pro_features['max_agents'] == 5
    
    # Test Elite tier
    elite_features = get_tier_features(LicenseTier.ELITE)
    assert elite_features['name'] == 'Elite'
    assert elite_features['strategies'] == 'all'
    assert elite_features['max_agents'] == -1  # Unlimited


def test_strategy_access():
    """Test strategy access control"""
    # Free tier - only DCA Basic
    assert can_access_strategy(LicenseTier.FREE, 'dca_basic') == True
    assert can_access_strategy(LicenseTier.FREE, 'momentum') == False
    
    # Pro tier - specific strategies
    assert can_access_strategy(LicenseTier.PRO, 'dca_basic') == True
    assert can_access_strategy(LicenseTier.PRO, 'momentum') == True
    assert can_access_strategy(LicenseTier.PRO, 'rsi') == True
    
    # Elite tier - all strategies
    assert can_access_strategy(LicenseTier.ELITE, 'dca_basic') == True
    assert can_access_strategy(LicenseTier.ELITE, 'momentum') == True
    assert can_access_strategy(LicenseTier.ELITE, 'any_strategy') == True


def test_grace_period_tier():
    """Test grace period tier downgrade"""
    assert get_grace_period_tier(LicenseTier.PRO) == LicenseTier.FREE
    assert get_grace_period_tier(LicenseTier.ELITE) == LicenseTier.PRO
    assert get_grace_period_tier(LicenseTier.LIFETIME) == LicenseTier.ELITE
    assert get_grace_period_tier(LicenseTier.FREE) == LicenseTier.FREE


def test_license_generation(setup_test_db):
    """Test license generation"""
    result = generate_license(
        user_id='test_user@example.com',
        email='test_user@example.com',
        tier=LicenseTier.PRO,
        expires_days=30
    )
    
    assert result['license_key'] is not None
    assert len(result['license_key']) > 50
    assert result['user_id'] == 'test_user@example.com'
    assert result['tier'] == 'pro'
    assert result['expires_at'] is not None
    
    # Verify it's stored in database
    db = get_db_session()
    try:
        license_record = db.query(License).filter(
            License.license_key == result['license_key']
        ).first()
        
        assert license_record is not None
        assert license_record.user_id == 'test_user@example.com'
        assert license_record.tier == 'pro'
    finally:
        db.close()


def test_license_validation_valid(setup_test_db):
    """Test validation of a valid license"""
    # Generate a license
    result = generate_license(
        user_id='valid_user@example.com',
        email='valid_user@example.com',
        tier=LicenseTier.ELITE,
        expires_days=30
    )
    
    # Validate it
    validation_result = validate_license(
        license_key=result['license_key'],
        ip_address='127.0.0.1'
    )
    
    assert validation_result['valid'] == True
    assert validation_result['tier'] == 'elite'
    assert validation_result['user_id'] == 'valid_user@example.com'
    assert 'token' in validation_result
    assert len(validation_result['features']) > 0
    assert validation_result['is_grace_period'] == False


def test_license_validation_invalid():
    """Test validation of an invalid license"""
    validation_result = validate_license(
        license_key='invalid_key_12345',
        ip_address='127.0.0.1'
    )
    
    assert validation_result['valid'] == False
    assert 'error' in validation_result


def test_license_validation_expired(setup_test_db):
    """Test validation of an expired license (beyond grace period)"""
    # Generate an expired license
    result = generate_license(
        user_id='expired_user@example.com',
        email='expired_user@example.com',
        tier=LicenseTier.PRO,
        expires_days=-10  # Expired 10 days ago (beyond grace period)
    )
    
    # Validate it
    validation_result = validate_license(
        license_key=result['license_key'],
        ip_address='127.0.0.1'
    )
    
    assert validation_result['valid'] == False
    assert 'expired' in validation_result['error'].lower()


def test_license_validation_grace_period(setup_test_db):
    """Test validation during grace period"""
    # Generate a license that expired 3 days ago (within grace period)
    result = generate_license(
        user_id='grace_user@example.com',
        email='grace_user@example.com',
        tier=LicenseTier.ELITE,
        expires_days=-3
    )
    
    # Validate it
    validation_result = validate_license(
        license_key=result['license_key'],
        ip_address='127.0.0.1'
    )
    
    assert validation_result['valid'] == True
    assert validation_result['is_grace_period'] == True
    # During grace period, should be downgraded from elite to pro
    assert validation_result['tier'] == 'pro'


def test_lifetime_license(setup_test_db):
    """Test lifetime license (no expiration)"""
    result = generate_license(
        user_id='lifetime_user@example.com',
        email='lifetime_user@example.com',
        tier=LicenseTier.LIFETIME,
        expires_days=None  # Lifetime - no expiration
    )
    
    assert result['expires_at'] is None
    
    # Validate it
    validation_result = validate_license(
        license_key=result['license_key'],
        ip_address='127.0.0.1'
    )
    
    assert validation_result['valid'] == True
    assert validation_result['tier'] == 'lifetime'
    assert validation_result['expires_at'] is None
    assert validation_result['strategies'] == 'all'


def test_hardware_binding(setup_test_db):
    """Test hardware binding"""
    # Generate license bound to specific hardware
    result = generate_license(
        user_id='hardware_user@example.com',
        email='hardware_user@example.com',
        tier=LicenseTier.PRO,
        expires_days=30,
        hardware_id='device-12345'
    )
    
    # Validate with correct hardware ID
    validation_result = validate_license(
        license_key=result['license_key'],
        hardware_id='device-12345',
        ip_address='127.0.0.1'
    )
    
    assert validation_result['valid'] == True
    
    # Validate with wrong hardware ID
    validation_result_wrong = validate_license(
        license_key=result['license_key'],
        hardware_id='wrong-device',
        ip_address='127.0.0.1'
    )
    
    assert validation_result_wrong['valid'] == False
    assert 'hardware' in validation_result_wrong['error'].lower()


def test_all_tiers():
    """Test all tier definitions exist"""
    for tier in LicenseTier:
        features = get_tier_features(tier)
        assert features is not None
        assert 'name' in features
        assert 'price' in features
        assert 'features' in features
        assert 'max_agents' in features
        assert 'max_strategies' in features


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
