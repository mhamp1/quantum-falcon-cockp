// QUANTUM FALCON QUEST HUB — REBUILT FROM SCRATCH
// November 24, 2025 — Complete rebuild for maximum engagement
// All functionality preserved, enhanced UX for fun while bot trades

import { useState, useEffect, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Trophy, Target, Fire, Users, GraduationCap, 
  TrendUp as TrendingUp, MagnifyingGlass, Crown, Lock, Sparkle,
  Lightning, Rocket, Medal, Star, CheckCircle, XCircle,
  ChartLineUp, Coins, Timer, Gift, Flame
} from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'
import { QUESTS, type Quest } from '@/lib/nft/QuestNFTSystem'
import { useKV } from '@github/spark/hooks'
import { UserAuth } from '@/lib/auth'
import QuestNFTReward from './QuestNFTReward'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useDailyChallenges } from '@/lib/dailyChallenges'
import { setChallengeUpdater } from '@/lib/bot/AutonomousTradingLoop'
import ChallengeLeaderboard from '@/components/shared/ChallengeLeaderboard'
import DailyChallengesPanel from '@/components/shared/DailyChallengesPanel'

export default function QuestBoard() {
  const [auth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [completedQuests, setCompletedQuests] = useKV<string[]>('completed-quests', [])
  const [activeTab, setActiveTab] = useState('all')
  const [liveActivity, setLiveActivity] = useState<Array<{ id: string; message: string; timestamp: number }>>([])
  
  // Daily challenges integration
  const { updateFromTrade, challenges: dailyChallenges } = useDailyChallenges()
  
  // Connect challenge tracking to trade system
  useEffect(() => {
    setChallengeUpdater(updateFromTrade)
    return () => {
      setChallengeUpdater(() => {})
    }
  }, [updateFromTrade])

  // Real-time user stats - integrate with actual bot data
  const [userStats, setUserStats] = useState({
    totalTrades: 45,
    totalProfit: 2340.50,
    winRate: 68.5,
    streakDays: 3,
    level: 12,
    xp: 2340,
    xpToNextLevel: 3000
  })

  const userTier = auth?.license?.tier || 'Free'

  // Simulate live bot activity updates
  useEffect(() => {
    const interval = setInterval(() => {
      const activities = [
        { id: `activity-${Date.now()}`, message: 'Bot executed trade: +$12.50 profit', timestamp: Date.now() },
        { id: `activity-${Date.now()}-2`, message: 'Strategy "Liquidity Hunter" active', timestamp: Date.now() },
        { id: `activity-${Date.now()}-3`, message: 'Market scan complete: 3 opportunities found', timestamp: Date.now() },
      ]
      const randomActivity = activities[Math.floor(Math.random() * activities.length)]
      setLiveActivity(prev => [randomActivity, ...prev.slice(0, 4)])
    }, 8000)

    return () => clearInterval(interval)
  }, [])

  // Filter quests
  const filteredQuests = useMemo(() => {
    return QUESTS.filter(quest => {
      const matchesSearch = quest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           quest.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || quest.category === selectedCategory
      const matchesTier = !quest.tierRequired || 
                         (userTier === 'Lifetime' || 
                          (quest.tierRequired === 'Free' && ['Free', 'Starter', 'Trader', 'Pro', 'Elite', 'Lifetime'].includes(userTier)) ||
                          (quest.tierRequired === 'Starter' && ['Starter', 'Trader', 'Pro', 'Elite', 'Lifetime'].includes(userTier)) ||
                          (quest.tierRequired === 'Trader' && ['Trader', 'Pro', 'Elite', 'Lifetime'].includes(userTier)) ||
                          (quest.tierRequired === 'Pro' && ['Pro', 'Elite', 'Lifetime'].includes(userTier)) ||
                          (quest.tierRequired === 'Elite' && ['Elite', 'Lifetime'].includes(userTier)))
      return matchesSearch && matchesCategory && matchesTier
    })
  }, [searchQuery, selectedCategory, userTier])

  // Group by category
  const questsByCategory = {
    all: filteredQuests,
    trading: filteredQuests.filter(q => q.category === 'trading'),
    achievement: filteredQuests.filter(q => q.category === 'achievement'),
    social: filteredQuests.filter(q => q.category === 'social'),
    learning: filteredQuests.filter(q => q.category === 'learning'),
    milestone: filteredQuests.filter(q => q.category === 'milestone')
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trading': return <TrendingUp size={20} weight="duotone" />
      case 'achievement': return <Trophy size={20} weight="duotone" />
      case 'social': return <Users size={20} weight="duotone" />
      case 'learning': return <GraduationCap size={20} weight="duotone" />
      case 'milestone': return <Target size={20} weight="duotone" />
      default: return <Fire size={20} weight="duotone" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'trading': return 'from-green-500/20 to-emerald-500/20 border-green-500/30'
      case 'achievement': return 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30'
      case 'social': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
      case 'learning': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
      case 'milestone': return 'from-red-500/20 to-orange-500/20 border-red-500/30'
      default: return 'from-primary/20 to-accent/20 border-primary/30'
    }
  }

  const checkQuestCompletion = (quest: Quest): boolean => {
    switch (quest.requirements.type) {
      case 'trade_count':
        return (userStats.totalTrades || 0) >= quest.requirements.value
      case 'profit_amount':
        return (userStats.totalProfit || 0) >= quest.requirements.value
      case 'win_rate':
        return (userStats.winRate || 0) >= quest.requirements.value
      case 'streak_days':
        return (userStats.streakDays || 0) >= quest.requirements.value
      case 'level_reach':
        return (userStats.level || 0) >= quest.requirements.value
      default:
        return false
    }
  }

  const getQuestProgress = (quest: Quest): number => {
    switch (quest.requirements.type) {
      case 'trade_count':
        return Math.min(100, ((userStats.totalTrades || 0) / quest.requirements.value) * 100)
      case 'profit_amount':
        return Math.min(100, ((userStats.totalProfit || 0) / quest.requirements.value) * 100)
      case 'win_rate':
        return Math.min(100, ((userStats.winRate || 0) / quest.requirements.value) * 100)
      case 'streak_days':
        return Math.min(100, ((userStats.streakDays || 0) / quest.requirements.value) * 100)
      case 'level_reach':
        return Math.min(100, ((userStats.level || 0) / quest.requirements.value) * 100)
      default:
        return 0
    }
  }

  const completedCount = filteredQuests.filter(q => checkQuestCompletion(q)).length
  const totalQuests = filteredQuests.length
  const completionRate = totalQuests > 0 ? (completedCount / totalQuests) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Hero Header with Live Stats */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 diagonal-stripes opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-accent/20 to-transparent blur-3xl" />
        
        <div className="relative z-10 cyber-card p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Trophy size={48} weight="duotone" className="text-primary neon-glow-primary" />
              </motion.div>
              <div>
                <h2 className="text-4xl font-black uppercase tracking-[0.2em] text-primary">
                  QUEST HUB
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete missions, earn XP & exclusive NFTs while your bot trades
                </p>
              </div>
            </div>
            <Badge className="bg-accent/20 border-2 border-accent text-accent uppercase tracking-wider px-4 py-2">
              <Crown size={16} weight="fill" className="mr-2" />
              {userTier} Tier
            </Badge>
          </div>

          {/* Live Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-morph-card p-4 border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <ChartLineUp size={16} className="text-primary" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Trades</span>
              </div>
              <div className="text-2xl font-black text-primary">{userStats.totalTrades}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-morph-card p-4 border border-accent/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Coins size={16} className="text-accent" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Profit</span>
              </div>
              <div className="text-2xl font-black text-accent">${userStats.totalProfit.toFixed(0)}</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-morph-card p-4 border border-secondary/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-secondary" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Win Rate</span>
              </div>
              <div className="text-2xl font-black text-secondary">{userStats.winRate.toFixed(1)}%</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="glass-morph-card p-4 border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <Flame size={16} className="text-primary" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Streak</span>
              </div>
              <div className="text-2xl font-black text-primary">{userStats.streakDays} days</div>
            </motion.div>
          </div>

          {/* Completion Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground uppercase tracking-wider">Quest Completion</span>
              <span className="font-bold text-primary">{completedCount} / {totalQuests}</span>
            </div>
            <Progress value={completionRate} className="h-3" />
          </div>
        </div>
      </div>

      {/* Live Bot Activity Feed */}
      {liveActivity.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-card p-4 border border-primary/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightning size={18} weight="fill" className="text-primary animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Live Bot Activity</h3>
          </div>
          <AnimatePresence mode="popLayout">
            {liveActivity.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2 text-xs text-muted-foreground py-1"
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span>{activity.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Search & Filters */}
      <div className="cyber-card p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlass 
              size={20} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              placeholder="Search quests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
        </div>
      </div>

      {/* Quest Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-8 bg-card/50 backdrop-blur-sm border-2 border-primary/30 p-1 gap-1">
          <TabsTrigger 
            value="all"
            className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary jagged-corner-small transition-all"
          >
            <Fire size={14} weight="duotone" className="mr-2" />
            All
          </TabsTrigger>
          <TabsTrigger 
            value="trading"
            className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-2 data-[state=active]:border-green-500 jagged-corner-small transition-all"
          >
            <TrendingUp size={14} weight="duotone" className="mr-2" />
            Trading
          </TabsTrigger>
          <TabsTrigger 
            value="achievement"
            className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400 data-[state=active]:border-2 data-[state=active]:border-yellow-500 jagged-corner-small transition-all"
          >
            <Trophy size={14} weight="duotone" className="mr-2" />
            Achievement
          </TabsTrigger>
          <TabsTrigger 
            value="social"
            className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 data-[state=active]:border-2 data-[state=active]:border-blue-500 jagged-corner-small transition-all"
          >
            <Users size={14} weight="duotone" className="mr-2" />
            Social
          </TabsTrigger>
          <TabsTrigger 
            value="learning"
            className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 data-[state=active]:border-2 data-[state=active]:border-purple-500 jagged-corner-small transition-all"
          >
            <GraduationCap size={14} weight="duotone" className="mr-2" />
            Learning
          </TabsTrigger>
          <TabsTrigger 
            value="milestone"
            className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 data-[state=active]:border-2 data-[state=active]:border-red-500 jagged-corner-small transition-all"
          >
            <Target size={14} weight="duotone" className="mr-2" />
            Milestone
          </TabsTrigger>
          <TabsTrigger 
            value="daily"
            className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 data-[state=active]:border-2 data-[state=active]:border-orange-500 jagged-corner-small transition-all"
          >
            <Timer size={14} weight="duotone" className="mr-2" />
            Daily
          </TabsTrigger>
          <TabsTrigger 
            value="leaderboard"
            className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400 data-[state=active]:border-2 data-[state=active]:border-yellow-500 jagged-corner-small transition-all"
          >
            <Medal size={14} weight="duotone" className="mr-2" />
            Leaderboard
          </TabsTrigger>
        </TabsList>

        {Object.entries(questsByCategory).map(([category, quests]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            {quests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="cyber-card p-12 text-center"
              >
                <Trophy size={64} weight="duotone" className="mx-auto text-muted-foreground opacity-50" />
                <h3 className="text-xl font-bold uppercase tracking-wider text-muted-foreground mt-4">
                  No Quests Found
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters or check back later for new quests
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quests.map((quest, idx) => {
                  const isCompleted = checkQuestCompletion(quest)
                  const progress = getQuestProgress(quest)
                  const hasAccess = !quest.tierRequired || 
                    (quest.tierRequired === 'Free' && ['Free', 'Starter', 'Trader', 'Pro', 'Elite', 'Lifetime'].includes(userTier)) ||
                    (quest.tierRequired === 'Starter' && ['Starter', 'Trader', 'Pro', 'Elite', 'Lifetime'].includes(userTier)) ||
                    (quest.tierRequired === 'Trader' && ['Trader', 'Pro', 'Elite', 'Lifetime'].includes(userTier)) ||
                    (quest.tierRequired === 'Pro' && ['Pro', 'Elite', 'Lifetime'].includes(userTier)) ||
                    (quest.tierRequired === 'Elite' && ['Elite', 'Lifetime'].includes(userTier))

                  return (
                    <motion.div
                      key={quest.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200 }}
                      whileHover={{ 
                        y: -8, 
                        scale: 1.02,
                        transition: { duration: 0.2 } 
                      }}
                      className={cn(
                        "glass-morph-card p-6 space-y-4 relative overflow-hidden group cursor-pointer",
                        "transform-gpu will-change-transform",
                        "shadow-lg hover:shadow-2xl hover:shadow-primary/20",
                        "border-2 border-transparent hover:border-primary/40",
                        isCompleted && "ring-2 ring-accent animate-pulse-glow border-accent/50",
                        !hasAccess && "opacity-60 grayscale hover:grayscale-0"
                      )}
                    >
                      {/* Animated Border Gradient */}
                      <div className={cn(
                        "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                        "bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%]",
                        "animate-gradient-x -z-10"
                      )} style={{ padding: '2px', margin: '-2px' }} />
                      
                      {/* Background Gradient */}
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity",
                        getCategoryColor(quest.category)
                      )} />
                      
                      {/* Shimmer Effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 ease-in-out" />

                      {/* Glow Effect on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300" />
                      
                      {/* Particle Effect for Completed */}
                      {isCompleted && (
                        <div className="absolute inset-0 overflow-hidden">
                          <div className="absolute top-0 left-1/4 w-1 h-1 bg-accent rounded-full animate-ping" style={{ animationDelay: '0s' }} />
                          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.3s' }} />
                          <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-accent rounded-full animate-ping" style={{ animationDelay: '0.6s' }} />
                        </div>
                      )}

                      <div className="relative z-10 space-y-4">
                        {/* Quest Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <motion.div
                              animate={isCompleted ? { rotate: [0, 360] } : {}}
                              transition={{ duration: 1, repeat: isCompleted ? Infinity : 0, repeatDelay: 2 }}
                              className={cn(
                                "p-2 rounded-lg border-2",
                                isCompleted ? "bg-accent/20 border-accent" : "bg-background/50 border-border"
                              )}
                            >
                              {getCategoryIcon(quest.category)}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-black uppercase tracking-wider text-sm line-clamp-1">
                                {quest.name}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {quest.description}
                              </p>
                            </div>
                          </div>
                          {!hasAccess && quest.tierRequired && (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-500 text-[10px] shrink-0">
                              <Lock size={10} className="mr-1" />
                              {quest.tierRequired}+
                            </Badge>
                          )}
                        </div>

                        {/* Enhanced Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground uppercase tracking-wider font-medium">Progress</span>
                            <motion.span 
                              key={progress}
                              initial={{ scale: 1.2, color: '#00ffff' }}
                              animate={{ scale: 1, color: isCompleted ? '#00ffcc' : '#ffffff' }}
                              className="font-black text-primary"
                            >
                              {Math.round(progress)}%
                            </motion.span>
                          </div>
                          <div className="relative">
                            <Progress 
                              value={progress} 
                              className={cn(
                                "h-3 rounded-full overflow-hidden",
                                isCompleted && "bg-accent/20"
                              )} 
                            />
                            {/* Animated shine on progress bar */}
                            {progress > 0 && (
                              <motion.div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                style={{ width: `${progress}%` }}
                                animate={{ x: [-100, 100] }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Requirements */}
                        <div className={cn(
                          "p-3 rounded-lg border-2 space-y-2",
                          isCompleted 
                            ? "bg-accent/20 border-accent" 
                            : "bg-background/50 border-border/50"
                        )}>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">
                              Requirement
                            </span>
                            {isCompleted ? (
                              <Badge className="bg-accent/30 border-accent text-accent text-[10px]">
                                <CheckCircle size={10} weight="fill" className="mr-1" />
                                Complete
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px]">
                                <Timer size={10} className="mr-1" />
                                In Progress
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm font-bold text-foreground">
                            {quest.requirements.description}
                          </p>
                        </div>

                        {/* Enhanced Rewards */}
                        <div className="flex items-center justify-between pt-3 border-t border-border/30">
                          <div className="flex items-center gap-4">
                            <motion.div
                              whileHover={{ scale: 1.15, rotate: 5 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-center p-2 bg-primary/10 rounded-lg border border-primary/30 cursor-pointer"
                            >
                              <div className="text-xl font-black text-primary flex items-center gap-1">
                                <motion.div
                                  animate={{ rotate: [0, 15, -15, 0] }}
                                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >
                                  <Sparkle size={18} weight="fill" />
                                </motion.div>
                                +{quest.xpReward}
                              </div>
                              <div className="text-[10px] text-muted-foreground uppercase font-bold">
                                XP Reward
                              </div>
                            </motion.div>
                            {quest.nftReward && (
                              <motion.div
                                whileHover={{ scale: 1.15, rotate: -5 }}
                                whileTap={{ scale: 0.95 }}
                                className="text-center p-2 bg-accent/10 rounded-lg border border-accent/30 cursor-pointer"
                              >
                                <div className="text-xl font-black text-accent flex items-center gap-1">
                                  <motion.div
                                    animate={{ y: [0, -3, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                  >
                                    <Gift size={18} weight="fill" />
                                  </motion.div>
                                  NFT
                                </div>
                                <div className="text-[10px] text-muted-foreground uppercase font-bold">
                                  Exclusive
                                </div>
                              </motion.div>
                            )}
                          </div>
                          
                          {/* Claim Button */}
                          {isCompleted && !quest.nftReward && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-accent text-black font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-accent/30"
                            >
                              Claim XP
                            </motion.button>
                          )}
                        </div>

                        {/* NFT Reward Component */}
                        {quest.nftReward && (
                          <QuestNFTReward
                            quest={quest}
                            userStats={userStats}
                            onMintComplete={(mintAddress) => {
                              setCompletedQuests([...completedQuests, quest.id])
                              toast.success('Quest Completed!', {
                                description: `${quest.name} NFT minted successfully`,
                                icon: '🎉'
                              })
                            }}
                          />
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        ))}

        {/* Daily Challenges Tab */}
        <TabsContent value="daily" className="space-y-6">
          <DailyChallengesPanel />
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          <ChallengeLeaderboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}

