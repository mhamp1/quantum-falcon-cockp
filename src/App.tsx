import { useEffect, useMemo, Suspense, lazy } from "react";
import {
  House,
  Robot,
  ChartLine,
  Vault,
  Users,
  Gear,
  Terminal,
  Lightning,
} from "@phosphor-icons/react";

import { useKV } from "@github/spark/hooks";
import { Toaster } from "@/components/ui/sonner";

const EnhancedDashboard = lazy(
  () => import("@/components/dashboard/EnhancedDashboard"),
);
const BotOverview = lazy(() => import("@/components/dashboard/BotOverview"));
const EnhancedAnalytics = lazy(
  () => import("@/components/dashboard/EnhancedAnalytics"),
);
const Agents = lazy(() => import("@/components/agents/Agents"));
const VaultView = lazy(() => import("@/components/vault/VaultView"));
const SocialCommunity = lazy(
  () => import("@/components/community/SocialCommunity"),
);
const AdvancedTradingHub = lazy(
  () => import("@/components/trade/AdvancedTradingHub"),
);
const EnhancedSettings = lazy(
  () => import("@/components/settings/EnhancedSettings"),
);
const AIAssistant = lazy(() => import("@/components/shared/AIAssistant"));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm uppercase tracking-wider">Loading...</p>
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
  const [activeTab, setActiveTab] = useKV<string>("active-tab", "dashboard");

  const tabs: Tab[] = useMemo(
    () => [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: House,
        component: EnhancedDashboard,
      },
      {
        id: "bot-overview",
        label: "Bot Overview",
        icon: Terminal,
        component: BotOverview,
      },
      { id: "agents", label: "AI Agents", icon: Robot, component: Agents },
      {
        id: "analytics",
        label: "Analytics",
        icon: ChartLine,
        component: EnhancedAnalytics,
      },
      {
        id: "trading",
        label: "Trading",
        icon: Lightning,
        component: AdvancedTradingHub,
      },
      { id: "vault", label: "Vault", icon: Vault, component: VaultView },
      {
        id: "community",
        label: "Community",
        icon: Users,
        component: SocialCommunity,
      },
      {
        id: "settings",
        label: "Settings",
        icon: Gear,
        component: EnhancedSettings,
      },
    ],
    [],
  );

  useEffect(() => {
    const handleNavigateTab = (e: CustomEvent<string>) => {
      const newTab = e.detail;
      if (tabs.some((tab) => tab.id === newTab)) {
        setActiveTab(newTab);
      }
    };

    window.addEventListener("navigate-tab", handleNavigateTab as EventListener);
    return () => window.removeEventListener("navigate-tab", handleNavigateTab as EventListener);
  }, [setActiveTab, tabs]);

  const Component =
    tabs.find((tab) => tab.id === activeTab)?.component || EnhancedDashboard;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b-2 border-primary/30">
        <div className="flex items-center overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? "bg-primary/10 text-primary border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/20"
                }`}
              >
                <Icon size={18} weight={isActive ? "fill" : "regular"} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <main className="container mx-auto p-4 md:p-6">
        <Suspense fallback={<LoadingFallback />}>
          <Component key={activeTab} />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <AIAssistant />
      </Suspense>

      <Toaster />
    </div>
  );
}
