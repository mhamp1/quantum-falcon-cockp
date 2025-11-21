// HOOK: useTradingWorker — manages Web Worker for heavy calculations — November 21, 2025

import { useEffect, useRef, useCallback, useState } from 'react';

interface WorkerMessage {
  type: 'CALCULATE_INDICATORS' | 'DETECT_PATTERNS' | 'BACKTEST_STRATEGY' | 'CALCULATE_PORTFOLIO';
  data: any;
  id?: string;
}

interface WorkerResponse {
  type: string;
  data: any;
  id?: string;
}

type PendingRequest = {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
};

export function useTradingWorker() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRequests = useRef<Map<string, PendingRequest>>(new Map());
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      // Create worker from URL
      const workerUrl = new URL('../workers/tradingCalculations.worker.ts', import.meta.url);
      workerRef.current = new Worker(workerUrl, { type: 'module' });

      workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const { id, type, data } = event.data;
        
        if (!id) {
          console.warn('[useTradingWorker] Received message without ID');
          return;
        }
        
        const pending = pendingRequests.current.get(id);

        if (pending) {
          if (type.endsWith('_ERROR')) {
            pending.reject(new Error(data.error || 'Worker error'));
          } else {
            pending.resolve(data);
          }
          pendingRequests.current.delete(id);
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('[useTradingWorker] Worker error:', error);
        setError(new Error('Worker initialization failed'));
        
        // Reject all pending requests
        pendingRequests.current.forEach((pending) => {
          pending.reject(new Error('Worker error'));
        });
        pendingRequests.current.clear();
      };

      setIsReady(true);
      console.info('✅ [useTradingWorker] Web Worker initialized successfully');

      return () => {
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
        }
        pendingRequests.current.clear();
      };
    } catch (err) {
      console.error('[useTradingWorker] Failed to create worker:', err);
      setError(err instanceof Error ? err : new Error('Unknown worker error'));
    }
  }, []);

  const sendMessage = useCallback(
    <T = any>(type: WorkerMessage['type'], data: any): Promise<T> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current || !isReady) {
          reject(new Error('Worker not ready'));
          return;
        }

        const id = `${type}-${Date.now()}-${Math.random()}`;
        pendingRequests.current.set(id, { resolve, reject });

        const message: WorkerMessage = { type, data, id };
        workerRef.current.postMessage(message);

        // Timeout after 30 seconds
        setTimeout(() => {
          if (pendingRequests.current.has(id)) {
            pendingRequests.current.delete(id);
            reject(new Error('Worker request timeout'));
          }
        }, 30000);
      });
    },
    [isReady]
  );

  const calculateIndicators = useCallback(
    (prices: number[], indicators: string[]) => {
      return sendMessage('CALCULATE_INDICATORS', { prices, indicators });
    },
    [sendMessage]
  );

  const analyzePatterns = useCallback(
    (tradingData: Array<{ price: number; volume: number; timestamp: number }>) => {
      return sendMessage('DETECT_PATTERNS', { tradingData });
    },
    [sendMessage]
  );

  const backtestStrategy = useCallback(
    (
      tradingData: Array<{ price: number; volume: number; timestamp: number }>,
      strategy: any,
      initialCapital: number = 10000
    ) => {
      return sendMessage('BACKTEST_STRATEGY', { tradingData, strategy, initialCapital });
    },
    [sendMessage]
  );

  const calculatePortfolio = useCallback(
    (
      positions: Array<{
        symbol: string;
        quantity: number;
        entryPrice: number;
        currentPrice: number;
      }>
    ) => {
      return sendMessage('CALCULATE_PORTFOLIO', { positions });
    },
    [sendMessage]
  );

  return {
    isReady,
    error,
    calculateIndicators,
    analyzePatterns,
    backtestStrategy,
    calculatePortfolio,
  };
}
