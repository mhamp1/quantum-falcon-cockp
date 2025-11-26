// Profile NFT Gallery — Display User's NFT Collection with Rarity Badges (Payment-Based, No Wallet)
// November 22, 2025 — Quantum Falcon Cockpit

import { useState } from 'react'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Image, Sparkle, Crown, Trophy, Medal, 
  MagnifyingGlass, FunnelSimple
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { RARITY_TIERS, type RarityTier } from '@/lib/nft/AutoNFTGenerator'
import { SEASONS, type Season } from '@/lib/nft/SeasonalFalconNFTGenerator'
import { cn } from '@/lib/utils'

interface NFTItem {
  id: string
  name: string
  image: string
  rarity: RarityTier
  edition: number
  season?: Season
  price: number
}

export default function ProfileNFTGallery() {
  const [ownedNFTs, setOwnedNFTs] = useKV<string[]>('owned-nfts', [])
  const [allNFTs, setAllNFTs] = useKV<NFTItem[]>('nft-collection', [])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRarity, setSelectedRarity] = useState<RarityTier | 'all'>('all')
  const [selectedSeason, setSelectedSeason] = useState<Season | 'all'>('all')

  // Get user's owned NFTs
  const userNFTs = allNFTs.filter(nft => ownedNFTs.includes(nft.id))

  // Filter NFTs
  const filteredNFTs = userNFTs.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         nft.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRarity = selectedRarity === 'all' || nft.rarity === selectedRarity
    const matchesSeason = selectedSeason === 'all' || nft.season === selectedSeason
    return matchesSearch && matchesRarity && matchesSeason
  })

  // Group by rarity
  const nftsByRarity = {
    legendary: filteredNFTs.filter(n => n.rarity === 'legendary'),
    epic: filteredNFTs.filter(n => n.rarity === 'epic'),
    rare: filteredNFTs.filter(n => n.rarity === 'rare'),
    uncommon: filteredNFTs.filter(n => n.rarity === 'uncommon'),
    common: filteredNFTs.filter(n => n.rarity === 'common'),
  }

  const getRarityColor = (rarity: RarityTier) => RARITY_TIERS[rarity].color
  const getRarityIcon = (rarity: RarityTier) => {
    switch (rarity) {
      case 'legendary': return <Crown size={16} weight="fill" />
      case 'epic': return <Trophy size={16} weight="fill" />
      case 'rare': return <Medal size={16} weight="fill" />
      case 'uncommon': return <Sparkle size={16} weight="fill" />
      default: return <Image size={16} weight="fill" />
    }
  }

  const totalValue = userNFTs.reduce((sum, nft) => sum + nft.price, 0)
  const rarityCounts = {
    legendary: nftsByRarity.legendary.length,
    epic: nftsByRarity.epic.length,
    rare: nftsByRarity.rare.length,
    uncommon: nftsByRarity.uncommon.length,
    common: nftsByRarity.common.length,
  }

  if (userNFTs.length === 0) {
    return (
      <div className="cyber-card p-8 text-center space-y-4">
        <Image size={48} weight="duotone" className="mx-auto text-muted-foreground opacity-50" />
        <h3 className="text-lg font-bold uppercase tracking-wider text-muted-foreground">
          No NFTs Yet
        </h3>
        <p className="text-sm text-muted-foreground">
          Start building your Quantum Falcon collection by purchasing NFTs from the marketplace.
        </p>
        <Button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'community' }))
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('open-community-nft-tab'))
            }, 500)
          }}
          variant="outline"
        >
          Browse Collection
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="cyber-card p-4 text-center">
          <div className="text-2xl font-bold text-primary">{userNFTs.length}</div>
          <div className="text-xs text-muted-foreground uppercase">Total NFTs</div>
        </div>
        {Object.entries(rarityCounts).map(([rarity, count]) => (
          <div key={rarity} className="cyber-card p-4 text-center">
            <div 
              className="text-2xl font-bold"
              style={{ color: getRarityColor(rarity as RarityTier) }}
            >
              {count}
            </div>
            <div className="text-xs text-muted-foreground uppercase">{rarity}</div>
          </div>
        ))}
      </div>

      {/* Collection Value */}
      <div className="cyber-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground uppercase tracking-wider">Collection Value</span>
          <span className="text-2xl font-bold text-accent">${totalValue.toLocaleString()}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="cyber-card p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlass 
              size={20} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Rarity Filter */}
          <div className="flex items-center gap-2">
            <FunnelSimple size={20} className="text-muted-foreground" />
            <select
              value={selectedRarity}
              onChange={(e) => setSelectedRarity(e.target.value as RarityTier | 'all')}
              className="bg-background border border-border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Rarities</option>
              {Object.keys(RARITY_TIERS).map(rarity => (
                <option key={rarity} value={rarity}>
                  {RARITY_TIERS[rarity as RarityTier].name}
                </option>
              ))}
            </select>
          </div>

          {/* Season Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value as Season | 'all')}
              className="bg-background border border-border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Seasons</option>
              {Object.keys(SEASONS).map(season => (
                <option key={season} value={season}>
                  {SEASONS[season as Season].name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* NFT Grid */}
      {filteredNFTs.length === 0 ? (
        <div className="cyber-card p-12 text-center space-y-4">
          <Image size={64} weight="duotone" className="mx-auto text-muted-foreground opacity-50" />
          <h3 className="text-xl font-bold uppercase tracking-wider text-muted-foreground">
            No NFTs Match Filters
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Try adjusting your search criteria or filters.
          </p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="legendary">Legendary</TabsTrigger>
            <TabsTrigger value="epic">Epic</TabsTrigger>
            <TabsTrigger value="rare">Rare</TabsTrigger>
            <TabsTrigger value="uncommon">Uncommon</TabsTrigger>
            <TabsTrigger value="common">Common</TabsTrigger>
          </TabsList>

          {(['all', ...Object.keys(RARITY_TIERS)] as const).map(tab => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {(tab === 'all' ? filteredNFTs : nftsByRarity[tab as RarityTier]).map((nft) => (
                  <motion.div
                    key={nft.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="cyber-card p-3 space-y-2 group cursor-pointer hover:border-primary/50 transition-all relative"
                    style={{
                      borderColor: getRarityColor(nft.rarity),
                    }}
                  >
                    {/* Rarity Badge */}
                    <div className="absolute top-2 right-2 z-10">
                      <Badge
                        className="text-[10px] font-bold shadow-lg"
                        style={{
                          backgroundColor: getRarityColor(nft.rarity),
                          color: '#000',
                        }}
                      >
                        {getRarityIcon(nft.rarity)}
                      </Badge>
                    </div>

                    {/* NFT Image */}
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={nft.image}
                        alt={nft.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/512?text=Quantum+Falcon'
                        }}
                      />
                      {/* Rarity Glow Overlay */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                        style={{
                          background: `radial-gradient(circle, ${getRarityColor(nft.rarity)} 0%, transparent 70%)`,
                        }}
                      />
                    </div>

                    {/* NFT Info */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-xs uppercase tracking-wider truncate">
                        {nft.name}
                      </h4>
                      {nft.season && (
                        <Badge variant="outline" className="text-[8px]">
                          {SEASONS[nft.season].name}
                        </Badge>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        Edition #{nft.edition}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
