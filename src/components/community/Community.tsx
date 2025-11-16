import { useState } from "react";
import {
  Trophy,
  Star,
  Lightning,
  Coins,
  Sword,
  ShieldCheck,
  Target,
  Fire,
  TrendUp,
  Crown,
  Rocket,
  Medal,
  CheckCircle,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { useKV } from "@/hooks/useKVFallback";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UserProfile {
  username: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  badges: string[];
  rank: number;
  wins: number;
  streak: number;
}

interface Perk {
  id: string;
  title: string;
  description: string;
  details: string;
  icon: React.ReactNode;
  price: string;
  unlocked: boolean;
}

export default function Community() {
  const [profile, setProfile] = useKV<UserProfile>("user-profile", {
    username: "QuantumTrader",
    level: 7,
    xp: 2340,
    xpToNextLevel: 3000,
    badges: ["Early Adopter", "Profit Maker", "Bot Master"],
    rank: 47,
    wins: 124,
    streak: 5,
  });

  const [unlockedPerks, setUnlockedPerks] = useKV<string[]>(
    "unlocked-perks",
    [],
  );

  if (!profile) return null;

  const xpProgress = (profile.xp / profile.xpToNextLevel) * 100;

  const perks: Perk[] = [
    {
      id: "speed-boost",
      title: "Speed Boost",
      description: "Upgrade your trading speed",
      details: "Priority execution, Faster signals, Zero-lag interface",
      icon: <Lightning size={48} weight="duotone" />,
      price: "500 XP",
      unlocked: unlockedPerks?.includes("speed-boost") || false,
    },
    {
      id: "premium-signals",
      title: "Premium Signals",
      description: "Access exclusive market insights",
      details: "AI predictions, Whale alerts, Hidden gems",
      icon: <Target size={48} weight="duotone" />,
      price: "750 XP",
      unlocked: unlockedPerks?.includes("premium-signals") || false,
    },
    {
      id: "profit-multiplier",
      title: "Profit Multiplier",
      description: "Boost your earning potential",
      details: "2x rewards, Bonus trades, VIP status",
      icon: <Coins size={48} weight="duotone" />,
      price: "1000 XP",
      unlocked: unlockedPerks?.includes("profit-multiplier") || false,
    },
  ];

  const unlockPerk = (perk: Perk) => {
    if (perk.unlocked) {
      toast.info("Already unlocked", {
        description: "You already have this perk activated",
      });
      return;
    }

    const requiredXP = parseInt(perk.price);
    if (profile.xp < requiredXP) {
      toast.error("Not enough XP", {
        description: `You need ${requiredXP} XP to unlock this perk`,
      });
      return;
    }

    setProfile((current) => {
      if (!current)
        return {
          username: "QuantumTrader",
          level: 7,
          xp: 2340,
          xpToNextLevel: 3000,
          badges: ["Early Adopter", "Profit Maker", "Bot Master"],
          rank: 47,
          wins: 124,
          streak: 5,
        };
      return {
        ...current,
        xp: current.xp - requiredXP,
      };
    });

    setUnlockedPerks((current) => [...(current || []), perk.id]);

    toast.success("Perk Unlocked!", {
      description: `${perk.title} is now active`,
      icon: "🎉",
    });
  };

  const leaderboard = [
    {
      rank: 1,
      user: "DiamondHands",
      profit: "+$12,847",
      wins: 247,
      level: 15,
      avatar: "👑",
    },
    {
      rank: 2,
      user: "SolanaWhale",
      profit: "+$9,134",
      wins: 198,
      level: 13,
      avatar: "🐋",
    },
    {
      rank: 3,
      user: "BotMaster3000",
      profit: "+$7,923",
      wins: 176,
      level: 14,
      avatar: "🤖",
    },
    {
      rank: 4,
      user: "CryptoNinja",
      profit: "+$5,421",
      wins: 164,
      level: 12,
      avatar: "🥷",
    },
    {
      rank: 5,
      user: profile.username,
      profit: "+$3,836",
      wins: profile.wins,
      level: profile.level,
      avatar: "⚡",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden cyber-card p-8 md:p-12 min-h-[300px] md:min-h-[400px] group hover:shadow-[0_0_60px_oklch(0.72_0.20_195_/_0.2)] transition-all duration-700">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-card to-background" />
        <div className="absolute inset-0 diagonal-stripes opacity-10" />
        <div className="absolute inset-0 technical-grid opacity-5" />

        <div className="absolute top-0 right-0 w-2/3 h-full opacity-20 pointer-events-none overflow-hidden">
          <div className="text-[180px] md:text-[280px] font-black leading-none tracking-tighter text-primary/30 absolute -top-12 -right-12 transform rotate-[-5deg] group-hover:rotate-[-3deg] transition-transform duration-1000">
            TRADE
          </div>
        </div>

        <svg
          className="absolute bottom-0 left-0 w-full h-full opacity-10 pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <line x1="0" y1="80%" x2="40%" y2="80%" className="circuit-line" />
          <line x1="40%" y1="80%" x2="40%" y2="20%" className="circuit-line" />
          <circle
            cx="40%"
            cy="20%"
            r="4"
            fill="var(--primary)"
            className="animate-pulse"
          />
        </svg>

        <div className="relative z-10">
          <div className="mb-6">
            <Badge className="bg-accent/20 text-accent border-accent/50 text-xs uppercase tracking-wider mb-3 px-3 py-1 hover:bg-accent/30 hover:scale-105 transition-all cursor-default">
              <Lightning size={12} weight="fill" className="mr-1.5" />
              Community Hub
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight mb-4">
              <span className="text-primary neon-glow-primary block">
                Just Smart
              </span>
              <span
                className="text-accent neon-glow-secondary block mt-1"
                style={{
                  fontSize: "0.85em",
                  fontStyle: "italic",
                  fontFamily: "Orbitron, sans-serif",
                  fontWeight: 900,
                  transform: "skew(-5deg)",
                  display: "inline-block",
                }}
              >
                Traders
              </span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground uppercase tracking-wider max-w-2xl">
              Join a community of elite traders leveraging AI-powered strategies
              to dominate the market
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-background/60 backdrop-blur-sm border border-primary/30 p-4 jagged-corner-small hover:scale-105 hover:border-primary/60 transition-all group/stat relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <Crown size={20} className="text-accent" weight="fill" />
                <span className="data-label text-[10px]">Global Rank</span>
              </div>
              <div className="text-2xl font-black text-primary relative z-10">
                #{profile.rank}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${100 - (profile.rank / 100) * 100}%` }}
                />
              </div>
            </div>
            <div className="bg-background/60 backdrop-blur-sm border border-primary/30 p-4 jagged-corner-small hover:scale-105 hover:border-primary/60 transition-all group/stat relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <Trophy size={20} className="text-accent" weight="fill" />
                <span className="data-label text-[10px]">Level</span>
              </div>
              <div className="text-2xl font-black text-primary relative z-10">
                {profile.level}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${(profile.level / 50) * 100}%` }}
                />
              </div>
            </div>
            <div className="bg-background/60 backdrop-blur-sm border border-primary/30 p-4 jagged-corner-small hover:scale-105 hover:border-primary/60 transition-all group/stat relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity" />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <Target size={20} className="text-accent" weight="fill" />
                <span className="data-label text-[10px]">Total Wins</span>
              </div>
              <div className="text-2xl font-black text-primary relative z-10">
                {profile.wins}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/20">
                <div
                  className="h-full bg-secondary"
                  style={{ width: `${(profile.wins / 200) * 100}%` }}
                />
              </div>
            </div>
            <div className="bg-background/60 backdrop-blur-sm border border-accent/40 p-4 jagged-corner-small hover:scale-105 hover:border-accent/70 hover:shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.4)] transition-all group/stat relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <Fire size={20} className="text-accent" weight="fill" />
                <span className="data-label text-[10px]">Win Streak</span>
              </div>
              <div className="text-2xl font-black text-accent neon-glow-secondary relative z-10">
                {profile.streak}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent/20">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${(profile.streak / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-morph-card p-6 md:p-8 relative overflow-hidden group hover:shadow-[0_0_60px_oklch(0.68_0.18_330_/_0.15)] transition-all duration-500">
        <div className="absolute inset-0 grid-background opacity-5" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000" />

        <svg
          className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <line x1="20%" y1="0" x2="20%" y2="100%" className="circuit-line" />
          <line x1="80%" y1="0" x2="80%" y2="100%" className="circuit-line" />
          <circle
            cx="20%"
            cy="30%"
            r="3"
            fill="var(--accent)"
            className="animate-pulse"
          />
          <circle
            cx="80%"
            cy="70%"
            r="3"
            fill="var(--primary)"
            className="animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
        </svg>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent/20 border border-accent/40 jagged-corner-small">
                <Star size={20} weight="fill" className="text-accent" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                <span className="text-foreground">Special</span>{" "}
                <span className="text-accent neon-glow-secondary">Perks</span>
              </h2>
            </div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              Unlock game-changing upgrades with your XP
            </p>
          </div>
          <div className="cyber-card-accent px-6 py-3 relative group/balance hover:scale-105 transition-transform">
            <div className="data-label text-[10px] mb-1">Your XP Balance</div>
            <div className="text-xl md:text-2xl font-black text-accent flex items-center gap-2 neon-glow-secondary">
              <Star
                size={20}
                weight="fill"
                className="text-accent animate-pulse"
              />
              {profile.xp} XP
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent/20">
              <div
                className="h-full bg-accent animate-pulse"
                style={{ width: "60%" }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 relative z-10">
          {perks.map((perk) => (
            <div
              key={perk.id}
              className={`relative overflow-hidden transition-all duration-300 cursor-pointer ${
                perk.unlocked
                  ? "bg-accent/90 border-2 border-accent shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.4)] scale-[0.98]"
                  : "bg-accent hover:bg-accent/95 border-2 border-accent/80 hover:border-accent shadow-[0_0_20px_oklch(0.68_0.18_330_/_0.3)] hover:shadow-[0_0_40px_oklch(0.68_0.18_330_/_0.5)] hover:scale-[1.02]"
              }`}
              style={{
                borderRadius: "8px",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-background/10 to-transparent" />
              <div className="absolute inset-0 diagonal-stripes opacity-5" />

              {perk.unlocked && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="bg-background/90 border-2 border-accent rounded-full p-2 animate-pulse-glow">
                    <ShieldCheck
                      size={24}
                      weight="fill"
                      className="text-accent neon-glow-secondary"
                    />
                  </div>
                </div>
              )}

              {!perk.unlocked && (
                <div
                  className="absolute top-0 right-0 px-3 py-1 bg-destructive/90 border-b-2 border-l-2 border-destructive"
                  style={{ borderRadius: "0 8px 0 8px" }}
                >
                  <span className="text-xs font-bold text-destructive-foreground uppercase tracking-wider">
                    Limited Offer
                  </span>
                </div>
              )}

              <div className="relative p-6 flex flex-col h-full">
                <div className="mb-4">
                  <div className="text-background/90 mb-3">{perk.icon}</div>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-background mb-2 flex items-center gap-2">
                    {perk.title}
                    {!perk.unlocked && (
                      <Lightning
                        size={18}
                        weight="fill"
                        className="text-background/70 animate-pulse"
                      />
                    )}
                  </h3>
                  <p className="text-background/80 font-semibold text-sm mb-3">
                    {perk.description}
                  </p>
                  <div className="space-y-1">
                    {perk.details.split(",").map((detail, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs text-background/70 font-medium"
                      >
                        <CheckCircle
                          size={14}
                          weight="fill"
                          className="text-background/70 flex-shrink-0"
                        />
                        {detail.trim()}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-4 space-y-3">
                  {!perk.unlocked && (
                    <div className="flex items-center justify-between px-3 py-2 bg-background/20 border border-background/30 relative overflow-hidden">
                      <span className="text-xs font-bold text-background/80 uppercase tracking-wider">
                        Cost
                      </span>
                      <span className="text-base font-black text-background flex items-center gap-1">
                        <Star size={14} weight="fill" />
                        {perk.price}
                      </span>
                    </div>
                  )}

                  <Button
                    onClick={() => unlockPerk(perk)}
                    disabled={perk.unlocked}
                    className={`w-full font-black uppercase tracking-wide text-sm relative overflow-hidden group/btn ${
                      perk.unlocked
                        ? "bg-background/40 text-background/60 cursor-not-allowed border-2 border-background/20"
                        : "bg-background hover:bg-background/90 text-accent border-2 border-background shadow-lg hover:shadow-xl active:scale-95"
                    }`}
                  >
                    {!perk.unlocked && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000" />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {perk.unlocked ? (
                        <>
                          <CheckCircle size={16} weight="fill" />
                          Activated
                        </>
                      ) : (
                        <>
                          <Lightning size={16} weight="fill" />
                          Unlock Now
                        </>
                      )}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="backdrop-blur-md bg-card/50 border-primary/30 h-full shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.1)] hover:shadow-[0_0_40px_oklch(0.72_0.20_195_/_0.2)] transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 technical-grid opacity-5 pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full" />

            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-accent/20 border border-accent/40 jagged-corner-small">
                  <Medal size={28} weight="duotone" className="text-accent" />
                </div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">
                  Season Leaderboard
                </CardTitle>
              </div>
              <CardDescription className="uppercase text-xs tracking-wide flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Top traders this season - Updated live
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`relative overflow-hidden transition-all group/entry cursor-pointer ${
                      entry.user === profile.username
                        ? "cyber-card-accent p-4 scale-[1.02] hover:scale-[1.03]"
                        : "cyber-card p-4 hover:border-primary/50 hover:scale-[1.01]"
                    }`}
                  >
                    {entry.user === profile.username && (
                      <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent animate-pulse" />
                    )}
                    <div className="flex items-center gap-4 relative z-10">
                      <div
                        className={`text-3xl font-black w-12 h-12 flex items-center justify-center relative ${
                          entry.rank === 1
                            ? "text-accent neon-glow-secondary scale-110"
                            : entry.rank === 2
                              ? "text-secondary scale-105"
                              : entry.rank === 3
                                ? "text-primary scale-105"
                                : "text-muted-foreground"
                        }`}
                      >
                        {entry.rank === 1 ? (
                          <div className="relative">
                            👑
                            <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full" />
                          </div>
                        ) : (
                          `#${entry.rank}`
                        )}
                      </div>
                      <div className="text-4xl transform group-hover/entry:scale-110 transition-transform">
                        {entry.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm md:text-base flex items-center gap-2">
                          {entry.user}
                          {entry.user === profile.username && (
                            <Badge className="bg-accent/20 border-accent/40 text-accent text-[9px] px-1.5 py-0.5">
                              YOU
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Trophy
                              size={12}
                              weight="fill"
                              className={entry.rank <= 3 ? "text-accent" : ""}
                            />
                            Lvl {entry.level}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Target
                              size={12}
                              weight="fill"
                              className={entry.rank <= 3 ? "text-primary" : ""}
                            />
                            {entry.wins}W
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-black text-lg ${
                            entry.rank === 1
                              ? "text-accent neon-glow-secondary text-xl"
                              : entry.rank === 2
                                ? "text-secondary text-lg"
                                : entry.rank === 3
                                  ? "text-primary"
                                  : "text-primary"
                          }`}
                        >
                          {entry.profit}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">
                          All-time
                        </div>
                      </div>
                    </div>
                    {entry.rank <= 3 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="backdrop-blur-md bg-card/50 border-primary/30 shadow-[0_0_30px_oklch(0.72_0.20_195_/_0.1)] hover:shadow-[0_0_40px_oklch(0.72_0.20_195_/_0.2)] transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 grid-background opacity-5 pointer-events-none" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-1000" />

            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/20 border border-primary/40 jagged-corner-small">
                  <Rocket
                    size={28}
                    weight="duotone"
                    className="text-primary animate-pulse-glow"
                  />
                </div>
                <CardTitle className="text-xl font-black uppercase tracking-tight">
                  Your Progress
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="data-label text-xs flex items-center gap-2">
                    <Fire size={14} weight="fill" className="text-accent" />
                    Level {profile.level}
                  </span>
                  <span className="text-xs font-bold text-primary tabular-nums">
                    {profile.xp} / {profile.xpToNextLevel} XP
                  </span>
                </div>
                <div className="relative">
                  <Progress value={xpProgress} className="h-3 bg-muted/50" />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-full opacity-50 animate-pulse" />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {profile.xpToNextLevel - profile.xp} XP until Level{" "}
                    {profile.level + 1}
                  </p>
                  <span className="text-xs font-bold text-accent">
                    {xpProgress.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="data-label text-xs mb-3 flex items-center gap-2">
                  <Star size={14} weight="fill" className="text-accent" />
                  Active Badges
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((badge, i) => (
                    <Badge
                      key={i}
                      className="bg-secondary/20 border-secondary/50 text-secondary font-semibold text-xs hover:bg-secondary/30 hover:scale-105 transition-all cursor-default"
                    >
                      <Star size={12} weight="fill" className="mr-1" />
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="data-label text-xs">Quick Stats</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-primary/10 border border-primary/30 text-center">
                    <div className="text-lg font-black text-primary">
                      {profile.wins}
                    </div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider">
                      Total Wins
                    </div>
                  </div>
                  <div className="p-2 bg-accent/10 border border-accent/30 text-center">
                    <div className="text-lg font-black text-accent">
                      {profile.streak}
                    </div>
                    <div className="text-[9px] text-muted-foreground uppercase tracking-wider">
                      Win Streak
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-md bg-gradient-to-br from-accent/10 to-primary/10 border-primary/30 shadow-[0_0_30px_oklch(0.68_0.18_330_/_0.15)] hover:shadow-[0_0_40px_oklch(0.68_0.18_330_/_0.25)] transition-all duration-500 relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 diagonal-stripes opacity-5" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000" />

            <CardContent className="p-6 relative z-10">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-accent/20 border border-accent/40 jagged-corner-small flex-shrink-0 group-hover:scale-110 transition-transform">
                  <TrendUp size={32} weight="duotone" className="text-accent" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wide mb-1 flex items-center gap-2">
                    Keep Trading!
                    <Fire
                      size={16}
                      weight="fill"
                      className="text-accent animate-pulse"
                    />
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    Complete{" "}
                    <span className="text-accent font-bold">3 more</span>{" "}
                    successful trades to earn{" "}
                    <span className="text-accent font-bold">100 XP</span> bonus
                  </p>
                  <div className="flex gap-2 mt-3">
                    <div className="w-full h-1.5 bg-muted/30 relative overflow-hidden">
                      <div
                        className="h-full bg-accent animate-pulse"
                        style={{ width: "33%" }}
                      />
                    </div>
                    <div className="w-full h-1.5 bg-muted/30 relative overflow-hidden">
                      <div
                        className="h-full bg-accent/50 animate-pulse"
                        style={{ width: "0%", animationDelay: "0.2s" }}
                      />
                    </div>
                    <div className="w-full h-1.5 bg-muted/30 relative overflow-hidden">
                      <div
                        className="h-full bg-accent/50 animate-pulse"
                        style={{ width: "0%", animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      1/3 Complete
                    </span>
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                      +100 XP
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
