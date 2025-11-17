import { useEffect } from "react";
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

import Dashboard from "@/components/dashboard/Dashboard";
import BotOverview from "@/components/dashboard/BotOverview";
import Analytics from "@/components/dashboard/Analytics";
import Agents from "@/components/agents/Agents";
import VaultView from "@/components/vault/VaultView";
import SocialCommunity from "@/components/community/SocialCommunity";
import AdvancedTradingHub from "@/components/trade/AdvancedTradingHub";
import EnhancedSettings from "@/components/settings/EnhancedSettings";
import AIAssistant from "@/components/shared/AIAssistant";

interface Tab {
  id: string;
  label: string;
  icon: any;
  component: React.ComponentType;
}

const TABS: Tab[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: House,
    component: Dashboard,
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
    component: Analytics,
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
];

export default function App() {
  const [activeTab, setActiveTab] = useKV<string>("active-tab", "dashboard");

  useEffect(() => {
    const handleNavigateTab = (e: CustomEvent<string>) => {
      const newTab = e.detail;
      if (TABS.some((tab) => tab.id === newTab)) {
        setActiveTab(newTab);
      }
    };

    window.addEventListener("navigate-tab", handleNavigateTab as EventListener);
    return () =>
      window.removeEventListener("navigate-tab", handleNavigateTab as EventListener);
  }, [setActiveTab]);

  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];
  const Component = currentTab.component;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b-2 border-primary/30">
        <div className="flex items-center overflow-x-auto scrollbar-thin">
          {TABS.map((tab) => {
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
        <Component key={activeTab} />
      </main>

      <AIAssistant />

      <Toaster />
    </div>
  );
}
