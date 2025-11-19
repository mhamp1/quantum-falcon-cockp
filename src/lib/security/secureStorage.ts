import { AdvancedEncryption } from './encryption';
import { SecurityAuditLogger, SecurityEventType, SecuritySeverity } from './auditLogger';

export class SecureStorage {
  private static readonly ENCRYPTION_KEY_NAME = '_qf_ek';
  private static encryptionKey: string | null = null;

  private static async getOrCreateEncryptionKey(): Promise<string> {
    if (this.encryptionKey) {
      return this.encryptionKey;
    }

    try {
      const stored = sessionStorage.getItem(this.ENCRYPTION_KEY_NAME);
      
      if (stored) {
        this.encryptionKey = stored;
        return stored;
      }

      const newKey = AdvancedEncryption.generateSecureToken(64);
      sessionStorage.setItem(this.ENCRYPTION_KEY_NAME, newKey);
      this.encryptionKey = newKey;
      
      console.info('[SecureStorage] Generated new encryption key for session');
      return newKey;
    } catch (error) {
      console.error('[SecureStorage] Failed to access session storage:', error);
      
      if (!this.encryptionKey) {
        this.encryptionKey = AdvancedEncryption.generateSecureToken(64);
      }
      
      return this.encryptionKey;
    }
  }

  static async setItem(key: string, value: any, encrypt: boolean = true): Promise<void> {
    try {
      const serialized = JSON.stringify(value);

      if (encrypt) {
        const encryptionKey = await this.getOrCreateEncryptionKey();
        const encrypted = await AdvancedEncryption.encrypt(serialized, encryptionKey);
        
        await window.spark.kv.set(`secure:${key}`, encrypted);
        
        SecurityAuditLogger.logEvent(
          SecurityEventType.SENSITIVE_DATA_ACCESS,
          SecuritySeverity.INFO,
          { action: 'write', key, encrypted: true }
        );
      } else {
        await window.spark.kv.set(key, value);
      }
    } catch (error) {
      SecurityAuditLogger.logEvent(
        SecurityEventType.ENCRYPTION_FAILURE,
        SecuritySeverity.ERROR,
        { action: 'write', key, error: String(error) }
      );
      throw new Error(`Failed to securely store data: ${error}`);
    }
  }

  static async getItem<T>(key: string, encrypted: boolean = true): Promise<T | null> {
    try {
      if (encrypted) {
        const stored = await window.spark.kv.get<string>(`secure:${key}`);
        
        if (!stored) {
          return null;
        }

        const encryptionKey = await this.getOrCreateEncryptionKey();
        const decrypted = await AdvancedEncryption.decrypt(stored, encryptionKey);
        
        SecurityAuditLogger.logEvent(
          SecurityEventType.SENSITIVE_DATA_ACCESS,
          SecuritySeverity.INFO,
          { action: 'read', key, encrypted: true }
        );
        
        return JSON.parse(decrypted) as T;
      } else {
        const result = await window.spark.kv.get<T>(key);
        return result === undefined ? null : result;
      }
    } catch (error) {
      SecurityAuditLogger.logEvent(
        SecurityEventType.ENCRYPTION_FAILURE,
        SecuritySeverity.ERROR,
        { action: 'read', key, error: String(error) }
      );
      return null;
    }
  }

  static async removeItem(key: string, wasEncrypted: boolean = true): Promise<void> {
    try {
      const actualKey = wasEncrypted ? `secure:${key}` : key;
      await window.spark.kv.delete(actualKey);
      
      SecurityAuditLogger.logEvent(
        SecurityEventType.SENSITIVE_DATA_ACCESS,
        SecuritySeverity.INFO,
        { action: 'delete', key }
      );
    } catch (error) {
      console.error('[SecureStorage] Failed to remove item:', error);
    }
  }

  static async clearAll(): Promise<void> {
    try {
      const keys = await window.spark.kv.keys();
      const secureKeys = keys.filter(k => k.startsWith('secure:'));
      
      for (const key of secureKeys) {
        await window.spark.kv.delete(key);
      }
      
      SecurityAuditLogger.logEvent(
        SecurityEventType.SENSITIVE_DATA_ACCESS,
        SecuritySeverity.WARNING,
        { action: 'clearAll', count: secureKeys.length }
      );
      
      console.info(`[SecureStorage] Cleared ${secureKeys.length} secure items`);
    } catch (error) {
      console.error('[SecureStorage] Failed to clear storage:', error);
    }
  }

  static clearEncryptionKey(): void {
    this.encryptionKey = null;
    try {
      sessionStorage.removeItem(this.ENCRYPTION_KEY_NAME);
    } catch (error) {
      console.error('[SecureStorage] Failed to clear encryption key:', error);
    }
  }
}
