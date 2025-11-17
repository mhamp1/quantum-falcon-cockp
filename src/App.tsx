import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { House, Robot, ChartLine, TrendUp, Vault, Users, Gear } from '@phosphor-icons/react';
import Dashboard from '@/components/dashboard/Dashboard';
import BotOverview from '@/components/agents/BotOverview';
import Analytics from '@/components/analytics/Analytics';
import Trading from '@/components/trade/Trading';
import VaultView from '@/components/vault/VaultView';
import Community from '@/components/community/Community';
import Settings from '@/components/settings/Settings';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [username] = useState('MHAMP1TRADING');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex flex-col lg:flex-row min-h-screen">
        <aside className="hidden lg:flex lg:flex-col w-64 border-r-2 border-primary/30 bg-card/50 backdrop-blur-sm">
          <div className="p-6 border-b-2 border-primary/30">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold uppercase tracking-wider text-accent">
                QUANTUM
              </h1>
              <h2 className="text-xl font-bold uppercase tracking-wider text-primary">
                FALCON
              </h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                ◆ SYSTEM_ONLINE
              </p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: House },
              { id: 'bots', label: 'AI Agents', icon: Robot },
              { id: 'analytics', label: 'Analytics', icon: ChartLine },
              { id: 'trading', label: 'Trading', icon: TrendUp },
              { id: 'vault', label: 'Vault', icon: Vault },
              { id: 'community', label: 'Community', icon: Users },
              { id: 'settings', label: 'Settings', icon: Gear },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-2 ${
                  activeTab === id
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(0,255,255,0.5)]'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-primary/30'
                }`}
              >
                <Icon size={20} weight="duotone" />
                <span className="font-medium uppercase tracking-wide text-sm">{label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t-2 border-primary/30">
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="uppercase tracking-wider">AGENT-ID: {username}</p>
              <p className="text-[10px]">v2.4.1 QUANTUM BUILD</p>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="lg:hidden border-b-2 border-primary/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
              <TabsList className="w-full grid grid-cols-7 h-16 bg-transparent border-none">
                {[
                  { id: 'dashboard', icon: House },
                  { id: 'bots', icon: Robot },
                  { id: 'analytics', icon: ChartLine },
                  { id: 'trading', icon: TrendUp },
                  { id: 'vault', icon: Vault },
                  { id: 'community', icon: Users },
                  { id: 'settings', icon: Gear },
                ].map(({ id, icon: Icon }) => (
                  <TabsTrigger
                    key={id}
                    value={id}
                    className="flex-col gap-1 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_20px_rgba(0,255,255,0.5)]"
                  >
                    <Icon size={20} weight="duotone" />
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="p-4 lg:p-6">
              <TabsContent value="dashboard" className="mt-0">
                <Dashboard username={username} />
              </TabsContent>
              <TabsContent value="bots" className="mt-0">
                <BotOverview />
              </TabsContent>
              <TabsContent value="analytics" className="mt-0">
                <Analytics />
              </TabsContent>
              <TabsContent value="trading" className="mt-0">
                <Trading />
              </TabsContent>
              <TabsContent value="vault" className="mt-0">
                <VaultView />
              </TabsContent>
              <TabsContent value="community" className="mt-0">
                <Community />
              </TabsContent>
              <TabsContent value="settings" className="mt-0">
                <Settings />
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
