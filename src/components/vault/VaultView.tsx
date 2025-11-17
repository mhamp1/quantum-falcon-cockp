import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Vault, ArrowDown, ArrowUp, Coins } from '@phosphor-icons/react';
import { toast } from 'sonner';

export default function VaultView() {
  const [vaultBalance] = useKV<number>('vault-balance', 0.05432);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');

  const handleDeposit = () => {
    toast.success('Deposit successful', {
      description: `${depositAmount} BTC added to vault`,
    });
    setDepositAmount('');
  };

  const handleWithdraw = () => {
    toast.success('Withdrawal initiated', {
      description: `Processing withdrawal to ${withdrawAddress}`,
    });
    setWithdrawAddress('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b-2 border-primary/30">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-wider text-accent">
            BTC Vault
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
            ◆ Secure Profit Storage
          </p>
        </div>
      </div>

      <Card className="p-8 bg-card/50 border-2 border-accent/30 shadow-[0_0_40px_rgba(255,200,0,0.3)]">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Vault size={64} weight="duotone" className="text-accent" />
          </div>
          
          <div>
            <p className="text-sm uppercase tracking-wider text-muted-foreground mb-2">
              Total Balance
            </p>
            <p className="text-5xl font-bold text-accent tabular-nums">
              {(vaultBalance || 0).toFixed(8)} BTC
            </p>
            <p className="text-muted-foreground mt-2">
              ≈ ${((vaultBalance || 0) * 43234).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <div className="text-center">
              <p className="text-xs uppercase text-muted-foreground">Total Deposits</p>
              <p className="text-lg font-bold text-primary">12</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase text-muted-foreground">Total Withdrawals</p>
              <p className="text-lg font-bold text-primary">3</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6 bg-card/50 border-2 border-primary/30">
          <div className="flex items-center gap-3 mb-4">
            <ArrowDown size={24} weight="duotone" className="text-primary" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-primary">
              Deposit BTC
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="deposit-amount" className="text-xs uppercase tracking-wider text-muted-foreground">
                Amount (BTC)
              </Label>
              <Input
                id="deposit-amount"
                type="number"
                step="0.00000001"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00000000"
                className="mt-2 bg-muted/20 border-2 border-primary/30 focus:border-primary font-mono"
              />
            </div>

            <Button
              onClick={handleDeposit}
              className="w-full bg-primary/20 border-2 border-primary text-primary hover:bg-primary/30 shadow-[0_0_20px_rgba(0,255,255,0.3)]"
            >
              <ArrowDown weight="duotone" size={20} />
              Deposit to Vault
            </Button>
          </div>
        </Card>

        <Card className="p-6 bg-card/50 border-2 border-destructive/30">
          <div className="flex items-center gap-3 mb-4">
            <ArrowUp size={24} weight="duotone" className="text-destructive" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-destructive">
              Withdraw BTC
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="withdraw-address" className="text-xs uppercase tracking-wider text-muted-foreground">
                Withdrawal Address
              </Label>
              <Input
                id="withdraw-address"
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder="bc1q..."
                className="mt-2 bg-muted/20 border-2 border-destructive/30 focus:border-destructive font-mono text-xs"
              />
            </div>

            <Button
              onClick={handleWithdraw}
              className="w-full bg-destructive/20 border-2 border-destructive text-destructive hover:bg-destructive/30"
            >
              <ArrowUp weight="duotone" size={20} />
              Withdraw from Vault
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-card/50 border-2 border-primary/30">
        <div className="flex items-center gap-3 mb-4">
          <Coins size={24} weight="duotone" className="text-accent" />
          <h2 className="text-xl font-bold uppercase tracking-wider text-accent">
            Transaction History
          </h2>
        </div>

        <div className="space-y-2">
          {[
            { type: 'Deposit', amount: '+0.00123', date: '2024-01-15 14:23', tx: '7a8f9...3d2e' },
            { type: 'Withdrawal', amount: '-0.00050', date: '2024-01-14 09:15', tx: '4b2c1...8f7a' },
            { type: 'Deposit', amount: '+0.00234', date: '2024-01-13 16:45', tx: '9e3d2...1c4b' },
            { type: 'Deposit', amount: '+0.00189', date: '2024-01-12 11:30', tx: '2f8a7...6d9e' },
          ].map((tx, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-muted/20 border border-primary/20"
            >
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 ${tx.type === 'Deposit' ? 'bg-primary' : 'bg-destructive'}`} />
                <div>
                  <p className="font-bold">{tx.type}</p>
                  <p className="text-xs text-muted-foreground font-mono">{tx.tx}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold font-mono ${tx.type === 'Deposit' ? 'text-primary' : 'text-destructive'}`}>
                  {tx.amount} BTC
                </p>
                <p className="text-xs text-muted-foreground">{tx.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
