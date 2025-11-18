// components/trade/StrategyCardPro.tsx — The Final Version with FOMO Hover Effects
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Zap, TrendingUp, Crown, Play, Pause, Target, ChartLine } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface Strategy {
  id: string;
  name: string;
  type: string;
  description: string;
  longDescription: string;
  benefits: string[];
  requiredTier: string;
  status: 'active' | 'paused' | 'locked';
  pnl?: number;
  pnlPercent?: number;
  tradesExecuted?: number;
  winRate?: number;
  risk: 'low' | 'medium' | 'high';
  projected30d?: number;
  historicalRoi?: number;
}

interface StrategyCardProProps {
  strategy: Strategy;
  userTier: string;
  onToggle: (id: string) => void;
  onUpgrade: () => void;
}

const StrategyCardPro: React.FC<StrategyCardProProps> = ({ 
  strategy, 
  userTier, 
  onToggle,
  onUpgrade 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const requiredTierOrder: Record<string, number> = { 
    'free': 0, 
    'starter': 1,
    'trader': 2,
    'pro': 3, 
    'elite': 4, 
    'lifetime': 5 
  };
  
  const isLocked = requiredTierOrder[strategy.requiredTier] > requiredTierOrder[userTier];
  const isActive = strategy.status === 'active';

  // Mock live preview data — in production, fetch from /api/strategies/preview/:id
  const previewData = [
    { day: 'Mon', pnl: 0 },
    { day: 'Tue', pnl: 127 },
    { day: 'Wed', pnl: 289 },
    { day: 'Thu', pnl: 512 },
    { day: 'Fri', pnl: strategy.projected30d || 1247 },
  ];

  const projectedPnl = strategy.projected30d || Math.floor(Math.random() * 2000 + 500);
  const historicalRoi = strategy.historicalRoi || Math.floor(Math.random() * 300 + 50);

  const riskColor = {
    low: 'text-primary',
    medium: 'text-accent',
    high: 'text-destructive'
  };

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(!isHovered)}
    >
      {/* Main Card — Your Current Clean Design */}
      <motion.div
        whileHover={{ scale: isLocked ? 1.02 : 1.03 }}
        className={`relative cyber-card p-6 transition-all duration-300 ${
          isActive ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''
        } ${isLocked ? 'opacity-80' : ''}`}
      >
        {/* Active Badge */}
        {isActive && (
          <div className="absolute -top-3 -right-3 z-10">
            <Badge className="bg-primary text-primary-foreground animate-pulse px-4 py-1 uppercase tracking-wider font-bold">
              ACTIVE
            </Badge>
          </div>
        )}

        {/* Lock Overlay for Locked Strategies */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-4 z-20">
            <Lock size={48} className="text-accent" />
            <p className="text-accent text-lg font-bold uppercase tracking-wider">
              Requires {strategy.requiredTier} Tier
            </p>
            <Button 
              onClick={onUpgrade}
              className="bg-gradient-to-r from-accent to-secondary hover:scale-110 transition-transform px-8 py-3 rounded-xl font-bold flex items-center gap-2"
            >
              <Crown size={20} />
              UPGRADE NOW
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-primary mb-1 uppercase tracking-wide">
              {strategy.name}
            </h3>
            <Badge variant="outline" className="uppercase text-xs tracking-wider">
              {strategy.type}
            </Badge>
          </div>
          
          {!isLocked && (
            <Switch
              checked={isActive}
              onCheckedChange={() => onToggle(strategy.id)}
              className="ml-4"
            />
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {strategy.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="cyber-card-inner p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ChartLine size={16} className="text-primary" />
              <span className="data-label text-xs">PNL</span>
            </div>
            <div className={`technical-readout text-xl ${strategy.pnl && strategy.pnl > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
              {strategy.pnl ? `+$${strategy.pnl.toFixed(2)}` : '$0.00'}
            </div>
          </div>
          
          <div className="cyber-card-inner p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target size={16} className="text-accent" />
              <span className="data-label text-xs">Win Rate</span>
            </div>
            <div className="technical-readout text-xl text-accent">
              {strategy.winRate || 0}%
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {!isLocked && (
          <div className="mt-4 pt-4 border-t border-primary/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="data-label">TRADES:</span>
              <span className="technical-readout">{strategy.tradesExecuted || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="data-label">RISK:</span>
              <span className={`font-bold uppercase ${riskColor[strategy.risk]}`}>
                {strategy.risk}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* HOVER PREVIEW OVERLAY — The FOMO Magic */}
      <AnimatePresence>
        {isHovered && isLocked && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 z-50 w-[420px] pointer-events-none"
            style={{ maxWidth: 'calc(100vw - 2rem)' }}
          >
            <div className="cyber-card p-6 shadow-2xl shadow-accent/50 border-2 border-accent pointer-events-auto">
              {/* Title */}
              <h4 className="text-2xl font-bold text-primary mb-3 flex items-center gap-3 uppercase tracking-wide">
                <Zap className="text-accent" />
                What You're Missing
              </h4>

              {/* Live Chart Preview */}
              <div className="h-32 mb-4 bg-background/50 rounded-lg p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={previewData}>
                    <Line 
                      type="monotone" 
                      dataKey="pnl" 
                      stroke="#14F195" 
                      strokeWidth={3} 
                      dot={{ fill: '#14F195', r: 4 }}
                    />
                    <XAxis 
                      dataKey="day" 
                      stroke="#666" 
                      style={{ fontSize: '10px' }}
                    />
                    <YAxis 
                      stroke="#666" 
                      style={{ fontSize: '10px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(0,0,0,0.9)', 
                        border: '1px solid #14F195',
                        borderRadius: '8px'
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* FOMO Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="cyber-card-inner p-4 text-center">
                  <div className="text-primary font-bold text-2xl">
                    +${projectedPnl}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    Projected 30d
                  </div>
                </div>
                <div className="cyber-card-inner p-4 text-center">
                  <div className="text-accent font-bold text-2xl">
                    +{historicalRoi}%
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                    Last Month ROI
                  </div>
                </div>
              </div>

              {/* FOMO Message */}
              <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-4">
                <p className="text-primary text-center font-bold text-sm">
                  🔥 This strategy made top traders +{historicalRoi}% last month
                </p>
                <p className="text-muted-foreground text-center text-xs mt-2">
                  You'd be up ${projectedPnl} with this active right now
                </p>
              </div>

              {/* Benefits List */}
              <div className="space-y-2 mb-4">
                {strategy.benefits.slice(0, 3).map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <span className="text-foreground/80">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button 
                onClick={onUpgrade}
                className="w-full bg-gradient-to-r from-accent to-secondary hover:scale-105 transition-transform py-6 rounded-xl font-black text-lg uppercase tracking-wider"
              >
                <Crown className="mr-2" size={24} />
                UPGRADE TO UNLOCK
                <TrendingUp className="ml-2" size={24} />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Active Strategy Hover — Show Live Performance */}
        {isHovered && !isLocked && isActive && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 z-50 w-[380px] pointer-events-none"
            style={{ maxWidth: 'calc(100vw - 2rem)' }}
          >
            <div className="cyber-card p-4 shadow-xl shadow-primary/30 border-2 border-primary pointer-events-auto">
              <h4 className="text-lg font-bold text-primary mb-3 uppercase tracking-wide flex items-center gap-2">
                <Play size={20} />
                Live Performance
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current PNL:</span>
                  <span className="text-primary font-bold">+${strategy.pnl?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ROI:</span>
                  <span className="text-accent font-bold">+{strategy.pnlPercent?.toFixed(1) || '0.0'}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trades Executed:</span>
                  <span className="technical-readout">{strategy.tradesExecuted || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Win Rate:</span>
                  <span className="text-primary font-bold">{strategy.winRate || 0}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StrategyCardPro;
