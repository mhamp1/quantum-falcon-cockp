// Lightweight particle background using CSS animations
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface ParticleBackgroundProps {
  explode?: boolean
}

export const ParticleBackground = ({ explode = false }: ParticleBackgroundProps) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([])

  useEffect(() => {
    if (explode) {
      // Generate explosion particles
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100
      }))
      setParticles(newParticles)

      // Clear particles after animation
      const timeout = setTimeout(() => setParticles([]), 2000)
      return () => clearTimeout(timeout)
    }
  }, [explode])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'linear-gradient(to right, rgba(20, 241, 149, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(20, 241, 149, 0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />
      
      {/* Explosion particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{ 
            x: '50%', 
            y: '50%', 
            scale: 1,
            opacity: 1 
          }}
          animate={{
            x: `${particle.x}%`,
            y: `${particle.y}%`,
            scale: 0,
            opacity: 0
          }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: explode ? 'linear-gradient(45deg, #FF6B6B, #14F195)' : '#14F195',
            boxShadow: '0 0 10px currentColor'
          }}
        />
      ))}
    </div>
  )
}
