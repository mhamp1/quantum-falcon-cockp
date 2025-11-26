// Quest NFT Reward Component — Tier-Gated, XP-Integrated
// November 22, 2025 — Quantum Falcon Cockpit
// SEC-Proof: Digital Collectibles Only

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Trophy, Crown, Medal, Sparkle, SquaresFour, Lock, 
  CheckCircle, XCircle, Wallet, WarningCircle as AlertCircle
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { 
  QUEST_NFTS, QUESTS, type QuestNFT, type Quest,
  canAccessNFT, mintQuestNFT, NFT_LEGAL_DISCLAIMER
} from '@/lib/nft/QuestNFTSystem'
import { RARITY_TIERS } from '@/lib/nft/AutoNFTGenerator'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { UserAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'

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
  const [acceptedDisclaimer, setAcceptedDisclaimer] = useState(false)
  const [isMinting, setIsMinting] = useState(false)

  const userTier = auth?.license?.tier || 'Free'
  const nft = quest.nftReward

  if (!nft) return null

  const hasAccess = canAccessNFT(nft, userTier)
  const isCompleted = quest.requirements.type === 'trade_count' 
    ? (userStats.totalTrades || 0) >= quest.requirements.value
    : quest.requirements.type === 'profit_amount'
    ? (userStats.totalProfit || 0) >= quest.requirements.value
    : quest.requirements.type === 'streak_days'
    ? (userStats.streakDays || 0) >= quest.requirements.value
    : quest.requirements.type === 'level_reach'
    ? (userStats.level || 0) >= quest.requirements.value
    : false

  const getRarityColor = (rarity: string) => RARITY_TIERS[rarity as keyof typeof RARITY_TIERS]?.color || '#FFFFFF'
  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return <Crown size={16} weight="fill" />
      case 'epic': return <Trophy size={16} weight="fill" />
      case 'rare': return <Medal size={16} weight="fill" />
      case 'uncommon': return <Sparkle size={16} weight="fill" />
      default: return <SquaresFour size={16} weight="fill" />
    }
  }

  const handleMint = async () => {
    if (!hasAccess) {
      toast.error('Tier Requirement Not Met', {
        description: `This NFT requires ${nft.tierRequired} tier or higher`
      })
      return
    }

    if (!isCompleted) {
      toast.error('Quest Not Completed', {
        description: quest.requirements.description
      })
      return
    }

    setShowDisclaimer(true)
  }

  const handleConfirmMint = async () => {
    if (!acceptedDisclaimer) {
      toast.error('Please accept the disclaimer', {
        description: 'You must acknowledge the legal disclaimer to mint'
      })
      return
    }

    setIsMinting(true)
    setShowDisclaimer(false)

    try {
      // NFT minting via payment processor (no wallet required)
      toast.info('NFT Purchase', {
        description: 'NFTs are purchased via payment processor. Wallet connection not required.',
      })
      // Simulate mint completion
      const mockMintAddress = `mock_${Date.now()}`
      onMintComplete?.(mockMintAddress)
    } catch (error) {
      console.error('[QuestNFT] Mint error:', error)
      toast.error('Failed to process NFT purchase')
    } finally {
      setIsMinting(false)
      setAcceptedDisclaimer(false)
    }
  }

  return (
    <>
      <div className={cn(
        "cyber-card p-4 space-y-3 relative",
        !hasAccess && "opacity-50"
      )}>
        {/* Tier Lock Badge */}
        {!hasAccess && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
              <Lock size={12} className="mr-1" />
              {nft.tierRequired}+
            </Badge>
          </div>
        )}

        {/* NFT Preview */}
        <div className="flex items-center gap-3">
          <div 
            className="w-16 h-16 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: `${getRarityColor(nft.rarity)}20`,
              border: `2px solid ${getRarityColor(nft.rarity)}`
            }}
          >
            {getRarityIcon(nft.rarity)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm uppercase tracking-wider truncate">
              {nft.name}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {nft.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className="text-[10px]"
                style={{
                  borderColor: getRarityColor(nft.rarity),
                  color: getRarityColor(nft.rarity)
                }}
              >
                {RARITY_TIERS[nft.rarity as keyof typeof RARITY_TIERS].name}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                +{nft.xpReward} XP
              </Badge>
            </div>
          </div>
        </div>

        {/* Quest Status */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <>
                <CheckCircle size={16} className="text-accent" weight="fill" />
                <span className="text-xs text-accent font-bold">Quest Complete</span>
              </>
            ) : (
              <>
                <XCircle size={16} className="text-muted-foreground" weight="fill" />
                <span className="text-xs text-muted-foreground">
                  {quest.requirements.description}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Mint Button */}
        <Button
          onClick={handleMint}
          disabled={!hasAccess || !isCompleted || isMinting}
          className={cn(
            "w-full uppercase tracking-wider font-bold text-xs",
            hasAccess && isCompleted && "bg-gradient-to-r from-primary to-accent"
          )}
        >
          {!hasAccess ? (
            <>
              <Lock size={14} className="mr-2" />
              Requires {nft.tierRequired} Tier
            </>
          ) : !isCompleted ? (
            <>
              <XCircle size={14} className="mr-2" />
              Complete Quest First
            </>
          ) : isMinting ? (
            <>
              <SquaresFour size={14} className="mr-2 animate-spin" />
              Minting...
            </>
          ) : (
            <>
              <Trophy size={14} className="mr-2" />
              Mint NFT Reward
            </>
          )}
        </Button>
      </div>

      {/* Legal Disclaimer Dialog */}
      <Dialog open={showDisclaimer} onOpenChange={setShowDisclaimer}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle size={24} className="text-destructive" weight="fill" />
              Legal Disclaimer — Required Before Minting
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              You must read and accept this disclaimer to mint the NFT
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-4">
              <div className="cyber-card-accent p-4 border-l-4 border-destructive">
                <pre className="text-xs whitespace-pre-wrap font-mono text-foreground leading-relaxed">
                  {NFT_LEGAL_DISCLAIMER}
                </pre>
              </div>

              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <input
                  type="checkbox"
                  id="accept-disclaimer"
                  checked={acceptedDisclaimer}
                  onChange={(e) => setAcceptedDisclaimer(e.target.checked)}
                  className="mt-1"
                />
                <label 
                  htmlFor="accept-disclaimer" 
                  className="text-sm text-foreground cursor-pointer flex-1"
                >
                  <strong className="text-destructive">I acknowledge and accept:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-muted-foreground">
                    <li>This NFT is a digital art collectible only</li>
                    <li>It is NOT an investment, security, or financial instrument</li>
                    <li>There is NO promise of profit, utility, or future value</li>
                    <li>I accept 100% of the risk</li>
                    <li>I will not hold the creator or team liable for any loss in value</li>
                    <li>I am 18+ years old</li>
                  </ul>
                </label>
              </div>
            </div>
          </ScrollArea>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDisclaimer(false)
                setAcceptedDisclaimer(false)
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmMint}
              disabled={!acceptedDisclaimer}
              className="flex-1 bg-gradient-to-r from-primary to-accent"
            >
              <Trophy size={16} className="mr-2" />
              Mint NFT (I Accept)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

