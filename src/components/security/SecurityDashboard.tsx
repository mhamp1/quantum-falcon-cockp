import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SecurityAuditLogger,
  SecurityEventType,
  SecuritySeverity,
  SessionManager,
  AdvancedRateLimiter,
  ContentSecurityPolicy,
} from '@/lib/security';
import {
  Shield,
  Warning,
  CheckCircle,
  XCircle,
  Download,
  Trash,
  Activity,
  Lock,
  Eye
} from '@phosphor-icons/react';

export default function SecurityDashboard() {
  const [stats, setStats] = useState(SecurityAuditLogger.getEventStats());
  const [events, setEvents] = useState(SecurityAuditLogger.getEvents());
  const [selectedSeverity, setSelectedSeverity] = useState<SecuritySeverity | null>(null);
  const [activeSessions, setActiveSessions] = useState(SessionManager.getActiveSessionCount());
  const [cspViolations, setCspViolations] = useState(ContentSecurityPolicy.getViolationCount());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(SecurityAuditLogger.getEventStats());
      setEvents(SecurityAuditLogger.getEvents());
      setActiveSessions(SessionManager.getActiveSessionCount());
      setCspViolations(ContentSecurityPolicy.getViolationCount());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleExportLogs = () => {
    const logs = SecurityAuditLogger.exportEvents();
    const blob = new Blob([logs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    if (confirm('Are you sure you want to clear all security logs? This action cannot be undone.')) {
      SecurityAuditLogger.clearEvents();
      setStats(SecurityAuditLogger.getEventStats());
      setEvents([]);
    }
  };

  const filteredEvents = selectedSeverity
    ? events.filter(e => e.severity === selectedSeverity)
    : events;

  const getSeverityColor = (severity: SecuritySeverity) => {
    switch (severity) {
      case SecuritySeverity.INFO:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case SecuritySeverity.WARNING:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case SecuritySeverity.ERROR:
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case SecuritySeverity.CRITICAL:
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSeverityIcon = (severity: SecuritySeverity) => {
    switch (severity) {
      case SecuritySeverity.INFO:
        return <CheckCircle size={16} weight="fill" />;
      case SecuritySeverity.WARNING:
        return <Warning size={16} weight="fill" />;
      case SecuritySeverity.ERROR:
        return <XCircle size={16} weight="fill" />;
      case SecuritySeverity.CRITICAL:
        return <Shield size={16} weight="fill" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight neon-glow">
            Security Dashboard
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
            Advanced threat monitoring & audit logs
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleExportLogs} variant="outline" className="gap-2">
            <Download size={18} />
            Export Logs
          </Button>
          <Button onClick={handleClearLogs} variant="destructive" className="gap-2">
            <Trash size={18} />
            Clear Logs
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cyber-card p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity size={24} className="text-primary" />
            <Badge className={getSeverityColor(SecuritySeverity.INFO)}>
              {stats.last24Hours}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold">Total Events (24h)</h3>
          <p className="text-3xl font-bold text-primary mt-2">{stats.total}</p>
        </Card>

        <Card className="cyber-card p-6">
          <div className="flex items-center justify-between mb-2">
            <Lock size={24} className="text-accent" />
            <Badge className="bg-accent/20 text-accent border-accent/30">
              Active
            </Badge>
          </div>
          <h3 className="text-lg font-semibold">Active Sessions</h3>
          <p className="text-3xl font-bold text-accent mt-2">{activeSessions}</p>
        </Card>

        <Card className="cyber-card p-6">
          <div className="flex items-center justify-between mb-2">
            <Warning size={24} className="text-yellow-400" />
            <Badge className={getSeverityColor(SecuritySeverity.WARNING)}>
              {stats.bySeverity[SecuritySeverity.WARNING] || 0}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold">Warnings</h3>
          <p className="text-3xl font-bold text-yellow-400 mt-2">
            {stats.bySeverity[SecuritySeverity.WARNING] || 0}
          </p>
        </Card>

        <Card className="cyber-card p-6">
          <div className="flex items-center justify-between mb-2">
            <Shield size={24} className="text-destructive" />
            <Badge className={getSeverityColor(SecuritySeverity.CRITICAL)}>
              {stats.bySeverity[SecuritySeverity.CRITICAL] || 0}
            </Badge>
          </div>
          <h3 className="text-lg font-semibold">Critical Events</h3>
          <p className="text-3xl font-bold text-destructive mt-2">
            {stats.bySeverity[SecuritySeverity.CRITICAL] || 0}
          </p>
        </Card>
      </div>

      <Card className="cyber-card p-6">
        <Tabs defaultValue="events">
          <TabsList className="mb-4">
            <TabsTrigger value="events">Security Events</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                size="sm"
                variant={selectedSeverity === null ? 'default' : 'outline'}
                onClick={() => setSelectedSeverity(null)}
              >
                All
              </Button>
              {Object.values(SecuritySeverity).map(severity => (
                <Button
                  key={severity}
                  size="sm"
                  variant={selectedSeverity === severity ? 'default' : 'outline'}
                  onClick={() => setSelectedSeverity(severity)}
                  className="gap-2"
                >
                  {getSeverityIcon(severity)}
                  {severity}
                </Button>
              ))}
            </div>

            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-3">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Eye size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No security events recorded</p>
                  </div>
                ) : (
                  filteredEvents.map(event => (
                    <Card key={event.id} className="p-4 bg-muted/30 border-l-4" style={{
                      borderLeftColor: event.severity === SecuritySeverity.CRITICAL ? 'var(--destructive)' :
                                      event.severity === SecuritySeverity.ERROR ? 'var(--accent)' :
                                      event.severity === SecuritySeverity.WARNING ? '#FFD700' : 'var(--primary)'
                    }}>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge className={getSeverityColor(event.severity)}>
                            {getSeverityIcon(event.severity)}
                            <span className="ml-1">{event.severity}</span>
                          </Badge>
                          <span className="font-semibold text-sm uppercase tracking-wide">
                            {event.type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {event.userId && (
                        <p className="text-xs text-muted-foreground mb-1">
                          User: <span className="font-mono">{event.userId}</span>
                        </p>
                      )}
                      {Object.keys(event.details).length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-primary hover:underline">
                            View Details
                          </summary>
                          <pre className="mt-2 p-3 bg-black/30 rounded text-xs overflow-auto">
                            {JSON.stringify(event.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="stats">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Events by Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(stats.byType).map(([type, count]) => (
                    <Card key={type} className="p-4 bg-muted/30">
                      <div className="flex items-center justify-between">
                        <span className="text-sm uppercase tracking-wide">
                          {type.replace(/_/g, ' ')}
                        </span>
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          {count}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Events by Severity</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(stats.bySeverity).map(([severity, count]) => (
                    <Card key={severity} className="p-4 bg-muted/30">
                      <div className="text-center">
                        <p className="text-3xl font-bold mb-2">{count}</p>
                        <Badge className={getSeverityColor(severity as SecuritySeverity)}>
                          {severity}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Card className="p-6 bg-muted/30">
                <h3 className="text-lg font-semibold mb-4">System Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>CSP Violations</span>
                    <Badge className={cspViolations > 0 ? getSeverityColor(SecuritySeverity.WARNING) : 'bg-green-500/20 text-green-400 border-green-500/30'}>
                      {cspViolations}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Active Sessions</span>
                    <Badge className="bg-primary/20 text-primary border-primary/30">
                      {activeSessions}
                    </Badge>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
