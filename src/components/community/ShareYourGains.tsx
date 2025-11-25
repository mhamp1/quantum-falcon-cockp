// Share Your Gains — One-Click Social Sharing
// November 21, 2025 — Quantum Falcon Cockpit
// Makes it addictive and easy to share wins

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ShareNetwork, Copy, CheckCircle, 
  Trophy, TrendingUp, Sparkle, X
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ShareYourGainsProps {
  profit?: number
  winRate?: number
  strategyName?: string
  compact?: boolean
}

export default function ShareYourGains({ 
  profit = 0, 
  winRate = 0, 
  strategyName = 'Quantum Falcon',
  compact = false 
}: ShareYourGainsProps) {
  const [copied, setCopied] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  const shareText = `🚀 Just made $${profit.toFixed(2)} profit with ${winRate.toFixed(1)}% win rate using ${strategyName} on Quantum Falcon! 

The AI trading bot that actually works. 

Try it free: quantumfalcon.io`

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}?ref=share&profit=${profit}&winrate=${winRate}`
    : 'https://quantumfalcon.io'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
      setCopied(true)
      toast.success('Copied to clipboard!', {
        description: 'Share your gains anywhere',
        icon: '📋'
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const handleXShare = () => {
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(xUrl, '_blank', 'width=550,height=420')
    toast.success('Opening X...', { icon: '✖️' })
  }

  const handleDiscordShare = () => {
    handleCopy()
    toast.info('Copied!', {
      description: 'Paste in Discord to share your gains',
      icon: '💬'
    })
  }

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-black font-bold uppercase tracking-wider"
          size="sm"
        >
          <ShareNetwork size={16} weight="fill" className="mr-2" />
          Share Gains
        </Button>

        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-50 mt-2 glass-morph-card p-4 space-y-2 min-w-[200px] border-2 border-primary/50"
          >
            <button
              onClick={handleXShare}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/20 rounded transition-colors"
            >
              <X size={18} weight="fill" className="text-foreground" />
              <span className="text-sm">Share on X</span>
            </button>
            <button
              onClick={handleDiscordShare}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/20 rounded transition-colors"
            >
              <span className="text-lg">💬</span>
              <span className="text-sm">Copy for Discord</span>
            </button>
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/20 rounded transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle size={18} weight="fill" className="text-primary" />
                  <span className="text-sm">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={18} />
                  <span className="text-sm">Copy Link</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="cyber-card p-6 space-y-4 relative overflow-hidden">
      <div className="absolute inset-0 diagonal-stripes opacity-5" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 via-accent/20 to-transparent blur-3xl" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/50 rounded-lg">
            <Trophy size={32} weight="fill" className="text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase tracking-wider text-primary">
              Share Your Gains
            </h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Show the world your wins
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="cyber-card p-4 text-center">
            <div className="text-3xl font-black text-primary mb-1">
              ${profit.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground uppercase">Profit</div>
          </div>
          <div className="cyber-card p-4 text-center">
            <div className="text-3xl font-black text-accent mb-1">
              {winRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground uppercase">Win Rate</div>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={handleXShare}
            className="w-full bg-black hover:bg-black/90 text-white font-bold uppercase tracking-wider border-2 border-white/20"
            size="lg"
          >
            <X size={20} weight="bold" className="mr-2" />
            Share on X
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleDiscordShare}
              variant="outline"
              className="w-full uppercase tracking-wider"
            >
              <span className="mr-2">💬</span>
              Discord
            </Button>
            <Button
              onClick={handleCopy}
              variant="outline"
              className="w-full uppercase tracking-wider"
            >
              {copied ? (
                <>
                  <CheckCircle size={18} weight="fill" className="mr-2 text-primary" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={18} className="mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-primary/20">
          <p className="text-xs text-muted-foreground text-center">
            Sharing helps grow the community and unlock exclusive rewards! 🎁
          </p>
        </div>
      </div>
    </div>
  )
}

