import { useKVSafe as useKV } from '@/hooks/useKVFallback'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Shield, Clock, Desktop } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface RiskAcknowledgment {
  acknowledgedAt: number
  ipAddress?: string
  userAgent: string
  version: string
  sessionId: string
}

export default function RiskAcknowledgmentLog() {
  const [acknowledgment, setAcknowledgment] = useKV<RiskAcknowledgment | null>(
    'risk-disclosure-acknowledgment',
    null
  )
  const [auditLog, setAuditLog] = useKV<RiskAcknowledgment[]>(
    'risk-disclosure-audit-log',
    []
  )

  const handleResetForTesting = () => {
    if (window.confirm('Reset risk disclosure for testing? The banner will reappear.')) {
      setAcknowledgment(null)
      toast.info('Risk disclosure reset - banner will reappear on next page load')
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown Browser'
  }

  const exportAuditLog = () => {
    const dataStr = JSON.stringify(auditLog, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `risk-disclosure-audit-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Audit log exported successfully')
  }

  return (
    <div className="space-y-6">
      <Card className="cyber-card border-2 border-destructive/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={28} weight="fill" className="text-destructive" />
              <div>
                <CardTitle className="text-xl uppercase tracking-wider text-destructive">
                  Risk Disclosure Acknowledgment
                </CardTitle>
                <CardDescription className="text-xs uppercase tracking-wide">
                  Legal Compliance Record
                </CardDescription>
              </div>
            </div>
            {auditLog && auditLog.length > 0 && (
              <Button
                onClick={exportAuditLog}
                variant="outline"
                size="sm"
                className="border-destructive/50 text-destructive hover:bg-destructive/10 jagged-corner-small"
              >
                Export Log
              </Button>
            )}
          </div>
          {import.meta.env.DEV && (
            <Button
              onClick={handleResetForTesting}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground text-xs mt-2"
            >
              Reset (Testing)
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {acknowledgment ? (
            <div className="p-4 bg-primary/10 border-l-4 border-primary rounded-r">
              <div className="flex items-start gap-3">
                <Shield size={24} className="text-primary mt-1" weight="fill" />
                <div className="flex-1 space-y-2">
                  <h3 className="font-bold text-primary uppercase tracking-wide">
                    Current Acknowledgment Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock size={16} />
                        <span className="font-medium">Acknowledged:</span>
                      </div>
                      <div className="text-foreground pl-6">
                        {formatDate(acknowledgment.acknowledgedAt)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Desktop size={16} />
                        <span className="font-medium">Browser:</span>
                      </div>
                      <div className="text-foreground pl-6">
                        {getBrowserInfo(acknowledgment.userAgent)}
                      </div>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <div className="text-muted-foreground font-medium">Session ID:</div>
                      <div className="text-foreground font-mono text-xs break-all bg-muted/30 p-2 rounded">
                        {acknowledgment.sessionId}
                      </div>
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <div className="text-muted-foreground font-medium">Version:</div>
                      <div className="text-foreground text-xs">
                        {acknowledgment.version}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-destructive/10 border-l-4 border-destructive rounded-r">
              <div className="flex items-start gap-3">
                <Shield size={24} className="text-destructive mt-1" weight="fill" />
                <div>
                  <h3 className="font-bold text-destructive uppercase tracking-wide mb-1">
                    No Acknowledgment on Record
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The risk disclosure banner will appear until acknowledged.
                  </p>
                </div>
              </div>
            </div>
          )}

          {auditLog && auditLog.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-bold uppercase tracking-wide text-sm text-muted-foreground">
                Audit Trail ({auditLog.length} {auditLog.length === 1 ? 'Entry' : 'Entries'})
              </h3>
              <ScrollArea className="h-[300px] border border-border rounded-lg p-2 bg-muted/10">
                <div className="space-y-2">
                  {auditLog.map((log, index) => (
                    <div
                      key={log.sessionId}
                      className="p-3 bg-card border border-border rounded hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-1 text-xs">
                          <div className="font-bold text-foreground">
                            Entry #{auditLog.length - index}
                          </div>
                          <div className="text-muted-foreground">
                            {formatDate(log.acknowledgedAt)}
                          </div>
                          <div className="text-muted-foreground">
                            {getBrowserInfo(log.userAgent)}
                          </div>
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground break-all max-w-[200px]">
                          {log.sessionId}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="cyber-card-accent p-4">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-accent mt-0.5" weight="fill" />
          <div className="text-xs space-y-2 text-muted-foreground">
            <p>
              <strong className="text-foreground">Legal Compliance Notice:</strong> All risk disclosure 
              acknowledgments are logged with timestamps and session information for regulatory compliance 
              and legal protection.
            </p>
            <p>
              This audit trail serves as evidence that users have been properly informed of trading risks 
              before using the platform. Records are stored locally and can be exported for legal purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
