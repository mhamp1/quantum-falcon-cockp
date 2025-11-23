import { Component, ReactNode } from 'react'
import { Brain } from '@phosphor-icons/react'
import { isNonCriticalError } from '@/lib/errorSuppression'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  FallbackComponent?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>
  onError?: (error: Error, errorInfo: { componentStack: string }) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: { componentStack: string }
  retryCount: number
}

function DefaultErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  const errorMessage = error?.message || 'Unknown error occurred';
  const errorStack = error?.stack || 'No stack trace available';

  return (
    <div className="cyber-card p-8 text-center space-y-4 m-4" role="alert">
      <div className="inline-flex p-6 jagged-corner bg-destructive/20 border-2 border-destructive">
        <Brain size={64} weight="duotone" className="text-destructive" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-destructive uppercase tracking-wider mb-2">
          Neural System Error
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          A neural circuit malfunction occurred. Attempting to stabilize...
        </p>
        <details className="mt-4 text-left">
          <summary className="text-xs cursor-pointer text-primary hover:text-primary/80 uppercase tracking-wider">
            Technical Details
          </summary>
          <pre className="text-xs mt-2 p-4 bg-muted/20 rounded overflow-auto max-h-64 scrollbar-thin font-mono">
            {errorMessage}
            {errorStack && `\n\n${errorStack}`}
          </pre>
        </details>
      </div>
      <div className="flex gap-3">
        <button
          onClick={resetErrorBoundary}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded jagged-corner-small 
                     hover:bg-primary/90 transition-colors uppercase text-xs font-bold tracking-wider"
        >
          Retry Component
        </button>
        <button
          onClick={() => window.location.reload()}
          className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded jagged-corner-small 
                     hover:bg-secondary/90 transition-colors uppercase text-xs font-bold tracking-wider"
        >
          Reload Page
        </button>
      </div>
    </div>
  )
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId?: ReturnType<typeof setTimeout>

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error | unknown): ErrorBoundaryState {
    // Handle undefined/null errors
    if (!error) {
      console.debug('[ErrorBoundary] Suppressed null/undefined error');
      return { hasError: false, retryCount: 0 }
    }

    // Convert to Error if needed
    const actualError = error instanceof Error ? error : new Error(String(error));

    // CRITICAL: Check for chunk loading errors FIRST - force immediate reload
    if (actualError.message && (
      actualError.message.includes('error loading dynamically imported module') ||
      actualError.message.includes('Loading chunk') ||
      actualError.message.includes('Failed to fetch dynamically imported module') ||
      actualError.message.includes('EnhancedDashboard') ||
      actualError.message.includes('B29oJMZ1') // Old stale chunk hash
    )) {
      console.error('[ErrorBoundary] STALE CHUNK DETECTED - forcing immediate page reload');
      console.error('[ErrorBoundary] Error:', actualError.message);
      // Force page reload immediately - don't even set error state
      setTimeout(() => {
        window.location.reload();
      }, 100);
      return { hasError: false, retryCount: 0 }; // Don't show error UI, just reload
    }

    if (isNonCriticalError(actualError)) {
      console.debug('[ErrorBoundary] Suppressed non-critical error:', actualError.message);
      return { hasError: false, retryCount: 0 }
    }
    
    console.error('[ErrorBoundary] Critical error caught:', actualError);
    return { hasError: true, error: actualError, retryCount: 0 }
  }

  componentDidCatch(error: Error | unknown, errorInfo: { componentStack: string }) {
    // Handle undefined/null errors
    if (!error) {
      console.debug('[ErrorBoundary] Null/undefined error caught, skipping');
      return
    }

    // Convert to Error if needed
    const actualError = error instanceof Error ? error : new Error(String(error));

    if (isNonCriticalError(actualError)) {
      console.debug('[ErrorBoundary] Non-critical error details suppressed');
      return
    }
    
    // Don't auto-retry on CSS parsing errors - they're harmless
    if (actualError.message && (
      actualError.message.includes('opacity') ||
      actualError.message.includes('field-sizing') ||
      actualError.message.includes('user-select') ||
      actualError.message.includes('parsing value') ||
      actualError.message.includes('Declaration dropped')
    )) {
      console.debug('[ErrorBoundary] CSS parsing error (harmless), not retrying');
      return;
    }
    
    // Don't retry on chunk loading errors - force page reload instead
    if (actualError.message && (
      actualError.message.includes('error loading dynamically imported module') ||
      actualError.message.includes('Loading chunk') ||
      actualError.message.includes('Failed to fetch dynamically imported module') ||
      actualError.message.includes('EnhancedDashboard')
    )) {
      console.error('[ErrorBoundary] Chunk loading error detected - forcing page reload');
      console.error('[ErrorBoundary] Error:', actualError.message);
      // Force page reload to get fresh chunks
      setTimeout(() => {
        window.location.reload();
      }, 500);
      return;
    }
    
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    
    this.setState({ error: actualError, errorInfo });
    
    if (this.props.onError) {
      try {
        this.props.onError(actualError, errorInfo);
      } catch (handlerError) {
        console.error('[ErrorBoundary] Error in onError handler:', handlerError);
      }
    }

    // Only retry on actual component errors, not CSS warnings or chunk errors
    if (this.state.retryCount < 2 && !actualError.message.includes('CSS') && !actualError.message.includes('chunk')) {
      const retryDelay = 1000;
      console.log(`[ErrorBoundary] Auto-retry ${this.state.retryCount + 1}/2 in ${retryDelay}ms`);
      
      this.retryTimeoutId = setTimeout(() => {
        this.setState(prev => ({
          hasError: false,
          error: undefined,
          errorInfo: undefined,
          retryCount: prev.retryCount + 1,
        }));
      }, retryDelay);
    } else {
      console.error('[ErrorBoundary] Max retry attempts reached or non-retryable error, showing error UI');
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  resetErrorBoundary = () => {
    console.log('[ErrorBoundary] Manual reset');
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, retryCount: 0 })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      const FallbackComponent = this.props.FallbackComponent || DefaultErrorFallback
      return <FallbackComponent error={this.state.error} resetErrorBoundary={this.resetErrorBoundary} />
    }

    return this.props.children
  }
}
