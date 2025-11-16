/**
 * Hash utility for generating SHA-256 hashes
 * Used for version hashing and proof of viewing
 */

/**
 * Generate a simple hash from a string using the Web Crypto API
 * Falls back to a simple hash function if crypto is not available
 */
export async function hashString(str: string): Promise<string> {
  // Check if we're in a browser environment with crypto API
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(str)
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      return hashHex
    } catch (error) {
      console.warn('Crypto API failed, falling back to simple hash:', error)
    }
  }
  
  // Fallback to simple hash for non-browser or failed crypto
  return simpleHash(str)
}

/**
 * Simple hash function fallback for when crypto API is not available
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

/**
 * Synchronous version for immediate use (uses simple hash)
 */
export function hashStringSync(str: string): string {
  return simpleHash(str)
}
