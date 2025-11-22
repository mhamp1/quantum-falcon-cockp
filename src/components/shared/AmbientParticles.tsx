// Ambient Background Particles — Subtle Premium Effect with Adaptive Performance
// November 21, 2025 — Quantum Falcon Cockpit

import { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: 'cyan' | 'purple'
}

/**
 * Detect device performance capabilities
 */
function detectPerformance(): { particleCount: number; frameRate: number } {
  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 4
  
  // Check if mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
  
  // Check memory (if available)
  const memory = (navigator as any).deviceMemory || 4
  
  // Determine particle count based on device capabilities
  let particleCount = 30 // Default
  let frameRate = 60 // Target FPS
  
  if (isMobile || cores <= 4 || memory <= 4) {
    // Low-end device: reduce particles
    particleCount = 15
    frameRate = 30
  } else if (cores >= 8 && memory >= 8) {
    // High-end device: more particles
    particleCount = 45
    frameRate = 60
  }
  
  return { particleCount, frameRate }
}

export default function AmbientParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>()
  const lastFrameTimeRef = useRef<number>(0)
  const frameCountRef = useRef<number>(0)
  const [performanceMode, setPerformanceMode] = useState<'high' | 'medium' | 'low'>('high')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Detect performance and adjust
    const { particleCount, frameRate } = detectPerformance()
    const frameInterval = 1000 / frameRate

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create particles
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.3 + 0.1,
      color: Math.random() > 0.5 ? 'cyan' : 'purple' as const,
    }))

    // Frame rate monitoring
    let frameDropCount = 0
    const maxFrameDrops = 5

    // Animation loop with frame rate control
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTimeRef.current
      
      // Throttle to target frame rate
      if (deltaTime >= frameInterval) {
        lastFrameTimeRef.current = currentTime - (deltaTime % frameInterval)
        
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        particlesRef.current.forEach((particle) => {
          // Update position
          particle.x += particle.vx
          particle.y += particle.vy

          // Wrap around edges
          if (particle.x < 0) particle.x = canvas.width
          if (particle.x > canvas.width) particle.x = 0
          if (particle.y < 0) particle.y = canvas.height
          if (particle.y > canvas.height) particle.y = 0

          // Draw particle
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          
          const color = particle.color === 'cyan' 
            ? 'rgba(0, 255, 255, ' + particle.opacity + ')'
            : 'rgba(220, 31, 255, ' + particle.opacity + ')'
          
          ctx.fillStyle = color
          ctx.fill()

          // Subtle glow
          ctx.shadowBlur = 10
          ctx.shadowColor = color
          ctx.fill()
          ctx.shadowBlur = 0
        })

      particlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        
        const color = particle.color === 'cyan' 
          ? 'rgba(0, 255, 255, ' + particle.opacity + ')'
          : 'rgba(220, 31, 255, ' + particle.opacity + ')'
        
        ctx.fillStyle = color
        ctx.fill()

        // Subtle glow
        ctx.shadowBlur = 10
        ctx.shadowColor = color
        ctx.fill()
        ctx.shadowBlur = 0
      })

        // Monitor frame rate
        frameCountRef.current++
        if (deltaTime > frameInterval * 1.5) {
          frameDropCount++
          if (frameDropCount > maxFrameDrops && performanceMode === 'high') {
            // Reduce particles if performance drops
            particlesRef.current = particlesRef.current.slice(0, Math.floor(particleCount * 0.7))
            setPerformanceMode('medium')
          }
        } else {
          frameDropCount = Math.max(0, frameDropCount - 1)
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    lastFrameTimeRef.current = performance.now()
    animate(performance.now())

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  )
}

