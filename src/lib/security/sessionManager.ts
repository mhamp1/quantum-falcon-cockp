import { AdvancedEncryption } from './encryption';

interface SessionData {
  userId: string;
  token: string;
  createdAt: number;
  lastActivity: number;
  ipAddress?: string;
  userAgent?: string;
  fingerprint: string;
}

export class SessionManager {
  private static readonly SESSION_TIMEOUT = 3600000;
  private static readonly IDLE_TIMEOUT = 1800000;
  private static readonly MAX_SESSIONS_PER_USER = 5;
  private static sessions = new Map<string, SessionData>();

  static async createSession(userId: string): Promise<string> {
    const token = AdvancedEncryption.generateSecureToken(64);
    const fingerprint = await this.generateFingerprint();

    const sessionData: SessionData = {
      userId,
      token,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      fingerprint,
    };

    const userSessions = Array.from(this.sessions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => b.lastActivity - a.lastActivity);

    if (userSessions.length >= this.MAX_SESSIONS_PER_USER) {
      const oldestSession = userSessions[userSessions.length - 1];
      this.sessions.delete(oldestSession.token);
      console.warn(`[SessionManager] Removed oldest session for user ${userId} (max sessions exceeded)`);
    }

    this.sessions.set(token, sessionData);
    console.info(`[SessionManager] Session created for user ${userId}`);

    return token;
  }

  static async validateSession(token: string): Promise<boolean> {
    const session = this.sessions.get(token);

    if (!session) {
      return false;
    }

    const now = Date.now();
    const sessionAge = now - session.createdAt;
    const idleTime = now - session.lastActivity;

    if (sessionAge > this.SESSION_TIMEOUT) {
      this.sessions.delete(token);
      console.warn(`[SessionManager] Session expired (timeout): ${token.slice(0, 8)}...`);
      return false;
    }

    if (idleTime > this.IDLE_TIMEOUT) {
      this.sessions.delete(token);
      console.warn(`[SessionManager] Session expired (idle): ${token.slice(0, 8)}...`);
      return false;
    }

    const currentFingerprint = await this.generateFingerprint();
    if (currentFingerprint !== session.fingerprint) {
      this.sessions.delete(token);
      console.error(`[SessionManager] Session fingerprint mismatch - potential hijacking attempt`);
      return false;
    }

    session.lastActivity = now;
    return true;
  }

  static invalidateSession(token: string): void {
    const session = this.sessions.get(token);
    if (session) {
      this.sessions.delete(token);
      console.info(`[SessionManager] Session invalidated: ${token.slice(0, 8)}...`);
    }
  }

  static invalidateAllUserSessions(userId: string): void {
    let count = 0;
    for (const [token, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(token);
        count++;
      }
    }
    console.info(`[SessionManager] Invalidated ${count} sessions for user ${userId}`);
  }

  static getSessionData(token: string): SessionData | null {
    return this.sessions.get(token) || null;
  }

  private static async generateFingerprint(): Promise<string> {
    const components = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset().toString(),
      screen.colorDepth.toString(),
      screen.width.toString(),
      screen.height.toString(),
    ];

    const fingerprintString = components.join('|');
    return AdvancedEncryption.hash(fingerprintString);
  }

  static cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [token, session] of this.sessions.entries()) {
      const sessionAge = now - session.createdAt;
      const idleTime = now - session.lastActivity;

      if (sessionAge > this.SESSION_TIMEOUT || idleTime > this.IDLE_TIMEOUT) {
        this.sessions.delete(token);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.info(`[SessionManager] Cleaned up ${cleaned} expired sessions`);
    }
  }

  static getActiveSessionCount(): number {
    return this.sessions.size;
  }

  static getUserSessionCount(userId: string): number {
    return Array.from(this.sessions.values()).filter(s => s.userId === userId).length;
  }
}

setInterval(() => SessionManager.cleanupExpiredSessions(), 300000);
