// ═══════════════════════════════════════════════════════════════
// WALLET BUTTON — Connect/Disconnect with Status Display
// Beautiful cyberpunk styled wallet integration
// November 27, 2025 — Production Ready
// ═══════════════════════════════════════════════════════════════

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wallet, 
  Power, 
  Copy, 
  CheckCircle, 
  CaretDown,
  ArrowsClockwise,
  SignOut,
  Eye,
  EyeSlash,
  ArrowSquareOut
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useQuantumWallet } from '@/providers/WalletProvider'

interface WalletButtonProps {
  className?: string
  showBalance?: boolean
  compact?: boolean
}

export default function WalletButton({ 
  className, 
  showBalance = true,
  compact = false 
}: WalletButtonProps) {
  const { 
    connected, 
    connecting, 
    publicKey, 
    shortAddress,
    solBalance,
    connect, 
    disconnect,
    walletAvailable,
    walletError
  } = useQuantumWallet()
  
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hideBalance, setHideBalance] = useState(false)

  // Copy address to clipboard
  const copyAddress = async () => {
    if (!publicKey) return
    try {
      await navigator.clipboard.writeText(publicKey)
      setCopied(true)
      toast.success('Address Copied')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  // Handle connect
  const handleConnect = () => {
    connect()
  }

  // Handle disconnect
  const handleDisconnect = async () => {
    await disconnect()
    setIsOpen(false)
  }

  // Not connected state
  if (!connected) {
    return (
      <Button
        onClick={handleConnect}
        disabled={connecting}
        className={cn(
          'relative overflow-hidden group',
          'bg-gradient-to-r from-purple-600 to-cyan-600',
          'hover:from-purple-500 hover:to-cyan-500',
          'border-2 border-purple-500/50',
          'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
          'hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]',
          'transition-all duration-300',
          className
        )}
      >
        {connecting ? (
          <>
            <ArrowsClockwise size={18} className="animate-spin mr-2" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet size={18} className="mr-2" />
            {compact ? 'Connect' : 'Connect Wallet'}
          </>
        )}
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent 
                        -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </Button>
    )
  }

  // Connected state
  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'relative overflow-hidden',
          'bg-gradient-to-r from-green-600/80 to-cyan-600/80',
          'hover:from-green-500 hover:to-cyan-500',
          'border-2 border-green-500/50',
          'shadow-[0_0_15px_rgba(34,197,94,0.3)]',
          'hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]',
          'transition-all duration-300',
          className
        )}
      >
        {/* Wallet icon with pulse */}
        <div className="relative mr-2">
          <Wallet size={18} />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
        
        {/* Address */}
        <span className="font-mono text-sm">{shortAddress}</span>
        
        {/* Balance (optional) */}
        {showBalance && !compact && (
          <span className="ml-2 text-xs opacity-80">
            {hideBalance ? '••••' : `${solBalance.toFixed(3)} SOL`}
          </span>
        )}
        
        <CaretDown 
          size={14} 
          className={cn(
            'ml-2 transition-transform',
            isOpen && 'rotate-180'
          )} 
        />
      </Button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute right-0 top-full mt-2 z-50',
                'w-64 p-3',
                'bg-card/95 backdrop-blur-xl',
                'border-2 border-primary/30',
                'rounded-lg shadow-[0_0_30px_rgba(0,212,255,0.2)]'
              )}
            >
              {/* Wallet Info */}
              <div className="p-3 mb-2 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet size={16} className="text-primary" />
                  <span className="text-sm font-bold text-primary">
                    {walletAvailable ? 'Phantom Wallet' : 'Connected'}
                  </span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-auto" />
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground flex-1 truncate">
                    {publicKey}
                  </span>
                  <button 
                    onClick={copyAddress}
                    className="p-1 hover:bg-primary/20 rounded transition-colors"
                  >
                    {copied ? (
                      <CheckCircle size={14} className="text-green-400" />
                    ) : (
                      <Copy size={14} className="text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Balance Display */}
              {showBalance && (
                <div className="p-3 mb-2 bg-muted/30 border border-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      Balance
                    </span>
                    <button
                      onClick={() => setHideBalance(!hideBalance)}
                      className="p-1 hover:bg-primary/20 rounded transition-colors"
                    >
                      {hideBalance ? (
                        <EyeSlash size={14} className="text-muted-foreground" />
                      ) : (
                        <Eye size={14} className="text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <p className="text-lg font-bold text-primary mt-1">
                    {hideBalance ? '••••••' : `${solBalance.toFixed(4)} SOL`}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    window.open(`https://solscan.io/account/${publicKey}`, '_blank')
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center gap-2 p-2 text-sm text-left hover:bg-primary/10 rounded transition-colors"
                >
                  <ArrowSquareOut size={16} className="text-primary" />
                  View on Solscan
                </button>
                
                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-2 p-2 text-sm text-left hover:bg-destructive/10 rounded transition-colors text-destructive"
                >
                  <SignOut size={16} />
                  Disconnect
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
