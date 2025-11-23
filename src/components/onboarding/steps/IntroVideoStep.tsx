/**
 * Step 1: Full-screen MP4 intro video
 * 
 * Requirements:
 * - Autoplay with sound UNMUTED (add muted={false} and ensure browser allows it via user interaction fallback)
 * - Video must cover 100% width/height, no letterboxing, preserve neon cyberpunk colors
 * - After video ends → automatically proceed to step 2 (no click needed)
 * - iOS support: playsInline, webkit-playsinline
 * - Preload for performance
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface IntroVideoStepProps {
  onComplete: () => void;
}

export default function IntroVideoStep({ onComplete }: IntroVideoStepProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  // Try to autoplay with sound on user interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      if (!hasUserInteracted && videoRef.current) {
        setHasUserInteracted(true);
        videoRef.current.muted = false;
        videoRef.current.play().catch((err) => {
          console.warn('Autoplay with sound failed, falling back to muted:', err);
          if (videoRef.current) {
            videoRef.current.muted = true;
            videoRef.current.play();
          }
        });
      }
    };

    // Listen for any user interaction
    window.addEventListener('click', handleUserInteraction, { once: true });
    window.addEventListener('touchstart', handleUserInteraction, { once: true });
    window.addEventListener('keydown', handleUserInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, [hasUserInteracted]);

  // Auto-proceed when video ends
  useEffect(() => {
    if (videoEnded) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500); // Small delay for smooth transition
      return () => clearTimeout(timer);
    }
  }, [videoEnded, onComplete]);

  const handleVideoEnded = () => {
    setVideoEnded(true);
  };

  const handleVideoLoaded = () => {
    // Try autoplay when video is loaded
    if (videoRef.current && !hasUserInteracted) {
      videoRef.current.muted = false;
      videoRef.current.play().catch((err) => {
        console.warn('Initial autoplay failed, will wait for user interaction:', err);
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play();
        }
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] bg-black"
      style={{ zIndex: 99999 }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted={!hasUserInteracted}
        playsInline
        webkit-playsinline="true"
        preload="auto"
        onEnded={handleVideoEnded}
        onLoadedData={handleVideoLoaded}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      >
        <source src="/falcon.mp4" type="video/mp4" />
        <source src="/quantum-falcon-intro.mp4" type="video/mp4" />
        <source src="/intro.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Click overlay to enable sound */}
      {!hasUserInteracted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={() => {
            if (videoRef.current) {
              setHasUserInteracted(true);
              videoRef.current.muted = false;
              videoRef.current.play();
            }
          }}
        >
          <div className="text-center text-white">
            <p className="text-xl mb-4">Click anywhere to enable sound</p>
            <p className="text-sm opacity-75">Video will autoplay with audio</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

