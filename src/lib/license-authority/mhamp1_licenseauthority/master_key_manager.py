# master_key_manager.py
from cryptography.fernet import Fernet
from pathlib import Path
import os

# Use a path relative to the user's home directory for portability
MASTER_KEY_FILE = Path.home() / ".mhamp1_licenseauthority" / "master.key"

def generate_master_key():
    """
    Generate a new master key and save it to a file.
    Creates the directory if it doesn't exist.
    """
    try:
        # Ensure the directory exists
        MASTER_KEY_FILE.parent.mkdir(parents=True, exist_ok=True)
        key = Fernet.generate_key()
        MASTER_KEY_FILE.write_bytes(key)
        print("Master key generated and saved to", MASTER_KEY_FILE)
    except PermissionError:
        print("Error: Permission denied when writing to", MASTER_KEY_FILE)
        raise
    except Exception as e:
        print(f"Error generating master key: {e}")
        raise

def load_master_key():
    """
    Load the master key from the file.
    """
    try:
        if not MASTER_KEY_FILE.exists():
            raise FileNotFoundError(f"Master key file {MASTER_KEY_FILE} not found. Run generate_master_key() first.")
        return MASTER_KEY_FILE.read_bytes()
    except FileNotFoundError:
        print("Error: Master key file not found. Generate it first.")
        raise
    except PermissionError:
        print("Error: Permission denied when reading", MASTER_KEY_FILE)
        raise
    except Exception as e:
        print(f"Error loading master key: {e}")
        raise

if __name__ == "__main__":
    generate_master_key()
