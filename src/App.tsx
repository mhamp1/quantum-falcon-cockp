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
          fixed lg:static inset-y-0 left-0 z-50 w-80 
          flex flex-col cyber-card border-r-4 border-primary/60
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between p-8 border-b-4 border-primary/60 relative">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
            <svg width="128" height="128" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="40" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" opacity="0.3" />
              <circle cx="64" cy="64" r="30" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" opacity="0.5" />
              <circle cx="64" cy="64" r="20" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" opacity="0.7" />
            </svg>
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-bold uppercase tracking-[0.3em] mb-1">
              <span className="text-primary neon-glow-primary">QUANTUM</span>
            </h1>
            <h1 className="text-3xl font-bold uppercase tracking-[0.3em]">
              <span className="text-secondary neon-glow-secondary">FALCON</span>
            </h1>
            <div className="flex items-center gap-2 mt-3">
              <div className="status-indicator" />
              <span className="hud-readout text-[10px]">ONLINE</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden relative z-10 border border-primary/30 hover:bg-primary/10"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} className="text-primary" />
          </Button>
        </div>

        <nav className="flex-1 p-6 space-y-4 overflow-y-auto scrollbar-thin">
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
                  w-full flex items-center gap-5 px-6 py-5 text-lg font-bold uppercase tracking-[0.2em]
                  transition-all border-l-4 relative group
                  ${
                    isActive
                      ? "bg-primary/20 text-secondary border-secondary neon-glow-accent shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.6)]"
                      : "text-muted-foreground border-transparent hover:text-primary hover:bg-muted/30 hover:border-primary/50"
                  }
                `}
              >
                <div className={`p-3 ${isActive ? 'bg-secondary/20 border border-secondary/40' : 'bg-muted/30 border border-primary/20'} transition-all relative`}>
                  <Icon size={28} weight={isActive ? "duotone" : "regular"} />
                  {isActive && (
                    <>
                      <div className="hud-corner-tl" style={{ borderColor: 'var(--secondary)' }} />
                      <div className="hud-corner-br" style={{ borderColor: 'var(--secondary)' }} />
                    </>
                  )}
                </div>
                <span className="flex-1 text-left">{tab.label}</span>
                {isActive && (
                  <div className="w-2 h-2 bg-secondary animate-pulse-glow" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-8 border-t-4 border-primary/60 bg-muted/20 relative">
          <div className="absolute inset-0 technical-grid opacity-20 pointer-events-none" />
          <div className="relative z-10">
            <div className="hud-readout text-sm mb-5">SYSTEM_STATUS</div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="data-label text-sm">CONNECTION</span>
                <div className="flex items-center gap-2">
                  <div className="status-indicator" />
                  <span className="text-primary text-sm font-bold">ONLINE</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="data-label text-sm">BUILD</span>
                <span className="text-primary text-sm font-bold tracking-wider">v2.4.1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="data-label text-sm">UPTIME</span>
                <span className="text-accent text-sm font-bold tracking-wider">24:07:32</span>
              </div>
            </div>
            <div className="mt-5 h-1.5 bg-primary/20 relative overflow-hidden">
              <div className="h-full bg-primary animate-pulse" style={{ width: '85%' }} />
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 cyber-card border-b-4 border-primary/60">
          <div className="flex items-center justify-between p-5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="border border-primary/30 hover:bg-primary/10"
            >
              <List size={28} className="text-primary" />
            </Button>
            <div className="text-center">
              <h2 className="text-xl font-bold text-secondary uppercase tracking-[0.25em] neon-glow-accent">
                {currentTab.label}
              </h2>
            </div>
            <div className="w-10" />
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-auto">
          <Component key={activeTab} />
        </main>
      </div>

      <AIAssistant />

      <Toaster />
    </div>
  );
}
