import { useState } from 'react';
import { Warning, ArrowClockwise, Copy, PaperPlaneTilt } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const [isReporting, setIsReporting] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${error.message}\n\n${error.stack || ''}`);
      console.log('Error details copied to clipboard');
    } catch (err) {
      console.error('Failed to copy error to clipboard:', err);
    }
  };

  const handleReport = async () => {
    setIsReporting(true);
    try {
      console.log('Reporting error:', error.message);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasReported(true);
    } catch (err) {
      console.error('Failed to report error:', err);
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="cyber-card max-w-2xl w-full p-8 space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-4 bg-destructive/20 jagged-corner-small">
            <Warning size={48} weight="duotone" className="text-destructive" />
          </div>
          <div className="flex-1 space-y-2">
            <h1 className="text-2xl font-bold text-destructive uppercase tracking-wider hud-text">
              System Malfunction Detected
            </h1>
            <p className="text-muted-foreground text-sm">
              A critical error has occurred in the neural network. System diagnostics are available below.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Error Details
            </h2>
            <Button
              onClick={handleCopy}
              size="sm"
              variant="ghost"
              className="h-8 gap-2"
              aria-label="Copy error details to clipboard"
            >
              <Copy size={16} />
              Copy
            </Button>
          </div>
          <pre className="text-xs text-destructive bg-muted/50 p-3 rounded border border-border overflow-auto max-h-32">
            {error.message}
          </pre>
          {error.stack && (
            <details className="mt-2">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                Show full stack trace
              </summary>
              <pre className="text-xs text-muted-foreground mt-2 bg-muted/50 p-3 rounded border border-border overflow-auto max-h-48">
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={resetErrorBoundary}
            className="flex-1 gap-2"
            variant="default"
            aria-label="Retry loading the application"
          >
            <ArrowClockwise size={18} />
            Reinitialize System
          </Button>
          <Button
            onClick={handleReport}
            disabled={isReporting || hasReported}
            variant="secondary"
            className="gap-2"
            aria-label="Report this error"
          >
            <PaperPlaneTilt size={18} />
            {isReporting ? 'Reporting...' : hasReported ? 'Reported' : 'Report'}
          </Button>
        </div>
      </div>
    </div>
  );
}
