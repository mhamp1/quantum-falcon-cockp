import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Shield,
  Lock,
  Warning,
  CheckCircle,
  Clock,
  Fingerprint,
  DeviceMobile,
  Trash,
  ShieldWarning,
  Globe,
  MapPin,
  ShieldCheck,
  ShieldStar,
  Key,
  CreditCard,
  Bell,
  UserCheck,
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import {
  SessionManager,
  AdvancedRateLimiter,
  SecureStorage,
  SecurityAuditLogger,
  SecurityEventType,
  SecuritySeverity,
} from '@/lib/security';
import SecurityDashboard from '@/components/security/SecurityDashboard';
import ApiKeyManager from './security/ApiKeyManager';
import SessionList from './security/SessionList';
import ThreatIndicators from './security/ThreatIndicators';
import IPWhitelistManager from './security/IPWhitelistManager';
import WithdrawalWhitelist from './security/WithdrawalWhitelist';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';

interface SecuritySettingsProps {
  settings: any;
  onUpdate: (section: string, key: string, value: any) => void;
}

export default function SecuritySettings({ settings, onUpdate }: SecuritySettingsProps) {
  const [showDashboard, setShowDashboard] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [securityScore, setSecurityScore] = useState(85);
  const [threatLevel, setThreatLevel] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [lastSecurityScan, setLastSecurityScan] = useState(Date.now());
  const [failedLoginAttempts, setFailedLoginAttempts] = useState(0);
  
  const [showWipeConfirmation, setShowWipeConfirmation] = useState(false);
  const [wipeConfirmationStep, setWipeConfirmationStep] = useState(0);
  const [wipeConfirmationText, setWipeConfirmationText] = useState('');
  
  const [showInvalidateSessionsConfirm, setShowInvalidateSessionsConfirm] = useState(false);
  const [antiPhishingCode, setAntiPhishingCode] = useState('');

  useEffect(() => {
    const userId = 'current-user';
    setSessionCount(SessionManager.getActiveSessionCount());
    
    const interval = setInterval(() => {
      setSessionCount(SessionManager.getActiveSessionCount());
      setLastSecurityScan(Date.now());
      
      const stats = SecurityAuditLogger.getEventStats();
      const recentFailures = SecurityAuditLogger.getEvents({
        type: SecurityEventType.LOGIN_FAILURE,
        startTime: Date.now() - 3600000,
      });
      setFailedLoginAttempts(recentFailures.length);
      
      let newThreatLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      if (recentFailures.length > 10) newThreatLevel = 'HIGH';
      else if (recentFailures.length > 5) newThreatLevel = 'MEDIUM';
      setThreatLevel(newThreatLevel);
      
      const score = Math.max(50, 100 - recentFailures.length * 2);
      setSecurityScore(score);
    }, 5000);

    SecurityAuditLogger.logEvent(
      SecurityEventType.SENSITIVE_DATA_ACCESS,
      SecuritySeverity.INFO,
      { action: 'security-settings-viewed', userId },
      userId
    );

    return () => clearInterval(interval);
  }, []);

  const handleInvalidateAllSessions = () => {
    const userId = 'current-user';
    SessionManager.invalidateAllUserSessions(userId);
    
    SecurityAuditLogger.logEvent(
      SecurityEventType.LOGOUT,
      SecuritySeverity.CRITICAL,
      { action: 'invalidate-all-sessions', reason: 'user-initiated', userId },
      userId
    );

    toast.success('All sessions invalidated - you will need to re-login on all devices');
    setSessionCount(0);
    setShowInvalidateSessionsConfirm(false);
  };

  const handleWipeAllSensitiveData = async () => {
    if (wipeConfirmationStep === 0) {
      setWipeConfirmationStep(1);
      return;
    }
    
    if (wipeConfirmationStep === 1) {
      if (wipeConfirmationText !== 'WIPE ALL DATA') {
        toast.error('Please type exactly: WIPE ALL DATA');
        return;
      }
      setWipeConfirmationStep(2);
      return;
    }
    
    if (wipeConfirmationStep === 2) {
      await SecureStorage.clearAll();
      
      SecurityAuditLogger.logEvent(
        SecurityEventType.SENSITIVE_DATA_ACCESS,
        SecuritySeverity.CRITICAL,
        { action: 'secure-storage-wiped', reason: 'user-initiated', userId: 'current-user' },
        'current-user'
      );

      toast.success('All sensitive data has been permanently wiped');
      setShowWipeConfirmation(false);
      setWipeConfirmationStep(0);
      setWipeConfirmationText('');
    }
  };

  const handleSave2FAMethod = (method: string) => {
    onUpdate('security', 'twoFactorMethod', method);
    SecurityAuditLogger.logEvent(
      SecurityEventType.LOGIN_SUCCESS,
      SecuritySeverity.INFO,
      { action: '2fa-method-changed', method, userId: 'current-user' },
      'current-user'
    );
    toast.success(`2FA method changed to ${method}`);
  };

  const handleSaveAntiPhishingCode = () => {
    if (!antiPhishingCode || antiPhishingCode.length < 4) {
      toast.error('Anti-phishing code must be at least 4 characters');
      return;
    }
    
    onUpdate('security', 'antiPhishingCode', antiPhishingCode);
    SecurityAuditLogger.logEvent(
      SecurityEventType.SENSITIVE_DATA_ACCESS,
      SecuritySeverity.INFO,
      { action: 'anti-phishing-code-updated', userId: 'current-user' },
      'current-user'
    );
    toast.success('Anti-phishing code saved');
    setAntiPhishingCode('');
  };

  const threatLevelColor = {
    LOW: 'green',
    MEDIUM: 'yellow',
    HIGH: 'red',
  }[threatLevel];

  const threatLevelBorder = {
    LOW: 'border-green-500/30',
    MEDIUM: 'border-yellow-500/30',
    HIGH: 'border-red-500/30',
  }[threatLevel];

  const timeSinceLastScan = Math.floor((Date.now() - lastSecurityScan) / 1000);

  return (
    <>
      <motion.div 
        className={`space-y-6 p-6 rounded-2xl border-2 transition-all duration-500 ${threatLevelBorder}`}
        style={{
          boxShadow: `0 0 20px ${threatLevelColor === 'green' ? 'rgba(0,255,0,0.1)' : threatLevelColor === 'yellow' ? 'rgba(255,255,0,0.1)' : 'rgba(255,0,0,0.2)'}`
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight neon-glow mb-2">
              INSTITUTIONAL SECURITY
            </h2>
            <p className="text-sm text-muted-foreground">
              Bank-grade protection for your $100M+ portfolio
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge 
              className={`px-4 py-2 text-lg font-bold uppercase ${
                threatLevel === 'LOW' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                threatLevel === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border-red-500/30'
              }`}
              style={{
                boxShadow: `0 0 15px ${threatLevelColor === 'green' ? 'rgba(0,255,0,0.3)' : threatLevelColor === 'yellow' ? 'rgba(255,255,0,0.3)' : 'rgba(255,0,0,0.4)'}`
              }}
            >
              THREAT: {threatLevel}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Last scan: {timeSinceLastScan}s ago
            </p>
          </div>
        </div>

        <ThreatIndicators
          securityScore={securityScore}
          failedLoginAttempts={failedLoginAttempts}
          threatLevel={threatLevel}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cyber-card p-6">
            <div className="flex items-center justify-between mb-3">
              <ShieldStar size={32} className="text-primary" weight="fill" />
              <div className="text-right">
                <div className="text-3xl font-black text-primary" style={{ textShadow: '0 0 6px rgba(0,255,255,0.4)' }}>
                  {securityScore}
                </div>
                <div className="text-xs text-muted-foreground uppercase">Score</div>
              </div>
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">Security Rating</h3>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-primary transition-all duration-1000"
                style={{ width: `${securityScore}%` }}
              />
            </div>
          </Card>

          <Card className="cyber-card p-6">
            <div className="flex items-center justify-between mb-3">
              <Lock size={32} className="text-accent" />
              <Badge className="bg-accent/20 text-accent border-accent/30 px-3 py-1 text-lg font-bold">
                {sessionCount}
              </Badge>
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-1">Active Sessions</h3>
            <p className="text-xs text-muted-foreground">Devices logged in</p>
          </Card>

          <Card className="cyber-card p-6">
            <div className="flex items-center justify-between mb-3">
              <Warning size={32} className={failedLoginAttempts > 5 ? "text-red-400" : "text-primary"} />
              <Badge className={`${failedLoginAttempts > 5 ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-primary/20 text-primary border-primary/30'} px-3 py-1 text-lg font-bold`}>
                {failedLoginAttempts}
              </Badge>
            </div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-1">Failed Logins</h3>
            <p className="text-xs text-muted-foreground">Last 1 hour</p>
          </Card>
        </div>

        <Card className="cyber-card p-6">
          <h3 className="text-xl font-bold uppercase tracking-tight mb-6 flex items-center gap-2">
            <Lock size={24} />
            Authentication & Session Security
          </h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <Label className="text-base font-semibold">Two-Factor Authentication (2FA)</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Required for withdrawals and API access
                </p>
              </div>
              <Switch
                checked={settings.security.twoFactor}
                onCheckedChange={(checked) => {
                  onUpdate('security', 'twoFactor', checked);
                  SecurityAuditLogger.logEvent(
                    SecurityEventType.SENSITIVE_DATA_ACCESS,
                    checked ? SecuritySeverity.INFO : SecuritySeverity.WARNING,
                    { action: '2fa-toggled', enabled: checked, userId: 'current-user' },
                    'current-user'
                  );
                  toast.success(`2FA ${checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </div>

            {settings.security.twoFactor && (
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <Label className="text-sm font-semibold mb-3 block">2FA Method (Authenticator Mandatory)</Label>
                <Select
                  value={settings.security.twoFactorMethod || 'authenticator'}
                  onValueChange={handleSave2FAMethod}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="authenticator">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-green-400" />
                        <span>Authenticator App (Recommended)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="hardware-key">
                      <div className="flex items-center gap-2">
                        <Key size={16} className="text-primary" />
                        <span>Hardware Security Key (Yubikey)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="sms" disabled>
                      <div className="flex items-center gap-2">
                        <Warning size={16} className="text-yellow-400" />
                        <span>SMS (Deprecated - Insecure)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  SMS 2FA is deprecated due to SIM swap attacks. Use authenticator or hardware key only.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <Label className="text-base font-semibold">Biometric Authentication</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Fingerprint or Face ID for quick access
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

            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div>
                <Label className="text-base font-semibold">Login Alerts</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Email notification on new device login
                </p>
              </div>
              <Switch
                checked={settings.security.loginAlerts !== false}
                onCheckedChange={(checked) => {
                  onUpdate('security', 'loginAlerts', checked);
                  toast.success(`Login alerts ${checked ? 'enabled' : 'disabled'}`);
                }}
              />
            </div>

            <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
              <Label className="text-sm font-semibold mb-3 block">Anti-Phishing Code</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Set a unique code that appears in all official emails. If missing, it's a phishing attempt.
              </p>
              <div className="flex gap-2">
                <Input
                  value={antiPhishingCode}
                  onChange={(e) => setAntiPhishingCode(e.target.value)}
                  placeholder="Enter 4-8 character code"
                  maxLength={8}
                  className="flex-1"
                />
                <Button onClick={handleSaveAntiPhishingCode} size="sm">
                  Save Code
                </Button>
              </div>
              {settings.security.antiPhishingCode && (
                <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                  <CheckCircle size={14} weight="fill" />
                  Current code: {settings.security.antiPhishingCode}
                </p>
              )}
            </div>

            <div>
              <Label className="text-base font-semibold mb-3 block">Auto-Logout Timer</Label>
              <Select
                value={settings.security.autoLogout?.toString() || '30'}
                onValueChange={(value) => {
                  onUpdate('security', 'autoLogout', parseInt(value));
                  toast.success(`Auto-logout set to ${value === '0' ? 'never' : value + ' minutes'}`);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes (Recommended)</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="0">Never (Not Recommended)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <SessionList
          onInvalidateAll={() => setShowInvalidateSessionsConfirm(true)}
        />

        <ApiKeyManager />

        <IPWhitelistManager settings={settings} onUpdate={onUpdate} />

        <WithdrawalWhitelist settings={settings} onUpdate={onUpdate} />

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
                <span className="font-semibold">Advanced Rate Limiting</span>
                <CheckCircle size={20} className="text-green-400" weight="fill" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Device Fingerprinting</span>
                <CheckCircle size={20} className="text-green-400" weight="fill" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Behavioral Anomaly Detection</span>
                <CheckCircle size={20} className="text-green-400" weight="fill" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Real-Time Threat Monitoring</span>
                <CheckCircle size={20} className="text-green-400" weight="fill" />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Security Audit Logging</span>
                <CheckCircle size={20} className="text-green-400" weight="fill" />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowDashboard(true)}
                variant="default"
                className="flex-1"
              >
                <ShieldCheck size={18} className="mr-2" />
                Security Dashboard
              </Button>
              <Button
                onClick={() => setShowWipeConfirmation(true)}
                variant="destructive"
                className="flex-1"
              >
                <Trash size={18} className="mr-2" />
                Wipe All Sensitive Data
              </Button>
            </div>

            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <div className="flex items-start gap-3">
                <ShieldWarning size={24} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-400 mb-2">Nuclear Option</p>
                  <p className="text-xs text-muted-foreground">
                    "Wipe All Sensitive Data" will permanently delete all API keys, sessions, encrypted data, 
                    and local storage. This action cannot be undone. Use only if you suspect a security breach.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <Dialog open={showDashboard} onOpenChange={setShowDashboard}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          <div className="overflow-auto max-h-[95vh]">
            <SecurityDashboard />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showInvalidateSessionsConfirm} onOpenChange={setShowInvalidateSessionsConfirm}>
        <AlertDialogContent className="cyber-card max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl uppercase tracking-wide flex items-center gap-2">
              <Warning size={24} className="text-yellow-400" />
              Logout All Devices?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              This will immediately terminate all active sessions across all devices. You will need to 
              re-login with 2FA on every device.
              <br /><br />
              Active sessions: <span className="font-bold text-primary">{sessionCount}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleInvalidateAllSessions}
              className="bg-destructive hover:bg-destructive/90"
            >
              Logout All Devices
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showWipeConfirmation} onOpenChange={(open) => {
        setShowWipeConfirmation(open);
        if (!open) {
          setWipeConfirmationStep(0);
          setWipeConfirmationText('');
        }
      }}>
        <AlertDialogContent className="cyber-card max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl uppercase tracking-wide flex items-center gap-2">
              <ShieldWarning size={24} className="text-red-400" />
              {wipeConfirmationStep === 0 && 'Wipe All Sensitive Data?'}
              {wipeConfirmationStep === 1 && 'Type Confirmation Code'}
              {wipeConfirmationStep === 2 && 'Final Confirmation'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base space-y-4">
              {wipeConfirmationStep === 0 && (
                <>
                  <p className="font-bold text-red-400">⚠️ THIS ACTION CANNOT BE UNDONE ⚠️</p>
                  <p>This will permanently delete:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>All API keys (encrypted and raw)</li>
                    <li>All active sessions</li>
                    <li>All secure storage data</li>
                    <li>All cached credentials</li>
                    <li>All device fingerprints</li>
                  </ul>
                  <p className="font-semibold">Use only if you suspect a security breach.</p>
                </>
              )}
              {wipeConfirmationStep === 1 && (
                <>
                  <p>Type exactly: <span className="font-bold text-primary">WIPE ALL DATA</span></p>
                  <Input
                    value={wipeConfirmationText}
                    onChange={(e) => setWipeConfirmationText(e.target.value)}
                    placeholder="Type here..."
                    className="mt-2"
                    autoFocus
                  />
                </>
              )}
              {wipeConfirmationStep === 2 && (
                <>
                  <p className="font-bold text-red-400">FINAL WARNING</p>
                  <p>You are about to permanently wipe all sensitive data. This cannot be reversed.</p>
                  <p>Click "Execute Wipe" to proceed.</p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setWipeConfirmationStep(0);
              setWipeConfirmationText('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleWipeAllSensitiveData}
              className="bg-red-600 hover:bg-red-700"
            >
              {wipeConfirmationStep === 0 && 'Continue'}
              {wipeConfirmationStep === 1 && 'Next Step'}
              {wipeConfirmationStep === 2 && 'Execute Wipe'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
