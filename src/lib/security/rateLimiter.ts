interface RateLimitEntry {
  count: number;
  resetAt: number;
  blocked: boolean;
  violations: number;
}

export class AdvancedRateLimiter {
  private static limits = new Map<string, RateLimitEntry>();
  private static readonly WINDOW_MS = 60000;
  private static readonly MAX_REQUESTS = 100;
  private static readonly BLOCK_DURATION_MS = 300000;
  private static readonly MAX_VIOLATIONS = 3;

  static checkLimit(identifier: string, maxRequests: number = this.MAX_REQUESTS): boolean {
    const now = Date.now();
    const key = `ratelimit:${identifier}`;
    
    let entry = this.limits.get(key);

    if (!entry || now > entry.resetAt) {
      entry = {
        count: 0,
        resetAt: now + this.WINDOW_MS,
        blocked: false,
        violations: entry?.violations || 0,
      };
      this.limits.set(key, entry);
    }

    if (entry.blocked) {
      if (now < entry.resetAt) {
        console.warn(`[RateLimiter] ${identifier} is blocked until ${new Date(entry.resetAt).toISOString()}`);
        return false;
      }
      entry.blocked = false;
      entry.violations = Math.max(0, entry.violations - 1);
    }

    entry.count++;

    if (entry.count > maxRequests) {
      entry.violations++;
      
      if (entry.violations >= this.MAX_VIOLATIONS) {
        entry.blocked = true;
        entry.resetAt = now + this.BLOCK_DURATION_MS;
        console.error(`[RateLimiter] ${identifier} BLOCKED for ${this.BLOCK_DURATION_MS / 1000}s due to repeated violations`);
        return false;
      }

      console.warn(`[RateLimiter] ${identifier} exceeded rate limit (${entry.count}/${maxRequests})`);
      return false;
    }

    return true;
  }

  static getRemainingRequests(identifier: string, maxRequests: number = this.MAX_REQUESTS): number {
    const key = `ratelimit:${identifier}`;
    const entry = this.limits.get(key);

    if (!entry || Date.now() > entry.resetAt) {
      return maxRequests;
    }

    return Math.max(0, maxRequests - entry.count);
  }

  static clearLimits(identifier?: string): void {
    if (identifier) {
      this.limits.delete(`ratelimit:${identifier}`);
    } else {
      this.limits.clear();
    }
  }

  static cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetAt && !entry.blocked) {
        this.limits.delete(key);
      }
    }
  }
}

setInterval(() => AdvancedRateLimiter.cleanup(), 300000);
