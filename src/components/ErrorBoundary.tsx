import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { Brain } from "@phosphor-icons/react";

function ErrorFallback({ error }: { error: Error }) {
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
          <pre className="text-xs mt-2 p-2 bg-muted/20 rounded overflow-auto">
            {error.message}
          </pre>
        </details>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded jagged-corner-small 
                   hover:bg-primary/90 transition-colors uppercase text-xs font-bold tracking-wider"
      >
        Reinitialize System
      </button>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary FallbackComponent={ErrorFallback}>
      {children}
    </ReactErrorBoundary>
  );
}
