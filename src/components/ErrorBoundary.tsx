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
}

function DefaultErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="cyber-card p-8 text-center space-y-4" role="alert">
      <div className="inline-flex p-6 jagged-corner bg-destructive/20 border-2 border-destructive">
        <Brain size={64} weight="duotone" className="text-destructive" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-destructive uppercase tracking-wider mb-2">
          Neural System Error
        </h2>
        <p className="text-sm text-muted-foreground">
          A neural circuit malfunction occurred. Attempting to stabilize...
        </p>
        <details className="mt-4 text-left">
          <summary className="text-xs cursor-pointer text-primary hover:text-primary/80">
            Technical Details
          </summary>
          <pre className="text-xs mt-2 p-2 bg-muted/20 rounded overflow-auto max-h-32">
            {error.message}
          </pre>
        </details>
      </div>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-primary text-primary-foreground rounded jagged-corner-small 
                   hover:bg-primary/90 transition-colors uppercase text-xs font-bold tracking-wider"
      >
        Reinitialize System
      </button>
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
      return { hasError: false }
    }
    
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    if (isNonCriticalError(error)) {
      return
    }
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: undefined })
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
