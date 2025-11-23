// Live Arena Page — Ultimate Battle Arena with Real-time Duels
// November 21, 2025 — Quantum Falcon Cockpit

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Crown, Trophy, Target, Flame, Medal, Lightning, Swords,
  Users, Eye, MessageCircle, Zap, Star, Award, Coins,
  Play, Pause, Volume2, VolumeX, Settings, Share2, PaperPlaneRight
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { fetchArenaLeaderboard } from '@/lib/arena/client'
import {
  fetchActiveBattles,
  createBattle,
  joinBattle,
  sendChatMessage,
  fetchArenaEvents,
  BattleManager
} from '@/lib/arena/battleClient'
import type {
  ArenaLeaderboardResponse,
  ArenaTimeframe,
  StrategyPerformance,
  LiveBattle,
  BattleEvent,
  ArenaEvent,
  SpectatorData,
  ChatMessage
} from '@/lib/arena/types'
import { toast } from 'sonner'
import { useKVSafe } from '@/hooks/useKVFallback'
import confetti from 'canvas-confetti'

export default function LiveArenaPage() {
  // State management
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'battles' | 'events' | 'spectate'>('leaderboard')
  const [timeframe, setTimeframe] = useState<ArenaTimeframe>('daily')
  const [leaderboard, setLeaderboard] = useState<ArenaLeaderboardResponse | null>(null)
  const [activeBattles, setActiveBattles] = useState<LiveBattle[]>([])
  const [arenaEvents, setArenaEvents] = useState<ArenaEvent[]>([])
  const [selectedBattle, setSelectedBattle] = useState<LiveBattle | null>(null)
  const [battleManager, setBattleManager] = useState<BattleManager | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isSpectating, setIsSpectating] = useState(false)
  const [soundEnabled, setSoundEnabled] = useKVSafe<boolean>('arena-sound-enabled', true)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // UI state
  const [showCreateBattle, setShowCreateBattle] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

  // Fetch leaderboard data
  const loadLeaderboard = async (tf: ArenaTimeframe) => {
    setIsLoading(true)
    try {
      // NO MOCK DATA - MUST BE LIVE
      const data = await fetchArenaLeaderboard(tf)
      setLeaderboard(data)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('❌ Failed to load leaderboard:', err)
      toast.error('Failed to load leaderboard - API unavailable')
      setLeaderboard(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch active battles
  const loadActiveBattles = async () => {
    try {
      // NO MOCK DATA - MUST BE LIVE
      const battles = await fetchActiveBattles()
      setActiveBattles(battles)
    } catch (err) {
      console.error('❌ Failed to load active battles:', err)
      toast.error('Failed to load active battles - API unavailable')
      setActiveBattles([])
    }
  }

  // Fetch arena events
  const loadArenaEvents = async () => {
    try {
      // NO MOCK DATA - MUST BE LIVE
      const events = await fetchArenaEvents()
      setArenaEvents(events)
    } catch (err) {
      console.error('❌ Failed to load arena events:', err)
      toast.error('Failed to load arena events - API unavailable')
      setArenaEvents([])
    }
  }

  // Load initial data
  useEffect(() => {
    loadLeaderboard(timeframe)
    loadActiveBattles()
    loadArenaEvents()
  }, [timeframe])

  // Auto-refresh data
  useEffect(() => {
    const REFRESH_INTERVAL = 15000 // 15 seconds for battles
    const interval = setInterval(() => {
      loadActiveBattles()
      loadArenaEvents()
      if (activeTab === 'leaderboard') {
        loadLeaderboard(timeframe)
      }
    }, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [timeframe, activeTab])

  // Battle event listeners
  useEffect(() => {
    const handleBattleUpdate = (event: CustomEvent) => {
      const { battle } = event.detail
      setActiveBattles(prev =>
        prev.map(b => b.id === battle.id ? battle : b)
      )
      if (selectedBattle?.id === battle.id) {
        setSelectedBattle(battle)
      }
    }

    const handleTradeExecuted = (event: CustomEvent) => {
      const { trade } = event.detail
      if (soundEnabled) {
        // Play trade sound
        const audio = new Audio('/sounds/trade-executed.mp3')
        audio.volume = 0.3
        audio.play().catch(() => {}) // Ignore errors if sound fails
      }

      toast.success(`⚡ ${trade.participant} executed trade`, {
        description: `${trade.symbol} ${trade.side} ${trade.amount} @ $${trade.price}`,
      })
    }

    const handleChatMessage = (event: CustomEvent) => {
      const message = event.detail
      setChatMessages(prev => [...prev.slice(-49), message]) // Keep last 50 messages
    }

    window.addEventListener('battle_update', handleBattleUpdate as EventListener)
    window.addEventListener('trade_executed', handleTradeExecuted as EventListener)
    window.addEventListener('chat_message', handleChatMessage as EventListener)

    return () => {
      window.removeEventListener('battle_update', handleBattleUpdate as EventListener)
      window.removeEventListener('trade_executed', handleTradeExecuted as EventListener)
      window.removeEventListener('chat_message', handleChatMessage as EventListener)
    }
  }, [selectedBattle, soundEnabled])

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [chatMessages])

  // Handle spectating a battle
  const handleSpectateBattle = async (battle: LiveBattle) => {
    setSelectedBattle(battle)
    setIsSpectating(true)
    setActiveTab('spectate')

    // Initialize battle manager
    const manager = new BattleManager(battle.id)
    setBattleManager(manager)

    try {
      await manager.connect()
      toast.success(`🎭 Spectating: ${battle.participants[0]?.username} vs ${battle.participants[1]?.username}`)
    } catch (error) {
      console.error('❌ Failed to connect to battle:', error)
      toast.error('Failed to connect to battle stream')
    }
  }

  // Handle creating a battle
  const handleCreateBattle = async (mode: 'duel' | 'tournament', stake: number) => {
    try {
      const result = await createBattle(mode, stake, 'default-strategy') // TODO: Get actual strategy
      if (result.success && result.battleId) {
        toast.success(`⚔️ ${mode.charAt(0).toUpperCase() + mode.slice(1)} created! Waiting for opponent...`)
        setShowCreateBattle(false)
        loadActiveBattles()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to create battle')
    }
  }

  // Handle sending chat message
  const handleSendChat = async (message?: string, type: 'chat' | 'taunt' | 'cheer' = 'chat') => {
    const textToSend = message || chatInput.trim()
    if (!textToSend.trim() || !selectedBattle) return

    const success = await sendChatMessage(selectedBattle.id, textToSend.trim(), type)
    if (success) {
      setChatInput('')

      // Trigger celebration for cheer messages
      if (type === 'cheer' && soundEnabled) {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.8, x: 0.5 },
          colors: ['#00FFFF', '#DC1FFF', '#FF1493'],
        })
      }
    } else {
      toast.error('Failed to send message')
    }
  }

  // Victory celebration effect
  const triggerVictoryCelebration = (winner: string) => {
    if (!soundEnabled) return

    // Massive confetti explosion
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF1493', '#00FFFF', '#DC1FFF'],
      gravity: 0.8,
      drift: 0.1,
    })

    // Multiple waves
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.7, x: 0.3 },
        colors: ['#FFD700', '#FF1493'],
      })
    }, 300)

    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.7, x: 0.7 },
        colors: ['#00FFFF', '#DC1FFF'],
      })
    }, 600)

    toast.success(`🏆 ${winner} wins the battle!`, {
      description: 'Spectacular victory celebration!',
      duration: 5000,
    })
  }

  // Calculate stats
  const totalProfit = leaderboard?.entries
    .filter(e => e.pnlUsd > 0)
    .reduce((sum, e) => sum + e.pnlUsd, 0) || 0

  const top3 = leaderboard?.entries.slice(0, 3) || []
  const remaining = leaderboard?.entries.slice(3) || []

  return (
    <div className="min-h-screen bg-background p-6 space-y-8 relative overflow-hidden">
      {/* Ambient Particles Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary/20 rounded-full animate-pulse" />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-accent/30 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-cyan-400/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-purple-400/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />

        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-20 right-20 w-16 h-16 border border-primary/20 rotate-45"
          animate={{ rotate: 225, scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-32 left-16 w-12 h-12 border border-accent/20 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, delay: 1 }}
        />
      </div>
      {/* Header with Enhanced UI */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent animate-pulse" />

        <div className="flex items-center justify-center gap-4 mb-4 relative z-10">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Swords size={64} weight="duotone" className="text-primary" />
          </motion.div>
        </div>

        <motion.h1
          className="text-5xl md:text-7xl font-black text-primary neon-glow-primary mb-4"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          BATTLE ARENA
        </motion.h1>

        <div className="flex items-center justify-center gap-6 text-lg text-muted-foreground uppercase tracking-wider">
          <span className="flex items-center gap-2">
            <Users size={20} className="text-accent" />
            {activeBattles.length} Active Battles
          </span>
          <span className="flex items-center gap-2">
            <Eye size={20} className="text-secondary" />
            {activeBattles.reduce((sum, b) => sum + b.spectators, 0)} Spectators
          </span>
        </div>
      </motion.div>

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto mb-8">
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy size={18} />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="battles" className="flex items-center gap-2">
            <Swords size={18} />
            Battles
          </TabsTrigger>
          <TabsTrigger value="spectate" className="flex items-center gap-2">
            <Eye size={18} />
            Spectate
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Star size={18} />
            Events
          </TabsTrigger>
        </TabsList>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-8">
          {/* Live Profit Ticker */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cyber-card-accent p-6 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 animate-pulse" />
            <div className="relative z-10">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                Live Profit Pool
              </p>
              <motion.p
                key={totalProfit}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-5xl md:text-6xl font-black text-accent neon-glow"
              >
                ${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </motion.p>
              <p className="text-[10px] text-muted-foreground mt-2">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </p>
            </div>
          </motion.div>

          {/* Timeframe Tabs */}
          <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as ArenaTimeframe)}>
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>

            <TabsContent value={timeframe} className="mt-8 space-y-8" key={timeframe}>
          {/* Hall of Fame Showcase */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="cyber-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Award size={32} weight="duotone" className="text-yellow-400" />
              <div>
                <h3 className="text-2xl font-black uppercase tracking-wider text-yellow-400">
                  Hall of Fame
                </h3>
                <p className="text-sm text-muted-foreground">Legendary traders who shaped the arena</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  name: 'Quantum Falcon',
                  title: 'Arena Founder',
                  achievement: '100% Win Rate Master',
                  avatar: '👑',
                  stats: '10,000+ Trades • 95% Win Rate'
                },
                {
                  name: 'Whale Hunter',
                  title: 'Volume King',
                  achievement: '$1M+ Profit Champion',
                  avatar: '🐋',
                  stats: '500+ Battles • 87% Win Rate'
                },
                {
                  name: 'Flash Master',
                  title: 'Speed Demon',
                  achievement: 'Fastest 100 Trades',
                  avatar: '⚡',
                  stats: '2,500 Trades • 92% Win Rate'
                }
              ].map((legend, i) => (
                <motion.div
                  key={legend.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="cyber-card-inner p-4 text-center"
                >
                  <div className="text-4xl mb-2">{legend.avatar}</div>
                  <h4 className="font-bold text-lg">{legend.name}</h4>
                  <p className="text-sm text-yellow-400 mb-1">{legend.title}</p>
                  <p className="text-xs text-accent mb-2">{legend.achievement}</p>
                  <p className="text-xs text-muted-foreground">{legend.stats}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Top 3 Podium */}
          {!isLoading && top3.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 2nd Place */}
              {top3[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="cyber-card p-6 relative order-2 md:order-1"
                >
                  <PodiumCard entry={top3[1]} rank={2} />
                </motion.div>
              )}

              {/* 1st Place - King of the Hill */}
              {top3[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="cyber-card-accent p-6 relative order-1 md:order-2 md:scale-110 md:z-10"
                >
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                    >
                      <Crown size={48} weight="fill" className="text-primary drop-shadow-[0_0_20px_oklch(0.72_0.20_195)]" />
                    </motion.div>
                  </div>
                  <PodiumCard entry={top3[0]} rank={1} isKing />
                </motion.div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="cyber-card p-6 relative order-3"
                >
                  <PodiumCard entry={top3[2]} rank={3} />
                </motion.div>
              )}
            </div>
          )}

          {/* Remaining Leaderboard Table */}
          {!isLoading && remaining.length > 0 && (
            <div className="cyber-card p-6">
              <h3 className="text-xl font-bold uppercase tracking-wide text-primary mb-6 flex items-center gap-2">
                <Flame size={24} weight="duotone" />
                Full Rankings
              </h3>
              
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {remaining.map((entry, i) => (
                    <motion.div
                      key={entry.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center gap-4 p-4 bg-background/60 border border-primary/20 rounded-lg hover:border-primary/50 transition-colors"
                    >
                      {/* Rank */}
                      <div className="w-12 h-12 flex items-center justify-center bg-muted/20 rounded-lg font-bold text-lg text-muted-foreground">
                        #{i + 4}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{entry.username}</p>
                        <p className="text-xs text-muted-foreground truncate">{entry.agentName}</p>
                      </div>

                      {/* Stats */}
                      <div className="hidden md:flex items-center gap-4 text-xs">
                        <div className="text-right">
                          <p className="text-accent font-bold">${entry.pnlUsd.toLocaleString()}</p>
                          <p className="text-muted-foreground">{entry.pnlPct.toFixed(1)}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-primary font-bold">{entry.winRatePct.toFixed(1)}%</p>
                          <p className="text-muted-foreground">{entry.trades} trades</p>
                        </div>
                      </div>

                      {/* Badges */}
                      {entry.badges.length > 0 && (
                        <Badge className="bg-primary/10 text-primary border-primary/30 text-[9px]">
                          {entry.badges[0]}
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-16">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Lightning size={64} weight="duotone" className="text-primary mx-auto mb-4" />
              </motion.div>
              <p className="text-xl text-muted-foreground">
                Loading leaderboard...
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
        </TabsContent>

        {/* Battles Tab */}
        <TabsContent value="battles" className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-wider text-primary">Active Battles</h2>
              <p className="text-muted-foreground">Join live duels or create your own</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowCreateBattle(true)}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80"
              >
                <Swords size={18} className="mr-2" />
                Create Battle
              </Button>
              <Button
                variant="outline"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="border-primary/50"
              >
                {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </Button>
            </div>
          </div>

          {/* Create Battle Modal */}
          <AnimatePresence>
            {showCreateBattle && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowCreateBattle(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="cyber-card p-6 max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold mb-4">Create Battle</h3>
                  <div className="space-y-4">
                    <Button
                      onClick={() => handleCreateBattle('duel', 100)}
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500"
                    >
                      ⚔️ Quick Duel ($100 stake)
                    </Button>
                    <Button
                      onClick={() => handleCreateBattle('tournament', 500)}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      🏆 Tournament ($500 stake)
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prediction Markets Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="cyber-card p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Coins size={24} weight="duotone" className="text-yellow-400" />
              <h3 className="text-xl font-bold uppercase tracking-wider">Prediction Markets</h3>
              <Badge className="bg-yellow-500/20 text-yellow-400">Beta</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeBattles.slice(0, 2).map((battle) => (
                <div key={battle.id} className="cyber-card-inner p-4">
                  <h4 className="font-bold text-sm mb-3 truncate">
                    {battle.participants[0]?.username} vs {battle.participants[1]?.username}
                  </h4>

                  <div className="space-y-2">
                    {battle.participants.map((participant) => (
                      <div key={participant.userId} className="flex items-center justify-between">
                        <span className="text-sm truncate flex-1">{participant.username}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">1.5x</span>
                          <Button size="sm" variant="outline" className="text-xs px-2">
                            Bet $10
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-primary/20">
                    <p className="text-xs text-muted-foreground text-center">
                      Pool: $247 • Ends when battle starts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Active Battles List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeBattles.map((battle, index) => (
              <motion.div
                key={battle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: '0 0 30px rgba(0, 255, 255, 0.3)'
                }}
                className="cyber-card p-6 cursor-pointer hover:border-accent/50 transition-all duration-300 relative group"
                onClick={() => handleSpectateBattle(battle)}
              >
                {/* Battle Status Indicator */}
                <motion.div
                  className={`absolute -top-2 -right-2 w-4 h-4 rounded-full ${
                    battle.status === 'active' ? 'bg-green-400' :
                    battle.status === 'waiting' ? 'bg-yellow-400' :
                    'bg-red-400'
                  }`}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                <div className="flex items-center justify-between mb-4">
                  <Badge className={`${
                    battle.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    battle.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {battle.status.toUpperCase()}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye size={14} />
                    {battle.spectators}
                  </div>
                </div>

                <div className="space-y-3">
                  {battle.participants.map((participant, i) => (
                    <div key={participant.userId} className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>{participant.username[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{participant.username}</p>
                        <p className="text-xs text-muted-foreground">{participant.agentName}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${
                          participant.currentPnl >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          ${participant.currentPnl.toFixed(0)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {participant.tradesExecuted} trades
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-primary/20">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Prize Pool</span>
                    <span className="font-bold text-accent">${battle.prizePool}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Round</span>
                    <span>{battle.round}/{battle.totalRounds}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {activeBattles.length === 0 && (
            <div className="text-center py-16">
              <Swords size={64} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Active Battles</h3>
              <p className="text-muted-foreground mb-6">Be the first to create a battle!</p>
              <Button onClick={() => setShowCreateBattle(true)} className="bg-gradient-to-r from-primary to-accent">
                <Zap size={18} className="mr-2" />
                Start Battle
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Spectate Tab */}
        <TabsContent value="spectate" className="space-y-6">
          {!selectedBattle ? (
            <div className="text-center py-16">
              <Eye size={64} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Select a Battle to Spectate</h3>
              <p className="text-muted-foreground">Choose from active battles in the Battles tab</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Main Battle View */}
              <div className="lg:col-span-2 space-y-6">
                {/* Live Commentary */}
                <Card className="cyber-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={18} className="text-yellow-400" />
                    <h4 className="font-bold text-sm uppercase tracking-wider">Live Commentary</h4>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-auto" />
                  </div>

                  <ScrollArea className="h-32">
                    <div className="space-y-2 text-sm">
                      <div className="flex gap-2">
                        <span className="text-yellow-400 font-bold">🔥</span>
                        <span>What a massive trade! {selectedBattle.participants[0]?.username} just went all-in on SOL!</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-primary font-bold" style={{ color: '#14F195' }}>📊</span>
                        <span>Market volatility spiking - perfect conditions for momentum strategies!</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-green-400 font-bold">💰</span>
                        <span>{selectedBattle.participants[1]?.username} counter-attacking with a mean reversion play!</span>
                      </div>
                    </div>
                  </ScrollArea>
                </Card>
                <Card className="cyber-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-black uppercase tracking-wider">
                        {selectedBattle.participants[0]?.username} vs {selectedBattle.participants[1]?.username}
                      </h3>
                      <p className="text-muted-foreground">
                        Round {selectedBattle.round}/{selectedBattle.totalRounds} • ${selectedBattle.prizePool} Prize Pool
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowChat(!showChat)}
                        className={showChat ? 'bg-accent/20' : ''}
                      >
                        <MessageCircle size={16} />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedBattle.participants.map((participant) => (
                      <div key={participant.userId} className="cyber-card-inner p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback>{participant.username[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-bold">{participant.username}</h4>
                            <p className="text-sm text-muted-foreground">{participant.agentName}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>P&L</span>
                            <span className={`font-bold ${
                              participant.currentPnl >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              ${participant.currentPnl.toFixed(2)}
                            </span>
                          </div>
                          <Progress
                            value={Math.min(100, Math.max(0, participant.currentPnl / 1000 * 100))}
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{participant.tradesExecuted} trades</span>
                            <span>{participant.winRate.toFixed(1)}% win rate</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Enhanced Chat Sidebar */}
              <AnimatePresence>
                {showChat && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-4"
                  >
                    <Card className="cyber-card p-4">
                      <h4 className="font-bold mb-4 flex items-center gap-2">
                        <MessageCircle size={18} />
                        Battle Chat
                        <Badge className="bg-accent/20 text-accent text-xs">
                          {chatMessages.length}
                        </Badge>
                      </h4>

                      {/* Quick Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendChat("🔥 Let's go!", "cheer")}
                          className="text-xs border-green-500/50 text-green-400 hover:bg-green-500/10"
                        >
                          🔥 Cheer
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendChat("😈 Nice trade!", "taunt")}
                          className="text-xs border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          😈 Taunt
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendChat("🚀 To the moon!", "cheer")}
                          className="text-xs border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                        >
                          🚀 Moon
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSendChat("💎 Diamond hands!", "cheer")}
                          className="text-xs border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                        >
                          💎 HODL
                        </Button>
                      </div>

                      <ScrollArea className="h-80 mb-4" ref={chatRef}>
                        <div className="space-y-2">
                          {chatMessages.map((msg, index) => (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={`text-sm p-2 rounded ${
                                msg.type === 'cheer' ? 'bg-green-500/10 border border-green-500/20' :
                                msg.type === 'taunt' ? 'bg-red-500/10 border border-red-500/20' :
                                'bg-muted/20'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-accent text-xs">{msg.username}</span>
                                {msg.type !== 'chat' && (
                                  <Badge className={`text-xs ${
                                    msg.type === 'cheer' ? 'bg-green-500/20 text-green-400' :
                                    msg.type === 'taunt' ? 'bg-red-500/20 text-red-400' :
                                    'bg-primary/20 text-primary'
                                  }`}>
                                    {msg.type}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs">{msg.message}</span>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>

                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                            placeholder="Type a message... (or use quick actions)"
                            className="flex-1 text-sm"
                          />
                          <Button onClick={() => handleSendChat()} size="sm" disabled={!chatInput.trim()}>
                            <PaperPlaneRight size={14} />
                          </Button>
                        </div>

                        {/* Chat Type Selector */}
                        <div className="flex gap-1">
                          {[
                            { type: 'chat', label: '💬', color: 'border-primary/50' },
                            { type: 'cheer', label: '🎉', color: 'border-green-500/50' },
                            { type: 'taunt', label: '😈', color: 'border-red-500/50' },
                          ].map(({ type, label, color }) => (
                            <Button
                              key={type}
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendChat(chatInput, type as any)}
                              disabled={!chatInput.trim()}
                              className={`flex-1 text-xs ${color} hover:bg-current/10`}
                            >
                              {label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black uppercase tracking-wider text-primary mb-4">Arena Events</h2>
            <p className="text-muted-foreground">Special tournaments and challenges</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {arenaEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="cyber-card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Badge className={`${
                    event.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    event.status === 'upcoming' ? 'bg-primary/20 text-primary' :
                    'bg-muted/20 text-muted-foreground'
                  }`}>
                    {event.status.toUpperCase()}
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent">${event.prizePool}</p>
                    <p className="text-xs text-muted-foreground">Prize Pool</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{event.description}</p>

                <div className="flex items-center justify-between text-sm mb-4">
                  <span>{event.currentParticipants}/{event.maxParticipants} participants</span>
                  <span>{new Date(event.startTime).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={event.status !== 'active'}
                  >
                    {event.status === 'upcoming' ? 'Register' : 'Join Event'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye size={16} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Podium Card Component
 */
interface PodiumCardProps {
  entry: StrategyPerformance
  rank: number
  isKing?: boolean
}

function PodiumCard({ entry, rank, isKing = false }: PodiumCardProps) {
  const rankColors = {
    1: 'text-primary',
    2: 'text-secondary',
    3: 'text-accent',
  }

  const rankIcons = {
    1: <Crown size={24} weight="fill" className="text-primary" />,
    2: <Medal size={24} weight="fill" className="text-secondary" />,
    3: <Medal size={24} weight="fill" className="text-accent" />,
  }

  return (
    <div className="text-center space-y-4">
      {/* Rank Badge */}
      <div className="flex items-center justify-center mb-2">
        {rankIcons[rank as keyof typeof rankIcons]}
      </div>

      {/* Username */}
      <div>
        <h3 className={`text-2xl font-black uppercase ${rankColors[rank as keyof typeof rankColors]} neon-glow`}>
          {entry.username}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{entry.agentName}</p>
      </div>

      {/* Main PnL */}
      <div className="py-4">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
          Profit
        </p>
        <p className={`text-4xl font-black ${rankColors[rank as keyof typeof rankColors]} neon-glow`}>
          ${entry.pnlUsd.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {entry.pnlPct.toFixed(1)}% return
        </p>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 bg-background/60 rounded-lg relative">
          <p className="text-muted-foreground mb-1">Win Rate</p>
          <p className="font-bold text-green-400">{entry.winRatePct.toFixed(1)}%</p>
          <div className="absolute top-1 right-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="p-3 bg-background/60 rounded-lg">
          <p className="text-muted-foreground mb-1">Trades</p>
          <p className="font-bold text-primary" style={{ color: '#14F195' }}>{entry.trades}</p>
        </div>
        <div className="p-3 bg-background/60 rounded-lg">
          <p className="text-muted-foreground mb-1">Sharpe</p>
          <p className="font-bold text-purple-400">{entry.sharpe.toFixed(2)}</p>
        </div>
        <div className="p-3 bg-background/60 rounded-lg">
          <p className="text-muted-foreground mb-1">Arena Rating</p>
          <p className="font-bold text-yellow-400">{entry.arenaRating}</p>
        </div>
      </div>

      {/* Arena Achievements */}
      <div className="mt-4">
        <p className="text-xs text-muted-foreground mb-2">Arena Achievements</p>
        <div className="flex flex-wrap gap-2">
          {entry.badges.slice(0, 3).map((badge, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30 text-[9px] px-2 py-1">
                🏆 {badge}
              </Badge>
            </motion.div>
          ))}
          {entry.winStreak > 5 && (
            <Badge className="bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 border-red-500/30 text-[9px] px-2 py-1">
              🔥 {entry.winStreak} Win Streak
            </Badge>
          )}
        </div>
      </div>

      {/* Badges */}
      {entry.badges.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {entry.badges.slice(0, 2).map((badge, i) => (
            <Badge
              key={i}
              className="bg-primary/10 text-primary border-primary/30 text-[8px] uppercase"
            >
              {badge}
            </Badge>
          ))}
        </div>
      )}

      {/* King Badge */}
      {isKing && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 text-xs uppercase tracking-wider">
            👑 King of the Hill
          </Badge>
        </motion.div>
      )}
    </div>
  )
}
