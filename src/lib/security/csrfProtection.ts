import { AdvancedEncryption } from './encryption';

export class CSRFProtection {
  private static readonly TOKEN_KEY = 'csrf_token';
  private static readonly TOKEN_EXPIRY_MS = 3600000;
  private static tokens = new Map<string, { token: string; expiresAt: number }>();

  static async generateToken(sessionId: string): Promise<string> {
    const token = AdvancedEncryption.generateSecureToken(32);
    const expiresAt = Date.now() + this.TOKEN_EXPIRY_MS;

    this.tokens.set(sessionId, { token, expiresAt });

    console.debug(`[CSRFProtection] Generated token for session: ${sessionId.slice(0, 8)}...`);
    return token;
  }

  static validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);

    if (!stored) {
      console.warn(`[CSRFProtection] No token found for session: ${sessionId.slice(0, 8)}...`);
      return false;
    }

    if (Date.now() > stored.expiresAt) {
      this.tokens.delete(sessionId);
      console.warn(`[CSRFProtection] Token expired for session: ${sessionId.slice(0, 8)}...`);
      return false;
    }

    if (stored.token !== token) {
      console.error(`[CSRFProtection] Token mismatch - potential CSRF attack detected`);
      return false;
    }

    return true;
  }

  static invalidateToken(sessionId: string): void {
    this.tokens.delete(sessionId);
  }

  static cleanupExpiredTokens(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, data] of this.tokens.entries()) {
      if (now > data.expiresAt) {
        this.tokens.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.debug(`[CSRFProtection] Cleaned up ${cleaned} expired CSRF tokens`);
    }
  }

  static getTokenForSession(sessionId: string): string | null {
    const stored = this.tokens.get(sessionId);
    
    if (!stored) return null;
    
    if (Date.now() > stored.expiresAt) {
      this.tokens.delete(sessionId);
      return null;
    }

    return stored.token;
  }
}

setInterval(() => CSRFProtection.cleanupExpiredTokens(), 300000);
