export class InputSanitizer {
  private static readonly XSS_PATTERNS = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<img[^>]+src[^>]*>/gi,
    /eval\(/gi,
    /expression\(/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
  ];

  private static readonly SQL_PATTERNS = [
    /(\bOR\b|\bAND\b).*?=.*?/gi,
    /union.*?select/gi,
    /insert.*?into/gi,
    /delete.*?from/gi,
    /drop.*?table/gi,
    /update.*?set/gi,
    /exec(\s|\+)+(s|x)p\w+/gi,
  ];

  private static readonly PATH_TRAVERSAL_PATTERNS = [
    /\.\.\//g,
    /\.\.%2F/gi,
    /%2e%2e%2f/gi,
  ];

  static sanitizeHTML(input: string): string {
    if (!input) return '';
    
    let sanitized = input;

    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    for (const pattern of this.XSS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }

    return sanitized;
  }

  static sanitizeSQL(input: string): string {
    if (!input) return '';
    
    let sanitized = input;

    for (const pattern of this.SQL_PATTERNS) {
      if (pattern.test(sanitized)) {
        console.warn('[InputSanitizer] Potential SQL injection detected');
        sanitized = sanitized.replace(pattern, '');
      }
    }

    return sanitized.replace(/[;'"\\]/g, '');
  }

  static sanitizePath(input: string): string {
    if (!input) return '';
    
    let sanitized = input;

    for (const pattern of this.PATH_TRAVERSAL_PATTERNS) {
      if (pattern.test(sanitized)) {
        console.warn('[InputSanitizer] Path traversal attempt detected');
        sanitized = sanitized.replace(pattern, '');
      }
    }

    return sanitized;
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  static validateURL(url: string): boolean {
    try {
      const parsed = new URL(url);
      const allowedProtocols = ['http:', 'https:'];
      return allowedProtocols.includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  static sanitizeJSON<T>(input: unknown): T | null {
    try {
      if (typeof input === 'string') {
        const parsed = JSON.parse(input);
        return this.deepSanitizeObject(parsed) as T;
      }
      return this.deepSanitizeObject(input) as T;
    } catch (error) {
      console.error('[InputSanitizer] Invalid JSON:', error);
      return null;
    }
  }

  private static deepSanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepSanitizeObject(item));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const sanitizedKey = this.sanitizeHTML(key);
          sanitized[sanitizedKey] = this.deepSanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    if (typeof obj === 'string') {
      return this.sanitizeHTML(obj);
    }

    return obj;
  }

  static validateAPIKey(apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') return false;
    
    if (apiKey.length < 32 || apiKey.length > 128) return false;
    
    const validPattern = /^[A-Za-z0-9_\-.]+$/;
    return validPattern.test(apiKey);
  }

  static maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (!data || data.length <= visibleChars) return '****';
    
    const visible = data.slice(-visibleChars);
    const masked = '*'.repeat(Math.min(8, data.length - visibleChars));
    return masked + visible;
  }
}
