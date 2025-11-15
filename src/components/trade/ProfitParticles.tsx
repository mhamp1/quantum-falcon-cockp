import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
}

interface ProfitParticlesProps {
  isActive: boolean
  onComplete?: () => void
  amount?: number
  type?: 'btc' | 'sol'
}

export default function ProfitParticles({ isActive, onComplete, amount, type = 'btc' }: ProfitParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef<number>(0)

  useEffect(() => {
    if (!isActive || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.offsetWidth * dpr
    canvas.height = canvas.offsetHeight * dpr
    ctx.scale(dpr, dpr)

    const centerX = canvas.offsetWidth / 2
    const centerY = canvas.offsetHeight / 2

    const colors = type === 'btc' 
      ? ['#F7931A', '#FF9500', '#FFB84D', '#FFC973']
      : ['#14F195', '#00E5A0', '#00D89F', '#00CC9C']

    particlesRef.current = []
    for (let i = 0; i < 80; i++) {
      const angle = (Math.PI * 2 * i) / 80
      const velocity = 2 + Math.random() * 3
      particlesRef.current.push({
        id: i,
        x: centerX,
        y: centerY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 1,
        maxLife: 0.8 + Math.random() * 0.4,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      })
    }

    startTimeRef.current = Date.now()

    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight)

      const elapsed = Date.now() - startTimeRef.current
      const progress = Math.min(elapsed / 2000, 1)

      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.08
        particle.life = Math.max(0, 1 - progress / particle.maxLife)
        particle.rotation += particle.rotationSpeed

        if (particle.life > 0) {
          ctx.save()
          ctx.globalAlpha = particle.life
          ctx.translate(particle.x, particle.y)
          ctx.rotate(particle.rotation)
          
          ctx.shadowBlur = 10
          ctx.shadowColor = particle.color
          ctx.fillStyle = particle.color
          ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
          
          ctx.restore()
          return true
        }
        return false
      })

      if (particlesRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        onComplete?.()
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isActive, onComplete, type])

  if (!isActive) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 pointer-events-none"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      
      {amount && (
        <motion.div
          initial={{ scale: 0.5, y: 0, opacity: 0 }}
          animate={{ 
            scale: [0.5, 1.2, 1],
            y: [0, -30, -40],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: 2,
            times: [0, 0.3, 0.7, 1],
            ease: "easeOut"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className={`text-4xl font-bold ${type === 'btc' ? 'text-[#F7931A]' : 'text-accent'} drop-shadow-[0_0_20px_currentColor]`}>
            +{amount.toFixed(8)} {type.toUpperCase()}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
