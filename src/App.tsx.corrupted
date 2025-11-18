import { useEffect, useMemo, Suspense, lazy, useState, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKVSafe } from '@/hooks/useKVFallback';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { isNonCriticalError } fro
import { ErrorBoundary } from '@/components/ErrorBoundary';
const EnhancedDashboard = lazy(
import { isNonCriticalError } from '@/lib/errorSuppression';
const Agents = lazy(() => import('@/component

const EnhancedDashboard = lazy(() => import('@/components/dashboard/EnhancedDashboard'));
const BotOverview = lazy(() => import('@/components/dashboard/BotOverview'));
const EnhancedAnalytics = lazy(() => import('@/components/dashboard/EnhancedAnalytics'));
const Agents = lazy(() => import('@/components/agents/Agents'));
        <p className="text-muted-foreground uppercase tracking-wider 
    </div>
}
function ComponentErrorFallback({ error, resetErrorBoundary }: { error: Error; resetEr
    console.debug('[ComponentErrorFallback] Auto-recovering from non-critical error');
    return null;
  
  
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="flex items-center gap-3">

              Component Erro
          
            </p>
        </div>
          <p className="text-sm text-foreground font-semibold">
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
          >
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

          <Button
            onClick={resetErrorBoundary}
            className="flex-1"
    userId:
            Retry Component
    avatar: null,
  const errorCoun
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex-1"
    { id: '
            Reload Page
    { id: 'vault', 
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
    };
      </div>
      cons
  );
 

        event.s
  id: string;
      
  icon: any;
      console.error('[App] Window
}

export default function App() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useKV<string>('active-tab', 'dashboard');
  const [auth, setAuth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
        event.pr
    avatar: null,
      
  });
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasError, setHasError] = useState(false);
  const errorCountRef = useRef(0);
  const lastErrorTimeRef = useRef(0);

  const tabs: Tab[] = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: House, component: EnhancedDashboard },
    { id: 'bot-overview', label: 'Bot Overview', icon: Terminal, component: BotOverview },
    };
    { id: 'analytics', label: 'Analytics', icon: ChartLine, component: EnhancedAnalytics },
    { id: 'trading', label: 'Trading', icon: Lightning, component: AdvancedTradingHub },
    { id: 'strategy-builder', label: 'Strategy Builder', icon: Code, component: CreateStrategyPage },
    { id: 'vault', label: 'Vault', icon: Vault, component: VaultView },
    { id: 'community', label: 'Community', icon: Users, component: SocialCommunity },
          setActiveTab(newTab);
  ], []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
  }, [setAct
    return () => clearTimeout(timer);
    const

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
       
      
      logError(event.error || message, `Window Error: ${filename}:${event.lineno}`);
      
          purchasedAt: Date.now(),
        message,
      };
        lineno: event.lineno,
      setAuth(newAuth);
        error: event.error
      con
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || '';
      const stack = event.reason?.stack || '';
  };
      if (shouldSuppress(reason, stack)) {
        console.debug('[App] Promise rejection suppressed:', reason.substring(0, 100));
        event.preventDefault();
    }
      }
    
      logError(event.reason, 'Unhandled Promise Rejection');
      
      console.error('[App] Unhandled promise rejection:', {
    
        stack
    if (n
    };

    window.addEventListener('error', handleWindowError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleWindowError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };


  useEffect(() => {
    const handleNavigateTab = (e: Event) => {
          <
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
      <ErrorBoundary
        setTimeout(() => {
          const settingsTabEvent = new CustomEvent('open-settings-legal-tab')
          window.dispatchEvent(settingsTabEvent)
        }, 100)
      } catch (error) {
        console.error('[App] Error handling legal risk disclosure:', error);
      }


    window.addEventListener('open-legal-risk-disclosure', handleOpenLegalRiskDisclosure)
    return () => window.removeEventListener('open-legal-risk-disclosure', handleOpenLegalRiskDisclosure)
      <Suspense fall

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
          tier: tier as 'free' | 'starter' | 'trader' | 'pro' | 'elite' | 'lifetime',
          expiresAt: expiresAt,
                QUANTUM


























































































































































































































































