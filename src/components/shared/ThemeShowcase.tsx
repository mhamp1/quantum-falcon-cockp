import { useState } from "react";
import {
  Sparkle,
  Rocket,
  Trophy,
  Star,
  Lightning,
} from "@phosphor-icons/react";

import {
  HolographicCard,
  HolographicCardHeader,
  HolographicCardTitle,
  HolographicCardDescription,
  HolographicCardContent,
} from "@/components/ui/holographic-card";
import { NeonProgress } from "@/components/ui/neon-progress";
import { NeonToast } from "@/components/ui/neon-toast";
import { NeonBadge } from "@/components/ui/neon-badge";

export default function ThemeShowcase() {
  const [xpValue, setXpValue] = useState(750);
  const maxXP = 1000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyberpunk-dark via-cyberpunk-darker to-cyberpunk-dark p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold uppercase tracking-[0.15em] mb-2">
            <span className="text-primary neon-glow-primary">CYBERPUNK</span>{" "}
            <span className="text-secondary neon-glow-secondary">
              NEON THEME
            </span>
          </h1>
          <p className="text-muted-foreground uppercase tracking-wide text-sm">
            Solana-Inspired Design System
          </p>
        </div>

        {/* Color Palette Section */}
        <HolographicCard className="mb-8">
          <HolographicCardHeader>
            <HolographicCardTitle>Color Palette</HolographicCardTitle>
            <HolographicCardDescription>
              Solana Brand Colors
            </HolographicCardDescription>
          </HolographicCardHeader>
          <HolographicCardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-20 bg-solana-green rounded border-2 border-solana-green shadow-[0_0_20px_#14F195]" />
                <p className="text-xs font-mono text-center">#14F195</p>
                <p className="text-xs text-center text-muted-foreground uppercase">
                  Solana Green
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-solana-purple rounded border-2 border-solana-purple shadow-[0_0_20px_#9945FF]" />
                <p className="text-xs font-mono text-center">#9945FF</p>
                <p className="text-xs text-center text-muted-foreground uppercase">
                  Solana Purple
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-cyberpunk-dark rounded border-2 border-primary/30" />
                <p className="text-xs font-mono text-center">#0A0E27</p>
                <p className="text-xs text-center text-muted-foreground uppercase">
                  Dark Background
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-cyberpunk-darker rounded border-2 border-primary/30" />
                <p className="text-xs font-mono text-center">#1A1F3A</p>
                <p className="text-xs text-center text-muted-foreground uppercase">
                  Darker Background
                </p>
              </div>
            </div>
          </HolographicCardContent>
        </HolographicCard>

        {/* Holographic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <HolographicCard variant="primary" glow pulse>
            <HolographicCardHeader>
              <div className="flex items-center gap-3">
                <Sparkle
                  size={24}
                  weight="duotone"
                  className="text-primary neon-glow-primary"
                />
                <HolographicCardTitle className="text-xl">
                  Primary Card
                </HolographicCardTitle>
              </div>
              <HolographicCardDescription>
                With glow and pulse effect
              </HolographicCardDescription>
            </HolographicCardHeader>
            <HolographicCardContent>
              <p className="text-sm text-muted-foreground">
                This card features the primary color variant with animated glow
                and pulse effects for maximum visual impact.
              </p>
            </HolographicCardContent>
          </HolographicCard>

          <HolographicCard variant="secondary" glow>
            <HolographicCardHeader>
              <div className="flex items-center gap-3">
                <Rocket
                  size={24}
                  weight="duotone"
                  className="text-secondary neon-glow-secondary"
                />
                <HolographicCardTitle className="text-xl">
                  Secondary Card
                </HolographicCardTitle>
              </div>
              <HolographicCardDescription>
                With subtle glow effect
              </HolographicCardDescription>
            </HolographicCardHeader>
            <HolographicCardContent>
              <p className="text-sm text-muted-foreground">
                Secondary variant showcases the Solana purple theme with smooth
                transitions and neon aesthetics.
              </p>
            </HolographicCardContent>
          </HolographicCard>

          <HolographicCard variant="accent" glow>
            <HolographicCardHeader>
              <div className="flex items-center gap-3">
                <Lightning
                  size={24}
                  weight="duotone"
                  className="text-primary neon-glow-primary"
                />
                <HolographicCardTitle className="text-xl">
                  Accent Card
                </HolographicCardTitle>
              </div>
              <HolographicCardDescription>
                Solana green variant
              </HolographicCardDescription>
            </HolographicCardHeader>
            <HolographicCardContent>
              <p className="text-sm text-muted-foreground">
                Accent card uses the iconic Solana green for special highlights
                and call-to-action elements.
              </p>
            </HolographicCardContent>
          </HolographicCard>
        </div>

        {/* Progress Bars */}
        <HolographicCard className="mb-8">
          <HolographicCardHeader>
            <HolographicCardTitle>XP Progress Bars</HolographicCardTitle>
            <HolographicCardDescription>
              Neon-themed progress indicators
            </HolographicCardDescription>
          </HolographicCardHeader>
          <HolographicCardContent className="space-y-6">
            <NeonProgress
              value={xpValue}
              max={maxXP}
              variant="primary"
              showLabel
              label="Level 7 Progress"
              animate
            />
            <NeonProgress
              value={650}
              max={1000}
              variant="secondary"
              showLabel
              label="Quest Completion"
              animate
            />
            <NeonProgress
              value={850}
              max={1000}
              variant="accent"
              showLabel
              label="Achievement Progress"
              animate
            />

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setXpValue(Math.max(0, xpValue - 100))}
                className="neon-button px-4 py-2 rounded text-sm font-bold uppercase tracking-wide"
              >
                -100 XP
              </button>
              <button
                onClick={() => setXpValue(Math.min(maxXP, xpValue + 100))}
                className="neon-button px-4 py-2 rounded text-sm font-bold uppercase tracking-wide"
              >
                +100 XP
              </button>
            </div>
          </HolographicCardContent>
        </HolographicCard>

        {/* Badges */}
        <HolographicCard className="mb-8">
          <HolographicCardHeader>
            <HolographicCardTitle>Neon Badges</HolographicCardTitle>
            <HolographicCardDescription>
              Status indicators and tags
            </HolographicCardDescription>
          </HolographicCardHeader>
          <HolographicCardContent>
            <div className="flex flex-wrap gap-3">
              <NeonBadge variant="primary" glow>
                <Star size={12} weight="fill" />
                <span>Level 7</span>
              </NeonBadge>
              <NeonBadge variant="secondary" glow>
                <Trophy size={12} weight="fill" />
                <span>Elite Trader</span>
              </NeonBadge>
              <NeonBadge variant="accent" glow pulse>
                <Lightning size={12} weight="fill" />
                <span>Active</span>
              </NeonBadge>
              <NeonBadge variant="success" glow>
                <span>Verified</span>
              </NeonBadge>
              <NeonBadge variant="warning" glow>
                <span>Pending</span>
              </NeonBadge>
            </div>
          </HolographicCardContent>
        </HolographicCard>

        {/* Toast Notifications */}
        <HolographicCard>
          <HolographicCardHeader>
            <HolographicCardTitle>Notification Toasts</HolographicCardTitle>
            <HolographicCardDescription>
              System alerts and messages
            </HolographicCardDescription>
          </HolographicCardHeader>
          <HolographicCardContent className="space-y-4">
            <NeonToast
              variant="success"
              title="Trade Executed Successfully"
              description="Your order was filled at market price. +50 XP earned!"
            />
            <NeonToast
              variant="info"
              title="AI Agent Update"
              description="Market analysis agent has detected a profitable opportunity."
            />
            <NeonToast
              variant="warning"
              title="Portfolio Alert"
              description="Your BTC vault balance is approaching the target threshold."
            />
            <NeonToast
              variant="error"
              title="Connection Issue"
              description="Unable to connect to the trading server. Retrying..."
            />
          </HolographicCardContent>
        </HolographicCard>

        {/* Animation Examples */}
        <HolographicCard className="mt-8">
          <HolographicCardHeader>
            <HolographicCardTitle>Animations</HolographicCardTitle>
            <HolographicCardDescription>
              Smooth transitions and effects
            </HolographicCardDescription>
          </HolographicCardHeader>
          <HolographicCardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-2">
                <div className="h-16 w-16 mx-auto bg-primary/20 border-2 border-primary rounded-full animate-pulse-glow flex items-center justify-center">
                  <Sparkle size={24} className="text-primary" />
                </div>
                <p className="text-xs text-muted-foreground uppercase">
                  Pulse Glow
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-16 w-16 mx-auto bg-secondary/20 border-2 border-secondary rounded-full animate-pulse-slow flex items-center justify-center">
                  <Rocket size={24} className="text-secondary" />
                </div>
                <p className="text-xs text-muted-foreground uppercase">
                  Pulse Slow
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-16 w-16 mx-auto bg-gradient-to-r from-primary to-secondary animate-shimmer rounded-full flex items-center justify-center">
                  <Lightning size={24} className="text-white" />
                </div>
                <p className="text-xs text-muted-foreground uppercase">
                  Shimmer
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="h-16 w-16 mx-auto bg-primary/20 border-2 border-primary rounded-full animate-neon-flicker flex items-center justify-center">
                  <Trophy size={24} className="text-primary" />
                </div>
                <p className="text-xs text-muted-foreground uppercase">
                  Neon Flicker
                </p>
              </div>
            </div>
          </HolographicCardContent>
        </HolographicCard>
      </div>
    </div>
  );
}
