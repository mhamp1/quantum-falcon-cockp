import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Bell, Lock, Palette, ArrowsClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Settings {
  notifications: {
    trades: boolean
    agentAlerts: boolean
    profitMilestones: boolean
  }
  trading: {
    maxSlippage: number
    autoConvert: boolean
    riskLevel: 'low' | 'medium' | 'high'
  }
  security: {
    biometricsEnabled: boolean
  }
}

export default function Settings() {
  const [settings, setSettings] = useKV<Settings>('app-settings', {
    notifications: {
      trades: true,
      agentAlerts: true,
      profitMilestones: true
    },
    trading: {
      maxSlippage: 1.5,
      autoConvert: true,
      riskLevel: 'medium'
    },
    security: {
      biometricsEnabled: false
    }
  })

  const updateSetting = (category: keyof Settings, key: string, value: any) => {
    setSettings((current) => {
      if (!current) return {
        notifications: {
          trades: true,
          agentAlerts: true,
          profitMilestones: true
        },
        trading: {
          maxSlippage: 1.5,
          autoConvert: true,
          riskLevel: 'medium' as const
        },
        security: {
          biometricsEnabled: false
        }
      }
      return {
        ...current,
        [category]: {
          ...current[category],
          [key]: value
        }
      }
    })
    toast.success('Setting updated', { description: 'Your changes have been saved' })
  }

  if (!settings) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-wider uppercase mb-2">
          Settings
        </h2>
        <p className="text-muted-foreground">
          Configure trading parameters and app preferences
        </p>
      </div>

      <Card className="backdrop-blur-md bg-card/50 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={24} weight="duotone" className="text-primary" />
            Notifications
          </CardTitle>
          <CardDescription>
            Manage alerts and notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-trades" className="text-base">Trade Executions</Label>
              <p className="text-sm text-muted-foreground">Get notified when trades execute</p>
            </div>
            <Switch
              id="notify-trades"
              checked={settings.notifications.trades}
              onCheckedChange={(checked) => updateSetting('notifications', 'trades', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-agents" className="text-base">Agent Alerts</Label>
              <p className="text-sm text-muted-foreground">Alerts for agent status changes</p>
            </div>
            <Switch
              id="notify-agents"
              checked={settings.notifications.agentAlerts}
              onCheckedChange={(checked) => updateSetting('notifications', 'agentAlerts', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-profits" className="text-base">Profit Milestones</Label>
              <p className="text-sm text-muted-foreground">Celebrate profit achievements</p>
            </div>
            <Switch
              id="notify-profits"
              checked={settings.notifications.profitMilestones}
              onCheckedChange={(checked) => updateSetting('notifications', 'profitMilestones', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-md bg-card/50 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowsClockwise size={24} weight="duotone" className="text-accent" />
            Trading Parameters
          </CardTitle>
          <CardDescription>
            Configure risk tolerance and execution settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="slippage">Max Slippage (%)</Label>
            <Input
              id="slippage"
              type="number"
              step="0.1"
              value={settings.trading.maxSlippage}
              onChange={(e) => updateSetting('trading', 'maxSlippage', parseFloat(e.target.value))}
              className="bg-muted/50 border-border focus:border-primary"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-convert" className="text-base">Auto-convert to BTC</Label>
              <p className="text-sm text-muted-foreground">Automatically send profits to vault</p>
            </div>
            <Switch
              id="auto-convert"
              checked={settings.trading.autoConvert}
              onCheckedChange={(checked) => updateSetting('trading', 'autoConvert', checked)}
            />
          </div>
          <div>
            <Label className="text-base mb-3 block">Risk Level</Label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <Badge
                  key={level}
                  variant={settings.trading.riskLevel === level ? 'default' : 'outline'}
                  className={`cursor-pointer capitalize ${
                    settings.trading.riskLevel === level
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-primary/20'
                  }`}
                  onClick={() => updateSetting('trading', 'riskLevel', level)}
                >
                  {level}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-md bg-card/50 border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={24} weight="duotone" className="text-destructive" />
            Security
          </CardTitle>
          <CardDescription>
            Protect your account and trading activity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="biometrics" className="text-base">Biometric Authentication</Label>
              <p className="text-sm text-muted-foreground">Use fingerprint or face unlock</p>
            </div>
            <Switch
              id="biometrics"
              checked={settings.security.biometricsEnabled}
              onCheckedChange={(checked) => updateSetting('security', 'biometricsEnabled', checked)}
            />
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-sm font-semibold mb-1">API Keys Status</p>
            <p className="text-xs text-muted-foreground mb-3">
              Configure API keys to connect live trading
            </p>
            <Badge variant="outline" className="bg-accent/20 border-accent/30 text-accent">
              Demo Mode Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-md bg-card/50 border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette size={24} weight="duotone" className="text-secondary" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the cyberpunk aesthetic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Cyberpunk neon theme with holographic elements — Production ready. Theme customization available in Pro+ tiers.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}