/**
 * IntroSplash Component
 * 
 * Full-screen intro splash that appears only for first-time users.
 * Features the cyberpunk neon HUD theme with Quantum Falcon branding.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFirstTimeUser } from '@/hooks/useFirstTimeUser';
import { Lightning, Play } from '@phosphor-icons/react';
import '@/styles/intro-splash.css';

interface IntroSplashProps {
  /**
   * Optional callback when the intro is dismissed
   */
  onFinished?: () => void;
}

export function IntroSplash({ onFinished }: IntroSplashProps) {
  const { isFirstTime, complete } = useFirstTimeUser();
  const [isVisible, setIsVisible] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Show the overlay if it's a first-time user
    if (isFirstTime) {
      setIsVisible(true);
    }
  }, [isFirstTime]);

  const finish = useCallback(() => {
    // Mark as complete in localStorage
    complete();
    
    // CRITICAL: Mark that user just clicked "Enter Cockpit" (for tour timing)
    // This ensures tour only shows AFTER Enter Cockpit, not on login page
    try {
      window.localStorage.setItem('justLoggedIn', 'true');
    } catch (e) {
      // Silent fail
    }
    
    // Hide the overlay
    setIsVisible(false);
    
    // Call the optional callback
    if (onFinished) {
      onFinished();
    }
  }, [complete, onFinished]);

  const handleVideoEnded = () => {
    setVideoPlaying(false);
    // Optionally auto-finish when video ends
    // finish();
  };

  const handleVideoReady = () => {
    setVideoReady(true);
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setVideoPlaying(true);
      }).catch((error) => {
        // Autoplay failed - user will see play button
        console.warn('Video autoplay failed:', error);
        setVideoPlaying(false);
      });
    }
  };

  // Try to autoplay video when ready
  useEffect(() => {
    if (videoReady && videoRef.current && !videoPlaying) {
      videoRef.current.play().then(() => {
        setVideoPlaying(true);
      }).catch(() => {
        // Autoplay blocked - show play button
        setVideoPlaying(false);
      });
    }
  }, [videoReady, videoPlaying]);

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

  // Don't render anything if not visible
  if (!isVisible) {
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
          className="qf-intro-overlay"
        >
          {/* Background gradient */}
          <div className="qf-intro-bg" />
          
          {/* Grid overlay for cyberpunk effect */}
          <div className="qf-intro-grid" />

          {/* Main content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="qf-intro-content"
          >
            {/* Logo section */}
            <div className="qf-intro-logo">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h1 className="qf-intro-title">
                  <span className="qf-intro-title-quantum">QUANTUM</span>
                  <span className="qf-intro-title-falcon">FALCON</span>
                </h1>
                <p className="qf-intro-tagline">
                  <Lightning size={16} weight="fill" className="inline mr-2" />
                  NEON COCKPIT TRADING ENGINE
                </p>
              </motion.div>
            </div>

            {/* Video section */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="qf-intro-media"
            >
              <div className="qf-intro-video-container">
                <video
                  ref={videoRef}
                  className="qf-intro-video"
                  muted
                  playsInline
                  autoPlay
                  onEnded={handleVideoEnded}
                  onLoadedData={handleVideoReady}
                  onError={(e) => {
                    console.warn('Video failed to load, using fallback:', e);
                    setVideoReady(false);
                  }}
                  poster="/falcon-head-official.png"
                >
                  <source src="/falcon.mp4" type="video/mp4" />
                  <source src="/intro.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Play button overlay - shows until video is manually started */}
                {videoReady && !videoPlaying && (
                  <button
                    onClick={handlePlayVideo}
                    className="qf-intro-play-btn"
                    aria-label="Play video"
                  >
                    <Play size={48} weight="fill" />
                  </button>
                )}
              </div>
            </motion.div>

            {/* CTA Button - Falcon Head Logo Removed */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="qf-intro-cta-container"
            >
              <button
                onClick={finish}
                className="qf-intro-cta"
              >
                <Lightning size={20} weight="fill" className="mr-2" />
                ENTER COCKPIT
              </button>
              
              <p className="qf-intro-skip">
                Press <kbd>ESC</kbd> or click button to continue
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Export as default for easier imports
export default IntroSplash;
