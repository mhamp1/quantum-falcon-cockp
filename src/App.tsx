import { useState } from 'react';
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

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: House },
    { id: 'bots', label: 'AI Agents', icon: Robot },
    { id: 'analytics', label: 'Analytics', icon: ChartLine },
    { id: 'trading', label: 'Trading', icon: TrendUp },
    { id: 'vault', label: 'Vault', icon: Vault },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'settings', label: 'Settings', icon: Gear },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard username={username} />;
      case 'bots':
        return <BotOverview />;
      case 'analytics':
        return <Analytics />;
      case 'trading':
        return <Trading />;
      case 'vault':
        return <VaultView />;
      case 'community':
        return <Community />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard username={username} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r-2 border-primary/20 bg-card/50 backdrop-blur-sm flex flex-col">
          <div className="p-6 border-b-2 border-primary/20">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold uppercase tracking-wider bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
                QUANTUM
              </h1>
              <h2 className="text-xl font-bold uppercase tracking-wider text-primary">
                FALCON
              </h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-primary rounded-full animate-pulse" />
                SYSTEM_ONLINE
              </p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-2 rounded-lg ${
                  activeTab === id
                    ? 'bg-primary/10 border-primary text-primary neon-glow-cyan'
                    : 'border-transparent text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5'
                }`}
              >
                <Icon size={22} weight="duotone" />
                <span className="font-medium uppercase tracking-wide text-sm">{label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t-2 border-primary/20">
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="uppercase tracking-wider">AGENT-ID: {username}</p>
              <p className="text-[10px]">v2.4.1 QUANTUM BUILD</p>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
