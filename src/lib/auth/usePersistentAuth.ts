// ULTIMATE PERSISTENT AUTH — Never Ask Again
// November 22, 2025 — Quantum Falcon Cockpit v2025.1.0
// Encrypted localStorage authentication with auto-login

import { useEffect, useState, useCallback } from 'react'
import { enhancedLicenseService } from '@/lib/license/enhancedLicenseService'
import { UserAuth, UserLicense } from '@/lib/auth'
import { toast } from 'sonner'

// SECURITY: Encryption key derived from user password + device fingerprint
// Never hardcode encryption keys - this is derived at runtime
const STORAGE_KEY = 'qf-persistent-auth'

const initialAuthState: UserAuth = {
  isAuthenticated: false,
  userId: null,
  username: null,
  email: null,
  avatar: null,
  license: null
}

type AuthStoreState = {
  auth: UserAuth
  isLoading: boolean
  isInitialized: boolean
}

let authStoreState: AuthStoreState = {
  auth: initialAuthState,
  isLoading: true,
  isInitialized: false
}

const authSubscribers = new Set<() => void>()
const notifySubscribers = () => {
  authSubscribers.forEach(listener => listener())
}

const updateAuthStore = (partial: Partial<AuthStoreState>) => {
  authStoreState = { ...authStoreState, ...partial }
  notifySubscribers()
}

const setAuthState = (updater: UserAuth | ((prev: UserAuth) => UserAuth)) => {
  const nextAuth = typeof updater === 'function'
    ? (updater as (prev: UserAuth) => UserAuth)(authStoreState.auth)
    : updater
  updateAuthStore({ auth: nextAuth })
}

const setLoadingState = (value: boolean) => updateAuthStore({ isLoading: value })
const setInitializedState = (value: boolean) => updateAuthStore({ isInitialized: value })

let autoLoginInitialized = false

interface EncryptedAuth {
  username: string
  password: string // Encrypted
  licenseKey: string
  email?: string
  timestamp: number
}

export const usePersistentAuth = () => {
  const [, forceRerender] = useState(0)

  useEffect(() => {
    const listener = () => forceRerender(prev => prev + 1)
    authSubscribers.add(listener)
    return () => {
      authSubscribers.delete(listener)
    }
  }, [])

  const auth = authStoreState.auth
  const isLoading = authStoreState.isLoading
  const isInitialized = authStoreState.isInitialized

  const setAuth = useCallback((updater: UserAuth | ((prev: UserAuth) => UserAuth)) => {
    setAuthState(updater)
  }, [])

  const setIsLoading = useCallback((value: boolean) => {
    setLoadingState(value)
  }, [])

  const setIsInitialized = useCallback((value: boolean) => {
    setInitializedState(value)
  }, [])

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
   * SECURITY: Master key recognized but never saved
   */
  const login = useCallback(async (username: string, password: string, licenseKey: string, email?: string) => {
    try {
      setIsLoading(true)

      // MASTER KEY CHECK - Recognized FIRST, before any validation
      // This ensures master key always gets proper recognition
      const MASTER_KEY = 'XoYgqu2wJYVZVg5AdWO9NqhKM52qXQ_ob9oeWMVeYhw='
      const isMasterKey = licenseKey.trim() === MASTER_KEY
      
      // If master key, skip validation and create master result directly
      let validationResult: any
      if (isMasterKey) {
        // Master key - create validation result directly
        validationResult = {
          valid: true,
          tier: 'lifetime',
          expires_at: undefined,
          user_id: 'master',
          features: ['all'],
          max_agents: -1,
          max_strategies: -1,
          strategies: 'all',
          is_grace_period: false,
          is_expired: false,
          auto_renew: false,
          token: 'master-token',
          validated_at: new Date().toISOString(),
          hardware_bound: false,
        }
      } else {
        // Regular license - validate with API
        validationResult = await enhancedLicenseService.validate(licenseKey.trim())
        
        if (!validationResult.valid) {
          toast.error('Invalid License', {
            description: validationResult.error || 'Please check your license key',
          })
          setIsLoading(false)
          return { success: false, error: validationResult.error }
        }
      }

      // Encrypt credentials with user password as key
      // SECURITY: Master key never saved - only recognized in memory
      const encryptedPassword = await encrypt(password, password)
      const encryptedAuth: EncryptedAuth = {
        username,
        password: encryptedPassword,
        licenseKey: isMasterKey ? '' : licenseKey.trim(), // Master key never stored
        email: email || username + '@quantumfalcon.com',
        timestamp: Date.now()
      }

      // Store encrypted auth (master key uses marker 'MASTER_KEY_RECOGNIZED')
      // Always store - master key uses marker instead of actual key
      const authToStore = isMasterKey 
        ? { ...encryptedAuth, licenseKey: 'MASTER_KEY_RECOGNIZED' }
        : encryptedAuth
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authToStore))

      // Get license data
      const licenseData = enhancedLicenseService.getLicenseData()
      
      // Determine tier and userId - prioritize master key recognition
      let finalTier = validationResult.tier || 'free'
      let finalUserId = licenseData?.user_id || `user_${Date.now()}`
      
      if (isMasterKey) {
        finalTier = 'lifetime' // Master key always gets lifetime tier
        finalUserId = 'master' // Master key always gets master userId (for creator privileges)
      }
      
      // Create user license
      const userLicense: UserLicense = {
        userId: finalUserId,
        tier: finalTier as 'free' | 'starter' | 'trader' | 'pro' | 'elite' | 'lifetime',
        expiresAt: isMasterKey ? null : (validationResult.expires_at ? validationResult.expires_at * 1000 : null),
        purchasedAt: Date.now(),
        isActive: true,
        transactionId: isMasterKey ? 'master-token' : `tx_${Date.now()}`,
        features: isMasterKey ? ['all'] : (validationResult.features || [])
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

      // Ensure loading and initialization states are set
      setIsLoading(false)
      setIsInitialized(true)
      
      // Small delay to ensure state propagation
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // Show appropriate message based on tier
      const tierMessage = isMasterKey 
        ? 'MASTER KEY ACTIVATED • Creator privileges enabled • God Mode active'
        : `${finalTier.toUpperCase()} tier activated`
      
      toast.success('Welcome Back, Commander', {
        description: tierMessage,
        icon: isMasterKey ? '👑' : '🦅',
        duration: 5000,
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
   * Immediately returns to login page without loading state
   */
  const logout = useCallback(() => {
    // Clear all auth-related storage
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem('qf-master-key-hash')
    localStorage.removeItem('justLoggedIn')
    
    // Clear license service
    enhancedLicenseService.clearLicense()
    
    // Immediately set auth state to logged out
    setAuth({
      isAuthenticated: false,
      userId: null,
      username: null,
      email: null,
      avatar: null,
      license: null
    })
    
    // CRITICAL: Set initialized to true immediately to prevent loading state
    setIsInitialized(true)
    setIsLoading(false)
    
    toast.info('Logged Out', {
      description: 'Your session has been cleared',
      duration: 2000,
    })
  }, [setAuth])

  /**
   * Auto-login on app launch
   */
  useEffect(() => {
    if (autoLoginInitialized) {
      return
    }
    autoLoginInitialized = true

    const autoLogin = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) {
          // No stored auth - ensure clean state
          setAuth({
            isAuthenticated: false,
            userId: null,
            username: null,
            email: null,
            avatar: null,
            license: null
          })
          setIsLoading(false)
          setIsInitialized(true)
          return
        }

        const encryptedAuth: EncryptedAuth = JSON.parse(stored)
        
        // Check if this is a free tier login
        const isFreeTier = encryptedAuth.licenseKey === 'free-tier'
        
        // Handle free tier - no validation needed
        if (isFreeTier) {
          const freeLicense = enhancedLicenseService.getLicenseData()
          const userLicense: UserLicense = {
            userId: freeLicense?.user_id || `free_${encryptedAuth.timestamp}`,
            tier: 'free',
            expiresAt: null,
            purchasedAt: encryptedAuth.timestamp,
            isActive: true,
            transactionId: 'free-tier'
          }

          setAuth({
            isAuthenticated: true,
            userId: userLicense.userId,
            username: encryptedAuth.username,
            email: encryptedAuth.email,
            avatar: null,
            license: userLicense
          })
          setIsLoading(false)
          setIsInitialized(true)
          return
        }
        
        // Check if this is a master key recognition marker
        // Master key is never stored, only a marker is saved
        const isMasterKey = encryptedAuth.licenseKey === 'MASTER_KEY_RECOGNIZED'
        
        // For master key, create validation result directly
        if (isMasterKey) {
          const userLicense: UserLicense = {
            userId: 'master', // CRITICAL: Must be 'master' for creator privileges
            tier: 'lifetime', // CRITICAL: Must be 'lifetime' for God Mode
            expiresAt: null,
            purchasedAt: encryptedAuth.timestamp,
            isActive: true,
            transactionId: 'master-token',
            features: ['all'] // All features including creator tabs
          }

          setAuth({
            isAuthenticated: true,
            userId: 'master', // Ensure userId is 'master'
            username: encryptedAuth.username,
            email: encryptedAuth.email,
            avatar: null,
            license: userLicense
          })
          setIsLoading(false)
          setIsInitialized(true)
          return
        }
        
        // Check if stored auth is too old (re-validate after 30 days)
        const daysSinceLogin = (Date.now() - encryptedAuth.timestamp) / (1000 * 60 * 60 * 24)
        const needsRevalidation = daysSinceLogin > 30

        // Re-validate license (with shorter timeout for faster initialization)
        const validationPromise = enhancedLicenseService.validate(encryptedAuth.licenseKey)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Validation timeout')), 3000) // Reduced from 10s to 3s
        )
        
        const validationResult = await Promise.race([validationPromise, timeoutPromise]) as any
        
        if (validationResult && validationResult.valid) {
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
          
          // Ensure auth state is cleared
          setAuth({
            isAuthenticated: false,
            userId: null,
            username: null,
            email: null,
            avatar: null,
            license: null
          })
          
          if (validationResult?.is_expired) {
            toast.warning('License Expired', {
              description: 'Please enter a new license key',
              duration: 5000,
            })
          }
        }
      } catch (error) {
        // Silent error handling - don't expose details
        // If validation fails, still allow user to proceed (they can re-login)
        // Don't remove stored auth on timeout - allow offline mode
        if (error instanceof Error && !error.message.includes('timeout')) {
          localStorage.removeItem(STORAGE_KEY)
          // Ensure auth state is cleared on error
          setAuth({
            isAuthenticated: false,
            userId: null,
            username: null,
            email: null,
            avatar: null,
            license: null
          })
        }
      } finally {
        // Always set initialized quickly, even on error or timeout
        // CRITICAL: Ensure auth state is always set (even if null) to prevent black screen
        setAuth(prev => {
          // If auth is already set, keep it; otherwise set to logged out state
          if (prev && prev.isAuthenticated) {
            return prev
          }
          return {
            isAuthenticated: false,
            userId: null,
            username: null,
            email: null,
            avatar: null,
            license: null
          }
        })
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
    isAuthenticated: auth?.isAuthenticated || false,
    setAuth,
  }
}

