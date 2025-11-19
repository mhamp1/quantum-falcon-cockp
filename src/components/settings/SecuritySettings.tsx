import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Shield,
  Lock,
  Key,
  Eye,
  EyeSlash,
  Warning,
  CheckCircle,
  Clock,
  Fingerprint,
  DeviceMobile,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import {
  SessionManager,
  AdvancedRateLimiter,
  InputSanitizer,
  SecureStorage,
  SecurityAuditLogger,
  SecurityEventType,
  SecuritySeverity,
} from '@/lib/security';
import SecurityDashboard from '@/components/security/SecurityDashboard';

interface SecuritySettingsProps {
  settings: any;
  onUpdate: (section: string, key: string, value: any) => void;
}

export default function SecuritySettings({ settings, onUpdate }: SecuritySettingsProps) {
  const [showDashboard, setShowDashboard] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [rateLimitStatus, setRateLimitStatus] = useState({ remaining: 100, max: 100 });

  useEffect(() => {
    setSessionCount(SessionManager.getActiveSessionCount());
    const userId = 'current-user';
    const remaining = AdvancedRateLimiter.getRemainingRequests(userId);
    setRateLimitStatus({ remaining, max: 100 });

    const interval = setInterval(() => {
      setSessionCount(SessionManager.getActiveSessionCount());
      const remaining = AdvancedRateLimiter.getRemainingRequests(userId);
      setRateLimitStatus({ remaining, max: 100 });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleValidateApiKey = async () => {
    if (!apiKey) {
      toast.error('Please enter an API key');
      return;
    }

    const isValid = InputSanitizer.validateAPIKey(apiKey);

    if (isValid) {
      await SecureStorage.setItem('api-key', apiKey, true);
      
      SecurityAuditLogger.logEvent(
        SecurityEventType.API_KEY_VALIDATION_FAILED,
        SecuritySeverity.INFO,
        { action: 'api-key-saved' }
      );

      toast.success('API key validated and securely stored');
      setApiKey('');
      setShowApiKey(false);
    } else {
      SecurityAuditLogger.logEvent(
        SecurityEventType.API_KEY_VALIDATION_FAILED,
        SecuritySeverity.WARNING,
        { reason: 'invalid-format' }
      );

      toast.error('Invalid API key format');
    }
  };

  const handleInvalidateAllSessions = () => {
    const userId = 'current-user';
    SessionManager.invalidateAllUserSessions(userId);
    
    SecurityAuditLogger.logEvent(
      SecurityEventType.LOGOUT,
      SecuritySeverity.INFO,
      { action: 'invalidate-all-sessions' }
    );

    toast.success('All sessions invalidated');
    setSessionCount(0);
  };

  const handleClearSecureStorage = async () => {
    await SecureStorage.clearAll();
    
    SecurityAuditLogger.logEvent(
      SecurityEventType.SENSITIVE_DATA_ACCESS,
      SecuritySeverity.WARNING,
      { action: 'clear-all-secure-storage' }
    );

    toast.success('Secure storage cleared');
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight neon-glow mb-2">
            Advanced Security
          </h2>
          <p className="text-sm text-muted-foreground">
            Enterprise-grade security features with real-time monitoring
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cyber-card p-6">
            <div className="flex items-center justify-between mb-3">
              <Shield size={28} className="text-primary" />
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Active
              </Badge>
            </div>
            <h3 className="text-lg font-semibold mb-1">Security Status</h3>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </Card>

          <Card className="cyber-card p-6">
            <div className="flex items-center justify-between mb-3">
              <Lock size={28} className="text-accent" />
              <Badge className="bg-accent/20 text-accent border-accent/30">
                {sessionCount}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold mb-1">Active Sessions</h3>
            <p className="text-xs text-muted-foreground">Current user sessions</p>
          </Card>

          <Card className="cyber-card p-6">
            <div className="flex items-center justify-between mb-3">
              <Clock size={28} className="text-primary" />
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {rateLimitStatus.remaining}/{rateLimitStatus.max}
              </Badge>
            </div>
            <h3 className="text-lg font-semibold mb-1">Rate Limit</h3>
            <p className="text-xs text-muted-foreground">Requests remaining</p>
          </Card>
        </div>

        <Card className="cyber-card p-6">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 flex items-center gap-2">
            <Lock size={24} />
            Authentication & Session Security
          </h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">Two-Factor Authentication (2FA)</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                checked={settings.security.twoFactor}
                onCheckedChange={(checked) => {
                  onUpdate('security', 'twoFactor', checked);
                  SecurityAuditLogger.logEvent(
                    checked ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGOUT,
                    SecuritySeverity.INFO,
                    { action: '2fa-toggled', enabled: checked }
                  );
                  toast.success(`2FA ${checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-semibold">Biometric Authentication</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Use fingerprint or face recognition
                </p>
              </div>
              <Switch
                checked={settings.security.biometric}
                onCheckedChange={(checked) => {
                  onUpdate('security', 'biometric', checked);
                  toast.success(`Biometric auth ${checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">Auto-Logout Timer</Label>
              <Select
                value={settings.security.autoLogout.toString()}
                onValueChange={(value) => {
                  onUpdate('security', 'autoLogout', parseInt(value));
                  toast.success(`Auto-logout set to ${value} minutes`);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="0">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleInvalidateAllSessions}
                variant="destructive"
                className="flex-1"
              >
                <DeviceMobile size={18} className="mr-2" />
                Logout All Devices
              </Button>
              <Button
                onClick={() => setShowDashboard(true)}
                variant="outline"
                className="flex-1"
              >
                <Shield size={18} className="mr-2" />
                Security Dashboard
              </Button>
            </div>
          </div>
        </Card>

        <Card className="cyber-card p-6">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 flex items-center gap-2">
            <Key size={24} />
            API Keys & Integration
          </h3>

          <div className="space-y-4">
            <div>
              <Label>API Key</Label>
              <div className="flex gap-2 mt-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="pr-10"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <Button onClick={handleValidateApiKey}>
                  <CheckCircle size={18} className="mr-2" />
                  Validate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                API keys are encrypted using AES-256-GCM and stored securely
              </p>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <Warning size={24} className="text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-yellow-400">Security Best Practices</p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>Never share your API keys with anyone</li>
                    <li>Rotate keys regularly (every 90 days recommended)</li>
                    <li>Use different keys for different environments</li>
                    <li>Monitor API usage for suspicious activity</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="cyber-card p-6">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 flex items-center gap-2">
            <Fingerprint size={24} />
            Advanced Security Features
          </h3>

          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold">AES-256-GCM Encryption</span>
                <CheckCircle size={20} className="text-green-400" weight="fill" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">PBKDF2 Key Derivation</span>
                <CheckCircle size={20} className="text-green-400" weight="fill" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">CSRF Protection</span>
                <CheckCircle size={20} className="text-green-400" weight="fill" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">XSS Prevention</span>
                <CheckCircle size={20} className="text-green-400" weight="fill" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">SQL Injection Protection</span>
                <CheckCircle size={20} className="text-green-400" weight="fill" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Rate Limiting</span>
                <CheckCircle size={20} className="text-green-400" weight="fill" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Session Fingerprinting</span>
                <CheckCircle size={20} className="text-green-400" weight="fill" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Security Audit Logging</span>
                <CheckCircle size={20} className="text-green-400" weight="fill" />
              </div>
            </div>

            <Button
              onClick={handleClearSecureStorage}
              variant="outline"
              className="w-full"
            >
              Clear Secure Storage
            </Button>
          </div>
        </Card>
      </div>

      <Dialog open={showDashboard} onOpenChange={setShowDashboard}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          <div className="overflow-auto max-h-[95vh]">
            <SecurityDashboard />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
