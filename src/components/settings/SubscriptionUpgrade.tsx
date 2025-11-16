import {
  CheckCircle,
  Crown,
  Lightning,
  Sparkle,
  X,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SubscriptionUpgradeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tier: "free" | "starter" | "trader" | "pro" | "elite" | "lifetime";
}

const tierDetails = {
  free: {
    name: "Free",
    price: "$0",
    period: "forever",
    color: "oklch(0.50 0.10 195)",
    features: [
      "Paper trading with live data",
      "1 AI agent (Market Analysis)",
      "Basic analytics dashboard",
      "Community access",
      "Forum posting & discussion",
      "Educational resources",
    ],
    limitations: [
      "No live trading",
      "Limited to 1 agent",
      "Basic strategy only",
    ],
    upgradeUrl: undefined,
  },
  starter: {
    name: "Starter",
    price: "$29",
    period: "per month",
    color: "oklch(0.72 0.20 195)",
    features: [
      "Live trading enabled",
      "1 AI agent",
      "Basic analytics",
      "RSI strategy",
      "Email support",
      "1.5x XP multiplier",
      "Everything in Free",
    ],
    limitations: undefined,
    upgradeUrl: "https://quantumfalcon.ai/upgrade/starter",
  },
  trader: {
    name: "Trader",
    price: "$79",
    period: "per month",
    color: "oklch(0.68 0.18 330)",
    features: [
      "2 AI agents",
      "Enhanced analytics",
      "MACD & Momentum strategies",
      "Priority support",
      "2x XP multiplier",
      "Speed boost access",
      "Custom alerts",
      "Everything in Starter",
    ],
    limitations: undefined,
    upgradeUrl: "https://quantumfalcon.ai/upgrade/trader",
  },
  pro: {
    name: "Pro",
    price: "$197",
    period: "per month",
    color: "oklch(0.65 0.25 25)",
    features: [
      "3 AI agents",
      "Advanced analytics",
      "All advanced strategies",
      "Token sniping",
      "Bollinger bands strategy",
      "VIP support (24/7)",
      "3x XP multiplier",
      "API access",
      "Everything in Trader",
    ],
    limitations: undefined,
    upgradeUrl: "https://quantumfalcon.ai/upgrade/pro",
  },
  elite: {
    name: "Elite",
    price: "$497",
    period: "per month",
    color: "oklch(0.80 0.20 70)",
    features: [
      "5 AI agents",
      "Custom strategy builder",
      "Arbitrage scanner",
      "All premium strategies",
      "VIP community access",
      "Custom AI agent training",
      "White-label options",
      "4x XP multiplier",
      "Dedicated account manager",
      "Everything in Pro",
    ],
    limitations: undefined,
    upgradeUrl: "https://quantumfalcon.ai/upgrade/elite",
  },
  lifetime: {
    name: "Lifetime",
    price: "$8,000",
    period: "one-time",
    color: "oklch(0.85 0.25 60)",
    features: [
      "Everything in Elite",
      "Unlimited AI agents",
      "Lifetime access",
      "All future strategies included",
      "Full API access",
      "Custom bot integration",
      "5x XP multiplier",
      "Founder badge",
      "Beta access to new features",
      "Priority feature requests",
      "Exclusive founder community",
    ],
    limitations: undefined,
    upgradeUrl: "https://quantumfalcon.ai/upgrade/lifetime",
  },
};

export default function SubscriptionUpgrade({
  open,
  onOpenChange,
  tier,
}: SubscriptionUpgradeProps) {
  const details = tierDetails[tier];

  const handleUpgrade = () => {
    if (details.upgradeUrl) {
      window.open(details.upgradeUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[600px] cyber-card border-2 p-0 gap-0 overflow-hidden"
        style={{ borderColor: details.color }}
      >
        <div className="absolute inset-0 technical-grid opacity-5 pointer-events-none" />
        <div
          className="absolute inset-0 bg-gradient-to-br from-transparent via-current/10 to-transparent pointer-events-none"
          style={{ color: details.color }}
        />

        <motion.div
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: `linear-gradient(90deg, ${details.color}, transparent)`,
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
        />

        <DialogHeader
          className="p-6 pb-4 border-b relative z-10"
          style={{ borderColor: `${details.color}40` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="p-3 jagged-corner-small border-2 relative overflow-hidden"
                style={{
                  backgroundColor: `${details.color}20`,
                  borderColor: `${details.color}60`,
                }}
              >
                {tier === "lifetime" ? (
                  <Sparkle
                    size={24}
                    weight="fill"
                    style={{ color: details.color }}
                  />
                ) : tier === "elite" ? (
                  <Crown
                    size={24}
                    weight="fill"
                    style={{ color: details.color }}
                  />
                ) : (
                  <Lightning
                    size={24}
                    weight="duotone"
                    style={{ color: details.color }}
                  />
                )}
              </div>
              <div>
                <DialogTitle
                  className="text-2xl font-bold uppercase tracking-[0.15em] hud-text"
                  style={{ color: details.color }}
                >
                  {details.name} Tier
                </DialogTitle>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
                  Upgrade your trading experience
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6 relative z-10 max-h-[60vh] overflow-y-auto scrollbar-thin">
          <div
            className="text-center p-6 jagged-corner relative overflow-hidden"
            style={{
              backgroundColor: `${details.color}10`,
              border: `2px solid ${details.color}40`,
            }}
          >
            <div className="absolute inset-0 diagonal-stripes opacity-10" />
            <div className="relative z-10">
              <div
                className="text-5xl font-black hud-value mb-2"
                style={{
                  color: details.color,
                  textShadow: `0 0 20px ${details.color}`,
                }}
              >
                {details.price}
              </div>
              <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground font-bold">
                {details.period}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-[0.15em] text-primary flex items-center gap-2">
              <CheckCircle size={16} weight="fill" className="text-primary" />
              What's Included
            </h4>

            <div className="space-y-2">
              {details.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-2 p-2 hover:bg-muted/10 transition-colors angled-corner-br"
                >
                  <CheckCircle
                    size={14}
                    weight="fill"
                    style={{
                      color: details.color,
                      minWidth: "14px",
                      marginTop: "2px",
                    }}
                  />
                  <span className="text-sm text-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {details.limitations && details.limitations.length > 0 && (
            <div className="p-4 jagged-corner-small bg-destructive/10 border border-destructive/30">
              <h4 className="text-xs font-bold uppercase tracking-wider text-destructive mb-2">
                Limitations
              </h4>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {details.limitations.map((limitation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">•</span>
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {details.upgradeUrl && (
            <div className="p-4 jagged-corner-small bg-accent/10 border border-accent/30">
              <p className="text-xs text-muted-foreground">
                Your subscription will be processed securely. You can cancel
                anytime from your account settings.
              </p>
            </div>
          )}
        </div>

        <div
          className="p-6 pt-4 border-t relative z-10"
          style={{ borderColor: `${details.color}40` }}
        >
          {details.upgradeUrl ? (
            <Button
              onClick={handleUpgrade}
              className="w-full py-6 text-base font-bold uppercase tracking-[0.2em] jagged-corner border-2 transition-all"
              style={{
                backgroundColor: `${details.color}20`,
                borderColor: details.color,
                color: details.color,
                boxShadow: `0 0 20px ${details.color}40`,
              }}
            >
              <Lightning size={20} weight="fill" className="mr-2" />
              Upgrade to {details.name}
            </Button>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">
                You're currently on the Free tier. Upgrade to unlock live
                trading and more features!
              </p>
              <Button
                onClick={() => {
                  onOpenChange(false);
                }}
                variant="outline"
                className="border-primary/50 hover:border-primary hover:bg-primary/10 jagged-corner-small"
              >
                View Other Tiers
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
