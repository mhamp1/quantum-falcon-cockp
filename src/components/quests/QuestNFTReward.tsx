// Quest NFT Reward Component — GOD-TIER ULTIMATE v2025.1.0
// November 28, 2025 — Quantum Falcon Cockpit
// Rarity-themed cards, confetti, edition numbers, God Mode support

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, Crown, Medal, Sparkle, Lock, 
  CheckCircle, XCircle, WarningCircle as AlertCircle, Diamond as Gem, Shield, Lightning
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { 
  type QuestNFT, type Quest,
  canAccessNFT
} from '@/lib/nft/QuestNFTSystem'
import { generateRarity, getRemainingSupply, type GeneratedRarity } from '@/lib/nft/RarityEngine'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { UserAuth } from '@/lib/auth'
import { isGodMode } from '@/lib/godMode'
import { cn } from '@/lib/utils'
import { awardXPAuto } from '@/lib/xpAutoAward'

interface QuestNFTRewardProps {
  quest: Quest
  userStats: {
    totalTrades?: number
    totalProfit?: number
    winRate?: number
    streakDays?: number
    level?: number
  }
  onMintComplete?: (mintAddress: string) => void
}

// Enhanced rarity config with visual styling
const RARITY_CONFIG = {
  legendary: { 
    color: 'from-yellow-400 to-amber-600', 
    glow: 'shadow-yellow-500/50', 
    border: 'border-yellow-500/50',
    icon: Crown,
    bgGlow: 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20'
  },
  epic: { 
    color: 'from-purple-400 to-pink-600', 
    glow: 'shadow-purple-500/50', 
    border: 'border-purple-500/50',
    icon: Trophy,
    bgGlow: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
  },
  rare: { 
    color: 'from-blue-400 to-cyan-600', 
    glow: 'shadow-cyan-500/50', 
    border: 'border-cyan-500/50',
    icon: Medal,
    bgGlow: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'
  },
  uncommon: { 
    color: 'from-green-400 to-emerald-600', 
    glow: 'shadow-green-500/50', 
    border: 'border-green-500/50',
    icon: Sparkle,
    bgGlow: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'
  },
  common: { 
    color: 'from-gray-400 to-gray-600', 
    glow: 'shadow-gray-500/50', 
    border: 'border-gray-500/50',
    icon: Gem,
    bgGlow: 'bg-gradient-to-br from-gray-500/20 to-slate-500/20'
  },
}

export default function QuestNFTReward({ 
  quest, 
  userStats,
  onMintComplete 
}: QuestNFTRewardProps) {
  const [auth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })

  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [agreements, setAgreements] = useState({
    age: false,
    risk: false,
    noAdvice: false,
    terms: false
  })
  const [isMinting, setIsMinting] = useState(false)
  const [hasMinted, setHasMinted] = useState(false)
  const [mintProgress, setMintProgress] = useState(0)
  const [generatedRarity, setGeneratedRarity] = useState<GeneratedRarity | null>(null)

  const userTier = auth?.license?.tier || 'free'
  const isGodModeActive = isGodMode(auth)
  const nft = quest.nftReward
  
  // Get remaining supply for display
  const remainingSupply = nft ? getRemainingSupply(nft.rarity) : 0

  if (!nft) return null

  // Check if already minted from localStorage
  const alreadyMinted = (() => {
    try {
      const mintedNFTs = JSON.parse(localStorage.getItem('qf_minted_nfts') || '[]')
      return mintedNFTs.some((m: { id: string }) => m.id === nft.id)
    } catch {
      return false
    }
  })()

  // Don't render if already minted
  if (hasMinted || alreadyMinted) return null

  // God Mode bypasses tier requirements
  const hasAccess = isGodModeActive || canAccessNFT(nft, userTier)
  
  const isCompleted = quest.requirements.type === 'trade_count' 
    ? (userStats.totalTrades || 0) >= quest.requirements.value
    : quest.requirements.type === 'profit_amount'
    ? (userStats.totalProfit || 0) >= quest.requirements.value
    : quest.requirements.type === 'streak_days'
    ? (userStats.streakDays || 0) >= quest.requirements.value
    : quest.requirements.type === 'level_reach'
    ? (userStats.level || 0) >= quest.requirements.value
    : false

  const allAgreed = Object.values(agreements).every(v => v)
  const rarity = RARITY_CONFIG[nft.rarity as keyof typeof RARITY_CONFIG] || RARITY_CONFIG.common
  const RarityIcon = rarity.icon

  const handleMint = async () => {
    if (!hasAccess) {
      toast.error('Tier Requirement Not Met', {
        description: `This NFT requires ${nft.tierRequired} tier or higher`
      })
      return
    }

    if (!isCompleted && !isGodModeActive) {
      toast.error('Quest Not Completed', {
        description: quest.requirements.description
      })
      return
    }

    setShowDisclaimer(true)
  }

  const handleConfirmMint = async () => {
    if (!allAgreed) {
      toast.error('Please accept all agreements', {
        description: 'You must acknowledge all legal disclaimers to mint'
      })
      return
    }

    setIsMinting(true)
    setShowDisclaimer(false)
    setMintProgress(0)

    try {
      // Animated progress
      const progressInterval = setInterval(() => {
        setMintProgress(prev => Math.min(prev + 10, 90))
      }, 200)
      
      // Generate rarity with real scarcity
      const rarityResult = await generateRarity(isGodModeActive)
      setGeneratedRarity(rarityResult)
      
      // Complete mint
      await new Promise(resolve => setTimeout(resolve, 1000))
      clearInterval(progressInterval)
      setMintProgress(100)
      
      const mintAddress = `mint_${Date.now()}_${nft.id}_${rarityResult.name}_${rarityResult.edition}`
      
      // Mark as minted so the box disappears
      setHasMinted(true)
      
      // Save to localStorage so it persists across page loads
      try {
        const mintedNFTs = JSON.parse(localStorage.getItem('qf_minted_nfts') || '[]')
        mintedNFTs.push({ 
          id: nft.id, 
          address: mintAddress, 
          timestamp: Date.now(),
          rarity: rarityResult.name,
          edition: rarityResult.edition,
          totalSupply: rarityResult.totalSupply
        })
        localStorage.setItem('qf_minted_nfts', JSON.stringify(mintedNFTs))
      } catch (e) {
        // Silent fail
      }
      
      // Award XP
      awardXPAuto('nft-mint', nft.xpReward, `Minted ${nft.name}`)
      
      // CONFETTI EXPLOSION based on rarity
      const confettiColors = rarityResult.particles
      if (rarityResult.name === 'legendary') {
        // MASSIVE confetti for legendary
        confetti({
          particleCount: 500,
          spread: 180,
          origin: { y: 0.5 },
          colors: confettiColors,
          scalar: 1.5
        })
        setTimeout(() => {
          confetti({
            particleCount: 300,
            angle: 60,
            spread: 100,
            origin: { x: 0 },
            colors: confettiColors
          })
          confetti({
            particleCount: 300,
            angle: 120,
            spread: 100,
            origin: { x: 1 },
            colors: confettiColors
          })
        }, 500)
      } else if (rarityResult.name === 'epic') {
        confetti({
          particleCount: 300,
          spread: 120,
          origin: { y: 0.6 },
          colors: confettiColors,
          scalar: 1.2
        })
      } else if (rarityResult.name === 'rare') {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: confettiColors
        })
      } else {
        // Small confetti for common/uncommon
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: confettiColors
        })
      }
      
      onMintComplete?.(mintAddress)
      
      // Rarity-appropriate toast
      const editionText = rarityResult.totalSupply === Infinity 
        ? `Edition #${rarityResult.edition}`
        : `Edition #${rarityResult.edition}/${rarityResult.totalSupply}`
      
      toast.success(`🎖️ ${rarityResult.name.toUpperCase()} NFT MINTED!`, {
        description: `${nft.name} — ${editionText}${isGodModeActive ? ' (GOD MODE)' : ''}`,
        duration: 10000,
      })
    } catch (error) {
      console.error('[QuestNFT] Mint error:', error)
      toast.error('Failed to process NFT mint')
    } finally {
      setIsMinting(false)
      setMintProgress(0)
      setAgreements({ age: false, risk: false, noAdvice: false, terms: false })
    }
  }

  return (
    <>
      <motion.div
        whileHover={{ scale: hasAccess ? 1.02 : 1 }}
        className={cn(
          "cyber-card relative overflow-hidden rounded-2xl border-2 p-5 transition-all cursor-pointer",
          hasAccess ? rarity.border : "border-gray-800 opacity-60",
          rarity.bgGlow
        )}
        onClick={handleMint}
        style={{
          boxShadow: hasAccess ? `0 0 30px ${rarity.glow.replace('shadow-', '').replace('/50', '')}40` : undefined
        }}
      >
        {/* Rarity Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge className={cn("bg-gradient-to-r text-black font-black uppercase text-xs", rarity.color)}>
            <RarityIcon size={14} weight="fill" className="mr-1" />
            {nft.rarity}
          </Badge>
        </div>

        {/* Tier Lock Badge */}
        {!hasAccess && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
              <Lock size={12} className="mr-1" />
              {nft.tierRequired}+
            </Badge>
          </div>
        )}

        {/* God Mode Badge */}
        {isGodModeActive && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-yellow-500/20 border-yellow-500/50 text-yellow-400">
              <Crown size={12} weight="fill" className="mr-1" />
              GOD
            </Badge>
          </div>
        )}

        <div className="relative z-10 space-y-4">
          {/* NFT Header - Fixed layout to prevent icon overlap */}
          <div className="flex items-start gap-3 pr-16">
            {/* Icon container - fixed size, no overlap */}
            <div 
              className={cn("flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br", rarity.color)}
              style={{ boxShadow: `0 0 20px ${rarity.glow.replace('shadow-', '').replace('/50', '')}60` }}
            >
              <RarityIcon size={24} weight="fill" className="text-black" />
            </div>
            {/* Text container - properly isolated from icon */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <h4 className="text-sm font-black uppercase tracking-wider leading-tight mb-1 truncate">
                {nft.name}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {nft.maxSupply 
                  ? `${remainingSupply === Infinity ? '∞' : remainingSupply} / ${nft.maxSupply} remaining`
                  : 'Edition #Unlimited'}
              </p>
            </div>
          </div>

          {/* Description - Clear spacing from header */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {nft.description}
          </p>

          {/* Minting Progress */}
          <AnimatePresence>
            {isMinting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-2">
                    <Lightning size={14} weight="fill" className="animate-pulse" />
                    MINTING...
                  </span>
                  <span className="font-mono text-primary">{mintProgress}%</span>
                </div>
                <Progress value={mintProgress} className="h-2" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rewards */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
              +{nft.xpReward} XP
            </Badge>
            {isCompleted || isGodModeActive ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
                <CheckCircle size={14} className="mr-1" weight="fill" />
                Ready to Mint
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                <Lock size={14} className="mr-1" />
                Quest Required
              </Badge>
            )}
          </div>

          {/* Mint Button */}
          <Button
            className={cn(
              "w-full h-12 text-sm font-black uppercase tracking-wider",
              hasAccess && (isCompleted || isGodModeActive) 
                ? `bg-gradient-to-r ${rarity.color} text-black hover:opacity-90`
                : ""
            )}
            disabled={!hasAccess || (!isCompleted && !isGodModeActive) || isMinting}
          >
            {isMinting ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                MINTING...
              </>
            ) : !hasAccess ? (
              <>
                <Lock size={16} className="mr-2" />
                Requires {nft.tierRequired}
              </>
            ) : !isCompleted && !isGodModeActive ? (
              <>
                <XCircle size={16} className="mr-2" />
                Complete Quest
              </>
            ) : (
              <>
                <Trophy size={16} className="mr-2" />
                MINT NOW
              </>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Legal Disclaimer Dialog with 4 Checkboxes */}
      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent className="max-w-2xl bg-gradient-to-br from-black to-purple-900/30 border-2 border-cyan-500/50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-wider text-cyan-400 flex items-center gap-3">
              <AlertCircle size={32} weight="fill" className="text-red-500" />
              LEGAL DISCLAIMER
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              You must read and accept all terms to mint this NFT
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-80 pr-4">
            <div className="space-y-6">
              {/* Warning Box */}
              <div className="bg-red-900/30 border-2 border-red-500/50 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={20} weight="fill" className="text-red-400" />
                  <p className="text-red-400 font-bold uppercase tracking-wider">
                    THIS IS A DIGITAL COLLECTIBLE ONLY
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    Not an investment or security
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    No promise of profit or utility
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    Value may go to zero
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                    You accept 100% of the risk
                  </li>
                </ul>
              </div>

              {/* 4 Required Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-background/30 rounded-lg border border-primary/20">
                  <Checkbox
                    id="agree-age"
                    checked={agreements.age}
                    onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, age: !!checked }))}
                    className="mt-1"
                  />
                  <Label htmlFor="agree-age" className="text-sm cursor-pointer flex-1">
                    <strong className="text-primary">I am 18+ years old</strong>
                    <p className="text-xs text-muted-foreground mt-1">
                      I confirm I am of legal age to participate in digital asset purchases
                    </p>
                  </Label>
                </div>

                <div className="flex items-start gap-3 p-3 bg-background/30 rounded-lg border border-primary/20">
                  <Checkbox
                    id="agree-risk"
                    checked={agreements.risk}
                    onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, risk: !!checked }))}
                    className="mt-1"
                  />
                  <Label htmlFor="agree-risk" className="text-sm cursor-pointer flex-1">
                    <strong className="text-primary">I understand this NFT has no financial value</strong>
                    <p className="text-xs text-muted-foreground mt-1">
                      This is a digital collectible for entertainment purposes only
                    </p>
                  </Label>
                </div>

                <div className="flex items-start gap-3 p-3 bg-background/30 rounded-lg border border-primary/20">
                  <Checkbox
                    id="agree-noadvice"
                    checked={agreements.noAdvice}
                    onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, noAdvice: !!checked }))}
                    className="mt-1"
                  />
                  <Label htmlFor="agree-noadvice" className="text-sm cursor-pointer flex-1">
                    <strong className="text-primary">I will not hold Quantum Falcon liable</strong>
                    <p className="text-xs text-muted-foreground mt-1">
                      I accept full responsibility for my decision to mint this NFT
                    </p>
                  </Label>
                </div>

                <div className="flex items-start gap-3 p-3 bg-background/30 rounded-lg border border-primary/20">
                  <Checkbox
                    id="agree-terms"
                    checked={agreements.terms}
                    onCheckedChange={(checked) => setAgreements(prev => ({ ...prev, terms: !!checked }))}
                    className="mt-1"
                  />
                  <Label htmlFor="agree-terms" className="text-sm cursor-pointer flex-1">
                    <strong className="text-primary">I accept the Terms of Service</strong>
                    <p className="text-xs text-muted-foreground mt-1">
                      I have read and agree to all platform terms and conditions
                    </p>
                  </Label>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex gap-4 mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDisclaimer(false)
                setAgreements({ age: false, risk: false, noAdvice: false, terms: false })
              }} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmMint}
              disabled={!allAgreed || isMinting}
              className={cn(
                "flex-1 h-14 text-lg font-black uppercase",
                allAgreed 
                  ? `bg-gradient-to-r ${rarity.color} text-black hover:opacity-90`
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isMinting ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                  MINTING...
                </>
              ) : (
                <>
                  <CheckCircle size={20} weight="fill" className="mr-2" />
                  I ACCEPT & MINT
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
