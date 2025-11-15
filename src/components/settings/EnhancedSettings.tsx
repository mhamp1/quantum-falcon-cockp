import { useKV } from '@github/spark/hooks'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User, Trophy, GraduationCap, Gear, Bell, Palette, Lock,
  CurrencyDollar, SpeakerHigh, Shield, ChartLine, Medal, Star,
  Fire, Target, CheckCircle, Crown, ArrowsClockwise
} from '@phosphor-icons/react'
import { toast } from 'sonner'

interface UserProfile {
  username: string
  email: string
  level: number
  xp: number
  xpToNextLevel: number
  totalTrades: number
  winRate: number
  memberSince: string
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  progress: number
  maxProgress: number
}

interface Course {
  id: string
  title: string
  progress: number
  lessons: number
  completedLessons: number
}

interface AppSettings {
  notifications: {
    tradeAlerts: boolean
    priceAlerts: boolean
    forumReplies: boolean
  }
  theme: {
    darkMode: boolean
    colorScheme: string
  }
  currency: string
  audio: {
    soundEffects: boolean
    ambientMusic: boolean
    voiceNarration: boolean
  }
  trading: {
    paperMode: boolean
    defaultAmount: number
    confirmTrades: boolean
  }
  security: {
    biometric: boolean
    twoFactor: boolean
    autoLogout: number
  }
}

export default function EnhancedSettings() {
  const [profile, setProfile] = useKV<UserProfile>('user-profile-full', {
    username: 'QuantumTrader',
    email: 'trader@quantumfalcon.ai',
    level: 15,
    xp: 3450,
    xpToNextLevel: 5000,
    totalTrades: 234,
    winRate: 68.5,
    memberSince: 'Jan 2024'
  })

  const [settings, setSettings] = useKV<AppSettings>('app-settings', {
    notifications: {
      tradeAlerts: true,
      priceAlerts: true,
      forumReplies: false
    },
    theme: {
      darkMode: true,
      colorScheme: 'neon-green'
    },
    currency: 'USD',
    audio: {
      soundEffects: true,
      ambientMusic: false,
      voiceNarration: false
    },
    trading: {
      paperMode: true,
      defaultAmount: 100,
      confirmTrades: true
    },
    security: {
      biometric: true,
      twoFactor: false,
      autoLogout: 5
    }
  })

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'First Trade',
      description: 'Execute your first trade',
      icon: <CheckCircle size={24} weight="duotone" className="text-primary" />,
      unlocked: true,
      progress: 1,
      maxProgress: 1
    },
    {
      id: '2',
      title: '$1K Portfolio',
      description: 'Reach $1,000 portfolio value',
      icon: <Target size={24} weight="duotone" className="text-primary" />,
      unlocked: true,
      progress: 1,
      maxProgress: 1
    },
    {
      id: '3',
      title: '10 Day Streak',
      description: 'Trade for 10 consecutive days',
      icon: <Fire size={24} weight="duotone" className="text-accent" />,
      unlocked: true,
      progress: 10,
      maxProgress: 10
    },
    {
      id: '4',
      title: '50% Win Rate',
      description: 'Achieve 50% win rate',
      icon: <Star size={24} weight="duotone" className="text-primary" />,
      unlocked: true,
      progress: 1,
      maxProgress: 1
    },
    {
      id: '5',
      title: '100 Trades',
      description: 'Execute 100 total trades',
      icon: <Trophy size={24} weight="duotone" className="text-accent" />,
      unlocked: false,
      progress: 67,
      maxProgress: 100
    },
    {
      id: '6',
      title: 'Strategy Master',
      description: 'Create and publish a strategy',
      icon: <Crown size={24} weight="duotone" className="text-muted-foreground" />,
      unlocked: false,
      progress: 0,
      maxProgress: 1
    }
  ]

  const courses: Course[] = [
    {
      id: '1',
      title: "Beginner's Guide",
      progress: 60,
      lessons: 10,
      completedLessons: 6
    },
    {
      id: '2',
      title: 'Technical Analysis 101',
      progress: 40,
      lessons: 15,
      completedLessons: 6
    },
    {
      id: '3',
      title: 'Risk Management',
      progress: 0,
      lessons: 12,
      completedLessons: 0
    }
  ]

  const handleUpdateSetting = (path: string[], value: any) => {
    if (!settings) return
    
    setSettings((current) => {
      const base = current || settings
      const updated = { ...base }
      let obj: any = updated
      
      for (let i = 0; i < path.length - 1; i++) {
        obj = obj[path[i]]
      }
      obj[path[path.length - 1]] = value
      
      return updated
    })
    toast.success('Setting updated')
  }

  if (!profile || !settings) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-[0.25em] uppercase">
          <span className="text-primary neon-glow-primary">SETTINGS</span>
        </h2>
        <button className="p-2 bg-card border border-primary/30 hover:bg-primary/10 hover:border-primary transition-all relative group">
          <ArrowsClockwise size={18} weight="duotone" className="text-primary" />
          <div className="hud-corner-tl" />
          <div className="hud-corner-br" />
        </button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/30 border border-primary/30 flex-wrap h-auto">
          <TabsTrigger value="profile" className="data-label gap-2">
            <User size={16} weight="duotone" />
            PROFILE
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-label gap-2">
            <Trophy size={16} weight="duotone" />
            ACHIEVEMENTS
          </TabsTrigger>
          <TabsTrigger value="education" className="data-label gap-2">
            <GraduationCap size={16} weight="duotone" />
            EDUCATION
          </TabsTrigger>
          <TabsTrigger value="app" className="data-label gap-2">
            <Gear size={16} weight="duotone" />
            APP_SETTINGS
          </TabsTrigger>
          <TabsTrigger value="subscription" className="data-label gap-2">
            <Crown size={16} weight="duotone" />
            SUBSCRIPTION
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="cyber-card">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary flex items-center justify-center jagged-corner">
                  <User size={48} weight="duotone" className="text-primary" />
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold uppercase tracking-wide mb-1">@{profile.username}</h3>
                    <p className="data-label">{profile.email}</p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="p-3 bg-primary/10 border border-primary/30">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Level</div>
                      <div className="text-2xl font-bold text-primary flex items-center gap-2">
                        <Medal size={20} weight="fill" />
                        {profile.level}
                      </div>
                    </div>
                    <div className="p-3 bg-muted/30 border border-muted/50">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Total Trades</div>
                      <div className="text-2xl font-bold">{profile.totalTrades}</div>
                    </div>
                    <div className="p-3 bg-muted/30 border border-muted/50">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Win Rate</div>
                      <div className="text-2xl font-bold text-accent">{profile.winRate}%</div>
                    </div>
                    <div className="p-3 bg-muted/30 border border-muted/50">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Member Since</div>
                      <div className="text-sm font-bold">{profile.memberSince}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="data-label">XP PROGRESS</span>
                      <span className="text-sm font-bold text-primary">
                        {profile.xp} / {profile.xpToNextLevel} XP
                      </span>
                    </div>
                    <Progress value={(profile.xp / profile.xpToNextLevel) * 100} className="h-3" />
                    <p className="text-xs text-muted-foreground">
                      {profile.xpToNextLevel - profile.xp} XP to Level {profile.level + 1}
                    </p>
                  </div>

                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                    EDIT_PROFILE
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="cyber-card">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Trophy size={24} weight="duotone" className="text-primary" />
                <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout">
                  ACHIEVEMENTS ({achievements.filter(a => a.unlocked).length}/{achievements.length})
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={`p-4 ${
                      achievement.unlocked 
                        ? 'cyber-card-accent' 
                        : 'bg-muted/20 border border-muted/30 opacity-50'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0">
                        {achievement.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold uppercase tracking-wide text-sm mb-1">
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {achievement.description}
                        </p>
                      </div>
                    </div>
                    {!achievement.unlocked && achievement.maxProgress > 1 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="data-label">PROGRESS</span>
                          <span className="font-bold">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-2"
                        />
                      </div>
                    )}
                    {achievement.unlocked && (
                      <div className="flex items-center gap-2 text-xs text-primary mt-2">
                        <CheckCircle size={14} weight="fill" />
                        <span className="font-bold uppercase tracking-wide">UNLOCKED</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="education" className="space-y-6">
          <div className="cyber-card">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap size={24} weight="duotone" className="text-primary" />
                <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout">LEARN_TO_TRADE</h3>
              </div>

              <div className="space-y-4">
                {courses.map((course) => (
                  <div key={course.id} className="cyber-card-accent">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold uppercase tracking-wide mb-1">{course.title}</h4>
                          <p className="data-label text-xs">
                            {course.completedLessons}/{course.lessons} lessons completed
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{course.progress}%</div>
                        </div>
                      </div>
                      <Progress value={course.progress} className="h-2 mb-3" />
                      <Button 
                        size="sm"
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary/10 w-full"
                      >
                        {course.progress === 0 ? 'START_COURSE' : 'CONTINUE'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="app" className="space-y-6">
          <div className="cyber-card">
            <div className="p-6 space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Bell size={20} weight="duotone" className="text-primary" />
                  <h3 className="text-lg font-bold uppercase tracking-wide hud-readout">NOTIFICATIONS</h3>
                </div>
                <div className="space-y-3 pl-7">
                  <div className="flex items-center justify-between p-3 bg-muted/20 border border-muted/30">
                    <Label className="data-label cursor-pointer">TRADE_ALERTS</Label>
                    <Switch 
                      checked={settings.notifications.tradeAlerts}
                      onCheckedChange={(v) => handleUpdateSetting(['notifications', 'tradeAlerts'], v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 border border-muted/30">
                    <Label className="data-label cursor-pointer">PRICE_ALERTS</Label>
                    <Switch 
                      checked={settings.notifications.priceAlerts}
                      onCheckedChange={(v) => handleUpdateSetting(['notifications', 'priceAlerts'], v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 border border-muted/30">
                    <Label className="data-label cursor-pointer">FORUM_REPLIES</Label>
                    <Switch 
                      checked={settings.notifications.forumReplies}
                      onCheckedChange={(v) => handleUpdateSetting(['notifications', 'forumReplies'], v)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <SpeakerHigh size={20} weight="duotone" className="text-primary" />
                  <h3 className="text-lg font-bold uppercase tracking-wide hud-readout">AUDIO</h3>
                </div>
                <div className="space-y-3 pl-7">
                  <div className="flex items-center justify-between p-3 bg-muted/20 border border-muted/30">
                    <Label className="data-label cursor-pointer">SOUND_EFFECTS</Label>
                    <Switch 
                      checked={settings.audio.soundEffects}
                      onCheckedChange={(v) => handleUpdateSetting(['audio', 'soundEffects'], v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 border border-muted/30">
                    <Label className="data-label cursor-pointer">AMBIENT_MUSIC</Label>
                    <Switch 
                      checked={settings.audio.ambientMusic}
                      onCheckedChange={(v) => handleUpdateSetting(['audio', 'ambientMusic'], v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 border border-muted/30">
                    <Label className="data-label cursor-pointer">VOICE_NARRATION</Label>
                    <Switch 
                      checked={settings.audio.voiceNarration}
                      onCheckedChange={(v) => handleUpdateSetting(['audio', 'voiceNarration'], v)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ChartLine size={20} weight="duotone" className="text-primary" />
                  <h3 className="text-lg font-bold uppercase tracking-wide hud-readout">TRADING_PREFERENCES</h3>
                </div>
                <div className="space-y-3 pl-7">
                  <div className="flex items-center justify-between p-3 bg-muted/20 border border-muted/30">
                    <Label className="data-label cursor-pointer">PAPER_MODE</Label>
                    <Switch 
                      checked={settings.trading.paperMode}
                      onCheckedChange={(v) => handleUpdateSetting(['trading', 'paperMode'], v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 border border-muted/30">
                    <Label className="data-label cursor-pointer">CONFIRM_TRADES</Label>
                    <Switch 
                      checked={settings.trading.confirmTrades}
                      onCheckedChange={(v) => handleUpdateSetting(['trading', 'confirmTrades'], v)}
                    />
                  </div>
                  <div className="p-3 bg-muted/20 border border-muted/30 space-y-2">
                    <Label className="data-label">DEFAULT_AMOUNT</Label>
                    <Input 
                      type="number"
                      value={settings.trading.defaultAmount}
                      onChange={(e) => handleUpdateSetting(['trading', 'defaultAmount'], Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Lock size={20} weight="duotone" className="text-primary" />
                  <h3 className="text-lg font-bold uppercase tracking-wide hud-readout">SECURITY</h3>
                </div>
                <div className="space-y-3 pl-7">
                  <div className="flex items-center justify-between p-3 bg-muted/20 border border-muted/30">
                    <Label className="data-label cursor-pointer">PIN/BIOMETRIC</Label>
                    <Switch 
                      checked={settings.security.biometric}
                      onCheckedChange={(v) => handleUpdateSetting(['security', 'biometric'], v)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 border border-muted/30">
                    <Label className="data-label cursor-pointer">TWO_FACTOR_AUTH</Label>
                    <Switch 
                      checked={settings.security.twoFactor}
                      onCheckedChange={(v) => handleUpdateSetting(['security', 'twoFactor'], v)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <div className="cyber-card">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Crown size={24} weight="duotone" className="text-accent" />
                <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-readout">SUBSCRIPTION_TIER</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="cyber-card p-6 space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold uppercase mb-2">FREE</h4>
                    <p className="text-3xl font-bold text-primary">$0</p>
                    <p className="data-label">ALWAYS_FREE</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} weight="fill" className="text-primary" />
                      <span>Paper Trading</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} weight="fill" className="text-primary" />
                      <span>Basic Strategies (3)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} weight="fill" className="text-primary" />
                      <span>Community Features</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-50">
                      <span>×</span>
                      <span>Advanced Analytics</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" disabled>
                    CURRENT_PLAN
                  </Button>
                </div>

                <div className="cyber-card-accent p-6 space-y-4 relative">
                  <div className="absolute top-2 right-2 px-2 py-1 bg-accent/20 border border-accent/40">
                    <span className="text-xs font-bold text-accent uppercase">POPULAR</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold uppercase mb-2">PRO</h4>
                    <p className="text-3xl font-bold text-accent">$9.99</p>
                    <p className="data-label">PER_MONTH</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} weight="fill" className="text-primary" />
                      <span>Everything in Free</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} weight="fill" className="text-primary" />
                      <span>Advanced Analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} weight="fill" className="text-primary" />
                      <span>10 Premium Strategies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} weight="fill" className="text-primary" />
                      <span>Unlimited Trades</span>
                    </div>
                  </div>
                  <Button className="w-full">
                    UPGRADE_TO_PRO
                  </Button>
                </div>

                <div className="cyber-card p-6 space-y-4">
                  <div>
                    <h4 className="text-2xl font-bold uppercase mb-2">PRO+</h4>
                    <p className="text-3xl font-bold text-secondary">$19.99</p>
                    <p className="data-label">PER_MONTH</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} weight="fill" className="text-primary" />
                      <span>Everything in Pro</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} weight="fill" className="text-primary" />
                      <span>AI Trading Assistant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} weight="fill" className="text-primary" />
                      <span>Copy Trading</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} weight="fill" className="text-primary" />
                      <span>Backtesting</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full border-secondary text-secondary hover:bg-secondary/10">
                    UPGRADE_TO_PRO+
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
