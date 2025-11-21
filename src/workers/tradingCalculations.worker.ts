// WEB WORKER: Heavy trading data calculations — reduces main thread blocking — November 21, 2025

interface TradingData {
  price: number;
  volume: number;
  timestamp: number;
}

interface CalculationMessage {
  type: 'CALCULATE_INDICATORS' | 'ANALYZE_PATTERNS' | 'BACKTEST_STRATEGY' | 'CALCULATE_PORTFOLIO';
  data: any;
  id: string;
}

interface CalculationResult {
  type: string;
  result: any;
  id: string;
}

// Technical Indicators
function calculateSMA(data: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }
    const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / period);
  }
  return result;
}

function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);
  
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  result.push(ema);
  
  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
    result.push(ema);
  }
  
  return result;
}

function calculateRSI(data: number[], period: number = 14): number[] {
  const result: number[] = [];
  const changes: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i] - data[i - 1]);
  }
  
  for (let i = 0; i < changes.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }
    
    const recentChanges = changes.slice(i - period + 1, i + 1);
    const gains = recentChanges.filter(c => c > 0).reduce((a, b) => a + b, 0) / period;
    const losses = Math.abs(recentChanges.filter(c => c < 0).reduce((a, b) => a + b, 0)) / period;
    
    const rs = gains / (losses || 0.0001);
    const rsi = 100 - (100 / (1 + rs));
    result.push(rsi);
  }
  
  return result;
}

function calculateMACD(data: number[]): { macd: number[], signal: number[], histogram: number[] } {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  
  const macd = ema12.map((val, i) => val - ema26[i]);
  const signal = calculateEMA(macd.filter(v => !isNaN(v)), 9);
  const histogram = macd.map((val, i) => val - (signal[i] || 0));
  
  return { macd, signal, histogram };
}

function calculateBollingerBands(data: number[], period: number = 20, stdDev: number = 2): { 
  upper: number[], 
  middle: number[], 
  lower: number[] 
} {
  const middle = calculateSMA(data, period);
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      lower.push(NaN);
      continue;
    }
    
    const slice = data.slice(i - period + 1, i + 1);
    const mean = middle[i];
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
    const std = Math.sqrt(variance);
    
    upper.push(mean + (std * stdDev));
    lower.push(mean - (std * stdDev));
  }
  
  return { upper, middle, lower };
}

// Pattern Recognition
function detectPatterns(data: TradingData[]): string[] {
  const patterns: string[] = [];
  const prices = data.map(d => d.price);
  
  if (prices.length < 5) return patterns;
  
  // Detect double top
  for (let i = 2; i < prices.length - 2; i++) {
    if (
      prices[i] > prices[i - 1] &&
      prices[i] > prices[i - 2] &&
      prices[i] > prices[i + 1] &&
      prices[i] > prices[i + 2]
    ) {
      patterns.push(`Double Top at index ${i}`);
    }
  }
  
  // Detect double bottom
  for (let i = 2; i < prices.length - 2; i++) {
    if (
      prices[i] < prices[i - 1] &&
      prices[i] < prices[i - 2] &&
      prices[i] < prices[i + 1] &&
      prices[i] < prices[i + 2]
    ) {
      patterns.push(`Double Bottom at index ${i}`);
    }
  }
  
  return patterns;
}

// Backtesting Engine
function backtestStrategy(
  data: TradingData[],
  strategy: {
    buyCondition: (indicators: any) => boolean;
    sellCondition: (indicators: any) => boolean;
  },
  initialCapital: number = 10000
): {
  finalCapital: number;
  totalTrades: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
} {
  const prices = data.map(d => d.price);
  const rsi = calculateRSI(prices);
  const macd = calculateMACD(prices);
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  
  let capital = initialCapital;
  let position = 0;
  let trades = 0;
  let wins = 0;
  let maxCapital = initialCapital;
  let maxDrawdown = 0;
  const returns: number[] = [];
  
  for (let i = 50; i < data.length; i++) {
    const indicators = {
      price: prices[i],
      rsi: rsi[i],
      macd: macd.macd[i],
      signal: macd.signal[i],
      sma20: sma20[i],
      sma50: sma50[i],
    };
    
    // Buy signal
    if (position === 0 && !isNaN(indicators.rsi) && indicators.rsi < 30) {
      position = capital / prices[i];
      capital = 0;
      trades++;
    }
    
    // Sell signal
    if (position > 0 && !isNaN(indicators.rsi) && indicators.rsi > 70) {
      capital = position * prices[i];
      const profit = capital - initialCapital;
      if (profit > 0) wins++;
      returns.push((capital / initialCapital - 1) * 100);
      position = 0;
    }
    
    const currentValue = capital + (position * prices[i]);
    maxCapital = Math.max(maxCapital, currentValue);
    const drawdown = ((maxCapital - currentValue) / maxCapital) * 100;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }
  
  // Close any open position
  if (position > 0) {
    capital = position * prices[prices.length - 1];
    position = 0;
  }
  
  const winRate = trades > 0 ? (wins / trades) * 100 : 0;
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const stdReturn = returns.length > 0 
    ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length)
    : 0;
  const sharpeRatio = stdReturn > 0 ? (avgReturn / stdReturn) : 0;
  
  return {
    finalCapital: capital,
    totalTrades: trades,
    winRate,
    maxDrawdown,
    sharpeRatio,
  };
}

// Portfolio Calculations
function calculatePortfolioMetrics(positions: {
  symbol: string;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
}[]): {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  bestPerformer: string;
  worstPerformer: string;
} {
  let totalValue = 0;
  let totalCost = 0;
  let bestPnL = -Infinity;
  let worstPnL = Infinity;
  let bestPerformer = '';
  let worstPerformer = '';
  
  positions.forEach(pos => {
    const value = pos.quantity * pos.currentPrice;
    const cost = pos.quantity * pos.entryPrice;
    const pnl = value - cost;
    const pnlPercent = ((pos.currentPrice - pos.entryPrice) / pos.entryPrice) * 100;
    
    totalValue += value;
    totalCost += cost;
    
    if (pnlPercent > bestPnL) {
      bestPnL = pnlPercent;
      bestPerformer = `${pos.symbol} (+${pnlPercent.toFixed(2)}%)`;
    }
    
    if (pnlPercent < worstPnL) {
      worstPnL = pnlPercent;
      worstPerformer = `${pos.symbol} (${pnlPercent.toFixed(2)}%)`;
    }
  });
  
  const totalPnL = totalValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
  
  return {
    totalValue,
    totalPnL,
    totalPnLPercent,
    bestPerformer,
    worstPerformer,
  };
}

// Message Handler
self.onmessage = (event: MessageEvent<CalculationMessage>) => {
  const { type, data, id } = event.data;
  
  try {
    let result: any;
    
    switch (type) {
      case 'CALCULATE_INDICATORS': {
        const { prices, indicators } = data;
        result = {
          sma20: indicators.includes('sma20') ? calculateSMA(prices, 20) : null,
          sma50: indicators.includes('sma50') ? calculateSMA(prices, 50) : null,
          ema12: indicators.includes('ema12') ? calculateEMA(prices, 12) : null,
          ema26: indicators.includes('ema26') ? calculateEMA(prices, 26) : null,
          rsi: indicators.includes('rsi') ? calculateRSI(prices) : null,
          macd: indicators.includes('macd') ? calculateMACD(prices) : null,
          bollinger: indicators.includes('bollinger') ? calculateBollingerBands(prices) : null,
        };
        break;
      }
      
      case 'ANALYZE_PATTERNS': {
        const { tradingData } = data;
        result = {
          patterns: detectPatterns(tradingData),
          timestamp: Date.now(),
        };
        break;
      }
      
      case 'BACKTEST_STRATEGY': {
        const { tradingData, strategy, initialCapital } = data;
        result = backtestStrategy(tradingData, strategy, initialCapital);
        break;
      }
      
      case 'CALCULATE_PORTFOLIO': {
        const { positions } = data;
        result = calculatePortfolioMetrics(positions);
        break;
      }
      
      default:
        throw new Error(`Unknown calculation type: ${type}`);
    }
    
    const response: CalculationResult = {
      type,
      result,
      id,
    };
    
    self.postMessage(response);
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      result: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      id,
    });
  }
};

export {};
