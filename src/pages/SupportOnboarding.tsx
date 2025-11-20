// SUPPORT & ONBOARDING: Official team recruitment page — survives all merges — November 20, 2025

import { motion } from 'framer-motion';
import { GithubLogo, DiscordLogo } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

export default function SupportOnboarding() {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 technical-grid opacity-5" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        {/* Main content card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl w-full space-y-12 text-center"
        >
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl md:text-7xl font-black uppercase tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 50%, #00ffff 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'shimmer 3s linear infinite',
            }}
          >
            SUPPORT &amp; ONBOARDING
          </motion.h1>

          {/* Falcon head */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex justify-center"
          >
            <div className="relative w-80 h-80 md:w-96 md:h-96">
              <motion.div
                animate={{
                  filter: [
                    'drop-shadow(0 0 20px rgba(0, 255, 255, 0.4)) drop-shadow(0 0 40px rgba(220, 31, 255, 0.3))',
                    'drop-shadow(0 0 30px rgba(0, 255, 255, 0.5)) drop-shadow(0 0 50px rgba(220, 31, 255, 0.4))',
                    'drop-shadow(0 0 20px rgba(0, 255, 255, 0.4)) drop-shadow(0 0 40px rgba(220, 31, 255, 0.3))',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg viewBox="0 0 400 400" className="w-full h-full">
                  {/* Falcon head outline */}
                  <path
                    d="M200 50 L280 130 L300 180 L290 220 L270 260 L240 300 L200 320 L160 300 L130 260 L110 220 L100 180 L120 130 Z"
                    fill="url(#falconGradient)"
                    stroke="url(#falconStroke)"
                    strokeWidth="2"
                  />
                  
                  {/* Eye */}
                  <circle cx="200" cy="200" r="20" fill="#ff00ff" opacity="0.8">
                    <animate attributeName="r" values="20;24;20" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="200" cy="200" r="10" fill="#ffffff" />
                  
                  {/* Beak */}
                  <path
                    d="M200 220 L160 260 L200 250 Z"
                    fill="url(#beakGradient)"
                    stroke="#00ffff"
                    strokeWidth="1"
                  />
                  
                  {/* Feather lines */}
                  <path d="M140 160 L100 140" stroke="#00ffff" strokeWidth="2" opacity="0.6" />
                  <path d="M150 180 L110 170" stroke="#00ffff" strokeWidth="2" opacity="0.6" />
                  <path d="M160 200 L120 200" stroke="#00ffff" strokeWidth="2" opacity="0.6" />
                  <path d="M260 160 L300 140" stroke="#ff00ff" strokeWidth="2" opacity="0.6" />
                  <path d="M250 180 L290 170" stroke="#ff00ff" strokeWidth="2" opacity="0.6" />
                  <path d="M240 200 L280 200" stroke="#ff00ff" strokeWidth="2" opacity="0.6" />
                  
                  {/* Head crest */}
                  <path
                    d="M200 50 L220 30 L240 40 L260 20 L280 35"
                    stroke="url(#crestGradient)"
                    strokeWidth="3"
                    fill="none"
                  />
                  
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="falconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9945FF" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="#DC1FFF" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#9945FF" stopOpacity="0.3" />
                    </linearGradient>
                    <linearGradient id="falconStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00ffff" />
                      <stop offset="50%" stopColor="#ff00ff" />
                      <stop offset="100%" stopColor="#00ffff" />
                    </linearGradient>
                    <linearGradient id="beakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00ffff" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#ff00ff" stopOpacity="0.5" />
                    </linearGradient>
                    <linearGradient id="crestGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00ffff" />
                      <stop offset="50%" stopColor="#ff00ff" />
                      <stop offset="100%" stopColor="#00ffff" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>
            </div>
          </motion.div>

          {/* Quantum Falcon branding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-4"
          >
            <h2
              className="text-6xl md:text-8xl font-black uppercase tracking-tighter"
              style={{
                color: '#00ffff',
                textShadow: '0 0 20px rgba(0, 255, 255, 0.5)',
              }}
            >
              QUANTUM
            </h2>
            <h2
              className="text-6xl md:text-8xl font-black uppercase tracking-tighter"
              style={{
                color: '#ff00ff',
                textShadow: '0 0 20px rgba(255, 0, 255, 0.5)',
              }}
            >
              FALCON
            </h2>
          </motion.div>

          {/* Contact section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="space-y-6"
          >
            <div className="text-2xl md:text-3xl">
              <span className="text-primary font-bold">Contact: </span>
              <a
                href="mailto:mhamp1trading@yahoo.com"
                className="text-foreground hover:text-primary transition-colors"
                style={{
                  textDecoration: 'none',
                  textShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
                }}
              >
                mhamp1trading@yahoo.com
              </a>
            </div>

            {/* Bullet points */}
            <div className="space-y-4 text-xl md:text-2xl text-foreground/90 max-w-2xl mx-auto">
              <div className="flex items-start gap-3 justify-center">
                <span className="text-primary text-3xl">•</span>
                <span>Validate your license in app settings.</span>
              </div>
              <div className="flex items-start gap-3 justify-center">
                <span className="text-secondary text-3xl">•</span>
                <span>Contribute code, tests, or docs for perks.</span>
              </div>
            </div>
          </motion.div>

          {/* Discord invite (bonus) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="space-y-4"
          >
            <a
              href="https://discord.gg/quantumfalcon"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#5865F2]/20 border border-[#5865F2]/40 hover:bg-[#5865F2]/30 transition-all hover:-translate-y-1"
              style={{
                boxShadow: '0 0 20px rgba(88, 101, 242, 0.2)',
              }}
            >
              <DiscordLogo size={32} weight="fill" className="text-[#5865F2]" />
              <span className="text-lg font-semibold">Join Our Discord</span>
            </a>
          </motion.div>

          {/* GitHub button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <Button
              size="lg"
              className="text-xl px-12 py-8 rounded-3xl angled-corner-tr angled-corner-bl"
              style={{
                background: 'linear-gradient(135deg, #9945FF 0%, #DC1FFF 50%, #9945FF 100%)',
                border: '2px solid #ff00ff',
                boxShadow: '0 0 30px rgba(220, 31, 255, 0.4), inset 0 0 20px rgba(220, 31, 255, 0.2)',
              }}
              onClick={() => window.open('https://github.com/quantum-falcon', '_blank')}
            >
              <GithubLogo size={32} weight="fill" className="mr-3" />
              <span className="font-bold uppercase tracking-wider">Explore on GitHub</span>
            </Button>
          </motion.div>

          {/* Perks badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/40"
            style={{
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
            }}
          >
            <span className="text-lg font-semibold uppercase tracking-wider text-primary">
              🎁 Perks for Contributors
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
