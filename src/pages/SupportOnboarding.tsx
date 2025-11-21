// SUPPORT PAGE FINAL: Full-screen falcon background, no redundancy, huge functional buttons — elite Dribbble style — November 20, 2025

import { motion } from 'framer-motion';
import { GithubLogo, DiscordLogo, Crown } from '@phosphor-icons/react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { soundEffects } from '@/lib/soundEffects';

export default function SupportOnboarding() {
  const isMobile = useIsMobile();

  const handleDiscordClick = () => {
    soundEffects.playClick();
    window.open('https://discord.gg/quantumfalcon', '_blank', 'noopener,noreferrer');
  };

  const handleGitHubClick = () => {
    soundEffects.playClick();
    window.open('https://github.com/mhamp1', '_blank', 'noopener,noreferrer');
  };

  const handlePerksClick = () => {
    soundEffects.playClick();
    window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'settings' }));
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* MASSIVE FALCON HEAD BACKGROUND - covers entire screen */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="absolute inset-0 z-0"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/falcon-head-official.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Dark overlay for text readability - 70% opacity */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      </motion.div>

      {/* SUPERIMPOSED CONTENT - Dribbble poster style */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">
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
              onMouseEnter={() => soundEffects.playHover()}
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
              onClick={handleDiscordClick}
              onMouseEnter={() => soundEffects.playHover()}
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
              <DiscordLogo size={isMobile ? 32 : 40} weight="fill" />
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
              onClick={handleGitHubClick}
              onMouseEnter={() => soundEffects.playHover()}
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
              <GithubLogo size={isMobile ? 32 : 40} weight="fill" />
              <span>Explore on GitHub</span>
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  boxShadow: '0 0 50px rgba(0, 255, 255, 0.8), 0 0 80px rgba(0, 255, 255, 0.4)',
                }}
              />
            </motion.button>
          </motion.div>

          {/* PERKS FOR CONTRIBUTORS - gold gradient */}
          <motion.button
            onClick={handlePerksClick}
            onMouseEnter={() => soundEffects.playHover()}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className={cn(
              'relative group rounded-2xl font-black uppercase tracking-wider flex items-center justify-center gap-4 transition-all',
              isMobile ? 'w-full py-6 text-lg' : 'w-80 py-7 text-xl'
            )}
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              border: '2px solid #FFD700',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.5), inset 0 0 20px rgba(255, 215, 0, 0.2)',
              color: '#000000',
            }}
          >
            <Crown size={isMobile ? 32 : 40} weight="fill" />
            <span>Perks for Contributors</span>
            <div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                boxShadow: '0 0 50px rgba(255, 215, 0, 0.8), 0 0 80px rgba(255, 215, 0, 0.4)',
              }}
            />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
