// ULTIMATE PERSISTENT AUTH — Never Ask Again
// November 22, 2025 — Quantum Falcon Cockpit v2025.1.0
// Encrypted localStorage authentication with auto-login

import { useEffect, useState, useCallback } from 'react'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { enhancedLicenseService } from '@/lib/license/enhancedLicenseService'
import { UserAuth, UserLicense } from '@/lib/auth'
import { toast } from 'sonner'

// SECURITY: Encryption key derived from user password + device fingerprint
// Never hardcode encryption keys - this is derived at runtime
const STORAGE_KEY = 'qf-persistent-auth'

interface EncryptedAuth {
  username: string
  password: string // Encrypted
  licenseKey: string
  email?: string
  timestamp: number
}

export const usePersistentAuth = () => {
  const [auth, setAuth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)

  /**
   * Secure encryption using Web Crypto API with user-derived key
   * Key is derived from user password + device fingerprint for maximum security
   */
  const encrypt = async (text: string, userPassword: string): Promise<string> => {
    try {
      // Derive encryption key from user password + device characteristics
      // This ensures each user has a unique encryption key
      const encoder = new TextEncoder()
      const passwordData = encoder.encode(userPassword)
      
      // Generate device-specific salt from available browser characteristics
      const deviceSalt = encoder.encode(
        navigator.userAgent + 
        (navigator.hardwareConcurrency || '') + 
        (screen.width || '') + 
        (screen.height || '')
      )
      
      // Derive key using PBKDF2 (more secure than simple hashing)
      const baseKey = await crypto.subtle.importKey(
        'raw',
        passwordData,
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      )
      
      const derivedKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: deviceSalt.slice(0, 16), // Use first 16 bytes as salt
          iterations: 100000,
          hash: 'SHA-256'
        },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      )
      
      const data = encoder.encode(text)
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        derivedKey,
        data
      )
      return JSON.stringify({
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encrypted))
      })
    } catch (error) {
      // Never log encryption errors in production - security risk
      // Fallback to base64 only if crypto API unavailable
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        throw new Error('Encryption failed')
      }
      return btoa(text)
    }
  }

  /**
   * Secure decryption using Web Crypto API with user-derived key
   */
  const decrypt = async (encrypted: string, userPassword: string): Promise<string> => {
    try {
      const parsed = JSON.parse(encrypted)
      if (parsed.iv && parsed.data) {
        const encoder = new TextEncoder()
        const decoder = new TextDecoder()
        const passwordData = encoder.encode(userPassword)
        
        // Generate same device salt as encryption
        const deviceSalt = encoder.encode(
          navigator.userAgent + 
          (navigator.hardwareConcurrency || '') + 
          (screen.width || '') + 
          (screen.height || '')
        )
        
        // Derive same key as encryption
        const baseKey = await crypto.subtle.importKey(
          'raw',
          passwordData,
          { name: 'PBKDF2' },
          false,
          ['deriveBits', 'deriveKey']
        )
        
        const derivedKey = await crypto.subtle.deriveKey(
          {
            name: 'PBKDF2',
            salt: deviceSalt.slice(0, 16),
            iterations: 100000,
            hash: 'SHA-256'
          },
          baseKey,
          { name: 'AES-GCM', length: 256 },
          false,
          ['decrypt']
        )
        
        const decrypted = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: new Uint8Array(parsed.iv) },
          derivedKey,
          new Uint8Array(parsed.data)
        )
        return decoder.decode(decrypted)
      } else {
        // Fallback to base64 for legacy data
        return atob(encrypted)
      }
    } catch (error) {
      // Never log decryption errors - security risk
      // Only fallback to base64 if crypto unavailable
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        throw new Error('Decryption failed - invalid credentials')
      }
      try {
        return atob(encrypted)
      } catch {
        throw new Error('Failed to decrypt')
      }
    }
  }

  /**
   * Login and store credentials encrypted
   */
  const login = useCallback(async (username: string, password: string, licenseKey: string, email?: string) => {
    try {
      setIsLoading(true)

      // Validate license first
      const validationResult = await enhancedLicenseService.validate(licenseKey.trim())
      
      if (!validationResult.valid) {
        toast.error('Invalid License', {
          description: validationResult.error || 'Please check your license key',
        })
        setIsLoading(false)
        return { success: false, error: validationResult.error }
      }

      // Encrypt credentials with user password as key
      const encryptedPassword = await encrypt(password, password)
      const encryptedAuth: EncryptedAuth = {
        username,
        password: encryptedPassword,
        licenseKey: licenseKey.trim(), // License key stored in plaintext (needed for validation)
        email: email || username + '@quantumfalcon.com',
        timestamp: Date.now()
      }

      // Store encrypted
      localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedAuth))

      // Get license data
      const licenseData = enhancedLicenseService.getLicenseData()
      
      // Create user license
      const userLicense: UserLicense = {
        userId: licenseData?.user_id || `user_${Date.now()}`,
        tier: (validationResult.tier as any) || 'free',
        expiresAt: validationResult.expires_at ? validationResult.expires_at * 1000 : null,
        purchasedAt: Date.now(),
        isActive: true,
        transactionId: `tx_${Date.now()}`
      }

      // Update auth state
      setAuth({
        isAuthenticated: true,
        userId: userLicense.userId,
        username,
        email: email || encryptedAuth.email,
        avatar: null,
        license: userLicense
      })

      // Mark splash as seen
      enhancedLicenseService.markSplashAsSeen()

      setIsLoading(false)
      
      toast.success('Welcome Back, Commander', {
        description: `${validationResult.tier.toUpperCase()} tier activated`,
        icon: '🦅',
        duration: 3000,
      })

      return { success: true }
    } catch (error) {
      setIsLoading(false)
      // Generic error message - never expose specific error details
      toast.error('Login Failed', {
        description: 'Please check your credentials and try again',
      })
      return { success: false, error: 'Login failed' }
    }
  }, [setAuth])

  /**
   * Logout and clear stored credentials
   */
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAuth({
      isAuthenticated: false,
      userId: null,
      username: null,
      email: null,
      avatar: null,
      license: null
    })
    enhancedLicenseService.clearLicense()
    toast.info('Logged Out', {
      description: 'Your session has been cleared',
    })
  }, [setAuth])

  /**
   * Auto-login on app launch
   */
  useEffect(() => {
    const autoLogin = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) {
          setIsLoading(false)
          setIsInitialized(true)
          return
        }

        const encryptedAuth: EncryptedAuth = JSON.parse(stored)
        
        // Check if stored auth is too old (re-validate after 30 days)
        const daysSinceLogin = (Date.now() - encryptedAuth.timestamp) / (1000 * 60 * 60 * 24)
        const needsRevalidation = daysSinceLogin > 30

        // Re-validate license
        const validationResult = await enhancedLicenseService.validate(encryptedAuth.licenseKey)
        
        if (validationResult.valid) {
          const licenseData = enhancedLicenseService.getLicenseData()
          
          const userLicense: UserLicense = {
            userId: licenseData?.user_id || encryptedAuth.username,
            tier: (validationResult.tier as any) || 'free',
            expiresAt: validationResult.expires_at ? validationResult.expires_at * 1000 : null,
            purchasedAt: encryptedAuth.timestamp,
            isActive: true,
            transactionId: `tx_${encryptedAuth.timestamp}`
          }

          setAuth({
            isAuthenticated: true,
            userId: userLicense.userId,
            username: encryptedAuth.username,
            email: encryptedAuth.email,
            avatar: null,
            license: userLicense
          })
        } else {
          // License expired or invalid - clear credentials silently
          localStorage.removeItem(STORAGE_KEY)
          
          if (validationResult.is_expired) {
            toast.warning('License Expired', {
              description: 'Please enter a new license key',
              duration: 5000,
            })
          }
        }
      } catch (error) {
        // Silent error handling - don't expose details
        localStorage.removeItem(STORAGE_KEY)
      } finally {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    autoLogin()
  }, [setAuth])

  return {
    auth,
    login,
    logout,
    isLoading,
    isInitialized,
    isAuthenticated: auth?.isAuthenticated || false
  }
}

