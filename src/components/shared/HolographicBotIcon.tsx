// SIDEBAR UPGRADE: Elite holographic brain icon for multi-agent tab
// Replaces generic robot icon with neural network brain + orbiting particles
// Only animates on active state - 60% opacity when inactive

import { motion } from 'framer-motion';

interface HolographicBotIconProps {
  isActive: boolean;
  size?: number;
}

export default function HolographicBotIcon({ isActive, size = 24 }: HolographicBotIconProps) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Neural Network Brain */}
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={{
          opacity: isActive ? 1 : 0.6
        }}
      >
        {/* Central brain circuit */}
        <motion.path
          d="M12 4C10.5 4 9 5 9 6.5C9 7 9.2 7.5 9.5 8C8.5 8.2 7.5 9 7 10C6 11.5 6 13 7 14.5C7.5 15.5 8.5 16 9.5 16C10 16.5 10.5 17 11 17.5C11.5 18 12 18 12 18C12 18 12.5 18 13 17.5C13.5 17 14 16.5 14.5 16C15.5 16 16.5 15.5 17 14.5C18 13 18 11.5 17 10C16.5 9 15.5 8.2 14.5 8C14.8 7.5 15 7 15 6.5C15 5 13.5 4 12 4Z"
          stroke={isActive ? "#9945FF" : "#94a3b8"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={false}
          animate={{
            stroke: isActive ? ["#9945FF", "#00FFFF", "#9945FF"] : "#94a3b8"
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Circuit nodes */}
        <motion.circle cx="12" cy="6" r="1.5" fill={isActive ? "#00FFFF" : "#94a3b8"} 
          animate={{
            fill: isActive ? ["#00FFFF", "#9945FF", "#00FFFF"] : "#94a3b8",
            scale: isActive ? [1, 1.2, 1] : 1
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.circle cx="8" cy="10" r="1.5" fill={isActive ? "#9945FF" : "#94a3b8"}
          animate={{
            fill: isActive ? ["#9945FF", "#00FFFF", "#9945FF"] : "#94a3b8",
            scale: isActive ? [1, 1.2, 1] : 1
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
        />
        <motion.circle cx="16" cy="10" r="1.5" fill={isActive ? "#00FFFF" : "#94a3b8"}
          animate={{
            fill: isActive ? ["#00FFFF", "#9945FF", "#00FFFF"] : "#94a3b8",
            scale: isActive ? [1, 1.2, 1] : 1
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
        />
        <motion.circle cx="12" cy="14" r="1.5" fill={isActive ? "#9945FF" : "#94a3b8"}
          animate={{
            fill: isActive ? ["#9945FF", "#00FFFF", "#9945FF"] : "#94a3b8",
            scale: isActive ? [1, 1.2, 1] : 1
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
        />
        
        {/* Connection lines */}
        <motion.line x1="12" y1="6" x2="8" y2="10" stroke={isActive ? "#9945FF" : "#94a3b8"} strokeWidth="1" opacity="0.5" />
        <motion.line x1="12" y1="6" x2="16" y2="10" stroke={isActive ? "#00FFFF" : "#94a3b8"} strokeWidth="1" opacity="0.5" />
        <motion.line x1="8" y1="10" x2="12" y2="14" stroke={isActive ? "#00FFFF" : "#94a3b8"} strokeWidth="1" opacity="0.5" />
        <motion.line x1="16" y1="10" x2="12" y2="14" stroke={isActive ? "#9945FF" : "#94a3b8"} strokeWidth="1" opacity="0.5" />
      </motion.svg>

      {/* Subtle orbit particles (only when active) */}
      {isActive && (
        <>
          {[0, 120, 240].map((angle, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                background: i % 2 === 0 ? "#9945FF" : "#00FFFF",
                boxShadow: `0 0 4px ${i % 2 === 0 ? "#9945FF" : "#00FFFF"}`,
                top: "50%",
                left: "50%",
              }}
              animate={{
                x: [
                  Math.cos((angle * Math.PI) / 180) * (size * 0.6),
                  Math.cos(((angle + 360) * Math.PI) / 180) * (size * 0.6),
                ],
                y: [
                  Math.sin((angle * Math.PI) / 180) * (size * 0.6),
                  Math.sin(((angle + 360) * Math.PI) / 180) * (size * 0.6),
                ],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.33,
              }}
            />
          ))}
        </>
      )}
      
      {/* Subtle pulse glow only on active */}
      {isActive && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(153, 69, 255, 0.15) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
}
