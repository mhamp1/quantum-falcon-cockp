import { useKV } from '@github/spark/hooks'
import { useEffect, useState } from 'react'
import { UserAuth } from '@/lib/auth'
import {
  TrendUp, TrendDown, Coins, Lightning, Robot, Vault, ChartLine,
  Target, Brain, CheckCircle, ArrowsClockwise, Play, Users, Crown
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import LoginDialog from '@/components/shared/LoginDialog'
import LicenseExpiry from '@/components/shared/LicenseExpiry'
import { toast } from 'sonner'
import Wireframe3D from '@/components/shared/Wireframe3D'

interface QuickStat {
  id: string
  label: string
  value: string
  change: number
  icon: React.ReactNode
  color: string
}

export default function EnhancedDashboard() {
  const [auth, setAuth] = useKV<UserAuth>('user-auth', {
    isAuthenticated: false,
    userId: null,
    username: null,
    email: null,
    avatar: null,
    license: null
  })

  const [showLogin, setShowLogin] = useState(false)
  const [portfolio] = useKV<{
    solanaBalance: number
    btcBalance: number
    totalValue: number
    change24h: number
    activeAgents: number
  }>('portfolio-data', {
    solanaBalance: 125.47,
    btcBalance: 0.00234,
    totalValue: 8943.21,
    change24h: 5.72,
    activeAgents: 3
  })

  const [quickStats, setQuickStats] = useState<QuickStat[]>([
    {
      id: 'total-value',
      label: 'Total Portfolio',
      value: '$8,943.21',
      change: 5.72,
      icon: <Coins size={24} weight="duotone" />,
      color: 'primary'
    },
    {
      id: 'today-profit',
      label: "Today's Profit",
      value: '+$342.50',
      change: 12.4,
      icon: <TrendUp size={24} weight="duotone" />,
      color: 'primary'
    },
    {
      id: 'active-agents',
      label: 'Active Agents',
      value: '3/3',
      change: 0,
      icon: <Robot size={24} weight="duotone" />,
      color: 'accent'
    },
    {
      id: 'win-rate',
      label: 'Win Rate',
      value: '68.5%',
      change: 2.3,
      icon: <Target size={24} weight="duotone" />,
      color: 'secondary'
    }
  ])

  const quickActions = [
    {
      id: 'start-bot',
      label: 'Start Trading',
      icon: <Play size={20} weight="fill" />,
      color: 'primary',
      action: () => toast.success('Trading bot activated')
    },
    {
      id: 'view-analytics',
      label: 'View Analytics',
      icon: <ChartLine size={20} weight="duotone" />,
      color: 'accent',
      action: () => {
        const event = new CustomEvent('navigate-tab', { detail: 'analytics' })
        window.dispatchEvent(event)
      }
    },
    {
      id: 'check-vault',
      label: 'Check Vault',
      icon: <Vault size={20} weight="duotone" />,
      color: 'secondary',
      action: () => {
        const event = new CustomEvent('navigate-tab', { detail: 'vault' })
        window.dispatchEvent(event)
      }
    },
    {
      id: 'community',
      label: 'Community',
      icon: <Users size={20} weight="duotone" />,
      color: 'primary',
      action: () => {
        const event = new CustomEvent('navigate-tab', { detail: 'community' })
        window.dispatchEvent(event)
      }
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setQuickStats(prev =>
        prev.map(stat => ({
          ...stat,
          change: stat.change + (Math.random() - 0.5) * 0.5
        }))
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  if (!auth?.isAuthenticated) {
    return (
      <>
        <div className="space-y-6">
          <div className="cyber-card relative overflow-hidden">
            <div className="absolute inset-0 diagonal-stripes opacity-20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
              <Wireframe3D type="sphere" size={256} color="secondary" animated={true} />
            </div>
            <div className="p-8 relative z-10 text-center space-y-6">
              <div className="inline-flex p-8 jagged-corner bg-gradient-to-br from-primary/20 to-accent/20 border-4 border-primary shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.6)]">
                <Brain size={96} weight="duotone" className="text-primary" />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-[0.2em] uppercase">
                  <span className="text-primary neon-glow-primary">QUANTUM</span>
                  <span className="text-secondary neon-glow-secondary ml-2">FALCON</span>
                </h1>
                <p className="text-lg uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                  AI-POWERED AUTONOMOUS TRADING COCKPIT
                </p>
                <p className="text-base leading-relaxed text-foreground max-w-2xl mx-auto">
                  Access your <span className="text-primary font-bold">advanced trading dashboard</span>, manage{' '}
                  <span className="text-accent font-bold">AI agents</span>, and monitor your{' '}
                  <span className="text-secondary font-bold">portfolio</span> in real-time
                </p>
              </div>

              <Button
                onClick={() => setShowLogin(true)}
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-primary 
                         shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.6)] hover:shadow-[0_0_40px_oklch(0.72_0.20_195_/_0.8)]
                         transition-all jagged-corner uppercase tracking-[0.2em] font-bold text-lg px-8 py-6"
              >
                <Lightning size={24} weight="fill" className="mr-2" />
                Authenticate System
              </Button>

              <div className="cyber-card-accent p-6 max-w-xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <Crown size={24} className="text-accent" weight="fill" />
                  <span className="text-sm font-bold uppercase tracking-wider text-accent">System Requirements</span>
                </div>
                <div className="text-left space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-primary" weight="fill" />
                    <span>Valid Quantum Falcon license key</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-primary" weight="fill" />
                    <span>Email address for authentication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-primary" weight="fill" />
                    <span>Access to 4 tier levels (Free, Pro, Elite, Lifetime)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
      </>
    )
  }

  return (
    <div className="space-y-6">
      <div className="cyber-card relative overflow-hidden">
        <div className="absolute inset-0 diagonal-stripes opacity-10 pointer-events-none" />
        <div className="p-6 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-[0.15em] uppercase">
                <span className="text-primary neon-glow-primary">Welcome Back,</span>
                <span className="text-foreground ml-2">{auth.username}</span>
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="px-3 py-1 bg-accent/20 border border-accent jagged-corner-small">
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">
                    {auth.license?.tier.toUpperCase()} Tier
                  </span>
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  System Status: <span className="text-primary font-bold">OPERATIONAL</span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setAuth({
                  isAuthenticated: false,
                  userId: null,
                  username: null,
                  email: null,
                  avatar: null,
                  license: null
                })
                toast.info('Logged out successfully')
              }}
              className="border-primary/50 hover:border-primary hover:bg-primary/10 jagged-corner-small"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <LicenseExpiry />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, idx) => {
          const isPositive = stat.change >= 0
          const cornerClasses = ['angled-corner-tr', 'angled-corner-br', 'cut-corner-tr', 'angled-corners-dual-tr-bl']
          return (
            <div
              key={stat.id}
              className={`cyber-card group hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden ${cornerClasses[idx % 4]}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="data-label">{stat.label}</div>
                  <div className={`p-2 bg-${stat.color}/10 border border-${stat.color}/30 cut-corner-tr`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="technical-readout text-2xl mb-2">{stat.value}</div>
                {stat.change !== 0 && (
                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <TrendUp size={14} weight="bold" className="text-primary" />
                    ) : (
                      <TrendDown size={14} weight="bold" className="text-destructive" />
                    )}
                    <span className={`text-xs font-bold ${isPositive ? 'text-primary' : 'text-destructive'}`}>
                      {isPositive ? '+' : ''}{stat.change.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="cyber-card p-6 angled-corners-dual-tl-br">
        <div className="flex items-center gap-3 mb-4">
          <Lightning size={24} weight="fill" className="text-accent" />
          <h2 className="text-xl font-bold uppercase tracking-wider text-accent">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, idx) => (
            <Button
              key={action.id}
              onClick={action.action}
              className={`w-full bg-${action.color}/10 hover:bg-${action.color}/20 border-2 border-${action.color}/50 
                       hover:border-${action.color} transition-all ${idx % 2 === 0 ? 'angled-corner-tr' : 'angled-corner-br'} text-${action.color} 
                       hover:shadow-[0_0_20px_var(--${action.color})] flex-col h-auto py-4 gap-2`}
            >
              {action.icon}
              <span className="text-xs uppercase tracking-wider font-bold">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="cyber-card p-6 angled-corner-tl">
          <div className="flex items-center gap-3 mb-4">
            <Robot size={24} weight="fill" className="text-primary" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-primary">AI Agent Status</h2>
          </div>
          <div className="space-y-3">
            {['Market Analysis', 'Strategy Execution', 'RL Optimizer'].map((agent, idx) => (
              <div key={idx} className="p-3 bg-muted/20 border-l-2 border-primary cut-corner-br">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="status-indicator animate-pulse-glow" style={{ width: '6px', height: '6px' }} />
                    <span className="text-sm font-bold uppercase tracking-wide">{agent}</span>
                  </div>
                  <span className="text-xs text-primary font-bold">ACTIVE</span>
                </div>
                <Progress value={65 + idx * 10} className="h-1" />
              </div>
            ))}
          </div>
        </div>

        <div className="cyber-card p-6 angled-corner-tr">
          <div className="flex items-center gap-3 mb-4">
            <ChartLine size={24} weight="fill" className="text-accent" />
            <h2 className="text-xl font-bold uppercase tracking-wider text-accent">Recent Activity</h2>
          </div>
          <div className="space-y-2">
            {[
              { type: 'success', msg: 'Trade executed: +$45.20 profit', time: '2m ago' },
              { type: 'info', msg: 'Market analysis completed', time: '5m ago' },
              { type: 'success', msg: 'DCA order filled successfully', time: '12m ago' },
              { type: 'info', msg: 'Portfolio rebalanced', time: '23m ago' }
            ].map((activity, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs p-2 hover:bg-muted/10 transition-colors angled-corner-br">
                <CheckCircle size={14} className={activity.type === 'success' ? 'text-primary' : 'text-accent'} weight="fill" />
                <div className="flex-1">
                  <div className="text-foreground">{activity.msg}</div>
                  <div className="text-muted-foreground text-[10px]">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
