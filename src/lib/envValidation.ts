// ENV VALIDATION — Check for missing keys at startup
// November 25, 2025 — Quantum Falcon Cockpit v2025.1.0

interface EnvConfig {
  required?: string[]
  optional?: string[]
}

const REQUIRED_ENV_VARS: string[] = [
  // Add required env vars here if needed
  // 'VITE_API_URL',
  // 'VITE_STRIPE_PUBLIC_KEY',
]

const OPTIONAL_ENV_VARS: string[] = [
  'VITE_API_URL',
  'VITE_STRIPE_PUBLIC_KEY',
  'VITE_PADDLE_VENDOR_ID',
  'VITE_DISCORD_CLIENT_ID',
  'VITE_SENTRY_DSN',
]

export function validateEnv(config?: EnvConfig): { valid: boolean; missing: string[]; warnings: string[] } {
  const required = config?.required || REQUIRED_ENV_VARS
  const optional = config?.optional || OPTIONAL_ENV_VARS
  
  const missing: string[] = []
  const warnings: string[] = []

  // Check required vars
  for (const key of required) {
    const value = import.meta.env[key]
    if (!value || value.trim() === '') {
      missing.push(key)
    }
  }

  // Check optional vars (warn if missing)
  for (const key of optional) {
    const value = import.meta.env[key]
    if (!value || value.trim() === '') {
      warnings.push(key)
    }
  }

  return { valid: missing.length === 0, missing, warnings }
}

export function initializeEnvValidation(): void {
  if (import.meta.env.DEV) {
    // Only validate in development
    const { valid, missing, warnings } = validateEnv()

    if (!valid) {
      console.error('❌ [ENV] Missing required environment variables:', missing)
      console.error('   Please check your .env file')
    }

    if (warnings.length > 0) {
      console.warn('⚠️ [ENV] Optional environment variables not set:', warnings)
    }

    if (valid && warnings.length === 0) {
      console.info('✅ [ENV] All environment variables validated')
    }
  }
}

// Auto-validate on import in development
if (import.meta.env.DEV) {
  initializeEnvValidation()
}

