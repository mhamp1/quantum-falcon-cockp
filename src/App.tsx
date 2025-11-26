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

import React, { useEffect, useMemo, Suspense, useState, useCallback, useRef } from 'react';
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
  Lifebuoy,
  Trophy
} from '@phosphor-icons/react';
import DebugHelper from '@/components/shared/DebugHelper';
import AIBotAssistant from '@/components/shared/AIBotAssistant';
import HolographicBotIcon from '@/components/shared/HolographicBotIcon';
import RiskDisclosureBanner from '@/components/shared/RiskDisclosureBanner';
import InteractiveTour from '@/components/onboarding/InteractiveTour';
import MasterSearch from '@/components/shared/MasterSearch';
import MobileBottomNav from '@/components/navigation/MobileBottomNav';
import IntroSplash from '@/components/intro/IntroSplash';
import AmbientParticles from '@/components/shared/AmbientParticles';
import ConnectionStatusIndicator from '@/components/shared/ConnectionStatusIndicator';
import { useDailyLearning } from '@/hooks/useDailyLearning';
import { SecurityManager } from '@/lib/security';
import { updateDiscordRichPresence } from '@/lib/discord/oauth';
import { isGodMode, activateGodMode, deactivateGodMode } from '@/lib/godMode';
import { usePersistentAuth } from '@/lib/auth/usePersistentAuth';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

// Robust lazy loading with retry logic
import { createRobustLazy } from '@/lib/lazyLoad'

// Optimized lazy loading with prefetching for common tabs
const EnhancedDashboard = createRobustLazy(() => import('@/components/dashboard/EnhancedDashboard'), { prefetch: true });
const BotOverview = createRobustLazy(() => import('@/components/dashboard/BotOverview'), { prefetch: true });
const EnhancedAnalytics = createRobustLazy(() => import('@/components/dashboard/EnhancedAnalytics'));
const AdvancedTradingHub = createRobustLazy(() => import('@/components/trade/AdvancedTradingHub'));
const CreateStrategyPage = createRobustLazy(() => import('@/components/strategy/CreateStrategyPage'));
const VaultView = createRobustLazy(() => import('@/components/vault/VaultView'));
const SocialCommunity = createRobustLazy(() => import('@/components/community/SocialCommunity'), { 
  retries: 6, 
  timeout: 10000, // Increased timeout for Community tab
  prefetch: false 
});
const MultiAgentSystem = createRobustLazy(() => import('@/components/agents/MultiAgentSystemWrapper'), { 
  retries: 5, 
  timeout: 5000,
  prefetch: true 
});
const EnhancedSettings = createRobustLazy(() => import('@/components/settings/EnhancedSettings'), { 
  retries: 6, 
  timeout: 10000, // Increased timeout for Settings tab
  prefetch: true 
});
const SupportOnboarding = createRobustLazy(() => import('@/pages/SupportOnboarding'));
const LoginPage = createRobustLazy(() => import('@/pages/LoginPage'));
const MasterAdminPanel = createRobustLazy(() => import('@/components/admin/MasterAdminPanel'));

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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>
        <p className="text-sm text-muted-foreground uppercase tracking-wider">{message}</p>
      </div>
    </div>
  );
}

function GlobalLoadingFallback({ message = 'Loading Quantum Falcon...' }: { message?: string }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-950 to-black" />
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: 'linear-gradient(rgba(0,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,0,255,.08) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
        animation: 'grid-pan 20s linear infinite'
      }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#00d4ff33,transparent_60%)]" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 min-h-screen">
        <div className="mb-8 p-[2px] rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-yellow-400 animate-pulse">
          <div className="bg-black rounded-full px-10 py-6 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-cyan-500/40 border-t-cyan-300 animate-spin" />
              <span role="img" aria-label="falcon" className="absolute inset-0 flex items-center justify-center text-4xl drop-shadow-[0_0_20px_#00d4ff]">
                🦅
              </span>
            </div>
            <h2 className="font-orbitron text-2xl text-white tracking-[0.35em] uppercase">{message}</h2>
            <p className="text-cyan-300/80 text-sm max-w-xl">
              Neural engines syncing with Solana mainframe. We promised you'd never stare at a void again — hang tight for a few seconds.
            </p>
          </div>
        </div>
        <div className="w-64 h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500"
            style={{ animation: 'loadingBar 1.4s linear infinite' }}
          />
        </div>
        <p className="text-xs tracking-[0.4em] text-white/60 mt-6 uppercase">Quantum Falcon v2025.1.0</p>
      </div>
    </div>
  )
}

function ComponentErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  const errorMessage = error?.message || 'Unknown error occurred';
  const errorStack = error?.stack || 'No stack trace available';
  
  // Detect if it's a dynamic import failure
  const isImportError = 
    errorMessage.includes('Failed to fetch dynamically imported module') ||
    errorMessage.includes('Import timeout') ||
    errorMessage.includes('dynamically imported module') ||
    errorMessage.includes('Failed to fetch')

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="cyber-card p-8 max-w-2xl w-full space-y-6">
        <div className="flex items-center gap-4">
          <div className="text-destructive text-6xl">⚠️</div>
          <div>
            <h2 className="text-2xl font-bold text-destructive uppercase tracking-wide">
              {isImportError ? 'Loading Failed' : 'Component Failure'}
            </h2>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              {isImportError 
                ? 'Failed to load module. This may be a network issue.'
                : 'A critical error occurred in this module'}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-foreground font-mono text-sm break-all">{errorMessage}</p>
          
          {isImportError && (
            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-sm text-foreground mb-2">
                <strong>Possible solutions:</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Check your internet connection</li>
                <li>Try refreshing the page</li>
                <li>Clear browser cache and reload</li>
                <li>Wait a moment and retry</li>
              </ul>
            </div>
          )}

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
  const isMobile = useIsMobile();
  
  // Initialize daily learning system
  useDailyLearning();
  const [activeTab, setActiveTab] = useKV<string>('active-tab', 'dashboard');
  const [botAggression, setBotAggression] = useKV<number>('bot-aggression', 50);
  const [showAggressionPanel, setShowAggressionPanel] = useKV<boolean>('show-aggression-panel', false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useKV<boolean>('hasSeenOnboarding', false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showMasterSearch, setShowMasterSearch] = useState(false);
  const [botRunning, setBotRunning] = useKV<boolean>('bot-running', false);
  // Use persistent auth for auto-login
  const persistentAuth = usePersistentAuth();
  const auth = persistentAuth.auth;
  // Refs to prevent duplicate toasts/tours
  const godModeToastShown = useRef(false);
  const tourShownRef = useRef(false);

  useEffect(() => {
    SecurityManager.initialize();
    console.info('🔒 [App] Security systems online');
  }, []);

  // Show interactive tour for first-time users - ONLY after they've clicked "Enter Cockpit"
  // CRITICAL: Tour must NOT show on login page - only after dashboard is loaded
  useEffect(() => {
    // Only check for tour if we're past the login page (authenticated and initialized)
    // AND we haven't shown the tour yet this session
    if (persistentAuth.isInitialized && auth?.isAuthenticated && !hasSeenOnboarding && !tourShownRef.current) {
      // Check if user just clicked "Enter Cockpit" (not just logged in)
      const justEnteredCockpit = typeof window !== 'undefined' 
        ? window.localStorage.getItem('justLoggedIn') === 'true'
        : false;
      
      if (justEnteredCockpit) {
        // Mark tour as shown to prevent duplicate
        tourShownRef.current = true;
        
        // Clear the flag immediately
        try {
          window.localStorage.removeItem('justLoggedIn');
        } catch (e) {
          // Silent fail
        }
        
        // Wait for dashboard to fully load before showing tour
        // This ensures the tour doesn't show on the login page
        const timer = setTimeout(() => {
          setShowOnboarding(true);
        }, 2000); // Delay to ensure dashboard is visible
        return () => clearTimeout(timer);
      }
    }
  }, [persistentAuth.isInitialized, auth?.isAuthenticated, hasSeenOnboarding]);

  // GOD MODE Activation - Use ref to prevent double toast
  useEffect(() => {
    const godModeActive = isGodMode(auth);
    
    if (godModeActive) {
      activateGodMode();
      
      // Only show toast once per session
      if (!godModeToastShown.current) {
        godModeToastShown.current = true;
        
        // Show GOD MODE celebration toast
        toast.success('👑 WELCOME BACK, CREATOR 👑', {
          description: 'GOD MODE ACTIVE • Unlimited Everything • All 15 Agents • All 53+ Strategies • Rainbow Border Engaged • YOU ARE THE FALCON',
          duration: 10000,
          style: {
            background: 'linear-gradient(135deg, #ff00ff, #00ffff, #ffff00)',
            color: 'white',
            border: '3px solid gold',
            boxShadow: '0 0 60px rgba(255, 215, 0, 0.9)',
            fontWeight: 'bold',
          },
        });

        // MASSIVE Confetti celebration for the Creator
        confetti({
          particleCount: 500,
          spread: 180,
          origin: { y: 0.3 },
          colors: ['#ff00ff', '#00ffff', '#ffff00', '#ff1493', '#00ff00', '#ffd700', '#ff6b6b'],
        });
        
        // Second wave of confetti
        setTimeout(() => {
          confetti({
            particleCount: 300,
            angle: 60,
            spread: 100,
            origin: { x: 0 },
            colors: ['#ffd700', '#ff00ff', '#00ffff'],
          });
          confetti({
            particleCount: 300,
            angle: 120,
            spread: 100,
            origin: { x: 1 },
            colors: ['#ffd700', '#ff00ff', '#00ffff'],
          });
        }, 500);
      }
    } else {
      deactivateGodMode();
      godModeToastShown.current = false; // Reset when God Mode is deactivated
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
      // Cmd+K / Ctrl+K: Master Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        soundEffects.playClick();
        setShowMasterSearch(prev => !prev);
      }
      // Cmd+L / Ctrl+L: Login (if not authenticated)
      if ((e.metaKey || e.ctrlKey) && e.key === 'l' && !auth?.isAuthenticated) {
        e.preventDefault();
        soundEffects.playClick();
        window.dispatchEvent(new CustomEvent('navigate-to-login'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [auth?.isAuthenticated]);

  const tabs: Tab[] = useMemo(() => {
    const baseTabs: Tab[] = [
      { id: 'dashboard', label: 'Dashboard', icon: House, component: EnhancedDashboard },
      { id: 'bot-overview', label: 'Bot Overview', icon: Terminal, component: BotOverview },
      { id: 'multi-agent', label: 'AI Agents', icon: Robot, component: MultiAgentSystem },
      { id: 'analytics', label: 'Analytics', icon: ChartLine, component: EnhancedAnalytics },
      { id: 'trading', label: 'Trading', icon: Lightning, component: AdvancedTradingHub },
      { id: 'strategy-builder', label: 'Strategy Builder', icon: Code, component: CreateStrategyPage },
      { id: 'vault', label: 'Vault', icon: Vault, component: VaultView },
      { id: 'quests', label: 'Quests', icon: Trophy, component: createRobustLazy(() => import('@/components/quests/QuestBoard'), { timeout: 5000 }) },
      { id: 'community', label: 'Community', icon: Users, component: SocialCommunity },
      { id: 'support', label: 'Support', icon: Lifebuoy, component: SupportOnboarding },
      { id: 'settings', label: 'Settings', icon: Gear, component: EnhancedSettings },
    ];

    // Add Master Admin Panel ONLY for master key users (GOD MODE)
    // SECURITY: Triple-check - must be authenticated, have master userId, AND pass isGodMode
    const isMasterUser = auth?.license?.userId === 'master' && auth?.license?.tier === 'lifetime'
    if (isMasterUser && isGodMode(auth)) {
      baseTabs.push({ 
        id: 'master-admin', 
        label: 'God Mode 👑', 
        icon: Crown, 
        component: MasterAdminPanel 
      });
    }

    return baseTabs;
  }, [auth]);

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

  // Listen for tour restart event
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
    try {
      window.localStorage.setItem('hasSeenOnboarding', 'true');
    } catch (e) {
      // Silent fail - localStorage unavailable
    }
    setShowOnboarding(false);
    
    toast.success('Tour Complete!', {
      description: 'You\'re ready to start trading. Welcome to Quantum Falcon!',
      duration: 3000,
    });
  };

  const handleOnboardingSkip = () => {
    // Hide tour for this session but don't mark as seen
    setShowOnboarding(false);
  };

  // Show loading state ONLY while not initialized
  // isLoading is separate - don't block on it to prevent stuck screens
  if (!persistentAuth.isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm uppercase tracking-wider">Initializing Quantum Falcon...</p>
        </div>
      </div>
    )
  }

  // Show LoginPage if not authenticated and initialized
  // CRITICAL: Check auth state explicitly to prevent black screen
  if (persistentAuth.isInitialized && (!auth || !auth.isAuthenticated)) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground text-sm uppercase tracking-wider">Loading...</p>
          </div>
        </div>
      }>
        <LoginPage />
      </Suspense>
    )
  }

  return (
    <ErrorBoundary FallbackComponent={ComponentErrorFallback}>
      <div className={cn('min-h-screen bg-background text-foreground flex relative', isMobile && 'flex-col')}>
        {/* Ambient Background Particles */}
        <AmbientParticles />
        
        <DebugHelper />
        <AIBotAssistant />
        <RiskDisclosureBanner />
        <MasterSearch isOpen={showMasterSearch} onClose={() => setShowMasterSearch(false)} />
        
        {/* First-time user intro splash */}
        <IntroSplash onFinished={() => {}} />
        
        {/* Interactive Tour - Comprehensive onboarding experience */}
        <InteractiveTour
          isOpen={showOnboarding}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
          setActiveTab={setActiveTab}
        />

        {/* GOD MODE indicator removed from top right - now only in sidebar */}

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
                const isEliteOrLifetime = auth.license?.tier?.toUpperCase() === 'ELITE' || auth.license?.tier?.toUpperCase() === 'LIFETIME';
                const showCrownBadge = tab.id === 'settings' && isEliteOrLifetime;
                
                return (
                  <motion.button
                    key={tab.id}
                    data-tab={tab.id}
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
                {(() => {
                  const tier = auth.license?.tier?.toUpperCase() || 'FREE'
                  // Tier color mapping with distinct colors
                  const tierColors: Record<string, { color: string; glow: string; pulse?: boolean }> = {
                    'FREE': { 
                      color: '#9CA3AF', // Gray
                      glow: 'rgba(156, 163, 175, 0.4)',
                      pulse: true
                    },
                    'STARTER': { 
                      color: '#3B82F6', // Blue
                      glow: 'rgba(59, 130, 246, 0.4)'
                    },
                    'TRADER': { 
                      color: '#10B981', // Green
                      glow: 'rgba(16, 185, 129, 0.4)'
                    },
                    'PRO': { 
                      color: '#8B5CF6', // Purple
                      glow: 'rgba(139, 92, 246, 0.4)'
                    },
                    'ELITE': { 
                      color: '#F59E0B', // Amber/Gold
                      glow: 'rgba(245, 158, 11, 0.4)'
                    },
                    'LIFETIME': { 
                      // Platinum with Solana hue (cyan/purple blend)
                      color: '#E5E7EB', // Platinum base
                      glow: 'rgba(0, 212, 255, 0.6), rgba(168, 85, 247, 0.4)', // Solana cyan + purple
                      pulse: true
                    }
                  }
                  
                  const tierStyle = tierColors[tier] || tierColors['FREE']
                  const isLifetime = tier === 'LIFETIME'
                  
                  return (
                    <>
                      <motion.div
                        animate={isLifetime ? {
                          scale: [1, 1.05, 1],
                          filter: [
                            'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6)) drop-shadow(0 0 12px rgba(168, 85, 247, 0.4))',
                            'drop-shadow(0 0 12px rgba(0, 212, 255, 0.8)) drop-shadow(0 0 16px rgba(168, 85, 247, 0.6))',
                            'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6)) drop-shadow(0 0 12px rgba(168, 85, 247, 0.4))'
                          ]
                        } : tierStyle.pulse ? {
                          scale: [1, 1.03, 1],
                          filter: [`drop-shadow(0 0 6px ${tierStyle.glow})`]
                        } : {}}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Crown 
                          size={14} 
                          weight="fill" 
                          style={{
                            color: isLifetime ? '#E5E7EB' : tierStyle.color,
                            filter: isLifetime 
                              ? 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6)) drop-shadow(0 0 12px rgba(168, 85, 247, 0.4))'
                              : `drop-shadow(0 0 6px ${tierStyle.glow})`
                          }}
                        />
                      </motion.div>
                      <span 
                        className="text-xs font-bold uppercase"
                        style={{
                          color: isLifetime ? '#E5E7EB' : tierStyle.color,
                          textShadow: isLifetime
                            ? '0 0 8px rgba(0, 212, 255, 0.6), 0 0 12px rgba(168, 85, 247, 0.4)'
                            : `0 0 6px ${tierStyle.glow}`
                        }}
                      >
                        {tier} TIER
                      </span>
                    </>
                  )
                })()}
              </div>
              <p className="text-xs text-muted-foreground text-center font-mono">
                v2025.1.0 • Production
              </p>
            </div>
          </div>
        )}

        <div className={cn('flex-1 relative z-10', !isMobile && 'ml-[240px]')}>
          <ErrorBoundary 
            FallbackComponent={ComponentErrorFallback}
            onError={(error, errorInfo) => {
              // Log component load failures
              if (error.message.includes('Failed to fetch dynamically imported module') || 
                  error.message.includes('Import timeout')) {
                logError(error, `Tab: ${activeTab}`, errorInfo.componentStack)
              }
            }}
          >
            <Suspense 
              fallback={
                <div className="min-h-screen bg-background flex items-center justify-center" style={{ zIndex: 1 }}>
                  <div className="text-center">
                    <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-muted-foreground text-xs uppercase tracking-wider">
                      {activeTab}
                    </p>
                  </div>
                </div>
              }
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  className="h-full"
                >
                  <ErrorBoundary 
                    FallbackComponent={ComponentErrorFallback}
                    onError={(error, errorInfo) => {
                      logError(error, `Component: ${activeTab}`, errorInfo.componentStack)
                    }}
                  >
                    <ActiveComponent />
                  </ErrorBoundary>
                </motion.div>
              </AnimatePresence>
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
