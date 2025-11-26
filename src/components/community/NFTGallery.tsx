// NFT Gallery Component — Display AI-Generated NFT Collection (Payment-Based, No Wallet)
// November 22, 2025 — Quantum Falcon Cockpit

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Image, Sparkle, Crown, MagnifyingGlass, 
  FunnelSimple, Rocket, Trophy, Medal, ShoppingCart
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { RARITY_TIERS, type RarityTier } from '@/lib/nft/AutoNFTGenerator'
import { isGodMode } from '@/lib/godMode'
import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { UserAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import NFTGenerator from './NFTGenerator'
import NFTPurchaseDialog from './NFTPurchaseDialog'

interface NFTItem {
  id: string
  name: string
  image: string
  rarity: RarityTier
  edition: number
  metadataUri: string
  price: number
  available: boolean
  season?: string
}

export default function NFTGallery() {
  const [auth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })

  const [nfts, setNfts] = useKV<NFTItem[]>('nft-collection', [])
  const [ownedNFTs, setOwnedNFTs] = useKV<string[]>('owned-nfts', [])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRarity, setSelectedRarity] = useState<RarityTier | 'all'>('all')
  const [ownedOnly, setOwnedOnly] = useState(false)
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)

  const isGod = isGodMode(auth)

  // Filter NFTs
  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         nft.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRarity = selectedRarity === 'all' || nft.rarity === selectedRarity
    const matchesOwned = !ownedOnly || ownedNFTs.includes(nft.id)
    const matchesAvailable = nft.available
    return matchesSearch && matchesRarity && matchesOwned && matchesAvailable
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

  const handlePurchase = (nft: NFTItem) => {
    // Even master key holders must purchase
    setSelectedNFT(nft)
    setShowPurchaseDialog(true)
  }

  const handlePurchaseComplete = (nftId: string) => {
    setOwnedNFTs(prev => [...prev, nftId])
    setShowPurchaseDialog(false)
    setSelectedNFT(null)
    toast.success('NFT Purchased!', {
      description: 'Your NFT has been added to your collection',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image size={32} className="text-primary" weight="duotone" />
          <div>
            <h2 className="text-3xl font-bold uppercase tracking-wider text-secondary">
              Quantum Falcon Genesis
            </h2>
            <p className="text-sm text-muted-foreground">
              AI-Generated NFT Collection • {nfts.length} Total • {ownedNFTs.length} Owned
            </p>
          </div>
        </div>
        
        {isGod && (
          <Button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-nft-generator'))
            }}
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <Rocket size={16} weight="fill" className="mr-2" />
            Generate Collection
          </Button>
        )}
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

          {/* Owned Only Toggle */}
          <Button
            variant={ownedOnly ? "default" : "outline"}
            onClick={() => setOwnedOnly(!ownedOnly)}
            size="sm"
          >
            <Image size={16} className="mr-2" />
            My NFTs ({ownedNFTs.length})
          </Button>
        </div>

        {/* Rarity Stats */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
          {Object.entries(nftsByRarity).map(([rarity, items]) => (
            <Badge
              key={rarity}
              variant="outline"
              className="text-xs"
              style={{
                borderColor: RARITY_TIERS[rarity as RarityTier].color,
                color: RARITY_TIERS[rarity as RarityTier].color,
              }}
            >
              {RARITY_TIERS[rarity as RarityTier].name}: {items.length}
            </Badge>
          ))}
        </div>
      </div>

      {/* NFT Grid */}
      {filteredNFTs.length === 0 ? (
        <div className="cyber-card p-12 text-center space-y-4">
          <Image size={64} weight="duotone" className="mx-auto text-muted-foreground opacity-50" />
          <h3 className="text-xl font-bold uppercase tracking-wider text-muted-foreground">
            No NFTs Found
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {nfts.length === 0 
              ? 'Collection not yet generated. Generate the Genesis collection to start.'
              : 'No NFTs match your filters. Try adjusting your search criteria.'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {(tab === 'all' ? filteredNFTs : nftsByRarity[tab as RarityTier]).map((nft) => {
                  const isOwned = ownedNFTs.includes(nft.id)
                  
                  return (
                    <motion.div
                      key={nft.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="cyber-card p-4 space-y-3 group cursor-pointer hover:border-primary/50 transition-all relative"
                      style={{
                        borderColor: getRarityColor(nft.rarity),
                      }}
                    >
                      {/* Owned Badge */}
                      {isOwned && (
                        <div className="absolute top-2 left-2 z-10">
                          <Badge className="bg-accent text-black font-bold">
                            OWNED
                          </Badge>
                        </div>
                      )}

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
                        <div className="absolute top-2 right-2">
                          <Badge
                            className="text-xs font-bold"
                            style={{
                              backgroundColor: getRarityColor(nft.rarity),
                              color: '#000',
                            }}
                          >
                            {getRarityIcon(nft.rarity)}
                            <span className="ml-1">{RARITY_TIERS[nft.rarity].name}</span>
                          </Badge>
                        </div>
                      </div>

                      {/* NFT Info */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm uppercase tracking-wider truncate">
                          {nft.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Edition #{nft.edition}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-lg font-bold text-primary">
                            ${nft.price}
                          </span>
                          {!isOwned && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handlePurchase(nft)
                              }}
                              className="bg-accent hover:bg-accent/90"
                            >
                              <ShoppingCart size={14} className="mr-1" />
                              Buy
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* NFT Generator Dialog */}
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold uppercase tracking-wider">
              Generate NFT Collection
            </DialogTitle>
          </DialogHeader>
          <NFTGenerator onClose={() => {}} />
        </DialogContent>
      </Dialog>

      {/* Purchase Dialog */}
      {selectedNFT && (
        <NFTPurchaseDialog
          nft={selectedNFT}
          open={showPurchaseDialog}
          onOpenChange={setShowPurchaseDialog}
          onComplete={handlePurchaseComplete}
        />
      )}
    </div>
  )
}
