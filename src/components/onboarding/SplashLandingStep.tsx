// SplashLandingStep.tsx - Full-screen falcon splash landing page
// November 22, 2025 — Quantum Falcon Cockpit v2025.1.0

import React from 'react';
import { motion } from 'framer-motion';
import { Lightning, ArrowRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface SplashLandingStepProps {
  onComplete: () => void;
}

const SplashLandingStep = ({ onComplete }: SplashLandingStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
      style={{
        backgroundImage: `url(/falcon-head-official.png)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Big title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-6xl md:text-8xl lg:text-9xl font-black uppercase text-center leading-none mb-4"
          style={{
            background: 'linear-gradient(135deg, #00ffff 0%, #9945FF 25%, #DC1FFF 50%, #00ffff 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.4))',
            animation: 'shimmer 6s linear infinite',
          }}
        >
          QUANTUM
          <br />
          FALCON
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-xl md:text-2xl text-cyan-300 mb-16 font-bold uppercase tracking-wider"
        >
          NEON COCKPIT TRADING ENGINE
        </motion.p>

        {/* Glowing ENTER button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <Button
            onClick={onComplete}
            size="lg"
            className="px-12 py-6 text-2xl md:text-3xl font-black uppercase tracking-wider rounded-2xl 
                       hover:scale-110 transition-all duration-300 shadow-2xl shadow-cyan-500/50
                       bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500
                       border-2 border-cyan-400"
          >
            <Lightning size={32} weight="fill" className="mr-3" />
            ENTER COCKPIT
            <ArrowRight size={32} weight="bold" className="ml-3" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashLandingStep;

