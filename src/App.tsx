import { useState } from "react";
import {
  House,
  Lightning,
  ChartLine,
  Vault,
  Users,
  Gear,
  List,
  X,
  Robot,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

import Dashboard from "@/components/dashboard/Dashboard";
import AdvancedTradingHub from "@/components/trade/AdvancedTradingHub";
import Analytics from "@/components/dashboard/Analytics";
import Agents from "@/components/agents/Agents";
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
    id: "trading",
    label: "Trading",
    icon: Lightning,
    component: AdvancedTradingHub,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: ChartLine,
    component: Analytics,
  },
  {
    id: "agents",
    label: "AI Agents",
    icon: Robot,
    component: Agents,
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

  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];
  const Component = currentTab.component;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72
          flex flex-col cyber-card border-r-4 border-primary/60
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between p-6 border-b-4 border-primary/60 relative">
          <div className="absolute top-0 right-0 w-24 h-24 opacity-10 pointer-events-none">
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="30" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" opacity="0.3" />
              <circle cx="48" cy="48" r="22" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" opacity="0.5" />
              <circle cx="48" cy="48" r="14" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" opacity="0.7" />
            </svg>
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold uppercase tracking-[0.25em] mb-0.5">
              <span className="text-primary neon-glow-primary">QUANTUM</span>
            </h1>
            <h1 className="text-2xl font-bold uppercase tracking-[0.25em]">
              <span className="text-secondary neon-glow-secondary">FALCON</span>
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="status-indicator" style={{ width: '6px', height: '6px' }} />
              <span className="hud-readout text-[9px]">ONLINE</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden relative z-10 border border-primary/30 hover:bg-primary/10"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} className="text-primary" />
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
                  w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-[0.15em]
                  transition-all border-l-3 relative group
                  ${
                    isActive
                      ? "bg-primary/20 text-secondary border-secondary neon-glow-accent shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.5)]"
                      : "text-muted-foreground border-transparent hover:text-primary hover:bg-muted/30 hover:border-primary/50"
                  }
                `}
              >
                <div className={`p-2 ${isActive ? 'bg-secondary/20 border border-secondary/40' : 'bg-muted/30 border border-primary/20'} transition-all relative`}>
                  <Icon size={20} weight={isActive ? "duotone" : "regular"} />
                  {isActive && (
                    <>
                      <div className="hud-corner-tl" style={{ borderColor: 'var(--secondary)', width: '10px', height: '10px' }} />
                      <div className="hud-corner-br" style={{ borderColor: 'var(--secondary)', width: '10px', height: '10px' }} />
                    </>
                  )}
                </div>
                <span className="flex-1 text-left">{tab.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-secondary animate-pulse-glow" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t-4 border-primary/60 bg-muted/20 relative">
          <div className="absolute inset-0 technical-grid opacity-20 pointer-events-none" />
          <div className="relative z-10">
            <div className="hud-readout text-xs mb-4">SYSTEM_STATUS</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="data-label text-xs">CONNECTION</span>
                <div className="flex items-center gap-2">
                  <div className="status-indicator" style={{ width: '6px', height: '6px' }} />
                  <span className="text-primary text-xs font-bold">ONLINE</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="data-label text-xs">BUILD</span>
                <span className="text-primary text-xs font-bold tracking-wider">v2.4.1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="data-label text-xs">UPTIME</span>
                <span className="text-accent text-xs font-bold tracking-wider">24:07:32</span>
              </div>
            </div>
            <div className="mt-4 h-1 bg-primary/20 relative overflow-hidden">
              <div className="h-full bg-primary animate-pulse" style={{ width: '85%' }} />
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 cyber-card border-b-4 border-primary/60">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="border border-primary/30 hover:bg-primary/10"
            >
              <List size={24} className="text-primary" />
            </Button>
            <div className="text-center">
              <h2 className="text-lg font-bold text-secondary uppercase tracking-[0.2em] neon-glow-accent">
                {currentTab.label}
              </h2>
            </div>
            <div className="w-10" />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto scrollbar-thin">
          <Component key={activeTab} />
        </main>
      </div>

      <AIAssistant />

      <Toaster />
    </div>
  );
}
