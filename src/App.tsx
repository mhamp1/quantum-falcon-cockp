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
        <header className="border-b border-primary/30 backdrop-blur-md bg-card/95 sticky top-0 z-50 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          
          <div className="container mx-auto px-4 py-3 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative">
                    <path d="M16 2 L28 10 L28 22 L16 30 L4 22 L4 10 Z" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-primary" />
                    <path d="M16 6 L24 12 L24 20 L16 26 L8 20 L8 12 Z" stroke="currentColor" strokeWidth="1" fill="oklch(0.72 0.20 195 / 0.1)" className="text-primary" />
                    <path d="M16 8 L12 14 L16 18 L20 14 Z" fill="currentColor" className="text-primary animate-pulse-glow" />
                    <path d="M16 18 L16 24" stroke="currentColor" strokeWidth="1.5" className="text-accent" />
                    <path d="M12 14 L6 16" stroke="currentColor" strokeWidth="1" className="text-secondary" />
                    <path d="M20 14 L26 16" stroke="currentColor" strokeWidth="1" className="text-secondary" />
                    <circle cx="16" cy="14" r="1.5" fill="currentColor" className="text-accent neon-glow-accent" />
                  </svg>
                </div>
                <h1 className="text-xl md:text-2xl font-bold tracking-[0.25em] uppercase">
                  <span className="text-primary neon-glow-primary">QUANTUM</span>
                  <span className="text-accent neon-glow-secondary ml-2">FALCON</span>
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-card/80 border-l-2 border-primary relative">
                  <div className="absolute top-0 left-0 w-8 h-px bg-primary" />
                  <div className="status-indicator" />
                  <span className="hud-readout">SYS_ONLINE</span>
                </div>
                <div className="hidden lg:flex gap-1 items-end h-6">
                  {[24, 18, 28, 16, 22].map((height, i) => (
                    <div key={i} className="w-1 bg-primary/40" style={{ height: `${height}px` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="hidden md:inline-flex w-full justify-start mb-6 bg-card/60 backdrop-blur-md border border-primary/30 p-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
              <div className="absolute top-0 left-0 w-20 h-px bg-gradient-to-r from-primary to-transparent" />
              <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-l-2 data-[state=active]:border-primary relative z-10 data-[state=active]:shadow-[0_0_12px_oklch(0.72_0.20_195_/_0.3)]">
                <House size={18} weight="duotone" />
                <span className="font-bold uppercase tracking-[0.15em] text-xs">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="agents" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-l-2 data-[state=active]:border-primary relative z-10 data-[state=active]:shadow-[0_0_12px_oklch(0.72_0.20_195_/_0.3)]">
                <Robot size={18} weight="duotone" />
                <span className="font-bold uppercase tracking-[0.15em] text-xs">Agents</span>
              </TabsTrigger>
              <TabsTrigger value="trade" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-l-2 data-[state=active]:border-primary relative z-10 data-[state=active]:shadow-[0_0_12px_oklch(0.72_0.20_195_/_0.3)]">
                <TrendUp size={18} weight="duotone" />
                <span className="font-bold uppercase tracking-[0.15em] text-xs">Trade</span>
              </TabsTrigger>
              <TabsTrigger value="vault" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-l-2 data-[state=active]:border-primary relative z-10 data-[state=active]:shadow-[0_0_12px_oklch(0.72_0.20_195_/_0.3)]">
                <Vault size={18} weight="duotone" />
                <span className="font-bold uppercase tracking-[0.15em] text-xs">Vault</span>
              </TabsTrigger>
              <TabsTrigger value="community" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-l-2 data-[state=active]:border-primary relative z-10 data-[state=active]:shadow-[0_0_12px_oklch(0.72_0.20_195_/_0.3)]">
                <Users size={18} weight="duotone" />
                <span className="font-bold uppercase tracking-[0.15em] text-xs">Community</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-l-2 data-[state=active]:border-primary relative z-10 data-[state=active]:shadow-[0_0_12px_oklch(0.72_0.20_195_/_0.3)]">
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
            <TabsContent value="vault" className="t">
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

        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-primary/30 backdrop-blur-md bg-card/98 z-50 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
          <div className="grid grid-cols-6 h-16">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'dashboard' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <House size={24} weight={activeTab === 'dashboard' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('agents')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'agents' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Robot size={24} weight={activeTab === 'agents' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('trade')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'trade' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <TrendUp size={24} weight={activeTab === 'trade' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('vault')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'vault' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Vault size={24} weight={activeTab === 'vault' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                activeTab === 'community' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Users size={24} weight={activeTab === 'community' ? 'fill' : 'duotone'} />
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
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
  );
}

export default App