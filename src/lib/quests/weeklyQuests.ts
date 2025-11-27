// QUANTUM FALCON WEEKLY QUESTS — 500 Unique Quests with Weekly Rotation
// November 26, 2025 — Launch Day Edition
// Addictive, tiered, NFT-rewarded quest system

export type QuestCategory = 'Trading' | 'Learning' | 'Social' | 'Milestone' | 'Daily' | 'Weekly' | 'Achievement' | 'Special'
export type QuestDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Extreme'
export type QuestTier = 'Free' | 'Starter' | 'Trader' | 'Pro' | 'Elite'
export type QuestType = 'trades' | 'profit' | 'streak' | 'learning' | 'social' | 'volume' | 'winrate' | 'custom'
export type NFTRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary'

export interface WeeklyQuest {
  id: string
  title: string
  description: string
  category: QuestCategory
  difficulty: QuestDifficulty
  tierRequired: QuestTier
  xpReward: number
  nftReward: boolean
  nftRarity?: NFTRarity
  goal: number
  type: QuestType
  icon?: string
}

// Seed-based random number generator for weekly rotation
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
}

// Get current week number
function getWeekNumber(): number {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - start.getTime()
  const oneWeek = 1000 * 60 * 60 * 24 * 7
  return Math.floor(diff / oneWeek)
}

// Trading Quests (200)
const TRADING_QUESTS: Omit<WeeklyQuest, 'id'>[] = [
  // Profit Targets (50)
  { title: 'First Dollar', description: 'Earn your first $1 profit', category: 'Trading', difficulty: 'Easy', tierRequired: 'Free', xpReward: 50, nftReward: true, nftRarity: 'Common', goal: 1, type: 'profit' },
  { title: 'Five Dollar Bill', description: 'Earn $5 in profit', category: 'Trading', difficulty: 'Easy', tierRequired: 'Free', xpReward: 75, nftReward: false, goal: 5, type: 'profit' },
  { title: 'Ten Spot', description: 'Earn $10 in profit', category: 'Trading', difficulty: 'Easy', tierRequired: 'Free', xpReward: 100, nftReward: true, nftRarity: 'Common', goal: 10, type: 'profit' },
  { title: 'Quarter Century', description: 'Earn $25 in profit', category: 'Trading', difficulty: 'Easy', tierRequired: 'Free', xpReward: 150, nftReward: false, goal: 25, type: 'profit' },
  { title: 'Half Century', description: 'Earn $50 in profit', category: 'Trading', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 200, nftReward: false, goal: 50, type: 'profit' },
  { title: 'Century Club', description: 'Earn $100 in profit', category: 'Trading', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 300, nftReward: true, nftRarity: 'Common', goal: 100, type: 'profit' },
  { title: 'Two Fifty', description: 'Earn $250 in profit', category: 'Trading', difficulty: 'Medium', tierRequired: 'Trader', xpReward: 400, nftReward: false, goal: 250, type: 'profit' },
  { title: 'Five Hundred', description: 'Earn $500 in profit', category: 'Trading', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 600, nftReward: true, nftRarity: 'Rare', goal: 500, type: 'profit' },
  { title: 'Grand Slam', description: 'Earn $1,000 in profit', category: 'Trading', difficulty: 'Hard', tierRequired: 'Pro', xpReward: 1000, nftReward: true, nftRarity: 'Rare', goal: 1000, type: 'profit' },
  { title: 'Two Grand', description: 'Earn $2,000 in profit', category: 'Trading', difficulty: 'Hard', tierRequired: 'Pro', xpReward: 1500, nftReward: false, goal: 2000, type: 'profit' },
  { title: 'Five K Club', description: 'Earn $5,000 in profit', category: 'Trading', difficulty: 'Extreme', tierRequired: 'Elite', xpReward: 2500, nftReward: true, nftRarity: 'Epic', goal: 5000, type: 'profit' },
  { title: 'Ten K Legend', description: 'Earn $10,000 in profit', category: 'Trading', difficulty: 'Extreme', tierRequired: 'Elite', xpReward: 4000, nftReward: true, nftRarity: 'Legendary', goal: 10000, type: 'profit' },
  { title: 'Quarter Master', description: 'Earn $25,000 in profit', category: 'Trading', difficulty: 'Extreme', tierRequired: 'Elite', xpReward: 5000, nftReward: true, nftRarity: 'Legendary', goal: 25000, type: 'profit' },
  { title: 'Morning Profit', description: 'Earn $20 before noon', category: 'Trading', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 250, nftReward: false, goal: 20, type: 'profit' },
  { title: 'Night Owl Gains', description: 'Earn $30 after midnight', category: 'Trading', difficulty: 'Medium', tierRequired: 'Trader', xpReward: 300, nftReward: false, goal: 30, type: 'profit' },
  { title: 'Weekend Warrior', description: 'Earn $100 on weekend', category: 'Trading', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 500, nftReward: false, goal: 100, type: 'profit' },
  { title: 'Quick Flip', description: 'Profit $5 in under 1 minute', category: 'Trading', difficulty: 'Hard', tierRequired: 'Pro', xpReward: 400, nftReward: false, goal: 5, type: 'profit' },
  { title: 'Micro Profits', description: 'Earn 10 profits under $1 each', category: 'Trading', difficulty: 'Easy', tierRequired: 'Free', xpReward: 100, nftReward: false, goal: 10, type: 'trades' },
  { title: 'Consistent Gains', description: 'Profit on 5 consecutive trades', category: 'Trading', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 350, nftReward: false, goal: 5, type: 'streak' },
  { title: 'Double Down', description: 'Double your daily profit goal', category: 'Trading', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 500, nftReward: false, goal: 2, type: 'custom' },
  // Trade Count (50)
  { title: 'First Trade', description: 'Execute your first trade', category: 'Trading', difficulty: 'Easy', tierRequired: 'Free', xpReward: 25, nftReward: true, nftRarity: 'Common', goal: 1, type: 'trades' },
  { title: 'Getting Started', description: 'Complete 5 trades', category: 'Trading', difficulty: 'Easy', tierRequired: 'Free', xpReward: 50, nftReward: false, goal: 5, type: 'trades' },
  { title: 'Trading Rookie', description: 'Complete 10 trades', category: 'Trading', difficulty: 'Easy', tierRequired: 'Free', xpReward: 75, nftReward: false, goal: 10, type: 'trades' },
  { title: 'Quarter Hundred', description: 'Complete 25 trades', category: 'Trading', difficulty: 'Easy', tierRequired: 'Free', xpReward: 125, nftReward: false, goal: 25, type: 'trades' },
  { title: 'Half Century Trades', description: 'Complete 50 trades', category: 'Trading', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 200, nftReward: true, nftRarity: 'Common', goal: 50, type: 'trades' },
  { title: 'Century Trader', description: 'Complete 100 trades', category: 'Trading', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 350, nftReward: true, nftRarity: 'Rare', goal: 100, type: 'trades' },
  { title: 'Two Fifty Trades', description: 'Complete 250 trades', category: 'Trading', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 600, nftReward: false, goal: 250, type: 'trades' },
  { title: 'Five Hundred Trades', description: 'Complete 500 trades', category: 'Trading', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 1000, nftReward: true, nftRarity: 'Rare', goal: 500, type: 'trades' },
  { title: 'Thousand Club', description: 'Complete 1,000 trades', category: 'Trading', difficulty: 'Extreme', tierRequired: 'Pro', xpReward: 2000, nftReward: true, nftRarity: 'Epic', goal: 1000, type: 'trades' },
  { title: 'Trading Machine', description: 'Complete 2,500 trades', category: 'Trading', difficulty: 'Extreme', tierRequired: 'Pro', xpReward: 3500, nftReward: false, goal: 2500, type: 'trades' },
  { title: 'Five K Trades', description: 'Complete 5,000 trades', category: 'Trading', difficulty: 'Extreme', tierRequired: 'Elite', xpReward: 5000, nftReward: true, nftRarity: 'Legendary', goal: 5000, type: 'trades' },
  { title: 'Speed Trader', description: 'Complete 10 trades in 1 hour', category: 'Trading', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 200, nftReward: false, goal: 10, type: 'trades' },
  { title: 'Trading Blitz', description: 'Complete 25 trades in 1 hour', category: 'Trading', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 400, nftReward: false, goal: 25, type: 'trades' },
  { title: 'Daily Dozen', description: 'Complete 12 trades today', category: 'Trading', difficulty: 'Easy', tierRequired: 'Free', xpReward: 100, nftReward: false, goal: 12, type: 'trades' },
  { title: 'Trading Marathon', description: 'Complete 50 trades today', category: 'Trading', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 500, nftReward: false, goal: 50, type: 'trades' },
  // Win Rate (30)
  { title: 'First Win', description: 'Win your first trade', category: 'Trading', difficulty: 'Easy', tierRequired: 'Free', xpReward: 30, nftReward: true, nftRarity: 'Common', goal: 1, type: 'winrate' },
  { title: 'Five Wins', description: 'Win 5 trades', category: 'Trading', difficulty: 'Easy', tierRequired: 'Free', xpReward: 75, nftReward: false, goal: 5, type: 'winrate' },
  { title: 'Ten Wins', description: 'Win 10 trades', category: 'Trading', difficulty: 'Easy', tierRequired: 'Free', xpReward: 100, nftReward: false, goal: 10, type: 'winrate' },
  { title: 'Winning Streak 3', description: 'Win 3 trades in a row', category: 'Trading', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 150, nftReward: false, goal: 3, type: 'streak' },
  { title: 'Winning Streak 5', description: 'Win 5 trades in a row', category: 'Trading', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 250, nftReward: true, nftRarity: 'Common', goal: 5, type: 'streak' },
  { title: 'Winning Streak 10', description: 'Win 10 trades in a row', category: 'Trading', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 500, nftReward: true, nftRarity: 'Rare', goal: 10, type: 'streak' },
  { title: 'Winning Streak 20', description: 'Win 20 trades in a row', category: 'Trading', difficulty: 'Extreme', tierRequired: 'Pro', xpReward: 1500, nftReward: true, nftRarity: 'Epic', goal: 20, type: 'streak' },
  { title: '50% Win Rate', description: 'Maintain 50% win rate over 20 trades', category: 'Trading', difficulty: 'Easy', tierRequired: 'Free', xpReward: 100, nftReward: false, goal: 50, type: 'winrate' },
  { title: '60% Win Rate', description: 'Maintain 60% win rate over 50 trades', category: 'Trading', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 200, nftReward: false, goal: 60, type: 'winrate' },
  { title: '70% Win Rate', description: 'Maintain 70% win rate over 100 trades', category: 'Trading', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 400, nftReward: true, nftRarity: 'Rare', goal: 70, type: 'winrate' },
  { title: '80% Win Rate', description: 'Maintain 80% win rate over 100 trades', category: 'Trading', difficulty: 'Extreme', tierRequired: 'Pro', xpReward: 1000, nftReward: true, nftRarity: 'Epic', goal: 80, type: 'winrate' },
  // Strategy Usage (30)
  { title: 'DCA Master', description: 'Execute 10 DCA trades', category: 'Trading', difficulty: 'Easy', tierRequired: 'Free', xpReward: 100, nftReward: false, goal: 10, type: 'trades' },
  { title: 'Momentum Rider', description: 'Execute 10 momentum trades', category: 'Trading', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 150, nftReward: false, goal: 10, type: 'trades' },
  { title: 'Liquidity Hunter', description: 'Snipe 5 liquidity pools', category: 'Trading', difficulty: 'Medium', tierRequired: 'Trader', xpReward: 200, nftReward: false, goal: 5, type: 'trades' },
  { title: 'Whale Watcher', description: 'Copy 10 whale trades', category: 'Trading', difficulty: 'Hard', tierRequired: 'Pro', xpReward: 400, nftReward: false, goal: 10, type: 'trades' },
  { title: 'MEV Protector', description: 'Execute 10 MEV-protected trades', category: 'Trading', difficulty: 'Hard', tierRequired: 'Pro', xpReward: 350, nftReward: false, goal: 10, type: 'trades' },
  { title: 'Multi-Strategy', description: 'Use 3 different strategies in one day', category: 'Trading', difficulty: 'Medium', tierRequired: 'Trader', xpReward: 250, nftReward: false, goal: 3, type: 'custom' },
  { title: 'Strategy Collector', description: 'Use 5 different strategies', category: 'Trading', difficulty: 'Hard', tierRequired: 'Pro', xpReward: 400, nftReward: true, nftRarity: 'Rare', goal: 5, type: 'custom' },
  { title: 'Full Arsenal', description: 'Use all 15 agents at least once', category: 'Trading', difficulty: 'Extreme', tierRequired: 'Elite', xpReward: 1500, nftReward: true, nftRarity: 'Epic', goal: 15, type: 'custom' },
  // Volume (20)
  { title: 'Volume Starter', description: 'Trade $100 in volume', category: 'Trading', difficulty: 'Easy', tierRequired: 'Free', xpReward: 50, nftReward: false, goal: 100, type: 'volume' },
  { title: 'Volume Rookie', description: 'Trade $500 in volume', category: 'Trading', difficulty: 'Easy', tierRequired: 'Free', xpReward: 100, nftReward: false, goal: 500, type: 'volume' },
  { title: 'Volume Trader', description: 'Trade $1,000 in volume', category: 'Trading', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 200, nftReward: false, goal: 1000, type: 'volume' },
  { title: 'Volume Pro', description: 'Trade $5,000 in volume', category: 'Trading', difficulty: 'Medium', tierRequired: 'Trader', xpReward: 400, nftReward: true, nftRarity: 'Common', goal: 5000, type: 'volume' },
  { title: 'Volume Master', description: 'Trade $10,000 in volume', category: 'Trading', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 600, nftReward: false, goal: 10000, type: 'volume' },
  { title: 'Volume Legend', description: 'Trade $25,000 in volume', category: 'Trading', difficulty: 'Hard', tierRequired: 'Pro', xpReward: 1000, nftReward: true, nftRarity: 'Rare', goal: 25000, type: 'volume' },
  { title: 'Volume King', description: 'Trade $50,000 in volume', category: 'Trading', difficulty: 'Extreme', tierRequired: 'Pro', xpReward: 2000, nftReward: false, goal: 50000, type: 'volume' },
  { title: 'Volume Emperor', description: 'Trade $100,000 in volume', category: 'Trading', difficulty: 'Extreme', tierRequired: 'Elite', xpReward: 4000, nftReward: true, nftRarity: 'Epic', goal: 100000, type: 'volume' },
  // Additional trading quests to reach 200
  { title: 'SOL Specialist', description: 'Trade SOL 20 times', category: 'Trading', difficulty: 'Easy', tierRequired: 'Free', xpReward: 100, nftReward: false, goal: 20, type: 'trades' },
  { title: 'BTC Enthusiast', description: 'Trade BTC pairs 15 times', category: 'Trading', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 150, nftReward: false, goal: 15, type: 'trades' },
  { title: 'Altcoin Hunter', description: 'Trade 10 different altcoins', category: 'Trading', difficulty: 'Medium', tierRequired: 'Trader', xpReward: 250, nftReward: false, goal: 10, type: 'trades' },
  { title: 'Meme Lord', description: 'Profit from 5 meme coin trades', category: 'Trading', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 400, nftReward: true, nftRarity: 'Rare', goal: 5, type: 'trades' },
  { title: 'New Token Sniper', description: 'Trade a token within 1 hour of launch', category: 'Trading', difficulty: 'Hard', tierRequired: 'Pro', xpReward: 500, nftReward: false, goal: 1, type: 'trades' },
  { title: 'Flash Trade', description: 'Complete a trade in under 10 seconds', category: 'Trading', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 150, nftReward: false, goal: 1, type: 'trades' },
  { title: 'Precision Trader', description: 'Hit exact profit target 5 times', category: 'Trading', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 350, nftReward: false, goal: 5, type: 'trades' },
  { title: 'Risk Manager', description: 'Use stop-loss on 10 trades', category: 'Trading', difficulty: 'Easy', tierRequired: 'Free', xpReward: 75, nftReward: false, goal: 10, type: 'trades' },
  { title: 'Take Profit Pro', description: 'Hit take-profit on 10 trades', category: 'Trading', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 150, nftReward: false, goal: 10, type: 'trades' },
  { title: 'Paper to Pro', description: 'Transition from paper to live trading', category: 'Trading', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 200, nftReward: true, nftRarity: 'Common', goal: 1, type: 'custom' },
]

// Learning Quests (80)
const LEARNING_QUESTS: Omit<WeeklyQuest, 'id'>[] = [
  { title: 'Tour Complete', description: 'Complete the onboarding tour', category: 'Learning', difficulty: 'Easy', tierRequired: 'Free', xpReward: 100, nftReward: true, nftRarity: 'Common', goal: 1, type: 'learning' },
  { title: 'Dashboard Explorer', description: 'Visit all dashboard sections', category: 'Learning', difficulty: 'Easy', tierRequired: 'Free', xpReward: 50, nftReward: false, goal: 1, type: 'learning' },
  { title: 'Settings Master', description: 'Configure all settings sections', category: 'Learning', difficulty: 'Easy', tierRequired: 'Free', xpReward: 75, nftReward: false, goal: 1, type: 'learning' },
  { title: 'Vault Tutorial', description: 'Complete the vault tutorial', category: 'Learning', difficulty: 'Easy', tierRequired: 'Free', xpReward: 60, nftReward: false, goal: 1, type: 'learning' },
  { title: 'Agent Academy', description: 'Learn about all 15 agents', category: 'Learning', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 150, nftReward: false, goal: 15, type: 'learning' },
  { title: 'Strategy Scholar', description: 'Read documentation for 5 strategies', category: 'Learning', difficulty: 'Easy', tierRequired: 'Free', xpReward: 75, nftReward: false, goal: 5, type: 'learning' },
  { title: 'Risk 101', description: 'Complete risk management tutorial', category: 'Learning', difficulty: 'Easy', tierRequired: 'Free', xpReward: 100, nftReward: false, goal: 1, type: 'learning' },
  { title: 'DCA Deep Dive', description: 'Master DCA strategy documentation', category: 'Learning', difficulty: 'Easy', tierRequired: 'Free', xpReward: 75, nftReward: false, goal: 1, type: 'learning' },
  { title: 'Momentum Mastery', description: 'Complete momentum trading course', category: 'Learning', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 150, nftReward: false, goal: 1, type: 'learning' },
  { title: 'Whale Watching 101', description: 'Learn to track whale wallets', category: 'Learning', difficulty: 'Medium', tierRequired: 'Trader', xpReward: 200, nftReward: false, goal: 1, type: 'learning' },
  { title: 'MEV Protection', description: 'Understand MEV and protection', category: 'Learning', difficulty: 'Hard', tierRequired: 'Pro', xpReward: 300, nftReward: true, nftRarity: 'Rare', goal: 1, type: 'learning' },
  { title: 'Tax Tutorial', description: 'Complete tax reserve tutorial', category: 'Learning', difficulty: 'Easy', tierRequired: 'Free', xpReward: 100, nftReward: false, goal: 1, type: 'learning' },
  { title: 'API Explorer', description: 'Connect your first exchange API', category: 'Learning', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 150, nftReward: false, goal: 1, type: 'learning' },
  { title: 'Binance Connect', description: 'Connect Binance API', category: 'Learning', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 100, nftReward: false, goal: 1, type: 'learning' },
  { title: 'Kraken Connect', description: 'Connect Kraken API', category: 'Learning', difficulty: 'Medium', tierRequired: 'Trader', xpReward: 100, nftReward: false, goal: 1, type: 'learning' },
  { title: 'Wallet Wizard', description: 'Connect Phantom or Solflare wallet', category: 'Learning', difficulty: 'Easy', tierRequired: 'Free', xpReward: 75, nftReward: false, goal: 1, type: 'learning' },
  { title: 'NFT Education', description: 'Learn about NFT minting', category: 'Learning', difficulty: 'Easy', tierRequired: 'Free', xpReward: 50, nftReward: false, goal: 1, type: 'learning' },
  { title: 'Community Guidelines', description: 'Read community guidelines', category: 'Learning', difficulty: 'Easy', tierRequired: 'Free', xpReward: 25, nftReward: false, goal: 1, type: 'learning' },
  { title: 'Strategy Builder Intro', description: 'Open strategy builder', category: 'Learning', difficulty: 'Easy', tierRequired: 'Free', xpReward: 50, nftReward: false, goal: 1, type: 'learning' },
  { title: 'Code Your First Bot', description: 'Create a custom strategy', category: 'Learning', difficulty: 'Hard', tierRequired: 'Pro', xpReward: 500, nftReward: true, nftRarity: 'Rare', goal: 1, type: 'learning' },
  { title: 'Backtest Basics', description: 'Run your first backtest', category: 'Learning', difficulty: 'Medium', tierRequired: 'Trader', xpReward: 150, nftReward: false, goal: 1, type: 'learning' },
  { title: 'Analytics Ace', description: 'Analyze 7 days of trading data', category: 'Learning', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 125, nftReward: false, goal: 7, type: 'learning' },
  { title: 'Chart Reader', description: 'Study price charts for 30 minutes', category: 'Learning', difficulty: 'Easy', tierRequired: 'Free', xpReward: 50, nftReward: false, goal: 30, type: 'learning' },
  { title: 'Market Watcher', description: 'Check market feed 10 times', category: 'Learning', difficulty: 'Easy', tierRequired: 'Free', xpReward: 40, nftReward: false, goal: 10, type: 'learning' },
  { title: 'News Reader', description: 'Read 5 market news articles', category: 'Learning', difficulty: 'Easy', tierRequired: 'Free', xpReward: 50, nftReward: false, goal: 5, type: 'learning' },
  // More learning quests...
  { title: 'Documentation Dive', description: 'Read full documentation', category: 'Learning', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 200, nftReward: true, nftRarity: 'Common', goal: 1, type: 'learning' },
  { title: 'Support Seeker', description: 'Visit support center', category: 'Learning', difficulty: 'Easy', tierRequired: 'Free', xpReward: 25, nftReward: false, goal: 1, type: 'learning' },
  { title: 'FAQ Reader', description: 'Read all FAQ sections', category: 'Learning', difficulty: 'Easy', tierRequired: 'Free', xpReward: 50, nftReward: false, goal: 1, type: 'learning' },
  { title: 'Legal Eagle', description: 'Read terms of service', category: 'Learning', difficulty: 'Easy', tierRequired: 'Free', xpReward: 30, nftReward: false, goal: 1, type: 'learning' },
  { title: 'Privacy Pro', description: 'Review privacy policy', category: 'Learning', difficulty: 'Easy', tierRequired: 'Free', xpReward: 30, nftReward: false, goal: 1, type: 'learning' },
]

// Social Quests (60)
const SOCIAL_QUESTS: Omit<WeeklyQuest, 'id'>[] = [
  { title: 'First Friend', description: 'Invite your first friend', category: 'Social', difficulty: 'Easy', tierRequired: 'Free', xpReward: 100, nftReward: false, goal: 1, type: 'social' },
  { title: 'Social Butterfly', description: 'Invite 5 friends', category: 'Social', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 300, nftReward: true, nftRarity: 'Common', goal: 5, type: 'social' },
  { title: 'Influencer', description: 'Invite 10 friends', category: 'Social', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 750, nftReward: true, nftRarity: 'Rare', goal: 10, type: 'social' },
  { title: 'Community Leader', description: 'Invite 25 friends', category: 'Social', difficulty: 'Extreme', tierRequired: 'Pro', xpReward: 2000, nftReward: true, nftRarity: 'Epic', goal: 25, type: 'social' },
  { title: 'Ambassador', description: 'Invite 50 friends', category: 'Social', difficulty: 'Extreme', tierRequired: 'Elite', xpReward: 5000, nftReward: true, nftRarity: 'Legendary', goal: 50, type: 'social' },
  { title: 'First Post', description: 'Make your first forum post', category: 'Social', difficulty: 'Easy', tierRequired: 'Free', xpReward: 50, nftReward: false, goal: 1, type: 'social' },
  { title: 'Forum Regular', description: 'Post 10 times in forum', category: 'Social', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 150, nftReward: false, goal: 10, type: 'social' },
  { title: 'Discussion Starter', description: 'Start 5 forum discussions', category: 'Social', difficulty: 'Medium', tierRequired: 'Trader', xpReward: 200, nftReward: false, goal: 5, type: 'social' },
  { title: 'Helpful Hand', description: 'Answer 10 community questions', category: 'Social', difficulty: 'Hard', tierRequired: 'Pro', xpReward: 400, nftReward: true, nftRarity: 'Rare', goal: 10, type: 'social' },
  { title: 'Strategy Sharer', description: 'Share a strategy with community', category: 'Social', difficulty: 'Medium', tierRequired: 'Trader', xpReward: 200, nftReward: false, goal: 1, type: 'social' },
  { title: 'PnL Poster', description: 'Share your daily PnL', category: 'Social', difficulty: 'Easy', tierRequired: 'Free', xpReward: 50, nftReward: false, goal: 1, type: 'social' },
  { title: 'Weekly Recap', description: 'Share weekly performance', category: 'Social', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 100, nftReward: false, goal: 1, type: 'social' },
  { title: 'Leaderboard Legend', description: 'Reach top 100 on leaderboard', category: 'Social', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 500, nftReward: true, nftRarity: 'Rare', goal: 1, type: 'social' },
  { title: 'Top 10', description: 'Reach top 10 on leaderboard', category: 'Social', difficulty: 'Extreme', tierRequired: 'Pro', xpReward: 2000, nftReward: true, nftRarity: 'Epic', goal: 1, type: 'social' },
  { title: 'Discord Member', description: 'Join Discord server', category: 'Social', difficulty: 'Easy', tierRequired: 'Free', xpReward: 50, nftReward: false, goal: 1, type: 'social' },
  { title: 'Discord Active', description: 'Send 10 Discord messages', category: 'Social', difficulty: 'Easy', tierRequired: 'Free', xpReward: 75, nftReward: false, goal: 10, type: 'social' },
  { title: 'Copy Trader', description: 'Copy another trader\'s strategy', category: 'Social', difficulty: 'Medium', tierRequired: 'Trader', xpReward: 150, nftReward: false, goal: 1, type: 'social' },
  { title: 'Strategy Seller', description: 'Sell your first strategy', category: 'Social', difficulty: 'Hard', tierRequired: 'Pro', xpReward: 500, nftReward: true, nftRarity: 'Rare', goal: 1, type: 'social' },
  { title: 'NFT Showcase', description: 'Display NFT in profile', category: 'Social', difficulty: 'Easy', tierRequired: 'Free', xpReward: 50, nftReward: false, goal: 1, type: 'social' },
  { title: 'Profile Complete', description: 'Complete your profile', category: 'Social', difficulty: 'Easy', tierRequired: 'Free', xpReward: 75, nftReward: false, goal: 1, type: 'social' },
]

// Milestone Quests (50)
const MILESTONE_QUESTS: Omit<WeeklyQuest, 'id'>[] = [
  { title: 'First $1', description: 'Earn your first dollar', category: 'Milestone', difficulty: 'Easy', tierRequired: 'Free', xpReward: 100, nftReward: true, nftRarity: 'Common', goal: 1, type: 'profit' },
  { title: 'First $10', description: 'Earn your first $10', category: 'Milestone', difficulty: 'Easy', tierRequired: 'Free', xpReward: 150, nftReward: true, nftRarity: 'Common', goal: 10, type: 'profit' },
  { title: 'First $100', description: 'Earn your first $100', category: 'Milestone', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 300, nftReward: true, nftRarity: 'Rare', goal: 100, type: 'profit' },
  { title: 'First $1,000', description: 'Earn your first $1,000', category: 'Milestone', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 1000, nftReward: true, nftRarity: 'Epic', goal: 1000, type: 'profit' },
  { title: 'First $10,000', description: 'Earn your first $10,000', category: 'Milestone', difficulty: 'Extreme', tierRequired: 'Pro', xpReward: 3000, nftReward: true, nftRarity: 'Legendary', goal: 10000, type: 'profit' },
  { title: 'Level 5', description: 'Reach level 5', category: 'Milestone', difficulty: 'Easy', tierRequired: 'Free', xpReward: 100, nftReward: false, goal: 5, type: 'custom' },
  { title: 'Level 10', description: 'Reach level 10', category: 'Milestone', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 200, nftReward: true, nftRarity: 'Common', goal: 10, type: 'custom' },
  { title: 'Level 25', description: 'Reach level 25', category: 'Milestone', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 500, nftReward: true, nftRarity: 'Rare', goal: 25, type: 'custom' },
  { title: 'Level 50', description: 'Reach level 50', category: 'Milestone', difficulty: 'Extreme', tierRequired: 'Pro', xpReward: 1500, nftReward: true, nftRarity: 'Epic', goal: 50, type: 'custom' },
  { title: 'Level 100', description: 'Reach level 100', category: 'Milestone', difficulty: 'Extreme', tierRequired: 'Elite', xpReward: 5000, nftReward: true, nftRarity: 'Legendary', goal: 100, type: 'custom' },
  { title: '100% Week', description: 'Double your portfolio in a week', category: 'Milestone', difficulty: 'Extreme', tierRequired: 'Pro', xpReward: 2500, nftReward: true, nftRarity: 'Legendary', goal: 100, type: 'profit' },
  { title: 'Perfect Week', description: 'Win every trade for a week', category: 'Milestone', difficulty: 'Extreme', tierRequired: 'Elite', xpReward: 5000, nftReward: true, nftRarity: 'Legendary', goal: 7, type: 'streak' },
  { title: 'First NFT', description: 'Mint your first NFT', category: 'Milestone', difficulty: 'Easy', tierRequired: 'Free', xpReward: 100, nftReward: false, goal: 1, type: 'custom' },
  { title: 'NFT Collector', description: 'Own 5 NFTs', category: 'Milestone', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 250, nftReward: false, goal: 5, type: 'custom' },
  { title: 'NFT Hoarder', description: 'Own 25 NFTs', category: 'Milestone', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 750, nftReward: true, nftRarity: 'Rare', goal: 25, type: 'custom' },
  { title: 'One Week Streak', description: '7 consecutive days of profit', category: 'Milestone', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 500, nftReward: true, nftRarity: 'Rare', goal: 7, type: 'streak' },
  { title: 'One Month Streak', description: '30 consecutive days of profit', category: 'Milestone', difficulty: 'Extreme', tierRequired: 'Elite', xpReward: 3000, nftReward: true, nftRarity: 'Legendary', goal: 30, type: 'streak' },
  { title: 'Bot Pioneer', description: 'Run bot for first time', category: 'Milestone', difficulty: 'Easy', tierRequired: 'Free', xpReward: 50, nftReward: false, goal: 1, type: 'custom' },
  { title: 'Bot Veteran', description: 'Run bot for 100 hours', category: 'Milestone', difficulty: 'Hard', tierRequired: 'Pro', xpReward: 500, nftReward: true, nftRarity: 'Rare', goal: 100, type: 'custom' },
  { title: 'Vault Builder', description: 'Accumulate 1 BTC in vault', category: 'Milestone', difficulty: 'Extreme', tierRequired: 'Elite', xpReward: 5000, nftReward: true, nftRarity: 'Legendary', goal: 1, type: 'custom' },
]

// Daily/Weekly Quests (60)
const DAILY_WEEKLY_QUESTS: Omit<WeeklyQuest, 'id'>[] = [
  { title: 'Daily Login', description: 'Login today', category: 'Daily', difficulty: 'Easy', tierRequired: 'Free', xpReward: 25, nftReward: false, goal: 1, type: 'custom' },
  { title: 'Daily Trader', description: 'Complete 1 trade today', category: 'Daily', difficulty: 'Easy', tierRequired: 'Free', xpReward: 50, nftReward: false, goal: 1, type: 'trades' },
  { title: 'Daily Profit', description: 'Earn profit today', category: 'Daily', difficulty: 'Easy', tierRequired: 'Free', xpReward: 75, nftReward: false, goal: 1, type: 'profit' },
  { title: 'Daily Volume', description: 'Trade $100 volume today', category: 'Daily', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 100, nftReward: false, goal: 100, type: 'volume' },
  { title: 'Daily Five', description: 'Complete 5 trades today', category: 'Daily', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 125, nftReward: false, goal: 5, type: 'trades' },
  { title: 'Daily Ten', description: 'Complete 10 trades today', category: 'Daily', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 200, nftReward: false, goal: 10, type: 'trades' },
  { title: 'Daily $50', description: 'Earn $50 profit today', category: 'Daily', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 250, nftReward: false, goal: 50, type: 'profit' },
  { title: 'Daily $100', description: 'Earn $100 profit today', category: 'Daily', difficulty: 'Extreme', tierRequired: 'Pro', xpReward: 400, nftReward: false, goal: 100, type: 'profit' },
  { title: 'Weekly Login Streak', description: 'Login 7 consecutive days', category: 'Weekly', difficulty: 'Easy', tierRequired: 'Free', xpReward: 200, nftReward: true, nftRarity: 'Common', goal: 7, type: 'streak' },
  { title: 'Weekly Trader', description: 'Complete 20 trades this week', category: 'Weekly', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 300, nftReward: false, goal: 20, type: 'trades' },
  { title: 'Weekly Volume', description: 'Trade $1,000 volume this week', category: 'Weekly', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 350, nftReward: false, goal: 1000, type: 'volume' },
  { title: 'Weekly Profit', description: 'Earn $100 profit this week', category: 'Weekly', difficulty: 'Medium', tierRequired: 'Trader', xpReward: 400, nftReward: false, goal: 100, type: 'profit' },
  { title: 'Weekly Champion', description: 'Earn $500 profit this week', category: 'Weekly', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 750, nftReward: true, nftRarity: 'Rare', goal: 500, type: 'profit' },
  { title: 'Weekly Legend', description: 'Earn $1,000 profit this week', category: 'Weekly', difficulty: 'Extreme', tierRequired: 'Pro', xpReward: 1500, nftReward: true, nftRarity: 'Epic', goal: 1000, type: 'profit' },
  { title: 'Morning Trader', description: 'Complete a trade before 9 AM', category: 'Daily', difficulty: 'Easy', tierRequired: 'Free', xpReward: 50, nftReward: false, goal: 1, type: 'trades' },
  { title: 'Night Owl', description: 'Complete a trade after 11 PM', category: 'Daily', difficulty: 'Easy', tierRequired: 'Free', xpReward: 50, nftReward: false, goal: 1, type: 'trades' },
  { title: 'Weekend Warrior', description: 'Trade on Saturday or Sunday', category: 'Weekly', difficulty: 'Easy', tierRequired: 'Free', xpReward: 75, nftReward: false, goal: 1, type: 'trades' },
  { title: 'Monday Motivation', description: 'Profit on Monday', category: 'Weekly', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 100, nftReward: false, goal: 1, type: 'profit' },
  { title: 'Friday Finish', description: 'End week with profit', category: 'Weekly', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 150, nftReward: false, goal: 1, type: 'profit' },
  { title: 'Two Week Streak', description: '14 consecutive days of login', category: 'Weekly', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 500, nftReward: true, nftRarity: 'Rare', goal: 14, type: 'streak' },
]

// Special Quests (50)
const SPECIAL_QUESTS: Omit<WeeklyQuest, 'id'>[] = [
  { title: 'Launch Day Hero', description: 'Trade on launch day', category: 'Special', difficulty: 'Easy', tierRequired: 'Free', xpReward: 500, nftReward: true, nftRarity: 'Rare', goal: 1, type: 'custom' },
  { title: 'Early Adopter', description: 'Join within first week', category: 'Special', difficulty: 'Easy', tierRequired: 'Free', xpReward: 300, nftReward: true, nftRarity: 'Rare', goal: 1, type: 'custom' },
  { title: 'Black Friday Trader', description: 'Trade on Black Friday', category: 'Special', difficulty: 'Easy', tierRequired: 'Free', xpReward: 200, nftReward: false, goal: 1, type: 'custom' },
  { title: 'Cyber Monday', description: 'Trade on Cyber Monday', category: 'Special', difficulty: 'Easy', tierRequired: 'Free', xpReward: 200, nftReward: false, goal: 1, type: 'custom' },
  { title: 'New Year Trader', description: 'Trade on New Years Day', category: 'Special', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 300, nftReward: true, nftRarity: 'Rare', goal: 1, type: 'custom' },
  { title: 'Valentine Gains', description: 'Profit on Valentines Day', category: 'Special', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 250, nftReward: false, goal: 1, type: 'custom' },
  { title: 'Halloween Horror', description: 'Trade on Halloween', category: 'Special', difficulty: 'Easy', tierRequired: 'Free', xpReward: 200, nftReward: true, nftRarity: 'Rare', goal: 1, type: 'custom' },
  { title: 'Christmas Miracle', description: 'Profit on Christmas', category: 'Special', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 500, nftReward: true, nftRarity: 'Epic', goal: 1, type: 'custom' },
  { title: 'Bull Market Rider', description: 'Profit during bull market', category: 'Special', difficulty: 'Medium', tierRequired: 'Starter', xpReward: 200, nftReward: false, goal: 100, type: 'profit' },
  { title: 'Bear Market Survivor', description: 'Profit during bear market', category: 'Special', difficulty: 'Extreme', tierRequired: 'Pro', xpReward: 1000, nftReward: true, nftRarity: 'Epic', goal: 100, type: 'profit' },
  { title: 'Flash Crash Winner', description: 'Profit during a crash', category: 'Special', difficulty: 'Extreme', tierRequired: 'Elite', xpReward: 2000, nftReward: true, nftRarity: 'Legendary', goal: 500, type: 'profit' },
  { title: 'ATH Trader', description: 'Trade during all-time high', category: 'Special', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 400, nftReward: false, goal: 1, type: 'custom' },
  { title: 'Dip Buyer', description: 'Buy the dip successfully', category: 'Special', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 350, nftReward: false, goal: 1, type: 'custom' },
  { title: 'God Mode Activated', description: 'Unlock master access', category: 'Special', difficulty: 'Extreme', tierRequired: 'Elite', xpReward: 10000, nftReward: true, nftRarity: 'Legendary', goal: 1, type: 'custom' },
  { title: 'Founder Badge', description: 'Early platform supporter', category: 'Special', difficulty: 'Easy', tierRequired: 'Free', xpReward: 1000, nftReward: true, nftRarity: 'Legendary', goal: 1, type: 'custom' },
  { title: 'Beta Tester', description: 'Participated in beta', category: 'Special', difficulty: 'Easy', tierRequired: 'Free', xpReward: 500, nftReward: true, nftRarity: 'Epic', goal: 1, type: 'custom' },
  { title: 'Bug Hunter', description: 'Report a bug that gets fixed', category: 'Special', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 750, nftReward: true, nftRarity: 'Rare', goal: 1, type: 'custom' },
  { title: 'Feature Suggester', description: 'Suggest an implemented feature', category: 'Special', difficulty: 'Hard', tierRequired: 'Pro', xpReward: 1000, nftReward: true, nftRarity: 'Epic', goal: 1, type: 'custom' },
  { title: 'Content Creator', description: 'Create content about platform', category: 'Special', difficulty: 'Hard', tierRequired: 'Trader', xpReward: 500, nftReward: true, nftRarity: 'Rare', goal: 1, type: 'social' },
  { title: 'Viral Post', description: 'Get 1000 views on shared content', category: 'Special', difficulty: 'Extreme', tierRequired: 'Pro', xpReward: 2000, nftReward: true, nftRarity: 'Epic', goal: 1000, type: 'social' },
]

// Combine all quests
const ALL_BASE_QUESTS: Omit<WeeklyQuest, 'id'>[] = [
  ...TRADING_QUESTS,
  ...LEARNING_QUESTS,
  ...SOCIAL_QUESTS,
  ...MILESTONE_QUESTS,
  ...DAILY_WEEKLY_QUESTS,
  ...SPECIAL_QUESTS,
]

// Generate unique IDs for quests
function generateQuestId(quest: Omit<WeeklyQuest, 'id'>, index: number, weekSeed: number): string {
  return `quest-${weekSeed}-${index}-${quest.title.toLowerCase().replace(/\s+/g, '-')}`
}

// Shuffle array with seed
function shuffleWithSeed<T>(array: T[], random: () => number): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Generate weekly quests (500 quests)
export function generateWeeklyQuests(weekNumber?: number): WeeklyQuest[] {
  const week = weekNumber ?? getWeekNumber()
  const random = seededRandom(week * 12345)
  
  // Shuffle base quests
  const shuffled = shuffleWithSeed(ALL_BASE_QUESTS, random)
  
  // Take first 500 or repeat if needed
  const quests: WeeklyQuest[] = []
  
  for (let i = 0; i < 500; i++) {
    const baseQuest = shuffled[i % shuffled.length]
    quests.push({
      ...baseQuest,
      id: generateQuestId(baseQuest, i, week),
    })
  }
  
  return quests
}

// Get quests by category
export function getQuestsByCategory(quests: WeeklyQuest[], category: QuestCategory): WeeklyQuest[] {
  return quests.filter(q => q.category === category)
}

// Get quests by tier
export function getQuestsByTier(quests: WeeklyQuest[], tier: QuestTier): WeeklyQuest[] {
  const tierOrder: QuestTier[] = ['Free', 'Starter', 'Trader', 'Pro', 'Elite']
  const tierIndex = tierOrder.indexOf(tier)
  return quests.filter(q => tierOrder.indexOf(q.tierRequired) <= tierIndex)
}

// Get quests with NFT rewards
export function getQuestsWithNFT(quests: WeeklyQuest[]): WeeklyQuest[] {
  return quests.filter(q => q.nftReward)
}

// Get quests by difficulty
export function getQuestsByDifficulty(quests: WeeklyQuest[], difficulty: QuestDifficulty): WeeklyQuest[] {
  return quests.filter(q => q.difficulty === difficulty)
}

// Get time until next weekly rotation
export function getTimeUntilNextWeeklyRotation(): { days: number; hours: number; minutes: number; seconds: number } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysUntilMonday = (8 - dayOfWeek) % 7 || 7
  
  const nextMonday = new Date(now)
  nextMonday.setDate(now.getDate() + daysUntilMonday)
  nextMonday.setHours(0, 0, 0, 0)
  
  const diff = nextMonday.getTime() - now.getTime()
  
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  }
}

// NFT rarity distribution
export const NFT_RARITY_COUNTS = {
  Common: 30,
  Rare: 12,
  Epic: 6,
  Legendary: 2,
}

// Export current week's quests
export const WEEKLY_QUESTS = generateWeeklyQuests()

