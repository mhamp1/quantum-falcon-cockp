export interface Trade {
  id: string;
  timestamp: number;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  pnl: number;
  status: 'open' | 'closed';
}

export interface BotLog {
  id: number;
  time: string;
  agent: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface Activity {
  id: number;
  message: string;
  time: string;
  type: 'trade' | 'analysis' | 'rebalance' | 'alert';
}

export interface AgentStatus {
  name: string;
  status: 'Active' | 'Idle' | 'Processing';
  confidence: number;
  actions: number;
  profit: number;
}

const SYMBOLS = ['SOL', 'BTC', 'ETH', 'USDC', 'BONK'];
const AGENTS = ['MARKET ANALYSIS', 'STRATEGY EXECUTION', 'RL OPTIMIZER', 'RISK MANAGEMENT'];

const AGENT_MESSAGES = {
  'MARKET ANALYSIS': [
    'High volatility detected in {symbol} market',
    'Analyzing {symbol} ecosystem growth',
    'Market sentiment: Bullish on {symbol}',
    'Technical indicators suggest {symbol} uptrend',
    'Volume spike detected in {symbol}',
    'Support level identified at ${price}',
    'Resistance level approaching for {symbol}',
  ],
  'STRATEGY EXECUTION': [
    'Executing long position on {symbol}',
    'Stop loss triggered at ${price}',
    'Take profit order filled for {symbol}',
    'Risk threshold exceeded - reducing exposure',
    'Position scaled into {symbol}',
    'DCA order activated for {symbol}',
    'Market order executed: {symbol}',
  ],
  'RL OPTIMIZER': [
    'Portfolio rebalanced',
    'Strategy optimization complete',
    'Learning rate adjusted',
    'Reward function updated',
    'Neural network weights optimized',
    'Performance metrics improved by {percent}%',
    'Risk parameters recalibrated',
  ],
  'RISK MANAGEMENT': [
    'Risk level: {level}',
    'Portfolio exposure at {percent}%',
    'Drawdown limit maintained',
    'Position size adjusted for {symbol}',
    'Correlation analysis complete',
    'Hedging strategy activated',
    'Stop loss updated to ${price}',
  ],
};

const ACTIVITY_TYPES = [
  { type: 'trade' as const, templates: [
    'Trade executed - {fromSymbol}→{toSymbol}',
    'Position opened: {symbol} @ ${price}',
    'Position closed: {symbol} ({pnl})',
    'Limit order filled: {symbol}',
  ]},
  { type: 'analysis' as const, templates: [
    'Market analysis completed',
    'Portfolio health check: Excellent',
    'Technical scan: {count} opportunities',
    'Sentiment analysis: {sentiment}',
  ]},
  { type: 'rebalance' as const, templates: [
    'Portfolio rebalanced',
    'Asset allocation optimized',
    'Risk parameters updated',
    'Strategy weights adjusted',
  ]},
  { type: 'alert' as const, templates: [
    'Risk level: {level}',
    'Price alert: {symbol} @ ${price}',
    'Volume alert: {symbol}',
    'Volatility spike detected',
  ]},
];

export class TradingDataGenerator {
  private logCounter = 1000;
  private activityCounter = 1000;
  private tradeCounter = 1000;
  
  private portfolioValue = 9843.21;
  private dailyPnL = 342.56;
  private activeTrades = 3;
  private totalTrades = 0;
  private winningTrades = 0;

  generateBotLog(): BotLog {
    const agent = AGENTS[Math.floor(Math.random() * AGENTS.length)];
    const messages = AGENT_MESSAGES[agent as keyof typeof AGENT_MESSAGES];
    let message = messages[Math.floor(Math.random() * messages.length)];
    
    message = message
      .replace('{symbol}', SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
      .replace('{price}', (Math.random() * 100 + 20).toFixed(2))
      .replace('{percent}', (Math.random() * 10 + 1).toFixed(1))
      .replace('{level}', ['Standard', 'Elevated', 'High'][Math.floor(Math.random() * 3)]);
    
    const types: BotLog['type'][] = ['info', 'success', 'warning'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    
    return {
      id: this.logCounter++,
      time,
      agent,
      message,
      type,
    };
  }

  generateActivity(): Activity {
    const activityType = ACTIVITY_TYPES[Math.floor(Math.random() * ACTIVITY_TYPES.length)];
    let message = activityType.templates[Math.floor(Math.random() * activityType.templates.length)];
    
    const fromSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    let toSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    while (toSymbol === fromSymbol) {
      toSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    }
    
    const pnl = (Math.random() * 200 - 50).toFixed(2);
    const pnlStr = parseFloat(pnl) >= 0 ? `+$${pnl}` : `-$${Math.abs(parseFloat(pnl)).toFixed(2)}`;
    
    message = message
      .replace('{fromSymbol}', fromSymbol)
      .replace('{toSymbol}', toSymbol)
      .replace('{symbol}', SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
      .replace('{price}', (Math.random() * 100 + 20).toFixed(2))
      .replace('{pnl}', pnlStr)
      .replace('{count}', String(Math.floor(Math.random() * 10 + 3)))
      .replace('{sentiment}', ['Bullish', 'Neutral', 'Cautious'][Math.floor(Math.random() * 3)])
      .replace('{level}', ['Standard', 'Elevated'][Math.floor(Math.random() * 2)]);
    
    const minutesAgo = Math.floor(Math.random() * 30) + 1;
    const time = `${minutesAgo}m ago`;
    
    return {
      id: this.activityCounter++,
      message,
      time,
      type: activityType.type,
    };
  }

  generateTrade(): Trade {
    const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    const price = Math.random() * 100 + 20;
    const amount = Math.random() * 10 + 0.1;
    const pnl = (Math.random() * 200 - 50);
    
    this.totalTrades++;
    if (pnl > 0) this.winningTrades++;
    
    return {
      id: `trade-${this.tradeCounter++}`,
      timestamp: Date.now(),
      symbol,
      side,
      price,
      amount,
      pnl,
      status: Math.random() > 0.3 ? 'closed' : 'open',
    };
  }

  generateAgentStatus(): AgentStatus[] {
    return [
      {
        name: 'Market Analyzer',
        status: 'Active',
        confidence: Math.floor(Math.random() * 20 + 75),
        actions: Math.floor(Math.random() * 50 + 100),
        profit: parseFloat((Math.random() * 500 + 100).toFixed(2)),
      },
      {
        name: 'Strategy Execution',
        status: 'Active',
        confidence: Math.floor(Math.random() * 15 + 80),
        actions: Math.floor(Math.random() * 40 + 80),
        profit: parseFloat((Math.random() * 600 + 200).toFixed(2)),
      },
      {
        name: 'RL Optimizer',
        status: 'Active',
        confidence: Math.floor(Math.random() * 25 + 70),
        actions: Math.floor(Math.random() * 30 + 60),
        profit: parseFloat((Math.random() * 400 + 50).toFixed(2)),
      },
    ];
  }

  updatePortfolioMetrics() {
    const change = (Math.random() * 20 - 5);
    this.portfolioValue += change;
    this.dailyPnL += change;
    
    if (Math.random() > 0.7) {
      this.activeTrades = Math.max(0, Math.min(5, this.activeTrades + (Math.random() > 0.5 ? 1 : -1)));
    }
    
    return {
      portfolioValue: parseFloat(this.portfolioValue.toFixed(2)),
      dailyPnL: parseFloat(this.dailyPnL.toFixed(2)),
      winRate: this.totalTrades > 0 ? parseFloat(((this.winningTrades / this.totalTrades) * 100).toFixed(1)) : 68.5,
      activeTrades: this.activeTrades,
    };
  }

  reset() {
    this.portfolioValue = 9843.21;
    this.dailyPnL = 342.56;
    this.activeTrades = 3;
    this.totalTrades = 0;
    this.winningTrades = 0;
  }
}

export const tradingDataGenerator = new TradingDataGenerator();
