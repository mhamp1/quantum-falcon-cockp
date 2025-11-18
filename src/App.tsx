import { useKV } from '@github/spark/hooks';
import { useEffect, useMemo, Suspense, lazy, useState, useRef } from 'react';
import { House, Robot, ChartLine, Vault, Users, Gear, Terminal, Lightning, Code } from '@phosphor-icons/react';
import { useIsMobile } from '@/hooks/use-mobile';
import { UserAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { motion, LazyMotion, domAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { toast } from 'sonner';

const EnhancedDashboard = lazy(() => import('@/components/dashboard/EnhancedDashboard'));
const BotOverview = lazy(() => import('@/components/dashboard/BotOverview'));
const EnhancedAnalytics = lazy(() => import('@/components/dashboard/EnhancedAnalytics'));
const Agents = lazy(() => import('@/components/agents/Agents'));
const VaultView = lazy(() => import('@/components/vault/VaultView'));
const SocialCommunity = lazy(() => import('@/components/community/SocialCommunity'));
const AdvancedTradingHub = lazy(() => import('@/components/trade/AdvancedTradingHub'));
const EnhancedSettings = lazy(() => import('@/components/settings/EnhancedSettings'));
const CreateStrategyPage = lazy(() => import('@/components/strategy/CreateStrategyPage'));
const AIAssistant = lazy(() => import('@/components/shared/AIAssistant'));
const LicenseAuth = lazy(() => import('@/components/auth/LicenseAuth'));
const LegalFooter = lazy(() => import('@/components/shared/LegalFooter'));
const RiskDisclosureBanner = lazy(() => import('@/components/shared/RiskDisclosureBanner'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground uppercase tracking-wider text-sm">Loading System...</p>
      </div>
    </div>
  );
}

function ComponentErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  console.error('[App] Component error:', error);
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="cyber-card p-8 max-w-md w-full space-y-4 text-center">
        <div className="text-destructive text-5xl">⚠️</div>
        <h2 className="text-xl font-bold text-destructive uppercase tracking-wide">
          Component Error
        </h2>
        <p className="text-sm text-muted-foreground">
          {error.message}
        </p>
        <div className="flex gap-2">
          <Button
            onClick={resetErrorBoundary}
            className="flex-1"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex-1"
          >
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
}

interface Tab {
  id: string;
  label: string;
  icon: any;
  component: React.ComponentType;
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
    license: null
  });
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasError, setHasError] = useState(false);
  const errorCountRef = useRef(0);
  const lastErrorTimeRef = useRef(0);

  const tabs: Tab[] = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: House, component: EnhancedDashboard },
    { id: 'bot-overview', label: 'Bot Overview', icon: Terminal, component: BotOverview },
    { id: 'agents', label: 'AI Agents', icon: Robot, component: Agents },
    { id: 'analytics', label: 'Analytics', icon: ChartLine, component: EnhancedAnalytics },
    { id: 'trading', label: 'Trading', icon: Lightning, component: AdvancedTradingHub },
    { id: 'strategy-builder', label: 'Strategy Builder', icon: Code, component: CreateStrategyPage },
    { id: 'vault', label: 'Vault', icon: Vault, component: VaultView },
    { id: 'community', label: 'Community', icon: Users, component: SocialCommunity },
    { id: 'settings', label: 'Settings', icon: Gear, component: EnhancedSettings },
  ], []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleWindowError = (event: ErrorEvent) => {
      const message = event.message || '';
      const filename = event.filename || '';
      
      if (
        message.includes('R3F') ||
        message.includes('data-component-loc') ||
        message.includes('__r3f') ||
        message.includes('Cannot set "data-component-loc-end"') ||
        message.includes('child.object is undefined') ||
        message.includes('addEventListener') && message.includes('null') ||
        filename.includes('@react-three/fiber') ||
        filename.includes('react-three')
      ) {
        console.warn('[App] R3F/Canvas error suppressed:', message);
        event.preventDefault();
        event.stopPropagation();
        return true;
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || '';
      const stack = event.reason?.stack || '';
      
      if (
        reason.includes('R3F') ||
        reason.includes('data-component-loc') ||
        reason.includes('__r3f') ||
        reason.includes('child.object is undefined') ||
        reason.includes('addEventListener') && reason.includes('null') ||
        stack.includes('@react-three/fiber') ||
        stack.includes('react-three')
      ) {
        console.warn('[App] R3F promise rejection suppressed:', reason);
        event.preventDefault();
      }
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
        setActiveTab('settings')
        setTimeout(() => {
          const settingsTabEvent = new CustomEvent('open-settings-legal-tab')
          window.dispatchEvent(settingsTabEvent)
        }, 100)
      } catch (error) {
        console.error('[App] Error handling legal risk disclosure:', error);
      }
    }

    window.addEventListener('open-legal-risk-disclosure', handleOpenLegalRiskDisclosure)
    return () => window.removeEventListener('open-legal-risk-disclosure', handleOpenLegalRiskDisclosure)
  }, [setActiveTab])

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
          purchasedAt: Date.now(),
          isActive: true
        }
      };
      
      console.log('[App] 💾 Saving auth state:', newAuth);
      setAuth(newAuth);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('[App] ✅ Auth state saved, app should now load');
      
      toast.success(`Welcome to ${tier.toUpperCase()} tier!`, {
        description: 'Dashboard loading...'
      });
    } catch (error) {
      console.error('[App] Error in license success handler:', error);
      toast.error('Failed to save license. Please try again.');
    }
  };

  const handleError = (error: Error, errorInfo: { componentStack: string }) => {
    const message = error.message || '';
    const stack = errorInfo.componentStack || '';
    
    if (
      message.includes('R3F') || 
      message.includes('data-component-loc') ||
      message.includes('__r3f') ||
      message.includes('Cannot set "data-component-loc-end"') ||
      message.includes('child.object is undefined') ||
      message.includes('addEventListener') && message.includes('null') ||
      stack.includes('@react-three/fiber') ||
      stack.includes('react-three')
    ) {
      console.warn('[App] React Three Fiber error suppressed:', message);
      return;
    }
    
    const now = Date.now();
    
    if (now - lastErrorTimeRef.current < 5000) {
      errorCountRef.current += 1;
    } else {
      errorCountRef.current = 1;
    }
    
    lastErrorTimeRef.current = now;
    
    if (errorCountRef.current > 5) {
      console.error('[App] Too many errors detected. Preventing refresh loop.');
      setHasError(true);
      return;
    }
    
    console.error('[App] Error caught:', error, errorInfo);
  };

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="cyber-card p-8 max-w-md w-full space-y-4 text-center">
          <div className="text-destructive text-5xl">🔄</div>
          <h2 className="text-xl font-bold text-destructive uppercase tracking-wide">
            Error Loop Detected
          </h2>
          <p className="text-sm text-muted-foreground">
            Multiple errors occurred. Please reload the page manually.
          </p>
          <Button
            onClick={() => {
              errorCountRef.current = 0;
              setHasError(false);
              window.location.reload();
            }}
            className="w-full"
          >
            Reload Application
          </Button>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return <LoadingFallback />;
  }

  if (!auth?.isAuthenticated) {
    return (
      <ErrorBoundary
        FallbackComponent={ComponentErrorFallback}
        onError={handleError}
      >
        <Suspense fallback={<LoadingFallback />}>
          <LicenseAuth onSuccess={handleLicenseSuccess} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  const Component = tabs.find(tab => tab.id === activeTab)?.component || EnhancedDashboard;

  return (
    <ErrorBoundary
      FallbackComponent={ComponentErrorFallback}
      onError={handleError}
    >
      <LazyMotion features={domAnimation} strict>
        <Suspense fallback={null}>
          <RiskDisclosureBanner />
        </Suspense>
        
        <div className="min-h-screen bg-background flex">
        {!isMobile && (
          <motion.aside 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="fixed left-0 top-0 h-screen w-64 border-r-2 border-primary/30 bg-card/95 backdrop-blur-md z-40 flex flex-col"
          >
          <div className="p-6 border-b-2 border-primary/30">
            <h1 className="text-xl font-bold uppercase tracking-[0.15em]">
              <span style={{
                background: 'linear-gradient(135deg, #DC1FFF 0%, #9945FF 50%, #DC1FFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 15px #DC1FFF, 0 0 30px #DC1FFF',
                WebkitTextStroke: '1px #DC1FFF',
                paintOrder: 'stroke fill',
                fontFamily: 'var(--font-family-display)',
                letterSpacing: '0.15em',
                filter: 'drop-shadow(0 0 10px #DC1FFF)',
                display: 'block'
              }}>
                QUANTUM
              </span>
              <span style={{
                background: 'linear-gradient(135deg, #14F195 0%, #0DCAA5 50%, #14F195 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 0 15px #14F195, 0 0 30px #14F195',
                WebkitTextStroke: '1px #14F195',
                paintOrder: 'stroke fill',
                fontFamily: 'var(--font-family-display)',
                letterSpacing: '0.15em',
                filter: 'drop-shadow(0 0 10px #14F195)',
                display: 'block'
              }}>
                FALCON
              </span>
            </h1>
            <p className="text-[10px] uppercase tracking-wider mt-1" style={{
              color: '#DC1FFF',
              textShadow: '0 0 10px #DC1FFF, 0 0 20px #DC1FFF, 0 0 40px #A855F7',
              fontFamily: 'monospace',
              letterSpacing: '0.2em',
              opacity: 0.9
            }}>
              SYSTEM_ONLINE<span className="animate-pulse">_</span>
            </p>
          </div>
          
          <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant="ghost"
                  className={cn(
                    "relative flex items-center gap-3 w-full justify-start px-4 py-3 transition-all jagged-corner-small",
                    isActive
                      ? "bg-primary/20 text-primary border-2 border-primary shadow-[0_0_15px_oklch(0.72_0.20_195_/_0.3)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/20 border-2 border-transparent hover:border-primary/30"
                  )}
                >
                  <Icon size={20} weight={isActive ? "fill" : "duotone"} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 -z-10 bg-primary/10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-primary/30">
            <div className="text-center space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {auth?.license?.tier.toUpperCase()} TIER
              </p>
              <div className="flex items-center justify-center gap-1">
                <div className="status-indicator" />
                <span className="text-[8px] text-primary uppercase tracking-wider">
                  SYSTEM ACTIVE
                </span>
              </div>
            </div>
          </div>
        </motion.aside>
      )}

      <div className={cn("flex-1", !isMobile && "ml-64")}>
        <div className={cn("container mx-auto", isMobile ? "p-0" : "p-6")}>
          <ErrorBoundary 
            FallbackComponent={ComponentErrorFallback}
            onError={handleError}
          >
            <Suspense fallback={<LoadingFallback />}>
              {isMobile ? (
                <EnhancedDashboard key="mobile-dashboard" />
              ) : (
                <Component key={activeTab} />
              )}
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      <ErrorBoundary 
        FallbackComponent={() => null}
        onError={(error) => {
          console.error('AI Assistant error:', error);
        }}
      >
        <Suspense fallback={null}>
          <AIAssistant />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary 
        FallbackComponent={() => null}
        onError={(error) => {
          console.error('Legal Footer error:', error);
        }}
      >
        <Suspense fallback={null}>
          <LegalFooter />
        </Suspense>
      </ErrorBoundary>
    </div>
    </LazyMotion>
    </ErrorBoundary>
  );
}
