export { AdvancedEncryption } from './encryption';
export { AdvancedRateLimiter } from './rateLimiter';
export { InputSanitizer } from './inputSanitizer';
export { SessionManager } from './sessionManager';
export { CSRFProtection } from './csrfProtection';
export { SecureStorage } from './secureStorage';
export { ContentSecurityPolicy } from './contentSecurityPolicy';
export {
  SecurityAuditLogger,
  SecurityEventType,
  SecuritySeverity,
} from './auditLogger';

export class SecurityManager {
  private static initialized = false;

  static initialize(): void {
    if (this.initialized) {
      console.debug('[SecurityManager] Already initialized');
      return;
    }

    if (typeof window !== 'undefined') {
      try {
        ContentSecurityPolicy.initialize();
      } catch (error) {
        console.warn('[SecurityManager] CSP initialization skipped:', error);
      }

      window.addEventListener('security:critical-alert', (e) => {
        const event = e as CustomEvent;
        console.error('🚨🚨🚨 CRITICAL SECURITY ALERT:', event.detail);
      });

      window.addEventListener('security:csp-violation-threshold', (e) => {
        const event = e as CustomEvent;
        console.error('🚨 CSP VIOLATION THRESHOLD EXCEEDED:', event.detail);
      });
    }

    this.initialized = true;
    console.info('✅ [SecurityManager] Advanced security system initialized');
  }

  static isInitialized(): boolean {
    return this.initialized;
  }
}
