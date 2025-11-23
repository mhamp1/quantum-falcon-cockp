// AppHealthMonitor.tsx - Real-time application health monitoring
// Continuously monitors for white screens and component errors

import { useState, useEffect } from 'react';
import { CheckCircle, Warning, XCircle, Activity } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { WhiteScreenPrevention } from '@/lib/whiteScreenPrevention';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  lastCheck: number;
}

export function AppHealthMonitor() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [overallHealth, setOverallHealth] = useState<'healthy' | 'warning' | 'error'>('healthy');

  useEffect(() => {
    const performHealthCheck = () => {
      const newChecks: HealthCheck[] = [];
      const now = Date.now();

      // Check 1: White Screen Prevention Status
      const wspStatus = WhiteScreenPrevention.getStatus();
      newChecks.push({
        name: 'White Screen Prevention',
        status: wspStatus.isMonitoring ? 'healthy' : 'warning',
        message: wspStatus.isMonitoring 
          ? `Monitoring active (${wspStatus.consecutiveFailures} failures)`
          : 'Not monitoring',
        lastCheck: now
      });

      // Check 2: Root Element Health
      const root = document.getElementById('root');
      const hasContent = root && root.innerHTML.length > 100;
      const hasChildren = root && root.children.length > 0;
      newChecks.push({
        name: 'Root Element',
        status: hasContent && hasChildren ? 'healthy' : 'error',
        message: hasContent && hasChildren
          ? `${root.children.length} children, ${root.innerHTML.length} bytes`
          : 'Root is empty or missing',
        lastCheck: now
      });

      // Check 3: React Render Status
      const reactRenderAttempted = (window as any).__appRenderAttempted;
      const reactRenderTime = (window as any).__reactRenderTime;
      const timeSinceRender = reactRenderTime ? now - reactRenderTime : 0;
      newChecks.push({
        name: 'React Render',
        status: reactRenderAttempted ? 'healthy' : 'warning',
        message: reactRenderAttempted
          ? `Rendered ${Math.round(timeSinceRender / 1000)}s ago`
          : 'Not yet attempted',
        lastCheck: now
      });

      // Check 4: Error Count
      const errorCount = (window as any).__errorCount || 0;
      newChecks.push({
        name: 'Error Count',
        status: errorCount === 0 ? 'healthy' : errorCount < 5 ? 'warning' : 'error',
        message: `${errorCount} errors logged`,
        lastCheck: now
      });

      // Check 5: Memory Health (if available)
      if (performance && (performance as any).memory) {
        const memory = (performance as any).memory;
        const usedPercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        newChecks.push({
          name: 'Memory Usage',
          status: usedPercent < 70 ? 'healthy' : usedPercent < 90 ? 'warning' : 'error',
          message: `${Math.round(usedPercent)}% used (${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB)`,
          lastCheck: now
        });
      }

      // Check 6: Network Status
      const isOnline = navigator.onLine;
      newChecks.push({
        name: 'Network',
        status: isOnline ? 'healthy' : 'error',
        message: isOnline ? 'Connected' : 'Offline',
        lastCheck: now
      });

      setChecks(newChecks);

      // Calculate overall health
      const hasError = newChecks.some(c => c.status === 'error');
      const hasWarning = newChecks.some(c => c.status === 'warning');
      setOverallHealth(hasError ? 'error' : hasWarning ? 'warning' : 'healthy');
    };

    // Initial check
    performHealthCheck();

    // Check every 2 seconds
    const interval = setInterval(performHealthCheck, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return 'text-primary';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-destructive';
    }
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle size={16} weight="fill" className="text-primary" />;
      case 'warning':
        return <Warning size={16} weight="fill" className="text-yellow-400" />;
      case 'error':
        return <XCircle size={16} weight="fill" className="text-destructive" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="glass-morph-card mb-2 p-4 w-80"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  System Health
                </h3>
                <div className={`text-xs font-bold uppercase ${getStatusColor(overallHealth)}`}>
                  {overallHealth}
                </div>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
                {checks.map((check, index) => (
                  <motion.div
                    key={check.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-2 p-2 rounded bg-muted/20"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(check.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground">
                        {check.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {check.message}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground text-center">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          p-3 rounded-full border-2 backdrop-blur-md
          transition-all duration-300 shadow-lg
          ${overallHealth === 'healthy' ? 'border-primary bg-primary/10' : ''}
          ${overallHealth === 'warning' ? 'border-yellow-400 bg-yellow-400/10' : ''}
          ${overallHealth === 'error' ? 'border-destructive bg-destructive/10 animate-pulse' : ''}
        `}
        title="System Health Monitor"
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Activity 
            size={24} 
            weight="bold"
            className={getStatusColor(overallHealth)}
          />
        </motion.div>
      </motion.button>
    </div>
  );
}

export default AppHealthMonitor;
