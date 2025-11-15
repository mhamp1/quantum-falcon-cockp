import { useKV } from '@github/spark/hooks'
import { House, Robot, ChartLine, Vault, Users, Gear, Terminal, Flask, Lightning } from '@phosphor-icons/react'
import EnhancedDashboard from '@/components/dashboard/EnhancedDashboard'
import BotOverview from '@/components/dashboard/BotOverview'
import Analytics from '@/components/dashboard/Analytics'
import EnhancedAnalytics from '@/components/dashboard/EnhancedAnalytics'
import Agents from '@/components/agents/Agents'
import VaultView from '@/components/vault/VaultView'
import Community from '@/components/community/Community'
import EnhancedCommunity from '@/components/community/EnhancedCommunity'
import AdvancedTradingHub from '@/components/trade/AdvancedTradingHub'
import EnhancedSettings from '@/components/settings/EnhancedSettings'
import AIAssistant from '@/components/shared/AIAssistant'
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
    { id: 'dashboard', label: 'Dashboard', icon: House, component: EnhancedDashboard },
    { id: 'bot-overview', label: 'Bot Overview', icon: Terminal, component: BotOverview },
    { id: 'agents', label: 'AI Agents', icon: Robot, component: Agents },
    { id: 'analytics', label: 'Analytics', icon: ChartLine, component: EnhancedAnalytics },
    { id: 'trading', label: 'Trading', icon: Lightning, component: AdvancedTradingHub },
    { id: 'vault', label: 'Vault', icon: Vault, component: VaultView },
    { id: 'community', label: 'Community', icon: Users, component: EnhancedCommunity },
    { id: 'settings', label: 'Settings', icon: Gear, component: EnhancedSettings },
  ]

  const Component = tabs.find(tab => tab.id === activeTab)?.component || EnhancedDashboard

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 technical-grid opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="relative z-10 flex">
        {!isMobile && (
          <aside className="w-64 border-r-2 border-primary/30 bg-card/80 backdrop-blur-sm sticky top-0 h-screen flex flex-col shadow-[2px_0_20px_oklch(0.72_0.20_195_/_0.15)]">
            <div className="p-6 border-b-2 border-primary/30 relative overflow-hidden group">
              <div className="absolute inset-0 diagonal-stripes opacity-5 pointer-events-none" />
              <div className="mb-2 relative z-10">
                <h1 className="text-lg font-bold tracking-[0.15em] uppercase leading-tight">
                  <span className="text-primary neon-glow-primary block">QUANTUM</span>
                  <span className="text-secondary neon-glow-secondary block">FALCON</span>
                </h1>
              </div>
              <div className="flex items-center gap-2 mt-3 relative z-10">
                <div className="status-indicator animate-pulse-glow" style={{ width: '4px', height: '4px' }} />
                <span className="hud-readout text-[9px]">SYSTEM_ONLINE</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            </div>
            
            <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all jagged-corner-small relative overflow-hidden group/btn ${
                        isActive
                          ? 'bg-primary/20 text-primary border-l-3 border-primary shadow-[0_0_15px_oklch(0.72_0.20_195_/_0.4)]'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 border-l-3 border-transparent hover:border-primary/50'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent opacity-50" />
                      )}
                      <Icon size={18} weight={isActive ? 'fill' : 'duotone'} className={`relative z-10 ${isActive ? 'neon-glow-primary' : ''}`} />
                      <span className="text-xs uppercase tracking-[0.1em] font-bold relative z-10">
                        {tab.label}
                      </span>
                      {!isActive && (
                        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                      )}
                    </button>
                  )
                })}
              </div>
            </nav>

            <div className="p-4 border-t-2 border-primary/30 relative overflow-hidden">
              <div className="absolute inset-0 grid-background opacity-5 pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <div className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold relative z-10 flex items-center justify-between">
                <span>V2.4.1 // AI COCKPIT</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-primary/40 rounded-full" />
                  <div className="w-1 h-1 bg-primary/60 rounded-full" />
                  <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </aside>
        )}

        <main className="flex-1 overflow-y-auto scrollbar-thin" style={{ height: isMobile ? 'calc(100vh - 80px)' : '100vh' }}>
          <div className="container mx-auto px-4 py-6 md:py-8">
            <Component />
          </div>
        </main>

        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 bg-card/95 border-t-4 border-primary/60 backdrop-blur-md z-50 shadow-[0_-4px_30px_oklch(0.72_0.20_195_/_0.3)]">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="grid grid-cols-6 gap-1 p-2">
              {tabs.slice(0, 6).map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col items-center justify-center p-2 transition-all relative overflow-hidden rounded-sm ${
                      isActive
                        ? 'text-primary'
                        : 'text-muted-foreground hover:text-foreground active:scale-95'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/10 rounded-sm" />
                    )}
                    <Icon size={24} weight={isActive ? 'fill' : 'duotone'} className={`relative z-10 ${isActive ? 'neon-glow-primary' : ''}`} />
                    <span className="text-[8px] uppercase tracking-wider font-bold mt-1 relative z-10">
                      {tab.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </nav>
        )}
      </div>

      <AIAssistant />
    </div>
  );
}
