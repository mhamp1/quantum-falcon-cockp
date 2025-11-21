/**
 * Performance Monitoring & Profiling Utilities
 * Quantum Falcon Cockpit v2025.1.0
 * 
 * Tracks component load times, identifies bottlenecks, and reports metrics.
 * Production-safe with zero overhead when disabled.
 */

import { useCallback, useEffect, useRef } from 'react';

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

interface ComponentMetric {
  component: string;
  renderTime: number;
  mountTime: number;
  updateCount: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics: Map<string, ComponentMetric> = new Map();
  private enabled: boolean = false;

  constructor() {
    // Enable only in development or when ?perf=true query param is present
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      this.enabled = params.get('perf') === 'true' || import.meta.env.DEV;
    }
  }

  /**
   * Mark the start of a performance measurement
   */
  mark(name: string): void {
    if (!this.enabled || typeof performance === 'undefined') return;
    
    try {
      performance.mark(`${name}-start`);
    } catch (error) {
      // Silently fail
    }
  }

  /**
   * Mark the end and calculate duration
   */
  measure(name: string): number | null {
    if (!this.enabled || typeof performance === 'undefined') return null;

    try {
      performance.mark(`${name}-end`);
      const measureName = `${name}-duration`;
      performance.measure(measureName, `${name}-start`, `${name}-end`);
      
      const entries = performance.getEntriesByName(measureName);
      if (entries.length > 0) {
        const duration = entries[entries.length - 1].duration;
        
        this.metrics.push({
          name,
          duration,
          timestamp: Date.now(),
        });

        // Log slow operations (>100ms)
        if (duration > 100) {
          console.warn(`[Perf] Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
        }

        return duration;
      }
    } catch (error) {
      // Silently fail
    }

    return null;
  }

  /**
   * Track component render time
   */
  trackComponent(
    component: string,
    phase: 'mount' | 'update',
    actualDuration: number
  ): void {
    if (!this.enabled) return;

    const existing = this.componentMetrics.get(component);
    
    if (existing) {
      existing.updateCount++;
      existing.renderTime += actualDuration;
      if (phase === 'mount') {
        existing.mountTime = actualDuration;
      }
    } else {
      this.componentMetrics.set(component, {
        component,
        renderTime: actualDuration,
        mountTime: phase === 'mount' ? actualDuration : 0,
        updateCount: 1,
      });
    }

    // Warn on slow renders (>16ms = 60fps threshold)
    if (actualDuration > 16) {
      console.warn(`[Perf] Slow render: ${component} took ${actualDuration.toFixed(2)}ms`);
    }
  }

  /**
   * Get all metrics for reporting
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get component metrics
   */
  getComponentMetrics(): ComponentMetric[] {
    return Array.from(this.componentMetrics.values());
  }

  /**
   * Get slowest operations
   */
  getSlowestOperations(limit: number = 10): PerformanceMetric[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  /**
   * Get slowest components
   */
  getSlowestComponents(limit: number = 10): ComponentMetric[] {
    return Array.from(this.componentMetrics.values())
      .sort((a, b) => b.renderTime - a.renderTime)
      .slice(0, limit);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.componentMetrics.clear();
    
    if (typeof performance !== 'undefined') {
      try {
        performance.clearMarks();
        performance.clearMeasures();
      } catch (error) {
        // Silently fail
      }
    }
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    if (!this.enabled) return 'Performance monitoring is disabled';

    const lines: string[] = [
      '=== QUANTUM FALCON PERFORMANCE REPORT ===',
      '',
      `Total operations tracked: ${this.metrics.length}`,
      `Total components tracked: ${this.componentMetrics.size}`,
      '',
      '--- SLOWEST OPERATIONS ---',
    ];

    this.getSlowestOperations(5).forEach((metric, index) => {
      lines.push(`${index + 1}. ${metric.name}: ${metric.duration.toFixed(2)}ms`);
    });

    lines.push('');
    lines.push('--- SLOWEST COMPONENTS ---');

    this.getSlowestComponents(5).forEach((metric, index) => {
      lines.push(
        `${index + 1}. ${metric.component}: ${metric.renderTime.toFixed(2)}ms total (${metric.updateCount} renders)`
      );
    });

    lines.push('');
    lines.push('--- WEB VITALS ---');

    if (typeof performance !== 'undefined' && performance.getEntriesByType) {
      try {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          lines.push(`DOM Content Loaded: ${navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}ms`);
          lines.push(`Load Complete: ${navigation.loadEventEnd - navigation.loadEventStart}ms`);
        }

        const paint = performance.getEntriesByType('paint');
        paint.forEach((entry) => {
          lines.push(`${entry.name}: ${entry.startTime.toFixed(2)}ms`);
        });
      } catch (error) {
        lines.push('Web Vitals unavailable');
      }
    }

    lines.push('');
    lines.push('=== END REPORT ===');

    return lines.join('\n');
  }

  /**
   * Log report to console
   */
  logReport(): void {
    if (!this.enabled) return;
    console.log(this.generateReport());
  }

  /**
   * Check if monitoring is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * Hook for measuring async operations
 */
export function usePerformanceMeasure() {
  const measure = useCallback(async <T,>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    performanceMonitor.mark(name);
    try {
      const result = await fn();
      performanceMonitor.measure(name);
      return result;
    } catch (error) {
      performanceMonitor.measure(name);
      throw error;
    }
  }, []);

  return measure;
}

/**
 * Hook for tracking component updates
 */
export function useRenderTracking(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current++;
    const duration = performance.now() - startTime.current;
    
    performanceMonitor.trackComponent(
      componentName,
      renderCount.current === 1 ? 'mount' : 'update',
      duration
    );

    startTime.current = performance.now();
  });

  return renderCount.current;
}

// Make available on window for debugging
if (typeof window !== 'undefined') {
  (window as any).__perfMonitor = performanceMonitor;
}

export default performanceMonitor;
