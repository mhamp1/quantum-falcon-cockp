import { useEffect, useMemo, Suspense, lazy, useState, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKVSafe as useKV } from '@/hooks/useKVFallback';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { isNonCriticalError } from '@/lib/errorSuppression';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { logError } from '@/lib/errorLogger';
import { House, Terminal, ChartLine, Lightning, Code, Vault, Users, Robot } from '@phosphor-icons/react';

// Lazy load all heavy components
const EnhancedDashboard = lazy(() => import('@/components/dashboard/EnhancedDashboard'));
const BotOverview = lazy(() => import('@/components/dashboard/BotOverview'));
const EnhancedAnalytics = lazy(() => import('@/components/dashboard/EnhancedAnalytics'));
const AdvancedTradingHub = lazy(() => import('@/components/trade/AdvancedTradingHub'));
const CreateStrategyPage = lazy(() => import('@/components/strategy/CreateStrategyPage'));
const VaultView = lazy(() => import('@/components/vault/VaultView'));
const SocialCommunity = lazy(() => import('@/components/community/SocialCommunity'));
const MultiAgentSystem = lazy(() => import('@/components/agents/MultiAgentSystem'));

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
  component: React.LazyExoticComponent<() => JSX.Element>;
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="text-5xl animate-pulse">⚡</div>
        <p className="text-muted-foreground uppercase tracking-wider text-sm">Initializing Quantum Core...</p>
      </div>
    </div>
  );
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
          <p className="text-foreground font-mono text-sm break-all">
            {error.message}
          </p>

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
              navigator.clipboard.writeText(`Error: ${error.message}\nStack: ${error.stack || 'N/A'}`);
              alert('Error copied to clipboard');
            }}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            Copy Error Report
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border/50">
          Quantum Falcon Cockpit v2025.1.0 • November 18, 2025 • Production Build
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
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasError, setHasError] = useState(false);

  const tabs: Tab[] = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: House, component: EnhancedDashboard },
    { id: 'bot-overview', label: 'Multi-Agent Command Center', icon: Terminal, component: BotOverview },
    { id: 'multi-agent', label: 'Live Agent Coordination', icon: Robot, component: MultiAgentSystem },
    { id: 'analytics', label: 'Advanced Analytics', icon: ChartLine, component: EnhancedAnalytics },
    { id: 'trading', label: 'Trading Hub', icon: Lightning, component: AdvancedTradingHub },
    { id: 'strategy-builder', label: 'Strategy Builder (Pro+)', icon: Code, component: CreateStrategyPage },
    { id: 'vault', label: 'BTC Profit Vault', icon: Vault, component: VaultView },
    { id: 'community', label: 'Marketplace & Community', icon: Users, component: SocialCommunity },
  ], []);

  // Initialize app
  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Global error suppression & logging
  useEffect(() => {
    const shouldSuppress = (text: string, additionalText = '') => 
      isNonCriticalError(text) || isNonCriticalError(additionalText);

    const handleWindowError = (event: ErrorEvent) => {
      if (shouldSuppress(event.message, event.filename || '')) {
        console.debug('[App] Suppressed non-critical error:', event.message.substring(0, 100));
        event.preventDefault();
        return;
      }

      logError(event.error || event.message, `Window Error: ${event.filename}:${event.lineno}`);
      console.error('[App] Uncaught window error:', event);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || '';
      if (shouldSuppress(reason)) {
        console.debug('[App] Suppressed promise rejection:', reason.substring(0, 100));
        event.preventDefault();
        return;
      }

      logError(event.reason, 'Unhandled Promise Rejection');
      console.error('[App] Unhandled rejection:', event.reason);
    };

    window.addEventListener('error', handleWindowError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleWindowError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Custom navigation events
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (tabs.some(t => t.id === detail)) {
        setActiveTab(detail);
      }
    };
    window.addEventListener('navigate-tab', handleNavigate);
    return () => window.removeEventListener('navigate-tab', handleNavigate);
  }, [tabs]);

  useEffect(() => {
    const handleLegalDisclosure = () => {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-settings-legal-tab'));
      }, 100);
    };
    window.addEventListener('open-legal-risk-disclosure', handleLegalDisclosure);
    return () => window.removeEventListener('open-legal-risk-disclosure', handleLegalDisclosure);
  }, []);

  // License success handler
  const handleLicenseSuccess = async (tier: string, expiresAt: number) => {
    console.log('[App] License verified:', { tier, expiresAt });
    const newAuth: UserAuth = {
      isAuthenticated: true,
      userId: `qf_user_${Date.now()}`,
      username: `QUANTUM_${tier.toUpperCase()}`,
      email: null,
      avatar: null,
      license: {
        userId: `qf_user_${Date.now()}`,
        tier,
        expiresAt,
        purchasedAt: Date.now(),
      },
    };
    setAuth(newAuth);
  };

  if (isInitializing) return <LoadingFallback />;
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <div className="text-8xl animate-bounce">💀</div>
          <h1 className="text-3xl font-bold text-destructive">System Overload</h1>
          <Button onClick={() => window.location.reload()} size="lg">
            Restart Quantum Core
          </Button>
        </div>
      </div>
    );
  }

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component ?? EnhancedDashboard;

  return (
    <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
      <div className={cn('min-h-screen bg-background text-foreground', isMobile && 'mobile-layout')}>
        <Suspense fallback={<LoadingFallback />}>
          <ActiveComponent />
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}