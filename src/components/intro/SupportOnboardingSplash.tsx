// SUPPORT/ONBOARDING SPLASH — Full-screen image page after MP4 intro
// November 22, 2025 — Quantum Falcon Cockpit v2025.1.0
// Takes up full screen, then transitions to dashboard where tour starts

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightning, ArrowRight } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface SupportOnboardingSplashProps {
  /**
   * Callback when the splash is dismissed
   */
  onFinished?: () => void;
}

export function SupportOnboardingSplash({ onFinished }: SupportOnboardingSplashProps) {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenSupportSplash, setHasSeenSupportSplash] = useState(false);

  useEffect(() => {
    // Check if user has seen the support splash
    try {
      const seen = window.localStorage.getItem('qf:supportSplashSeen_v1');
      if (!seen) {
        setIsVisible(true);
      } else {
        setHasSeenSupportSplash(true);
      }
    } catch (e) {
      // If localStorage fails, show it anyway
      setIsVisible(true);
    }
  }, []);

  const finish = useCallback(() => {
    // Mark as complete in localStorage
    try {
      window.localStorage.setItem('qf:supportSplashSeen_v1', 'true');
    } catch (e) {
      console.warn('Failed to save support splash state:', e);
    }
    
    // Hide the overlay
    setIsVisible(false);
    setHasSeenSupportSplash(true);
    
    // Call the optional callback
    if (onFinished) {
      onFinished();
    }
  }, [onFinished]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        finish();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, finish]);

  // Don't render anything if not visible or already seen
  if (!isVisible || hasSeenSupportSplash) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[99998] overflow-hidden"
        >
          {/* MASSIVE FALCON HEAD BACKGROUND - covers entire screen, full size */}
          <motion.div
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="fixed inset-0 z-0 w-screen h-screen"
            style={{
              width: '100vw',
              height: '100vh',
              minWidth: '100vw',
              minHeight: '100vh',
            }}
          >
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: 'url(/falcon-head-official.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                width: '100%',
                height: '100%',
                minWidth: '100%',
                minHeight: '100%',
              }}
            />
            {/* Dark overlay for text readability - 70% opacity */}
            <div className="absolute inset-0 w-full h-full bg-black/70 backdrop-blur-[2px]" />
          </motion.div>

          {/* SUPERIMPOSED CONTENT - Full screen, centered */}
          <div className="relative z-10 flex flex-col items-center justify-center w-screen h-screen min-h-screen px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className={cn(
                'flex flex-col items-center gap-8 max-w-5xl w-full',
                isMobile ? 'gap-6' : 'gap-10'
              )}
            >
              {/* BIG CENTERED "QUANTUM FALCON" - rainbow gradient */}
              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className={cn(
                  'font-black uppercase text-center leading-none',
                  isMobile ? 'text-6xl' : 'text-8xl lg:text-9xl'
                )}
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

              {/* CONTACT EMAIL - cyan with glow */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className={cn('text-center', isMobile ? 'text-xl' : 'text-3xl')}
              >
                <a
                  href="mailto:mhamp1trading@yahoo.com"
                  className="font-bold hover:brightness-125 transition-all"
                  style={{
                    color: '#00ffff',
                    textShadow: '0 0 20px rgba(0, 255, 255, 0.6)',
                  }}
                >
                  Contact: mhamp1trading@yahoo.com
                </a>
              </motion.div>

              {/* SUBTITLE - smaller text */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className={cn(
                  'text-center font-semibold text-foreground/90',
                  isMobile ? 'text-base px-4' : 'text-xl'
                )}
              >
                Validate license • Contribute code for perks
              </motion.p>

              {/* LARGE GLOWING FUNCTIONAL BUTTONS - overlaid */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
                className={cn(
                  'flex gap-6 mt-8',
                  isMobile ? 'flex-col w-full' : 'flex-row'
                )}
              >
                {/* JOIN OUR DISCORD - purple-pink gradient */}
                <motion.button
                  onClick={() => window.open('https://discord.gg/quantumfalcon', '_blank', 'noopener,noreferrer')}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'relative group rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-4 transition-all',
                    isMobile ? 'w-full py-6 text-lg' : 'w-80 py-7 text-xl'
                  )}
                  style={{
                    background: 'linear-gradient(135deg, #9945FF 0%, #DC1FFF 100%)',
                    border: '2px solid #DC1FFF',
                    boxShadow: '0 0 30px rgba(220, 31, 255, 0.5), inset 0 0 20px rgba(220, 31, 255, 0.2)',
                  }}
                >
                  <span>Join Our Discord</span>
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      boxShadow: '0 0 50px rgba(220, 31, 255, 0.8), 0 0 80px rgba(220, 31, 255, 0.4)',
                    }}
                  />
                </motion.button>

                {/* EXPLORE ON GITHUB - cyan gradient */}
                <motion.button
                  onClick={() => window.open('https://github.com/mhamp1', '_blank', 'noopener,noreferrer')}
                  whileHover={{ scale: 1.05, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'relative group rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-4 transition-all',
                    isMobile ? 'w-full py-6 text-lg' : 'w-80 py-7 text-xl'
                  )}
                  style={{
                    background: 'linear-gradient(135deg, #00ffff 0%, #0088ff 100%)',
                    border: '2px solid #00ffff',
                    boxShadow: '0 0 30px rgba(0, 255, 255, 0.5), inset 0 0 20px rgba(0, 255, 255, 0.2)',
                    color: '#000000',
                  }}
                >
                  <span>Explore on GitHub</span>
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      boxShadow: '0 0 50px rgba(0, 255, 255, 0.8), 0 0 80px rgba(0, 255, 255, 0.4)',
                    }}
                  />
                </motion.button>
              </motion.div>

              {/* CONTINUE TO DASHBOARD BUTTON - prominent, glowing */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.3 }}
                className="mt-8"
              >
                <Button
                  onClick={finish}
                  size="lg"
                  className={cn(
                    'relative group rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-4 transition-all',
                    isMobile ? 'w-full py-6 text-lg' : 'px-12 py-7 text-xl'
                  )}
                  style={{
                    background: 'linear-gradient(135deg, #00ffff 0%, #0088ff 100%)',
                    border: '2px solid #00ffff',
                    boxShadow: '0 0 40px rgba(0, 255, 255, 0.6), inset 0 0 30px rgba(0, 255, 255, 0.3)',
                    color: '#000000',
                  }}
                >
                  <Lightning size={isMobile ? 24 : 28} weight="fill" />
                  <span>Continue to Dashboard</span>
                  <ArrowRight size={isMobile ? 24 : 28} weight="bold" />
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      boxShadow: '0 0 60px rgba(0, 255, 255, 0.9), 0 0 100px rgba(0, 255, 255, 0.5)',
                    }}
                  />
                </Button>
              </motion.div>

              {/* Skip hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.5 }}
                className="text-center text-sm text-muted-foreground mt-4"
              >
                Press <kbd className="px-2 py-1 bg-muted/50 rounded border border-border">ESC</kbd> or click button to continue
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Export as default for easier imports
export default SupportOnboardingSplash;

