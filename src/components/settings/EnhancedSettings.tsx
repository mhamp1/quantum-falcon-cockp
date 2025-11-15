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
  SquaresFour, ChartLineUp, BellRinging, MoonStars, SunDim
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

  if (!profile || !settings || !settings.audio || !settings.notifications || !settings.trading || !settings.security || !settings.network || !settings.display || !settings.theme) {
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
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/20 border border-primary/40 jagged-corner-small">
                    <Bell size={24} weight="duotone" className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-[0.15em] hud-text text-primary">NOTIFICATIONS</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">ALERT_SYSTEM</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all group/item">
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
                  
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all group/item">
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
                  
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all group/item">
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

                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all group/item">
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

            <div className="glass-morph-card p-6 space-y-6 relative overflow-hidden group hover:shadow-[0_0_40px_oklch(0.72_0.20_195_/_0.3)] transition-all duration-500">
              <div className="absolute inset-0 grid-background opacity-5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 blur-3xl rounded-full" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-accent/20 border border-accent/40 jagged-corner-small">
                    <SpeakerHigh size={24} weight="duotone" className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-[0.15em] hud-text text-accent">AUDIO_SYSTEM</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">SOUND_CONFIG</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-accent/20 hover:border-accent/40 transition-all group/item">
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
                  
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-accent/20 hover:border-accent/40 transition-all group/item">
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
                  
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-accent/20 hover:border-accent/40 transition-all group/item">
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

                  <div className="p-4 bg-background/40 backdrop-blur-sm border border-accent/20 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold uppercase text-xs tracking-wider">VOLUME</Label>
                      <span className="text-accent font-bold text-sm">{settings.audio?.volume ?? 70}%</span>
                    </div>
                    <Input 
                      type="range"
                      min="0"
                      max="100"
                      value={settings.audio?.volume ?? 70}
                      onChange={(e) => handleUpdateSetting(['audio', 'volume'], Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-morph-card p-6 space-y-6 relative overflow-hidden group hover:shadow-[0_0_40px_oklch(0.68_0.18_330_/_0.3)] transition-all duration-500">
              <div className="absolute inset-0 technical-grid opacity-5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 blur-3xl rounded-full" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-secondary/20 border border-secondary/40 jagged-corner-small">
                    <ChartLine size={24} weight="duotone" className="text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-[0.15em] hud-text text-secondary">TRADING_CONFIG</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">EXECUTION_SETTINGS</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-secondary/20 hover:border-secondary/40 transition-all group/item">
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
                  
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-secondary/20 hover:border-secondary/40 transition-all group/item">
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

                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-secondary/20 hover:border-secondary/40 transition-all group/item">
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
                  
                  <div className="p-4 bg-background/40 backdrop-blur-sm border border-secondary/20 space-y-2">
                    <Label className="font-bold uppercase text-xs tracking-wider">DEFAULT_AMOUNT</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="number"
                        value={settings.trading?.defaultAmount ?? 100}
                        onChange={(e) => handleUpdateSetting(['trading', 'defaultAmount'], Number(e.target.value))}
                        className="flex-1 bg-background/60"
                      />
                      <span className="text-secondary font-bold text-sm">SOL</span>
                    </div>
                  </div>

                  <div className="p-4 bg-background/40 backdrop-blur-sm border border-secondary/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="font-bold uppercase text-xs tracking-wider">SLIPPAGE</Label>
                      <span className="text-secondary font-bold text-sm">{settings.trading?.slippage ?? 1.0}%</span>
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
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-morph-card p-6 space-y-6 relative overflow-hidden group hover:shadow-[0_0_40px_oklch(0.65_0.25_25_/_0.3)] transition-all duration-500">
              <div className="absolute inset-0 diagonal-stripes opacity-5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 blur-3xl rounded-full" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-destructive/20 border border-destructive/40 jagged-corner-small">
                    <Lock size={24} weight="duotone" className="text-destructive" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-[0.15em] hud-text text-destructive">SECURITY</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">PROTECTION_LAYER</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-destructive/20 hover:border-destructive/40 transition-all group/item">
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
                  
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-destructive/20 hover:border-destructive/40 transition-all group/item">
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

                  <div className="p-4 bg-background/40 backdrop-blur-sm border border-destructive/20 space-y-2">
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

                  <div className="p-4 bg-background/40 backdrop-blur-sm border border-destructive/20 space-y-2">
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
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-primary/20 border border-primary/40 jagged-corner-small">
                    <WifiHigh size={24} weight="duotone" className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-[0.15em] hud-text text-primary">NETWORK</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">RPC_CONFIG</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="p-4 bg-background/40 backdrop-blur-sm border border-primary/20 space-y-2">
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
                    <div className="p-4 bg-background/40 backdrop-blur-sm border border-primary/20 space-y-2">
                      <Label className="font-bold uppercase text-xs tracking-wider">CUSTOM_ENDPOINT</Label>
                      <Input 
                        type="text"
                        placeholder="https://..."
                        value={settings.network?.customEndpoint ?? ''}
                        onChange={(e) => handleUpdateSetting(['network', 'customEndpoint'], e.target.value)}
                        className="bg-background/60"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-primary/20 hover:border-primary/40 transition-all group/item">
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

                  <div className="p-4 bg-primary/10 border border-primary/30 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="status-indicator" style={{ width: '6px', height: '6px' }} />
                      <span className="hud-readout text-[10px]">CONNECTION_ACTIVE</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Connected to Solana {settings.network?.rpcEndpoint ?? 'mainnet'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-morph-card p-6 space-y-6 relative overflow-hidden group hover:shadow-[0_0_40px_oklch(0.68_0.18_330_/_0.3)] transition-all duration-500">
              <div className="absolute inset-0 technical-grid opacity-5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 blur-3xl rounded-full" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-accent/20 border border-accent/40 jagged-corner-small">
                    <SquaresFour size={24} weight="duotone" className="text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold uppercase tracking-[0.15em] hud-text text-accent">DISPLAY</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">UI_PREFERENCES</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-accent/20 hover:border-accent/40 transition-all group/item">
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

                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-accent/20 hover:border-accent/40 transition-all group/item">
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

                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-accent/20 hover:border-accent/40 transition-all group/item">
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

                  <div className="flex items-center justify-between p-4 bg-background/40 backdrop-blur-sm border border-accent/20 hover:border-accent/40 transition-all group/item">
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

                  <div className="p-4 bg-background/40 backdrop-blur-sm border border-accent/20 space-y-2">
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

                  <div className="p-4 bg-background/40 backdrop-blur-sm border border-accent/20 space-y-2">
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
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-[0.2em] hud-text text-primary mb-2">SYSTEM_STATUS</h3>
                <p className="text-sm text-muted-foreground">All systems operational • Last updated: {new Date().toLocaleTimeString()}</p>
              </div>
              <Button 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/10"
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
              </Button>
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
