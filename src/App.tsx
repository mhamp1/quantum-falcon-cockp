import { useEffect, useMemo, Suspense, lazy, useState, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKVSafe as useKV } from '@/hooks/useKVFallback';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { isNonCriticalError } from '@/lib/errorSuppression';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { House, Terminal, ChartLine, Lightning, Code, Vault, Users } from '@phosphor-icons/react';
import { logError } from '@/lib/errorLogger';

// Lazy load components
const EnhancedDashboard = lazy(() => import('@/components/dashboard/EnhancedDashboard'));
const BotOverview = lazy(() => import('@/components/dashboard/BotOverview'));
const EnhancedAnalytics = lazy(() => import('@/components/dashboard/EnhancedAnalytics'));
const AdvancedTradingHub = lazy(() => import('@/components/trade/AdvancedTradingHub'));
const CreateStrategyPage = lazy(() => import('@/components/strategy/CreateStrategyPage'));
const VaultView = lazy(() => import('@/components/vault/VaultView'));
const SocialCommunity = lazy(() => import('@/components/community/SocialCommunity'));

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
        <p className="text-muted-foreground uppercase tracking-wider text-sm">Loading System...</p>
      </div>
    </div>
  );
}

function ComponentErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  if (isNonCriticalError(error)) {
    console.debug('[ComponentErrorFallback] Auto-recovering from non-critical error');
    setTimeout(resetErrorBoundary, 0);
    return null;
  }
  
  console.error('[ComponentErrorFallback] Displaying error:', error);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="cyber-card p-8 max-w-2xl w-full space-y-4">
        <div className="flex items-center gap-3">
          <div className="text-destructive text-5xl">⚠️</div>
          <div>
            <h2 className="text-xl font-bold text-destructive uppercase tracking-wide">
              Component Error
            </h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Critical system failure detected
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-foreground font-semibold">
            {error.message}
          </p>
          {error.stack && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground uppercase tracking-wide">
                Show Stack Trace
              </summary>
              <pre className="text-xs text-muted-foreground mt-2 p-4 bg-muted/20 rounded overflow-auto max-h-64 scrollbar-thin font-mono">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={resetErrorBoundary}
            className="flex-1"
          >
            Retry Component
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex-1"
          >
            Reload Page
          </Button>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(`Error: ${error.message}\n\nStack: ${error.stack || 'N/A'}`);
            }}
            variant="secondary"
            className="flex-1"
          >
            Copy Error
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          If this error persists, please contact support with the error details above.
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
  const errorCountRef = useRef(0);
  const lastErrorTimeRef = useRef(0);

  const tabs: Tab[] = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: House, component: EnhancedDashboard },
    { id: 'bot-overview', label: 'Bot Overview', icon: Terminal, component: BotOverview },
    { id: 'analytics', label: 'Analytics', icon: ChartLine, component: EnhancedAnalytics },
    { id: 'trading', label: 'Trading', icon: Lightning, component: AdvancedTradingHub },
    { id: 'strategy-builder', label: 'Strategy Builder', icon: Code, component: CreateStrategyPage },
    { id: 'vault', label: 'Vault', icon: Vault, component: VaultView },
    { id: 'community', label: 'Community', icon: Users, component: SocialCommunity },
  ], []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const shouldSuppress = (text: string, additionalText: string = '') => {
      return isNonCriticalError(text) || isNonCriticalError(additionalText);
    };

    const handleWindowError = (event: ErrorEvent) => {
      const message = event.message || '';
      const filename = event.filename || '';

      if (shouldSuppress(message, filename)) {
        console.debug('[App] Window error suppressed:', message.substring(0, 100));
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
      
      logError(event.error || message, `Window Error: ${filename}:${event.lineno}`);
      
      console.error('[App] Window error:', {
        message,
        filename,
        lineno: event.lineno,
        error: event.error
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || '';
      const stack = event.reason?.stack || '';

      if (shouldSuppress(reason, stack)) {
        console.debug('[App] Promise rejection suppressed:', reason.substring(0, 100));
        event.preventDefault();
        return;
      }
      
      logError(event.reason, 'Unhandled Promise Rejection');
      
      console.error('[App] Unhandled promise rejection:', {
        reason,
        stack
      });
    };

    window.addEventListener('error', handleWindowError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleWindowError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  useEffect(() => {
    const handleNavigateTab = (e: Event) => {
      try {
        const customEvent = e as CustomEvent<string>;
        const newTab = customEvent.detail;
        if (tabs.some(tab => tab.id === newTab)) {
          setActiveTab(newTab);
        }
      } catch (error) {
        console.error('[App] Error handling navigate tab:', error);
      }
    };

    window.addEventListener('navigate-tab', handleNavigateTab);
    return () => window.removeEventListener('navigate-tab', handleNavigateTab);
  }, [setActiveTab, tabs]);

  useEffect(() => {
    const handleOpenLegalRiskDisclosure = () => {
      try {
        setTimeout(() => {
          const settingsTabEvent = new CustomEvent('open-settings-legal-tab');
          window.dispatchEvent(settingsTabEvent);
        }, 100);
      } catch (error) {
        console.error('[App] Error handling legal risk disclosure:', error);
      }
    };

    window.addEventListener('open-legal-risk-disclosure', handleOpenLegalRiskDisclosure);
    return () => window.removeEventListener('open-legal-risk-disclosure', handleOpenLegalRiskDisclosure);
  }, []);

  const handleLicenseSuccess = async (tier: string, expiresAt: number) => {
    try {
      console.log('[App] ✅ License success:', { tier, expiresAt });
      
      const newAuth: UserAuth = {
        isAuthenticated: true,
        userId: `user_${Date.now()}`,
        username: `${tier.toUpperCase()}_User`,
        email: null,
        avatar: null,
        license: {
          userId: `user_${Date.now()}`,
          tier,
          expiresAt,
          purchasedAt: Date.now(),
        },
      };
      
      setAuth(newAuth);
      console.log('[App] Auth state updated:', newAuth);
    } catch (error) {
      console.error('[App] Error handling license success:', error);
    }
  };

  if (isInitializing) {
    return <LoadingFallback />;
  }

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="cyber-card p-8 max-w-2xl w-full text-center space-y-4">
          <div className="text-destructive text-6xl">💥</div>
          <h1 className="text-2xl font-bold text-destructive uppercase tracking-wide">
            Critical Error
          </h1>
          <p className="text-muted-foreground">
            The application encountered a critical error. Please reload the page.
          </p>
          <Button onClick={() => window.location.reload()} size="lg">
            Reload Application
          </Button>
        </div>
      </div>
    );
  }

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component || tabs[0].component;

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
