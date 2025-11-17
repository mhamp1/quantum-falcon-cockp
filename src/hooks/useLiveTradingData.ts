import { useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { tradingDataGenerator, BotLog, Activity } from '@/lib/tradingDataGenerator';

export function useLiveTradingData() {
  const [portfolioValue, setPortfolioValue] = useKV<number>('portfolio-value', 9843.21);
  const [dailyPnL, setDailyPnL] = useKV<number>('daily-pnl', 342.56);
  const [winRate, setWinRate] = useKV<number>('win-rate', 68.5);
  const [activeTrades, setActiveTrades] = useKV<number>('active-trades', 3);
  const [botLogs, setBotLogs] = useKV<BotLog[]>('bot-logs', []);
  const [recentActivity, setRecentActivity] = useKV<Activity[]>('recent-activity', []);

  useEffect(() => {
    const updateMetrics = () => {
      const metrics = tradingDataGenerator.updatePortfolioMetrics();
      setPortfolioValue(metrics.portfolioValue);
      setDailyPnL(metrics.dailyPnL);
      setWinRate(metrics.winRate);
      setActiveTrades(metrics.activeTrades);
    };

    const addBotLog = () => {
      const newLog = tradingDataGenerator.generateBotLog();
      setBotLogs((currentLogs) => {
        const logs = currentLogs || [];
        const updated = [newLog, ...logs].slice(0, 50);
        return updated;
      });
    };

    const addActivity = () => {
      const newActivity = tradingDataGenerator.generateActivity();
      setRecentActivity((currentActivity) => {
        const activities = currentActivity || [];
        const updated = [newActivity, ...activities].slice(0, 20);
        return updated;
      });
    };

    updateMetrics();
    addBotLog();
    addActivity();

    const metricsInterval = setInterval(updateMetrics, 8000);
    const logsInterval = setInterval(addBotLog, 5000);
    const activityInterval = setInterval(addActivity, 7000);

    return () => {
      clearInterval(metricsInterval);
      clearInterval(logsInterval);
      clearInterval(activityInterval);
    };
  }, [setPortfolioValue, setDailyPnL, setWinRate, setActiveTrades, setBotLogs, setRecentActivity]);

  return {
    portfolioValue,
    dailyPnL,
    winRate,
    activeTrades,
    botLogs,
    recentActivity,
  };
}
