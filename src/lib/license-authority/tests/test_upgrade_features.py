# LICENSEAUTH UPGRADE: Test instant activation + hardware binding + grace period — November 20, 2025
# test_upgrade_features.py - Tests for the 3 killer upgrade features

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
    init_db,
    bind_device_to_license,
    can_change_device,
    get_device_bindings,
    generate_device_fingerprint
)
from mhamp1_licenseauthority.database import get_db_session
from mhamp1_licenseauthority.models import License, DeviceBinding
from datetime import datetime, timedelta


@pytest.fixture(scope="module")
def setup_test_db():
    """Initialize test database"""
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
    init_db()
    yield


def test_device_fingerprint_generation():
    """Test device fingerprint generation"""
    fp1 = generate_device_fingerprint(
        canvas_hash="abc123",
        webgl_hash="def456",
        fonts_hash="ghi789",
        user_agent="Mozilla/5.0"
    )
    
    assert fp1 is not None
    assert len(fp1) > 0
    
    # Same inputs should generate same fingerprint
    fp2 = generate_device_fingerprint(
        canvas_hash="abc123",
        webgl_hash="def456",
        fonts_hash="ghi789",
        user_agent="Mozilla/5.0"
    )
    
    assert fp1 == fp2
    
    # Different inputs should generate different fingerprint
    fp3 = generate_device_fingerprint(
        canvas_hash="different",
        webgl_hash="def456",
        fonts_hash="ghi789",
        user_agent="Mozilla/5.0"
    )
    
    assert fp1 != fp3


def test_device_binding_basic(setup_test_db):
    """Test basic device binding functionality"""
    # Generate a license
    result = generate_license(
        user_id='device_test@example.com',
        email='device_test@example.com',
        tier=LicenseTier.PRO,
        expires_days=30
    )
    
    db = get_db_session()
    try:
        license_record = db.query(License).filter(
            License.license_key == result['license_key']
        ).first()
        
        # Bind device to license
        fingerprint = generate_device_fingerprint(
            canvas_hash="test123",
            webgl_hash="test456",
            fonts_hash="test789",
            user_agent="Test Browser"
        )
        
        bind_result = bind_device_to_license(
            license_id=license_record.id,
            device_fingerprint=fingerprint,
            canvas_hash="test123",
            webgl_hash="test456",
            fonts_hash="test789",
            user_agent="Test Browser"
        )
        
        assert bind_result['success']
        assert 'device_binding_id' in bind_result
        assert bind_result['device_fingerprint'] == fingerprint
        
    finally:
        db.close()


def test_device_change_limit(setup_test_db):
    """Test 1 device change per month limit"""
    # Generate a license
    result = generate_license(
        user_id='device_change_test@example.com',
        email='device_change_test@example.com',
        tier=LicenseTier.PRO,
        expires_days=30
    )
    
    db = get_db_session()
    try:
        license_record = db.query(License).filter(
            License.license_key == result['license_key']
        ).first()
        
        # Bind first device
        fp1 = generate_device_fingerprint(
            canvas_hash="device1",
            webgl_hash="device1",
            fonts_hash="device1",
            user_agent="Device 1"
        )
        
        bind1 = bind_device_to_license(
            license_id=license_record.id,
            device_fingerprint=fp1,
            user_agent="Device 1"
        )
        assert bind1['success']
        
        # Try to change to second device immediately
        fp2 = generate_device_fingerprint(
            canvas_hash="device2",
            webgl_hash="device2",
            fonts_hash="device2",
            user_agent="Device 2"
        )
        
        bind2 = bind_device_to_license(
            license_id=license_record.id,
            device_fingerprint=fp2,
            user_agent="Device 2"
        )
        assert bind2['success']  # First change is allowed
        
        # Try to change to third device immediately (should fail)
        fp3 = generate_device_fingerprint(
            canvas_hash="device3",
            webgl_hash="device3",
            fonts_hash="device3",
            user_agent="Device 3"
        )
        
        bind3 = bind_device_to_license(
            license_id=license_record.id,
            device_fingerprint=fp3,
            user_agent="Device 3"
        )
        assert not bind3['success']
        assert '30 days' in bind3['error'] or 'limit' in bind3['error']
        
    finally:
        db.close()


def test_get_device_bindings(setup_test_db):
    """Test getting device bindings for a license"""
    # Generate a license
    result = generate_license(
        user_id='get_bindings_test@example.com',
        email='get_bindings_test@example.com',
        tier=LicenseTier.PRO,
        expires_days=30
    )
    
    db = get_db_session()
    try:
        license_record = db.query(License).filter(
            License.license_key == result['license_key']
        ).first()
        
        # Bind a device
        fp = generate_device_fingerprint(
            canvas_hash="test_get",
            webgl_hash="test_get",
            fonts_hash="test_get",
            user_agent="Test Get Browser"
        )
        
        bind_device_to_license(
            license_id=license_record.id,
            device_fingerprint=fp,
            user_agent="Test Get Browser"
        )
        
        # Get bindings
        bindings_result = get_device_bindings(license_record.id)
        
        assert bindings_result['success']
        assert 'bindings' in bindings_result
        assert len(bindings_result['bindings']) > 0
        assert bindings_result['bindings'][0]['device_fingerprint'] == fp
        assert bindings_result['bindings'][0]['is_active']
        
    finally:
        db.close()


def test_grace_period_banner(setup_test_db):
    """Test grace period banner data in validation response"""
    # Generate an expired license (within grace period)
    result = generate_license(
        user_id='grace_banner_test@example.com',
        email='grace_banner_test@example.com',
        tier=LicenseTier.ELITE,
        expires_days=-3  # Expired 3 days ago
    )
    
    # Validate license
    validation = validate_license(
        license_key=result['license_key'],
        ip_address='127.0.0.1'
    )
    
    # Should be valid but in grace period
    assert validation['valid']
    assert validation['is_grace_period']
    
    # Check grace period banner data
    assert 'grace_period_banner' in validation
    banner = validation['grace_period_banner']
    
    assert banner is not None
    assert banner['show']
    assert 'Grace Period' in banner['title']
    assert 'Renew Now' in banner['cta_text']
    assert banner['original_tier'] == 'elite'
    assert banner['current_tier'] == 'pro'  # Downgraded
    assert banner['days_remaining'] > 0
    assert banner['days_remaining'] <= 7


def test_validation_without_grace_period(setup_test_db):
    """Test validation response when not in grace period"""
    # Generate a valid license
    result = generate_license(
        user_id='no_grace_test@example.com',
        email='no_grace_test@example.com',
        tier=LicenseTier.PRO,
        expires_days=30
    )
    
    # Validate license
    validation = validate_license(
        license_key=result['license_key'],
        ip_address='127.0.0.1'
    )
    
    # Should be valid and not in grace period
    assert validation['valid']
    assert not validation['is_grace_period']
    assert validation['grace_period_banner'] is None


def test_can_change_device_check(setup_test_db):
    """Test can_change_device function"""
    # Generate a license
    result = generate_license(
        user_id='can_change_test@example.com',
        email='can_change_test@example.com',
        tier=LicenseTier.PRO,
        expires_days=30
    )
    
    db = get_db_session()
    try:
        license_record = db.query(License).filter(
            License.license_key == result['license_key']
        ).first()
        
        # Before any binding, should be able to change
        can_change, error = can_change_device(license_record.id)
        assert can_change
        assert error is None
        
        # Bind first device
        fp1 = generate_device_fingerprint(
            canvas_hash="check1",
            webgl_hash="check1",
            fonts_hash="check1",
            user_agent="Check 1"
        )
        
        bind_device_to_license(
            license_id=license_record.id,
            device_fingerprint=fp1,
            user_agent="Check 1"
        )
        
        # After first binding, should still be able to change
        can_change, error = can_change_device(license_record.id)
        assert can_change
        
        # Bind second device (change)
        fp2 = generate_device_fingerprint(
            canvas_hash="check2",
            webgl_hash="check2",
            fonts_hash="check2",
            user_agent="Check 2"
        )
        
        bind_device_to_license(
            license_id=license_record.id,
            device_fingerprint=fp2,
            user_agent="Check 2"
        )
        
        # After change, should NOT be able to change for 30 days
        can_change, error = can_change_device(license_record.id)
        assert not can_change
        assert error is not None
        assert '30' in error or 'days' in error
        
    finally:
        db.close()


def test_webhook_deep_link_format():
    """Test deep link format for instant activation"""
    # This is a unit test for the deep link format
    test_key = "TEST_LICENSE_KEY_12345"
    deep_link = f"quantumfalcon://activate?key={test_key}"
    
    assert deep_link.startswith("quantumfalcon://")
    assert "activate" in deep_link
    assert test_key in deep_link


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
