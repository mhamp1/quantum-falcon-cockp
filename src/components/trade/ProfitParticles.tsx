import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface Particle {
  id: number
  x: number
  color: st
  rotationSp

  isActive: bo
  amount?: number
}
export default 
  const particlesR
  const startTimeRef = 
 

    const ctx = canvas.getContex

    canvas.width = canvas
  amount?: number
    const centerX = ca
}


    for (let i = 0; i < 80; i++) {
      const velocity = 2 + Math.random() * 3
        id: i,
        y: centerY,

        maxLife: 0.
        color: colors[Math.floor(Math.random() 

    }
    startTimeRef.current = Date.now()
    const animate = 


      const progress = Math.min(elapsed / 2000, 1)
      particlesRef.current = particlesRef.current.filter(partic

        particle.life = Math.max(0, 1 - pr


          ctx.translate(particle.x
          
          ctx.shadowColor = particle.color

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

        }

      })

      if (particlesRef.current.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {

      }


    animationFrameRef.current = requestAnimationFrame(animate)


      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

  }, [isActive, onComplete, type])

  if (!isActive) return null

  return (

      initial={{ opacity: 0 }}

      exit={{ opacity: 0 }}
      className="absolute inset-0 pointer-events-none"
    >

        ref={canvasRef}
        className="w-full h-full"
      />
      
      {amount && (
        <motion.div
          initial={{ scale: 0.5, y: 0, opacity: 0 }}

            scale: [0.5, 1.2, 1],
            y: [0, -30, -40],
            opacity: [0, 1, 1, 0]

          transition={{

            times: [0, 0.3, 0.7, 1],
            ease: "easeOut"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className={`text-4xl font-bold ${type === 'btc' ? 'text-[#F7931A]' : 'text-accent'} drop-shadow-[0_0_20px_currentColor]`}>
            +{amount.toFixed(8)} {type.toUpperCase()}

        </motion.div>

    </motion.div>
  )
}
