// QUANTUM FALCON SETTINGS — REBUILT FROM SCRATCH
// November 24, 2025 — Complete rebuild for better organization and performance
// All functionality preserved, enhanced UX and structure

import { useKVSafe } from '@/hooks/useKVFallback'
import { useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Wallet, CloudArrowUp, Database, LinkSimple, WifiHigh, Cpu,
  SquaresFour, ChartLineUp, BellRinging, MoonStars, SunDim, Users, Scales, SignOut, ClockClockwise, Key
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import ProfileUpload from '@/components/shared/ProfileUpload'
import EditProfileDialog from '@/components/shared/EditProfileDialog'
import SubscriptionTiersWithStrategies from './SubscriptionTiersWithStrategies'
import APIIntegration from './APIIntegration'
import LegalSection from './LegalSection'
import SettingsSearchBar from './SettingsSearchBar'
import ChangeLog from './ChangeLog'
import DeviceManagement from './DeviceManagement'
import SecuritySettings from './SecuritySettings'
import DiscordIntegration from './DiscordIntegration'
import LicenseTab from './LicenseTab'
import ProfileNFTGallery from '@/components/shared/ProfileNFTGallery'
import RentalManagement from './RentalManagement'
import { UserAuth } from '@/lib/auth'
import { logSettingChange } from '@/lib/changeLogger'
import { debounce } from '@/lib/debounce'
import { soundEffects } from '@/lib/soundEffects'
import { createRobustLazy } from '@/lib/lazyLoad'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const AchievementBadges = createRobustLazy(() => import('@/components/shared/AchievementBadges'))
const ArenaAchievements = createRobustLazy(() => import('@/components/shared/ArenaAchievements'))
const StrategyAnalysisDashboard = createRobustLazy(() => import('@/components/shared/StrategyAnalysisDashboard'))

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
    neonGlow: boolean
    themeStyle: 'default' | 'matrix' | 'synthwave'
    highContrast: boolean
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
    eliteMode?: boolean
  }
}

export default function EnhancedSettings() {
  const [profile, setProfile] = useKVSafe<UserProfile>('user-profile-full', {
    username: 'QuantumTrader',
    email: 'trader@quantumfalcon.ai',
    level: 15,
    xp: 3450,
    xpToNextLevel: 5000,
    totalTrades: 234,
    winRate: 68.5,
    memberSince: 'Jan 2024'
  })

  const [auth, setAuth] = useKVSafe<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })

  const [showEditProfile, setShowEditProfile] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    const handleOpenSettingsLegalTab = () => {
      setActiveTab('legal')
      setTimeout(() => {
        const riskDisclosureEvent = new CustomEvent('open-risk-disclosure-modal')
        window.dispatchEvent(riskDisclosureEvent)
      }, 150)
    }

    const handleOpenSettingsCommunityTab = () => {
      setActiveTab('community')
    }

    const handleOpenSettingsApiTab = () => {
      setActiveTab('api')
    }

    const handleOpenSettingsRiskTab = () => {
      setActiveTab('app')
    }

    window.addEventListener('open-settings-legal-tab', handleOpenSettingsLegalTab)
    window.addEventListener('open-settings-community-tab', handleOpenSettingsCommunityTab)
    window.addEventListener('open-settings-api-tab', handleOpenSettingsApiTab)
    window.addEventListener('open-settings-risk-tab', handleOpenSettingsRiskTab)
    
    return () => {
      window.removeEventListener('open-settings-legal-tab', handleOpenSettingsLegalTab)
      window.removeEventListener('open-settings-community-tab', handleOpenSettingsCommunityTab)
      window.removeEventListener('open-settings-api-tab', handleOpenSettingsApiTab)
      window.removeEventListener('open-settings-risk-tab', handleOpenSettingsRiskTab)
    }
  }, [])

  const handleLogout = () => {
    setAuth({
      isAuthenticated: false,
      userId: null,
      username: null,
      email: null,
      avatar: null,
      license: null
    })
    toast.success('Logged out successfully')
    window.location.reload()
  }

  const [settings, setSettings] = useKVSafe<AppSettings>('app-settings', {
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
      glassEffect: true,
      neonGlow: true,
      themeStyle: 'default',
      highContrast: false
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

  useEffect(() => {
    if (settings?.theme) {
      if (settings.theme.darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      
      if (settings.theme.themeStyle) {
        document.documentElement.classList.remove('default', 'matrix', 'synthwave')
        document.documentElement.classList.add(settings.theme.themeStyle)
      }
      
      if (settings.theme.highContrast) {
        document.documentElement.classList.add('high-contrast')
      } else {
        document.documentElement.classList.remove('high-contrast')
      }
      
      if (!settings.theme.animations) {
        document.documentElement.style.setProperty('--animate-duration', '0s')
      } else {
        document.documentElement.style.removeProperty('--animate-duration')
      }
    }
  }, [settings?.theme])

  useEffect(() => {
    if (settings?.audio) {
      soundEffects.setMuted(!settings.audio.soundEffects);
    }
  }, [settings?.audio?.soundEffects]);

  useEffect(() => {
    if (settings?.display) {
      if (settings.display.eliteMode) {
        document.documentElement.classList.add('elite-mode')
      } else {
        document.documentElement.classList.remove('elite-mode')
      }
      
      if (settings.display.compactMode) {
        document.documentElement.classList.add('compact-mode')
      } else {
        document.documentElement.classList.remove('compact-mode')
      }
    }
  }, [settings?.display])

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

  const [isSaving, setIsSaving] = useState<{ [key: string]: boolean }>({})

  const debouncedUpdate = useCallback(
    debounce((path: string[], value: any) => {
      handleUpdateSetting(path, value)
    }, 300),
    []
  )

  const handleSliderChange = (path: string[], value: any, immediate = false) => {
    setSettings((current) => {
      const base = current || {
        notifications: { tradeAlerts: true, priceAlerts: true, forumReplies: false, pushEnabled: true },
        theme: { darkMode: true, colorScheme: 'solana-cyber', animations: true, glassEffect: true, neonGlow: true, themeStyle: 'default' as const, highContrast: false },
        currency: 'USD',
        audio: { soundEffects: true, ambientMusic: false, voiceNarration: false, volume: 70 },
        trading: { paperMode: true, defaultAmount: 100, confirmTrades: true, autoCompound: false, slippage: 1.0 },
        security: { biometric: true, twoFactor: false, autoLogout: 5, sessionTimeout: 30 },
        network: { rpcEndpoint: 'mainnet', priorityFees: true, customEndpoint: '' },
        display: { compactMode: false, showBalances: true, chartType: 'candlestick', refreshRate: 5, eliteMode: false }
      }
      const updated = { ...base }
      let obj: any = updated
      for (let i = 0; i < path.length - 1; i++) {
        if (!obj[path[i]]) obj[path[i]] = {}
        obj = obj[path[i]]
      }
      obj[path[path.length - 1]] = value
      return updated
    })

    if (immediate) {
      handleUpdateSetting(path, value)
    } else {
      debouncedUpdate(path, value)
    }
  }

  const handleUpdateSetting = (path: string[], value: any) => {
    const settingKey = path.join('.')
    setIsSaving(prev => ({ ...prev, [settingKey]: true }))
    
    logSettingChange(settingKey, value)
    
    setTimeout(() => {
      setIsSaving(prev => ({ ...prev, [settingKey]: false }))
      toast.success('Setting saved', { duration: 1500 })
    }, 500)
  }

  const handleSearchResultSelect = (tabId: string, sectionId: string) => {
    setActiveTab(tabId)
    setTimeout(() => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element.classList.add('animate-pulse')
        setTimeout(() => element.classList.remove('animate-pulse'), 2000)
      }
    }, 100)
  }

  const userTier = auth?.license?.tier || 'Free'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 diagonal-stripes opacity-5" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 via-accent/20 to-transparent blur-3xl" />
        
        <div className="relative z-10 cyber-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Gear size={40} weight="duotone" className="text-primary neon-glow-primary" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-[0.2em] text-primary">
                  SETTINGS
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure your Quantum Falcon experience
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-accent/20 border-2 border-accent text-accent uppercase tracking-wider">
                <Crown size={14} weight="fill" className="mr-1" />
                {userTier} Tier
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <SignOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <SettingsSearchBar onResultSelect={handleSearchResultSelect} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 md:grid-cols-15 bg-card/50 backdrop-blur-sm border-2 border-primary/30 p-1 gap-1 flex-wrap">
          <TabsTrigger value="profile" className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary jagged-corner-small transition-all">
            <User size={14} weight="duotone" className="mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="achievements" className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400 data-[state=active]:border-2 data-[state=active]:border-yellow-500 jagged-corner-small transition-all">
            <Trophy size={14} weight="duotone" className="mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="nfts" className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 data-[state=active]:border-2 data-[state=active]:border-purple-500 jagged-corner-small transition-all">
            <SquaresFour size={14} weight="duotone" className="mr-2" />
            NFTs
          </TabsTrigger>
          <TabsTrigger value="arena" className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 data-[state=active]:border-2 data-[state=active]:border-red-500 jagged-corner-small transition-all">
            <Lightning size={14} weight="duotone" className="mr-2" />
            Arena
          </TabsTrigger>
          <TabsTrigger value="analysis" className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 data-[state=active]:border-2 data-[state=active]:border-blue-500 jagged-corner-small transition-all">
            <ChartLineUp size={14} weight="duotone" className="mr-2" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="security" className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-2 data-[state=active]:border-green-500 jagged-corner-small transition-all">
            <Shield size={14} weight="duotone" className="mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="devices" className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 data-[state=active]:border-2 data-[state=active]:border-cyan-500 jagged-corner-small transition-all">
            <Users size={14} weight="duotone" className="mr-2" />
            Devices
          </TabsTrigger>
          <TabsTrigger value="community" className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-pink-500/20 data-[state=active]:text-pink-400 data-[state=active]:border-2 data-[state=active]:border-pink-500 jagged-corner-small transition-all">
            <Users size={14} weight="duotone" className="mr-2" />
            Community
          </TabsTrigger>
          <TabsTrigger value="subscription" className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-accent/20 data-[state=active]:text-accent data-[state=active]:border-2 data-[state=active]:border-accent jagged-corner-small transition-all">
            <Crown size={14} weight="duotone" className="mr-2" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="license" className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary jagged-corner-small transition-all">
            <Key size={14} weight="duotone" className="mr-2" />
            License
          </TabsTrigger>
          <TabsTrigger value="api" className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 data-[state=active]:border-2 data-[state=active]:border-orange-500 jagged-corner-small transition-all">
            <LinkSimple size={14} weight="duotone" className="mr-2" />
            API
          </TabsTrigger>
          <TabsTrigger value="rentals" className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 data-[state=active]:border-2 data-[state=active]:border-purple-500 jagged-corner-small transition-all">
            <ClockClockwise size={14} weight="duotone" className="mr-2" />
            Rentals
          </TabsTrigger>
          <TabsTrigger value="app" className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:border-2 data-[state=active]:border-primary jagged-corner-small transition-all">
            <Gear size={14} weight="duotone" className="mr-2" />
            App
          </TabsTrigger>
          <TabsTrigger value="changelog" className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-secondary/20 data-[state=active]:text-secondary data-[state=active]:border-2 data-[state=active]:border-secondary jagged-corner-small transition-all">
            <ClockClockwise size={14} weight="duotone" className="mr-2" />
            Changelog
          </TabsTrigger>
          <TabsTrigger value="legal" className="uppercase tracking-[0.12em] font-bold text-xs data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 data-[state=active]:border-2 data-[state=active]:border-red-500 jagged-corner-small transition-all">
            <Scales size={14} weight="duotone" className="mr-2" />
            Legal
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="cyber-card p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <ProfileUpload size="xl" showUploadButton={true} />
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold uppercase tracking-wide mb-1">@{profile.username}</h3>
                  <p className="text-muted-foreground">{profile.email}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">XP</div>
                    <div className="text-2xl font-bold">{profile.xp} / {profile.xpToNextLevel}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">XP Progress</span>
                    <span className="font-bold">{Math.round((profile.xp / profile.xpToNextLevel) * 100)}%</span>
                  </div>
                  <Progress value={(profile.xp / profile.xpToNextLevel) * 100} className="h-2" />
                </div>

                <Button
                  onClick={() => setShowEditProfile(true)}
                  className="w-full md:w-auto uppercase tracking-wider"
                >
                  <User size={16} className="mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* NFTs Tab */}
        <TabsContent value="nfts" className="space-y-6">
          <ProfileNFTGallery />
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Suspense fallback={<div className="cyber-card p-12 text-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
            <AchievementBadges />
          </Suspense>
        </TabsContent>

        {/* Arena Tab */}
        <TabsContent value="arena" className="space-y-6">
          <Suspense fallback={<div className="cyber-card p-12 text-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
            <ArenaAchievements />
          </Suspense>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Suspense fallback={<div className="cyber-card p-12 text-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
            <StrategyAnalysisDashboard />
          </Suspense>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <SecuritySettings 
            settings={settings}
            onUpdate={(section, key, value) => handleSliderChange([section, key], value, true)}
          />
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community" className="space-y-6">
          <DiscordIntegration />
        </TabsContent>

        {/* App Settings Tab */}
        <TabsContent value="app" className="space-y-6">
          {/* Notifications */}
          <div className="cyber-card p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell size={24} weight="duotone" className="text-primary" />
              <h3 className="text-xl font-bold uppercase tracking-wider">Notifications</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold">Trade Alerts</Label>
                  <p className="text-xs text-muted-foreground">Get notified when trades execute</p>
                </div>
                <Switch
                  checked={settings?.notifications?.tradeAlerts ?? true}
                  onCheckedChange={(checked) => handleSliderChange(['notifications', 'tradeAlerts'], checked, true)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold">Price Alerts</Label>
                  <p className="text-xs text-muted-foreground">Market price movement notifications</p>
                </div>
                <Switch
                  checked={settings?.notifications?.priceAlerts ?? true}
                  onCheckedChange={(checked) => handleSliderChange(['notifications', 'priceAlerts'], checked, true)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold">Forum Replies</Label>
                  <p className="text-xs text-muted-foreground">Community interaction notifications</p>
                </div>
                <Switch
                  checked={settings?.notifications?.forumReplies ?? false}
                  onCheckedChange={(checked) => handleSliderChange(['notifications', 'forumReplies'], checked, true)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Browser push notifications</p>
                </div>
                <Switch
                  checked={settings?.notifications?.pushEnabled ?? true}
                  onCheckedChange={(checked) => handleSliderChange(['notifications', 'pushEnabled'], checked, true)}
                />
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="cyber-card p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette size={24} weight="duotone" className="text-primary" />
              <h3 className="text-xl font-bold uppercase tracking-wider">Theme</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">Enable dark theme</p>
                </div>
                <Switch
                  checked={settings?.theme?.darkMode ?? true}
                  onCheckedChange={(checked) => handleSliderChange(['theme', 'darkMode'], checked, true)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold">Animations</Label>
                  <p className="text-xs text-muted-foreground">Enable motion effects</p>
                </div>
                <Switch
                  checked={settings?.theme?.animations ?? true}
                  onCheckedChange={(checked) => handleSliderChange(['theme', 'animations'], checked, true)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold">Glass Effect</Label>
                  <p className="text-xs text-muted-foreground">Frosted glass card styling</p>
                </div>
                <Switch
                  checked={settings?.theme?.glassEffect ?? true}
                  onCheckedChange={(checked) => handleSliderChange(['theme', 'glassEffect'], checked, true)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold">Neon Glow</Label>
                  <p className="text-xs text-muted-foreground">Cyberpunk glow effects</p>
                </div>
                <Switch
                  checked={settings?.theme?.neonGlow ?? true}
                  onCheckedChange={(checked) => handleSliderChange(['theme', 'neonGlow'], checked, true)}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-bold">Theme Style</Label>
                <Select
                  value={settings?.theme?.themeStyle || 'default'}
                  onValueChange={(value) => handleSliderChange(['theme', 'themeStyle'], value, true)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="matrix">Matrix</SelectItem>
                    <SelectItem value="synthwave">Synthwave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="cyber-card p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <SpeakerHigh size={24} weight="duotone" className="text-primary" />
              <h3 className="text-xl font-bold uppercase tracking-wider">Audio</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold">Sound Effects</Label>
                  <p className="text-xs text-muted-foreground">UI interaction sounds</p>
                </div>
                <Switch
                  checked={settings?.audio?.soundEffects ?? true}
                  onCheckedChange={(checked) => handleSliderChange(['audio', 'soundEffects'], checked, true)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold">Ambient Music</Label>
                  <p className="text-xs text-muted-foreground">Background audio</p>
                </div>
                <Switch
                  checked={settings?.audio?.ambientMusic ?? false}
                  onCheckedChange={(checked) => handleSliderChange(['audio', 'ambientMusic'], checked, true)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold">Volume</Label>
                  <span className="text-sm font-bold text-primary">{settings?.audio?.volume ?? 70}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings?.audio?.volume ?? 70}
                  onChange={(e) => handleSliderChange(['audio', 'volume'], parseInt(e.target.value), false)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Trading Settings */}
          <div className="cyber-card p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <CurrencyDollar size={24} weight="duotone" className="text-primary" />
              <h3 className="text-xl font-bold uppercase tracking-wider">Trading</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold">Paper Trading</Label>
                  <p className="text-xs text-muted-foreground">Simulated trading mode</p>
                </div>
                <Switch
                  checked={settings?.trading?.paperMode ?? true}
                  onCheckedChange={(checked) => handleSliderChange(['trading', 'paperMode'], checked, true)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold">Confirm Trades</Label>
                  <p className="text-xs text-muted-foreground">Require confirmation before execution</p>
                </div>
                <Switch
                  checked={settings?.trading?.confirmTrades ?? true}
                  onCheckedChange={(checked) => handleSliderChange(['trading', 'confirmTrades'], checked, true)}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-bold">Default Trade Amount</Label>
                <Input
                  type="number"
                  value={settings?.trading?.defaultAmount ?? 100}
                  onChange={(e) => handleSliderChange(['trading', 'defaultAmount'], parseFloat(e.target.value) || 100, false)}
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold">Slippage Tolerance</Label>
                  <span className="text-sm font-bold text-primary">{settings?.trading?.slippage ?? 1.0}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={settings?.trading?.slippage ?? 1.0}
                  onChange={(e) => handleSliderChange(['trading', 'slippage'], parseFloat(e.target.value), false)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Network Settings */}
          <div className="cyber-card p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <WifiHigh size={24} weight="duotone" className="text-primary" />
              <h3 className="text-xl font-bold uppercase tracking-wider">Network</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold">RPC Endpoint</Label>
                <Select
                  value={settings?.network?.rpcEndpoint || 'mainnet'}
                  onValueChange={(value) => handleSliderChange(['network', 'rpcEndpoint'], value, true)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mainnet">Mainnet</SelectItem>
                    <SelectItem value="devnet">Devnet</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold">Priority Fees</Label>
                  <p className="text-xs text-muted-foreground">Faster transaction processing</p>
                </div>
                <Switch
                  checked={settings?.network?.priorityFees ?? true}
                  onCheckedChange={(checked) => handleSliderChange(['network', 'priorityFees'], checked, true)}
                />
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="cyber-card p-6 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Cpu size={24} weight="duotone" className="text-primary" />
              <h3 className="text-xl font-bold uppercase tracking-wider">Display</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold">Compact Mode</Label>
                  <p className="text-xs text-muted-foreground">Dense layout option</p>
                </div>
                <Switch
                  checked={settings?.display?.compactMode ?? false}
                  onCheckedChange={(checked) => handleSliderChange(['display', 'compactMode'], checked, true)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-bold">Show Balances</Label>
                  <p className="text-xs text-muted-foreground">Display wallet balances</p>
                </div>
                <Switch
                  checked={settings?.display?.showBalances ?? true}
                  onCheckedChange={(checked) => handleSliderChange(['display', 'showBalances'], checked, true)}
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-bold">Chart Type</Label>
                <Select
                  value={settings?.display?.chartType || 'candlestick'}
                  onValueChange={(value) => handleSliderChange(['display', 'chartType'], value, true)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="candlestick">Candlestick</SelectItem>
                    <SelectItem value="line">Line</SelectItem>
                    <SelectItem value="area">Area</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription">
          <SubscriptionTiersWithStrategies />
        </TabsContent>

        {/* License Tab */}
        <TabsContent value="license">
          <LicenseTab />
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices">
          <DeviceManagement />
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api">
          <APIIntegration />
        </TabsContent>

        {/* Rentals Tab */}
        <TabsContent value="rentals" className="space-y-6">
          <RentalManagement />
        </TabsContent>

        {/* Changelog Tab */}
        <TabsContent value="changelog">
          <ChangeLog />
        </TabsContent>

        {/* Legal Tab */}
        <TabsContent value="legal">
          <LegalSection />
        </TabsContent>
      </Tabs>

      <EditProfileDialog open={showEditProfile} onOpenChange={setShowEditProfile} />
    </div>
  )
}

