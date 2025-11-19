// Rotating Q Logo with Orbital Arrows and Trailing Glow
// Perfect 360° rotation with neon trailing effect

import { motion } from 'framer-motion';

interface RotatingQLogoProps {
  size?: number;
  className?: string;
}

export default function RotatingQLogo({ size = 120, className = '' }: RotatingQLogoProps) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Center Q Logo */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div
          className="font-black text-primary neon-glow"
          style={{
            fontSize: size * 0.6,
            fontFamily: 'Orbitron, sans-serif',
            textShadow: '0 0 20px currentColor, 0 0 40px currentColor',
          }}
        >
          Q
        </div>
      </motion.div>

      {/* Orbital Ring with Glow */}
      <motion.div
        className="absolute inset-0 rounded-full border-2"
        style={{
          borderColor: 'rgba(0, 255, 255, 0.3)',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.2)',
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Orbiting Arrows with Trailing Glow */}
      {[0, 90, 180, 270].map((offset, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: size,
            height: size,
            left: 0,
            top: 0,
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.25,
          }}
          initial={{ rotate: offset }}
        >
          {/* Arrow Path with Trailing Effect */}
          <motion.div
            className="absolute"
            style={{
              width: 20,
              height: 20,
              left: '50%',
              top: -10,
              marginLeft: -10,
            }}
          >
            {/* Trailing glow dots */}
            {[0, 1, 2, 3].map((trailIndex) => (
              <motion.div
                key={trailIndex}
                className="absolute rounded-full bg-cyan-400"
                style={{
                  width: 6 - trailIndex * 1.5,
                  height: 6 - trailIndex * 1.5,
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 10px currentColor',
                }}
                animate={{
                  opacity: [0.8, 0],
                  scale: [1, 0.5],
                  y: trailIndex * 8,
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: trailIndex * 0.1,
                  ease: 'easeOut',
                }}
              />
            ))}
            
            {/* Arrow Head */}
            <div
              className="absolute left-1/2 top-0 -translate-x-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '12px solid #00FFFF',
                filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.8))',
              }}
            />
          </motion.div>
        </motion.div>
      ))}

      {/* Pulse Ring Effect */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-purple-500/50"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeOut',
        }}
      />
    </div>
  );
}
