import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Globe, Plus, Trash, CheckCircle, Warning } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { SecurityAuditLogger, SecurityEventType, SecuritySeverity } from '@/lib/security';

interface IPWhitelistManagerProps {
  settings: any;
  onUpdate: (section: string, key: string, value: any) => void;
}

export default function IPWhitelistManager({ settings, onUpdate }: IPWhitelistManagerProps) {
  const [newIP, setNewIP] = useState('');
  const [ipList, setIpList] = useState<string[]>(settings.security.ipWhitelist || []);
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(settings.security.ipWhitelistEnabled || false);

  const isValidIP = (ip: string): boolean => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    if (ipv4Regex.test(ip)) {
      return ip.split('.').every(octet => parseInt(octet) >= 0 && parseInt(octet) <= 255);
    }
    
    return ipv6Regex.test(ip);
  };

  const handleAddIP = () => {
    const trimmedIP = newIP.trim();
    
    if (!trimmedIP) {
      toast.error('Please enter an IP address');
      return;
    }

    if (!isValidIP(trimmedIP)) {
      toast.error('Invalid IP address format');
      return;
    }

    if (ipList.includes(trimmedIP)) {
      toast.error('IP address already in whitelist');
      return;
    }

    const updatedList = [...ipList, trimmedIP];
    setIpList(updatedList);
    onUpdate('security', 'ipWhitelist', updatedList);

    SecurityAuditLogger.logEvent(
      SecurityEventType.SENSITIVE_DATA_ACCESS,
      SecuritySeverity.INFO,
      { action: 'ip-whitelist-added', ip: trimmedIP, userId: 'current-user' },
      'current-user'
    );

    toast.success(`IP ${trimmedIP} added to whitelist`);
    setNewIP('');
  };

  const handleRemoveIP = (ip: string) => {
    const updatedList = ipList.filter(i => i !== ip);
    setIpList(updatedList);
    onUpdate('security', 'ipWhitelist', updatedList);

    SecurityAuditLogger.logEvent(
      SecurityEventType.SENSITIVE_DATA_ACCESS,
      SecuritySeverity.WARNING,
      { action: 'ip-whitelist-removed', ip, userId: 'current-user' },
      'current-user'
    );

    toast.success(`IP ${ip} removed from whitelist`);
  };

  const handleToggleWhitelist = (enabled: boolean) => {
    setIpWhitelistEnabled(enabled);
    onUpdate('security', 'ipWhitelistEnabled', enabled);

    SecurityAuditLogger.logEvent(
      SecurityEventType.SENSITIVE_DATA_ACCESS,
      enabled ? SecuritySeverity.INFO : SecuritySeverity.WARNING,
      { action: 'ip-whitelist-toggled', enabled, userId: 'current-user' },
      'current-user'
    );

    toast.success(`IP Whitelisting ${enabled ? 'enabled' : 'disabled'}`);
  };

  return (
    <Card className="cyber-card p-6">
      <h3 className="text-xl font-bold uppercase tracking-tight mb-6 flex items-center gap-2">
        <Globe size={24} />
        IP Whitelisting
      </h3>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
          <div>
            <Label className="text-base font-semibold">Enable IP Whitelisting</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Only allow logins and API access from approved IP addresses
            </p>
          </div>
          <Switch
            checked={ipWhitelistEnabled}
            onCheckedChange={handleToggleWhitelist}
          />
        </div>

        {ipWhitelistEnabled && (
          <>
            <div>
              <Label>Add IP Address</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                  placeholder="192.168.1.100 or 2001:0db8:85a3:0000:0000:8a2e:0370:7334"
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddIP()}
                />
                <Button onClick={handleAddIP}>
                  <Plus size={18} className="mr-2" />
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Supports both IPv4 and IPv6 addresses
              </p>
            </div>

            {ipList.length > 0 ? (
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Whitelisted IPs ({ipList.length})</Label>
                {ipList.map((ip) => (
                  <div
                    key={ip}
                    className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-400" weight="fill" />
                      <span className="font-mono text-sm">{ip}</span>
                    </div>
                    <Button
                      onClick={() => handleRemoveIP(ip)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash size={18} />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border border-dashed border-primary/20 rounded-lg">
                <Globe size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold">No IPs Whitelisted</p>
                <p className="text-xs mt-1">Add your current IP to start</p>
              </div>
            )}

            <div className="p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
              <div className="flex items-start gap-3">
                <Warning size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-yellow-400">Warning:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Enabling IP whitelisting may lock you out if your IP changes</li>
                    <li>Most home ISPs use dynamic IPs that change periodically</li>
                    <li>Always add a backup IP (office, VPN, etc.) before enabling</li>
                    <li>Support can help if you get locked out (email verification required)</li>
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
