import { useKV } from '@github/spark/hooks'
import { House, Robot, ChartLine, Vault, Users, Gear, Terminal, Flask, Lightning } from '@phosphor-icons/react'
import Dashboard from '@/components/dashboard/Dashboard'
import BotOverview from '@/components/dashboard/BotOverview'
import Analytics from '@/components/dashboard/Analytics'
import Agents from '@/components/agents/Agents'
import VaultView from '@/components/vault/VaultView'
import Community from '@/components/community/Community'
import TradingStrategies from '@/components/trade/TradingStrategies'
import EnhancedSettings from '@/components/settings/EnhancedSettings'
import { useIsMobile } from '@/hooks/use-mobile'

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="cyber-card flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4 p-8">
        <div className="inline-flex p-6 jagged-corner bg-primary/20 border-3 border-primary">
          <Flask size={64} weight="duotone" className="text-primary" />
        </div>
        <h2 className="text-3xl font-bold uppercase tracking-[0.15em] text-primary hud-text">{title}</h2>
        <p className="text-muted-foreground uppercase tracking-wide text-sm">MODULE_UNDER_DEVELOPMENT</p>
        <div className="flex items-center justify-center gap-2 pt-4">
          <div className="w-2 h-2 bg-primary animate-pulse" />
          <div className="w-2 h-2 bg-primary animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-primary animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useKV<string>('active-tab', 'dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: House, component: Dashboard },
    { id: 'bot-overview', label: 'Bot Overview', icon: Terminal, component: BotOverview },
    { id: 'agents', label: 'AI Agents', icon: Robot, component: Agents },
    { id: 'analytics', label: 'Analytics', icon: ChartLine, component: Analytics },
    { id: 'trading', label: 'Trading', icon: Lightning, component: TradingStrategies },
    { id: 'vault', label: 'Vault', icon: Vault, component: VaultView },
    { id: 'community', label: 'Community', icon: Users, component: Community },
    { id: 'settings', label: 'Settings', icon: Gear, component: EnhancedSettings },
  ]

  const Component = tabs.find(tab => tab.id === activeTab)?.component || Dashboard

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 technical-grid opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="relative z-10 flex">
        {!isMobile && (
          <aside className="w-64 border-r-2 border-primary/30 bg-card/80 backdrop-blur-sm sticky top-0 h-screen flex flex-col">
            <div className="p-6 border-b-2 border-primary/30">
              <div className="mb-2">
                <h1 className="text-lg font-bold tracking-[0.15em] uppercase leading-tight">
                  <span className="text-primary neon-glow-primary block">QUANTUM</span>
                  <span className="text-secondary neon-glow-secondary block">FALCON</span>
                </h1>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <div className="status-indicator" style={{ width: '4px', height: '4px' }} />
                <span className="hud-readout text-[9px]">SYSTEM_ONLINE</span>
              </div>
            </div>
            
            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all jagged-corner-small ${
                        isActive
                          ? 'bg-primary/20 text-primary border-l-3 border-primary shadow-[0_0_15px_oklch(0.72_0.20_195_/_0.4)]'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 border-l-3 border-transparent'
                      }`}
                    >
                      <Icon size={18} weight={isActive ? 'fill' : 'duotone'} className={isActive ? 'neon-glow-primary' : ''} />
                      <span className="text-xs uppercase tracking-[0.1em] font-bold">
                        {tab.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </nav>

            <div className="p-4 border-t-2 border-primary/30">
              <div className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold">
                V2.4.1 // AI COCKPIT
              </div>
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto" style={{ height: isMobile ? 'calc(100vh - 80px)' : '100vh' }}>
          <div className="container mx-auto px-4 py-6 md:py-8">
            <Component />
          </div>
        </main>

        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-4 border-primary/60 backdrop-blur-sm z-50 shadow-[0_-4px_30px_oklch(0.72_0.20_195_/_0.3)]">
            <div className="grid grid-cols-6 gap-1 p-2">
              {tabs.slice(0, 6).map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center justify-center p-2 transition-all ${
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon size={24} weight={isActive ? 'fill' : 'duotone'} className={isActive ? 'neon-glow-primary' : ''} />
                    <span className="text-[8px] uppercase tracking-wider font-bold mt-1">
                      {tab.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
