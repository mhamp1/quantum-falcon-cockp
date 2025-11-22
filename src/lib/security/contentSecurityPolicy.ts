export class ContentSecurityPolicy {
  private static violationCount = 0;
  private static readonly MAX_VIOLATIONS = 10;

  static initialize(): void {
    if (typeof document !== 'undefined') {
      document.addEventListener('securitypolicyviolation', (e) => {
        this.handleViolation(e as SecurityPolicyViolationEvent);
      });

      // CSP monitoring initialized - no console output needed
    }
  }

  private static handleViolation(event: SecurityPolicyViolationEvent): void {
    this.violationCount++;

    console.error('[CSP] Security Policy Violation Detected:', {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
      columnNumber: event.columnNumber,
    });

    if (this.violationCount >= this.MAX_VIOLATIONS) {
      console.error(
        `🚨 [CSP] CRITICAL: ${this.violationCount} CSP violations detected - possible attack in progress`
      );
      
      window.dispatchEvent(
        new CustomEvent('security:csp-violation-threshold', {
          detail: { count: this.violationCount },
        })
      );
    }
  }

  static getViolationCount(): number {
    return this.violationCount;
  }

  static resetViolationCount(): void {
    this.violationCount = 0;
  }

  static getRecommendedPolicy(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com data:",
      "connect-src 'self' https://api.github.com wss: ws:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ');
  }
}

if (typeof window !== 'undefined') {
  ContentSecurityPolicy.initialize();
}
