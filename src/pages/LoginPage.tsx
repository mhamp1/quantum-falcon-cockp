// ULTIMATE LOGIN PAGE — 3-Step Flow with Zero Friction
// November 25, 2025 — Quantum Falcon Cockpit v2025.1.0
// Step 1: Create Account → Step 2: Verify Email → Step 3: Enter License → DONE FOREVER

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePersistentAuth } from '@/lib/auth/usePersistentAuth'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { enhancedLicenseService } from '@/lib/license/enhancedLicenseService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Eye, EyeSlash, Key, User, Lock, Sparkle, ArrowRight, 
  ShieldCheck, Play, Envelope, CheckCircle, ArrowLeft,
  Warning, Lightning, Crown
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { InputSanitizer } from '@/lib/security/inputSanitizer'
import {
  registerUser,
  verifyEmail,
  loginUser,
  linkLicense,
  isAuthenticated as checkAuthToken,
  resendVerificationCode,
} from '@/lib/api/authApi'

type AuthStep = 'login' | 'register' | 'verify' | 'license'

export default function LoginPage() {
  const { login, isLoading, isAuthenticated, isInitialized, auth, setAuth } = usePersistentAuth()
  const [hasSeenOnboarding, setHasSeenOnboarding] = useKV<boolean>('hasSeenOnboarding', false)
  
  // Current step in auth flow
  const [step, setStep] = useState<AuthStep>('login')
  
  // Form fields
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [licenseKey, setLicenseKey] = useState('')
  
  // UI state
  const [showPassword, setShowPassword] = useState(false)
  const [showLicense, setShowLicense] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [resendCooldown, setResendCooldown] = useState(0)
  
  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])
  
  // Handle free tier bypass
  const handleFreeTierContinue = useCallback(async () => {
    try {
      setIsSubmitting(true)
      
      const freeUserId = `free_${Date.now()}`
      const freeLicense = enhancedLicenseService.createFreeTierLicense(freeUserId)
      
      // Store auth data
      const freeAuthData = {
        username: 'Free User',
        password: '',
        licenseKey: 'free-tier',
        email: 'free@quantumfalcon.com',
        timestamp: Date.now()
      }
      
      try {
        localStorage.setItem('qf-persistent-auth', JSON.stringify(freeAuthData))
      } catch (e) {
        // Silent fail
      }
      
      setAuth({
        isAuthenticated: true,
        userId: freeUserId,
        username: 'Free User',
        email: 'free@quantumfalcon.com',
        avatar: null,
        license: {
          userId: freeUserId,
          tier: 'free',
          expiresAt: null,
          purchasedAt: Date.now(),
          isActive: true,
          transactionId: 'free-tier',
          features: freeLicense.features
        }
      })
      
      setHasSeenOnboarding(true)
      try {
        window.localStorage.setItem('hasSeenOnboarding', 'true')
        window.localStorage.setItem('justLoggedIn', 'true')
      } catch (e) {
        // Silent fail
      }
      
      enhancedLicenseService.markSplashAsSeen()
      setIsSubmitting(false)
      
      toast.success('Welcome to Quantum Falcon', {
        description: 'Free tier activated • Paper trading mode enabled',
        icon: '🦅',
        duration: 2000,
      })
    } catch (error) {
      setIsSubmitting(false)
      toast.error('Failed to continue', {
        description: 'Please try again',
      })
    }
  }, [setAuth, setHasSeenOnboarding])
  
  // Handle registration
  const handleRegister = async () => {
    // Validation
    if (!username.trim()) {
      toast.error('Username required')
      return
    }
    if (!email.trim() || !InputSanitizer.validateEmail(email)) {
      toast.error('Valid email required')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    
    setIsSubmitting(true)
    
    const result = await registerUser({
      username: InputSanitizer.sanitizeHTML(username.trim()),
      email: email.trim().toLowerCase(),
      password: password,
    })
    
    setIsSubmitting(false)
    
    if (result.success) {
      setUserId(result.userId || null)
      setStep('verify')
      setResendCooldown(60)
      toast.success('Account created!', {
        description: 'Check your email for verification code',
      })
    } else {
      toast.error('Registration failed', {
        description: result.error || 'Please try again',
      })
    }
  }
  
  // Handle email verification
  const handleVerifyEmail = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Enter 6-digit code')
      return
    }
    
    setIsSubmitting(true)
    
    const result = await verifyEmail({
      email: email.trim().toLowerCase(),
      code: verificationCode,
    })
    
    setIsSubmitting(false)
    
    if (result.success && result.verified) {
      setStep('license')
      toast.success('Email verified!', {
        description: 'Now enter your license key',
      })
    } else {
      toast.error('Verification failed', {
        description: result.error || 'Invalid code',
      })
    }
  }
  
  // Handle license key entry
  const handleLicenseSubmit = async () => {
    if (!licenseKey.trim()) {
      toast.error('License key required')
      return
    }
    
    setIsSubmitting(true)
    
    // Link license to account
    const linkResult = await linkLicense({
      userId: userId || `user_${Date.now()}`,
      licenseKey: InputSanitizer.sanitizeHTML(licenseKey.trim()),
    })
    
    if (!linkResult.success) {
      setIsSubmitting(false)
      toast.error('Invalid license', {
        description: linkResult.error || 'Please check your license key',
      })
      return
    }
    
    // Complete login with license
    const loginResult = await login(
      username || email.split('@')[0],
      password,
      licenseKey.trim(),
      email
    )
    
    setIsSubmitting(false)
    
    if (loginResult.success) {
      try {
        window.localStorage.setItem('justLoggedIn', 'true')
      } catch (e) {
        // Silent fail
      }
      // Dashboard will show automatically
    }
  }
  
  // Handle existing user login
  const handleLogin = async () => {
    if (!email.trim()) {
      toast.error('Email required')
      return
    }
    if (!password.trim()) {
      toast.error('Password required')
      return
    }
    
    setIsSubmitting(true)
    
    const result = await loginUser({
      email: email.trim().toLowerCase(),
      password: password,
    })
    
    if (result.success && result.user) {
      // Check if license is linked
      if (result.user.licenseKey) {
        // Has license - complete login
        const loginResult = await login(
          result.user.username,
          password,
          result.user.licenseKey,
          result.user.email
        )
        
        setIsSubmitting(false)
        
        if (loginResult.success) {
          try {
            window.localStorage.setItem('justLoggedIn', 'true')
          } catch (e) {
            // Silent fail
          }
        }
      } else {
        // No license yet - go to license step
        setUserId(result.user.id)
        setUsername(result.user.username)
        setStep('license')
        setIsSubmitting(false)
        toast.info('Welcome back!', {
          description: 'Enter your license key to continue',
        })
      }
    } else {
      setIsSubmitting(false)
      toast.error('Login failed', {
        description: result.error || 'Invalid credentials',
      })
    }
  }
  
  // Handle resend verification code
  const handleResendCode = async () => {
    if (resendCooldown > 0) return
    
    const result = await resendVerificationCode(email.trim().toLowerCase())
    
    if (result.success) {
      setResendCooldown(60)
      toast.success('Code sent!', {
        description: 'Check your email',
      })
    } else {
      toast.error('Failed to resend', {
        description: result.error,
      })
    }
  }
  
  // Loading/authenticated state - NEVER show white/black screen
  if (!isInitialized || isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        {/* Animated Background - Always visible */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-cyan-900/20" />
        <div className="absolute inset-0 diagonal-stripes opacity-5" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-muted-foreground text-sm uppercase tracking-wider"
          >
            {isAuthenticated ? 'Loading dashboard...' : 'Initializing Quantum Falcon...'}
          </motion.p>
        </div>
      </div>
    )
  }
  
  // Step indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {['register', 'verify', 'license'].map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            (step === 'login' && s === 'register') || step === s 
              ? 'bg-primary text-background' 
              : i < ['register', 'verify', 'license'].indexOf(step)
                ? 'bg-accent text-background'
                : 'bg-muted text-muted-foreground'
          }`}>
            {i < ['register', 'verify', 'license'].indexOf(step) ? (
              <CheckCircle size={16} weight="bold" />
            ) : (
              i + 1
            )}
          </div>
          {i < 2 && (
            <div className={`w-12 h-0.5 mx-1 transition-all ${
              i < ['register', 'verify', 'license'].indexOf(step) ? 'bg-accent' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-cyan-900/20" />
      <div className="absolute inset-0 diagonal-stripes opacity-5" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 max-w-md w-full mx-4"
      >
        {/* Title */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-black uppercase tracking-wider mb-2"
            style={{
              background: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 50%, #00d4ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textShadow: '0 0 40px rgba(0,212,255,0.5)',
            }}
          >
            QUANTUM FALCON
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-cyan-400 text-sm uppercase tracking-wider mt-2 flex items-center justify-center gap-2"
          >
            <Sparkle size={16} weight="fill" className="text-purple-400" />
            {step === 'login' ? 'Welcome Back' : 
             step === 'register' ? 'Create Your Account' :
             step === 'verify' ? 'Verify Your Email' :
             'Link Your License'}
            <Sparkle size={16} weight="fill" className="text-purple-400" />
          </motion.p>
        </div>

        {/* Step Indicator - Only show for registration flow */}
        {step !== 'login' && <StepIndicator />}

        {/* Main Form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="cyber-card p-8 border-2 border-primary/50 relative overflow-hidden"
          >
            <div className="absolute inset-0 diagonal-stripes opacity-5" />
            <div className="relative z-10 space-y-4">
              
              {/* LOGIN STEP */}
              {step === 'login' && (
                <>
                  {/* Username */}
                  <div>
                    <Label className="text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                      <User size={14} weight="duotone" className="text-primary" />
                      Username
                    </Label>
                    <Input
                      type="text"
                      placeholder="Your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-6 py-4 bg-background/60 border-2 border-primary/50 rounded-lg"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  {/* Password */}
                  <div>
                    <Label className="text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                      <Lock size={14} weight="duotone" className="text-primary" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-6 py-4 pr-12 bg-background/60 border-2 border-primary/50 rounded-lg"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                      >
                        {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* License Key */}
                  <div>
                    <Label className="text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                      <Crown size={14} weight="fill" className="text-purple-400" />
                      License Key
                    </Label>
                    <div className="relative">
                      <Input
                        type={showLicense ? 'text' : 'password'}
                        placeholder="Enter your license key"
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value)}
                        className="w-full px-6 py-4 pr-12 bg-background/60 border-2 border-purple-500/50 rounded-lg font-mono"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLicense(!showLicense)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                      >
                        {showLicense ? <EyeSlash size={20} /> : <Key size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Login Button */}
                  <Button
                    onClick={async () => {
                      if (!username.trim()) {
                        toast.error('Username required')
                        return
                      }
                      if (!password.trim()) {
                        toast.error('Password required')
                        return
                      }
                      if (!licenseKey.trim()) {
                        toast.error('License key required')
                        return
                      }
                      
                      setIsSubmitting(true)
                      
                      // Direct login with all credentials
                      const result = await login(
                        username.trim(),
                        password,
                        licenseKey.trim(),
                        email || `${username.trim().toLowerCase()}@quantumfalcon.com`
                      )
                      
                      setIsSubmitting(false)
                      
                      if (result.success) {
                        try {
                          window.localStorage.setItem('justLoggedIn', 'true')
                        } catch (e) {
                          // Silent fail
                        }
                      }
                    }}
                    disabled={isSubmitting || !username.trim() || !password.trim() || !licenseKey.trim()}
                    className="w-full h-14 text-sm sm:text-base md:text-lg font-black uppercase tracking-wider
                             bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500
                             hover:from-cyan-400 hover:via-purple-400 hover:to-cyan-400
                             border-2 border-primary/50 shadow-[0_0_30px_rgba(0,212,255,0.4)]
                             transition-all jagged-corner disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        <span className="hidden sm:inline">Logging in...</span>
                        <span className="sm:hidden">Loading...</span>
                      </>
                    ) : (
                      <>
                        <span className="hidden sm:inline">ENTER COCKPIT</span>
                        <span className="sm:hidden">ENTER</span>
                        <ArrowRight size={18} className="ml-2" />
                      </>
                    )}
                  </Button>
                  
                  {/* Divider */}
                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground uppercase">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  
                  {/* Create Account Button - Require email */}
                  <Button
                    onClick={() => setStep('register')}
                    disabled={isSubmitting}
                    variant="ghost"
                    className="w-full h-12 text-sm font-bold uppercase tracking-wider
                             border-2 border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-500/10"
                  >
                    <User size={16} className="mr-2" />
                    Create Free Account
                  </Button>
                </>
              )}
              
              {/* REGISTER STEP */}
              {step === 'register' && (
                <>
                  {/* Back Button */}
                  <button
                    onClick={() => setStep('login')}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2"
                  >
                    <ArrowLeft size={14} />
                    Back to login
                  </button>
                  
                  {/* Username */}
                  <div>
                    <Label className="text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                      <User size={14} weight="duotone" className="text-primary" />
                      Username
                    </Label>
                    <Input
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-6 py-4 bg-background/60 border-2 border-primary/50 rounded-lg"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  {/* Email */}
                  <div>
                    <Label className="text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                      <Envelope size={14} weight="duotone" className="text-primary" />
                      Email
                    </Label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-6 py-4 bg-background/60 border-2 border-primary/50 rounded-lg"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  {/* Password */}
                  <div>
                    <Label className="text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                      <Lock size={14} weight="duotone" className="text-primary" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min 8 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-6 py-4 pr-12 bg-background/60 border-2 border-primary/50 rounded-lg"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                      >
                        {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Confirm Password */}
                  <div>
                    <Label className="text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                      <Lock size={14} weight="duotone" className="text-primary" />
                      Confirm Password
                    </Label>
                    <Input
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-6 py-4 bg-background/60 border-2 border-primary/50 rounded-lg"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  {/* Register Button */}
                  <Button
                    onClick={handleRegister}
                    disabled={isSubmitting || !username.trim() || !email.trim() || password.length < 8 || password !== confirmPassword}
                    className="w-full h-14 text-lg font-black uppercase tracking-wider
                             bg-gradient-to-r from-accent via-purple-500 to-accent
                             hover:from-accent/80 hover:via-purple-400 hover:to-accent/80
                             border-2 border-accent/50 shadow-[0_0_30px_rgba(0,255,128,0.3)]
                             transition-all jagged-corner disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        CREATE ACCOUNT
                        <ArrowRight size={18} className="ml-2" />
                      </>
                    )}
                  </Button>
                </>
              )}
              
              {/* VERIFY EMAIL STEP */}
              {step === 'verify' && (
                <>
                  {/* Back Button */}
                  <button
                    onClick={() => setStep('register')}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2"
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>
                  
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Envelope size={32} className="text-primary" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      We sent a verification code to:
                    </p>
                    <p className="font-bold text-primary">{email}</p>
                  </div>
                  
                  {/* Verification Code */}
                  <div>
                    <Label className="text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                      <Key size={14} weight="duotone" className="text-accent" />
                      6-Digit Code
                    </Label>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-6 py-4 bg-background/60 border-2 border-accent/50 rounded-lg text-center text-2xl tracking-[0.5em] font-mono"
                      disabled={isSubmitting}
                      maxLength={6}
                    />
                  </div>
                  
                  {/* Verify Button */}
                  <Button
                    onClick={handleVerifyEmail}
                    disabled={isSubmitting || verificationCode.length !== 6}
                    className="w-full h-14 text-lg font-black uppercase tracking-wider
                             bg-gradient-to-r from-accent via-green-500 to-accent
                             hover:from-accent/80 hover:via-green-400 hover:to-accent/80
                             border-2 border-accent/50 shadow-[0_0_30px_rgba(0,255,128,0.3)]
                             transition-all jagged-corner disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} className="mr-2" />
                        VERIFY EMAIL
                      </>
                    )}
                  </Button>
                  
                  {/* Resend Code */}
                  <button
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0}
                    className="w-full text-sm text-muted-foreground hover:text-primary transition disabled:opacity-50"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}
                  </button>
                </>
              )}
              
              {/* LICENSE STEP */}
              {step === 'license' && (
                <>
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Key size={32} className="text-purple-400" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Almost there! Enter your license key:
                    </p>
                    <p className="text-xs text-muted-foreground">
                      (You only need to do this once — ever)
                    </p>
                  </div>
                  
                  {/* License Key */}
                  <div>
                    <Label className="text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                      <Crown size={14} weight="fill" className="text-purple-400" />
                      License Key
                    </Label>
                    <div className="relative">
                      <Input
                        type={showLicense ? 'text' : 'password'}
                        placeholder="Enter your license key"
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value)}
                        className="w-full px-6 py-4 pr-12 bg-background/60 border-2 border-purple-500/50 rounded-lg font-mono"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLicense(!showLicense)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                      >
                        {showLicense ? <EyeSlash size={20} /> : <Key size={20} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Activate Button */}
                  <Button
                    onClick={handleLicenseSubmit}
                    disabled={isSubmitting || !licenseKey.trim()}
                    className="w-full h-14 text-lg font-black uppercase tracking-wider
                             bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500
                             hover:from-purple-400 hover:via-pink-400 hover:to-purple-400
                             border-2 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.4)]
                             transition-all jagged-corner disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Activating...
                      </>
                    ) : (
                      <>
                        <Lightning size={18} weight="fill" className="mr-2" />
                        ACTIVATE LICENSE
                      </>
                    )}
                  </Button>
                  
                  {/* Email is now REQUIRED - removed skip option */}
                </>
              )}
              
              {/* Security Notice */}
              <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg mt-4">
                <ShieldCheck size={16} weight="duotone" className="text-primary flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                  {step === 'login' ? 'Your credentials are encrypted and secure' :
                   step === 'register' ? 'We never share your email • Password is encrypted' :
                   step === 'verify' ? 'Verification adds an extra layer of security' :
                   'License linked forever • Auto-login enabled'}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-muted-foreground mt-6 uppercase tracking-wider"
        >
          Quantum Falcon Cockpit v2025.1.0 • Zero Friction, Maximum Security
        </motion.p>
      </motion.div>
    </div>
  )
}
