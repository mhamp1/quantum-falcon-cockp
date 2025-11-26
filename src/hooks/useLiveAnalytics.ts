import { useEffect } from 'react';
import { useKVSafe as useKV } from '@/hooks/useKVFallback';
import { tradingDataGenerator, Trade } from '@/lib/tradingDataGenerator';

export interface TradeHistory extends Trade {
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
}

export function useLiveAnalytics() {
  const [totalPnL, setTotalPnL] = useKV<number>('analytics-total-pnl', 4563.79);
  const [totalTrades, setTotalTrades] = useKV<number>('analytics-total-trades', 439);
  const [winRate, setWinRate] = useKV<number>('analytics-win-rate', 68.5);
  const [avgTrade, setAvgTrade] = useKV<number>('analytics-avg-trade', 10.39);
  const [tradeHistory, setTradeHistory] = useKV<TradeHistory[]>('trade-history', []);

  useEffect(() => {
    const updateAnalytics = () => {
      const newTrade = tradingDataGenerator.generateTrade();
      
      setTotalPnL((current) => {
        const updated = (current || 4563.79) + newTrade.pnl;
        return parseFloat(updated.toFixed(2));
      });
      
      setTotalTrades((current) => (current || 439) + 1);
      
      setTradeHistory((current) => {
        const history = current || [];
        const newTradeHistory: TradeHistory = {
          ...newTrade,
          symbol: newTrade.symbol,
          side: newTrade.side,
          price: newTrade.price,
          amount: newTrade.amount,
        };
        return [newTradeHistory, ...history].slice(0, 100);
      });
      
      setWinRate((current) => {
        const winningTrades = newTrade.pnl > 0 ? 1 : 0;
        const currentWinRate = current || 68.5;
        return parseFloat(((currentWinRate * 0.99 + winningTrades * 0.01 * 100)).toFixed(1));
      });
      
      setAvgTrade((current) => {
        const currentAvg = current || 10.39;
        return parseFloat((currentAvg * 0.95 + newTrade.pnl * 0.05).toFixed(2));
      });
    };

    const interval = setInterval(updateAnalytics, 15000);

    return () => clearInterval(interval);
  }, [setTotalPnL, setTotalTrades, setTradeHistory, setWinRate, setAvgTrade]);

  return {
    totalPnL,
    totalTrades,
    winRate,
    avgTrade,
    tradeHistory,
  };
}
