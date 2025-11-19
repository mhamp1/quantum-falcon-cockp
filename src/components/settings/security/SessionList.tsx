import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeviceMobile, Desktop, DeviceTablet, MapPin, Clock, Warning, Trash } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { SessionManager, SecurityAuditLogger, SecurityEventType, SecuritySeverity } from '@/lib/security';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

interface Session {
  id: string;
  userId: string;
  device: string;
  os: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: number;
  created: number;
  isCurrent: boolean;
  isSuspicious: boolean;
}

interface SessionListProps {
  onInvalidateAll: () => void;
}

export default function SessionList({ onInvalidateAll }: SessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadSessions = () => {
    const mockSessions: Session[] = [
      {
        id: 'session-1',
        userId: 'current-user',
        device: 'Desktop',
        os: 'macOS 14.2',
        browser: 'Chrome 120',
        ipAddress: '192.168.1.100',
        location: 'San Francisco, CA, USA',
        lastActive: Date.now() - 60000,
        created: Date.now() - 7200000,
        isCurrent: true,
        isSuspicious: false,
      },
      {
        id: 'session-2',
        userId: 'current-user',
        device: 'Mobile',
        os: 'iOS 17.2',
        browser: 'Safari',
        ipAddress: '192.168.1.101',
        location: 'San Francisco, CA, USA',
        lastActive: Date.now() - 300000,
        created: Date.now() - 86400000,
        isCurrent: false,
        isSuspicious: false,
      },
      {
        id: 'session-3',
        userId: 'current-user',
        device: 'Desktop',
        os: 'Windows 11',
        browser: 'Edge 120',
        ipAddress: '203.45.123.89',
        location: 'Mumbai, India',
        lastActive: Date.now() - 1800000,
        created: Date.now() - 3600000,
        isCurrent: false,
        isSuspicious: true,
      },
    ];
    setSessions(mockSessions);
  };

  const getDeviceIcon = (device: string) => {
    if (device === 'Mobile') return DeviceMobile;
    if (device === 'Tablet') return DeviceTablet;
    return Desktop;
  };

  const handleTerminateSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    setSessions(updatedSessions);

    SecurityAuditLogger.logEvent(
      SecurityEventType.LOGOUT,
      SecuritySeverity.INFO,
      {
        action: 'session-terminated',
        sessionId,
        device: session.device,
        ipAddress: session.ipAddress,
        reason: 'user-initiated',
        userId: 'current-user',
      },
      'current-user'
    );

    toast.success(`Session terminated: ${session.device} (${session.location})`);
    setShowTerminateConfirm(null);
  };

  const getTimeSince = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <>
      <Card className="cyber-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2">
            <DeviceMobile size={24} />
            Active Sessions ({sessions.length})
          </h3>
          <Button
            onClick={onInvalidateAll}
            variant="destructive"
            size="sm"
          >
            <Trash size={16} className="mr-2" />
            Logout All Devices
          </Button>
        </div>

        <div className="space-y-4">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.device);
            return (
              <div
                key={session.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  session.isSuspicious
                    ? 'bg-red-500/10 border-red-500/50'
                    : session.isCurrent
                    ? 'bg-primary/10 border-primary/50'
                    : 'bg-muted/20 border-primary/10 hover:border-primary/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <DeviceIcon size={32} className={session.isSuspicious ? 'text-red-400' : 'text-primary'} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg">{session.device}</h4>
                        {session.isCurrent && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            Current Session
                          </Badge>
                        )}
                        {session.isSuspicious && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs flex items-center gap-1">
                            <Warning size={12} weight="fill" />
                            Suspicious
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {session.os} • {session.browser}
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {session.location}
                        </span>
                        <span className="font-mono">{session.ipAddress}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Active {getTimeSince(session.lastActive)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button
                      onClick={() => setShowTerminateConfirm(session.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash size={18} />
                    </Button>
                  )}
                </div>

                {session.isSuspicious && (
                  <div className="mt-3 pt-3 border-t border-red-500/30">
                    <p className="text-xs text-red-400 flex items-center gap-2">
                      <Warning size={16} weight="fill" />
                      <span>
                        <strong>Suspicious Activity Detected:</strong> New location and unusual login time. 
                        If this wasn't you, terminate immediately and change your password.
                      </span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20 text-xs">
          <p className="font-semibold text-primary mb-2">Session Security Features:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Sessions automatically expire after 2 hours of inactivity</li>
            <li>Device fingerprinting detects account sharing</li>
            <li>Suspicious sessions are flagged based on location and behavior</li>
            <li>You'll receive email alerts for new device logins</li>
          </ul>
        </div>
      </Card>

      <AlertDialog open={showTerminateConfirm !== null} onOpenChange={(open) => !open && setShowTerminateConfirm(null)}>
        <AlertDialogContent className="cyber-card max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl uppercase tracking-wide flex items-center gap-2">
              <Warning size={24} className="text-yellow-400" />
              Terminate Session?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {(() => {
                const session = sessions.find(s => s.id === showTerminateConfirm);
                if (!session) return null;
                return (
                  <>
                    This will immediately log out the following device:
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg space-y-1 font-mono text-sm">
                      <p><strong>Device:</strong> {session.device}</p>
                      <p><strong>OS:</strong> {session.os}</p>
                      <p><strong>Location:</strong> {session.location}</p>
                      <p><strong>IP:</strong> {session.ipAddress}</p>
                    </div>
                  </>
                );
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showTerminateConfirm && handleTerminateSession(showTerminateConfirm)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Terminate Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
