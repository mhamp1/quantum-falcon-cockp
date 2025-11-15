import { useKV } from '@github/spark/hooks'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  User, Trophy, GraduationCap, Gear, Bell, Palette, Lock,
  CurrencyDollar, SpeakerHigh, Shield, ChartLine, Medal, Star,
  Fire, Target, CheckCircle, Crown, ArrowsClockwise, Lightning, 
  Wallet, CloudArrowUp, Database, Key, LinkSimple, WifiHigh, Cpu,
  SquaresFour, ChartLineUp, BellRinging, MoonStars, SunDim, Users
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
    pushEnabled: boolean
  }
  theme: {
    darkMode: boolean
    colorScheme: string
    animations: boolean
    glassEffect: boolean
  }
  currency: string
  audio: {
    soundEffects: boolean
    ambientMusic: boolean
    voiceNarration: boolean
    volume: number
  }
  trading: {
    paperMode: boolean
    defaultAmount: number
    confirmTrades: boolean
    autoCompound: boolean
    slippage: number
  }
  security: {
    biometric: boolean
    twoFactor: boolean
    autoLogout: number
    sessionTimeout: number
  }
  network: {
    rpcEndpoint: string
    priorityFees: boolean
    customEndpoint: string
  }
  display: {
    compactMode: boolean
    showBalances: boolean
    chartType: string
    refreshRate: number
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
      forumReplies: false,
      pushEnabled: true
    },
    theme: {
      darkMode: true,
      colorScheme: 'solana-cyber',
      animations: true,
      glassEffect: true
    },
    currency: 'USD',
    audio: {
      soundEffects: true,
      ambientMusic: false,
      voiceNarration: false,
      volume: 70
    },
    trading: {
      paperMode: true,
      defaultAmount: 100,
      confirmTrades: true,
      autoCompound: false,
      slippage: 1.0
    },
    security: {
      biometric: true,
      twoFactor: false,
      autoLogout: 5,
      sessionTimeout: 30
    },
    network: {
      rpcEndpoint: 'mainnet',
      priorityFees: true,
      customEndpoint: ''
    },
    display: {
      compactMode: false,
      showBalances: true,
      chartType: 'candlestick',
      refreshRate: 5
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
    setSettings((current) => {
      const base = current || {
        notifications: { tradeAlerts: true, priceAlerts: true, forumReplies: false, pushEnabled: true },
        theme: { darkMode: true, colorScheme: 'solana-cyber', animations: true, glassEffect: true },
        currency: 'USD',
        audio: { soundEffects: true, ambientMusic: false, voiceNarration: false, volume: 70 },
        trading: { paperMode: true, defaultAmount: 100, confirmTrades: true, autoCompound: false, slippage: 1.0 },
        security: { biometric: true, twoFactor: false, autoLogout: 5, sessionTimeout: 30 },
        network: { rpcEndpoint: 'mainnet', priorityFees: true, customEndpoint: '' },
        display: { compactMode: false, showBalances: true, chartType: 'candlestick', refreshRate: 5 }
      }
      const updated = { ...base }
      let obj: any = updated
      
      for (let i = 0; i < path.length - 1; i++) {
        if (!obj[path[i]]) {
          obj[path[i]] = {}
        }
        obj = obj[path[i]]
      }
      obj[path[path.length - 1]] = value
      
      return updated
    })
    toast.success('Setting updated')
  }

  if (!profile || !settings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="inline-flex p-4 bg-primary/20 border-2 border-primary jagged-corner">
            <Gear size={48} weight="duotone" className="text-primary animate-pulse" />
          </div>
          <p className="data-label">LOADING_SETTINGS...</p>
        </div>
      </div>
    )
  }

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-morph-card p-6 space-y-6 relative overflow-hidden group hover:shadow-[0_0_40px_oklch(0.72_0.20_195_/_0.3)] transition-all duration-500">
              <div className="absolute inset-0 grid-background opacity-5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 blur-3xl rounded-full" />
              
              <svg className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" style={{ zIndex: 1 }}>
                <line x1="0" y1="20" x2="100%" y2="20" className="circuit-line" />
                <line x1="20" y1="0" x2="20" y2="100%" className="circuit-line" />
                <circle cx="20" cy="20" r="3" fill="var(--primary)" className="animate-pulse" />
              </svg>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/20 border border-primary/40 jagged-corner-small relative">
                    <Bell size={24} weight="duotone" className="text-primary" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-[0.15em] hud-text text-primary">NOTIFICATIONS</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">ALERT_SYSTEM</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <div className="w-1 h-1 bg-primary rounded-full" />
                    <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                    <div className="w-1 h-1 bg-primary rounded-full" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all group/item relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50 group-hover/item:w-2 transition-all" />
                    <div className="flex items-center gap-3">
                      <Lightning size={18} weight="duotone" className="text-primary" />
                      <div>
                        <Label className="font-bold uppercase text-xs tracking-wider cursor-pointer">TRADE_ALERTS</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Real-time trade notifications</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.notifications?.tradeAlerts ?? true}
                      onCheckedChange={(v) => handleUpdateSetting(['notifications', 'tradeAlerts'], v)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all group/item relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50 group-hover/item:w-2 transition-all" />
                    <div className="flex items-center gap-3">
                      <ChartLineUp size={18} weight="duotone" className="text-primary" />
                      <div>
                        <Label className="font-bold uppercase text-xs tracking-wider cursor-pointer">PRICE_ALERTS</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Market price movements</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.notifications?.priceAlerts ?? true}
                      onCheckedChange={(v) => handleUpdateSetting(['notifications', 'priceAlerts'], v)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all group/item relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50 group-hover/item:w-2 transition-all" />
                    <div className="flex items-center gap-3">
                      <BellRinging size={18} weight="duotone" className="text-primary" />
                      <div>
                        <Label className="font-bold uppercase text-xs tracking-wider cursor-pointer">PUSH_ENABLED</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Browser notifications</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.notifications?.pushEnabled ?? true}
                      onCheckedChange={(v) => handleUpdateSetting(['notifications', 'pushEnabled'], v)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all group/item relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50 group-hover/item:w-2 transition-all" />
                    <div className="flex items-center gap-3">
                      <User size={18} weight="duotone" className="text-primary" />
                      <div>
                        <Label className="font-bold uppercase text-xs tracking-wider cursor-pointer">FORUM_REPLIES</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Community interactions</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.notifications?.forumReplies ?? false}
                      onCheckedChange={(v) => handleUpdateSetting(['notifications', 'forumReplies'], v)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-morph-card p-6 space-y-6 relative overflow-hidden group hover:shadow-[0_0_40px_oklch(0.68_0.18_330_/_0.3)] transition-all duration-500">
              <div className="absolute inset-0 grid-background opacity-5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 blur-3xl rounded-full" />
              
              <svg className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none" style={{ zIndex: 1 }}>
                <line x1="100%" y1="20" x2="0" y2="20" className="circuit-line" strokeDasharray="3,3" />
                <line x1="calc(100% - 20px)" y1="0" x2="calc(100% - 20px)" y2="100%" className="circuit-line" strokeDasharray="3,3" />
                <circle cx="calc(100% - 20px)" cy="20" r="3" fill="var(--accent)" className="animate-pulse" />
              </svg>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-accent/20 border border-accent/40 jagged-corner-small relative">
                    <SpeakerHigh size={24} weight="duotone" className="text-accent" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-[0.15em] hud-text text-accent">AUDIO_SYSTEM</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">SOUND_CONFIG</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <div className="w-1 h-3 bg-accent/40 rounded" />
                    <div className="w-1 h-5 bg-accent/60 rounded" />
                    <div className="w-1 h-4 bg-accent/50 rounded animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-accent/20 hover:border-accent/40 transition-all group/item relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/50 group-hover/item:w-2 transition-all" />
                    <div className="flex items-center gap-3">
                      <Lightning size={18} weight="duotone" className="text-accent" />
                      <div>
                        <Label className="font-bold uppercase text-xs tracking-wider cursor-pointer">SOUND_EFFECTS</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">UI interaction sounds</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.audio?.soundEffects ?? true}
                      onCheckedChange={(v) => handleUpdateSetting(['audio', 'soundEffects'], v)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-accent/20 hover:border-accent/40 transition-all group/item relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/50 group-hover/item:w-2 transition-all" />
                    <div className="flex items-center gap-3">
                      <SpeakerHigh size={18} weight="duotone" className="text-accent" />
                      <div>
                        <Label className="font-bold uppercase text-xs tracking-wider cursor-pointer">AMBIENT_MUSIC</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Background audio</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.audio?.ambientMusic ?? false}
                      onCheckedChange={(v) => handleUpdateSetting(['audio', 'ambientMusic'], v)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-accent/20 hover:border-accent/40 transition-all group/item relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/50 group-hover/item:w-2 transition-all" />
                    <div className="flex items-center gap-3">
                      <User size={18} weight="duotone" className="text-accent" />
                      <div>
                        <Label className="font-bold uppercase text-xs tracking-wider cursor-pointer">VOICE_NARRATION</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">AI voice assistant</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.audio?.voiceNarration ?? false}
                      onCheckedChange={(v) => handleUpdateSetting(['audio', 'voiceNarration'], v)}
                    />
                  </div>

                  <div className="p-4 bg-background/40 backdrop-blur-sm border border-accent/20 space-y-3 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                    <div className="flex items-center justify-between">
                      <Label className="font-bold uppercase text-xs tracking-wider">VOLUME</Label>
                      <span className="text-accent font-bold text-sm tabular-nums">{settings.audio?.volume ?? 70}%</span>
                    </div>
                    <Input 
                      type="range"
                      min="0"
                      max="100"
                      value={settings.audio?.volume ?? 70}
                      onChange={(e) => handleUpdateSetting(['audio', 'volume'], Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground uppercase tracking-wider">
                      <span>MUTE</span>
                      <span>MAX</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-morph-card p-6 space-y-6 relative overflow-hidden group hover:shadow-[0_0_40px_oklch(0.68_0.18_330_/_0.3)] transition-all duration-500">
              <div className="absolute inset-0 technical-grid opacity-5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 blur-3xl rounded-full" />
              
              <svg className="absolute bottom-0 left-0 w-full h-full opacity-20 pointer-events-none" style={{ zIndex: 1 }}>
                <path d="M 0 100%, L 60 100%, L 60 60, L 100% 60" stroke="var(--secondary)" strokeWidth="2" fill="none" strokeDasharray="5,5" className="circuit-line" />
                <circle cx="60" cy="60" r="4" fill="var(--secondary)" className="animate-pulse" />
              </svg>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-secondary/20 border border-secondary/40 jagged-corner-small relative">
                    <ChartLine size={24} weight="duotone" className="text-secondary" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-[0.15em] hud-text text-secondary">TRADING_CONFIG</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">EXECUTION_SETTINGS</p>
                  </div>
                  <div className="ml-auto px-2 py-1 bg-secondary/10 border border-secondary/30">
                    <span className="text-[9px] font-bold text-secondary tracking-wider">ACTIVE</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-secondary/20 hover:border-secondary/40 transition-all group/item relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary/50 group-hover/item:w-2 transition-all" />
                    <div className="flex items-center gap-3">
                      <Database size={18} weight="duotone" className="text-secondary" />
                      <div>
                        <Label className="font-bold uppercase text-xs tracking-wider cursor-pointer">PAPER_MODE</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Simulated trading</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.trading?.paperMode ?? true}
                      onCheckedChange={(v) => handleUpdateSetting(['trading', 'paperMode'], v)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-secondary/20 hover:border-secondary/40 transition-all group/item relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary/50 group-hover/item:w-2 transition-all" />
                    <div className="flex items-center gap-3">
                      <Shield size={18} weight="duotone" className="text-secondary" />
                      <div>
                        <Label className="font-bold uppercase text-xs tracking-wider cursor-pointer">CONFIRM_TRADES</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Require confirmation</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.trading?.confirmTrades ?? true}
                      onCheckedChange={(v) => handleUpdateSetting(['trading', 'confirmTrades'], v)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-secondary/20 hover:border-secondary/40 transition-all group/item relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary/50 group-hover/item:w-2 transition-all" />
                    <div className="flex items-center gap-3">
                      <ArrowsClockwise size={18} weight="duotone" className="text-secondary" />
                      <div>
                        <Label className="font-bold uppercase text-xs tracking-wider cursor-pointer">AUTO_COMPOUND</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Reinvest profits</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.trading?.autoCompound ?? false}
                      onCheckedChange={(v) => handleUpdateSetting(['trading', 'autoCompound'], v)}
                    />
                  </div>
                  
                  <div className="p-4 bg-background/40 backdrop-blur-sm border border-secondary/20 space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
                    <Label className="font-bold uppercase text-xs tracking-wider">DEFAULT_AMOUNT</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number"
                        value={settings.trading?.defaultAmount ?? 100}
                        onChange={(e) => handleUpdateSetting(['trading', 'defaultAmount'], Number(e.target.value))}
                        className="flex-1 bg-background/60 tabular-nums"
                      />
                      <span className="text-secondary font-bold text-sm uppercase tracking-wider">SOL</span>
                    </div>
                  </div>

                  <div className="p-4 bg-background/40 backdrop-blur-sm border border-secondary/20 space-y-2 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
                    <div className="flex items-center justify-between">
                      <Label className="font-bold uppercase text-xs tracking-wider">SLIPPAGE</Label>
                      <span className="text-secondary font-bold text-sm tabular-nums">{settings.trading?.slippage ?? 1.0}%</span>
                    </div>
                    <Input 
                      type="range"
                      min="0.1"
                      max="5"
                      step="0.1"
                      value={settings.trading?.slippage ?? 1.0}
                      onChange={(e) => handleUpdateSetting(['trading', 'slippage'], Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-[9px] text-muted-foreground uppercase tracking-wider">
                      <span>0.1%</span>
                      <span>5.0%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-morph-card p-6 space-y-6 relative overflow-hidden group hover:shadow-[0_0_40px_oklch(0.65_0.25_25_/_0.3)] transition-all duration-500">
              <div className="absolute inset-0 diagonal-stripes opacity-5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 blur-3xl rounded-full" />
              
              <svg className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" style={{ zIndex: 1 }}>
                <rect x="10" y="10" width="30" height="30" stroke="var(--destructive)" strokeWidth="2" fill="none" strokeDasharray="4,4" className="circuit-line" />
                <circle cx="25" cy="25" r="5" fill="var(--destructive)" opacity="0.5" className="animate-pulse" />
              </svg>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-destructive/20 border border-destructive/40 jagged-corner-small relative">
                    <Lock size={24} weight="duotone" className="text-destructive" />
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-destructive rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-[0.15em] hud-text text-destructive">SECURITY</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">PROTECTION_LAYER</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <Shield size={16} weight="fill" className="text-destructive" />
                    <span className="text-[9px] font-bold text-destructive tracking-wider">SECURE</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-destructive/20 hover:border-destructive/40 transition-all group/item relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive/50 group-hover/item:w-2 transition-all" />
                    <div className="flex items-center gap-3">
                      <Key size={18} weight="duotone" className="text-destructive" />
                      <div>
                        <Label className="font-bold uppercase text-xs tracking-wider cursor-pointer">PIN/BIOMETRIC</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Device authentication</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.security?.biometric ?? true}
                      onCheckedChange={(v) => handleUpdateSetting(['security', 'biometric'], v)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-destructive/20 hover:border-destructive/40 transition-all group/item relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive/50 group-hover/item:w-2 transition-all" />
                    <div className="flex items-center gap-3">
                      <Shield size={18} weight="duotone" className="text-destructive" />
                      <div>
                        <Label className="font-bold uppercase text-xs tracking-wider cursor-pointer">TWO_FACTOR_AUTH</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">2FA protection</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.security?.twoFactor ?? false}
                      onCheckedChange={(v) => handleUpdateSetting(['security', 'twoFactor'], v)}
                    />
                  </div>

                  <div className="p-4 bg-background/40 backdrop-blur-sm border border-destructive/20 space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-destructive/50 to-transparent" />
                    <Label className="font-bold uppercase text-xs tracking-wider">AUTO_LOGOUT</Label>
                    <Select 
                      value={String(settings.security?.autoLogout ?? 5)}
                      onValueChange={(v) => handleUpdateSetting(['security', 'autoLogout'], Number(v))}
                    >
                      <SelectTrigger className="bg-background/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-background/40 backdrop-blur-sm border border-destructive/20 space-y-2 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-destructive/50 to-transparent" />
                    <Label className="font-bold uppercase text-xs tracking-wider">SESSION_TIMEOUT</Label>
                    <Select 
                      value={String(settings.security?.sessionTimeout ?? 30)}
                      onValueChange={(v) => handleUpdateSetting(['security', 'sessionTimeout'], Number(v))}
                    >
                      <SelectTrigger className="bg-background/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-morph-card p-6 space-y-6 relative overflow-hidden group hover:shadow-[0_0_40px_oklch(0.72_0.20_195_/_0.3)] transition-all duration-500">
              <div className="absolute inset-0 grid-background opacity-5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 blur-3xl rounded-full" />
              
              <svg className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" style={{ zIndex: 1 }}>
                <circle cx="50%" cy="50%" r="40" stroke="var(--primary)" strokeWidth="2" fill="none" strokeDasharray="6,6" className="circuit-line" />
                <circle cx="50%" cy="50%" r="3" fill="var(--primary)" className="animate-pulse" />
              </svg>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/20 border border-primary/40 jagged-corner-small relative">
                    <WifiHigh size={24} weight="duotone" className="text-primary" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-[0.15em] hud-text text-primary">NETWORK</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">RPC_CONFIG</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <div className="w-1 h-2 bg-primary/60 rounded" />
                    <div className="w-1 h-3 bg-primary/80 rounded" />
                    <div className="w-1 h-4 bg-primary rounded animate-pulse" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-background/40 backdrop-blur-sm border border-primary/20 space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    <Label className="font-bold uppercase text-xs tracking-wider">RPC_ENDPOINT</Label>
                    <Select 
                      value={settings.network?.rpcEndpoint ?? 'mainnet'}
                      onValueChange={(v) => handleUpdateSetting(['network', 'rpcEndpoint'], v)}
                    >
                      <SelectTrigger className="bg-background/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mainnet">Mainnet Beta</SelectItem>
                        <SelectItem value="devnet">Devnet</SelectItem>
                        <SelectItem value="testnet">Testnet</SelectItem>
                        <SelectItem value="custom">Custom RPC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {settings.network?.rpcEndpoint === 'custom' && (
                    <div className="p-4 bg-background/40 backdrop-blur-sm border border-primary/20 space-y-2 relative overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                      <Label className="font-bold uppercase text-xs tracking-wider">CUSTOM_ENDPOINT</Label>
                      <Input 
                        type="text"
                        placeholder="https://..."
                        value={settings.network?.customEndpoint ?? ''}
                        onChange={(e) => handleUpdateSetting(['network', 'customEndpoint'], e.target.value)}
                        className="bg-background/60 font-mono text-xs"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all group/item relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/50 group-hover/item:w-2 transition-all" />
                    <div className="flex items-center gap-3">
                      <Lightning size={18} weight="duotone" className="text-primary" />
                      <div>
                        <Label className="font-bold uppercase text-xs tracking-wider cursor-pointer">PRIORITY_FEES</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Faster transactions</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.network?.priorityFees ?? true}
                      onCheckedChange={(v) => handleUpdateSetting(['network', 'priorityFees'], v)}
                    />
                  </div>

                  <div className="p-4 bg-primary/10 border border-primary/30 space-y-2 relative overflow-hidden">
                    <div className="absolute inset-0 grid-background opacity-10" />
                    <div className="relative z-10 flex items-center gap-2">
                      <div className="status-indicator" style={{ width: '6px', height: '6px' }} />
                      <span className="hud-readout text-[10px]">CONNECTION_ACTIVE</span>
                    </div>
                    <p className="text-xs text-muted-foreground relative z-10">
                      Connected to Solana <span className="text-primary font-bold uppercase">{settings.network?.rpcEndpoint ?? 'mainnet'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-morph-card p-6 space-y-6 relative overflow-hidden group hover:shadow-[0_0_40px_oklch(0.68_0.18_330_/_0.3)] transition-all duration-500">
              <div className="absolute inset-0 technical-grid opacity-5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 blur-3xl rounded-full" />
              
              <svg className="absolute bottom-0 right-0 w-full h-full opacity-20 pointer-events-none" style={{ zIndex: 1 }}>
                <path d="M 100% 100%, L 80% 100%, L 80% 70%, L 50% 70%" stroke="var(--accent)" strokeWidth="2" fill="none" strokeDasharray="4,4" className="circuit-line" />
                <circle cx="50%" cy="70%" r="3" fill="var(--accent)" className="animate-pulse" />
              </svg>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-accent/20 border border-accent/40 jagged-corner-small relative">
                    <SquaresFour size={24} weight="duotone" className="text-accent" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '1.3s' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-[0.15em] hud-text text-accent">DISPLAY</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">UI_PREFERENCES</p>
                  </div>
                  <div className="ml-auto flex flex-col items-end gap-0.5">
                    <div className="w-8 h-px bg-accent/60" />
                    <div className="w-6 h-px bg-accent/40" />
                    <div className="w-4 h-px bg-accent/20" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-accent/20 hover:border-accent/40 transition-all group/item relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/50 group-hover/item:w-2 transition-all" />
                    <div className="flex items-center gap-3">
                      <SquaresFour size={18} weight="duotone" className="text-accent" />
                      <div>
                        <Label className="font-bold uppercase text-xs tracking-wider cursor-pointer">COMPACT_MODE</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Dense layout</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.display?.compactMode ?? false}
                      onCheckedChange={(v) => handleUpdateSetting(['display', 'compactMode'], v)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-accent/20 hover:border-accent/40 transition-all group/item relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/50 group-hover/item:w-2 transition-all" />
                    <div className="flex items-center gap-3">
                      <Wallet size={18} weight="duotone" className="text-accent" />
                      <div>
                        <Label className="font-bold uppercase text-xs tracking-wider cursor-pointer">SHOW_BALANCES</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Display portfolio value</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.display?.showBalances ?? true}
                      onCheckedChange={(v) => handleUpdateSetting(['display', 'showBalances'], v)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-accent/20 hover:border-accent/40 transition-all group/item relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/50 group-hover/item:w-2 transition-all" />
                    <div className="flex items-center gap-3">
                      <Palette size={18} weight="duotone" className="text-accent" />
                      <div>
                        <Label className="font-bold uppercase text-xs tracking-wider cursor-pointer">ANIMATIONS</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Motion effects</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.theme?.animations ?? true}
                      onCheckedChange={(v) => handleUpdateSetting(['theme', 'animations'], v)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-accent/20 hover:border-accent/40 transition-all group/item relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/50 group-hover/item:w-2 transition-all" />
                    <div className="flex items-center gap-3">
                      <Cpu size={18} weight="duotone" className="text-accent" />
                      <div>
                        <Label className="font-bold uppercase text-xs tracking-wider cursor-pointer">GLASS_EFFECT</Label>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Glassmorphism UI</p>
                      </div>
                    </div>
                    <Switch 
                      checked={settings.theme?.glassEffect ?? true}
                      onCheckedChange={(v) => handleUpdateSetting(['theme', 'glassEffect'], v)}
                    />
                  </div>

                  <div className="p-4 bg-background/40 backdrop-blur-sm border border-accent/20 space-y-2 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
                    <Label className="font-bold uppercase text-xs tracking-wider">CHART_TYPE</Label>
                    <Select 
                      value={settings.display?.chartType ?? 'candlestick'}
                      onValueChange={(v) => handleUpdateSetting(['display', 'chartType'], v)}
                    >
                      <SelectTrigger className="bg-background/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="candlestick">Candlestick</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                        <SelectItem value="area">Area Chart</SelectItem>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 bg-background/40 backdrop-blur-sm border border-accent/20 space-y-2 relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
                    <Label className="font-bold uppercase text-xs tracking-wider">REFRESH_RATE</Label>
                    <Select 
                      value={String(settings.display?.refreshRate ?? 5)}
                      onValueChange={(v) => handleUpdateSetting(['display', 'refreshRate'], Number(v))}
                    >
                      <SelectTrigger className="bg-background/60">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 second</SelectItem>
                        <SelectItem value="5">5 seconds</SelectItem>
                        <SelectItem value="10">10 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-morph-card p-6 relative overflow-hidden">
            <div className="absolute inset-0 grid-background opacity-5" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 blur-3xl rounded-full" />
            
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" style={{ zIndex: 1 }}>
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--primary)" strokeWidth="1" strokeDasharray="10,10" className="circuit-line" />
              <circle cx="20%" cy="50%" r="4" fill="var(--primary)" className="animate-pulse" />
              <circle cx="80%" cy="50%" r="4" fill="var(--accent)" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
            </svg>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/20 border border-primary/40">
                    <Cpu size={20} weight="duotone" className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-text text-primary">SYSTEM_STATUS</h3>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="status-indicator" style={{ width: '6px', height: '6px' }} />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">All systems operational</span>
                  </div>
                  <div className="h-3 w-px bg-border" />
                  <span className="text-xs text-muted-foreground">
                    Last updated: <span className="text-primary font-mono">{new Date().toLocaleTimeString()}</span>
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="px-2 py-1 bg-primary/10 border border-primary/30">
                    <span className="text-[9px] font-bold text-primary tracking-wider">CPU: 23%</span>
                  </div>
                  <div className="px-2 py-1 bg-accent/10 border border-accent/30">
                    <span className="text-[9px] font-bold text-accent tracking-wider">MEM: 45%</span>
                  </div>
                  <div className="px-2 py-1 bg-secondary/10 border border-secondary/30">
                    <span className="text-[9px] font-bold text-secondary tracking-wider">NET: 12ms</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/10 relative group"
                onClick={() => {
                  setSettings((current) => ({
                    ...current!,
                    notifications: { tradeAlerts: true, priceAlerts: true, forumReplies: false, pushEnabled: true },
                    theme: { darkMode: true, colorScheme: 'solana-cyber', animations: true, glassEffect: true },
                    currency: 'USD',
                    audio: { soundEffects: true, ambientMusic: false, voiceNarration: false, volume: 70 },
                    trading: { paperMode: true, defaultAmount: 100, confirmTrades: true, autoCompound: false, slippage: 1.0 },
                    security: { biometric: true, twoFactor: false, autoLogout: 5, sessionTimeout: 30 },
                    network: { rpcEndpoint: 'mainnet', priorityFees: true, customEndpoint: '' },
                    display: { compactMode: false, showBalances: true, chartType: 'candlestick', refreshRate: 5 }
                  }))
                  toast.success('Settings reset to defaults')
                }}
              >
                <ArrowsClockwise size={18} weight="duotone" className="mr-2" />
                RESET_TO_DEFAULTS
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <div className="glass-morph-card p-6 relative overflow-hidden">
            <div className="absolute inset-0 grid-background opacity-5" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/10 blur-3xl rounded-full" />
            
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 mb-4">
                  <Crown size={32} weight="duotone" className="text-accent neon-glow-accent" />
                  <h3 className="text-3xl font-bold uppercase tracking-[0.25em] hud-text text-accent">UNLOCK_FULL_POWER</h3>
                </div>
                <p className="text-muted-foreground max-w-2xl mx-auto text-sm uppercase tracking-wider">
                  Choose the perfect plan to accelerate your trading journey
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 jagged-corner-small">
                  <Lightning size={16} weight="fill" className="text-primary animate-pulse" />
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    Limited time: 30% off annual plans
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="cyber-card p-6 space-y-6 relative group hover:shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.2)] transition-all duration-500">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-2xl font-bold uppercase tracking-wider">STARTER</h4>
                      <div className="px-2 py-1 bg-muted/30 border border-muted/50">
                        <span className="text-[10px] font-bold uppercase tracking-wider">FREE</span>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl font-bold text-primary">$0</span>
                        <span className="text-muted-foreground text-sm uppercase tracking-wider">/month</span>
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Perfect to get started</p>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3">
                        <CheckCircle size={18} weight="fill" className="text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">Paper Trading Mode</p>
                          <p className="text-xs text-muted-foreground">Practice with virtual funds</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle size={18} weight="fill" className="text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">3 Basic Strategies</p>
                          <p className="text-xs text-muted-foreground">Pre-configured trading bots</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle size={18} weight="fill" className="text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">Community Access</p>
                          <p className="text-xs text-muted-foreground">Join the discussion</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle size={18} weight="fill" className="text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">Basic Analytics</p>
                          <p className="text-xs text-muted-foreground">Track your progress</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 opacity-40">
                        <div className="w-[18px] h-[18px] border-2 border-current rounded-full flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">Advanced AI Agents</p>
                          <p className="text-xs text-muted-foreground line-through">Upgrade to unlock</p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full border-primary/30 hover:bg-primary/5 relative group/btn"
                      disabled
                    >
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle size={16} weight="fill" />
                        <span className="font-bold uppercase tracking-wider">CURRENT_PLAN</span>
                      </div>
                    </Button>
                  </div>
                </div>

                <div className="glass-morph-card p-6 space-y-6 relative group hover:shadow-[0_0_50px_oklch(0.68_0.18_330_/_0.4)] transition-all duration-500 scale-105 md:scale-110">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full" />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-accent border-2 border-accent/60 jagged-corner-small z-20">
                    <div className="flex items-center gap-2">
                      <Star size={14} weight="fill" className="text-accent-foreground" />
                      <span className="text-xs font-bold text-accent-foreground uppercase tracking-wider">MOST POPULAR</span>
                      <Star size={14} weight="fill" className="text-accent-foreground" />
                    </div>
                  </div>
                  
                  <div className="relative z-10 pt-2">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-2xl font-bold uppercase tracking-wider text-accent neon-glow-accent">PRO</h4>
                      <div className="px-2 py-1 bg-accent/20 border border-accent/40 animate-pulse-glow">
                        <span className="text-[10px] font-bold text-accent uppercase tracking-wider">BEST VALUE</span>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-5xl font-bold text-accent">$45</span>
                      </div>
                      <p className="text-xs text-accent uppercase tracking-wider font-semibold">For serious traders</p>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3">
                        <CheckCircle size={18} weight="fill" className="text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-accent">Everything in Starter</p>
                          <p className="text-xs text-muted-foreground">Plus exclusive features</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle size={18} weight="fill" className="text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">Advanced Analytics Suite</p>
                          <p className="text-xs text-muted-foreground">Deep market insights & predictions</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle size={18} weight="fill" className="text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">10 Premium AI Strategies</p>
                          <p className="text-xs text-muted-foreground">Maximize profit potential</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle size={18} weight="fill" className="text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">Unlimited Trading Volume</p>
                          <p className="text-xs text-muted-foreground">No restrictions on trades</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle size={18} weight="fill" className="text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">Priority Support 24/7</p>
                          <p className="text-xs text-muted-foreground">Get help when you need it</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle size={18} weight="fill" className="text-accent flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">Real-time Alerts</p>
                          <p className="text-xs text-muted-foreground">Never miss an opportunity</p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground relative group/btn overflow-hidden border-2 border-accent/60"
                      onClick={() => toast.success('Redirecting to checkout...')}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000" />
                      <div className="flex items-center justify-center gap-2 relative z-10">
                        <Lightning size={18} weight="fill" />
                        <span className="font-bold uppercase tracking-wider">UPGRADE NOW</span>
                        <Fire size={18} weight="fill" />
                      </div>
                    </Button>
                    
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Shield size={14} weight="fill" className="text-accent" />
                      <span>30-day money-back guarantee</span>
                    </div>
                  </div>
                </div>

                <div className="cyber-card p-6 space-y-6 relative group hover:shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.2)] transition-all duration-500">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 blur-2xl rounded-full" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-2xl font-bold uppercase tracking-wider text-secondary">ELITE</h4>
                      <div className="px-2 py-1 bg-secondary/20 border border-secondary/40">
                        <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">PREMIUM</span>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl font-bold text-secondary">$19.99</span>
                        <span className="text-muted-foreground text-sm uppercase tracking-wider">/mo</span>
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">For professional traders</p>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3">
                        <Crown size={18} weight="fill" className="text-secondary flex-shrink-0 mt-0.5 neon-glow-secondary" />
                        <div>
                          <p className="text-sm font-bold text-secondary">Everything in Pro</p>
                          <p className="text-xs text-muted-foreground">Plus elite-level features</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle size={18} weight="fill" className="text-secondary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">AI Trading Assistant</p>
                          <p className="text-xs text-muted-foreground">Personal AI trading coach</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle size={18} weight="fill" className="text-secondary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">Advanced Copy Trading</p>
                          <p className="text-xs text-muted-foreground">Follow top traders</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle size={18} weight="fill" className="text-secondary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">Strategy Backtesting</p>
                          <p className="text-xs text-muted-foreground">Test before you trade</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle size={18} weight="fill" className="text-secondary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">Custom API Access</p>
                          <p className="text-xs text-muted-foreground">Build your own tools</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle size={18} weight="fill" className="text-secondary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold">White-glove Onboarding</p>
                          <p className="text-xs text-muted-foreground">Dedicated setup assistance</p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      variant="outline"
                      className="w-full border-secondary text-secondary hover:bg-secondary/10 relative group/btn"
                      onClick={() => toast.success('Redirecting to checkout...')}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Crown size={16} weight="fill" />
                        <span className="font-bold uppercase tracking-wider">GO ELITE</span>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="cyber-card p-6 relative overflow-hidden group hover:shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.2)] transition-all">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 blur-2xl rounded-full" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="p-3 bg-primary/20 border border-primary/40 jagged-corner-small flex-shrink-0">
                      <Shield size={24} weight="duotone" className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold uppercase tracking-wider text-sm mb-1">SECURE PAYMENTS</h4>
                      <p className="text-xs text-muted-foreground">Bank-level encryption & PCI compliance</p>
                    </div>
                  </div>
                </div>

                <div className="cyber-card p-6 relative overflow-hidden group hover:shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.2)] transition-all">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 blur-2xl rounded-full" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="p-3 bg-accent/20 border border-accent/40 jagged-corner-small flex-shrink-0">
                      <ArrowsClockwise size={24} weight="duotone" className="text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bold uppercase tracking-wider text-sm mb-1">CANCEL ANYTIME</h4>
                      <p className="text-xs text-muted-foreground">No questions asked, instant cancellation</p>
                    </div>
                  </div>
                </div>

                <div className="cyber-card p-6 relative overflow-hidden group hover:shadow-[0_0_20px_oklch(0.72_0.20_195_/_0.2)] transition-all">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-secondary/5 blur-2xl rounded-full" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="p-3 bg-secondary/20 border border-secondary/40 jagged-corner-small flex-shrink-0">
                      <Users size={24} weight="duotone" className="text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-bold uppercase tracking-wider text-sm mb-1">10K+ USERS</h4>
                      <p className="text-xs text-muted-foreground">Join thousands of successful traders</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 glass-morph-card p-6 relative overflow-hidden">
                <div className="absolute inset-0 diagonal-stripes opacity-5" />
                <div className="relative z-10 text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Star size={20} weight="fill" className="text-accent" />
                    <Star size={20} weight="fill" className="text-accent" />
                    <Star size={20} weight="fill" className="text-accent" />
                    <Star size={20} weight="fill" className="text-accent" />
                    <Star size={20} weight="fill" className="text-accent" />
                  </div>
                  <p className="text-sm text-muted-foreground italic mb-2">
                    "Upgraded to Pro and my trading results improved by 45% in the first month. The AI strategies are game-changing!"
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 bg-primary/20 border border-primary/40 rounded-full flex items-center justify-center">
                      <User size={16} weight="duotone" className="text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold uppercase tracking-wider">Sarah M.</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">PRO Member Since Jan 2024</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-6 flex-wrap text-xs text-muted-foreground uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} weight="fill" className="text-primary" />
                  <span>No Hidden Fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} weight="fill" className="text-primary" />
                  <span>Instant Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} weight="fill" className="text-primary" />
                  <span>Free Trial Available</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
