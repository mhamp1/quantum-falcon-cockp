// ═══════════════════════════════════════════════════════════════
// WALLET CONNECTION CARD — Dashboard Widget
// Real-time wallet status and quick actions
// November 28, 2025 — Quantum Falcon Cockpit
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Wallet,
  Lightning,
  ArrowsClockwise,
  CheckCircle,
  Warning,
  Copy,
  ArrowSquareOut,
  Power,
  ShieldCheck,
  CurrencyDollar
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useQuantumWallet } from '@/providers/WalletProvider'
import { useTradingMode } from '@/components/trading/GoLiveConfirmation'

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function WalletConnectionCard() {
  const {
    connected,
    connecting,
    publicKey,
    shortAddress,
    solBalance,
    isLoading,
    lastUpdate,
    connect,
    disconnect,
    refreshBalances,
    walletAvailable,
    walletError
  } = useQuantumWallet()

  const { isLive } = useTradingMode()
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey)
      setIsCopied(true)
      toast.success('Address Copied', {
        description: 'Wallet address copied to clipboard',
      })
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handleViewExplorer = () => {
    if (publicKey) {
      window.open(`https://solscan.io/account/${publicKey}`, '_blank')
    }
  }

  return (
    <div className="cyber-card p-4 border-2 border-primary/30 relative overflow-hidden">
      <div className="absolute inset-0 diagonal-stripes opacity-5 pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className={`p-2 ${connected ? 'bg-primary/20 border-primary' : 'bg-muted/20 border-muted'} border-2`}>
            <Wallet size={20} weight="duotone" className={connected ? 'text-primary' : 'text-muted-foreground'} />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider">Wallet</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {connected ? 'Connected' : 'Not Connected'}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {isLive && (
            <Badge className="bg-destructive/20 border border-destructive text-destructive text-[9px] animate-pulse">
              LIVE
            </Badge>
          )}
          {connected ? (
            <Badge className="bg-green-500/20 border border-green-500 text-green-400 text-[9px]">
              <CheckCircle size={10} weight="fill" className="mr-1" />
              ONLINE
            </Badge>
          ) : (
            <Badge className="bg-muted/20 border border-muted text-muted-foreground text-[9px]">
              OFFLINE
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-3">
        {connected ? (
          <>
            {/* Address */}
            <div className="p-3 bg-muted/30 border border-muted rounded-lg">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Address</p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono text-primary flex-1">
                  {shortAddress}
                </code>
                <button
                  onClick={handleCopyAddress}
                  className="p-1 hover:bg-primary/20 rounded transition-colors"
                >
                  {isCopied ? (
                    <CheckCircle size={14} className="text-green-400" />
                  ) : (
                    <Copy size={14} className="text-muted-foreground" />
                  )}
                </button>
                <button
                  onClick={handleViewExplorer}
                  className="p-1 hover:bg-primary/20 rounded transition-colors"
                >
                  <ArrowSquareOut size={14} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Balance */}
            <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">SOL Balance</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CurrencyDollar size={20} className="text-primary" />
                  <span className="text-2xl font-black text-primary">
                    {isLoading ? '...' : solBalance.toFixed(4)}
                  </span>
                  <span className="text-sm text-muted-foreground">SOL</span>
                </div>
                <button
                  onClick={refreshBalances}
                  disabled={isLoading}
                  className="p-2 hover:bg-primary/20 rounded transition-colors disabled:opacity-50"
                >
                  <ArrowsClockwise 
                    size={16} 
                    className={`text-primary ${isLoading ? 'animate-spin' : ''}`} 
                  />
                </button>
              </div>
              {lastUpdate > 0 && (
                <p className="text-[9px] text-muted-foreground mt-1">
                  Updated {new Date(lastUpdate).toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-2 p-2 bg-green-500/10 border border-green-500/30 rounded text-xs text-green-400">
              <ShieldCheck size={14} />
              <span>Your keys stay in your wallet. We never have access.</span>
            </div>

            {/* Disconnect Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={disconnect}
              className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <Power size={14} className="mr-2" />
              Disconnect Wallet
            </Button>
          </>
        ) : (
          <>
            {/* No Wallet Connected */}
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <Wallet size={32} className="text-primary/50" />
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Connect your wallet to start trading
              </p>

              {walletError && (
                <div className="flex items-center justify-center gap-2 mb-4 text-xs text-amber-400">
                  <Warning size={14} />
                  <span>{walletError}</span>
                </div>
              )}

              <Button
                onClick={connect}
                disabled={connecting || !walletAvailable}
                className="w-full bg-gradient-to-r from-primary via-accent to-primary hover:from-primary/90 hover:via-accent/90 hover:to-primary/90 border-2 border-primary/50 shadow-[0_0_20px_rgba(0,212,255,0.3)]"
              >
                {connecting ? (
                  <>
                    <ArrowsClockwise size={16} className="animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Lightning size={16} weight="fill" className="mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>

              {!walletAvailable && (
                <p className="text-xs text-muted-foreground mt-3">
                  No wallet detected.{' '}
                  <a
                    href="https://phantom.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Install Phantom
                  </a>
                </p>
              )}
            </div>

            {/* Supported Wallets */}
            <div className="pt-3 border-t border-muted">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 text-center">
                Supported Wallets
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="text-center">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/50 flex items-center justify-center mb-1">
                    👻
                  </div>
                  <p className="text-[9px] text-muted-foreground">Phantom</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/50 flex items-center justify-center mb-1">
                    🌞
                  </div>
                  <p className="text-[9px] text-muted-foreground">Solflare</p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center mb-1">
                    🎒
                  </div>
                  <p className="text-[9px] text-muted-foreground">Backpack</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPACT VERSION FOR SIDEBAR/HEADER
// ═══════════════════════════════════════════════════════════════

export function WalletConnectionButton() {
  const { connected, shortAddress, connect, connecting, walletAvailable } = useQuantumWallet()
  const { isLive } = useTradingMode()

  if (connected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg"
      >
        {isLive && (
          <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
        )}
        <Wallet size={14} className="text-primary" />
        <span className="text-xs font-mono text-primary">{shortAddress}</span>
        <CheckCircle size={12} className="text-green-400" />
      </motion.div>
    )
  }

  return (
    <Button
      size="sm"
      onClick={connect}
      disabled={connecting || !walletAvailable}
      className="bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30"
    >
      {connecting ? (
        <ArrowsClockwise size={14} className="animate-spin mr-1" />
      ) : (
        <Wallet size={14} className="mr-1" />
      )}
      {connecting ? 'Connecting...' : 'Connect'}
    </Button>
  )
}

export { WalletConnectionCard }

