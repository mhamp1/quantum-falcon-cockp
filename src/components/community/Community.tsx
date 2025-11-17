import { useKV } from '@github/spark/hooks';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Trophy, Lightning, ChatCircle } from '@phosphor-icons/react';

export default function Community() {
  const [userLevel] = useKV<number>('user-level', 12);
  const [userXP] = useKV<number>('user-xp', 4500);
  const xpToNextLevel = 5000;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b-2 border-primary/30">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold uppercase tracking-wider text-accent">
            Community
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-wide mt-1">
            ◆ Connect & Compete
          </p>
        </div>
      </div>

      <Card className="p-6 bg-card/50 border-2 border-accent/30 shadow-[0_0_30px_rgba(255,200,0,0.2)]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-accent/20 border-2 border-accent flex items-center justify-center">
              <Trophy size={32} weight="duotone" className="text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Level {userLevel || 0}</h2>
              <p className="text-sm text-muted-foreground">
                {(userXP || 0).toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-md">
            <Progress value={((userXP || 0) / xpToNextLevel) * 100} className="h-3" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6 bg-card/50 border-2 border-primary/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase text-muted-foreground">Total Trades</p>
            <Lightning size={20} weight="duotone" className="text-primary/20" />
          </div>
          <p className="text-3xl font-bold text-primary">439</p>
        </Card>

        <Card className="p-6 bg-card/50 border-2 border-primary/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase text-muted-foreground">Achievements</p>
            <Trophy size={20} weight="duotone" className="text-accent/20" />
          </div>
          <p className="text-3xl font-bold text-accent">8/12</p>
        </Card>

        <Card className="p-6 bg-card/50 border-2 border-primary/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase text-muted-foreground">Global Rank</p>
            <Users size={20} weight="duotone" className="text-primary/20" />
          </div>
          <p className="text-3xl font-bold text-primary">#247</p>
        </Card>
      </div>

      <Card className="p-6 bg-card/50 border-2 border-accent/30">
        <div className="flex items-center gap-3 mb-4">
          <Trophy size={24} weight="duotone" className="text-accent" />
          <h2 className="text-xl font-bold uppercase tracking-wider text-accent">
            Achievements
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'First Trade', desc: 'Complete your first trade', unlocked: true, xp: 100 },
            { name: '100 Trades', desc: 'Execute 100 trades', unlocked: true, xp: 500 },
            { name: 'Profit Master', desc: 'Earn $10,000 profit', unlocked: false, xp: 1000 },
            { name: 'Win Streak', desc: '10 winning trades in a row', unlocked: true, xp: 750 },
          ].map((achievement, idx) => (
            <div
              key={idx}
              className={`p-4 border-2 ${
                achievement.unlocked
                  ? 'bg-accent/10 border-accent'
                  : 'bg-muted/10 border-muted opacity-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold uppercase tracking-wide">{achievement.name}</h3>
                <Badge className={achievement.unlocked ? 'bg-accent text-background' : ''}>
                  {achievement.xp} XP
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{achievement.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-card/50 border-2 border-primary/30">
        <div className="flex items-center gap-3 mb-4">
          <ChatCircle size={24} weight="duotone" className="text-primary" />
          <h2 className="text-xl font-bold uppercase tracking-wider text-primary">
            Community Forum
          </h2>
        </div>

        <div className="space-y-2">
          {[
            { title: 'Best strategies for volatile markets?', author: 'TraderPro', replies: 23, time: '2h ago' },
            { title: 'How to optimize AI agent settings', author: 'CryptoNinja', replies: 15, time: '4h ago' },
            { title: 'DCA vs Manual Trading discussion', author: 'InvestGuru', replies: 42, time: '6h ago' },
          ].map((post, idx) => (
            <div
              key={idx}
              className="p-4 bg-muted/20 border border-primary/20 hover:border-primary/50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold mb-1">{post.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>by {post.author}</span>
                    <span>•</span>
                    <span>{post.replies} replies</span>
                    <span>•</span>
                    <span>{post.time}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full mt-4 bg-primary/20 border-2 border-primary text-primary hover:bg-primary/30">
          View All Forum Posts
        </Button>
      </Card>
    </div>
  );
}
