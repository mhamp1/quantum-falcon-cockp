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
}

function DefaultErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
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
            {error.message}
            {error.stack && `\n\n${error.stack}`}
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
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    if (isNonCriticalError(error)) {
      console.debug('[ErrorBoundary] Suppressed non-critical error:', error.message);
      return { hasError: false }
    }
    
    console.error('[ErrorBoundary] Critical error caught:', error);
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    if (isNonCriticalError(error)) {
      console.debug('[ErrorBoundary] Non-critical error details suppressed');
      return
    }
    
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
    
    this.setState({ errorInfo });
    
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        console.error('[ErrorBoundary] Error in onError handler:', handlerError);
      }
    }
  }

  resetErrorBoundary = () => {
    console.log('[ErrorBoundary] Resetting error boundary');
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
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
