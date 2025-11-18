// Upgrade to PRO+ Button Component
// Hot-pink gradient card with crown + lightning icon
// Navigates to /subscription page on click

import { motion } from 'framer-motion';
import { Crown, Lightning } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface UpgradeButtonProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

export default function UpgradeButton({ 
  text = 'UPGRADE TO PRO+',
  size = 'md',
  className = '',
  onClick
}: UpgradeButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to subscription page
      window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'settings' }));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-settings-billing-tab'));
      }, 100);
    }
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative group overflow-hidden rounded-xl font-bold uppercase tracking-wider
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        background: 'linear-gradient(135deg, #FF1493 0%, #FF00FF 50%, #DC1FFF 100%)',
        boxShadow: '0 0 30px rgba(255, 0, 255, 0.5), 0 8px 24px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Animated shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        animate={{
          x: ['-100%', '200%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Button content */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        <Crown size={size === 'lg' ? 24 : size === 'md' ? 20 : 16} weight="fill" className="text-yellow-300" />
        <span className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {text}
        </span>
        <Lightning size={size === 'lg' ? 24 : size === 'md' ? 20 : 16} weight="fill" className="text-yellow-300" />
      </div>

      {/* Glow pulse effect */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        animate={{
          boxShadow: [
            '0 0 20px rgba(255, 0, 255, 0.3)',
            '0 0 40px rgba(255, 0, 255, 0.6)',
            '0 0 20px rgba(255, 0, 255, 0.3)',
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.button>
  );
}

// Upgrade Card Variant (larger promotional version)
export function UpgradeCard({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl p-8 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 20, 147, 0.2) 0%, rgba(220, 31, 255, 0.2) 100%)',
        border: '2px solid rgba(255, 0, 255, 0.3)',
        boxShadow: '0 0 40px rgba(255, 0, 255, 0.2)',
      }}
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-full blur-3xl" />
      
      <div className="relative z-10 text-center space-y-6">
        <div className="flex items-center justify-center gap-3">
          <Crown size={40} weight="fill" className="text-yellow-300" />
          <h3 className="text-3xl font-black uppercase" style={{
            background: 'linear-gradient(135deg, #FF1493, #FF00FF, #DC1FFF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Unlock PRO+
          </h3>
          <Lightning size={40} weight="fill" className="text-yellow-300" />
        </div>

        <p className="text-foreground/80 max-w-md mx-auto">
          Get unlimited strategies, advanced AI features, priority support, and exclusive Elite templates.
        </p>

        <div className="flex flex-wrap justify-center gap-3 text-sm">
          <div className="flex items-center gap-2 text-cyan-400">
            <span className="w-2 h-2 bg-cyan-400 rounded-full" />
            Unlimited Strategies
          </div>
          <div className="flex items-center gap-2 text-purple-400">
            <span className="w-2 h-2 bg-purple-400 rounded-full" />
            200+ Premium Indicators
          </div>
          <div className="flex items-center gap-2 text-pink-400">
            <span className="w-2 h-2 bg-pink-400 rounded-full" />
            Priority Support
          </div>
        </div>

        <UpgradeButton size="lg" />
      </div>
    </motion.div>
  );
}
