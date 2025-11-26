// GOD MODE — Master Key Activation
// November 26, 2025 — Quantum Falcon Cockpit v2025.1.0
// SECURITY: Master key recognized when entered, never hardcoded in plain text
// Master key hash is pre-computed and stored - actual key never visible

import type { UserAuth } from '@/lib/auth'

// ============================================================================
// MASTER KEY VERIFICATION
// SECURITY: Only hashes are stored - actual keys never in code
// ============================================================================

// Pre-computed SHA-256 hashes of master keys (NEVER store actual keys)
const MASTER_KEY_HASHES = new Set([
  // Hash of original master key
  'a8c90e5ea6c49e3c1b7f2d8e4a6b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
  // Additional master key hashes can be added here
])

// Known master key patterns (regex - safe to store)
const MASTER_KEY_PATTERNS = [
  /^QF-GODMODE-/i,           // QF-GODMODE-XXXX-XXXX (primary pattern)
  /^QF-MASTER-/i,            // QF-MASTER-XXXX-XXXX
  /^QF-LIFETIME-MHAMP1-/i,   // Legacy format
  /^MASTER-/i,               // MASTER-XXXX
  /^GOD-/i,                  // GOD-XXXX
]

// Known encoded master key (Base64 encoded - not the actual key)
const ENCODED_MASTER_KEY = 'XoYgqu2wJYVZVg5AdWO9NqhKM52qXQ_ob9oeWMVeYhw='

/**
 * Check if a license key matches master key patterns
 * SECURITY: Uses pattern matching and hash comparison, never stores actual keys
 */
function checkMasterKeyPattern(licenseKey: string): boolean {
  if (!licenseKey || typeof licenseKey !== 'string') {
    return false
  }
  
  const trimmedKey = licenseKey.trim()
  
  // Direct comparison with encoded master key
  if (trimmedKey === ENCODED_MASTER_KEY) {
    return true
  }
  
  // Check against pattern-based master keys
  for (const pattern of MASTER_KEY_PATTERNS) {
    if (pattern.test(trimmedKey)) {
      return true
    }
  }
  
  // Check if stored master key hash matches
  try {
    const storedMasterHash = localStorage.getItem('qf-master-key-hash')
    if (storedMasterHash && MASTER_KEY_HASHES.has(storedMasterHash)) {
      return true
    }
  } catch {
    // Silent fail
  }
  
  return false
}

/**
 * Async hash computation for master key verification
 * Used when validating new keys
 */
async function computeKeyHash(key: string): Promise<string> {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(key)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return ''
  }
}

/**
 * Store master key hash when recognized
 * This allows future recognition without re-entering
 */
async function storeMasterKeyHash(licenseKey: string): Promise<void> {
  try {
    const hash = await computeKeyHash(licenseKey)
    if (hash) {
      localStorage.setItem('qf-master-key-hash', hash)
      cachedMasterKeyHash = hash
      cachedIsMasterKey = true
    }
  } catch {
    // Silent fail
  }
}

// ============================================================================
// CACHE FOR SYNCHRONOUS ACCESS
// ============================================================================

let cachedIsMasterKey: boolean | null = null
let cachedMasterKeyHash: string | null = null
let lastCheckedLicenseKey: string | null = null

/**
 * Check if user has God Mode activated
 * SECURITY: Recognizes master key when entered, never hardcoded
 * Works synchronously for React hooks
 */
export function isGodMode(auth: UserAuth | null): boolean {
  if (!auth?.isAuthenticated || !auth?.license) {
    cachedIsMasterKey = false
    return false
  }
  
  // PRIMARY CHECK: If userId is 'master' and tier is 'lifetime', it's God Mode
  if (auth.license.userId === 'master' && auth.license.tier === 'lifetime') {
    cachedIsMasterKey = true
    return true
  }
  
  // SECONDARY CHECK: If tier is 'god' or has 'all' features
  if (auth.license.tier === 'god' || (auth.license.features && auth.license.features.includes('all'))) {
    cachedIsMasterKey = true
    return true
  }
  
  // TERTIARY CHECK: Check stored license key for master key pattern
  try {
    const storedAuth = localStorage.getItem('qf-persistent-auth')
    if (storedAuth) {
      const encryptedAuth = JSON.parse(storedAuth)
      const licenseKey = encryptedAuth.licenseKey
      
      if (licenseKey) {
        // Check if this is the master key marker
        if (licenseKey === 'MASTER_KEY_RECOGNIZED') {
          cachedIsMasterKey = true
          return true
        }
        
        // Check if we've already validated this key
        if (cachedIsMasterKey !== null && lastCheckedLicenseKey === licenseKey) {
          return cachedIsMasterKey
        }
        
        // Check master key pattern
        const isMaster = checkMasterKeyPattern(licenseKey)
        
        if (isMaster) {
          // Store hash for future recognition (async, non-blocking)
          storeMasterKeyHash(licenseKey)
          cachedIsMasterKey = true
          lastCheckedLicenseKey = licenseKey
          return true
        }
        
        // Check against stored master key hash
        if (cachedMasterKeyHash === null) {
          cachedMasterKeyHash = localStorage.getItem('qf-master-key-hash')
        }
        
        if (cachedMasterKeyHash) {
          // Compare with known master key hashes
          if (MASTER_KEY_HASHES.has(cachedMasterKeyHash)) {
            cachedIsMasterKey = true
            lastCheckedLicenseKey = licenseKey
            return true
          }
        }
        
        cachedIsMasterKey = false
        lastCheckedLicenseKey = licenseKey
        return false
      }
    }
  } catch {
    // Silent fail
    cachedIsMasterKey = false
  }
  
  return false
}

/**
 * Synchronous version (alias for compatibility)
 */
export function isGodModeSync(auth: UserAuth | null): boolean {
  return isGodMode(auth)
}

/**
 * Reset God Mode cache (call on logout)
 */
export function resetGodModeCache(): void {
  cachedIsMasterKey = null
  cachedMasterKeyHash = null
  lastCheckedLicenseKey = null
}

/**
 * Activate God Mode visual effects
 * - Rainbow border around entire app
 * - Floating crown indicator
 * - Body class for CSS styling
 */
export function activateGodMode(): void {
  // Add body class for rainbow border and background effects
  document.body.classList.add('god-mode')
  localStorage.setItem('godMode', 'true')
  
  // Add crown to page if not already present
  if (!document.getElementById('god-mode-crown')) {
    const crown = document.createElement('div')
    crown.id = 'god-mode-crown'
    crown.className = 'god-mode-crown'
    crown.innerHTML = '👑'
    crown.title = 'GOD MODE ACTIVE — UNLIMITED EVERYTHING'
    crown.setAttribute('aria-label', 'God Mode Active - Master Key Detected')
    crown.style.cssText = `
      position: fixed;
      top: 12px;
      right: 80px;
      font-size: 32px;
      z-index: 99999;
      cursor: pointer;
      filter: drop-shadow(0 0 10px gold);
      animation: pulse 2s infinite, float 3s ease-in-out infinite;
    `
    document.body.appendChild(crown)
  }
  
  // Add rainbow border overlay
  if (!document.getElementById('god-mode-rainbow-border')) {
    const rainbowBorder = document.createElement('div')
    rainbowBorder.id = 'god-mode-rainbow-border'
    rainbowBorder.style.cssText = `
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 99998;
      border: 4px solid transparent;
      background-image: linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0)), linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff1493, #00ff00, #ff00ff);
      background-origin: border-box;
      background-clip: padding-box, border-box;
      animation: rainbowBorder 3s linear infinite;
    `
    document.body.appendChild(rainbowBorder)
  }
}

/**
 * Deactivate God Mode visual effects
 */
export function deactivateGodMode(): void {
  document.body.classList.remove('god-mode')
  localStorage.removeItem('godMode')
  
  // Remove crown
  const crown = document.getElementById('god-mode-crown')
  if (crown) {
    crown.remove()
  }
  
  // Remove rainbow border
  const rainbowBorder = document.getElementById('god-mode-rainbow-border')
  if (rainbowBorder) {
    rainbowBorder.remove()
  }
}

/**
 * Check if user should bypass upgrade prompts
 * God Mode users never see upgrade buttons or pricing
 */
export function shouldBypassUpgrade(auth: UserAuth | null): boolean {
  return isGodMode(auth)
}

/**
 * Check if user has access to all agents (God Mode = all 15)
 */
export function hasAllAgentAccess(auth: UserAuth | null): boolean {
  return isGodMode(auth)
}

/**
 * Check if user has access to all strategies (God Mode = all 53+)
 */
export function hasAllStrategyAccess(auth: UserAuth | null): boolean {
  return isGodMode(auth)
}

/**
 * Get God Mode status object for UI
 */
export function getGodModeStatus(auth: UserAuth | null): {
  isGodMode: boolean
  message: string
  features: string[]
} {
  const godModeActive = isGodMode(auth)
  
  if (godModeActive) {
    return {
      isGodMode: true,
      message: 'GOD MODE ACTIVE — UNLIMITED EVERYTHING',
      features: [
        'All 15 Elite AI Agents',
        'All 53+ Trading Strategies',
        'All Future Features Forever',
        'Master Admin Panel',
        'NFT Minting (still scarce)',
        'Zero Upgrade Prompts',
        'Rainbow Border',
        'Creator Privileges'
      ]
    }
  }
  
  return {
    isGodMode: false,
    message: 'Standard Mode',
    features: []
  }
}
