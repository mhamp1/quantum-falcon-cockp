// components/strategy/CreateStrategyLockedHUD.tsx
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { 
  Code, Brain, Rocket, Share2, CheckCircle, Lock, TrendingUp, Zap, Crown 
} from 'lucide-react';
import { FeatureCardWithTooltip } from '@/components/shared/FeatureCardWithTooltip';
import { IconRSIDivergenceAnimated } from '@/components/icons/IconRSIDivergenceAnimated';

interface LockedHUDProps {
  onUpgradeClick: () => void;
}

export default function CreateStrategyLockedHUD({ onUpgradeClick }: LockedHUDProps) {
  const [creatorStats] = useState({ created: 1247, earnings: 8421 });

  const handleUpgradeHover = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.7 },
      colors: ['#DC1FFF', '#00FFFF', '#FF00FF', '#FFFF00']
    });
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Scanlines Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 opacity-30" />
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="h-full w-full bg-gradient-to-t from-transparent via-primary/5 to-transparent animate-pulse" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-20">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center"
        >
          <h1 className="mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-7xl md:text-8xl font-black text-transparent drop-shadow-2xl">
            CREATE GOD-TIER
          </h1>
          <h1 className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-7xl md:text-8xl font-black text-transparent drop-shadow-2xl">
            STRATEGIES
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 max-w-4xl text-center text-xl text-primary/90"
        >
          Build, backtest, and share custom bots with the community — the same tools Elite traders use to print money.
        </motion.p>

        {/* Feature Icon Showcase */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 mb-8"
        >
          <IconRSIDivergenceAnimated size={180} className="drop-shadow-2xl" />
        </motion.div>

        {/* Feature HUD Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl w-full">
          <FeatureCardWithTooltip
            icon={<Code size={32} className="text-white" />}
            title="Full Monaco Editor"
            subtitle="VS Code-level editor with AI completion"
            tooltip={{
              title: "Professional Code Editor",
              description: "Write strategies in a full VS Code-like editor with syntax highlighting, auto-complete, and real-time AI suggestions that understand trading logic.",
              preview: `// Example AI suggestion
if (rsi < 30 && volume > avgVolume * 1.5) {
  buy(); // Strong momentum + volume
}`
            }}
            delay={0.8}
          />
          <FeatureCardWithTooltip
            icon={<TrendingUp size={32} className="text-white" />}
            title="Real-time Backtesting"
            subtitle="Test on historical + live data instantly"
            tooltip={{
              title: "Instant Strategy Testing",
              description: "Run full backtests on historical data in seconds. See exact PNL, win rate, max drawdown, and Sharpe ratio with beautiful charts.",
              preview: `Win Rate: 78.4%
Max Drawdown: -12.3%
Profit Factor: 2.87
Total Trades: 1,247`
            }}
            delay={1.0}
          />
          <FeatureCardWithTooltip
            icon={<Share2 size={32} className="text-white" />}
            title="One-Click Sharing"
            subtitle="Publish & earn royalties instantly"
            tooltip={{
              title: "Monetize Your Alpha",
              description: "Publish your strategy to the Community Hub with one click. Earn SOL royalties every time someone copies and uses it — passive income for creators.",
              preview: `Top Creator This Week:
NeonWhaleSniper — $8,421 earned
Copies: 2,847`
            }}
            delay={1.2}
          />
          <FeatureCardWithTooltip
            icon={<CheckCircle size={32} className="text-white" />}
            title="On-Chain Proof"
            subtitle="Immutable NFT ownership"
            tooltip={{
              title: "Blockchain Verified",
              description: "Your strategy ownership recorded as Solana NFT metadata — forever immutable and provably yours.",
            }}
            delay={1.4}
          />
          <FeatureCardWithTooltip
            icon={<Brain size={32} className="text-white" />}
            title="AI Strategy Assistant"
            subtitle="Let AI write & optimize for you"
            tooltip={{
              title: "Create God-Tier Strategies (Pro+)",
              description: "GPT-4 powered code completion, real-time backtesting, and one-click deployment. Build strategies that actually win.",
            }}
            delay={1.6}
          />
          <FeatureCardWithTooltip
            icon={<Crown size={32} className="text-white" />}
            title="Elite Templates"
            subtitle="Start from proven winners"
            tooltip={{
              title: "Professional Templates",
              description: "Start from proven strategies used by top 1% traders — instant alpha with battle-tested code.",
            }}
            delay={1.8}
          />
        </div>

        {/* Live Creator Stats */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2 }}
          className="mt-16 rounded-full bg-card/80 backdrop-blur-xl border-2 border-accent/50 px-12 py-6 shadow-2xl"
        >
          <p className="text-2xl md:text-3xl font-bold text-accent">
            🔥 <span className="text-primary">{creatorStats.created.toLocaleString()}</span> strategies created today • 
            Top creator earned <span className="text-green-400">${creatorStats.earnings.toLocaleString()}</span>
          </p>
        </motion.div>

        {/* Upgrade CTA */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="mt-20 flex flex-col items-center gap-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Button 
              disabled 
              size="lg" 
              className="bg-muted/80 text-muted-foreground border border-muted-foreground/30 hover:bg-muted/80"
            >
              <Lock className="mr-3" size={28} />
              Pro+ Tier Required
            </Button>
            
            <Button
              size="lg"
              onMouseEnter={handleUpgradeHover}
              onClick={onUpgradeClick}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-primary text-3xl md:text-4xl px-12 md:px-16 py-8 md:py-10 font-black rounded-2xl shadow-2xl hover:scale-110 transition-all duration-300 hover:shadow-primary/50"
            >
              <Crown className="mr-4" size={48} />
              UPGRADE TO PRO+
              <Zap className="ml-4" size={48} />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
