import os, json

LICENSE_DIR = "masterkey/licenses"
MANIFEST_PATH = "manifest/license_manifest.json"

licenses = []
for filename in os.listdir(LICENSE_DIR):
    if filename.endswith(".json"):
        with open(os.path.join(LICENSE_DIR, filename)) as f:
            data = json.load(f)
            licenses.append(data)

with open(MANIFEST_PATH, "w") as f:
    json.dump({"valid_licenses": licenses}, f, indent=2)

print(f"[+] Manifest built with {len(licenses)} licenses")
