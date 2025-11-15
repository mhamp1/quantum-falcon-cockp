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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--secondary)_0%,_transparent_50%)] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--primary)_0%,_transparent_50%)] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,_var(--border)_1px,_transparent_1px),linear-gradient(to_bottom,_var(--border)_1px,_transparent_1px)] bg-[size:4rem_4rem] opacity-10 pointer-events-none" />
      
      <div className="relative z-10">
        <header className="border-b border-primary/50 backdrop-blur-md bg-card/30 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold tracking-wider uppercase">
                <span className="text-secondary neon-glow-secondary">Quantum</span>
                <span className="text-primary neon-glow ml-2">Falcon</span>
              </h1>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/50">
                  <div className="w-2 h-2 rounded-full bg-primary neon-glow animate-pulse-glow" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">Online</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden md:inline-flex w-full justify-start mb-6 bg-card/30 backdrop-blur-md border border-primary/50 p-1">
              <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-primary/30 data-[state=active]:text-primary data-[state=active]:neon-glow">
                <House size={20} weight="duotone" />
                <span>Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="agents" className="gap-2 data-[state=active]:bg-primary/30 data-[state=active]:text-primary data-[state=active]:neon-glow">
                <Robot size={20} weight="duotone" />
                <span>Agents</span>
              </TabsTrigger>
              <TabsTrigger value="trade" className="gap-2 data-[state=active]:bg-primary/30 data-[state=active]:text-primary data-[state=active]:neon-glow">
                <TrendUp size={20} weight="duotone" />
                <span>Trade</span>
              </TabsTrigger>
              <TabsTrigger value="vault" className="gap-2 data-[state=active]:bg-primary/30 data-[state=active]:text-primary data-[state=active]:neon-glow">
                <Vault size={20} weight="duotone" />
                <span>Vault</span>
              </TabsTrigger>
              <TabsTrigger value="community" className="gap-2 data-[state=active]:bg-primary/30 data-[state=active]:text-primary data-[state=active]:neon-glow">
                <Users size={20} weight="duotone" />
                <span>Community</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-primary/30 data-[state=active]:text-primary data-[state=active]:neon-glow">
                <Gear size={20} weight="duotone" />
                <span>Settings</span>
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

        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-primary/50 backdrop-blur-md bg-card/80 z-50">
          <div className="grid grid-cols-6 h-16">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === 'dashboard' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <House size={24} weight={activeTab === 'dashboard' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === 'agents' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Robot size={24} weight={activeTab === 'agents' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('trade')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === 'trade' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <TrendUp size={24} weight={activeTab === 'trade' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === 'vault' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Vault size={24} weight={activeTab === 'vault' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === 'community' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Users size={24} weight={activeTab === 'community' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                activeTab === 'settings' ? 'text-primary' : 'text-muted-foreground'
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