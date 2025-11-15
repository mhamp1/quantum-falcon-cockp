import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { House, Robot, TrendUp, Vault, Users, Gear } from '@phosphor-icons/react'
import Dashboard from '@/components/dashboard/Dashboard'
import Agents from '@/components/agents/Agents'
import Trade from '@/components/trade/Trade'
import VaultView from '@/components/vault/VaultView'
import Community from '@/components/community/Community'
import Settings from '@/components/settings/Settings'
import { Toaster } from '@/components/ui/sonner'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 technical-grid pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--secondary)_0%,_transparent_50%)] opacity-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--primary)_0%,_transparent_50%)] opacity-10 pointer-events-none" />
      
      <div className="relative z-10">
        <header className="border-b-2 border-secondary backdrop-blur-md bg-card/90 sticky top-0 z-50 scan-line-effect">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="hidden md:block diagonal-stripes w-12 h-12 opacity-30" />
                <h1 className="text-xl md:text-2xl font-bold tracking-[0.3em] uppercase hud-text">
                  <span className="text-secondary neon-glow-secondary">QUANTUM</span>
                  <span className="text-primary neon-glow ml-2">FALCON</span>
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 jagged-corner-small bg-secondary/20 border-2 border-secondary relative">
                  <div className="status-indicator bg-secondary" style={{ width: '6px', height: '6px' }} />
                  <span className="hud-readout text-xs">SYS_ONLINE</span>
                </div>
                <div className="hidden lg:flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-1 h-6 bg-secondary/30" style={{ height: `${20 + Math.random() * 12}px` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden md:inline-flex w-full justify-start mb-6 bg-card/80 backdrop-blur-md border-2 border-secondary p-1 jagged-corner relative">
              <div className="absolute inset-0 diagonal-stripes opacity-5 pointer-events-none" />
              <TabsTrigger value="dashboard" className="gap-2 jagged-corner-small data-[state=active]:bg-secondary/30 data-[state=active]:text-secondary data-[state=active]:border-2 data-[state=active]:border-secondary data-[state=active]:neon-glow-accent relative z-10">
                <House size={18} weight="duotone" />
                <span className="font-bold uppercase tracking-[0.15em] text-xs">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="agents" className="gap-2 jagged-corner-small data-[state=active]:bg-secondary/30 data-[state=active]:text-secondary data-[state=active]:border-2 data-[state=active]:border-secondary data-[state=active]:neon-glow-accent relative z-10">
                <Robot size={18} weight="duotone" />
                <span className="font-bold uppercase tracking-[0.15em] text-xs">Agents</span>
              </TabsTrigger>
              <TabsTrigger value="trade" className="gap-2 jagged-corner-small data-[state=active]:bg-secondary/30 data-[state=active]:text-secondary data-[state=active]:border-2 data-[state=active]:border-secondary data-[state=active]:neon-glow-accent relative z-10">
                <TrendUp size={18} weight="duotone" />
                <span className="font-bold uppercase tracking-[0.15em] text-xs">Trade</span>
              </TabsTrigger>
              <TabsTrigger value="vault" className="gap-2 jagged-corner-small data-[state=active]:bg-secondary/30 data-[state=active]:text-secondary data-[state=active]:border-2 data-[state=active]:border-secondary data-[state=active]:neon-glow-accent relative z-10">
                <Vault size={18} weight="duotone" />
                <span className="font-bold uppercase tracking-[0.15em] text-xs">Vault</span>
              </TabsTrigger>
              <TabsTrigger value="community" className="gap-2 jagged-corner-small data-[state=active]:bg-secondary/30 data-[state=active]:text-secondary data-[state=active]:border-2 data-[state=active]:border-secondary data-[state=active]:neon-glow-accent relative z-10">
                <Users size={18} weight="duotone" />
                <span className="font-bold uppercase tracking-[0.15em] text-xs">Community</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2 jagged-corner-small data-[state=active]:bg-secondary/30 data-[state=active]:text-secondary data-[state=active]:border-2 data-[state=active]:border-secondary data-[state=active]:neon-glow-accent relative z-10">
                <Gear size={18} weight="duotone" />
                <span className="font-bold uppercase tracking-[0.15em] text-xs">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-0">
              <Dashboard />
            </TabsContent>
            <TabsContent value="agents" className="mt-0">
              <Agents />
            </TabsContent>
            <TabsContent value="trade" className="mt-0">
              <Trade />
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
          </Tabs>
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t-2 border-secondary backdrop-blur-md bg-card/95 z-50">
          <div className="grid grid-cols-6 h-16">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'dashboard' ? 'text-secondary neon-glow-accent' : 'text-muted-foreground'
              }`}
            >
              <House size={24} weight={activeTab === 'dashboard' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'agents' ? 'text-secondary neon-glow-accent' : 'text-muted-foreground'
              }`}
            >
              <Robot size={24} weight={activeTab === 'agents' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('trade')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'trade' ? 'text-secondary neon-glow-accent' : 'text-muted-foreground'
              }`}
            >
              <TrendUp size={24} weight={activeTab === 'trade' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'vault' ? 'text-secondary neon-glow-accent' : 'text-muted-foreground'
              }`}
            >
              <Vault size={24} weight={activeTab === 'vault' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'community' ? 'text-secondary neon-glow-accent' : 'text-muted-foreground'
              }`}
            >
              <Users size={24} weight={activeTab === 'community' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'settings' ? 'text-secondary neon-glow-accent' : 'text-muted-foreground'
              }`}
            >
              <Gear size={24} weight={activeTab === 'settings' ? 'fill' : 'duotone'} />
            </button>
          </div>
        </nav>
      </div>
      
      <Toaster />
    </div>
  )
}

export default App