// Live Trading Data Hook — Real-time Trading Intelligence
// November 21, 2025 — Quantum Falcon Cockpit
// ALL DATA MUST BE LIVE — NO MOCK DATA

import { useEffect, useRef, useState } from 'react';
import { useKVSafe } from '@/hooks/useKVFallback';
import { BotLog, Activity } from '@/lib/tradingDataGenerator';
import { fetchLiveTradingDataWithRetry } from '@/lib/api/liveTradingApi';

export interface SessionEvent {
  id: string;
  timestamp: number;
  label: string;
  detail: string;
  impact: number;
  kind: 'pnl' | 'trade' | 'risk';
}

const MAX_HISTORY_POINTS = 40;
const SESSION_WINDOW = 1000 * 60 * 60; // 1 hour

export function useLiveTradingData() {
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [dailyPnL, setDailyPnL] = useState<number>(0);
  const [winRate, setWinRate] = useState<number>(0);
  const [activeTrades, setActiveTrades] = useState<number>(0);
  const [totalTrades, setTotalTrades] = useState<number>(0);
  const [weeklyWinRate, setWeeklyWinRate] = useState<number>(0);
  const [dailyStreak, setDailyStreak] = useState<number>(0);
  const [pnLHistory, setPnLHistory] = useState<number[]>([]);
  const [sessionJournal, setSessionJournal] = useState<SessionEvent[]>([]);
  const [botLogs] = useKVSafe<BotLog[]>('bot-logs', []);
  const [recentActivity] = useKVSafe<Activity[]>('recent-activity', []);
  const [isLoading, setIsLoading] = useState(false); // Start false to not block render
  const [error, setError] = useState<string | null>(null);

  const lastPnLRef = useRef(0);
  const lastTradesRef = useRef(0);
  const lastWinRateRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const updateLiveData = async () => {
      if (!isMounted) return;

      try {
        // Don't set loading on subsequent fetches to avoid flicker
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
        // CRITICAL: Limit PnL history to prevent localStorage bloat
        setPnLHistory(prev => {
          const next = [...prev, liveData.dailyPnL];
          return next.slice(-MAX_HISTORY_POINTS); // Keep only last 40 points
        });

        const newEvents: SessionEvent[] = [];
        const now = Date.now();

        if (Math.abs(liveData.dailyPnL - lastPnLRef.current) >= 25) {
          newEvents.push({
            id: crypto.randomUUID?.() || `${now}-pnl`,
            timestamp: now,
            label: liveData.dailyPnL >= lastPnLRef.current ? 'PnL Surge' : 'PnL Dip',
            detail: `Intraday PnL ${liveData.dailyPnL >= lastPnLRef.current ? 'improved' : 'softened'} to ${liveData.dailyPnL.toFixed(2)}`,
            impact: liveData.dailyPnL - lastPnLRef.current,
            kind: 'pnl'
          });
        }

        if (liveData.activeTrades !== lastTradesRef.current) {
          newEvents.push({
            id: crypto.randomUUID?.() || `${now}-trade`,
            timestamp: now,
            label: liveData.activeTrades > lastTradesRef.current ? 'New Position Deployed' : 'Position Closed',
            detail: `${liveData.activeTrades} bots currently active`,
            impact: liveData.activeTrades - lastTradesRef.current,
            kind: 'trade'
          });
        }

        if (Math.abs(liveData.winRate - lastWinRateRef.current) >= 2) {
          newEvents.push({
            id: crypto.randomUUID?.() || `${now}-risk`,
            timestamp: now,
            label: 'Signal Confidence Update',
            detail: `Win rate adjusted to ${liveData.winRate.toFixed(1)}%`,
            impact: liveData.winRate - lastWinRateRef.current,
            kind: 'risk'
          });
        }

        if (newEvents.length) {
          // CRITICAL: Limit session journal to prevent localStorage bloat
          setSessionJournal(prev => {
            const hourAgo = now - SESSION_WINDOW;
            const filtered = prev.filter(event => event.timestamp >= hourAgo);
            return [...newEvents, ...filtered].slice(0, 15); // Keep only last 15 events
          });
        }

        lastPnLRef.current = liveData.dailyPnL;
        lastTradesRef.current = liveData.activeTrades;
        lastWinRateRef.current = liveData.winRate;
      } catch (err) {
        if (!isMounted) return;
        // API now returns defaults instead of throwing, but keep error handling for safety
        console.warn('⚠️ Trading data fetch warning (using defaults):', err);
        setError(null); // Clear error since we have defaults
        // Keep last known values on error (or use defaults from API)
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
    pnLHistory,
    sessionJournal,
    isLoading,
    error,
  };
}
