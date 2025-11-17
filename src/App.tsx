import { useState, useEffect } from "react";
import {
  House,
  Robot,
  Lightning,
  Vault,
  Users,
  Gear,
  List,
  X,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

import Dashboard from "@/components/dashboard/Dashboard";
import Agents from "@/components/agents/Agents";
import Trade from "@/components/trade/Trade";
import VaultView from "@/components/vault/VaultView";
import SocialCommunity from "@/components/community/SocialCommunity";
import EnhancedSettings from "@/components/settings/EnhancedSettings";

interface Tab {
  id: string;
  label: string;
  icon: any;
  component: any;
}

const TABS: Tab[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: House,
    component: Dashboard,
  },
  {
    id: "agents",
    label: "AI Agents",
    icon: Robot,
    component: Agents,
  },
  {
    id: "trade",
    label: "Trade",
    icon: Lightning,
    component: Trade,
  },
  {
    id: "vault",
    label: "Vault",
    icon: Vault,
    component: VaultView,
  },
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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("high-contrast");
  }, []);

  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];
  const Component = currentTab.component;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0F14] text-foreground">
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-[200px]
          flex flex-col bg-black border-r border-primary/30
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-6 border-b border-primary/30">
          <div className="relative">
            <h1 className="text-2xl font-bold uppercase tracking-[0.15em] mb-2 bg-gradient-to-r from-secondary via-purple-400 to-primary bg-clip-text text-transparent" style={{ transform: 'rotate(-2deg)', display: 'inline-block' }}>
              QUANTUM
            </h1>
            <h1 className="text-2xl font-bold uppercase tracking-[0.15em] bg-gradient-to-r from-secondary via-purple-400 to-primary bg-clip-text text-transparent" style={{ transform: 'rotate(-2deg)', display: 'inline-block' }}>
              FALCON
            </h1>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-semibold tracking-wider text-primary uppercase">System: Online</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden absolute top-2 right-2 text-primary hover:bg-primary/10"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} className="text-primary" />
          </Button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
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
                  w-full flex items-center gap-3 px-6 py-3 text-sm font-medium uppercase tracking-wider
                  transition-all duration-200 relative group
                  ${
                    isActive
                      ? "text-primary border-l-2 border-primary bg-primary/5"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }
                `}
              >
                <Icon size={16} weight={isActive ? "fill" : "regular"} />
                <span className="flex-1 text-left">{tab.label}</span>
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary shadow-[0_0_8px_currentColor]" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with Live News Ticker */}
        <header className="h-10 bg-black/90 border-b border-primary/20 flex items-center justify-between px-4">
          <div className="flex-1" />
          <div className="flex-1 overflow-hidden">
            <div className="animate-marquee whitespace-nowrap">
              <span className="text-xs text-destructive/80 tracking-wide">
                🔴 Live News: BTC remains supportive at low levels - Market stabilizing
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-primary hover:bg-primary/10 h-8 w-8"
            onClick={() => setSidebarOpen(true)}
          >
            <List size={20} className="text-primary" />
          </Button>
        </header>

        <main className="flex-1 p-6 md:p-10 overflow-auto scrollbar-thin">
          <Component key={activeTab} />
        </main>
      </div>

      <Toaster />
    </div>
  );
}
