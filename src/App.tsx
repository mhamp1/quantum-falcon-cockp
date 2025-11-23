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
import { WhiteScreenPrevention } from '@/lib/whiteScreenPrevention';
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
  Lifebuoy,
  Trophy
} from '@phosphor-icons/react';
import DebugHelper from '@/components/shared/DebugHelper';
import AIBotAssistant from '@/components/shared/AIBotAssistant';
import HolographicBotIcon from '@/components/shared/HolographicBotIcon';
import RiskDisclosureBanner from '@/components/shared/RiskDisclosureBanner';
import MasterSearch from '@/components/shared/MasterSearch';
import MobileBottomNav from '@/components/navigation/MobileBottomNav';
import OnboardingFlowManager from '@/components/onboarding/OnboardingFlowManager';
import AmbientParticles from '@/components/shared/AmbientParticles';
import ConnectionStatusIndicator from '@/components/shared/ConnectionStatusIndicator';
import TabVerificationTester from '@/components/shared/TabVerificationTester';
import AppHealthMonitor from '@/components/shared/AppHealthMonitor';
import { BuildHealthCheck } from '@/components/shared/BuildHealthCheck';
import { useDailyLearning } from '@/hooks/useDailyLearning';
import { SecurityManager } from '@/lib/security';
import { updateDiscordRichPresence } from '@/lib/discord/oauth';
import { isGodMode, activateGodMode, deactivateGodMode } from '@/lib/godMode';
import { usePersistentAuth } from '@/lib/auth/usePersistentAuth';
import { toast } from 'sonner';
// Import canvas-confetti with default import for Vite compatibility
import confetti from 'canvas-confetti/dist/confetti.module.mjs';

// Lazy load with error handling and retry logic for production builds
// CRITICAL FIX: Better error messages and faster failure detection
const lazyWithRetry = (importFn: () => Promise<any>, componentName: string, retries = 2) => {
  return lazy(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        const module = await importFn();
        console.log(`[LazyLoad] Successfully loaded ${componentName}`);
        return module;
      } catch (error) {
        console.warn(`[LazyLoad] ${componentName} - Attempt ${i + 1}/${retries} failed:`, error);
        
        // Check if it's a chunk loading error (stale cache)
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isChunkError = errorMessage.includes('Failed to fetch dynamically imported module') || 
                            errorMessage.includes('error loading dynamically imported module') ||
                            errorMessage.includes('Loading chunk');
        
        if (isChunkError) {
          console.error(`[LazyLoad] ${componentName} - Chunk loading error detected`);
          // On first chunk error, try to reload immediately
          if (i === 0) {
            // Wait a bit and try again
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          } else {
            // On second failure, force reload
            console.error(`[LazyLoad] ${componentName} - Multiple chunk errors, forcing reload`);
            setTimeout(() => window.location.reload(), 100);
            // Return placeholder while reloading
            return { default: () => <LoadingFallback message="Updating application..." /> };
          }
        }
        
        if (i === retries - 1) {
          console.error(`[LazyLoad] ${componentName} - All retries exhausted`);
          // Return a safe fallback component instead of throwing
          return { 
            default: () => (
              <div className="min-h-screen flex items-center justify-center p-4">
                <div className="cyber-card p-8 max-w-md text-center space-y-4">
                  <h2 className="text-xl font-bold text-destructive">Component Load Error</h2>
                  <p className="text-muted-foreground text-sm">
                    {componentName} failed to load. This is usually caused by network issues or stale cache.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => window.location.reload()}>Reload Page</Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.reload();
                      }}
                    >
                      Clear Cache
                    </Button>
                  </div>
                </div>
              </div>
            )
          };
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 300 * (i + 1)));
      }
    }
    // Fallback - should never reach here
    return { 
      default: () => <LoadingFallback message={`Loading ${componentName}...`} /> 
    };
  });
};

const EnhancedDashboard = lazyWithRetry(() => import('@/components/dashboard/EnhancedDashboard'), 'EnhancedDashboard');
const BotOverview = lazyWithRetry(() => import('@/components/dashboard/BotOverview'), 'BotOverview');
const EnhancedAnalytics = lazyWithRetry(() => import('@/components/dashboard/EnhancedAnalytics'), 'EnhancedAnalytics');
const AdvancedTradingHub = lazyWithRetry(() => import('@/components/trade/AdvancedTradingHub'), 'AdvancedTradingHub');
const CreateStrategyPage = lazyWithRetry(() => import('@/components/strategy/CreateStrategyPage'), 'CreateStrategyPage');
const VaultView = lazyWithRetry(() => import('@/components/vault/VaultView'), 'VaultView');
const SocialCommunity = lazyWithRetry(() => import('@/components/community/SocialCommunity'), 'SocialCommunity');
const MultiAgentSystem = lazyWithRetry(() => import('@/components/agents/MultiAgentSystemWrapper'), 'MultiAgentSystem');
const EnhancedSettings = lazyWithRetry(() => import('@/components/settings/EnhancedSettings'), 'EnhancedSettings');
const SupportOnboarding = lazyWithRetry(() => import('@/pages/SupportOnboarding'), 'SupportOnboarding');
// Removed: PostTourWelcome, LoginPage, OnboardingModal - handled by OnboardingFlowManager

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

function LoadingFallback({ message = 'Loading...' }: { message?: string }) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-background" 
      style={{ 
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'oklch(0.08 0.02 280)',
        color: 'oklch(0.85 0.12 195)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <div className="text-center space-y-6" style={{ textAlign: 'center' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="mx-auto w-16 h-16"
          style={{ margin: '0 auto', width: '64px', height: '64px' }}
        >
          <div 
            className="premium-spinner w-16 h-16 rounded-full" 
            style={{
              width: '64px',
              height: '64px',
              border: '3px solid oklch(0.35 0.12 195 / 0.3)',
              borderTopColor: 'oklch(0.72 0.20 195)',
              borderRightColor: 'oklch(0.68 0.18 330)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}
          ></div>
        </motion.div>
        <div className="space-y-2">
          <p className="text-sm text-primary font-bold uppercase tracking-wider neon-glow-primary">{message}</p>
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 rounded-full bg-primary"
              />
            ))}
          </div>
        </div>
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

// Utility function to check if onboarding has been seen
const getOnboardingSeenStatus = (): boolean => {
  try {
    const stored = typeof window !== 'undefined'
      ? window.localStorage.getItem('hasSeenOnboarding')
      : null;
    return stored === 'true';
  } catch {
    return false;
  }
};

export default function App() {
  console.log('[App] ========== APP COMPONENT RENDERING ==========');
  console.log('[App] Window available:', typeof window !== 'undefined');
  console.log('[App] Document available:', typeof document !== 'undefined');
  
  // CRITICAL FIX: Mark that we're attempting to render
  if (typeof window !== 'undefined') {
    (window as any).__appRenderAttempted = true;
  }
  
  // All hooks must be called unconditionally (React rules)
  // These hooks are safe to call - they handle errors internally
  const isMobile = useIsMobile();
  useDailyLearning();
  const [activeTab, setActiveTab] = useKV<string>('active-tab', 'dashboard');
  const [botAggression, setBotAggression] = useKV<number>('bot-aggression', 50);
  const [showAggressionPanel, setShowAggressionPanel] = useKV<boolean>('show-aggression-panel', false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useKV<boolean>('hasSeenOnboarding', false);
  
  console.log('[App] All hooks called successfully');
  console.log('[App] Rendering main app - no guards blocking');
  
  // DEBUG: Log DOM state after render
  useEffect(() => {
    console.log('[App] useEffect running - component is mounting');
    
    setTimeout(() => {
      const root = document.getElementById('root');
      if (root) {
        const contentLength = root.innerHTML.length;
        const hasChildren = root.children.length > 0;
        console.log('[App] DOM State Check:');
        console.log('[App] - Root content length:', contentLength);
        console.log('[App] - Root has children:', hasChildren);
        console.log('[App] - Root first child:', root.firstElementChild?.tagName, root.firstElementChild?.className);
        if (contentLength === 0) {
          console.error('[App] ========== WHITE SCREEN DETECTED - ROOT IS EMPTY ==========');
        } else {
          console.log('[App] ✅ Root has content - render successful');
        }
      }
    }, 1000);
  }, []);
  const [showMasterSearch, setShowMasterSearch] = useState(false);
  const [showVerificationTester, setShowVerificationTester] = useState(false);
  const [botRunning, setBotRunning] = useKV<boolean>('bot-running', false);
  // Use persistent auth for auto-login
  const persistentAuth = usePersistentAuth();
  const auth = persistentAuth.auth;

  useEffect(() => {
    SecurityManager.initialize();
    console.info('🔒 [App] Security systems online');
    
    // CRITICAL: Mark successful render for white screen prevention
    WhiteScreenPrevention.markRenderSuccess();
    
    // Log successful mount
    console.log('[App] ✅ Component mounted successfully');
  }, []);

  // Onboarding is now handled by OnboardingFlowManager - no manual state management needed

  // GOD MODE Activation
  useEffect(() => {
    const godModeActive = isGodMode(auth);
    
    if (godModeActive) {
      activateGodMode();
      
      // Show celebration toast
      toast.success('⚡ GOD MODE ACTIVATED ⚡', {
        description: 'Unlimited everything. Rainbow mode engaged. You are the Falcon.',
        duration: 10000,
        style: {
          background: 'linear-gradient(135deg, #ff00ff, #00ffff)',
          color: 'white',
          border: '2px solid gold',
          boxShadow: '0 0 40px rgba(255, 215, 0, 0.8)',
        },
      });

      // Confetti celebration
      confetti({
        particleCount: 300,
        spread: 120,
        origin: { y: 0.4 },
        colors: ['#ff00ff', '#00ffff', '#ffff00', '#ff1493', '#00ff00', '#ffd700'],
      });
    } else {
      deactivateGodMode();
    }

    return () => {
      if (!godModeActive) {
        deactivateGodMode();
      }
    };
  }, [auth]);

  useEffect(() => {
    updateDiscordRichPresence(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K = Master Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        soundEffects.playClick();
        setShowMasterSearch(prev => !prev);
      }
      // Cmd/Ctrl + Shift + V = Verification Tester
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        soundEffects.playClick();
        setShowVerificationTester(prev => !prev);
        if (!showVerificationTester) {
          toast.info('🔍 Tab Verification Test Suite', {
            description: 'Testing all components for white screens...',
            duration: 3000
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showVerificationTester]);

  const tabs: Tab[] = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: House, component: EnhancedDashboard },
    { id: 'bot-overview', label: 'Bot Overview', icon: Terminal, component: BotOverview },
    { id: 'multi-agent', label: 'AI Agents', icon: Robot, component: MultiAgentSystem },
    { id: 'analytics', label: 'Analytics', icon: ChartLine, component: EnhancedAnalytics },
    { id: 'trading', label: 'Trading', icon: Lightning, component: AdvancedTradingHub },
    { id: 'strategy-builder', label: 'Strategy Builder', icon: Code, component: CreateStrategyPage },
    { id: 'vault', label: 'Vault', icon: Vault, component: VaultView },
    { id: 'quests', label: 'Quests', icon: Trophy, component: lazyWithRetry(() => import('@/components/quests/QuestBoard'), 'QuestBoard') },
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

  // Listen for verification tester close event
  useEffect(() => {
    const handler = () => setShowVerificationTester(false);
    window.addEventListener('close-verification-tester', handler);
    return () => window.removeEventListener('close-verification-tester', handler);
  }, []);

  // Handle tour tab switching
  useEffect(() => {
    const handler = (e: Event) => {
      const { tab } = (e as CustomEvent<{ tab: string }>).detail;
      if (tabs.some(t => t.id === tab)) {
        soundEffects.playTabSwitch();
        setActiveTab(tab);
      }
    };
    window.addEventListener('tour-set-active-tab', handler);
    return () => window.removeEventListener('tour-set-active-tab', handler);
  }, [tabs, setActiveTab]);

  useEffect(() => {
    const handler = () => setTimeout(() => window.dispatchEvent(new CustomEvent('open-settings-legal-tab')), 100);
    window.addEventListener('open-legal-risk-disclosure', handler);
    return () => window.removeEventListener('open-legal-risk-disclosure', handler);
  }, []);

  // Onboarding is handled by OnboardingFlowManager - no manual tour triggers needed

  // Listen for bot start from tour
  useEffect(() => {
    const handler = () => {
      setBotRunning(true);
    };
    window.addEventListener('start-bot-from-tour', handler);
    return () => window.removeEventListener('start-bot-from-tour', handler);
  }, [setBotRunning]);

  const ActiveComponent = tabs.find(t => t.id === activeTab)?.component ?? EnhancedDashboard;

  const showAggressionControl = activeTab === 'multi-agent';

  // CRITICAL FIX: Never block render - always show UI
  // Auth initialization happens in background, UI stays responsive
  const [authTimeout, setAuthTimeout] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!persistentAuth.isInitialized) {
        console.warn('[App] Auth initialization timeout - forcing render');
        setAuthTimeout(true);
      }
    }, 1500); // 1.5 second max wait - then force render
    return () => clearTimeout(timer);
  }, [persistentAuth.isInitialized]);

  // CRITICAL FIX: Never show loading screen - always render app
  // This prevents white screens caused by stuck auth initialization
  // OnboardingFlowManager will handle auth UI overlay when needed

  // Authentication is now handled by OnboardingFlowManager's AuthenticationStep
  // Authentication is handled by OnboardingFlowManager's AuthenticationStep
  // Always render app structure - OnboardingFlowManager will overlay when needed
  // This allows the onboarding flow to work even if user is not authenticated yet

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

  // Onboarding is now handled by OnboardingFlowManager - no handlers needed

  // ALWAYS render - no conditions, no guards
  return (
    <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
      <div className={cn('min-h-screen bg-background text-foreground flex relative', isMobile && 'flex-col')}>
        {/* Ambient Background Particles */}
        <AmbientParticles />
        
        <DebugHelper />
        <AIBotAssistant />
        <RiskDisclosureBanner />
        <MasterSearch isOpen={showMasterSearch} onClose={() => setShowMasterSearch(false)} />
        <AppHealthMonitor />
        <BuildHealthCheck />
        
        {/* Tab Verification Tester - Cmd/Ctrl+Shift+V to open */}
        {showVerificationTester && (
          <TabVerificationTester />
        )}
        
        {/* NEW: 5-Step Onboarding Flow Manager - Orchestrates entire onboarding sequence */}
        <Suspense fallback={null}>
          <OnboardingFlowManager
            onComplete={() => {
              // Onboarding complete - user can now use the app
              setHasSeenOnboarding(true);
              try {
                window.localStorage.setItem('hasSeenOnboarding', 'true');
              } catch (e) {
                console.warn('Failed to save onboarding state', e);
              }
            }}
          />
        </Suspense>
        
        {/* OnboardingFlowManager handles all onboarding steps - no legacy components needed */}

        {/* GOD MODE Crown */}
        {auth && isGodMode(auth) && (
          <div className="god-mode-crown" title="GOD MODE ACTIVE">
            👑
          </div>
        )}

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
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-primary flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-pulse bg-primary"></span>
                  SYSTEM ONLINE
                </p>
                <ConnectionStatusIndicator />
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-1">
              {tabs.map(tab => {
                const isActive = activeTab === tab.id;
                const IconComponent = tab.icon;
                const isEliteOrLifetime = auth?.license?.tier === 'ELITE' || auth?.license?.tier === 'LIFETIME';
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
                    (!auth?.license?.tier || auth?.license?.tier === 'FREE') && "crown-pulse"
                  )}
                />
                <span className="text-xs text-yellow-400 font-bold uppercase">
                  {auth?.license?.tier || 'FREE'} TIER
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-center font-mono">
                v2025.1.0 • Production
              </p>
            </div>
          </div>
        )}

        <div className={cn('flex-1 relative z-10', !isMobile && 'ml-[240px]')}>
          <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
            <Suspense fallback={<LoadingFallback message={`Loading ${activeTab}...`} />}>
              <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full"
                  >
                    <ActiveComponent />
                  </motion.div>
                </AnimatePresence>
              </ErrorBoundary>
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* MOBILE NAV 10X: Premium mobile bottom navigation - smoother than Bybit Pro + TradingView Mobile 2025 */}
        {isMobile && (
          <MobileBottomNav 
            tabs={tabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
          />
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
            className="fixed bottom-28 right-4 z-40 p-3 border rounded-full transition-all"
            style={{ 
              backgroundColor: 'rgba(20, 241, 149, 0.2)',
              borderColor: '#14F195',
              boxShadow: '0 0 12px rgba(20, 241, 149, 0.3)',
            }}
          >
            <Flame size={24} style={{ color: '#14F195' }} />
          </button>
        )}
      </div>


    </ErrorBoundary>
  );
}
