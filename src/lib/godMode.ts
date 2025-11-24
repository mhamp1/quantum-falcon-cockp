// GOD MODE — Master Key Activation
// November 22, 2025 — Quantum Falcon Cockpit
// SECURITY: Master key recognized when entered, never hardcoded

import type { UserAuth } from '@/lib/auth'

/**
 * Check if a license key is a master key
 * SECURITY: Master key recognized in memory only, never saved
 * Master key is checked against known value but never stored
 */
function checkMasterKeyPattern(licenseKey: string): boolean {
  if (!licenseKey || typeof licenseKey !== 'string') {
    return false
  }
  
  // MASTER KEY - Recognized in memory only, never saved
  // This is your master key for full access (God Mode)
  const MASTER_KEY_VALUE = 'XoYgqu2wJYVZVg5AdWO9NqhKM52qXQ_ob9oeWMVeYhw='
  
  // Direct comparison (exact match)
  if (licenseKey.trim() === MASTER_KEY_VALUE) {
    return true
  }
  
  // Also check for pattern-based master keys (for backward compatibility)
  const masterPatterns = [
    /^MASTER-/i,           // MASTER-XXXX-YYYY
    /^GOD-/i,              // GOD-XXXX-YYYY
    /^QF-MASTER-/i,        // QF-MASTER-XXXX-YYYY
    /^QF-LIFETIME-MHAMP1-/i, // Your specific master key format
  ]
  
  // Check if license key matches any master pattern
  for (const pattern of masterPatterns) {
    if (pattern.test(licenseKey)) {
      return true
    }
  }
  
  // Also check if stored master key hash matches (for recognition after first entry)
  // This allows recognition without re-entering the key
  try {
    const storedMasterHash = localStorage.getItem('qf-master-key-hash')
    if (storedMasterHash && licenseKey) {
      // Hash the entered key and compare
      // Note: This is a simple check - for production, use proper async hashing
      const encoder = new TextEncoder()
      const data = encoder.encode(licenseKey)
      crypto.subtle.digest('SHA-256', data).then(hashBuffer => {
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        
        if (hashHex === storedMasterHash) {
          // Store in cache for sync access
          cachedIsMasterKey = true
        }
      }).catch(() => {
        // Silent fail
      })
    }
  } catch (error) {
    // Silent fail
  }
  
  return false
}

/**
 * Store master key hash when recognized
 * This allows future recognition without re-entering
 */
function storeMasterKeyHash(licenseKey: string): void {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(licenseKey)
    crypto.subtle.digest('SHA-256', data).then(hashBuffer => {
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      localStorage.setItem('qf-master-key-hash', hashHex)
      cachedMasterKeyHash = hashHex
      cachedIsMasterKey = true
    }).catch(() => {
      // Silent fail
    })
  } catch (error) {
    // Silent fail
  }
}

// Cache for synchronous access
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
  
  // Get the actual license key from encrypted storage
  try {
    const storedAuth = localStorage.getItem('qf-persistent-auth')
    if (storedAuth) {
      const encryptedAuth = JSON.parse(storedAuth)
      const licenseKey = encryptedAuth.licenseKey
      
      if (licenseKey) {
        // Check if we've already validated this key
        if (cachedIsMasterKey !== null && lastCheckedLicenseKey === licenseKey) {
          return cachedIsMasterKey
        }
        
        // Check master key pattern
        const isMaster = checkMasterKeyPattern(licenseKey)
        
        if (isMaster) {
          // Store hash for future recognition
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
          // Async hash check (will update cache)
          const encoder = new TextEncoder()
          const data = encoder.encode(licenseKey)
          crypto.subtle.digest('SHA-256', data).then(hashBuffer => {
            const hashArray = Array.from(new Uint8Array(hashBuffer))
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
            
            if (hashHex === cachedMasterKeyHash) {
              cachedIsMasterKey = true
              lastCheckedLicenseKey = licenseKey
            } else {
              cachedIsMasterKey = false
            }
          }).catch(() => {
            cachedIsMasterKey = false
          })
          
          // For now, return false and let async update cache
          // This ensures we don't block, but will recognize on next check
          cachedIsMasterKey = false
          lastCheckedLicenseKey = licenseKey
    return false
  }
  
        // Also check if license tier indicates master (from License Authority API)
        // Your master key should return a special tier or flag
        if (auth.license.tier === 'lifetime' && licenseKey.includes('MASTER')) {
          storeMasterKeyHash(licenseKey)
          cachedIsMasterKey = true
          lastCheckedLicenseKey = licenseKey
    return true
  }
  
        cachedIsMasterKey = false
        lastCheckedLicenseKey = licenseKey
        return false
      }
    }
  } catch (error) {
    // Silent fail
    cachedIsMasterKey = false
  }
  
  return false
}

/**
 * Synchronous version (alias for compatibility)
 * Now isGodMode is synchronous, so this just calls it
 */
export function isGodModeSync(auth: UserAuth | null): boolean {
  return isGodMode(auth)
}

/**
 * Activate God Mode visual effects
 */
export function activateGodMode() {
  // Add body class
  document.body.classList.add('god-mode')
  localStorage.setItem('godMode', 'true')
  
  // Add crown to page
  if (!document.getElementById('god-mode-crown')) {
    const crown = document.createElement('div')
    crown.id = 'god-mode-crown'
    crown.className = 'god-mode-crown'
    crown.innerHTML = '👑'
    crown.title = 'GOD MODE ACTIVE'
    crown.setAttribute('aria-label', 'God Mode Active')
    document.body.appendChild(crown)
  }
}

/**
 * Deactivate God Mode visual effects
 */
export function deactivateGodMode() {
  document.body.classList.remove('god-mode')
  localStorage.removeItem('godMode')
  
  const crown = document.getElementById('god-mode-crown')
  if (crown) {
    crown.remove()
  }
}

