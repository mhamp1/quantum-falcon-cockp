// XP Benefits System — Compelling reasons to earn XP
// November 24, 2025 — Quantum Falcon Cockpit

export interface XPBenefit {
  id: string
  level: number
  title: string
  description: string
  icon: string
  category: 'strategy' | 'agent' | 'feature' | 'discount' | 'exclusive' | 'power'
  value: string | number
  unlocked: boolean
}

export interface XPLevelReward {
  level: number
  xpRequired: number
  benefits: XPBenefit[]
  celebration: {
    title: string
    message: string
    confetti: boolean
  }
}

// Exponential XP requirements
const calculateXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

export const XP_LEVEL_REWARDS: XPLevelReward[] = [
  {
    level: 5,
    xpRequired: calculateXPForLevel(5),
    benefits: [
      {
        id: 'flash-execution',
        level: 5,
        title: 'Flash Execution Mode',
        description: 'Priority trade routing - your trades execute 2x faster than standard users',
        icon: '⚡',
        category: 'power',
        value: '2x faster execution',
        unlocked: false
      },
      {
        id: 'strategy-unlock-1',
        level: 5,
        title: 'Unlock: Momentum Scalper',
        description: 'Access to advanced momentum trading strategy',
        icon: '📈',
        category: 'strategy',
        value: 'momentum-scalper',
        unlocked: false
      }
    ],
    celebration: {
      title: 'Level 5 Unlocked!',
      message: 'You\'ve unlocked Flash Execution and Momentum Scalper!',
      confetti: true
    }
  },
  {
    level: 10,
    xpRequired: calculateXPForLevel(10),
    benefits: [
      {
        id: 'sniper-mode',
        level: 10,
        title: 'Sniper Mode',
        description: 'Token launch detection - get notified 30 seconds before new token launches',
        icon: '🎯',
        category: 'feature',
        value: '30s early detection',
        unlocked: false
      },
      {
        id: 'agent-unlock-1',
        level: 10,
        title: 'Unlock: Market Sniper Agent',
        description: 'AI agent specialized in detecting and sniping new token launches',
        icon: '🤖',
        category: 'agent',
        value: 'market-sniper',
        unlocked: false
      },
      {
        id: 'discount-10',
        level: 10,
        title: '10% Upgrade Discount',
        description: 'Permanent 10% discount on all tier upgrades',
        icon: '💰',
        category: 'discount',
        value: 10,
        unlocked: false
      }
    ],
    celebration: {
      title: 'Level 10 Unlocked!',
      message: 'Sniper Mode activated! You\'re now a launch hunter.',
      confetti: true
    }
  },
  {
    level: 15,
    xpRequired: calculateXPForLevel(15),
    benefits: [
      {
        id: 'whale-tracker',
        level: 15,
        title: 'Whale Tracker Pro',
        description: 'Real-time tracking of top 100 whale wallets with instant alerts',
        icon: '🐋',
        category: 'feature',
        value: 'Top 100 whales',
        unlocked: false
      },
      {
        id: 'strategy-unlock-2',
        level: 15,
        title: 'Unlock: Whale Follow Strategy',
        description: 'Automatically copy trades from top-performing whale wallets',
        icon: '📊',
        category: 'strategy',
        value: 'whale-follow',
        unlocked: false
      },
      {
        id: 'xp-multiplier-1.5',
        level: 15,
        title: '1.5x XP Multiplier',
        description: 'Earn 50% more XP on all actions permanently',
        icon: '🔥',
        category: 'power',
        value: 1.5,
        unlocked: false
      }
    ],
    celebration: {
      title: 'Level 15 Unlocked!',
      message: 'Whale Tracker Pro activated! Follow the smart money.',
      confetti: true
    }
  },
  {
    level: 20,
    xpRequired: calculateXPForLevel(20),
    benefits: [
      {
        id: 'profit-amplifier',
        level: 20,
        title: 'Profit Amplifier',
        description: 'All profitable trades earn 10% bonus profit (up to $1000/day)',
        icon: '💎',
        category: 'power',
        value: '10% bonus profit',
        unlocked: false
      },
      {
        id: 'agent-unlock-2',
        level: 20,
        title: 'Unlock: Advanced RL Agent',
        description: 'Reinforcement Learning agent that adapts to market conditions',
        icon: '🧠',
        category: 'agent',
        value: 'rl-agent',
        unlocked: false
      },
      {
        id: 'discount-20',
        level: 20,
        title: '20% Upgrade Discount',
        description: 'Permanent 20% discount on all tier upgrades',
        icon: '💰',
        category: 'discount',
        value: 20,
        unlocked: false
      }
    ],
    celebration: {
      title: 'Level 20 Unlocked!',
      message: 'Profit Amplifier active! Every win is now bigger.',
      confetti: true
    }
  },
  {
    level: 25,
    xpRequired: calculateXPForLevel(25),
    benefits: [
      {
        id: 'sentiment-scanner',
        level: 25,
        title: 'Sentiment Scanner Pro',
        description: 'AI-powered social sentiment analysis across Twitter, Reddit, Discord',
        icon: '📡',
        category: 'feature',
        value: 'Multi-platform analysis',
        unlocked: false
      },
      {
        id: 'strategy-unlock-3',
        level: 25,
        title: 'Unlock: Sentiment Momentum',
        description: 'Trade based on real-time social sentiment shifts',
        icon: '🌊',
        category: 'strategy',
        value: 'sentiment-momentum',
        unlocked: false
      },
      {
        id: 'exclusive-community',
        level: 25,
        title: 'Elite Community Access',
        description: 'Access to private Discord channel with top traders',
        icon: '👑',
        category: 'exclusive',
        value: 'Private Discord',
        unlocked: false
      }
    ],
    celebration: {
      title: 'Level 25 Unlocked!',
      message: 'Sentiment Scanner Pro + Elite Community access unlocked!',
      confetti: true
    }
  },
  {
    level: 30,
    xpRequired: calculateXPForLevel(30),
    benefits: [
      {
        id: 'zero-fees',
        level: 30,
        title: 'Zero Trading Fees',
        description: 'All trading fees waived permanently (save thousands per month)',
        icon: '💸',
        category: 'power',
        value: '100% fee waiver',
        unlocked: false
      },
      {
        id: 'custom-strategies',
        level: 30,
        title: 'Custom Strategy Builder',
        description: 'Build unlimited custom strategies with visual editor',
        icon: '🛠️',
        category: 'feature',
        value: 'Unlimited strategies',
        unlocked: false
      },
      {
        id: 'discount-30',
        level: 30,
        title: '30% Upgrade Discount',
        description: 'Permanent 30% discount on all tier upgrades',
        icon: '💰',
        category: 'discount',
        value: 30,
        unlocked: false
      }
    ],
    celebration: {
      title: 'Level 30 Unlocked!',
      message: 'Zero fees + Custom strategies! You\'re now a power user.',
      confetti: true
    }
  },
]

export const XP_ACTIONS: Record<string, { xp: number; description: string }> = {
  // Core trading actions
  trade_execution: { xp: 10, description: 'Execute a trade' },
  trade: { xp: 50, description: 'Complete a trade' },
  profitable_trade: { xp: 50, description: 'Close a profitable trade' },
  big_win: { xp: 200, description: 'Close a trade with $100+ profit' },
  
  // Swap panel trades
  'swap-trade': { xp: 50, description: 'Execute a swap' },
  'paper-trade': { xp: 10, description: 'Paper trade executed' },
  
  // Strategy trades
  'strategy-trade': { xp: 75, description: 'Strategy trade executed' },
  
  // DCA and snipe trades
  'dca-trade': { xp: 100, description: 'DCA order executed' },
  'snipe-trade': { xp: 150, description: 'Token snipe executed' },
  
  // Autonomous trading
  'autonomous-trade': { xp: 100, description: 'Autonomous trade executed' },
  
  // Streaks and login
  daily_login: { xp: 5, description: 'Daily login bonus' },
  streak_7: { xp: 500, description: '7-day trading streak' },
  streak_30: { xp: 2000, description: '30-day trading streak' },
  
  // Social and sharing
  strategy_share: { xp: 30, description: 'Share a strategy' },
  
  // Quests and achievements
  quest_complete: { xp: 100, description: 'Complete a quest' },
  achievement_unlock: { xp: 25, description: 'Unlock an achievement' },
  
  // NFT minting
  'nft-mint': { xp: 200, description: 'Mint an NFT' },
  
  // Referrals
  referral: { xp: 100, description: 'Successful referral' },
  
  // Tutorial
  tutorial_complete: { xp: 100, description: 'Complete tutorial' },
  
  // Profit milestones
  first_profit: { xp: 150, description: 'First profitable trade' },
  milestone_1k: { xp: 500, description: 'Reach $1,000 profit' },
  milestone_10k: { xp: 2000, description: 'Reach $10,000 profit' },
  milestone_100k: { xp: 10000, description: 'Reach $100,000 profit' }
}

export function getBenefitsForLevel(level: number): XPBenefit[] {
  const rewards = XP_LEVEL_REWARDS.filter(r => r.level <= level)
  return rewards.flatMap(r => r.benefits)
}

export function getNextLevelReward(currentLevel: number): XPLevelReward | null {
  return XP_LEVEL_REWARDS.find(r => r.level > currentLevel) || null
}

export function getXPForLevel(level: number): number {
  return calculateXPForLevel(level)
}

