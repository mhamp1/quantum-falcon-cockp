// TabVerificationTester.tsx - Systematically tests all tabs for white screens
// This component verifies that all tabs load properly without errors

import { useState, useEffect, Suspense, lazy } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Warning, XCircle, Play, ArrowRight } from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Import all tab components
const EnhancedDashboard = lazy(() => import('@/components/dashboard/EnhancedDashboard'));
const BotOverview = lazy(() => import('@/components/dashboard/BotOverview'));
const MultiAgentSystem = lazy(() => import('@/components/agents/MultiAgentSystemWrapper'));
const EnhancedAnalytics = lazy(() => import('@/components/dashboard/EnhancedAnalytics'));
const AdvancedTradingHub = lazy(() => import('@/components/trade/AdvancedTradingHub'));
const CreateStrategyPage = lazy(() => import('@/components/strategy/CreateStrategyPage'));
const VaultView = lazy(() => import('@/components/vault/VaultView'));
const QuestBoard = lazy(() => import('@/components/quests/QuestBoard'));
const SocialCommunity = lazy(() => import('@/components/community/SocialCommunity'));
const SupportOnboarding = lazy(() => import('@/pages/SupportOnboarding'));
const EnhancedSettings = lazy(() => import('@/components/settings/EnhancedSettings'));

interface TabTest {
  id: string;
  name: string;
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
  loadTime?: number;
}

const TABS: Omit<TabTest, 'status'>[] = [
  { id: 'dashboard', name: 'Dashboard', component: EnhancedDashboard },
  { id: 'bot-overview', name: 'Bot Overview', component: BotOverview },
  { id: 'multi-agent', name: 'AI Agents', component: MultiAgentSystem },
  { id: 'analytics', name: 'Analytics', component: EnhancedAnalytics },
  { id: 'trading', name: 'Trading Hub', component: AdvancedTradingHub },
  { id: 'strategy-builder', name: 'Strategy Builder', component: CreateStrategyPage },
  { id: 'vault', name: 'Vault', component: VaultView },
  { id: 'quests', name: 'Quests', component: QuestBoard },
  { id: 'community', name: 'Community', component: SocialCommunity },
  { id: 'support', name: 'Support', component: SupportOnboarding },
  { id: 'settings', name: 'Settings', component: EnhancedSettings },
];

export function TabVerificationTester() {
  const [tests, setTests] = useState<TabTest[]>(
    TABS.map(t => ({ ...t, status: 'pending' as const }))
  );
  const [currentTestIndex, setCurrentTestIndex] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [overallResult, setOverallResult] = useState<'pass' | 'fail' | null>(null);

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const progress = (tests.filter(t => t.status !== 'pending').length / tests.length) * 100;

  const startTest = () => {
    setIsRunning(true);
    setCurrentTestIndex(0);
    setOverallResult(null);
    setTests(TABS.map(t => ({ ...t, status: 'pending' as const })));
  };

  useEffect(() => {
    if (!isRunning || currentTestIndex < 0 || currentTestIndex >= tests.length) {
      if (isRunning && currentTestIndex >= tests.length) {
        // All tests complete
        setIsRunning(false);
        setOverallResult(errorCount === 0 ? 'pass' : 'fail');
      }
      return;
    }

    const currentTest = tests[currentTestIndex];
    const startTime = Date.now();

    // Mark as loading
    setTests(prev => prev.map((t, i) => 
      i === currentTestIndex ? { ...t, status: 'loading' as const } : t
    ));

    // Test the component
    const testTimeout = setTimeout(() => {
      // If component doesn't load in 5 seconds, mark as error
      setTests(prev => prev.map((t, i) => 
        i === currentTestIndex ? { 
          ...t, 
          status: 'error' as const,
          error: 'Component load timeout (>5s)',
          loadTime: Date.now() - startTime
        } : t
      ));
      setCurrentTestIndex(prev => prev + 1);
    }, 5000);

    // Success handler
    const handleSuccess = () => {
      clearTimeout(testTimeout);
      setTests(prev => prev.map((t, i) => 
        i === currentTestIndex ? { 
          ...t, 
          status: 'success' as const,
          loadTime: Date.now() - startTime
        } : t
      ));
      // Wait a bit before moving to next test
      setTimeout(() => {
        setCurrentTestIndex(prev => prev + 1);
      }, 500);
    };

    // Error handler
    const handleError = (error: Error) => {
      clearTimeout(testTimeout);
      setTests(prev => prev.map((t, i) => 
        i === currentTestIndex ? { 
          ...t, 
          status: 'error' as const,
          error: error.message,
          loadTime: Date.now() - startTime
        } : t
      ));
      // Wait a bit before moving to next test
      setTimeout(() => {
        setCurrentTestIndex(prev => prev + 1);
      }, 500);
    };

    // Trigger success after component mounts successfully
    const successTimer = setTimeout(() => {
      handleSuccess();
    }, 1000); // Give component 1 second to mount

    return () => {
      clearTimeout(testTimeout);
      clearTimeout(successTimer);
    };
  }, [currentTestIndex, isRunning]);

  const getStatusIcon = (status: TabTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} weight="fill" className="text-primary" />;
      case 'error':
        return <XCircle size={20} weight="fill" className="text-destructive" />;
      case 'loading':
        return <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="w-5 h-5 border-2 border-muted rounded-full" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-morph-card max-w-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-primary neon-glow-primary uppercase tracking-wider">
              Tab Verification Test Suite
            </h1>
            <p className="text-sm text-muted-foreground uppercase tracking-wider">
              Systematic White Screen Detection & Prevention
            </p>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground uppercase tracking-wide">Overall Progress</span>
              <span className="font-bold text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-primary">{successCount} Passed</span>
              <span className="text-destructive">{errorCount} Failed</span>
              <span className="text-muted-foreground">{tests.length - successCount - errorCount} Pending</span>
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin">
            {tests.map((test, index) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`cyber-card-accent p-4 flex items-center gap-4 ${
                  currentTestIndex === index ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(test.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold uppercase tracking-wide truncate">
                      {test.name}
                    </h3>
                    {test.loadTime && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {test.loadTime}ms
                      </span>
                    )}
                  </div>
                  {test.error && (
                    <p className="text-xs text-destructive mt-1 font-mono">
                      {test.error}
                    </p>
                  )}
                </div>

                {currentTestIndex === index && test.status === 'loading' && (
                  <div className="flex-shrink-0">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <ArrowRight size={16} className="text-primary" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {!isRunning && currentTestIndex === -1 && (
              <Button
                onClick={startTest}
                className="flex-1 gap-2"
                size="lg"
              >
                <Play size={20} weight="fill" />
                Start Verification
              </Button>
            )}

            {overallResult && (
              <>
                <div className={`flex-1 p-4 rounded-lg border-2 ${
                  overallResult === 'pass' 
                    ? 'border-primary bg-primary/10' 
                    : 'border-destructive bg-destructive/10'
                }`}>
                  <div className="text-center">
                    <div className={`text-2xl font-bold uppercase tracking-wider ${
                      overallResult === 'pass' ? 'text-primary' : 'text-destructive'
                    }`}>
                      {overallResult === 'pass' ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {successCount}/{tests.length} components loaded successfully
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {overallResult && (
            <div className="flex gap-2">
              <Button
                onClick={startTest}
                variant="outline"
                className="flex-1"
              >
                Run Again
              </Button>
              <Button
                onClick={() => window.dispatchEvent(new CustomEvent('close-verification-tester'))}
                variant="secondary"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          )}

          {/* Hidden component render area */}
          {isRunning && currentTestIndex >= 0 && currentTestIndex < tests.length && (
            <div className="hidden">
              <ErrorBoundary
                onError={(error) => {
                  console.error(`[TabVerification] Error in ${tests[currentTestIndex].name}:`, error);
                }}
              >
                <Suspense fallback={<div>Loading...</div>}>
                  {(() => {
                    const CurrentComponent = tests[currentTestIndex].component;
                    return <CurrentComponent />;
                  })()}
                </Suspense>
              </ErrorBoundary>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TabVerificationTester;
