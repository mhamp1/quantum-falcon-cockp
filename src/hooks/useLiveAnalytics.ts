import { useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
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
        const trades = totalTrades || 439;
        const winningTrades = Math.floor(((current || 68.5) / 100) * trades);
        return parseFloat(((winningTrades / (trades + 1)) * 100).toFixed(1));
      });
      
      setAvgTrade(() => {
        const pnl = totalPnL || 4563.79;
        const trades = totalTrades || 439;
        return parseFloat((pnl / trades).toFixed(2));
      });
    };

    const interval = setInterval(updateAnalytics, 15000);

    return () => clearInterval(interval);
  }, [setTotalPnL, setTotalTrades, setTradeHistory, setWinRate, setAvgTrade, totalTrades, totalPnL]);

  return {
    totalPnL,
    totalTrades,
    winRate,
    avgTrade,
    tradeHistory,
  };
}
