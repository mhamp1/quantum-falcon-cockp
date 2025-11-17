import { useState, useEffect, useRef } from "react";
import {
  Vault,
  ArrowUp,
  TrendUp,
  CurrencyBtc,
  Lightning,
  ShieldCheck,
  ArrowsClockwise,
  Lock,
  Question,
  Star,
  Flame,
  Rocket,
  Cube,
  Hexagon,
  Pentagon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { motion } from "framer-motion";

import { useKV } from "@github/spark/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SolanaLogo from "@/components/shared/SolanaLogo";

import VaultTutorial from "./VaultTutorial";

interface VaultTransaction {
  id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  timestamp: number;
}

interface FloatingCoin {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  rotation: number;
}

interface FlashSaleCard {
  id: string;
  title: string;
  description: string;
  discount: number;
  icon: "lightning" | "star" | "rocket";
  category: "boost" | "perk" | "cosmetic";
  originalPrice: number;
  color: "primary" | "accent" | "destructive";
}

const FLASH_SALE_POOL: FlashSaleCard[] = [
  {
    id: "xp-surge",
    title: "XP SURGE",
    description: "+50% XP earning boost for 24 hours",
    discount: 15,
    icon: "lightning",
    category: "boost",
    originalPrice: 299,
    color: "primary",
  },
  {
    id: "flash-execution",
    title: "FLASH EXECUTION",
    description:
      "Priority routing for instant trades during volatile market moves",
    discount: 20,
    icon: "rocket",
    category: "perk",
    originalPrice: 499,
    color: "accent",
  },
  {
    id: "instant-xp",
    title: "INSTANT 500 XP",
    description: "Immediate level boost with no grinding required",
    discount: 30,
    icon: "star",
    category: "boost",
    originalPrice: 199,
    color: "destructive",
  },
  {
    id: "trade-multiplier",
    title: "TRADE MULTIPLIER",
    description: "2x trading volume credits for 48 hours",
    discount: 25,
    icon: "lightning",
    category: "boost",
    originalPrice: 399,
    color: "primary",
  },
  {
    id: "diamond-badge",
    title: "DIAMOND BADGE",
    description: "Exclusive diamond tier profile badge",
    discount: 35,
    icon: "star",
    category: "cosmetic",
    originalPrice: 599,
    color: "accent",
  },
  {
    id: "stealth-mode",
    title: "STEALTH MODE",
    description: "Hide your trades from public leaderboard",
    discount: 18,
    icon: "rocket",
    category: "perk",
    originalPrice: 349,
    color: "destructive",
  },
  {
    id: "mega-boost",
    title: "MEGA BOOST",
    description: "+100% rewards on all activities for 12 hours",
    discount: 40,
    icon: "lightning",
    category: "boost",
    originalPrice: 799,
    color: "primary",
  },
  {
    id: "priority-support",
    title: "PRIORITY SUPPORT",
    description: "VIP customer support access for 30 days",
    discount: 22,
    icon: "star",
    category: "perk",
    originalPrice: 299,
    color: "accent",
  },
  {
    id: "cosmic-frame",
    title: "COSMIC FRAME",
    description: "Animated cosmic profile frame",
    discount: 28,
    icon: "rocket",
    category: "cosmetic",
    originalPrice: 449,
    color: "destructive",
  },
  {
    id: "lucky-streak",
    title: "LUCKY STREAK",
    description: "+15% success rate on high-risk trades",
    discount: 33,
    icon: "lightning",
    category: "perk",
    originalPrice: 549,
    color: "primary",
  },
];

export default function VaultView() {
  const [btcBalance, setBtcBalance] = useKV<number>(
    "btc-vault-balance",
    0.00234,
  );
  const [solanaAccumulated, setSolanaAccumulated] = useKV<number>(
    "solana-accumulated",
    127.89,
  );
  const [transactions, setTransactions] = useKV<VaultTransaction[]>(
    "vault-transactions",
    [],
  );
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawAddress, setWithdrawAddress] = useState("");
  const [floatingCoins, setFloatingCoins] = useState<FloatingCoin[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [flashSales, setFlashSales] = useState<FlashSaleCard[]>([]);
  const [timeRemaining, setTimeRemaining] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getRandomFlashSales = (seed: number): FlashSaleCard[] => {
    const shuffled = [...FLASH_SALE_POOL].sort(() => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x) - 0.5;
    });
    return shuffled.slice(0, 3);
  };

  const getCurrentRotationSeed = (): number => {
    const now = Date.now();
    const threeHours = 3 * 60 * 60 * 1000;
    return Math.floor(now / threeHours);
  };

  const getTimeUntilNextRotation = (): string => {
    const now = Date.now();
    const threeHours = 3 * 60 * 60 * 1000;
    const nextRotation = Math.ceil(now / threeHours) * threeHours;
    const diff = nextRotation - now;

    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);

    return `${hours}H ${minutes}M ${seconds}S REMAINING`;
  };

  useEffect(() => {
    const updateFlashSales = () => {
      const seed = getCurrentRotationSeed();
      setFlashSales(getRandomFlashSales(seed));
    };

    updateFlashSales();

    const interval = setInterval(() => {
      setTimeRemaining(getTimeUntilNextRotation());
    }, 1000);

    const rotationCheck = setInterval(() => {
      updateFlashSales();
    }, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(rotationCheck);
    };
  }, []);

  useEffect(() => {
    const coins: FloatingCoin[] = [];
    for (let i = 0; i < 16; i++) {
      coins.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 15 + Math.random() * 10,
        rotation: Math.random() * 360,
      });
    }
    setFloatingCoins(coins);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    let animationFrame: number;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
    }> = [];

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.02) {
        particles.push({
          x: (Math.random() * canvas.width) / 2,
          y: canvas.height / 2,
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 3 - 1,
          life: 1,
        });
      }

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life -= 0.01;

        if (p.life <= 0) {
          particles.splice(i, 1);
          return;
        }

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 3);
        gradient.addColorStop(0, `rgba(185, 242, 255, ${p.life * 0.8})`);
        gradient.addColorStop(1, `rgba(185, 242, 255, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);

    if (!amount || amount <= 0) {
      toast.error("Invalid amount", {
        description: "Please enter a valid withdrawal amount",
      });
      return;
    }

    if (!btcBalance || amount > btcBalance) {
      toast.error("Insufficient balance", {
        description: "Amount exceeds available BTC",
      });
      return;
    }

    if (!withdrawAddress || withdrawAddress.length < 26) {
      toast.error("Invalid address", {
        description: "Please enter a valid BTC address",
      });
      return;
    }

    setBtcBalance((current) => (current || 0) - amount);

    const newTransaction: VaultTransaction = {
      id: Date.now().toString(),
      type: "withdrawal",
      amount,
      timestamp: Date.now(),
    };

    setTransactions((current) => {
      if (!current) return [newTransaction];
      return [newTransaction, ...current].slice(0, 50);
    });

    toast.success("Withdrawal initiated", {
      description: `${amount} BTC sent to ${withdrawAddress.slice(0, 8)}...${withdrawAddress.slice(-8)}`,
    });

    setWithdrawAmount("");
    setWithdrawAddress("");
  };

  const handleDeposit = (amount: number) => {
    if (!amount || amount <= 0) {
      toast.error("Invalid amount", {
        description: "Please enter a valid deposit amount",
      });
      return;
    }

    setBtcBalance((current) => (current || 0) + amount);

    const newTransaction: VaultTransaction = {
      id: Date.now().toString(),
      type: "deposit",
      amount,
      timestamp: Date.now(),
    };

    setTransactions((current) => {
      if (!current) return [newTransaction];
      return [newTransaction, ...current].slice(0, 50);
    });

    toast.success("Deposit successful!", {
      description: `${amount} BTC added to your vault`,
      icon: "💰",
    });
  };

  const handlePurchaseFlashSale = (card: FlashSaleCard) => {
    const finalPrice = card.originalPrice * (1 - card.discount / 100);
    toast.success("Purchase successful!", {
      description: `${card.title} activated for $${finalPrice.toFixed(0)}`,
    });
  };

  const getIconComponent = (iconType: "lightning" | "star" | "rocket") => {
    switch (iconType) {
      case "lightning":
        return Lightning;
      case "star":
        return Star;
      case "rocket":
        return Rocket;
    }
  };

  const getColorClasses = (color: "primary" | "accent" | "destructive") => {
    switch (color) {
      case "primary":
        return {
          border: "border-primary",
          bg: "bg-primary/20",
          text: "text-primary",
          glow: "neon-glow-primary",
          shadow: "shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.4)]",
          hoverShadow: "hover:shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.6)]",
        };
      case "accent":
        return {
          border: "border-accent",
          bg: "bg-accent/20",
          text: "text-accent",
          glow: "neon-glow-accent",
          shadow: "shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.4)]",
          hoverShadow: "hover:shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.6)]",
        };
      case "destructive":
        return {
          border: "border-destructive",
          bg: "bg-destructive/20",
          text: "text-destructive",
          glow: "neon-glow-destructive",
          shadow: "shadow-[0_0_20px_oklch(0.65_0.25_25_/_0.4)]",
          hoverShadow: "hover:shadow-[0_0_30px_oklch(0.65_0.25_25_/_0.6)]",
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative min-h-[500px] overflow-hidden border-4 border-primary/50 shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.4),inset_0_0_50px_oklch(0.72_0.20_195_/_0.1)] p-8 md:p-12 bg-gradient-to-br from-card via-background to-card">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ mixBlendMode: "screen" }}
        />

        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 pointer-events-none" />
        <div className="absolute inset-0 diagonal-stripes opacity-20 pointer-events-none" />

        <motion.div
          className="absolute top-6 right-6 flex items-center gap-3 bg-card/95 border-3 border-primary/60 px-6 py-3 jagged-corner shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.4)]"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Lock size={32} weight="duotone" className="text-primary" />
          <div>
            <p className="text-xs text-primary uppercase tracking-[0.2em] font-bold">
              SECURED
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              VAULT SYSTEM
            </p>
          </div>
        </motion.div>

        {floatingCoins.map((coin) => {
          const isBitcoin = coin.id % 2 === 0;
          return (
            <motion.div
              key={coin.id}
              className="absolute w-24 h-24 md:w-32 md:h-32 pointer-events-none"
              style={{
                left: `${coin.x}%`,
                top: `${coin.y}%`,
                perspective: "1200px",
                transformStyle: "preserve-3d",
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, Math.sin(coin.id) * 25, 0],
                rotateY: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: coin.duration,
                delay: coin.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div
                className="relative w-full h-full"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className={`absolute inset-0 rounded-full blur-3xl opacity-80 animate-pulse ${isBitcoin ? "bg-gradient-to-br from-[oklch(0.70_0.18_50)] via-[oklch(0.65_0.15_45)] to-[oklch(0.70_0.18_50)]" : "bg-gradient-to-br from-primary via-accent to-primary"}`}
                />
                <div
                  className={`absolute inset-0 rounded-full bg-gradient-to-br from-card/95 to-background/95 border-[6px] flex items-center justify-center ${isBitcoin ? "border-[oklch(0.70_0.18_50)]" : "border-primary"}`}
                  style={{
                    transform: "translateZ(15px)",
                    boxShadow: isBitcoin
                      ? "0 15px 40px rgba(0,0,0,0.6), 0 0 30px oklch(0.70 0.18 50 / 0.8), inset 0 0 30px oklch(0.70 0.18 50 / 0.3), inset 0 -8px 20px rgba(0,0,0,0.4)"
                      : "0 15px 40px rgba(0,0,0,0.6), 0 0 30px oklch(0.72 0.20 195 / 0.8), inset 0 0 30px oklch(0.72 0.20 195 / 0.3), inset 0 -8px 20px rgba(0,0,0,0.4)",
                  }}
                >
                  {isBitcoin ? (
                    <div className="relative">
                      <div className="absolute inset-0 blur-lg">
                        <CurrencyBtc
                          className="w-12 h-12 md:w-20 md:h-20 text-[oklch(0.70_0.18_50)]"
                          weight="fill"
                        />
                      </div>
                      <CurrencyBtc
                        className="w-12 h-12 md:w-20 md:h-20 text-[oklch(0.70_0.18_50)] relative z-10"
                        weight="fill"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 blur-lg">
                        <SolanaLogo className="w-12 h-12 md:w-20 md:h-20 text-primary" />
                      </div>
                      <SolanaLogo className="w-12 h-12 md:w-20 md:h-20 text-primary relative z-10" />
                    </div>
                  )}
                </div>
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-t from-black/50 to-transparent"
                  style={{ transform: "translateZ(8px)" }}
                />
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent"
                  style={{ transform: "translateZ(20px)" }}
                />
              </div>
            </motion.div>
          );
        })}

        <div className="relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-4 mb-6">
              <motion.div
                className="p-4 jagged-corner bg-primary/20 border-4 border-primary shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.6)]"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Vault size={48} weight="duotone" className="text-primary" />
              </motion.div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary font-bold mb-1">
                  QUANTUM FALCON
                </p>
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-bold">
                  VAULT PROTOCOL
                </p>
              </div>
            </div>
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-black tracking-[0.15em] uppercase leading-tight"
              style={{
                textShadow:
                  "4px 4px 0 oklch(0.08 0.02 280), -1px -1px 0 oklch(0.08 0.02 280), 1px -1px 0 oklch(0.08 0.02 280), -1px 1px 0 oklch(0.08 0.02 280), 0 0 25px oklch(0.72 0.20 195 / 0.9)",
                WebkitTextStroke: "1px oklch(0.08 0.02 280)",
              }}
            >
              <span className="block text-foreground drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                REVOLUTIONIZING
              </span>
              <span className="block text-primary neon-glow-primary mt-2 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                CRYPTO WEALTH
              </span>
              <span className="block text-accent neon-glow-accent mt-2 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
                ACCUMULATION
              </span>
            </h1>
          </motion.div>

          <motion.p
            className="text-lg md:text-xl max-w-2xl leading-relaxed font-bold bg-card/95 border-3 border-primary/60 p-6 jagged-corner-small backdrop-blur-sm shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.4)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              textShadow:
                "2px 2px 0 oklch(0.08 0.02 280), 0 2px 4px rgba(0,0,0,0.8)",
            }}
          >
            <span className="text-foreground">
              A new paradigm of autonomous trading, built for investors who
              value{" "}
            </span>
            <span className="text-primary font-black neon-glow-primary drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              speed
            </span>
            <span className="text-foreground">, </span>
            <span className="text-accent font-black neon-glow-accent drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              clarity
            </span>
            <span className="text-foreground">, and </span>
            <span className="text-secondary font-black neon-glow-secondary drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
              security
            </span>
            <span className="text-foreground">.</span>
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button
              size="lg"
              onClick={() => {
                const vaultSection = document.getElementById(
                  "vault-balance-section",
                );
                if (vaultSection) {
                  vaultSection.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                  toast.success("Accessing Vault", {
                    description: "Scrolling to your BTC balance",
                  });
                }
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground jagged-corner border-4 border-primary shadow-[0_0_25px_oklch(0.72_0.20_195_/_0.6)] hover:shadow-[0_0_35px_oklch(0.72_0.20_195_/_0.8)] uppercase tracking-[0.15em] font-bold px-8 py-6 text-base group"
            >
              <Vault
                size={24}
                weight="duotone"
                className="mr-2 group-hover:animate-pulse"
              />
              Access Vault
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowTutorial(true)}
              className="jagged-corner border-4 border-primary text-primary hover:bg-primary/10 uppercase tracking-[0.15em] font-bold px-8 py-6 text-base shadow-[0_0_15px_oklch(0.72_0.20_195_/_0.4)] hover:shadow-[0_0_25px_oklch(0.72_0.20_195_/_0.6)] bg-card/80 backdrop-blur-sm"
            >
              <Question size={24} weight="duotone" className="mr-2" />
              Learn How It Works
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="border-4 border-destructive/60 bg-gradient-to-br from-card to-background relative overflow-hidden shadow-[0_0_40px_oklch(0.65_0.25_25_/_0.5)]">
        <div className="absolute inset-0 diagonal-stripes opacity-10 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-destructive to-transparent" />
        <div className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <motion.div
                className="p-3 jagged-corner bg-destructive/30 border-4 border-destructive shadow-[0_0_20px_oklch(0.65_0.25_25_/_0.6)]"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Flame
                  size={32}
                  weight="duotone"
                  className="text-destructive"
                />
              </motion.div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <div className="px-3 py-1 bg-destructive border-2 border-destructive jagged-corner-small">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-destructive-foreground">
                      ⚡ FLASH_SALE
                    </span>
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-[0.15em] text-destructive neon-glow-destructive hud-text">
                    LIMITED OFFERS
                  </h2>
                </div>
                <p className="text-xs uppercase tracking-wide font-bold text-muted-foreground">
                  Rotating deals • Changes every 3 hours
                </p>
              </div>
            </div>
            <motion.div
              className="px-4 py-2 bg-card/95 border-3 border-destructive jagged-corner-small shadow-[0_0_15px_oklch(0.65_0.25_25_/_0.4)]"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="flex items-center gap-2">
                <Lightning
                  size={16}
                  weight="fill"
                  className="text-destructive"
                />
                <span className="text-sm font-black uppercase tracking-wider text-destructive hud-readout">
                  {timeRemaining}
                </span>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {flashSales.map((card, index) => {
              const Icon = getIconComponent(card.icon);
              const colors = getColorClasses(card.color);
              const finalPrice = card.originalPrice * (1 - card.discount / 100);

              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`relative overflow-hidden group cursor-pointer border-3 ${colors.border} p-6 jagged-corner bg-gradient-to-br from-card to-background ${colors.shadow} ${colors.hoverShadow} transition-all`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute top-2 left-2 z-20">
                    <motion.div
                      className="px-2 py-1 bg-destructive border-2 border-destructive jagged-corner-small"
                      animate={{ rotate: [0, -2, 2, -2, 0] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                    >
                      <span className="text-[10px] uppercase tracking-[0.2em] font-black text-destructive-foreground">
                        -{card.discount}% OFF
                      </span>
                    </motion.div>
                  </div>

                  <div
                    className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} rounded-full blur-3xl group-hover:opacity-100 transition-all opacity-50`}
                  />
                  <div
                    className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-${card.color} to-transparent`}
                  />

                  <div className="relative z-10 pt-6">
                    <div className="flex items-center justify-center mb-4">
                      <div
                        className={`p-4 jagged-corner ${colors.bg} border-3 ${colors.border}`}
                      >
                        <Icon
                          size={48}
                          weight="duotone"
                          className={colors.text}
                        />
                      </div>
                    </div>

                    <div className="text-center mb-4">
                      <h3
                        className={`text-lg uppercase tracking-[0.15em] font-black mb-2 ${colors.text} ${colors.glow}`}
                        style={{
                          textShadow:
                            "2px 2px 0 oklch(0.08 0.02 280), 0 0 15px currentColor",
                          WebkitTextStroke: "0.5px oklch(0.08 0.02 280)",
                        }}
                      >
                        {card.title}
                      </h3>
                      <div className="px-2 py-1 bg-card/80 border border-border inline-block mb-3">
                        <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-muted-foreground">
                          {card.category}
                        </span>
                      </div>
                      <p
                        className="text-sm leading-relaxed font-semibold"
                        style={{
                          textShadow: "1px 1px 0 oklch(0.08 0.02 280)",
                          color: "oklch(0.85 0.08 195)",
                        }}
                      >
                        {card.description}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-lg line-through text-muted-foreground font-bold">
                          ${card.originalPrice}
                        </span>
                        <span
                          className={`text-2xl font-black ${colors.text} ${colors.glow}`}
                          style={{
                            textShadow:
                              "2px 2px 0 oklch(0.08 0.02 280), 0 0 12px currentColor",
                          }}
                        >
                          ${finalPrice.toFixed(0)}
                        </span>
                      </div>

                      <Button
                        onClick={() => handlePurchaseFlashSale(card)}
                        className={`w-full ${colors.bg} hover:opacity-90 ${colors.text} jagged-corner border-3 ${colors.border} ${colors.shadow} hover:${colors.hoverShadow} uppercase tracking-[0.15em] font-bold py-6 text-sm group/btn`}
                      >
                        <Lightning
                          size={20}
                          weight="fill"
                          className="mr-2 group-hover/btn:animate-pulse"
                        />
                        CLAIM OFFER
                      </Button>
                    </div>

                    <motion.div
                      className="absolute bottom-2 right-2 opacity-20"
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <Icon
                        size={80}
                        weight="duotone"
                        className={colors.text}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          className="relative overflow-hidden group cursor-pointer border-3 border-primary/60 p-6 jagged-corner bg-gradient-to-br from-card to-background shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.3)] hover:shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.5)]"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 border-2 angled-corner-tr bg-primary/5 border-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-primary opacity-5" />
                <Cube
                  size={32}
                  weight="duotone"
                  className="text-primary relative z-10"
                />
              </div>
              <div className="status-indicator" />
            </div>
            <h3
              className="text-sm uppercase tracking-[0.2em] font-black mb-2"
              style={{
                textShadow:
                  "2px 2px 0 oklch(0.08 0.02 280), 0 2px 4px rgba(0,0,0,0.8)",
                WebkitTextStroke: "0.5px oklch(0.12 0.03 280)",
                color: "oklch(0.95 0.08 195)",
              }}
            >
              AUTO CONVERT SOL
            </h3>
            <p
              className="text-3xl font-black text-primary neon-glow-primary mb-1"
              style={{
                textShadow:
                  "2px 2px 0 oklch(0.08 0.02 280), 0 0 15px oklch(0.72 0.20 195 / 0.9)",
                WebkitTextStroke: "0.5px oklch(0.08 0.02 280)",
              }}
            >
              {solanaAccumulated?.toFixed(2) || "0.00"}
            </p>
            <p
              className="text-xs uppercase tracking-wide font-bold bg-card/90 px-2 py-1 inline-block border-2 border-primary/50"
              style={{
                textShadow:
                  "1px 1px 0 oklch(0.08 0.02 280), 0 1px 3px rgba(0,0,0,0.7)",
                color: "oklch(0.90 0.08 195)",
              }}
            >
              Solana accumulated from trades
            </p>
          </div>
        </motion.div>

        <motion.div
          className="relative overflow-hidden group cursor-pointer border-3 border-accent/60 p-6 jagged-corner bg-gradient-to-br from-card to-background shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)] hover:shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.5)]"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-all" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 border-2 cut-corner-tr bg-accent/5 border-accent relative overflow-hidden">
                <div className="absolute inset-0 bg-accent opacity-5" />
                <Hexagon
                  size={32}
                  weight="duotone"
                  className="text-accent animate-pulse-glow relative z-10"
                />
              </div>
              <div className="hud-readout text-accent">ACTIVE</div>
            </div>
            <h3
              className="text-sm uppercase tracking-[0.2em] font-black mb-2"
              style={{
                textShadow:
                  "2px 2px 0 oklch(0.08 0.02 280), 0 2px 4px rgba(0,0,0,0.8)",
                WebkitTextStroke: "0.5px oklch(0.12 0.03 280)",
                color: "oklch(0.95 0.08 195)",
              }}
            >
              CONVERSION RATE
            </h3>
            <p
              className="text-3xl font-black text-accent neon-glow-accent mb-1"
              style={{
                textShadow:
                  "2px 2px 0 oklch(0.08 0.02 280), 0 0 15px oklch(0.68 0.18 330 / 0.9)",
                WebkitTextStroke: "0.5px oklch(0.08 0.02 280)",
              }}
            >
              AUTO
            </p>
            <p
              className="text-xs uppercase tracking-wide font-bold bg-card/90 px-2 py-1 inline-block border-2 border-accent/50"
              style={{
                textShadow:
                  "1px 1px 0 oklch(0.08 0.02 280), 0 1px 3px rgba(0,0,0,0.7)",
                color: "oklch(0.90 0.08 195)",
              }}
            >
              Optimal market conversion to BTC
            </p>
          </div>
        </motion.div>

        <motion.div
          className="relative overflow-hidden group cursor-pointer border-3 border-secondary/60 p-6 jagged-corner bg-gradient-to-br from-card to-background shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)] hover:shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.5)]"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary to-transparent" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 border-2 angled-corner-br bg-secondary/5 border-secondary relative overflow-hidden">
                <div className="absolute inset-0 bg-secondary opacity-5" />
                <Pentagon
                  size={32}
                  weight="duotone"
                  className="text-secondary relative z-10"
                />
              </div>
              <div
                className="status-indicator bg-secondary"
                style={{
                  boxShadow:
                    "0 0 8px var(--secondary), 0 0 16px var(--secondary)",
                }}
              />
            </div>
            <h3
              className="text-sm uppercase tracking-[0.2em] font-black mb-2"
              style={{
                textShadow:
                  "2px 2px 0 oklch(0.08 0.02 280), 0 2px 4px rgba(0,0,0,0.8)",
                WebkitTextStroke: "0.5px oklch(0.12 0.03 280)",
                color: "oklch(0.95 0.08 195)",
              }}
            >
              ZERO FEES
            </h3>
            <p
              className="text-3xl font-black text-secondary neon-glow-secondary mb-1"
              style={{
                textShadow:
                  "2px 2px 0 oklch(0.08 0.02 280), 0 0 15px oklch(0.68 0.18 330 / 0.9)",
                WebkitTextStroke: "0.5px oklch(0.08 0.02 280)",
              }}
            >
              0%
            </p>
            <p
              className="text-xs uppercase tracking-wide font-bold bg-card/90 px-2 py-1 inline-block border-2 border-secondary/50"
              style={{
                textShadow:
                  "1px 1px 0 oklch(0.08 0.02 280), 0 1px 3px rgba(0,0,0,0.7)",
                color: "oklch(0.90 0.08 195)",
              }}
            >
              No trading fees on conversions
            </p>
          </div>
        </motion.div>
      </div>

      <div
        className="relative overflow-hidden border-4 border-secondary/60 shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.4)] bg-gradient-to-br from-card to-background"
        id="vault-balance-section"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent" />
        <div className="p-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 jagged-corner bg-secondary/30 border-4 border-secondary shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.5)]">
                  <CurrencyBtc
                    size={40}
                    weight="duotone"
                    className="text-secondary"
                  />
                </div>
                <div>
                  <p
                    className="text-xs uppercase tracking-[0.15em] hud-text font-black"
                    style={{
                      textShadow:
                        "2px 2px 0 oklch(0.08 0.02 280), 0 2px 4px rgba(0,0,0,0.8)",
                      WebkitTextStroke: "0.5px oklch(0.12 0.03 280)",
                      color: "oklch(0.95 0.08 195)",
                    }}
                  >
                    TOTAL BTC VAULT BALANCE
                  </p>
                  <p
                    className="text-sm uppercase tracking-wide mt-1 font-bold bg-card/90 px-2 py-1 inline-block border-2 border-secondary/50"
                    style={{
                      textShadow:
                        "1px 1px 0 oklch(0.08 0.02 280), 0 1px 3px rgba(0,0,0,0.7)",
                      color: "oklch(0.90 0.08 195)",
                    }}
                  >
                    Secured & Growing
                  </p>
                </div>
              </div>
              <p
                className="text-5xl md:text-6xl font-black text-secondary neon-glow-secondary hud-value mb-2"
                style={{
                  textShadow:
                    "3px 3px 0 oklch(0.08 0.02 280), 0 0 20px oklch(0.68 0.18 330 / 0.9)",
                  WebkitTextStroke: "1px oklch(0.08 0.02 280)",
                }}
              >
                {btcBalance?.toFixed(6) || "0.000000"}
                <span className="text-2xl ml-2">BTC</span>
              </p>
              <p
                className="text-lg uppercase tracking-wide font-black bg-card/90 px-3 py-1.5 inline-block border-3 border-secondary/60"
                style={{
                  textShadow:
                    "2px 2px 0 oklch(0.08 0.02 280), 0 2px 4px rgba(0,0,0,0.8)",
                  color: "oklch(0.90 0.08 195)",
                }}
              >
                ≈ ${((btcBalance || 0) * 45000).toFixed(2)} USD
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-card border-3 border-primary/50 jagged-corner-small shadow-[0_0_15px_oklch(0.72_0.20_195_/_0.4)]">
                <p
                  className="text-xs uppercase tracking-wide mb-1 font-black"
                  style={{
                    textShadow:
                      "1px 1px 0 oklch(0.08 0.02 280), 0 1px 3px rgba(0,0,0,0.7)",
                    color: "oklch(0.90 0.08 195)",
                  }}
                >
                  24H
                </p>
                <p
                  className="text-xl font-black text-secondary neon-glow-secondary"
                  style={{
                    textShadow:
                      "2px 2px 0 oklch(0.08 0.02 280), 0 0 10px oklch(0.68 0.18 330 / 0.9)",
                  }}
                >
                  +0.00012
                </p>
              </div>
              <div className="text-center p-4 bg-card border-3 border-primary/50 jagged-corner-small shadow-[0_0_15px_oklch(0.72_0.20_195_/_0.4)]">
                <p
                  className="text-xs uppercase tracking-wide mb-1 font-black"
                  style={{
                    textShadow:
                      "1px 1px 0 oklch(0.08 0.02 280), 0 1px 3px rgba(0,0,0,0.7)",
                    color: "oklch(0.90 0.08 195)",
                  }}
                >
                  GAIN
                </p>
                <p
                  className="text-xl font-black text-secondary neon-glow-secondary"
                  style={{
                    textShadow:
                      "2px 2px 0 oklch(0.08 0.02 280), 0 0 10px oklch(0.68 0.18 330 / 0.9)",
                  }}
                >
                  +47.3%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-4 border-accent/60 shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.4)] bg-gradient-to-br from-card to-background">
        <div className="p-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 jagged-corner-small bg-accent/30 border-3 border-accent shadow-[0_0_15px_oklch(0.68_0.18_330_/_0.5)]">
              <TrendUp size={32} weight="duotone" className="text-accent" />
            </div>
            <div>
              <h3
                className="text-2xl font-bold uppercase tracking-[0.15em] text-accent hud-text"
                style={{
                  textShadow:
                    "2px 2px 0 oklch(0.08 0.02 280), 0 0 15px oklch(0.68 0.18 330 / 0.9)",
                  WebkitTextStroke: "0.5px oklch(0.08 0.02 280)",
                }}
              >
                DEPOSIT BTC
              </h3>
              <p
                className="text-xs uppercase tracking-wide mt-1 font-bold bg-card/90 px-2 py-1 inline-block border-2 border-accent/50"
                style={{
                  textShadow:
                    "1px 1px 0 oklch(0.08 0.02 280), 0 1px 3px rgba(0,0,0,0.7)",
                  color: "oklch(0.90 0.08 195)",
                }}
              >
                Add Bitcoin to your secure vault
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="deposit-amount"
                  className="uppercase tracking-wide text-xs font-black"
                  style={{
                    textShadow:
                      "1px 1px 0 oklch(0.08 0.02 280), 0 1px 3px rgba(0,0,0,0.7)",
                    color: "oklch(0.90 0.08 195)",
                  }}
                >
                  Amount (BTC)
                </Label>
                <Input
                  id="deposit-amount"
                  type="number"
                  step="0.000001"
                  placeholder="0.000000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="bg-card border-3 border-accent/50 focus:border-accent jagged-corner-small h-12 text-lg font-mono shadow-[0_0_10px_oklch(0.68_0.18_330_/_0.3)] focus:shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.5)]"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[0.001, 0.005, 0.01].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setDepositAmount(amount.toString())}
                    className="border-accent/50 text-accent hover:bg-accent/10 jagged-corner-small text-xs"
                  >
                    {amount} BTC
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center p-6 bg-accent/10 border-2 border-accent/30 jagged-corner">
              <div className="text-center space-y-2">
                <ShieldCheck
                  size={48}
                  weight="duotone"
                  className="text-accent mx-auto"
                />
                <p
                  className="text-sm font-bold uppercase tracking-wide"
                  style={{
                    textShadow: "1px 1px 0 oklch(0.08 0.02 280)",
                    color: "oklch(0.90 0.08 195)",
                  }}
                >
                  INSTANT CREDIT
                </p>
                <p className="text-xs text-muted-foreground">
                  Your BTC is instantly available for trading
                </p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => {
              const amount = parseFloat(depositAmount);
              if (amount) {
                handleDeposit(amount);
                setDepositAmount("");
              }
            }}
            className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground jagged-corner border-4 border-accent shadow-[0_0_25px_oklch(0.68_0.18_330_/_0.6)] hover:shadow-[0_0_35px_oklch(0.68_0.18_330_/_0.8)] uppercase tracking-[0.15em] font-bold h-14 text-base"
          >
            <TrendUp size={24} weight="bold" className="mr-2" />
            Secure Deposit
          </Button>
        </div>
      </div>

      <div className="border-4 border-primary/60 shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.4)] bg-gradient-to-br from-card to-background">
        <div className="p-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 jagged-corner-small bg-primary/30 border-3 border-primary shadow-[0_0_15px_oklch(0.72_0.20_195_/_0.5)]">
              <ArrowUp size={32} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h3
                className="text-2xl font-bold uppercase tracking-[0.15em] text-primary hud-text"
                style={{
                  textShadow:
                    "2px 2px 0 oklch(0.08 0.02 280), 0 0 15px oklch(0.72 0.20 195 / 0.9)",
                  WebkitTextStroke: "0.5px oklch(0.08 0.02 280)",
                }}
              >
                WITHDRAW BTC
              </h3>
              <p
                className="text-xs uppercase tracking-wide mt-1 font-bold bg-card/90 px-2 py-1 inline-block border-2 border-primary/50"
                style={{
                  textShadow:
                    "1px 1px 0 oklch(0.08 0.02 280), 0 1px 3px rgba(0,0,0,0.7)",
                  color: "oklch(0.90 0.08 195)",
                }}
              >
                Transfer Bitcoin from vault to external wallet
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="withdraw-amount"
                className="uppercase tracking-wide text-xs font-black"
                style={{
                  textShadow:
                    "1px 1px 0 oklch(0.08 0.02 280), 0 1px 3px rgba(0,0,0,0.7)",
                  color: "oklch(0.90 0.08 195)",
                }}
              >
                Amount (BTC)
              </Label>
              <Input
                id="withdraw-amount"
                type="number"
                step="0.000001"
                placeholder="0.000000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-card border-3 border-primary/50 focus:border-primary jagged-corner-small h-12 text-lg font-mono shadow-[0_0_10px_oklch(0.72_0.20_195_/_0.3)] focus:shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.5)]"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="withdraw-address"
                className="uppercase tracking-wide text-xs font-black"
                style={{
                  textShadow:
                    "1px 1px 0 oklch(0.08 0.02 280), 0 1px 3px rgba(0,0,0,0.7)",
                  color: "oklch(0.90 0.08 195)",
                }}
              >
                Destination Address
              </Label>
              <Input
                id="withdraw-address"
                type="text"
                placeholder="bc1q..."
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                className="bg-card border-3 border-primary/50 focus:border-primary jagged-corner-small font-mono text-sm h-12 shadow-[0_0_10px_oklch(0.72_0.20_195_/_0.3)] focus:shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.5)]"
              />
            </div>
          </div>
          <Button
            onClick={handleWithdraw}
            className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground jagged-corner border-4 border-primary shadow-[0_0_25px_oklch(0.72_0.20_195_/_0.6)] hover:shadow-[0_0_35px_oklch(0.72_0.20_195_/_0.8)] uppercase tracking-[0.15em] font-bold h-14 text-base"
          >
            <ArrowUp size={24} weight="bold" className="mr-2" />
            Initiate Secure Withdrawal
          </Button>
        </div>
      </div>

      <div className="scan-line-effect border-4 border-primary/60 shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.4)] bg-gradient-to-br from-card to-background">
        <div className="p-8 relative z-10">
          <h3
            className="text-2xl font-bold uppercase tracking-[0.15em] text-primary hud-text mb-6"
            style={{
              textShadow:
                "2px 2px 0 oklch(0.08 0.02 280), 0 0 15px oklch(0.72 0.20 195 / 0.9)",
              WebkitTextStroke: "0.5px oklch(0.08 0.02 280)",
            }}
          >
            TRANSACTION HISTORY
          </h3>
          {!transactions || transactions.length === 0 ? (
            <div className="text-center py-12">
              <Vault
                size={64}
                weight="duotone"
                className="text-muted-foreground mx-auto mb-4 opacity-50"
              />
              <p
                className="uppercase tracking-wide font-black"
                style={{
                  textShadow:
                    "1px 1px 0 oklch(0.08 0.02 280), 0 1px 3px rgba(0,0,0,0.7)",
                  color: "oklch(0.90 0.08 195)",
                }}
              >
                NO TRANSACTIONS YET
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((tx) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-5 jagged-corner bg-card border-3 border-primary/40 hover:border-primary/70 transition-all group shadow-[0_0_10px_oklch(0.72_0.20_195_/_0.2)] hover:shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.4)]"
                >
                  <div className="flex items-center gap-4">
                    {tx.type === "deposit" ? (
                      <div className="w-12 h-12 jagged-corner-small bg-secondary/30 border-3 border-secondary flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_10px_oklch(0.68_0.18_330_/_0.4)]">
                        <TrendUp
                          size={20}
                          weight="duotone"
                          className="text-secondary"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 jagged-corner-small bg-destructive/30 border-3 border-destructive flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_10px_oklch(0.65_0.25_25_/_0.4)]">
                        <ArrowUp
                          size={20}
                          weight="duotone"
                          className="text-destructive"
                        />
                      </div>
                    )}
                    <div>
                      <p
                        className="text-base font-black uppercase tracking-wide"
                        style={{
                          textShadow:
                            "1px 1px 0 oklch(0.08 0.02 280), 0 1px 3px rgba(0,0,0,0.7)",
                          color: "oklch(0.90 0.08 195)",
                        }}
                      >
                        {tx.type}
                      </p>
                      <p
                        className="text-xs uppercase tracking-wide font-bold bg-card/90 px-2 py-0.5 inline-block border border-primary/40"
                        style={{
                          textShadow: "1px 1px 0 oklch(0.08 0.02 280)",
                          color: "oklch(0.80 0.08 195)",
                        }}
                      >
                        {new Date(tx.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`text-lg font-black hud-value ${tx.type === "deposit" ? "text-secondary neon-glow-secondary" : "text-destructive neon-glow-destructive"}`}
                    style={{
                      textShadow:
                        tx.type === "deposit"
                          ? "2px 2px 0 oklch(0.08 0.02 280), 0 0 12px oklch(0.68 0.18 330 / 0.9)"
                          : "2px 2px 0 oklch(0.08 0.02 280), 0 0 12px oklch(0.65 0.25 25 / 0.9)",
                      WebkitTextStroke: "0.5px oklch(0.08 0.02 280)",
                    }}
                  >
                    {tx.type === "deposit" ? "+" : "-"}
                    {tx.amount.toFixed(6)} BTC
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <VaultTutorial open={showTutorial} onOpenChange={setShowTutorial} />
    </div>
  );
}
