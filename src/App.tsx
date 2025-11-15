import { useKV } from '@github/spark/hooks'
import { House, Robot, ChartLine, Vault, Users, Gear, Terminal, Flask } from '@phosphor-icons/react'
import Dashboard from '@/components/dashboard/Dashboard'
import BotOverview from '@/components/dashboard/BotOverview'
import Agents from '@/components/agents/Agents'
import VaultView from '@/components/vault/VaultView'
import Community from '@/components/community/Community'
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
    { id: 'vault', label: 'Vault', icon: Vault, component: VaultView },
    { id: 'analytics', label: 'Analytics', icon: ChartLine, component: () => <ComingSoon title="Analytics" /> },
    { id: 'community', label: 'Community', icon: Users, component: Community },
    { id: 'settings', label: 'Settings', icon: Gear, component: () => <ComingSoon title="Settings" /> },
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
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 jagged-corner-small bg-primary/20 border-2 border-primary">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                    <path d="M12 3C10 3 8 4 7 5.5C6.5 6.2 6 7.5 6 9C6 10 6.2 11 7 12C7.5 12.5 8 13 9 13.2C9 14 9.5 15 10.5 15.5C11 15.8 11.5 16 12 16C12.5 16 13 15.8 13.5 15.5C14.5 15 15 14 15 13.2C16 13 16.5 12.5 17 12C17.8 11 18 10 18 9C18 7.5 17.5 6.2 17 5.5C16 4 14 3 12 3Z" fill="currentColor" fillOpacity="0.3"/>
                    <path d="M12 3C10 3 8 4 7 5.5C6.5 6.2 6 7.5 6 9C6 10 6.2 11 7 12C7.5 12.5 8 13 9 13.2M12 3C14 3 16 4 17 5.5C17.5 6.2 18 7.5 18 9C18 10 17.8 11 17 12C16.5 12.5 16 13 15 13.2M12 3V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 8C11 8.5 10 9.5 9.5 11C9.3 11.5 9.2 12 9 13.2M12 8C13 8.5 14 9.5 14.5 11C14.7 11.5 14.8 12 15 13.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9.5" cy="8" r="1" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
                    <circle cx="14.5" cy="8" r="1" fill="currentColor" stroke="currentColor" strokeWidth="0.5"/>
                    <circle cx="9.5" cy="8" r="0.3" fill="oklch(0.72 0.20 195)"/>
                    <circle cx="14.5" cy="8" r="0.3" fill="oklch(0.72 0.20 195)"/>
                    <path d="M10.5 15.5C11 15.8 11.5 16 12 16C12.5 16 13 15.8 13.5 15.5C14.5 15 15 14 15 13.2C15.5 13 16 12.5 16.5 12M9 13.2C9 14 9.5 15 10.5 15.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 16C11.5 17 11 18.5 10.5 20M12 16C12.5 17 13 18.5 13.5 20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-[0.15em] uppercase leading-tight">
                    <span className="text-primary neon-glow-primary block">QUANTUM</span>
                    <span className="text-secondary neon-glow-secondary block">FALCON</span>
                  </h1>
                </div>
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
  )
}
