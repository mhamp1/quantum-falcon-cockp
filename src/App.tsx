import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { House, Robot, ChartLine, Vault, Users, Gear, GraduationCap, Flask, Shield, FileText, Tray } from '@phosphor-icons/react'
import Dashboard from '@/components/dashboard/Dashboard'
import Agents from '@/components/agents/Agents'
import VaultView from '@/components/vault/VaultView'
import { useIsMobile } from '@/hooks/use-mobile'

export default function App() {
  const isMobile = useIsMobile()
  const [activeTab, setActiveTab] = useKV<string>('active-tab', 'dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: House, component: Dashboard },
    { id: 'agents', label: 'AI Agents', icon: Robot, component: Agents },
    { id: 'analytics', label: 'AI Analytics', icon: ChartLine, component: () => <ComingSoon title="AI Analytics" /> },
    { id: 'strategy', label: 'AI Strategy', icon: Tray, component: () => <ComingSoon title="AI Strategy & Actions" /> },
    { id: 'vault', label: 'Vault', icon: Vault, component: VaultView },
    { id: 'education', label: 'Education', icon: GraduationCap, component: () => <ComingSoon title="Education Hub" /> },
    { id: 'experimental', label: 'Experimental', icon: Flask, component: () => <ComingSoon title="Experimental Mode" /> },
    { id: 'security', label: 'Security', icon: Shield, component: () => <ComingSoon title="Security" /> },
    { id: 'docs', label: 'Documentation', icon: FileText, component: () => <ComingSoon title="Documentation" /> },
    { id: 'community', label: 'Community', icon: Users, component: () => <ComingSoon title="Community Hub" /> },
    { id: 'settings', label: 'Settings', icon: Gear, component: () => <ComingSoon title="Settings" /> },
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 technical-grid opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <div className="relative z-10">
        <header className="border-b-4 border-primary/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.3)]">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 jagged-corner bg-primary/20 border-3 border-primary shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.5)]">
                  <Robot size={32} weight="duotone" className="text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase">
                    <span className="text-primary neon-glow-primary">QUANTUM</span>
                    <span className="text-secondary neon-glow-secondary ml-2">FALCON</span>
                  </h1>
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-[0.15em] font-semibold">
                    AI-POWERED TRADING COCKPIT
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <div className="status-indicator" />
                <span className="hud-readout text-xs">SYSTEM_ONLINE</span>
              </div>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {!isMobile && (
            <div className="border-b-2 border-primary/30 bg-card/50 backdrop-blur-sm sticky top-[88px] z-40">
              <div className="container mx-auto px-4">
                <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-1 overflow-x-auto flex-nowrap">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-b-3 data-[state=active]:border-primary data-[state=active]:shadow-[0_0_15px_oklch(0.72_0.20_195_/_0.5)] px-4 py-3 text-xs uppercase tracking-[0.1em] font-bold transition-all hover:bg-primary/10 border-b-3 border-transparent whitespace-nowrap"
                      >
                        <Icon size={16} weight="duotone" className="mr-2" />
                        {tab.label}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </div>
            </div>
          )}

          <div className="container mx-auto px-4 py-6 md:py-8">
            {tabs.map((tab) => {
              const Component = tab.component
              return (
                <TabsContent key={tab.id} value={tab.id} className="mt-0">
                  <Component />
                </TabsContent>
              )
            })}
          </div>
        </Tabs>

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
                      {tab.label.split(' ')[0]}
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
