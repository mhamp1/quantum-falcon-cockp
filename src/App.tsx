import { useState } from "react";
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

  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];
  const Component = currentTab.component;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-80
          flex flex-col bg-card backdrop-blur-xl border-r-2 border-primary
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between p-6 border-b-2 border-primary/30 relative">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold uppercase tracking-[0.15em] neon-glow-primary">
              QUANTUM
            </h1>
            <h1 className="text-2xl font-bold uppercase tracking-[0.15em] neon-glow">
              FALCON
            </h1>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse neon-glow" />
              <span className="text-[10px] font-semibold tracking-widest text-secondary">ONLINE</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden relative z-10 border-2 border-primary hover:bg-primary/10"
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
                  w-full flex items-center gap-4 px-6 py-4 text-base font-semibold uppercase tracking-[0.1em]
                  transition-all duration-200 border-2 relative group
                  ${
                    isActive
                      ? "bg-primary/10 text-secondary border-secondary neon-glow-accent"
                      : "text-muted-foreground border-primary/20 hover:text-secondary hover:bg-primary/5 hover:border-primary/50"
                  }
                `}
                style={{
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
                }}
              >
                <Icon size={28} weight={isActive ? "fill" : "regular"} />
                <span className="flex-1 text-left">{tab.label}</span>
                {isActive && (
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse neon-glow" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t-2 border-primary/30 bg-primary/5">
          <div className="text-[10px] font-bold tracking-widest text-secondary mb-3 uppercase">System Status</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Connection</span>
              <span className="text-secondary text-[10px] font-bold neon-glow">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Build</span>
              <span className="text-primary text-[10px] font-bold tracking-wider">v2.4.1</span>
            </div>
          </div>
          <div className="mt-3 h-1 bg-muted relative overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 neon-glow-accent" 
              style={{ width: '85%' }} 
            />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 bg-card backdrop-blur-xl border-b-2 border-primary">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="border-2 border-primary hover:bg-primary/10"
            >
              <List size={24} className="text-primary" />
            </Button>
            <h2 className="text-lg font-bold text-secondary uppercase tracking-[0.15em] neon-glow">
              {currentTab.label}
            </h2>
            <div className="w-10" />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-auto scrollbar-thin">
          <Component key={activeTab} />
        </main>
      </div>

      <Toaster />
    </div>
  );
}
