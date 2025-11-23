# license_validator.py
from cryptography.fernet import Fernet

class LicenseValidator:
    def __init__(self, master_key: bytes):
        self.fernet = Fernet(master_key)

    def validate(self, license_key: str, expected_user: str) -> bool:
        try:
            decrypted = self.fernet.decrypt(license_key.encode()).decode()
            return decrypted == expected_user
        except Exception:
            return False
