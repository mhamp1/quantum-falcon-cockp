// Daily Challenges Panel — Increases engagement
// November 24, 2025 — Quantum Falcon Cockpit

import { motion } from 'framer-motion'
import { 
  Trophy, Target, Fire, Gift, Clock, 
  CheckCircle, Sparkle, Lightning
} from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useDailyChallenges } from '@/lib/dailyChallenges'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export default function DailyChallengesPanel() {
  const {
    challenges,
    streak,
    totalCompleted,
    updateChallenge,
    claimReward,
    getActiveChallenges,
    getCompletedChallenges
  } = useDailyChallenges()

  const activeChallenges = getActiveChallenges()
  const completedChallenges = getCompletedChallenges()

  const handleClaim = (challengeId: string) => {
    const reward = claimReward(challengeId)
    if (reward) {
      if (reward.type === 'strategy_unlock') {
        toast.success('Strategy Unlocked!', {
          description: reward.value,
          duration: 5000
        })
      } else {
        toast.success('Reward Claimed!', {
          description: reward.value
        })
      }
    }
  }

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'trade': return <Target size={20} weight="duotone" />
      case 'profit': return <Trophy size={20} weight="duotone" />
      case 'streak': return <Fire size={20} weight="duotone" />
      case 'strategy': return <Lightning size={20} weight="duotone" />
      default: return <Gift size={20} weight="duotone" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-wider text-primary flex items-center gap-3">
            <Trophy size={28} weight="fill" className="text-accent" />
            Daily Challenges
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Complete challenges to unlock strategies
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <Fire size={20} weight="fill" className="text-orange-400" />
            <span className="text-2xl font-black text-orange-400">{streak}</span>
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Day Streak</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="cyber-card p-4 text-center border border-primary/30">
          <div className="text-2xl font-black text-primary mb-1">{activeChallenges.length}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Active</div>
        </Card>
        <Card className="cyber-card p-4 text-center border border-accent/30">
          <div className="text-2xl font-black text-accent mb-1">{completedChallenges.length}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Ready</div>
        </Card>
        <Card className="cyber-card p-4 text-center border border-green-500/30">
          <div className="text-2xl font-black text-green-400 mb-1">{totalCompleted}</div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">Total</div>
        </Card>
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold uppercase tracking-wider text-primary">Active Challenges</h4>
          {activeChallenges.map((challenge, idx) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="cyber-card p-5 border-2 border-primary/30">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/20 border border-primary/50 rounded-lg">
                    {getChallengeIcon(challenge.type)}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-black uppercase tracking-wider text-primary mb-1">
                          {challenge.title}
                        </h5>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                      <Badge className="bg-accent/20 border-accent/50 text-accent">
                        <Clock size={12} className="mr-1" />
                        Today
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground uppercase tracking-wider">Progress</span>
                        <span className="font-bold text-primary">
                          {challenge.current}/{challenge.target}
                        </span>
                      </div>
                      <Progress 
                        value={(challenge.current / challenge.target) * 100} 
                        className="h-3"
                      />
                    </div>
                    
                    <div className="glass-morph-card p-3 border border-accent/30 bg-accent/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Gift size={14} weight="fill" className="text-accent" />
                        <span className="text-xs font-bold text-accent uppercase tracking-wider">Reward:</span>
                      </div>
                      <p className="text-xs text-foreground">{challenge.reward.value}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Completed Challenges */}
      {completedChallenges.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold uppercase tracking-wider text-green-400">Ready to Claim</h4>
          {completedChallenges.map((challenge, idx) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="cyber-card p-5 border-2 border-green-500/50 bg-green-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                      <CheckCircle size={24} weight="fill" className="text-green-400" />
                    </div>
                    <div>
                      <h5 className="font-black uppercase tracking-wider text-green-400 mb-1">
                        {challenge.title}
                      </h5>
                      <p className="text-sm text-muted-foreground">{challenge.reward.value}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleClaim(challenge.id)}
                    className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400"
                  >
                    <Sparkle size={16} className="mr-2" weight="fill" />
                    Claim Reward
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {activeChallenges.length === 0 && completedChallenges.length === 0 && (
        <Card className="cyber-card p-12 text-center border border-primary/30">
          <Trophy size={48} weight="duotone" className="text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No challenges available. Check back tomorrow!</p>
        </Card>
      )}
    </div>
  )
}

