// Profile NFT Gallery — Display User's NFT Collection with Rarity Badges
// November 22, 2025 — Quantum Falcon Cockpit

import { useState, useEffect } from 'react'
import { useWallet } from '@/hooks/useWallet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Image, Sparkle, Crown, Trophy, Medal, 
  MagnifyingGlass, FunnelSimple, Wallet, ExternalLink
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { RARITY_TIERS, type RarityTier } from '@/lib/nft/AutoNFTGenerator'
import { SEASONS, type SeasonKey } from '@/lib/nft/SeasonalFalconNFTGenerator'
import { cn } from '@/lib/utils'

interface NFTItem {
  mint: string
  name: string
  image: string
  rarity: RarityTier
  edition: number
  metadataUri: string
  season?: SeasonKey
  collection?: string
  owner?: string
}

export default function ProfileNFTGallery() {
  const wallet = useWallet()
  const [nfts, setNfts] = useState<NFTItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRarity, setSelectedRarity] = useState<RarityTier | 'all'>('all')
  const [selectedSeason, setSelectedSeason] = useState<SeasonKey | 'all'>('all')

  // Fetch user's NFTs (would connect to on-chain data or API)
  useEffect(() => {
    if (!wallet.connected || !wallet.publicKey) {
      setNfts([])
      return
    }

    setLoading(true)
    // TODO: Fetch NFTs from on-chain or API
    // For now, using placeholder - replace with actual fetch
    fetchUserNFTs(wallet.publicKey.toString())
      .then(setNfts)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [wallet.connected, wallet.publicKey])

  // Placeholder fetch function - replace with actual implementation
  async function fetchUserNFTs(address: string): Promise<NFTItem[]> {
    // TODO: Implement actual NFT fetching from Solana blockchain
    // This would use Metaplex DAS API or similar
    return []
  }

  // Filter NFTs
  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         nft.mint.toLowerCase().includes(searchQuery.toLowerCase())
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

  const totalValue = filteredNFTs.length
  const rarityCounts = {
    legendary: nftsByRarity.legendary.length,
    epic: nftsByRarity.epic.length,
    rare: nftsByRarity.rare.length,
    uncommon: nftsByRarity.uncommon.length,
    common: nftsByRarity.common.length,
  }

  if (!wallet.connected) {
    return (
      <div className="cyber-card p-8 text-center space-y-4">
        <Wallet size={48} weight="duotone" className="mx-auto text-muted-foreground opacity-50" />
        <h3 className="text-lg font-bold uppercase tracking-wider text-muted-foreground">
          Connect Wallet to View NFTs
        </h3>
        <p className="text-sm text-muted-foreground">
          Connect your Solana wallet to see your Quantum Falcon NFT collection
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="cyber-card p-4 text-center">
          <div className="text-2xl font-bold text-primary">{totalValue}</div>
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
              placeholder="Search by name or mint address..."
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
              onChange={(e) => setSelectedSeason(e.target.value as SeasonKey | 'all')}
              className="bg-background border border-border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Seasons</option>
              {Object.keys(SEASONS).map(season => (
                <option key={season} value={season}>
                  {SEASONS[season as SeasonKey].name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* NFT Grid */}
      {loading ? (
        <div className="cyber-card p-12 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground mt-4 uppercase tracking-wider">
            Loading NFTs...
          </p>
        </div>
      ) : filteredNFTs.length === 0 ? (
        <div className="cyber-card p-12 text-center space-y-4">
          <Image size={64} weight="duotone" className="mx-auto text-muted-foreground opacity-50" />
          <h3 className="text-xl font-bold uppercase tracking-wider text-muted-foreground">
            No NFTs Found
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {nfts.length === 0 
              ? 'You don\'t own any Quantum Falcon NFTs yet. Visit the Community tab to purchase.'
              : 'No NFTs match your filters. Try adjusting your search criteria.'}
          </p>
          <Button
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-tab', { detail: 'community' }))}
            variant="outline"
          >
            Browse Collection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredNFTs.map((nft) => (
            <motion.div
              key={nft.mint}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="cyber-card p-4 space-y-3 group cursor-pointer hover:border-primary/50 transition-all relative"
              style={{
                borderColor: getRarityColor(nft.rarity),
              }}
            >
              {/* Rarity Badge */}
              <div className="absolute top-2 right-2 z-10">
                <Badge
                  className="text-xs font-bold shadow-lg"
                  style={{
                    backgroundColor: getRarityColor(nft.rarity),
                    color: '#000',
                  }}
                >
                  {getRarityIcon(nft.rarity)}
                  <span className="ml-1">{RARITY_TIERS[nft.rarity].name}</span>
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
                <h4 className="font-bold text-sm uppercase tracking-wider truncate">
                  {nft.name}
                </h4>
                {nft.season && (
                  <Badge variant="outline" className="text-[10px]">
                    {SEASONS[nft.season].name}
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground">
                  Edition #{nft.edition}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono truncate">
                  {nft.mint.slice(0, 8)}...{nft.mint.slice(-8)}
                </p>
              </div>

              {/* View on Explorer */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  window.open(`https://solscan.io/token/${nft.mint}`, '_blank')
                }}
              >
                <ExternalLink size={12} className="mr-1" />
                View on Solscan
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

