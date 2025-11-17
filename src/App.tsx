import { useEffect, useState } from "react";
import {
  House,
  Robot,
  ChartLine,
  Vault,
  Users,
  Gear,
  Terminal,
  Lightning,
  List,
  X,
} from "@phosphor-icons/react";

import { useKV } from "@github/spark/hooks";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleNavigateTab = (e: CustomEvent<string>) => {
      const newTab = e.detail;
      if (TABS.some((tab) => tab.id === newTab)) {
        setActiveTab(newTab);
        setSidebarOpen(false);
      }
    };

    window.addEventListener("navigate-tab", handleNavigateTab as EventListener);
    return () =>
      window.removeEventListener("navigate-tab", handleNavigateTab as EventListener);
  }, [setActiveTab]);

  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];
  const Component = currentTab.component;

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-card border-r-2 border-primary/30
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          flex flex-col
        `}
      >
        <div className="p-6 border-b-2 border-primary/30 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary neon-glow-accent uppercase tracking-wider">
              QUANTUM
            </h1>
            <p className="text-xs text-primary uppercase tracking-widest">Falcon Cockpit</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </Button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-wider
                  transition-all border-l-4
                  ${
                    isActive
                      ? "bg-primary/10 text-secondary border-secondary neon-glow-accent"
                      : "text-muted-foreground border-transparent hover:text-primary hover:bg-muted/20 hover:border-primary/50"
                  }
                `}
              >
                <Icon size={20} weight={isActive ? "fill" : "regular"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t-2 border-primary/30">
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            <div className="flex items-center justify-between mb-1">
              <span>System Status</span>
              <span className="text-primary">ONLINE</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Build</span>
              <span className="text-primary">v2.0.4</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b-2 border-primary/30">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <List size={24} />
            </Button>
            <h2 className="text-lg font-bold text-secondary uppercase tracking-wider">
              {currentTab.label}
            </h2>
            <div className="w-10" />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Component key={activeTab} />
        </main>
      </div>

      <AIAssistant />

      <Toaster />
    </div>
  );
}
