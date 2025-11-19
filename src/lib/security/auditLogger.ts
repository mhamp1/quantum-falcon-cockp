export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  CSRF_ATTEMPT = 'CSRF_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  PATH_TRAVERSAL_ATTEMPT = 'PATH_TRAVERSAL_ATTEMPT',
  ENCRYPTION_FAILURE = 'ENCRYPTION_FAILURE',
  API_KEY_VALIDATION_FAILED = 'API_KEY_VALIDATION_FAILED',
  SESSION_HIJACKING_ATTEMPT = 'SESSION_HIJACKING_ATTEMPT',
  SENSITIVE_DATA_ACCESS = 'SENSITIVE_DATA_ACCESS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

export enum SecuritySeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

interface SecurityEvent {
  id: string;
  timestamp: number;
  type: SecurityEventType;
  severity: SecuritySeverity;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  details: Record<string, any>;
  stackTrace?: string;
}

export class SecurityAuditLogger {
  private static events: SecurityEvent[] = [];
  private static readonly MAX_EVENTS = 10000;
  private static readonly CRITICAL_ALERT_THRESHOLD = 5;

  static logEvent(
    type: SecurityEventType,
    severity: SecuritySeverity,
    details: Record<string, any> = {},
    userId?: string,
    sessionId?: string
  ): void {
    const event: SecurityEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type,
      severity,
      userId,
      sessionId,
      details,
    };

    this.events.push(event);

    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift();
    }

    const severityEmoji = {
      [SecuritySeverity.INFO]: 'ℹ️',
      [SecuritySeverity.WARNING]: '⚠️',
      [SecuritySeverity.ERROR]: '❌',
      [SecuritySeverity.CRITICAL]: '🚨',
    };

    console.log(
      `${severityEmoji[severity]} [SecurityAudit] ${type} | User: ${userId || 'N/A'} | Details:`,
      details
    );

    if (severity === SecuritySeverity.CRITICAL) {
      this.handleCriticalEvent(event);
    }
  }

  private static handleCriticalEvent(event: SecurityEvent): void {
    const recentCritical = this.events.filter(
      e =>
        e.severity === SecuritySeverity.CRITICAL &&
        Date.now() - e.timestamp < 300000
    );

    if (recentCritical.length >= this.CRITICAL_ALERT_THRESHOLD) {
      console.error(
        `🚨🚨🚨 [SecurityAudit] CRITICAL ALERT: ${recentCritical.length} critical security events in the last 5 minutes!`
      );
      
      window.dispatchEvent(
        new CustomEvent('security:critical-alert', {
          detail: { count: recentCritical.length, latestEvent: event },
        })
      );
    }
  }

  static getEvents(filter?: {
    type?: SecurityEventType;
    severity?: SecuritySeverity;
    userId?: string;
    startTime?: number;
    endTime?: number;
  }): SecurityEvent[] {
    let filtered = [...this.events];

    if (filter) {
      if (filter.type) {
        filtered = filtered.filter(e => e.type === filter.type);
      }
      if (filter.severity) {
        filtered = filtered.filter(e => e.severity === filter.severity);
      }
      if (filter.userId) {
        filtered = filtered.filter(e => e.userId === filter.userId);
      }
      if (filter.startTime) {
        filtered = filtered.filter(e => e.timestamp >= filter.startTime!);
      }
      if (filter.endTime) {
        filtered = filtered.filter(e => e.timestamp <= filter.endTime!);
      }
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  static getEventStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    last24Hours: number;
  } {
    const now = Date.now();
    const last24Hours = this.events.filter(e => now - e.timestamp < 86400000).length;

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    for (const event of this.events) {
      byType[event.type] = (byType[event.type] || 0) + 1;
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
    }

    return {
      total: this.events.length,
      byType,
      bySeverity,
      last24Hours,
    };
  }

  static exportEvents(): string {
    return JSON.stringify(this.events, null, 2);
  }

  static clearEvents(): void {
    const count = this.events.length;
    this.events = [];
    console.info(`[SecurityAudit] Cleared ${count} audit log events`);
  }
}
