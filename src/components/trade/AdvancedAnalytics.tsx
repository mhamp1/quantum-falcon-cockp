// ADVANCED ANALYTICS: Uses Web Worker for heavy calculations — November 21, 2025

import { useState, useEffect } from 'react';
import { useTradingWorker } from '@/hooks/useTradingWorker';
import { performanceMonitor } from '@/lib/performanceMonitor';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChartLine, Brain, Lightning, CheckCircle, Warning } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface IndicatorResults {
  sma20: number[] | null;
  sma50: number[] | null;
  rsi: number[] | null;
  macd: { macd: number[]; signal: number[]; histogram: number[] } | null;
  bollinger: { upper: number[]; middle: number[]; lower: number[] } | null;
}

export default function AdvancedAnalytics() {
  const {
    isReady,
    error: workerError,
    calculateIndicators,
    backtestStrategy,
    calculatePortfolio,
  } = useTradingWorker();

  const [indicators, setIndicators] = useState<IndicatorResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [backtestResults, setBacktestResults] = useState<any>(null);
  const [calculationTime, setCalculationTime] = useState<number>(0);

  // Generate sample trading data
  const generateSampleData = (length: number = 1000) => {
    const data: number[] = [];
    let price = 100;
    
    for (let i = 0; i < length; i++) {
      price += (Math.random() - 0.5) * 5;
      price = Math.max(50, Math.min(200, price));
      data.push(price);
    }
    
    return data;
  };

  const handleCalculateIndicators = async () => {
    const endMeasure = performanceMonitor.startMeasure('calculate-indicators-with-worker');
    setIsCalculating(true);
    
    try {
      const startTime = performance.now();
      const samplePrices = generateSampleData(1000);
      
      const results = await calculateIndicators(samplePrices, [
        'sma20',
        'sma50',
        'rsi',
        'macd',
        'bollinger',
      ]);
      
      const endTime = performance.now();
      setCalculationTime(endTime - startTime);
      setIndicators(results);
      
      toast.success('Indicators calculated successfully!', {
        description: `Processed 1000 data points in ${(endTime - startTime).toFixed(2)}ms`,
      });
    } catch (error) {
      console.error('[AdvancedAnalytics] Calculation failed:', error);
      toast.error('Calculation failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsCalculating(false);
      endMeasure();
    }
  };

  const handleBacktest = async () => {
    const endMeasure = performanceMonitor.startMeasure('backtest-strategy-with-worker');
    setIsCalculating(true);
    
    try {
      const startTime = performance.now();
      const sampleData = generateSampleData(1000).map((price, i) => ({
        price,
        volume: Math.random() * 1000000,
        timestamp: Date.now() - (1000 - i) * 60000,
      }));
      
      const strategy = {
        buyCondition: (indicators: any) => indicators.rsi < 30,
        sellCondition: (indicators: any) => indicators.rsi > 70,
      };
      
      const results = await backtestStrategy(sampleData, strategy, 10000);
      
      const endTime = performance.now();
      setCalculationTime(endTime - startTime);
      setBacktestResults(results);
      
      toast.success('Backtest completed!', {
        description: `Simulated ${results.totalTrades} trades in ${(endTime - startTime).toFixed(2)}ms`,
      });
    } catch (error) {
      console.error('[AdvancedAnalytics] Backtest failed:', error);
      toast.error('Backtest failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsCalculating(false);
      endMeasure();
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tight neon-glow">
            Advanced Analytics
          </h1>
          <p className="text-muted-foreground uppercase tracking-wider text-sm">
            Heavy calculations powered by Web Workers — zero main thread blocking
          </p>
        </div>

        {/* Worker Status */}
        <Card className="cyber-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain size={32} weight="duotone" className={cn(
                isReady ? 'text-primary' : 'text-muted-foreground'
              )} />
              <div>
                <h3 className="text-lg font-bold uppercase tracking-wide">
                  Web Worker Status
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isReady ? 'Ready for calculations' : 'Initializing...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isReady ? (
                <>
                  <CheckCircle size={24} weight="fill" className="text-primary" />
                  <span className="text-sm font-semibold text-primary uppercase">Online</span>
                </>
              ) : workerError ? (
                <>
                  <Warning size={24} weight="fill" className="text-destructive" />
                  <span className="text-sm font-semibold text-destructive uppercase">Error</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-sm font-semibold text-accent uppercase">Initializing</span>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cyber-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <ChartLine size={32} weight="duotone" className="text-primary" />
              <div>
                <h3 className="text-lg font-bold uppercase tracking-wide">
                  Calculate Indicators
                </h3>
                <p className="text-xs text-muted-foreground">
                  SMA, EMA, RSI, MACD, Bollinger Bands
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleCalculateIndicators}
              disabled={!isReady || isCalculating}
              className="w-full"
              size="lg"
            >
              {isCalculating ? 'Calculating...' : 'Run Calculation'}
            </Button>
            
            {indicators && (
              <div className="pt-4 border-t border-border/50 space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Results
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>SMA20: {indicators.sma20 ? '✓' : '✗'}</div>
                  <div>SMA50: {indicators.sma50 ? '✓' : '✗'}</div>
                  <div>RSI: {indicators.rsi ? '✓' : '✗'}</div>
                  <div>MACD: {indicators.macd ? '✓' : '✗'}</div>
                  <div className="col-span-2">Bollinger: {indicators.bollinger ? '✓' : '✗'}</div>
                </div>
                <p className="text-xs text-primary font-semibold">
                  Calculated in {calculationTime.toFixed(2)}ms
                </p>
              </div>
            )}
          </Card>

          <Card className="cyber-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Lightning size={32} weight="duotone" className="text-accent" />
              <div>
                <h3 className="text-lg font-bold uppercase tracking-wide">
                  Backtest Strategy
                </h3>
                <p className="text-xs text-muted-foreground">
                  Simulate 1000 trades with RSI strategy
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleBacktest}
              disabled={!isReady || isCalculating}
              className="w-full"
              size="lg"
              variant="secondary"
            >
              {isCalculating ? 'Backtesting...' : 'Run Backtest'}
            </Button>
            
            {backtestResults && (
              <div className="pt-4 border-t border-border/50 space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Results
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Final Capital:</span>
                    <span className="font-bold text-primary">
                      ${backtestResults.finalCapital.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Trades:</span>
                    <span className="font-bold">{backtestResults.totalTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Win Rate:</span>
                    <span className="font-bold text-accent">
                      {backtestResults.winRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Drawdown:</span>
                    <span className="font-bold text-destructive">
                      {backtestResults.maxDrawdown.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sharpe Ratio:</span>
                    <span className="font-bold">
                      {backtestResults.sharpeRatio.toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-primary font-semibold">
                  Completed in {calculationTime.toFixed(2)}ms
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Performance Info */}
        {isCalculating && (
          <Card className="cyber-card p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-wide">
                  Processing...
                </span>
                <span className="text-xs text-muted-foreground">
                  Main thread remains responsive
                </span>
              </div>
              <Progress value={50} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Heavy calculations running in background worker
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
