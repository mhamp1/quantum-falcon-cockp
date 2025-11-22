// NFT Collection Generator — Admin Component (God Mode Only)
// November 22, 2025 — Quantum Falcon Cockpit

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Rocket, Wallet, Sparkle, Crown, Fire, 
  Trophy, Medal, Image, X
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { generateAndMintNFTCollection, RARITY_TIERS, type MintProgress, type RarityTier } from '@/lib/nft/AutoNFTGenerator'
import { generateSeasonalFalconCollection, SEASONS, getCurrentSeason, type SeasonalMintProgress } from '@/lib/nft/SeasonalFalconNFTGenerator'
import { cn } from '@/lib/utils'

interface NFTGeneratorProps {
  onClose?: () => void
}

export default function NFTGenerator({ onClose }: NFTGeneratorProps) {
  const wallet = useWallet()
  const [totalSupply, setTotalSupply] = useState(3510)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<MintProgress | null>(null)
  const [mintAddresses, setMintAddresses] = useState<string[]>([])
  const [collectionType, setCollectionType] = useState<'genesis' | 'seasonal'>('genesis')
  const [seasonalProgress, setSeasonalProgress] = useState<SeasonalMintProgress | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<string>('auto')

  const handleGenerate = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      toast.error('Wallet not connected', {
        description: 'Please connect your Solana wallet to generate NFTs'
      })
      return
    }

    if (totalSupply < 1 || totalSupply > 10000) {
      toast.error('Invalid supply', {
        description: 'Supply must be between 1 and 10,000'
      })
      return
    }

    setIsGenerating(true)
    setProgress(null)
    setSeasonalProgress(null)
    setMintAddresses([])

    try {
      if (collectionType === 'seasonal') {
        const season = selectedSeason === 'auto' ? undefined : selectedSeason as any
        const addresses = await generateSeasonalFalconCollection(wallet, {
          supply: totalSupply,
          season,
          onProgress: (prog) => {
            setSeasonalProgress(prog)
          },
          onComplete: (addresses) => {
            setMintAddresses(addresses)
            setIsGenerating(false)
            toast.success('Seasonal collection generation complete!', {
              description: `${addresses.length} NFTs successfully minted`,
              duration: 10000
            })
          },
          onError: (error) => {
            setIsGenerating(false)
            toast.error('Generation failed', {
              description: error.message
            })
          }
        })
      } else {
        const addresses = await generateAndMintNFTCollection(wallet, {
          totalSupply,
          onProgress: (prog) => {
            setProgress(prog)
          },
          onComplete: (addresses) => {
            setMintAddresses(addresses)
            setIsGenerating(false)
            toast.success('Collection generation complete!', {
              description: `${addresses.length} NFTs successfully minted`,
              duration: 10000
            })
          },
          onError: (error) => {
            setIsGenerating(false)
            toast.error('Generation failed', {
              description: error.message
            })
          }
        })
      }
    } catch (error) {
      setIsGenerating(false)
      const err = error instanceof Error ? error : new Error('Unknown error')
      toast.error('Generation failed', {
        description: err.message
      })
    }
  }

  const progressPercent = (progress || seasonalProgress)
    ? Math.round(((progress || seasonalProgress)!.current / (progress || seasonalProgress)!.total) * 100)
    : 0

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
              AI-generated Quantum Falcon Genesis collection
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

      {/* Wallet Status */}
      {!wallet.connected ? (
        <div className="cyber-card-accent p-4 space-y-3">
          <div className="flex items-center gap-2 text-accent">
            <Wallet size={20} weight="fill" />
            <span className="font-bold uppercase text-sm">Wallet Required</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Connect your Solana wallet to generate the NFT collection. You'll need SOL for transaction fees.
          </p>
          <Button
            onClick={() => wallet.select && wallet.select()}
            className="w-full"
          >
            <Wallet size={16} className="mr-2" />
            Connect Wallet
          </Button>
        </div>
      ) : (
        <div className="cyber-card-accent p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet size={20} className="text-accent" weight="fill" />
              <span className="font-bold text-sm">
                {wallet.publicKey?.toString().slice(0, 8)}...{wallet.publicKey?.toString().slice(-8)}
              </span>
            </div>
            <Badge variant="outline" className="border-accent text-accent">
              Connected
            </Badge>
          </div>
        </div>
      )}

      {/* Configuration */}
      <div className="space-y-4">
        {/* Collection Type Selector */}
        <div className="space-y-2">
          <Label className="uppercase tracking-wider text-sm font-bold">
            Collection Type
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={collectionType === 'genesis' ? 'default' : 'outline'}
              onClick={() => setCollectionType('genesis')}
              disabled={isGenerating}
              className="w-full"
            >
              Genesis
            </Button>
            <Button
              variant={collectionType === 'seasonal' ? 'default' : 'outline'}
              onClick={() => setCollectionType('seasonal')}
              disabled={isGenerating}
              className="w-full"
            >
              Seasonal
            </Button>
          </div>
        </div>

        {/* Season Selector (for seasonal) */}
        {collectionType === 'seasonal' && (
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
            {selectedSeason !== 'auto' && SEASONS[selectedSeason as keyof typeof SEASONS]?.maxSupply && (
              <p className="text-xs text-accent font-bold">
                ⚠️ Limited to {SEASONS[selectedSeason as keyof typeof SEASONS].maxSupply} NFTs
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="supply" className="uppercase tracking-wider text-sm font-bold">
            Total Supply
          </Label>
          <Input
            id="supply"
            type="number"
            min={1}
            max={10000}
            value={totalSupply}
            onChange={(e) => setTotalSupply(parseInt(e.target.value) || 0)}
            disabled={isGenerating}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            {collectionType === 'genesis' 
              ? 'Recommended: 3,510 (perfect rarity distribution)'
              : 'Recommended: 888 (seasonal collection)'}
          </p>
        </div>

        {/* Rarity Distribution Preview */}
        <div className="cyber-card-accent p-4 space-y-3">
          <h3 className="font-bold uppercase tracking-wider text-sm text-accent">
            Rarity Distribution
          </h3>
          <div className="space-y-2">
            {Object.entries(RARITY_TIERS).map(([rarity, tier]) => {
              const count = Math.floor(totalSupply * tier.chance)
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
                      {(tier.chance * 100).toFixed(1)}%
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
      {isGenerating && (progress || seasonalProgress) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold uppercase tracking-wider">
              Minting {(progress || seasonalProgress)!.current} / {(progress || seasonalProgress)!.total}
            </span>
            <span className="text-muted-foreground">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          {seasonalProgress && (
            <div className="text-center">
              <Badge variant="outline" className="text-xs">
                Season: {SEASONS[seasonalProgress.season].name}
              </Badge>
            </div>
          )}
          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries((progress || seasonalProgress)!.minted).map(([rarity, count]) => (
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
          {(progress?.rarity || seasonalProgress?.rarity) && (
            <div className="text-center">
              <Badge
                className="text-sm font-bold"
                style={{
                  backgroundColor: RARITY_TIERS[(progress || seasonalProgress)!.rarity as RarityTier].color,
                  color: '#000',
                }}
              >
                Current: {RARITY_TIERS[(progress || seasonalProgress)!.rarity as RarityTier].name}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={!wallet.connected || isGenerating || totalSupply < 1}
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
            Generate {totalSupply} NFTs
          </>
        )}
      </Button>

      {/* Warning */}
      <div className="cyber-card-accent p-3 border-l-4 border-yellow-500">
        <p className="text-xs text-muted-foreground">
          <strong className="text-yellow-500">Warning:</strong> This will mint {totalSupply} NFTs on-chain. 
          You'll need SOL for transaction fees (~0.001 SOL per NFT). This action cannot be undone.
        </p>
      </div>
    </div>
  )
}

