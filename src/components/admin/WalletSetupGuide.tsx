// ═══════════════════════════════════════════════════════════════
// WALLET SETUP GUIDE — Ultimate Solana Trading Setup
// All wallets, extensions, and tools for real money trading
// November 27, 2025 — Production Ready
// ═══════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet,
  Shield,
  Lightning,
  CheckCircle,
  XCircle,
  ArrowSquareOut,
  Copy,
  Warning,
  Rocket,
  Lock,
  Eye,
  ChartLine,
  Globe,
  Code,
  Browser,
  Key,
  HardDrives
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface SetupItem {
  id: string
  name: string
  description: string
  category: 'wallet' | 'security' | 'trading' | 'browser' | 'hardware'
  url: string
  icon: React.ReactNode
  required: boolean
  installed: boolean
  priority: 'critical' | 'recommended' | 'optional'
}

// ═══════════════════════════════════════════════════════════════
// SETUP ITEMS
// ═══════════════════════════════════════════════════════════════

const WALLET_EXTENSIONS: SetupItem[] = [
  {
    id: 'phantom',
    name: 'Phantom Wallet',
    description: 'Most popular Solana wallet — required for trading',
    category: 'wallet',
    url: 'https://phantom.app/download',
    icon: <Wallet size={20} weight="fill" />,
    required: true,
    installed: false,
    priority: 'critical',
  },
  {
    id: 'solflare',
    name: 'Solflare Wallet',
    description: 'Advanced Solana wallet with staking',
    category: 'wallet',
    url: 'https://solflare.com/download',
    icon: <Wallet size={20} weight="fill" />,
    required: false,
    installed: false,
    priority: 'recommended',
  },
  {
    id: 'backpack',
    name: 'Backpack Wallet',
    description: 'Multi-chain wallet by xNFT team',
    category: 'wallet',
    url: 'https://backpack.app/download',
    icon: <Wallet size={20} weight="fill" />,
    required: false,
    installed: false,
    priority: 'recommended',
  },
]

const SECURITY_EXTENSIONS: SetupItem[] = [
  {
    id: 'ublock',
    name: 'uBlock Origin',
    description: 'Block ads and malicious scripts',
    category: 'security',
    url: 'https://chrome.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm',
    icon: <Shield size={20} weight="fill" />,
    required: true,
    installed: false,
    priority: 'critical',
  },
  {
    id: 'bitwarden',
    name: 'Bitwarden',
    description: 'Secure password manager — protect your keys',
    category: 'security',
    url: 'https://bitwarden.com/download/',
    icon: <Lock size={20} weight="fill" />,
    required: true,
    installed: false,
    priority: 'critical',
  },
  {
    id: 'clearurls',
    name: 'ClearURLs',
    description: 'Remove tracking elements from URLs',
    category: 'security',
    url: 'https://chrome.google.com/webstore/detail/clearurls/lckanjgmijmafbedllaakclkaicjfmnk',
    icon: <Eye size={20} weight="fill" />,
    required: false,
    installed: false,
    priority: 'recommended',
  },
]

const TRADING_TOOLS: SetupItem[] = [
  {
    id: 'dexscreener',
    name: 'DexScreener',
    description: 'Real-time token analytics and charts',
    category: 'trading',
    url: 'https://dexscreener.com',
    icon: <ChartLine size={20} weight="fill" />,
    required: true,
    installed: false,
    priority: 'critical',
  },
  {
    id: 'jupiter',
    name: 'Jupiter Aggregator',
    description: 'Best swap rates on Solana',
    category: 'trading',
    url: 'https://jup.ag',
    icon: <Lightning size={20} weight="fill" />,
    required: true,
    installed: false,
    priority: 'critical',
  },
  {
    id: 'helius',
    name: 'Helius Dashboard',
    description: 'RPC monitoring and API management',
    category: 'trading',
    url: 'https://dev.helius.xyz/dashboard',
    icon: <Globe size={20} weight="fill" />,
    required: true,
    installed: false,
    priority: 'critical',
  },
  {
    id: 'solscan',
    name: 'Solscan Explorer',
    description: 'Verify transactions and wallet activity',
    category: 'trading',
    url: 'https://solscan.io',
    icon: <Eye size={20} weight="fill" />,
    required: false,
    installed: false,
    priority: 'recommended',
  },
  {
    id: 'birdeye',
    name: 'Birdeye Analytics',
    description: 'Advanced token data and analytics',
    category: 'trading',
    url: 'https://birdeye.so',
    icon: <ChartLine size={20} weight="fill" />,
    required: false,
    installed: false,
    priority: 'recommended',
  },
]

const DEV_TOOLS: SetupItem[] = [
  {
    id: 'reactdevtools',
    name: 'React DevTools',
    description: 'Debug React components',
    category: 'browser',
    url: 'https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi',
    icon: <Code size={20} weight="fill" />,
    required: false,
    installed: false,
    priority: 'optional',
  },
]

const HARDWARE_WALLETS: SetupItem[] = [
  {
    id: 'ledger',
    name: 'Ledger Hardware Wallet',
    description: 'Most secure way to store crypto — HIGHLY RECOMMENDED for real funds',
    category: 'hardware',
    url: 'https://www.ledger.com/ledger-live',
    icon: <HardDrives size={20} weight="fill" />,
    required: false,
    installed: false,
    priority: 'critical',
  },
]

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function WalletSetupGuide() {
  const [items, setItems] = useState<SetupItem[]>([
    ...WALLET_EXTENSIONS,
    ...SECURITY_EXTENSIONS,
    ...TRADING_TOOLS,
    ...DEV_TOOLS,
    ...HARDWARE_WALLETS,
  ])
  const [activeCategory, setActiveCategory] = useState<string>('all')

  // Load installed status from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('qf-setup-checklist')
    if (stored) {
      const installedIds = JSON.parse(stored)
      setItems(prev => prev.map(item => ({
        ...item,
        installed: installedIds.includes(item.id),
      })))
    }
  }, [])

  // Save installed status
  const toggleInstalled = (id: string) => {
    setItems(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, installed: !item.installed } : item
      )
      const installedIds = updated.filter(i => i.installed).map(i => i.id)
      localStorage.setItem('qf-setup-checklist', JSON.stringify(installedIds))
      return updated
    })
  }

  // Filter items by category
  const filteredItems = activeCategory === 'all' 
    ? items 
    : items.filter(i => i.category === activeCategory)

  // Calculate progress
  const criticalItems = items.filter(i => i.priority === 'critical')
  const criticalComplete = criticalItems.filter(i => i.installed).length
  const totalComplete = items.filter(i => i.installed).length
  const progressPercent = (totalComplete / items.length) * 100
  const criticalPercent = (criticalComplete / criticalItems.length) * 100

  // Check if ready for real money
  const isReadyForRealMoney = criticalItems.every(i => i.installed)

  // Open install link
  const openLink = (url: string, name: string) => {
    window.open(url, '_blank')
    toast.success(`Opening ${name}`, { description: 'Install and return to check it off' })
  }

  // Categories
  const categories = [
    { id: 'all', name: 'All', icon: <Globe size={16} /> },
    { id: 'wallet', name: 'Wallets', icon: <Wallet size={16} /> },
    { id: 'security', name: 'Security', icon: <Shield size={16} /> },
    { id: 'trading', name: 'Trading', icon: <ChartLine size={16} /> },
    { id: 'hardware', name: 'Hardware', icon: <HardDrives size={16} /> },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-card p-6 border-2 border-primary/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Rocket size={32} weight="fill" className="text-primary" />
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider">
                Trading Setup Guide
              </h2>
              <p className="text-xs text-muted-foreground">
                Install everything needed for real money trading
              </p>
            </div>
          </div>
          
          {isReadyForRealMoney ? (
            <Badge className="bg-green-500 text-black px-4 py-2 text-sm font-bold animate-pulse">
              <CheckCircle size={16} className="mr-2" />
              READY FOR REAL MONEY
            </Badge>
          ) : (
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 px-4 py-2">
              <Warning size={16} className="mr-2" />
              {criticalItems.length - criticalComplete} critical items remaining
            </Badge>
          )}
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Critical Setup</span>
              <span className="font-mono text-primary">{criticalComplete}/{criticalItems.length}</span>
            </div>
            <Progress value={criticalPercent} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Total Progress</span>
              <span className="font-mono">{totalComplete}/{items.length}</span>
            </div>
            <Progress value={progressPercent} className="h-2 [&>div]:bg-cyan-500" />
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat.id)}
            className="gap-2"
          >
            {cat.icon}
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Setup Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'cyber-card p-4 border-2 transition-all',
                item.installed 
                  ? 'border-green-500/50 bg-green-500/5' 
                  : item.priority === 'critical'
                    ? 'border-red-500/50'
                    : 'border-muted'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Status Toggle */}
                <button
                  onClick={() => toggleInstalled(item.id)}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                    item.installed
                      ? 'bg-green-500 text-black'
                      : 'bg-muted/50 text-muted-foreground hover:bg-primary/20'
                  )}
                >
                  {item.installed ? (
                    <CheckCircle size={18} weight="fill" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border-2 border-current" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      'p-1.5 rounded',
                      item.category === 'wallet' && 'bg-purple-500/20 text-purple-400',
                      item.category === 'security' && 'bg-green-500/20 text-green-400',
                      item.category === 'trading' && 'bg-cyan-500/20 text-cyan-400',
                      item.category === 'browser' && 'bg-orange-500/20 text-orange-400',
                      item.category === 'hardware' && 'bg-amber-500/20 text-amber-400',
                    )}>
                      {item.icon}
                    </span>
                    <h4 className="font-bold truncate">{item.name}</h4>
                    {item.priority === 'critical' && !item.installed && (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-xs">
                        REQUIRED
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </div>

                {/* Install Button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openLink(item.url, item.name)}
                  className="flex-shrink-0"
                >
                  <ArrowSquareOut size={16} />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Final Checklist */}
      {isReadyForRealMoney && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-card p-6 border-2 border-green-500 bg-green-500/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle size={32} weight="fill" className="text-green-400" />
            <div>
              <h3 className="text-xl font-black text-green-400">
                QUANTUM FALCON FULLY ARMED
              </h3>
              <p className="text-sm text-muted-foreground">
                All wallets ready — Real money trading enabled
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-green-500/20 rounded-lg text-center">
              <CheckCircle size={24} className="mx-auto text-green-400 mb-1" />
              <p className="text-xs font-bold">Wallets Ready</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg text-center">
              <Shield size={24} className="mx-auto text-green-400 mb-1" />
              <p className="text-xs font-bold">Security Enabled</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg text-center">
              <Lightning size={24} className="mx-auto text-green-400 mb-1" />
              <p className="text-xs font-bold">Tools Configured</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg text-center">
              <Rocket size={24} className="mx-auto text-green-400 mb-1" />
              <p className="text-xs font-bold">SHIP IT</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Links */}
      <div className="cyber-card p-4">
        <h4 className="font-bold mb-3 flex items-center gap-2">
          <Lightning size={18} className="text-primary" />
          Quick Links
        </h4>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'Phantom', url: 'https://phantom.app' },
            { name: 'Jupiter', url: 'https://jup.ag' },
            { name: 'DexScreener', url: 'https://dexscreener.com' },
            { name: 'Helius', url: 'https://dev.helius.xyz' },
            { name: 'Solscan', url: 'https://solscan.io' },
            { name: 'Birdeye', url: 'https://birdeye.so' },
          ].map(link => (
            <Button
              key={link.name}
              size="sm"
              variant="outline"
              onClick={() => window.open(link.url, '_blank')}
            >
              {link.name}
              <ArrowSquareOut size={12} className="ml-1" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

