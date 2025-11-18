import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CreditCard,
  CurrencyCircleDollar,
  Lock,
  CheckCircle,
  Warning,
  Spinner,
  Lightning
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import {
  createCheckoutSession,
  processPayment,
  formatPrice,
  type CheckoutItem,
  type CheckoutSession,
  type PaymentMethod
} from '@/lib/checkout'

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: CheckoutItem | null
  onSuccess?: () => void
}

export default function CheckoutDialog({
  open,
  onOpenChange,
  item,
  onSuccess
}: CheckoutDialogProps) {
  const [session, setSession] = useState<CheckoutSession | null>(null)
  const [processing, setProcessing] = useState(false)
  const [paymentTab, setPaymentTab] = useState<'card' | 'crypto'>('card')
  
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardName, setCardName] = useState('')
  
  const [cryptoWallet, setCryptoWallet] = useState('')
  
  const [purchaseHistory, setPurchaseHistory] = useKV<CheckoutSession[]>('purchase-history', [])

  const handleOpenChange = (newOpen: boolean) => {
    if (!processing) {
      onOpenChange(newOpen)
      if (!newOpen) {
        resetForm()
      }
    }
  }

  const resetForm = () => {
    setSession(null)
    setProcessing(false)
    setCardNumber('')
    setCardExpiry('')
    setCardCvc('')
    setCardName('')
    setCryptoWallet('')
    setPaymentTab('card')
  }

  const handleInitiateCheckout = async () => {
    if (!item) return
    
    const newSession = await createCheckoutSession(item)
    setSession(newSession)
  }

  const handleProcessPayment = async () => {
    if (!session) return
    
    setProcessing(true)
    
    let paymentMethod: PaymentMethod
    
    if (paymentTab === 'card') {
      if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
        toast.error('Missing Information', {
          description: 'Please fill in all card details'
        })
        setProcessing(false)
        return
      }
      
      paymentMethod = {
        id: `card_${Date.now()}`,
        type: 'card',
        last4: cardNumber.slice(-4),
        brand: 'Visa'
      }
    } else {
      if (!cryptoWallet) {
        toast.error('Missing Wallet', {
          description: 'Please enter your wallet address'
        })
        setProcessing(false)
        return
      }
      
      paymentMethod = {
        id: `crypto_${Date.now()}`,
        type: 'crypto',
        wallet: cryptoWallet
      }
    }

    const result = await processPayment(session, paymentMethod)
    
    if (result.success) {
      setPurchaseHistory((current) => [...(current || []), session])
      
      toast.success('Purchase Complete!', {
        description: `${item?.name} has been activated`,
        icon: '✓'
      })
      
      setTimeout(() => {
        onSuccess?.()
        handleOpenChange(false)
      }, 1000)
    } else {
      toast.error('Payment Failed', {
        description: result.error || 'An error occurred'
      })
      setProcessing(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '')
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned
    return formatted.slice(0, 19)
  }

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  }

  if (!item) return null

  if (!session) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="cyber-card border-2 border-primary max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <Lightning size={24} weight="fill" />
              Confirm Purchase
            </DialogTitle>
            <DialogDescription className="text-xs uppercase tracking-wide text-muted-foreground">
              Review your order details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="cyber-card-accent p-4 space-y-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Item</div>
                <div className="text-lg font-bold text-foreground">{item.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.description}</div>
              </div>
              
              {item.duration && (
                <div className="flex items-center justify-between text-xs border-t border-border/50 pt-2">
                  <span className="text-muted-foreground uppercase tracking-wide">Duration</span>
                  <span className="font-bold text-primary">{item.duration}h</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm border-t border-border/50 pt-2">
                <span className="text-muted-foreground uppercase tracking-wide">Price</span>
                <span className="text-2xl font-bold text-accent">{formatPrice(item.price)}</span>
              </div>
            </div>
            
            <Button
              onClick={handleInitiateCheckout}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary 
                       shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.4)] hover:shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.6)]
                       transition-all jagged-corner uppercase tracking-wider font-bold py-6"
            >
              <CheckCircle size={20} weight="fill" className="mr-2" />
              Proceed to Payment
            </Button>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
              <Lock size={12} />
              <span>Secure checkout powered by Quantum Falcon</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="cyber-card border-2 border-primary max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <CreditCard size={24} weight="fill" />
            Payment Details
          </DialogTitle>
          <DialogDescription className="text-xs uppercase tracking-wide text-muted-foreground">
            Complete your purchase securely
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 px-6 overflow-y-auto flex-1 scrollbar-thin">
          <div className="cyber-card p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground uppercase tracking-wide">Subtotal</span>
              <span className="font-bold">{formatPrice(session.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground uppercase tracking-wide">Tax (8.75%)</span>
              <span className="font-bold">{formatPrice(session.tax)}</span>
            </div>
            <div className="flex items-center justify-between text-sm border-t border-border/50 pt-2">
              <span className="text-foreground uppercase tracking-wide font-bold">Total</span>
              <span className="text-xl font-bold text-accent">{formatPrice(session.total)}</span>
            </div>
          </div>
          
          <Tabs value={paymentTab} onValueChange={(val) => setPaymentTab(val as 'card' | 'crypto')}>
            <TabsList className="grid w-full grid-cols-2 bg-muted/20">
              <TabsTrigger value="card" className="uppercase tracking-wider text-xs font-bold">
                <CreditCard size={16} className="mr-2" />
                Card
              </TabsTrigger>
              <TabsTrigger value="crypto" className="uppercase tracking-wider text-xs font-bold">
                <CurrencyCircleDollar size={16} className="mr-2" />
                Crypto
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="card" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="card-name" className="text-xs uppercase tracking-wider font-bold">
                  Cardholder Name
                </Label>
                <Input
                  id="card-name"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="bg-background/50 border-primary/50 focus:border-primary"
                  disabled={processing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="card-number" className="text-xs uppercase tracking-wider font-bold">
                  Card Number
                </Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  className="bg-background/50 border-primary/50 focus:border-primary"
                  disabled={processing}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="card-expiry" className="text-xs uppercase tracking-wider font-bold">
                    Expiry
                  </Label>
                  <Input
                    id="card-expiry"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    className="bg-background/50 border-primary/50 focus:border-primary"
                    disabled={processing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="card-cvc" className="text-xs uppercase tracking-wider font-bold">
                    CVC
                  </Label>
                  <Input
                    id="card-cvc"
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    className="bg-background/50 border-primary/50 focus:border-primary"
                    disabled={processing}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="crypto" className="space-y-4 mt-4">
              <div className="cyber-card-accent p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs text-accent">
                  <Warning size={16} weight="fill" />
                  <span className="font-bold uppercase tracking-wider">Crypto Payment</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Send exactly {formatPrice(session.total)} worth of USDT, USDC, or SOL to the wallet address below.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="crypto-wallet" className="text-xs uppercase tracking-wider font-bold">
                  Your Wallet Address
                </Label>
                <Input
                  id="crypto-wallet"
                  placeholder="0x... or wallet address"
                  value={cryptoWallet}
                  onChange={(e) => setCryptoWallet(e.target.value)}
                  className="bg-background/50 border-accent/50 focus:border-accent font-mono text-xs"
                  disabled={processing}
                />
              </div>
              
              <div className="cyber-card p-3">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                  Payment Address
                </div>
                <div className="text-xs font-mono text-primary break-all">
                  QF7x9vK2pL4nM8wT3hR6sG1qA5dF8jK0mP2zX4cV7bN9
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="px-6 pb-6 pt-4 border-t border-primary/30 space-y-4 flex-shrink-0">
          <Button
            onClick={handleProcessPayment}
            disabled={processing}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 border-2 border-accent 
                     shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.4)] hover:shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.6)]
                     transition-all jagged-corner uppercase tracking-wider font-bold py-6"
          >
            {processing ? (
              <>
                <Spinner size={20} className="mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock size={20} weight="fill" className="mr-2" />
                Complete Purchase {formatPrice(session.total)}
              </>
            )}
          </Button>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
            <Lock size={12} />
            <span>Encrypted & secure • Your data is protected</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
