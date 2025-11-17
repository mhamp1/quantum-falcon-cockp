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
          flex flex-col bg-card/95 backdrop-blur-xl border-r border-primary/20
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{boxShadow: 'inset -1px 0 0 rgba(147,51,234,0.2)'}}
      >
        <div className="flex items-center justify-between p-6 border-b border-primary/30 relative bg-gradient-to-br from-primary/5 to-transparent">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold uppercase tracking-[0.2em] mb-1">
              <span className="text-primary" style={{textShadow: '0 0 20px rgba(147,51,234,0.8)'}}>QUANTUM</span>
            </h1>
            <h1 className="text-2xl font-bold uppercase tracking-[0.2em]">
              <span className="text-secondary" style={{textShadow: '0 0 20px rgba(34,197,94,0.8)'}}>FALCON</span>
            </h1>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{boxShadow: '0 0 10px rgba(34,197,94,0.8)'}} />
              <span className="text-[10px] font-semibold tracking-widest text-secondary/80">ONLINE</span>
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

        <nav className="flex-1 p-6 space-y-3 overflow-y-auto scrollbar-thin">
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
                  w-full flex items-center gap-4 px-5 py-4 text-sm font-semibold uppercase tracking-[0.12em]
                  transition-all duration-200 border-l-4 relative group rounded-md
                  ${
                    isActive
                      ? "bg-primary/15 text-primary border-primary shadow-[0_0_25px_rgba(147,51,234,0.3)] backdrop-blur-sm"
                      : "text-muted-foreground border-transparent hover:text-primary hover:bg-primary/5 hover:border-primary/30"
                  }
                `}
              >
                <div className={`p-2.5 rounded ${isActive ? 'bg-primary/20' : 'bg-muted/20'} transition-all`}>
                  <Icon size={22} weight={isActive ? "fill" : "regular"} />
                </div>
                <span className="flex-1 text-left text-base">{tab.label}</span>
                {isActive && (
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-primary/20 bg-primary/5 relative">
          <div className="relative z-10">
            <div className="text-xs font-bold tracking-widest text-primary/70 mb-4 uppercase">System Status</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Connection</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{boxShadow: '0 0 8px rgba(34,197,94,0.6)'}} />
                  <span className="text-secondary text-xs font-bold">ONLINE</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Build</span>
                <span className="text-primary text-xs font-bold tracking-wider">v2.4.1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Uptime</span>
                <span className="text-secondary text-xs font-bold tracking-wider">24:07:32</span>
              </div>
            </div>
            <div className="mt-4 h-1.5 bg-muted/30 rounded-full relative overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500" style={{ width: '85%' }} />
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-card/95 backdrop-blur-xl border-b border-primary/20">
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
              <h2 className="text-lg font-bold text-primary uppercase tracking-[0.15em]">
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
