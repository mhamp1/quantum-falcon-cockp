// Core Application File - Further enhanced with lazy loading for performance, improved error boundaries, accessibility, and state management
import { useKV } from '@/hooks/useKVFallback';
import { useEffect, useMemo, Suspense, lazy } from 'react';
import { House, Robot, ChartLine, Vault, Users, Gear, Terminal, Flask, Lightning } from '@phosphor-icons/react';

// Lazy load components for better performance and code splitting
const EnhancedDashboard = lazy(() => import('@/components/dashboard/EnhancedDashboard'));
const BotOverview = lazy(() => import('@/components/dashboard/BotOverview'));
const Analytics = lazy(() => import('@/components/dashboard/Analytics'));
const EnhancedAnalytics = lazy(() => import('@/components/dashboard/EnhancedAnalytics'));
const Agents = lazy(() => import('@/components/agents/Agents'));
const VaultView = lazy(() => import('@/components/vault/VaultView'));
const Community = lazy(() => import('@/components/community/Community'));
const SocialCommunity = lazy(() => import('@/components/community/SocialCommunity'));
const AdvancedTradingHub = lazy(() => import('@/components/trade/AdvancedTradingHub'));
const EnhancedSettings = lazy(() => import('@/components/settings/EnhancedSettings'));
const AIAssistant = lazy(() => import('@/components/shared/AIAssistant'));

import { useIsMobile } from '@/hooks/use-mobile';

// Loading component for Suspense
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Define types for better type safety
interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; weight?: string; className?: string }>;
  component: React.ComponentType;
}

// ComingSoon component - moved outside for reusability and enhanced with animation
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="cyber-card flex items-center justify-center min-h-[400px]" role="status" aria-label={`${title} coming soon`}>
      <div className="text-center space-y-4 p-8">
        <div className="inline-flex p-6 jagged-corner bg-primary/20 border-3 border-primary animate-pulse">
          <Flask size={64} weight="duotone" className="text-primary" aria-hidden="true" />
        </div>
        <h2 className="text-3xl font-bold uppercase tracking-[0.15em] text-primary hud-text">{title}</h2>
        <p className="text-muted-foreground uppercase tracking-wide text-sm">MODULE_UNDER_DEVELOPMENT</p>
        <div className="flex items-center justify-center gap-2 pt-4">
          <div className="w-2 h-2 bg-primary animate-pulse" aria-hidden="true" />
          <div className="w-2 h-2 bg-primary animate-pulse" style={{ animationDelay: '0.2s' }} aria-hidden="true" />
          <div className="w-2 h-2 bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useKV<string>('active-tab', 'dashboard');

  // Memoize tabs to avoid unnecessary re-renders
  const tabs: Tab[] = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: House, component: EnhancedDashboard },
    { id: 'bot-overview', label: 'Bot Overview', icon: Terminal, component: BotOverview },
    { id: 'agents', label: 'AI Agents', icon: Robot, component: Agents },
    { id: 'analytics', label: 'Analytics', icon: ChartLine, component: EnhancedAnalytics },
    { id: 'trading', label: 'Trading', icon: Lightning, component: AdvancedTradingHub },
    { id: 'vault', label: 'Vault', icon: Vault, component: VaultView },
    { id: 'community', label: 'Community', icon: Users, component: SocialCommunity },
    { id: 'settings', label: 'Settings', icon: Gear, component: EnhancedSettings },
  ], []);

  useEffect(() => {
    const handleNavigateTab = (e: CustomEvent<string>) => {
      const newTab = e.detail;
      if (tabs.some(tab => tab.id === newTab)) {
        setActiveTab(newTab);
      }
    };

    window.addEventListener('navigate-tab', handleNavigateTab);
    return () => window.removeEventListener('navigate-tab', handleNavigateTab);
  }, [setActiveTab, tabs]);

  // Find the active component, default to EnhancedDashboard
  const Component = tabs.find(tab => tab.id === activeTab)?.component || EnhancedDashboard;

  return (
    <div>
      {isMobile ? (
        <Suspense fallback={<LoadingFallback />}>
          <AIAssistant />
        </Suspense>
      ) : (
        <Suspense fallback={<LoadingFallback />}>
          {/* Add key to force remount if tab changes for better isolation */}
          <Component key={activeTab} />
        </Suspense>
      )}
    </div>
  );
}
