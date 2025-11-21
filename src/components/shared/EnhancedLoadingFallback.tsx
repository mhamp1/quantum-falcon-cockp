// ENHANCED LOADING FALLBACK: Smooth transitions + error recovery — November 21, 2025

import { motion } from 'framer-motion';
import { CircleNotch, Robot } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';

interface EnhancedLoadingFallbackProps {
  message?: string;
  timeout?: number;
  onTimeout?: () => void;
}

export default function EnhancedLoadingFallback({
  message = 'Loading...',
  timeout = 10000,
  onTimeout,
}: EnhancedLoadingFallbackProps) {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    const timeoutTimer = setTimeout(() => {
      setHasTimedOut(true);
      if (onTimeout) onTimeout();
    }, timeout);

    return () => {
      clearInterval(dotsInterval);
      clearTimeout(timeoutTimer);
    };
  }, [timeout, onTimeout]);

  if (hasTimedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="cyber-card p-8 max-w-md w-full text-center space-y-6"
        >
          <Robot size={64} weight="duotone" className="mx-auto text-destructive" />
          <div>
            <h3 className="text-xl font-bold text-destructive uppercase tracking-wider mb-2">
              Loading Timeout
            </h3>
            <p className="text-sm text-muted-foreground">
              This component is taking longer than expected. Try refreshing the page.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-lg font-bold uppercase tracking-wider hover:brightness-110 transition-all"
          >
            Reload Page
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-6"
      >
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="mx-auto w-16 h-16 relative"
        >
          <CircleNotch
            size={64}
            weight="bold"
            className="text-primary"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.4))',
            }}
          />
        </motion.div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
            {message}
            <span className="inline-block w-8 text-left">{dots}</span>
          </p>

          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 rounded-full bg-primary"
              />
            ))}
          </div>
        </div>

        <div className="w-64 h-1 bg-muted rounded-full overflow-hidden mx-auto">
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="h-full w-1/3 bg-primary"
            style={{
              boxShadow: '0 0 12px rgba(0, 255, 255, 0.6)',
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}
