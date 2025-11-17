export interface LicenseTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  strategiesUnlocked: string[];
  maxAgents: number;
  xpMultiplier: number;
  specialPerks: string[];
}

export interface UserLicense {
  userId: string;
  tier: "free" | "starter" | "trader" | "pro" | "elite" | "lifetime";
  expiresAt: number | null;
  purchasedAt: number;
  isActive: boolean;
  transactionId?: string;
}

export interface UserAuth {
  isAuthenticated: boolean;
  userId: string | null;
  username: string | null;
  email: string | null;
  avatar: string | null;
  license: UserLicense | null;
}

export const LICENSE_TIERS: Record<string, LicenseTier> = {
  free: {
    id: "free",
    name: "Free Tier",
    price: 0,
    features: [
      "Paper Trading with Live Data",
      "Basic Dashboard Access",
      "1 AI Agent (Market Analysis)",
      "Limited Analytics",
      "Community Access",
      "Forum Posting",
    ],
    strategiesUnlocked: ["DCA Basic", "Paper Trading"],
    maxAgents: 1,
    xpMultiplier: 1,
    specialPerks: ["Full Paper Trading Mode"],
  },
  starter: {
    id: "starter",
    name: "Starter",
    price: 29,
    features: [
      "Everything in Free",
      "Live Trading Enabled",
      "1 AI Agent",
      "Basic Analytics Dashboard",
      "RSI Strategy",
      "Email Support",
      "1.5x XP Multiplier",
    ],
    strategiesUnlocked: [
      "DCA Basic",
      "DCA Advanced",
      "RSI Strategy",
      "Paper Trading",
    ],
    maxAgents: 1,
    xpMultiplier: 1.5,
    specialPerks: ["Live Trading Access", "Basic Strategy Library"],
  },
  trader: {
    id: "trader",
    name: "Trader",
    price: 79,
    features: [
      "Everything in Starter",
      "2 AI Agents (Market + Strategy)",
      "Enhanced Analytics",
      "MACD & Momentum Strategies",
      "Priority Support",
      "2x XP Multiplier",
      "Speed Boost Access",
    ],
    strategiesUnlocked: [
      "DCA Basic",
      "DCA Advanced",
      "RSI Strategy",
      "MACD Strategy",
      "Momentum Basic",
      "Paper Trading",
    ],
    maxAgents: 2,
    xpMultiplier: 2,
    specialPerks: [
      "Speed Boost Access",
      "Priority Trade Execution",
      "Enhanced Analytics",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro Trader",
    price: 197,
    features: [
      "Everything in Trader",
      "3 AI Agents (Full Suite)",
      "Advanced Analytics Suite",
      "All Advanced Strategies",
      "Token Sniping",
      "Bollinger Bands & Mean Reversion",
      "VIP Support",
      "3x XP Multiplier",
    ],
    strategiesUnlocked: [
      "DCA Basic",
      "DCA Advanced",
      "Momentum Basic",
      "Momentum Advanced",
      "RSI Strategy",
      "MACD Strategy",
      "Bollinger Bands",
      "Mean Reversion",
      "Token Sniping",
      "Paper Trading",
    ],
    maxAgents: 3,
    xpMultiplier: 3,
    specialPerks: [
      "Speed Boost Access",
      "Premium Signals Access",
      "Priority Sniping",
      "Advanced AI Analysis",
    ],
  },
  elite: {
    id: "elite",
    name: "Elite Trader",
    price: 497,
    features: [
      "Everything in Pro",
      "5 AI Agents",
      "Custom Strategy Builder",
      "Arbitrage Scanner",
      "All Premium Strategies",
      "VIP Community Access",
      "Custom AI Training",
      "White-Label Options",
      "4x XP Multiplier",
      "Exclusive Market Signals",
    ],
    strategiesUnlocked: [
      "DCA Basic",
      "DCA Advanced",
      "Momentum Basic",
      "Momentum Advanced",
      "RSI Strategy",
      "MACD Strategy",
      "Bollinger Bands",
      "Mean Reversion",
      "Token Sniping",
      "Arbitrage Scanner",
      "Custom Strategies",
      "Paper Trading",
    ],
    maxAgents: 5,
    xpMultiplier: 4,
    specialPerks: [
      "All Speed & Signal Access",
      "Profit Multiplier (1.5x)",
      "Priority Everything",
      "Custom Strategy Development",
      "VIP Discord Access",
    ],
  },
  lifetime: {
    id: "lifetime",
    name: "Lifetime Access",
    price: 8000,
    features: [
      "Everything in Elite",
      "Lifetime License (Never Expires)",
      "All Future Strategies Unlocked",
      "Unlimited AI Agents",
      "Custom AI Agent Training",
      "White-Glove Support",
      "API Access",
      "Custom Bot Integration",
      "5x XP Multiplier",
      "Founder Badge",
      "Beta Feature Access",
    ],
    strategiesUnlocked: ["ALL"],
    maxAgents: 999,
    xpMultiplier: 5,
    specialPerks: [
      "All Perks Unlocked Forever",
      "Custom Strategy Development",
      "Dedicated Account Manager",
      "Lifetime Updates",
      "VIP Discord Channel",
      "Early Access to All Features",
    ],
  },
};

export function getRemainingTime(expiresAt: number | null): {
  days: number;
  hours: number;
  minutes: number;
  expired: boolean;
} {
  if (!expiresAt) {
    return { days: 999999, hours: 0, minutes: 0, expired: false };
  }

  const now = Date.now();
  const diff = expiresAt - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, expired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, expired: false };
}

export function canAccessFeature(
  userTier: string,
  requiredTier: string,
): boolean {
  const tierHierarchy = [
    "free",
    "starter",
    "trader",
    "pro",
    "elite",
    "lifetime",
  ];
  const userLevel = tierHierarchy.indexOf(userTier);
  const requiredLevel = tierHierarchy.indexOf(requiredTier);
  return userLevel >= requiredLevel;
}
