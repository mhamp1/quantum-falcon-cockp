// XP Benefits Panel — Shows why users should earn XP
// November 24, 2025 — Quantum Falcon Cockpit

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, Lightning, Sparkle, Crown, Gift, 
  Target, TrendingUp, Zap, Coins, Rocket, Lock
} from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useKVSafe } from '@/hooks/useKVFallback'
import { 
  XP_LEVEL_REWARDS, 
  getBenefitsForLevel, 
  getNextLevelReward,
  getXPForLevel,
  type XPBenefit 
} from '@/lib/xpBenefits'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { cn } from '@/lib/utils'

interface UserProfile {
  level: number
  xp: number
  xpToNextLevel: number
}

export default function XPBenefitsPanel() {
  const [profile, setProfile] = useKVSafe<UserProfile>('user-profile-full', {
    level: 1,
    xp: 0,
    xpToNextLevel: 1000
  })

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [unlockedBenefits, setUnlockedBenefits] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Check for newly unlocked benefits
    const currentBenefits = getBenefitsForLevel(profile.level)
    const newUnlocks = currentBenefits.filter(b => !unlockedBenefits.has(b.id))
    
    if (newUnlocks.length > 0) {
      newUnlocks.forEach(benefit => {
        unlockedBenefits.add(benefit.id)
        const reward = XP_LEVEL_REWARDS.find(r => r.benefits.some(bb => bb.id === benefit.id))
        if (reward) {
          toast.success(reward.celebration.title, {
            description: reward.celebration.message,
            duration: 5000
          })
          if (reward.celebration.confetti) {
            confetti({
              particleCount: 200,
              spread: 120,
              origin: { y: 0.6 }
            })
          }
        }
      })
      setUnlockedBenefits(new Set(unlockedBenefits))
    }
  }, [profile.level])

  const nextReward = getNextLevelReward(profile.level)
  const allBenefits = getBenefitsForLevel(50) // Show all possible benefits
  const unlocked = getBenefitsForLevel(profile.level)
  const locked = allBenefits.filter(b => !unlocked.some(ub => ub.id === b.id))

  const filteredBenefits = selectedCategory === 'all' 
    ? allBenefits
    : allBenefits.filter(b => b.category === selectedCategory)

  const categoryIcons = {
    strategy: <Target size={16} />,
    agent: <Zap size={16} />,
    feature: <Sparkle size={16} />,
    discount: <Coins size={16} />,
    exclusive: <Crown size={16} />,
    power: <Lightning size={16} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 diagonal-stripes opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-transparent blur-3xl" />
        
        <div className="relative z-10 cyber-card p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-3xl font-black uppercase tracking-[0.2em] text-primary mb-2 flex items-center gap-3">
                <Trophy size={32} weight="fill" className="text-yellow-400" />
                XP Benefits System
              </h3>
              <p className="text-sm text-muted-foreground">
                Level up to unlock powerful features, strategies, and exclusive perks
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-primary mb-1">Level {profile.level}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">
                {unlocked.length} / {allBenefits.length} Benefits Unlocked
              </div>
            </div>
          </div>

          {/* Progress to Next Level */}
          {nextReward && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground uppercase tracking-wider">
                  Progress to Level {nextReward.level}
                </span>
                <span className="font-bold text-primary">
                  {profile.xp} / {profile.xpToNextLevel} XP
                </span>
              </div>
              <Progress 
                value={(profile.xp / profile.xpToNextLevel) * 100} 
                className="h-4"
              />
              <div className="glass-morph-card p-4 border border-primary/30">
                <div className="flex items-center gap-3 mb-2">
                  <Rocket size={20} weight="duotone" className="text-accent" />
                  <span className="text-sm font-bold text-accent uppercase tracking-wider">
                    Next Unlock: Level {nextReward.level}
                  </span>
                </div>
                <p className="text-xs text-foreground mb-2">{nextReward.celebration.message}</p>
                <div className="flex flex-wrap gap-2">
                  {nextReward.benefits.slice(0, 2).map(benefit => (
                    <Badge key={benefit.id} className="bg-primary/20 border-primary/50 text-primary text-xs">
                      {benefit.icon} {benefit.title}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <TabsList className="grid grid-cols-7 w-full bg-card/50 backdrop-blur-sm border-2 border-primary/30 p-1 gap-1">
          <TabsTrigger 
            value="all"
            className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary jagged-corner-small transition-all"
          >
            All
          </TabsTrigger>
          {['strategy', 'agent', 'feature', 'discount', 'exclusive', 'power'].map(cat => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary jagged-corner-small transition-all flex items-center gap-1"
            >
              {categoryIcons[cat as keyof typeof categoryIcons]}
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {/* Unlocked Benefits */}
          {filteredBenefits.filter(b => unlocked.some(ub => ub.id === b.id)).length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-bold uppercase tracking-wider text-green-400 flex items-center gap-2">
                <Gift size={20} weight="fill" />
                Unlocked Benefits
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBenefits
                  .filter(b => unlocked.some(ub => ub.id === b.id))
                  .map((benefit, idx) => (
                    <motion.div
                      key={benefit.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="cyber-card p-5 border-2 border-green-500/50 bg-green-500/10">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="text-3xl">{benefit.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-black uppercase tracking-wider text-green-400">
                                {benefit.title}
                              </h5>
                              <Badge className="bg-green-500/20 border-green-500/50 text-green-400 text-xs">
                                Level {benefit.level}
                              </Badge>
                            </div>
                            <p className="text-xs text-foreground leading-relaxed mb-2">
                              {benefit.description}
                            </p>
                            <div className="text-xs font-bold text-primary">
                              Value: {typeof benefit.value === 'number' ? `${benefit.value}%` : benefit.value}
                            </div>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-green-500/30">
                          <div className="flex items-center gap-2 text-xs text-green-400">
                            <Sparkle size={12} weight="fill" />
                            <span>Active</span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}

          {/* Locked Benefits */}
          {filteredBenefits.filter(b => !unlocked.some(ub => ub.id === b.id)).length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Lock size={20} weight="duotone" />
                Locked Benefits
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBenefits
                  .filter(b => !unlocked.some(ub => ub.id === b.id))
                  .map((benefit, idx) => (
                    <motion.div
                      key={benefit.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card className="cyber-card p-5 border-2 border-muted/30 bg-muted/10 opacity-60">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="text-3xl grayscale opacity-50">{benefit.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-black uppercase tracking-wider text-muted-foreground">
                                {benefit.title}
                              </h5>
                              <Badge className="bg-muted/30 border-muted/50 text-muted-foreground text-xs">
                                Level {benefit.level}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                              {benefit.description}
                            </p>
                            <div className="text-xs font-bold text-muted-foreground">
                              Value: {typeof benefit.value === 'number' ? `${benefit.value}%` : benefit.value}
                            </div>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-muted/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Lock size={12} weight="duotone" />
                              <span>Locked</span>
                            </div>
                            <div className="text-xs font-bold text-primary">
                              {profile.xpToNextLevel - profile.xp} XP to unlock
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Why Earn XP Section */}
      <Card className="cyber-card p-8 border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10">
        <h4 className="text-xl font-black uppercase tracking-wider text-primary mb-6 flex items-center gap-3">
          <TrendingUp size={24} weight="fill" />
          Why Earn XP?
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-3xl font-black text-primary mb-2">$0 → $8,000</div>
            <p className="text-sm text-foreground">
              Unlock features worth thousands without paying. Level 30 unlocks everything permanently.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-black text-accent mb-2">10% Bonus</div>
            <p className="text-sm text-foreground">
              Level 20 unlocks Profit Amplifier - earn 10% bonus on all profitable trades (up to $1000/day).
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-black text-yellow-400 mb-2">Zero Fees</div>
            <p className="text-sm text-foreground">
              Reach Level 30 and all trading fees are waived permanently. Save thousands per month.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

