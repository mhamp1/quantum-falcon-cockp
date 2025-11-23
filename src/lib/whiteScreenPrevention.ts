// White Screen Prevention System
// Monitors app health and auto-recovers from white screens

export class WhiteScreenPrevention {
  private static isMonitoring = false;
  private static renderCheckInterval: ReturnType<typeof setInterval> | null = null;
  private static lastRenderCheck = Date.now();
  private static consecutiveFailures = 0;
  private static readonly MAX_FAILURES = 3;
  private static readonly CHECK_INTERVAL = 2000; // Check every 2 seconds

  /**
   * Start monitoring for white screens
   */
  static startMonitoring() {
    if (this.isMonitoring) {
      console.debug('[WhiteScreenPrevention] Already monitoring');
      return;
    }

    console.log('[WhiteScreenPrevention] Starting white screen monitoring');
    this.isMonitoring = true;
    this.lastRenderCheck = Date.now();
    this.consecutiveFailures = 0;

    // Check if root has content periodically
    this.renderCheckInterval = setInterval(() => {
      this.checkRenderHealth();
    }, this.CHECK_INTERVAL);

    // Also listen for visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        console.debug('[WhiteScreenPrevention] Page became visible, checking health');
        this.checkRenderHealth();
      }
    });
  }

  /**
   * Stop monitoring
   */
  static stopMonitoring() {
    if (this.renderCheckInterval) {
      clearInterval(this.renderCheckInterval);
      this.renderCheckInterval = null;
    }
    this.isMonitoring = false;
    console.log('[WhiteScreenPrevention] Stopped monitoring');
  }

  /**
   * Check if the app is actually rendering content
   */
  private static checkRenderHealth() {
    const root = document.getElementById('root');
    
    if (!root) {
      console.error('[WhiteScreenPrevention] Root element not found!');
      this.handleFailure();
      return;
    }

    const hasContent = root.innerHTML.length > 100; // Must have at least some content
    const hasChildren = root.children.length > 0;
    const hasVisibleContent = root.offsetHeight > 0 && root.offsetWidth > 0;

    if (!hasContent || !hasChildren || !hasVisibleContent) {
      this.consecutiveFailures++;
      console.warn(
        `[WhiteScreenPrevention] Health check failed (${this.consecutiveFailures}/${this.MAX_FAILURES})`,
        { hasContent, hasChildren, hasVisibleContent }
      );

      if (this.consecutiveFailures >= this.MAX_FAILURES) {
        this.handleCriticalFailure();
      }
    } else {
      // Reset failure count on success
      if (this.consecutiveFailures > 0) {
        console.log('[WhiteScreenPrevention] Render health recovered');
        this.consecutiveFailures = 0;
      }
      this.lastRenderCheck = Date.now();
    }
  }

  /**
   * Handle a single failure
   */
  private static handleFailure() {
    console.warn('[WhiteScreenPrevention] Detected potential white screen');
    // Don't do anything yet, wait for consecutive failures
  }

  /**
   * Handle critical failure (multiple consecutive failures)
   */
  private static handleCriticalFailure() {
    console.error('[WhiteScreenPrevention] ========== CRITICAL: WHITE SCREEN DETECTED ==========');
    console.error('[WhiteScreenPrevention] Multiple health checks failed, initiating recovery');

    this.stopMonitoring();

    // Show user-friendly recovery UI
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: oklch(0.08 0.02 280);
          color: oklch(0.85 0.12 195);
          font-family: system-ui, -apple-system, sans-serif;
          padding: 2rem;
          text-align: center;
        ">
          <div style="max-width: 600px;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
            <h1 style="
              font-size: 2rem;
              margin-bottom: 1rem;
              color: oklch(0.72 0.20 195);
              text-shadow: 0 0 10px oklch(0.72 0.20 195 / 0.3);
            ">
              Application Recovery Needed
            </h1>
            <p style="margin-bottom: 2rem; opacity: 0.8; line-height: 1.6;">
              The application detected a rendering issue and needs to reload.
              This usually happens due to network issues or browser cache problems.
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
              <button
                onclick="window.location.reload()"
                style="
                  padding: 0.875rem 2rem;
                  background: oklch(0.72 0.20 195);
                  color: oklch(0.08 0.02 280);
                  border: none;
                  cursor: pointer;
                  font-size: 0.875rem;
                  font-weight: bold;
                  text-transform: uppercase;
                  border-radius: 0.5rem;
                  box-shadow: 0 0 20px oklch(0.72 0.20 195 / 0.3);
                "
              >
                Reload Now
              </button>
              <button
                onclick="localStorage.clear(); sessionStorage.clear(); window.location.reload();"
                style="
                  padding: 0.875rem 2rem;
                  background: transparent;
                  color: oklch(0.68 0.18 330);
                  border: 1px solid oklch(0.68 0.18 330);
                  cursor: pointer;
                  font-size: 0.875rem;
                  font-weight: bold;
                  text-transform: uppercase;
                  border-radius: 0.5rem;
                "
              >
                Clear Cache & Reload
              </button>
            </div>
            <p style="margin-top: 2rem; font-size: 0.75rem; opacity: 0.5;">
              If this keeps happening, try a different browser or contact support.
            </p>
          </div>
        </div>
      `;
    }

    // Auto-reload after 5 seconds if user doesn't click
    setTimeout(() => {
      console.log('[WhiteScreenPrevention] Auto-reloading application');
      window.location.reload();
    }, 5000);
  }

  /**
   * Mark that a successful render occurred
   * Call this from your App component's useEffect
   */
  static markRenderSuccess() {
    this.lastRenderCheck = Date.now();
    this.consecutiveFailures = 0;
  }

  /**
   * Get monitoring status
   */
  static getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      consecutiveFailures: this.consecutiveFailures,
      lastCheck: this.lastRenderCheck,
      timeSinceLastCheck: Date.now() - this.lastRenderCheck
    };
  }
}

// Auto-start monitoring
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      WhiteScreenPrevention.startMonitoring();
    });
  } else {
    WhiteScreenPrevention.startMonitoring();
  }
}
