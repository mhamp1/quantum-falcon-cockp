// Live Trading Data Hook — Real-time Trading Intelligence
// November 21, 2025 — Quantum Falcon Cockpit
// ALL DATA MUST BE LIVE — NO MOCK DATA

import { useEffect, useRef, useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { BotLog, Activity } from '@/lib/tradingDataGenerator';
import { fetchLiveTradingDataWithRetry, type LiveTradingData } from '@/lib/api/liveTradingApi';

export function useLiveTradingData() {
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [dailyPnL, setDailyPnL] = useState<number>(0);
  const [winRate, setWinRate] = useState<number>(0);
  const [activeTrades, setActiveTrades] = useState<number>(0);
  const [totalTrades, setTotalTrades] = useState<number>(0);
  const [weeklyWinRate, setWeeklyWinRate] = useState<number>(0);
  const [dailyStreak, setDailyStreak] = useState<number>(0);
  const [botLogs, setBotLogs] = useKV<BotLog[]>('bot-logs', []);
  const [recentActivity, setRecentActivity] = useKV<Activity[]>('recent-activity', []);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const updateLiveData = async () => {
      if (!isMounted) return;

      try {
        setIsLoading(true);
        setError(null);

        const liveData = await fetchLiveTradingDataWithRetry();
        
        if (!isMounted) return;

        setPortfolioValue(liveData.portfolioValue);
        setDailyPnL(liveData.dailyPnL);
        setWinRate(liveData.winRate);
        setActiveTrades(liveData.activeTrades);
        setTotalTrades(liveData.totalTrades);
        setWeeklyWinRate(liveData.weeklyWinRate);
        setDailyStreak(liveData.dailyStreak);
      } catch (err) {
        if (!isMounted) return;
        console.error('❌ Failed to fetch live trading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load trading data');
        // Keep last known values on error
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // DEFER initial fetch by 300ms to allow dashboard to render first
    // This prevents blocking the initial render
    const initialTimer = setTimeout(() => {
      updateLiveData();
    }, 300);

    // Update every 5 seconds with live data
    const interval = setInterval(updateLiveData, 5000);

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return {
    portfolioValue,
    dailyPnL,
    winRate,
    activeTrades,
    totalTrades,
    weeklyWinRate,
    dailyStreak,
    botLogs,
    recentActivity,
    isLoading,
    error,
  };
}
