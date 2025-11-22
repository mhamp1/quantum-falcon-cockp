// Quest Board — Complete Quests, Earn XP & NFTs
// November 22, 2025 — Quantum Falcon Cockpit

import { useState, useEffect, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, Target, Fire, Users, GraduationCap, 
  TrendingUp, MagnifyingGlass, Crown, Lock
} from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { QUESTS, type Quest } from '@/lib/nft/QuestNFTSystem'
import { useKV } from '@github/spark/hooks'
import { UserAuth } from '@/lib/auth'
import QuestNFTReward from './QuestNFTReward'
import { cn } from '@/lib/utils'

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

  // Mock user stats - replace with actual data
  const userStats = {
    totalTrades: 45,
    totalProfit: 2340.50,
    winRate: 68.5,
    streakDays: 3,
    level: 12
  }

  const userTier = auth?.license?.tier || 'Free'

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
      case 'trading': return <TrendingUp size={16} weight="duotone" />
      case 'achievement': return <Trophy size={16} weight="duotone" />
      case 'social': return <Users size={16} weight="duotone" />
      case 'learning': return <GraduationCap size={16} weight="duotone" />
      case 'milestone': return <Target size={16} weight="duotone" />
      default: return <Fire size={16} weight="duotone" />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy size={32} className="text-primary" weight="duotone" />
          <div>
            <h2 className="text-3xl font-bold uppercase tracking-wider text-secondary">
              Quest Board
            </h2>
            <p className="text-sm text-muted-foreground">
              Complete quests to earn XP and exclusive NFTs
            </p>
          </div>
        </div>
        <Badge className="bg-accent/20 border-2 border-accent text-accent">
          <Crown size={14} className="mr-1" />
          {userTier} Tier
        </Badge>
      </div>

      {/* Filters */}
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
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Quest Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="achievement">Achievement</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="milestone">Milestone</TabsTrigger>
        </TabsList>

        {Object.entries(questsByCategory).map(([category, quests]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            {quests.length === 0 ? (
              <div className="cyber-card p-12 text-center">
                <Trophy size={64} weight="duotone" className="mx-auto text-muted-foreground opacity-50" />
                <h3 className="text-xl font-bold uppercase tracking-wider text-muted-foreground mt-4">
                  No Quests Found
                </h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters or check back later for new quests
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quests.map((quest) => {
                  const isCompleted = checkQuestCompletion(quest)
                  const hasAccess = !quest.tierRequired || 
                    (quest.tierRequired === 'Free' && ['Free', 'Starter', 'Trader', 'Pro', 'Elite', 'Lifetime'].includes(userTier)) ||
                    (quest.tierRequired === 'Starter' && ['Starter', 'Trader', 'Pro', 'Elite', 'Lifetime'].includes(userTier)) ||
                    (quest.tierRequired === 'Trader' && ['Trader', 'Pro', 'Elite', 'Lifetime'].includes(userTier)) ||
                    (quest.tierRequired === 'Pro' && ['Pro', 'Elite', 'Lifetime'].includes(userTier)) ||
                    (quest.tierRequired === 'Elite' && ['Elite', 'Lifetime'].includes(userTier))

                  return (
                    <motion.div
                      key={quest.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "cyber-card p-5 space-y-4",
                        !hasAccess && "opacity-50"
                      )}
                    >
                      {/* Quest Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(quest.category)}
                          <div>
                            <h3 className="font-bold uppercase tracking-wider text-sm">
                              {quest.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {quest.description}
                            </p>
                          </div>
                        </div>
                        {!hasAccess && quest.tierRequired && (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-500 text-[10px]">
                            <Lock size={10} className="mr-1" />
                            {quest.tierRequired}+
                          </Badge>
                        )}
                      </div>

                      {/* Requirements */}
                      <div className="cyber-card-accent p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground uppercase">
                            Requirement
                          </span>
                          {isCompleted ? (
                            <Badge className="bg-accent/20 border-accent text-accent text-[10px]">
                              Complete
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">
                              In Progress
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-bold">
                          {quest.requirements.description}
                        </p>
                      </div>

                      {/* Rewards */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary">
                              +{quest.xpReward}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase">
                              XP
                            </div>
                          </div>
                          {quest.nftReward && (
                            <div className="text-center">
                              <div className="text-lg font-bold text-accent">
                                NFT
                              </div>
                              <div className="text-[10px] text-muted-foreground uppercase">
                                Reward
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* NFT Reward Component */}
                      {quest.nftReward && (
                        <QuestNFTReward
                          quest={quest}
                          userStats={userStats}
                          onMintComplete={(mintAddress) => {
                            setCompletedQuests([...completedQuests, quest.id])
                          }}
                        />
                      )}
                    </motion.div>
                  )
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

