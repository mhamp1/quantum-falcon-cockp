import {
  Star,
  Lightning,
  Shield,
  Lock,
  ArrowDown,
  Clock,
  ArrowUp,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Offer {
  id: string;
  title: string;
  description: string;
  price: string;
  icon: any;
  iconColor: string;
  borderColor: string;
  buttonColor: string;
}

interface Wallet {
  asset: string;
  balance: string;
  iconColor: string;
}

const offers: Offer[] = [
  {
    id: "diamond",
    title: "DIAMOND PACKAGE",
    description: "Unlock premium features",
    price: "$500 /mo",
    icon: Star,
    iconColor: "text-secondary",
    borderColor: "border-destructive",
    buttonColor: "bg-secondary hover:bg-secondary/80",
  },
  {
    id: "multiplier",
    title: "TRADE MULTIPLIER",
    description: "Boost trade volume x2",
    price: "$100 /mo",
    icon: Lightning,
    iconColor: "text-primary",
    borderColor: "border-destructive",
    buttonColor: "bg-primary hover:bg-primary/80",
  },
  {
    id: "stealth",
    title: "STEALTH MODE",
    description: "Anonymous trading",
    price: "$200 /mo",
    icon: Shield,
    iconColor: "text-destructive",
    borderColor: "border-destructive",
    buttonColor: "bg-destructive hover:bg-destructive/80",
  },
];

const wallets: Wallet[] = [
  { asset: "SOL Wallet", balance: "927.29 SOL", iconColor: "text-secondary" },
  { asset: "BTC Wallet", balance: "0.0022340 BTC", iconColor: "text-[#FFD700]" },
  { asset: "BONK Wallet", balance: "1,234.56 BONK", iconColor: "text-accent" },
  { asset: "RAY Wallet", balance: "45.67 RAY", iconColor: "text-primary" },
];

export default function VaultTab() {
  const [autoDeposit, setAutoDeposit] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleBuyOffer = (offerTitle: string) => {
    toast.success(`Purchasing ${offerTitle}`, {
      description: "Processing payment...",
    });
  };

  const handleDeposit = () => {
    if (!depositAmount) {
      toast.error("Please enter an amount");
      return;
    }
    toast.success(`Depositing ${depositAmount} BTC`, {
      description: "Transaction initiated",
    });
    setDepositAmount("");
  };

  const handleWithdraw = () => {
    if (!withdrawAmount) {
      toast.error("Please enter an amount");
      return;
    }
    toast.success(`Withdrawing ${withdrawAmount} BTC`, {
      description: "Secure withdrawal initiated",
    });
    setWithdrawAmount("");
  };

  return (
    <div className="relative min-h-full overflow-hidden">
      {/* Animated 3D Token Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Nebula Background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at bottom, #330033 0%, #000033 50%, #0B0F14 100%)",
          }}
        />
        
        {/* Floating Tokens */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 40 - 20, 0],
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          >
            <div
              className={`rounded-full ${i % 3 === 0 ? "bg-[#FFD700]" : i % 3 === 1 ? "bg-secondary" : "bg-primary"}`}
              style={{
                width: `${50 + Math.random() * 100}px`,
                height: `${50 + Math.random() * 100}px`,
                opacity: 0.3,
                boxShadow: `0 0 20px ${i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#9945FF" : "#14F195"}`,
                filter: "blur(2px)",
              }}
            />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 space-y-8 pb-12 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h1 className="text-4xl font-bold uppercase tracking-[0.15em] text-primary" style={{
              textShadow: "0 0 12px #14F195, 0 0 24px #14F195"
            }}>
              REVOLUTIONIZING
            </h1>
            <h1 className="text-6xl font-bold uppercase tracking-[0.15em] text-secondary" style={{
              textShadow: "0 0 12px #9945FF, 0 0 24px #9945FF"
            }}>
              CRYPTO WEALTH
            </h1>
            <h1 className="text-6xl font-bold uppercase tracking-[0.15em] text-primary" style={{
              textShadow: "0 0 12px #14F195, 0 0 24px #14F195"
            }}>
              ACCUMULATION
            </h1>
          </motion.div>
          <p className="text-sm text-white uppercase tracking-[0.15em]">
            A new paradigm of autonomous wealth building for traders who value
            precision.
          </p>
          <Button className="bg-primary hover:bg-primary/80 text-black font-bold px-8">
            <Lock size={16} className="mr-2" />
            ACCESS EARLY
          </Button>
        </div>

        {/* Limited Offer Section */}
        <div className="space-y-4">
          <div className="text-center">
            <span className="inline-block px-6 py-2 bg-black border-2 border-destructive rounded text-lg font-bold uppercase text-destructive">
              LIMITED OFFER
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {offers.map((offer, idx) => {
              const Icon = offer.icon;
              return (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`cyber-card p-6 space-y-4 ${offer.borderColor} hover:scale-105 transition-transform`}
                  style={{
                    clipPath:
                      "polygon(20px 0, 100% 0, calc(100% - 20px) 100%, 0 100%, 0 20px)",
                    boxShadow: "inset 0 0 8px rgba(255, 0, 0, 0.3)",
                  }}
                >
                  <Icon size={32} className={`${offer.iconColor} mx-auto`} weight="duotone" />
                  <h3 className="text-xl font-bold uppercase text-center">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-muted-foreground text-center">
                    {offer.description}
                  </p>
                  <div className="text-2xl font-bold text-center">
                    {offer.price}
                  </div>
                  <Button
                    onClick={() => handleBuyOffer(offer.title)}
                    className={`w-full ${offer.buttonColor} text-white font-bold`}
                  >
                    Buy Now
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Vault Balance */}
        <div className="cyber-card p-6 flex items-center justify-between">
          <h3 className="text-lg font-bold uppercase text-primary">
            Your Vault Balance
          </h3>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">SOL</div>
              <div className="text-2xl font-bold">927.29 SOL</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm uppercase">Auto Deposit</span>
              <Switch
                checked={autoDeposit}
                onCheckedChange={setAutoDeposit}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Fee</div>
              <div className="text-2xl font-bold">0%</div>
            </div>
          </div>
        </div>

        {/* BTC Balance Display */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4">
            <span className="text-5xl font-bold text-primary" style={{
              textShadow: "0 0 8px #14F195"
            }}>
              0.0022340 BTC
            </span>
            <span className="text-2xl font-bold text-destructive flex items-center gap-1">
              <ArrowDown size={16} />
              -0.48%
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Trade Multiplier Active
          </p>
        </div>

        {/* Deposit BTC */}
        <div className="cyber-card p-6 space-y-4 border-secondary max-w-3xl mx-auto">
          <h3 className="text-lg font-bold uppercase text-secondary">
            DEPOSIT BTC
          </h3>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              placeholder="0.00"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="flex-1 text-2xl text-center bg-black/50 border-primary/30"
            />
            <Button
              variant="outline"
              size="sm"
              className="border-primary text-primary"
              onClick={() => setDepositAmount("0.0022340")}
            >
              MAX
            </Button>
            <Button
              onClick={handleDeposit}
              className="bg-secondary hover:bg-secondary/80 text-white font-bold px-8"
            >
              <Lock size={16} className="mr-2" />
              Deposit
            </Button>
          </div>
        </div>

        {/* Asset Wallets List */}
        <div className="space-y-1 max-w-4xl mx-auto">
          {wallets.map((wallet, idx) => (
            <div
              key={wallet.asset}
              className={`p-4 flex items-center justify-between ${
                idx % 2 === 0 ? "bg-[#1A1A1A]" : "bg-[#202020]"
              } border-b border-gray-800`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-full ${wallet.iconColor} bg-opacity-20 flex items-center justify-center`}
                />
                <span className="text-lg font-semibold uppercase text-primary">
                  {wallet.asset}
                </span>
              </div>
              <div className="flex items-center gap-8">
                <span className="text-xl font-bold">{wallet.balance}</span>
                <Button
                  size="sm"
                  className="bg-secondary hover:bg-secondary/80 text-white px-4"
                >
                  <ArrowUp size={12} className="mr-1" />
                  Upgrade
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Withdraw BTC */}
        <div className="cyber-card p-6 space-y-4 max-w-3xl mx-auto">
          <h3 className="text-lg font-bold uppercase text-primary">
            WITHDRAW BTC
          </h3>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              placeholder="0.00"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="flex-1 text-2xl text-center bg-black/50 border-primary/30"
            />
            <Button
              onClick={handleWithdraw}
              className="bg-primary hover:bg-primary/80 text-black font-bold px-8"
            >
              Secure Withdraw
            </Button>
          </div>
        </div>

        {/* Transaction History */}
        <div className="cyber-card p-6 space-y-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 justify-center">
            <Clock size={24} className="text-primary" />
            <h3 className="text-xl font-bold uppercase text-primary">
              TRANSACTION HISTORY
            </h3>
          </div>
          <div className="h-48 flex items-center justify-center border border-primary/20 rounded">
            <p className="text-base text-muted-foreground">
              No Transactions Yet
            </p>
          </div>
        </div>

        {/* Empty space */}
        <div className="h-32" />
      </div>
    </div>
  );
}
