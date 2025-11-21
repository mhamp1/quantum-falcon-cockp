// PERFORMANCE MONITOR: Tracks and logs performance bottlenecks — November 21, 2025

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  type: 'render' | 'calculation' | 'network' | 'storage';
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 100;
  private thresholds = {
    render: 16, // 60fps = 16ms per frame
    calculation: 50,
    network: 1000,
    storage: 100,
  };

  startMeasure(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration);
    };
  }

  private recordMetric(name: string, duration: number) {
    const type = this.inferType(name);
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      type,
    };

    this.metrics.push(metric);
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    const threshold = this.thresholds[type];
    if (duration > threshold) {
      console.warn(
        `⚠️ [Performance] ${name} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`,
        {
          type,
          duration,
          threshold,
          overage: ((duration / threshold - 1) * 100).toFixed(1) + '%',
        }
      );
    }
  }

  private inferType(name: string): PerformanceMetric['type'] {
    if (name.includes('render') || name.includes('paint') || name.includes('layout')) {
      return 'render';
    }
    if (name.includes('calculate') || name.includes('compute') || name.includes('process')) {
      return 'calculation';
    }
    if (name.includes('fetch') || name.includes('request') || name.includes('api')) {
      return 'network';
    }
    if (name.includes('storage') || name.includes('kv') || name.includes('cache')) {
      return 'storage';
    }
    return 'calculation';
  }

  getMetrics(type?: PerformanceMetric['type']): PerformanceMetric[] {
    if (type) {
      return this.metrics.filter(m => m.type === type);
    }
    return [...this.metrics];
  }

  getAverageDuration(name: string): number {
    const filtered = this.metrics.filter(m => m.name === name);
    if (filtered.length === 0) return 0;
    
    const sum = filtered.reduce((acc, m) => acc + m.duration, 0);
    return sum / filtered.length;
  }

  getSlowOperations(limit = 10): PerformanceMetric[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  getSummary() {
    const byType = {
      render: this.metrics.filter(m => m.type === 'render'),
      calculation: this.metrics.filter(m => m.type === 'calculation'),
      network: this.metrics.filter(m => m.type === 'network'),
      storage: this.metrics.filter(m => m.type === 'storage'),
    };

    const summary = {
      total: this.metrics.length,
      byType: Object.entries(byType).map(([type, metrics]) => ({
        type,
        count: metrics.length,
        avgDuration: metrics.length > 0
          ? metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length
          : 0,
        maxDuration: metrics.length > 0
          ? Math.max(...metrics.map(m => m.duration))
          : 0,
      })),
      slowOperations: this.getSlowOperations(5),
    };

    return summary;
  }

  logSummary() {
    const summary = this.getSummary();
    
    console.group('📊 Performance Summary');
    console.log(`Total metrics recorded: ${summary.total}`);
    console.table(summary.byType);
    
    if (summary.slowOperations.length > 0) {
      console.group('🐌 Slowest Operations');
      console.table(
        summary.slowOperations.map(op => ({
          name: op.name,
          duration: `${op.duration.toFixed(2)}ms`,
          type: op.type,
        }))
      );
      console.groupEnd();
    }
    
    console.groupEnd();
  }

  clear() {
    this.metrics = [];
  }

  // Monitor long tasks (>50ms)
  observeLongTasks() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn(
                `⚠️ [Long Task] ${entry.name} blocked main thread for ${entry.duration.toFixed(2)}ms`
              );
            }
          }
        });

        observer.observe({ entryTypes: ['longtask', 'measure'] });
        
        return () => observer.disconnect();
      } catch (e) {
        console.debug('[PerformanceMonitor] Long task observation not supported');
      }
    }
  }

  // Monitor layout shifts
  observeLayoutShifts() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if ((entry as any).hadRecentInput) continue;
            
            const clsValue = (entry as any).value;
            if (clsValue > 0.1) {
              console.warn(
                `⚠️ [Layout Shift] CLS score: ${clsValue.toFixed(4)}`,
                entry
              );
            }
          }
        });

        observer.observe({ type: 'layout-shift', buffered: true });
        
        return () => observer.disconnect();
      } catch (e) {
        console.debug('[PerformanceMonitor] Layout shift observation not supported');
      }
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Auto-initialize observers
if (typeof window !== 'undefined') {
  performanceMonitor.observeLongTasks();
  performanceMonitor.observeLayoutShifts();
  
  // Log summary every 60 seconds in development
  if (import.meta.env.DEV) {
    setInterval(() => {
      performanceMonitor.logSummary();
    }, 60000);
  }
}
