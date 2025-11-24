// NFT Purchase Dialog — Payment-Based (No Wallet Required)
// November 22, 2025 — Quantum Falcon Cockpit

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Lock, CheckCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { RARITY_TIERS, type RarityTier } from '@/lib/nft/AutoNFTGenerator'
import { processPayment } from '@/lib/payment/paymentProcessor'

interface NFTItem {
  id: string
  name: string
  image: string
  rarity: RarityTier
  edition: number
  price: number
}

interface NFTPurchaseDialogProps {
  nft: NFTItem
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: (nftId: string) => void
}

export default function NFTPurchaseDialog({
  nft,
  open,
  onOpenChange,
  onComplete
}: NFTPurchaseDialogProps) {
  const [processing, setProcessing] = useState(false)

  const handlePurchase = async () => {
    setProcessing(true)
    
    try {
      // Process payment through existing payment system
      const result = await processPayment({
        itemId: nft.id,
        itemType: 'nft',
        amount: nft.price,
        description: `Purchase ${nft.name}`,
      })

      if (result.success) {
        onComplete(nft.id)
        toast.success('NFT Purchased Successfully!', {
          description: `${nft.name} is now in your collection`,
        })
      } else {
        throw new Error(result.error || 'Payment failed')
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      toast.error('Purchase Failed', {
        description: err.message,
      })
    } finally {
      setProcessing(false)
    }
  }

  const rarityColor = RARITY_TIERS[nft.rarity].color

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold uppercase tracking-wider">
            Purchase NFT
          </DialogTitle>
          <DialogDescription>
            Complete your purchase to add this NFT to your collection
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* NFT Preview */}
          <div className="cyber-card p-4 space-y-3" style={{ borderColor: rarityColor }}>
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={nft.image}
                alt={nft.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge
                  className="text-xs font-bold"
                  style={{
                    backgroundColor: rarityColor,
                    color: '#000',
                  }}
                >
                  {RARITY_TIERS[nft.rarity].name}
                </Badge>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg uppercase tracking-wider">
                {nft.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                Edition #{nft.edition}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="cyber-card-accent p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="text-2xl font-bold text-primary">
                ${nft.price}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Royalty</span>
              <span>7.77% to creator</span>
            </div>
          </div>

          {/* Purchase Button */}
          <Button
            onClick={handlePurchase}
            disabled={processing}
            className="w-full uppercase tracking-wider font-bold text-lg py-6 bg-gradient-to-r from-primary to-accent"
          >
            {processing ? (
              <>
                <Lock size={20} className="mr-2 animate-pulse" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard size={20} className="mr-2" />
                Purchase for ${nft.price}
              </>
            )}
          </Button>

          {/* Security Note */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Lock size={16} className="mt-0.5 flex-shrink-0" />
            <p>
              Secure payment processing. Your NFT will be added to your collection immediately after purchase.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

