// QUANTUM FALCON COCKPIT v2025.1.0 - PRODUCTION NOVEMBER 20, 2025
// 
// FINAL ELITE FEATURES: Master Search (Cmd+K) + Discord Integration — 100% live app match — November 20, 2025
//
// ✅ TASK 11: MASTER SEARCH (Cmd+K / Ctrl+K)
//    - Global keyboard shortcut from anywhere in the app
//    - Fixed center-screen holographic panel with backdrop blur
//    - Live filtered search results with icons and categories
//    - Keyboard navigation (arrow keys + Enter)
//    - Top-right header search icon with subtle glow
//    - Mobile: full-screen bottom sheet
//
// ✅ TASK 12: DISCORD INTEGRATION
//    - Settings → Community & Social sub-tab
//    - Discord OAuth2 connection flow
//    - Server role display + member since date
//    - Rich presence showing current activity
//    - Auto-invite to Quantum Falcon server
//    - Clean disconnect functionality

import { useEffect, useMemo, Suspense, lazy, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKVSafe as useKV } from '@/hooks/useKVFallback';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { isNonCriticalError } from '@/lib/errorSuppression';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { logError } from '@/lib/errorLogger';
import { soundEffects } from '@/lib/soundEffects';
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
  Flame,
  Brain,
  Gear,
  MagnifyingGlass,
  Lifebuoy
} from '@phosphor-icons/react';
import DebugHelper from '@/components/shared/DebugHelper';
import AIBotAssistant from '@/components/shared/AIBotAssistant';
import HolographicBotIcon from '@/components/shared/HolographicBotIcon';
import RiskDisclosureBanner from '@/components/shared/RiskDisclosureBanner';
import InteractiveOnboardingTour from '@/components/onboarding/InteractiveOnboardingTour';
import MasterSearch from '@/components/shared/MasterSearch';
import { SecurityManager } from '@/lib/security';
import { updateDiscordRichPresence } from '@/lib/discord/oauth';

const EnhancedDashboard = lazy(() => import('@/components/dashboard/EnhancedDashboard'));
const BotOverview = lazy(() => import('@/components/dashboard/BotOverview'));
const EnhancedAnalytics = lazy(() => import('@/components/dashboard/EnhancedAnalytics'));
const AdvancedTradingHub = lazy(() => import('@/components/trade/AdvancedTradingHub'));
const CreateStrategyPage = lazy(() => import('@/components/strategy/CreateStrategyPage'));
const VaultView = lazy(() => import('@/components/vault/VaultView'));
const SocialCommunity = lazy(() => import('@/components/community/SocialCommunity'));
const MultiAgentSystem = lazy(() => import('@/components/agents/MultiAgentSystemWrapper'));
const EnhancedSettings = lazy(() => import('@/components/settings/EnhancedSettings'));
const SupportOnboarding = lazy(() => import('@/pages/SupportOnboarding'));

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
  const errorMessage = error?.message || 'Unknown error occurred';
  const errorStack = error?.stack || 'No stack trace available';

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
          <p className="text-foreground font-mono text-sm break-all">{errorMessage}</p>

          <details className="mt-3">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground uppercase tracking-wide font-semibold">
              View Stack Trace
            </summary>
            <pre className="mt-3 p-4 bg-muted/30 rounded-lg overflow-auto max-h-64 scrollbar-thin text-xs font-mono text-muted-foreground">
              {errorStack}
            </pre>
          </details>
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
              navigator.clipboard.writeText(`Error: ${errorMessage}\n\nStack: ${errorStack}`);
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
  const [showAggressionPanel, setShowAggressionPanel] = useKV<boolean>('show-aggression-panel', false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useKV<boolean>('hasSeenOnboarding', false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showMasterSearch, setShowMasterSearch] = useState(false);
  const [auth, setAuth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
  });

  useEffect(() => {
    SecurityManager.initialize();
    console.info('🔒 [App] Security systems online');
  }, []);

  useEffect(() => {
    updateDiscordRichPresence(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        soundEffects.playClick();
        setShowMasterSearch(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const tabs: Tab[] = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: House, component: EnhancedDashboard },
    { id: 'bot-overview', label: 'Bot Overview', icon: Terminal, component: BotOverview },
    { id: 'multi-agent', label: 'AI Agents', icon: Robot, component: MultiAgentSystem },
    { id: 'analytics', label: 'Analytics', icon: ChartLine, component: EnhancedAnalytics },
    { id: 'trading', label: 'Trading', icon: Lightning, component: AdvancedTradingHub },
    { id: 'strategy-builder', label: 'Strategy Builder', icon: Code, component: CreateStrategyPage },
    { id: 'vault', label: 'Vault', icon: Vault, component: VaultView },
    { id: 'community', label: 'Community', icon: Users, component: SocialCommunity },
    { id: 'support', label: 'Support', icon: Lifebuoy, component: SupportOnboarding },
    { id: 'settings', label: 'Settings', icon: Gear, component: EnhancedSettings },
  ], []);

  useEffect(() => {
    let isMounted = true;
    import('@/lib/webhooks/paymentWebhooks').then(({ handlePaymentSuccessRedirect }) => {
      if (isMounted) {
        handlePaymentSuccessRedirect();
      }
    }).catch(err => console.debug('Payment webhook module not available:', err));
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const shouldSuppress = (text: string, extra = '') => isNonCriticalError(text) || isNonCriticalError(extra);

    const handleWindowError = (e: ErrorEvent) => {
      const message = e.message || '';
      const filename = e.filename || '';
      
      if (shouldSuppress(message, filename)) {
        console.debug('[App] Suppressed non-critical error:', String(message).substring(0, 100));
        e.preventDefault();
        return;
      }
      const errorToLog = e.error || message || 'Unknown error';
      logError(errorToLog, `Window Error: ${filename || 'unknown'}:${e.lineno || 0}`);
      console.error('[App] Uncaught window error:', e);
    };

    const handleRejection = (e: PromiseRejectionEvent) => {
      const reason = e.reason?.toString?.() || String(e.reason || '') || 'Unknown rejection';
      if (shouldSuppress(reason)) {
        console.debug('[App] Suppressed promise rejection:', String(reason).substring(0, 100));
        e.preventDefault();
        return;
      }
      logError(e.reason || 'Unknown rejection', 'Unhandled Promise Rejection');
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
      if (tabs.some(t => t.id === id)) {
        soundEffects.playTabSwitch();
        setActiveTab(id);
      }
    };
    window.addEventListener('navigate-tab', handler);
    return () => window.removeEventListener('navigate-tab', handler);
  }, [tabs, setActiveTab]);

  useEffect(() => {
    const handler = () => setTimeout(() => window.dispatchEvent(new CustomEvent('open-settings-legal-tab')), 100);
    window.addEventListener('open-legal-risk-disclosure', handler);
    return () => window.removeEventListener('open-legal-risk-disclosure', handler);
  }, []);

  useEffect(() => {
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => {
        setShowOnboarding(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenOnboarding]);

  useEffect(() => {
    const handler = () => {
      setShowOnboarding(true);
    };
    window.addEventListener('restart-onboarding-tour', handler);
    return () => window.removeEventListener('restart-onboarding-tour', handler);
  }, []);

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component ?? EnhancedDashboard;

  const showAggressionControl = activeTab === 'multi-agent';

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

  const handleOnboardingComplete = () => {
    setHasSeenOnboarding(true);
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  return (
    <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
      <div className={cn('min-h-screen bg-background text-foreground flex', isMobile && 'flex-col')}>
        <DebugHelper />
        <AIBotAssistant />
        <RiskDisclosureBanner />
        <MasterSearch isOpen={showMasterSearch} onClose={() => setShowMasterSearch(false)} />
        
        <InteractiveOnboardingTour
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
          setActiveTab={setActiveTab}
        />

        {/* SIDEBAR UPGRADE: pro-level active indicator + cooler bot icon */}
        {!isMobile && (
          <div className="fixed left-0 top-0 bottom-0 w-[240px] bg-card/95 backdrop-blur border-r border-primary/10 z-50 flex flex-col">
            <div className="p-6 border-b border-primary/30">
              <div className="flex items-center justify-between mb-2">
                <div className="scanline-effect">
                  <h1 className="text-2xl font-bold tracking-tight mb-1 text-primary" style={{ textShadow: '0 0 6px rgba(0,255,255,0.3)' }}>
                    QUANTUM<br />FALCON
                  </h1>
                </div>
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    setShowMasterSearch(true);
                  }}
                  onMouseEnter={() => soundEffects.playHover()}
                  className="p-2 rounded-lg transition-all hover:bg-primary/10"
                  style={{
                    border: '1px solid oklch(0.72 0.20 195 / 0.2)',
                  }}
                  title="Master Search (Cmd+K)"
                >
                  <MagnifyingGlass 
                    size={18} 
                    className="text-primary" 
                    weight="bold"
                    style={{
                      filter: 'drop-shadow(0 0 4px rgba(0, 255, 255, 0.3))',
                    }}
                  />
                </button>
              </div>
              <p className="text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse bg-primary"></span>
                SYSTEM ONLINE
              </p>
            </div>

            <nav className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-1">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;
                const isEliteOrLifetime = auth.license?.tier === 'ELITE' || auth.license?.tier === 'LIFETIME';
                const showCrownBadge = tab.id === 'settings' && isEliteOrLifetime;
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => {
                      soundEffects.playTabSwitch();
                      setActiveTab(tab.id);
                    }}
                    onMouseEnter={() => soundEffects.playHover()}
                    className={cn(
                      "w-full flex items-center gap-3 py-3 pl-5 pr-4 transition-all duration-300 text-left uppercase tracking-wider text-xs font-semibold rounded-lg relative group",
                      isActive 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-primary hover:translate-x-0.5"
                    )}
                    whileHover={{ scale: isActive ? 1 : 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r"
                        style={{
                          boxShadow: '0 0 12px var(--primary), 0 0 6px var(--primary)'
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-primary/10 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    
                    <div className="relative z-10 flex-shrink-0">
                      {tab.id === 'multi-agent' ? (
                        <HolographicBotIcon isActive={isActive} size={18} />
                      ) : (
                        <motion.div
                          animate={{
                            scale: isActive ? [1, 1.05, 1] : 1,
                            filter: isActive 
                              ? 'drop-shadow(0 0 6px rgba(0, 255, 255, 0.4))' 
                              : 'none'
                          }}
                          transition={{
                            duration: 2,
                            repeat: isActive ? Infinity : 0,
                            ease: "easeInOut"
                          }}
                        >
                          <IconComponent 
                            size={18} 
                            weight={isActive ? "fill" : "regular"}
                            style={{ opacity: isActive ? 1 : 0.7 }}
                          />
                        </motion.div>
                      )}
                      
                      {showCrownBadge && (
                        <Crown 
                          size={10} 
                          weight="fill" 
                          className="absolute -top-1 -right-1 text-yellow-400"
                          style={{ 
                            filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.6))'
                          }}
                        />
                      )}
                    </div>
                    
                    <span className="relative z-10">{tab.label}</span>
                    
                    {!isActive && (
                      <motion.div
                        className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100"
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-primary/30 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Crown 
                  size={14} 
                  weight="fill" 
                  className={cn(
                    "text-yellow-400",
                    (!auth.license?.tier || auth.license?.tier === 'FREE') && "crown-pulse"
                  )}
                />
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

        {/* SIDEBAR UPGRADE: Mobile bottom nav with glowing underline */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 h-20 bg-card/95 backdrop-blur border-t border-border z-50">
            <div className="flex justify-around items-center h-full px-2">
              {tabs.slice(0, 4).map(tab => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      soundEffects.playTabSwitch();
                      setActiveTab(tab.id);
                    }}
                    className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px]"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobileActiveTab"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full"
                        style={{
                          boxShadow: '0 0 8px var(--primary), 0 -2px 12px var(--primary)'
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    
                    {tab.id === 'multi-agent' ? (
                      <HolographicBotIcon isActive={isActive} size={32} />
                    ) : (
                      <IconComponent 
                        size={32} 
                        weight={isActive ? "fill" : "regular"}
                        className={isActive ? "text-primary" : "text-muted-foreground"}
                      />
                    )}
                    <span className={cn(
                      "text-xs font-semibold",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {tab.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
              <button
                onClick={() => {
                  soundEffects.playTabSwitch();
                  setActiveTab('strategy-builder');
                }}
                className="flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg"
                style={{ transform: 'translateY(-8px)' }}
              >
                <Code size={32} weight="fill" />
                <span className="text-xs font-bold">Strategy</span>
              </button>
              {tabs.slice(5, 9).map(tab => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      soundEffects.playTabSwitch();
                      setActiveTab(tab.id);
                    }}
                    className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px]"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobileActiveTab2"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full"
                        style={{
                          boxShadow: '0 0 8px var(--primary), 0 -2px 12px var(--primary)'
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    
                    <IconComponent 
                      size={32} 
                      weight={isActive ? "fill" : "regular"}
                      className={isActive ? "text-primary" : "text-muted-foreground"}
                    />
                    <span className={cn(
                      "text-xs font-semibold",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>
                      {tab.label.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
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
                'fixed z-40 bg-card/95 backdrop-blur-2xl border rounded-3xl shadow-2xl shadow-black/50 aggression-control',
                isMobile 
                  ? 'inset-x-0 bottom-0 pb-4 rounded-b-none border-b-0' 
                  : 'bottom-8 left-1/2 -translate-x-1/2 max-w-2xl w-full mx-4'
              )}
              style={{
                borderColor: 'rgba(0, 255, 255, 0.2)',
              }}
              data-tour="aggression-panel"
            >
              <div className="p-6 space-y-6">
                {/* BEFORE: "BOT IS THINKING..." banner with massive glow halo
                    AFTER: Thin border + subtle gradient bg, text with 6px glow max */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 
                      className="text-lg font-bold uppercase tracking-wider"
                      style={{ 
                        textShadow: '0 0 6px rgba(0,255,255,0.3)',
                        color: '#e0e0ff'
                      }}
                    >
                      Bot Aggression Control
                    </h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                      Global Risk Management
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      setShowAggressionPanel(false);
                    }}
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
                        textShadow: `0 0 6px ${getAggressionColor(botAggression)}50`
                      }}
                    >
                      {getAggressionLabel(botAggression)}
                    </span>
                    <span className="text-red-400 font-semibold uppercase tracking-wide">Aggressive</span>
                  </div>

                  {/* BEFORE: Slider with massive pink/cyan glow bleed
                      AFTER: Clean track with 1px glowing border, small glowing dot thumb */}
                  <div className="relative px-2">
                    <Slider
                      value={[botAggression]}
                      onValueChange={(value) => {
                        soundEffects.playSliderChange();
                        setBotAggression(value[0]);
                      }}
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
                          onClick={() => {
                            soundEffects.playClick();
                            setBotAggression(preset.value);
                          }}
                          onMouseEnter={() => soundEffects.playHover()}
                          className={cn(
                            "p-4 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center gap-2 hover:-translate-y-1",
                            isActive ? "border-current" : "border-white/10"
                          )}
                          style={{
                            color: preset.color,
                            backgroundColor: isActive ? `${preset.color}10` : 'transparent',
                            boxShadow: isActive ? `0 0 12px ${preset.color}40` : 'none',
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
            onClick={() => {
              soundEffects.playClick();
              setShowAggressionPanel(true);
            }}
            className="fixed bottom-28 right-4 z-40 p-3 bg-cyan-500/20 border border-cyan-500/40 rounded-full hover:bg-cyan-500/30 transition-all"
            style={{ boxShadow: '0 0 12px rgba(0,255,255,0.2)' }}
          >
            <Flame size={24} className="text-cyan-400" />
          </button>
        )}
      </div>


    </ErrorBoundary>
  );
}
