import {
  Star,
  Shield,
  GridFour,
  Spiral,
  ListBullets,
  Brain,
  MusicNote,
  PaintBucket,
  Crown,
  TrendUp,
  Clock,
  Gift,
  Users,
  Heart,
  ChatCircle,
  ShareNetwork,
} from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Offer {
  id: string;
  title: string;
  description: string;
  price: string;
  icon: any;
  iconColor: string;
  owned?: boolean;
}

interface Strategy {
  id: string;
  title: string;
  description: string;
  winRate: number;
  trades: number;
  profit: number;
  views: number;
  likes: number;
  comments: number;
}

const flashSales: Offer[] = [
  {
    id: "mystery",
    title: "MYSTERY MICRO-BOOST",
    description: "Random bot perk for 24h",
    price: "$0.79",
    icon: Star,
    iconColor: "text-secondary",
  },
  {
    id: "drawdown",
    title: "DRAWDOWN ALERT SYSTEM",
    description: "24h loss protection",
    price: "$1.19",
    icon: Shield,
    iconColor: "text-primary",
  },
  {
    id: "correlation",
    title: "ASSET CORRELATION MATRIX",
    description: "24h correlation data",
    price: "$1.43",
    icon: GridFour,
    iconColor: "text-[#FF00FF]",
  },
];

const limitedOffers: Offer[] = [
  {
    id: "fibonacci",
    title: "FIBONACCI LEVEL OVERLAY",
    description: "Chart tool for 24h",
    price: "$1.49",
    icon: Spiral,
    iconColor: "text-secondary",
  },
  {
    id: "orders",
    title: "3-OPEN ORDERS LIMIT",
    description: "Extra orders for 24h",
    price: "$2.99",
    icon: ListBullets,
    iconColor: "text-primary",
  },
  {
    id: "rebalance",
    title: "AUTO-REBALANCE SUGGESTION",
    description: "Portfolio optimizer",
    price: "$1.99",
    icon: Brain,
    iconColor: "text-destructive",
  },
];

const specialOffers: Offer[] = [
  {
    id: "pattern",
    title: "PATTERN RECOGNITION",
    description: "Auto candlestick pattern detection for charts",
    price: "$0.99",
    icon: TrendUp,
    iconColor: "text-primary",
  },
  {
    id: "vault-bonus",
    title: "VAULT CONTRIBUTION BONUS",
    description: "100% bonus on vault deposits for 1 day",
    price: "$11.99",
    icon: Gift,
    iconColor: "text-secondary",
    owned: true,
  },
  {
    id: "expansion",
    title: "VAULT EXPANSION SLOT",
    description: "Extra slot for multi-strategy vault",
    price: "$4.99",
    icon: GridFour,
    iconColor: "text-[#FF00FF]",
  },
  {
    id: "sound",
    title: "ALTERNATE SOUND PACK",
    description: "Custom audio effects for alerts, trades, notifications",
    price: "$4.99",
    icon: MusicNote,
    iconColor: "text-primary",
  },
  {
    id: "gradients",
    title: "DYNAMIC GRADIENTS",
    description: "Auto-rotating gradient color themes change every hour",
    price: "$5.99",
    icon: PaintBucket,
    iconColor: "text-secondary",
    owned: true,
  },
  {
    id: "moderator",
    title: "TEMPORARY MODERATOR",
    description: "Community power: Moderate chat and forums for 24h",
    price: "$14.99",
    icon: Crown,
    iconColor: "text-destructive",
  },
];

const strategies: Strategy[] = [
  {
    id: "momentum",
    title: "MOMENTUM SCALPER PRO",
    description:
      "High-frequency scalping strategy using RSI divergence and volume confirmation for quick profits on volatile tokens.",
    winRate: 73.5,
    trades: 247,
    profit: 125.3,
    views: 1247,
    likes: 342,
    comments: 89,
  },
  {
    id: "dca",
    title: "DCA ACCUMULATION BOT",
    description:
      "Smart dollar-cost averaging bot that buys dips based on support levels / Fibonacci retracements.",
    winRate: 68.2,
    trades: 523,
    profit: 89.7,
    views: 2134,
    likes: 521,
    comments: 156,
  },
  {
    id: "whale",
    title: "WHALE SHADOW TRADING",
    description:
      "Follow smart money by mirroring trades from top 20 whale wallets with configurable delay and position sizing.",
    winRate: 81.9,
    trades: 156,
    profit: 203.4,
    views: 3421,
    likes: 892,
    comments: 203,
  },
  {
    id: "breakout",
    title: "BREAKOUT HUNTER",
    description:
      "Automatically detect and trade breakouts from consolidation patterns using ML-powered pattern recognition.",
    winRate: 65.7,
    trades: 389,
    profit: 76.2,
    views: 987,
    likes: 267,
    comments: 67,
  },
];

export default function CommunityTab() {
  const [flashTimer, setFlashTimer] = useState({ h: 0, m: 58 });
  const [limitedTimer, setLimitedTimer] = useState({ h: 1, m: 58 });
  const [specialTimer, setSpecialTimer] = useState({ d: 2, h: 19, m: 49 });

  useEffect(() => {
    const interval = setInterval(() => {
      setFlashTimer((prev) => {
        let { h, m } = prev;
        m--;
        if (m < 0) {
          m = 59;
          h--;
          if (h < 0) h = 0;
        }
        return { h, m };
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = (title: string) => {
    toast.success(`Claiming ${title}`, {
      description: "Processing purchase...",
    });
  };

  const handleUseStrategy = (title: string) => {
    toast.success(`Activating ${title}`, {
      description: "Strategy deployed successfully",
    });
  };

  return (
    <div className="relative min-h-full">
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(20, 241, 149, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(20, 241, 149, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            filter: "blur(1px)",
          }}
        />
      </div>

      <div className="relative z-10 space-y-8 pb-12 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users size={24} className="text-primary" weight="duotone" />
            <h1
              className="text-5xl font-bold uppercase tracking-[0.15em] text-secondary"
              style={{
                textShadow: "0 0 10px #9945FF, 0 0 20px #9945FF",
              }}
            >
              COMMUNITY HUB
            </h1>
          </div>
          <Button className="bg-primary hover:bg-primary/80 text-black font-bold px-6">
            Share Strategy ▼
          </Button>
        </div>
        <div className="w-full h-px bg-secondary/50" style={{
          boxShadow: "0 2px 8px #9945FF"
        }} />

        {/* Flash Sales */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold uppercase text-destructive">
                FLASH SALES
              </h2>
              <Clock size={16} className="text-destructive" />
            </div>
            <span className="text-sm font-bold text-destructive">
              {flashTimer.h}h {flashTimer.m}m
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {flashSales.map((offer, idx) => {
              const Icon = offer.icon;
              return (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="cyber-card p-6 space-y-4 border-destructive hover:scale-105 transition-transform"
                  style={{
                    clipPath:
                      "polygon(20px 0, 100% 0, calc(100% - 20px) 100%, 0 100%, 0 20px)",
                    boxShadow: "inset 0 0 8px rgba(255, 0, 0, 0.3)",
                  }}
                >
                  <Icon size={32} className={`${offer.iconColor} mx-auto`} weight="duotone" />
                  <h3 className="text-lg font-bold uppercase text-center">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase text-center">
                    {offer.description}
                  </p>
                  <div className="text-2xl font-bold text-center">{offer.price}</div>
                  <Button
                    onClick={() => handleClaim(offer.title)}
                    className="w-full bg-primary hover:bg-primary/80 text-black font-bold"
                  >
                    Claim
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Limited Offers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold uppercase text-primary">
                LIMITED OFFERS
              </h2>
              <Clock size={16} className="text-primary" />
            </div>
            <span className="text-sm font-bold text-primary">
              {limitedTimer.h}h {limitedTimer.m}m
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {limitedOffers.map((offer, idx) => {
              const Icon = offer.icon;
              return (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="cyber-card p-6 space-y-4 hover:scale-105 transition-transform"
                  style={{
                    clipPath:
                      "polygon(20px 0, 100% 0, calc(100% - 20px) 100%, 0 100%, 0 20px)",
                  }}
                >
                  <Icon size={32} className={`${offer.iconColor} mx-auto`} weight="duotone" />
                  <h3 className="text-lg font-bold uppercase text-center">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-muted-foreground uppercase text-center">
                    {offer.description}
                  </p>
                  <div className="text-2xl font-bold text-center">{offer.price}</div>
                  <Button
                    onClick={() => handleClaim(offer.title)}
                    className="w-full bg-primary hover:bg-primary/80 text-black font-bold"
                  >
                    Claim
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Special Offers */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold uppercase text-secondary">
                SPECIAL OFFERS
              </h2>
              <span className="px-3 py-1 bg-secondary/20 border border-secondary rounded text-xs font-bold text-secondary">
                {specialTimer.d}d {specialTimer.h}h {specialTimer.m}m
              </span>
            </div>
            <p className="text-xs text-muted-foreground uppercase">
              Premium features rotating every 2 days. Tier enhancements.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {specialOffers.map((offer, idx) => {
              const Icon = offer.icon;
              return (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  className="cyber-card p-6 space-y-3 border-secondary hover:scale-105 transition-transform"
                  style={{
                    clipPath:
                      "polygon(20px 0, 100% 0, calc(100% - 20px) 100%, 0 100%, 0 20px)",
                  }}
                >
                  <Icon size={32} className={`${offer.iconColor} mx-auto`} weight="duotone" />
                  <h3 className="text-base font-bold uppercase text-center">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-muted-foreground text-center h-12">
                    {offer.description}
                  </p>
                  <div className="text-xl font-bold text-center">{offer.price}</div>
                  <Button
                    onClick={() => handleClaim(offer.title)}
                    disabled={offer.owned}
                    className={`w-full font-bold ${
                      offer.owned
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-primary hover:bg-primary/80 text-black"
                    }`}
                  >
                    {offer.owned ? "Owned" : "Activate Now"}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Strategies */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold uppercase text-primary">STRATEGIES</h2>
            <ChatCircle size={16} className="text-primary" />
          </div>
          <div className="space-y-4">
            {strategies.map((strategy, idx) => (
              <motion.div
                key={strategy.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="cyber-card p-6 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold uppercase text-primary">
                      {strategy.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {strategy.description}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase">Win Rate</div>
                    <div className="text-lg font-bold text-primary">
                      {strategy.winRate}%
                    </div>
                    <Progress value={strategy.winRate} className="h-1" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase">Trades</div>
                    <div className="text-lg font-bold">{strategy.trades}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase">Profit</div>
                    <div className="text-lg font-bold text-accent">
                      +{strategy.profit}%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase">Views</div>
                    <div className="text-lg font-bold">{strategy.views}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-primary/20">
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                      <Heart size={16} />
                      {strategy.likes}
                    </button>
                    <button className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                      <ChatCircle size={16} />
                      {strategy.comments}
                    </button>
                    <button className="flex items-center gap-2 text-sm hover:text-primary transition-colors">
                      <ShareNetwork size={16} />
                      Share
                    </button>
                  </div>
                  <Button
                    onClick={() => handleUseStrategy(strategy.title)}
                    className="bg-primary hover:bg-primary/80 text-black font-bold px-6"
                  >
                    Use Strategy
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Empty space for scroll */}
        <div className="h-32" />
      </div>
    </div>
  );
}
