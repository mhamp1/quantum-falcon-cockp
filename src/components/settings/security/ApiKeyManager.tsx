import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Key, Eye, EyeSlash, Trash, Plus, Copy, CheckCircle, Warning, Clock } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { SecureStorage, SecurityAuditLogger, SecurityEventType, SecuritySeverity, InputSanitizer } from '@/lib/security';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  created: number;
  lastUsed: number | null;
  permissions: string[];
}

export default function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showAddKey, setShowAddKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeySecret, setNewKeySecret] = useState('');
  const [showKeyValues, setShowKeyValues] = useState<Record<string, boolean>>({});
  const [showRevokeConfirm, setShowRevokeConfirm] = useState<string | null>(null);
  const [showRevokeAllConfirm, setShowRevokeAllConfirm] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const storedKeys = await SecureStorage.getItem('api-keys-list');
      if (storedKeys) {
        setApiKeys(storedKeys as ApiKey[]);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 4) + '••••••••••••' + key.slice(-4);
  };

  const handleAddApiKey = async () => {
    if (!newKeyName || !newKeyValue) {
      toast.error('Please provide key name and value');
      return;
    }

    const isValid = InputSanitizer.validateAPIKey(newKeyValue);
    if (!isValid) {
      SecurityAuditLogger.logEvent(
        SecurityEventType.API_KEY_VALIDATION_FAILED,
        SecuritySeverity.WARNING,
        { reason: 'invalid-format', keyName: newKeyName, userId: 'current-user' },
        'current-user'
      );
      toast.error('Invalid API key format');
      return;
    }

    const newKey: ApiKey = {
      id: crypto.randomUUID(),
      name: newKeyName,
      keyPreview: maskKey(newKeyValue),
      created: Date.now(),
      lastUsed: null,
      permissions: ['read', 'trade'],
    };

    await SecureStorage.setItem(`api-key-${newKey.id}`, newKeyValue, true);
    if (newKeySecret) {
      await SecureStorage.setItem(`api-secret-${newKey.id}`, newKeySecret, true);
    }

    const updatedKeys = [...apiKeys, newKey];
    setApiKeys(updatedKeys);
    await SecureStorage.setItem('api-keys-list', updatedKeys, true);

    SecurityAuditLogger.logEvent(
      SecurityEventType.SENSITIVE_DATA_ACCESS,
      SecuritySeverity.INFO,
      { action: 'api-key-added', keyId: newKey.id, keyName: newKeyName, userId: 'current-user' },
      'current-user'
    );

    toast.success('API key added and encrypted');
    setShowAddKey(false);
    setNewKeyName('');
    setNewKeyValue('');
    setNewKeySecret('');
  };

  const handleRevokeKey = async (keyId: string) => {
    const key = apiKeys.find(k => k.id === keyId);
    if (!key) return;

    await SecureStorage.deleteItem(`api-key-${keyId}`);
    await SecureStorage.deleteItem(`api-secret-${keyId}`);
    
    const updatedKeys = apiKeys.filter(k => k.id !== keyId);
    setApiKeys(updatedKeys);
    await SecureStorage.setItem('api-keys-list', updatedKeys, true);

    SecurityAuditLogger.logEvent(
      SecurityEventType.SENSITIVE_DATA_ACCESS,
      SecuritySeverity.CRITICAL,
      { action: 'api-key-revoked', keyId, keyName: key.name, userId: 'current-user' },
      'current-user'
    );

    toast.success(`API key "${key.name}" revoked`);
    setShowRevokeConfirm(null);
  };

  const handleRevokeAllKeys = async () => {
    for (const key of apiKeys) {
      await SecureStorage.deleteItem(`api-key-${key.id}`);
      await SecureStorage.deleteItem(`api-secret-${key.id}`);
    }

    setApiKeys([]);
    await SecureStorage.setItem('api-keys-list', [], true);

    SecurityAuditLogger.logEvent(
      SecurityEventType.SENSITIVE_DATA_ACCESS,
      SecuritySeverity.CRITICAL,
      { action: 'all-api-keys-revoked', count: apiKeys.length, userId: 'current-user' },
      'current-user'
    );

    toast.success('All API keys revoked');
    setShowRevokeAllConfirm(false);
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <>
      <Card className="cyber-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
            <Key size={24} />
            API Key Vault
          </h3>
          <div className="flex gap-2">
            {apiKeys.length > 0 && (
              <Button
                onClick={() => setShowRevokeAllConfirm(true)}
                variant="destructive"
                size="sm"
              >
                <Trash size={16} className="mr-2" />
                Revoke All
              </Button>
            )}
            <Button onClick={() => setShowAddKey(true)} size="sm">
              <Plus size={16} className="mr-2" />
              Add Key
            </Button>
          </div>
        </div>

        {apiKeys.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Key size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold mb-2">No API Keys</p>
            <p className="text-sm">Add your exchange API keys to enable trading</p>
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-4 bg-muted/20 rounded-lg border border-primary/10 hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-lg">{key.name}</h4>
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                        {key.permissions.join(', ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-mono">
                      <span className="text-muted-foreground">
                        {showKeyValues[key.id] ? key.keyPreview : maskKey(key.keyPreview)}
                      </span>
                      <button
                        onClick={() => setShowKeyValues(prev => ({ ...prev, [key.id]: !prev[key.id] }))}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showKeyValues[key.id] ? <EyeSlash size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(key.keyPreview, 'API Key')}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowRevokeConfirm(key.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash size={18} />
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CheckCircle size={14} weight="fill" />
                    Created {format(key.created, 'MMM d, yyyy')}
                  </span>
                  {key.lastUsed ? (
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      Last used {format(key.lastUsed, 'MMM d, yyyy HH:mm')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Warning size={14} />
                      Never used
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
          <div className="flex items-start gap-3">
            <Warning size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-yellow-400">Security Best Practices:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Keys are encrypted with AES-256-GCM and never sent to servers</li>
                <li>Rotate keys every 90 days for maximum security</li>
                <li>Use read-only keys for viewing, trade-enabled keys only when necessary</li>
                <li>Enable IP whitelisting on your exchange for added protection</li>
                <li>Never share keys or screenshots containing key values</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog open={showAddKey} onOpenChange={setShowAddKey}>
        <AlertDialogContent className="cyber-card max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl uppercase tracking-wide flex items-center gap-2">
              <Plus size={24} className="text-primary" />
              Add New API Key
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Key Name</Label>
                  <Input
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Binance Main Account"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>API Key</Label>
                  <Input
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                    placeholder="Enter your API key"
                    type="password"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>API Secret (Optional)</Label>
                  <Input
                    value={newKeySecret}
                    onChange={(e) => setNewKeySecret(e.target.value)}
                    placeholder="Enter your API secret"
                    type="password"
                    className="mt-2"
                  />
                </div>
                <div className="p-3 bg-primary/5 rounded border border-primary/20 text-xs">
                  <p className="text-primary font-semibold mb-1">🔒 Zero-Knowledge Storage</p>
                  <p className="text-muted-foreground">
                    Keys are encrypted locally and never transmitted to our servers. 
                    Only you can decrypt and use them.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddApiKey}>
              Add Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRevokeConfirm !== null} onOpenChange={(open) => !open && setShowRevokeConfirm(null)}>
        <AlertDialogContent className="cyber-card max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl uppercase tracking-wide flex items-center gap-2">
              <Warning size={24} className="text-red-400" />
              Revoke API Key?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This will permanently delete the encrypted key. Any bots using this key will stop working.
              <br /><br />
              Key: <span className="font-bold text-primary">{apiKeys.find(k => k.id === showRevokeConfirm)?.name}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => showRevokeConfirm && handleRevokeKey(showRevokeConfirm)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showRevokeAllConfirm} onOpenChange={setShowRevokeAllConfirm}>
        <AlertDialogContent className="cyber-card max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl uppercase tracking-wide flex items-center gap-2">
              <Warning size={24} className="text-red-400" />
              Revoke ALL API Keys?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This will permanently delete all {apiKeys.length} API keys. All bots will stop working immediately.
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRevokeAllKeys}
              className="bg-destructive hover:bg-destructive/90"
            >
              Revoke All {apiKeys.length} Keys
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
