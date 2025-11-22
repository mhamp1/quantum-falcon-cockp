// NFT Gallery Component — Display AI-Generated NFT Collection
// November 22, 2025 — Quantum Falcon Cockpit

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Image, Sparkle, Crown, Fire, MagnifyingGlass, 
  FunnelSimple, Wallet, Rocket, Trophy, Medal
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { RARITY_TIERS, type RarityTier } from '@/lib/nft/AutoNFTGenerator'
import { isGodMode } from '@/lib/godMode'
import { useKV } from '@github/spark/hooks'
import { UserAuth } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import NFTGenerator from './NFTGenerator'
import NFTLegalDisclaimer from '@/components/shared/NFTLegalDisclaimer'

interface NFTItem {
  mint: string
  name: string
  image: string
  rarity: RarityTier
  edition: number
  metadataUri: string
  owner?: string
}

export default function NFTGallery() {
  const wallet = useWallet()
  const [auth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })

  const [nfts, setNfts] = useState<NFTItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRarity, setSelectedRarity] = useState<RarityTier | 'all'>('all')
  const [ownedOnly, setOwnedOnly] = useState(false)

  const isGod = isGodMode(auth)
  const [showGenerator, setShowGenerator] = useState(false)

  // Listen for generator open event
  useEffect(() => {
    const handleOpenGenerator = () => setShowGenerator(true)
    window.addEventListener('open-nft-generator', handleOpenGenerator)
    return () => window.removeEventListener('open-nft-generator', handleOpenGenerator)
  }, [])

  // Filter NFTs
  const filteredNFTs = nfts.filter(nft => {
    const matchesSearch = nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         nft.mint.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRarity = selectedRarity === 'all' || nft.rarity === selectedRarity
    const matchesOwned = !ownedOnly || nft.owner === wallet.publicKey?.toString()
    return matchesSearch && matchesRarity && matchesOwned
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

  return (
    <div className="space-y-6">
      {/* Legal Disclaimer */}
      <NFTLegalDisclaimer variant="banner" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image size={32} className="text-primary" weight="duotone" />
          <div>
            <h2 className="text-3xl font-bold uppercase tracking-wider text-secondary">
              Quantum Falcon Genesis
            </h2>
            <p className="text-sm text-muted-foreground">
              AI-Generated NFT Collection • {nfts.length} Total
            </p>
          </div>
        </div>
        
        {isGod && (
          <Button
            onClick={() => setShowGenerator(true)}
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

          {/* Owned Only Toggle */}
          {wallet.connected && (
            <Button
              variant={ownedOnly ? "default" : "outline"}
              onClick={() => setOwnedOnly(!ownedOnly)}
              size="sm"
            >
              <Wallet size={16} className="mr-2" />
              My NFTs
            </Button>
          )}
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
              ? 'Collection not yet generated. Connect wallet and generate the Genesis collection.'
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
                {(tab === 'all' ? filteredNFTs : nftsByRarity[tab as RarityTier]).map((nft) => (
                  <motion.div
                    key={nft.mint}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="cyber-card p-4 space-y-3 group cursor-pointer hover:border-primary/50 transition-all"
                    style={{
                      borderColor: getRarityColor(nft.rarity),
                    }}
                  >
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
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm uppercase tracking-wider truncate">
                        {nft.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Edition #{nft.edition}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        {nft.mint.slice(0, 8)}...{nft.mint.slice(-8)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* NFT Generator Dialog */}
      <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold uppercase tracking-wider">
              Generate NFT Collection
            </DialogTitle>
          </DialogHeader>
          <NFTGenerator onClose={() => setShowGenerator(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

