import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
        <h2 className="text-3xl font-bold tracking-wider uppercase mb-2">
          BTC Vault
        </h2>
        <p className="text-muted-foreground">
          Secure storage for automated profit conversions
        </p>
      </div>

      <Card className="backdrop-blur-md bg-card/50 border-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Total Balance
              </CardTitle>
              <p className="text-5xl font-bold text-secondary mb-2">
                {btcBalance?.toFixed(6) || '0.000000'}
                <span className="text-xl ml-2">BTC</span>
              </p>
              <p className="text-muted-foreground">
                ≈ ${((btcBalance || 0) * 45000).toFixed(2)} USD
              </p>
            </div>
            <div className="p-4 rounded-full bg-secondary/20 border border-secondary/30">
              <Vault size={48} weight="duotone" className="text-secondary" />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="backdrop-blur-md bg-card/50 border-primary/30">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide">24h Deposits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-accent">+0.00012</p>
              <TrendUp size={24} weight="duotone" className="text-accent" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">From 7 profitable trades</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-md bg-card/50 border-primary/30">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide">Total Gains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-accent">+47.3%</p>
              <TrendUp size={24} weight="duotone" className="text-accent" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Since vault creation</p>
          </CardContent>
        </Card>
      </div>

      <Card className="backdrop-blur-md bg-card/50 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUp size={24} weight="duotone" className="text-primary" />
            Withdraw BTC
          </CardTitle>
          <CardDescription>
            Send BTC from your vault to an external wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Amount (BTC)</Label>
            <Input
              id="withdraw-amount"
              type="number"
              step="0.000001"
              placeholder="0.000000"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="bg-muted/50 border-border focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="withdraw-address">Destination Address</Label>
            <Input
              id="withdraw-address"
              type="text"
              placeholder="bc1q..."
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
              className="bg-muted/50 border-border focus:border-primary font-mono text-sm"
            />
          </div>
          <Button 
            onClick={handleWithdraw}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <ArrowUp size={20} weight="bold" className="mr-2" />
            Initiate Withdrawal
          </Button>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-md bg-card/50 border-primary/30">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    {tx.type === 'deposit' ? (
                      <div className="p-2 rounded-full bg-accent/20 border border-accent/30">
                        <TrendUp size={16} weight="duotone" className="text-accent" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-full bg-destructive/20 border border-destructive/30">
                        <ArrowUp size={16} weight="duotone" className="text-destructive" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold capitalize">{tx.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className={`text-sm font-semibold ${tx.type === 'deposit' ? 'text-accent' : 'text-destructive'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toFixed(6)} BTC
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}