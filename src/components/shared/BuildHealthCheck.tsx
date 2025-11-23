// Build Health Check Component
// Shows build info and detects common issues
// Only visible in development mode or when errors occur

import { useState, useEffect } from 'react';

interface HealthStatus {
  buildTime: string;
  chunkLoadErrors: number;
  walletInitialized: boolean;
  reactVersion: string;
  hasErrors: boolean;
}

export function BuildHealthCheck() {
  const [status, setStatus] = useState<HealthStatus>({
    buildTime: new Date().toISOString(),
    chunkLoadErrors: (window as any).__moduleErrorCount || 0,
    walletInitialized: false,
    reactVersion: '19.0.0',
    hasErrors: false,
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in dev mode or if errors detected
    const isDev = import.meta.env.DEV;
    const hasErrors = status.chunkLoadErrors > 0;
    
    setIsVisible(isDev || hasErrors);

    // Update error count every 2 seconds
    const interval = setInterval(() => {
      const errorCount = (window as any).__moduleErrorCount || 0;
      setStatus(prev => ({
        ...prev,
        chunkLoadErrors: errorCount,
        hasErrors: errorCount > 0,
      }));
    }, 2000);

    // Listen for wallet initialization
    const walletListener = () => {
      setStatus(prev => ({ ...prev, walletInitialized: true }));
    };
    window.addEventListener('wallet-initialized', walletListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('wallet-initialized', walletListener);
    };
  }, [status.chunkLoadErrors]);

  // Don't render if not visible and no errors
  if (!isVisible && !status.hasErrors) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] pointer-events-none">
      <div className="bg-card/95 backdrop-blur-lg border border-border rounded-lg p-3 shadow-lg max-w-xs pointer-events-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Build Health
          </h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            ✕
          </button>
        </div>

        <div className="space-y-1.5 text-xs">
          {/* Chunk Load Errors */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Chunk Errors:</span>
            <span className={status.chunkLoadErrors > 0 ? 'text-destructive font-bold' : 'text-primary'}>
              {status.chunkLoadErrors > 0 ? `${status.chunkLoadErrors} ⚠️` : '0 ✓'}
            </span>
          </div>

          {/* Wallet Status */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Wallet:</span>
            <span className={status.walletInitialized ? 'text-primary' : 'text-yellow-500'}>
              {status.walletInitialized ? 'Ready ✓' : 'Loading...'}
            </span>
          </div>

          {/* React Version */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">React:</span>
            <span className="text-primary">{status.reactVersion}</span>
          </div>

          {/* Build Mode */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Mode:</span>
            <span className="text-primary">
              {import.meta.env.DEV ? 'Development' : 'Production'}
            </span>
          </div>

          {/* Error Warning */}
          {status.hasErrors && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="text-destructive text-xs">
                ⚠️ Module loading issues detected
              </div>
              <div className="text-muted-foreground text-xs mt-1">
                App will auto-recover after 5+ errors
              </div>
            </div>
          )}

          {/* Success Message */}
          {!status.hasErrors && import.meta.env.DEV && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="text-primary text-xs">
                ✓ All systems operational
              </div>
            </div>
          )}
        </div>

        {/* Build Info Footer */}
        <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground text-center">
          v2025.1.0 • {new Date(status.buildTime).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
