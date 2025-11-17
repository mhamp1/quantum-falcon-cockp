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
import { useKV } from "@github/spark/hooks";
import Dashboard from "@/components/dashboard/Dashboard";
import Agents from "@/components/agents/Agents";
import Trade from "@/components/trade/Trade";
import VaultView from "@/components/vault/VaultView";
import SocialCommunity from "@/components/community/SocialCommunity";
import EnhancedSettings from "@/components/settings/EnhancedSettings";
import AIAssistant from "@/components/shared/AIAssistant";
import WelcomeScreen from "@/components/auth/WelcomeScreen";
import LicenseAuth from "@/components/auth/LicenseAuth";

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
    label: "Agents",
    icon: Robot,
    component: Agents,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Gear,
    component: EnhancedSettings,
  },
  {
    id: "trade",
    label: "Trading",
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
];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newsText] = useState("BTC remains supportive low levels - Market stabilizing - SOL testing resistance");
  const [hasSeenWelcome, setHasSeenWelcome] = useKV("has-seen-welcome", "false");
  const [isAuthenticated, setIsAuthenticated] = useKV("is-authenticated", "false");

  useEffect(() => {
    document.documentElement.classList.remove("high-contrast");
  }, []);

  const handleWelcomeContinue = () => {
    setHasSeenWelcome("true");
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated("true");
  };

  if (hasSeenWelcome !== "true") {
    return <WelcomeScreen onAuthenticate={handleWelcomeContinue} />;
  }

  if (isAuthenticated !== "true") {
    return <LicenseAuth onSuccess={handleAuthSuccess} />;
  }

  const currentTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];
  const Component = currentTab.component;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B0F14] text-foreground">
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64
          flex flex-col bg-background border-r-2 border-secondary/30
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between p-6 border-b border-secondary/30 relative">
          <div className="relative z-10">
            <h1 className="text-xl font-bold uppercase tracking-[0.15em] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-1" style={{ transform: 'skewY(-2deg)' }}>
              QUANTUM
            </h1>
            <h1 className="text-xl font-bold uppercase tracking-[0.15em] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent" style={{ transform: 'skewY(-2deg)' }}>
              FALCON
            </h1>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span className="text-[10px] font-semibold tracking-widest text-secondary uppercase">System: Online</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden absolute top-2 right-2 text-secondary hover:bg-secondary/10"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
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
                  w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em]
                  transition-all duration-200 rounded-sm
                  ${
                    isActive
                      ? "bg-secondary/10 text-secondary border-l-4 border-secondary"
                      : "text-muted-foreground hover:text-secondary hover:bg-secondary/5"
                  }
                `}
              >
                <Icon size={20} weight={isActive ? "fill" : "regular"} />
                <span className="flex-1 text-left">{tab.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-secondary/30 bg-background/50">
          <div className="text-[10px] font-bold tracking-widest text-secondary mb-3 uppercase">System Status</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Connection</span>
              <span className="text-secondary text-[10px] font-bold">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Build</span>
              <span className="text-primary text-[10px] font-bold tracking-wider">v2.4.1</span>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-secondary/30">
          <div className="flex items-center justify-between h-10 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-secondary hover:bg-secondary/10"
            >
              <List size={20} />
            </Button>
           
            <div className="flex-1 flex items-center justify-end gap-4">
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-xs font-bold text-destructive uppercase tracking-wide">Live News</span>
                <div className="overflow-hidden max-w-md">
                  <div className="animate-marquee whitespace-nowrap text-xs text-destructive/70">
                    {newsText}
                  </div>
                </div>
              </div>
             
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 text-muted-foreground hover:text-foreground"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-auto scrollbar-thin">
          <Component key={activeTab} />
        </main>
      </div>
      <AIAssistant />
      <Toaster />
    </div>
  );
}