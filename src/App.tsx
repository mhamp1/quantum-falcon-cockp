import { useEffect, useState } from "react";
  House,
  House,
  Users,
  ChartLine,
  Vault,
  Users,
  Gear,
import { Bu
import Dashb
import 
impo
import AdvancedTradingHub from 

interface Tab {
  label: string;
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
  { id: "agents", label: "AI Agen
}

const TABS: Tab[] = [
  }
    id: "dashboard",
    label: "Trading",
    icon: House,
  },
  },
   
    id: "bot-overview",
    component: SocialCommu
    icon: Terminal,
    id: "settings",
  },
    component: EnhancedSettings,
  {

    label: "Analytics",
  const [sidebarOpen
    component: Analytics,
    
   
    id: "trading",
    label: "Trading",
    icon: Lightning,
    component: AdvancedTradingHub,
  },
  { id: "vault", label: "Vault", icon: Vault, component: VaultView },
  {
    id: "community",
            <X size={24
        </div>
        <nav className="flex-1 
    
   
                key
                  setA
               
                  w-full flex it
    
  

              >
                <span>{tab.label}</span>
            );

        <div classN
            <div className="flex items-center justify-betwe
              <span className=
            <div className="flex items-center just
              <span className
          </div>
      <
      

              variant="ghost"
              on
              <List size={24} />
            <h2 class

          </div>


      </di
      <AIAssistant />
      <Toaster />
  );



























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
