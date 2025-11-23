# tests/test_import.py
import mhamp1_licenseauthority

def test_version():
    assert hasattr(mhamp1_licenseauthority, '__version__'), "No version attribute"

# Optional: Add a functional test
def test_generate_license():
    from mhamp1_licenseauthority import license_generator
    user_id = "testuser@example.com"
    
    # Test new generate_license (returns dict)
    result = license_generator.generate_license(user_id)
    assert isinstance(result, dict), "generate_license should return a dict"
    assert 'license_key' in result, "Result should have license_key"
    assert isinstance(result['license_key'], str), "License key should be a string"
    
    # Test legacy generate_legacy_license (returns string)
    legacy_key = license_generator.generate_legacy_license(user_id)
    assert isinstance(legacy_key, str), "Legacy license key should be a string"
