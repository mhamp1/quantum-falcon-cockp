// ═══════════════════════════════════════════════════════════════
// TRADING HUB — Complete Trading Interface
// Combines wallet, swaps, positions, and risk management
// November 27, 2025 — Production Ready
// ═══════════════════════════════════════════════════════════════

import React, { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { 
  Lightning, 
  ChartLine, 
  Wallet as WalletIcon,
  ShieldCheck,
  Gear,
  ArrowsLeftRight
} from '@phosphor-icons/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useQuantumWallet } from '@/providers/WalletProvider'
import WalletButton from '@/components/wallet/WalletButton'
import SwapPanel from './SwapPanel'
import PositionTracker from './PositionTracker'

// Lazy load heavy components
const TradingControlPanel = React.lazy(() => import('@/components/admin/TradingControlPanel'))

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function TradingHub() {
  const { connected, shortAddress, solBalance } = useQuantumWallet()
  const [activeTab, setActiveTab] = useState('swap')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider text-primary flex items-center gap-3">
            <Lightning size={32} weight="fill" className="text-primary" />
            Trading Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time swaps powered by Jupiter • Jito MEV protection
          </p>
        </div>

        {/* Wallet Status */}
        <div className="flex items-center gap-4">
          {connected && (
            <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-muted/30 border border-muted rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Balance</p>
                <p className="font-bold text-primary">{solBalance.toFixed(4)} SOL</p>
              </div>
              <div className="w-px h-8 bg-muted" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Wallet</p>
                <p className="font-mono text-sm">{shortAddress}</p>
              </div>
            </div>
          )}
          <WalletButton />
        </div>
      </div>

      {/* Not Connected State */}
      {!connected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-card p-8 text-center border-2 border-dashed border-primary/30"
        >
          <WalletIcon size={64} weight="duotone" className="mx-auto text-primary/50 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Connect your Solana wallet to start trading. We support Phantom, Solflare, and Backpack.
          </p>
          <WalletButton className="mx-auto" />
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
            <div className="p-4 bg-muted/20 border border-muted rounded-lg">
              <ShieldCheck size={24} className="text-green-400 mb-2" />
              <h3 className="font-bold mb-1">Secure</h3>
              <p className="text-xs text-muted-foreground">
                Your keys never leave your wallet. We only request transaction signing.
              </p>
            </div>
            <div className="p-4 bg-muted/20 border border-muted rounded-lg">
              <Lightning size={24} className="text-primary mb-2" />
              <h3 className="font-bold mb-1">Fast</h3>
              <p className="text-xs text-muted-foreground">
                Jupiter aggregator finds the best routes for optimal prices.
              </p>
            </div>
            <div className="p-4 bg-muted/20 border border-muted rounded-lg">
              <ArrowsLeftRight size={24} className="text-accent mb-2" />
              <h3 className="font-bold mb-1">MEV Protected</h3>
              <p className="text-xs text-muted-foreground">
                Jito bundles protect your trades from front-running.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Connected State - Trading Interface */}
      {connected && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="swap" className="gap-2">
              <Lightning size={16} weight="fill" />
              Swap
            </TabsTrigger>
            <TabsTrigger value="positions" className="gap-2">
              <ChartLine size={16} />
              Positions
            </TabsTrigger>
            <TabsTrigger value="controls" className="gap-2">
              <Gear size={16} />
              Controls
            </TabsTrigger>
          </TabsList>

          <TabsContent value="swap">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Swap Panel */}
              <SwapPanel />

              {/* Quick Info */}
              <div className="space-y-4">
                {/* Trading Stats */}
                <div className="cyber-card p-6 border-2 border-muted">
                  <h3 className="font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ChartLine size={20} className="text-primary" />
                    Today's Trading
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase">Trades</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase">Volume</p>
                      <p className="text-2xl font-bold">$0</p>
                    </div>
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase">P&L</p>
                      <p className="text-2xl font-bold text-green-400">+$0</p>
                    </div>
                    <div className="p-3 bg-muted/20 rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase">Win Rate</p>
                      <p className="text-2xl font-bold">--%</p>
                    </div>
                  </div>
                </div>

                {/* Popular Pairs */}
                <div className="cyber-card p-6 border-2 border-muted">
                  <h3 className="font-bold uppercase tracking-wider mb-4">
                    Popular Pairs
                  </h3>
                  <div className="space-y-2">
                    {[
                      { pair: 'SOL/USDC', price: '$178.42', change: '+2.4%', positive: true },
                      { pair: 'BONK/SOL', price: '0.000021', change: '+15.2%', positive: true },
                      { pair: 'WIF/SOL', price: '0.014', change: '-3.1%', positive: false },
                      { pair: 'JUP/USDC', price: '$1.24', change: '+5.8%', positive: true },
                    ].map(({ pair, price, change, positive }) => (
                      <div 
                        key={pair}
                        className="flex items-center justify-between p-2 hover:bg-muted/20 rounded transition-colors cursor-pointer"
                      >
                        <span className="font-mono">{pair}</span>
                        <div className="text-right">
                          <p className="font-bold">{price}</p>
                          <p className={cn(
                            'text-xs',
                            positive ? 'text-green-400' : 'text-red-400'
                          )}>
                            {change}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="positions">
            <PositionTracker />
          </TabsContent>

          <TabsContent value="controls">
            <Suspense fallback={
              <div className="cyber-card p-8 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground mt-4">Loading controls...</p>
              </div>
            }>
              <TradingControlPanel />
            </Suspense>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

