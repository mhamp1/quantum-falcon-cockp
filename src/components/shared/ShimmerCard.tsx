// ShimmerCard - Beautiful loading fallback matching cyberpunk theme
// Replaces empty grey boxes with animated skeleton loaders

import { motion } from 'framer-motion';

interface ShimmerCardProps {
  variant?: 'default' | 'large' | 'stat' | 'chart' | 'list';
  count?: number;
}

export function ShimmerCard({ variant = 'default', count = 1 }: ShimmerCardProps) {
  const cards = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {cards.map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="cyber-card overflow-hidden"
        >
          {variant === 'default' && <DefaultShimmer />}
          {variant === 'large' && <LargeShimmer />}
          {variant === 'stat' && <StatShimmer />}
          {variant === 'chart' && <ChartShimmer />}
          {variant === 'list' && <ListShimmer />}
        </motion.div>
      ))}
    </>
  );
}

function DefaultShimmer() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="shimmer w-12 h-12 rounded" />
        <div className="flex-1 space-y-2">
          <div className="shimmer h-4 w-3/4 rounded" />
          <div className="shimmer h-3 w-1/2 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="shimmer h-3 w-full rounded" />
        <div className="shimmer h-3 w-5/6 rounded" />
        <div className="shimmer h-3 w-4/6 rounded" />
      </div>
    </div>
  );
}

function LargeShimmer() {
  return (
    <div className="p-8 space-y-6">
      <div className="shimmer h-8 w-2/3 rounded" />
      <div className="shimmer h-48 w-full rounded" />
      <div className="flex gap-4">
        <div className="shimmer h-10 flex-1 rounded" />
        <div className="shimmer h-10 flex-1 rounded" />
      </div>
    </div>
  );
}

function StatShimmer() {
  return (
    <div className="p-6 space-y-3">
      <div className="shimmer h-3 w-1/3 rounded" />
      <div className="shimmer h-12 w-2/3 rounded" />
      <div className="shimmer h-2 w-1/2 rounded" />
    </div>
  );
}

function ChartShimmer() {
  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="shimmer h-6 w-1/3 rounded" />
        <div className="shimmer h-8 w-24 rounded" />
      </div>
      <div className="shimmer h-64 w-full rounded" />
      <div className="flex gap-2 justify-center">
        <div className="shimmer h-2 w-16 rounded" />
        <div className="shimmer h-2 w-16 rounded" />
        <div className="shimmer h-2 w-16 rounded" />
      </div>
    </div>
  );
}

function ListShimmer() {
  return (
    <div className="p-4 space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <div className="shimmer w-10 h-10 rounded" />
          <div className="flex-1 space-y-2">
            <div className="shimmer h-4 w-2/3 rounded" />
            <div className="shimmer h-3 w-1/2 rounded" />
          </div>
          <div className="shimmer h-8 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}

export function PulsingQLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <motion.svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="mx-auto"
          style={{
            filter: 'drop-shadow(0 0 20px rgba(20, 241, 149, 0.6)) drop-shadow(0 0 40px rgba(20, 241, 149, 0.3))',
          }}
        >
          <path
            d="M60 20 L70 35 L85 30 L75 50 L90 55 L70 65 L75 80 L60 70 L45 80 L50 65 L30 55 L45 50 L35 30 L50 35 Z"
            fill="url(#falconGradient)"
            stroke="#14F195"
            strokeWidth="2"
          />
          <circle cx="60" cy="50" r="8" fill="#9945FF" />
          <circle cx="60" cy="50" r="4" fill="#14F195">
            <animate
              attributeName="r"
              values="4;6;4"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
          <defs>
            <linearGradient id="falconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14F195" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#9945FF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#14F195" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </motion.svg>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-muted-foreground uppercase tracking-wider text-sm font-semibold"
        >
          Initializing Quantum Falcon...
        </motion.p>
      </div>
    </div>
  );
}

// Lightning Bolt Loader (for quick loads)
export function LightningLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          rotate: [0, 10, -10, 0],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="text-6xl text-primary"
      >
        ⚡
      </motion.div>
    </div>
  );
}

export default ShimmerCard;
