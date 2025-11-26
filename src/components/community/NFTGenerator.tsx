// NFT Collection Generator — Admin Component (God Mode Only, No Wallet Required)
// November 22, 2025 — Quantum Falcon Cockpit

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Rocket, Sparkle, Crown, 
  Trophy, Medal, Image, X
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { RARITY_TIERS, type RarityTier } from '@/lib/nft/AutoNFTGenerator'
import { generateSeasonalFalconCollection, SEASONS, getCurrentSeason, type SeasonalMintProgress, type NFTItem } from '@/lib/nft/SeasonalFalconNFTGenerator'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { cn } from '@/lib/utils'

interface NFTGeneratorProps {
  onClose?: () => void
}

export default function NFTGenerator({ onClose }: NFTGeneratorProps) {
  const [totalSupply, setTotalSupply] = useState(888)
  const [isGenerating, setIsGenerating] = useState(false)
  const [seasonalProgress, setSeasonalProgress] = useState<SeasonalMintProgress | null>(null)
  const [collectionType, setCollectionType] = useState<'seasonal'>('seasonal')
  const [selectedSeason, setSelectedSeason] = useState<string>('auto')
  const [nfts, setNfts] = useKV<NFTItem[]>('nft-collection', [])

  // Listen for open event
  useEffect(() => {
    const handleOpen = () => {
      // Dialog will be opened by parent
    }
    window.addEventListener('open-nft-generator', handleOpen)
    return () => window.removeEventListener('open-nft-generator', handleOpen)
  }, [])

  const handleGenerate = async () => {
    if (totalSupply < 1 || totalSupply > 10000) {
      toast.error('Invalid supply', {
        description: 'Supply must be between 1 and 10,000'
      })
      return
    }

    setIsGenerating(true)
    setSeasonalProgress(null)

    try {
      const season = selectedSeason === 'auto' ? undefined : selectedSeason as any
      const generatedNFTs = await generateSeasonalFalconCollection({
        supply: totalSupply,
        season,
        onProgress: (prog) => {
          setSeasonalProgress(prog)
        },
        onComplete: (items) => {
          // Add to collection
          setNfts(prev => [...prev, ...items])
          setIsGenerating(false)
          toast.success('Seasonal collection generation complete!', {
            description: `${items.length} NFTs successfully generated`,
            duration: 10000
          })
          onClose?.()
        },
        onError: (error) => {
          setIsGenerating(false)
          toast.error('Generation failed', {
            description: error.message
          })
        }
      })
    } catch (error) {
      setIsGenerating(false)
      const err = error instanceof Error ? error : new Error('Unknown error')
      toast.error('Generation failed', {
        description: err.message
      })
    }
  }

  const progressPercent = seasonalProgress
    ? Math.round((seasonalProgress.current / seasonalProgress.total) * 100)
    : 0

  const currentSeason = selectedSeason === 'auto' ? getCurrentSeason() : selectedSeason
  const seasonData = SEASONS[currentSeason as keyof typeof SEASONS]
  const maxSupply = seasonData?.maxSupply || totalSupply
  const finalSupply = Math.min(totalSupply, maxSupply)

  return (
    <div className="cyber-card p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Rocket size={32} className="text-primary" weight="duotone" />
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wider text-secondary">
              Generate NFT Collection
            </h2>
            <p className="text-sm text-muted-foreground">
              AI-generated Quantum Falcon seasonal collection
            </p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X size={16} />
          </Button>
        )}
      </div>

      {/* Configuration */}
      <div className="space-y-4">
        {/* Season Selector */}
        <div className="space-y-2">
          <Label className="uppercase tracking-wider text-sm font-bold">
            Season
          </Label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            disabled={isGenerating}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm"
          >
            <option value="auto">Auto (Current Season)</option>
            {Object.keys(SEASONS).map(season => (
              <option key={season} value={season}>
                {SEASONS[season as keyof typeof SEASONS].name}
              </option>
            ))}
          </select>
          {selectedSeason !== 'auto' && seasonData?.maxSupply && (
            <p className="text-xs text-accent font-bold">
              ⚠️ Limited to {seasonData.maxSupply} NFTs
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="supply" className="uppercase tracking-wider text-sm font-bold">
            Total Supply
          </Label>
          <Input
            id="supply"
            type="number"
            min={1}
            max={maxSupply}
            value={totalSupply}
            onChange={(e) => setTotalSupply(parseInt(e.target.value) || 0)}
            disabled={isGenerating}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Recommended: {maxSupply} (seasonal collection) • Will generate: {finalSupply}
          </p>
        </div>

        {/* Rarity Distribution Preview */}
        <div className="cyber-card-accent p-4 space-y-3">
          <h3 className="font-bold uppercase tracking-wider text-sm text-accent">
            Rarity Distribution (with {seasonData.rarityBoost}x boost)
          </h3>
          <div className="space-y-2">
            {Object.entries(RARITY_TIERS).map(([rarity, tier]) => {
              const boostedChance = tier.chance * seasonData.rarityBoost
              const count = Math.floor(finalSupply * Math.min(boostedChance, 1))
              const Icon = rarity === 'legendary' ? Crown :
                          rarity === 'epic' ? Trophy :
                          rarity === 'rare' ? Medal :
                          rarity === 'uncommon' ? Sparkle : Image
              
              return (
                <div key={rarity} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={16} weight="fill" style={{ color: tier.color }} />
                    <span className="text-sm font-bold uppercase">{tier.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {(boostedChance * 100).toFixed(1)}%
                    </span>
                    <span className="text-sm font-mono font-bold" style={{ color: tier.color }}>
                      {count}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Progress */}
      {isGenerating && seasonalProgress && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold uppercase tracking-wider">
              Generating {seasonalProgress.current} / {seasonalProgress.total}
            </span>
            <span className="text-muted-foreground">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              Season: {SEASONS[seasonalProgress.season].name}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(seasonalProgress.minted).map(([rarity, count]) => (
              <Badge
                key={rarity}
                variant="outline"
                style={{
                  borderColor: RARITY_TIERS[rarity as keyof typeof RARITY_TIERS].color,
                  color: RARITY_TIERS[rarity as keyof typeof RARITY_TIERS].color,
                }}
              >
                {rarity}: {count}
              </Badge>
            ))}
          </div>
          {seasonalProgress.rarity && (
            <div className="text-center">
              <Badge
                className="text-sm font-bold"
                style={{
                  backgroundColor: RARITY_TIERS[seasonalProgress.rarity].color,
                  color: '#000',
                }}
              >
                Current: {RARITY_TIERS[seasonalProgress.rarity].name}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating || totalSupply < 1}
        className={cn(
          "w-full uppercase tracking-wider font-bold text-lg py-6",
          "bg-gradient-to-r from-primary via-accent to-primary",
          "hover:from-primary/90 hover:via-accent/90 hover:to-primary/90",
          "animate-gradient"
        )}
      >
        {isGenerating ? (
          <>
            <Sparkle size={20} className="mr-2 animate-spin" />
            Generating Collection...
          </>
        ) : (
          <>
            <Rocket size={20} className="mr-2" weight="fill" />
            Generate {finalSupply} NFTs
          </>
        )}
      </Button>

      {/* Info */}
      <div className="cyber-card-accent p-3 border-l-4 border-primary">
        <p className="text-xs text-muted-foreground">
          <strong className="text-primary">Info:</strong> This will generate {finalSupply} AI-created NFTs with perfect rarity distribution. 
          All NFTs will be available for purchase. 7.77% royalty on all sales.
        </p>
      </div>
    </div>
  )
}
