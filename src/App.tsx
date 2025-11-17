import { useKV } from '@/hooks/useKVFallback';
import { useEffect, useMemo, Suspense, lazy } from 'react';
import { House, Robot, ChartLine, Vault, Users, Gear, Terminal, Flask, Lightning } from '@phosphor-icons/react';
import { useIsMobile } from '@/hooks/use-mobile';

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

interface Tab {
  id: string;
  label: string;
  icon: any;
  component: React.ComponentType;
}

export default function App() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useKV<string>('active-tab', 'dashboard');

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
    const handleNavigateTab = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const newTab = customEvent.detail;
      if (tabs.some(tab => tab.id === newTab)) {
        setActiveTab(newTab);
      }
    };

    window.addEventListener('navigate-tab', handleNavigateTab);
    return () => window.removeEventListener('navigate-tab', handleNavigateTab);
  }, [setActiveTab, tabs]);

  const Component = tabs.find(tab => tab.id === activeTab)?.component || EnhancedDashboard;

  return (
    <div>
      {isMobile ? (
        <Suspense fallback={<LoadingFallback />}>
          <AIAssistant />
        </Suspense>
      ) : (
        <Suspense fallback={<LoadingFallback />}>
          <Component key={activeTab} />
        </Suspense>
      )}
    </div>
  );
}
