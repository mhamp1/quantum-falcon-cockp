import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Trophy, ChatCircle, Article, Star } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface UserProfile {
  username: string
  level: number
  xp: number
  xpToNextLevel: number
  badges: string[]
}

export default function Community() {
  const [profile, setProfile] = useKV<UserProfile>('user-profile', {
    username: 'QuantumTrader',
    level: 7,
    xp: 2340,
    xpToNextLevel: 3000,
    badges: ['Early Adopter', 'Profit Maker', 'Bot Master']
  })

  const [chatMessage, setChatMessage] = useState('')

  const sendMessage = () => {
    if (!chatMessage.trim()) return
    
    toast.success('Message sent', { description: 'Your message was posted to the community' })
    setChatMessage('')
    
    if (profile) {
      setProfile((current) => {
        if (!current) return {
          username: 'QuantumTrader',
          level: 7,
          xp: 2340,
          xpToNextLevel: 3000,
          badges: ['Early Adopter', 'Profit Maker', 'Bot Master']
        }
        return {
          ...current,
          xp: current.xp + 10
        }
      })
    }
  }

  if (!profile) return null

  const xpProgress = (profile.xp / profile.xpToNextLevel) * 100

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-wider uppercase mb-2">
          Community
        </h2>
        <p className="text-muted-foreground">
          Connect with traders and level up your profile
        </p>
      </div>

      <Card className="backdrop-blur-md bg-card/50 border-primary/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                {profile.username}
                <Badge variant="outline" className="bg-accent/20 border-accent/30 text-accent">
                  Level {profile.level}
                </Badge>
              </CardTitle>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">XP Progress</span>
                  <span className="font-semibold">{profile.xp} / {profile.xpToNextLevel}</span>
                </div>
                <Progress value={xpProgress} className="h-2" />
              </div>
            </div>
            <div className="p-4 rounded-full bg-primary/20 border border-primary/30">
              <Trophy size={48} weight="duotone" className="text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <div>
            <p className="text-sm font-semibold mb-2 uppercase tracking-wide">Badges</p>
            <div className="flex flex-wrap gap-2">
              {profile.badges.map((badge, i) => (
                <Badge key={i} variant="outline" className="bg-secondary/20 border-secondary/30 text-secondary">
                  <Star size={14} weight="fill" className="mr-1" />
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-md border border-primary/30">
          <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <ChatCircle size={18} weight="duotone" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="forum" className="gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <Article size={18} weight="duotone" />
            Forum
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4 mt-4">
          <Card className="backdrop-blur-md bg-card/50 border-primary/30">
            <CardHeader>
              <CardTitle>Trading Chat</CardTitle>
              <CardDescription>Real-time discussion with the community</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-64 overflow-y-auto space-y-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                {[
                  { user: 'CryptoHawk', message: 'Just caught a 15% pump on BONK!', time: '2m ago' },
                  { user: 'SolanaKing', message: 'DCA strategy working great today', time: '5m ago' },
                  { user: 'MoonTrader', message: 'Market looking bullish 🚀', time: '8m ago' },
                ].map((msg, i) => (
                  <div key={i} className="p-2 rounded bg-card/50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-primary">{msg.user}</span>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Type your message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="bg-muted/50 border-border focus:border-primary resize-none"
                  rows={2}
                />
                <Button 
                  onClick={sendMessage}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forum" className="space-y-4 mt-4">
          <Card className="backdrop-blur-md bg-card/50 border-primary/30">
            <CardHeader>
              <CardTitle>Strategy Forum</CardTitle>
              <CardDescription>Share and discuss trading strategies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: 'Best DCA intervals for volatile markets?', author: 'TradingPro', replies: 12, likes: 24 },
                { title: 'My RL agent improved 40% this week', author: 'AITrader', replies: 8, likes: 31 },
                { title: 'Sniping strategy: Lessons learned', author: 'CryptoNinja', replies: 15, likes: 19 },
              ].map((post, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                  <h4 className="font-semibold mb-2">{post.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>by {post.author}</span>
                    <span>•</span>
                    <span>{post.replies} replies</span>
                    <span>•</span>
                    <span className="text-accent">{post.likes} ⭐</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="backdrop-blur-md bg-card/50 border-accent/30">
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>Top traders this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { rank: 1, user: 'DiamondHands', profit: '+$2,847', level: 15 },
              { rank: 2, user: 'SolanaWhale', profit: '+$2,134', level: 12 },
              { rank: 3, user: 'BotMaster', profit: '+$1,923', level: 14 },
              { rank: 4, user: profile.username, profit: '+$836', level: profile.level },
            ].map((entry) => (
              <div 
                key={entry.rank} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  entry.user === profile.username 
                    ? 'bg-primary/10 border-primary/30' 
                    : 'bg-muted/30 border-border/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    entry.rank === 1 ? 'bg-accent/20 text-accent border border-accent/30' :
                    entry.rank === 2 ? 'bg-secondary/20 text-secondary border border-secondary/30' :
                    entry.rank === 3 ? 'bg-primary/20 text-primary border border-primary/30' :
                    'bg-muted/50 text-muted-foreground'
                  }`}>
                    #{entry.rank}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{entry.user}</p>
                    <p className="text-xs text-muted-foreground">Level {entry.level}</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-accent">{entry.profit}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}