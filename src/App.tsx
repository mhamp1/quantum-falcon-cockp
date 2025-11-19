import { useEffect, useMemo, Suspense, lazy, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKVSafe as useKV } from '@/hooks/useKVFallback';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { isNonCriticalError } from '@/lib/errorSuppression';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { logError } from '@/lib/errorLogger';
import { motion, AnimatePresence } from 'framer-motion';
import {
  House,
  Terminal,
  ChartLine,
  Lightning,
  Code,
  Vault,
  Users,
  Robot,
  Crown,
  X,
  ShieldCheck,
  Lightning as Zap,
  Flame
} from '@phosphor-icons/react';
import DebugHelper from '@/components/shared/DebugHelper';
import AIBotAssistant from '@/components/shared/AIBotAssistant';

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
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-sm text-muted-foreground uppercase tracking-wider">Loading...</p>
      </div>
    </div>
  );
}

function ComponentErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
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
            }}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            Copy Error Report
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-4 border-t border-border/50">
          Quantum Falcon Cockpit v2025.1.0 — Production Build
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useKV<string>('active-tab', 'dashboard');
  const [botAggression, setBotAggression] = useKV<number>('bot-aggression', 50);
  const [showAggressionPanel, setShowAggressionPanel] = useKV<boolean>('show-aggression-panel', true);
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
    { id: 'strategy-builder', label: 'Strategy Builder', icon: Code, component: CreateStrategyPage },
    { id: 'vault', label: 'Vault', icon: Vault, component: VaultView },
    { id: 'community', label: 'Community', icon: Users, component: SocialCommunity },
  ], []);

  useEffect(() => {
    import('@/lib/webhooks/paymentWebhooks').then(({ handlePaymentSuccessRedirect }) => {
      handlePaymentSuccessRedirect();
    }).catch(err => console.debug('Payment webhook module not available:', err));
  }, []);

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

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (tabs.some(t => t.id === id)) setActiveTab(id);
    };
    window.addEventListener('navigate-tab', handler);
    return () => window.removeEventListener('navigate-tab', handler);
  }, [tabs, setActiveTab]);

  useEffect(() => {
    const handler = () => setTimeout(() => window.dispatchEvent(new CustomEvent('open-settings-legal-tab')), 100);
    window.addEventListener('open-legal-risk-disclosure', handler);
    return () => window.removeEventListener('open-legal-risk-disclosure', handler);
  }, []);

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component ?? EnhancedDashboard;

  const showAggressionControl = ['bot-overview', 'multi-agent', 'trading'].includes(activeTab);

  const getAggressionLabel = (value: number) => {
    if (value < 33) return 'CAUTIOUS';
    if (value < 67) return 'MODERATE';
    return 'AGGRESSIVE';
  };

  const getAggressionColor = (value: number) => {
    if (value < 33) return '#14F195';
    if (value < 67) return '#FFD700';
    return '#FF4444';
  };

  const presets = [
    { label: 'Cautious', value: 25, icon: ShieldCheck, color: '#14F195' },
    { label: 'Moderate', value: 50, icon: Zap, color: '#FFD700' },
    { label: 'Aggressive', value: 75, icon: Flame, color: '#FF4444' },
  ];

  return (
    <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
      <div className={cn('min-h-screen bg-background text-foreground flex', isMobile && 'flex-col')}>
        <DebugHelper />
        <AIBotAssistant />

        {!isMobile && (
          <div className="fixed left-0 top-0 bottom-0 w-[240px] bg-card/95 backdrop-blur border-r border-primary/30 z-50 flex flex-col">
            <div className="p-6 border-b border-primary/30">
              <div className="scanline-effect mb-2">
                <h1 className="text-2xl font-bold tracking-tight mb-1 text-primary" style={{ textShadow: '0 0 8px rgba(0,255,255,0.6)' }}>
                  QUANTUM<br />FALCON
                </h1>
              </div>
              <p className="text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse bg-primary"></span>
                SYSTEM ONLINE
              </p>
            </div>

            <nav className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 transition-all text-left uppercase tracking-wider text-xs font-semibold rounded-lg",
                    activeTab === tab.id 
                      ? "bg-primary/20 text-primary border-l-2 border-primary" 
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  )}
                  style={activeTab === tab.id ? { boxShadow: '0 0 15px rgba(0,255,255,0.2)' } : {}}
                >
                  <tab.icon size={18} weight={activeTab === tab.id ? "fill" : "regular"} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className="p-4 border-t border-primary/30 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Crown size={14} weight="fill" className="text-yellow-400" />
                <span className="text-xs text-yellow-400 font-bold uppercase">
                  {auth.license?.tier || 'FREE'} TIER
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-center font-mono">
                v2025.1.0 • Production
              </p>
            </div>
          </div>
        )}

        <div className={cn('flex-1', !isMobile && 'ml-[240px]')}>
          <Suspense fallback={<LoadingFallback />}>
            <ActiveComponent />
          </Suspense>
        </div>

        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 h-20 bg-card/95 backdrop-blur border-t border-border z-50">
            <div className="flex justify-around items-center h-full px-2">
              {tabs.slice(0, 4).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px]",
                    activeTab === tab.id ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <tab.icon size={32} weight={activeTab === tab.id ? "fill" : "regular"} />
                  <span className="text-xs font-semibold">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
              <button
                onClick={() => setActiveTab('strategy-builder')}
                className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg"
                style={{ transform: 'translateY(-8px)' }}
              >
                <Code size={32} weight="fill" />
                <span className="text-xs font-bold">Strategy</span>
              </button>
              {tabs.slice(5, 8).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px]",
                    activeTab === tab.id ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <tab.icon size={32} weight={activeTab === tab.id ? "fill" : "regular"} />
                  <span className="text-xs font-semibold">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </nav>
        )}

        <AnimatePresence>
          {showAggressionControl && showAggressionPanel && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                'fixed z-40 bg-card/95 backdrop-blur-2xl border rounded-3xl shadow-2xl shadow-black/50',
                isMobile 
                  ? 'inset-x-0 bottom-0 pb-4 rounded-b-none border-b-0' 
                  : 'bottom-8 left-1/2 -translate-x-1/2 max-w-2xl w-full mx-4'
              )}
              style={{
                borderColor: 'rgba(0, 255, 255, 0.4)',
              }}
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-wider text-cyan-400" style={{ textShadow: '0 0 8px rgba(0,255,255,0.4)' }}>
                      Bot Aggression Control
                    </h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                      Global Risk Management
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAggressionPanel(false)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <X size={20} className="text-muted-foreground hover:text-foreground" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-400 font-semibold uppercase tracking-wide">Cautious</span>
                    <span 
                      className="text-3xl font-black tabular-nums"
                      style={{ 
                        color: getAggressionColor(botAggression),
                        textShadow: `0 0 6px ${getAggressionColor(botAggression)}80`
                      }}
                    >
                      {getAggressionLabel(botAggression)}
                    </span>
                    <span className="text-red-400 font-semibold uppercase tracking-wide">Aggressive</span>
                  </div>

                  <div className="relative px-2">
                    <Slider
                      value={[botAggression]}
                      onValueChange={(value) => setBotAggression(value[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="cursor-grab active:cursor-grabbing"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {presets.map((preset) => {
                      const isActive = Math.abs(botAggression - preset.value) < 10;
                      return (
                        <button
                          key={preset.label}
                          onClick={() => setBotAggression(preset.value)}
                          className={cn(
                            "p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 hover:-translate-y-1",
                            isActive ? "border-current" : "border-white/10"
                          )}
                          style={{
                            color: preset.color,
                            backgroundColor: isActive ? `${preset.color}15` : 'transparent',
                            boxShadow: isActive ? `0 0 20px ${preset.color}60` : 'none',
                          }}
                        >
                          <preset.icon size={isMobile ? 32 : 28} weight={isActive ? "fill" : "regular"} />
                          <span className="text-xs font-bold uppercase tracking-wide">{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {showAggressionControl && !showAggressionPanel && (
          <button
            onClick={() => setShowAggressionPanel(true)}
            className="fixed bottom-4 right-4 z-40 p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-full hover:bg-cyan-500/30 transition-all"
            style={{ boxShadow: '0 0 20px rgba(0,255,255,0.3)' }}
          >
            <Flame size={24} className="text-cyan-400" />
          </button>
        )}
      </div>


    </ErrorBoundary>
  );
}
