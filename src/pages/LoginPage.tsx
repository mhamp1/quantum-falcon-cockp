// ULTIMATE LOGIN PAGE — GOD-TIER CYBERPUNK PERFECTION
// November 22, 2025 — Quantum Falcon Cockpit v2025.1.0
// Most beautiful login in crypto — remembers forever

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePersistentAuth } from '@/lib/auth/usePersistentAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Eye, 
  EyeSlash, 
  Key, 
  User, 
  Lock, 
  Sparkle,
  ArrowRight,
  ShieldCheck
} from '@phosphor-icons/react'
import { toast } from 'sonner'

export default function LoginPage() {
  const { login, isLoading, isAuthenticated, isInitialized } = usePersistentAuth()
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [licenseKey, setLicenseKey] = useState('')
  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showLicense, setShowLicense] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Don't show login if still loading or already authenticated
  if (!isInitialized || isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm uppercase tracking-wider">Initializing...</p>
        </div>
      </div>
    )
  }

  const handleLogin = async () => {
    if (!username.trim()) {
      toast.error('Username Required', {
        description: 'Please enter your username',
      })
      return
    }

    if (!password.trim()) {
      toast.error('Password Required', {
        description: 'Please enter your password',
      })
      return
    }

    if (!licenseKey.trim()) {
      toast.error('License Key Required', {
        description: 'Please enter your license key',
      })
      return
    }

    setIsSubmitting(true)

    const result = await login(username, password, licenseKey, email || undefined)

    if (result.success) {
      // Login successful - App.tsx will handle showing dashboard
      setIsSubmitting(false)
    } else {
      setIsSubmitting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-cyan-900/20" />
      <div className="absolute inset-0 diagonal-stripes opacity-5" />
      
      {/* Animated Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 max-w-md w-full mx-4"
      >
        {/* Falcon Head Logo */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="relative inline-block mb-6"
          >
            <div className="w-32 h-32 mx-auto relative">
              {/* Falcon Head SVG */}
              <svg
                viewBox="0 0 200 200"
                className="w-full h-full drop-shadow-[0_0_30px_rgba(0,212,255,0.5)]"
              >
                <defs>
                  <linearGradient id="falconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#00d4ff" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Falcon Head Shape */}
                <path
                  d="M100 20 L140 60 L160 100 L140 140 L100 180 L60 140 L40 100 L60 60 Z"
                  fill="url(#falconGradient)"
                  filter="url(#glow)"
                  className="animate-pulse"
                />
                
                {/* Eye */}
                <circle cx="100" cy="100" r="15" fill="#000" />
                <circle cx="100" cy="100" r="8" fill="#00d4ff" />
                
                {/* Beak */}
                <path d="M100 120 L120 140 L100 130 Z" fill="#ff6b00" />
              </svg>
              
              {/* Pulsing Glow Ring */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute inset-0 border-2 border-cyan-400 rounded-full"
              />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl font-black uppercase tracking-wider mb-2"
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
            transition={{ delay: 0.4 }}
            className="text-cyan-400 text-sm uppercase tracking-wider mt-2 flex items-center justify-center gap-2"
          >
            <Sparkle size={16} weight="fill" className="text-purple-400" />
            Enter your credentials once — never again
            <Sparkle size={16} weight="fill" className="text-purple-400" />
          </motion.p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="cyber-card p-8 border-2 border-primary/50 relative overflow-hidden"
        >
          <div className="absolute inset-0 diagonal-stripes opacity-5" />
          <div className="relative z-10 space-y-4">
            {/* Username */}
            <div>
              <Label className="text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                <User size={14} weight="duotone" className="text-primary" />
                Username
              </Label>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-6 py-4 bg-background/60 border-2 border-primary/50 rounded-lg 
                         focus:border-primary focus:ring-2 focus:ring-primary/20
                         transition-all font-mono"
                disabled={isSubmitting}
              />
            </div>

            {/* Email (Optional) */}
            <div>
              <Label className="text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                <User size={14} weight="duotone" className="text-muted-foreground" />
                Email <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-6 py-4 bg-background/60 border-2 border-muted/50 rounded-lg 
                         focus:border-primary focus:ring-2 focus:ring-primary/20
                         transition-all"
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
                  onKeyPress={handleKeyPress}
                  className="w-full px-6 py-4 pr-12 bg-background/60 border-2 border-primary/50 rounded-lg 
                           focus:border-primary focus:ring-2 focus:ring-primary/20
                           transition-all font-mono"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? <EyeSlash size={20} weight="duotone" /> : <Eye size={20} weight="duotone" />}
                </button>
              </div>
            </div>

            {/* License Key */}
            <div>
              <Label className="text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                <Key size={14} weight="duotone" className="text-purple-400" />
                License Key <span className="text-purple-400">(One-time only)</span>
              </Label>
              <div className="relative">
                <Input
                  type={showLicense ? 'text' : 'password'}
                  placeholder="Enter your license key"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-6 py-4 pr-12 bg-background/60 border-2 border-purple-500/50 rounded-lg 
                           focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20
                           transition-all font-mono text-sm"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowLicense(!showLicense)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showLicense ? <EyeSlash size={20} weight="duotone" /> : <Key size={20} weight="duotone" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={isSubmitting || !username.trim() || !password.trim() || !licenseKey.trim()}
              className="w-full h-16 text-xl font-black uppercase tracking-wider
                       bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500
                       hover:from-cyan-400 hover:via-purple-400 hover:to-cyan-400
                       border-2 border-primary/50
                       shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]
                       transition-all jagged-corner
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Validating...
                </>
              ) : (
                <>
                  ENTER THE COCKPIT
                  <ArrowRight size={20} weight="bold" className="ml-2" />
                </>
              )}
            </Button>

            {/* Security Notice */}
            <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/30 rounded-lg mt-4">
              <ShieldCheck size={16} weight="duotone" className="text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Your credentials are encrypted and stored locally • You will never need to enter them again
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-muted-foreground mt-6 uppercase tracking-wider"
        >
          Quantum Falcon Cockpit v2025.1.0 • Zero Friction, Pure Perfection
        </motion.p>
      </motion.div>
    </div>
  )
}

