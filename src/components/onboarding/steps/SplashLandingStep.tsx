/**
 * Step 2: Static splash/landing page
 * 
 * Requirements:
 * - Full-bleed background image with falcon flying toward Solana logo in holographic room
 * - Overlay text: "QUANTUM FALCON" in massive neon cyan/orange gradient
 * - Subtitle: "NEON COCKPIT TRADING ENGINE"
 * - Glowing "ENTER COCKPIT" button at bottom
 * - Clicking button or pressing ESC → proceed to step 3
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lightning } from '@phosphor-icons/react';

interface SplashLandingStepProps {
  onComplete: () => void;
}

export default function SplashLandingStep({ onComplete }: SplashLandingStepProps) {
  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-black overflow-hidden"
      style={{ zIndex: 99999 }}
    >
      {/* Full-bleed background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/falcon-head-official.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Holographic overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-purple-500/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.7)_100%)]" />
      </div>

      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
        {/* Main title with neon gradient */}
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-7xl md:text-9xl font-black uppercase tracking-wider mb-4"
          style={{
            fontFamily: 'Orbitron, sans-serif',
            background: 'linear-gradient(135deg, #00FFFF 0%, #FF8C00 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 0 40px rgba(0, 255, 255, 0.5), 0 0 80px rgba(255, 140, 0, 0.3)',
            filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.6))',
          }}
        >
          QUANTUM FALCON
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl font-semibold uppercase tracking-widest mb-16"
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            color: '#00FFFF',
            textShadow: '0 0 20px rgba(0, 255, 255, 0.6)',
          }}
        >
          NEON COCKPIT TRADING ENGINE
        </motion.p>

        {/* ENTER COCKPIT button */}
        <motion.button
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          onClick={onComplete}
          className="px-12 py-4 text-xl font-bold uppercase tracking-widest border-2 rounded-lg relative overflow-hidden group"
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            borderColor: '#00FFFF',
            color: '#00FFFF',
            background: 'rgba(0, 255, 255, 0.1)',
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.5), inset 0 0 30px rgba(0, 255, 255, 0.1)',
          }}
        >
          <span className="relative z-10 flex items-center gap-3">
            <Lightning size={24} weight="fill" />
            ENTER COCKPIT
          </span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-orange-500/20"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.5 }}
          />
        </motion.button>

        {/* ESC hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 text-sm text-cyan-400/60 uppercase tracking-wider"
        >
          Press ESC to continue
        </motion.p>
      </div>
    </motion.div>
  );
}

