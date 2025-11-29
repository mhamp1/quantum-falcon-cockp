// ═══════════════════════════════════════════════════════════════
// CONFETTI LIMITER — Prevent Animation Overload
// November 29, 2025 — Smooth UX without chaos
// ═══════════════════════════════════════════════════════════════

import confetti from 'canvas-confetti'

// Global state to track confetti firing
let lastConfettiTime = 0
let confettiCount = 0
const COOLDOWN_MS = 3000 // 3 second cooldown between confetti bursts
const MAX_PER_MINUTE = 5 // Maximum 5 confetti bursts per minute

/**
 * Smart confetti that respects user experience
 * - Rate limited to prevent spam
 * - Reduced particle count for better performance
 * - Respects reduced motion preferences
 */
export const smartConfetti = (options?: confetti.Options & { force?: boolean }) => {
  // Check reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion && !options?.force) {
    return // Skip confetti for users who prefer reduced motion
  }

  const now = Date.now()
  
  // Reset count every minute
  if (now - lastConfettiTime > 60000) {
    confettiCount = 0
  }

  // Check rate limits (unless forced)
  if (!options?.force) {
    if (now - lastConfettiTime < COOLDOWN_MS) {
      return // Too soon since last confetti
    }
    
    if (confettiCount >= MAX_PER_MINUTE) {
      return // Too many confetti bursts this minute
    }
  }

  lastConfettiTime = now
  confettiCount++

  // Reduced particle count for smoother experience
  const defaultOptions: confetti.Options = {
    particleCount: 50, // Reduced from typical 100-300
    spread: 60, // Tighter spread
    origin: { y: 0.7 },
    colors: ['#00FFFF', '#FF1493', '#FFD700'],
    disableForReducedMotion: true,
    ...options,
    // Cap particle count to prevent performance issues
    particleCount: Math.min(options?.particleCount || 50, 100),
  }

  confetti(defaultOptions)
}

/**
 * Celebration confetti for major achievements
 * Slightly more particles but still limited
 */
export const celebrationConfetti = () => {
  smartConfetti({
    particleCount: 80,
    spread: 90,
    origin: { y: 0.6 },
    colors: ['#00FFFF', '#FF1493', '#FFD700', '#14F195'],
  })
}

/**
 * Mini confetti for small wins
 * Very light animation
 */
export const miniConfetti = () => {
  smartConfetti({
    particleCount: 25,
    spread: 40,
    origin: { y: 0.8 },
    scalar: 0.8,
  })
}

/**
 * Trade success confetti
 * Quick burst, minimal
 */
export const tradeConfetti = (profit: number) => {
  // Only show confetti for significant profits
  if (profit < 10) return
  
  const intensity = profit > 100 ? 60 : profit > 50 ? 40 : 25
  
  smartConfetti({
    particleCount: intensity,
    spread: 50,
    origin: { y: 0.7 },
    colors: profit > 0 ? ['#14F195', '#00FFFF'] : ['#FF6B6B', '#FF1493'],
  })
}

/**
 * NFT mint confetti based on rarity
 * Higher rarity = more particles (still capped)
 */
export const nftMintConfetti = (rarity: string) => {
  const rarityMap: Record<string, number> = {
    legendary: 100,
    epic: 70,
    rare: 50,
    uncommon: 30,
    common: 15,
  }
  
  smartConfetti({
    particleCount: rarityMap[rarity] || 30,
    spread: rarity === 'legendary' ? 120 : 70,
    origin: { y: 0.6 },
    colors: rarity === 'legendary' 
      ? ['#FFD700', '#FFA500', '#FF6347']
      : rarity === 'epic'
        ? ['#DC1FFF', '#8B5CF6']
        : ['#00FFFF', '#14F195'],
    force: rarity === 'legendary', // Force for legendary only
  })
}

/**
 * Level up confetti
 */
export const levelUpConfetti = (level: number) => {
  // Only celebrate milestone levels
  if (level % 5 !== 0 && level !== 1) return
  
  smartConfetti({
    particleCount: 60,
    spread: 80,
    origin: { y: 0.5 },
    colors: ['#FFD700', '#00FFFF', '#FF1493'],
  })
}

// Export default confetti with limiter for backward compatibility
export default smartConfetti

