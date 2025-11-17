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
import AIAssistant from "@/components/shared/AIAssistant";

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
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-96
          flex flex-col bg-card backdrop-blur-xl border-r-2 border-primary shadow-[0_0_30px_oklch(0.62_0.25_290_/_0.4)]
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between p-8 border-b-2 border-primary/30 relative">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold uppercase tracking-[0.2em] neon-glow-primary mb-1">
              QUANTUM
            </h1>
            <h1 className="text-3xl font-bold uppercase tracking-[0.2em] neon-glow mb-1">
              FALCON
            </h1>
            <div className="flex items-center gap-2 mt-4">
              <div className="w-3 h-3 bg-secondary rounded-full animate-pulse neon-glow" />
              <span className="text-[11px] font-semibold tracking-widest text-secondary uppercase">ONLINE</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden relative z-10 border-2 border-primary hover:bg-primary/10"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} className="text-primary" />
          </Button>
        </div>

        <nav className="flex-1 p-5 space-y-3 overflow-y-auto scrollbar-thin">
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
                  w-full flex items-center gap-5 px-8 py-5 text-lg font-semibold uppercase tracking-[0.12em]
                  transition-all duration-200 border-2 relative group rounded-lg
                  ${
                    isActive
                      ? "bg-primary/15 text-secondary border-primary shadow-[0_0_25px_oklch(0.62_0.25_290_/_0.4)]"
                      : "text-muted-foreground border-primary/20 hover:text-secondary hover:bg-primary/10 hover:border-primary/50"
                  }
                `}
              >
                <Icon size={32} weight={isActive ? "fill" : "regular"} />
                <span className="flex-1 text-left">{tab.label}</span>
                {isActive && (
                  <div className="w-3 h-3 bg-secondary rounded-full animate-pulse neon-glow" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-5 border-t-2 border-primary/30 bg-primary/5">
          <div className="text-[11px] font-bold tracking-widest text-secondary mb-4 uppercase">System Status</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Connection</span>
              <span className="text-secondary text-[11px] font-bold neon-glow">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Build</span>
              <span className="text-primary text-[11px] font-bold tracking-wider">v2.4.1</span>
            </div>
          </div>
          <div className="mt-4 h-2 bg-muted relative overflow-hidden rounded-full">
            <div 
              className="h-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-500 neon-glow-accent rounded-full" 
              style={{ width: '85%' }} 
            />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-card backdrop-blur-xl border-b-2 border-primary shadow-[0_0_20px_oklch(0.62_0.25_290_/_0.3)]">
          <div className="flex items-center justify-between p-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="border-2 border-primary hover:bg-primary/10"
            >
              <List size={28} className="text-primary" />
            </Button>
            <h2 className="text-xl font-bold text-secondary uppercase tracking-[0.15em] neon-glow">
              {currentTab.label}
            </h2>
            <div className="w-12" />
          </div>
        </header>

        <main className="flex-1 p-6 md:p-10 overflow-auto scrollbar-thin">
          <Component key={activeTab} />
        </main>
      </div>

      <AIAssistant />
      <Toaster />
    </div>
  );
}
