// ═══════════════════════════════════════════════════════════════
// TRADING MODE TOGGLE — Paper vs Live Mode Switch
// Critical safety component for real money trading
// November 28, 2025 — Quantum Falcon Cockpit
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Lightning,
  TestTube,
  Warning,
  ShieldCheck,
  CheckCircle,
  ArrowsClockwise,
  CurrencyDollar
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useQuantumWallet } from '@/providers/WalletProvider'
import GoLiveConfirmation, { useTradingMode } from './GoLiveConfirmation'
import { checkRPCHealth } from '@/lib/solana/connection'

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function TradingModeToggle() {
  const { connected, solBalance, publicKey } = useQuantumWallet()
  const { isLive, enableLiveTrading, disableLiveTrading } = useTradingMode()
  
  const [showGoLiveDialog, setShowGoLiveDialog] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [rpcStatus, setRpcStatus] = useState<'unknown' | 'healthy' | 'error'>('unknown')

  // Test RPC connection
  const handleTestConnection = async () => {
    setIsTesting(true)
    toast.loading('Testing connection...', { id: 'rpc-test' })

    try {
      const health = await checkRPCHealth()
      
      toast.dismiss('rpc-test')
      
      if (health.healthy) {
        setRpcStatus('healthy')
        toast.success('RPC Connection Healthy', {
          description: `Latency: ${health.latency}ms | TPS: ${health.tps}`,
          duration: 5000,
        })
      } else {
        setRpcStatus('error')
        toast.error('RPC Connection Failed', {
          description: health.error || 'Could not reach Solana network',
        })
      }
    } catch (error: any) {
      setRpcStatus('error')
      toast.dismiss('rpc-test')
      toast.error('Connection Test Failed', {
        description: error.message,
      })
    } finally {
      setIsTesting(false)
    }
  }

  // Handle live mode toggle
  const handleToggleMode = () => {
    if (isLive) {
      disableLiveTrading()
    } else {
      setShowGoLiveDialog(true)
    }
  }

  return (
    <>
      <div className="cyber-card p-4 border-2 border-primary/30 relative overflow-hidden">
        <div className="absolute inset-0 diagonal-stripes opacity-5 pointer-events-none" />
        
        {/* Live mode warning overlay */}
        {isLive && (
          <div className="absolute inset-0 border-2 border-destructive/50 pointer-events-none animate-pulse" />
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className={`p-2 ${isLive ? 'bg-destructive/20 border-destructive' : 'bg-primary/20 border-primary'} border-2`}>
              {isLive ? (
                <Lightning size={20} weight="fill" className="text-destructive" />
              ) : (
                <TestTube size={20} weight="duotone" className="text-primary" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider">Trading Mode</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {isLive ? 'LIVE TRADING ACTIVE' : 'Paper Trading (Simulation)'}
              </p>
            </div>
          </div>

          {/* Mode Badge */}
          <Badge 
            className={`text-[10px] ${
              isLive 
                ? 'bg-destructive/20 border border-destructive text-destructive animate-pulse' 
                : 'bg-primary/20 border border-primary text-primary'
            }`}
          >
            {isLive ? '🔴 LIVE' : '📝 PAPER'}
          </Badge>
        </div>

        {/* Status Cards */}
        <div className="space-y-3 relative z-10">
          {/* RPC Status */}
          <div className="flex items-center justify-between p-3 bg-muted/30 border border-muted rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                rpcStatus === 'healthy' 
                  ? 'bg-green-400' 
                  : rpcStatus === 'error' 
                  ? 'bg-destructive' 
                  : 'bg-amber-400'
              }`} />
              <span className="text-xs text-muted-foreground">Solana RPC</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="h-7 text-xs"
            >
              {isTesting ? (
                <ArrowsClockwise size={12} className="animate-spin mr-1" />
              ) : (
                <ShieldCheck size={12} className="mr-1" />
              )}
              {isTesting ? 'Testing...' : 'Test'}
            </Button>
          </div>

          {/* Wallet Status */}
          <div className="flex items-center justify-between p-3 bg-muted/30 border border-muted rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-muted'}`} />
              <span className="text-xs text-muted-foreground">Wallet</span>
            </div>
            {connected ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-primary">
                  {solBalance.toFixed(2)} SOL
                </span>
                <CheckCircle size={14} className="text-green-400" />
              </div>
            ) : (
              <span className="text-xs text-amber-400">Not Connected</span>
            )}
          </div>

          {/* Mode Description */}
          {isLive ? (
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Warning size={16} className="text-destructive" />
                <span className="text-sm font-bold text-destructive">LIVE MODE ACTIVE</span>
              </div>
              <p className="text-xs text-muted-foreground">
                All trades will use REAL cryptocurrency from your connected wallet.
                Losses are permanent. Be extremely careful.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TestTube size={16} className="text-primary" />
                <span className="text-sm font-bold text-primary">PAPER MODE</span>
              </div>
              <p className="text-xs text-muted-foreground">
                All trades are simulated. No real money is at risk.
                Perfect for learning and testing strategies.
              </p>
            </div>
          )}

          {/* Toggle Button */}
          <Button
            onClick={handleToggleMode}
            disabled={!connected && !isLive}
            className={`w-full font-bold uppercase tracking-wider ${
              isLive
                ? 'bg-muted hover:bg-muted/80 text-foreground'
                : 'bg-gradient-to-r from-destructive to-red-600 hover:from-destructive/90 hover:to-red-600/90 text-destructive-foreground shadow-[0_0_20px_rgba(239,68,68,0.3)]'
            }`}
          >
            {isLive ? (
              <>
                <TestTube size={18} className="mr-2" />
                Switch to Paper Mode (Safe)
              </>
            ) : (
              <>
                <Warning size={18} className="mr-2" />
                Go Live — Trade Real Money
              </>
            )}
          </Button>

          {!connected && !isLive && (
            <p className="text-xs text-center text-amber-400">
              Connect your wallet first to enable live trading
            </p>
          )}
        </div>
      </div>

      {/* Go Live Confirmation Dialog */}
      <GoLiveConfirmation
        isOpen={showGoLiveDialog}
        onClose={() => setShowGoLiveDialog(false)}
        onConfirm={() => {
          enableLiveTrading()
          setShowGoLiveDialog(false)
        }}
      />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════
// COMPACT MODE INDICATOR
// ═══════════════════════════════════════════════════════════════

export function TradingModeIndicator() {
  const { isLive } = useTradingMode()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${
        isLive
          ? 'bg-destructive/20 border border-destructive/50 text-destructive'
          : 'bg-primary/20 border border-primary/50 text-primary'
      }`}
    >
      {isLive ? (
        <>
          <span className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
          <Lightning size={12} weight="fill" />
          LIVE
        </>
      ) : (
        <>
          <span className="w-2 h-2 bg-primary rounded-full" />
          <TestTube size={12} />
          PAPER
        </>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
// TEST TRADE COMPONENT
// ═══════════════════════════════════════════════════════════════

export function TestTradeButton() {
  const { connected, publicKey, solBalance } = useQuantumWallet()
  const { isLive } = useTradingMode()
  const [isExecuting, setIsExecuting] = useState(false)

  const handleTestTrade = async () => {
    if (!connected || !publicKey) {
      toast.error('Connect wallet first')
      return
    }

    if (solBalance < 0.002) {
      toast.error('Insufficient SOL', {
        description: 'You need at least 0.002 SOL to test',
      })
      return
    }

    setIsExecuting(true)
    toast.loading('Executing test trade...', { id: 'test-trade' })

    try {
      // Get quote for 0.001 SOL -> USDC
      const params = new URLSearchParams({
        inputMint: 'So11111111111111111111111111111111111111112',
        outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        amount: '1000000', // 0.001 SOL in lamports
        slippageBps: '100',
      })

      const quoteRes = await fetch(`https://quote-api.jup.ag/v6/quote?${params}`)
      const quote = await quoteRes.json()

      if (quote.error) {
        throw new Error(quote.error)
      }

      // Get swap transaction
      const swapRes = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse: quote,
          userPublicKey: publicKey,
          wrapAndUnwrapSol: true,
        }),
      })

      const { swapTransaction } = await swapRes.json()

      // Get wallet
      const phantom = (window as any).phantom?.solana
      if (!phantom) throw new Error('Wallet not available')

      // Sign and send
      const transaction = Buffer.from(swapTransaction, 'base64')
      const { signature } = await phantom.signAndSendTransaction(
        new Uint8Array(transaction)
      )

      toast.dismiss('test-trade')
      toast.success('🎉 Test Trade Successful!', {
        description: `Swapped 0.001 SOL for USDC`,
        action: {
          label: 'View TX',
          onClick: () => window.open(`https://solscan.io/tx/${signature}`, '_blank'),
        },
        duration: 10000,
      })
    } catch (error: any) {
      toast.dismiss('test-trade')
      
      if (error.code === 4001) {
        toast.error('Transaction Rejected')
      } else {
        toast.error('Test Trade Failed', {
          description: error.message,
        })
      }
    } finally {
      setIsExecuting(false)
    }
  }

  if (!isLive) return null

  return (
    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <CurrencyDollar size={16} className="text-amber-400" />
        <span className="text-sm font-bold text-amber-400">Test Real Trade</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Execute a tiny real trade (0.001 SOL) to verify everything works.
      </p>
      <Button
        onClick={handleTestTrade}
        disabled={!connected || isExecuting}
        size="sm"
        className="w-full bg-amber-500/20 border border-amber-500/50 text-amber-400 hover:bg-amber-500/30"
      >
        {isExecuting ? (
          <>
            <ArrowsClockwise size={14} className="animate-spin mr-2" />
            Executing...
          </>
        ) : (
          <>
            <Lightning size={14} weight="fill" className="mr-2" />
            Execute Test (0.001 SOL)
          </>
        )}
      </Button>
    </div>
  )
}

export { TradingModeToggle }

