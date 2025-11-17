import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gear, User, Bell, Shield, CreditCard } from '@phosphor-icons/react';

export default function Settings() {
  const [notifications, setNotifications] = useKV<boolean>('notifications', true);
  const [soundEffects, setSoundEffects] = useKV<boolean>('sound-effects', true);
  const [biometrics, setBiometrics] = useKV<boolean>('biometrics', false);
  const [currentTier] = useKV<string>('subscription-tier', 'Free');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b-2 border-primary/30">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-wider text-primary">
            Settings
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
            ◆ Configure System
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-card/50 border-2 border-primary/30">
          <TabsTrigger value="profile" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <User size={20} weight="duotone" className="lg:mr-2" />
            <span className="hidden lg:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Bell size={20} weight="duotone" className="lg:mr-2" />
            <span className="hidden lg:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Shield size={20} weight="duotone" className="lg:mr-2" />
            <span className="hidden lg:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <CreditCard size={20} weight="duotone" className="lg:mr-2" />
            <span className="hidden lg:inline">Plan</span>
          </TabsTrigger>
          <TabsTrigger value="general" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Gear size={20} weight="duotone" className="lg:mr-2" />
            <span className="hidden lg:inline">General</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6 bg-card/50 border-2 border-primary/30">
            <h2 className="text-xl font-bold uppercase tracking-wider text-primary mb-4">
              Profile Information
            </h2>

            <div className="space-y-4">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Username</Label>
                <div className="mt-2 p-3 bg-muted/20 border-2 border-primary/30">
                  <p className="font-bold">MHAMP1TRADING</p>
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Member Since</Label>
                <div className="mt-2 p-3 bg-muted/20 border-2 border-primary/30">
                  <p>January 2024</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Level</Label>
                  <div className="mt-2 p-3 bg-muted/20 border-2 border-accent/30">
                    <p className="font-bold text-accent">12</p>
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Total XP</Label>
                  <div className="mt-2 p-3 bg-muted/20 border-2 border-accent/30">
                    <p className="font-bold text-accent">4,500</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6 bg-card/50 border-2 border-primary/30">
            <h2 className="text-xl font-bold uppercase tracking-wider text-primary mb-4">
              Notification Settings
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/20 border border-primary/20">
                <div>
                  <Label htmlFor="notifications" className="text-base">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground mt-1">Receive alerts for trades and events</p>
                </div>
                <Switch
                  id="notifications"
                  checked={notifications}
                  onCheckedChange={setNotifications}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/20 border border-primary/20">
                <div>
                  <Label htmlFor="sound" className="text-base">Sound Effects</Label>
                  <p className="text-xs text-muted-foreground mt-1">Play sounds for trade executions</p>
                </div>
                <Switch
                  id="sound"
                  checked={soundEffects}
                  onCheckedChange={setSoundEffects}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="p-6 bg-card/50 border-2 border-primary/30">
            <h2 className="text-xl font-bold uppercase tracking-wider text-primary mb-4">
              Security Options
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/20 border border-primary/20">
                <div>
                  <Label htmlFor="biometrics" className="text-base">Biometric Login</Label>
                  <p className="text-xs text-muted-foreground mt-1">Use fingerprint or face ID</p>
                </div>
                <Switch
                  id="biometrics"
                  checked={biometrics}
                  onCheckedChange={setBiometrics}
                />
              </div>

              <Button className="w-full bg-primary/20 border-2 border-primary text-primary hover:bg-primary/30">
                Change Password
              </Button>

              <Button variant="outline" className="w-full border-2 border-primary/30">
                Enable 2FA
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card className="p-6 bg-card/50 border-2 border-accent/30 shadow-[0_0_30px_rgba(255,200,0,0.2)]">
            <h2 className="text-xl font-bold uppercase tracking-wider text-accent mb-4">
              Subscription Plan
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-muted/20 border-2 border-accent/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm uppercase tracking-wider text-muted-foreground">Current Plan</p>
                  <span className="text-2xl font-bold text-accent">{currentTier || 'Free'}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentTier === 'Free' ? 'Paper trading with live data' : 'Live trading enabled'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { tier: 'Starter', price: '$29/mo', features: ['Live Trading', '1 AI Agent', 'Basic Analytics'] },
                  { tier: 'Trader', price: '$79/mo', features: ['2 AI Agents', 'Enhanced Analytics', 'Priority Support'] },
                  { tier: 'Pro', price: '$197/mo', features: ['3 AI Agents', 'All Strategies', 'VIP Support'] },
                ].map((plan, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-muted/20 border-2 border-primary/30 hover:border-primary/50 transition-colors"
                  >
                    <h3 className="font-bold text-lg mb-1">{plan.tier}</h3>
                    <p className="text-2xl font-bold text-accent mb-3">{plan.price}</p>
                    <ul className="space-y-1 mb-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="text-xs text-muted-foreground">
                          • {feature}
                        </li>
                      ))}
                    </ul>
                    <Button size="sm" className="w-full bg-primary/20 border-2 border-primary text-primary hover:bg-primary/30">
                      Upgrade
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card className="p-6 bg-card/50 border-2 border-primary/30">
            <h2 className="text-xl font-bold uppercase tracking-wider text-primary mb-4">
              General Settings
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-muted/20 border border-primary/20">
                <Label className="text-base">Version</Label>
                <p className="text-sm text-muted-foreground mt-1">v2.4.1 QUANTUM BUILD</p>
              </div>

              <Button variant="outline" className="w-full border-2 border-primary/30">
                View Documentation
              </Button>

              <Button variant="outline" className="w-full border-2 border-primary/30">
                Contact Support
              </Button>

              <Button variant="outline" className="w-full border-2 border-destructive/30 text-destructive">
                Clear Cache
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
