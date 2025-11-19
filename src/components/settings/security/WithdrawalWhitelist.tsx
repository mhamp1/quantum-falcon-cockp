import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Plus, Trash, CheckCircle, Warning, Copy } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { SecurityAuditLogger, SecurityEventType, SecuritySeverity } from '@/lib/security';

interface WithdrawalAddress {
  id: string;
  label: string;
  address: string;
  network: string;
  added: number;
  verified: boolean;
}

interface WithdrawalWhitelistProps {
  settings: any;
  onUpdate: (section: string, key: string, value: any) => void;
}

export default function WithdrawalWhitelist({ settings, onUpdate }: WithdrawalWhitelistProps) {
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newNetwork, setNewNetwork] = useState('BTC');
  const [addresses, setAddresses] = useState<WithdrawalAddress[]>(settings.security.withdrawalWhitelist || []);
  const [withdrawalWhitelistEnabled, setWithdrawalWhitelistEnabled] = useState(settings.security.withdrawalWhitelistEnabled || false);

  const isValidAddress = (address: string, network: string): boolean => {
    const patterns: Record<string, RegExp> = {
      BTC: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
      ETH: /^0x[a-fA-F0-9]{40}$/,
      SOL: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
      USDT: /^(0x[a-fA-F0-9]{40}|T[A-Za-z1-9]{33})$/,
    };
    
    return patterns[network]?.test(address) || false;
  };

  const handleAddAddress = () => {
    if (!newLabel.trim()) {
      toast.error('Please enter a label for this address');
      return;
    }

    if (!newAddress.trim()) {
      toast.error('Please enter a withdrawal address');
      return;
    }

    if (!isValidAddress(newAddress.trim(), newNetwork)) {
      toast.error(`Invalid ${newNetwork} address format`);
      return;
    }

    if (addresses.some(a => a.address === newAddress.trim())) {
      toast.error('This address is already whitelisted');
      return;
    }

    const newWithdrawalAddress: WithdrawalAddress = {
      id: crypto.randomUUID(),
      label: newLabel.trim(),
      address: newAddress.trim(),
      network: newNetwork,
      added: Date.now(),
      verified: false,
    };

    const updatedAddresses = [...addresses, newWithdrawalAddress];
    setAddresses(updatedAddresses);
    onUpdate('security', 'withdrawalWhitelist', updatedAddresses);

    SecurityAuditLogger.logEvent(
      SecurityEventType.SENSITIVE_DATA_ACCESS,
      SecuritySeverity.CRITICAL,
      { 
        action: 'withdrawal-address-added',
        addressId: newWithdrawalAddress.id,
        label: newLabel,
        network: newNetwork,
        userId: 'current-user'
      },
      'current-user'
    );

    toast.success(`Withdrawal address "${newLabel}" added - check email to verify`);
    setNewLabel('');
    setNewAddress('');
  };

  const handleRemoveAddress = (addressId: string) => {
    const address = addresses.find(a => a.id === addressId);
    if (!address) return;

    const updatedAddresses = addresses.filter(a => a.id !== addressId);
    setAddresses(updatedAddresses);
    onUpdate('security', 'withdrawalWhitelist', updatedAddresses);

    SecurityAuditLogger.logEvent(
      SecurityEventType.SENSITIVE_DATA_ACCESS,
      SecuritySeverity.CRITICAL,
      { 
        action: 'withdrawal-address-removed',
        addressId,
        label: address.label,
        network: address.network,
        userId: 'current-user'
      },
      'current-user'
    );

    toast.success(`Withdrawal address "${address.label}" removed`);
  };

  const handleToggleWhitelist = (enabled: boolean) => {
    setWithdrawalWhitelistEnabled(enabled);
    onUpdate('security', 'withdrawalWhitelistEnabled', enabled);

    SecurityAuditLogger.logEvent(
      SecurityEventType.SENSITIVE_DATA_ACCESS,
      enabled ? SecuritySeverity.CRITICAL : SecuritySeverity.WARNING,
      { action: 'withdrawal-whitelist-toggled', enabled, userId: 'current-user' },
      'current-user'
    );

    toast.success(`Withdrawal Whitelisting ${enabled ? 'enabled' : 'disabled'}`);
  };

  const maskAddress = (address: string) => {
    if (address.length <= 10) return address;
    return address.slice(0, 6) + '...' + address.slice(-4);
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <Card className="cyber-card p-6">
      <h3 className="text-xl font-bold uppercase tracking-tight mb-6 flex items-center gap-2">
        <CreditCard size={24} />
        Withdrawal Address Whitelist
      </h3>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
          <div>
            <Label className="text-base font-semibold">Enable Withdrawal Whitelist</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Only allow withdrawals to pre-approved addresses
            </p>
          </div>
          <Switch
            checked={withdrawalWhitelistEnabled}
            onCheckedChange={handleToggleWhitelist}
          />
        </div>

        {withdrawalWhitelistEnabled && (
          <>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <Label>Network</Label>
                  <Select value={newNetwork} onValueChange={setNewNetwork}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                      <SelectItem value="SOL">Solana (SOL)</SelectItem>
                      <SelectItem value="USDT">Tether (USDT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label>Label / Name</Label>
                  <Input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="e.g., Hardware Wallet, Exchange Account"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>Withdrawal Address</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Enter wallet address"
                    className="flex-1 font-mono text-sm"
                  />
                  <Button onClick={handleAddAddress}>
                    <Plus size={18} className="mr-2" />
                    Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Double-check the address - withdrawals to wrong addresses cannot be reversed
                </p>
              </div>
            </div>

            {addresses.length > 0 ? (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Whitelisted Addresses ({addresses.length})</Label>
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-4 bg-primary/5 rounded-lg border border-primary/20"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-base">{addr.label}</h4>
                          <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
                            {addr.network}
                          </Badge>
                          {addr.verified ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                              <CheckCircle size={12} weight="fill" className="mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                              <Warning size={12} weight="fill" className="mr-1" />
                              Pending
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
                          <span>{maskAddress(addr.address)}</span>
                          <button
                            onClick={() => copyToClipboard(addr.address, 'Address')}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleRemoveAddress(addr.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash size={18} />
                      </Button>
                    </div>
                    {!addr.verified && (
                      <div className="mt-2 pt-2 border-t border-yellow-500/20">
                        <p className="text-xs text-yellow-400 flex items-center gap-1">
                          <Warning size={14} />
                          Check your email to verify this address before withdrawing
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-primary/20 rounded-lg">
                <CreditCard size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">No Addresses Whitelisted</p>
                <p className="text-xs mt-1">Add your first withdrawal address</p>
              </div>
            )}

            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <div className="flex items-start gap-3">
                <Warning size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-red-400">Critical Security Feature:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>New addresses require email verification and 24-hour waiting period</li>
                    <li>Double-check addresses before adding - blockchain transactions are irreversible</li>
                    <li>This protects against account compromise and phishing attacks</li>
                    <li>To withdraw to a new address, you must disable whitelist (requires 2FA)</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
