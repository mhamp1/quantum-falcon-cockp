import { useEffect, useMemo, Suspense, lazy, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKVSafe as useKV } from '@/hooks/useKVFallback';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { isNonCriticalError } from '@/lib/errorSuppression';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { logError } from '@/lib/errorLogger';
import {
  House,
  Terminal,
  ChartLine,
  Lightning,
  Code,
  Vault,
  Users,
  Robot,
  Crown
} from '@phosphor-icons/react';
import { PulsingQLoader } from '@/components/shared/ShimmerCard';
import DebugHelper from '@/components/shared/DebugHelper';
import AIBotAssistant from '@/components/shared/AIBotAssistant';

// Lazy load all heavy components (code-splitting = instant startup)
const EnhancedDashboard = lazy(() => import('@/components/dashboard/EnhancedDashboard'));
const BotOverview = lazy(() => import('@/components/dashboard/BotOverview'));
const EnhancedAnalytics = lazy(() => import('@/components/dashboard/EnhancedAnalytics'));
const AdvancedTradingHub = lazy(() => import('@/components/trade/AdvancedTradingHub'));
const CreateStrategyPage = lazy(() => import('@/components/strategy/CreateStrategyPage'));
const VaultView = lazy(() => import('@/components/vault/VaultView'));
const SocialCommunity = lazy(() => import('@/components/community/SocialCommunity'));
const MultiAgentSystem = lazy(() => import('@/components/agents/MultiAgentSystemWrapper'));

interface UserAuth {
  isAuthenticated: boolean;
  userId: string | null;
  username: string | null;
  email: string | null;
  avatar: string | null;
  license?: {
    userId: string;
    tier: string;
    expiresAt: number;
    purchasedAt: number;
  };
}

interface Tab {
  id: string;
  label: string;
  icon: any;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
}

function LoadingFallback() {
  return <PulsingQLoader />;
}

function ComponentErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  if (isNonCriticalError(error)) {
    console.debug('[ComponentErrorFallback] Auto-recovering from non-critical error:', error.message);
    setTimeout(resetErrorBoundary, 0);
    return null;
  }

  console.error('[ComponentErrorFallback] Critical component error:', error);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="cyber-card p-8 max-w-2xl w-full space-y-6">
        <div className="flex items-center gap-4">
          <div className="text-destructive text-6xl">⚠️</div>
          <div>
            <h2 className="text-2xl font-bold text-destructive uppercase tracking-wide">
              Component Failure
            </h2>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              A critical error occurred in this module
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-foreground font-mono text-sm break-all">{error.message}</p>

          {error.stack && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground uppercase tracking-wide font-semibold">
                View Stack Trace
              </summary>
              <pre className="mt-3 p-4 bg-muted/30 rounded-lg overflow-auto max-h-64 scrollbar-thin text-xs font-mono text-muted-foreground">
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={resetErrorBoundary} size="lg" className="flex-1">
            Retry Component
          </Button>
          <Button onClick={() => window.location.reload()} variant="outline" size="lg" className="flex-1">
            Reload Application
          </Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(`Error: ${error.message}\n\nStack: ${error.stack || 'N/A'}`);
              alert('Error report copied to clipboard');
            }}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            Copy Error Report
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border/50">
          Quantum Falcon Cockpit v2025.1.0 — Production Build — November 18, 2025
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useKV<string>('active-tab', 'dashboard');
  const [auth, setAuth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
  });
  const tabs: Tab[] = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: House, component: EnhancedDashboard },
    { id: 'bot-overview', label: 'Bot Overview', icon: Terminal, component: BotOverview },
    { id: 'multi-agent', label: 'AI Agents', icon: Robot, component: MultiAgentSystem },
    { id: 'analytics', label: 'Analytics', icon: ChartLine, component: EnhancedAnalytics },
    { id: 'trading', label: 'Trading', icon: Lightning, component: AdvancedTradingHub },
    { id: 'vault', label: 'Vault', icon: Vault, component: VaultView },
    { id: 'community', label: 'Community', icon: Users, component: SocialCommunity },
    { id: 'strategy-builder', label: 'Strategy Builder', icon: Code, component: CreateStrategyPage },
  ], []);

  // Global non-critical error suppression + proper logging
  useEffect(() => {
    const shouldSuppress = (text: string, extra = '') => isNonCriticalError(text) || isNonCriticalError(extra);

    const handleWindowError = (e: ErrorEvent) => {
      if (shouldSuppress(e.message, e.filename || '')) {
        console.debug('[App] Suppressed non-critical error:', e.message.substring(0, 100));
        e.preventDefault();
        return;
      }
      logError(e.error || e.message, `Window Error: ${e.filename}:${e.lineno}`);
      console.error('[App] Uncaught window error:', e);
    };

    const handleRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason?.toString() || '';
      if (shouldSuppress(reason)) {
        console.debug('[App] Suppressed promise rejection:', reason.substring(0, 100));
        e.preventDefault();
        return;
      }
      logError(e.reason, 'Unhandled Promise Rejection');
      console.error('[App] Unhandled rejection:', e.reason);
    };

    window.addEventListener('error', handleWindowError, true);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleWindowError, true);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Tab navigation via custom events
  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (tabs.some(t => t.id === id)) setActiveTab(id);
    };
    window.addEventListener('navigate-tab', handler);
    return () => window.removeEventListener('navigate-tab', handler);
  }, [tabs]);

  // Legal disclosure opener
  useEffect(() => {
    const handler = () => setTimeout(() => window.dispatchEvent(new CustomEvent('open-settings-legal-tab')), 100);
    window.addEventListener('open-legal-risk-disclosure', handler);
    return () => window.removeEventListener('open-legal-risk-disclosure', handler);
  }, []);

  // License verification success handler
  const handleLicenseSuccess = (tier: string, expiresAt: number) => {
    console.log('[App] License verified:', { tier, expiresAt });
    const newAuth: UserAuth = {
      isAuthenticated: true,
      userId: `qf_user_${Date.now()}`,
      username: `QUANTUM_${tier.toUpperCase()}`,
      email: null,
      avatar: null,
      license: { userId: `qf_user_${Date.now()}`, tier, expiresAt, purchasedAt: Date.now() },
    };
    setAuth(newAuth);
  };

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component ?? EnhancedDashboard;

  return (
    <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
      <div className={cn('min-h-screen bg-background text-foreground flex', isMobile && 'flex-col')}>
        {/* Debug Helper (Ctrl+Shift+D) */}
        <DebugHelper />
        
        {/* AI Bot Assistant (bottom-right) */}
        <AIBotAssistant />
        
        {/* Desktop Left Sidebar Navigation */}
        {!isMobile && (
          <div className="fixed left-0 top-0 bottom-0 w-[240px] bg-card/95 backdrop-blur border-r border-primary/30 z-50 flex flex-col">
            {/* Header with Solana-purple logo and scanline effect */}
            <div className="p-6 border-b border-primary/30">
              <div className="scanline-effect mb-2">
                <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ 
                  color: '#9945FF',
                  textShadow: '0 0 10px rgba(153, 69, 255, 0.8), 0 0 20px rgba(153, 69, 255, 0.4)'
                }}>
                  QUANTUM<br />FALCON
                </h1>
              </div>
              <p className="text-xs uppercase tracking-widest flex items-center gap-2" style={{ color: '#9945FF' }}>
                <span className="w-2 h-2 rounded-full animate-pulse-glow" style={{ backgroundColor: '#9945FF' }}></span>
                SYSTEM_ONLINE
              </p>
            </div>

            {/* Navigation Tabs */}
            <nav className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 transition-all text-left uppercase tracking-wider text-xs font-semibold rounded-lg",
                    activeTab === tab.id
                      ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(0,255,255,0.3)] border-l-2 border-primary"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  )}
                >
                  <tab.icon size={18} weight={activeTab === tab.id ? "fill" : "regular"} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Footer with version and tier */}
            <div className="p-4 border-t border-primary/30 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Crown size={14} weight="fill" className="text-accent" />
                <span className="text-xs text-accent font-bold uppercase">
                  {auth.license?.tier || 'FREE'} TIER
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-center font-mono">
                v2025.1.0 • Production
              </p>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className={cn('flex-1', !isMobile && 'ml-[240px]')}>
          <Suspense fallback={<LoadingFallback />}>
            <ActiveComponent />
          </Suspense>
        </div>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border z-50">
            <div className="flex justify-around py-2">
              {tabs.slice(0, 5).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors",
                    activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <tab.icon size={24} weight={activeTab === tab.id ? "fill" : "regular"} />
                  <span className="text-xs">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </ErrorBoundary>
  );
}