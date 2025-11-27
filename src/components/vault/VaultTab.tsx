// Secure Asset Vault — ULTIMATE v2025.1.0
// November 26, 2025 — Quantum Falcon Cockpit
// God Mode support, auto-conversion, cyberpunk visuals

import {
  Star,
  Lightning,
  Shield,
  Lock,
  ArrowDown,
  Clock,
  ArrowUp,
  Crown,
  Vault,
  Zap,
  Coins,
  TrendUp,
} from "@phosphor-icons/react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { useKVSafe as useKV } from "@/hooks/useKVFallback"
import { isGodMode } from "@/lib/godMode"
import { UserAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"

interface Offer {
  id: string
  title: string
  description: string
  price: string
  icon: any
  iconColor: string
  borderColor: string
  buttonColor: string
}

interface Wallet {
  asset: string
  balance: string
  iconColor: string
  usdValue: number
}

interface VaultStats {
  totalDeposited: number
  totalWithdrawn: number
  transactionCount: number
}

const offers: Offer[] = [
  {
    id: "diamond",
    title: "DIAMOND PACKAGE",
    description: "Unlock premium features",
    price: "$500 /mo",
    icon: Star,
    iconColor: "text-secondary",
    borderColor: "border-secondary/50",
    buttonColor: "bg-secondary hover:bg-secondary/80",
  },
  {
    id: "multiplier",
    title: "TRADE MULTIPLIER",
    description: "Boost trade volume x2",
    price: "$100 /mo",
    icon: Lightning,
    iconColor: "text-primary",
    borderColor: "border-primary/50",
    buttonColor: "bg-primary hover:bg-primary/80",
  },
  {
    id: "stealth",
    title: "STEALTH MODE",
    description: "Anonymous trading",
    price: "$200 /mo",
    icon: Shield,
    iconColor: "text-accent",
    borderColor: "border-accent/50",
    buttonColor: "bg-accent hover:bg-accent/80",
  },
]

const initialWallets: Wallet[] = [
  { asset: "SOL Wallet", balance: "927.29 SOL", iconColor: "text-secondary", usdValue: 92729 },
  { asset: "BTC Wallet", balance: "0.042069 BTC", iconColor: "text-[#FFD700]", usdValue: 4037 },
  { asset: "BONK Wallet", balance: "1,234,567 BONK", iconColor: "text-accent", usdValue: 24.69 },
  { asset: "RAY Wallet", balance: "45.67 RAY", iconColor: "text-primary", usdValue: 182.68 },
]

export default function VaultTab() {
  const [auth] = useKV<UserAuth>('user-auth', null)
  const isGodModeActive = isGodMode(auth)
  
  const [autoDeposit, setAutoDeposit] = useState(true)
  const [autoConvert, setAutoConvert] = useState(true)
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [wallets, setWallets] = useState(initialWallets)
  const [vaultStats, setVaultStats] = useKV<VaultStats>('vault-stats', {
    totalDeposited: 0,
    totalWithdrawn: 0,
    transactionCount: 0
  })
  
  // Simulated BTC balance
  const [btcBalance, setBtcBalance] = useState(0.042069)
  const [btcChange, setBtcChange] = useState(4.20)
  
  // Simulate live balance updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBtcBalance(prev => {
        const change = (Math.random() - 0.45) * 0.0001 // Slight upward bias
        return Math.max(0, prev + change)
      })
      setBtcChange(prev => {
        const change = (Math.random() - 0.5) * 0.5
        return prev + change
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleBuyOffer = (offerTitle: string) => {
    if (isGodModeActive) {
      toast.success(`${offerTitle} Activated!`, {
        description: "God Mode: All features unlocked instantly",
      })
    } else {
      toast.success(`Purchasing ${offerTitle}`, {
        description: "Processing payment...",
      })
    }
  }

  const handleDeposit = () => {
    if (!depositAmount) {
      toast.error("Please enter an amount")
      return
    }
    
    const amount = parseFloat(depositAmount)
    setBtcBalance(prev => prev + amount)
    setVaultStats(prev => ({
      totalDeposited: (prev?.totalDeposited || 0) + amount,
      totalWithdrawn: prev?.totalWithdrawn || 0,
      transactionCount: (prev?.transactionCount || 0) + 1
    }))
    
    toast.success(`Deposited ${depositAmount} BTC to Vault`, {
      description: isGodModeActive ? "God Mode: Instant confirmation" : "Transaction confirmed",
      icon: <Shield size={20} className="text-green-400" />
    })
    setDepositAmount("")
  }

  const handleWithdraw = () => {
    if (!withdrawAmount) {
      toast.error("Please enter an amount")
      return
    }
    
    const amount = parseFloat(withdrawAmount)
    if (amount > btcBalance && !isGodModeActive) {
      toast.error("Insufficient balance")
      return
    }
    
    setBtcBalance(prev => Math.max(0, prev - amount))
    setVaultStats(prev => ({
      totalDeposited: prev?.totalDeposited || 0,
      totalWithdrawn: (prev?.totalWithdrawn || 0) + amount,
      transactionCount: (prev?.transactionCount || 0) + 1
    }))
    
    toast.success(`Withdrew ${withdrawAmount} BTC`, {
      description: "Sent to your connected wallet",
      icon: <ArrowUp size={20} className="text-orange-400" />
    })
    setWithdrawAmount("")
  }

  const totalUsdValue = wallets.reduce((sum, w) => sum + w.usdValue, 0) + (btcBalance * 96000)

  return (
    <div className="relative min-h-full overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: isGodModeActive
              ? "radial-gradient(ellipse at bottom, #3d2800 0%, #1a1000 50%, #0B0F14 100%)"
              : "radial-gradient(ellipse at bottom, #330033 0%, #000033 50%, #0B0F14 100%)",
          }}
        />
        
        {/* Floating Tokens */}
        {[...Array(12)].map((_, i) => (
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
              className={cn(
                "rounded-full",
                isGodModeActive 
                  ? "bg-yellow-400"
                  : i % 3 === 0 ? "bg-[#FFD700]" : i % 3 === 1 ? "bg-secondary" : "bg-primary"
              )}
              style={{
                width: `${40 + Math.random() * 80}px`,
                height: `${40 + Math.random() * 80}px`,
                opacity: 0.2,
                boxShadow: `0 0 20px ${isGodModeActive ? "#FBBF24" : i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#9945FF" : "#14F195"}`,
                filter: "blur(2px)",
              }}
            />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 space-y-8 pb-12 max-w-5xl mx-auto px-4">
        {/* God Mode Banner */}
        {isGodModeActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 border-2 border-yellow-500/50 rounded-lg"
          >
            <div className="flex items-center justify-center gap-3">
              <Crown size={28} weight="fill" className="text-yellow-400" />
              <span className="text-yellow-400 font-black uppercase tracking-wider text-lg">
                MASTER ACCESS — FULL VAULT FEATURES
              </span>
              <Crown size={28} weight="fill" className="text-yellow-400" />
            </div>
          </motion.div>
        )}

        {/* Header */}
        <div className="text-center space-y-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <Vault size={64} weight="duotone" className={isGodModeActive ? "text-yellow-400" : "text-primary"} />
            </div>
            <h1 
              className={cn(
                "text-5xl md:text-6xl font-black uppercase tracking-wider",
                isGodModeActive ? "text-yellow-400" : "text-primary"
              )}
              style={{
                textShadow: isGodModeActive 
                  ? "0 0 20px rgba(251, 191, 36, 0.5)"
                  : "0 0 12px #14F195, 0 0 24px #14F195"
              }}
            >
              QUANTUM VAULT
            </h1>
            <p className="text-lg text-muted-foreground uppercase tracking-wider">
              Your profits. Secured forever.
            </p>
          </motion.div>
        </div>

        {/* Main Vault Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "cyber-card p-8 text-center relative overflow-hidden border-2",
            isGodModeActive ? "border-yellow-500/50" : "border-cyan-500/50"
          )}
          style={{
            boxShadow: isGodModeActive 
              ? "0 0 40px rgba(251, 191, 36, 0.2)"
              : "0 0 40px rgba(0, 255, 255, 0.1)"
          }}
        >
          <div className="space-y-6">
            <div>
              <p className={cn(
                "text-lg uppercase tracking-wider",
                isGodModeActive ? "text-yellow-300" : "text-cyan-300"
              )}>
                Total Vault Balance
              </p>
              <p className="text-5xl md:text-6xl font-black text-white mt-4">
                {btcBalance.toFixed(8)} BTC
              </p>
              <p className="text-2xl text-gray-400 mt-2">
                ≈ ${(btcBalance * 96000).toLocaleString()} USD
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Badge className={cn(
                "text-sm px-4 py-2",
                isGodModeActive 
                  ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                  : "bg-green-500/20 border-green-500/50 text-green-400"
              )}>
                <Shield size={16} className="mr-2" />
                FULLY INSURED
              </Badge>
              {autoConvert && (
                <Badge className={cn(
                  "text-sm px-4 py-2 animate-pulse",
                  isGodModeActive
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                    : "bg-purple-500/20 border-purple-500/50 text-purple-400"
                )}>
                  <Zap size={16} className="mr-2" />
                  AUTO-CONVERT ACTIVE
                </Badge>
              )}
              <Badge className={cn(
                "text-sm px-4 py-2",
                btcChange >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
              )}>
                <TrendUp size={16} className="mr-2" />
                {btcChange >= 0 ? '+' : ''}{btcChange.toFixed(2)}%
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Deposit Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "cyber-card p-6 space-y-4 border-2",
            isGodModeActive ? "border-yellow-500/30" : "border-green-500/30"
          )}
        >
          <h3 className={cn(
            "text-xl font-black uppercase tracking-wider text-center",
            isGodModeActive ? "text-yellow-400" : "text-green-400"
          )}>
            DEPOSIT TO VAULT
          </h3>
          
          <div className="space-y-4">
            <Input
              type="number"
              placeholder="0.00000000 BTC"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className={cn(
                "text-2xl text-center bg-black/50",
                isGodModeActive ? "border-yellow-500/30" : "border-green-500/30"
              )}
            />
            
            <div className="flex gap-2 justify-center">
              {['0.001', '0.005', '0.01', '0.05'].map(amount => (
                <Button 
                  key={amount}
                  onClick={() => setDepositAmount(amount)}
                  variant="outline"
                  size="sm"
                  className={cn(
                    isGodModeActive ? "border-yellow-500/50 text-yellow-400" : "border-primary/50 text-primary"
                  )}
                >
                  {amount} BTC
                </Button>
              ))}
            </div>
            
            <Button 
              onClick={handleDeposit}
              className={cn(
                "w-full h-14 text-lg font-black uppercase",
                isGodModeActive
                  ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-black"
                  : "bg-gradient-to-r from-green-500 to-cyan-500 text-black"
              )}
            >
              <ArrowDown size={24} className="mr-3" />
              DEPOSIT TO VAULT
            </Button>
          </div>
        </motion.div>

        {/* Vault Balance & Controls */}
        <div className="cyber-card p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h3 className={cn(
              "text-lg font-bold uppercase",
              isGodModeActive ? "text-yellow-400" : "text-primary"
            )}>
              Vault Controls
            </h3>
          </div>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <div className="flex items-center gap-2">
              <span className="text-sm uppercase text-muted-foreground">Auto Deposit</span>
              <Switch
                checked={autoDeposit}
                onCheckedChange={setAutoDeposit}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm uppercase text-muted-foreground">Auto Convert → BTC</span>
              <Switch
                checked={autoConvert}
                onCheckedChange={setAutoConvert}
                className={cn(
                  isGodModeActive 
                    ? "data-[state=checked]:bg-yellow-500"
                    : "data-[state=checked]:bg-secondary"
                )}
              />
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Fee</div>
              <div className={cn(
                "text-xl font-bold",
                isGodModeActive ? "text-yellow-400" : "text-primary"
              )}>
                {isGodModeActive ? '0%' : '0.1%'}
              </div>
            </div>
          </div>
        </div>

        {/* Asset Wallets List */}
        <div className="space-y-2">
          <h3 className={cn(
            "text-lg font-bold uppercase mb-4",
            isGodModeActive ? "text-yellow-400" : "text-primary"
          )}>
            Connected Wallets
          </h3>
          {wallets.map((wallet, idx) => (
            <motion.div
              key={wallet.asset}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "p-4 flex items-center justify-between rounded-lg border",
                idx % 2 === 0 ? "bg-black/40" : "bg-black/20",
                isGodModeActive ? "border-yellow-500/20" : "border-primary/20"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  wallet.iconColor,
                  "bg-current/20"
                )}>
                  <Coins size={20} className={wallet.iconColor} />
                </div>
                <span className={cn(
                  "text-lg font-semibold uppercase",
                  isGodModeActive ? "text-yellow-400" : "text-primary"
                )}>
                  {wallet.asset}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xl font-bold">{wallet.balance}</span>
                  <p className="text-xs text-muted-foreground">
                    ≈ ${wallet.usdValue.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Withdraw Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "cyber-card p-6 space-y-4 border-2",
            isGodModeActive ? "border-amber-500/30" : "border-orange-500/30"
          )}
        >
          <h3 className={cn(
            "text-xl font-black uppercase tracking-wider text-center",
            isGodModeActive ? "text-amber-400" : "text-orange-400"
          )}>
            WITHDRAW FROM VAULT
          </h3>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.00000000 BTC"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className={cn(
                  "flex-1 text-2xl text-center bg-black/50",
                  isGodModeActive ? "border-amber-500/30" : "border-orange-500/30"
                )}
              />
              <Button
                variant="outline"
                onClick={() => setWithdrawAmount(btcBalance.toFixed(8))}
                className={cn(
                  isGodModeActive ? "border-yellow-500/50 text-yellow-400" : "border-primary/50 text-primary"
                )}
              >
                MAX
              </Button>
            </div>
            
            <Button 
              onClick={handleWithdraw}
              className={cn(
                "w-full h-14 text-lg font-black uppercase",
                isGodModeActive
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-black"
                  : "bg-gradient-to-r from-orange-500 to-red-500 text-white"
              )}
            >
              <ArrowUp size={24} className="mr-3" />
              WITHDRAW BTC
            </Button>
          </div>
        </motion.div>

        {/* Transaction Stats */}
        {vaultStats && vaultStats.transactionCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="cyber-card p-6 space-y-4"
          >
            <div className="flex items-center gap-2 justify-center">
              <Clock size={24} className={isGodModeActive ? "text-yellow-400" : "text-primary"} />
              <h3 className={cn(
                "text-xl font-bold uppercase",
                isGodModeActive ? "text-yellow-400" : "text-primary"
              )}>
                VAULT STATISTICS
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-black/30 rounded-lg">
                <p className="text-sm text-muted-foreground uppercase">Total Deposited</p>
                <p className={cn(
                  "text-2xl font-black",
                  isGodModeActive ? "text-yellow-400" : "text-green-400"
                )}>
                  {vaultStats.totalDeposited.toFixed(6)} BTC
                </p>
              </div>
              <div className="text-center p-4 bg-black/30 rounded-lg">
                <p className="text-sm text-muted-foreground uppercase">Total Withdrawn</p>
                <p className={cn(
                  "text-2xl font-black",
                  isGodModeActive ? "text-amber-400" : "text-orange-400"
                )}>
                  {vaultStats.totalWithdrawn.toFixed(6)} BTC
                </p>
              </div>
              <div className="text-center p-4 bg-black/30 rounded-lg">
                <p className="text-sm text-muted-foreground uppercase">Transactions</p>
                <p className={cn(
                  "text-2xl font-black",
                  isGodModeActive ? "text-yellow-400" : "text-primary"
                )}>
                  {vaultStats.transactionCount}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Total Portfolio Value */}
        <div className={cn(
          "cyber-card p-6 text-center border-2",
          isGodModeActive ? "border-yellow-500/30" : "border-primary/30"
        )}>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
            Total Portfolio Value
          </p>
          <p className={cn(
            "text-4xl font-black",
            isGodModeActive ? "text-yellow-400" : "text-primary"
          )}>
            ${totalUsdValue.toLocaleString()}
          </p>
        </div>

        {/* Empty space for mobile nav */}
        <div className="h-24" />
      </div>
    </div>
  )
}
