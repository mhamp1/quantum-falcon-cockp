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
      <div className="absolute inset-0 grid-background pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--primary)_0%,_transparent_40%)] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--secondary)_0%,_transparent_40%)] opacity-20 pointer-events-none" />
      
      <div className="relative z-10">
        <header className="border-b-2 border-primary backdrop-blur-md bg-card/80 sticky top-0 z-50 scan-line-effect">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold tracking-[0.2em] uppercase hud-text">
                <span className="text-secondary neon-glow-secondary">QUANTUM</span>
                <span className="text-primary neon-glow ml-2">FALCON</span>
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 jagged-corner-small bg-primary/20 border-2 border-primary relative">
                  <div className="w-2 h-2 rounded-full bg-primary neon-glow animate-pulse-glow" />
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-primary hud-text">ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden md:inline-flex w-full justify-start mb-6 bg-card/80 backdrop-blur-md border-2 border-primary p-1 jagged-corner">
              <TabsTrigger value="dashboard" className="gap-2 jagged-corner-small data-[state=active]:bg-primary/30 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:neon-glow">
                <House size={20} weight="duotone" />
                <span className="font-bold uppercase tracking-wide">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="agents" className="gap-2 jagged-corner-small data-[state=active]:bg-primary/30 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:neon-glow">
                <Robot size={20} weight="duotone" />
                <span className="font-bold uppercase tracking-wide">Agents</span>
              </TabsTrigger>
              <TabsTrigger value="trade" className="gap-2 jagged-corner-small data-[state=active]:bg-primary/30 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:neon-glow">
                <TrendUp size={20} weight="duotone" />
                <span className="font-bold uppercase tracking-wide">Trade</span>
              </TabsTrigger>
              <TabsTrigger value="vault" className="gap-2 jagged-corner-small data-[state=active]:bg-primary/30 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:neon-glow">
                <Vault size={20} weight="duotone" />
                <span className="font-bold uppercase tracking-wide">Vault</span>
              </TabsTrigger>
              <TabsTrigger value="community" className="gap-2 jagged-corner-small data-[state=active]:bg-primary/30 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:neon-glow">
                <Users size={20} weight="duotone" />
                <span className="font-bold uppercase tracking-wide">Community</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2 jagged-corner-small data-[state=active]:bg-primary/30 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:neon-glow">
                <Gear size={20} weight="duotone" />
                <span className="font-bold uppercase tracking-wide">Settings</span>
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

        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t-2 border-primary backdrop-blur-md bg-card/90 z-50">
          <div className="grid grid-cols-6 h-16">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'dashboard' ? 'text-primary neon-glow' : 'text-muted-foreground'
              }`}
            >
              <House size={24} weight={activeTab === 'dashboard' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'agents' ? 'text-primary neon-glow' : 'text-muted-foreground'
              }`}
            >
              <Robot size={24} weight={activeTab === 'agents' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('trade')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'trade' ? 'text-primary neon-glow' : 'text-muted-foreground'
              }`}
            >
              <TrendUp size={24} weight={activeTab === 'trade' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'vault' ? 'text-primary neon-glow' : 'text-muted-foreground'
              }`}
            >
              <Vault size={24} weight={activeTab === 'vault' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'community' ? 'text-primary neon-glow' : 'text-muted-foreground'
              }`}
            >
              <Users size={24} weight={activeTab === 'community' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'settings' ? 'text-primary neon-glow' : 'text-muted-foreground'
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