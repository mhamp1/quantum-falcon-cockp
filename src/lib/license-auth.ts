interface LicenseVerificationResult {
  valid: boolean;
  tier?: "free" | "pro" | "elite" | "lifetime";
  expiresAt?: number;
  features?: string[];
  userId?: string;
  error?: string;
}

interface LicenseData {
  key: string;
  tier: "free" | "pro" | "elite" | "lifetime";
  expiresAt: number;
  userId: string;
  features: string[];
}

export class LicenseAuthority {
  private static readonly API_ENDPOINT =
    "https://your-secure-api.com/api/verify";

  static async verifyLicense(
    licenseKey: string,
  ): Promise<LicenseVerificationResult> {
    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          license: licenseKey,
          timestamp: Date.now(),
          origin: "quantum-falcon-cockpit",
        }),
      });

      if (!response.ok) {
        return {
          valid: false,
          error: "License verification failed",
        };
      }

      const data = await response.json();

      return {
        valid: data.valid,
        tier: data.tier,
        expiresAt: data.expiresAt,
        features: data.features,
        userId: data.userId,
      };
    } catch (error) {
      console.error("License verification error:", error);
      return {
        valid: false,
        error: "Network error during verification",
      };
    }
  }

  static async checkExpiration(expiresAt: number): Promise<boolean> {
    return Date.now() < expiresAt;
  }

  static getTimeUntilExpiration(expiresAt: number): string {
    const now = Date.now();
    const diff = expiresAt - now;

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }

  static getTierFeatures(tier: string): string[] {
    const features: Record<string, string[]> = {
      free: [
        "Basic Dashboard",
        "Manual Trading",
        "Basic Analytics",
        "Community Access (Read-only)",
      ],
      pro: [
        "All Free Features",
        "AI Trading Agents (3)",
        "Advanced Analytics",
        "Strategy Marketplace",
        "Copy Trading",
        "Priority Support",
      ],
      elite: [
        "All Pro Features",
        "AI Trading Agents (Unlimited)",
        "Advanced Market Intelligence",
        "Custom Strategy Builder",
        "API Access",
        "Whale Tracking",
        "Premium Community Features",
      ],
      lifetime: [
        "All Elite Features",
        "Lifetime Updates",
        "VIP Support",
        "Beta Access",
        "Custom Integrations",
        "White-Label Options",
      ],
    };

    return features[tier] || features.free;
  }

  static async storeLicenseLocally(licenseData: LicenseData): Promise<void> {
    const encrypted = btoa(JSON.stringify(licenseData));
    localStorage.setItem("qf_license", encrypted);
  }

  static async getStoredLicense(): Promise<LicenseData | null> {
    try {
      const encrypted = localStorage.getItem("qf_license");
      if (!encrypted) return null;

      const decrypted = JSON.parse(atob(encrypted));
      return decrypted;
    } catch {
      return null;
    }
  }

  static async clearLicense(): Promise<void> {
    localStorage.removeItem("qf_license");
  }
}

export async function verifyAndStoreLicense(
  licenseKey: string,
): Promise<LicenseVerificationResult> {
  const result = await LicenseAuthority.verifyLicense(licenseKey);

  if (result.valid && result.tier && result.expiresAt && result.userId) {
    await LicenseAuthority.storeLicenseLocally({
      key: licenseKey,
      tier: result.tier,
      expiresAt: result.expiresAt,
      userId: result.userId,
      features: result.features || [],
    });
  }

  return result;
}

export async function checkStoredLicense(): Promise<LicenseVerificationResult> {
  const stored = await LicenseAuthority.getStoredLicense();

  if (!stored) {
    return {
      valid: false,
      error: "No license found",
    };
  }

  const isValid = await LicenseAuthority.checkExpiration(stored.expiresAt);

  if (!isValid) {
    await LicenseAuthority.clearLicense();
    return {
      valid: false,
      error: "License expired",
    };
  }

  return {
    valid: true,
    tier: stored.tier,
    expiresAt: stored.expiresAt,
    features: stored.features,
    userId: stored.userId,
  };
}
