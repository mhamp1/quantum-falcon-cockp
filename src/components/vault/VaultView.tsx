import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Vault, ArrowUp, TrendUp } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface VaultTransaction {
  id: string
  type: 'deposit' | 'withdrawal'
  amount: number
  timestamp: number
}

export default function VaultView() {
  const [btcBalance, setBtcBalance] = useKV<number>('btc-vault-balance', 0.00234)
  const [transactions, setTransactions] = useKV<VaultTransaction[]>('vault-transactions', [])
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('')

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount)
    
    if (!amount || amount <= 0) {
      toast.error('Invalid amount', { description: 'Please enter a valid withdrawal amount' })
      return
    }

    if (!btcBalance || amount > btcBalance) {
      toast.error('Insufficient balance', { description: 'Amount exceeds available BTC' })
      return
    }

    if (!withdrawAddress || withdrawAddress.length < 26) {
      toast.error('Invalid address', { description: 'Please enter a valid BTC address' })
      return
    }

    setBtcBalance((current) => (current || 0) - amount)
    
    const newTransaction: VaultTransaction = {
      id: Date.now().toString(),
      type: 'withdrawal',
      amount,
      timestamp: Date.now()
    }

    setTransactions((current) => {
      if (!current) return [newTransaction]
      return [newTransaction, ...current].slice(0, 50)
    })

    toast.success('Withdrawal initiated', { 
      description: `${amount} BTC sent to ${withdrawAddress.slice(0, 8)}...${withdrawAddress.slice(-8)}`
    })
    
    setWithdrawAmount('')
    setWithdrawAddress('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-[0.2em] uppercase hud-text">
          <span className="text-primary neon-glow">BTC VAULT</span>
        </h2>
        <p className="text-muted-foreground uppercase tracking-wide text-sm mt-2">
          SECURE STORAGE FOR AUTOMATED PROFIT CONVERSIONS
        </p>
      </div>

      <div className="holographic-card relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent" />
        <div className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] hud-text mb-3">
                TOTAL BALANCE
              </p>
              <p className="text-5xl font-bold text-secondary neon-glow-secondary hud-value mb-2">
                {btcBalance?.toFixed(6) || '0.000000'}
                <span className="text-xl ml-2">BTC</span>
              </p>
              <p className="text-muted-foreground uppercase tracking-wide text-sm">
                ≈ ${((btcBalance || 0) * 45000).toFixed(2)} USD
              </p>
            </div>
            <div className="p-4 jagged-corner bg-secondary/30 border-2 border-secondary neon-glow-secondary">
              <Vault size={48} weight="duotone" className="text-secondary" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="holographic-card">
          <div className="p-6 relative z-10">
            <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] hud-text mb-3">24H DEPOSITS</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-secondary neon-glow-secondary hud-value">+0.00012</p>
              <TrendUp size={24} weight="duotone" className="text-secondary" />
            </div>
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">FROM 7 PROFITABLE TRADES</p>
          </div>
        </div>

        <div className="holographic-card">
          <div className="p-6 relative z-10">
            <p className="text-xs text-muted-foreground uppercase tracking-[0.15em] hud-text mb-3">TOTAL GAINS</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-secondary neon-glow-secondary hud-value">+47.3%</p>
              <TrendUp size={24} weight="duotone" className="text-secondary" />
            </div>
            <p className="text-xs text-muted-foreground mt-2 uppercase tracking-wide">SINCE VAULT CREATION</p>
          </div>
        </div>
      </div>

      <div className="holographic-card">
        <div className="p-6 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 jagged-corner-small bg-primary/30 border border-primary">
              <ArrowUp size={24} weight="duotone" className="text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase tracking-[0.15em] text-primary hud-text">WITHDRAW BTC</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                SEND BTC FROM YOUR VAULT TO AN EXTERNAL WALLET
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount" className="uppercase tracking-wide text-xs font-bold">Amount (BTC)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                step="0.000001"
                placeholder="0.000000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="bg-muted/50 border-2 border-primary/50 focus:border-primary jagged-corner-small"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="withdraw-address" className="uppercase tracking-wide text-xs font-bold">Destination Address</Label>
              <Input
                id="withdraw-address"
                type="text"
                placeholder="bc1q..."
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                className="bg-muted/50 border-2 border-primary/50 focus:border-primary jagged-corner-small font-mono text-sm"
              />
            </div>
            <Button 
              onClick={handleWithdraw}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground jagged-corner border-2 border-primary neon-glow uppercase tracking-[0.15em] font-bold"
            >
              <ArrowUp size={20} weight="bold" className="mr-2" />
              Initiate Withdrawal
            </Button>
          </div>
        </div>
      </div>

      <div className="holographic-card scan-line-effect">
        <div className="p-6 relative z-10">
          <h3 className="text-xl font-bold uppercase tracking-[0.15em] text-primary hud-text mb-6">TRANSACTION HISTORY</h3>
          {!transactions || transactions.length === 0 ? (
            <p className="text-center text-muted-foreground uppercase tracking-wide py-8">NO TRANSACTIONS YET</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 jagged-corner bg-muted/30 border-2 border-primary/30 hover:border-primary/60 transition-all">
                  <div className="flex items-center gap-3">
                    {tx.type === 'deposit' ? (
                      <div className="w-10 h-10 jagged-corner-small bg-secondary/30 border-2 border-secondary flex items-center justify-center">
                        <TrendUp size={18} weight="duotone" className="text-secondary" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 jagged-corner-small bg-destructive/30 border-2 border-destructive flex items-center justify-center">
                        <ArrowUp size={18} weight="duotone" className="text-destructive" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold uppercase tracking-wide">{tx.type}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {new Date(tx.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold hud-value ${tx.type === 'deposit' ? 'text-secondary neon-glow-secondary' : 'text-destructive neon-glow-destructive'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toFixed(6)} BTC
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}